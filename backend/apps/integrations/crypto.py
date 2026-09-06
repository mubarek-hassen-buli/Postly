import base64
import hashlib
import logging
from cryptography.fernet import Fernet, InvalidToken
from django.conf import settings

logger = logging.getLogger(__name__)


class IntegrationCryptoError(Exception):
    """Base exception for OAuth token encryption/decryption errors."""
    pass


def _get_encryption_key() -> bytes:
    """
    Retrieves the 32-byte url-safe base64 Fernet key.
    Prefers TELEGRAM_SESSION_ENCRYPTION_KEY, with deterministic SHA-256 fallback derived from SECRET_KEY.
    """
    raw_key = getattr(settings, 'TELEGRAM_SESSION_ENCRYPTION_KEY', None)
    if raw_key:
        try:
            key_bytes = raw_key.encode('utf-8') if isinstance(raw_key, str) else raw_key
            # Validate key by testing Fernet instantiation
            Fernet(key_bytes)
            return key_bytes
        except Exception as exc:
            logger.warning(f"Configured encryption key is invalid Fernet key, falling back to derived key: {exc}")

    # Deterministic 32-byte key derived from Django SECRET_KEY
    secret_str = str(getattr(settings, 'SECRET_KEY', 'postly-secret-key-fallback') or 'postly-secret-key-fallback')
    secret = secret_str.encode('utf-8')
    derived = hashlib.sha256(secret).digest()
    return base64.urlsafe_b64encode(derived)


def encrypt_token(token: str) -> str:
    """
    Encrypts a plaintext token using Fernet (AES-128-CBC + HMAC-SHA256).
    Returns a URL-safe base64-encoded encrypted string.
    """
    if not token:
        return ""
    try:
        fernet = Fernet(_get_encryption_key())
        encrypted_bytes = fernet.encrypt(token.encode('utf-8'))
        return encrypted_bytes.decode('utf-8')
    except Exception as exc:
        logger.exception("Failed to encrypt OAuth token")
        raise IntegrationCryptoError(f"Token encryption failed: {str(exc)}") from exc


def decrypt_token(encrypted_token: str) -> str:
    """
    Decrypts an encrypted token back into its plaintext string.
    """
    if not encrypted_token:
        return ""
    try:
        fernet = Fernet(_get_encryption_key())
        decrypted_bytes = fernet.decrypt(encrypted_token.encode('utf-8'))
        return decrypted_bytes.decode('utf-8')
    except InvalidToken as exc:
        logger.error("Failed to decrypt OAuth token: InvalidToken or key mismatch.")
        raise IntegrationCryptoError("Token decryption failed due to invalid key or tampered ciphertext.") from exc
    except Exception as exc:
        logger.exception(f"Unexpected error decrypting token: {str(exc)}")
        raise IntegrationCryptoError(f"Token decryption failed: {str(exc)}") from exc
