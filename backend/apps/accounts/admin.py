from typing import Any
from django.contrib import admin, messages
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from django.urls import reverse
from unfold.admin import ModelAdmin
from unfold.decorators import display, action
from unfold.enums import ActionVariant
from unfold.forms import AdminPasswordChangeForm, UserChangeForm, UserCreationForm

from .models import TelegramSession, User


@admin.register(User)
class UserAdmin(BaseUserAdmin, ModelAdmin):
    form = UserChangeForm
    add_form = UserCreationForm
    change_password_form = AdminPasswordChangeForm

    list_display = (
        'phone_number',
        'username',
        'name_display',
        'telegram_status',
        'linkedin_status',
        'channels_count',
        'broadcasts_count',
        'is_staff',
        'is_active',
        'created_at',
    )
    list_filter = ('is_staff', 'is_active', 'is_superuser', 'created_at')
    search_fields = ('phone_number', 'username', 'first_name', 'last_name')
    ordering = ('-created_at',)

    fieldsets = (
        (None, {'fields': ('phone_number', 'password')}),
        ('Personal Info', {'fields': ('username', 'first_name', 'last_name', 'avatar_url')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'created_at', 'updated_at')}),
    )
    readonly_fields = ('created_at', 'updated_at', 'last_login')

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('phone_number', 'first_name', 'last_name', 'password', 'is_staff', 'is_superuser'),
        }),
    )

    actions = ['deactivate_users_and_sessions', 'activate_users']

    @display(description="Full Name")
    def name_display(self, obj: User) -> str:
        name = f"{obj.first_name} {obj.last_name}".strip()
        return name if name else "-"

    @display(description="Telegram MTProto", boolean=True)
    def telegram_status(self, obj: User) -> bool:
        session = getattr(obj, 'telegram_session', None)
        return bool(session and session.is_authenticated)

    @display(description="LinkedIn", boolean=True)
    def linkedin_status(self, obj: User) -> bool:
        account = getattr(obj, 'linkedin_account', None)
        return bool(account and account.is_active)

    @display(description="Channels")
    def channels_count(self, obj: User) -> int:
        return obj.channels.count()

    @display(description="Broadcasts")
    def broadcasts_count(self, obj: User) -> int:
        return obj.posts.count()

    @action(description="Deactivate User & Invalidate Sessions", variant=ActionVariant.DANGER)
    def deactivate_users_and_sessions(self, request: Any, queryset: Any) -> None:
        updated = 0
        for user in queryset:
            user.is_active = False
            user.save(update_fields=['is_active', 'updated_at'])
            if hasattr(user, 'telegram_session'):
                session = user.telegram_session
                session.is_authenticated = False
                session.auth_state = TelegramSession.AuthState.REVOKED
                session.encrypted_session_string = None
                session.save(update_fields=['is_authenticated', 'auth_state', 'encrypted_session_string', 'updated_at'])
            if hasattr(user, 'linkedin_account'):
                linkedin = user.linkedin_account
                linkedin.is_active = False
                linkedin.save(update_fields=['is_active', 'updated_at'])
            updated += 1
        self.message_user(
            request,
            f"Successfully deactivated {updated} user(s) and invalidated all connected MTProto/OAuth sessions.",
            messages.WARNING
        )

    @action(description="Activate Selected Users")
    def activate_users(self, request: Any, queryset: Any) -> None:
        count = queryset.update(is_active=True)
        self.message_user(request, f"Activated {count} user account(s).", messages.SUCCESS)


