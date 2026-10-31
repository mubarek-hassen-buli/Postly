import logging
from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.posts.models import PostChannelTarget
from apps.telegram_engine.services import TelegramServiceError
from .models import Channel
from .serializers import (
    ChannelSerializer,
    ChannelStatsSerializer,
    ChannelToggleSelectionSerializer,
)
from .services import TelegramChannelService

logger = logging.getLogger(__name__)


class ChannelListView(APIView):
    """
    List all Telegram channels managed by the authenticated user.
    Supports filtering by active selection status, posting permissions, and search terms.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs) -> Response:
        queryset = Channel.objects.filter(user=request.user).order_by('title')

        # Filter by selected_only
        selected_only = request.query_params.get('selected_only')
        if selected_only is not None:
            is_selected = selected_only.lower() in ('true', '1', 't', 'yes')
            queryset = queryset.filter(is_selected_by_user=is_selected)

        # Filter by can_post_only
        can_post_only = request.query_params.get('can_post_only')
        if can_post_only is not None:
            can_post = can_post_only.lower() in ('true', '1', 't', 'yes')
            if can_post:
                queryset = queryset.filter(can_post_messages=True)

        # Search by title or username
        search = request.query_params.get('search')
        if search:
            search = search.strip().lstrip('@')
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(username__icontains=search)
            )

        serializer = ChannelSerializer(queryset, many=True)
        return Response(
            {
                'count': queryset.count(),
                'results': serializer.data,
            },
            status=status.HTTP_200_OK
        )


class ChannelSyncView(APIView):
    """
    Triggers an on-demand MTProto channel discovery and synchronization
    for the authenticated user.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs) -> Response:
        try:
            synced_channels = TelegramChannelService.sync_user_channels(request.user)
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

        serializer = ChannelSerializer(synced_channels, many=True)
        return Response(
            {
                'status': 'SUCCESS',
                'synced_count': len(synced_channels),
                'channels': serializer.data,
                'message': f'Successfully synchronized {len(synced_channels)} channels from Telegram.'
            },
            status=status.HTTP_200_OK
        )


class ChannelDetailView(APIView):
    """
    Retrieve details for a specific channel owned by the authenticated user.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, pk, *args, **kwargs) -> Response:
        channel = get_object_or_404(Channel, id=pk, user=request.user)
        serializer = ChannelSerializer(channel)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ChannelToggleSelectionView(APIView):
    """
    Update the active selection status (`is_selected_by_user`) for a channel.
    """
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk, *args, **kwargs) -> Response:
        channel = get_object_or_404(Channel, id=pk, user=request.user)
        serializer = ChannelToggleSelectionSerializer(data=request.data or {})
        serializer.is_valid(raise_exception=True)

        explicit_val = serializer.validated_data.get('is_selected_by_user')
        if explicit_val is not None:
            channel.is_selected_by_user = explicit_val
        else:
            channel.is_selected_by_user = not channel.is_selected_by_user

        channel.save(update_fields=['is_selected_by_user', 'updated_at'])

        response_data = ChannelSerializer(channel).data
        response_data['message'] = f"Channel selection updated to {channel.is_selected_by_user}."
        return Response(response_data, status=status.HTTP_200_OK)


class ChannelStatsView(APIView):
    """
    Retrieve overview statistics and permissions for a channel.
    Calculates live targeted post counts, delivery successes, failures, and subscriber counts.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, pk, *args, **kwargs) -> Response:
        channel = get_object_or_404(Channel, id=pk, user=request.user)

        # Real-time queries on PostChannelTarget
        targets_qs = PostChannelTarget.objects.filter(channel=channel)
        total_posts_targeted = targets_qs.count()
        successful_posts = targets_qs.filter(status=PostChannelTarget.TargetStatus.SUCCESS).count()
        failed_posts = targets_qs.filter(status=PostChannelTarget.TargetStatus.FAILED).count()
        pending_posts = targets_qs.filter(status=PostChannelTarget.TargetStatus.PENDING).count()

        last_sent = (
            targets_qs.filter(status=PostChannelTarget.TargetStatus.SUCCESS)
            .order_by('-sent_at')
            .values_list('sent_at', flat=True)
            .first()
        )

        stats_data = {
            'id': channel.id,
            'channel_id': channel.id,
            'telegram_channel_id': channel.telegram_channel_id,
            'title': channel.title,
            'username': channel.username,
            'member_count': channel.member_count,
            'subscribers': channel.member_count,
            'is_creator': channel.is_creator,
            'can_post_messages': channel.can_post_messages,
            'can_edit_messages': channel.can_edit_messages,
            'can_delete_messages': channel.can_delete_messages,
            'can_pin_messages': channel.can_pin_messages,
            'is_selected_by_user': channel.is_selected_by_user,
            'total_posts_targeted': total_posts_targeted,
            'successful_posts': successful_posts,
            'failed_posts': failed_posts,
            'pending_posts': pending_posts,
            'published_posts_count': successful_posts,
            'scheduled_posts_count': pending_posts,
            'last_published_at': last_sent,
        }

        serializer = ChannelStatsSerializer(stats_data)
        return Response(serializer.data, status=status.HTTP_200_OK)
