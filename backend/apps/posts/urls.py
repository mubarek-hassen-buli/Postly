from django.urls import path
from .views import (
    PostCancelScheduleView,
    PostDetailView,
    PostListCreateView,
    PostPublishNowView,
)

urlpatterns = [
    path('', PostListCreateView.as_view(), name='post_list_create'),
    path('<uuid:pk>/', PostDetailView.as_view(), name='post_detail'),
    path('<uuid:pk>/publish-now/', PostPublishNowView.as_view(), name='post_publish_now'),
    path('<uuid:pk>/cancel-schedule/', PostCancelScheduleView.as_view(), name='post_cancel_schedule'),
]
