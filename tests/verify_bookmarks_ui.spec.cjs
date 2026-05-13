const { test, expect } = require('@playwright/test');

test('Verify Bookmark Card Changes', async ({ page }) => {
  await page.goto('http://localhost:3001/?tab=bookmarks');

  // Wait for data to load
  await page.waitForSelector('.card');

  // Find exactly the YouTube card
  const multiUrlCard = page.locator('.card:has-text("YouTube")').first();
  await expect(multiUrlCard).toBeVisible();

  // Verify badge is at top right
  const badge = multiUrlCard.locator('.fallback-badge.card-badge-top');
  await expect(badge).toBeVisible();

  // Verify actions are at bottom right (using CSS check)
  const actions = multiUrlCard.locator('.card-actions');
  const bottomValue = await actions.evaluate(el => window.getComputedStyle(el).bottom);
  expect(bottomValue).toBe('10px');

  const topValue = await actions.evaluate(el => window.getComputedStyle(el).top);
  // On desktop it might have a top: auto, but let's check it's not 10px
  expect(topValue).not.toBe('10px');

  // Perform long press (simulated)
  // Playwright's click with delay can simulate long press
  await multiUrlCard.click({ delay: 600 });

  // Verify modal is open
  const modal = page.locator('.modal.modal-multi-url');
  await expect(modal).toBeVisible();

  // Verify modal has dynamic positioning (it should have top and left in style attribute)
  const style = await modal.getAttribute('style');
  expect(style).toContain('top:');
  expect(style).toContain('left:');
  expect(style).toContain('display: block');
});
