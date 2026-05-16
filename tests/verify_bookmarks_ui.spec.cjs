const { test, expect } = require('@playwright/test');

test('Verify Bookmark Card Changes', async ({ page }) => {
  await page.goto('http://localhost:5173/?tab=bookmarks');

  // Wait for data to load
  await page.waitForSelector('.card');

  // Find exactly the YouTube card
  const multiUrlCard = page.locator('.card:has-text("YouTube")').first();
  await expect(multiUrlCard).toBeVisible();

  // Verify badge is at top right
  const badge = multiUrlCard.locator('.fallback-badge.card-badge-top');
  await expect(badge).toBeVisible();

  // Verify actions are at top right (using CSS check)
  const actions = multiUrlCard.locator('.card-actions');
  const topValue = await actions.evaluate(el => window.getComputedStyle(el).top);
  expect(topValue).toBe('10px');

  // Perform long press (simulated)
  // Playwright's click with delay can simulate long press
  await multiUrlCard.click({ delay: 600 });

  // Verify modal is open
  const modal = page.locator('.modal.modal-multi-url');
  await expect(modal).toBeVisible();

  // Verify modal is displayed
  const style = await modal.getAttribute('style');
  expect(style).toContain('display: block');
});
