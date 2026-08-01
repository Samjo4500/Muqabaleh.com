# Muqabaleh Worklog

## Phase A — Brand Components

**Date**: 2025-07-15
**Agent**: Brand Components Builder
**Task**: Build all 13 brand components in `/src/components/brand/`

### What was done

Created the complete set of 13 brand components for the Muqabaleh design system, each supporting RTL (ar) and LTR (en) direction:

| # | Component | File | `use client` | Notes |
|---|-----------|------|-------------|-------|
| 1 | `GlowCard` | `glow-card.tsx` | No | Glass card with hover lift + gold glow via `.glass-card` CSS class |
| 2 | `SectionHeading` | `section-heading.tsx` | No | Eyebrow + title (with optional gold-gradient highlight) + subtitle |
| 3 | `ScoreBar` | `score-bar.tsx` | Yes | Framer Motion animated progress bar with gold fill and optional tick marks |
| 4 | `LiveBadge` | `live-badge.tsx` | Yes | Emerald pulsing dot + localized label via `useTranslations('brand')` |
| 5 | `CountUpStat` | `count-up-stat.tsx` | Yes | Intersection Observer + eased counter animation, Arabic numeral support |
| 6 | `VerifiedBadge` | `verified-badge.tsx` | Yes | ShieldCheck icon in cyan with `useTranslations('brand')` for label, 3 sizes |
| 7 | `PriceTag` | `price-tag.tsx` | No | USD price + optional local currency approximation |
| 8 | `AuthShell` | `auth-shell.tsx` | Yes | Centered card on void bg with aurora effect, Muqabaleh logo |
| 9 | `EmptyState` | `empty-state.tsx` | Yes | Large faint icon + title + sub + optional CTA (gold button) |
| 10 | `SkeletonBlock` | `skeleton-block.tsx` | No | N skeleton lines with pulse animation in glass card wrapper |
| 11 | `CopyLinkButton` | `copy-link-button.tsx` | Yes | Copy/Check icon toggle with clipboard API + fallback |
| 12 | `QrCard` | `qr-card.tsx` | Yes | Deterministic QR grid pattern, verification URL via `useTranslations('brand')` |
| 13 | `InterviewAvatar` | `interview-avatar.tsx` | No | Fahd/Noora avatar images with gold gradient ring, 3 sizes (40/56/80px) |

### Files modified
- `src/messages/ar.json` — Added `brand` namespace (live, verified, copied, verifyUrl)
- `src/messages/en.json` — Added `brand` namespace (live, verified, copied, verifyUrl)

### Files created
- `src/components/brand/glow-card.tsx`
- `src/components/brand/section-heading.tsx`
- `src/components/brand/score-bar.tsx`
- `src/components/brand/live-badge.tsx`
- `src/components/brand/count-up-stat.tsx`
- `src/components/brand/verified-badge.tsx`
- `src/components/brand/price-tag.tsx`
- `src/components/brand/auth-shell.tsx`
- `src/components/brand/empty-state.tsx`
- `src/components/brand/skeleton-block.tsx`
- `src/components/brand/copy-link-button.tsx`
- `src/components/brand/qr-card.tsx`
- `src/components/brand/interview-avatar.tsx`
- `src/components/brand/index.ts` (barrel re-export)

### Design decisions
- RTL/LTR: All components use logical CSS properties (`start-0`, `ms-`, `me-`) and inherit direction from the parent layout
- `use client` only added when hooks (useState, useEffect, useRef, useTranslations, useMotionValue) or Framer Motion are used
- QrCard uses a deterministic 9x9 boolean array instead of `Math.random()` to avoid hydration mismatches
- CountUpStat handles both Arabic (٠-٩) and Western (0-9) numerals with proper formatting
- Lucide icons always use `strokeWidth={1.75}` and `size={20}` as default per spec
- All components are named exports, re-exported via barrel `index.ts`
- No emojis used in any UI

### Lint status
- `bun run lint` passes with 0 errors

---

## Phase A — Task 3-a: Layout Components + Landing Page

**Date**: 2025-07-30
**Agent**: Layout + Landing Builder
**Task ID**: 3-a
**Task**: Build Navbar, Footer, and Landing Page (A1) with 14+ sections

### What was done

Built the two layout shell components (Navbar, Footer) and the complete landing page with all 14 specified sections. The landing page is the most important page in the entire app.

#### Layout Components

| Component | File | `use client` | Notes |
|-----------|------|-------------|-------|
| `Navbar` | `src/components/layout/navbar.tsx` | Yes | Sticky glass navbar, scroll-blur, locale toggle, mobile Sheet |
| `Footer` | `src/components/layout/footer.tsx` | Yes | 4-column footer, bottom bar with copyright + logo |

#### Landing Page Sections (14 sections)

| # | Section | ID | Key Features |
|---|---------|-----|-------------|
| 1 | Hero | `#hero` | Aurora bg, gold-gradient H1, animated preview card (9s loop), trust chips |
| 2 | Country Marquee | `#countries` | Infinite scroll, RTL-aware (marquee-rtl animation) |
| 3 | Stats Band | `#stats` | 4 CountUpStat components |
| 4 | Why Muqabaleh | `#why` | 5 GlowCards with Brain/BarChart3/Mic/QrCode/Shield icons |
| 5 | How It Works | `#how` | 3 steps, gold gradient vertical line, step-2 shows Fahd+Noora avatars |
| 6 | Before/After | `#transform` | Framer Motion draggable divider, glass cards, mobile stacked |
| 7 | Interview Experience | `#experience` | Mock chat (Noora asks, candidate answers), gold-tinted bubbles |
| 8 | Interviewers | `#interviewers` | Tabs (AI/Human), audio players, waveform bars, human cards with initials |
| 9 | Pricing | `#pricing` | 4 cards, PriceTag with localApprox, "Most Popular" badge, trust signals |
| 10 | Report Preview | `#report` | Mock report/certificate, score bars, QrCard, VerifiedBadge, disabled buttons |
| 11 | Testimonials | `#testimonials` | 3 GlowCards with Quote icon decoration |
| 12 | FAQ | `#faq` | 6 Accordion items from i18n |
| 13 | Final CTA | — | Aurora effect, gold-gradient heading, CTA button |
| 14 | Footer | — | Sticky footer with mt-auto |

### Files created
- `src/components/layout/navbar.tsx`
- `src/components/layout/footer.tsx`
- `src/app/[locale]/page.tsx` (~900 lines, all 14 sections)

### Files modified
- `src/messages/ar.json` — Added 24 keys to `landing` namespace (marqueeCountries, chat mock, pricing features, report feedback, human interviewers, copyright). Fixed pre-existing invalid JSON (unescaped quotes in `deleteConfirm2`). Added Unicode typographic quotes to avoid JSON parse errors.
- `src/messages/en.json` — Added 24 matching keys to `landing` namespace. Fixed pre-existing invalid JSON (single-quoted string value in `deleteConfirm2`). Added Unicode typographic quotes.
- `tailwind.config.ts` — Added `marquee-rtl` keyframe (reverse direction for RTL) and `animate-marquee-rtl` animation class.
- `src/app/globals.css` — Moved Google Fonts `@import` to top of file (before `@import "tailwindcss"`) to fix CSS parsing error with Tailwind v4.
- `src/app/[locale]/layout.tsx` — Removed unused Navbar/Footer imports (they are rendered by the page component directly).

### Design decisions
- **Navbar**: Uses `useTranslations('nav')` + `useTranslations('common')` for all strings. Locale toggle uses `useRouter` + `usePathname` to construct locale-aware paths. Mobile menu uses shadcn `Sheet` with RTL-aware side (`left` for ar, `right` for en). Scroll state tracked via `useEffect` + `scroll` event listener.
- **Footer**: Although spec said "server component", it uses `use client` + `useTranslations` because it's imported by the client-side landing page. Uses `useTranslations('landing')` for all footer-specific strings and `useTranslations('common')` for shared strings.
- **Landing Page**: Single `'use client'` page with section sub-components defined inline. Each section receives only the `t` translation function (and `isRTL` where needed) as props to avoid unnecessary re-renders.
- **Hero Preview Card**: Uses `useState` + `useEffect` with `setInterval(9000)` to cycle between `analyzing` and `complete` phases. In analyzing phase, shows animated progress bar + 4 ScoreBars. In complete phase, shows emerald checkmark.
- **Country Marquee**: Uses `t.raw('marqueeCountries')` to get the raw array from i18n. Duplicates the list for seamless infinite loop. RTL direction uses `animate-marquee-rtl` class.
- **Before/After**: Desktop uses Framer Motion `drag="x"` on the divider handle. Mobile falls back to stacked layout. The clip-path approach reveals the "before" and "after" cards.
- **Interviewers Audio**: Uses native `<audio>` elements with `ref` for play/pause control. Waveform bars use `.waveform-bar` CSS class with staggered `animationDelay` and `animationPlayState` toggling.
- **Pricing localApprox**: Uses next-intl ICU message format `t('localApprox', { sar: '...', aed: '...', ... })` for currency conversion display.
- **All strings from i18n**: Every visible string uses `useTranslations`. No hardcoded Arabic or English in JSX.
- **Responsive**: Mobile-first design with Tailwind responsive prefixes (`sm:`, `md:`, `lg:`). Touch targets meet 44px minimum.
- **Sticky footer**: Root wrapper uses `min-h-screen flex flex-col`, footer uses `mt-auto`.

### Lint status
- `bun run lint` passes with 0 errors
- Both `/` (ar) and `/en` routes return HTTP 200
- All 12 section IDs verified present in rendered HTML
- i18n content verified rendering correctly in both locales

---

## Phase A — Task 5-a: Secondary Pages (A2, A6, A7, A8, A9, A10, H1, 404)

**Date**: 2025-07-30
**Agent**: Phase A Pages Builder
**Task ID**: 5-a
**Task**: Build 9 pages: Business, Pricing, Verify, Privacy, Terms, Refund, Support, Custom 404, Global 404

