import logging
import time
import uuid
from typing import Callable
from django.http import HttpRequest, HttpResponse

logger = logging.getLogger('apps.request')


class RequestLoggingMiddleware:
    """
    Middleware that assigns a unique request ID (UUID4) to each incoming HTTP request,
    tracks response latency, logs structured request/response metrics, and attaches
    the X-Request-ID header to the outgoing HTTP response.
    """

    def __init__(self, get_response: Callable[[HttpRequest], HttpResponse]) -> None:
        self.get_response = get_response

    def __call__(self, request: HttpRequest) -> HttpResponse:
        # Extract or generate unique Request ID
        request_id = request.headers.get('X-Request-ID', str(uuid.uuid4()))
        request.request_id = request_id

        start_time = time.perf_counter()

        response = self.get_response(request)

        duration_ms = (time.perf_counter() - start_time) * 1000

        # Attach request ID header to response
        response['X-Request-ID'] = request_id

        # Structured log entry
        log_level = logging.INFO
        if response.status_code >= 500:
            log_level = logging.ERROR
        elif response.status_code >= 400:
            log_level = logging.WARNING

        logger.log(
            log_level,
            f"[{request_id}] {request.method} {request.get_full_path()} "
            f"Status: {response.status_code} Duration: {duration_ms:.2f}ms"
        )

        return response
