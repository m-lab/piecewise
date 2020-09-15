#!/bin/sh

TRIES=15
HOST="$PIECEWISE_DB_HOST"
PORT="$PIECEWISE_DB_PORT"
MIGRATED="/app/.MIGRATED"

wait_for() {
  echo "HOST: $HOST, PORT: $PORT"
  for i in $(seq $TRIES); do
    nc -z "$HOST" "$PORT" >/dev/null 2>&1

    result=$?
    if [ $result -eq 0 ]; then
      return 0
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
  sleep 1
fi

npm run start