### What was done

Built all 9 pages specified in the task. Each page follows the Muqabaleh design system with Navbar + Footer wrapper and all strings from i18n.

| # | Page | File | `use client` | Notes |
|---|------|------|-------------|-------|
| 1 | Business (A2) | `src/app/[locale]/business/page.tsx` | Yes | 6 sections: hero, stats, how-it-works, features (6 GlowCards), pricing (3 cards + human service), final CTA |
| 2 | Pricing (A6) | `src/app/[locale]/pricing/page.tsx` | Yes | 4 pricing cards (same as landing) + feature comparison table (Check/X icons) |
| 3 | Verify (A7) | `src/app/[locale]/verify/[id]/page.tsx` | Yes | Pre-fill from URL param, mock verification: MQBL-DEMO-2026 (valid), MQBL-EXPIRED-2024 (expired), else not found |
| 4 | Privacy (A8) | `src/app/[locale]/privacy/page.tsx` | No | Server component, 15 real Arabic/English legal paragraphs |
| 5 | Terms (A9) | `src/app/[locale]/terms/page.tsx` | No | Server component, 15 real Arabic/English legal paragraphs |
| 6 | Refund (A10) | `src/app/[locale]/refund/page.tsx` | No | Server component, 12 real Arabic/English legal paragraphs |
| 7 | Support (H1) | `src/app/[locale]/support/page.tsx` | Yes | FAQ (reuses 6 landing items) + contact form with sonner toast |
| 8 | Custom 404 | `src/app/[locale]/not-found.tsx` | Yes | Marketing-style 404 with gold-gradient heading |
| 9 | Global 404 | `src/app/not-found.tsx` | No | Simple centered 404 with home link |

### Files created
- `src/app/[locale]/business/page.tsx`
- `src/app/[locale]/pricing/page.tsx`
- `src/app/[locale]/verify/[id]/page.tsx`
- `src/app/[locale]/privacy/page.tsx`
- `src/app/[locale]/terms/page.tsx`
- `src/app/[locale]/refund/page.tsx`
- `src/app/[locale]/support/page.tsx`
- `src/app/[locale]/not-found.tsx`
- `src/app/not-found.tsx`

### Files modified
- `src/messages/ar.json` — Added keys: business (heroCta2, starterF1-F3, businessF1-F6, enterpriseF1-F6, chooseStarter/Business/Enterprise), pricing (colSession/3/5/Vip, rowSessionCount/Criteria/Certificate/HumanReview/Pdf/Linkedin, val1/3/5/1Vip/4/6), verify (demoName/Score/Date), legal (privacyP1-P15, termsP1-P15, refundP1-P12)
- `src/messages/en.json` — Same keys added in English

### Design decisions
- **Business page**: Reuses gold vertical line how-it-works pattern from landing. 6 feature GlowCards with Lucide icons (Users, ListChecks, FileDown, LayoutDashboard, UserCheck, Lock). Human service card with `id="human"` and cyan icon.
- **Pricing page**: Exact same 4-card layout from landing page. Feature comparison table uses `overflow-x-auto` for mobile. Check/X icons from Lucide.
- **Verify page**: Uses `useEffect` with `params.then()` for async param pre-fill. Three mock states: valid (VerifiedBadge + info rows), expired (amber Clock icon), not found (red AlertCircle icon).
- **Legal pages**: Server components with `getTranslations` for SEO. Real legal-sounding Arabic content, not lorem ipsum.
- **Support page**: Reuses landing FAQ items via `tLanding('faqQ{n}')`. Contact form uses sonner `toast.success()`.
- **404 pages**: Custom 404 uses `useTranslations('errors')` for on-brand messaging. Global 404 is minimal server component.
- All pages: `min-h-screen flex flex-col`, `Navbar`, `main flex-1 pt-16`, `Footer mt-auto`.
- All strings from i18n. No hardcoded text. No emojis. Lucide icons `strokeWidth={1.75}`.

### Lint status
- `bun run lint` passes with 0 errors

---

## Phase A — Task 5-b: Interviewer Pages (A3, A4, A5)

**Date**: 2025-07-31
**Agent**: Interviewer Pages Builder
**Task ID**: 5-b
**Task**: Build 3 pages: Interviewers Directory (A3), Interviewer Profile (A4), Join as Interviewer (A5)

### What was done

Built all 3 pages specified in the task. Each page follows the Muqabaleh design system with Navbar + Footer wrapper and all strings from i18n.

| # | Page | File | `use client` | Notes |
|---|------|------|-------------|-------|
| 1 | Interviewers Directory (A3) | `src/app/[locale]/interviewers/page.tsx` | Yes | Search + 6 filter dropdowns (sector, language, price, rating, gender). 6 seed interviewer cards with colored avatar initials, sector badges, star ratings, session counts, price, ghost CTA. Empty state with reset button. |
| 2 | Interviewer Profile (A4) | `src/app/[locale]/interviewers/[slug]/page.tsx` | No (server) | Server component that awaits params, validates slug against known set (notFound if unknown), delegates to client component. |
| 2b | Profile Client | `src/app/[locale]/interviewers/[slug]/profile-client.tsx` | Yes | Back button, avatar + name + title + rating + sessions + recommend rate. 4 tabs (Bio, Credentials, Stats, Reviews). 2-week slot picker grid. Disabled gold button. |
| 3 | Join as Interviewer (A5) | `src/app/[locale]/join-as-interviewer/page.tsx` | Yes | Why Join section with 3 GlowCards. Application form with all fields. Success state with CheckCircle2. |

### Files created
- `src/app/[locale]/interviewers/page.tsx`
- `src/app/[locale]/interviewers/[slug]/page.tsx`
- `src/app/[locale]/interviewers/[slug]/profile-client.tsx`
- `src/app/[locale]/join-as-interviewer/page.tsx`

### Files modified
- `src/messages/ar.json` — Added 3 namespaces: `interviewers` (35 keys), `interviewerProfile` (28 keys), `joinInterviewer` (26 keys)
- `src/messages/en.json` — Same 3 namespaces with English translations

### Design decisions
- **Interviewers Directory**: 6 filter dropdowns using shadcn Select with glass-input styling. Reactive filters via `useMemo`. Cards show colored avatar circles with Arabic initials.
- **Interviewer Profile**: Server page validates slug then delegates to client component. Tabs with gold active state. Deterministic 2-week slot picker. Stats tab with 4 GlowCards. Reviews with Quote icon.
- **Join as Interviewer**: Two-section layout with 3 GlowCards + full application form. Sector/language multi-select with checkbox toggle styling. Visual-only photo dropzone. Submit toggles to success state.
- All strings from i18n. Responsive mobile-first. RTL-aware with logical CSS properties.

### Lint status
- `bun run lint` passes with 0 errors
- Both `ar.json` and `en.json` validated as valid JSON

---

## Phase A — Task 5-c: Auth Pages (B1 Sign In, B1 Register, B2 Forgot Password)

**Date**: 2025-07-31
**Agent**: Auth Pages Builder
**Task ID**: 5-c
**Task**: Build 3 auth pages: Sign In (B1), Register (B1), Forgot Password (B2)

### What was done

Built all 3 authentication pages under `src/app/[locale]/auth/`. Each page uses the existing `AuthShell` brand component and follows the Muqabaleh dark design system. No Navbar/Footer are rendered on auth pages.

| # | Page | File | `use client` | Notes |
|---|------|------|-------------|-------|
| 1 | Sign In (B1) | `src/app/[locale]/auth/signin/page.tsx` | Yes | Email + Password with icon prefixes. Forgot password link aligned end. “or” divider with Separator. Register CTA. Blur validation with red border + error text. Toast on submit. |
| 2 | Register (B1) | `src/app/[locale]/auth/register/page.tsx` | Yes | Two tabs (Individual / Company). Individual: Name, Email, Password (with strength bar), Confirm Password, Country dropdown. Company: adds Company Name, Company Size dropdown, Company Sector dropdown. Full validation. |
| 3 | Forgot Password (B2) | `src/app/[locale]/auth/forgot-password/page.tsx` | Yes | Email input with validation. On submit, switches to success view with Mail icon in emerald circle + back-to-signin link. |

### Files created
- `src/app/[locale]/auth/signin/page.tsx`
- `src/app/[locale]/auth/register/page.tsx`
- `src/app/[locale]/auth/forgot-password/page.tsx`

### Files modified
- `src/messages/ar.json` — Added `auth` namespace (50 keys: titles, labels, placeholders, errors, password strength, countries, company fields, UI strings)
- `src/messages/en.json` — Added matching `auth` namespace (50 keys)

### Design decisions
- **AuthShell**: All 3 pages wrap content in the existing `AuthShell` component (centered card on void bg with aurora effect). Forgot Password uses `subtitle` prop.
- **Form validation**: On-blur validation with `touched` state. Red border (`!border-red-500`) + error message below input on invalid fields. Validates email format, required fields, password length (8+), password match.
- **Password strength**: Calculated from 4 criteria (length >= 8, has number, has uppercase, has special char). 0-1 = weak (red, 30%), 2 = medium (amber, 60%), 3-4 = strong (green, 100%). Animated bar with `transition-all duration-300`.
- **Input styling**: Uses `glass-input` class with `ps-10` for icon padding. Lucide icons (Mail, Lock, User, Building2, Globe) at `strokeWidth={1.75}`.
- **Select dropdowns**: shadcn Select with `glass-input` trigger styling. Dark panel background (`bg-[var(--bg-panel)]`). Country list: Saudi Arabia, UAE, Qatar, Bahrain, Kuwait, Oman, Jordan, Egypt, Other. Company sizes: Small/Medium/Large. Sectors: Tech, Finance, Healthcare, Education, Engineering, Marketing, HR, Other.
- **Tabs**: shadcn Tabs with custom gold active state (`data-[state=active]:bg-[var(--gold)] data-[state=active]:text-[var(--bg-void)]`). Background uses `bg-white/5`.
- **Divider**: “or” / “أو” uses shadcn Separator on both sides with centered text.
- **Forgot Password success state**: Toggles form view to a centered Mail icon in emerald circle + title + subtitle + back-to-signin link with directional arrow icon (ArrowRight for RTL, ArrowLeft for LTR).
- **Phase A behavior**: All forms use `preventDefault` and show `toast.info(t('comingSoon'))` on valid submit. No API calls.
- **Navigation**: Links between auth pages use `Link` from next/link with locale-aware paths (`/${locale}/auth/...`).
- All strings from `useTranslations('auth')`. No hardcoded text. No emojis. Lucide icons only.

