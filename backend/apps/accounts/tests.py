from unittest.mock import patch
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from knox.models import AuthToken
from rest_framework import status
from rest_framework.test import APIClient

from apps.accounts.models import TelegramSession
from apps.telegram_engine.services import TelegramServiceError

User = get_user_model()


class TelegramAuthApiTests(TestCase):
    """Integration and unit tests for Telegram MTProto auth API and Knox token management."""

    def setUp(self) -> None:
        self.client = APIClient()
        self.phone_number = "+1234567890"
        self.phone_code_hash = "mock_hash_12345"
        self.temp_session = "mock_encrypted_temp_session"
        self.auth_session = "mock_encrypted_auth_session"

    @patch('apps.telegram_engine.services.TelegramAuthService.send_code')
    def test_send_code_success(self, mock_send_code) -> None:
        mock_send_code.return_value = {
            'phone_code_hash': self.phone_code_hash,
            'temp_session': self.temp_session,
            'timeout': 60,
        }

        url = reverse('auth_send_code')
        response = self.client.post(url, {'phone_number': self.phone_number}, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data['phone_number'], self.phone_number)
        self.assertEqual(data['phone_code_hash'], self.phone_code_hash)
        self.assertEqual(data['auth_state'], TelegramSession.AuthState.PENDING_CODE)

        # Verify DB state
        user = User.objects.get(phone_number=self.phone_number)
        self.assertTrue(hasattr(user, 'telegram_session'))
        self.assertEqual(user.telegram_session.phone_code_hash, self.phone_code_hash)
        self.assertEqual(user.telegram_session.auth_state, TelegramSession.AuthState.PENDING_CODE)

    @patch('apps.telegram_engine.services.TelegramAuthService.verify_code')
    def test_verify_code_returns_pending_password_when_2fa_required(self, mock_verify_code) -> None:
        # Pre-create user and pending session
        user = User.objects.create_user(phone_number=self.phone_number)
        TelegramSession.objects.create(
            user=user,
            phone_number=self.phone_number,
            phone_code_hash=self.phone_code_hash,
            temp_encrypted_session=self.temp_session,
            auth_state=TelegramSession.AuthState.PENDING_CODE
        )

        mock_verify_code.return_value = {
            'status': 'PENDING_PASSWORD',
            'temp_session': 'updated_temp_session_for_2fa',
            'message': 'Two-Factor Authentication (2FA) cloud password required.'
        }

        url = reverse('auth_verify_code')
        payload = {
            'phone_number': self.phone_number,
            'code': '12345',
            'phone_code_hash': self.phone_code_hash
        }
        response = self.client.post(url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data['status'], 'PENDING_PASSWORD')
        self.assertEqual(data['auth_state'], TelegramSession.AuthState.PENDING_PASSWORD)

        user.telegram_session.refresh_from_db()
        self.assertEqual(user.telegram_session.auth_state, TelegramSession.AuthState.PENDING_PASSWORD)

    @patch('apps.telegram_engine.services.TelegramAuthService.verify_code')
    def test_verify_code_authenticates_and_generates_knox_token(self, mock_verify_code) -> None:
        user = User.objects.create_user(phone_number=self.phone_number)
        TelegramSession.objects.create(
            user=user,
            phone_number=self.phone_number,
            phone_code_hash=self.phone_code_hash,
            temp_encrypted_session=self.temp_session,
            auth_state=TelegramSession.AuthState.PENDING_CODE
        )

        mock_verify_code.return_value = {
            'status': 'AUTHENTICATED',
            'encrypted_session': self.auth_session,
            'telegram_user': {
                'id': 987654321,
                'first_name': 'Alice',
                'last_name': 'Smith',
                'username': 'alicesmith',
                'phone': self.phone_number,
            }
        }

        url = reverse('auth_verify_code')
        payload = {
            'phone_number': self.phone_number,
            'code': '54321',
        }
        response = self.client.post(url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data['status'], 'AUTHENTICATED')
        self.assertIn('token', data)
        self.assertIn('user', data)
        self.assertEqual(data['user']['username'], 'alicesmith')

        user.refresh_from_db()
        user.telegram_session.refresh_from_db()
        self.assertTrue(user.telegram_session.is_authenticated)
        self.assertEqual(user.telegram_session.auth_state, TelegramSession.AuthState.AUTHENTICATED)
        self.assertEqual(user.telegram_session.telegram_user_id, 987654321)

    @patch('apps.telegram_engine.services.TelegramAuthService.verify_password')
    def test_verify_2fa_password_success(self, mock_verify_password) -> None:
        user = User.objects.create_user(phone_number=self.phone_number)
        TelegramSession.objects.create(
            user=user,
            phone_number=self.phone_number,
            temp_encrypted_session=self.temp_session,
            auth_state=TelegramSession.AuthState.PENDING_PASSWORD
        )

        mock_verify_password.return_value = {
            'status': 'AUTHENTICATED',
            'encrypted_session': self.auth_session,
            'telegram_user': {
                'id': 11223344,
                'first_name': 'Bob',
                'last_name': 'Jones',
                'username': 'bobjones',
                'phone': self.phone_number,
            }
        }

        url = reverse('auth_verify_password')
        payload = {
            'phone_number': self.phone_number,
            'password': 'MySecret2FAPassword'
        }
        response = self.client.post(url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data['status'], 'AUTHENTICATED')
        self.assertIn('token', data)

    def test_auth_me_endpoint_with_knox_token(self) -> None:
        user = User.objects.create_user(phone_number=self.phone_number, first_name="Charlie")
        TelegramSession.objects.create(
            user=user,
            phone_number=self.phone_number,
            is_authenticated=True,
            auth_state=TelegramSession.AuthState.AUTHENTICATED,
            telegram_user_id=556677
        )

        _, token = AuthToken.objects.create(user=user)

        # Unauthenticated request fails
        url = reverse('auth_me')
        unauth_response = self.client.get(url)
        self.assertEqual(unauth_response.status_code, status.HTTP_401_UNAUTHORIZED)

        # Authenticated request with Knox Bearer header succeeds
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        auth_response = self.client.get(url)

        self.assertEqual(auth_response.status_code, status.HTTP_200_OK)
        data = auth_response.json()
        self.assertEqual(data['phone_number'], self.phone_number)
        self.assertEqual(data['first_name'], 'Charlie')
        self.assertTrue(data['telegram_session']['is_authenticated'])
        self.assertEqual(data['telegram_session']['telegram_user_id'], 556677)

    def test_knox_logout_invalidates_token(self) -> None:
        user = User.objects.create_user(phone_number=self.phone_number)
        _, token = AuthToken.objects.create(user=user)

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        logout_url = reverse('knox_logout')
        logout_response = self.client.post(logout_url)
        self.assertEqual(logout_response.status_code, status.HTTP_204_NO_CONTENT)

        # Subsequent request with the same token should fail
        me_url = reverse('auth_me')
        after_logout_response = self.client.get(me_url)
        self.assertEqual(after_logout_response.status_code, status.HTTP_401_UNAUTHORIZED)
