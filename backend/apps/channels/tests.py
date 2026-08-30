from unittest.mock import patch
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from knox.models import AuthToken
from rest_framework import status
from rest_framework.test import APIClient

from apps.accounts.models import TelegramSession
from apps.channels.models import Channel

User = get_user_model()


class ChannelApiTests(TestCase):
    """Integration tests for Channel management, MTProto discovery sync, and filtering."""

    def setUp(self) -> None:
        self.client = APIClient()

        # Create test users
        self.user = User.objects.create_user(phone_number="+1234567890", first_name="Owner")
        self.session = TelegramSession.objects.create(
            user=self.user,
            phone_number=self.user.phone_number,
            is_authenticated=True,
            auth_state=TelegramSession.AuthState.AUTHENTICATED,
            encrypted_session_string="mock_encrypted_session_str"
        )
        _, self.token = AuthToken.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

        # Other user for isolation verification
        self.other_user = User.objects.create_user(phone_number="+1999888777", first_name="Other")
        self.other_channel = Channel.objects.create(
            user=self.other_user,
            telegram_channel_id=999000,
            title="Other User Channel",
            can_post_messages=True
        )

        # Seed channels for self.user
        self.channel1 = Channel.objects.create(
            user=self.user,
            telegram_channel_id=1001,
            title="Tech News Official",
            username="technews",
            about="Latest tech updates",
            member_count=5000,
            is_creator=True,
            can_post_messages=True,
            is_selected_by_user=True
        )
        self.channel2 = Channel.objects.create(
            user=self.user,
            telegram_channel_id=1002,
            title="Crypto Signals Daily",
            username="cryptodaily",
            about="Crypto signals",
            member_count=12000,
            is_creator=False,
            can_post_messages=False,
            is_selected_by_user=False
        )

    def test_list_channels_returns_user_channels_only(self) -> None:
        url = reverse('channel_list')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        payload = response.json()
        data = payload.get('results', payload)
        self.assertEqual(len(data), 2)

        titles = [c['title'] for c in data]
        self.assertIn("Tech News Official", titles)
        self.assertIn("Crypto Signals Daily", titles)
        self.assertNotIn("Other User Channel", titles)

    def test_filter_channels_by_selected_only(self) -> None:
        url = reverse('channel_list')
        response = self.client.get(url, {'selected_only': 'true'})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        payload = response.json()
        data = payload.get('results', payload)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['title'], "Tech News Official")

    def test_filter_channels_by_can_post_only(self) -> None:
        url = reverse('channel_list')
        response = self.client.get(url, {'can_post_only': 'true'})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        payload = response.json()
        data = payload.get('results', payload)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['title'], "Tech News Official")

    def test_search_channels_by_title_or_username(self) -> None:
        url = reverse('channel_list')
        response = self.client.get(url, {'search': 'Crypto'})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        payload = response.json()
        data = payload.get('results', payload)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['username'], "cryptodaily")

    def test_get_channel_detail_success(self) -> None:
        url = reverse('channel_detail', kwargs={'pk': str(self.channel1.id)})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data['title'], "Tech News Official")
        self.assertEqual(data['member_count'], 5000)
        self.assertTrue(data['is_creator'])
        self.assertTrue(data['can_post_messages'])

    def test_get_other_user_channel_returns_404(self) -> None:
        url = reverse('channel_detail', kwargs={'pk': str(self.other_channel.id)})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_toggle_channel_selection(self) -> None:
        url = reverse('channel_toggle_selection', kwargs={'pk': str(self.channel2.id)})
        self.assertFalse(self.channel2.is_selected_by_user)

        response = self.client.patch(url, {'is_selected_by_user': True}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.json()['is_selected_by_user'])

        self.channel2.refresh_from_db()
        self.assertTrue(self.channel2.is_selected_by_user)

    @patch('apps.channels.services.TelegramChannelService.discover_channels')
    def test_sync_channels_endpoint(self, mock_discover) -> None:
        mock_discover.return_value = [
            {
                'telegram_channel_id': 1001,  # Existing channel update
                'access_hash': 1234567,
                'title': 'Tech News Official - Updated',
                'username': 'technews',
                'about': 'Updated bio description',
                'member_count': 6500,
                'is_creator': True,
                'can_post_messages': True,
                'can_edit_messages': True,
                'can_delete_messages': True,
                'can_pin_messages': True,
                'is_broadcast': True,
            },
            {
                'telegram_channel_id': 2001,  # Brand new channel
                'access_hash': 7654321,
                'title': 'Brand New Postly Channel',
                'username': 'brandnew',
                'about': 'Brand new channel bio',
                'member_count': 150,
                'is_creator': False,
                'can_post_messages': True,
                'can_edit_messages': True,
                'can_delete_messages': False,
                'can_pin_messages': False,
                'is_broadcast': True,
            }
        ]

        url = reverse('channel_sync')
        response = self.client.post(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data['status'], 'SUCCESS')
        self.assertEqual(data['synced_count'], 2)

        # Verify existing channel updated
        self.channel1.refresh_from_db()
        self.assertEqual(self.channel1.title, 'Tech News Official - Updated')
        self.assertEqual(self.channel1.member_count, 6500)

        # Verify new channel created
        new_channel = Channel.objects.get(user=self.user, telegram_channel_id=2001)
        self.assertEqual(new_channel.title, 'Brand New Postly Channel')
        self.assertTrue(new_channel.can_post_messages)
        self.assertTrue(new_channel.is_selected_by_user)

    def test_channel_stats_endpoint(self) -> None:
        url = reverse('channel_stats', kwargs={'pk': str(self.channel1.id)})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data['title'], "Tech News Official")
        self.assertEqual(data['member_count'], 5000)
        self.assertTrue(data['can_post_messages'])
