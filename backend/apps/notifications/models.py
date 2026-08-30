import uuid
from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _


class Device(models.Model):
    """
    Represents a mobile or web device registered for Expo Push Notifications.
    """
    class DeviceType(models.TextChoices):
        IOS = 'IOS', _('iOS')
        ANDROID = 'ANDROID', _('Android')
        WEB = 'WEB', _('Web')
        OTHER = 'OTHER', _('Other')

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='devices',
        db_index=True
    )
    expo_push_token = models.CharField(
        max_length=255,
        unique=True,
        db_index=True,
        help_text="Expo Push Token (e.g. ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx])."
    )
    device_type = models.CharField(
        max_length=16,
        choices=DeviceType.choices,
        default=DeviceType.OTHER
    )
    device_name = models.CharField(
        max_length=255,
        blank=True,
        default="",
        help_text="Device model/name (e.g. iPhone 15 Pro, Pixel 8)."
    )
    is_active = models.BooleanField(
        default=True,
        db_index=True,
        help_text="Indicates whether this device should receive push notifications."
    )
    last_seen_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'postly_devices'
        verbose_name = 'Device'
        verbose_name_plural = 'Devices'
        ordering = ['-last_seen_at']

    def __str__(self) -> str:
        return f"{self.user.phone_number} - {self.device_name or self.device_type} ({self.expo_push_token[:20]}...)"


class NotificationLog(models.Model):
    """
    Historical log of push notifications dispatched to the user.
    """
    class EventType(models.TextChoices):
        POST_PUBLISHED = 'POST_PUBLISHED', _('Post Published')
        POST_FAILED = 'POST_FAILED', _('Post Publishing Failed')
        SESSION_REVOKED = 'SESSION_REVOKED', _('Telegram Session Revoked')
        SYSTEM_ALERT = 'SYSTEM_ALERT', _('System Alert')

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications',
        db_index=True
    )
    title = models.CharField(max_length=255)
    body = models.TextField()
    event_type = models.CharField(
        max_length=32,
        choices=EventType.choices,
        default=EventType.SYSTEM_ALERT,
        db_index=True
    )
    data = models.JSONField(
        default=dict,
        blank=True,
        help_text="JSON payload passed to the mobile client for deep linking."
    )
    is_read = models.BooleanField(
        default=False,
        db_index=True
    )
    delivered = models.BooleanField(
        default=False,
        help_text="Whether the push notification was accepted by Expo Push Gateway."
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        db_table = 'postly_notification_logs'
        verbose_name = 'Notification Log'
        verbose_name_plural = 'Notification Logs'
        ordering = ['-created_at']

    def __str__(self) -> str:
        return f"Notification({self.event_type} -> {self.user.phone_number}: {self.title})"
