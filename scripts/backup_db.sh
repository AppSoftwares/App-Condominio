#!/usr/bin/env bash
# Simple backup script for Postgres DB used in docker-compose
set -e

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="./backups"
mkdir -p "$BACKUP_DIR"

PGHOST=${PGHOST:-localhost}
PGPORT=${PGPORT:-5432}
PGUSER=${PGUSER:-postgres}
PGDATABASE=${PGDATABASE:-caminos}
PGPASSWORD=${PGPASSWORD:-postgres}

export PGPASSWORD

pg_dump -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -F c -b -v -f "$BACKUP_DIR/caminos_backup_$TIMESTAMP.dump" "$PGDATABASE"

echo "Backup completed: $BACKUP_DIR/caminos_backup_$TIMESTAMP.dump"
