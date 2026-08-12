# Muqabaleh.com

AI interview coaching for MENA — Arabic & English. PayPal only. Email via Brevo.

## Local development

```bash
npm install
npx prisma generate
npm run dev
```

## Environment

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Postgres (Neon/Supabase) |
| `BREVO_API_KEY` | Transactional email |
| `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` | Error tracking (PII scrubbed) |
| `NEXT_PUBLIC_GA_ID` | GA4 measurement ID (loads only after analytics cookie consent) |
| `NEXT_PUBLIC_META_PIXEL_ID` | Optional Meta Pixel (blocked until analytics consent) |
| PayPal vars | Existing PayPal subscription / checkout flow |

## Health & uptime

- `GET /api/health` — lightweight uptime probe
- `GET /api/health/db` — confirms database connectivity

**Founder setup (manual):** create a free monitor at [UptimeRobot](https://uptimerobot.com) for `https://muqabaleh.com/api/health` (and optionally `/api/health/db`). Alert email: your personal inbox.

**Database backups:** handled by the database provider (Neon/Supabase). Verify daily that automated backups are enabled.

## Email drip

Day 0 welcome sends immediately on signup. Days 2/5/7/14 are queued in `EmailQueue` and processed by `/api/email/cron` (every 5 minutes). Free-only nudges (Day 7/14) are skipped if the user upgraded.

## Cookie consent

Analytics (GA4 / Meta Pixel) load only after the user accepts analytics cookies. Consent is stored in `localStorage` under `mq_cookie_consent_v1`.

## Deploy

Preview first via Vercel. Do not merge launch PRs until P0 checklist passes.

### Vercel Preview checklist (founder)

| Variable | Notes |
|----------|--------|
| `BREVO_API_KEY` | Must target **Preview** (and Production). Without it, welcome / PayPal confirm / passport / sales emails are dead on Preview. |
| `NEXT_PUBLIC_GA_ID` | Must target **Preview** and be set **before** build (`G-…`). Redeploy after adding. |
| PayPal vars | Already used for checkout on Preview when configured. |

After changing `NEXT_PUBLIC_*` vars, trigger a new Preview deployment (redeploy or empty commit).

**PR #130 branch:** `cursor/prelaunch-fix-all-da98`  
**Manual founder checks after Preview is green:** welcome inbox, mic interview + PDF, real PayPal $9.99, delete account, sales@ inbox, single-IP rate limit, GA4 Network after cookie Accept.
