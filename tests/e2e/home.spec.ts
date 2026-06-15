import { test, expect } from '@playwright/test';

test('home muestra el nombre del showroom', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /showroom/i })).toBeVisible();
});
