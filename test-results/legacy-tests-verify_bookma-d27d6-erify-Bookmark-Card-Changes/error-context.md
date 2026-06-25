# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: legacy/tests/verify_bookmarks_ui.spec.cjs >> Verify Bookmark Card Changes
- Location: legacy/tests/verify_bookmarks_ui.spec.cjs:3:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForSelector: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('.card') to be visible

```

# Test source

```ts
  1  | const { test, expect } = require('@playwright/test');
  2  |
  3  | test('Verify Bookmark Card Changes', async ({ page }) => {
  4  |   await page.goto('http://localhost:5173/?tab=bookmarks');
  5  |
  6  |   // Wait for data to load
> 7  |   await page.waitForSelector('.card');
     |              ^ Error: page.waitForSelector: Test timeout of 30000ms exceeded.
  8  |
  9  |   // Find exactly the YouTube card
  10 |   const multiUrlCard = page.locator('.card:has-text("YouTube")').first();
  11 |   await expect(multiUrlCard).toBeVisible();
  12 |
  13 |   // Verify pin button in footer
  14 |   const pinBtn = multiUrlCard.locator('.card-footer .pin-btn');
  15 |   await expect(pinBtn).toBeVisible();
  16 |
  17 |   // Perform long press (simulated)
  18 |   // Playwright's click with delay can simulate long press
  19 |   await multiUrlCard.click({ delay: 600 });
  20 |
  21 |   // Verify modal is open
  22 |   const modal = page.locator('.modal.modal-multi-url');
  23 |   await expect(modal).toBeVisible();
  24 |
  25 |   // Verify modal is displayed
  26 |   const style = await modal.getAttribute('style');
  27 |   expect(style).toContain('display: block');
  28 | });
  29 |
```