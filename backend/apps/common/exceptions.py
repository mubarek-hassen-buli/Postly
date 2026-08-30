import logging
from typing import Any, Dict, Optional
from django.core.exceptions import PermissionDenied, ValidationError as DjangoValidationError
from django.http import Http404
from rest_framework import status
from rest_framework.exceptions import APIException, ValidationError as DRFValidationError
from rest_framework.response import Response
from rest_framework.views import exception_handler

logger = logging.getLogger(__name__)


def custom_exception_handler(exc: Exception, context: Dict[str, Any]) -> Optional[Response]:
    """
    Standardized REST exception handler conforming to clean API design contracts.
    Prevents sensitive internal stack trace leakage on 500 errors while logging
    full diagnostics internally.
    """
    # First, let DRF default exception handler attempt resolution
    response = exception_handler(exc, context)

    # Handle Django-native exceptions if not handled by DRF
    if response is None:
        if isinstance(exc, Http404):
            response = Response(
                {
                    'error': {
                        'code': 'NOT_FOUND',
                        'message': 'The requested resource was not found.',
                        'details': None,
                    }
                },
                status=status.HTTP_404_NOT_FOUND,
            )
        elif isinstance(exc, PermissionDenied):
            response = Response(
                {
                    'error': {
                        'code': 'PERMISSION_DENIED',
                        'message': 'You do not have permission to perform this action.',
                        'details': None,
                    }
                },
                status=status.HTTP_403_FORBIDDEN,
            )
        elif isinstance(exc, DjangoValidationError):
            response = Response(
                {
                    'error': {
                        'code': 'VALIDATION_ERROR',
                        'message': 'Invalid input data.',
                        'details': exc.message_dict if hasattr(exc, 'message_dict') else exc.messages,
                    }
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        else:
            # Unhandled server exception (500)
            request = context.get('request')
            req_path = request.path if request else 'UNKNOWN'
            req_id = getattr(request, 'request_id', 'UNKNOWN')

            logger.exception(
                f"[500 Internal Error] Request ID: {req_id} Path: {req_path} - {str(exc)}",
                exc_info=exc,
            )

            response = Response(
                {
                    'error': {
                        'code': 'INTERNAL_SERVER_ERROR',
                        'message': 'An unexpected error occurred. Please try again later.',
                        'details': None,
                        'request_id': req_id,
                    }
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
            return response

    # Format DRF standard response into predictable standardized contract
    if response is not None:
        raw_data = response.data
        status_code = response.status_code

        error_code = 'API_ERROR'
        message = 'An error occurred while processing your request.'
        details = None

        if status_code == status.HTTP_400_BAD_REQUEST:
            error_code = 'VALIDATION_ERROR'
            message = 'Invalid request parameters or payload.'
            details = raw_data
        elif status_code == status.HTTP_401_UNAUTHORIZED:
            error_code = 'UNAUTHORIZED'
            message = raw_data.get('detail', 'Authentication credentials were not provided or are invalid.') if isinstance(raw_data, dict) else 'Authentication required.'
        elif status_code == status.HTTP_403_FORBIDDEN:
            error_code = 'FORBIDDEN'
            message = raw_data.get('detail', 'You do not have permission to access this resource.') if isinstance(raw_data, dict) else 'Forbidden.'
        elif status_code == status.HTTP_404_NOT_FOUND:
            error_code = 'NOT_FOUND'
            message = raw_data.get('detail', 'Resource not found.') if isinstance(raw_data, dict) else 'Not found.'
        elif status_code == status.HTTP_429_TOO_MANY_REQUESTS:
            error_code = 'RATE_LIMIT_EXCEEDED'
            message = raw_data.get('detail', 'Request was throttled. Please try again later.') if isinstance(raw_data, dict) else 'Too many requests.'
        else:
            if isinstance(raw_data, dict) and 'detail' in raw_data:
                message = str(raw_data['detail'])
            details = raw_data

        response.data = {
            'error': {
                'code': error_code,
                'message': message,
                'details': details,
            }
        }

    return response
