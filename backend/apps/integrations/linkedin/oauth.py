import logging
import urllib.parse
import uuid
from datetime import timedelta
from typing import Any, Dict, Tuple

import requests
from django.conf import settings
from django.core import signing
from django.utils import timezone

from ..models import LinkedInAccount

logger = logging.getLogger(__name__)

LINKEDIN_AUTH_URL = "https://www.linkedin.com/oauth/v2/authorization"
LINKEDIN_TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken"
LINKEDIN_USERINFO_URL = "https://api.linkedin.com/v2/userinfo"
DEFAULT_SCOPES = "openid profile email w_member_social"
STATE_SALT = "linkedin-oauth-state-v1"
STATE_MAX_AGE_SECONDS = 600  # 10 minutes


class LinkedInOAuthError(Exception):
    """Base exception for LinkedIn OAuth failures."""
    def __init__(self, message: str, code: str = "OAUTH_ERROR", details: Any = None):
        super().__init__(message)
        self.message = message
        self.code = code
        self.details = details


class LinkedInOAuthService:
    """
    Manages the complete LinkedIn OAuth 2.0 and OpenID Connect authorization cycle.
    """

    @classmethod
    def generate_state(cls, user_id: str) -> str:
        """
        Creates a cryptographically signed, tamper-proof state string containing
        the user ID and a unique CSRF nonce with an expiration timestamp.
        """
        payload = {
            'user_id': user_id,
            'nonce': uuid.uuid4().hex,
            'ts': timezone.now().timestamp(),
        }
        return signing.dumps(payload, salt=STATE_SALT)

    @classmethod
    def verify_state(cls, state: str) -> str:
        """
        Verifies the signed state string and returns the associated user ID.
        Raises LinkedInOAuthError if expired, tampered with, or invalid.
        """
        if not state:
            raise LinkedInOAuthError("Missing OAuth state parameter.", code="INVALID_STATE")
        try:
            payload = signing.loads(state, salt=STATE_SALT, max_age=STATE_MAX_AGE_SECONDS)
            return payload['user_id']
        except signing.SignatureExpired:
            raise LinkedInOAuthError("OAuth authorization session expired. Please try connecting again.", code="STATE_EXPIRED")
        except (signing.BadSignature, Exception) as exc:
            raise LinkedInOAuthError("Invalid or tampered OAuth state parameter.", code="INVALID_STATE", details=str(exc))

    @classmethod
    def get_authorization_url(cls, user) -> Tuple[str, str]:
        """
        Builds the LinkedIn OAuth 2.0 authorization URL for the user.
        Returns: (authorization_url, state)
        """
        client_id = getattr(settings, 'LINKEDIN_CLIENT_ID', '')
        redirect_uri = getattr(settings, 'LINKEDIN_REDIRECT_URI', 'http://localhost:8000/api/integrations/linkedin/callback/')

        if not client_id:
            raise LinkedInOAuthError("LINKEDIN_CLIENT_ID is not configured on the server.", code="CONFIG_ERROR")

        state = cls.generate_state(str(user.id))
        params = {
            'response_type': 'code',
            'client_id': client_id,
            'redirect_uri': redirect_uri,
            'state': state,
            'scope': DEFAULT_SCOPES,
        }
        auth_url = f"{LINKEDIN_AUTH_URL}?{urllib.parse.urlencode(params)}"
        return auth_url, state

    @classmethod
    def exchange_code_for_token(cls, code: str) -> Dict[str, Any]:
        """
        Exchanges an authorization code for an OAuth 2.0 access token via POST.
        """
        client_id = getattr(settings, 'LINKEDIN_CLIENT_ID', '')
        client_secret = getattr(settings, 'LINKEDIN_CLIENT_SECRET', '')
        redirect_uri = getattr(settings, 'LINKEDIN_REDIRECT_URI', 'http://localhost:8000/api/integrations/linkedin/callback/')

        if not client_id or not client_secret:
            raise LinkedInOAuthError("LinkedIn client credentials are not configured on the server.", code="CONFIG_ERROR")

        payload = {
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': redirect_uri,
            'client_id': client_id,
            'client_secret': client_secret,
        }
        headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
        }

        try:
            response = requests.post(LINKEDIN_TOKEN_URL, data=payload, headers=headers, timeout=15)
            response_data = response.json()
        except requests.RequestException as exc:
            logger.exception("Failed to connect to LinkedIn token endpoint")
            raise LinkedInOAuthError(f"Network error connecting to LinkedIn: {str(exc)}", code="NETWORK_ERROR")
        except ValueError:
            raise LinkedInOAuthError("Invalid response received from LinkedIn token endpoint.", code="INVALID_RESPONSE")

        if response.status_code != 200 or 'access_token' not in response_data:
            error_desc = response_data.get('error_description') or response_data.get('error') or response.text
            logger.error(f"LinkedIn token exchange failed ({response.status_code}): {error_desc}")
            raise LinkedInOAuthError(
                f"Failed to exchange authorization code: {error_desc}",
                code="TOKEN_EXCHANGE_FAILED",
                details=response_data
            )

        return response_data

    @classmethod
    def fetch_userinfo(cls, access_token: str) -> Dict[str, Any]:
        """
        Retrieves OpenID Connect profile and email info for the authenticated member.
        """
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Accept': 'application/json',
        }

        try:
            response = requests.get(LINKEDIN_USERINFO_URL, headers=headers, timeout=15)
            response_data = response.json()
        except requests.RequestException as exc:
            logger.exception("Failed to connect to LinkedIn userinfo endpoint")
            raise LinkedInOAuthError(f"Network error fetching user profile: {str(exc)}", code="NETWORK_ERROR")
        except ValueError:
            raise LinkedInOAuthError("Invalid JSON received from LinkedIn userinfo.", code="INVALID_RESPONSE")

        if response.status_code != 200 or 'sub' not in response_data:
            error_msg = response_data.get('message') or response.text
            logger.error(f"LinkedIn userinfo call failed ({response.status_code}): {error_msg}")
            raise LinkedInOAuthError(f"Failed to fetch LinkedIn profile: {error_msg}", code="USERINFO_FAILED")

        return response_data

    @classmethod
    def save_connection(cls, user, token_data: Dict[str, Any], userinfo: Dict[str, Any]) -> LinkedInAccount:
        """
        Encrypts tokens and creates/updates the LinkedInAccount record for the user.
        """
        access_token = token_data['access_token']
        refresh_token = token_data.get('refresh_token')
        expires_in = int(token_data.get('expires_in', 5184000))  # Default 60 days if unspecified
        expires_at = timezone.now() + timedelta(seconds=expires_in)
        granted_scopes = token_data.get('scope', DEFAULT_SCOPES)

        sub_id = userinfo.get('sub', '')
        name = userinfo.get('name', '')
        given_name = userinfo.get('given_name', '')
        family_name = userinfo.get('family_name', '')
        email = userinfo.get('email')
        picture_url = userinfo.get('picture')

        account, created = LinkedInAccount.objects.get_or_create(
            user=user,
            defaults={
                'linkedin_member_id': sub_id,
                'name': name,
                'given_name': given_name,
                'family_name': family_name,
                'email': email,
                'picture_url': picture_url,
                'scopes': granted_scopes,
                'token_expires_at': expires_at,
                'is_active': True,
                'last_synced_at': timezone.now(),
            }
        )

        account.linkedin_member_id = sub_id
        account.name = name
        account.given_name = given_name
        account.family_name = family_name
        account.email = email
        account.picture_url = picture_url
        account.scopes = granted_scopes
        account.token_expires_at = expires_at
        account.is_active = True
        account.last_synced_at = timezone.now()

        # Encrypt tokens symmetrically using Fernet
        account.set_access_token(access_token)
        if refresh_token:
            account.set_refresh_token(refresh_token)

        account.save()
        logger.info(f"Successfully saved LinkedIn connection for user {user.id} (LinkedIn sub: {sub_id})")
        return account
