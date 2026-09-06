from rest_framework import serializers
from ..models import LinkedInAccount


class LinkedInAccountSerializer(serializers.ModelSerializer):
    """Safe, sanitized representation of a connected LinkedIn account."""
    is_expired = serializers.BooleanField(source='is_token_expired', read_only=True)
    person_urn = serializers.CharField(read_only=True)

    class Meta:
        model = LinkedInAccount
        fields = [
            'id',
            'linkedin_member_id',
            'person_urn',
            'name',
            'given_name',
            'family_name',
            'email',
            'picture_url',
            'scopes',
            'token_expires_at',
            'is_expired',
            'is_active',
            'last_synced_at',
            'created_at',
        ]
        read_only_fields = fields


class LinkedInStatusResponseSerializer(serializers.Serializer):
    """Schema for connection status check."""
    is_connected = serializers.BooleanField()
    account = LinkedInAccountSerializer(allow_null=True)


class LinkedInPublishRequestSerializer(serializers.Serializer):
    """Validation schema for direct text publishing from Expo app."""
    text = serializers.CharField(
        min_length=1,
        max_length=3000,
        trim_whitespace=True,
        required=True,
        help_text="The text commentary to broadcast to the user's personal LinkedIn feed (max 3,000 chars)."
    )


class LinkedInPublishResponseSerializer(serializers.Serializer):
    """Response returned upon successful LinkedIn broadcast."""
    status = serializers.CharField()
    platform = serializers.CharField()
    post_urn = serializers.CharField()
    published_at = serializers.CharField()
    message = serializers.CharField()
