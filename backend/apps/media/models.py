import uuid
from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _


class UploadedMedia(models.Model):
    """
    Tracks media assets uploaded by users (via Cloudinary or direct upload).
    Stores asset metadata, dimensions, and Cloudinary public IDs.
    """
    class MediaType(models.TextChoices):
        IMAGE = 'IMAGE', _('Image')
        VIDEO = 'VIDEO', _('Video')
        DOCUMENT = 'DOCUMENT', _('Document')

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text="Globally unique identifier for the media asset."
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='uploaded_media',
        db_index=True,
        help_text="The Postly user who uploaded this asset."
    )
    media_url = models.URLField(
        max_length=500,
        help_text="Cloudinary CDN or asset URL."
    )
    public_id = models.CharField(
        max_length=255,
        db_index=True,
        help_text="Cloudinary public ID used for asset management and deletion."
    )
    media_type = models.CharField(
        max_length=16,
        choices=MediaType.choices,
        default=MediaType.IMAGE,
        db_index=True
    )
    file_name = models.CharField(
        max_length=255,
        blank=True,
        default="",
        help_text="Original file name."
    )
    file_size = models.PositiveIntegerField(
        default=0,
        help_text="File size in bytes."
    )
    width = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="Width in pixels (images/videos)."
    )
    height = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="Height in pixels (images/videos)."
    )
    duration = models.FloatField(
        null=True,
        blank=True,
        help_text="Duration in seconds (videos/audio)."
    )
    format = models.CharField(
        max_length=32,
        blank=True,
        default="",
        help_text="Asset format / extension (e.g. jpg, png, mp4, pdf)."
    )

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'postly_uploaded_media'
        verbose_name = 'Uploaded Media'
        verbose_name_plural = 'Uploaded Media'
        ordering = ['-created_at']

    def __str__(self) -> str:
        return f"{self.media_type}: {self.file_name or self.public_id} ({self.file_size} bytes)"
