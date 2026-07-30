# MUQABALEH (مقابلة) — COMPLETE NEW-BUILD SPECIFICATION
**Build the entire product from scratch. All pages in advance. Nothing bolted on later.**
Attach: `muqabaleh-backup.zip` (approved logo kit in `logos/`, brand voice WAVs + avatars in `assets/`).

---

# PART 0 — MISSION & NON-NEGOTIABLE RULES

You are building **مقابلة | Muqabaleh**: an Arabic-first, AI-powered interview-practice + B2B screening platform with a human-interviewer marketplace. Failure of any rule = failed build.

1. **Build the FULL sitemap (Part 2) with REAL, finished UI before wiring any backend.** Every page, every state (loading skeleton, empty state, error state), desktop + mobile, ar + en. No "TODO", no placeholder boxes, no lorem ipsum. Real Arabic copy.
2. **Design system (Part 1) is law.** No other colors. No default-bootstrap look. If a component isn't specified, derive it from the system, don't invent new palettes. Anything that looks "template boring" = rejected.
3. **Bilingual is architectural, not a feature:** every string through one `L(ar, en)` i18n store; full RTL for ar, LTR for en; layout must never break in either direction.
4. **Evidence culture:** each phase ends with the listed verification artifacts (screenshots, curl outputs, test logs) + exact files-changed list. Claims without evidence are rejected.
5. **No page may be deleted/replaced once approved.** Changes are additive or explicitly specced.
6. **Security from line one:** hashed passwords (bcrypt/argon2), httpOnly cookies, RBAC middleware, input validation (zod), rate limits on auth/AI/payment endpoints, no secrets client-side, idempotent payments.
7. **Stack (fixed):** Next.js App Router + TypeScript + Tailwind CSS + next-auth (credentials; Google OAuth optional behind env flag) + Prisma + PostgreSQL. Production build, NOT dev mode.

**Assets to reuse (in attached zip):** `logos/v2-balanced-a-T.png` (PRIMARY horizontal lockup: مقابلة white · glass gold mic · MUQABALEH gold), `logos/concept-m1-glasscapsule-T.png` (vertical mic mark for hero/favicon/loaders/OG), `assets/fahd-sample.wav`, `assets/noora-sample.wav`, `assets/fahd.png`, `assets/noora.png`. Do NOT regenerate the logo with AI. Copy into `/public/images` + `/public/audio`.

---

# PART 1 — DESIGN SYSTEM ("AMAZING, NOT BORING")

Inspiration: testcefr.com-level polish — deep-space dark, luminous accents, glassmorphism, alive micro-interactions — fused with Muqabaleh's luxury gold identity and the approved glass-mic logo.

**Tokens (tailwind config — exact):**
```
bg.void        #070A0F   (page base — near-black, blue-black)
bg.panel       #0B0F17   (raised surface)
bg.card        rgba(255,255,255,0.04) + 1px rgba(255,255,255,0.08) border + backdrop-blur(12px)
accent.gold    #D4A843   primary CTA/highlight   hover #E8C15F   (from logo)
accent.goldDim #B8860B
accent.emerald #10B981   success / verified / live
accent.cyan    #22D3EE   AI/scanning/active accents ONLY (sparingly, never large fills)
text.primary   #F8FAFC   text.muted #94A3B8   text.faint #64748B
status.red     #EF4444   status.amber #F59E0B
ring glow      0 0 24px rgba(212,168,67,0.25) on primary buttons / active cards
```

**Typography:** Arabic: Cairo (display) + Tajawal (body). English: Space Grotesk (display) + Inter (body). Scale display 48/40/32, h-sm 24, body 16/14, caps-eyebrow 12 ls-0.2em gold.

