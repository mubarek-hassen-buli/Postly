import logging
import re
from typing import Any, Dict, List, Optional
from django.conf import settings
import requests

from .models import Device, NotificationLog

logger = logging.getLogger(__name__)

EXPO_PUSH_API_URL = "https://exp.host/--/api/v2/push/send"
EXPO_TOKEN_REGEX = re.compile(r'^(ExponentPushToken|ExpoPushToken)\[.*\]$')


def is_valid_expo_push_token(token: str) -> bool:
    """Validates if a string matches standard Expo push token patterns."""
    if not token or not isinstance(token, str):
        return False
    return bool(EXPO_TOKEN_REGEX.match(token.strip()))


class ExpoPushService:
    """
    Service responsible for packaging and dispatching push notifications
    to registered devices via the Expo Push Gateway.
    """

    @classmethod
    def send_notification_to_user(
        cls,
        user,
        title: str,
        body: str,
        event_type: str = NotificationLog.EventType.SYSTEM_ALERT,
        data: Optional[Dict[str, Any]] = None
    ) -> bool:
        """
        Logs a notification for the user and broadcasts push packets to all their active devices.
        """
        data = data or {}

        # Step 1: Create notification log in database
        log_entry = NotificationLog.objects.create(
            user=user,
            title=title,
            body=body,
            event_type=event_type,
            data=data,
            delivered=False
        )

        # Step 2: Fetch active device push tokens
        active_devices = list(Device.objects.filter(user=user, is_active=True))
        if not active_devices:
            logger.info(f"No active push devices registered for user {user.phone_number}. Logged notification {log_entry.id}.")
            return False

        # Step 3: Prepare Expo Push messages
        messages = []
        for device in active_devices:
            if is_valid_expo_push_token(device.expo_push_token):
                messages.append({
                    'to': device.expo_push_token,
                    'sound': 'default',
                    'title': title,
                    'body': body,
                    'data': {**data, 'event_type': event_type, 'notification_id': str(log_entry.id)},
                    'priority': 'high',
                    'channelId': 'default',
                })

        if not messages:
            return False

        headers = {
            'Accept': 'application/json',
            'Accept-Encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
        }

        expo_access_token = getattr(settings, 'EXPO_ACCESS_TOKEN', None)
        if expo_access_token:
            headers['Authorization'] = f'Bearer {expo_access_token}'

        # Step 4: Dispatch to Expo Push Gateway
        try:
            response = requests.post(
                EXPO_PUSH_API_URL,
                json=messages,
                headers=headers,
                timeout=10
            )

            if response.status_code == 200:
                response_data = response.json()
                tickets = response_data.get('data', [])

                delivered = False
                for idx, ticket in enumerate(tickets):
                    ticket_status = ticket.get('status')
                    if ticket_status == 'ok':
                        delivered = True
                    elif ticket_status == 'error':
                        error_code = ticket.get('details', {}).get('error')
                        if error_code == 'DeviceNotRegistered' and idx < len(active_devices):
                            # Mark dead token as inactive
                            device_to_disable = active_devices[idx]
                            device_to_disable.is_active = False
                            device_to_disable.save(update_fields=['is_active'])
                            logger.info(f"Deactivated unregistered Expo device token for device {device_to_disable.id}")

                log_entry.delivered = delivered
                log_entry.save(update_fields=['delivered'])
                return delivered
            else:
                logger.warning(f"Expo push API returned status {response.status_code}: {response.text}")
                return False

        except Exception as exc:
            logger.exception(f"Error dispatching Expo push notification: {str(exc)}")
            return False