@admin.register(TelegramSession)
class TelegramSessionAdmin(ModelAdmin):
    list_display = (
        'phone_number',
        'user_link',
        'telegram_user_id',
        'username',
        'auth_state_badge',
        'is_authenticated_badge',
        'session_mask',
        'last_synced_at',
        'updated_at',
    )
    list_filter = ('auth_state', 'is_authenticated', 'created_at', 'updated_at')
    search_fields = ('phone_number', 'username', 'telegram_user_id', 'user__phone_number')
    readonly_fields = ('created_at', 'updated_at', 'session_mask_detail', 'temp_session_mask_detail')
    ordering = ('-updated_at',)

    fieldsets = (
        ('Account Association', {
            'fields': ('user', 'phone_number', 'telegram_user_id', 'username', 'first_name', 'last_name')
        }),
        ('Authentication State', {
            'fields': ('auth_state', 'is_authenticated', 'phone_code_hash', 'last_synced_at')
        }),
        ('Encrypted Credentials (At Rest)', {
            'fields': ('session_mask_detail', 'temp_session_mask_detail'),
            'description': 'Cryptographically sealed credentials. Raw secrets are never rendered in plain text.'
        }),
        ('Audit Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )

    actions = ['revoke_selected_sessions', 'mark_for_reauthentication']

    @display(description="User")
    def user_link(self, obj: TelegramSession) -> str:
        url = reverse("admin:accounts_user_change", args=[obj.user.pk])
        return format_html('<a href="{}" class="font-medium text-primary-600 hover:underline">{}</a>', url, obj.user.phone_number)

    @display(
        description="Auth State",
        label={
            TelegramSession.AuthState.AUTHENTICATED: "success",
            TelegramSession.AuthState.PENDING_CODE: "warning",
            TelegramSession.AuthState.PENDING_PASSWORD: "warning",
            TelegramSession.AuthState.IDLE: "info",
            TelegramSession.AuthState.REVOKED: "danger",
            TelegramSession.AuthState.FAILED: "danger",
        }
    )
    def auth_state_badge(self, obj: TelegramSession) -> str:
        return obj.auth_state

    @display(description="Active", boolean=True)
    def is_authenticated_badge(self, obj: TelegramSession) -> bool:
        return obj.is_authenticated

    @display(description="Session Key")
    def session_mask(self, obj: TelegramSession) -> str:
        if not obj.encrypted_session_string:
            return "No Session"
        length = len(obj.encrypted_session_string)
        return f"{obj.encrypted_session_string[:8]}...{obj.encrypted_session_string[-6:]} ({length}B)"

    @display(description="Encrypted Telethon String")
    def session_mask_detail(self, obj: TelegramSession) -> str:
        if not obj.encrypted_session_string:
            return "No active session string stored."
        length = len(obj.encrypted_session_string)
        return f"AES-256 Fernet Encrypted: {obj.encrypted_session_string[:12]}...{obj.encrypted_session_string[-8:]} (Payload length: {length} chars)"

    @display(description="Temporary Handshake Session")
    def temp_session_mask_detail(self, obj: TelegramSession) -> str:
        if not obj.temp_encrypted_session:
            return "None (Handshake idle)"
        return f"Pending Handshake: {obj.temp_encrypted_session[:10]}... ({len(obj.temp_encrypted_session)} chars)"

    @action(description="Revoke Selected Sessions (Emergency Kill-Switch)", variant=ActionVariant.DANGER)
    def revoke_selected_sessions(self, request: Any, queryset: Any) -> None:
        count = 0
        for session in queryset:
            session.encrypted_session_string = None
            session.temp_encrypted_session = None
            session.phone_code_hash = None
            session.auth_state = TelegramSession.AuthState.REVOKED
            session.is_authenticated = False
            session.save(update_fields=[
                'encrypted_session_string',
                'temp_encrypted_session',
                'phone_code_hash',
                'auth_state',
                'is_authenticated',
                'updated_at',
            ])
            count += 1
        self.message_user(
            request,
            f"Successfully revoked {count} MTProto session(s). Session tokens were purged.",
            messages.WARNING
        )

    @action(description="Reset Session to IDLE for Re-authentication")
    def mark_for_reauthentication(self, request: Any, queryset: Any) -> None:
        count = queryset.update(
            auth_state=TelegramSession.AuthState.IDLE,
            is_authenticated=False,
            phone_code_hash=None,
            temp_encrypted_session=None,
        )
        self.message_user(request, f"Reset {count} session(s) to IDLE.", messages.INFO)
