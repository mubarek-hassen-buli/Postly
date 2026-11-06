# pyright: reportGeneralTypeIssues=none, reportAttributeAccessIssue=none, reportCallIssue=none
import logging
from typing import Any, cast
from django.db import transaction
from knox.models import AuthToken
from knox.views import LogoutAllView as KnoxLogoutAllView, LogoutView as KnoxLogoutView
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.telegram_engine.services import TelegramAuthService, TelegramServiceError
from .models import TelegramSession, User
from .serializers import (
    SendCodeRequestSerializer,
    UserSerializer,
    VerifyCodeRequestSerializer,
    VerifyPasswordRequestSerializer,
)

logger = logging.getLogger(__name__)


class SendCodeView(APIView):
    """
    Public endpoint to initiate Telegram MTProto login.
    Sends an OTP verification code to the user's Telegram app / SMS.
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs) -> Response:
        serializer = SendCodeRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        phone_number = serializer.validated_data['phone_number']

        try:
            result = TelegramAuthService.send_code(phone_number)
        except TelegramServiceError as exc:
            return Response(
                {
                    'error': {
                        'code': exc.code,
                        'message': exc.message,
                        'details': exc.details,
                    }
                },
                status=status.HTTP_400_BAD_REQUEST if exc.code != 'FLOOD_WAIT' else status.HTTP_429_TOO_MANY_REQUESTS
            )

        with cast(Any, transaction.atomic()):
            user, _ = User.objects.get_or_create(phone_number=phone_number)
            session, _ = TelegramSession.objects.get_or_create(
                user=user,
                defaults={'phone_number': phone_number}
            )

            session.phone_number = phone_number
            session.phone_code_hash = result['phone_code_hash']
            session.temp_encrypted_session = result['temp_session']
            session.auth_state = TelegramSession.AuthState.PENDING_CODE
            session.is_authenticated = False
            session.save(update_fields=[
                'phone_number',
                'phone_code_hash',
                'temp_encrypted_session',
                'auth_state',
                'is_authenticated',
                'updated_at',
            ])

        return Response(
            {
                'phone_number': phone_number,
                'phone_code_hash': result['phone_code_hash'],
                'auth_state': TelegramSession.AuthState.PENDING_CODE,
                'timeout': result.get('timeout', 60),
                'message': 'Verification code sent successfully to Telegram.'
            },
            status=status.HTTP_200_OK
        )


class VerifyCodeView(APIView):
    """
    Public endpoint to verify the received Telegram OTP code.
    If 2FA is required, transitions to PENDING_PASSWORD.
    If authenticated, returns a Knox authentication token and user profile.
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs) -> Response:
        serializer = VerifyCodeRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        phone_number = serializer.validated_data['phone_number']
        code = serializer.validated_data['code']
        phone_code_hash = serializer.validated_data.get('phone_code_hash')

        try:
            user = User.objects.get(phone_number=phone_number)
            session = user.telegram_session
        except (User.DoesNotExist, TelegramSession.DoesNotExist):
            return Response(
                {
                    'error': {
                        'code': 'SESSION_NOT_FOUND',
                        'message': 'No pending login session found for this phone number. Please request a new code.',
                        'details': None,
                    }
                },
                status=status.HTTP_404_NOT_FOUND
            )

        # Fallback to stored phone_code_hash if not explicitly provided in payload
        active_code_hash = phone_code_hash or session.phone_code_hash
        if not active_code_hash or not session.temp_encrypted_session:
            return Response(
                {
                    'error': {
                        'code': 'INVALID_SESSION_STATE',
                        'message': 'Session expired or missing code hash. Please request a new code.',
                        'details': None,
                    }
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            result = TelegramAuthService.verify_code(
                phone_number=phone_number,
                code=code,
                phone_code_hash=active_code_hash,
                temp_session_encrypted=session.temp_encrypted_session
            )
        except TelegramServiceError as exc:
            return Response(
                {
                    'error': {
                        'code': exc.code,
                        'message': exc.message,
                        'details': exc.details,
                    }
                },
                status=status.HTTP_400_BAD_REQUEST if exc.code != 'FLOOD_WAIT' else status.HTTP_429_TOO_MANY_REQUESTS
            )

        with cast(Any, transaction.atomic()):
            if result['status'] == 'PENDING_PASSWORD':
                session.auth_state = TelegramSession.AuthState.PENDING_PASSWORD
                session.temp_encrypted_session = result['temp_session']
                session.save(update_fields=['auth_state', 'temp_encrypted_session', 'updated_at'])

                return Response(
                    {
                        'status': 'PENDING_PASSWORD',
                        'auth_state': TelegramSession.AuthState.PENDING_PASSWORD,
                        'requires_password': True,
                        'phone_number': phone_number,
                        'message': result['message']
                    },
                    status=status.HTTP_200_OK
                )

            # Successfully authenticated
            telegram_user = result['telegram_user']
            session.encrypted_session_string = result['encrypted_session']
            session.temp_encrypted_session = None
            session.phone_code_hash = None
            session.auth_state = TelegramSession.AuthState.AUTHENTICATED
            session.is_authenticated = True
            session.telegram_user_id = telegram_user['id']
            session.username = telegram_user.get('username')
            session.first_name = telegram_user.get('first_name', '')
            session.last_name = telegram_user.get('last_name', '')
            session.save()

            if telegram_user.get('first_name'):
                user.first_name = telegram_user['first_name']
            if telegram_user.get('last_name'):
                user.last_name = telegram_user['last_name']
            if telegram_user.get('username'):
                user.username = telegram_user['username']
            user.save()

            # Generate Knox Token
            instance, token = AuthToken.objects.create(user=user)

            return Response(
                {
                    'status': 'AUTHENTICATED',
                    'auth_state': TelegramSession.AuthState.AUTHENTICATED,
                    'token': token,
                    'expiry': instance.expiry,
                    'user': UserSerializer(user).data,
                    'message': 'Successfully connected Telegram account and authenticated.'
                },
                status=status.HTTP_200_OK
            )


class VerifyPasswordView(APIView):
    """
    Public endpoint to verify user's Telegram Two-Factor Authentication (2FA) cloud password.
    On success, stores the encrypted session and returns a Knox token.
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs) -> Response:
        serializer = VerifyPasswordRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        phone_number = serializer.validated_data['phone_number']
        password = serializer.validated_data['password']

        try:
            user = User.objects.get(phone_number=phone_number)
            session = user.telegram_session
        except (User.DoesNotExist, TelegramSession.DoesNotExist):
            return Response(
                {
                    'error': {
                        'code': 'SESSION_NOT_FOUND',
                        'message': 'No pending 2FA login session found for this phone number.',
                        'details': None,
                    }
                },
                status=status.HTTP_404_NOT_FOUND
            )

        if session.auth_state != TelegramSession.AuthState.PENDING_PASSWORD or not session.temp_encrypted_session:
            return Response(
                {
                    'error': {
                        'code': 'INVALID_AUTH_STATE',
                        'message': 'Session is not awaiting 2FA password verification. Please start login again.',
                        'details': None,
                    }
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            result = TelegramAuthService.verify_password(
                password=password,
                temp_session_encrypted=session.temp_encrypted_session
            )
        except TelegramServiceError as exc:
            return Response(
                {
                    'error': {
                        'code': exc.code,
                        'message': exc.message,
                        'details': exc.details,
                    }
                },
                status=status.HTTP_400_BAD_REQUEST if exc.code != 'FLOOD_WAIT' else status.HTTP_429_TOO_MANY_REQUESTS
            )

        with cast(Any, transaction.atomic()):
            telegram_user = result['telegram_user']
            session.encrypted_session_string = result['encrypted_session']
            session.temp_encrypted_session = None
            session.phone_code_hash = None
            session.auth_state = TelegramSession.AuthState.AUTHENTICATED
            session.is_authenticated = True
            session.telegram_user_id = telegram_user['id']
            session.username = telegram_user.get('username')
            session.first_name = telegram_user.get('first_name', '')
            session.last_name = telegram_user.get('last_name', '')
            session.save()

            if telegram_user.get('first_name'):
                user.first_name = telegram_user['first_name']
            if telegram_user.get('last_name'):
                user.last_name = telegram_user['last_name']
            if telegram_user.get('username'):
                user.username = telegram_user['username']
            user.save()

            # Generate Knox Token
            instance, token = AuthToken.objects.create(user=user)

            return Response(
                {
                    'status': 'AUTHENTICATED',
                    'auth_state': TelegramSession.AuthState.AUTHENTICATED,
                    'token': token,
                    'expiry': instance.expiry,
                    'user': UserSerializer(user).data,
                    'message': '2FA verification successful. Telegram connected.'
                },
                status=status.HTTP_200_OK
            )


class UserMeView(APIView):
    """
    Authenticated endpoint retrieving current user profile and Telegram session status.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs) -> Response:
        return Response(UserSerializer(request.user).data, status=status.HTTP_200_OK)


class DisconnectTelegramView(APIView):
    """
    Authenticated endpoint to disconnect and revoke the user's Telegram MTProto session.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs) -> Response:
        user = request.user
        try:
            session = user.telegram_session
            if session.encrypted_session_string:
                try:
                    TelegramAuthService.logout_session(session.encrypted_session_string)
                except Exception as exc:
                    logger.warning(f"Error terminating Telegram remote session: {str(exc)}")

            session.encrypted_session_string = None
            session.temp_encrypted_session = None
            session.phone_code_hash = None
            session.is_authenticated = False
            session.auth_state = TelegramSession.AuthState.REVOKED
            session.save()
        except TelegramSession.DoesNotExist:
            pass

        return Response(
            {'message': 'Telegram account disconnected and session revoked successfully.'},
            status=status.HTTP_200_OK
        )


class LogoutView(KnoxLogoutView):
    """
    Revokes the current Knox authentication token.
    """
    pass


class LogoutAllView(KnoxLogoutAllView):
    """
    Revokes all active Knox tokens for the user across all devices.
    """
    pass