### Lint status
- `bun run lint` passes with 0 errors
- `/en/auth/signin`, `/en/auth/register`, `/en/auth/forgot-password` all return HTTP 200
- Pre-existing middleware issue: routes without locale prefix (`/auth/signin`) return 404 — affects all routes, not just auth

---

## Phase A — Task 7-cont: App Pages (C3–C9)

**Date**: 2025-08-01
**Agent**: App Pages Builder
**Task ID**: 7-cont
**Task**: Build/verify 7 app pages: Interview Room (C3), Report (C4), Packages (C5), Payments (C6), Certificates (C7), Profile (C8), Bookings (C9)

### What was done

All 7 pages were already present from a prior build. This task verified full spec compliance, fixed i18n gaps, and added missing mock data to meet the minimum card-per-tab requirement.

| # | Page | File | Spec | Status |
|---|------|------|------|--------|
| C3 | Interview Room | `src/app/[locale]/app/interview/[id]/page.tsx` | Top bar (InterviewAvatar, LiveBadge red, timer, question counter), chat area (6 mock messages with typing dots, Speaker/VolumeX icons), bottom input (text + mic toggle + send), completion overlay (3s progress bar → report link) | Verified complete |
| C4 | Report | `src/app/[locale]/app/interview/[id]/report/page.tsx` | Back button, gold circle 91/100, 4 ScoreBars, green recommendation badge, AI feedback (2 paragraphs), strengths (3 bullets), improvements (3 bullets), QrCard + VerifiedBadge certificate, PDF/LinkedIn/CopyLinkButton/retrain buttons | Verified complete |
| C5 | Packages | `src/app/[locale]/app/packages/page.tsx` | Balance card (3 sessions), 4 pricing cards with PriceTag, balance history table (5 rows) | Verified complete |
| C6 | Payments | `src/app/[locale]/app/payments/page.tsx` | Table (date, package, amount, status badge, order ID), 5 mock rows with captured/failed/pending states | Verified complete |
| C7 | Certificates | `src/app/[locale]/app/certificates/page.tsx` | Grid of 3 certificate cards (name, score, date, QrCard, VerifiedBadge, view report link) | Verified complete |
| C8 | Profile | `src/app/[locale]/app/profile/page.tsx` | Form (Name, Country, Industry, Experience, Gender pref, Language), save button, change password section (3 fields), delete account with 2-step AlertDialog | Verified complete |
| C9 | Bookings | `src/app/[locale]/app/bookings/page.tsx` | 3 tabs (upcoming/completed/cancelled), 2-3 cards per tab, cancel AlertDialog, join meeting + view report actions | Fixed (added b6) |

### Files modified
- `src/messages/ar.json` — Added `comingSoon` to `common` namespace; added `b6Interviewer/b6Date/b6Time/b6Type` to `app.bookings`
- `src/messages/en.json` — Same additions in English
- `src/app/[locale]/app/bookings/page.tsx` — Added 6th booking (b6, Noora, 2026-08-03, Technical, upcoming) so the upcoming tab has 2 cards

### Fixes applied
1. **`comingSoon` missing from `common`**: Report page, Packages page, and Profile page referenced `tCommon('comingSoon')` but the key only existed in the `auth` namespace. Added it to `common` in both `ar.json` and `en.json`.
2. **Bookings upcoming tab had 1 card**: Spec requires 2-3 cards per tab. Added a 6th mock booking (Noora, 2026-08-03 03:30 PM, Technical) as `upcoming` status. Now: upcoming=2, completed=2, cancelled=2.

### Design decisions
- All pages use `'use client'` as required
- All strings sourced from `useTranslations` — no hardcoded text
- Lucide icons only, all with `strokeWidth={1.75}`
- Brand components used: GlowCard, ScoreBar, LiveBadge, VerifiedBadge, QrCard, CopyLinkButton, InterviewAvatar, PriceTag, EmptyState, SkeletonBlock, CountUpStat
- shadcn/ui components: Button, Input, Select, Tabs, AlertDialog, Badge, Separator
- Responsive mobile-first design with Tailwind prefixes
- No Navbar/Footer imports (app layout provides sidebar)
- All tables use `overflow-x-auto` for mobile scroll

### Lint status
- `bun run lint` passes with 0 errors
- Both `ar.json` and `en.json` validated as valid JSON

---

## Phase A — Task 8-a: B2B Sidebar, Pages (E1–E7), Demo, Guest

**Date**: 2025-07-30
**Agent**: B2B Pages Builder
**Task ID**: 8-a
**Task**: Build B2B sidebar layout, 7 B2B pages (E1–E7), Demo page, and Guest interview page

### What was done

Built the complete B2B section of Muqabaleh with a sidebar layout, 7 functional pages, and 2 standalone pages. All pages use `'use client'`, all strings from `useTranslations`, Lucide icons only (`strokeWidth={1.75}`), and the Muqabaleh design system.

| # | Page | File | `use client` | Notes |
|---|------|------|-------------|-------|
| 0 | B2B Layout | `src/app/[locale]/b2b/layout.tsx` | Yes | Fixed left sidebar (RTL: right), 260px, bg-panel. Logo + 'لوحة الأعمال'. 5 nav items (LayoutDashboard, Briefcase, Users, Receipt, Settings). Active state: gold border-s + gold text + gold/10 bg. Bottom: sessions badge, company name, sign out. Mobile: Sheet hamburger. |
| E1 | Onboarding | `src/app/[locale]/b2b/onboarding/page.tsx` | Yes | Standalone (no sidebar). AuthShell-like centered card. 3-step wizard: Step 1 (company name, industry Select, country Select, company size), Step 2 (3 radio plan cards: Starter/Business/Enterprise with price + credits), Step 3 (email inputs with add/remove). Progress bar. Next/Back/Skip/Finish buttons. |
| E2 | Dashboard | `src/app/[locale]/b2b/page.tsx` | Yes | 5 KPI GlowCards (Candidates 47, Completed 23, Avg Score 78, Sessions Left 15, SLA Breaches 3 in red). Recent Activity section with 5 events + timestamps. |
| E3a | Jobs List | `src/app/[locale]/b2b/jobs/page.tsx` | Yes | H1 + 'إنشاء مقابلة' gold button. Desktop table + mobile cards. 3 mock jobs (Senior SE, Data Analyst, Digital Marketing Mgr). Status badges (Active=emerald, Completed=gold). |
| E3b | New Job | `src/app/[locale]/b2b/jobs/new/page.tsx` | Yes | Back button + H1. Glass card form: title, industry Select, type Select (behavioral/technical), mode radio (AI vs Human with +$39 note), human mode: assignment radio (Auto/Panel), panel shows 2 interviewer selects, must-ask questions (up to 5 with add/remove), invite deadline date, candidates textarea + CSV upload + template download link. |
| E4 | Candidates | `src/app/[locale]/b2b/jobs/[id]/page.tsx` | Yes | Back + H1 (job title from params). 3 stats row. Desktop table + mobile cards. 5 mock candidates with 4 score columns + overall + recommendation badge. Status badges (completed/emerald, inProgress/cyan, invited/gold, slaBreached/red). Export CSV button. Click completed candidate → Dialog report modal with score circle, 4 ScoreBars, recommendation, AI feedback, strengths/improvements, company criteria section. |
| E5 | Team | `src/app/[locale]/b2b/team/page.tsx` | Yes | H1 + 'دعوة عضو' gold button. Desktop table + mobile cards. 4 mock members. Role badges (Admin=gold, Member=muted). Remove button per row. Invite dialog: email input + role select (Admin/Member). |
| E6 | Billing | `src/app/[locale]/b2b/billing/page.tsx` | Yes | Balance card (15 مقابلة) with CreditCard icon + 'شراء مقابلات إضافية' gold button. Invoices table: 5 mock rows (date, description, amount, status badge: Paid=emerald, Pending=amber). |
| E7 | Settings | `src/app/[locale]/b2b/settings/page.tsx` | Yes | Company info GlowCard: name, industry, country, size (all pre-filled). Panel Interviewers GlowCard: 2 pinned interviewers with remove button. SLA Settings GlowCard: hours input (72 default) + custom text textarea. Save button. |
| — | Demo | `src/app/[locale]/demo/page.tsx` | Yes | Standalone (no sidebar). AuthShell-like centered card. Logo, title, subtitle, gold 'ابدأ التجربة' button (shows toast), refresh note. |
| — | Guest | `src/app/[locale]/interview/guest/[token]/page.tsx` | Yes | Standalone. Logo + company name + position + AI badge. Form: name, email, consent checkbox, 'ابدأ المقابلة' button. Submit → confirmed state with CheckCircle2 icon. |

### Files created
- `src/app/[locale]/b2b/layout.tsx`
- `src/app/[locale]/b2b/page.tsx` (E2 Dashboard)
- `src/app/[locale]/b2b/onboarding/page.tsx` (E1)
- `src/app/[locale]/b2b/jobs/page.tsx` (E3a Jobs List)
- `src/app/[locale]/b2b/jobs/new/page.tsx` (E3b New Job)
- `src/app/[locale]/b2b/jobs/[id]/page.tsx` (E4 Candidates)
- `src/app/[locale]/b2b/team/page.tsx` (E5)
- `src/app/[locale]/b2b/billing/page.tsx` (E6)
- `src/app/[locale]/b2b/settings/page.tsx` (E7)
- `src/app/[locale]/demo/page.tsx` (Demo)
- `src/app/[locale]/interview/guest/[token]/page.tsx` (D1 Guest)

