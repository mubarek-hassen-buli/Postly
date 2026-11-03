import logging
import time
from typing import Any, Dict, Optional
import cloudinary
import cloudinary.uploader
import cloudinary.utils
from django.conf import settings

logger = logging.getLogger(__name__)

# Size limits in bytes
MAX_IMAGE_SIZE = 10 * 1024 * 1024       # 10 MB
MAX_VIDEO_SIZE = 50 * 1024 * 1024       # 50 MB
MAX_DOCUMENT_SIZE = 20 * 1024 * 1024    # 20 MB

ALLOWED_IMAGE_EXTENSIONS = {'jpg', 'jpeg', 'png', 'webp', 'gif'}
ALLOWED_VIDEO_EXTENSIONS = {'mp4', 'mov', 'webm', 'avi', 'mkv'}
ALLOWED_DOCUMENT_EXTENSIONS = {'pdf', 'doc', 'docx', 'txt', 'zip', 'csv', 'xlsx'}


class MediaServiceError(Exception):
    """Base exception for media operations."""
    def __init__(self, message: str, code: str = "MEDIA_ERROR", details: Optional[Any] = None) -> None:
        super().__init__(message)
        self.message = message
        self.code = code
        self.details = details


class CloudinaryMediaService:
    """
    Handles Cloudinary configuration, signature generation for direct mobile uploads,
    server-side media processing, and asset deletion.
    """

    @classmethod
    def _ensure_configured(cls) -> None:
        cloud_name = getattr(settings, 'CLOUDINARY_CLOUD_NAME', None)
        api_key = getattr(settings, 'CLOUDINARY_API_KEY', None)
        api_secret = getattr(settings, 'CLOUDINARY_API_SECRET', None)

        if not cloud_name or not api_key or not api_secret:
            raise MediaServiceError(
                "Cloudinary credentials (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are not configured in settings.",
                code="CLOUDINARY_CONFIG_MISSING"
            )

        cloudinary.config(
            cloud_name=cloud_name,
            api_key=api_key,
            api_secret=api_secret,
            secure=True
        )

    @classmethod
    def generate_upload_signature(
        cls,
        folder: str = "postly_media",
        resource_type: str = "auto"
    ) -> Dict[str, Any]:
        """
        Generates a cryptographic signature and parameters allowing the mobile client
        to upload directly to Cloudinary without exposing the API Secret.
        """
        cls._ensure_configured()

        timestamp = int(time.time())
        params_to_sign = {
            'timestamp': timestamp,
            'folder': folder,
        }

        api_secret = getattr(settings, 'CLOUDINARY_API_SECRET', '')
        signature = cloudinary.utils.api_sign_request(params_to_sign, api_secret)

        cloud_name = getattr(settings, 'CLOUDINARY_CLOUD_NAME', '')
        api_key = getattr(settings, 'CLOUDINARY_API_KEY', '')

        return {
            'timestamp': timestamp,
            'signature': signature,
            'api_key': api_key,
            'cloud_name': cloud_name,
            'folder': folder,
            'upload_url': f"https://api.cloudinary.com/v1_1/{cloud_name}/{resource_type}/upload"
        }

    @classmethod
    def upload_file(cls, file_obj, user_id: str, custom_filename: Optional[str] = None) -> Dict[str, Any]:
        """
        Uploads a media file to Cloudinary with validation on format and size.
        """
        cls._ensure_configured()

        filename = custom_filename or getattr(file_obj, 'name', 'file')
        file_size = getattr(file_obj, 'size', 0)

        # Detect extension and validate
        ext = filename.split('.')[-1].lower() if '.' in filename else ''

        if ext in ALLOWED_IMAGE_EXTENSIONS:
            media_type = 'IMAGE'
            max_size = MAX_IMAGE_SIZE
            resource_type = 'image'
        elif ext in ALLOWED_VIDEO_EXTENSIONS:
            media_type = 'VIDEO'
            max_size = MAX_VIDEO_SIZE
            resource_type = 'video'
        elif ext in ALLOWED_DOCUMENT_EXTENSIONS:
            media_type = 'DOCUMENT'
            max_size = MAX_DOCUMENT_SIZE
            resource_type = 'raw'
        else:
            raise MediaServiceError(
                f"Unsupported file format: .{ext}. Allowed formats include JPEG, PNG, WEBP, MP4, PDF, DOCX, ZIP.",
                code="UNSUPPORTED_MEDIA_TYPE"
            )

        if file_size > max_size:
            max_mb = max_size // (1024 * 1024)
            raise MediaServiceError(
                f"File size exceeds limit of {max_mb}MB for {media_type.lower()}s.",
                code="FILE_TOO_LARGE",
                details={'max_bytes': max_size, 'actual_bytes': file_size}
            )

        folder = f"postly/users/{user_id}"

        try:
            upload_result = cloudinary.uploader.upload(
                file_obj,
                folder=folder,
                resource_type=resource_type,
                use_filename=True,
                unique_filename=True
            )

            return {
                'media_url': upload_result.get('secure_url', upload_result.get('url')),
                'public_id': upload_result.get('public_id'),
                'media_type': media_type,
                'file_name': filename,
                'file_size': upload_result.get('bytes', file_size),
                'width': upload_result.get('width'),
                'height': upload_result.get('height'),
                'duration': upload_result.get('duration'),
                'format': upload_result.get('format', ext),
            }

        except Exception as exc:
            logger.exception(f"Error uploading file to Cloudinary: {str(exc)}")
            raise MediaServiceError(
                f"Failed to upload media to Cloudinary: {str(exc)}",
                code="CLOUDINARY_UPLOAD_ERROR"
            ) from exc

    @classmethod
    def delete_file(cls, public_id: str, media_type: str = 'IMAGE') -> bool:
        """
        Deletes a media file from Cloudinary by its public ID.
        """
        cls._ensure_configured()

        resource_type = 'image'
        if media_type == 'VIDEO':
            resource_type = 'video'
        elif media_type == 'DOCUMENT':
            resource_type = 'raw'

        try:
            result = cloudinary.uploader.destroy(public_id, resource_type=resource_type)
            return result.get('result') == 'ok'
        except Exception as exc:
            logger.warning(f"Error deleting Cloudinary asset {public_id}: {str(exc)}")
            return False
