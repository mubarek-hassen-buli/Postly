import logging
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Device, NotificationLog
from .serializers import (
    DeviceRegisterSerializer,
    DeviceSerializer,
    MarkReadRequestSerializer,
    NotificationLogSerializer,
)

logger = logging.getLogger(__name__)


class DeviceRegisterView(APIView):
    """
    Register or refresh a device Expo push token for the authenticated user.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs) -> Response:
        serializer = DeviceRegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        token = serializer.validated_data['expo_push_token']
        device_type = serializer.validated_data.get('device_type', Device.DeviceType.OTHER)
        device_name = serializer.validated_data.get('device_name', '')

        # Upsert device record
        device, created = Device.objects.update_or_create(
            expo_push_token=token,
            defaults={
                'user': request.user,
                'device_type': device_type,
                'device_name': device_name,
                'is_active': True,
            }
        )

        return Response(
            DeviceSerializer(device).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )


class DeviceUnregisterView(APIView):
    """
    Deactivates an Expo push token on user logout or device unregistration.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs) -> Response:
        token = request.data.get('expo_push_token')
        if not token:
            return Response(
                {
                    'error': {
                        'code': 'TOKEN_REQUIRED',
                        'message': 'Field expo_push_token is required.',
                        'details': None,
                    }
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        updated_count = Device.objects.filter(
            user=request.user,
            expo_push_token=token.strip()
        ).update(is_active=False)

        return Response(
            {
                'message': 'Device push token successfully unregistered.',
                'deactivated': updated_count > 0
            },
            status=status.HTTP_200_OK
        )


class NotificationListView(APIView):
    """
    List push notifications history for the authenticated user.
    Supports filtering by unread status.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs) -> Response:
        queryset = NotificationLog.objects.filter(user=request.user)

        unread_only = request.query_params.get('unread_only')
        if unread_only is not None:
            is_unread = unread_only.lower() in ('true', '1', 't', 'yes')
            if is_unread:
                queryset = queryset.filter(is_read=False)

        page = self.paginate_queryset(queryset, request)
        if page is not None:
            serializer = NotificationLogSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = NotificationLogSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def paginate_queryset(self, queryset, request):
        paginator = getattr(self, '_paginator', None)
        if paginator is None:
            from apps.common.pagination import StandardPageNumberPagination
            self._paginator = StandardPageNumberPagination()
        return self._paginator.paginate_queryset(queryset, request, view=self)

    def get_paginated_response(self, data):
        return self._paginator.get_paginated_response(data)


class NotificationMarkReadView(APIView):
    """
    Mark one or all notifications as read.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs) -> Response:
        serializer = MarkReadRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        notification_ids = serializer.validated_data.get('notification_ids', [])

        queryset = NotificationLog.objects.filter(user=request.user, is_read=False)
        if notification_ids:
            queryset = queryset.filter(id__in=notification_ids)

        updated_count = queryset.update(is_read=True)

        return Response(
            {
                'message': f'Marked {updated_count} notification(s) as read.',
                'updated_count': updated_count
            },
            status=status.HTTP_200_OK
        )
