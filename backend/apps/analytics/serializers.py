from rest_framework import serializers


class SummaryMetricsSerializer(serializers.Serializer):
    total_broadcasts = serializers.IntegerField()
    channels_reach = serializers.IntegerField()
    scheduled_queue_count = serializers.IntegerField()
    delivery_success_rate = serializers.FloatField()
    published_count = serializers.IntegerField()
    failed_count = serializers.IntegerField()
    draft_count = serializers.IntegerField()


class PostsTimePointSerializer(serializers.Serializer):
    date = serializers.CharField()
    label = serializers.CharField()
    delivered = serializers.IntegerField()
    scheduled = serializers.IntegerField()
    failed = serializers.IntegerField()


class PostsChartSerializer(serializers.Serializer):
    period = serializers.CharField()
    data = PostsTimePointSerializer(many=True)


class PlatformDistributionSerializer(serializers.Serializer):
    platform = serializers.CharField()
    label = serializers.CharField()
    value = serializers.IntegerField()
    color = serializers.CharField()
    percentage = serializers.FloatField()


class EngagementMetricsSerializer(serializers.Serializer):
    total_targets_reached = serializers.IntegerField()
    average_reach_per_broadcast = serializers.FloatField()
    delivery_reliability_score = serializers.FloatField()


class DashboardAnalyticsResponseSerializer(serializers.Serializer):
    period = serializers.CharField()
    summary = SummaryMetricsSerializer()
    posts_chart = PostsChartSerializer()
    platform_distribution = PlatformDistributionSerializer(many=True)
    engagement_metrics = EngagementMetricsSerializer()
