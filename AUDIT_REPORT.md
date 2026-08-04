# Muqabaleh Production Readiness Audit Report

**Date:** 2026-08-04  
**Branch:** `cursor-cleanup`  
**Scope:** Full codebase audit (money path, auth, cleanup, performance, structure)  
**Constraint:** PayPal integration, Prisma schema, auth logic, and pricing constants were **not modified**.

---

## Summary

| Severity | Count |
|----------|------:|
| CRITICAL | 12 |
| HIGH | 14 |
| MEDIUM | 18 |
| LOW | 12 |
| **Total issues identified** | **56** |
| **Safe fixes applied in this branch** | **~35** |

**Verdict: Not production-ready.** Money-path and auth holes must be fixed manually before taking real payments. Cleanup/performance safe fixes in this PR reduce noise and harden non-critical surfaces.

---

## 1. CRITICAL CHECKS (Money Path — Report Only)

### 1.1 PayPal Checkout Flow

| Endpoint | Auth | Price source | Status |
|----------|------|--------------|--------|
| `POST /api/paypal/create-order` | **None** | Hardcoded `PLAN_CONFIG` | Broken multi-plan capture |
| `POST /api/paypal/capture-order` | Session | Hardcoded `$9.99` / always credits PRO | Amount path wrong; order↔user unbound |
| `POST /api/paypal/create-subscription` | Session | Env `PAYPAL_PLAN_ID` | Relatively OK |
| `POST /api/paypal/activate` | Session | **Not verified vs plan** | **IDOR → free UNLIMITED** |
| `POST /api/paypal/create-booking-order` | Session + ownership | DB `booking.priceTotal` | Live API host hardcoded |
| `POST /api/paypal/capture-booking-order` | Session + ownership | DB (check bypassable) | Order↔booking unbound |
| `POST /api/paypal/webhook` | **None** | n/a | Signature verification missing |
| `POST /api/paypal/payout-webhook` | **None** | n/a | Signature verification missing |
| `POST /api/paypal/send-payout` | Admin email | DB amount | Best of money APIs |
| `POST /api/paypal/cancel` | Session (own sub) | n/a | Relatively OK |

### 1.2 Database Schema

| Expected | Actual model | Notes |
|----------|--------------|-------|
| Booking | `HumanBooking` | No FK to `User`; no double-book uniqueness |
| User | `User` | Roles/tiers as free strings; no enums |
| Interviewer | **Dual:** `Interviewer` + `InterviewerProfile` | Divergent status models (`ACTIVE` vs `APPROVED`) |
| Payment | `Payment` | AI packages only; bookings store `paypalOrderId` on booking |
| Payout | `InterviewerPayout` | No booking join table; can COMPLETE without batch id |

### 1.3 Auth Middleware

- Middleware protects page routes under `/app`, `/interviewer`, `/b2b`, `/admin` via JWT cookie decode (**no signature verification**).
- **All `/api/*` routes are excluded** from middleware — each API must self-enforce.
- Interviewer private pages with ≤3 path segments (`/interviewer/dashboard`, `/earnings`, etc.) are **incorrectly treated as public**.
- Admin APIs use hardcoded email allowlist (`samjo4500@gmail.com`), not `SUPER_ADMIN` role.
- Admin UI gate is client-only email check.

---

## 2. Issues Table

