#!/usr/bin/env node
/**
 * Render ultra HQ Job-of-the-Day FB poster faces (EN + AR) for the flip book.
 * Uses sharp + SVG (Noto Arabic / DejaVu) + existing Jeannie / skyline assets.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'public/images/jobs-hero/faces');
const W = 1600;
const H = 1600;

const FONT_AR = '/usr/share/fonts/truetype/noto/NotoSansArabic-Bold.ttf';
const FONT_AR_REG = '/usr/share/fonts/truetype/noto/NotoSansArabic-Regular.ttf';
const FONT_EN = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';
const FONT_EN_REG = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf';

const JOBS = [
  {
    id: '01-careem-dubai',
    company: 'Careem',
    mark: 'C',
    markBg: '#00E0A0',
    markFg: '#04221a',
    titleEn: 'Staff Software Engineer',
    titleAr: 'مهندس برمجيات أول',
    locationEn: 'Dubai, UAE',
    locationAr: 'دبي، الإمارات',
    flag: '🇦🇪',
    deptEn: 'Technology',
    deptAr: 'تقنية',
    deptColor: '#2dd4bf',
    blurbEn:
      'Build products used by millions across the Middle East — and walk in interview-ready.',
    blurbAr: 'ابنِ منتجات يستخدمها ملايين في الشرق الأوسط — وادخل المقابلة جاهزاً.',
    score: 88,
    jeannie: 'public/images/hero-interview.png',
    skyline: 'public/images/jobs-mena-hero.jpg',
  },
  {
    id: '02-mongodb-dubai',
    company: 'MongoDB',
    mark: 'M',
    markBg: '#00ED64',
    markFg: '#04160c',
    titleEn: 'Enterprise Account Executive',
    titleAr: 'ممثل حسابات مؤسسي',
    locationEn: 'Dubai, UAE',
    locationAr: 'دبي، الإمارات',
    flag: '🇦🇪',
    deptEn: 'Sales',
    deptAr: 'مبيعات',
    deptColor: '#c084fc',
    blurbEn:
      'Grow MongoDB across the Gulf and win major enterprise accounts in the region.',
    blurbAr: 'نمّ أعمال MongoDB في الخليج وافتح حسابات جديدة كبرى في المنطقة.',
    score: 84,
    jeannie: 'public/images/hero-interview.png',
    skyline: 'public/images/jobs-mena-hero.jpg',
  },
  {
    id: '03-tamara-riyadh',
    company: 'Tamara',
    mark: 'T',
    markBg: '#C8F135',
    markFg: '#1a2204',
    titleEn: 'Fraud Investigator',
    titleAr: 'محقق احتيال',
    locationEn: 'Riyadh, KSA',
    locationAr: 'الرياض، السعودية',
    flag: '🇸🇦',
    deptEn: 'Finance',
    deptAr: 'مالية',
    deptColor: '#fbbf24',
    blurbEn:
      'Monitor transactions and spot suspicious patterns inside a fast-growing payments platform.',
    blurbAr:
      'راقب المعاملات واكتشف الأنماط المشبوهة داخل منصة مدفوعات سريعة النمو.',
    score: 81,
    jeannie: 'public/images/hero-jeannie-riyadh.webp',
    skyline: 'public/images/jobs-skyline-riyadh.webp',
  },
  {
    id: '04-cloudflare-cairo',
    company: 'Cloudflare',
    mark: 'C',
    markBg: '#F6821F',
    markFg: '#1a0d02',
    titleEn: 'Senior Territory AE, Egypt',
    titleAr: 'مدير حسابات أول — مصر',
    locationEn: 'Cairo, Egypt',
    locationAr: 'القاهرة، مصر',
    flag: '🇪🇬',
    deptEn: 'Sales',
    deptAr: 'مبيعات',
    deptColor: '#c084fc',
    blurbEn:
      "Run full enterprise sales cycles with one of the world's strongest web networks.",
    blurbAr:
      'قد دورات مبيعات مؤسسية كاملة مع واحدة من أقوى شبكات الويب في العالم.',
    score: 83,
    jeannie: 'public/images/hero-interview.png',
    skyline: 'public/images/jobs-mena-hero.jpg',
  },
  {
    id: '05-careem-amman',
    company: 'Careem',
    mark: 'C',
    markBg: '#00E0A0',
    markFg: '#04221a',
    titleEn: 'Operations Coordinator',
    titleAr: 'منسق عمليات',
    locationEn: 'Amman, Jordan',
    locationAr: 'عمّان، الأردن',
    flag: '🇯🇴',
    deptEn: 'Operations',
    deptAr: 'عمليات',
    deptColor: '#fb7185',
    blurbEn:
      "Join the Shops team and elevate delivery experiences across the Kingdom's markets.",
    blurbAr: 'انضم لفريق المتاجر وارفع تجارب التوصيل عبر أسواق المملكة.',
    score: 79,
    jeannie: 'public/images/hero-jeannie-amman.webp',
    skyline: 'public/images/jobs-skyline-amman.webp',
  },
  {
    id: '06-trendyol-riyadh',
    company: 'Trendyol',
    mark: 'T',
    markBg: '#F27A1A',
    markFg: '#1a0c02',
    titleEn: 'Marketing Intern',
    titleAr: 'متدرّب تسويق',
    locationEn: 'Riyadh, KSA',
    locationAr: 'الرياض، السعودية',
    flag: '🇸🇦',
    deptEn: 'Marketing',
    deptAr: 'تسويق',
    deptColor: '#e879f9',
    blurbEn:
      "Start your marketing career with the region's biggest e-commerce platform.",
    blurbAr: 'ابدأ مسيرتك التسويقية مع أكبر منصة تجارة إلكترونية في المنطقة.',
    score: 76,
    jeannie: 'public/images/hero-jeannie-riyadh.webp',
    skyline: 'public/images/jobs-skyline-riyadh.webp',
  },
];

function esc(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function wrapLines(text, maxChars) {
  const words = text.split(/\s+/);
  const lines = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length > maxChars && cur) {
      lines.push(cur);
      cur = w;
    } else {
      cur = next;
    }
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 3);
}

async function prepareJeanniePanel(src) {
  // Portrait panel 560×860 from landscape Jeannie frames (face/upper body).
  return sharp(path.join(ROOT, src))
    .resize(1120, 1120, { fit: 'cover', position: 'centre' })
    .extract({ left: 280, top: 40, width: 560, height: 860 })
    .sharpen({ sigma: 0.6 })
    .png({ compressionLevel: 6, quality: 100 })
    .toBuffer();
}

async function prepareSkyline(src) {
  return sharp(path.join(ROOT, src))
    .resize(W, H, { fit: 'cover', position: 'centre' })
    .modulate({ brightness: 0.55, saturation: 0.85 })
    .blur(1.2)
    .png()
    .toBuffer();
}

function buildOverlaySvg(job, lang, jeannieDataUri) {
  const isAr = lang === 'ar';
  const title = isAr ? job.titleAr : job.titleEn;
  const location = isAr ? job.locationAr : job.locationEn;
  const dept = isAr ? job.deptAr : job.deptEn;
  const blurb = isAr ? job.blurbAr : job.blurbEn;
  const onMq = isAr ? 'على مقابلة' : 'ON MUQABALEH';
  const jotd = isAr ? 'وظيفة اليوم' : 'Job of the Day';
  const trainNow = isAr ? 'تدرّب الآن' : 'Train now';
  const jeannieName = isAr ? 'جيني' : 'Jeannie';
  const coach = isAr ? 'مدربة المقابلات AI' : 'AI Interview Coach';
  const readiness = isAr ? 'جاهزية مقابلة' : 'Interview Readiness';
  const cta = isAr ? 'تدرّب مع جيني مجاناً  ←' : 'Train with Jeannie — Free  →';
  const footer = isAr
    ? 'أكثر من 166 وظيفة حقيقية في الخليج والشام · الراتب لدى الشركة'
    : '166+ real jobs across the Gulf & Levant · Salary at the company';

  const blurbLines = wrapLines(blurb, isAr ? 28 : 36);
  const titleSize = title.length > 28 ? 52 : title.length > 22 ? 58 : 64;

  // Panels: Jeannie on start side in LTR (left), on start side in RTL (right visually via x)
  const jeannieX = isAr ? 860 : 180;
  const copyX = isAr ? 140 : 780;
  const copyAnchor = isAr ? 'end' : 'start';
  const copyTextX = isAr ? copyX + 640 : copyX;

  const blurbTspans = blurbLines
    .map(
      (line, i) =>
        `<tspan x="${copyTextX}" dy="${i === 0 ? 0 : 34}">${esc(line)}</tspan>`,
    )
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="veil" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#05080f" stop-opacity="0.55"/>
      <stop offset="45%" stop-color="#05080f" stop-opacity="0.78"/>
      <stop offset="100%" stop-color="#05080f" stop-opacity="0.94"/>
    </linearGradient>
    <linearGradient id="cta" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#22d3ee"/>
      <stop offset="100%" stop-color="#5eead4"/>
    </linearGradient>
    <linearGradient id="panelFade" x1="0" y1="0.4" x2="0" y2="1">
      <stop offset="0%" stop-color="#05080f" stop-opacity="0"/>
      <stop offset="100%" stop-color="#05080f" stop-opacity="0.9"/>
    </linearGradient>
    <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="12" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <clipPath id="jeannieClip">
      <rect x="${jeannieX}" y="220" width="560" height="860" rx="36"/>
    </clipPath>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#veil)"/>

  <!-- ambient -->
  <circle cx="220" cy="280" r="220" fill="#22d3ee" opacity="0.08"/>
  <circle cx="1380" cy="1200" r="280" fill="#2dd4bf" opacity="0.07"/>

  <!-- header badge -->
  <rect x="${isAr ? 1180 : 120}" y="90" width="${isAr ? 300 : 260}" height="54" rx="27" fill="#0a1018" stroke="#22d3ee" stroke-opacity="0.35" stroke-width="2"/>
  <circle cx="${isAr ? 1440 : 150}" cy="117" r="7" fill="#22d3ee"/>
  <text x="${isAr ? 1415 : 172}" y="126" fill="#ffffff" font-size="22" font-family="Noto Sans Arabic, DejaVu Sans" font-weight="700" text-anchor="${isAr ? 'end' : 'start'}">${esc(jotd)}</text>

  <!-- brand wordmark -->
  <text x="${isAr ? 140 : 1460}" y="128" fill="#f5d78a" font-size="28" font-family="DejaVu Sans" font-weight="700" text-anchor="${isAr ? 'start' : 'end'}" letter-spacing="2">MUQABALEH</text>
  <text x="${isAr ? 140 : 1460}" y="158" fill="#ffffff" font-size="20" font-family="Noto Sans Arabic, DejaVu Sans" font-weight="700" text-anchor="${isAr ? 'start' : 'end'}" opacity="0.85">مقابلة</text>

  <!-- Jeannie panel -->
  <rect x="${jeannieX}" y="220" width="560" height="860" rx="36" fill="#0b121c" stroke="#ffffff" stroke-opacity="0.14" stroke-width="2"/>
  <image href="${jeannieDataUri}" x="${jeannieX}" y="220" width="560" height="860" clip-path="url(#jeannieClip)" preserveAspectRatio="xMidYMid slice"/>
  <rect x="${jeannieX}" y="220" width="560" height="860" rx="36" fill="url(#panelFade)"/>

  <!-- train now -->
  <rect x="${jeannieX + 330}" y="248" width="200" height="44" rx="22" fill="#05080f" fill-opacity="0.72" stroke="#ffffff" stroke-opacity="0.18"/>
  <circle cx="${jeannieX + 358}" cy="270" r="6" fill="#34d399"/>
  <text x="${jeannieX + 375}" y="277" fill="#ffffff" font-size="18" font-family="Noto Sans Arabic, DejaVu Sans" font-weight="700">${esc(trainNow)}</text>

  <text x="${jeannieX + (isAr ? 520 : 40)}" y="1020" fill="#ffffff" font-size="34" font-family="Noto Sans Arabic, DejaVu Sans" font-weight="700" text-anchor="${isAr ? 'end' : 'start'}">${esc(jeannieName)}</text>
  <text x="${jeannieX + (isAr ? 40 : 520)}" y="1020" fill="#ffffff" font-size="18" font-family="Noto Sans Arabic, DejaVu Sans" opacity="0.65" text-anchor="${isAr ? 'start' : 'end'}">${esc(coach)}</text>

  <!-- passport -->
  <rect x="${jeannieX + (isAr ? 24 : 180)}" y="1060" width="360" height="130" rx="22" fill="#070b12" fill-opacity="0.92" stroke="#22d3ee" stroke-opacity="0.28" stroke-width="2"/>
  <text x="${jeannieX + (isAr ? 48 : 204)}" y="1095" fill="#fbbf24" font-size="22">✦</text>
  <text x="${jeannieX + (isAr ? 340 : 500)}" y="1125" fill="#ffffff" font-size="54" font-family="DejaVu Sans" font-weight="700" text-anchor="end">${job.score}<tspan font-size="26" fill="#ffffff" fill-opacity="0.45"> /100</tspan></text>
  <text x="${jeannieX + (isAr ? 48 : 204)}" y="1155" fill="#ffffff" font-size="20" font-family="Noto Sans Arabic, DejaVu Sans" font-weight="700">${esc(readiness)}</text>
  <text x="${jeannieX + (isAr ? 48 : 204)}" y="1180" fill="#67e8f9" font-size="16" font-family="DejaVu Sans" font-weight="700" letter-spacing="1.5">MUQABALEH PASSPORT</text>

  <!-- company mark -->
  <rect x="${copyX}" y="250" width="78" height="78" rx="20" fill="${job.markBg}"/>
  <text x="${copyX + 39}" y="304" fill="${job.markFg}" font-size="40" font-family="DejaVu Sans" font-weight="700" text-anchor="middle">${esc(job.mark)}</text>
  <text x="${copyTextX}" y="285" fill="#ffffff" font-size="34" font-family="DejaVu Sans" font-weight="700" text-anchor="${copyAnchor}">${esc(job.company)}</text>
  <text x="${copyTextX}" y="318" fill="#ffffff" font-size="16" font-family="DejaVu Sans, Noto Sans Arabic" font-weight="700" opacity="0.45" letter-spacing="2" text-anchor="${copyAnchor}">${esc(onMq)}</text>

  <!-- title -->
  <text x="${copyTextX}" y="420" fill="#ffffff" font-size="${titleSize}" font-family="Noto Sans Arabic, DejaVu Sans" font-weight="700" text-anchor="${copyAnchor}">${esc(title)}</text>
  ${
    isAr
      ? `<text x="${copyTextX}" y="470" fill="#ffffff" font-size="24" font-family="DejaVu Sans" opacity="0.45" text-anchor="end">${esc(job.titleEn)}</text>`
      : ''
  }

  <!-- tags -->
  <rect x="${isAr ? copyX + 310 : copyX}" y="510" width="330" height="48" rx="24" fill="#ffffff" fill-opacity="0.06" stroke="#ffffff" stroke-opacity="0.14"/>
  <text x="${isAr ? copyX + 620 : copyX + 22}" y="542" fill="#ffffff" font-size="22" font-family="Noto Sans Arabic, DejaVu Sans" font-weight="700" text-anchor="${isAr ? 'end' : 'start'}">${esc(job.flag)}  ${esc(location)}</text>

  <rect x="${isAr ? copyX : copyX + 350}" y="510" width="200" height="48" rx="24" fill="#ffffff" fill-opacity="0.05" stroke="#ffffff" stroke-opacity="0.12"/>
  <circle cx="${isAr ? copyX + 175 : copyX + 375}" cy="534" r="6" fill="${job.deptColor}"/>
  <text x="${isAr ? copyX + 155 : copyX + 395}" y="542" fill="#ffffff" font-size="22" font-family="Noto Sans Arabic, DejaVu Sans" font-weight="700" text-anchor="${isAr ? 'end' : 'start'}">${esc(dept)}</text>

  <!-- blurb -->
  <text x="${copyTextX}" y="620" fill="#d1d5db" font-size="26" font-family="Noto Sans Arabic, DejaVu Sans" text-anchor="${copyAnchor}">${blurbTspans}</text>

  <!-- CTA -->
  <rect x="${copyX}" y="780" width="640" height="88" rx="28" fill="url(#cta)" filter="url(#glow)"/>
  <text x="${copyX + 320}" y="836" fill="#041016" font-size="30" font-family="Noto Sans Arabic, DejaVu Sans" font-weight="700" text-anchor="middle">${esc(cta)}</text>

  <text x="${copyTextX}" y="920" fill="#ffffff" font-size="20" font-family="Noto Sans Arabic, DejaVu Sans" opacity="0.5" text-anchor="${copyAnchor}">●  ${esc(footer)}</text>

  <text x="${isAr ? 140 : 1460}" y="1520" fill="#67e8f9" font-size="22" font-family="DejaVu Sans" opacity="0.7" text-anchor="${isAr ? 'start' : 'end'}">muqabaleh.com/jobs</text>
</svg>`;
}

async function renderFace(job, lang) {
  const [skyline, jeannie] = await Promise.all([
    prepareSkyline(job.skyline),
    prepareJeanniePanel(job.jeannie),
  ]);
  const jeannieDataUri = `data:image/png;base64,${jeannie.toString('base64')}`;
  const svg = buildOverlaySvg(job, lang, jeannieDataUri);

  const base = await sharp(skyline)
    .composite([
      {
        input: Buffer.from(
          `<svg width="${W}" height="${H}"><rect width="100%" height="100%" fill="#05080f" opacity="0.35"/></svg>`,
        ),
      },
    ])
    .png()
    .toBuffer();

  const outBase = `${job.id}-${lang}`;
  const pngPath = path.join(OUT, `${outBase}.png`);
  const webpPath = path.join(OUT, `${outBase}.webp`);

  const composed = await sharp(base)
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .png({ compressionLevel: 8, quality: 100 })
    .toBuffer();

  await sharp(composed)
    .png({ compressionLevel: 6, quality: 100 })
    .toFile(pngPath);
  await sharp(composed)
    .webp({ quality: 96, effort: 6 })
    .toFile(webpPath);

  const meta = await sharp(pngPath).metadata();
  console.log(`✓ ${outBase}  ${meta.width}x${meta.height}`);
  return { pngPath, webpPath };
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  // touch fontconfig by reading fonts
  await Promise.all([
    fs.access(FONT_AR),
    fs.access(FONT_AR_REG),
    fs.access(FONT_EN),
    fs.access(FONT_EN_REG),
  ]);

  for (const job of JOBS) {
    await renderFace(job, 'ar');
    await renderFace(job, 'en');
  }
  console.log(`\nWrote ${JOBS.length * 2} faces → ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
