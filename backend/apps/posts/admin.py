from django.contrib import admin
from .models import Post, PostChannelTarget, PostMediaAttachment


class PostChannelTargetInline(admin.TabularInline):
    model = PostChannelTarget
    extra = 0
    readonly_fields = ('channel', 'status', 'telegram_message_id', 'sent_at', 'error_message')


class PostMediaAttachmentInline(admin.TabularInline):
    model = PostMediaAttachment
    extra = 0
    readonly_fields = ('media_url', 'media_type', 'file_size', 'order')


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'user',
        'status',
        'scheduled_for',
        'published_at',
        'formatting_mode',
        'pin_message',
        'created_at',
    )
    list_filter = (
        'status',
        'formatting_mode',
        'pin_message',
        'scheduled_for',
        'created_at',
    )
    search_fields = (
        'id',
        'content',
        'user__phone_number',
        'celery_task_id',
    )
    readonly_fields = ('created_at', 'updated_at', 'published_at')
    inlines = [PostChannelTargetInline, PostMediaAttachmentInline]


@admin.register(PostChannelTarget)
class PostChannelTargetAdmin(admin.ModelAdmin):
    list_display = ('post', 'channel', 'status', 'telegram_message_id', 'sent_at')
    list_filter = ('status', 'sent_at')
    search_fields = ('post__id', 'channel__title', 'error_message')
