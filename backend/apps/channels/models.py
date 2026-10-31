import uuid
from typing import TYPE_CHECKING, Any, Optional
from django.conf import settings
from django.db import models


class Channel(models.Model):
    """
    Represents a Telegram Channel or Broadcast Supergroup managed by a Postly user.
    Stores cached metadata, administrative permissions, and user selection preferences.
    """
    if TYPE_CHECKING:
        objects: Any
        DoesNotExist: Any
        user_id: Any
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text="Globally unique identifier for the channel record."
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='channels',
        db_index=True,
        help_text="The Postly user who owns/manages this channel."
    )
    telegram_channel_id = models.BigIntegerField(
        db_index=True,
        help_text="Telegram MTProto Chat/Channel ID (e.g. -1001234567890 or 1234567890)."
    )
    access_hash = models.BigIntegerField(
        null=True,
        blank=True,
        help_text="MTProto Access Hash required to construct InputPeerChannel for client actions."
    )
    title = models.CharField(
        max_length=255,
        help_text="The display title of the Telegram channel."
    )
    username = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="Public username of the channel (without @), if public."
    )
    about = models.TextField(
        blank=True,
        default="",
        help_text="The channel description/bio."
    )
    photo_url = models.URLField(
        max_length=500,
        blank=True,
        null=True,
        help_text="Cached profile/avatar URL."
    )
    member_count = models.PositiveIntegerField(
        default=0,
        help_text="Number of channel subscribers/members."
    )

    # Permissions verified via MTProto
    is_creator = models.BooleanField(
        default=False,
        help_text="Indicates whether the user is the original creator/owner of the channel."
    )
    can_post_messages = models.BooleanField(
        default=False,
        db_index=True,
        help_text="Indicates whether the user has administrator permission to post messages."
    )
    can_edit_messages = models.BooleanField(
        default=False,
        help_text="Indicates whether the user can edit messages in this channel."
    )
    can_delete_messages = models.BooleanField(
        default=False,
        help_text="Indicates whether the user can delete messages."
    )
    can_pin_messages = models.BooleanField(
        default=False,
        help_text="Indicates whether the user can pin messages."
    )

    # Channel configuration & User preference
    is_broadcast = models.BooleanField(
        default=True,
        help_text="True if this is a broadcast channel; False if it is a supergroup/megagroup."
    )
    is_selected_by_user = models.BooleanField(
        default=True,
        db_index=True,
        help_text="Whether the user has selected this channel for active management in Postly."
    )

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'postly_channels'
        verbose_name = 'Channel'
        verbose_name_plural = 'Channels'
        unique_together = ('user', 'telegram_channel_id')
        ordering = ['title']
        indexes = [
            models.Index(fields=['user', 'is_selected_by_user']),
            models.Index(fields=['user', 'can_post_messages']),
        ]

    def __str__(self) -> str:
        return f"{self.title} (@{self.username or self.telegram_channel_id})"
