from unittest.mock import patch
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from knox.models import AuthToken
from rest_framework import status
from rest_framework.test import APIClient

from apps.notifications.models import Device, NotificationLog
from apps.notifications.services import ExpoPushService

User = get_user_model()


class NotificationsApiTests(TestCase):
    """Integration and unit tests for Expo Push notification services and device registration."""

    def setUp(self) -> None:
        self.client = APIClient()

        self.user = User.objects.create_user(phone_number="+1234567890", first_name="DeviceUser")
        _, self.token = AuthToken.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

        self.valid_push_token = "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"

    def test_register_device_token_success(self) -> None:
        url = reverse('device_register')
        payload = {
            'expo_push_token': self.valid_push_token,
            'device_type': 'IOS',
            'device_name': 'iPhone 15 Pro'
        }
        response = self.client.post(url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        data = response.json()
        self.assertEqual(data['expo_push_token'], self.valid_push_token)
        self.assertEqual(data['device_type'], 'IOS')
        self.assertTrue(data['is_active'])

        device = Device.objects.get(expo_push_token=self.valid_push_token)
        self.assertEqual(device.user, self.user)
        self.assertTrue(device.is_active)

    def test_register_invalid_token_format_fails(self) -> None:
        url = reverse('device_register')
        payload = {
            'expo_push_token': 'invalid_token_format',
            'device_type': 'ANDROID'
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_unregister_device_token(self) -> None:
        Device.objects.create(
            user=self.user,
            expo_push_token=self.valid_push_token,
            device_type='IOS',
            is_active=True
        )

        url = reverse('device_unregister')
        response = self.client.post(url, {'expo_push_token': self.valid_push_token}, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        device = Device.objects.get(expo_push_token=self.valid_push_token)
        self.assertFalse(device.is_active)

    @patch('apps.notifications.services.requests.post')
    def test_expo_push_service_send_and_log(self, mock_post) -> None:
        # Create active device
        device = Device.objects.create(
            user=self.user,
            expo_push_token=self.valid_push_token,
            device_type='IOS',
            is_active=True
        )

        # Mock successful Expo Gateway response
        mock_response = mock_post.return_value
        mock_response.status_code = 200
        mock_response.json.return_value = {
            'data': [{'status': 'ok', 'id': 'expo-ticket-uuid'}]
        }

        success = ExpoPushService.send_notification_to_user(
            user=self.user,
            title="Test Push Title",
            body="Test push message body.",
            event_type=NotificationLog.EventType.POST_PUBLISHED,
            data={'post_id': 'test-123'}
        )

        self.assertTrue(success)
        mock_post.assert_called_once()

        # Verify DB log
        log_entry = NotificationLog.objects.get(user=self.user)
        self.assertEqual(log_entry.title, "Test Push Title")
        self.assertEqual(log_entry.event_type, NotificationLog.EventType.POST_PUBLISHED)
        self.assertTrue(log_entry.delivered)

    @patch('apps.notifications.services.requests.post')
    def test_expo_push_service_deactivates_unregistered_device(self, mock_post) -> None:
        device = Device.objects.create(
            user=self.user,
            expo_push_token=self.valid_push_token,
            device_type='ANDROID',
            is_active=True
        )

        # Mock DeviceNotRegistered error
        mock_response = mock_post.return_value
        mock_response.status_code = 200
        mock_response.json.return_value = {
            'data': [{
                'status': 'error',
                'message': '"DeviceNotRegistered"',
                'details': {'error': 'DeviceNotRegistered'}
            }]
        }

        success = ExpoPushService.send_notification_to_user(
            user=self.user,
            title="Stale Alert",
            body="Message to unregistered device."
        )

        device.refresh_from_db()
        self.assertFalse(device.is_active)

    def test_list_notifications_and_mark_read(self) -> None:
        n1 = NotificationLog.objects.create(
            user=self.user,
            title="Notice 1",
            body="Body 1",
            is_read=False
        )
        n2 = NotificationLog.objects.create(
            user=self.user,
            title="Notice 2",
            body="Body 2",
            is_read=False
        )

        url = reverse('notification_list')
        response = self.client.get(url, {'unread_only': 'true'})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        results = data.get('results', data)
        self.assertEqual(len(results), 2)

        # Mark n1 as read
        mark_read_url = reverse('notification_mark_read')
        mark_res = self.client.post(mark_read_url, {'notification_ids': [str(n1.id)]}, format='json')
        self.assertEqual(mark_res.status_code, status.HTTP_200_OK)

        n1.refresh_from_db()
        n2.refresh_from_db()
        self.assertTrue(n1.is_read)
        self.assertFalse(n2.is_read)
