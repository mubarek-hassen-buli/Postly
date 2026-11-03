import logging
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import UploadedMedia
from .serializers import (
    DirectFileUploadSerializer,
    UploadedMediaSerializer,
    UploadSignatureRequestSerializer,
    UploadSignatureResponseSerializer,
)
from .services import CloudinaryMediaService, MediaServiceError

logger = logging.getLogger(__name__)


class MediaSignatureView(APIView):
    """
    Generate cryptographic signature for direct client-side uploads to Cloudinary.
    Allows the mobile client to upload large files directly without server bottleneck.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs) -> Response:
        serializer = UploadSignatureRequestSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)

        folder = serializer.validated_data.get('folder', f"postly/users/{request.user.id}")
        resource_type = serializer.validated_data.get('resource_type', 'auto')

        try:
            signed_data = CloudinaryMediaService.generate_upload_signature(
                folder=folder,
                resource_type=resource_type
            )
        except MediaServiceError as exc:
            return Response(
                {
                    'error': {
                        'code': exc.code,
                        'message': exc.message,
                        'details': exc.details,
                    }
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        response_serializer = UploadSignatureResponseSerializer(signed_data)
        return Response(response_serializer.data, status=status.HTTP_200_OK)


class DirectMediaUploadView(APIView):
    """
    Server-side fallback file upload endpoint.
    Accepts multipart file uploads, validates size and type, and stores in Cloudinary.
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs) -> Response:
        serializer = DirectFileUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        uploaded_file = serializer.validated_data['file']

        try:
            upload_result = CloudinaryMediaService.upload_file(
                file_obj=uploaded_file,
                user_id=str(request.user.id),
                custom_filename=uploaded_file.name
            )
        except MediaServiceError as exc:
            return Response(
                {
                    'error': {
                        'code': exc.code,
                        'message': exc.message,
                        'details': exc.details,
                    }
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Save to database
        media_record = UploadedMedia.objects.create(
            user=request.user,
            media_url=upload_result['media_url'],
            public_id=upload_result['public_id'],
            media_type=upload_result['media_type'],
            file_name=upload_result['file_name'],
            file_size=upload_result['file_size'],
            width=upload_result.get('width'),
            height=upload_result.get('height'),
            duration=upload_result.get('duration'),
            format=upload_result.get('format', '')
        )

        return Response(
            UploadedMediaSerializer(media_record).data,
            status=status.HTTP_201_CREATED
        )


class MediaListView(APIView):
    """
    List media assets uploaded by the authenticated user.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs) -> Response:
        queryset = UploadedMedia.objects.filter(user=request.user)

        media_type = request.query_params.get('media_type')
        if media_type and media_type.upper() in UploadedMedia.MediaType.values:
            queryset = queryset.filter(media_type=media_type.upper())

        page = self.paginate_queryset(queryset, request)
        if page is not None:
            serializer = UploadedMediaSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = UploadedMediaSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def paginate_queryset(self, queryset, request):
        paginator = getattr(self, '_paginator', None)
        if paginator is None:
            from apps.common.pagination import StandardPageNumberPagination
            self._paginator = StandardPageNumberPagination()
        return self._paginator.paginate_queryset(queryset, request, view=self)

    def get_paginated_response(self, data):
        return self._paginator.get_paginated_response(data)


class MediaDetailView(APIView):
    """
    Delete an uploaded media asset from Cloudinary and the database.
    """
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk, *args, **kwargs) -> Response:
        media_record = get_object_or_404(UploadedMedia, id=pk, user=request.user)

        try:
            CloudinaryMediaService.delete_file(
                public_id=media_record.public_id,
                media_type=media_record.media_type
            )
        except Exception as exc:
            logger.warning(f"Failed to delete Cloudinary asset {media_record.public_id}: {str(exc)}")

        media_record.delete()
        return Response(
            {'message': 'Media asset deleted successfully.'},
            status=status.HTTP_204_NO_CONTENT
        )
