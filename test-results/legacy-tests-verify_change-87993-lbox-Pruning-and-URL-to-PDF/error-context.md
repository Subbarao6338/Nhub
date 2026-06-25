# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: legacy/tests/verify_changes.spec.cjs >> Verify Toolbox Pruning and URL to PDF
- Location: legacy/tests/verify_changes.spec.cjs:3:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('#card-web-main')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('#card-web-main')

```

# Test source

```ts
  1  | const { test, expect } = require('@playwright/test');
  2  |
  3  | test('Verify Toolbox Pruning and URL to PDF', async ({ page }) => {
  4  |   await page.goto('http://localhost:5173/?tab=toolbox');
  5  |
  6  |   // Check that only approved hubs are present
  7  |   // approved: Web & Social Tools, Network Hub, Markdown Tools, Data Science
> 8  |   await expect(page.locator('#card-web-main')).toBeVisible();
     |                                                ^ Error: expect(locator).toBeVisible() failed
  9  |   await expect(page.locator('#card-network-main')).toBeVisible();
  10 |   await expect(page.locator('#card-doc-main')).toBeVisible();
  11 |   await expect(page.locator('#card-data-main')).toBeVisible();
  12 |
  13 |   // Check that some pruned hubs are gone
  14 |   await expect(page.locator('#card-pdf-main')).not.toBeVisible();
  15 |   await expect(page.locator('#card-img-main')).not.toBeVisible();
  16 |   await expect(page.locator('#card-audio-main')).not.toBeVisible();
  17 |
  18 |   // Test URL to PDF in Web Hub
  19 |   await page.locator('#card-web-main').click();
  20 |   const urlToPdfPill = page.locator('button.pill:has-text("URL to PDF")');
  21 |   await expect(urlToPdfPill).toBeVisible();
  22 |   await urlToPdfPill.click();
  23 |
  24 |   await expect(page.locator('input[placeholder="Enter Web URL..."]')).toBeVisible();
  25 |   await expect(page.locator('button:has-text("Convert URL to PDF")')).toBeVisible();
  26 |
  27 |   // Check header title logic
  28 |   await expect(page.locator('h1.page-title')).toHaveText('Epic Toolbox');
  29 |
  30 |   await page.goto('http://localhost:5173/?tab=bookmarks');
  31 |   await expect(page.locator('h1.page-title')).toHaveText('Epic Toolbox');
  32 | });
  33 |
```