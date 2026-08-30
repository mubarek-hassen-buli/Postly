import re
from rest_framework import serializers
from .models import Device, NotificationLog

EXPO_TOKEN_REGEX = re.compile(r'^(ExponentPushToken|ExpoPushToken)\[.*\]$')


class DeviceRegisterSerializer(serializers.Serializer):
    """Payload validator for registering or refreshing a device Expo push token."""
    expo_push_token = serializers.CharField(
        max_length=255,
        required=True,
        help_text="Expo Push Token (e.g. ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx])."
    )
    device_type = serializers.ChoiceField(
        choices=Device.DeviceType.choices,
        default=Device.DeviceType.OTHER,
        required=False
    )
    device_name = serializers.CharField(
        max_length=255,
        required=False,
        allow_blank=True,
        default=""
    )

    def validate_expo_push_token(self, value: str) -> str:
        clean_token = value.strip()
        if not EXPO_TOKEN_REGEX.match(clean_token):
            raise serializers.ValidationError(
                "Invalid Expo push token format. Expected ExponentPushToken[...] or ExpoPushToken[...]."
            )
        return clean_token


class DeviceSerializer(serializers.ModelSerializer):
    """Serializer representing a registered device."""
    class Meta:
        model = Device
        fields = [
            'id',
            'expo_push_token',
            'device_type',
            'device_name',
            'is_active',
            'last_seen_at',
            'created_at',
        ]
        read_only_fields = fields


class NotificationLogSerializer(serializers.ModelSerializer):
    """Serializer representing a logged push notification."""
    class Meta:
        model = NotificationLog
        fields = [
            'id',
            'title',
            'body',
            'event_type',
            'data',
            'is_read',
            'delivered',
            'created_at',
        ]
        read_only_fields = fields


class MarkReadRequestSerializer(serializers.Serializer):
    """Payload validator for marking notifications as read."""
    notification_ids = serializers.ListField(
        child=serializers.UUIDField(),
        required=False,
        default=list,
        help_text="List of notification UUIDs to mark read. If empty, marks all user notifications as read."
    )
