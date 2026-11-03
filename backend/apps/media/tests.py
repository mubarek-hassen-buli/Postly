import io
from unittest.mock import patch
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from django.urls import reverse
from knox.models import AuthToken
from rest_framework import status
from rest_framework.test import APIClient

from apps.media.models import UploadedMedia
from apps.media.services import CloudinaryMediaService

User = get_user_model()


@override_settings(
    CLOUDINARY_CLOUD_NAME='test_cloud',
    CLOUDINARY_API_KEY='1234567890',
    CLOUDINARY_API_SECRET='test_secret_key_12345'
)
class MediaApiTests(TestCase):
    """Integration and unit tests for Cloudinary media signature, upload, and deletion."""

    def setUp(self) -> None:
        self.client = APIClient()

        self.user = User.objects.create_user(phone_number="+1234567890", first_name="MediaUser")
        _, self.token = AuthToken.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

    def test_generate_upload_signature(self) -> None:
        url = reverse('media_upload_signature')
        response = self.client.get(url, {'resource_type': 'image'})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertIn('signature', data)
        self.assertIn('timestamp', data)
        self.assertEqual(data['cloud_name'], 'test_cloud')
        self.assertEqual(data['api_key'], '1234567890')
        self.assertIn('https://api.cloudinary.com/v1_1/test_cloud/image/upload', data['upload_url'])

    @patch('apps.media.services.cloudinary.uploader.upload')
    def test_direct_media_upload_image_success(self, mock_upload) -> None:
        mock_upload.return_value = {
            'secure_url': 'https://res.cloudinary.com/test_cloud/image/upload/v1234/postly/sample.jpg',
            'public_id': 'postly/users/sample_image',
            'bytes': 102400,
            'width': 1200,
            'height': 800,
            'format': 'jpg',
        }

        # Create dummy image file
        file_content = b'fake_image_binary_content'
        dummy_file = SimpleUploadedFile(
            name='test_photo.jpg',
            content=file_content,
            content_type='image/jpeg'
        )

        url = reverse('media_direct_upload')
        response = self.client.post(url, {'file': dummy_file}, format='multipart')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        data = response.json()
        self.assertEqual(data['media_type'], 'IMAGE')
        self.assertEqual(data['file_name'], 'test_photo.jpg')
        self.assertEqual(data['width'], 1200)

        # Verify DB entry
        media_record = UploadedMedia.objects.get(id=data['id'])
        self.assertEqual(media_record.user, self.user)
        self.assertEqual(media_record.public_id, 'postly/users/sample_image')

    def test_upload_unsupported_file_extension_fails(self) -> None:
        dummy_file = SimpleUploadedFile(
            name='script.exe',
            content=b'executable_binary',
            content_type='application/octet-stream'
        )

        url = reverse('media_direct_upload')
        response = self.client.post(url, {'file': dummy_file}, format='multipart')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        data = response.json()
        self.assertEqual(data['error']['code'], 'UNSUPPORTED_MEDIA_TYPE')

    def test_list_user_media(self) -> None:
        UploadedMedia.objects.create(
            user=self.user,
            media_url='https://res.cloudinary.com/test_cloud/image/upload/photo1.jpg',
            public_id='photo1',
            media_type='IMAGE',
            file_name='photo1.jpg',
            file_size=50000
        )
        UploadedMedia.objects.create(
            user=self.user,
            media_url='https://res.cloudinary.com/test_cloud/video/upload/video1.mp4',
            public_id='video1',
            media_type='VIDEO',
            file_name='video1.mp4',
            file_size=2000000
        )

        url = reverse('media_list')
        response = self.client.get(url, {'media_type': 'IMAGE'})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        results = data.get('results', data)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['file_name'], 'photo1.jpg')

    @patch('apps.media.services.cloudinary.uploader.destroy')
    def test_delete_media(self, mock_destroy) -> None:
        mock_destroy.return_value = {'result': 'ok'}

        media = UploadedMedia.objects.create(
            user=self.user,
            media_url='https://res.cloudinary.com/test_cloud/image/upload/to_delete.jpg',
            public_id='to_delete_id',
            media_type='IMAGE',
            file_name='to_delete.jpg',
            file_size=12000
        )

        url = reverse('media_detail', kwargs={'pk': str(media.id)})
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        mock_destroy.assert_called_once_with('to_delete_id', resource_type='image')
        self.assertFalse(UploadedMedia.objects.filter(id=media.id).exists())
