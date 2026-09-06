import uuid
from typing import TYPE_CHECKING, Any, Optional
from django.conf import settings
from django.db import models
from django.utils import timezone
from .crypto import decrypt_token, encrypt_token


class LinkedInAccount(models.Model):
    """
    Represents an authenticated LinkedIn member account connected to a Postly user.
    Stores OpenID Connect identity profile information and encrypted OAuth 2.0 credentials.
    """
    if TYPE_CHECKING:
        objects: Any
        DoesNotExist: Any
        user_id: Any
        linkedin_member_id: str
        name: str
        given_name: str
        family_name: str
        email: Optional[str]
        picture_url: Optional[str]
        encrypted_access_token: str
        encrypted_refresh_token: Optional[str]
        token_expires_at: Any
        scopes: str
        is_active: bool
        last_synced_at: Any
        created_at: Any
        updated_at: Any

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text="Globally unique identifier for the LinkedIn integration record."
    )
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='linkedin_account',
        db_index=True,
        help_text="The Postly user who owns this connected LinkedIn account."
    )
    linkedin_member_id = models.CharField(
        max_length=128,
        db_index=True,
        help_text="LinkedIn OpenID 'sub' or Member ID (e.g. urn:li:person:xyz or sub string)."
    )
    name = models.CharField(
        max_length=255,
        blank=True,
        default="",
        help_text="Full display name from LinkedIn OpenID profile."
    )
    given_name = models.CharField(
        max_length=150,
        blank=True,
        default="",
        help_text="First name from LinkedIn OpenID profile."
    )
    family_name = models.CharField(
        max_length=150,
        blank=True,
        default="",
        help_text="Last name from LinkedIn OpenID profile."
    )
    email = models.EmailField(
        blank=True,
        null=True,
        help_text="Verified email address associated with the LinkedIn profile."
    )
    picture_url = models.URLField(
        max_length=500,
        blank=True,
        null=True,
        help_text="Public profile picture URL from LinkedIn."
    )

    # Encrypted OAuth 2.0 Tokens (Fernet AES-256)
    encrypted_access_token = models.TextField(
        help_text="AES-256 Fernet encrypted OAuth 2.0 access token."
    )
    encrypted_refresh_token = models.TextField(
        blank=True,
        null=True,
        help_text="AES-256 Fernet encrypted OAuth 2.0 refresh token (if granted)."
    )
    token_expires_at = models.DateTimeField(
        help_text="UTC timestamp when the current access token expires."
    )
    scopes = models.CharField(
        max_length=255,
        default="openid profile email w_member_social",
        help_text="Granted OAuth scopes."
    )
    is_active = models.BooleanField(
        default=True,
        db_index=True,
        help_text="Indicates whether this integration is active and available for publishing."
    )
    last_synced_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Timestamp when profile details were last refreshed from LinkedIn."
    )

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = models.Manager()

    class Meta:
        db_table = 'postly_linkedin_accounts'
        verbose_name = 'LinkedIn Account'
        verbose_name_plural = 'LinkedIn Accounts'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['linkedin_member_id']),
        ]

    def __str__(self) -> str:
        user_ident = getattr(self, 'user_id', None) or getattr(self.user, 'id', '')
        member_id = str(self.linkedin_member_id or '')
        display_name = str(self.name or member_id)
        return f"LinkedInAccount({display_name} - User: {user_ident})"

    def set_access_token(self, token: str) -> None:
        """Encrypts and sets the access token."""
        self.encrypted_access_token = encrypt_token(token)

    def get_access_token(self) -> str:
        """Decrypts and returns the raw access token."""
        return decrypt_token(str(self.encrypted_access_token or ''))

    def set_refresh_token(self, token: str) -> None:
        """Encrypts and sets the refresh token."""
        self.encrypted_refresh_token = encrypt_token(token) if token else None

    def get_refresh_token(self) -> str:
        """Decrypts and returns the raw refresh token if available."""
        if not self.encrypted_refresh_token:
            return ""
        return decrypt_token(str(self.encrypted_refresh_token))

    @property
    def is_token_expired(self) -> bool:
        """Checks whether the access token has passed its expiration time."""
        if not self.token_expires_at:
            return True
        return timezone.now() >= self.token_expires_at

    @property
    def person_urn(self) -> str:
        """
        Constructs a valid LinkedIn Person URN for API v2 / REST posts.
        Ensures 'urn:li:person:' prefix is consistently present.
        """
        member_id = str(self.linkedin_member_id or '')
        if not member_id:
            return ""
        if member_id.startswith("urn:li:"):
            return member_id
        return f"urn:li:person:{member_id}"
