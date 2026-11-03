from django.urls import path
from .views import (
    DirectMediaUploadView,
    MediaDetailView,
    MediaListView,
    MediaSignatureView,
)

urlpatterns = [
    path('upload-signature/', MediaSignatureView.as_view(), name='media_upload_signature'),
    path('upload/', DirectMediaUploadView.as_view(), name='media_direct_upload'),
    path('', MediaListView.as_view(), name='media_list'),
    path('<uuid:pk>/', MediaDetailView.as_view(), name='media_detail'),
]
