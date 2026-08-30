import re
from rest_framework import serializers
from .models import TelegramSession, User

PHONE_REGEX = re.compile(r'^\+[1-9]\d{6,14}$')


class SendCodeRequestSerializer(serializers.Serializer):
    """Payload validator for requesting Telegram login OTP."""
    phone_number = serializers.CharField(
        max_length=32,
        required=True,
        help_text="International phone number with country code (e.g. +1234567890)"
    )

    def validate_phone_number(self, value: str) -> str:
        clean_phone = value.strip().replace(' ', '').replace('-', '')
        if not clean_phone.startswith('+'):
            clean_phone = f"+{clean_phone}"
        if not PHONE_REGEX.match(clean_phone):
            raise serializers.ValidationError(
                "Invalid phone number format. Must be in E.164 international format (e.g. +1234567890)."
            )
        return clean_phone


class VerifyCodeRequestSerializer(serializers.Serializer):
    """Payload validator for verifying Telegram OTP code."""
    phone_number = serializers.CharField(max_length=32, required=True)
    code = serializers.CharField(
        max_length=16,
        required=True,
        help_text="5 or 6 digit confirmation code received via Telegram or SMS."
    )
    phone_code_hash = serializers.CharField(
        max_length=255,
        required=False,
        allow_blank=True,
        help_text="Telegram phone_code_hash (optional if active in session)."
    )

    def validate_phone_number(self, value: str) -> str:
        clean_phone = value.strip().replace(' ', '').replace('-', '')
        if not clean_phone.startswith('+'):
            clean_phone = f"+{clean_phone}"
        return clean_phone

    def validate_code(self, value: str) -> str:
        clean_code = str(value).strip().replace(' ', '')
        if not clean_code.isdigit():
            raise serializers.ValidationError("Confirmation code must contain digits only.")
        return clean_code


class VerifyPasswordRequestSerializer(serializers.Serializer):
    """Payload validator for 2FA cloud password submission."""
    phone_number = serializers.CharField(max_length=32, required=True)
    password = serializers.CharField(
        max_length=255,
        required=True,
        write_only=True,
        help_text="Telegram Two-Factor Authentication (2FA) cloud password."
    )

    def validate_phone_number(self, value: str) -> str:
        clean_phone = value.strip().replace(' ', '').replace('-', '')
        if not clean_phone.startswith('+'):
            clean_phone = f"+{clean_phone}"
        return clean_phone


class TelegramSessionSerializer(serializers.ModelSerializer):
    """Serializer exposing public Telegram connection metadata."""

    class Meta:
        model = TelegramSession
        fields = [
            'id',
            'telegram_user_id',
            'phone_number',
            'username',
            'first_name',
            'last_name',
            'auth_state',
            'is_authenticated',
            'last_synced_at',
            'updated_at',
        ]
        read_only_fields = fields


class UserSerializer(serializers.ModelSerializer):
    """Serializer for authenticated user profile with connected Telegram session."""
    telegram_session = TelegramSessionSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            'id',
            'phone_number',
            'username',
            'first_name',
            'last_name',
            'avatar_url',
            'is_active',
            'telegram_session',
            'created_at',
        ]
        read_only_fields = [
            'id',
            'phone_number',
            'is_active',
            'telegram_session',
            'created_at',
        ]
