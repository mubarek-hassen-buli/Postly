import uuid
from django.db import models


class TimeStampedUUIDModel(models.Model):
    """
    Abstract base model that provides a UUID primary key,
    creation timestamp, and modification timestamp.
    """
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text="Globally unique identifier."
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True,
        help_text="Timestamp when the record was created."
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Timestamp when the record was last modified."
    )

    class Meta:
        abstract = True
        ordering = ['-created_at']
