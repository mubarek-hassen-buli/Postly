import logging
from typing import Any, Dict, Optional
from telethon.errors import (
    FloodWaitError,
    PasswordHashInvalidError,
    PhoneCodeEmptyError,
    PhoneCodeExpiredError,
    PhoneCodeHashEmptyError,
    PhoneCodeInvalidError,
    PhoneNumberBannedError,
    PhoneNumberInvalidError,
    PhoneNumberUnoccupiedError,
    SessionPasswordNeededError,
)
from telethon.tl.types import User as TelethonUser

from .client import run_async, telethon_client_context
from .crypto import decrypt_session_string, encrypt_session_string

logger = logging.getLogger(__name__)


class TelegramServiceError(Exception):
    """Base exception for Telegram service operations."""
    default_code = "TELEGRAM_SERVICE_ERROR"

    def __init__(self, message: str, code: Optional[str] = None, details: Optional[Any] = None) -> None:
        super().__init__(message)
        self.message = message
        self.code = code or self.default_code
        self.details = details


class TelegramAuthService:
    """
    High-level service interface for Telegram MTProto authentication lifecycle.
    Manages phone code requests, OTP verification, 2FA cloud password authentication,
    and Fernet-encrypted session serialization.
    """

    @classmethod
    def send_code(cls, phone_number: str) -> Dict[str, Any]:
        """
        Initiates Telegram MTProto login flow by sending an authentication code
        (via Telegram app or SMS).
        """
        return run_async(cls._async_send_code(phone_number))

    @classmethod
    async def _async_send_code(cls, phone_number: str) -> Dict[str, Any]:
        phone_number = phone_number.strip().replace(' ', '').replace('-', '')
        logger.info(f"Initiating Telegram send_code for phone: {phone_number[:5]}***")

        try:
            async with telethon_client_context() as client:
                sent_code = await client.send_code_request(phone_number)
                temp_raw_session = client.session.save()
                temp_encrypted_session = encrypt_session_string(temp_raw_session)

                return {
                    'phone_code_hash': sent_code.phone_code_hash,
                    'temp_session': temp_encrypted_session,
                    'type': type(sent_code.type).__name__,
                    'timeout': getattr(sent_code, 'timeout', 60),
                }

        except PhoneNumberInvalidError as exc:
            raise TelegramServiceError(
                "The phone number provided is invalid.",
                code="PHONE_NUMBER_INVALID"
            ) from exc
        except PhoneNumberBannedError as exc:
            raise TelegramServiceError(
                "This phone number has been banned from Telegram.",
                code="PHONE_NUMBER_BANNED"
            ) from exc
        except FloodWaitError as exc:
            raise TelegramServiceError(
                f"Too many attempts. Telegram requires you to wait {exc.seconds} seconds.",
                code="FLOOD_WAIT",
                details={'retry_after_seconds': exc.seconds}
            ) from exc
        except Exception as exc:
            logger.exception(f"Unexpected error in Telegram send_code: {str(exc)}")
            raise TelegramServiceError(
                f"Failed to communicate with Telegram: {str(exc)}",
                code="TELEGRAM_COMMUNICATION_ERROR"
            ) from exc

    @classmethod
    def verify_code(
        cls,
        phone_number: str,
        code: str,
        phone_code_hash: str,
        temp_session_encrypted: str
    ) -> Dict[str, Any]:
        """
        Verifies the received Telegram OTP login code.
        """
        return run_async(cls._async_verify_code(
            phone_number=phone_number,
            code=code,
            phone_code_hash=phone_code_hash,
            temp_session_encrypted=temp_session_encrypted
        ))

    @classmethod
    async def _async_verify_code(
        cls,
        phone_number: str,
        code: str,
        phone_code_hash: str,
        temp_session_encrypted: str
    ) -> Dict[str, Any]:
        phone_number = phone_number.strip().replace(' ', '').replace('-', '')
        code = str(code).strip()

        try:
            async with telethon_client_context(
                session_string=temp_session_encrypted,
                is_encrypted=True
            ) as client:
                try:
                    telethon_user = await client.sign_in(
                        phone=phone_number,
                        code=code,
                        phone_code_hash=phone_code_hash
                    )
                except SessionPasswordNeededError:
                    # 2FA Cloud Password is required
                    updated_temp_raw = client.session.save()
                    updated_temp_encrypted = encrypt_session_string(updated_temp_raw)
                    return {
                        'status': 'PENDING_PASSWORD',
                        'temp_session': updated_temp_encrypted,
                        'message': 'Two-Factor Authentication (2FA) cloud password required.'
                    }

                # Authentication succeeded
                if not isinstance(telethon_user, TelethonUser):
                    telethon_user = await client.get_me()

                final_raw_session = client.session.save()
                final_encrypted_session = encrypt_session_string(final_raw_session)

                return {
                    'status': 'AUTHENTICATED',
                    'encrypted_session': final_encrypted_session,
                    'telegram_user': {
                        'id': telethon_user.id,
                        'first_name': telethon_user.first_name or '',
                        'last_name': telethon_user.last_name or '',
                        'username': telethon_user.username or '',
                        'phone': telethon_user.phone or phone_number,
                    }
                }

        except (PhoneCodeInvalidError, PhoneCodeEmptyError, PhoneCodeHashEmptyError) as exc:
            raise TelegramServiceError(
                "The Telegram confirmation code is invalid.",
                code="PHONE_CODE_INVALID"
            ) from exc
        except PhoneCodeExpiredError as exc:
            raise TelegramServiceError(
                "The confirmation code has expired. Please request a new code.",
                code="PHONE_CODE_EXPIRED"
            ) from exc
        except PhoneNumberUnoccupiedError as exc:
            raise TelegramServiceError(
                "No Telegram account found with this phone number.",
                code="PHONE_UNREGISTERED"
            ) from exc
        except FloodWaitError as exc:
            raise TelegramServiceError(
                f"Too many attempts. Telegram requires you to wait {exc.seconds} seconds.",
                code="FLOOD_WAIT",
                details={'retry_after_seconds': exc.seconds}
            ) from exc
        except TelegramServiceError:
            raise
        except Exception as exc:
            logger.exception(f"Unexpected error in Telegram verify_code: {str(exc)}")
            raise TelegramServiceError(
                f"Verification failed: {str(exc)}",
                code="VERIFICATION_ERROR"
            ) from exc

    @classmethod
    def verify_password(cls, password: str, temp_session_encrypted: str) -> Dict[str, Any]:
        """
        Submits the user's 2FA cloud password to complete MTProto authentication.
        """
        return run_async(cls._async_verify_password(
            password=password,
            temp_session_encrypted=temp_session_encrypted
        ))

    @classmethod
    async def _async_verify_password(cls, password: str, temp_session_encrypted: str) -> Dict[str, Any]:
        try:
            async with telethon_client_context(
                session_string=temp_session_encrypted,
                is_encrypted=True
            ) as client:
                telethon_user = await client.sign_in(password=password)

                if not isinstance(telethon_user, TelethonUser):
                    telethon_user = await client.get_me()

                final_raw_session = client.session.save()
                final_encrypted_session = encrypt_session_string(final_raw_session)

                return {
                    'status': 'AUTHENTICATED',
                    'encrypted_session': final_encrypted_session,
                    'telegram_user': {
                        'id': telethon_user.id,
                        'first_name': telethon_user.first_name or '',
                        'last_name': telethon_user.last_name or '',
                        'username': telethon_user.username or '',
                        'phone': telethon_user.phone or '',
                    }
                }

        except PasswordHashInvalidError as exc:
            raise TelegramServiceError(
                "The 2FA cloud password provided is incorrect.",
                code="PASSWORD_INVALID"
            ) from exc
        except FloodWaitError as exc:
            raise TelegramServiceError(
                f"Too many attempts. Telegram requires you to wait {exc.seconds} seconds.",
                code="FLOOD_WAIT",
                details={'retry_after_seconds': exc.seconds}
            ) from exc
        except TelegramServiceError:
            raise
        except Exception as exc:
            logger.exception(f"Unexpected error in Telegram verify_password: {str(exc)}")
            raise TelegramServiceError(
                f"2FA verification failed: {str(exc)}",
                code="2FA_ERROR"
            ) from exc

    @classmethod
    def get_me_from_session(cls, encrypted_session: str) -> Optional[Dict[str, Any]]:
        """
        Validates the encrypted Telegram session and retrieves current user profile data.
        """
        return run_async(cls._async_get_me(encrypted_session))

    @classmethod
    async def _async_get_me(cls, encrypted_session: str) -> Optional[Dict[str, Any]]:
        try:
            async with telethon_client_context(
                session_string=encrypted_session,
                is_encrypted=True
            ) as client:
                if not await client.is_user_authorized():
                    return None
                me = await client.get_me()
                if not me:
                    return None
                return {
                    'id': me.id,
                    'first_name': me.first_name or '',
                    'last_name': me.last_name or '',
                    'username': me.username or '',
                    'phone': me.phone or '',
                }
        except Exception as exc:
            logger.warning(f"Failed to fetch Telegram user info from session: {str(exc)}")
            return None

    @classmethod
    def logout_session(cls, encrypted_session: str) -> bool:
        """
        Terminates the Telegram MTProto session on Telegram's servers.
        """
        return run_async(cls._async_logout(encrypted_session))

    @classmethod
    async def _async_logout(cls, encrypted_session: str) -> bool:
        try:
            async with telethon_client_context(
                session_string=encrypted_session,
                is_encrypted=True
            ) as client:
                if await client.is_user_authorized():
                    await client.log_out()
                return True
        except Exception as exc:
            logger.warning(f"Error logging out Telegram session: {str(exc)}")
            return False