**Signature visual language (use everywhere, subtly):**
- Glass cards (`bg.card`) with hover lift (-4px) + gold glow ring; rounded-2xl.
- Hero aurora: slow animated radial gradients (gold→transparent top-right, emerald→transparent bottom-left) behind content, blurred 80px, `prefers-reduced-motion` disables.
- Gold particle specks (CSS/canvas, <40 particles) drifting in hero + loading screens — echoes the logo.
- Numbers count-up on stats; section reveal on scroll (fade+translateY 16px, once).
- "Live/Analyzing" pattern: pulsing emerald dot + animated progress bar + typing dots (core brand motion — used in hero preview, interview room, report generation).
- Gradient text: gold gradient (#E8C15F→#D4A843→#B8860B) on ONE key phrase per hero/section heading max.
- Icons: Lucide only, stroke width 1.75, 20px default. No emojis in UI.
- Buttons: primary = solid gold, dark text, pill, glow hover; ghost = 1px white/15, white text; destructive = red outline.
- Inputs: dark glass, 1px white/10, focus ring gold/40, label above, Arabic-aligned right.

**Signature components (build once in `components/brand/`, reuse on every page):**
`<GlowCard>`, `<SectionHeading eyebrow title sub>`, `<ScoreBar label value max goldTicks>`, `<LiveBadge>` (emerald pulse), `<CountUpStat>`, `<VerifiedBadge>` (cyan check-shield), `<PriceTag usd localApprox>`, `<AuthShell>`, `<EmptyState icon title sub cta>`, `<SkeletonBlock>`, `<CopyLinkButton>`, `<QrCard>` (wraps QR image + verification ID), `<InterviewAvatar who>`.

---

# PART 2 — FULL SITEMAP (build ALL pages now; mock data allowed in UI until backend phase)

Locale structure: `/[locale]/...` with `ar` default (URL may be `/` for ar). Every page gets `loading.tsx`, `not-found` handling, metadata (title/desc per locale), mobile+desktop.

## A. PUBLIC — MARKETING
**A1 `/` Landing (ar default)** — sections in order:
1. Sticky glass navbar (logo lockup L, links: لماذا مقابلة؟ · كيف يعمل؟ · المحاورون · الأسعار · للأعمال · الأسئلة الشائعة · EN/AR toggle · "تسجيل الدخول" ghost · "ابدأ مجاناً" gold). Blur on scroll.
2. Hero: eyebrow "منصة المقابلات العربية الأولى بالذكاء الاصطناعي" (gold, pulsing dot) · H1 "تدرّب على المقابلات الوظيفية" with gold-gradient on "المقابلات" · sub · CTAs (gold "ابدأ مقابلة تجريبية", ghost "كيف يعمل؟") · trust chips (PayPal آمن · تقرير موثّق بـ QR · ٨ دول عربية). RIGHT: **live animated interview preview card** (glass): فهد avatar, typing "يحلل الإجابة… 78%" progress, 4 mini ScoreBars animating (المحتوى 94 · الوضوح 90 · الثقة 87 · الملاءمة الثقافية 92), then check "اكتمل التحليل — التقرير جاهز" loops every ~9s.
3. Logo/country marquee: GCC flags+names strip (السعودية…عُمان), infinite scroll, muted.
4. Stats band (CountUp): +١٠,٠٠٠ مقابلة · +٥,٠٠٠ مستخدم · ٤.٩/٥ · +٣٤٪ تحسّن بمتوسط ٣ جلسات.
5. لماذا مقابلة؟ — 5 GlowCards (icons): محاور ذكي / تقييم بأربعة معايير / أصوات عربية طبيعية / تقرير موثّق بـ QR / خصوصية وتشفير.
6. كيف يعمل؟ — 4 steps timeline with connecting gradient line; step 2 shows فهد ونورة avatar pickers (real `/images`).
7. **"اصطف Before/After" drag slider** (testcefr pattern): left card "قبل: أرتبك في المقابلات" (خاملة، علامات استفهام) ⇄ right card "بعد: تقييم 91/100 موثّق" (mini report + VerifiedBadge) — draggable divider, gold handle.
8. تجربة المقابلة — نورة chat mockup (marketing-manager Q&A bubbles) + floating "اكتب إجابتك…" input (decorative).
9. المحاورون — هنا يعيش التميّز: تبويبان: "محاور ذكي" (فهد/نورة cards + أزرار عينات صوتية تشغّل `/audio/*.wav` + waveform تزييني) | "محاور بشري معتمد" (٣ بطاقات seed لمقابلين بشريين: صورة رمزية، مسمّى، قطاع، تقييم ٤.٨–٤.٩، "من $٤٩"، زر → `/interviewers`).
10. الأسعار — exact 4 cards: **١ جلسة $19 · ٣ جلسات $49 (الأكثر طلباً، مميزة بإطار ذهبي) · ٥ جلسات $69 · جلسة VIP $29 (٦ معايير + مراجعة بشرية)**. كل بطاقة: سعر بالدولار + سطر "≈ ٧١ ر.س · ٧٠ د.إ · ٩١٢ ج.م · ١٣ د.أ (الدفع بالدولار)" (نقدّر SAR/AED/EGP/JOD)، قائمة المزايا، زر شراء → auth أو checkout. إشارات ثقة أسفل: SSL · حماية مشتري PayPal · استرداد خلال ٢٤ ساعة للجلسة غير المكتملة.
11. نموذج التقرير الموثّق — معاينة تقرير/شهادة كاملة على غرار شهادة testcefr: سارة المنصوري · 91/100 · أشرطة المعايير الأربعة · ملاحظات AI · شارة "موثّق" ورد QR تجريبي + مُعرّف "MQBL-DEMO-2026" (مكتوب عليه "عينة")، أزرار "تحميل PDF (معطل: عينة)" و"مشاركة على LinkedIn (معطل)".
12. آراء المستخدمين — ٣ بطاقات (نفس النصوص الثلاثة الموجودة في الصفحة الأصلية).
13. FAQ — أكورديون ٦ أسئلة (القائمة الأصلية: كيف يعمل المحاور / هل أختار نوع المقابلة / المدة / الخصوصية / الدفع / الاسترداد) — اكتب إجابات كاملة واقعية.
14. CTA نهائي: "ابدأ رحلتك نحو الوظيفة المثالية" + زر ذهبي. Footer: ٤ أعمدة (المنتج / الشركة / الدعم / قانوني) بروابط حقيقية لكل صفحة هذا الملف + شارة "صُنع بحب للمهنيين العرب".

**A2 `/business`** — B2B landing (نفس نظام التصميم): hero "مقابلات بمعايير موحّدة لكل مرشحيك" · إحصاءات (٨٠٪ توفير وقت الفرز · ١٥ دقيقة/مقابلة) · كيف يعمل ٣ خطوات (أنشئ مقابلة · ادعُ المرشحين برابط · راجع النتائج) · ٦ ميزات · أسعار: **Starter $9.99/مقابلة · Business $4.99/مقابلة (الأكثر طلباً، حتى ١٠٠) · Enterprise مخصص (API + مدير حساب)** · إضافة بطاقة خدمة: "مقابلون بشريون خبراء (+$39/مرشح)" → `/business#human` + قسم يشرحها (تخصيص تلقائي AUTO أو فريق مخصص PANEL · SLA ٧٢ ساعة · تقارير بمعايير شركتك) · CTA "جرّب لوحة التحكم التجريبية" → `/demo`.

**A3 `/interviewers`** — دليل المحاورين البشريين العام (لا يتطلب دخول): بحث + فلاتر (القطاع، اللغة/اللهجة، السعر، التقييم، الجنس) · شبكة بطاقات مقابلين seed (٦ على الأقل: أسماء عربية واقعية، صور رمزية مولّدة، مسمّيات مثل "مديرة موارد بشرية سابقة — الاتصالات") · كل بطاقة → `/interviewers/[slug]`.
**A4 `/interviewers/[slug]`** — ملف المحاور: سيرة عربية، اعتمادات، إحصاءات (جلسات، تقييم، نسبة توصية)، عيّنة آراء، **منتقي موعد** يعرض توفره بتوقيت الزائر، زر حجز → تسجيل دخول ثم `/book/[slug]?slot=…`.
**A5 `/join-as-interviewer`** — نموذج انضمام كامل (نبذة AR/EN، القطاعات، اللغات، سنوات خبرة، المسمّى الحالي، صورة، بيانات دفع، موافقة على تعهد سرية + شروط الجودة) + قسم "لماذا تنضم؟ (ادخل سوق المقابلات العربية · حدّد سعرك · جدول مرن)". الإرسال → حالة "قيد المراجعة".
**A6 `/pricing`** (يعيد التوجيه إلى قسم الأسعار مع تفاصيل موسعة + جدول مقارنة) · **A7 `/verify/[id]`** — صفحة تحقق عامة: تدخل مُعرّف → تعرض حالة الشهادة/التقرير (صالح/منتهي/غير موجود) + الاسم + الدرجة + التاريخ + شعار مقابلة — على غرار testcefr/verify · **A8 `/privacy` · A9 `/terms` · A10 `/refund`** — صفحات قانونية كاملة بالعربية والإنجليزية (محتوى حقيقي وليس نصوص تعبئة: خصوصية صوت/فيديو، عدم التسجيل افتراضياً، الاحتفاظ بالبيانات ١٢ شهراً، حذف عند الطلب، شروط الاسترداد: الجلسة غير المكتملة تعاد تلقائياً).
**A11 custom 404** (لطيفه، تسويق المقابلة) + **A12 500**.

## B. AUTH
**B1** مودال/صفحات الدخول والتسجيل (`/auth/signin`, `/auth/register`, تُفتح أيضًا كمودال من أي CTA مع `returnUrl`): تبويبان "أبحث عن وظيفة" | "نوظّف (شركة)". فرد: الاسم والبريد وكلمة السر وتأكيدها والدولة (اختياري). شركة: + اسم الشركة، الحجم، القطاع، الدولة. تحقق zod فوري، قوة كلمة السر، رسائل خطأ عربية إنسانية. بعد تسجيل الشركة → `/b2b/onboarding`. **B2** نسيت كلمة السر (رابط عبر البريد).

## C. USER APP (role USER)
قشرة موحّدة `/app/*`: شريط جانبي زجاجي (نظرة عامة · مقابلاتي · الباقات · الدفعات · تقاريري الموثّقة · الملف الشخصي) + ترويسة بها رصيد الجلسات (شارة ذهبية) وإشعارات.
**C1 `/app`** — نظرة عامة: ترحيب باسم المستخدم · بطاقات سلسلة الأيام/متوسط الدرجة/المكتملة/الجلسات المتبقية · بطاقة "ابدأ مقابلة جديدة" (النموذج الكامل: المجال INDUSTRIES · مستوى الخبرة · النوع سلوكية/تقنية · جنس المحاور فهد/نورة مع صورهما · التحذير "ستُخصم جلسة واحدة من رصيدك · المتبقي N") · آخر ٥ مقابلات بحالتها ودرجتها · خطوة مقترحة تالية (إن كانت ٠ جلسة → بطاقة شراء).
**C2 `/app/interviews`** — جدول/بطاقات كل المقابلات: فلاتر (الحالة · المجال · النوع) · الحالات (معلّق/جارية/مكتملة بشارات) · النقر على المكتملة → التقرير C4 · على الجارية → استئناف C3.
**C3 `/app/interview/[id]`** — **غرفة المقابلة الحية** (أهم شاشة في المنتج): ترويسة (صورة المحاور واسمه، "متصل"، LiveBadge حمراء "مباشر"، مؤقّت الجلسة، تقدّم "سؤال N من 8") · منطقة دردشة مطابقة تماماً لمعاينة الهبوط (فقاعات زجاجية، مؤشر كتابة، تمرير تلقائي) · زر إعادة تشغيل الصوت + كتم لكل سؤال (TTS) · شريط إدخال: حقل نص + إرسال + ميكروفون (تسجيل → نص قابل للتحرير قبل الإرسال، حالة "جارٍ التفريغ…") · معالجة مغادرة الصفحة (تأكيد إن كانت الجلسة جارية) · عند الاكتمال: حالة أنيقة "اكتملت المقابلة — يجري توليد تقييمك…" بنمط Live/Analyzing ثم التحويل إلى C4.
**C4 `/app/interview/[id]/report`** — التقرير الكامل: الدرجة الكلية بدائرة تقدّم كبيرة · ٤ أشرطة معايير · شارة توصية (يُنصح به/يُنظر/لا يُنصح) · فقرات ملاحظات AI · نقاط القوة والتحسين · بطاقة الشهادة QR (المعرف الحقيقي + رابط `/verify/[id]`) · أزرار: تحميل PDF · مشاركة على LinkedIn · نسخ رابط التحقق · "إعادة التدريب".
**C5 `/app/packages`** — نفس البطاقات الأربع + سجل رصيد الجلسات · تكامل أزرار PayPal · رسائل نجاح/فشل.
**C6 `/app/payments`** — سجل المدفوعات (التاريخ، الباقة، المبلغ، الحالة، معرف الطلب) · **C7 `/app/certificates`** — كل التقارير الموثّقة (شبكة بطاقات QR) · **C8 `/app/profile`** — الاسم، الدولة، المجال، الخبرة، جنس المحاور المفضّل، لغة الواجهة، تغيير كلمة السر، حذف الحساب (تأكيد مزدوج).
**C9 `/app/bookings`** — حجوزاتي مع المحاورين البشريين (قادم/مكتمل/ملغي · رابط الانضمام عند الاقتراب · إلغاء ≥٢٤س باسترداد الرصيد).

## D. GUEST CANDIDATE FLOW (no account)
**D1 `/interview/guest/[token]`** — صفحة هبوط مرشح: الشعار + اسم الشركة + المسمّى + نوع المقابلة (AI أو بشري) · التقاط الاسم+البريد · إن كانت بشرية: منتقي موعد بتوقيت المرشح · خانة موافقة قانونية ("تتم المقابلة عبر رابط مرئي خارجي ولا يتم تسجيلها") · ثم → غرفة المقابلة (نفس C3 بوضع الضيف) أو صفحة تأكيد الموعد مع زر رابط الاجتماع و"أضف لتقويمك" (.ics).

## E. B2B APP (roles COMPANY_ADMIN/COMPANY_MEMBER)
**E1 `/b2b/onboarding`** — ٣ خطوات: بيانات الشركة → الرصيد الأولي/الخطة → دعوة أعضاء الفريق (اختياري) · **E2 `/b2b`** — لوحة الشركة: بطاقات KPI (مرشحون · مقابلات مكتملة · متوسط الدرجة · جلسات متبقية · متأخرات SLA بحمراء لو >0) · **E3 `/b2b/jobs`** + **`/b2b/jobs/new`**: إنشاء دفعة مقابلات (المسمّى، المجال، النوع، الوضع: AI | "مقابلة بشرية خبيرة (+$39)" مع حساب السعر الحي حسب عدد المرشحين، AUTO مقابل PANEL مع اختيار ٢–٣ محاورين معتمدين، حتى ٥ أسئلة إلزامية، موعد انتهاء الدعوات) · استيراد CSV (قالب قابل للتنزيل) أو إدخال فردي · بعد الإنشاء: قائمة روابط فريدة لكل مرشح مع أزرار نسخ.
**E4 `/b2b/jobs/[id]`** — جدول المرشحين: الحالة (دُعي/حدّد موعداً/جارٍ/مكتمل/متأخر SLA) · الدرجات ٤+الكلية · التوصية · المحاور · التاريخ · النقر → تقرير المرشح (نفس مكوّن C4 + قسم "معايير الشركة" يعرض تقييم الأسئلة الإلزامية) · تصدير CSV.
**E5 `/b2b/team`** — الأعضاء والأدوار والدعوات · **E6 `/b2b/billing`** — الرصيد والفواتير وشراء مقابلات إضافية عبر PayPal · **E7 `/b2b/settings`** — بيانات الشركة، لوحة المحاورين المثبّتة (PANEL)، إعدادات SLA.
**/demo** — يولّد حساب شركة تجريبيًا كامل البيانات ويدخّل إلى E2 (انظر §Demo في الجزء ٤).

## F. INTERVIEWER APP (role INTERVIEWER)
**F1 `/interviewer`** — لوحة: مواعيد قادمة · أرباح الشهر · متوسط التقييم · حالة الاعتماد · **F2 التوفر**: محرر جدول أسبوعي (حقول يوم/من/إلى + المنطقة الزمنية، نظيف وواضح) · **F3 الحجوزات**: قائمة، لصق/تعديل meetingUrl (إلزامي قبل ساعتين، تحذير أحمر)، تمييز B2B بشارة شركة مع أسئلتها الإلزامية، أزرار "اكتملت"/"لم يحضر" بعد الجلسة · **F4 نموذج التقييم** (`/interviewer/bookings/[id]/evaluate`): ٤ منزلقات معايير + حقول إجابة الأسئلة الإلزامية + نقاط قوة/تحسين + توصية → ينتج التقرير تلقائياً · **F5 الأرباح**: السجل + حالة الدفعة · **F6 الملف**: تعديل السيرة/الصورة/السعر/قطاعات الاستبعاد (تضارب المصالح).

## G. ADMIN (role ADMIN)
قشرة `/admin/*`: **G1 نظرة عامة** (مستخدمون · مقابلات · إيرادات · نشاط يومي — توقيعات مبسطة + آخر الأحداث) · **G2 المستخدمون** (بحث/تصفية/تفعيل-تعطيل/أدوار/جلسات يدوية) · **G3 المحاورون**: طابور "قيد المراجعة" مع ملف كامل → اعتماد/رفض بسبب · تعليق أي محاور · **G4 الحجوزات البشرية**: الكل + متأخرات SLA + إعادة إسناد يدوية (تحترم الاستبعادات) · **G5 بنك الأسئلة**: CRUD كامل بالأعمدة (السؤال AR/EN · المجال · النوع · الصعوبة · التصنيف) + استيراد · **G6 المدفوعات والدفعات للمحاورين**: كل المدفوعات · قائمة مستحقات المحاورين (commission قابل للتعديل افتراضي ٣٥٪) + "تحديد كمدفوع" مع ملاحظة طريقة الدفع (تحويل بنكي/Wise/Payoneer) · **G7 المقابلات**: كل الجلسات مع إعادة توليد تقييم عالق · **G8 السجلات**: جدول تدقيق (المستخدم، الحدث، الوصف، الوقت) · **G9 الإعدادات**: مفاتيح البيئة (حالة كل مفتاح: مضبوط/غير مضبوط — بلا قيم)، أسعار الباقات، نص الـ SLA، عمولة المنصة.

## H. LEGAL-SUPPORT
**H1 `/support`** — مركز مساعدة مبسط (الأسئلة الشائعة نفسها + نموذج تواصل).

---

# PART 3 — DATA MODEL (Prisma — exact models; enums in UPPERCASE)

```
User { id cuid, email uniq, passwordHash, name, image?, country?, industry?, experience?,
  interviewerGender MALE|FEMALE (default MALE), language AR|EN (default AR),
  accountType INDIVIDUAL|B2B, role USER|ADMIN|COMPANY_ADMIN|COMPANY_MEMBER|INTERVIEWER,
  companyId? -> Company, sessionsLeft Int (default 1), isActive Bool (default true), timestamps,
  passwordResetToken?, passwordResetExpiry? }
Company { id, name, size SMALL|MEDIUM|LARGE, industry, country, plan B2B_STARTER|B2B_PRO|B2B_ENTERPRISE,
  credits Int, slaHours Int default 72, panelInterviewers CompanyPanel[], users User[], b2bJobs B2BJob[], timestamps }
CompanyPanel { companyId, interviewerId, UNIQUE(companyId, interviewerId) }
Interview { id, userId?, companyId?, humanBookingId?, guestToken? uniq, guestName?, guestEmail?,
  mode AI|HUMAN, type BEHAVIORAL|TECHNICAL, industry, experience, position?, language AR|EN,
  status PENDING|IN_PROGRESS|COMPLETED|EVALUATION_FAILED, overallScore?, contentScore?,
  clarityScore?, confidenceScore?, culturalFitScore?, feedback?, strengths Json?, improvements Json?,
  recommendation RECOMMENDED|CONSIDER|NOT_RECOMMENDED?, sessionDebited Bool default false,
  verificationId? uniq, pdfUrl?, expiresAt?, timestamps, messages Message[] }
Message { id, interviewId, role INTERVIEWER|CANDIDATE, content Text, sequence Int, createdAt }
Payment { id, userId?, companyId?, package SESSION_1|SESSION_3|SESSION_5|VIP|B2B_STARTER|B2B_BUSINESS|HUMAN_SESSION|B2B_HUMAN_BATCH,
  amountUsd Decimal, paypalOrderId uniq, status CREATED|CAPTURED|FAILED|REFUNDED,
  sessionsCredited Int default 0, idempotencyKey uniq, createdAt, capturedAt? }
Question { id, textAr, textEn, industry, type BEHAVIORAL|TECHNICAL, difficulty EASY|MEDIUM|HARD, category, isActive, timestamps }
InterviewerProfile { id, userId uniq, slug uniq, bioAr, bioEn, industries String[], languages String[],
  yearsExperience Int, currentTitle, photoUrl?, sessionPriceUsd Decimal default 49,
  status PENDING|APPROVED|SUSPENDED, avgRating Decimal default 0, totalSessions Int default 0,
  payoutMethod?, excludedCompanies String[], excludedIndustries String[], ndaAcceptedAt, timestamps,
  availabilities Availability[] }
Availability { id, interviewerId, weekday Int 0-6, startTime String "HH:mm", endTime, timezone IANA }
HumanBooking { id, userId?, companyId?, b2bJobId?, interviewerId, candidateName?, candidateEmail?,
  startsAt, endsAt, status REQUESTED|CONFIRMED|COMPLETED|CANCELLED|NO_SHOW, meetingUrl?,
  priceUsd Decimal, interviewerPayoutUsd?, paypalOrderId?, rating Int?, ratingComment?,
  payoutStatus NOT_DUE|DUE|PAID, payoutNote?, UNIQUE(interviewerId, startsAt) }
B2BJob { id, companyId, title, industry, type, mode AI|HUMAN, assignmentMode AUTO|PANEL,
  mustAskQuestions Json, humanPriceUsd?, inviteDeadline?, createdById, timestamps, interviews Interview[] }
AuditLog { id, actorId?, event, metadata Json, createdAt }
```
Relations per business rules above. Add indexes: Interview(userId), Interview(companyId), HumanBooking(interviewerId), Payment.paypalOrderId.

---

# PART 4 — API SURFACE (all routes; validate with zod; consistent `{error}` ar/en JSON; RBAC enforced server-side)

Auth: `/api/auth/[...nextauth]`, `POST /api/auth/register` (INDIVIDUAL|B2B), `POST /api/auth/forgot-password`.
Profile: `GET/PUT /api/users/me`, `PUT /api/users/me/password`, `DELETE /api/users/me`.
Interviews: `GET/POST /api/interviews` · `GET /api/interviews/[id]` · `POST /api/interviews/[id]/messages` → `{question, questionNumber, totalQuestions, done}` · `POST /api/interviews/[id]/resume` · `GET /api/interviews/[id]/report` (PDF) · `POST /api/interviews/[id]/certificate` (issues verificationId + QR) · Guest: `GET/POST /api/guest/[token]/messages` (token authz only).
Speech: `POST /api/tts {text, voice:"fahd"|"noora"}` (cached by hash; 503 → client text-fallback) · `POST /api/interviews/[id]/transcribe` (multipart → `{text}`).
Payments: `POST /api/payments` ({package}→ PayPal order id) · `POST /api/payments/verify {paypalOrderId}` (capture, idempotent on orderId) · `GET /api/payments`.
Certificates: `GET /api/verify/[id]` → `{valid, name, score, level?, issuedAt, expiresAt}`.
Human marketplace: `GET /api/interviewers?filters` · `GET /api/interviewers/[slug]` (incl. availability merged to requester tz) · `POST /api/interviewers` (application) · `POST /api/bookings {interviewerId, startsAt, returnUrl}` → PayPal order → on capture CONFIRMED · `POST /api/bookings/[id]/cancel` (rules: user ≥24h → credit refund; interviewer cancel always refunds) · `POST /api/bookings/[id]/rate` · `POST /api/bookings/[id]/complete|no-show` (interviewer) · `POST /api/bookings/[id]/evaluation` (interviewer structured form → generates Interview mode HUMAN + report + sets payout DUE).
Interviewer self: `GET/PUT /api/interviewer/profile` · `GET/POST/DELETE /api/interviewer/availability` · `GET /api/interviewer/bookings|earnings` · `PUT /api/bookings/[id]/meeting-url`.
B2B: `GET /api/b2b/dashboard` · `GET/POST /api/b2b/jobs` · `GET /api/b2b/jobs/[id]` (candidates+results) · `POST /api/b2b/jobs/[id]/invites` (bulk emails/names → tokens) · `GET /api/b2b/jobs/[id]/export.csv` · `GET/POST /api/b2b/panel` · `GET /api/b2b/billing` · team: `GET/POST /api/b2b/team`.
Admin: `GET /api/admin/analytics|users|interviews|logs` (paged+search) · `PUT /api/admin/users/[id]` (role/active/sessions) · `GET /api/admin/interviewers?status=PENDING` · `PUT /api/admin/interviewers/[id] (approve|suspend)` · `GET/POST/PUT/DELETE /api/admin/questions` · `GET /api/admin/payouts · PUT /api/admin/payouts/[id]` (markPaid+note) · `GET/PUT /api/admin/settings`.
Demo: `POST /api/auth/demo-login` — idempotent: ensures demo **COMPANY** (seeded: 2 B2B jobs, 6 candidates w/ completed AI interviews + scores + AI notes, 1 upcoming human booking), returns company-admin creds → client `signIn` → `/b2b`.
Emails (env provider, e.g. Resend/SMTP; never block requests; bilingual templates): welcome, password reset, interview-completed (report link), booking confirmation (user+interviewer), meeting-url added, 1h reminder, cancellation+refund, evaluation-ready, payout-paid, B2B invite, weekly inactive nudge.

---

# PART 5 — ENGINES

**AI Interview Engine (`/api/interviews/[id]/messages`):** Arabic system prompt: warm-professional interviewer persona (فهد/نورة حسب التفضيل، اللغة العربية الفصحى مع مراعاة اللهجة في الرد النصي باعتدال)، سؤال واحد فقط كل مرة، متابعة تكيفية من إجابة المرشح السابقة، BEHAVIORAL يتبع STAR، TECHNICAL أسئلة المجال+المستوى، يستلهم من بنك الأسئلة (Question) دون تكرارها حرفياً، ٦–٨ أسئلة ثم خاتمة مهذبة. عند done: استدعاء تقييم واحد يعيد STRICT JSON (المخطط في PRD: ٤ درجات + overall مرجّح + feedback فقرتان-ثلاث عربية + strengths[] + improvements[] + recommendation) — محاولة إعادة واحدة ثم سقوط إلى تقييم استدلالي حتمي (لا تعلّق مقابلة أبداً). خصم الجلسة مرة واحدة فقط عند الاكتمال (transactions + sessionDebited flag). تنظيم معدل: 20 رسالة/مقابلة/ساعة.
**Evaluation → Certificate:** عند اكتمال التقييم بنجاح: verificationId `MQBL-XXXX-XXXX-XXXX` + صورة QR (مكتبة qrcode) تشير إلى `/verify/[id]` + توليد PDF معرب RTL (قالب التقرير = تصميم قسم معاينة التقرير في الصفحة الرئيسية حرفياً: الاسم، المسمّى، التاريخ، الدرجة الكبيرة، ٤ أشرطة، الملاحظات، QR + المعرف، التذييل باللوجو المعتمد). صلاحية سنتان. `/verify/[id]` عام بالبيانات المحدودة فقط.
**Payments:** PayPal Orders REST v2: create → approve → capture server-side (`/api/payments/verify` يتحقق من المبلغ المتوقع للباقة ثم يقيد الجلسات/الرصيد داخل معاملة؛ إعادة استدعاء نفس orderId لا تقيد مرتين). بيئة sandbox→live عبر PAYPAL_ENV. باقة HUMAN_SESSION السعر = sessionPriceUsd للمحاور الحالي؛ لقطة السعر على الحجز.
**Pricing specials:** خصومات تلقائية B2B human: ٢٥+ مرشح → $29 (لقطة على B2BJob).
**Scheduling:** توفر المحاور حسب IANA tz؛ عرض بتوقيت الزائر؛ منع التعارض بالقيد الفريد + معاملة؛ ٤٥ دقيقة ثابتة (.ics ينتج `/api/bookings/[id]/ics`); SLA تلقائي: دعوة B2B بلا موعد بعد slaHours → حالة متأخر في لوحتي الشركة والإدمن.
**Seeds (`prisma/seed.ts`):** ① بنك أسئلة: ≥٥ سلوكية + ٥ تقنية لكل مجال (IT, FINANCE, MEDICINE, ENGINEERING, EDUCATION, MARKETING, SALES, HR) عربي+إنجليزي بفئات وصعوبات ② حسابات: admin@muqabaleh.com (ADMIN) · شركة seed برصيد ٢٥ · مستخدم عادي · ٦ ملفات محاورين موافق عليها + ٢ معلّقين (بصور رمزية مولدة وتوفر أسبوعي حقيقي لأسبوعين قادمين) ③ شركة الديمو للديمو-لوجن ④ مقابلات مكتملة عيّنة بدرجات وتقارير.

---

# PART 6 — BUILD ORDER & VERIFICATION (STRICT GATE AFTER EACH PHASE)

**PHASE A — Atomic design system + FULL SITEMAP UI (no backend logic):** كل صفحات الجزء ٢ بواجهات نهائية كاملة وبيانات وهمية واقعية عربية، بدك/خطأ/تحميل لكل عرض بيانات، موبايل+ديسكتوب، ar+en كاملين. تحقق: تصدير خريطة مسارات (npm run build ينجح؛ عدد المسارات ≥ 35) + لقطات لكل صفحة رئيسية (A1, A2, A3, C3, C4, E3, C1, G3) بالحالتين ar/en + عدم وجود أي نص تعبئة (ابحث عن lorem/TODOplaceholder) + الثيم #070A0F/#D4A843 فقط في عينات الألوان.
**PHASE B — Auth + user core:** الجزء ٤ auth/profile + C1/C2/C8 حقيقية (dashboards تقرأ data حقيقية). تحقق: register(فرد+شركة) → login → PUT profile → (curl logs).
**PHASE C — Interview engine + speech:** الجزء ٥ بالكامل + C3/C4/D1(AI). تحقق: سكربت e2e يجري ٣ إجابات ← أسئلة عربية متكيفة مميزة ← تقييم ٥ درجات محفوظ ← PDF صالح ← /verify يعيد valid ← خصم الجلسة مرة واحدة بالضبط رغم التكرار.
**PHASE D — Payments + certificates UI:** تحقق: sandbox $19 → +١ جلسة مرة واحدة فقط؛ capture مكرر → بلا تغيير؛ نسخ رابط LinkedIn يعمل.
**PHASE E — B2B app + demo:** تحقق: CSV دفعة ٣ مرشحين ← ٣ روابط ← مرشح يكمل مقابلة AI كضيف ← يظهر في E4 بالدرجات + CSV export ← /demo يعرض لوحة ممتلئة.
**PHASE F — Human marketplace:** أجزاء A3/A4/A5/F/C9 + الواجهات. تحقق: اعتماد محاور ← حجز ودفع sandbox ← رابط اجتماع ← نموذج تقييم ← تقرير+PDF موحّد التصميم مع AI ← تقييم ٥ نجوم يحدّث avg ← إلغاء ≥٢٤س يعيد الرصيد؛ القيد الفريد يمنع حجزًا مزدوجًا (أرِ رسالة الخطأ).
**PHASE G — Admin + ops + polish:** الجزء G كامل + إيميلات (لقطات قوالب) + build إنتاجي + SEO/OG (اللوجو المعتمد) + فحص الوصول (contrast AA على الذهب فوق الداكن، ترتيب تبويب صحيح RTL).
**PHASE H — B2B human service:** E3 human mode + AUTO/PANEL + SLA dashboards + الاستبعادات. تحقق حالات a–e من مواصفة P7 السابقة (اقتبس: صناع القرار: AUTO افتراضي؛ 39/29 دولار؛ payout 22).

**GLOBAL DEFINITION OF DONE:** phases A–H evidence accepted + `next build` clean + أسرار البيئة موثقة (NEXTAUTH_URL/SECRET, DATABASE_URL, PAYPAL_*, LLM_*, TTS/STT_*, EMAIL_*) + بيانات دخول seeds + README تشغيل.

---

# PART 7 — COPY TONE
عربية فصحى دافئة راقية موجّهة للمهني العربي الطموح ("أنتَ/أنتِ" بلا مبالغة)؛ ثقة بلا وعود زائفة (لا أرقام مختلقة: استخدم "آلاف" لا "مليون")؛ الإنجليزية موجزة واضحة في المستوى B2. كل الأسعار USD مع تقدير العملات المحلية كما في A1.10.

# ASSETS DELIVERED WITH THIS SPEC
- logos/v2-balanced-a-T.png (primary) · logos/concept-m1-glasscapsule-T.png (mark/favicon/loader/OG)
- assets/fahd.png, noora.png, fahd-sample.wav, noora-sample.wav
- pages/ (HTML snapshots of the ORIGINAL landing + B2B pages = copy reference)
DO NOT regenerate these assets.
