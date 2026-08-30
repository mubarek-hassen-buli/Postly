from rest_framework import serializers
from .models import Channel


class ChannelSerializer(serializers.ModelSerializer):
    """Serializer representing a managed Telegram channel."""

    class Meta:
        model = Channel
        fields = [
            'id',
            'telegram_channel_id',
            'title',
            'username',
            'about',
            'photo_url',
            'member_count',
            'is_creator',
            'can_post_messages',
            'can_edit_messages',
            'can_delete_messages',
            'can_pin_messages',
            'is_broadcast',
            'is_selected_by_user',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'telegram_channel_id',
            'title',
            'username',
            'about',
            'photo_url',
            'member_count',
            'is_creator',
            'can_post_messages',
            'can_edit_messages',
            'can_delete_messages',
            'can_pin_messages',
            'is_broadcast',
            'created_at',
            'updated_at',
        ]


class ChannelToggleSelectionSerializer(serializers.Serializer):
    """Payload validator for updating channel selection state."""
    is_selected_by_user = serializers.BooleanField(
        required=True,
        help_text="Set to true to select this channel for management; false to exclude."
    )


class ChannelStatsSerializer(serializers.Serializer):
    """Statistics and permissions summary for a channel."""
    id = serializers.UUIDField()
    telegram_channel_id = serializers.IntegerField()
    title = serializers.CharField()
    member_count = serializers.IntegerField()
    is_creator = serializers.BooleanField()
    can_post_messages = serializers.BooleanField()
    can_edit_messages = serializers.BooleanField()
    can_delete_messages = serializers.BooleanField()
    is_selected_by_user = serializers.BooleanField()
    published_posts_count = serializers.IntegerField(default=0)
    scheduled_posts_count = serializers.IntegerField(default=0)
