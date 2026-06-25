# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: legacy/tests/capture_screenshots.spec.cjs >> Capture Screenshots - Desktop & Mobile
- Location: legacy/tests/capture_screenshots.spec.cjs:3:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForSelector: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('#search') to be visible

```

# Test source

```ts
  1  | const { test, expect } = require('@playwright/test');
  2  |
  3  | test('Capture Screenshots - Desktop & Mobile', async ({ page }) => {
  4  |   // Desktop
  5  |   await page.setViewportSize({ width: 1280, height: 800 });
  6  |   await page.goto('http://localhost:5173/?tab=toolbox');
> 7  |   await page.waitForSelector('#search');
     |              ^ Error: page.waitForSelector: Test timeout of 30000ms exceeded.
  8  |   await page.fill('#search', 'json');
  9  |   await page.waitForTimeout(1000);
  10 |   await page.screenshot({ path: 'test-results/desktop-search.png' });
  11 |
  12 |   // Mobile
  13 |   await page.setViewportSize({ width: 375, height: 667 });
  14 |   await page.goto('http://localhost:5173/?tab=toolbox');
  15 |   // In mobile, search might be hidden behind a toggle in TabBar
  16 |   const searchTab = page.locator('#tab-search');
  17 |   if (await searchTab.isVisible()) {
  18 |     await searchTab.click();
  19 |   }
  20 |   await page.waitForSelector('#search');
  21 |   await page.fill('#search', 'pdf');
  22 |   await page.waitForTimeout(1000);
  23 |   await page.screenshot({ path: 'test-results/mobile-search.png' });
  24 | });
  25 |
```