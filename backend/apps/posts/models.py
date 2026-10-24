import uuid
from typing import TYPE_CHECKING, Any, Optional
from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _

from apps.channels.models import Channel


class Post(models.Model):
    """
    Represents a Telegram post created in Postly.
    Supports drafts, immediate broadcasts, and high-concurrency Celery scheduling.
    """
    if TYPE_CHECKING:
        objects: Any
        DoesNotExist: Any
        user_id: Any
        targets: Any
        media_attachments: Any

    class PostStatus(models.TextChoices):
        DRAFT = 'DRAFT', _('Draft')
        SCHEDULED = 'SCHEDULED', _('Scheduled')
        PUBLISHING = 'PUBLISHING', _('Publishing')
        PUBLISHED = 'PUBLISHED', _('Published')
        FAILED = 'FAILED', _('Failed')
        CANCELLED = 'CANCELLED', _('Cancelled')

    class FormattingMode(models.TextChoices):
        HTML = 'HTML', _('HTML')
        MARKDOWN = 'MARKDOWN', _('Markdown')
        PLAIN = 'PLAIN', _('Plain Text')

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text="Globally unique identifier for the post."
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='posts',
        db_index=True,
        help_text="The Postly user who created this post."
    )
    text_content = models.TextField(
        blank=True,
        default="",
        help_text="The message body of the post with formatting entities."
    )
    formatting_mode = models.CharField(
        max_length=16,
        choices=FormattingMode.choices,
        default=FormattingMode.HTML,
        help_text="Text formatting mode: HTML, MARKDOWN, or PLAIN."
    )

    # Telegram Delivery Options
    silent = models.BooleanField(
        default=False,
        help_text="Send silently. Users will receive a notification with no sound."
    )
    disable_web_page_preview = models.BooleanField(
        default=False,
        help_text="Disables link previews for URLs mentioned in the post."
    )
    pin_message = models.BooleanField(
        default=False,
        help_text="Pin the message in the channel after successful broadcast."
    )

    # Lifecycle State
    status = models.CharField(
        max_length=16,
        choices=PostStatus.choices,
        default=PostStatus.DRAFT,
        db_index=True
    )
    scheduled_for = models.DateTimeField(
        null=True,
        blank=True,
        db_index=True,
        help_text="Target UTC datetime when the post should be published."
    )
    published_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Timestamp when the post was successfully dispatched."
    )
    celery_task_id = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        db_index=True,
        help_text="Async Celery Task ID tracking the scheduled execution."
    )
    error_summary = models.TextField(
        null=True,
        blank=True,
        help_text="Summary of failure errors if publishing failed."
    )
    linkedin_post_urn = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        db_index=True,
        help_text="LinkedIn Post URN for tracking and remote API deletion."
    )
    post_to_linkedin = models.BooleanField(
        default=False,
        db_index=True,
        help_text="Whether this broadcast targets the user's connected LinkedIn account."
    )

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'postly_posts'
        verbose_name = 'Post'
        verbose_name_plural = 'Posts'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['status', 'scheduled_for']),
        ]

    def __str__(self) -> str:
        text = str(self.text_content or '')
        snippet = (text[:30] + '...') if len(text) > 30 else text
        return f"Post({self.id}, status={self.status}, snippet='{snippet}')"


class PostChannelTarget(models.Model):
    """
    Bridge table associating a Post with one or more target Channels.
    Tracks individual delivery results, Telegram message IDs, and error logs per channel.
    """
    if TYPE_CHECKING:
        objects: Any
        DoesNotExist: Any
        post_id: Any
        channel_id: Any

    class TargetStatus(models.TextChoices):
        PENDING = 'PENDING', _('Pending')
        SUCCESS = 'SUCCESS', _('Success')
        FAILED = 'FAILED', _('Failed')

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name='targets',
        db_index=True
    )
    channel = models.ForeignKey(
        Channel,
        on_delete=models.CASCADE,
        related_name='targets',
        db_index=True
    )
    status = models.CharField(
        max_length=16,
        choices=TargetStatus.choices,
        default=TargetStatus.PENDING,
        db_index=True
    )
    telegram_message_id = models.BigIntegerField(
        null=True,
        blank=True,
        help_text="Telegram Message ID assigned in the channel on successful post."
    )
    error_message = models.TextField(
        null=True,
        blank=True,
        help_text="Detailed error message if dispatching to this specific channel failed."
    )
    sent_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Timestamp when message was successfully posted to this channel."
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'postly_post_channel_targets'
        verbose_name = 'Post Channel Target'
        verbose_name_plural = 'Post Channel Targets'
        unique_together = ('post', 'channel')
        ordering = ['created_at']

    def __str__(self) -> str:
        return f"PostChannelTarget(post={self.post_id}, channel={self.channel.title}, status={self.status})"


class PostMediaAttachment(models.Model):
    """
    Media attachments (Images, Videos, Documents) linked to a Post.
    """
    if TYPE_CHECKING:
        objects: Any
        DoesNotExist: Any
        post_id: Any

    class MediaType(models.TextChoices):
        IMAGE = 'IMAGE', _('Image')
        VIDEO = 'VIDEO', _('Video')
        DOCUMENT = 'DOCUMENT', _('Document')

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name='media_attachments',
        db_index=True
    )
    media_url = models.URLField(
        max_length=500,
        help_text="Public URL of the media asset (hosted on Cloudinary or external storage)."
    )
    media_type = models.CharField(
        max_length=16,
        choices=MediaType.choices,
        default=MediaType.IMAGE
    )
    file_name = models.CharField(
        max_length=255,
        blank=True,
        default=""
    )
    file_size = models.PositiveIntegerField(
        default=0,
        help_text="File size in bytes."
    )
    order = models.PositiveSmallIntegerField(
        default=0,
        help_text="Display and attachment ordering index."
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'postly_post_media_attachments'
        verbose_name = 'Post Media Attachment'
        verbose_name_plural = 'Post Media Attachments'
        ordering = ['order', 'created_at']

    def __str__(self) -> str:
        return f"MediaAttachment({self.media_type}: {self.file_name or self.media_url})"
