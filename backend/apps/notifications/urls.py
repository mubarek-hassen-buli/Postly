from django.urls import path
from .views import (
    DeviceRegisterView,
    DeviceUnregisterView,
    NotificationListView,
    NotificationMarkReadView,
)

urlpatterns = [
    path('devices/', DeviceRegisterView.as_view(), name='device_register'),
    path('devices/unregister/', DeviceUnregisterView.as_view(), name='device_unregister'),
    path('', NotificationListView.as_view(), name='notification_list'),
    path('mark-read/', NotificationMarkReadView.as_view(), name='notification_mark_read'),
]
