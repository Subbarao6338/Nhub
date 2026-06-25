# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: legacy/tests/repro_crash.spec.cjs >> Dev Hub should not crash when opened
- Location: legacy/tests/repro_crash.spec.cjs:3:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForSelector: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('.card-title') to be visible

```

# Test source

```ts
  1  | const { test, expect } = require('@playwright/test');
  2  |
  3  | test('Dev Hub should not crash when opened', async ({ page }) => {
  4  |   page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  5  |   page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  6  |
  7  |   await page.goto('http://localhost:5173/?tab=toolbox');
  8  |
> 9  |   await page.waitForSelector('.card-title');
     |              ^ Error: page.waitForSelector: Test timeout of 30000ms exceeded.
  10 |
  11 |   const devHubCard = page.locator('.card', { hasText: 'Dev Hub' });
  12 |   await devHubCard.click();
  13 |
  14 |   await page.waitForTimeout(2000);
  15 |
  16 |   const errorMsg = page.locator('text=Epic Toolbox Error');
  17 |   if (await errorMsg.isVisible()) {
  18 |       console.log('CRASH DETECTED');
  19 |       const errorText = await page.locator('pre').textContent();
  20 |       console.log('ERROR TEXT:', errorText);
  21 |   } else {
  22 |       console.log('NO CRASH DETECTED INITIALLY');
  23 |   }
  24 |
  25 |   const tabs = ['Base64', 'JSON Formatter', 'Diff Viewer', 'JWT Decoder', 'Cron Helper', 'SQL Formatter', 'Regex Tester', 'Security Hub', 'URL Tool', 'YAML Conv', 'Minifier', 'XML ↔ JSON', 'XML Formatter', 'JSON to TS'];
  26 |   for (const tab of tabs) {
  27 |     console.log(`Testing tab: ${tab}`);
  28 |     const tabBtn = page.locator('.pill', { hasText: tab }).first();
  29 |     if (await tabBtn.isVisible()) {
  30 |         await tabBtn.click();
  31 |         await page.waitForTimeout(500);
  32 |         if (await errorMsg.isVisible()) {
  33 |             console.log(`CRASH DETECTED ON TAB: ${tab}`);
  34 |             const errorText = await page.locator('pre').textContent();
  35 |             console.log('ERROR TEXT:', errorText);
  36 |             break;
  37 |         }
  38 |     } else {
  39 |         console.log(`Tab ${tab} not visible`);
  40 |     }
  41 |   }
  42 | });
  43 |
```