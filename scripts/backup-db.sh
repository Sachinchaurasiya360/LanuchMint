#!/usr/bin/env bash
# backup-db.sh - Take a compressed logical backup of the LaunchMint Postgres
# and push it to S3 with a timestamped key. Intended to run from cron or the
# deploy host; also safe to run locally against a read replica.
#
# Required env:
#   DATABASE_URL          postgres://... (full connection string)
#   BACKUP_S3_BUCKET      s3 bucket name (no s3:// prefix)
# Optional:
#   BACKUP_S3_PREFIX      default: db-backups
#   BACKUP_RETENTION_DAYS default: 30 (older objects are pruned after upload)
#   BACKUP_KMS_KEY_ID     if set, enables SSE-KMS at upload time
#
# Exit codes:
#   0 success, 1 config missing, 2 pg_dump failed, 3 upload failed
set -euo pipefail

: "${DATABASE_URL:?DATABASE_URL is required}"
: "${BACKUP_S3_BUCKET:?BACKUP_S3_BUCKET is required}"

PREFIX="${BACKUP_S3_PREFIX:-db-backups}"
RETENTION="${BACKUP_RETENTION_DAYS:-30}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
TMPDIR="$(mktemp -d)"
trap 'rm -rf "$TMPDIR"' EXIT

DUMP_FILE="$TMPDIR/launchmint-$STAMP.dump"
S3_KEY="$PREFIX/launchmint-$STAMP.dump"

echo "[$STAMP] starting pg_dump"
# --format=custom is restorable with pg_restore and compresses better than SQL.
if ! pg_dump --format=custom --no-owner --no-acl --compress=9 \
      --file="$DUMP_FILE" "$DATABASE_URL"; then
  echo "pg_dump failed" >&2
  exit 2
fi

BYTES="$(stat -c%s "$DUMP_FILE" 2>/dev/null || stat -f%z "$DUMP_FILE")"
echo "[$STAMP] dump complete: $BYTES bytes -> s3://$BACKUP_S3_BUCKET/$S3_KEY"

AWS_EXTRA_ARGS=()
if [[ -n "${BACKUP_KMS_KEY_ID:-}" ]]; then
  AWS_EXTRA_ARGS+=(--sse aws:kms --sse-kms-key-id "$BACKUP_KMS_KEY_ID")
else
  AWS_EXTRA_ARGS+=(--sse AES256)
fi

if ! aws s3 cp "$DUMP_FILE" "s3://$BACKUP_S3_BUCKET/$S3_KEY" \
      --only-show-errors "${AWS_EXTRA_ARGS[@]}"; then
  echo "s3 upload failed" >&2
  exit 3
fi

# Prune objects older than RETENTION days. List + delete in one pass so we
# never delete the freshly-uploaded object we just wrote.
CUTOFF_EPOCH=$(( $(date -u +%s) - RETENTION * 86400 ))
aws s3api list-objects-v2 \
  --bucket "$BACKUP_S3_BUCKET" --prefix "$PREFIX/" \
  --query 'Contents[].{Key:Key,LastModified:LastModified}' \
  --output json 2>/dev/null | \
  python3 -c "
import json, os, sys, subprocess, datetime
cutoff = int(os.environ['CUTOFF_EPOCH'])
bucket = os.environ['BACKUP_S3_BUCKET']
data = sys.stdin.read().strip()
if not data or data == 'null':
    sys.exit(0)
rows = json.loads(data) or []
for row in rows:
    ts = datetime.datetime.fromisoformat(row['LastModified'].replace('Z','+00:00'))
    if ts.timestamp() < cutoff:
        subprocess.check_call(['aws','s3','rm',f's3://{bucket}/{row[\"Key\"]}','--only-show-errors'])
" || true

echo "[$STAMP] backup done"
