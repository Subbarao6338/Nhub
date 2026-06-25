# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: legacy/tests/verify_panchangam_v2.spec.cjs >> verify Telugu Panchangam tool v2
- Location: legacy/tests/verify_panchangam_v2.spec.cjs:3:1

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3001/
Call log:
  - navigating to "http://localhost:3001/", waiting until "load"

```

# Test source

```ts
  1  | const { test, expect } = require('@playwright/test');
  2  |
  3  | test('verify Telugu Panchangam tool v2', async ({ page }) => {
> 4  |   await page.goto('http://localhost:3001');
     |              ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3001/
  5  |
  6  |   // Wait for the app to load
  7  |   await page.waitForSelector('.tools-container');
  8  |
  9  |   // Click on Date & Time hub
  10 |   await page.click('text=Date & Time');
  11 |
  12 |   // Click on Telugu Panchangam tab
  13 |   await page.click('button:has-text("Telugu Panchangam")');
  14 |
  15 |   // Verify inputs are present
  16 |   await expect(page.locator('input[type="date"]')).toBeVisible();
  17 |   await expect(page.locator('input[type="time"]')).toBeVisible();
  18 |   await expect(page.locator('select')).toBeVisible();
  19 |
  20 |   // Select custom location to see lat/lng inputs
  21 |   await page.selectOption('select', 'Custom');
  22 |   await expect(page.locator('input[type="number"]').first()).toBeVisible();
  23 |
  24 |   // Click Calculate Panchangam
  25 |   await page.click('button:has-text("Calculate Panchangam")');
  26 |
  27 |   // Verify results are displayed
  28 |   await expect(page.locator('text=Samvatsara')).toBeVisible();
  29 |   await expect(page.locator('text=Tithi')).toBeVisible();
  30 |   await expect(page.locator('text=Nakshatra')).toBeVisible();
  31 |   await expect(page.locator('text=Padam')).toBeVisible();
  32 |   await expect(page.locator('text=Lucky Color')).toBeVisible();
  33 |
  34 |   // Take screenshot
  35 |   await page.screenshot({ path: 'panchangam_v2_verification.png' });
  36 | });
  37 |
```