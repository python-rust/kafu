import { expect, test } from '@playwright/test';

test('home stage is visible and the development puppet reacts', async ({
  page,
}) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: /花譜/ })).toBeVisible();

  const puppet = page.getByRole('button', {
    name: '与开发中的花谱 2D 角色互动',
  });

  await expect(puppet).toBeVisible();
  await puppet.click();
  await expect(page.getByText('01 SIGNALS')).toBeVisible();
});
