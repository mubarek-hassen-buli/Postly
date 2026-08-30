import logging
from celery import shared_task
from django.utils import timezone
from postly_core.celery import app as celery_app
from .models import Post

logger = logging.getLogger(__name__)


@shared_task(
    bind=True,
    max_retries=3,
    default_retry_delay=60,
    acks_late=True,
    name='apps.posts.tasks.publish_scheduled_post_task'
)
def publish_scheduled_post_task(self, post_id: str) -> dict:
    """
    Celery task executed when a scheduled post is due for publishing.
    """
    from .services import TelegramPublishingService

    logger.info(f"[Celery Worker] Executing scheduled publishing for post {post_id} (Task ID: {self.request.id})")

    try:
        result = TelegramPublishingService.publish_post(post_id=post_id)
        logger.info(f"[Celery Worker] Publishing result for post {post_id}: {result}")
        return result
    except Exception as exc:
        logger.exception(f"[Celery Worker] Exception during publishing post {post_id}: {str(exc)}")
        # If unexpected runtime crash, retry with exponential backoff
        raise self.retry(exc=exc)


@shared_task(name='apps.posts.tasks.reconcile_scheduled_posts')
def reconcile_scheduled_posts() -> int:
    """
    Periodic beat task reconciling any scheduled posts that missed execution
    due to temporary worker downtime or broker reconnections.
    """
    now = timezone.now()
    overdue_posts = Post.objects.filter(
        status=Post.PostStatus.SCHEDULED,
        scheduled_for__lte=now
    )

    reconciled_count = 0
    for post in overdue_posts:
        logger.info(f"[Reconciliation Beat] Queuing overdue post {post.id} (Scheduled for: {post.scheduled_for})")
        publish_scheduled_post_task.delay(str(post.id))
        reconciled_count += 1

    return reconciled_count


def schedule_post_celery_task(post: Post) -> str:
    """
    Schedules a Celery ETA task for the specified Post and returns the task ID.
    """
    if not post.scheduled_for:
        raise ValueError("Cannot schedule post without scheduled_for datetime.")

    async_result = publish_scheduled_post_task.apply_async(
        args=[str(post.id)],
        eta=post.scheduled_for
    )
    return async_result.id


def cancel_post_celery_task(task_id: str) -> None:
    """
    Revokes and cancels a queued Celery task by its task ID.
    """
    if task_id:
        try:
            celery_app.control.revoke(task_id, terminate=True)
            logger.info(f"Successfully revoked Celery task {task_id}")
        except Exception as exc:
            logger.warning(f"Could not revoke Celery task {task_id}: {str(exc)}")
