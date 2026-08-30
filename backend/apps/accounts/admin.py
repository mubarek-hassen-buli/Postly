from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import TelegramSession, User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('phone_number', 'username', 'first_name', 'last_name', 'is_staff', 'is_active', 'created_at')
    list_filter = ('is_staff', 'is_active', 'is_superuser', 'created_at')
    search_fields = ('phone_number', 'username', 'first_name', 'last_name')
    ordering = ('-created_at',)

    fieldsets = (
        (None, {'fields': ('phone_number', 'password')}),
        ('Personal Info', {'fields': ('username', 'first_name', 'last_name', 'avatar_url')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'created_at', 'updated_at')}),
    )
    readonly_fields = ('created_at', 'updated_at', 'last_login')

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('phone_number', 'first_name', 'last_name', 'password', 'is_staff', 'is_superuser'),
        }),
    )


@admin.register(TelegramSession)
class TelegramSessionAdmin(admin.ModelAdmin):
    list_display = ('phone_number', 'user', 'telegram_user_id', 'username', 'auth_state', 'updated_at', 'created_at')
    list_filter = ('auth_state', 'created_at')
    search_fields = ('phone_number', 'username', 'telegram_user_id', 'user__phone_number')
    readonly_fields = ('created_at', 'updated_at')
