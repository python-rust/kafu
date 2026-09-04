import { chromium } from '@playwright/test';

const browser = await chromium.launch({ headless: true });
const cases = [
  ['baseline', ''],
  ['scroll-auto', 'html { scroll-behavior: auto !important; }'],
  ['section-no-anchor', '#visuals { overflow-anchor: none !important; }'],
  [
    'backdrop-no-anchor',
    '#visuals [data-testid="gallery-backdrop"] { overflow-anchor: none !important; }',
  ],
  [
    'backdrop-child-no-anchor',
    '#visuals [data-testid="gallery-backdrop"] > * { overflow-anchor: none !important; }',
  ],
  [
    'stage-no-anchor',
    '#visuals button[aria-label$="点击放大"] { overflow-anchor: none !important; }',
  ],
  [
    'stage-child-no-anchor',
    '#visuals button[aria-label$="点击放大"] > * { overflow-anchor: none !important; }',
  ],
  ['title-no-anchor', '#visuals h3 { overflow-anchor: none !important; }'],
  [
    'meta-no-anchor',
    '#visuals h3, #visuals h3 * { overflow-anchor: none !important; }',
  ],
  [
    'animated-nodes-no-anchor',
    '#visuals [data-testid="gallery-backdrop"], #visuals button[aria-label$="点击放大"], #visuals h3 { overflow-anchor: none !important; }',
  ],
  [
    'rail-no-anchor',
    '#visuals [aria-label="选择图片"] { overflow-anchor: none !important; }',
  ],
  ['all-gallery-no-anchor', '#visuals, #visuals * { overflow-anchor: none !important; }'],
  [
    'no-snap',
    '#visuals [aria-label="选择图片"] { scroll-snap-type: none !important; }',
  ],
  [
    'zero-css-motion',
    '#visuals, #visuals * { animation-duration: 0s !important; transition-duration: 0s !important; }',
  ],
];

async function runCase(viewport, name, css, reducedMotion = 'no-preference') {
  const page = await browser.newPage({ viewport, reducedMotion });
  await page.goto('https://kafu-8bd.pages.dev/', { waitUntil: 'networkidle' });

  if (css) {
    await page.addStyleTag({ content: css });
  }

  const gallery = page.locator('#visuals');
  const rail = gallery.getByRole('list', { name: '选择图片' });
  await rail.evaluate((list) => {
    const rect = list.getBoundingClientRect();
    const absoluteTop = rect.top + window.scrollY;
    window.scrollTo({
      top: absoluteTop - (window.innerHeight - rect.height) / 2,
      behavior: 'instant',
    });
    list.scrollLeft = 0;
  });
  await page.waitForTimeout(100);

  const button = rail.getByRole('button', {
    name: '忘れてしまえ，显示此图',
  });
  const point = await button.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2;

    for (
      let y = Math.max(1, rect.top + 4);
      y < Math.min(window.innerHeight - 1, rect.bottom);
      y += 4
    ) {
      const hit = document.elementFromPoint(x, y);
      if (hit === element || (hit && element.contains(hit))) {
        return { x, y };
      }
    }

    return null;
  });

  if (!point) {
    throw new Error(`${name}: thumbnail is not visible`);
  }

  const before = await page.evaluate(() => ({
    y: window.scrollY,
    sectionTop: document.querySelector('#visuals')?.getBoundingClientRect().top,
  }));
  await page.mouse.click(point.x, point.y);
  await page.waitForTimeout(750);
  const after = await page.evaluate(() => ({
    y: window.scrollY,
    sectionTop: document.querySelector('#visuals')?.getBoundingClientRect().top,
    active: document.activeElement?.getAttribute('aria-label'),
  }));

  await page.close();
  return {
    viewport,
    name,
    reducedMotion,
    before,
    after,
    delta: after.y - before.y,
  };
}

const results = [];

for (const viewport of [{ width: 390, height: 844 }]) {
  for (const [name, css] of cases) {
    results.push(await runCase(viewport, name, css));
  }

  results.push(await runCase(viewport, 'reduced-motion', '', 'reduce'));
}

console.log(JSON.stringify(results, null, 2));
await browser.close();
