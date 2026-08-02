# 🔍 Full Website Report — مقابلة | Muqabaleh

**URL audited:** https://muqabaleh-com.vercel.app/ (Arabic + English)
**Date:** 1 August 2026
**Stack:** Next.js (Vercel), RTL Arabic (`lang="ar" dir="rtl"`), SSR with locale support (`/en`)
**Performance:** Excellent — TTFB 80–150 ms, HTTP/2, SSL + HSTS enabled

---

## 1. What the site is

An Arabic-first AI interview-training platform ("Muqabaleh" = interview). Users practice job interviews with two AI interviewers (Fahd / Noora), get scored on 4–6 criteria, and receive a QR-verified certificate. There's also a B2B product (مقابلة للأعمال) for companies to screen candidates, and a "join as interviewer" funnel for human experts.

**Pages that exist and work:**
| Route | Status | Route | Status |
|---|---|---|---|
| `/` (AR home) | ✅ 200 | `/en` (EN home) | ✅ 200 |
| `/pricing` (+ `/en/pricing`) | ✅ 200 | `/business` (+ `/en/business`) | ✅ 200 |
| `/demo` (interactive demo) | ✅ 200 | `/join-as-interviewer` (+ EN) | ✅ 200 |
| `/interviewers` (+ EN) | ✅ 200 | `/auth/register`, `/auth/signin` (+ EN) | ✅ 200 |
| `/support`, `/privacy`, `/terms`, `/refund` (+ EN) | ✅ 200 | `/verify/MQBL-DEMO-2026` | ✅ 200 |
| **`/about` (AR + EN)** | ❌ **404 — broken** | **`/verify` (bare, no ID)** | ❌ 404 (ok) |
| **`/admin`** | ⚠️ **200 — publicly accessible** | `robots.txt` | ✅ present |

---

## 2. What's working well ✅

1. **Strong concept & copy** — the value proposition is clear in one sentence: "AI interviewer that scores you on 4 criteria and gives a QR-verifiable report." The Arabic copy is professional and natural.
2. **Trust architecture** — the page builds credibility well: country flags (8 Arab countries), PayPal + SSL badges, refund policy, sample verified report, before/after score (62→88, 91/100), testimonials with named companies (Riyad Bank, NEOM).
3. **RTL quality** — `dir="rtl"` set correctly; the layout reads naturally right-to-left; Arabic-Indic numerals used consistently (٩١, $١٩).
4. **Complete bilingual coverage** — every page has a working `/en` equivalent and correct `hreflang` alternates.
5. **Speed** — sub-200ms TTFB, clean headers, proper caching on Vercel. Nothing to fix here.
6. **Business/product depth** — the B2B page, human-interviewer funnel, and demo page show real product thinking beyond a one-page landing.

---

## 3. 🔴 Critical issues (fix first)

### 3.1 The admin dashboard is publicly accessible
`https://muqabaleh-com.vercel.app/admin` loads **without any login** and renders a full admin panel: **1,247 users, 3,891 interviews, $24,560 revenue, recent payment events, user names, interviewer applications, question bank, settings** — in the server-rendered HTML.

- If this is **real data**: this is an active data leak — anyone who finds the URL sees users, revenue and payment activity. Lock it behind authentication **immediately**.
- If it's **demo data**: it's still a problem — it looks live and undermines trust; it should require auth or be clearly marked as a sandbox.

**Action:** Put a hard auth guard on `/admin` (server-side, not just client-side) — or remove it from the public build.

### 3.2 The real domain (muqabaleh.com) is not live
Every verified-report link and certificate URL on the site says **`muqabaleh.com/verify/MQBL-…`**, but `muqabaleh.com` (and `www.muqabaleh.com`) **does not resolve on public DNS** — verified from an independent network. Right now:
- Anyone who clicks a verification link goes nowhere.
- The QR codes on certificates will scan to a dead domain.
- Brand trust hinges on this URL working.

**Action:** Point `muqabaleh.com` DNS at this Vercel deployment (or deploy the real site to the domain) **before** going to market. The `verify` route already works on the preview — it just needs the domain.

### 3.3 Footer links to a broken page: `/about`
The footer's "الشركة → من نحن / About" links to `/about`, which returns **404 in both Arabic and English**. Broken footer links read as "abandoned site" to visitors and hurt crawling.

**Action:** Create the page or remove/repurpose the link.

---

## 4. 🟠 Important issues (fix soon)

### 4.1 No social sharing tags (Open Graph / Twitter)
When your site is shared on **WhatsApp, Facebook, LinkedIn, Twitter**, there are no `og:` or `twitter:` meta tags — no preview image, no title, no description. In the Gulf market, most traffic comes through WhatsApp shares, so every share currently shows a bare, unclickable-looking link card.

**Action:** Add `og:title`, `og:description`, `og:image` (1200×630), `og:url`, `og:type=website`, `og:locale`, and the Twitter equivalents to every page. This is a 15-minute fix with a huge social payoff — and it's how you connect this site to your Facebook page.

