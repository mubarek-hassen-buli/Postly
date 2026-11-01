from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from unfold.admin import ModelAdmin
from unfold.decorators import display

from .models import Device, NotificationLog


@admin.register(Device)
class DeviceAdmin(ModelAdmin):
    list_display = (
        'user_link',
        'device_type_badge',
        'device_name',
        'is_active_badge',
        'token_mask',
        'last_seen_at',
        'created_at',
    )
    list_filter = ('device_type', 'is_active', 'created_at')
    search_fields = ('user__phone_number', 'expo_push_token', 'device_name')
    readonly_fields = ('created_at', 'last_seen_at')
    ordering = ('-last_seen_at',)

    @display(description="User")
    def user_link(self, obj: Device) -> str:
        url = reverse("admin:accounts_user_change", args=[obj.user.pk])
        return format_html('<a href="{}" class="font-medium text-primary-600 hover:underline">{}</a>', url, obj.user.phone_number)

    @display(
        description="Type",
        label={
            Device.DeviceType.IOS: "primary",
            Device.DeviceType.ANDROID: "success",
            Device.DeviceType.WEB: "info",
        }
    )
    def device_type_badge(self, obj: Device) -> str:
        return obj.device_type

    @display(description="Active", boolean=True)
    def is_active_badge(self, obj: Device) -> bool:
        return obj.is_active

    @display(description="Push Token")
    def token_mask(self, obj: Device) -> str:
        if not obj.expo_push_token:
            return "-"
        return f"{obj.expo_push_token[:12]}...{obj.expo_push_token[-6:]}"


@admin.register(NotificationLog)
class NotificationLogAdmin(ModelAdmin):
    list_display = (
        'title',
        'user_link',
        'event_badge',
        'is_read_badge',
        'delivered_badge',
        'created_at',
    )
    list_filter = ('event_type', 'is_read', 'delivered', 'created_at')
    search_fields = ('title', 'body', 'user__phone_number')
    readonly_fields = ('created_at',)
    ordering = ('-created_at',)

    @display(description="User")
    def user_link(self, obj: NotificationLog) -> str:
        url = reverse("admin:accounts_user_change", args=[obj.user.pk])
        return format_html('<a href="{}" class="font-medium text-primary-600 hover:underline">{}</a>', url, obj.user.phone_number)

    @display(
        description="Event Type",
        label={
            "BROADCAST_SUCCESS": "success",
            "BROADCAST_FAILED": "danger",
            "SCHEDULED_REMINDER": "info",
            "SESSION_EXPIRING": "warning",
            "SYSTEM_ALERT": "primary",
        }
    )
    def event_badge(self, obj: NotificationLog) -> str:
        return obj.event_type

    @display(description="Read", boolean=True)
    def is_read_badge(self, obj: NotificationLog) -> bool:
        return obj.is_read

    @display(description="Delivered", boolean=True)
    def delivered_badge(self, obj: NotificationLog) -> bool:
        return obj.delivered
