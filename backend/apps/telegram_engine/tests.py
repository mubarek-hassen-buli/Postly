from cryptography.fernet import Fernet
from django.test import TestCase, override_settings

from apps.telegram_engine.crypto import (
    DecryptionError,
    EncryptionKeyMissingError,
    decrypt_session_string,
    encrypt_session_string,
)


class TelegramCryptoTests(TestCase):
    """Unit tests for Telegram session string encryption and decryption."""

    def setUp(self) -> None:
        self.sample_session = "1BVtsOMQBu7...SampleTelethonStringSessionData...XYZ=="
        self.test_key = Fernet.generate_key().decode('utf-8')

    def test_encryption_and_decryption_cycle(self) -> None:
        with override_settings(TELEGRAM_SESSION_ENCRYPTION_KEY=self.test_key):
            encrypted = encrypt_session_string(self.sample_session)
            self.assertNotEqual(encrypted, self.sample_session)
            self.assertIsInstance(encrypted, str)

            decrypted = decrypt_session_string(encrypted)
            self.assertEqual(decrypted, self.sample_session)

    def test_decryption_with_invalid_ciphertext_raises_error(self) -> None:
        with override_settings(TELEGRAM_SESSION_ENCRYPTION_KEY=self.test_key):
            invalid_ciphertext = "invalid-corrupted-cipher-text"
            with self.assertRaises(DecryptionError):
                decrypt_session_string(invalid_ciphertext)

    def test_missing_encryption_key_raises_error(self) -> None:
        with override_settings(TELEGRAM_SESSION_ENCRYPTION_KEY=None):
            with self.assertRaises(EncryptionKeyMissingError):
                encrypt_session_string(self.sample_session)
