from django.utils import timezone
from rest_framework import serializers

from apps.channels.models import Channel
from .models import Post, PostChannelTarget, PostMediaAttachment


class PostMediaAttachmentSerializer(serializers.ModelSerializer):
    """Serializer for media items attached to a post."""
    class Meta:
        model = PostMediaAttachment
        fields = [
            'id',
            'media_url',
            'media_type',
            'file_name',
            'file_size',
            'order',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class PostChannelTargetSerializer(serializers.ModelSerializer):
    """Serializer for channel delivery targets."""
    channel_id = serializers.UUIDField(source='channel.id', read_only=True)
    channel_title = serializers.CharField(source='channel.title', read_only=True)
    channel_username = serializers.CharField(source='channel.username', read_only=True)
    telegram_channel_id = serializers.IntegerField(source='channel.telegram_channel_id', read_only=True)
    channel = serializers.SerializerMethodField()

    class Meta:
        model = PostChannelTarget
        fields = [
            'id',
            'channel_id',
            'channel',
            'telegram_channel_id',
            'channel_title',
            'channel_username',
            'status',
            'telegram_message_id',
            'error_message',
            'sent_at',
        ]
        read_only_fields = fields

    def get_channel(self, obj: PostChannelTarget):
        if not getattr(obj, 'channel', None):
            return None
        return {
            'id': str(obj.channel.id),
            'telegram_channel_id': obj.channel.telegram_channel_id,
            'title': obj.channel.title,
            'username': obj.channel.username,
        }


class PostListSerializer(serializers.ModelSerializer):
    """Compact serializer for feed lists and overview dashboard."""
    content = serializers.CharField(source='text_content', read_only=True)
    targets_count = serializers.IntegerField(source='targets.count', read_only=True)
    media_count = serializers.IntegerField(source='media_attachments.count', read_only=True)
    media_attachments = PostMediaAttachmentSerializer(many=True, read_only=True)
    targets = PostChannelTargetSerializer(many=True, read_only=True)
    target_channels = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            'id',
            'text_content',
            'content',
            'formatting_mode',
            'silent',
            'disable_web_page_preview',
            'pin_message',
            'status',
            'scheduled_for',
            'published_at',
            'post_to_linkedin',
            'linkedin_post_urn',
            'targets_count',
            'media_count',
            'media_attachments',
            'targets',
            'target_channels',
            'error_summary',
            'created_at',
            'updated_at',
        ]
        read_only_fields = fields

    def get_target_channels(self, obj: Post) -> list:
        return [
            {
                'id': str(t.channel_id),
                'title': t.channel.title,
                'status': t.status
            }
            for t in obj.targets.select_related('channel').all()[:5]
        ]


class PostDetailSerializer(serializers.ModelSerializer):
    """Full detail serializer for post review and editing."""
    targets = PostChannelTargetSerializer(many=True, read_only=True)
    media_attachments = PostMediaAttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = Post
        fields = [
            'id',
            'text_content',
            'formatting_mode',
            'silent',
            'disable_web_page_preview',
            'pin_message',
            'status',
            'scheduled_for',
            'published_at',
            'post_to_linkedin',
            'linkedin_post_urn',
            'celery_task_id',
            'targets',
            'media_attachments',
            'error_summary',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'status',
            'published_at',
            'linkedin_post_urn',
            'celery_task_id',
            'targets',
            'media_attachments',
            'error_summary',
            'created_at',
            'updated_at',
        ]


class MediaAttachmentInputSerializer(serializers.Serializer):
    """Input payload for attaching media when creating or updating a post."""
    media_url = serializers.URLField(max_length=500, required=True)
    media_type = serializers.ChoiceField(
        choices=PostMediaAttachment.MediaType.choices,
        default=PostMediaAttachment.MediaType.IMAGE
    )
    file_name = serializers.CharField(max_length=255, required=False, allow_blank=True, default="")
    file_size = serializers.IntegerField(required=False, default=0, min_value=0)
    order = serializers.IntegerField(required=False, default=0, min_value=0)


