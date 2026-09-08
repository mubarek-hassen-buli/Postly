import datetime
from typing import Any, Dict, List
from django.utils import timezone
from django.db.models import Count, Q

from apps.posts.models import Post, PostChannelTarget
from apps.channels.models import Channel
from apps.integrations.models import LinkedInAccount


class DashboardAnalyticsService:
    """
    Computes analytical metrics, time-series distributions, and platform
    breakdowns for a Postly user's social broadcasting dashboard.
    """

    @classmethod
    def get_dashboard_analytics(cls, user, period: str = '7d') -> Dict[str, Any]:
        """
        Calculates and returns a comprehensive analytics payload for the user dashboard.
        """
        now = timezone.now()
        period_days = 7
        if period == '30d':
            period_days = 30
        elif period == 'all':
            period_days = 90

        start_date = (now - datetime.timedelta(days=period_days - 1)).replace(
            hour=0, minute=0, second=0, microsecond=0
        )

        user_posts = Post.objects.filter(user=user)

        # 1. High-Level KPI Summary
        total_broadcasts = user_posts.count()
        published_count = user_posts.filter(status=Post.PostStatus.PUBLISHED).count()
        scheduled_queue_count = user_posts.filter(status=Post.PostStatus.SCHEDULED).count()
        failed_count = user_posts.filter(status=Post.PostStatus.FAILED).count()
        draft_count = user_posts.filter(status=Post.PostStatus.DRAFT).count()

        telegram_channels_count = Channel.objects.filter(user=user).count()
        linkedin_accounts_count = LinkedInAccount.objects.filter(user=user, is_active=True).count()
        channels_reach = telegram_channels_count + linkedin_accounts_count

        total_dispatched = published_count + failed_count
        if total_dispatched > 0:
            delivery_success_rate = round((published_count / total_dispatched) * 100, 1)
        else:
            delivery_success_rate = 100.0

        summary = {
            'total_broadcasts': total_broadcasts,
            'channels_reach': channels_reach,
            'scheduled_queue_count': scheduled_queue_count,
            'delivery_success_rate': delivery_success_rate,
            'published_count': published_count,
            'failed_count': failed_count,
            'draft_count': draft_count,
        }

        # 2. Time-Series Posts Activity (for Stacked Bar / Posts Chart)
        posts_chart_data = cls._generate_timeseries_data(user_posts, start_date, period_days, now)

        # 3. Platform Distribution (for Donut / Pie Chart)
        platform_distribution = cls._generate_platform_distribution(user_posts, user)

        # 4. Engagement & Delivery Reliability Metrics
        engagement_metrics = cls._generate_engagement_metrics(user, user_posts, published_count, delivery_success_rate)

        return {
            'period': period,
            'summary': summary,
            'posts_chart': {
                'period': period,
                'data': posts_chart_data,
            },
            'platform_distribution': platform_distribution,
            'engagement_metrics': engagement_metrics,
        }

    @classmethod
    def _generate_timeseries_data(cls, user_posts, start_date: datetime.datetime, days: int, now: datetime.datetime) -> List[Dict[str, Any]]:
        """
        Builds daily time-series buckets with counts for delivered, scheduled, and failed broadcasts.
        """
        data = []
        posts_in_period = user_posts.filter(created_at__gte=start_date)

        for i in range(days):
            day_start = (start_date + datetime.timedelta(days=i)).date()
            is_today = (day_start == now.date())
            label = "Today" if is_today else day_start.strftime("%b %d" if days > 7 else "%a")

            # Match posts for this day
            day_posts = [
                p for p in posts_in_period
                if (p.scheduled_for and p.scheduled_for.date() == day_start)
                or (p.published_at and p.published_at.date() == day_start)
                or (p.created_at.date() == day_start)
            ]

            delivered = sum(1 for p in day_posts if p.status == Post.PostStatus.PUBLISHED)
            scheduled = sum(1 for p in day_posts if p.status == Post.PostStatus.SCHEDULED)
            failed = sum(1 for p in day_posts if p.status == Post.PostStatus.FAILED)

            data.append({
                'date': day_start.isoformat(),
                'label': label,
                'delivered': delivered,
                'scheduled': scheduled,
                'failed': failed,
            })

        return data

    @classmethod
    def _generate_platform_distribution(cls, user_posts, user) -> List[Dict[str, Any]]:
        """
        Computes broadcast distribution across supported platforms (Telegram, LinkedIn, etc.)
        in a format directly consumable by gifted-charts PieChart.
        """
        # Count target deliveries
        telegram_targets_count = PostChannelTarget.objects.filter(post__user=user).count()
        total_posts_count = user_posts.count()

        # Posts with 0 targets are counted as LinkedIn (or Direct integration)
        linkedin_posts_count = user_posts.filter(targets__isnull=True).count()
        if telegram_targets_count == 0 and linkedin_posts_count == 0 and total_posts_count > 0:
            telegram_targets_count = total_posts_count

        total_volume = telegram_targets_count + linkedin_posts_count
        if total_volume == 0:
            total_volume = 1

        tg_pct = round((telegram_targets_count / total_volume) * 100, 1)
        li_pct = round(100.0 - tg_pct, 1) if telegram_targets_count > 0 and linkedin_posts_count > 0 else (100.0 if linkedin_posts_count > 0 else 0.0)

        distribution = [
            {
                'platform': 'TELEGRAM',
                'label': 'Telegram',
                'value': telegram_targets_count,
                'color': '#2AABEE',
                'percentage': tg_pct if telegram_targets_count > 0 else 100.0 if total_posts_count == 0 else 0.0,
            },
            {
                'platform': 'LINKEDIN',
                'label': 'LinkedIn',
                'value': linkedin_posts_count,
                'color': '#0A66C2',
                'percentage': li_pct,
            },
        ]

        return distribution

    @classmethod
    def _generate_engagement_metrics(cls, user, user_posts, published_count: int, delivery_rate: float) -> Dict[str, Any]:
        """
        Computes aggregate reach and reliability statistics.
        """
        successful_targets = PostChannelTarget.objects.filter(
            post__user=user,
            status=PostChannelTarget.TargetStatus.SUCCESS
        ).count()

        avg_reach = round(successful_targets / published_count, 1) if published_count > 0 else 1.0

        return {
            'total_targets_reached': successful_targets,
            'average_reach_per_broadcast': avg_reach,
            'delivery_reliability_score': delivery_rate,
        }
