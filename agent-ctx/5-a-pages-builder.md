# Task 5-a: Phase A Pages Builder

**Date**: 2025-07-30
**Task ID**: 5-a
**Agent**: Phase A Pages Builder

### What was done

Built all 9 pages specified in the task for Phase A of Muqabaleh.

### Files created

| # | Page | File | `use client` | Notes |
|---|------|------|-------------|-------|
| 1 | Business (A2) | `src/app/[locale]/business/page.tsx` | Yes | 6 sections: hero, stats, how it works, features (6 GlowCards), pricing (3 cards + human service), final CTA |
| 2 | Pricing (A6) | `src/app/[locale]/pricing/page.tsx` | Yes | 4 pricing cards + feature comparison table with Check/X icons |
| 3 | Verify (A7) | `src/app/[locale]/verify/[id]/page.tsx` | Yes | Pre-fill from URL param, mock verification: MQBL-DEMO-2026 (valid), MQBL-EXPIRED-2024 (expired), else not found |
| 4 | Privacy Policy (A8) | `src/app/[locale]/privacy/page.tsx` | No | Server component with getTranslations, 15 real Arabic/English legal paragraphs |
| 5 | Terms & Conditions (A9) | `src/app/[locale]/terms/page.tsx` | No | Same structure, 15 real legal paragraphs |
| 6 | Refund Policy (A10) | `src/app/[locale]/refund/page.tsx` | No | Same structure, 12 real legal paragraphs |
| 7 | Support Center (H1) | `src/app/[locale]/support/page.tsx` | Yes | FAQ section (reuses 6 landing FAQ items) + contact form with sonner toast |
| 8 | Custom 404 | `src/app/[locale]/not-found.tsx` | Yes | Marketing-style 404 with gold-gradient heading, CTA button |
| 9 | Global 404 | `src/app/not-found.tsx` | No | Simple centered 404 with home link |

### Files modified

| File | Changes |
|------|---------|
| `src/messages/ar.json` | Added: business (heroCta2, starterF1-F3, businessF1-F6, enterpriseF1-F6, chooseStarter/Business/Enterprise), pricing (colSession/3/5/Vip, rowSessionCount/Criteria/Certificate/HumanReview/Pdf/Linkedin, val1/3/5/1Vip/4/6), verify (demoName/Score/Date), legal (privacyP1-P15, termsP1-P15, refundP1-P12) |
| `src/messages/en.json` | Same keys added in English |

### Design decisions

- **Business page**: Reuses the same how-it-works gold vertical line pattern from the landing page. Features use 6 Lucide icons (Users, ListChecks, FileDown, LayoutDashboard, UserCheck, Lock). Pricing has 3 plans with `style={{ transform: 'none' }}` on GlowCard to prevent hover lift on input card.
- **Pricing page**: Reuses the exact same 4-card layout from the landing page pricing section. Added feature comparison table below with a scrollable overflow-x-auto table. Uses Check/X icons from Lucide for cell values.
- **Verify page**: Uses `useEffect` to pre-fill input from URL params (async params). Three mock states: valid (MQBL-DEMO-2026 with VerifiedBadge + info rows), expired (amber icon), not found (red icon).
- **Legal pages**: Server components using `getTranslations` for SEO/performance. Privacy, Terms, and Refund each have real Arabic legal-sounding content (not lorem ipsum).
- **Support page**: Reuses landing FAQ items via `tLanding('faqQ{n}')` and `tLanding('faqA{n}')`. Contact form uses sonner `toast.success()`.
- **404 pages**: Custom 404 uses `useTranslations('errors')` for on-brand messaging. Global 404 is a minimal server component.
- All pages follow the same layout pattern: `min-h-screen flex flex-col`, `Navbar`, `main flex-1 pt-16`, `Footer mt-auto`.
- All strings from i18n namespaces. No hardcoded text. No emojis.
- Lucide icons use `strokeWidth={1.75}`.

### Lint status
- `bun run lint` passes with 0 errors
