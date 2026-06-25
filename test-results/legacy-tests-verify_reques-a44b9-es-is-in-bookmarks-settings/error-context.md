# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: legacy/tests/verify_requested_changes.spec.cjs >> verify enable profiles is in bookmarks settings
- Location: legacy/tests/verify_requested_changes.spec.cjs:3:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('.top-bar button .material-icons:text("settings")')

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
  1  | const { test, expect } = require('@playwright/test');
  2  |
  3  | test('verify enable profiles is in bookmarks settings', async ({ page }) => {
  4  |   await page.goto('http://localhost:5173');
  5  |
  6  |   // Open Settings Modal
> 7  |   await page.click('.top-bar button .material-icons:text("settings")');
     |              ^ Error: page.click: Test timeout of 30000ms exceeded.
  8  |
  9  |   // Find Bookmarks section specifically
  10 |   const bookmarksSection = page.locator('.settings-collapsible').filter({ has: page.locator('.header-left span:text("Bookmarks")') });
  11 |   await bookmarksSection.locator('.collapsible-header').click();
  12 |
  13 |   // Check if Bookmarks section contains Enable Profiles
  14 |   await expect(bookmarksSection.locator('text=Enable Profiles')).toBeVisible();
  15 |
  16 |   // Find General section specifically and check it does NOT have Enable Profiles
  17 |   const generalSection = page.locator('.settings-collapsible').filter({ has: page.locator('.header-left span:text("General")') });
  18 |   await expect(generalSection.locator('text=Enable Profiles')).not.toBeVisible();
  19 | });
  20 |
  21 | test('verify urls in bookmark actions modal wrap', async ({ page }) => {
  22 |   await page.goto('http://localhost:5173');
  23 |
  24 |   // Go to Bookmarks tab
  25 |   await page.click('.tab-item:has-text("Bookmarks")');
  26 |
  27 |   // Wait for content to load
  28 |   await page.waitForTimeout(1000);
  29 |
  30 |   // Take first card and long press
  31 |   const cards = page.locator('.card');
  32 |   const count = await cards.count();
  33 |   if (count === 0) {
  34 |       console.log("No bookmark cards found to test long-press.");
  35 |       return;
  36 |   }
  37 |
  38 |   const firstCard = cards.first();
  39 |   await firstCard.dispatchEvent('mousedown', { clientX: 100, clientY: 100 });
  40 |   await page.waitForTimeout(600);
  41 |   await firstCard.dispatchEvent('mouseup', { clientX: 100, clientY: 100 });
  42 |
  43 |   // Verify modal is open
  44 |   const modal = page.locator('.modal-multi-url');
  45 |   await expect(modal).toBeVisible();
  46 |
  47 |   // Verify url-btn-content has expected styles for wrapping
  48 |   const urlContent = modal.locator('.url-btn-content').first();
  49 |   const styles = await urlContent.evaluate((el) => {
  50 |     const s = window.getComputedStyle(el);
  51 |     return {
  52 |       whiteSpace: s.whiteSpace,
  53 |       wordBreak: s.wordBreak
  54 |     };
  55 |   });
  56 |
  57 |   expect(styles.whiteSpace).toBe('normal');
  58 |   expect(styles.wordBreak).toBe('break-all');
  59 | });
  60 |
```