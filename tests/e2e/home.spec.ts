import { expect, test } from '@playwright/test';

test('desktop homepage presents the KAF editorial structure and anchor navigation', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');

  await expect(
    page.getByRole('heading', { level: 1, name: /花譜.*KAF/i }),
  ).toBeVisible();
  await expect(
    page.getByText('UNOFFICIAL FAN PROJECT · NON-COMMERCIAL'),
  ).toBeVisible();
  await expect(page.getByRole('img', { name: /粉色短发的花譜/ })).toBeVisible();

  await page.getByRole('link', { name: 'WORKS', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Selected Works' }),
  ).toBeInViewport();

  await expect(page.getByRole('heading', { name: '深愛' })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Visual Archive' }),
  ).toBeVisible();
});

test('mobile homepage remains usable without horizontal overflow', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const heroHeading = page.getByRole('heading', {
    level: 1,
    name: /花譜.*KAF/i,
  });
  const fanProjectLabel = page.getByText(
    'UNOFFICIAL FAN PROJECT · NON-COMMERCIAL',
  );

  await expect(heroHeading).toBeVisible();
  await expect(heroHeading).toBeInViewport();
  await expect(
    page.getByRole('img', { name: /粉色短发的花譜/ }),
  ).toBeInViewport();
  await expect(fanProjectLabel).toBeInViewport();

  const hasHorizontalOverflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth + 1,
  );
  expect(hasHorizontalOverflow).toBe(false);

  await page.getByRole('link', { name: 'VISUALS' }).click();
  await expect(
    page.getByRole('heading', { name: 'Visual Archive' }),
  ).toBeInViewport();
  await expect(
    page.getByRole('img', { name: /青绿色天空与城市风景/ }),
  ).toBeVisible();
});

test('target viewport matrix has no horizontal overflow', async ({ page }) => {
  const viewports = [
    { width: 360, height: 800 },
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1024, height: 768 },
    { width: 1440, height: 1000 },
  ];

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto('/');

    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));

    expect(
      dimensions.scrollWidth,
      `${viewport.width}px viewport`,
    ).toBeLessThanOrEqual(dimensions.clientWidth + 1);
  }
});

test('reduced-motion preference preserves content and navigation', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');

  await expect(
    page.getByRole('heading', { level: 1, name: /花譜.*KAF/i }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'LINKS' }).click();
  await expect(
    page.getByRole('heading', { name: 'Go to the source.' }),
  ).toBeVisible();
});
