import { expect, test } from '@playwright/test';

test('home page presents the KAF Observatory identity', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: /花譜/ })).toBeVisible();
  await expect(page.getByText('UNOFFICIAL FAN PROJECT · 2026')).toBeVisible();
  await expect(
    page.getByText(
      '一个正在形成中的数字观测站。音乐、时间与视觉将逐层进入这个空间。',
    ),
  ).toBeVisible();
});
