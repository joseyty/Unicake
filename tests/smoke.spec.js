import { test, expect } from '@playwright/test';

test('homepage exposes clear navigation and quick actions', async ({ page }) => {
  await page.goto('http://127.0.0.1:8000/html/index.html');

  await expect(page.locator('main#conteudo')).toBeVisible();
  await expect(page.locator('a.skip-link')).toHaveCount(1);
  await expect(page.getByPlaceholder('Busque por item ou loja')).toBeVisible();

  await page.evaluate(() => window.scrollTo(0, 1200));
  await expect(page.locator('.back-to-top')).toBeVisible();

  await page.locator('.hero-actions a').first().click();
  await expect(page).toHaveURL(/ParaVoce\.html/);
});
