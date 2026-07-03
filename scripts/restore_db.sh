#!/usr/bin/env bash
# Restore backup into Postgres
set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <backup-file>"
  exit 1
fi

BACKUP_FILE="$1"

PGHOST=${PGHOST:-localhost}
PGPORT=${PGPORT:-5432}
PGUSER=${PGUSER:-postgres}
PGDATABASE=${PGDATABASE:-caminos}
PGPASSWORD=${PGPASSWORD:-postgres}

export PGPASSWORD

pg_restore -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -v "$BACKUP_FILE"

echo "Restore completed"