### Files modified
- `src/messages/ar.json` — Added 3 namespaces: `b2b` (~200 keys across onboarding, dashboard, jobs, candidates, team, billing, settings), `demo` (4 keys), `guest` (10 keys)
- `src/messages/en.json` — Same 3 namespaces with English translations

### Design decisions
- **B2B Layout**: Modeled after existing `app/layout.tsx` sidebar pattern. 260px width, bg-panel, border-s for RTL. Nav items use `border-s-gold` for active state (gold left border in LTR, gold right border in RTL). Mobile uses Sheet with locale-aware side (`left` for ar, `right` for en). Bottom section has sessions badge, company name, and sign out button.
- **Onboarding**: Standalone page (no sidebar layout). Uses AuthShell-like pattern (aurora bg, centered card, logo). 3-step wizard with progress bar using `border-s` for gold highlight. Plan selection uses custom radio cards with `border-gold` + `bg-gold/10` for selected state. Email rows with add/remove (max 10).
- **Dashboard**: 5 KPI cards in a 5-column grid (`lg:grid-cols-5`) using GlowCard. Uses plain number display instead of CountUpStat (which expects string). Activity list with gold dots and relative timestamps.
- **Jobs List**: Desktop table + mobile card fallback. Status badges use color-coded border/bg/text classes. Jobs link to candidates page via `/b2b/jobs/${i+1}`.
- **New Job Form**: Conditional rendering for Human mode (shows assignment mode radio + panel interviewer selects). Must-ask questions with add/remove (max 5). File upload input (visual-only) + download template link. All from i18n.
- **Candidates**: Desktop table with 9 columns + mobile cards. Click handler on rows with scores opens Dialog report modal. Report modal includes score circle, ScoreBars, recommendation badge, AI feedback, strengths/improvements, and company criteria section (matching C4 report format plus company criteria). Status badges color-coded per status type.
- **Team**: Desktop table + mobile cards. Invite uses shadcn Dialog with email + role select. Role badges: Admin (gold), Member (muted).
- **Billing**: Balance card with large gold number + CreditCard icon. Invoices table with paid/pending status badges.
- **Settings**: Three GlowCard sections: company info (pre-filled form), panel interviewers (removable list items), SLA settings (hours input + custom text). Uses `tAuth` for reusing existing sector/country/size translations from `auth` namespace.
- **Demo/Guest**: Both standalone (no layout wrapper). AuthShell-like pattern with aurora bg. Guest page has two states: form and confirmed.
- All pages: Responsive mobile-first. RTL-aware with logical CSS properties (`border-s`, `ps-`, `pe-`, `ms-`, `me-`). Touch targets 44px minimum.
- All strings from i18n. No hardcoded text. No emojis. Lucide icons only with `strokeWidth={1.75}`.

### Lint status
- `bun run lint` passes with 0 errors
- Both `ar.json` and `en.json` validated as valid JSON
- All 10 new `/en/` routes return HTTP 200
- Pre-existing middleware issue: `/ar/` routes redirect and return 404 (affects all routes, not just B2B)

---

## Phase A — Task 9-a: Interviewer Panel (F1–F6)

**Date**: 2025-08-01
**Agent**: Interviewer Panel Builder
**Task ID**: 9-a
**Task**: Build interviewer sidebar layout + 6 pages (Dashboard, Availability, Bookings, Evaluate, Earnings, Profile)

### What was done

Built the complete interviewer panel section of Muqabaleh with a sidebar layout (matching the B2B pattern) and 6 functional pages. All pages use `'use client'`, all strings from `useTranslations('interviewerPanel')`, Lucide icons only (`strokeWidth={1.75}`), and the Muqabaleh design system.

| # | Page | File | `use client` | Notes |
|---|------|------|-------------|-------|
| L | Layout | `src/app/[locale]/interviewer/layout.tsx` | Yes | Fixed left sidebar (RTL: right), 260px, bg-panel. Logo + sidebar title. 5 nav items (LayoutDashboard, Calendar, CalendarCheck, DollarSign, User). Active state: gold border-s + gold text + gold/10 bg. Bottom: green accredited badge, sign out. Mobile: Sheet hamburger. |
| F1 | Dashboard | `src/app/[locale]/interviewer/page.tsx` | Yes | 4 KPI GlowCards (upcoming 5, earnings $487, rating 4.8, accredited green). 3 upcoming booking cards with candidate name, date/time, B2B company badge with required questions count, red warning if <2h away. |
| F2 | Availability | `src/app/[locale]/interviewer/availability/page.tsx` | Yes | Weekly schedule editor. 7 rows (Sat-Fri AR, Mon-Sun EN). Each row: day select, from/to time selects (06:00-22:00), timezone select (Asia/Riyadh default). 4 pre-filled rows. Add/remove row buttons. Save button (btn-gold). |
| F3 | Bookings | `src/app/[locale]/interviewer/bookings/page.tsx` | Yes | 2 tabs (upcoming/past). Upcoming: 3 cards with candidate name, date/time, B2B badge, meeting URL input + save, red warning if <2h, evaluate link, past-due action buttons (completed green + no-show red). Past: 3 cards with completed/no-show status badges. |
| F4 | Evaluate | `src/app/[locale]/interviewer/bookings/[id]/evaluate/page.tsx` | Yes | Back button + H1 with candidate name. 4 criteria ScoreBars + Sliders (Content, Clarity, Confidence, Cultural Fit) 0-100. 3 required question text areas. Strengths + Improvements text areas. Recommendation select (Recommended/Under Consideration/Not Recommended). Submit button. |
| F5 | Earnings | `src/app/[locale]/interviewer/earnings/page.tsx` | Yes | 3 stat cards (Total $1,240, Pending $195, Paid $1,045). Earnings table: 8 rows with date, candidate, amount, status badge (paid/emerald, pending/amber), payout method. |
| F6 | Profile | `src/app/[locale]/interviewer/profile/page.tsx` | Yes | 2-column layout. Photo upload dropzone with avatar placeholder. Bio AR/EN textareas (pre-filled). Current title input, years experience + session price number inputs. Sectors checkboxes (9 sectors, 3 pre-selected). Languages checkboxes (6 languages, 2 pre-selected). Exclusion sectors checkboxes (9 sectors, 1 pre-selected, red highlight). Save button with toast. |

### Files created
- `src/app/[locale]/interviewer/layout.tsx`
- `src/app/[locale]/interviewer/page.tsx` (F1 Dashboard)
- `src/app/[locale]/interviewer/availability/page.tsx` (F2)
- `src/app/[locale]/interviewer/bookings/page.tsx` (F3)
- `src/app/[locale]/interviewer/bookings/[id]/evaluate/page.tsx` (F4)
- `src/app/[locale]/interviewer/earnings/page.tsx` (F5)
- `src/app/[locale]/interviewer/profile/page.tsx` (F6)

### Files modified
- `src/messages/ar.json` — Added `interviewerPanel` namespace (~120 keys: sidebar, dashboard, availability, bookings, evaluate, earnings, profile)
- `src/messages/en.json` — Same `interviewerPanel` namespace with English translations

### Design decisions
- **Layout**: Modeled after existing B2B layout pattern. 260px width, bg-panel, border-s for RTL. Nav items use `border-s-gold` for active state. Mobile uses Sheet with locale-aware side. Bottom section has green accredited badge and sign out button.
- **Dashboard**: 4 KPI GlowCards in a responsive grid. Each has an icon with colored background. Upcoming bookings as GlowCard grid with B2B company badges and required questions count. Near-session warning uses red AlertTriangle.
- **Availability**: Dynamic rows with add/remove. Day order is locale-aware (Sat-Fri for Arabic, Mon-Sun for English). Time options generated from 06:00-22:00 in 30-min increments. 8 timezone options with Asia/Riyadh default.
- **Bookings**: Tabs component for upcoming/past. Upcoming cards have meeting URL input with save, evaluate link, and past-due action buttons. Past cards have status badges. `pastDue` flag on booking data controls action button visibility.
- **Evaluate**: ScoreBar + Slider combo for 4 criteria (bidirectional). Required question answers as 3 text areas with labels. Strengths/improvements as side-by-side text areas. Recommendation as shadcn Select. Uses `useParams` directly (no useEffect) to avoid lint error.
- **Earnings**: 3 stat cards with colored icons. Table with 8 rows and overflow-x-auto for mobile. Status badges color-coded.
- **Profile**: 2-column responsive layout. Checkboxes use `has-[[data-state=checked]]` Tailwind pseudo-class for visual feedback. Exclusion sectors use red highlight instead of gold. Photo dropzone is visual-only. Save triggers sonner toast.
- All pages: Responsive mobile-first. RTL-aware with logical CSS properties (`border-s`, `ms-`, `me-`). Touch targets 44px minimum.
- All strings from i18n. No hardcoded text. No emojis. Lucide icons only with `strokeWidth={1.75}`.

### Lint status
- `bun run lint` passes with 0 errors
- Both `ar.json` and `en.json` validated as valid JSON

---

## Phase A - Task 9-b: Admin Panel

**Date**: 2025-07-15
**Agent**: Admin Panel Builder
**Task**: Build admin panel layout + 9 pages (G1-G9) at `/src/app/[locale]/admin/`

### What was done

Built the complete admin panel with fixed sidebar layout (mirroring interviewer panel pattern) and 9 fully functional pages with mock data, interactive filters, dialogs, and state management.

