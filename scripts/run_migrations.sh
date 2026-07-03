#!/usr/bin/env bash
set -e

# Run Alembic migrations against DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL is not set. Using default from .env or .env.prod"
fi

# Use alembic to upgrade
alembic upgrade head

echo "Migrations applied"
