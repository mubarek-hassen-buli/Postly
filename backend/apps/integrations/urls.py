from django.urls import include, path

urlpatterns = [
    path('linkedin/', include('apps.integrations.linkedin.urls')),
]
