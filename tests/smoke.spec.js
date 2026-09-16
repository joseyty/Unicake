import { test, expect } from '@playwright/test';

test('homepage exposes clear navigation and quick actions', async ({ page }) => {
  await page.goto('http://127.0.0.1:8000/html/index.html');

  await expect(page.locator('main#conteudo')).toBeVisible();
  await expect(page.locator('a.skip-link')).toHaveCount(1);
  await expect(page.getByPlaceholder('Busque por item ou loja')).toBeVisible();

  await page.locator('.hero-actions a').first().click();
  await expect(page).toHaveURL(/ParaVoce\.html/);
});

test('applies a saved coupon regardless of letter case and updates total', async ({ page }) => {
  await page.goto('http://127.0.0.1:8000/html/index.html');

  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('unicake.cart', JSON.stringify([{ id: 'bolo-chocolate', qty: 1 }]));
    localStorage.setItem('unicake.coupon', 'unicake10');
    window.UniCakeCart?.sync();
  });

  await expect(page.locator('[data-coupon-feedback]')).toContainText(/Cupom aplicado/i);
  await expect(page.locator('[data-cart-total]')).toContainText(/R\$\s*67,0?1|R\$\s*67,0?0/);
});
