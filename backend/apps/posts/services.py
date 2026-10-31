# pyright: reportAttributeAccessIssue=none, reportGeneralTypeIssues=none, reportArgumentType=none, reportCallIssue=none
import logging
from typing import Any, Dict, List, Optional
from django.db import transaction
from django.utils import timezone
from telethon.errors import (
    ChannelPrivateError,
    ChatAdminRequiredError,
    ChatWriteForbiddenError,
    FloodWaitError,
    MediaEmptyError,
    MediaInvalidError,
    UserBannedInChannelError,
)
from telethon.tl.types import InputPeerChannel

from apps.accounts.models import TelegramSession
from apps.telegram_engine.client import run_async, telethon_client_context
from apps.telegram_engine.services import TelegramServiceError
from .models import Post, PostChannelTarget, PostMediaAttachment

logger = logging.getLogger(__name__)


class TelegramPublishingService:
    """
    Core broadcasting engine for Postly.
    Dispatches composed rich posts and media attachments to target Telegram channels
    via MTProto with per-channel error isolation and atomic state transitions.
    """

    @classmethod
    def publish_post(cls, post_id: str) -> Dict[str, Any]:
        """
        Main entrypoint for publishing a post (invoked synchronously or via Celery worker).
        Safely acquires optimistic lock, transitions status to PUBLISHING, and broadcasts.
        """
        # Step 1: Atomic state transition & validation
        with transaction.atomic():
            try:
                post = Post.objects.select_for_update(nowait=False).get(id=post_id)
            except Post.DoesNotExist:
                logger.error(f"Cannot publish post {post_id}: Post does not exist.")
                return {'status': 'ERROR', 'message': 'Post not found'}

            # Prevent double-publishing race conditions
            if post.status in [Post.PostStatus.PUBLISHED, Post.PostStatus.PUBLISHING]:
                logger.warning(f"Post {post_id} is already {post.status}. Skipping dispatch.")
                return {'status': 'SKIPPED', 'message': f'Post already {post.status}'}

            post.status = Post.PostStatus.PUBLISHING
            post.save(update_fields=['status', 'updated_at'])

        # Step 2: Fetch targets and platform flags
        targets: List[PostChannelTarget] = list(post.targets.select_related('channel').all())
        post_to_linkedin = getattr(post, 'post_to_linkedin', False)

        if not targets and not post_to_linkedin:
            with transaction.atomic():
                post.status = Post.PostStatus.FAILED
                post.error_summary = "No target channels or platforms selected for this post."
                post.save(update_fields=['status', 'error_summary', 'updated_at'])
            return {'status': 'FAILED', 'message': 'No destinations'}

        user = post.user
        dispatch_results = {}
        error_messages = []
        success_count = 0
        failed_count = 0
        now = timezone.now()

        # Step 3: Run MTProto async broadcast to Telegram (if target channels exist)
        if targets:
            try:
                try:
                    telegram_session = user.telegram_session
                except TelegramSession.DoesNotExist:
                    raise TelegramServiceError("User has no connected Telegram session.")

                if not telegram_session.is_authenticated or not telegram_session.encrypted_session_string:
                    raise TelegramServiceError("Telegram session is unauthenticated or revoked.")

                media_items = list(post.media_attachments.all().order_by('order', 'created_at'))
                dispatch_results = run_async(
                    cls._async_dispatch_to_channels(
                        session_encrypted=telegram_session.encrypted_session_string,
                        post=post,
                        targets=targets,
                        media_items=media_items
                    )
                )
            except Exception as exc:
                logger.exception(f"Exception during Telegram broadcast for post {post.id}: {str(exc)}")
                for target in targets:
                    dispatch_results[str(target.id)] = {'status': 'FAILED', 'error': str(exc)}

            with transaction.atomic():
                for target in targets:
                    res = dispatch_results.get(str(target.id), {'status': 'FAILED', 'error': 'Unknown error'})
                    if res.get('status') == 'SUCCESS':
                        target.status = PostChannelTarget.TargetStatus.SUCCESS
                        target.telegram_message_id = res.get('message_id')
                        target.sent_at = now
                        target.error_message = None
                        success_count += 1
                    else:
                        target.status = PostChannelTarget.TargetStatus.FAILED
                        target.error_message = res.get('error', 'Dispatch failed')
                        failed_count += 1
                        error_messages.append(f"[{target.channel.title}]: {target.error_message}")
                    target.save(update_fields=['status', 'telegram_message_id', 'sent_at', 'error_message', 'updated_at'])

        # Step 4: Dispatch to LinkedIn (if post_to_linkedin is True)
        if post_to_linkedin:
            from apps.integrations.linkedin.publishing import LinkedInPublishingService, LinkedInPublishingError
            try:
                li_res = LinkedInPublishingService.publish_text_post(
                    user=user,
                    text_content=post.text_content
                )
                post.linkedin_post_urn = li_res.get('post_urn')
                success_count += 1
                logger.info(f"Post {post.id} successfully published to LinkedIn (URN: {post.linkedin_post_urn})")
            except Exception as li_exc:
                failed_count += 1
                li_err_msg = getattr(li_exc, 'message', str(li_exc))
                error_messages.append(f"[LinkedIn]: {li_err_msg}")
                logger.warning(f"Failed to publish post {post.id} to LinkedIn: {li_err_msg}")

        # Step 5: Finalize database records based on results
        with transaction.atomic():
            if success_count > 0:
                post.status = Post.PostStatus.PUBLISHED
                post.published_at = now
                post.error_summary = "; ".join(error_messages) if error_messages else None
            else:
                post.status = Post.PostStatus.FAILED
                post.error_summary = "; ".join(error_messages) if error_messages else "Broadcasting failed for all destinations."

            post.save(update_fields=['status', 'published_at', 'linkedin_post_urn', 'error_summary', 'updated_at'])

        # Step 6: Dispatch push notification alert to user
        try:
            from apps.notifications.services import ExpoPushService
            if post.status == Post.PostStatus.PUBLISHED:
                title = "Post Published!"
                body = f"Your post was successfully broadcast to {success_count} destination(s)."
                event_type = "POST_PUBLISHED"
            else:
                title = "Post Publishing Failed"
                body = f"Failed to publish post: {post.error_summary or 'Dispatch failed.'}"
                event_type = "POST_FAILED"

            ExpoPushService.send_notification_to_user(
                user=post.user,
                title=title,
                body=body,
                event_type=event_type,
                data={'post_id': str(post.id), 'status': post.status}
            )
        except Exception as push_exc:
            logger.warning(f"Failed to dispatch push notification for post {post.id}: {str(push_exc)}")

        return {
            'post_id': str(post.id),
            'status': post.status,
            'success_count': success_count,
            'failed_count': failed_count,
            'errors': error_messages
        }

    @classmethod
    async def _async_dispatch_to_channels(
        cls,
        session_encrypted: str,
        post: Post,
        targets: List[PostChannelTarget],
        media_items: List[PostMediaAttachment]
    ) -> Dict[str, Dict[str, Any]]:
        results: Dict[str, Dict[str, Any]] = {}

        parse_mode = None
        if post.formatting_mode == Post.FormattingMode.HTML:
            parse_mode = 'html'
        elif post.formatting_mode == Post.FormattingMode.MARKDOWN:
            parse_mode = 'md'

        async with telethon_client_context(
            session_string=session_encrypted,
            is_encrypted=True
        ) as client:
            if not await client.is_user_authorized():
                for target in targets:
                    results[str(target.id)] = {'status': 'FAILED', 'error': 'Telegram session is unauthorized'}
                return results

            # Dispatch sequentially to each target channel
            for target in targets:
                channel = target.channel
                target_key = str(target.id)

                try:
                    # Construct InputPeerChannel
                    if channel.access_hash:
                        peer = InputPeerChannel(channel.telegram_channel_id, channel.access_hash)
                    elif channel.username:
                        peer = channel.username
                    else:
                        peer = channel.telegram_channel_id

                    sent_msg = None

                    # Branch: Media message vs Pure text message
                    if media_items:
                        if len(media_items) == 1:
                            # Single media file with caption
                            single_media = media_items[0]
                            sent_msg = await client.send_file(
                                peer,
                                file=single_media.media_url,
                                caption=post.text_content or None,
                                parse_mode=parse_mode,
                                silent=post.silent
                            )
                        else:
                            # Multiple media files as an album/group
                            media_files = [m.media_url for m in media_items]
                            sent_msgs = await client.send_file(
                                peer,
                                file=media_files,
                                caption=post.text_content or None,
                                parse_mode=parse_mode,
                                silent=post.silent
                            )
                            sent_msg = sent_msgs[0] if isinstance(sent_msgs, list) else sent_msgs
                    else:
                        # Pure text message
                        sent_msg = await client.send_message(
                            peer,
                            message=post.text_content,
                            parse_mode=parse_mode,
                            silent=post.silent,
                            link_preview=not post.disable_web_page_preview
                        )

                    msg_id = getattr(sent_msg, 'id', None)

                    # Handle message pinning if requested
                    if post.pin_message and sent_msg is not None:
                        try:
                            if hasattr(sent_msg, 'pin') and callable(getattr(sent_msg, 'pin')):
                                await sent_msg.pin(notify=not post.silent)
                            else:
                                await client.pin_message(
                                    peer,
                                    message=msg_id or sent_msg,
                                    notify=not post.silent
                                )
                            logger.info(f"Successfully pinned message {msg_id} in channel {channel.title}.")
                        except Exception as pin_exc:
                            logger.warning(f"Could not pin message in channel {channel.title}: {str(pin_exc)}")
                            try:
                                if msg_id:
                                    await client.pin_message(peer, message=msg_id, notify=not post.silent)
                                    logger.info(f"Successfully pinned message {msg_id} via direct ID fallback in channel {channel.title}.")
                            except Exception as pin_err2:
                                logger.warning(f"Secondary pin fallback attempt failed in channel {channel.title}: {str(pin_err2)}")

                    results[target_key] = {
                        'status': 'SUCCESS',
                        'message_id': msg_id
                    }

                except (ChatAdminRequiredError, ChatWriteForbiddenError, UserBannedInChannelError) as exc:
                    results[target_key] = {
                        'status': 'FAILED',
                        'error': f'Permission denied: Account lacks write/admin rights in this channel ({str(exc)})'
                    }
                except ChannelPrivateError as exc:
                    results[target_key] = {
                        'status': 'FAILED',
                        'error': 'Channel is private or account was removed from the channel.'
                    }
                except (MediaEmptyError, MediaInvalidError) as exc:
                    results[target_key] = {
                        'status': 'FAILED',
                        'error': f'Invalid media file: {str(exc)}'
                    }
                except FloodWaitError as exc:
                    results[target_key] = {
                        'status': 'FAILED',
                        'error': f'Telegram flood wait limit reached ({exc.seconds}s).'
                    }
                except Exception as exc:
                    logger.exception(f"Error publishing post {post.id} to channel {channel.title}: {str(exc)}")
                    results[target_key] = {
                        'status': 'FAILED',
                        'error': str(exc)
                    }

        return results

    @classmethod
    def delete_remote_telegram_messages(cls, post: Post) -> Dict[str, Any]:
        """
        Connects via Telethon MTProto using the user's active Telegram session
        and deletes the remote messages associated with this post across all target channels.
        Handles per-channel errors gracefully so that one failure does not halt deletion in other channels.
        """
        targets = list(
            post.targets.select_related('channel').filter(
                telegram_message_id__isnull=False
            )
        )
        if not targets:
            logger.info(f"No remote Telegram message IDs to delete for post {post.id}.")
            return {'status': 'SKIPPED', 'deleted_count': 0, 'failed_count': 0}

        user = post.user
        try:
            telegram_session = user.telegram_session
        except TelegramSession.DoesNotExist:
            logger.warning(f"Cannot delete Telegram messages for post {post.id}: user {user.id} has no Telegram session.")
            return {'status': 'FAILED', 'error': 'No Telegram session found for user.'}

        if not telegram_session.is_authenticated or not telegram_session.encrypted_session_string:
            logger.warning(f"Cannot delete Telegram messages for post {post.id}: Telegram session not authenticated.")
            return {'status': 'FAILED', 'error': 'Telegram session not authenticated.'}

        try:
            return run_async(
                cls._async_delete_from_channels(
                    session_encrypted=telegram_session.encrypted_session_string,
                    targets=targets
                )
            )
        except Exception as exc:
            logger.exception(f"Unexpected error during remote Telegram deletion for post {post.id}: {str(exc)}")
            return {'status': 'FAILED', 'error': str(exc)}

    @classmethod
    async def _async_delete_from_channels(
        cls,
        session_encrypted: str,
        targets: List[PostChannelTarget]
    ) -> Dict[str, Any]:
        deleted_count = 0
        failed_count = 0
        channel_errors: Dict[str, str] = {}

        async with telethon_client_context(
            session_string=session_encrypted,
            is_encrypted=True
        ) as client:
            if not await client.is_user_authorized():
                logger.warning("Telethon client not authorized during delete operation.")
                return {'status': 'FAILED', 'error': 'Telethon session is not authorized.'}

            for target in targets:
                channel = target.channel
                msg_id = target.telegram_message_id
                if not msg_id:
                    continue

                try:
                    # Construct InputPeerChannel
                    if channel.access_hash:
                        peer = InputPeerChannel(channel.telegram_channel_id, channel.access_hash)
                    elif channel.username:
                        peer = channel.username
                    else:
                        peer = channel.telegram_channel_id

                    logger.info(f"Deleting message {msg_id} from channel {channel.title} ({channel.telegram_channel_id})...")
                    await client.delete_messages(peer, [msg_id])
                    deleted_count += 1
                    logger.info(f"Successfully deleted message {msg_id} from channel {channel.title}.")
                except Exception as exc:
                    failed_count += 1
                    channel_errors[channel.title or str(channel.id)] = str(exc)
                    logger.warning(
                        f"Failed to delete message {msg_id} in channel {channel.title} ({channel.id}): {str(exc)}"
                    )

        return {
            'status': 'SUCCESS' if failed_count == 0 else 'PARTIAL_SUCCESS' if deleted_count > 0 else 'FAILED',
            'deleted_count': deleted_count,
            'failed_count': failed_count,
            'errors': channel_errors
        }

    @classmethod
    def edit_remote_telegram_messages(cls, post: Post) -> Dict[str, Any]:
        """
        Connects via Telethon MTProto using the user's active Telegram session
        and edits the remote messages associated with this post across all target channels.
        Handles per-channel errors gracefully so that one failure does not halt editing in other channels.
        """
        targets = list(
            post.targets.select_related('channel').filter(
                telegram_message_id__isnull=False
            )
        )
        if not targets:
            logger.info(f"No remote Telegram message IDs to edit for post {post.id}.")
            return {'status': 'SKIPPED', 'edited_count': 0, 'failed_count': 0}

        user = post.user
        try:
            telegram_session = user.telegram_session
        except TelegramSession.DoesNotExist:
            logger.warning(f"Cannot edit Telegram messages for post {post.id}: user {user.id} has no Telegram session.")
            return {'status': 'FAILED', 'error': 'No Telegram session found for user.'}

        if not telegram_session.is_authenticated or not telegram_session.encrypted_session_string:
            logger.warning(f"Cannot edit Telegram messages for post {post.id}: Telegram session not authenticated.")
            return {'status': 'FAILED', 'error': 'Telegram session not authenticated.'}

        try:
            return run_async(
                cls._async_edit_in_channels(
                    session_encrypted=telegram_session.encrypted_session_string,
                    post=post,
                    targets=targets
                )
            )
        except Exception as exc:
            logger.exception(f"Unexpected error during remote Telegram editing for post {post.id}: {str(exc)}")
            return {'status': 'FAILED', 'error': str(exc)}

    @classmethod
    async def _async_edit_in_channels(
        cls,
        session_encrypted: str,
        post: Post,
        targets: List[PostChannelTarget]
    ) -> Dict[str, Any]:
        edited_count = 0
        failed_count = 0
        channel_errors: Dict[str, str] = {}

        parse_mode = None
        if post.formatting_mode == Post.FormattingMode.HTML:
            parse_mode = 'html'
        elif post.formatting_mode == Post.FormattingMode.MARKDOWN:
            parse_mode = 'md'

        async with telethon_client_context(
            session_string=session_encrypted,
            is_encrypted=True
        ) as client:
            if not await client.is_user_authorized():
                logger.warning("Telethon client not authorized during edit operation.")
                return {'status': 'FAILED', 'error': 'Telethon session is not authorized.'}

            for target in targets:
                channel = target.channel
                msg_id = target.telegram_message_id
                if not msg_id:
                    continue

                try:
                    if channel.access_hash:
                        peer = InputPeerChannel(channel.telegram_channel_id, channel.access_hash)
                    elif channel.username:
                        peer = channel.username
                    else:
                        peer = channel.telegram_channel_id

                    logger.info(f"Editing message {msg_id} in channel {channel.title} ({channel.telegram_channel_id})...")
                    edited_msg = await client.edit_message(
                        peer,
                        message=msg_id,
                        text=post.text_content or "",
                        parse_mode=parse_mode,
                        link_preview=not post.disable_web_page_preview
                    )
                    if post.pin_message:
                        try:
                            if hasattr(edited_msg, 'pin') and callable(getattr(edited_msg, 'pin')):
                                await edited_msg.pin(notify=not post.silent)
                            else:
                                await client.pin_message(peer, message=msg_id, notify=not post.silent)
                            logger.info(f"Successfully pinned edited message {msg_id} in channel {channel.title}.")
                        except Exception as pin_exc:
                            logger.warning(f"Could not pin edited message {msg_id} in channel {channel.title}: {pin_exc}")
                    edited_count += 1
                    logger.info(f"Successfully edited message {msg_id} in channel {channel.title}.")
                except Exception as exc:
                    failed_count += 1
                    channel_errors[channel.title or str(channel.id)] = str(exc)
                    logger.warning(
                        f"Failed to edit message {msg_id} in channel {channel.title} ({channel.id}): {str(exc)}"
                    )

        return {
            'status': 'SUCCESS' if failed_count == 0 else 'PARTIAL_SUCCESS' if edited_count > 0 else 'FAILED',
            'edited_count': edited_count,
            'failed_count': failed_count,
            'errors': channel_errors
        }

