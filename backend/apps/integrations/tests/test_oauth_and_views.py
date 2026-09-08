from typing import Any
from datetime import timedelta
from unittest.mock import patch
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from django.core.cache import cache
from knox.models import AuthToken
from rest_framework import status
from rest_framework.test import APIClient

from apps.integrations.linkedin.oauth import LinkedInOAuthError, LinkedInOAuthService
from apps.integrations.models import LinkedInAccount

User: Any = get_user_model()


class LinkedInIntegrationTests(TestCase):
    """Integration and unit tests for LinkedIn OAuth 2.0, OpenID Connect, and publishing APIs."""

    def setUp(self) -> None:
        cache.clear()
        self.client: Any = APIClient()
        self.user = User.objects.create_user(phone_number="+1234567890", first_name="John")
        _, self.token = AuthToken.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

    def test_state_generation_and_verification(self):
        state = LinkedInOAuthService.generate_state(str(self.user.id))
        self.assertIsInstance(state, str)
        self.assertTrue(len(state) > 10)

        verified_user_id = LinkedInOAuthService.verify_state(state)
        self.assertEqual(verified_user_id, str(self.user.id))

    def test_state_tampering_raises_error(self):
        state = LinkedInOAuthService.generate_state(str(self.user.id))
        tampered_state = state[:-5] + "XXXXX"

        with self.assertRaises(LinkedInOAuthError):
            LinkedInOAuthService.verify_state(tampered_state)

    def test_authorize_endpoint_requires_auth(self):
        unauthed_client: Any = APIClient()
        response = unauthed_client.get('/api/integrations/linkedin/authorize/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authorize_endpoint_returns_valid_url(self):
        response = self.client.get('/api/integrations/linkedin/authorize/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()

        self.assertIn('authorization_url', data)
        self.assertIn('state', data)
        self.assertIn('https://www.linkedin.com/oauth/v2/authorization', data['authorization_url'])
        self.assertIn('response_type=code', data['authorization_url'])
        self.assertIn('w_member_social', data['authorization_url'])
        self.assertIn('openid', data['authorization_url'])

    @patch('apps.integrations.linkedin.oauth.LinkedInOAuthService.exchange_code_for_token')
    @patch('apps.integrations.linkedin.oauth.LinkedInOAuthService.fetch_userinfo')
    def test_callback_endpoint_success(self, mock_userinfo, mock_token_exchange):
        mock_token_exchange.return_value = {
            'access_token': 'mock_access_token_123',
            'expires_in': 5184000,
            'scope': 'openid profile email w_member_social',
        }
        mock_userinfo.return_value = {
            'sub': 'member_sub_abc',
            'name': 'Jane Doe',
            'given_name': 'Jane',
            'family_name': 'Doe',
            'email': 'jane@example.com',
            'picture': 'https://media.licdn.com/profile.jpg',
        }

        state = LinkedInOAuthService.generate_state(str(self.user.id))
        callback_url = f'/api/integrations/linkedin/callback/?code=mock_code&state={state}'

        response = self.client.get(callback_url, HTTP_ACCEPT='application/json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data['status'], 'SUCCESS')

        # Verify LinkedInAccount record created
        account = LinkedInAccount.objects.get(user=self.user)
        self.assertEqual(account.linkedin_member_id, 'member_sub_abc')
        self.assertEqual(account.name, 'Jane Doe')
        self.assertEqual(account.email, 'jane@example.com')
        self.assertEqual(account.get_access_token(), 'mock_access_token_123')
        self.assertFalse(account.is_token_expired)

    def test_status_endpoint_when_disconnected(self):
        response = self.client.get('/api/integrations/linkedin/status/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertFalse(data['is_connected'])
        self.assertIsNone(data['account'])

    def test_status_endpoint_when_connected(self):
        account = LinkedInAccount.objects.create(
            user=self.user,
            linkedin_member_id='sub_123',
            name='Jane Doe',
            email='jane@example.com',
            token_expires_at=timezone.now() + timedelta(days=30),
            is_active=True
        )
        account.set_access_token('sample_token')
        account.save()

        response = self.client.get('/api/integrations/linkedin/status/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertTrue(data['is_connected'])
        self.assertEqual(data['account']['name'], 'Jane Doe')
        self.assertEqual(data['account']['linkedin_member_id'], 'sub_123')

    def test_disconnect_endpoint(self):
        account = LinkedInAccount.objects.create(
            user=self.user,
            linkedin_member_id='sub_123',
            name='Jane Doe',
            token_expires_at=timezone.now() + timedelta(days=30),
            is_active=True
        )
        account.set_access_token('sample_token')
        account.save()

        response = self.client.post('/api/integrations/linkedin/disconnect/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(LinkedInAccount.objects.filter(user=self.user).exists())

    @patch('apps.integrations.linkedin.publishing.requests.post')
    def test_publish_endpoint_success(self, mock_requests_post):
        account = LinkedInAccount.objects.create(
            user=self.user,
            linkedin_member_id='sub_123',
            name='Jane Doe',
            token_expires_at=timezone.now() + timedelta(days=30),
            is_active=True
        )
        account.set_access_token('sample_token')
        account.save()

        # Mock LinkedIn 201 response with x-restli-id
        class MockResponse:
            status_code = 201
            headers = {'x-restli-id': 'urn:li:share:987654321'}
            content = b'{}'
            def json(self):
                return {}

        mock_requests_post.return_value = MockResponse()

        payload = {'text': 'Excited to announce our new launch with Postly!'}
        response = self.client.post('/api/integrations/linkedin/publish/', data=payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        data = response.json()
        self.assertEqual(data['status'], 'SUCCESS')
        self.assertEqual(data['platform'], 'LINKEDIN')
        self.assertEqual(data['post_urn'], 'urn:li:share:987654321')

    def test_publish_endpoint_validation_empty_text(self):
        payload = {'text': '   '}
        response = self.client.post('/api/integrations/linkedin/publish/', data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_publish_endpoint_unconnected_user(self):
        payload = {'text': 'Test post'}
        response = self.client.post('/api/integrations/linkedin/publish/', data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
