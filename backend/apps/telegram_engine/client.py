import asyncio
from contextlib import asynccontextmanager
import logging
from typing import Any, AsyncGenerator, Coroutine, Optional, TypeVar
from django.conf import settings
from telethon import TelegramClient
from telethon.sessions import StringSession

from .crypto import decrypt_session_string

logger = logging.getLogger(__name__)

T = TypeVar('T')


class TelegramConfigurationError(Exception):
    """Raised when Telegram API ID or API Hash is not configured."""
    pass


def get_telegram_credentials() -> tuple[int, str]:
    """Retrieves and validates Telegram API ID and Hash from settings."""
    api_id = getattr(settings, 'TELEGRAM_API_ID', None)
    api_hash = getattr(settings, 'TELEGRAM_API_HASH', None)

    if not api_id or not api_hash:
        raise TelegramConfigurationError(
            "TELEGRAM_API_ID and TELEGRAM_API_HASH must be configured in settings."
        )

    try:
        api_id_int = int(api_id)
    except (ValueError, TypeError) as exc:
        raise TelegramConfigurationError(f"Invalid TELEGRAM_API_ID: {api_id}") from exc

    return api_id_int, str(api_hash)


@asynccontextmanager
async def telethon_client_context(
    session_string: Optional[str] = None,
    is_encrypted: bool = False,
    timeout: int = 15
) -> AsyncGenerator[TelegramClient, None]:
    """
    Asynchronous context manager that initializes a Telethon TelegramClient with a StringSession,
    connects to Telegram MTProto data centers, yields the client for operations, and guarantees
    graceful disconnection upon exit.
    """
    api_id, api_hash = get_telegram_credentials()

    raw_session = ""
    if session_string:
        if is_encrypted:
            raw_session = decrypt_session_string(session_string)
        else:
            raw_session = session_string

    session = StringSession(raw_session)
    client = TelegramClient(session, api_id, api_hash)

    try:
        await asyncio.wait_for(client.connect(), timeout=timeout)
        yield client
    finally:
        try:
            if client.is_connected():
                await client.disconnect()
        except Exception as exc:
            logger.warning(f"Error during Telethon client disconnect: {str(exc)}")


def run_async(coro: Coroutine[Any, Any, T]) -> T:
    """
    Safely executes an asynchronous coroutine from synchronous Django views or Celery workers.
    Creates an isolated event loop per execution to avoid interference with any existing loops.
    """
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = None

    if loop and loop.is_running():
        # If already running inside an active event loop, run in a separate thread
        import concurrent.futures
        with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
            future = executor.submit(lambda: asyncio.run(coro))
            return future.result()
    else:
        return asyncio.run(coro)
