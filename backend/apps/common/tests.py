import uuid
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

User = get_user_model()


class HealthCheckTests(TestCase):
    """Tests for the public health check endpoint."""

    def setUp(self) -> None:
        self.client = APIClient()

    def test_health_check_endpoint(self) -> None:
        url = reverse('health_check')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertIn('status', data)
        self.assertIn('services', data)
        self.assertIn('database', data['services'])
        self.assertEqual(data['services']['database'], 'connected')

    def test_request_id_header_attached(self) -> None:
        url = reverse('health_check')
        custom_request_id = str(uuid.uuid4())
        response = self.client.get(url, HTTP_X_REQUEST_ID=custom_request_id)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.headers.get('X-Request-ID'), custom_request_id)


class UserModelTests(TestCase):
    """Tests for the custom phone-based User model."""

    def test_create_user_successful(self) -> None:
        phone = "+1234567890"
        user = User.objects.create_user(phone_number=phone, first_name="John", last_name="Doe")

        self.assertEqual(user.phone_number, phone)
        self.assertEqual(user.first_name, "John")
        self.assertTrue(user.is_active)
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)
        self.assertIsInstance(user.id, uuid.UUID)

    def test_create_user_without_phone_raises_error(self) -> None:
        with self.assertRaises(ValueError):
            User.objects.create_user(phone_number="")

    def test_create_superuser_successful(self) -> None:
        phone = "+1987654321"
        admin = User.objects.create_superuser(phone_number=phone, password="AdminSecurePassword123!")

        self.assertEqual(admin.phone_number, phone)
        self.assertTrue(admin.is_staff)
        self.assertTrue(admin.is_superuser)
        self.assertTrue(admin.is_active)
