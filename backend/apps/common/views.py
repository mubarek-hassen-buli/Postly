from django.core.cache import cache
from django.db import connection
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView


class HealthCheckView(APIView):
    """
    Public health check endpoint validating operational readiness
    of database, cache, and backend application services.
    """
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs) -> Response:
        health_status = {
            'status': 'healthy',
            'services': {
                'database': 'unknown',
                'cache': 'unknown',
            }
        }
        is_healthy = True

        # Database Check
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1;")
                cursor.fetchone()
            health_status['services']['database'] = 'connected'
        except Exception as e:
            health_status['services']['database'] = f'error: {str(e)}'
            is_healthy = False

        # Redis / Cache Check
        try:
            cache.set('health_check_ping', 'pong', timeout=5)
            ping_val = cache.get('health_check_ping')
            if ping_val == 'pong':
                health_status['services']['cache'] = 'connected'
            else:
                health_status['services']['cache'] = 'unresponsive'
                is_healthy = False
        except Exception as e:
            # Cache failure in local dev without Redis should not crash healthcheck completely
            health_status['services']['cache'] = f'unavailable: {str(e)}'

        if not is_healthy:
            health_status['status'] = 'degraded'
            return Response(health_status, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        return Response(health_status, status=status.HTTP_200_OK)