### 4.2 No sitemap.xml, no favicon, no JSON-LD structured data
- **`sitemap.xml` → 404.** Google can't discover all your pages efficiently. Add one (Next.js app-router sitemap or `/sitemap.xml` with all AR+EN routes + `hreflang`).
- **No favicon** (favicon.ico/svg → 404). The browser tab shows a default globe icon.
- **No structured data.** No `Organization`, `Product`/`Offer`, `FAQPage`, or `Review` schema — you're missing free rich results (FAQ accordions in Google, star ratings, product pricing display) for a site that has *perfect* content for them (FAQ section, pricing, testimonials).

### 4.3 Image bloat — the logos are enormous
| Asset | Size |
|---|---|
| `logos/v2-balanced-a-T.png` | **871 KB** |
| `logos/concept-m1-glasscapsule-T.png` | **516 KB** |
| `noora.png` / `fahd.png` | 164 / 134 KB |
| `story-before.png` | 87 KB |

One logo alone is ~1MB as PNG. Convert all to **WebP/AVIF** (expect 70–80% savings) and re-export the logo at a sane resolution. Total page weight could drop from ~1.8MB to under 400KB — meaningful for users on mobile data in the region.

### 4.4 No social links / contact channel in the footer
The footer has columns (المنتج، الشركة، الدعم، قانوني) but **no social media icons, no email, no WhatsApp**. The "Share on LinkedIn" button is literally disabled ("معطل") everywhere. For a paid consumer service you need:
- Social links (Facebook, Instagram, LinkedIn, WhatsApp) in the footer — this is where your FB page plugs in.
- A visible contact email/WhatsApp number.
- Working LinkedIn share on the report page (it's a major viral loop for interview prep).

### 4.5 Pricing CTA doesn't distinguish plans
All four "اختر الخطة / Choose Plan" buttons point to the same generic `/auth/register`. A user who clicked "3 sessions" lands on a plain signup form with no plan selected. **Action:** pass the plan (`?plan=3-sessions`) and pre-fill it in the checkout flow.

---

## 5. 🟡 Minor / polish

1. **Demo PDF & LinkedIn share disabled** — labeled "معطل (sample)". Make sure the real reports have working PDF export + LinkedIn share before launch.
2. **EN page keeps Arabic names** — interviewers show as "فهد / نورة" on the English site. Intentional, but if English users can't pronounce them, consider "Fahd / Noora" (transliterated) on the EN locale.
3. **Empty alt attribute** — `story-before.png` has `alt=""`. Give it a meaningful description (accessibility + SEO).
4. **"ابدأ مجاناً" (Start Free) is a paid funnel** — the bottom CTA says "Start Free" but leads to a signup for paid plans. Consider routing it to `/demo` (which genuinely is free, no signup) to avoid a trust break at the highest-intent moment.
5. **No FAQ answers in the static HTML** — the FAQ questions render but answers are hidden behind JS accordions. If a bot doesn't execute JS, Google sees questions with no answers. Add the answers server-side for SEO.
6. **No blog / resources section** — long-term, this is your SEO engine ("what does B2 mean?", "how to answer behavioral questions"). Worth planning post-launch.
7. **No canonical tags** detected — add self-referencing canonicals for clean indexing.
8. **No `theme-color`** meta — minor, sets the mobile browser bar color.

---

## 6. Performance snapshot

| Metric | Result | Verdict |
|---|---|---|
| TTFB | 80–150 ms | 🟢 Excellent |
| HTTP protocol | HTTP/2 + HSTS | 🟢 Excellent |
| Homepage HTML | ~185 KB (SSR inline) | 🟡 Acceptable |
| Total image weight | ~1.8 MB | 🔴 Needs WebP conversion |
| Caching | `public, max-age=0, must-revalidate` | 🟢 Fine for SSR |

---

## 7. Priority action plan

**This week (P0):**
1. 🔒 Lock down `/admin` behind real authentication.
2. 🌐 Get `muqabaleh.com` live (DNS → this deployment) — verification links depend on it.
3. 🔧 Fix or remove the `/about` footer link.

**This month (P1):**
4. Add Open Graph + Twitter cards to all pages (WhatsApp/FB/LinkedIn previews).
5. Compress logos/images to WebP — cut page weight ~70%.
6. Add `sitemap.xml` + favicon + JSON-LD (Organization/FAQPage/Offer schema).
7. Add social + contact links to the footer; enable LinkedIn share.

**Next quarter (P2):**
8. Plan-aware checkout (pass selected plan to register).
9. FAQ answers server-side + blog/resources section.
10. EN localization polish (interviewer names, mixed strings).

---

*Report generated from live HTTP checks of all routes, meta/SEO analysis, image weight measurements, and DNS verification. Facebook/WhatsApp share-preview behavior inferred from missing Open Graph tags.*
