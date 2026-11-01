import logging
from typing import Any
from django.contrib import admin, messages
from django.utils.html import format_html
from django.urls import reverse
from unfold.admin import ModelAdmin, TabularInline
from unfold.decorators import display, action
from unfold.enums import ActionVariant

from postly_core.celery import app as celery_app
from .models import Post, PostChannelTarget, PostMediaAttachment
from .services import TelegramPublishingService
from .tasks import publish_scheduled_post_task

logger = logging.getLogger(__name__)


class PostChannelTargetInline(TabularInline):
    model = PostChannelTarget
    extra = 0
    can_delete = False
    readonly_fields = ('channel_link', 'status_badge', 'telegram_message_id', 'sent_at', 'error_message')
    fields = ('channel_link', 'status_badge', 'telegram_message_id', 'sent_at', 'error_message')

    @display(description="Destination Channel")
    def channel_link(self, obj: PostChannelTarget) -> str:
        url = reverse("admin:channels_channel_change", args=[obj.channel.pk])
        return format_html('<a href="{}" class="font-medium text-primary-600 hover:underline">{}</a>', url, obj.channel.title)

    @display(
        description="Delivery Status",
        label={
            PostChannelTarget.TargetStatus.SUCCESS: "success",
            PostChannelTarget.TargetStatus.PENDING: "warning",
            PostChannelTarget.TargetStatus.FAILED: "danger",
        }
    )
    def status_badge(self, obj: PostChannelTarget) -> str:
        return obj.status


class PostMediaAttachmentInline(TabularInline):
    model = PostMediaAttachment
    extra = 0
    can_delete = True
    readonly_fields = ('thumbnail_preview', 'file_size_formatted', 'created_at')
    fields = ('thumbnail_preview', 'media_url', 'media_type', 'file_size_formatted', 'order')

    @display(description="Preview")
    def thumbnail_preview(self, obj: PostMediaAttachment) -> str:
        if obj.media_type == PostMediaAttachment.MediaType.IMAGE and obj.media_url:
            return format_html(
                '<img src="{}" style="height: 38px; width: 38px; object-fit: cover; border-radius: 6px; border: 1px solid rgba(0,0,0,0.1);" />',
                obj.media_url
            )
        return format_html(
            '<span class="text-xs px-2 py-1 bg-base-100 dark:bg-base-800 rounded font-mono">{}</span>',
            obj.media_type
        )

    @display(description="Size")
    def file_size_formatted(self, obj: PostMediaAttachment) -> str:
        if not obj.file_size:
            return "-"
        if obj.file_size >= 1024 * 1024:
            return f"{obj.file_size / (1024 * 1024):.1f} MB"
        return f"{obj.file_size / 1024:.0f} KB"


