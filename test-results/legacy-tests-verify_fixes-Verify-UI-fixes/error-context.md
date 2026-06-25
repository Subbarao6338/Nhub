# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: legacy/tests/verify_fixes.spec.js >> Verify UI fixes
- Location: legacy/tests/verify_fixes.spec.js:3:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForSelector: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('.logo-container') to be visible

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]: "[plugin:vite:react-babel] /app/src/components/BookmarksView.jsx: Unexpected token, expected \",\" (186:3) 189 | if (window.innerWidth <= 768) return { display: 'block' };"
  - generic [ref=e5]: /app/src/components/BookmarksView.jsx:186:3
  - generic [ref=e6]: "184| navigator.clipboard.writeText(allUrls.join('\\n')); 185| alert(\"All URLs copied to clipboard!\"); 186| }; | ^ 187| 188| const getModalStyle = useCallback(() => {"
  - generic [ref=e7]: at constructor (/app/node_modules/@babel/parser/lib/index.js:365:19) at JSXParserMixin.raise (/app/node_modules/@babel/parser/lib/index.js:6599:19) at JSXParserMixin.unexpected (/app/node_modules/@babel/parser/lib/index.js:6619:16) at JSXParserMixin.expect (/app/node_modules/@babel/parser/lib/index.js:6899:12) at JSXParserMixin.parseCallExpressionArguments (/app/node_modules/@babel/parser/lib/index.js:11243:14) at JSXParserMixin.parseCoverCallAndAsyncArrowHead (/app/node_modules/@babel/parser/lib/index.js:11186:29) at JSXParserMixin.parseSubscript (/app/node_modules/@babel/parser/lib/index.js:11120:19) at JSXParserMixin.parseSubscripts (/app/node_modules/@babel/parser/lib/index.js:11094:19) at JSXParserMixin.parseExprSubscripts (/app/node_modules/@babel/parser/lib/index.js:11085:17) at JSXParserMixin.parseUpdate (/app/node_modules/@babel/parser/lib/index.js:11066:21) at JSXParserMixin.parseMaybeUnary (/app/node_modules/@babel/parser/lib/index.js:11046:23) at JSXParserMixin.parseMaybeUnaryOrPrivate (/app/node_modules/@babel/parser/lib/index.js:10899:61) at JSXParserMixin.parseExprOps (/app/node_modules/@babel/parser/lib/index.js:10904:23) at JSXParserMixin.parseMaybeConditional (/app/node_modules/@babel/parser/lib/index.js:10881:23) at JSXParserMixin.parseMaybeAssign (/app/node_modules/@babel/parser/lib/index.js:10831:21) at /app/node_modules/@babel/parser/lib/index.js:10800:39 at JSXParserMixin.allowInAnd (/app/node_modules/@babel/parser/lib/index.js:12421:16) at JSXParserMixin.parseMaybeAssignAllowIn (/app/node_modules/@babel/parser/lib/index.js:10800:17) at JSXParserMixin.parseVar (/app/node_modules/@babel/parser/lib/index.js:13384:91) at JSXParserMixin.parseVarStatement (/app/node_modules/@babel/parser/lib/index.js:13230:10) at JSXParserMixin.parseStatementContent (/app/node_modules/@babel/parser/lib/index.js:12851:23) at JSXParserMixin.parseStatementLike (/app/node_modules/@babel/parser/lib/index.js:12767:17) at JSXParserMixin.parseStatementListItem (/app/node_modules/@babel/parser/lib/index.js:12747:17) at JSXParserMixin.parseBlockOrModuleBlockBody (/app/node_modules/@babel/parser/lib/index.js:13316:61) at JSXParserMixin.parseBlockBody (/app/node_modules/@babel/parser/lib/index.js:13309:10) at JSXParserMixin.parseBlock (/app/node_modules/@babel/parser/lib/index.js:13297:10) at JSXParserMixin.parseFunctionBody (/app/node_modules/@babel/parser/lib/index.js:12100:24) at JSXParserMixin.parseArrowExpression (/app/node_modules/@babel/parser/lib/index.js:12075:10) at JSXParserMixin.parseParenAndDistinguishExpression (/app/node_modules/@babel/parser/lib/index.js:11687:12) at JSXParserMixin.parseExprAtom (/app/node_modules/@babel/parser/lib/index.js:11331:23) at JSXParserMixin.parseExprAtom (/app/node_modules/@babel/parser/lib/index.js:4764:20) at JSXParserMixin.parseExprSubscripts (/app/node_modules/@babel/parser/lib/index.js:11081:23) at JSXParserMixin.parseUpdate (/app/node_modules/@babel/parser/lib/index.js:11066:21) at JSXParserMixin.parseMaybeUnary (/app/node_modules/@babel/parser/lib/index.js:11046:23) at JSXParserMixin.parseMaybeUnaryOrPrivate (/app/node_modules/@babel/parser/lib/index.js:10899:61) at JSXParserMixin.parseExprOps (/app/node_modules/@babel/parser/lib/index.js:10904:23) at JSXParserMixin.parseMaybeConditional (/app/node_modules/@babel/parser/lib/index.js:10881:23) at JSXParserMixin.parseMaybeAssign (/app/node_modules/@babel/parser/lib/index.js:10831:21) at /app/node_modules/@babel/parser/lib/index.js:10800:39 at JSXParserMixin.allowInAnd (/app/node_modules/@babel/parser/lib/index.js:12421:16) at JSXParserMixin.parseMaybeAssignAllowIn (/app/node_modules/@babel/parser/lib/index.js:10800:17) at JSXParserMixin.parseVar (/app/node_modules/@babel/parser/lib/index.js:13384:91) at JSXParserMixin.parseVarStatement (/app/node_modules/@babel/parser/lib/index.js:13230:10) at JSXParserMixin.parseStatementContent (/app/node_modules/@babel/parser/lib/index.js:12851:23) at JSXParserMixin.parseStatementLike (/app/node_modules/@babel/parser/lib/index.js:12767:17) at JSXParserMixin.parseModuleItem (/app/node_modules/@babel/parser/lib/index.js:12744:17) at JSXParserMixin.parseBlockOrModuleBlockBody (/app/node_modules/@babel/parser/lib/index.js:13316:36) at JSXParserMixin.parseBlockBody (/app/node_modules/@babel/parser/lib/index.js:13309:10) at JSXParserMixin.parseProgram (/app/node_modules/@babel/parser/lib/index.js:12622:10) at JSXParserMixin.parseTopLevel (/app/node_modules/@babel/parser/lib/index.js:12612:25
  - generic [ref=e8]:
    - text: Click outside, press Esc key, or fix the code to dismiss.
    - text: You can also disable this overlay by setting
    - code [ref=e9]: server.hmr.overlay
    - text: to
    - code [ref=e10]: "false"
    - text: in
    - code [ref=e11]: vite.config.js.
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  |
  3  | test('Verify UI fixes', async ({ page }) => {
  4  |   await page.goto('http://localhost:5173');
> 5  |   await page.waitForSelector('.logo-container');
     |              ^ Error: page.waitForSelector: Test timeout of 30000ms exceeded.
  6  |
  7  |   // 1. Main View
  8  |   await page.screenshot({ path: 'test-results/01-main-view.png' });
  9  |
  10 |   // 2. Settings Modal (X button and Improved UI)
  11 |   await page.click('button[title="Settings"]');
  12 |   await page.waitForSelector('.modal');
  13 |   await page.screenshot({ path: 'test-results/02-settings-modal.png' });
  14 |
  15 |   // 3. Compact View
  16 |   // Try to toggle it using evaluate to avoid viewport issues
  17 |   await page.evaluate(() => {
  18 |     const rows = Array.from(document.querySelectorAll('.settings-row'));
  19 |     const compactRow = rows.find(r => r.innerText.includes('Compact View'));
  20 |     if (compactRow) {
  21 |       const checkbox = compactRow.querySelector('input[type="checkbox"]');
  22 |       if (checkbox) checkbox.click();
  23 |     }
  24 |   });
  25 |
  26 |   // Close modal via the fixed X button
  27 |   await page.click('.modal-header-flex .icon-btn');
  28 |   await page.waitForSelector('.modal', { state: 'hidden' });
  29 |
  30 |   // Take screenshot of compact view
  31 |   await page.screenshot({ path: 'test-results/03-compact-view.png' });
  32 |
  33 |   // 4. Back to Top button
  34 |   await page.evaluate(() => {
  35 |     const container = document.querySelector('.tools-container');
  36 |     if (container) {
  37 |       const dummy = document.createElement('div');
  38 |       dummy.id = 'dummy-scroller';
  39 |       dummy.style.height = '3000px';
  40 |       container.appendChild(dummy);
  41 |       container.scrollTop = 1500;
  42 |     }
  43 |   });
  44 |
  45 |   await page.waitForTimeout(1000);
  46 |   await page.waitForSelector('#back-to-top.visible');
  47 |   await page.screenshot({ path: 'test-results/04-back-to-top.png' });
  48 | });
  49 |
```