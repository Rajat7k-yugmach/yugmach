#!/usr/bin/env bash
# Restore the local Payload dump into a Neon (or any Postgres) DATABASE_URL.
# Usage: DATABASE_URL='postgres://…' ./scripts/restore-to-neon.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DUMP="$ROOT/scripts/yugmach-payload.sql"
URL="${DATABASE_URL:-${POSTGRES_URL:-}}"
if [[ -z "$URL" ]]; then
  echo "Set DATABASE_URL or POSTGRES_URL" >&2
  exit 1
fi
if [[ ! -f "$DUMP" ]]; then
  echo "Missing $DUMP — run: pg_dump --no-owner --no-acl yugmach_payload > scripts/yugmach-payload.sql" >&2
  exit 1
fi
echo "Restoring into Neon/Postgres…"
psql "$URL" -v ON_ERROR_STOP=1 -f "$DUMP"
echo "Done."
