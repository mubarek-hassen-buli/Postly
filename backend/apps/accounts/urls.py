from django.urls import path
from .views import (
    DisconnectTelegramView,
    LogoutAllView,
    LogoutView,
    SendCodeView,
    UserMeView,
    VerifyCodeView,
    VerifyPasswordView,
)

urlpatterns = [
    # Telegram MTProto Authentication Flow
    path('telegram/send-code/', SendCodeView.as_view(), name='auth_send_code'),
    path('telegram/verify-code/', VerifyCodeView.as_view(), name='auth_verify_code'),
    path('telegram/verify-password/', VerifyPasswordView.as_view(), name='auth_verify_password'),
    path('telegram/disconnect/', DisconnectTelegramView.as_view(), name='auth_disconnect_telegram'),

    # Profile & Knox Token Management
    path('me/', UserMeView.as_view(), name='auth_me'),
    path('logout/', LogoutView.as_view(), name='knox_logout'),
    path('logout-all/', LogoutAllView.as_view(), name='knox_logout_all'),
]
