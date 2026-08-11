import puppeteer from 'puppeteer-core';

const EN =
  'https://muqabaleh-com-git-cursor-console-a11-24b740-samjo4500s-projects.vercel.app/en/console/najm-tech';

const browser = await puppeteer.launch({
  executablePath: '/usr/local/bin/google-chrome',
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
  defaultViewport: { width: 1400, height: 900 },
});
const page = await browser.newPage();
await page.goto(EN, { waitUntil: 'networkidle2', timeout: 60000 });
await page.evaluate(() => {
  localStorage.clear();
  sessionStorage.clear();
});
await page.reload({ waitUntil: 'networkidle2' });
await new Promise((r) => setTimeout(r, 1000));
await page.evaluate(() => {
  [...document.querySelectorAll('button')].find((b) =>
    /enter|دخول/i.test(`${b.textContent} ${b.getAttribute('aria-label') || ''}`),
  )?.click();
});
await new Promise((r) => setTimeout(r, 2800));
await page.evaluate(() => {
  [...document.querySelectorAll('button')]
    .find((b) => /skip|تخطي/i.test(b.textContent || ''))
    ?.click();
});
await new Promise((r) => setTimeout(r, 800));

const before = await page.evaluate(() => ({
  href: location.href,
  lang: document.documentElement.lang,
  dir: document.querySelector('[dir]')?.getAttribute('dir'),
  btn: !!document.querySelector('[data-console-a11y-menu]'),
  aria: document.querySelector('[data-console-a11y-menu]')?.getAttribute('aria-label'),
  expanded: document.querySelector('[data-console-a11y-menu]')?.getAttribute('aria-expanded'),
}));
console.log('before', before);

await page.click('[data-console-a11y-menu]');
await new Promise((r) => setTimeout(r, 500));

const afterClick = await page.evaluate(() => ({
  expanded: document.querySelector('[data-console-a11y-menu]')?.getAttribute('aria-expanded'),
  panel: !!document.querySelector('[data-console-a11y-panel]'),
  menu: !!document.querySelector('[role="menu"]'),
  menus: [...document.querySelectorAll('[role="menu"]')].map((m) => m.textContent?.slice(0, 80)),
  topbarHtml: document.querySelector('header')?.innerHTML.slice(0, 500),
}));
console.log('afterClick', afterClick);

// Force open via React by setting localStorage and checking provider — instead click with puppeteer mouse
const box = await page.$('[data-console-a11y-menu]');
const bb = await box.boundingBox();
console.log('bbox', bb);
if (bb) {
  await page.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2);
  await new Promise((r) => setTimeout(r, 500));
}
const afterMouse = await page.evaluate(() => ({
  expanded: document.querySelector('[data-console-a11y-menu]')?.getAttribute('aria-expanded'),
  panel: !!document.querySelector('[data-console-a11y-panel]'),
  text: document.querySelector('[data-console-a11y-panel]')?.textContent?.slice(0, 200),
}));
console.log('afterMouse', afterMouse);

// Shortcuts via evaluate calling keydown on document
await page.evaluate(() => {
  document.body.focus();
  document.dispatchEvent(
    new KeyboardEvent('keydown', {
      key: '?',
      code: 'Slash',
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    }),
  );
});
await new Promise((r) => setTimeout(r, 500));
const shortcuts = await page.evaluate(() => ({
  modal: !!document.querySelector('[data-console-modal="true"]'),
  dialogs: [...document.querySelectorAll('[role="dialog"]')].map((d) =>
    (d.textContent || '').slice(0, 100),
  ),
}));
console.log('shortcuts', shortcuts);

await browser.close();
