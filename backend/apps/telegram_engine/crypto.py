import logging
from cryptography.fernet import Fernet, InvalidToken
from django.conf import settings

logger = logging.getLogger(__name__)


class TelegramCryptoError(Exception):
    """Base exception for Telegram session crypto failures."""
    pass


class EncryptionKeyMissingError(TelegramCryptoError):
    """Raised when TELEGRAM_SESSION_ENCRYPTION_KEY is not configured."""
    pass


class DecryptionError(TelegramCryptoError):
    """Raised when session decryption fails due to invalid key or tampered ciphertext."""
    pass


def _get_fernet() -> Fernet:
    """Instantiates a Fernet cipher with the configured master key."""
    key = getattr(settings, 'TELEGRAM_SESSION_ENCRYPTION_KEY', None)
    if not key:
        raise EncryptionKeyMissingError(
            "TELEGRAM_SESSION_ENCRYPTION_KEY is not set in Django settings or environment."
        )
    try:
        # Ensure key is bytes
        if isinstance(key, str):
            key = key.encode('utf-8')
        return Fernet(key)
    except Exception as exc:
        raise EncryptionKeyMissingError(
            f"Invalid TELEGRAM_SESSION_ENCRYPTION_KEY format: {str(exc)}"
        ) from exc


def encrypt_session_string(session_string: str) -> str:
    """
    Encrypts a Telethon StringSession string using Fernet symmetric encryption (AES-CBC + HMAC-SHA256).
    Returns a URL-safe base64-encoded encrypted string suitable for database storage at rest.
    """
    if not session_string:
        return ""
    fernet = _get_fernet()
    encrypted_bytes = fernet.encrypt(session_string.encode('utf-8'))
    return encrypted_bytes.decode('utf-8')


def decrypt_session_string(encrypted_string: str) -> str:
    """
    Decrypts an encrypted session string back into the raw Telethon StringSession.
    Decrypts only in-memory during active client operations.
    """
    if not encrypted_string:
        return ""
    fernet = _get_fernet()
    try:
        decrypted_bytes = fernet.decrypt(encrypted_string.encode('utf-8'))
        return decrypted_bytes.decode('utf-8')
    except InvalidToken as exc:
        logger.error("Failed to decrypt Telegram session string: InvalidToken (key mismatch or corruption)")
        raise DecryptionError(
            "Failed to decrypt Telegram session. The encryption key may have changed or data is corrupted."
        ) from exc
    except Exception as exc:
        logger.error(f"Unexpected error decrypting Telegram session string: {str(exc)}")
        raise DecryptionError(f"Session decryption failed: {str(exc)}") from exc
