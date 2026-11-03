from rest_framework import serializers
from .models import UploadedMedia


class UploadedMediaSerializer(serializers.ModelSerializer):
    """Serializer representing an uploaded media asset."""
    class Meta:
        model = UploadedMedia
        fields = [
            'id',
            'media_url',
            'public_id',
            'media_type',
            'file_name',
            'file_size',
            'width',
            'height',
            'duration',
            'format',
            'created_at',
        ]
        read_only_fields = fields


class UploadSignatureRequestSerializer(serializers.Serializer):
    """Query/body parameters for generating a Cloudinary direct upload signature."""
    folder = serializers.CharField(
        max_length=255,
        required=False,
        default="postly_media",
        help_text="Target folder inside Cloudinary storage."
    )
    resource_type = serializers.ChoiceField(
        choices=['auto', 'image', 'video', 'raw'],
        default='auto',
        required=False,
        help_text="Resource type: auto, image, video, or raw."
    )


class UploadSignatureResponseSerializer(serializers.Serializer):
    """Signed upload parameters for client-side direct upload to Cloudinary."""
    timestamp = serializers.IntegerField()
    signature = serializers.CharField()
    api_key = serializers.CharField()
    cloud_name = serializers.CharField()
    folder = serializers.CharField()
    upload_url = serializers.URLField()


class DirectFileUploadSerializer(serializers.Serializer):
    """Payload validator for multipart server-side file upload."""
    file = serializers.FileField(
        required=True,
        help_text="Media file to upload (Image <= 10MB, Video <= 50MB, Document <= 20MB)."
    )
