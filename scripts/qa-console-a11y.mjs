import puppeteer from 'puppeteer-core';

const EN =
  'https://muqabaleh-com-git-cursor-console-a11-24b740-samjo4500s-projects.vercel.app/en/console/najm-tech';
const AR =
  'https://muqabaleh-com-git-cursor-console-a11-24b740-samjo4500s-projects.vercel.app/ar/console/najm-tech';

async function dismissOverlays(page) {
  await page.waitForSelector('body', { timeout: 30000 });
  await new Promise((r) => setTimeout(r, 1200));
  // Welcome CTA
  for (const sel of [
    'button[aria-label*="Enter"]',
    'button[aria-label*="دخول"]',
    'button:has-text("Enter")',
  ]) {
    try {
      const el = await page.$(sel.includes('has-text') ? 'button' : sel);
      if (!el) continue;
    } catch {
      /* ignore */
    }
  }
  // Click any visible primary welcome button
  await page.evaluate(() => {
    const buttons = [...document.querySelectorAll('button')];
    const welcome = buttons.find((b) =>
      /enter|دخول|access|fingerprint/i.test(
        `${b.textContent || ''} ${b.getAttribute('aria-label') || ''}`,
      ),
    );
    welcome?.click();
  });
  await new Promise((r) => setTimeout(r, 2800));
  // Skip tour
  await page.evaluate(() => {
    const buttons = [...document.querySelectorAll('button')];
    const skip = buttons.find((b) => /skip|تخطي/i.test(b.textContent || ''));
    skip?.click();
  });
  await new Promise((r) => setTimeout(r, 800));
}