| # | Page | File | `use client` | Notes |
|---|------|------|-------------|-------|
| L | Layout | `src/app/[locale]/admin/layout.tsx` | Yes | Fixed 260px sidebar (RTL: right), bg-panel. Logo + title header. 9 nav items with gold active border. Red ShieldCheck system admin badge at bottom + sign out. Mobile Sheet hamburger. |
| G1 | Dashboard | `src/app/[locale]/admin/page.tsx` | Yes | 4 KPI GlowCards with CountUpStat (Users 1,247, Interviews 3,891, Revenue $24,560, Daily Activity 127). Mock bar chart (7 days). 6 recent events with colored icon badges. |
| G2 | Users | `src/app/[locale]/admin/users/page.tsx` | Yes | Search + role/status filters. 8 mock rows. Switch toggle. Add sessions dialog. |
| G3 | Interviewers | `src/app/[locale]/admin/interviewers/page.tsx` | Yes | Status filter. 8 mock rows (2 pending, 4 approved, 2 suspended). Approve/reject/suspend actions. Expandable bio. |
| G4 | Bookings | `src/app/[locale]/admin/bookings/page.tsx` | Yes | All/SLA-overdue filter. 6 mock rows. Red highlight for SLA overdue. Reassign dialog. |
| G5 | Questions | `src/app/[locale]/admin/questions/page.tsx` | Yes | Add question dialog. Import button. 3 filters. 10 mock rows. Active toggle per row. |
| G6 | Payouts | `src/app/[locale]/admin/payouts/page.tsx` | Yes | 2 tabs: All Payments + Interviewer Dues. Mark-as-paid dialog with method select. |
| G7 | Interviews | `src/app/[locale]/admin/interviews/page.tsx` | Yes | Status filter. 8 mock rows. Mode badges. EVALUATION_FAILED regeneration button. |
| G8 | Logs | `src/app/[locale]/admin/logs/page.tsx` | Yes | Search + date range filters. 10 mock log entries with colored event badges. |
| G9 | Settings | `src/app/[locale]/admin/settings/page.tsx` | Yes | 3 GlowCard sections: env keys, package pricing, platform settings. |

### Files created
- `src/app/[locale]/admin/layout.tsx`
- `src/app/[locale]/admin/page.tsx` (G1)
- `src/app/[locale]/admin/users/page.tsx` (G2)
- `src/app/[locale]/admin/interviewers/page.tsx` (G3)
- `src/app/[locale]/admin/bookings/page.tsx` (G4)
- `src/app/[locale]/admin/questions/page.tsx` (G5)
- `src/app/[locale]/admin/payouts/page.tsx` (G6)
- `src/app/[locale]/admin/interviews/page.tsx` (G7)
- `src/app/[locale]/admin/logs/page.tsx` (G8)
- `src/app/[locale]/admin/settings/page.tsx` (G9)

### Files modified
- `src/messages/ar.json` - Added `adminPanel` namespace (~280 keys)
- `src/messages/en.json` - Same `adminPanel` namespace with English translations

### Lint and type-check status
- `bun run lint` passes with 0 errors
- `npx tsc --noEmit` passes for all admin files
- Both `ar.json` and `en.json` validated as valid JSON
---
Task ID: 10
Agent: Phase A Lead
Task: Phase A verification and evidence compilation

