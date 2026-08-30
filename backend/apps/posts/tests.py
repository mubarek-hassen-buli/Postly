from datetime import timedelta
from unittest.mock import MagicMock, patch
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from knox.models import AuthToken
from rest_framework import status
from rest_framework.test import APIClient

from apps.accounts.models import TelegramSession
from apps.channels.models import Channel
from apps.posts.models import Post, PostChannelTarget, PostMediaAttachment
from apps.posts.services import TelegramPublishingService
from apps.posts.tasks import publish_scheduled_post_task, reconcile_scheduled_posts

User = get_user_model()


class PostApiTests(TestCase):
    """Integration and unit tests for Post composition, Celery scheduling, and Telegram broadcasting."""

    def setUp(self) -> None:
        self.client = APIClient()

        # Create test user
        self.user = User.objects.create_user(phone_number="+1234567890", first_name="Broadcaster")
        self.session = TelegramSession.objects.create(
            user=self.user,
            phone_number=self.user.phone_number,
            is_authenticated=True,
            auth_state=TelegramSession.AuthState.AUTHENTICATED,
            encrypted_session_string="mock_encrypted_session_str"
        )
        _, self.token = AuthToken.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

        # Create test channels
        self.channel1 = Channel.objects.create(
            user=self.user,
            telegram_channel_id=111222,
            title="Channel Alpha",
            can_post_messages=True
        )
        self.channel2 = Channel.objects.create(
            user=self.user,
            telegram_channel_id=333444,
            title="Channel Beta",
            can_post_messages=True
        )

    def test_create_draft_post(self) -> None:
        url = reverse('post_list_create')
        payload = {
            'text_content': '<b>Hello World!</b> This is a draft.',
            'formatting_mode': 'HTML',
            'target_channel_ids': [str(self.channel1.id)],
            'silent': True,
            'publish_now': False,
        }
        response = self.client.post(url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        data = response.json()
        self.assertEqual(data['status'], Post.PostStatus.DRAFT)
        self.assertEqual(data['text_content'], payload['text_content'])
        self.assertEqual(len(data['targets']), 1)
        self.assertEqual(data['targets'][0]['channel_title'], "Channel Alpha")

    @patch('apps.posts.tasks.publish_scheduled_post_task.apply_async')
    def test_create_scheduled_post(self, mock_apply_async) -> None:
        mock_task = MagicMock()
        mock_task.id = "celery-task-uuid-1234"
        mock_apply_async.return_value = mock_task

        scheduled_time = timezone.now() + timedelta(hours=2)
        url = reverse('post_list_create')
        payload = {
            'text_content': 'Scheduled announcement for later.',
            'target_channel_ids': [str(self.channel1.id), str(self.channel2.id)],
            'scheduled_for': scheduled_time.isoformat(),
        }
        response = self.client.post(url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        data = response.json()
        self.assertEqual(data['status'], Post.PostStatus.SCHEDULED)
        self.assertEqual(len(data['targets']), 2)
        self.assertEqual(data['celery_task_id'], "celery-task-uuid-1234")

        mock_apply_async.assert_called_once()

    def test_create_scheduled_post_in_past_fails(self) -> None:
        past_time = timezone.now() - timedelta(hours=1)
        url = reverse('post_list_create')
        payload = {
            'text_content': 'Invalid scheduled time in the past.',
            'target_channel_ids': [str(self.channel1.id)],
            'scheduled_for': past_time.isoformat(),
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @patch('apps.posts.services.TelegramPublishingService.publish_post')
    def test_create_instant_post_with_publish_now(self, mock_publish) -> None:
        mock_publish.return_value = {'status': 'PUBLISHED', 'success_count': 1}

        url = reverse('post_list_create')
        payload = {
            'text_content': 'Breaking news published immediately!',
            'target_channel_ids': [str(self.channel1.id)],
            'publish_now': True
        }
        response = self.client.post(url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        mock_publish.assert_called_once()

    def test_filter_posts_by_status(self) -> None:
        Post.objects.create(
            user=self.user,
            text_content="Draft post 1",
            status=Post.PostStatus.DRAFT
        )
        Post.objects.create(
            user=self.user,
            text_content="Scheduled post 1",
            status=Post.PostStatus.SCHEDULED,
            scheduled_for=timezone.now() + timedelta(days=1)
        )
        Post.objects.create(
            user=self.user,
            text_content="Published post 1",
            status=Post.PostStatus.PUBLISHED,
            published_at=timezone.now()
        )

        url = reverse('post_list_create')
        response = self.client.get(url, {'status': 'SCHEDULED'})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        results = data.get('results', data)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['text_content'], "Scheduled post 1")

    @patch('apps.posts.views.cancel_post_celery_task')
    def test_cancel_scheduled_post(self, mock_cancel_celery) -> None:
        post = Post.objects.create(
            user=self.user,
            text_content="To be cancelled",
            status=Post.PostStatus.SCHEDULED,
            scheduled_for=timezone.now() + timedelta(days=1),
            celery_task_id="celery-cancel-id-999"
        )

        url = reverse('post_cancel_schedule', kwargs={'pk': str(post.id)})
        response = self.client.post(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data['status'], Post.PostStatus.CANCELLED)

        mock_cancel_celery.assert_called_once_with("celery-cancel-id-999")
        post.refresh_from_db()
        self.assertEqual(post.status, Post.PostStatus.CANCELLED)
        self.assertIsNone(post.celery_task_id)

    @patch('apps.posts.services.TelegramPublishingService._async_dispatch_to_channels')
    def test_publishing_service_multi_channel_execution(self, mock_async_dispatch) -> None:
        post = Post.objects.create(
            user=self.user,
            text_content="Test multi-channel post",
            status=Post.PostStatus.DRAFT
        )
        target1 = PostChannelTarget.objects.create(post=post, channel=self.channel1)
        target2 = PostChannelTarget.objects.create(post=post, channel=self.channel2)

        # Mock dispatch: target1 succeeds, target2 fails
        mock_async_dispatch.return_value = {
            str(target1.id): {'status': 'SUCCESS', 'message_id': 999111},
            str(target2.id): {'status': 'FAILED', 'error': 'Account is muted in channel'},
        }

        result = TelegramPublishingService.publish_post(str(post.id))

        self.assertEqual(result['status'], Post.PostStatus.PUBLISHED)
        self.assertEqual(result['success_count'], 1)
        self.assertEqual(result['failed_count'], 1)

        post.refresh_from_db()
        self.assertEqual(post.status, Post.PostStatus.PUBLISHED)
        self.assertIsNotNone(post.published_at)

        target1.refresh_from_db()
        self.assertEqual(target1.status, PostChannelTarget.TargetStatus.SUCCESS)
        self.assertEqual(target1.telegram_message_id, 999111)

        target2.refresh_from_db()
        self.assertEqual(target2.status, PostChannelTarget.TargetStatus.FAILED)
        self.assertIn("Account is muted", target2.error_message)

    @patch('apps.posts.services.TelegramPublishingService.publish_post')
    def test_celery_task_and_reconciliation(self, mock_publish) -> None:
        mock_publish.return_value = {'status': 'PUBLISHED'}

        post = Post.objects.create(
            user=self.user,
            text_content="Overdue scheduled post",
            status=Post.PostStatus.SCHEDULED,
            scheduled_for=timezone.now() - timedelta(minutes=5)
        )

        # Test Celery Task
        task_res = publish_scheduled_post_task(str(post.id))
        self.assertEqual(task_res['status'], 'PUBLISHED')
        mock_publish.assert_called_with(post_id=str(post.id))

        # Test Reconciliation Beat
        with patch('apps.posts.tasks.publish_scheduled_post_task.delay') as mock_delay:
            reconciled = reconcile_scheduled_posts()
            self.assertEqual(reconciled, 1)
            mock_delay.assert_called_once_with(str(post.id))
