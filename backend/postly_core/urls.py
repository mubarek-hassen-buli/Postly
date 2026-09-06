"""
Postly URL Configuration.

The `urlpatterns` list routes URLs to views.
All API endpoints are versioned under `/api/v1/`.
"""

from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    # Django Admin Interface
    path('admin/', admin.site.urls),

    # Core System & Health check endpoints
    path('api/v1/', include('apps.common.urls')),

    # Feature domain APIs
    path('api/v1/auth/', include('apps.accounts.urls')),
    path('api/v1/channels/', include('apps.channels.urls')),
    path('api/v1/posts/', include('apps.posts.urls')),
    path('api/v1/media/', include('apps.media.urls')),
    path('api/v1/notifications/', include('apps.notifications.urls')),

    # Platform Integrations (OAuth callbacks & APIs)
    path('api/integrations/', include('apps.integrations.urls')),
    path('api/v1/integrations/', include('apps.integrations.urls')),
]
