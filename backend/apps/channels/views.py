import logging
from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

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
        queryset = Channel.objects.filter(user=request.user)

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
        serializer = ChannelToggleSelectionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        channel.is_selected_by_user = serializer.validated_data['is_selected_by_user']
        channel.save(update_fields=['is_selected_by_user', 'updated_at'])

        return Response(ChannelSerializer(channel).data, status=status.HTTP_200_OK)


class ChannelStatsView(APIView):
    """
    Retrieve overview statistics and permissions for a channel.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, pk, *args, **kwargs) -> Response:
        channel = get_object_or_404(Channel, id=pk, user=request.user)

        stats_data = {
            'id': channel.id,
            'telegram_channel_id': channel.telegram_channel_id,
            'title': channel.title,
            'member_count': channel.member_count,
            'is_creator': channel.is_creator,
            'can_post_messages': channel.can_post_messages,
            'can_edit_messages': channel.can_edit_messages,
            'can_delete_messages': channel.can_delete_messages,
            'is_selected_by_user': channel.is_selected_by_user,
            'published_posts_count': getattr(channel, 'targets', None).filter(status='SUCCESS').count() if hasattr(channel, 'targets') else 0,
            'scheduled_posts_count': getattr(channel, 'targets', None).filter(status='PENDING').count() if hasattr(channel, 'targets') else 0,
        }

        serializer = ChannelStatsSerializer(stats_data)
        return Response(serializer.data, status=status.HTTP_200_OK)
