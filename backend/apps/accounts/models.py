import uuid
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils.translation import gettext_lazy as _


class UserManager(BaseUserManager):
    """Custom user manager for phone-number-based Telegram user model."""

    def create_user(self, phone_number: str, password: str = None, **extra_fields):
        if not phone_number:
            raise ValueError("The Phone Number must be set")
        phone_number = phone_number.strip().replace(' ', '').replace('-', '')
        user = self.model(phone_number=phone_number, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, phone_number: str, password: str = None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get('is_superuser') is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(phone_number, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """Custom User model for Postly application."""
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text="Globally unique identifier."
    )
    phone_number = models.CharField(
        max_length=32,
        unique=True,
        db_index=True,
        help_text="E.164 formatted telephone number (e.g. +1234567890)"
    )
    username = models.CharField(
        max_length=150,
        blank=True,
        null=True,
        help_text="Telegram username (without @)"
    )
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    avatar_url = models.URLField(max_length=500, blank=True, null=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'phone_number'
    REQUIRED_FIELDS = []

    class Meta:
        db_table = 'postly_users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-created_at']

    def __str__(self) -> str:
        return self.phone_number or str(self.id)


class TelegramSession(models.Model):
    """
    Stores Telegram MTProto authorization session state.
    Session strings are encrypted at rest using Fernet (AES-CBC + HMAC-SHA256).
    """
    class AuthState(models.TextChoices):
        IDLE = 'IDLE', _('Idle')
        PENDING_CODE = 'PENDING_CODE', _('Pending Code Verification')
        PENDING_PASSWORD = 'PENDING_PASSWORD', _('Pending 2FA Cloud Password')
        AUTHENTICATED = 'AUTHENTICATED', _('Authenticated')
        REVOKED = 'REVOKED', _('Revoked')
        FAILED = 'FAILED', _('Authentication Failed')

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='telegram_session',
        help_text="The Postly user account linked to this Telegram session."
    )
    telegram_user_id = models.BigIntegerField(
        null=True,
        blank=True,
        db_index=True,
        help_text="Telegram User ID assigned by MTProto."
    )
    phone_number = models.CharField(
        max_length=32,
        db_index=True,
        help_text="Phone number associated with this Telegram account."
    )
    username = models.CharField(
        max_length=150,
        blank=True,
        null=True,
        help_text="Telegram username."
    )
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)

    # Encrypted session storage at rest
    encrypted_session_string = models.TextField(
        blank=True,
        null=True,
        help_text="Fernet AES-256 encrypted Telethon StringSession."
    )
    temp_encrypted_session = models.TextField(
        blank=True,
        null=True,
        help_text="Temporary Fernet encrypted session during OTP/2FA handshake."
    )
    phone_code_hash = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="Telegram phone code hash required to verify the OTP code."
    )

    auth_state = models.CharField(
        max_length=32,
        choices=AuthState.choices,
        default=AuthState.IDLE,
        db_index=True
    )
    is_authenticated = models.BooleanField(
        default=False,
        db_index=True,
        help_text="Indicates whether the Telegram MTProto session is currently valid and active."
    )
    last_synced_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Timestamp when channels/profile were last synchronized."
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'postly_telegram_sessions'
        verbose_name = 'Telegram Session'
        verbose_name_plural = 'Telegram Sessions'
        ordering = ['-updated_at']

    def __str__(self) -> str:
        return f"TelegramSession({self.phone_number} - {self.auth_state})"
