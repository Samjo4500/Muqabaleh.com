#!/usr/bin/env python3
"""Rewrite Arabic site copy for natural meaning (not literal EN calques)."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
AR_PATH = ROOT / "src" / "messages" / "ar.json"


def deep_set(obj: dict, path: str, value: str) -> None:
    parts = path.split(".")
    cur: dict = obj
    for p in parts[:-1]:
        if p not in cur or not isinstance(cur[p], dict):
            cur[p] = {}
        cur = cur[p]
    cur[parts[-1]] = value


def main() -> None:
    ar = json.loads(AR_PATH.read_text(encoding="utf-8"))

    updates: dict[str, str] = {
        # ── common / nav ──
        "common.offline": "أنت غير متصل بالإنترنت. بعض الميزات قد لا تكون متاحة.",
        "common.tapToShowControls": "اضغط لإظهار عناصر التحكم",
        "nav.why": "للمرشحين",
        "nav.demo": "تجربة حية",
        "nav.startTrial": "ابدأ مقابلة تجريبية",
        # ── landing flat (legacy + crystal overlap) ──
        "landing.heroEyebrow": "منصّة عربية للتدرّب على مقابلات العمل بالذكاء الاصطناعي",
        "landing.heroH1": "تدرّب جيداً. احصل على تقييمك.",
        "landing.heroH1Highlight": "واقترب من الوظيفة.",
        "landing.heroSub": "٤٧ شركة تستخدم مقابلة في التوظيف. انضم مجاناً واحصل على تقييم مهني موثّق.",
        "landing.heroCta1": "ابدأ مقابلتك المجانية",
        "landing.heroCta2": "تعرّف كيف يعمل",
        "landing.trustedByHeadline": "يستخدمها باحثون عن عمل في",
        "landing.statsInterviews": "+١٠٬٠٠٠ جلسة تدرّب",
        "landing.statsUsers": "+٥٬٠٠٠ مرشح استعدّوا بثقة أكبر",
        "landing.statsRating": "٤.٨/٥ رضا المستخدمين",
        "landing.statsImprovement": "+٢٣٪ تحسّن في التقييم بعد ٣ جلسات",
        "landing.whyTitle": "لماذا مقابلة؟",
        "landing.whySub": "ليست دردشة عامة—بل محاور مهني يتجاوب مع إجاباتك ويعطيك ملاحظات عملية تساعدك تتحسّن.",
        "landing.whyFeature1Title": "أسئلة تتجاوب معك",
        "landing.whyFeature1Desc": "ليس بنك أسئلة ثابت. السؤال التالي يُبنى على إجابتك—كما يحدث في المقابلات الحقيقية.",
        "landing.whyFeature2Title": "تقييم بأربعة معايير مستقلة",
        "landing.whyFeature2Desc": "المحتوى، الوضوح، الثقة، والملاءمة الثقافية—كل معيار بدرجة مستقلة وملاحظات واضحة.",
        "landing.whyFeature3Title": "أصوات عربية طبيعية",
        "landing.whyFeature3Desc": "اختر محاورك: فهد أو نورة—بأصوات عربية أصيلة تعطيك إحساساً بمقابلة حقيقية.",
        "landing.whyFeature4Title": "تقرير موثّق يمكنك مشاركته",
        "landing.whyFeature4Desc": "شهادة رقمية بمعرّف فريد (MQBL-XXXX) وشارة QR للتحقق الفوري—أضفها لسيرتك أو قدّمها لصاحب العمل.",
        "landing.whyFeature5Title": "خصوصية كاملة وتشفير",
        "landing.whyFeature5Desc": "بياناتك مشفّرة ولا تُشارك مع أطراف ثالثة. يمكنك حذف حسابك وجميع بياناتك في أي وقت.",
        "landing.howTitle": "كيف يعمل؟",
        "landing.howSub": "أربع خطوات بسيطة نحو تقييم مهني موثّق يمكنك مشاركته.",
        "landing.howStep1Title": "اختر نوع المقابلة",
        "landing.howStep1Desc": "حدّد المجال (٨ قطاعات)، ومستوى خبرتك، ونوع المقابلة: سلوكية أو تقنية.",
        "landing.howStep2Title": "أجب مع المحاور الذكي",
        "landing.howStep2Desc": "فهد أو نورة يطرحان عليك ٥ أسئلة واقعية ويحلّلان إجاباتك فوراً. اكتب أو تحدّث بصوتك.",
        "landing.howStep3Title": "تابع تقييمك مباشرة",
        "landing.howStep3Desc": "بعد كل إجابة يتحدّث تقييمك اللحظي على المعايير الأربعة.",
        "landing.howStep4Title": "احصل على تقريرك الموثّق",
        "landing.howStep4Desc": "درجة كلية + تقييم بأربعة معايير + ملاحظات مفصّلة + شهادة QR جاهزة للمشاركة.",
        "landing.beforeDesc": "أرتبك في المقابلات",
        "landing.beforeSub": "توتر وأسئلة بلا إجابة واضحة",
        "landing.afterDesc": "تقييم ٩١/١٠٠ موثّق",
        "landing.afterSub": "تقرير كامل + شارة موثّقة",
        "landing.experienceTitle": "تجربة المقابلة",
        "landing.experienceSub": "شاهد كيف تُجري نورة مقابلة في إدارة التسويق—بنفس الجودة التي ستختبرها.",
        "landing.interviewersTitle": "المحاورون",
        "landing.interviewersSub": "هنا يبدأ التميّز.",
        "landing.pricingTitle": "أسعار واضحة وبسيطة",
        "landing.pricingSub": "ابدأ مجاناً. رقِّ خطتك متى شئت.",
        "landing.session3Badge": "الأكثر طلباً",
        "landing.trustRefund": "استرداد كامل خلال ٢٤ ساعة للجلسة غير المكتملة",
        "landing.reportPreviewTitle": "نموذج التقرير الموثّق",
        "landing.reportPreviewSub": "هكذا يبدو التقرير الذي ستحصل عليه بعد كل مقابلة.",
        "landing.testimonialsTitle": "آراء المستخدمين",
        "landing.testimonialsSub": "ماذا يقول مهنيون مثلُك عن تجربتهم مع مقابلة.",
        "landing.faqTitle": "الأسئلة الشائعة",
        "landing.finalCtaSub": "انضم إلى آلاف المهنيين العرب الذين يستعدّون لمقابلاتهم مع مقابلة.",
        "landing.footerLinkDemo": "تجربة حية",
        "landing.footerLinkAbout": "عن مقابلة",
        "landing.freeSub": "جرّبها—بدون بطاقة",
        "landing.proTitle": "احترافي",
        "landing.proSub": "الخيار الأكثر اختياراً",
        "landing.unlimitedTitle": "بلا حدود",
        "landing.unlimitedSub": "للجادّين في البحث عن وظيفة",
        "landing.premiumTitle": "متميّز—مقابلات بلا حدود",
        "landing.premiumDesc": "مقابلات تجريبية بلا حدود، تقييم بأربعة معايير، شهادات موثّقة بـ QR، وتقارير PDF. إلغاء في أي وقت.",
        "landing.simPreparing": "يجهّز سؤالك…",
        "landing.simAnalyzing": "يحلّل…",
        "landing.simStep1": "أهلاً! أنا فهد. خلّينا نبدأ بسؤال بسيط…",
        "landing.simStep2": "عرّفني عن نفسك باختصار. وش يميّزك؟",
        "landing.simUserReply": "أنا مهندس برمجيات مع ٣ سنوات خبرة…",
        "landing.simFeedback": "تمام! بس حاول تكون أكثر تحديداً. استخدم أرقاماً.",
        "landing.simStep5": "السؤال الجاي: وش أكبر تحدّي واجهته؟",
        "landing.simCtaHeadline": "جرّب المقابلة الحقيقية الآن",
        "landing.simCtaButton": "ابدأ مقابلتك المجانية",
        "landing.simCtaSub": "جلسة مجانية—بدون بطاقة ائتمان",
        "landing.trustedByTitle": "يثق بنا مهنيون من قطاعات مختلفة",
        "landing.trustedBySubtitle": "محترفون من أكثر من ٢٠ دولة يتدرّبون على مقابلة",
        "landing.newsletterTitle": "نصائح عملية للمقابلات كل أسبوع",
        "landing.newsletterSubtitle": "أفكار مفيدة تصل إلى بريدك—بدون إزعاج.",
        "landing.newsletterButton": "اشترك",
        "landing.newsletterSuccess": "تم الاشتراك! تحقّق من بريدك.",
        "landing.faqQ7": "هل يمكنني التدرّب بالعربية؟",
        "landing.faqA7": "نعم. مقابلة تدعم العربية بالكامل—واجهة، محاورون، وتقارير تقييم. اختر العربية من قائمة اللغة.",
        "landing.faqQ8": "كيف يتم التحقق من المحاورين البشر؟",
        "landing.faqA8": "يمرّ جميع المحاورين بعملية تقديم صارمة تشمل التحقق من الهوية والخبرة ومقابلة اختبار. يبقى نشطاً فقط من يحافظ على تقييم ٤.٠ فأعلى.",
        "landing.faqQ9": "ما القطاعات التي تغطّونها؟",
        "landing.faqA9": "نغطّي التقنية، الصحة، المالية، الاستشارات، الأكاديميا، والطيران، والقانون، والتسويق، وغيرها. بنك أسئلة يضم أكثر من ٥٠٠ سؤالاً متخصصاً.",
        "landing.faqQ10": "هل يمكنني استرداد المبلغ؟",
        "landing.faqA10": "نعم. لجلسات المحاور البشري يمكنك الإلغاء حتى ٢٤ ساعة قبل الموعد لاسترداد كامل. رصيد مقابلات الذكاء الاصطناعي لا يُسترد لكنه لا ينتهي.",
        "landing.faqQ11": "هل بياناتي محمية؟",
        "landing.faqA11": "بالتأكيد. جميع البيانات مشفّرة أثناء النقل والتخزين. نلتزم بمعايير حماية البيانات، ولا نبيع بيانات المستخدمين. يمكنك طلب حذف بياناتك في أي وقت.",
        "landing.faqA1": "يستخدم المحاور الذكي نموذجاً متقدماً مصمّماً لمقابلات العمل بالعربية. يطرح سؤالاً واحداً في كل مرة، يتابع إجابتك بذكاء، ويقيّمك على أربعة معايير: المحتوى والوضوح والثقة والملاءمة الثقافية.",
        "landing.faqA3": "المقابلة النموذجية من ٦ إلى ٨ أسئلة، وتستغرق عادةً ١٥ إلى ٢٠ دقيقة حسب طول إجاباتك. يمكنك التوقف في أي وقت.",
        "landing.storyBeforeQuote": "أتجمّد في المقابلات. ما أعرف وش يسألون.",
        "landing.storyPracticeQuote": "مع مقابلة، أتدرّب على أسئلة حقيقية وأحصل على تقييم فوري.",
        "landing.storyAfterQuote": "٩١ من ١٠٠. حصلت على العرض.",
        "landing.previewAnalyzing": "يحلّل الإجابة…",
        "landing.previewComplete": "اكتمل التحليل—التقرير جاهز",
        "landing.trustCountries": "٢٠ دولة عربية",
        # Nested crystal landing
        "landing.nav.learners": "للمرشحين",
        "landing.nav.companies": "للشركات",
        "landing.nav.pricing": "الأسعار",
        "landing.nav.howItWorks": "كيف يعمل",
        "landing.nav.blog": "المدونة",
        "landing.nav.startFree": "ابدأ مجاناً",
        "landing.nav.signIn": "تسجيل الدخول",
        "landing.nav.menu": "القائمة",
        "landing.hero.title": "أتقن مقابلتك… واقترب من وظيفة أحلامك.",
        "landing.hero.subtitle": "مقابلات تجريبية واقعية مع تقييم فوري ومدربين بشريين—تدرّب حتى تدخل وأنت جاهز.",
        "landing.hero.ctaPrimary": "ابدأ مقابلة مجانية",
        "landing.hero.ctaSecondary": "للشركات",
        "landing.hero.simLive": "مقابلة ذكاء اصطناعي مباشرة",
        "landing.hero.simQuestion": "أخبرني عن تحدٍ قدته من البداية حتى النهاية.",
        "landing.hero.simAnswer": "وحّدت فرق المنتج والتصميم والهندسة حول هدف واحد…",
        "landing.hero.simScore": "درجة المقابلة",
        "landing.hero.simClarity": "الوضوح",
        "landing.hero.simStructure": "البنية",
        "landing.hero.simConfidence": "الثقة",
        "landing.hero.simListening": "نستمع إليك…",
        "landing.hero.chipAi": "أسئلة ذكية تتجاوب معك",
        "landing.hero.chipFeedback": "تقييم فوري",
        "landing.hero.chipCoach": "مدربون بشريون",
        # THE flagged wrong literal line
        "landing.b2c.eyebrow": "للباحثين عن عمل",
        "landing.b2c.headline": "استعد للمقابلة. عزّز ثقتك. اقترب من العرض.",
        "landing.b2c.feature1": "مقابلة تجريبية بالذكاء الاصطناعي",
        "landing.b2c.feature2": "تقييم وملاحظات فورية",
        "landing.b2c.feature3": "احجز مدرباً بشرياً",
        "landing.b2c.cta": "جرّب التجربة",
        "landing.b2c.simTitle": "جلسة مقابلة تجريبية",
        "landing.b2c.simProgress": "السؤال ٣ من ٨",
        "landing.b2c.simPrompt": "أخبرني عن مرة قدت فيها مشروعاً صعباً.",
        "landing.b2c.simLevelLabel": "مستوى المقابلة",
        "landing.b2c.simConfidence": "درجة الثقة",
        "landing.b2c.simListening": "نحلّل إجابتك…",
        "landing.b2b.eyebrow": "للشركات والمؤسسات التعليمية",
        "landing.b2b.headline": "وظّف بذكاء. افرز بسرعة.",
        "landing.b2b.feature1": "فرز بهوية شركتك",
        "landing.b2b.feature2": "اختبار المرشحين بالجملة",
        "landing.b2b.feature3": "ربط عبر واجهة برمجية",
        "landing.b2b.cta": "اطلب عرضاً للشركات",
        "landing.b2b.dashTitle": "تحليلات الفرز",
        "landing.b2b.statCandidates": "مرشحون تم تقييمهم",
        "landing.b2b.statAvg": "متوسط الدرجة",
        "landing.b2b.statPass": "نسبة النجاح",
        "landing.b2b.rowAction": "عرض",
        "landing.b2b.whiteLabelTitle": "بوابة الفرز الخاصة بشركتك",
        "landing.b2b.whiteLabelSub": "تجربة مرشحين بهوية علامتك",
        "landing.b2b.whiteLabelCta": "افتح البوابة",
        "landing.testimonials.title": "يثق بنا مرشحون وفرق توظيف حول العالم",
        "landing.testimonials.quote1": "تدرّبت ثلاثة أيام على مقابلة، ونجحت في الجولة النهائية بشركة تقنية كبرى.",
        "landing.testimonials.role1": "أحمد، القاهرة — مهندس برمجيات",
        "landing.testimonials.quote2": "المحاور الذكي طرح أسئلة لم أتوقعها. لما جاءت المقابلة الحقيقية كنت جاهزاً.",
        "landing.testimonials.role2": "لينا، عمّان — مديرة منتجات",
        "landing.testimonials.quote3": "وفّرنا نحو ٦٠٪ من وقت الفرز باستخدام مقابلات الجولة الأولى الآلية.",
        "landing.testimonials.role3": "عمر، الرياض — مدير موارد بشرية",
        "landing.testimonials.quote4": "بعد أسبوع من التدرّب على مقابلة، دخلت مقابلة العمل بثقة وحصلت على العرض.",
        "landing.testimonials.role4": "فاطمة، دبي — قائدة تسويق",
        "landing.testimonials.quote5": "تقارير واضحة، تقييم منظم، والمرشحون يكملون العملية فعلاً.",
        "landing.testimonials.role5": "نورة، لندن — مسؤولة استقطاب مواهب",
        "landing.testimonials.quote6": "منصة احترافية ساعدتني أحسّن أدائي في المقابلات خطوة بخطوة.",
        "landing.testimonials.role6": "يوسف، الدار البيضاء — مستشار",
        "landing.testimonials.trust1": "تستخدمها الجامعات",
        "landing.testimonials.trust2": "موثوقة لدى فرق الموارد البشرية",
        "landing.testimonials.trust3": "معيار احترافي عالمي",
        "landing.pricing.title": "أسعار واضحة",
        "landing.pricing.subtitle": "ابدأ مجاناً. رقِّ خطتك عندما تكون جاهزاً.",
        "landing.pricing.free": "مجاني",
        "landing.pricing.pro": "احترافي",
        "landing.pricing.unlimited": "بلا حدود",
        "landing.pricing.enterprise": "للمؤسسات",
        "landing.pricing.priceEnterprise": "مخصّص",
        "landing.pricing.period": "/شهر",
        "landing.pricing.feat1": "مقابلة تجريبية واحدة بالذكاء الاصطناعي",
        "landing.pricing.feat2": "ملخص تقييم أساسي",
        "landing.pricing.feat3": "رابط نتيجة قابل للمشاركة",
        "landing.pricing.feat4": "١٠ مقابلات شهرياً",
        "landing.pricing.feat5": "تفصيل كامل للدرجات",
        "landing.pricing.feat6": "أسئلة حسب الدور الوظيفي",
        "landing.pricing.feat7": "دعم ذو أولوية",
        "landing.pricing.feat8": "مقابلات بلا حدود",
        "landing.pricing.feat9": "خصم على المدرب البشري",
        "landing.pricing.feat10": "تحليلات متقدمة",
        "landing.pricing.feat11": "مسارات تدرّب مخصّصة",
        "landing.pricing.feat12": "بوابة بهوية شركتك",
        "landing.pricing.feat13": "دعوات جماعية وواجهة برمجية",
        "landing.pricing.feat14": "مدير نجاح مخصّص",
        "landing.pricing.ctaFree": "ابدأ مجاناً",
        "landing.pricing.ctaPro": "ابدأ الآن",
        "landing.pricing.ctaUnlimited": "ابدأ الآن",
        "landing.pricing.ctaEnterprise": "تواصل مع المبيعات",
        "landing.pricing.mostPopular": "الأكثر طلباً",
        "landing.steps.title": "كيف يعمل",
        "landing.steps.subtitle": "من أول تدرّب إلى جاهزية للمقابلة—بأربع خطوات واضحة.",
        "landing.steps.step1": "اختر دورك",
        "landing.steps.desc1": "حدّد المسمى الوظيفي ومستوى الخبرة المستهدف.",
        "landing.steps.step2": "أجرِ مقابلة الذكاء الاصطناعي",
        "landing.steps.desc2": "تحدّث بشكل طبيعي. المحاور يطرح أسئلة متابعة حسب إجاباتك.",
        "landing.steps.step3": "احصل على درجتك",
        "landing.steps.desc3": "تقييم للوضوح والبنية والثقة.",
        "landing.steps.step4": "احجز مدرباً بشرياً",
        "landing.steps.desc4": "جلسات مباشرة اختيارية مع مدربي مقابلات معتمدين.",
        "landing.footer.tagline": "مقابلات تجريبية ذكية مع تقييم فوري ومدربين بشريين.",
        "landing.footer.product": "المنتج",
        "landing.footer.resources": "الموارد",
        "landing.footer.company": "الشركة",
        "landing.footer.legal": "قانوني",
        "landing.footer.pricing": "الأسعار",
        "landing.footer.demo": "تجربة حية",
        "landing.footer.business": "للشركات",
        "landing.footer.blog": "المدونة",
        "landing.footer.support": "الدعم",
        "landing.footer.about": "من نحن",
        "landing.footer.privacy": "الخصوصية",
        "landing.footer.terms": "الشروط",
        "landing.footer.refund": "الاسترداد",
        "landing.footer.copyright": "© ٢٠٢٦ مقابلة. جميع الحقوق محفوظة.",
        "landing.footer.language": "اللغة",
        "landing.finalCta.title": "جاهز لمقابلتك القادمة؟",
        "landing.finalCta.subtitle": "انضم إلى آلاف الباحثين عن عمل والشركات التي تستخدم مقابلة.",
        "landing.finalCta.ctaPrimary": "ابدأ مجاناً",
        "landing.finalCta.ctaSecondary": "تحدث إلى المبيعات",
        # about
        "about.eyebrow": "عن مقابلة",
        "about.heroH1": "نبني مستقبل التوظيف العربي",
        "about.heroSub": "مقابلة منصّة عربية للتدرّب على مقابلات العمل بالذكاء الاصطناعي. نؤمن أن كل مهني عربي يستحق فرصة عادلة ليثبت نفسه في المقابلة.",
        "about.missionDesc": "تمكين المهنيين العرب من التدرّب على مقابلات العمل بتقييم موضوعي ودقيق، وتزويدهم بتقارير موثّقة تعزّز فرصهم في سوق العمل.",
        "about.visionDesc": "أن نصبح المعيار العربي لتقييم جاهزية المرشحين—منصّة يثق بها أصحاب العمل والباحثون عن عمل على حدّ سواء.",
        "about.valuesTitle": "ما نؤمن به",
        "about.valuesSub": "ستّة مبادئ توجّه كل قرار نتّخذه في مقابلة.",
        # demo
        "demo.title": "تجربة المقابلة",
        "demo.subtitle": "جرّب كيف تبدو جلسة المقابلة التجريبية—بدون تسجيل.",
        "demo.start": "ابدأ التجربة",
        "demo.starting": "جارٍ التحضير…",
        "demo.note": "هذه تجربة مختصرة. النسخة الكاملة تمنحك تقييماً أعمق وتقارير قابلة للمشاركة.",
        "demo.home": "الرئيسية",
        "demo.back": "رجوع",
        "demo.demoMode": "وضع التجربة",
        "demo.servicesUnavailable": "خدمات التجربة غير متاحة حالياً. حاول لاحقاً.",
        "demo.pricingLink": "اطّلع على الأسعار",
        # pricing page names
        "pricing.proName": "احترافي",
        "pricing.unlimitedName": "بلا حدود",
    }

    # business page — light natural polish where awkward
    business_updates = {
        "business.starterTitle": "انطلاق",
        "business.businessTitle": "أعمال",
        "business.enterpriseTitle": "مؤسسات",
    }
    updates.update(business_updates)

    # auth polish
    auth_updates = {
        "auth.emailPlaceholder": "example@email.com",
    }
    # leave email placeholder Latin — ok

    missing = []
    for path, value in updates.items():
        parts = path.split(".")
        cur = ar
        ok = True
        for p in parts[:-1]:
            if not isinstance(cur, dict) or p not in cur:
                ok = False
                break
            cur = cur[p]
        if not ok or not isinstance(cur, dict) or parts[-1] not in cur:
            missing.append(path)
            # still set nested crystal keys that may be incomplete
            deep_set(ar, path, value)
        else:
            cur[parts[-1]] = value

    # Global natural replacements for common literal calques inside string values
    def scrub(node):
        if isinstance(node, dict):
            return {k: scrub(v) for k, v in node.items()}
        if isinstance(node, list):
            return [scrub(v) for v in node]
        if isinstance(node, str):
            s = node
            # Prefer natural product Arabic over literal "feedback"
            s = s.replace("تغذية راجعة فورية", "تقييم فوري")
            s = s.replace("تغذية راجعة", "ملاحظات")
            s = s.replace("ملخص تغذية راجعة", "ملخص تقييم")
            return s
        return node

    ar = scrub(ar)

    # Re-apply critical headline after scrub (in case)
    ar["landing"]["b2c"]["headline"] = "استعد للمقابلة. عزّز ثقتك. اقترب من العرض."

    AR_PATH.write_text(
        json.dumps(ar, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Updated {len(updates)} keys ({len(missing)} were created/missing-path)")
    if missing:
        print("Created/missing paths:")
        for m in missing[:30]:
            print(" ", m)


if __name__ == "__main__":
    main()
