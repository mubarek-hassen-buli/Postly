from django.contrib import admin
from .models import Channel


@admin.register(Channel)
class ChannelAdmin(admin.ModelAdmin):
    list_display = (
        'title',
        'user',
        'username',
        'telegram_channel_id',
        'is_broadcast',
        'member_count',
        'can_post_messages',
        'is_selected_by_user',
        'created_at',
    )
    list_filter = (
        'is_broadcast',
        'can_post_messages',
        'is_selected_by_user',
        'is_creator',
        'created_at',
    )
    search_fields = (
        'title',
        'username',
        'telegram_channel_id',
        'user__phone_number',
    )
    readonly_fields = ('created_at', 'updated_at')
