# Postly Backend Production Dockerfile
FROM python:3.12-slim

# Prevent Python from writing .pyc files & buffer outputs for real-time Render logs
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    C_FORCE_ROOT=1 \
    PORT=10000

# Set working directory
WORKDIR /app

# Install system dependencies required for psycopg2, supervisor, curl
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    supervisor \
    curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir --root-user-action=ignore -r requirements.txt

# Copy supervisor configuration
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Copy application source code
COPY . /app/

# Normalize entrypoint script line endings (strips CRLF) and grant execution permission
RUN sed -i 's/\r$//' /app/entrypoint.sh && chmod +x /app/entrypoint.sh

# Expose the default Render service port
EXPOSE 10000

# Launch services via entrypoint (runs migrations, collects static, starts supervisor)
ENTRYPOINT ["/app/entrypoint.sh"]

