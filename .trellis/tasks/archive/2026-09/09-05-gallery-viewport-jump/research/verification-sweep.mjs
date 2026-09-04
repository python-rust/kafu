import { chromium } from '@playwright/test';

const baseUrl = process.env.GALLERY_URL ?? 'http://127.0.0.1:4173/';
const browser = await chromium.launch({ headless: true });
const viewports = [
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
];
const titles = [
  '花譜ちゃん',
  '忘れてしまえ',
  '不可解',
  '糸',
  '過去を喰らう',
  '景色',
  'チューイン・ディスコ',
  'ユーフォーを見にいこう',
];
const results = [];

for (const viewport of viewports) {
  const page = await browser.newPage({ viewport });
  await page.goto(baseUrl, { waitUntil: 'networkidle' });

  const gallery = page.locator('#visuals');
  const rail = gallery.getByRole('list', { name: '选择图片' });
  const overflowAnchor = await gallery
    .getByTestId('gallery-backdrop')
    .evaluate((element) => getComputedStyle(element).overflowAnchor);

  if (overflowAnchor !== 'none') {
    throw new Error(`Backdrop overflow-anchor is ${overflowAnchor}.`);
  }

  await rail.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    window.scrollTo({
      top:
        rect.top +
        window.scrollY -
        (window.innerHeight - rect.height) / 2,
      behavior: 'instant',
    });
  });

  const initialScrollY = await page.evaluate(() => window.scrollY);

  for (const title of titles) {
    const button = rail.getByRole('button', {
      name: `${title}，显示此图`,
    });
    const clickPoint = await button.evaluate((element) => {
      const list = element.closest('[aria-label="选择图片"]');

      if (!(list instanceof HTMLElement)) {
        return null;
      }

      const listRect = list.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      list.scrollTo({
        left:
          list.scrollLeft +
          elementRect.left -
          listRect.left -
          (listRect.width - elementRect.width) / 2,
        behavior: 'instant',
      });

      const rect = element.getBoundingClientRect();
      const x = Math.round(rect.left + rect.width / 2);
      const y = Math.round(rect.top + Math.min(16, rect.height / 2));
      const hit = document.elementFromPoint(x, y);

      return hit === element || (hit && element.contains(hit)) ? { x, y } : null;
    });

    if (!clickPoint) {
      throw new Error(`${viewport.width}x${viewport.height}: ${title} not hit-testable.`);
    }

    await page.mouse.click(clickPoint.x, clickPoint.y);
    await page.waitForTimeout(550);
    const currentScrollY = await page.evaluate(() => window.scrollY);

    if (currentScrollY !== initialScrollY) {
      throw new Error(
        `${viewport.width}x${viewport.height}: ${title} moved scrollY ` +
          `${initialScrollY} -> ${currentScrollY}.`,
      );
    }
  }

  results.push({ viewport, initialScrollY, selections: titles.length });
  await page.close();
}

console.log(JSON.stringify({ baseUrl, results }, null, 2));
await browser.close();