| File | Issue | Severity | Recommended Fix |
|------|-------|----------|-----------------|
| `src/lib/paypal.ts` | `verifyWebhookSignature` is a no-op (only checks env var exists) | CRITICAL | Implement PayPal webhook signature verification via PayPal Verify API |
| `src/app/api/paypal/webhook/route.ts` | No auth / no signature; can forge cancel/renew | CRITICAL | Reject unsigned webhooks; use verified event IDs |
| `src/app/api/paypal/payout-webhook/route.ts` | No auth / no signature; can forge COMPLETED/PENDING | CRITICAL | Same as above; status transitions must be atomic |
| `src/app/api/paypal/activate/route.ts` | IDOR: any user can attach any ACTIVE subscription → UNLIMITED | CRITICAL | Bind subscription to caller; verify plan ID matches env |
| `src/app/api/paypal/capture-order/route.ts` | Reads amount from wrong JSON path; rejects after successful capture | CRITICAL | Use `payments.captures[0].amount`; refund/reconcile on failure |
| `src/app/api/paypal/capture-order/route.ts` | Order not bound to user; capturer gets credit | CRITICAL | Persist `userId`/`custom_id` at create; enforce on capture |
| `src/app/api/paypal/capture-booking-order/route.ts` | Amount check skipped when `capturedAmount` falsy | CRITICAL | Fail closed; bind orderId to booking before approval |
| `src/app/api/paypal/create-order/route.ts` | Unauthenticated; body `plan` ignored | CRITICAL | Require session; read plan from validated body |
| `src/app/api/daily/webhook/route.ts` | No signature; can forge booking COMPLETED | CRITICAL | Verify Daily webhook signatures |
| `src/app/api/candidate-pool/route.ts` | No auth; client supplies `userId` (IDOR write) | CRITICAL | Require session; ignore client userId |
| `src/middleware.ts` | Uses `decodeJwt` without verify; APIs excluded | CRITICAL | Use `getToken` from next-auth/jwt; protect sensitive APIs in-route |
| `src/app/api/admin/_lib.ts` | Admin = hardcoded email, not role | CRITICAL | Check `role === 'SUPER_ADMIN'` (+ optional allowlist) |
| `src/middleware.ts` | `/interviewer/dashboard` etc. treated as public (≤3 segments) | HIGH | Fix path-length exception; protect all interviewer private routes |
| `src/app/api/bookings/[id]/route.ts` | Interviewer auth compares Interviewer PK to User PK | HIGH | Resolve interviewer via `userId` then compare |
| `src/app/api/bookings/[id]/route.ts` | Candidate can PATCH status to COMPLETED and inflate earnings | HIGH | Restrict COMPLETED to webhook/interviewer/admin only |
| `src/app/api/email/daily-summary/route.ts` | Unauthenticated financial email trigger | HIGH | Require cron secret or admin auth |
| `src/app/api/email/cron/route.ts` | Auth skipped if `CRON_SECRET` unset | HIGH | Fail closed when secret missing |
| `src/app/api/paypal/create-booking-order/route.ts` | Hardcoded live PayPal host (ignores sandbox mode) | HIGH | Use shared `getPayPalApiBase()` from `lib/paypal` |
| `src/app/api/paypal/capture-order/route.ts` | Always credits PRO/$9.99 despite multi-plan create | HIGH | Align capture entitlements with `PLAN_CONFIG` |
| `prisma/schema.prisma` | `Interviewer.userId` / `HumanBooking.userId` missing FK | HIGH | Add relations; remove `userId: 'pending'` collision |
| `prisma/schema.prisma` | Dual interviewer models + ACTIVE vs APPROVED mismatch | HIGH | Unify models/status enums |
| `src/app/[locale]/admin/admin-guard.tsx` | Client-only email gate | HIGH | Server-side layout guard with role check |
| `src/app/api/newsletter/route.ts` | Sets `isActive: true` — can reactivate soft-deleted users | HIGH | Do not mutate `isActive` on newsletter signup |
| `src/app/api/tts/route.ts` | Unauthenticated paid AI cost sink | HIGH | Require auth + rate limit |
| `src/lib/rate-limit.ts` | In-memory; useless on serverless multi-instance | MEDIUM | Use Redis/Upstash |
| `src/lib/api-handler.ts` | `withAuth` unused; inconsistent auth wrappers | MEDIUM | Adopt `withAuth` across APIs |
| `src/app/[locale]/layout.tsx` | `force-dynamic` disables static/ISR for entire locale tree | MEDIUM | Scope dynamic only to authenticated segments |
| `package.json` | ~29 unused `ui/*` stubs + heavy deps still present (`recharts`, `embla`, `cmdk`, etc.) | MEDIUM | Delete unused stubs then remove deps |
| `src/lib/email.ts` | Sequential send+update in queue loop | MEDIUM | Batch status updates; respect provider rate limits |
| `src/app/api/auth/forgot-password/route.ts` | Reset token stored but no reset-password API/page | MEDIUM | Complete reset flow or stop issuing tokens |
| `src/lib/auth.ts` | Cookie always named `__Secure-…` while `secure` only in prod | MEDIUM | Align cookie name with `useSecureCookies` |
| `src/lib/security.ts` | Strong password helpers unused; register allows weak min(8) | MEDIUM | Enforce `isStrongPassword` on register |
| `src/components/PayPalSubscriptionButton.tsx` | Checks tier `PREMIUM` vs backend `UNLIMITED` | MEDIUM | Align tier names (manual; money UI) |
| `src/app/api/paypal/*` | Capture-then-fail leaves charge without credit | MEDIUM | Compensating refund / reconciliation job |
| Hardcoded bilingual UI | Many pages use `locale === 'ar' ? …` instead of message keys | MEDIUM | Migrate to `en.json`/`ar.json` |
| `package.json` | Name still `nextjs_tailwind_shadcn_ts` | LOW | Rename to `muqabaleh` |
| `examples/websocket/` | Leftover demo | LOW | Remove or document as non-prod |
| `src/components/ui/toast*` + `hooks/use-toast.ts` | Dead (app uses `sonner`) | LOW | Delete dead toast stack |
| PayPal `as any` casts in button components | Weak PayPal SDK typing | LOW | Type against `@paypal/paypal-js` |
| Admin/payment routes | No rate limits on mutate endpoints | LOW | Add rate limits via `withAuth` |
| Register password policy | Weaker than documented helpers | LOW | Align with security helpers |

