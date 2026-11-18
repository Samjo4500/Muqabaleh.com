#!/usr/bin/env bash
# Pre-flight for deploying Muqabaleh to alwaysdata.
#
#   ./scripts/preflight.sh            # checks config and database reachability
#   ./scripts/preflight.sh --live     # additionally demands live-charge consent
#
# Run it on the alwaysdata host, in the site directory, after `npm ci` and
# `npx prisma migrate deploy`. It refuses (exit 1) when the payment system cannot
# honestly take money. The app itself fails closed too — create-order returns 503
# without PAYPAL_ALLOW_LIVE_CHARGES — but a 503 nobody notices is an outage, so
# check it here instead, where you are looking.
set -uo pipefail

MODE="${1:-}"
REQUIRED=(DATABASE_URL NEXTAUTH_URL NEXTAUTH_SECRET PAYPAL_CLIENT_ID PAYPAL_CLIENT_SECRET PAYPAL_MERCHANT_ID PAYPAL_WEBHOOK_ID CRON_SECRET)

fail=0
ok()   { printf '  \033[32mok\033[0m   %s\n' "$1"; }
bad()  { printf '  \033[31mFAIL\033[0m %s\n' "$1"; fail=1; }
warn() { printf '  \033[33mwarn\033[0m %s\n' "$1"; }

echo "Environment"
for v in "${REQUIRED[@]}"; do
  val="${!v:-}"
  if [ -z "$val" ]; then
    bad "$v is not set"
  elif [ "${#val}" -lt 8 ]; then
    warn "$v is set but suspiciously short (${#val} chars)"
  else
    ok "$v is set"
  fi
done

# NEXTAUTH_URL decides where PayPal sends the buyer back. Getting this wrong
# means paying customers land on the wrong host, or nowhere.
case "${NEXTAUTH_URL:-}" in
  https://*) ok "NEXTAUTH_URL is https (${NEXTAUTH_URL})" ;;
  "") : ;;
  *) bad "NEXTAUTH_URL must be https in production (got: ${NEXTAUTH_URL})" ;;
esac

echo
echo "PayPal mode"
mode="${PAYPAL_MODE:-sandbox}"
allow="${PAYPAL_ALLOW_LIVE_CHARGES:-}"
if [ "$mode" = "live" ]; then
  if [ "$allow" = "true" ]; then
    ok "LIVE charging is ON (PAYPAL_ALLOW_LIVE_CHARGES=true)"
    if [ "$MODE" != "--live" ]; then
      warn "you are about to serve live payments; re-run with --live to confirm deliberately"
    fi
  else
    bad "PAYPAL_MODE=live but PAYPAL_ALLOW_LIVE_CHARGES is not 'true' — every checkout will return 503"
  fi
else
  ok "sandbox mode (no real money)"
  if [ "$MODE" = "--live" ]; then
    bad "--live was requested but PAYPAL_MODE is not 'live'"
  fi
fi

echo
echo "Database"
if [ -z "${DATABASE_URL:-}" ]; then
  bad "skipping database checks — DATABASE_URL is not set"
else
  if npx prisma migrate status >/tmp/prisma-status.$$ 2>&1; then
    ok "schema is up to date"
  else
    if grep -qi "not yet been applied\|pending" /tmp/prisma-status.$$; then
      bad "pending migrations — run: npx prisma migrate deploy"
      sed 's/^/       /' /tmp/prisma-status.$$ | tail -5
    else
      bad "cannot reach the database or read migration state"
      sed 's/^/       /' /tmp/prisma-status.$$ | tail -5
    fi
  fi
  rm -f /tmp/prisma-status.$$

  # The two tables this release adds. If they are missing, every checkout fails.
  if node -e '
    const { PrismaClient } = require("@prisma/client");
    const p = new PrismaClient();
    p.paypalOrder.count().then(() => process.exit(0)).catch(() => process.exit(1));
  ' >/dev/null 2>&1; then
    ok "PaypalOrder table present"
  else
    bad "PaypalOrder table missing or unreachable — the migration has not been applied"
  fi
fi

echo
echo "App"
if curl -fsS --max-time 10 "${NEXTAUTH_URL:-http://127.0.0.1:${APP_PORT:-8300}}/api/health" >/dev/null 2>&1; then
  ok "health endpoint responds"
else
  warn "could not reach /api/health — fine before the first start, fatal afterwards"
fi

echo
if [ "$fail" -ne 0 ]; then
  echo "NOT READY — fix the FAIL lines above before serving customers."
  exit 1
fi
echo "Ready."
