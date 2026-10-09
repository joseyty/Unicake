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

test('registers a traditional account and validates its password at login', async ({ page }) => {
  await page.goto('http://127.0.0.1:8000/html/Entrar.html');
  await page.evaluate(() => localStorage.clear());

  await page.getByRole('link', { name: /cadastre-se/i }).click();
  await page.locator('[name="name"]').fill('Maria Silva');
  await page.locator('[name="email"]').fill('maria@example.com');
  await page.locator('[name="password"]').fill('DoceSenha123');
  await page.locator('[name="passwordConfirmation"]').fill('DoceSenha123');
  await page.getByRole('button', { name: 'Criar conta' }).click();

  await expect(page.locator('#loginStatus')).toContainText('Conta criada');
  const registration = await page.evaluate(() => {
    const [account] = JSON.parse(localStorage.getItem('unicake.users'));
    localStorage.removeItem('unicake.auth');
    return {
      passwordStoredInPlainText: account.password === 'DoceSenha123',
      hasPasswordHash: Boolean(account.passwordHash),
    };
  });
  expect(registration).toEqual({ passwordStoredInPlainText: false, hasPasswordHash: true });

  const rejected = await page.evaluate(async () =>
    window.UniCakeAuth.handleTraditionalLogin('MARIA@example.com', 'senha-incorreta')
  );
  expect(rejected).toBeNull();

  const authenticated = await page.evaluate(async () =>
    window.UniCakeAuth.handleTraditionalLogin('maria@example.com', 'DoceSenha123')
  );
  expect(authenticated).toMatchObject({ name: 'Maria Silva', provider: 'traditional' });
});
