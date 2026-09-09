import logging
import urllib.parse
from typing import Any, Dict

import requests
from django.utils import timezone

from ..models import LinkedInAccount

logger = logging.getLogger(__name__)

LINKEDIN_REST_POSTS_URL = "https://api.linkedin.com/rest/posts"
LINKEDIN_UGC_POSTS_URL = "https://api.linkedin.com/v2/ugcPosts"


class LinkedInPublishingError(Exception):
    """Exception raised when LinkedIn post dispatch fails."""
    def __init__(self, message: str, code: str = "PUBLISHING_FAILED", status_code: int = 400, details: Any = None):
        super().__init__(message)
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details


class LinkedInPublishingService:
    """
    Executes authenticated post publishing to LinkedIn on behalf of connected users
    utilizing the w_member_social permission.
    """

    @classmethod
    def publish_text_post(cls, user, text_content: str) -> Dict[str, Any]:
        """
        Publishes a plain text commentary post to the user's LinkedIn feed.
        """
        text = text_content.strip()
        if not text:
            raise LinkedInPublishingError("Post text content cannot be empty.", code="EMPTY_CONTENT", status_code=400)

        # 1. Fetch connected account
        try:
            account = LinkedInAccount.objects.get(user=user, is_active=True)
        except LinkedInAccount.DoesNotExist:
            raise LinkedInPublishingError(
                "No active LinkedIn account is connected to your Postly profile. Please connect LinkedIn in Settings.",
                code="NOT_CONNECTED",
                status_code=404
            )

        # 2. Check token expiration
        if account.is_token_expired:
            raise LinkedInPublishingError(
                "LinkedIn access token has expired. Please reconnect your LinkedIn account.",
                code="TOKEN_EXPIRED",
                status_code=401
            )

        # 3. Decrypt access token
        try:
            access_token = account.get_access_token()
        except Exception as exc:
            logger.exception(f"Failed to decrypt LinkedIn token for user {user.id}")
            raise LinkedInPublishingError("Internal credential decryption error.", code="CRYPTO_ERROR", status_code=500)

        author_urn = account.person_urn

        # 4. Attempt dispatch via modern LinkedIn Posts API
        try:
            return cls._publish_via_posts_api(access_token, author_urn, text)
        except LinkedInPublishingError as primary_err:
            if "revoked" in primary_err.message.lower():
                account.is_active = False
                account.save(update_fields=['is_active'])
                raise LinkedInPublishingError(
                    "Your LinkedIn access token was revoked by LinkedIn. Please reconnect your account in Settings.",
                    code="TOKEN_REVOKED",
                    status_code=400
                )
            logger.warning(f"LinkedIn REST Posts API returned error: {primary_err.message}. Attempting UGC fallback...")
            try:
                return cls._publish_via_ugc_api(access_token, author_urn, text)
            except LinkedInPublishingError as ugc_err:
                if "revoked" in ugc_err.message.lower():
                    account.is_active = False
                    account.save(update_fields=['is_active'])
                    raise LinkedInPublishingError(
                        "Your LinkedIn access token was revoked by LinkedIn. Please reconnect your account in Settings.",
                        code="TOKEN_REVOKED",
                        status_code=400
                    )
                # Re-raise with 400 status code to protect client session
                primary_err.status_code = 400
                raise primary_err

    @classmethod
    def _publish_via_posts_api(cls, access_token: str, author_urn: str, text: str) -> Dict[str, Any]:
        """
        Publishes via LinkedIn REST Posts API (https://api.linkedin.com/rest/posts).
        """
        headers = {
            'Authorization': f'Bearer {access_token}',
            'LinkedIn-Version': '202401',
            'X-Restli-Protocol-Version': '2.0.0',
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        }
        payload = {
            'author': author_urn,
            'commentary': text,
            'visibility': 'PUBLIC',
            'distribution': {
                'feedDistribution': 'MAIN_FEED',
                'targetEntities': [],
                'thirdPartyDistributionChannels': [],
            },
            'lifecycleState': 'PUBLISHED',
            'isReshareDisabledByAuthor': False,
        }

        try:
            response = requests.post(LINKEDIN_REST_POSTS_URL, json=payload, headers=headers, timeout=20)
        except requests.RequestException as exc:
            logger.exception("Network failure dispatching LinkedIn post")
            raise LinkedInPublishingError(f"Network error communicating with LinkedIn: {str(exc)}", code="NETWORK_ERROR", status_code=502)

        if response.status_code in [200, 201]:
            post_urn = response.headers.get('x-restli-id') or response.headers.get('x-linkedin-id')
            if not post_urn and response.content:
                try:
                    post_urn = response.json().get('id')
                except Exception:
                    pass

            return {
                'status': 'SUCCESS',
                'platform': 'LINKEDIN',
                'post_urn': post_urn or f"{author_urn}:post:{timezone.now().timestamp()}",
                'published_at': timezone.now().isoformat(),
                'message': 'Post published successfully to LinkedIn.',
            }

        # Parse error
        err_msg = response.text
        try:
            err_json = response.json()
            err_msg = err_json.get('message') or err_json.get('serviceErrorCode') or response.text
        except Exception:
            err_json = None

        logger.error(f"LinkedIn Posts API rejected request ({response.status_code}): {err_msg}")
        raise LinkedInPublishingError(
            f"LinkedIn post failed: {err_msg}",
            code="API_ERROR",
            status_code=response.status_code,
            details=err_json
        )

    @classmethod
    def _publish_via_ugc_api(cls, access_token: str, author_urn: str, text: str) -> Dict[str, Any]:
        """
        Publishes via legacy LinkedIn UGC Posts API (https://api.linkedin.com/v2/ugcPosts).
        """
        headers = {
            'Authorization': f'Bearer {access_token}',
            'X-Restli-Protocol-Version': '2.0.0',
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        }
        payload = {
            'author': author_urn,
            'lifecycleState': 'PUBLISHED',
            'specificContent': {
                'com.linkedin.ugc.ShareContent': {
                    'shareCommentary': {
                        'text': text
                    },
                    'shareMediaCategory': 'NONE'
                }
            },
            'visibility': {
                'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
            }
        }

        try:
            response = requests.post(LINKEDIN_UGC_POSTS_URL, json=payload, headers=headers, timeout=20)
        except requests.RequestException as exc:
            raise LinkedInPublishingError(f"Network error during UGC post: {str(exc)}", code="NETWORK_ERROR", status_code=502)

        if response.status_code in [200, 201]:
            post_urn = response.headers.get('x-restli-id')
            if not post_urn and response.content:
                try:
                    post_urn = response.json().get('id')
                except Exception:
                    pass

            return {
                'status': 'SUCCESS',
                'platform': 'LINKEDIN',
                'post_urn': post_urn or f"{author_urn}:ugc:{timezone.now().timestamp()}",
                'published_at': timezone.now().isoformat(),
                'message': 'Post published successfully to LinkedIn (via UGC).',
            }

        err_msg = response.text
        try:
            err_json = response.json()
            err_msg = err_json.get('message') or response.text
        except Exception:
            err_json = None

        raise LinkedInPublishingError(
            f"LinkedIn UGC post failed: {err_msg}",
            code="UGC_API_ERROR",
            status_code=response.status_code,
            details=err_json
        )

    @classmethod
    def delete_post(cls, user, post_urn: str) -> Dict[str, Any]:
        """
        Deletes a published post from LinkedIn using the LinkedIn REST Posts API
        (with UGC API fallback) using the user's w_member_social token.
        Treats 204, 200, and 404 (already deleted) as success.
        """
        urn = (post_urn or "").strip()
        if not urn:
            logger.info("delete_post skipped: No LinkedIn post URN provided.")
            return {'status': 'SKIPPED', 'message': 'No LinkedIn post URN provided.'}

        # 1. Fetch connected account
        try:
            account = LinkedInAccount.objects.get(user=user, is_active=True)
        except LinkedInAccount.DoesNotExist:
            logger.warning(f"Cannot delete LinkedIn post {urn}: No active LinkedIn account for user {user.id}")
            return {'status': 'SKIPPED', 'message': 'No active LinkedIn account connected.'}

        if account.is_token_expired:
            logger.warning(f"Cannot delete LinkedIn post {urn}: LinkedIn token expired for user {user.id}")
            return {'status': 'FAILED', 'message': 'LinkedIn access token expired.'}

        try:
            access_token = account.get_access_token()
        except Exception as exc:
            logger.exception(f"Failed to decrypt LinkedIn token for user {user.id}")
            return {'status': 'FAILED', 'message': f'Credential decryption error: {str(exc)}'}

        encoded_urn = urllib.parse.quote(urn, safe='')
        rest_url = f"{LINKEDIN_REST_POSTS_URL}/{encoded_urn}"
        headers = {
            'Authorization': f'Bearer {access_token}',
            'LinkedIn-Version': '202401',
            'X-Restli-Protocol-Version': '2.0.0',
        }

        logger.info(f"Attempting remote LinkedIn deletion for post URN {urn} via REST Posts API...")
        try:
            resp = requests.delete(rest_url, headers=headers, timeout=8)
            if resp.status_code in [200, 204]:
                logger.info(f"Successfully deleted post {urn} from LinkedIn via REST API ({resp.status_code})")
                return {'status': 'SUCCESS', 'message': 'LinkedIn post deleted successfully.', 'post_urn': urn}
            elif resp.status_code == 404:
                logger.info(f"Post {urn} was already deleted or not found on LinkedIn (404)")
                return {'status': 'SUCCESS', 'message': 'Post was already deleted or not found on LinkedIn.', 'post_urn': urn}
            else:
                logger.warning(f"LinkedIn REST delete returned {resp.status_code}: {resp.text}. Attempting UGC fallback...")
        except requests.RequestException as exc:
            logger.warning(f"Network error during LinkedIn REST delete: {str(exc)}. Attempting UGC fallback...")

        # Fallback to UGC delete
        ugc_url = f"{LINKEDIN_UGC_POSTS_URL}/{encoded_urn}"
        ugc_headers = {
            'Authorization': f'Bearer {access_token}',
            'X-Restli-Protocol-Version': '2.0.0',
        }
        try:
            ugc_resp = requests.delete(ugc_url, headers=ugc_headers, timeout=8)
            if ugc_resp.status_code in [200, 204, 404]:
                logger.info(f"Successfully deleted post {urn} from LinkedIn via UGC fallback ({ugc_resp.status_code})")
                return {'status': 'SUCCESS', 'message': 'LinkedIn post deleted successfully.', 'post_urn': urn}
            else:
                logger.error(f"LinkedIn UGC delete also failed ({ugc_resp.status_code}): {ugc_resp.text}")
                return {'status': 'FAILED', 'message': f"LinkedIn rejected deletion: {ugc_resp.text}", 'status_code': ugc_resp.status_code}
        except requests.RequestException as exc:
            logger.exception("Network error during LinkedIn UGC delete")
            return {'status': 'FAILED', 'message': f"Network error during deletion: {str(exc)}"}

