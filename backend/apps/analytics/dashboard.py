import time
from typing import Any, Dict
from django.db import connection
from django.db.models import Sum
from django.core.cache import cache
from django.contrib.auth import get_user_model
from django.utils import timezone

from apps.accounts.models import TelegramSession
from apps.posts.models import Post, PostChannelTarget
from apps.channels.models import Channel
from apps.integrations.models import LinkedInAccount

User = get_user_model()


def dashboard_callback(request: Any, context: Dict[str, Any]) -> Dict[str, Any]:
    """
    Computes system-wide observability and health KPIs for the Super Admin Portal.
    Injected into Unfold admin index context via UNFOLD['DASHBOARD_CALLBACK'].
    """
    try:
        # 1. User & Session Health
        total_users = User.objects.count()
        staff_users = User.objects.filter(is_staff=True).count()
        active_users_7d = User.objects.filter(
            last_login__gte=timezone.now() - timezone.timedelta(days=7)
        ).count()

        total_sessions = TelegramSession.objects.count()
        authenticated_sessions = TelegramSession.objects.filter(
            auth_state=TelegramSession.AuthState.AUTHENTICATED
        ).count()
        pending_sessions = TelegramSession.objects.exclude(
            auth_state=TelegramSession.AuthState.AUTHENTICATED
        ).count()

        connected_linkedin = LinkedInAccount.objects.filter(is_active=True).count()

        # 2. Broadcast & Queue Observability
        total_posts = Post.objects.count()
        published_posts = Post.objects.filter(status=Post.Status.PUBLISHED).count()
        scheduled_posts = Post.objects.filter(status=Post.Status.SCHEDULED).count()
        publishing_posts = Post.objects.filter(status=Post.Status.PUBLISHING).count()
        failed_posts = Post.objects.filter(status=Post.Status.FAILED).count()

        success_rate = (
            round((published_posts / (total_posts - scheduled_posts)) * 100, 1)
            if (total_posts - scheduled_posts) > 0
            else 100.0
        )

        total_channel_deliveries = PostChannelTarget.objects.count()
        failed_deliveries = PostChannelTarget.objects.filter(
            status=PostChannelTarget.DeliveryStatus.FAILED
        ).count()

        # 3. Channel Network Oversight
        total_channels = Channel.objects.count()
        can_post_channels = Channel.objects.filter(can_post_messages=True).count()
        total_members_agg = Channel.objects.aggregate(total=Sum('member_count'))
        total_members_reach = total_members_agg.get('total') or 0

        # 4. Infrastructure Health Diagnostics
        db_start = time.perf_counter()
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
        db_latency_ms = round((time.perf_counter() - db_start) * 1000, 2)
        db_healthy = True
    except Exception as exc:
        db_healthy = False
        db_latency_ms = -1
        total_users = 0
        staff_users = 0
        active_users_7d = 0
        total_sessions = 0
        authenticated_sessions = 0
        pending_sessions = 0
        connected_linkedin = 0
        total_posts = 0
        published_posts = 0
        scheduled_posts = 0
        publishing_posts = 0
        failed_posts = 0
        success_rate = 0.0
        total_channel_deliveries = 0
        failed_deliveries = 0
        total_channels = 0
        can_post_channels = 0
        total_members_reach = 0

    # Redis / Cache Check
    cache_start = time.perf_counter()
    try:
        cache_key = "admin_dashboard_ping_test"
        cache.set(cache_key, "pong", timeout=10)
        cache_val = cache.get(cache_key)
        cache_latency_ms = round((time.perf_counter() - cache_start) * 1000, 2)
        cache_healthy = cache_val == "pong"
    except Exception:
        cache_healthy = False
        cache_latency_ms = -1

    # Format numbers for clean presentation
    def format_count(n: int) -> str:
        if n >= 1_000_000:
            return f"{n / 1_000_000:.1f}M"
        if n >= 1_000:
            return f"{n / 1_000:.1f}K"
        return f"{n:,}"

    context.update({
        "kpi": {
            "users": {
                "total": total_users,
                "staff": staff_users,
                "active_7d": active_users_7d,
                "sessions_authenticated": authenticated_sessions,
                "sessions_pending": pending_sessions,
                "linkedin_connected": connected_linkedin,
            },
            "broadcasts": {
                "total": total_posts,
                "published": published_posts,
                "scheduled": scheduled_posts,
                "publishing": publishing_posts,
                "failed": failed_posts,
                "success_rate": success_rate,
                "total_deliveries": total_channel_deliveries,
                "failed_deliveries": failed_deliveries,
            },
            "channels": {
                "total": total_channels,
                "can_post": can_post_channels,
                "reach": format_count(total_members_reach),
                "raw_reach": total_members_reach,
            },
            "diagnostics": {
                "db_healthy": db_healthy,
                "db_latency_ms": db_latency_ms,
                "db_vendor": connection.vendor,
                "cache_healthy": cache_healthy,
                "cache_latency_ms": cache_latency_ms,
            },
        }
    })

    return context

