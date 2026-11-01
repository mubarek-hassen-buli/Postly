from typing import Any
from django.contrib import admin
from django.contrib.admin.models import LogEntry, ADDITION, CHANGE, DELETION
from django.contrib.auth.models import Group
from django.contrib.auth.admin import GroupAdmin as BaseGroupAdmin
from django.utils.html import format_html
from unfold.admin import ModelAdmin
from unfold.decorators import display


# Re-register Group with Unfold styling
admin.site.unregister(Group)


@admin.register(Group)
class GroupAdmin(BaseGroupAdmin, ModelAdmin):
    list_display = ('name', 'users_count')
    search_fields = ('name',)

    @display(description="Users Assigned")
    def users_count(self, obj: Group) -> int:
        return obj.user_set.count()


@admin.register(LogEntry)
class LogEntryAdmin(ModelAdmin):
    list_display = (
        'action_time',
        'user',
        'action_badge',
        'content_type',
        'object_repr',
        'change_message_clean',
    )
    list_filter = ('action_flag', 'content_type', 'action_time')
    search_fields = ('object_repr', 'change_message', 'user__phone_number', 'user__username')
    ordering = ('-action_time',)

    # Make the audit log completely immutable and tamper-proof
    def has_add_permission(self, request: Any) -> bool:
        return False

    def has_change_permission(self, request: Any, obj: Any = None) -> bool:
        return False

    def has_delete_permission(self, request: Any, obj: Any = None) -> bool:
        return False

    @display(
        description="Action",
        label={
            "Created": "success",
            "Updated": "info",
            "Deleted": "danger",
        }
    )
    def action_badge(self, obj: LogEntry) -> str:
        if obj.action_flag == ADDITION:
            return "Created"
        elif obj.action_flag == CHANGE:
            return "Updated"
        elif obj.action_flag == DELETION:
            return "Deleted"
        return "Unknown"

    @display(description="Changes")
    def change_message_clean(self, obj: LogEntry) -> str:
        msg = obj.get_change_message()
        if not msg:
            return "-"
        return (msg[:60] + "...") if len(msg) > 60 else msg

