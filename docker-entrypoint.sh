#!/bin/sh

TIMEOUT=15
HOST="$PIECEWISE_DB_HOST"
PORT="$PIECEWISE_DB_PORT"
MIGRATED="/.MIGRATED"

wait_for() {
  for i in $(seq $TIMEOUT); do
    nc -z "$HOST" "$PORT" >/dev/null 2>&1

    result=$?
    if [ $result -eq 0 ]; then
      if [ $# -gt 0 ]; then
        exec "$@"
      fi
      exit 0
    fi
    sleep 1
  done
  echo "Operation timed out" >&2
  exit 1
}

wait_for

if [ ! -f "$MIGRATED" ]; then
  npm run db:migrations
  npm run db:seeds
  touch "$MIGRATED"
fi

npm run start