async function main() {
  const browser = await puppeteer.launch({
    executablePath: '/usr/local/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1400,900'],
    defaultViewport: { width: 1400, height: 900 },
  });
  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('pageerror', (e) => consoleErrors.push(e.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  const results = {};

  await page.goto(EN, { waitUntil: 'networkidle2', timeout: 60000 });
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload({ waitUntil: 'networkidle2', timeout: 60000 });
  await dismissOverlays(page);

  // 1 Keyboard + shortcuts
  const a11yBtn = await page.$('[data-console-a11y-menu], [aria-label="Accessibility options"]');
  results.hasA11yBtn = Boolean(a11yBtn);

  await page.evaluate(() => document.activeElement?.blur?.());
  await page.keyboard.down('Shift');
  await page.keyboard.press('Slash');
  await page.keyboard.up('Shift');
  await new Promise((r) => setTimeout(r, 500));
  let shortcutsOpen = await page.evaluate(() => {
    const d = document.querySelector('[data-console-modal="true"], [role="dialog"][aria-modal="true"]');
    return Boolean(d && /shortcut|اختصار/i.test(d.textContent || ''));
  });
  if (!shortcutsOpen) {
    await page.evaluate(() => {
      document.activeElement?.blur?.();
      window.dispatchEvent(
        new KeyboardEvent('keydown', { key: '?', bubbles: true, cancelable: true }),
      );
    });
    await new Promise((r) => setTimeout(r, 500));
    shortcutsOpen = await page.evaluate(() => {
      const d = document.querySelector('[data-console-modal="true"], [role="dialog"][aria-modal="true"]');
      return Boolean(d && /shortcut|اختصار/i.test(d.textContent || ''));
    });
  }
  await page.keyboard.press('Escape');
  await new Promise((r) => setTimeout(r, 200));
  const shortcutsClosed = await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"][aria-modal="true"]');
    return !d || !/shortcut|اختصار/i.test(d.textContent || '');
  });

  // Focus ring style — measure computed outline on a focused control
  const focusOk = await page.evaluate(() => {
    const btn = document.querySelector('[data-console-a11y-menu], .mq-console-icon-btn');
    if (!btn) return false;
    btn.focus();
    const cs = getComputedStyle(btn);
    return /14b8a6|20,\s*184,\s*166/i.test(`${cs.outlineColor} ${cs.outline}`);
  });

  // J/K rows
  const rowCount = await page.$$eval('[data-passport-row]', (els) => els.length);
  if (rowCount) {
    await page.focus('[data-passport-row]');
    await page.keyboard.press('KeyJ');
    await new Promise((r) => setTimeout(r, 150));
  }

  results.keyboard = {
    a11yBtn: results.hasA11yBtn,
    shortcutsOpen,
    shortcutsClosed,
    focusCss: focusOk,
    passportRows: rowCount,
  };

  // 2 ARIA
  results.aria = await page.evaluate(() => {
    const nav = document.querySelector('nav[aria-label]');
    const current = document.querySelector('[aria-current="page"]');
    const live = document.querySelector('[aria-live="polite"]');
    const badges = [...document.querySelectorAll('[aria-label*="Score"], [aria-label*="درجة"], [aria-label*="out of 100"]')];
    return {
      navLabel: nav?.getAttribute('aria-label') || null,
      ariaCurrent: Boolean(current),
      live: Boolean(live),
      scoreAria: badges.length,
    };
  });

  // 3 Color-blind badges
  results.badges = await page.evaluate(() => {
    const cards = [...document.querySelectorAll('[data-passport-row], .mq-console-card')];
    const text = cards.map((c) => c.textContent || '').join(' | ');
    return {
      hasStrong: /Strong|قوي/i.test(text),
      hasAverage: /Average|متوسط/i.test(text),
      hasLow: /Low|منخفض/i.test(text),
      sample: text.slice(0, 400),
    };
  });

  // 4 Pipeline shapes
  await page.goto(
    EN.replace('/console/najm-tech', '/console/najm-tech/pipeline'),
    { waitUntil: 'networkidle2', timeout: 60000 },
  );
  await dismissOverlays(page);
  results.pipeline = await page.evaluate(() => {
    const headers = [...document.querySelectorAll('h3')].map((h) => ({
      text: (h.textContent || '').trim(),
      html: h.innerHTML.slice(0, 300),
    }));
    const hasRotate = document.body.innerHTML.includes('rotate-45');
    const hasStageMarker = /NEW|SHORTLIST|HIRED|REJECT|جديد|مختصر|تعيين|مرفوض/i.test(
      document.body.innerText,
    );
    return { headers: headers.slice(0, 8), hasRotate, hasStageMarker };
  });

  // Back to dashboard for prefs
  await page.goto(EN, { waitUntil: 'networkidle2', timeout: 60000 });
  await dismissOverlays(page);

  // Open a11y menu
  const menuOpened = await page.evaluate(() => {
    const btn = document.querySelector('[data-console-a11y-menu], [aria-label="Accessibility options"]');
    if (!btn) return false;
    btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    return true;
  });
  await new Promise((r) => setTimeout(r, 400));

  results.menuOpen = menuOpened
    ? await page.evaluate(() => {
        const menu = document.querySelector('[data-console-a11y-panel], [role="menu"]');
        return {
          open: Boolean(menu),
          text: (menu?.textContent || '').slice(0, 300),
        };
      })
    : { open: false, text: '' };

  // 5 Font size
  if (!results.menuOpen.open) {
    await page.click('[data-console-a11y-menu]');
    await new Promise((r) => setTimeout(r, 400));
    results.menuOpen = await page.evaluate(() => {
      const menu = document.querySelector('[data-console-a11y-panel], [role="menu"]');
      return { open: Boolean(menu), text: (menu?.textContent || '').slice(0, 300) };
    });
  }
  if (results.menuOpen.open) {
    await page.evaluate(() => {
      const btns = [...document.querySelectorAll('[role="menuitemradio"]')];
      const large = btns.find(
        (b) =>
          /Large|كبير/i.test(b.textContent || '') &&
          !/Extra|جدا|Extra large|كبير جدا/i.test(b.textContent || ''),
      );
      large?.click();
    });
    await new Promise((r) => setTimeout(r, 200));
  }
  results.font = await page.evaluate(() => ({
    scale: getComputedStyle(document.documentElement).getPropertyValue('--font-scale').trim(),
    dataset: document.documentElement.dataset.consoleFont || null,
  }));

  // Reopen menu if needed
  await page.evaluate(() => {
    const btn = document.querySelector('[aria-label="Accessibility options"]');
    const menu = document.querySelector('[role="menu"]');
    if (!menu) btn?.click();
  });
  await new Promise((r) => setTimeout(r, 200));

  // 6 Reader font
  await page.evaluate(() => {
    const items = [...document.querySelectorAll('[role="menuitemcheckbox"]')];
    const reader = items.find((b) => /Reader|مريح|قراءة/i.test(b.textContent || ''));
    if (reader && reader.getAttribute('aria-checked') !== 'true') reader.click();
  });
  await new Promise((r) => setTimeout(r, 200));
  results.reader = await page.evaluate(() => ({
    dataset: document.documentElement.dataset.consoleReader,
    letterSpacing: getComputedStyle(document.querySelector('.mq-console')).letterSpacing,
    lineHeight: getComputedStyle(document.querySelector('.mq-console')).lineHeight,
  }));

  // 7 Reduce motion
  await page.evaluate(() => {
    const btn = document.querySelector('[aria-label="Accessibility options"]');
    if (!document.querySelector('[role="menu"]')) btn?.click();
  });
  await new Promise((r) => setTimeout(r, 150));
  await page.evaluate(() => {
    const items = [...document.querySelectorAll('[role="menuitemcheckbox"]')];
    const motion = items.find((b) => /Reduce motion|تقليل الحركة/i.test(b.textContent || ''));
    if (motion && motion.getAttribute('aria-checked') !== 'true') motion.click();
  });
  await new Promise((r) => setTimeout(r, 150));
  results.motion = await page.evaluate(() => ({
    dataset: document.documentElement.dataset.consoleReduceMotion,
    prefs: localStorage.getItem('mq-console-a11y:v1'),
  }));

  // 8 Simple mode
  await page.evaluate(() => {
    const btn = document.querySelector('[aria-label="Accessibility options"]');
    if (!document.querySelector('[role="menu"]')) btn?.click();
  });
  await new Promise((r) => setTimeout(r, 150));
  await page.evaluate(() => {
    const items = [...document.querySelectorAll('[role="menuitemcheckbox"]')];
    const simple = items.find((b) => /Simple mode|الوضع البسيط/i.test(b.textContent || ''));
    if (simple && simple.getAttribute('aria-checked') !== 'true') simple.click();
  });
  await new Promise((r) => setTimeout(r, 300));
  results.simple = await page.evaluate(() => {
    const navText = [...document.querySelectorAll('nav a, nav span')]
      .map((n) => n.textContent || '')
      .join(' | ');
    return {
      dataset: document.documentElement.dataset.consoleSimple,
      hasDevelopers: /Developers|المطو/i.test(navText),
      hasAnalytics: /Analytics|تحليلات/i.test(navText),
      hasPipeline: /Pipeline|مسار/i.test(navText),
      hasJobs: /Jobs|وظائف/i.test(navText),
      navText: navText.slice(0, 400),
    };
  });

  // 9 Contrast/touch
  results.touch = await page.evaluate(() => {
    const btn = document.querySelector('[data-console-a11y-menu]');
    const r = btn?.getBoundingClientRect();
    return r ? { w: Math.round(r.width), h: Math.round(r.height) } : null;
  });
  await page.setViewport({ width: 375, height: 812 });
  await new Promise((r) => setTimeout(r, 400));
  results.touchMobile = await page.evaluate(() => {
    const btn = document.querySelector('[data-console-a11y-menu]');
    const r = btn?.getBoundingClientRect();
    return r && r.width > 0
      ? { w: Math.round(r.width), h: Math.round(r.height) }
      : null;
  });

  // 10 RTL
  await page.setViewport({ width: 1400, height: 900 });
  await page.goto(AR, { waitUntil: 'networkidle2', timeout: 60000 });
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload({ waitUntil: 'networkidle2', timeout: 60000 });
  await dismissOverlays(page);
  results.rtl = await page.evaluate(() => {
    const root = document.querySelector('[dir="rtl"]');
    const a11y = document.querySelector('[aria-label="خيارات الوصول"]');
    a11y?.click();
    const menu = document.querySelector('[role="menu"]');
    const body = document.body.innerText;
    return {
      dirRtl: Boolean(root),
      a11yBtn: Boolean(a11y),
      menuText: (menu?.textContent || '').slice(0, 200),
      hasArabicBadges: /قوي|متوسط|منخفض/.test(body),
    };
  });

  results.consoleErrors = consoleErrors.slice(0, 20);

  // Verdict helpers
  const verdict = {
    '1_keyboard':
      results.hasA11yBtn && results.keyboard.shortcutsOpen && results.keyboard.shortcutsClosed && results.keyboard.focusCss
        ? 'PASS'
        : 'FAIL',
    '2_aria':
      results.aria.navLabel && results.aria.ariaCurrent && results.aria.live
        ? 'PASS'
        : 'FAIL',
    '3_badges':
      results.badges.hasStrong || results.badges.hasAverage || results.badges.hasLow
        ? 'PASS'
        : 'FAIL',
    '4_pipeline': results.pipeline.hasStageMarker ? 'PASS' : 'FAIL',
    '5_font': Number(results.font.scale) >= 1.1 || results.font.dataset === 'large' || results.font.dataset === 'xl'
      ? 'PASS'
      : 'FAIL',
    '6_reader': results.reader.dataset === '1' ? 'PASS' : 'FAIL',
    '7_motion': results.motion.dataset === '1' ? 'PASS' : 'FAIL',
    '8_simple':
      results.simple.dataset === '1' &&
      !results.simple.hasDevelopers &&
      !results.simple.hasAnalytics &&
      results.simple.hasPipeline
        ? 'PASS'
        : 'FAIL',
    '9_touch':
      results.touch &&
      results.touchMobile &&
      results.touch.w >= 32 &&
      results.touchMobile.w >= 40
        ? 'PASS'
        : 'FAIL',
    '10_rtl': results.rtl.dirRtl && results.rtl.a11yBtn ? 'PASS' : 'FAIL',
  };

  console.log(JSON.stringify({ verdict, results }, null, 2));
  await browser.close();

  const fails = Object.values(verdict).filter((v) => v === 'FAIL').length;
  process.exit(fails ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
