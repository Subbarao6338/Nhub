const { test, expect } = require('@playwright/test');

test('Verify CSS classes and UI layout', async ({ page }) => {
  await page.goto('http://localhost:5173/?tab=toolbox');

  // Check for category-grid
  const categoryGrid = page.locator('.category-grid').first();
  await expect(categoryGrid).toBeVisible();

  // Check for toolbox-page-header
  const header = page.locator('.toolbox-page-header');
  await expect(header).toBeVisible();
  await expect(header.locator('h2')).toContainText('Nature Hub');

  // Check for card-actions (hover to make visible)
  const card = page.locator('.card').first();
  await card.hover();
  const cardActions = card.locator('.card-actions');
  await expect(cardActions).toBeVisible();

  // Open a tool and check breadcrumbs
  await card.click();
  const breadcrumb = page.locator('.breadcrumb-nav');
  await expect(breadcrumb).toBeVisible();
  await expect(breadcrumb.locator('.breadcrumb-item.active')).toBeVisible();

  // Check for tool-result
  // For Dev Hub -> JSON Formatter
  if (await page.locator('.pill', { hasText: 'JSON Formatter' }).isVisible()) {
      await page.locator('textarea').fill('{"test": true}');
      const result = page.locator('.tool-result');
      // Some tools might use <pre> inside card, let's be flexible
      // In DevTools.jsx, JsonFormatter doesn't use .tool-result yet, but the parent ToolboxView might show it if currentResult.text is set
      // Actually, ToolboxView shows .tool-view-header with copy/download buttons
      await expect(page.locator('.icon-btn[title="Copy Result"]')).toBeVisible();
  }

  // Check responsive grid (simulated)
  const gridStyle = await categoryGrid.evaluate(el => window.getComputedStyle(el).display);
  expect(gridStyle).toBe('grid');
});
