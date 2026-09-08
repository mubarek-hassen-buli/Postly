from datetime import timedelta
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from apps.posts.models import Post, PostChannelTarget
from apps.channels.models import Channel
from .services import DashboardAnalyticsService

User = get_user_model()


class DashboardAnalyticsTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            phone_number="+15551234567",
            username="analyst_user"
        )
        self.other_user = User.objects.create_user(
            phone_number="+15559876543",
            username="other_user"
        )
        self.url = '/api/v1/analytics/dashboard/'

    def test_unauthenticated_request_rejected(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authenticated_empty_analytics(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()

        self.assertIn('summary', data)
        self.assertIn('posts_chart', data)
        self.assertIn('platform_distribution', data)
        self.assertIn('engagement_metrics', data)

        summary = data['summary']
        self.assertEqual(summary['total_broadcasts'], 0)
        self.assertEqual(summary['channels_reach'], 0)
        self.assertEqual(summary['scheduled_queue_count'], 0)
        self.assertEqual(summary['delivery_success_rate'], 100.0)

        # 7 items in 7d chart
        self.assertEqual(len(data['posts_chart']['data']), 7)

    def test_analytics_calculation_with_posts_and_channels(self):
        # Create channel
        channel = Channel.objects.create(
            user=self.user,
            telegram_channel_id=-1001234567890,
            title="Crypto Signals"
        )

        now = timezone.now()

        # 1 Published Post
        p1 = Post.objects.create(
            user=self.user,
            text_content="Delivered post",
            status=Post.PostStatus.PUBLISHED,
            published_at=now
        )
        PostChannelTarget.objects.create(
            post=p1,
            channel=channel,
            status=PostChannelTarget.TargetStatus.SUCCESS
        )

        # 1 Scheduled Post
        Post.objects.create(
            user=self.user,
            text_content="Scheduled post",
            status=Post.PostStatus.SCHEDULED,
            scheduled_for=now + timedelta(days=1)
        )

        # 1 Failed Post
        Post.objects.create(
            user=self.user,
            text_content="Failed post",
            status=Post.PostStatus.FAILED
        )

        self.client.force_authenticate(user=self.user)
        response = self.client.get(f"{self.url}?period=7d")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        summary = data['summary']

        self.assertEqual(summary['total_broadcasts'], 3)
        self.assertEqual(summary['channels_reach'], 1)
        self.assertEqual(summary['scheduled_queue_count'], 1)
        self.assertEqual(summary['published_count'], 1)
        self.assertEqual(summary['failed_count'], 1)
        # 1 published out of 2 dispatched (1 published + 1 failed) = 50.0%
        self.assertEqual(summary['delivery_success_rate'], 50.0)

    def test_30d_period_chart(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(f"{self.url}?period=30d")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(len(data['posts_chart']['data']), 30)
