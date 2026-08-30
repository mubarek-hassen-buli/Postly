from django.contrib import admin
from .models import Device, NotificationLog


@admin.register(Device)
class DeviceAdmin(admin.ModelAdmin):
    list_display = (
        'user',
        'device_type',
        'device_name',
        'is_active',
        'expo_push_token',
        'last_seen_at',
        'created_at',
    )
    list_filter = ('device_type', 'is_active', 'created_at')
    search_fields = ('user__phone_number', 'expo_push_token', 'device_name')
    readonly_fields = ('created_at', 'last_seen_at')


@admin.register(NotificationLog)
class NotificationLogAdmin(admin.ModelAdmin):
    list_display = (
        'title',
        'user',
        'event_type',
        'is_read',
        'delivered',
        'created_at',
    )
    list_filter = ('event_type', 'is_read', 'delivered', 'created_at')
    search_fields = ('title', 'body', 'user__phone_number')
    readonly_fields = ('created_at',)
