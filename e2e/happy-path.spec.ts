import { expect, test } from '@playwright/test';

test('setup is visible, calling warms the sunrise, and you rise', async ({ page }) => {
  await page.clock.install();
  await page.goto('/');

  // The setup screen is actually visible (guard against the opacity-freeze).
  const heading = page.getByRole('heading', { name: 'Rise' });
  await expect(heading).toBeVisible();
  await expect(heading).toHaveCSS('opacity', '1');

  // Call me now → calling. The caller starts shortly after; advance the clock.
  await page.getByRole('button', { name: /Call me now/ }).click();
  await page.clock.runFor(1000);
  const sun = page.locator('.ri-sun');
  await expect(sun).toBeVisible();
  const firstOpacity = await sun.evaluate((el) => Number(getComputedStyle(el).opacity));

  // More calls warm the sunrise further (the sun brightens).
  await page.clock.runFor(20000);
  const laterOpacity = await sun.evaluate((el) => Number(getComputedStyle(el).opacity));
  expect(laterOpacity).toBeGreaterThanOrEqual(firstOpacity);

  // Hold to get up (the hold completes as the clock advances past ~1.3s).
  await page.getByRole('button', { name: 'Hold to get up' }).dispatchEvent('mousedown');
  await page.clock.runFor(1500);
  await expect(page.getByRole('heading', { name: /You.?re up/ })).toBeVisible();
});

test('rest, then call shows a countdown', async ({ page }) => {
  await page.clock.install();
  await page.goto('/');
  await page.getByRole('button', { name: /Rest, then call/ }).click();
  await expect(page.getByText('15:00')).toBeVisible();
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByRole('heading', { name: 'Rise' })).toBeVisible();
});

test('the times-risen stat persists across a reload', async ({ page }) => {
  await page.clock.install();
  await page.goto('/');
  await page.getByRole('button', { name: /Call me now/ }).click();
  await page.getByRole('button', { name: 'Hold to get up' }).dispatchEvent('mousedown');
  await page.clock.runFor(1500);
  await page.getByRole('button', { name: 'Done' }).click();

  await expect(page.getByText(/risen with me/)).toBeVisible();
  await page.reload();
  await expect(page.getByText(/risen with me/)).toBeVisible();
});
