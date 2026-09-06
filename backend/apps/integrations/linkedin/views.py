import html
import logging
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.http import HttpResponse
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import LinkedInAccount
from .oauth import LinkedInOAuthError, LinkedInOAuthService
from .publishing import LinkedInPublishingError, LinkedInPublishingService
from .serializers import (
    LinkedInAccountSerializer,
    LinkedInPublishRequestSerializer,
    LinkedInPublishResponseSerializer,
    LinkedInStatusResponseSerializer,
)

logger = logging.getLogger(__name__)
User = get_user_model()


class LinkedInAuthorizeView(APIView):
    """
    Authenticated endpoint providing the LinkedIn OAuth 2.0 authorization URL.
    Used by the mobile client to initiate the OAuth flow.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs) -> Response:
        try:
            auth_url, state = LinkedInOAuthService.get_authorization_url(request.user)
            return Response(
                {
                    'authorization_url': auth_url,
                    'state': state,
                },
                status=status.HTTP_200_OK
            )
        except LinkedInOAuthError as exc:
            return Response(
                {'error': {'code': exc.code, 'message': exc.message, 'details': exc.details}},
                status=status.HTTP_400_BAD_REQUEST
            )


class LinkedInCallbackView(APIView):
    """
    OAuth 2.0 redirect callback endpoint.
    Processes the authorization code from LinkedIn, retrieves member profile info,
    encrypts the tokens, and returns a user-friendly browser landing page with deep-link redirection.
    """
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        error = request.query_params.get('error')
        error_description = request.query_params.get('error_description', '')
        code = request.query_params.get('code')
        state = request.query_params.get('state')

        # Handle user cancellation or LinkedIn rejection
        if error:
            logger.warning(f"LinkedIn OAuth callback error: {error} - {error_description}")
            if request.accepted_renderer.format == 'json' or 'application/json' in request.headers.get('Accept', ''):
                return Response(
                    {'error': {'code': 'OAUTH_DENIED', 'message': error_description or error}},
                    status=status.HTTP_400_BAD_REQUEST
                )
            return self._render_html_response(
                title="Authorization Cancelled",
                message=f"LinkedIn authorization was cancelled: {error_description or error}",
                is_success=False
            )

        if not code or not state:
            return self._render_html_response(
                title="Invalid Request",
                message="Missing authorization code or state parameter.",
                is_success=False
            )

        # Verify state and retrieve user
        try:
            user_id = LinkedInOAuthService.verify_state(state)
            user = User.objects.get(id=user_id)
        except LinkedInOAuthError as exc:
            logger.warning(f"LinkedIn callback state verification failed: {exc.message}")
            return self._render_html_response(title="Session Expired", message=exc.message, is_success=False)
        except User.DoesNotExist:
            return self._render_html_response(title="User Not Found", message="Associated Postly user does not exist.", is_success=False)

        # Atomic replay protection: Prevent duplicate GET requests (e.g. from browser redirects or pre-fetching)
        # from resubmitting the single-use authorization code to LinkedIn, which would cause LinkedIn to revoke the token.
        import hashlib
        code_hash = hashlib.sha256(code.encode('utf-8')).hexdigest()
        code_cache_key = f"linkedin_auth_code_{code_hash}"
        is_first_exchange = cache.add(code_cache_key, str(user.id), timeout=180)

        if not is_first_exchange:
            existing_account = LinkedInAccount.objects.filter(user=user, is_active=True).first()
            if existing_account and not existing_account.is_token_expired:
                logger.info(f"Replay callback for user {user.id}; returning existing active connection without re-submitting code.")
                account = existing_account
            else:
                return self._render_html_response(
                    title="Code Already Used",
                    message="This authorization code has already been used. Please initiate a new connection from Postly Settings.",
                    is_success=False
                )
        else:
            # Exchange code for token and fetch profile
            try:
                token_data = LinkedInOAuthService.exchange_code_for_token(code)
                userinfo = LinkedInOAuthService.fetch_userinfo(token_data['access_token'])
                account = LinkedInOAuthService.save_connection(user, token_data, userinfo)
            except LinkedInOAuthError as exc:
                logger.exception("Failed during LinkedIn token exchange or userinfo retrieval")
                return self._render_html_response(title="Connection Failed", message=exc.message, is_success=False)

        # JSON response for programmatic callers
        if 'application/json' in request.headers.get('Accept', ''):
            return Response(
                {
                    'status': 'SUCCESS',
                    'message': 'LinkedIn account connected successfully.',
                    'account': LinkedInAccountSerializer(account).data,
                },
                status=status.HTTP_200_OK
            )

        # Render sleek browser splash for mobile webview / external browser
        account_name = str(account.name or 'LinkedIn User')
        deep_link = f"postly://oauth/linkedin?status=success&name={urllib_quote(account_name)}"
        return self._render_html_response(
            title="LinkedIn Connected!",
            message=f"Welcome, {account_name}! Your LinkedIn account is now connected to Postly.",
            is_success=True,
            deep_link=deep_link
        )

    def _render_html_response(self, title: str, message: str, is_success: bool, deep_link: str = "") -> HttpResponse:
        safe_title = html.escape(title)
        safe_message = html.escape(message)
        color = "#10B981" if is_success else "#EF4444"
        icon_svg = (
            """<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>"""
            if is_success
            else """<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>"""
        )

        redirect_script = ""
        action_btn = ""
        if deep_link:
            redirect_script = f"""
            <script>
                setTimeout(function() {{
                    window.location.href = "{deep_link}";
                }}, 600);
            </script>
            """
            action_btn = f"""<a href="{deep_link}" class="btn">Return to Postly App</a>"""

        html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{safe_title} | Postly</title>
    <style>
        body {{
            margin: 0;
            padding: 0;
            background: #090D16;
            color: #F8FAFC;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
        }}
        .card {{
            background: #111827;
            border: 1px solid #1F2937;
            border-radius: 20px;
            padding: 40px 32px;
            max-width: 420px;
            width: 90%;
            text-align: center;
            box-shadow: 0 20px 40px rgba(0,0,0,0.5);
        }}
        .icon-wrap {{
            width: 72px;
            height: 72px;
            margin: 0 auto 20px;
            border-radius: 36px;
            background: rgba(16, 185, 129, 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
        }}
        h1 {{
            font-size: 22px;
            margin: 0 0 12px;
            font-weight: 700;
        }}
        p {{
            font-size: 15px;
            color: #94A3B8;
            line-height: 1.5;
            margin: 0 0 24px;
        }}
        .btn {{
            display: inline-block;
            background: #0A66C2;
            color: #FFFFFF;
            font-weight: 600;
            padding: 12px 28px;
            border-radius: 12px;
            text-decoration: none;
            transition: opacity 0.2s;
        }}
        .btn:hover {{
            opacity: 0.9;
        }}
        .subtext {{
            margin-top: 16px;
            font-size: 13px;
            color: #64748B;
        }}
    </style>
    {redirect_script}
</head>
<body>
    <div class="card">
        <div class="icon-wrap" style="background: rgba({'16, 185, 129' if is_success else '239, 68, 68'}, 0.12)">
            {icon_svg}
        </div>
        <h1>{safe_title}</h1>
        <p>{safe_message}</p>
        {action_btn}
        <div class="subtext">You can safely close this browser window.</div>
    </div>
</body>
</html>"""
        return HttpResponse(html_content, content_type='text/html')


