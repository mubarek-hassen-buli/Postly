import logging
from typing import Any, Dict, List, Optional
from django.db import transaction
from django.utils import timezone
from telethon.tl.functions.channels import GetFullChannelRequest
from telethon.tl.types import Channel as TelethonChannel, Chat as TelethonChat, ChatAdminRights

from apps.accounts.models import TelegramSession, User
from apps.telegram_engine.client import run_async, telethon_client_context
from apps.telegram_engine.services import TelegramServiceError
from .models import Channel

logger = logging.getLogger(__name__)


class TelegramChannelService:
    """
    Service responsible for interacting with Telegram MTProto API to discover,
    inspect permissions, and synchronize Telegram channels for Postly users.
    """

    @classmethod
    def discover_channels(cls, encrypted_session: str) -> List[Dict[str, Any]]:
        """
        Connects via Telethon MTProto and retrieves all channels and broadcast groups
        where the user has administrative or publishing permissions.
        """
        return run_async(cls._async_discover_channels(encrypted_session))

    @classmethod
    async def _async_discover_channels(cls, encrypted_session: str) -> List[Dict[str, Any]]:
        discovered_channels: List[Dict[str, Any]] = []

        try:
            async with telethon_client_context(
                session_string=encrypted_session,
                is_encrypted=True
            ) as client:
                if not await client.is_user_authorized():
                    raise TelegramServiceError(
                        "Telegram session is expired or not authorized. Please reconnect your Telegram account.",
                        code="SESSION_UNAUTHORIZED"
                    )

                # Iterate through all dialogs to find channels & broadcast groups
                async for dialog in client.iter_dialogs():
                    if not dialog.is_channel and not dialog.is_group:
                        continue

                    entity = dialog.entity
                    if not isinstance(entity, (TelethonChannel, TelethonChat)):
                        continue

                    is_creator = getattr(entity, 'creator', False)
                    admin_rights: Optional[ChatAdminRights] = getattr(entity, 'admin_rights', None)

                    can_post = False
                    can_edit = False
                    can_delete = False
                    can_pin = False

                    if is_creator:
                        # Creators automatically have all permissions
                        can_post = True
                        can_edit = True
                        can_delete = True
                        can_pin = True
                    elif admin_rights is not None:
                        # Check admin permissions
                        can_post = (
                            getattr(admin_rights, 'post_messages', False) or
                            getattr(admin_rights, 'send_messages', False) or
                            getattr(admin_rights, 'change_info', False)
                        )
                        can_edit = getattr(admin_rights, 'edit_messages', False)
                        can_delete = getattr(admin_rights, 'delete_messages', False)
                        can_pin = getattr(admin_rights, 'pin_messages', False)
                    else:
                        # Only include channels/groups where the user is creator or has admin rights
                        continue

                    # Retrieve member count and additional details
                    member_count = getattr(entity, 'participants_count', None)
                    about_text = ""

                    try:
                        # Fetch full channel info for description and exact member count
                        if isinstance(entity, TelethonChannel):
                            full_channel = await client(GetFullChannelRequest(channel=entity))
                            if hasattr(full_channel, 'full_chat'):
                                about_text = getattr(full_channel.full_chat, 'about', '') or ''
                                if member_count is None:
                                    member_count = getattr(full_channel.full_chat, 'participants_count', 0)
                    except Exception as exc:
                        logger.debug(f"Could not fetch full channel for {entity.id}: {str(exc)}")

                    if member_count is None:
                        member_count = 0

                    is_broadcast = getattr(entity, 'broadcast', True)
                    access_hash = getattr(entity, 'access_hash', 0) or 0

                    discovered_channels.append({
                        'telegram_channel_id': entity.id,
                        'access_hash': access_hash,
                        'title': entity.title or f"Channel {entity.id}",
                        'username': getattr(entity, 'username', None),
                        'about': about_text,
                        'member_count': member_count,
                        'is_creator': is_creator,
                        'can_post_messages': can_post,
                        'can_edit_messages': can_edit,
                        'can_delete_messages': can_delete,
                        'can_pin_messages': can_pin,
                        'is_broadcast': is_broadcast,
                    })

                return discovered_channels

        except TelegramServiceError:
            raise
        except Exception as exc:
            logger.exception(f"Unexpected error discovering Telegram channels: {str(exc)}")
            raise TelegramServiceError(
                f"Failed to discover channels from Telegram: {str(exc)}",
                code="DISCOVERY_ERROR"
            ) from exc

    @classmethod
    def sync_user_channels(cls, user: User) -> List[Channel]:
        """
        Fetches channels from Telegram MTProto and synchronizes them with the local database.
        Ensures atomic updates and preserves user channel selection preferences.
        """
        try:
            telegram_session = user.telegram_session
        except TelegramSession.DoesNotExist:
            raise TelegramServiceError(
                "No connected Telegram session found. Please connect your Telegram account first.",
                code="NO_TELEGRAM_SESSION"
            )

        if not telegram_session.is_authenticated or not telegram_session.encrypted_session_string:
            raise TelegramServiceError(
                "Telegram account is not authenticated or session has been revoked.",
                code="SESSION_UNAUTHENTICATED"
            )

        # MTProto discovery call
        raw_channels = cls.discover_channels(telegram_session.encrypted_session_string)

        synced_channels: List[Channel] = []
        now = timezone.now()

        # Check if the user already has channels configured
        has_existing_channels = Channel.objects.filter(user=user).exists()

        with transaction.atomic():
            discovered_ids = set()

            for item in raw_channels:
                tg_id = item['telegram_channel_id']
                discovered_ids.add(tg_id)

                channel, created = Channel.objects.get_or_create(
                    user=user,
                    telegram_channel_id=tg_id,
                    defaults={
                        'access_hash': item['access_hash'],
                        'title': item['title'],
                        'username': item['username'],
                        'about': item['about'],
                        'member_count': item['member_count'],
                        'is_creator': item['is_creator'],
                        'can_post_messages': item['can_post_messages'],
                        'can_edit_messages': item['can_edit_messages'],
                        'can_delete_messages': item['can_delete_messages'],
                        'can_pin_messages': item['can_pin_messages'],
                        'is_broadcast': item['is_broadcast'],
                        'is_selected_by_user': False if has_existing_channels else True,
                    }
                )

                if not created:
                    # Update fields while preserving is_selected_by_user
                    channel.access_hash = item['access_hash']
                    channel.title = item['title']
                    channel.username = item['username']
                    channel.about = item['about']
                    channel.member_count = item['member_count']
                    channel.is_creator = item['is_creator']
                    channel.can_post_messages = item['can_post_messages']
                    channel.can_edit_messages = item['can_edit_messages']
                    channel.can_delete_messages = item['can_delete_messages']
                    channel.can_pin_messages = item['can_pin_messages']
                    channel.is_broadcast = item['is_broadcast']
                    channel.save()

                synced_channels.append(channel)

            # Update session last_synced_at
            telegram_session.last_synced_at = now
            telegram_session.save(update_fields=['last_synced_at', 'updated_at'])

        return synced_channels
