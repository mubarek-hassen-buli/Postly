from django.urls import path
from .views import (
    LinkedInAuthorizeView,
    LinkedInCallbackView,
    LinkedInDisconnectView,
    LinkedInPublishView,
    LinkedInStatusView,
)

urlpatterns = [
    path('authorize/', LinkedInAuthorizeView.as_view(), name='linkedin_authorize'),
    path('callback/', LinkedInCallbackView.as_view(), name='linkedin_callback'),
    path('status/', LinkedInStatusView.as_view(), name='linkedin_status'),
    path('disconnect/', LinkedInDisconnectView.as_view(), name='linkedin_disconnect'),
    path('publish/', LinkedInPublishView.as_view(), name='linkedin_publish'),
]
