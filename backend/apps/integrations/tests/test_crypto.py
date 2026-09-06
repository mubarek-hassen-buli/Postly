from django.test import TestCase
from apps.integrations.crypto import (
    IntegrationCryptoError,
    decrypt_token,
    encrypt_token,
)


class IntegrationCryptoTests(TestCase):
    def test_encrypt_and_decrypt_cycle(self):
        sample_token = "AQV123456_SampleLinkedInAccessToken_ABCXYZ"
        encrypted = encrypt_token(sample_token)

        self.assertIsInstance(encrypted, str)
        self.assertNotEqual(encrypted, sample_token)

        decrypted = decrypt_token(encrypted)
        self.assertEqual(decrypted, sample_token)

    def test_empty_token_returns_empty_string(self):
        self.assertEqual(encrypt_token(""), "")
        self.assertEqual(decrypt_token(""), "")

    def test_tampered_token_raises_error(self):
        sample_token = "valid_token_string"
        encrypted = encrypt_token(sample_token)
        tampered = encrypted[:-4] + "AAAA"

        with self.assertRaises(IntegrationCryptoError):
            decrypt_token(tampered)
