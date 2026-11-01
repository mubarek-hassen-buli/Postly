import logging
from typing import Any
from django.contrib import admin, messages
from django.utils.html import format_html
from django.urls import reverse
from unfold.admin import ModelAdmin
from unfold.decorators import display, action
from unfold.enums import ActionVariant

from .models import Channel
from .services import TelegramChannelService, TelegramServiceError

logger = logging.getLogger(__name__)


@admin.register(Channel)
class ChannelAdmin(ModelAdmin):
    list_display = (
        'title',
        'user_link',
        'username_display',
        'telegram_channel_id',
        'type_badge',
        'subscribers_display',
        'can_post_badge',
        'can_pin_badge',
        'is_selected_badge',
        'created_at',
    )
    list_filter = (
        'is_broadcast',
        'can_post_messages',
        'can_pin_messages',
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
    readonly_fields = ('created_at', 'updated_at', 'access_hash')
    ordering = ('title',)

    fieldsets = (
        ('Channel Identity', {
            'fields': (
                'user',
                'title',
                'username',
                'telegram_channel_id',
                'access_hash',
                'photo_url',
            )
        }),
        ('Type & Audience Reach', {
            'fields': (
                'is_broadcast',
                'member_count',
            )
        }),
        ('Administrative Permissions', {
            'fields': (
                'is_creator',
                'can_post_messages',
                'can_edit_messages',
                'can_delete_messages',
                'can_pin_messages',
            ),
            'description': 'Permissions granted to the user in this Telegram channel/supergroup.'
        }),
        ('User Selection Preference', {
            'fields': (
                'is_selected_by_user',
            )
        }),
        ('Audit Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )

    actions = [
        'sync_channels_from_telegram',
        'enable_channel_selection',
        'disable_channel_selection',
    ]

    @display(description="Owner")
    def user_link(self, obj: Channel) -> str:
        url = reverse("admin:accounts_user_change", args=[obj.user.pk])
        return format_html('<a href="{}" class="font-medium text-primary-600 hover:underline">{}</a>', url, obj.user.phone_number)

    @display(description="Handle")
    def username_display(self, obj: Channel) -> str:
        if obj.username:
            return f"@{obj.username}"
        return "-"

    @display(
        description="Channel Type",
        label={
            "Broadcast Channel": "info",
            "Supergroup / Group": "primary",
        }
    )
    def type_badge(self, obj: Channel) -> str:
        return "Broadcast Channel" if obj.is_broadcast else "Supergroup / Group"

    @display(description="Subscribers")
    def subscribers_display(self, obj: Channel) -> str:
        count = obj.member_count
        if count >= 1_000_000:
            formatted = f"{count / 1_000_000:.1f}M"
        elif count >= 1_000:
            formatted = f"{count / 1_000:.1f}K"
        else:
            formatted = f"{count:,}"
        return f"{formatted} subs"

    @display(description="Post Rights", boolean=True)
    def can_post_badge(self, obj: Channel) -> bool:
        return obj.can_post_messages

    @display(description="Pin Rights", boolean=True)
    def can_pin_badge(self, obj: Channel) -> bool:
        return obj.can_pin_messages

    @display(description="Selected", boolean=True)
    def is_selected_badge(self, obj: Channel) -> bool:
        return obj.is_selected_by_user

    @action(description="Re-sync Channels from Telegram MTProto")
    def sync_channels_from_telegram(self, request: Any, queryset: Any) -> None:
        users = {channel.user for channel in queryset}
        synced_total = 0
        failed_users = []

        for user in users:
            try:
                synced = TelegramChannelService.sync_user_channels(user)
                synced_total += len(synced)
            except TelegramServiceError as exc:
                logger.warning(f"Could not sync channels for user {user.id}: {exc.message}")
                failed_users.append(f"{user.phone_number} ({exc.code})")
            except Exception as exc:
                logger.exception(f"Unexpected error syncing channels for user {user.id}: {exc}")
                failed_users.append(f"{user.phone_number} (ERROR)")

        if failed_users:
            self.message_user(
                request,
                f"Synced {synced_total} channels across {len(users) - len(failed_users)} user(s). Failed users: {', '.join(failed_users)}",
                messages.WARNING
            )
        else:
            self.message_user(
                request,
                f"Successfully re-synchronized {synced_total} channels from Telegram MTProto for {len(users)} user(s).",
                messages.SUCCESS
            )

    @action(description="Select Channels for Quick Publishing")
    def enable_channel_selection(self, request: Any, queryset: Any) -> None:
        count = queryset.update(is_selected_by_user=True)
        self.message_user(request, f"Selected {count} channel(s) for quick publishing.", messages.SUCCESS)

    @action(description="Deselect Channels from Quick Publishing")
    def disable_channel_selection(self, request: Any, queryset: Any) -> None:
        count = queryset.update(is_selected_by_user=False)
        self.message_user(request, f"Deselected {count} channel(s).", messages.INFO)
