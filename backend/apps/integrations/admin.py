from typing import Any
from django.contrib import admin, messages
from django.utils import timezone
from django.utils.html import format_html
from django.urls import reverse
from unfold.admin import ModelAdmin
from unfold.decorators import display, action
from unfold.enums import ActionVariant

from .models import LinkedInAccount


@admin.register(LinkedInAccount)
class LinkedInAccountAdmin(ModelAdmin):
    list_display = (
        'name',
        'user_link',
        'email',
        'linkedin_member_id',
        'status_badge',
        'token_valid_badge',
        'token_expires_at',
        'last_synced_at',
        'created_at',
    )
    list_filter = ('is_active', 'token_expires_at', 'created_at')
    search_fields = ('name', 'email', 'linkedin_member_id', 'user__phone_number')
    readonly_fields = ('id', 'created_at', 'updated_at', 'access_token_mask', 'refresh_token_mask')
    ordering = ('-created_at',)

    fieldsets = (
        ('Profile & Identity', {
            'fields': ('id', 'user', 'name', 'given_name', 'family_name', 'email', 'picture_url', 'linkedin_member_id')
        }),
        ('Integration Status', {
            'fields': ('is_active', 'scopes', 'token_expires_at', 'last_synced_at')
        }),
        ('Encrypted OAuth 2.0 Credentials', {
            'fields': ('access_token_mask', 'refresh_token_mask'),
            'description': 'Encrypted using AES-256 Fernet. Credentials are never decrypted in plain text.'
        }),
        ('Audit Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )

    actions = ['disconnect_linkedin_accounts', 'reconnect_linkedin_accounts']

    @display(description="User")
    def user_link(self, obj: LinkedInAccount) -> str:
        url = reverse("admin:accounts_user_change", args=[obj.user.pk])
        return format_html('<a href="{}" class="font-medium text-primary-600 hover:underline">{}</a>', url, obj.user.phone_number)

    @display(description="Integration Status", label={True: "success", False: "danger"})
    def status_badge(self, obj: LinkedInAccount) -> str:
        return "Connected" if obj.is_active else "Disconnected"

    @display(description="Token Active", boolean=True)
    def token_valid_badge(self, obj: LinkedInAccount) -> bool:
        return bool(obj.is_active and obj.token_expires_at and obj.token_expires_at > timezone.now())

    @display(description="Access Token (Masked)")
    def access_token_mask(self, obj: LinkedInAccount) -> str:
        if not obj.encrypted_access_token:
            return "No token"
        return f"AES-256: {obj.encrypted_access_token[:12]}...{obj.encrypted_access_token[-8:]} ({len(obj.encrypted_access_token)} chars)"

    @display(description="Refresh Token (Masked)")
    def refresh_token_mask(self, obj: LinkedInAccount) -> str:
        if not obj.encrypted_refresh_token:
            return "No refresh token"
        return f"AES-256: {obj.encrypted_refresh_token[:12]}...{obj.encrypted_refresh_token[-8:]} ({len(obj.encrypted_refresh_token)} chars)"

    @action(description="Disconnect Selected LinkedIn Integrations", variant=ActionVariant.DANGER)
    def disconnect_linkedin_accounts(self, request: Any, queryset: Any) -> None:
        count = queryset.update(
            is_active=False,
            encrypted_access_token="",
            encrypted_refresh_token=None,
        )
        self.message_user(
            request,
            f"Successfully disconnected and cleared OAuth credentials for {count} LinkedIn integration(s).",
            messages.WARNING
        )

    @action(description="Reactivate LinkedIn Integration Flag")
    def reconnect_linkedin_accounts(self, request: Any, queryset: Any) -> None:
        count = queryset.update(is_active=True)
        self.message_user(request, f"Reactivated {count} LinkedIn integration record(s).", messages.SUCCESS)

