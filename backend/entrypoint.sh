#!/bin/sh
set -e

echo "=== Postly Container Initializing ==="
export PORT="${PORT:-10000}"

# Clean up stale celery beat pid and schedule files if present
rm -f /tmp/celerybeat*
rm -f /app/celerybeat*
rm -f celerybeat-schedule*

# Run database migrations
echo "--> Running database migrations..."
python manage.py migrate --noinput

# Collect static files for WhiteNoise (Unfold super admin, rest_framework, etc.)
echo "--> Collecting static files..."
python manage.py collectstatic --noinput --clear

echo "--> Starting Supervisor (Gunicorn on port ${PORT} + Celery Worker + Celery Beat)..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf

