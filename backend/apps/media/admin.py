from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from unfold.admin import ModelAdmin
from unfold.decorators import display

from .models import UploadedMedia


@admin.register(UploadedMedia)
class UploadedMediaAdmin(ModelAdmin):
    list_display = (
        'thumbnail_preview',
        'file_name',
        'user_link',
        'type_badge',
        'size_formatted',
        'format',
        'public_id',
        'created_at',
    )
    list_filter = ('media_type', 'format', 'created_at')
    search_fields = ('file_name', 'public_id', 'user__phone_number')
    readonly_fields = ('id', 'created_at', 'updated_at', 'thumbnail_detail')
    ordering = ('-created_at',)

    fieldsets = (
        ('File Asset Information', {
            'fields': ('id', 'user', 'file_name', 'media_url', 'media_type', 'format', 'size_formatted', 'public_id')
        }),
        ('Asset Preview', {
            'fields': ('thumbnail_detail',)
        }),
        ('Audit Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )

    @display(description="Preview")
    def thumbnail_preview(self, obj: UploadedMedia) -> str:
        if obj.media_type == UploadedMedia.MediaType.IMAGE and obj.media_url:
            return format_html(
                '<img src="{}" style="height: 36px; width: 36px; object-fit: cover; border-radius: 6px; border: 1px solid rgba(0,0,0,0.1);" />',
                obj.media_url
            )
        return format_html('<span class="text-xs px-2 py-1 bg-base-100 dark:bg-base-800 rounded font-mono">{}</span>', obj.media_type)

    @display(description="Enlarged Preview")
    def thumbnail_detail(self, obj: UploadedMedia) -> str:
        if obj.media_type == UploadedMedia.MediaType.IMAGE and obj.media_url:
            return format_html(
                '<img src="{}" style="max-height: 240px; border-radius: 8px; border: 1px solid rgba(0,0,0,0.15);" />',
                obj.media_url
            )
        return "Preview only available for image assets."

    @display(description="User")
    def user_link(self, obj: UploadedMedia) -> str:
        url = reverse("admin:accounts_user_change", args=[obj.user.pk])
        return format_html('<a href="{}" class="font-medium text-primary-600 hover:underline">{}</a>', url, obj.user.phone_number)

    @display(
        description="Type",
        label={
            UploadedMedia.MediaType.IMAGE: "success",
            UploadedMedia.MediaType.VIDEO: "primary",
            UploadedMedia.MediaType.DOCUMENT: "info",
        }
    )
    def type_badge(self, obj: UploadedMedia) -> str:
        return obj.media_type

    @display(description="Size")
    def size_formatted(self, obj: UploadedMedia) -> str:
        if not obj.file_size:
            return "-"
        if obj.file_size >= 1024 * 1024:
            return f"{obj.file_size / (1024 * 1024):.1f} MB"
        return f"{obj.file_size / 1024:.0f} KB"
