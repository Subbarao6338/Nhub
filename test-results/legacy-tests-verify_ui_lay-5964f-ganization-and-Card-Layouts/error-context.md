# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: legacy/tests/verify_ui_layout.spec.cjs >> Verify Settings Organization and Card Layouts
- Location: legacy/tests/verify_ui_layout.spec.cjs:3:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('.tab-item:has-text("Settings")')

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
  3  | test('Verify Settings Organization and Card Layouts', async ({ page }) => {
  4  |   await page.goto('http://localhost:5173');
  5  |
  6  |   // Open Settings
> 7  |   await page.click('.tab-item:has-text("Settings")');
     |              ^ Error: page.click: Test timeout of 30000ms exceeded.
  8  |
  9  |   // Verify Type-wise sections exist in Settings
  10 |   await expect(page.locator('.collapsible-header:has-text("Toolbox")')).toBeVisible();
  11 |   await expect(page.locator('.collapsible-header:has-text("Bookmarks")')).toBeVisible();
  12 |   await expect(page.locator('.collapsible-header:has-text("Projects")')).toBeVisible();
  13 |
  14 |   // Close Settings
  15 |   await page.click('.icon-btn:has-text("close")');
  16 |
  17 |   // Verify Toolbox Card Layout
  18 |   await page.click('.tab-item:has-text("Toolbox")');
  19 |   const toolboxCard = page.locator('#card-web-main');
  20 |   await expect(toolboxCard.locator('.card-body')).toBeVisible();
  21 |   await expect(toolboxCard.locator('.card-footer')).toBeVisible();
  22 |   await expect(toolboxCard.locator('.card-footer .material-icons:has-text("apps")')).toBeVisible();
  23 |   await expect(toolboxCard.locator('.card-footer .pin-btn')).toBeVisible();
  24 |
  25 |   // Verify Bookmarks Card Layout
  26 |   await page.click('.tab-item:has-text("Bookmarks")');
  27 |   const bookmarkCard = page.locator('.card').first();
  28 |   await expect(bookmarkCard.locator('.card-header')).toBeVisible();
  29 |   await expect(bookmarkCard.locator('.card-body')).toBeVisible();
  30 |   await expect(bookmarkCard.locator('.card-footer')).toBeVisible();
  31 |   await expect(bookmarkCard.locator('.card-header .card-url')).toBeVisible();
  32 |   await expect(bookmarkCard.locator('.card-footer .material-icons:has-text("layers")')).toBeVisible();
  33 | });
  34 |
```