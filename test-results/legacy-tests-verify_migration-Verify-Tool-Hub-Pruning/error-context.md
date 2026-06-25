# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: legacy/tests/verify_migration.spec.cjs >> Verify Tool Hub Pruning
- Location: legacy/tests/verify_migration.spec.cjs:3:1

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
  3  | test('Verify Tool Hub Pruning', async ({ page }) => {
  4  |   await page.goto('http://localhost:5173/?tab=toolbox');
  5  |
  6  |   // Allowed Hub IDs
  7  |   const allowedHubs = [
  8  |     'web-main',
  9  |     'network-main',
  10 |     'ai-main',
  11 |     'dev-main',
  12 |     'doc-main',
  13 |     'data-main',
  14 |     'time-main'
  15 |   ];
  16 |
  17 |   // Removed Hub IDs (samples)
  18 |   const removedHubs = [
  19 |     'pdf-main',
  20 |     'image-main',
  21 |     'color-main',
  22 |     'audio-main',
  23 |     'finance-main',
  24 |     'unit-main',
  25 |     'health-main',
  26 |     'edu-main',
  27 |     'device-main',
  28 |     'privacy-main',
  29 |     'game-main'
  30 |   ];
  31 |
  32 |   // Check allowed hubs are visible
  33 |   for (const id of allowedHubs) {
> 34 |     await expect(page.locator(`#card-${id}`)).toBeVisible();
     |                                               ^ Error: expect(locator).toBeVisible() failed
  35 |   }
  36 |
  37 |   // Check removed hubs are not present
  38 |   for (const id of removedHubs) {
  39 |     await expect(page.locator(`#card-${id}`)).not.toBeVisible();
  40 |   }
  41 |
  42 |   // Verify Network Hub sub-tools (Stability Check)
  43 |   await page.locator('#card-network-main').click();
  44 |   await page.waitForSelector('.pill');
  45 |   await expect(page.locator('button.pill:has-text("IP Info")')).toBeVisible();
  46 |   await expect(page.locator('button.pill:has-text("Ping")')).toBeVisible();
  47 |
  48 |   // Go back to Toolbox
  49 |   await page.locator('div.breadcrumb-item').filter({ hasText: 'Toolbox' }).first().click();
  50 |
  51 |   // Verify AI Hub sub-tools (Stability Check)
  52 |   await page.locator('#card-ai-main').click();
  53 |   await page.waitForSelector('.pill');
  54 |   await expect(page.locator('button.pill:has-text("Image Gen")')).toBeVisible();
  55 |   await expect(page.locator('button.pill:has-text("Chat")')).toBeVisible();
  56 | });
  57 |
```