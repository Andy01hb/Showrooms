import { test, expect } from '@playwright/test';

test('sin sesión, /dashboard redirige a /login', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login$/);
});

test('con credenciales válidas se entra al dashboard y se ve el rol', async ({ page }) => {
  // Usuario sembrado por el setup de tests (ver tests/e2e/seed.ts)
  await page.goto('/login');
  await page.getByLabel('email').fill(process.env.E2E_USER_EMAIL!);
  await page.getByLabel('password').fill(process.env.E2E_USER_PASSWORD!);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByText(/Rol: cliente/)).toBeVisible();
});