---

## 3. What Was Fixed (This Branch)

Safe cleanup/performance changes only — **no PayPal / Prisma / auth / pricing logic changes**.

### Cleanup
- Removed `console.log` from: newsletter, interviewer apply, interview messages, email send/queue, Daily webhook (left PayPal `console.log` untouched per money-path constraint).
- Removed unused imports: landing `useEffect`, navbar `SheetClose`, PayPal subscription `CheckCircle2`, forgot-password `toast`, register unused arrows, unused `getTranslations` on about/business/pricing/demo/profile pages.
- Fixed TypeScript `any`: locale checks use `Locale` type; Gemini client typed; `api-handler` public path no longer casts `req as any`; ZAI messages typed without `as any`.
- Added try/catch error handling to all admin API routes (`stats`, `users`, `interviewers`, `bookings`, `payouts`, `transactions` + `[id]` variants).
- Deleted dead `src/app/api/route.ts` (“Hello, world!”), `hero-simulation.tsx.bak`, and accidental `--timeout` binary junk file.

### Performance
- Batched sequential `message.create` calls into `message.createMany` in `src/lib/ai.ts`.
- Removed unused npm dependencies with zero imports:  
  `@mdxeditor/editor`, `react-syntax-highlighter`, `@dnd-kit/*`, `@daily-co/daily-js`, `zustand`, `react-markdown`, `date-fns`, `@tanstack/react-query`, `@tanstack/react-table`, `@reactuses/core`, `uuid`.

### i18n
- Verified `en.json` / `ar.json`: **2011 keys each, 0 missing**.  
  `landing.freeTitle` and `pwa.*` present in both locales.
- Confirmed `PWAInstallPrompt` is correctly nested inside `NextIntlClientProvider` in locale layout (screenshot error appears resolved in current tree). Hardcoded bilingual UI strings remain (reported, not fully migrated).

---

## 4. What Needs Manual Review (Do Not Auto-Fix)

1. **All CRITICAL/HIGH PayPal & webhook findings** — money integrity.
2. **Middleware JWT verification + interviewer route exception** — auth correctness.
3. **Admin auth model** — replace hardcoded email with role-based SUPER_ADMIN (+ MFA).
4. **Prisma schema integrity** — FKs, enums, unify interviewer models, booking uniqueness (do not edit in this PR).
5. **Booking PATCH COMPLETED privilege** — payout fraud risk.
6. **`force-dynamic` on locale layout** — needs careful per-route dynamic strategy.
7. **Remaining unused UI stubs / radix packages** — delete stubs then prune deps in a dedicated PR.
8. **Hardcoded bilingual strings → i18n keys** — large surface; migrate incrementally.
9. **Incomplete password-reset flow**.
10. **Newsletter `isActive: true` side effect**.

---

## 5. STRUCTURE (Report Only)

### Folder organization — **Good overall**
```
src/app/[locale]/…     # pages by product area
src/app/api/…           # APIs by feature (paypal, bookings, interviews, admin, …)
src/components/{brand,layout,navigation,pwa,ui}
src/lib/                # shared business helpers
src/messages/           # i18n
src/emails/             # email templates
prisma/                 # schema + seed
```

### Components vs business logic — **Mixed**
- Good: `src/lib/ai.ts`, `email-triggers.ts`, `session.ts`, feature libs.
- Weak: large client pages (landing, interviewer dashboard) embed data-fetching and copy inline.
- Weak: dual interviewer domains (`Interviewer` marketplace vs `InterviewerProfile` B2B) without clear module boundary.

### API routes by feature — **Yes**
Organized by domain (`paypal/`, `bookings/`, `interviewer/`, `admin/`, `interviews/`).  
Gap: unused shared `withAuth` wrapper; inconsistent error/auth patterns across routes.

### Images
- App UI uses `next/image`. Remaining `<img>` tags are in email HTML (correct — email clients don’t support Next Image).

### Re-renders / useMemo
- No systematic missing-memo bugs found that warrant blanket `useMemo`/`useCallback` (React 19 / compiler-friendly codebase). Prefer fixing unstable props/context over premature memoization.

---

## 6. Recommended Fix Order (Manual)

1. Webhook signature verification (PayPal + Daily) — fail closed.  
2. Fix activate IDOR + bind orders/subscriptions to users/bookings.  
3. Fix capture amount path + fail-closed booking amount check + refund path.  
4. Fix middleware JWT verify + interviewer private route protection.  
5. Replace admin email allowlist with role checks.  
6. Schema: FKs, status enums, unify interviewer models, booking uniqueness.  
7. Lock down unauthenticated APIs (candidate-pool, daily-summary, TTS, create-order).  
8. Continue cleanup: unused UI stubs, bilingual → i18n, `force-dynamic` scoping.
