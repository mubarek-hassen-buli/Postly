from django.urls import path
from .views import (
    ChannelDetailView,
    ChannelListView,
    ChannelStatsView,
    ChannelSyncView,
    ChannelToggleSelectionView,
)

urlpatterns = [
    path('', ChannelListView.as_view(), name='channel_list'),
    path('sync/', ChannelSyncView.as_view(), name='channel_sync'),
    path('<uuid:pk>/', ChannelDetailView.as_view(), name='channel_detail'),
    path('<uuid:pk>/toggle-selection/', ChannelToggleSelectionView.as_view(), name='channel_toggle_selection'),
    path('<uuid:pk>/stats/', ChannelStatsView.as_view(), name='channel_stats'),
]
