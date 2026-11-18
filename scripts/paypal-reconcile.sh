#!/usr/bin/env bash
# Hourly-ish PayPal reconciliation for an alwaysdata account.
#
#   crontab -e
#   # every 15 minutes, quietly, logging one line per run
#   */15 * * * * /home/$USER/muqabaleh/scripts/paypal-reconcile.sh >> /home/$USER/logs/paypal-reconcile.log 2>&1
#
# alwaysdata runs this on the web account itself, so it talks to the app over
# localhost rather than through the public internet.
#
# Required: CRON_SECRET (the same value set in the site's environment), and the
# app must be served on $APP_PORT by alwaysdata's reverse proxy.
set -euo pipefail

APP_PORT="${APP_PORT:-8300}"
BASE_URL="${BASE_URL:-http://127.0.0.1:${APP_PORT}}"
CRON_SECRET="${CRON_SECRET:-}"

if [ -z "$CRON_SECRET" ]; then
  echo "$(date -Is) REFUSING: CRON_SECRET is not set in this shell or in the crontab"
  exit 1
fi

# 3-hour cutoff: a checkout that is still in flight 3 hours later is not in
# flight any more. Override with OLDER=90 once the webhook proves reliable.
OLDER="${OLDER:-180}"
LIMIT="${LIMIT:-100}"

response=$(curl -sS --max-time 60 \
  -H "Authorization: Bearer ${CRON_SECRET}" \
  "${BASE_URL}/api/paypal/reconcile?olderThanMinutes=${OLDER}&limit=${LIMIT}" \
  -w '\n%{http_code}' || echo -e "\n000")

code=$(printf '%s' "$response" | tail -n1)
body=$(printf '%s' "$response" | sed '$d')

if [ "$code" != "200" ]; then
  echo "$(date -Is) FAILED http=${code} body=${body}"
  exit 1
fi

# Only log runs that did something, so the log stays readable.
# (Order-independent, because the JSON keys can move.)
if printf '%s' "$body" | grep -q '"granted":0' &&
   printf '%s' "$body" | grep -q '"closed":0' &&
   printf '%s' "$body" | grep -q '"stillPending":0'; then
  exit 0
fi

echo "$(date -Is) ${body}"
