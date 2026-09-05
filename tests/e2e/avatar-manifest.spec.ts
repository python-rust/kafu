import { expect, test } from '@playwright/test';

import { kafAvatarAsset } from '../../src/content/kafAvatar';

test.use({ contextOptions: { reducedMotion: 'reduce' } });

test('manifest is a lazy, accessible disclosure that preserves page position', async ({
  page,
}) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/');
  expect(
    requests.some((url) => /KafAvatarManifestDialog.*\.js/.test(url)),
  ).toBe(false);
  const trigger = page.getByRole('button', { name: '查看模型清单' });
  await trigger.evaluate((element) =>
    element.scrollIntoView({ block: 'center' }),
  );
  const scrollY = await page.evaluate(() => window.scrollY);
  const url = page.url();
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: '模型清单' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText(kafAvatarAsset.sha256)).toBeVisible();
  await expect(
    dialog.getByText(kafAvatarAsset.permissionSummary),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: '关闭', exact: true }),
  ).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(
    dialog.getByRole('link', { name: '下载 VRM 模型' }),
  ).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(
    dialog.getByRole('button', { name: '关闭', exact: true }),
  ).toBeFocused();
  await page.mouse.wheel(0, 500);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(scrollY);
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  expect(page.url()).toBe(url);
  expect(await page.evaluate(() => window.scrollY)).toBe(scrollY);
  expect(requests.some((request) => /\.vrm(?:$|\?)/.test(request))).toBe(false);
  await trigger.click();
  await dialog.getByRole('button', { name: '关闭', exact: true }).click();
  await expect(trigger).toBeFocused();
  expect(await page.evaluate(() => window.scrollY)).toBe(scrollY);
});

for (const largeText of [false, true]) {
  test(`manifest fits a narrow viewport${largeText ? ' with 200% text' : ''}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/');
    if (largeText)
      await page.addStyleTag({ content: 'html { font-size: 200%; }' });
    await page.getByRole('button', { name: '查看模型清单' }).click();
    const dialog = page.getByRole('dialog', { name: '模型清单' });
    await expect(dialog).toBeVisible();
    const overflow = await dialog.evaluate((element) => ({
      width: element.clientWidth,
      scrollWidth: element.scrollWidth,
      children: Array.from(
        element.querySelectorAll('dt, dd, h2, p, a, button'),
      ).map((child) => ({
        left: child.getBoundingClientRect().left,
        right: child.getBoundingClientRect().right,
      })),
    }));
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.width);
    for (const child of overflow.children) {
      expect(child.left).toBeGreaterThanOrEqual(0);
      expect(child.right).toBeLessThanOrEqual(320);
    }
    await dialog
      .getByRole('link', { name: '下载 VRM 模型' })
      .scrollIntoViewIfNeeded();
    await expect(
      dialog.getByRole('link', { name: '下载 VRM 模型' }),
    ).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
  });
}