def urllib_quote(s: object) -> str:
    import urllib.parse
    return urllib.parse.quote(str(s or ''))


class LinkedInStatusView(APIView):
    """
    Authenticated endpoint returning the current connection status
    and profile information for LinkedIn.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs) -> Response:
        try:
            account = LinkedInAccount.objects.get(user=request.user, is_active=True)
            data = {
                'is_connected': not account.is_token_expired,
                'account': LinkedInAccountSerializer(account).data,
            }
        except LinkedInAccount.DoesNotExist:
            data = {
                'is_connected': False,
                'account': None,
            }

        serializer = LinkedInStatusResponseSerializer(data)
        return Response(serializer.data, status=status.HTTP_200_OK)


class LinkedInDisconnectView(APIView):
    """
    Authenticated endpoint to disconnect and revoke the user's LinkedIn integration.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs) -> Response:
        deleted_count, _ = LinkedInAccount.objects.filter(user=request.user).delete()
        logger.info(f"User {request.user.id} disconnected LinkedIn (records deleted: {deleted_count})")
        return Response(
            {
                'status': 'SUCCESS',
                'message': 'LinkedIn account disconnected successfully.',
            },
            status=status.HTTP_200_OK
        )


class LinkedInPublishView(APIView):
    """
    Direct endpoint for the Expo mobile app to publish a text post to LinkedIn.
    Validates input commentary and dispatches immediately via LinkedIn's Posts API.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs) -> Response:
        serializer = LinkedInPublishRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        text_content = serializer.validated_data['text']

        try:
            result = LinkedInPublishingService.publish_text_post(
                user=request.user,
                text_content=text_content
            )
            response_serializer = LinkedInPublishResponseSerializer(result)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        except LinkedInPublishingError as exc:
            return Response(
                {
                    'error': {
                        'code': exc.code,
                        'message': exc.message,
                        'details': exc.details,
                    }
                },
                status=exc.status_code
            )
