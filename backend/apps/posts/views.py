# pyright: reportGeneralTypeIssues=none, reportAttributeAccessIssue=none, reportCallIssue=none
import concurrent.futures
import logging
from typing import Any, cast
from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.channels.models import Channel
from apps.integrations.linkedin.publishing import LinkedInPublishingService
from .models import Post, PostChannelTarget, PostMediaAttachment
from .serializers import (
    PostCreateSerializer,
    PostDetailSerializer,
    PostListSerializer,
    PostUpdateSerializer,
)
from .services import TelegramPublishingService
from .tasks import cancel_post_celery_task, schedule_post_celery_task

logger = logging.getLogger(__name__)


class PostListCreateView(APIView):
    """
    List and create posts for the authenticated user.
    Supports filtering by status, channel target, and search text.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs) -> Response:
        queryset = Post.objects.filter(user=request.user).prefetch_related(
            'targets__channel',
            'media_attachments'
        )

        # Status filter
        status_param = request.query_params.get('status')
        if status_param and status_param.upper() in Post.PostStatus.values:
            queryset = queryset.filter(status=status_param.upper())

        # Target channel filter
        channel_id = request.query_params.get('channel_id')
        if channel_id:
            queryset = queryset.filter(targets__channel_id=channel_id)

        # Search filter
        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(text_content__icontains=search.strip())

        # Date range filter
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        if date_from:
            queryset = queryset.filter(created_at__gte=date_from)
        if date_to:
            queryset = queryset.filter(created_at__lte=date_to)

        # Use Standard DRF pagination
        page = self.paginate_queryset(queryset, request)
        if page is not None:
            serializer = PostListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = PostListSerializer(queryset, many=True)
        return Response(
            {
                'count': queryset.count(),
                'results': serializer.data,
            },
            status=status.HTTP_200_OK
        )

    def paginate_queryset(self, queryset, request):
        paginator = getattr(self, '_paginator', None)
        if paginator is None:
            from apps.common.pagination import StandardPageNumberPagination
            self._paginator = StandardPageNumberPagination()
        return self._paginator.paginate_queryset(queryset, request, view=self)

    def get_paginated_response(self, data):
        return self._paginator.get_paginated_response(data)

    def post(self, request, *args, **kwargs) -> Response:
        serializer = PostCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        validated_data = serializer.validated_data
        user = request.user
        target_channel_ids = validated_data.get('target_channel_ids', [])
        media_items = validated_data.get('media_attachments', [])
        scheduled_for = validated_data.get('scheduled_for')
        publish_now = validated_data.get('publish_now', False)

        # Validate channels belong to user and have posting permission
        channels = []
        if target_channel_ids:
            channels = list(Channel.objects.filter(id__in=target_channel_ids, user=user))
            if len(channels) != len(target_channel_ids):
                return Response(
                    {
                        'error': {
                            'code': 'INVALID_CHANNEL_SELECTION',
                            'message': 'One or more selected channels do not exist or do not belong to your account.',
                            'details': None,
                        }
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Determine initial post status
        if scheduled_for:
            initial_status = Post.PostStatus.SCHEDULED
        else:
            initial_status = Post.PostStatus.DRAFT

        with cast(Any, transaction.atomic()):
            post = Post.objects.create(
                user=user,
                text_content=validated_data.get('text_content', ''),
                formatting_mode=validated_data.get('formatting_mode', Post.FormattingMode.HTML),
                silent=validated_data.get('silent', False),
                disable_web_page_preview=validated_data.get('disable_web_page_preview', False),
                pin_message=validated_data.get('pin_message', False),
                status=initial_status,
                scheduled_for=scheduled_for,
                post_to_linkedin=validated_data.get('post_to_linkedin', False)
            )

            # Create Channel Targets
            for channel in channels:
                PostChannelTarget.objects.create(post=post, channel=channel)

            # Create Media Attachments
            for idx, item in enumerate(media_items):
                PostMediaAttachment.objects.create(
                    post=post,
                    media_url=item['media_url'],
                    media_type=item.get('media_type', PostMediaAttachment.MediaType.IMAGE),
                    file_name=item.get('file_name', ''),
                    file_size=item.get('file_size', 0),
                    order=item.get('order', idx)
                )

        # Execution Phase
        if publish_now:
            TelegramPublishingService.publish_post(str(post.id))
            post.refresh_from_db()
            if post.status == Post.PostStatus.FAILED:
                return Response(
                    {
                        'error': {
                            'code': 'PUBLISH_FAILED',
                            'message': post.error_summary or 'Failed to broadcast post to selected channels.',
                            'details': PostDetailSerializer(post).data,
                        }
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
        elif scheduled_for:
            try:
                task_id = schedule_post_celery_task(post)
                post.celery_task_id = task_id
                post.save(update_fields=['celery_task_id', 'updated_at'])
            except Exception as exc:
                logger.warning(f"Could not queue Celery task for post {post.id}: {str(exc)}")

        return Response(PostDetailSerializer(post).data, status=status.HTTP_201_CREATED)


class PostDetailView(APIView):
    """
    Retrieve, update, or delete an existing post.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, pk, *args, **kwargs) -> Response:
        post = get_object_or_404(
            Post.objects.prefetch_related('targets__channel', 'media_attachments'),
            id=pk,
            user=request.user
        )
        serializer = PostDetailSerializer(post)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, pk, *args, **kwargs) -> Response:
        post = get_object_or_404(Post, id=pk, user=request.user)

        if post.status == Post.PostStatus.PUBLISHING:
            return Response(
                {
                    'error': {
                        'code': 'POST_PUBLISHING_LOCKED',
                        'message': 'Cannot modify a post that is currently in the process of broadcasting.',
                        'details': None,
                    }
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = PostUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        with cast(Any, transaction.atomic()):
            if 'text_content' in data:
                post.text_content = data['text_content']
            if 'formatting_mode' in data:
                post.formatting_mode = data['formatting_mode']
            if 'silent' in data:
                post.silent = data['silent']
            if 'disable_web_page_preview' in data:
                post.disable_web_page_preview = data['disable_web_page_preview']
            if 'pin_message' in data:
                post.pin_message = data['pin_message']
            if 'post_to_linkedin' in data and post.status != Post.PostStatus.PUBLISHED:
                post.post_to_linkedin = data['post_to_linkedin']

            # Target channels update (only editable before publication)
            if 'target_channel_ids' in data and post.status != Post.PostStatus.PUBLISHED:
                target_ids = data['target_channel_ids']
                channels = list(Channel.objects.filter(id__in=target_ids, user=request.user))
                if len(channels) != len(target_ids):
                    return Response(
                        {
                            'error': {
                                'code': 'INVALID_CHANNEL_SELECTION',
                                'message': 'One or more channel IDs are invalid or not owned by you.',
                                'details': None,
                            }
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )
                post.targets.all().delete()
                for channel in channels:
                    PostChannelTarget.objects.create(post=post, channel=channel)

            # Media attachments update (only editable before publication)
            if 'media_attachments' in data and post.status != Post.PostStatus.PUBLISHED:
                post.media_attachments.all().delete()
                for idx, item in enumerate(data['media_attachments']):
                    PostMediaAttachment.objects.create(
                        post=post,
                        media_url=item['media_url'],
                        media_type=item.get('media_type', PostMediaAttachment.MediaType.IMAGE),
                        file_name=item.get('file_name', ''),
                        file_size=item.get('file_size', 0),
                        order=item.get('order', idx)
                    )

            # Scheduling updates (only editable before publication)
            if 'scheduled_for' in data and post.status != Post.PostStatus.PUBLISHED:
                new_scheduled_for = data['scheduled_for']
                # Revoke previous Celery task if present
                if post.celery_task_id:
                    cancel_post_celery_task(post.celery_task_id)
                    post.celery_task_id = None

                post.scheduled_for = new_scheduled_for
                if new_scheduled_for:
                    post.status = Post.PostStatus.SCHEDULED
                    try:
                        task_id = schedule_post_celery_task(post)
                        post.celery_task_id = task_id
                    except Exception as exc:
                        logger.warning(f"Could not reschedule Celery task for post {post.id}: {str(exc)}")
                else:
                    if post.status == Post.PostStatus.SCHEDULED:
                        post.status = Post.PostStatus.DRAFT

            post.save()

        # If post was already PUBLISHED, propagate text edits or pin changes to remote Telegram messages
        edit_result = None
        if post.status == Post.PostStatus.PUBLISHED and (
            'text_content' in data or 'formatting_mode' in data or 'pin_message' in data
        ):
            try:
                edit_result = TelegramPublishingService.edit_remote_telegram_messages(post)
            except Exception as exc:
                logger.exception(f"Error updating remote Telegram messages for post {post.id}: {exc}")

        post.refresh_from_db()
        response_data = PostDetailSerializer(post).data
        if edit_result:
            response_data['telegram_edit_result'] = edit_result
        return Response(response_data, status=status.HTTP_200_OK)

    def delete(self, request, pk, *args, **kwargs) -> Response:
        post = get_object_or_404(Post, id=pk, user=request.user)

        # 1. Cancel pending Celery task if post was scheduled
        if post.celery_task_id:
            try:
                cancel_post_celery_task(post.celery_task_id)
            except Exception as exc:
                logger.warning(f"Could not cancel Celery task {post.celery_task_id} for post {post.id}: {exc}")

        # 2. Concurrently execute remote deletions (Telegram + LinkedIn)
        with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
            fut_tg = executor.submit(TelegramPublishingService.delete_remote_telegram_messages, post)
            fut_li = (
                executor.submit(LinkedInPublishingService.delete_post, post.user, post.linkedin_post_urn)
                if post.linkedin_post_urn
                else None
            )

            try:
                fut_tg.result(timeout=10)
            except Exception as exc:
                logger.exception(f"Error during remote Telegram deletion for post {post.id}: {exc}")

            if fut_li:
                try:
                    fut_li.result(timeout=10)
                except Exception as exc:
                    logger.exception(f"Error during remote LinkedIn deletion for post {post.id} (URN {post.linkedin_post_urn}): {exc}")

        post.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class PostPublishNowView(APIView):
    """
    Immediately triggers dispatch of a draft or scheduled post to all target channels.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk, *args, **kwargs) -> Response:
        post = get_object_or_404(Post, id=pk, user=request.user)

        if post.status == Post.PostStatus.PUBLISHING:
            return Response(
                {
                    'error': {
                        'code': 'ALREADY_PUBLISHING',
                        'message': 'Post is already in the process of broadcasting.',
                        'details': None,
                    }
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Cancel any pending Celery ETA task
        if post.celery_task_id:
            cancel_post_celery_task(post.celery_task_id)
            post.celery_task_id = None
            post.save(update_fields=['celery_task_id', 'updated_at'])

        # Publish immediately
        TelegramPublishingService.publish_post(str(post.id))
        post.refresh_from_db()

        if post.status == Post.PostStatus.FAILED:
            return Response(
                {
                    'error': {
                        'code': 'PUBLISH_FAILED',
                        'message': post.error_summary or 'Failed to broadcast post to selected channels.',
                        'details': PostDetailSerializer(post).data,
                    }
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(PostDetailSerializer(post).data, status=status.HTTP_200_OK)


class PostCancelScheduleView(APIView):
    """
    Cancels a scheduled post and sets its status back to DRAFT or CANCELLED.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk, *args, **kwargs) -> Response:
        post = get_object_or_404(Post, id=pk, user=request.user)

        if post.status != Post.PostStatus.SCHEDULED:
            return Response(
                {
                    'error': {
                        'code': 'NOT_SCHEDULED',
                        'message': f'Cannot cancel schedule for a post with status {post.status}.',
                        'details': None,
                    }
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if post.celery_task_id:
            cancel_post_celery_task(post.celery_task_id)
            post.celery_task_id = None

        post.status = Post.PostStatus.CANCELLED
        post.save(update_fields=['status', 'celery_task_id', 'updated_at'])

        return Response(PostDetailSerializer(post).data, status=status.HTTP_200_OK)
