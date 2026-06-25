# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: legacy/tests/verify_panchangam.spec.cjs >> verify Telugu Panchangam tool
- Location: legacy/tests/verify_panchangam.spec.cjs:3:1

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
  3  | test('verify Telugu Panchangam tool', async ({ page }) => {
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
  18 |   await expect(page.locator('input[placeholder="17.38"]')).toBeVisible();
  19 |   await expect(page.locator('input[placeholder="78.48"]')).toBeVisible();
  20 |
  21 |   // Click Calculate Panchangam
  22 |   await page.click('button:has-text("Calculate Panchangam")');
  23 |
  24 |   // Verify results are displayed
  25 |   await expect(page.locator('text=Samvatsara')).toBeVisible();
  26 |   await expect(page.locator('text=Tithi')).toBeVisible();
  27 |   await expect(page.locator('text=Nakshatra')).toBeVisible();
  28 |   await expect(page.locator('text=Rahu Kalam')).toBeVisible();
  29 |
  30 |   // Take screenshot
  31 |   await page.screenshot({ path: 'panchangam_verification.png' });
  32 | });
  33 |
```