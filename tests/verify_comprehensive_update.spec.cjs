const { test, expect } = require('@playwright/test');

test('Verify Comprehensive Toolbox Update (24 Hubs)', async ({ page }) => {
  await page.goto('http://localhost:5173/?tab=toolbox');

  const hubIds = [
    'web-main', 'network-main', 'ai-main', 'dev-main', 'doc-main', 'pdf-main',
    'image-main', 'gif-main', 'color-main', 'audio-main', 'data-main',
    'finance-main', 'unit-main', 'time-main', 'health-main', 'edu-main',
    'device-main', 'privacy-main', 'game-main', 'text-main', 'weather-main',
    'travel-main', 'video-main'
  ];

  for (const id of hubIds) {
    await expect(page.locator(`#card-${id}`)).toBeVisible();
  }

  // Verify GIF Hub (New)
  await page.locator('#card-gif-main').click();
  await expect(page.locator('button.pill:has-text("Video to GIF")')).toBeVisible();
  await expect(page.locator('button.pill:has-text("Text to GIF")')).toBeVisible();

  // Go back
  await page.locator('div.breadcrumb-item:has-text("Toolbox")').click();

  // Verify Games Hub (Placeholders replaced)
  await page.locator('#card-game-main').click();
  await expect(page.locator('button.pill:has-text("Sudoku")')).toBeVisible();
  await expect(page.locator('button.pill:has-text("Tetris")')).toBeVisible();

  // Go back
  await page.locator('div.breadcrumb-item:has-text("Toolbox")').click();

  // Verify Search direct indexing
  await page.fill('#search', 'Sudoku');
  await expect(page.locator('button.pill:has-text("sudoku")')).toBeVisible();
});