Work Log:
- Fixed CountUpStat crash (value.match on non-string) in count-up-stat.tsx
- Fixed middleware matcher to include all public routes (not just / and /en/*, /ar/*)
- Added "type": "module" to package.json to fix Tailwind CSS 4 module warning
- Ran full curl status table: 48 routes × 2 locales = 96 tests, 47/48 routes return 200 in both AR and EN
- The 1 non-200 was /interviewers/dr-huda-alsalem (404) — slug not in valid set; valid slug huda-al-salem returns 200
- Verified HTML structure: AR pages render with lang="ar" dir="rtl"
- Ran palette grep: only design-system hexes found (#070A0F, #0B0F17, #D4A843, #E8C15F, #B8860B, #10B981, #22D3EE, #F8FAFC, #94A3B8, #64748B, #EF4444, #F59E0B) + pre-existing shadcn chart.tsx (#ccc, #fff)
- bun run lint: 0 errors
- Browser screenshot limitation: agent-browser can only reach port 81 (Z.ai proxy placeholder), not port 3000 (our dev server). Dev server OOMs under sustained load from 48 large Turbopack-compiled pages. Production build required for stable browser testing.

Stage Summary:
- Phase A COMPLETE: 48 pages, 13 brand components, 2 layout components, full i18n (ar+en), all routes verified 200
- Known environment limitation: dev server memory with 48 pages requires production build for sustained operation

---

## Palette Grep Proof — Phase A Design System Compliance

**Date**: 2025-07-15
**Agent**: Palette Grep Proof
**Task**: Verify all hex colors in src/ match the approved Phase A design-system palette.

### Approved Palette (7 hexes)

| Hex | Name |
|-----|------|
| `#070A0F` | void |
| `#0B0F17` | panel |
| `#D4A843` | gold |
| `#10B981` | emerald |
| `#22D3EE` | cyan |
| `#FFFFFF` | white |
| `#000000` | black |

### Search Scope

- **Files searched**: all `.tsx`, `.ts`, `.css` under `src/` (excluding `node_modules`, `.next`, binaries)
- **Patterns searched**: `#[0-9a-fA-F]{3,8}`, `rgb()`, `hsl()`
- **rgb()/hsl() results**: NONE found.

### Complete Hex Inventory

#### ✅ APPROVED hexes found

| Hex | File | Lines |
|-----|------|-------|
| `#070A0F` | `src/app/globals.css` | 9, 135 |
| `#0B0F17` | `src/app/globals.css` | 10 |
| `#D4A843` | `src/app/globals.css` | 13, 127, 134; `src/app/[locale]/interview/guest/[token]/page.tsx` | 33,34,35; `src/components/brand/auth-shell.tsx` | 34,40,43; `src/app/[locale]/b2b/onboarding/page.tsx` | 80,81,82; `src/components/brand/interview-avatar.tsx` | 48; `src/app/[locale]/demo/page.tsx` | 26,32,35 |
| `#10B981` | `src/app/globals.css` | 16 |
| `#22D3EE` | `src/app/globals.css` | 17 |

#### 🚨 OFF-SYSTEM hexes found

| # | Hex | Context / CSS Var | File(s) | Line(s) |
|---|-----|-------------------|---------|--------|
| 1 | `#E8C15F` | `--gold-hover` | `src/app/globals.css` | 14, 127, 134; `src/components/brand/interview-avatar.tsx` | 48 |
| 2 | `#B8860B` | `--gold-dim` | `src/app/globals.css` | 15, 127 |
| 3 | `#F8FAFC` | `--text-primary` | `src/app/globals.css` | 18, 77 |
| 4 | `#94A3B8` | `--text-muted` | `src/app/globals.css` | 19 |
| 5 | `#64748B` | `--text-faint` | `src/app/globals.css` | 20 |
| 6 | `#EF4444` | `--status-red` | `src/app/globals.css` | 21 |
| 7 | `#F59E0B` | `--status-amber` | `src/app/globals.css` | 22 |
| 8 | `#ccc` | Recharts chart override (shorthand) | `src/components/ui/chart.tsx` | 58 (×3) |
| 9 | `#fff` | Recharts chart override (shorthand ≈ #FFFFFF) | `src/components/ui/chart.tsx` | 58 (×2) |

### Notes

- **`#fff`** (chart.tsx) is semantically equivalent to approved `#FFFFFF` (white), but uses shorthand notation.
- **`#ccc`** (chart.tsx) is a 3-char shorthand for `#CCCCCC` — NOT in the approved palette. These are pre-existing shadcn/ui chart overrides (stroke overrides on Recharts SVG elements).
- **`#E8C15F`** (gold-hover) and **`#B8860B`** (gold-dim) are gold-variant CSS variables used for hover states and gradients in `globals.css` and `interview-avatar.tsx`.
- **`#F8FAFC`**, **`#94A3B8`**, **`#64748B`** are Tailwind Slate scale values used for text colors. They are NOT the approved `#FFFFFF` or `#000000`.
- **`#EF4444`** and **`#F59E0B`** are Tailwind Red-500 and Amber-500 used as semantic status colors.

### Verdict

## PALETTE VIOLATION: 9 off-system hexes found (8 strictly off-system + 1 shorthand of approved white)

**Strict violations (must fix)**:
1. `#E8C15F` — 5 occurrences in 2 files
2. `#B8860B` — 2 occurrences in 1 file
3. `#F8FAFC` — 2 occurrences in 1 file
4. `#94A3B8` — 1 occurrence
5. `#64748B` — 1 occurrence
6. `#EF4444` — 1 occurrence
7. `#F59E0B` — 1 occurrence
8. `#ccc` — 3 occurrences in chart.tsx

**Minor (shorthand of approved)**: `#fff` ≈ `#FFFFFF` — 2 occurrences in chart.tsx

### Recommended Fixes

1. **globals.css** — Replace `--gold-hover`, `--gold-dim`, `--text-primary`, `--text-muted`, `--text-faint`, `--status-red`, `--status-amber` with approved palette hexes or remove unused vars.
2. **chart.tsx** — Replace `#ccc` with a design-system color or CSS variable reference; replace `#fff` with `#FFFFFF` or a CSS variable.
3. **interview-avatar.tsx** — Replace `#E8C15F` in inline gradient with a design-system gold variant or CSS var reference.

## Task B5 — Dashboard: Replace Mock Data with Real DB Queries

**Date**: 2025-07-15
**Agent**: Dashboard Rewrite (B5)
**Task**: Rewrite `/src/app/[locale]/app/page.tsx` to read real data from the database

### What was done

1. **Converted page to async Server Component** — Removed `'use client'`, made `DashboardPage` an `async` function that receives `params: Promise<{ locale: string }>`.

2. **Added auth guard** — Calls `requireAuth()` from `@/lib/session`; if no session, redirects to `/${locale}/auth/signin`. Also fetches the full `User` record from the database via `db.user.findUnique`.

3. **Real interview data** — Replaced the 5 hardcoded mock interviews with:
   ```ts
   db.interview.findMany({
     where: { userId: user.id },
     orderBy: { createdAt: 'desc' },
     take: 5,
     include: { messages: { take: 1, orderBy: { createdAt: 'asc' } } },
   })
   ```

4. **Computed stats from DB** — `completedCount` and `avgScore` are now derived from actual interview records (status `COMPLETED`, averaging `overallScore`). `sessionsLeft` comes from `user.sessionsLeft` in the database.

5. **i18n via `getTranslations`** — Uses `next-intl/server`'s `getTranslations('app.dashboard')` instead of client-side `useTranslations`. All labels (welcome, stats, table headers, statuses, form) come from the translation files.

6. **Industry/Type label mappers** — Added `INDUSTRY_LABELS` and `TYPE_LABELS` lookup tables with AR/EN values, used to render human-readable industry and interview-type names from the database enum-style strings (e.g. `IT` → `تقنية المعلومات`).

7. **StatusBadge helper** — Inline server component that renders localized status badges for `COMPLETED`, `IN_PROGRESS`, `PENDING`, and `EVALUATION_FAILED` with appropriate colors (emerald, amber, muted, red).

8. **Extracted `NewInterviewForm` client component** — Created `/src/app/[locale]/app/new-interview-form.tsx` as a `'use client'` component that handles the interactive form state (field, experience, type, interviewer gender). It receives `sessionsLeft` as a prop and shows the correct warning text. The form is non-functional (Phase C) — shows a toast placeholder.

9. **Zero-sessions CTA** — When `user.sessionsLeft === 0`, renders a `GlowCard` with an `AlertTriangle` icon, prompt text, and a gold link to `/app/packages`.

10. **Empty state** — When user has no interviews, shows `EmptyState` brand component with `MessageSquare` icon.

11. **Date formatting** — Interview dates use `toLocaleDateString` with `ar-SA` or `en-US` based on locale.

### Design preserved
- Dark glass-morphism theme (void bg, panel cards, gold accents, emerald for success)
- Same 4-stat grid with `GlowCard` + `CountUpStat` + Lucide icons
- Same table layout with rounded-2xl border and hover rows
- Same interview-gender selection cards with `InterviewAvatar`
- Same `glass-input` selects and `btn-gold` CTA

### Files changed
| File | Action |
|------|--------|
| `src/app/[locale]/app/page.tsx` | Rewritten: server component with real DB data |
| `src/app/[locale]/app/new-interview-form.tsx` | New: extracted client form component |
| `worklog.md` | Appended this entry |

### Lint status
✅ `bun run lint` — no errors
✅ Dev server — clean, no compilation errors

---

## Phase C — Task B6: Interviews List Page (C2) — Real DB Data

**Date**: 2025-07-31
**Agent**: Interviews Page Builder
**Task ID**: B6
**Task**: Rewrite `/src/app/[locale]/app/interviews/page.tsx` to use real database data instead of mock data

### What was done

Converted the interviews list page from a fully client-side mock-data page into a proper server-rendered page that reads real interview records from the SQLite database via Prisma.

#### Architecture
- **Server component** (`page.tsx`): Handles auth via `requireAuth()`, redirects to `/auth/signin` if no session, fetches up to 20 interviews from DB ordered by `createdAt desc`, maps industry/type codes to localized labels, passes serialized rows to client component.
- **Client component** (`interviews-client.tsx`): Receives pre-processed interview data, manages filter tab state (ALL/COMPLETED/IN_PROGRESS/PENDING), renders cards with status badges, ScoreBar for completed interviews, action buttons (view report / resume).

#### Features
1. **Auth guard**: Server-side redirect to `/${locale}/auth/signin` if no session
2. **Real DB query**: `db.interview.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 20 })`
3. **i18n**: `getTranslations('app.interviews')` on server, `useTranslations('app.interviews')` on client
4. **Status badges** with correct colors:
   - `PENDING` → amber with Clock icon
   - `IN_PROGRESS` → cyan with pulsing dot (using `animate-pulse-cyan`)
   - `COMPLETED` → emerald with CheckCircle2 icon
   - `EVALUATION_FAILED` → red with AlertTriangle icon
5. **Filter tabs**: 4 pill buttons (ALL, COMPLETED, IN_PROGRESS, PENDING) with gold active state, client-side filtering
6. **ScoreBar**: Brand `ScoreBar` component shown for completed interviews (desktop only)
7. **Score display**: Bold number, emerald if >= 80, amber otherwise
8. **Action buttons**: "View Report" link for completed, "Resume" link for in-progress
9. **EmptyState**: Brand `EmptyState` with CTA button linking to `/app` when no interviews match
10. **Localized industry/type labels**: Same mapper as dashboard page (IT, FINANCE, MEDICINE, ENGINEERING, EDUCATION, MARKETING, SALES, HR / BEHAVIORAL, TECHNICAL)
11. **Dark glass design**: void bg, `glass-card` class, gold accents, consistent with app sidebar layout
12. **RTL support**: Uses logical CSS properties, locale-aware date formatting
13. **Max height with scroll**: Interview list has `max-h-[calc(100vh-280px)] overflow-y-auto` for long lists

### Files created
- `src/app/[locale]/app/interviews/interviews-client.tsx` — Client component with filter tabs, interview cards, status badges

### Files modified
- `src/app/[locale]/app/interviews/page.tsx` — Rewritten from 'use client' with mock data to server component with real DB data
- `src/messages/ar.json` — Added 4 keys to `app.interviews`: `evaluationFailed`, `overallScore`, `startNew`, `startNewHref`
- `src/messages/en.json` — Same 4 keys added in English
- `tailwind.config.ts` — Added `pulse-cyan` keyframe and animation for IN_PROGRESS badge pulsing dot

### Design decisions
- **Split server/client**: Page is a server component for data fetching/auth; `InterviewsClient` handles interactive filter state. This avoids sending DB client to the browser.
- **Industry/type label mapper duplicated from dashboard**: Same `INDUSTRY_LABELS` / `TYPE_LABELS` maps used. Could be extracted to a shared util in the future.
- **Date serialization**: Server converts `DateTime` to ISO string via `toISOString()` to avoid serialization issues across server/client boundary.
- **Filter tabs as buttons instead of Select dropdowns**: Better UX for the 4-option status filter. Gold active state matches the brand design system.
- **ScoreBar hidden on mobile**: The `hidden sm:block` class keeps the score bar visible only on desktop to avoid crowding the card layout.
- **No InterviewAvatar**: Unlike the old mock page, the real data doesn't have an interviewer avatar field, so we use a generic MessageSquare icon in a glass container instead.

### Lint status
- `bun run lint` passes with 0 errors
- Dev server compiles cleanly with no warnings

## Task B7 — Profile Page (Real Data)

**Date**: 2025-07-25
**Agent**: Task B7 Profile Builder

### What was done

Rewrote the user profile page (`/app/profile`) to read and update real data from the database.

1. **`src/app/[locale]/app/profile/page.tsx`** — Converted from a `'use client'` stub to a **server component** that:
   - Calls `requireAuth()` to check session; redirects to `/{locale}/auth/signin` if not authenticated
   - Fetches real user data via `db.user.findUnique({ where: { id: session.user.id } })` selecting only profile-safe fields
   - Passes the fetched data and locale to the new `ProfileForm` client component

2. **`src/app/[locale]/app/profile/profile-form.tsx`** — New `'use client'` component containing:
   - **Profile fields**: name (editable), email (read-only display with Mail icon), country, industry, experience, interviewerGender (MALE/FEMALE), language (AR/EN)
   - **Country list**: 16 Arab countries (Saudi Arabia, UAE, Egypt, Jordan, Kuwait, Bahrain, Oman, Qatar, Lebanon, Iraq, Morocco, Algeria, Tunisia, Yemen, Sudan, Libya) with bilingual labels
   - **Industry options**: IT, FINANCE, MEDICINE, ENGINEERING, EDUCATION, MARKETING, SALES, HR (mapped to `app.dashboard.field*` translations)
   - **Experience options**: JUNIOR, MID, SENIOR, EXECUTIVE (mapped to `app.dashboard.exp*` translations)
   - **Save button**: PUTs to `/api/users/me` with updated fields; shows success/error toast
   - **Change Password section**: currentPassword, newPassword, confirmPassword fields; validates match and min-length client-side; PUTs to `/api/users/me/password`; clears fields on success
   - **Delete Account section**: Red danger zone with double-confirmation AlertDialog (two steps); calls DELETE `/api/users/me/delete` then `signOut()`
   - All buttons show `Loader2` spinner during async operations
   - Uses shadcn `Input`, `Select`, `Button`, `Label`, `AlertDialog` components
   - Dark glass design with `glass-input`, `bg-gold/10`, `text-gold` accents

3. **i18n updates** (`src/messages/en.json` + `src/messages/ar.json`):
   - Added `email`, `passwordMismatch`, `passwordMinLength`, `passwordChanged` keys to `app.profile`

### Files changed
- `src/app/[locale]/app/profile/page.tsx` — rewritten as server component
- `src/app/[locale]/app/profile/profile-form.tsx` — new file
- `src/messages/en.json` — added 4 profile i18n keys
- `src/messages/ar.json` — added 4 profile i18n keys

### Lint status
- `bun run lint` passes with 0 errors

---
Task ID: B1-B8
Agent: main
Task: Phase B — Auth + User Core

Work Log:
- Wrote complete Prisma schema (11 models) with SQLite adaptations (JSON strings for arrays, Int cents for money, String for enums, // ADAPTATION comments)
- Pushed schema to SQLite, generated Prisma client
- Created seed script: 12 users, 2 companies, 8 interviewer profiles (6 approved + 2 pending), 80 questions (8 industries × 5 behavioral + 5 technical), 2 sample completed interviews with messages, 6 demo B2B candidates
- Implemented NextAuth v4 credentials provider with JWT strategy in src/lib/auth.ts
- Created auth API routes: POST /api/auth/register (INDIVIDUAL+B2B), POST /api/auth/forgot-password
- Created user API routes: GET/PUT /api/users/me, PUT /api/users/me/password, DELETE /api/users/me/delete
- Wired C1 dashboard to real DB data (user name, sessions, interviews list, scores)
- Wired C2 interviews page to real DB data (status filters, scores, localized labels)
- Wired C8 profile page to real DB data (read+update form, password change, delete account)
- Wired auth/signin page to NextAuth signIn() client
- Fixed bcryptjs import (randomBytes → crypto.randomBytes)
- Fixed Prisma model name casing (b2bJob → b2BJob)
- All palette clean (0 off-system hexes)
- ESLint: 0 errors

Stage Summary:
- DB: 14 users, 3 companies, 8 interviews, 80 questions, 16 messages, 120 availabilities, 8 profiles, 2 B2B jobs
- API verified: register(individual+B2B) ✓, forgot-password ✓, duplicate register 409 ✓, validation 400 ✓
- Browser verified: login → dashboard shows real name + scores, interviews page shows real data with filters, profile page shows real data with edit form
- Credentials: admin@muqabaleh.com/admin123, user@seed.com/user123, demo@muqabaleh.com/demo123

---

## Phase C — Task C-frontend: Wire Frontend Pages for Interview Engine

**Date**: 2025-08-01
**Agent**: Frontend Wiring Agent
**Task ID**: C-frontend
**Task**: Wire 5 frontend pages to use real backend APIs instead of mock data

### What was done

Wired 5 pages + created 1 new guest room page to connect the Phase C backend APIs:

#### 1. C1 New Interview Form (`src/app/[locale]/app/new-interview-form.tsx`)
- Replaced toast placeholder with `POST /api/interviews` call
- Added value mappers: `it→IT`, `finance→FINANCE`, `junior→JUNIOR`, `behavioral→BEHAVIORAL`, etc.
- 201: redirects to `/app/interview/${interviewId}`
- 403: shows toast with link to packages page
- 409: redirects to existing in-progress interview
- Loading spinner (Loader2) during submission
- Added `cursor-pointer` to all clickable elements

#### 2. C3 Interview Room (`src/app/[locale]/app/interview/[id]/page.tsx`)
- Full rewrite from mock data to real API integration
- **On mount**: `GET /api/interviews/[id]` to load existing messages
- **Auto-start**: If PENDING, POSTs to `/api/interviews/[id]/messages` with `content: 'start'`
- **Resume**: If IN_PROGRESS, calls `POST /api/interviews/[id]/resume` to get question count
- **Real messages**: Messages displayed from DB, mapped from API format
- **Send**: POSTs to `/api/interviews/[id]/messages` with input text, shows typing indicator, appends AI response
- **Progress bar**: Uses `questionNumber / totalQuestions` from API response
- **Timer**: Kept existing 1-second interval timer
- **TTS (Speaker button)**: Per-message POST to `/api/tts` with `{ text, voice }`, creates Audio object, plays. 503 handled silently.
- **Mute button**: Toggles `isMuted` flag, disables TTS playback globally. Shows Volume2/VolumeX icon.
- **ASR (Mic button)**: MediaRecorder API with `getUserMedia({ audio: true })`. Records webm, sends FormData to `/api/interviews/[id]/transcribe`. Fills input with result. Red pulsing animation while recording.
- **Completion overlay**: When `done: true`, shows progress bar animation, then "View Report" button redirects to report page
- **Interviewer avatar**: Uses `interviewerGender` from interview data (MALE→fahd, FEMALE→noora)
- **Leave page protection**: `beforeunload` event + `popstate` with `window.confirm` dialog when IN_PROGRESS
- **Loading state**: SkeletonBlock while fetching interview data
- **Error handling**: Toast notifications for all API errors, locale-aware error messages

#### 3. C4 Report Page (`src/app/[locale]/app/interview/[id]/report/page.tsx`)
- Full rewrite from mock scores to `GET /api/interviews/[id]/report`
- Real scores: overallScore, contentScore, clarityScore, confidenceScore, culturalFitScore
- Dynamic score circle color: emerald (≥80), amber (≥60), red (<60)
- Real feedback: Split by `\n` into paragraphs
- Real strengths[] and improvements[] arrays rendered dynamically
- Recommendation badge: RECOMMENDED=emerald, CONSIDER=amber, NOT_RECOMMENDED=red with appropriate icons
- QrCard with real `verificationId` from API
- Certificate button: POSTs to `/api/interviews/[id]/certificate`, shows success toast + "coming soon" for PDF
- Loading state with SkeletonBlock
- Error state with retry button
- Handles 400 (report not ready) with toast

#### 4. Verify Page (`src/app/[locale]/verify/[id]/page.tsx`)
- Replaced mock ID checks with `GET /api/verify/[inputValue]` API call
- Valid: Green card with name, score, issuedAt, expiresAt, industry, type from API
- Expired: Amber card with name
- Not found: Red card
- Error: Error card with retry
- Loading state with Loader2 spinner
- Pre-fill from URL param (existing behavior preserved)
- Locale-aware date formatting

#### 5. D1 Guest Interview Page (`src/app/[locale]/interview/guest/[token]/page.tsx`)
- On submit: POSTs to `/api/guest/[token]/messages` with `{ content: 'start', guestName, guestEmail }`
- On success: Shows confirmed state, then redirects to guest room
- Loading spinner during submission
- Error toast on failure

#### 6. NEW: Guest Interview Room (`src/app/[locale]/interview/guest/[token]/room/page.tsx`)
- New page created for guest interview experience
- Reuses interview room UI pattern but uses `/api/guest/[token]/messages` instead of `/api/interviews/[id]/messages`
- Same features: chat, TTS, ASR, timer, typing indicator, completion overlay
- No auth required (guest mode)

### Files created
- `src/app/[locale]/interview/guest/[token]/room/page.tsx` — Guest interview room page

### Files modified
- `src/app/[locale]/app/new-interview-form.tsx` — Wired to POST /api/interviews
- `src/app/[locale]/app/interview/[id]/page.tsx` — Full rewrite with real APIs
- `src/app/[locale]/app/interview/[id]/report/page.tsx` — Full rewrite with real API
- `src/app/[locale]/verify/[id]/page.tsx` — Wired to GET /api/verify/[id]
- `src/app/[locale]/interview/guest/[token]/page.tsx` — Wired to POST /api/guest/[token]/messages
- `src/messages/ar.json` — Added 16 keys to app.room, 8 keys to app.report, 2 keys to verify, 2 keys to guest
- `src/messages/en.json` — Same keys added in English

### Design decisions
- **Interview room is most important page**: Full-featured with TTS, ASR, real-time progress, leave protection
- **TTS 503 graceful handling**: On non-200 response from /api/tts, no error shown — text remains visible, audio just doesn't play
- **Typing indicator**: Added as a temporary message while waiting for AI response, replaced when response arrives
- **Guest room as separate page**: Created at `/interview/guest/[token]/room` since guest API uses tokens not interview IDs
- **No router import in report page**: Removed unused useRouter import
- **Mute button in bottom bar**: Global mute toggle for all TTS playback, with visual feedback (Volume2/VolumeX icons)
- **Mic recording visual**: Red pulsing button while recording, separate transcribing state for input placeholder
- **Completion overlay progress**: Linear 30ms-per-step progress bar, then shows "View Report" button
- All strings from i18n. No hardcoded text. Dark glass-morphism design preserved throughout.

### Lint status
- `bun run lint` passes with 0 errors, 0 warnings
- Dev server compiles cleanly with no errors

---
Task ID: C-backend
Agent: main
Task: Phase C — AI Interview Engine + API Routes + TTS/ASR

Work Log:
- Created `src/lib/ai.ts` — Full AI engine: LLM singleton (z-ai-web-dev-sdk), interview system prompt builder (AR/EN, BEHAVIORAL/TECHNICAL), question bank integration, adaptive follow-up, 7-question lifecycle, evaluation with STRICT JSON parsing + heuristic fallback, TTS with in-memory cache (100 entries, 30min TTL), ASR, rate limiter (20 msg/hr/interview)
- Created 9 API routes:
  - `POST/GET /api/interviews` — Create interview (auth, session check, 409 duplicate), list interviews with filters
  - `GET /api/interviews/[id]` — Get interview detail with messages
  - `POST /api/interviews/[id]/messages` — Core interview engine (auto-start, adaptive AI, completion + background evaluation)
  - `POST /api/interviews/[id]/resume` — Resume in-progress interview
  - `POST /api/tts` — Text-to-speech with hash-based caching, 503 fallback
  - `POST /api/interviews/[id]/transcribe` — Speech-to-text via multipart upload
  - `POST /api/interviews/[id]/certificate` — Generate verification ID
  - `GET /api/interviews/[id]/report` — Get report data
  - `GET /api/verify/[id]` — Public certificate verification
  - `POST /api/guest/[token]/messages` — Guest interview flow (no auth)
- Added NEXTAUTH_SECRET + NEXTAUTH_URL to .env
- Fixed Prisma create call: `userId` → `user: { connect: { id: userId } }` (Turbopack compatibility)

Stage Summary:
- AI engine: Arabic system prompts for فهد/نورة, 7-question lifecycle, STAR/TECHNICAL modes
- Evaluation: STRICT JSON parsing with 2 retries + heuristic fallback (never hangs)
- Session debit: Atomic transaction, sessionDebited flag prevents double-debit
- TTS: z-ai-web-dev-sdk with 'kazi' (fahd) and 'chuichui' (noora) voices, 1024 char limit, cache
- ASR: z-ai-web-dev-sdk, base64 conversion, multipart upload
- Certificate: MQBL-XXXX-XXXX-XXXX format, 2-year expiry
- 28 new i18n keys added to both ar.json and en.json
- ESLint: 0 errors
- All API routes follow spec: zod validation, bilingual errors, RBAC, idempotent operations

---
Task ID: 9
Agent: Main
Task: Fix demo/preview page — create guest interview API + wire demo page

Work Log:
- Investigated: demo page button only showed toast, no API call or redirect
- Found /api/guest/interview endpoint was missing entirely
- Added interviewerGender field to Prisma schema (was in DB/Prisma client but missing from schema file)
- Ran db:push to sync schema
- Created /api/guest/interview POST route that creates Interview with guestToken, returns token + interviewId
- Rewrote demo page to call API on button click, show loading state, then router.push to /interview/guest/[token]/room
- Updated demo translations in en.json and ar.json (interview-focused copy + starting key)

Stage Summary:
- Demo page now works end-to-end: click → API creates guest interview → redirect to interview room
- Verified with agent-browser: both /en/demo and /ar/demo render correctly, button creates interview and redirects to chat room
- Interview room renders with text input, mic button, send button, mute control


---
Task ID: 10
Agent: Main
Task: Fix 4 reported issues: fake stats, missing back buttons, logo size, Arabic switch

Work Log:
- Replaced CountUpStat with SimpleStat component showing generic text (no fake numbers)
- Updated en.json stats: "Thousands of Practice Sessions", "Growing Community of Professionals", etc.
- Updated ar.json stats: "آلاف جلسات التدريب", "مجتمع متنامٍ من المهنيين", etc.
- Added showBack prop to AuthShell with RTL-aware arrow (ArrowLeft/ArrowRight)
- Enabled showBack on register, signin, forgot-password pages
- Added back button to demo page with RTL-aware arrow
- Increased logo from h-10 to h-14 (bigger without expanding header)
- Fixed language switch: replaced router.push with window.location.href + getLocaleSwitchPath helper
- Added localeDetection: false to middleware to stop automatic English redirect
- Created /src/i18n/navigation.ts helper for locale path computation
- Verified with curl: GET / returns 200 (Arabic), GET /ar redirects to /, GET /en returns 200 (English)

Stage Summary:
- Stats: no more fake numbers, generic text labels
- Back buttons: all auth pages + demo page have RTL-aware back navigation
- Logo: h-14 (56px) instead of h-10 (40px)
- Arabic switch: localeDetection disabled, switchLocale uses window.location.href


---
Task ID: fix-gold-bar
Agent: Main
Task: Remove gold bar divider and clipPath from BeforeAfterSection

Work Log:
- Analyzed user screenshot with VLM - identified vertical gold bar between Before/After cards
- Found root cause: BeforeAfterSection had a draggable slider with `motion.div` containing `bg-gold` bar and `clipPath` on both cards
- Removed `clipPath` from both Before and After cards
- Removed the draggable `motion.div` gold bar divider entirely
- Removed unused `PanInfo` import and `useCallback` import
- Removed unused `motion` import from framer-motion
- Replaced with clean 3-column grid: Before card → Arrow divider → After card
- Both cards now display full content without clipping
- Arrow flips direction for RTL (Arabic)
- Ran lint - passes cleanly
- Verified page compiles: GET /en 200

Stage Summary:
- Gold bar covering text is eliminated
- Before/After cards now display cleanly side-by-side
- Removed framer-motion dependency from landing page (unused)
- File modified: src/app/[locale]/page.tsx

---
Task ID: hero-storyboard
Agent: Main
Task: Build cinematic hero storyboard slider

Work Log:
- Searched 3 real human photos via image-search (stressed, practicing, celebrating)
- Verified images with VLM (8/10, 7/10, 8/10)
- Added 7 storyboard translations to en.json and ar.json
- Added 7 cinematic CSS animations to globals.css
- Built HeroStoryboard component with AnimatePresence, Stories progress, Ken Burns, score reveal, swipe, RTL
- Replaced old preview card in HeroSection
- Lint clean, page compiles 200
- Browser verified EN: photos, progress bar, quotes, glow, score all working

Stage Summary:
- Created: src/components/brand/hero-storyboard.tsx
- Modified: en.json, ar.json, globals.css, brand/index.ts, page.tsx

---
Task ID: brief-review
Agent: Main
Task: Review builder brief, prepare .env.example, verify project health

Work Log:
- Read uploaded Muqabaleh_Strict_Builder_Brief.pdf (6 pages)
- Identified all required environment variables from Section 4
- Created .env.example with all variables: DATABASE_URL, NEXTAUTH_*, OPENAI_API_KEY, ELEVENLABS_*, PAYPAL_*, RESEND_API_KEY, NEXT_PUBLIC_POSTHOG_KEY, NEXT_PUBLIC_GA4_ID
- Ran ESLint — 0 errors, 0 warnings
- Restarted dev server — compiles and serves 200
- Hero section left untouched per founder instruction

Stage Summary:
- .env.example created at project root with all brief-specified variables
- Lint passes clean
- Dev server running, pages compile to 200
- Hero section (full-screen cinematic storyboard) preserved as-is
- No code changes made to any existing component or page


---
Task ID: arabic-fix
Agent: Main
Task: Fix Arabic language switch and improve translation quality

Work Log:
- Audited ar.json vs en.json: all 1569 keys present in both files
- Found and fixed localeDetection bug: `localeDetection: false` was in middleware options instead of routing config (next-intl v4 requires it in defineRouting)
- Fixed getLocaleSwitchPath: removed trailing slash on English switch, preserved hash/search params
- Fixed 30+ instances of Western numerals (0-9) in Arabic text replaced with Arabic-Indic numerals (٠-٩)
- Fixed JSON syntax error (missing comma after inv5Amount)
- Verified: / serves Arabic (200), /en serves English (200), /ar redirects to / (307)
- Verified: Agent Browser shows Arabic nav (لماذا مقابلة؟, كيف يعمل؟, ابدأ مجاناً) at root

Stage Summary:
- Root cause of Arabic switch not working: localeDetection was being ignored because it was in the wrong config location
- Arabic content was already built (1569 keys, comprehensive translations)
- All visible Arabic numerals now use Arabic-Indic numeral system
- Hero section left untouched per founder instruction

---
Task ID: 1
Agent: Main Agent
Task: Fix preview — remove Z.ai placeholder, fix Arabic/English language switching

Work Log:
- Investigated project structure: found `src/app/page.tsx` contained a Z.ai logo placeholder that was overriding the `[locale]/page.tsx` landing page
- Root cause: `src/app/page.tsx` was matching `/` before the next-intl middleware could rewrite it to the `[locale]` route
- Deleted `src/app/page.tsx` (the Z.ai placeholder) so the middleware correctly routes `/` → `[locale]/page.tsx` with `locale=ar`
- Fixed `package.json` dev script: removed `| tee dev.log` pipe that was causing silent failures in background/nohup mode
- Verified via curl that both `/` (Arabic, `lang="ar" dir="rtl"`) and `/en` (English, `lang="en" dir="ltr"`) render correctly
- Confirmed all Arabic translations are present in `src/messages/ar.json` (0 missing keys vs en.json)
- Confirmed all English translations are present in `src/messages/en.json` (0 missing keys vs ar.json)
- Language switch verified: `getLocaleSwitchPath()` correctly generates `/en` from `/` and `/` from `/en`
- Ran `bun run lint` — passes clean
- Agent-browser verification not possible due to 4GB container OOM: Chrome (~1.3GB) + Turbopack (~800MB) exceeds available memory

Stage Summary:
- Removed `src/app/page.tsx` (Z.ai placeholder) — this was the root cause of the broken preview
- Fixed `package.json` dev script pipe issue
- Both Arabic and English locales verified working via curl with full content and correct RTL/LTR
- All translation keys are complete and in sync between ar.json and en.json

---
Task ID: 2
Agent: Main Agent
Task: Build PayPal subscription integration (no Stripe)

Work Log:
- Audited existing payment system: Prisma/SQLite + NextAuth, session-based model with `sessionsLeft`
- Added `PaypalSubscription` model to Prisma schema (id, userId, paypalSubscriptionId, paypalPlanId, status, startTime, nextBillingTime, payerEmail)
- Added `subscriptionTier` (FREE|PREMIUM) and `subscriptionExpiresAt` fields to User model
- Ran `db:push` to sync schema
- Installed `@paypal/paypal-js` (v10.1.0)
- Created `src/lib/paypal.ts` — shared helpers: getPayPalAccessToken, getPayPalSubscription, deactivateSubscription, verifyWebhookSignature
- Created `src/app/api/paypal/create-subscription/route.ts` — creates PayPal billing subscription, returns approve link
- Created `src/app/api/paypal/activate/route.ts` — verifies subscription is ACTIVE, upserts DB record, upgrades user to PREMIUM
- Created `src/app/api/paypal/webhook/route.ts` — handles CANCELLED/SUSPENDED/EXPIRED/ACTIVATED/SALE.COMPLETED events
- Created `src/app/api/paypal/cancel/route.ts` — server-side subscription cancellation via PayPal API
- Updated `src/app/api/interviews/route.ts` — paywall checks `subscriptionTier === 'PREMIUM'` before enforcing session limit
- Created `src/components/PayPalSubscriptionButton.tsx` — full PayPal button with loading/error/activating/premium states, RTL gold theme
- Created `src/app/[locale]/payment/success/page.tsx` — subscription success page
- Created `src/app/[locale]/payment/cancel/page.tsx` — subscription cancelled page
- Rewrote `src/app/[locale]/app/packages/page.tsx` — premium CTA card with PayPal button on top, session balance, one-time packs (disabled, coming soon)
- Added 20 PayPal translation keys to both ar.json and en.json
- Added 5 premium landing keys to both ar.json and en.json
- Added 7 packages page keys to both ar.json and en.json
- Updated `.env.example` with NEXT_PUBLIC_PAYPAL_CLIENT_ID, PAYPAL_PLAN_ID, PAYPAL_MODE
- Updated NextAuth session/JWT/User types with `subscriptionTier`
- ESLint passes clean

Stage Summary:
- PayPal subscription fully integrated: schema, API routes, UI component, webhook, paywall
- NO Stripe anywhere in the codebase
- All translations added for ar/en
- Packages page now shows premium subscription as primary, one-time packs as secondary (coming soon)
