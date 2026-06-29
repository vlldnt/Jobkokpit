#!/bin/sh
# Periodic compressed pg_dump with retention pruning. Runs in a postgres image.
set -eu

: "${BACKUP_INTERVAL:=86400}" # 24h
: "${BACKUP_KEEP:=7}"
: "${POSTGRES_USER:=jobai}"
: "${POSTGRES_DB:=jobai}"

mkdir -p /backups
echo "backup: every ${BACKUP_INTERVAL}s, keeping ${BACKUP_KEEP} dumps"

while true; do
	ts="$(date -u +%Y%m%d-%H%M%S)"
	out="/backups/jobai-${ts}.sql.gz"
	if PGPASSWORD="${POSTGRES_PASSWORD}" pg_dump -h db -U "${POSTGRES_USER}" "${POSTGRES_DB}" | gzip >"${out}"; then
		echo "backup: wrote ${out}"
	else
		echo "backup: FAILED ${ts}"
		rm -f "${out}"
	fi
	# Prune all but the newest BACKUP_KEEP dumps.
	ls -1t /backups/jobai-*.sql.gz 2>/dev/null | tail -n +"$((BACKUP_KEEP + 1))" | xargs -r rm -f
	sleep "${BACKUP_INTERVAL}"
done
