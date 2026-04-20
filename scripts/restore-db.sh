#!/usr/bin/env bash
# restore-db.sh - Restore a LaunchMint Postgres backup from S3.
# Usage:
#   BACKUP_S3_BUCKET=foo DATABASE_URL=postgres://... ./scripts/restore-db.sh [s3-key]
# If s3-key is omitted, the most recent object under BACKUP_S3_PREFIX is used.
#
# Always pg_restore into a staging DB first in production; this script only
# applies a dump to the DATABASE_URL you hand it. It will refuse to run against
# a URL that looks like prod unless RESTORE_CONFIRM=yes is set.
set -euo pipefail

: "${DATABASE_URL:?DATABASE_URL is required}"
: "${BACKUP_S3_BUCKET:?BACKUP_S3_BUCKET is required}"
PREFIX="${BACKUP_S3_PREFIX:-db-backups}"

if [[ "$DATABASE_URL" == *"prod"* && "${RESTORE_CONFIRM:-}" != "yes" ]]; then
  echo "Refusing to restore into a URL that looks like production." >&2
  echo "Re-run with RESTORE_CONFIRM=yes if this is intentional." >&2
  exit 1
fi

KEY="${1:-}"
if [[ -z "$KEY" ]]; then
  KEY="$(aws s3api list-objects-v2 \
    --bucket "$BACKUP_S3_BUCKET" --prefix "$PREFIX/" \
    --query 'sort_by(Contents, &LastModified)[-1].Key' \
    --output text)"
fi

if [[ -z "$KEY" || "$KEY" == "None" ]]; then
  echo "No backup object found under s3://$BACKUP_S3_BUCKET/$PREFIX/" >&2
  exit 2
fi

TMPDIR="$(mktemp -d)"
trap 'rm -rf "$TMPDIR"' EXIT
DUMP_FILE="$TMPDIR/$(basename "$KEY")"

echo "Pulling s3://$BACKUP_S3_BUCKET/$KEY"
aws s3 cp "s3://$BACKUP_S3_BUCKET/$KEY" "$DUMP_FILE" --only-show-errors

echo "Running pg_restore (jobs=4, clean + if-exists)"
pg_restore --clean --if-exists --no-owner --no-acl \
  --jobs=4 --dbname="$DATABASE_URL" "$DUMP_FILE"

echo "Restore complete."
