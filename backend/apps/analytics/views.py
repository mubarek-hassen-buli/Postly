import logging
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .services import DashboardAnalyticsService
from .serializers import DashboardAnalyticsResponseSerializer

logger = logging.getLogger(__name__)


class DashboardAnalyticsView(APIView):
    """
    Authenticated endpoint providing comprehensive dashboard analytics,
    time-series post distributions for gifted-charts, and platform shares.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs) -> Response:
        period = request.query_params.get('period', '7d').lower()
        if period not in ['7d', '30d', 'all']:
            period = '7d'

        try:
            analytics_data = DashboardAnalyticsService.get_dashboard_analytics(
                user=request.user,
                period=period
            )
            serializer = DashboardAnalyticsResponseSerializer(analytics_data)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as exc:
            logger.exception(f"Error computing dashboard analytics for user {request.user.id}")
            return Response(
                {
                    'error': {
                        'code': 'ANALYTICS_ERROR',
                        'message': 'Failed to aggregate analytics data. Please try again later.',
                        'details': str(exc),
                    }
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
