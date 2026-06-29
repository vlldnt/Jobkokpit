#!/bin/sh
# Periodically triggers the protected offer-sync route (Agent 1).
# Runs in a curl-capable container; intervals are in seconds.
set -eu

: "${APP_URL:=http://app:3000}"
: "${SYNC_INTERVAL:=21600}" # 6h
: "${SYNC_QUERY:=}"
: "${SYNC_WHERE:=}"

echo "worker: sync every ${SYNC_INTERVAL}s against ${APP_URL}"

while true; do
	sleep "${SYNC_INTERVAL}"
	url="${APP_URL}/api/sync/offers?q=${SYNC_QUERY}&where=${SYNC_WHERE}"
	if curl -fsS -X POST -H "Authorization: Bearer ${CRON_SECRET}" "${url}"; then
		echo "worker: sync ok ($(date -u +%FT%TZ))"
	else
		echo "worker: sync failed ($(date -u +%FT%TZ))"
	fi
done
