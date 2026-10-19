#!/bin/sh
set -e

# Run Prisma migrations if DATABASE_URL is configured
if [ -n "$DATABASE_URL" ]; then
  echo "=> [Docker Entrypoint] Applying Prisma database migrations..."
  npx prisma migrate deploy || {
    echo "=> [Docker Entrypoint] Warning: Prisma migrations exited with an error. Continuing startup..."
  }
fi

exec "$@"