class PostCreateSerializer(serializers.Serializer):
    """Payload validator for creating new posts (draft, scheduled, or instant publish)."""
    text_content = serializers.CharField(
        required=False,
        allow_blank=True,
        default="",
        help_text="Post text body formatted in HTML or Markdown."
    )
    content = serializers.CharField(
        required=False,
        allow_blank=True,
        default="",
        help_text="Alias for text_content."
    )
    formatting_mode = serializers.ChoiceField(
        choices=Post.FormattingMode.choices,
        default=Post.FormattingMode.HTML
    )
    target_channel_ids = serializers.ListField(
        child=serializers.UUIDField(),
        required=False,
        default=list,
        help_text="List of Channel UUIDs to broadcast this post to."
    )
    channel_ids = serializers.ListField(
        child=serializers.UUIDField(),
        required=False,
        default=list,
        help_text="Alias for target_channel_ids."
    )
    silent = serializers.BooleanField(default=False)
    disable_web_page_preview = serializers.BooleanField(default=False)
    pin_message = serializers.BooleanField(default=False)
    scheduled_for = serializers.DateTimeField(
        required=False,
        allow_null=True,
        default=None,
        help_text="UTC datetime for scheduled execution."
    )
    publish_now = serializers.BooleanField(
        required=False,
        default=None,
        allow_null=True,
        help_text="If true, immediately dispatches the post upon creation."
    )
    post_to_linkedin = serializers.BooleanField(
        required=False,
        default=False,
        help_text="Whether to publish or schedule this post to LinkedIn."
    )
    media_attachments = MediaAttachmentInputSerializer(many=True, required=False, default=list)

    def validate(self, attrs: dict) -> dict:
        # Resolve aliases
        if not attrs.get('text_content') and attrs.get('content'):
            attrs['text_content'] = attrs.get('content', '')
        if not attrs.get('target_channel_ids') and attrs.get('channel_ids'):
            attrs['target_channel_ids'] = attrs.get('channel_ids', [])

        text = attrs.get('text_content', '').strip()
        media = attrs.get('media_attachments', [])
        scheduled_for = attrs.get('scheduled_for')
        publish_now = attrs.get('publish_now')
        target_ids = attrs.get('target_channel_ids', [])
        post_to_linkedin = attrs.get('post_to_linkedin', False)

        # Auto-infer publish_now if not explicitly given
        if publish_now is None:
            publish_now = bool(not scheduled_for and (target_ids or post_to_linkedin))
            attrs['publish_now'] = publish_now

        # A post must contain either text content or at least one media item
        if not text and not media:
            raise serializers.ValidationError(
                "A post must contain either text content or at least one media attachment."
            )

        if post_to_linkedin and not text:
            raise serializers.ValidationError(
                {"text_content": "LinkedIn posts require text commentary."}
            )

        if publish_now and scheduled_for:
            raise serializers.ValidationError(
                "Cannot specify both 'publish_now=True' and a 'scheduled_for' datetime."
            )

        if scheduled_for and scheduled_for <= timezone.now():
            raise serializers.ValidationError(
                {"scheduled_for": "The scheduled datetime must be in the future."}
            )

        # At least one destination (Telegram channels OR LinkedIn) must be selected
        if (publish_now or scheduled_for) and not target_ids and not post_to_linkedin:
            raise serializers.ValidationError(
                "At least one destination (Telegram channel or LinkedIn) must be selected for publishing."
            )

        return attrs


class PostUpdateSerializer(serializers.Serializer):
    """Payload validator for updating an existing post."""
    text_content = serializers.CharField(required=False, allow_blank=True)
    content = serializers.CharField(required=False, allow_blank=True, help_text="Alias for text_content.")
    formatting_mode = serializers.ChoiceField(choices=Post.FormattingMode.choices, required=False)
    target_channel_ids = serializers.ListField(child=serializers.UUIDField(), required=False)
    channel_ids = serializers.ListField(child=serializers.UUIDField(), required=False, help_text="Alias for target_channel_ids.")
    post_to_linkedin = serializers.BooleanField(required=False)
    silent = serializers.BooleanField(required=False)
    disable_web_page_preview = serializers.BooleanField(required=False)
    pin_message = serializers.BooleanField(required=False)
    scheduled_for = serializers.DateTimeField(required=False, allow_null=True)
    media_attachments = MediaAttachmentInputSerializer(many=True, required=False)

    def validate_scheduled_for(self, value):
        if value and value <= timezone.now():
            raise serializers.ValidationError("The scheduled datetime must be in the future.")
        return value

    def validate(self, attrs: dict) -> dict:
        if not attrs.get('text_content') and attrs.get('content'):
            attrs['text_content'] = attrs.get('content', '')
        if not attrs.get('target_channel_ids') and attrs.get('channel_ids'):
            attrs['target_channel_ids'] = attrs.get('channel_ids', [])
        return attrs