@admin.register(Post)
class PostAdmin(ModelAdmin):
    list_display = (
        'id_short',
        'user_link',
        'content_snippet',
        'status_badge',
        'targets_summary',
        'scheduled_for',
        'published_at',
        'pin_badge',
        'linkedin_badge',
        'created_at',
    )
    list_filter = (
        'status',
        'formatting_mode',
        'pin_message',
        'post_to_linkedin',
        'scheduled_for',
        'created_at',
    )
    search_fields = (
        'id',
        'text_content',
        'user__phone_number',
        'celery_task_id',
    )
    readonly_fields = ('id', 'created_at', 'updated_at', 'published_at', 'celery_task_id')
    inlines = [PostChannelTargetInline, PostMediaAttachmentInline]
    ordering = ('-created_at',)

    fieldsets = (
        ('Broadcast Identification', {
            'fields': ('id', 'user', 'status', 'formatting_mode')
        }),
        ('Message Content', {
            'fields': ('text_content',)
        }),
        ('Delivery Options & Scheduling', {
            'fields': (
                'silent',
                'disable_web_page_preview',
                'pin_message',
                'post_to_linkedin',
                'scheduled_for',
                'published_at',
                'celery_task_id',
            )
        }),
        ('Error Summary & Observability', {
            'fields': ('error_summary', 'linkedin_post_urn')
        }),
        ('Audit Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )

    actions = [
        'retry_failed_broadcasts',
        'cancel_scheduled_broadcasts',
        'emergency_remote_delete',
    ]

    @display(description="Post ID")
    def id_short(self, obj: Post) -> str:
        return f"{str(obj.id)[:8]}..."

    @display(description="Author")
    def user_link(self, obj: Post) -> str:
        url = reverse("admin:accounts_user_change", args=[obj.user.pk])
        return format_html('<a href="{}" class="font-medium text-primary-600 hover:underline">{}</a>', url, obj.user.phone_number)

    @display(description="Message Body")
    def content_snippet(self, obj: Post) -> str:
        text = obj.text_content or ""
        snippet = (text[:45] + "...") if len(text) > 45 else text
        return snippet or "(Empty Message)"

    @display(
        description="Broadcast Status",
        label={
            Post.PostStatus.PUBLISHED: "success",
            Post.PostStatus.SCHEDULED: "primary",
            Post.PostStatus.PUBLISHING: "warning",
            Post.PostStatus.DRAFT: "info",
            Post.PostStatus.FAILED: "danger",
            Post.PostStatus.CANCELLED: "danger",
        }
    )
    def status_badge(self, obj: Post) -> str:
        return obj.status

    @display(description="Target Delivery")
    def targets_summary(self, obj: Post) -> str:
        targets = list(obj.targets.all())
        total = len(targets)
        if total == 0:
            return "No Channels"
        success = sum(1 for t in targets if t.status == PostChannelTarget.TargetStatus.SUCCESS)
        failed = sum(1 for t in targets if t.status == PostChannelTarget.TargetStatus.FAILED)
        if failed > 0:
            return format_html('<span class="text-red-500 font-semibold">{}/{} sent ({} err)</span>', success, total, failed)
        return format_html('<span class="text-emerald-600 font-semibold">{}/{} sent</span>', success, total)

    @display(description="Pin", boolean=True)
    def pin_badge(self, obj: Post) -> bool:
        return obj.pin_message

    @display(description="LinkedIn", boolean=True)
    def linkedin_badge(self, obj: Post) -> bool:
        return obj.post_to_linkedin

    @action(description="Retry Selected Broadcast Deliveries (Dispatch Now)")
    def retry_failed_broadcasts(self, request: Any, queryset: Any) -> None:
        dispatched = 0
        for post in queryset:
            # Reset failed target statuses to pending
            post.targets.filter(status=PostChannelTarget.TargetStatus.FAILED).update(
                status=PostChannelTarget.TargetStatus.PENDING,
                error_message=None
            )
            post.status = Post.PostStatus.PUBLISHING
            post.save(update_fields=['status', 'updated_at'])
            publish_scheduled_post_task.delay(str(post.id))
            dispatched += 1

        self.message_user(
            request,
            f"Queued retry publishing for {dispatched} broadcast(s) via background worker.",
            messages.SUCCESS
        )

    @action(description="Cancel Scheduled Broadcasts (Revoke Queue Task)", variant=ActionVariant.WARNING)
    def cancel_scheduled_broadcasts(self, request: Any, queryset: Any) -> None:
        cancelled = 0
        for post in queryset.filter(status=Post.PostStatus.SCHEDULED):
            if post.celery_task_id:
                try:
                    celery_app.control.revoke(post.celery_task_id, terminate=True)
                except Exception as exc:
                    logger.warning(f"Could not revoke Celery task {post.celery_task_id}: {exc}")
            post.status = Post.PostStatus.CANCELLED
            post.save(update_fields=['status', 'updated_at'])
            cancelled += 1

        self.message_user(
            request,
            f"Successfully cancelled {cancelled} scheduled broadcast(s) and revoked worker jobs.",
            messages.WARNING
        )

    @action(description="Emergency Remote Delete (Erase From Telegram)", variant=ActionVariant.DANGER)
    def emergency_remote_delete(self, request: Any, queryset: Any) -> None:
        deleted_count = 0
        failed_count = 0
        for post in queryset:
            try:
                result = TelegramPublishingService.delete_remote_telegram_messages(post)
                if result.get('deleted_count', 0) > 0:
                    deleted_count += result['deleted_count']
                if result.get('failed_count', 0) > 0:
                    failed_count += result['failed_count']
            except Exception as exc:
                logger.error(f"Error remote deleting post {post.id}: {exc}")
                failed_count += 1

            post.status = Post.PostStatus.CANCELLED
            post.save(update_fields=['status', 'updated_at'])

        self.message_user(
            request,
            f"Emergency Remote Delete completed: Erased {deleted_count} remote message(s) from Telegram ({failed_count} errors).",
            messages.INFO
        )


@admin.register(PostChannelTarget)
class PostChannelTargetAdmin(ModelAdmin):
    list_display = (
        'id_short',
        'post_link',
        'channel_link',
        'status_badge',
        'telegram_message_id',
        'sent_at',
        'error_summary',
    )
    list_filter = ('status', 'sent_at', 'created_at')
    search_fields = ('post__id', 'channel__title', 'error_message', 'telegram_message_id')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-created_at',)

    @display(description="Target ID")
    def id_short(self, obj: PostChannelTarget) -> str:
        return f"{str(obj.id)[:8]}..."

    @display(description="Post")
    def post_link(self, obj: PostChannelTarget) -> str:
        url = reverse("admin:posts_post_change", args=[obj.post.pk])
        return format_html('<a href="{}" class="font-medium text-primary-600 hover:underline">Post: {}</a>', url, str(obj.post.pk)[:8])

    @display(description="Channel")
    def channel_link(self, obj: PostChannelTarget) -> str:
        url = reverse("admin:channels_channel_change", args=[obj.channel.pk])
        return format_html('<a href="{}" class="font-medium text-primary-600 hover:underline">{}</a>', url, obj.channel.title)

    @display(
        description="Status",
        label={
            PostChannelTarget.TargetStatus.SUCCESS: "success",
            PostChannelTarget.TargetStatus.PENDING: "warning",
            PostChannelTarget.TargetStatus.FAILED: "danger",
        }
    )
    def status_badge(self, obj: PostChannelTarget) -> str:
        return obj.status

    @display(description="Error")
    def error_summary(self, obj: PostChannelTarget) -> str:
        if not obj.error_message:
            return "-"
        return (obj.error_message[:40] + "...") if len(obj.error_message) > 40 else obj.error_message
