import { chromium, firefox, webkit } from '@playwright/test';

const engineName = process.env.BROWSER_ENGINE ?? 'chromium';
const baseUrl = process.env.GALLERY_URL ?? 'http://127.0.0.1:4173/';
const engines = { chromium, firefox, webkit };
const engine = engines[engineName];

if (!engine) {
  throw new Error(`Unsupported browser engine: ${engineName}`);
}
const browser = await engine.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

await page.goto(baseUrl, { waitUntil: 'networkidle' });

const gallery = page.locator('#visuals');
const rail = gallery.getByRole('list', { name: '选择图片' });
await rail.evaluate((element) => {
  const rect = element.getBoundingClientRect();
  window.scrollTo({
    top:
      rect.top +
      window.scrollY -
      (window.innerHeight - rect.height) / 2,
    behavior: 'instant',
  });
  element.scrollLeft = 0;
});

const backdropStyle = await gallery
  .getByTestId('gallery-backdrop')
  .evaluate((element) => ({
    overflowAnchor: getComputedStyle(element).getPropertyValue('overflow-anchor'),
    supports: CSS.supports('overflow-anchor', 'none'),
  }));
const initialScrollY = await page.evaluate(() => window.scrollY);
const deltas = [];
const probeTitles =
  engineName === 'chromium'
    ? ['忘れてしまえ', 'ユーフォーを見にいこう']
    : ['忘れてしまえ'];

for (const title of probeTitles) {
  const button = rail.getByRole('button', {
    name: `${title}，显示此图`,
  });
  await button.evaluate((element) => {
    const list = element.closest('[aria-label="选择图片"]');

    if (!(list instanceof HTMLElement)) {
      throw new Error('Gallery thumbnail rail is missing.');
    }

    const listRect = list.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    list.scrollLeft =
      element.parentElement === list.lastElementChild
        ? list.scrollWidth
        : list.scrollLeft +
          elementRect.left -
          listRect.left -
          (listRect.width - elementRect.width) / 2;
  });
  await page.waitForTimeout(100);

  const clickPoint = await button.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const x = Math.round(rect.left + rect.width / 2);
    const y = Math.round(rect.top + Math.min(16, rect.height / 2));
    const hit = document.elementFromPoint(x, y);

    return hit === element || (hit && element.contains(hit)) ? { x, y } : null;
  });

  if (!clickPoint) {
    throw new Error(`${engineName}: ${title} is not hit-testable.`);
  }

  const before = await page.evaluate(() => window.scrollY);
  await page.mouse.click(clickPoint.x, clickPoint.y);
  await page.waitForTimeout(600);
  const after = await page.evaluate(() => window.scrollY);
  deltas.push({ title, before, after, delta: after - before });
}

console.log(
  JSON.stringify(
    {
      engineName,
      baseUrl,
      backdropStyle,
      initialScrollY,
      deltas,
    },
    null,
    2,
  ),
);

await browser.close();
