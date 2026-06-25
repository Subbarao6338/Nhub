# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: legacy/tests/check_all_tools.spec.cjs >> Check all tools in toolbox for crashes
- Location: legacy/tests/check_all_tools.spec.cjs:5:1

# Error details

```
Test timeout of 120000ms exceeded.
```

```
Error: page.waitForSelector: Test timeout of 120000ms exceeded.
Call log:
  - waiting for locator('.card-title') to be visible

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
  3  | test.setTimeout(120000); // Increase timeout to 2 minutes
  4  |
  5  | test('Check all tools in toolbox for crashes', async ({ page }) => {
  6  |   page.on('console', msg => {
  7  |       if (msg.type() === 'error') console.log('PAGE ERROR:', msg.text());
  8  |   });
  9  |   page.on('pageerror', err => console.log('UNCAUGHT EXCEPTION:', err.message));
  10 |
  11 |   await page.goto('http://localhost:5173/?tab=toolbox');
> 12 |   await page.waitForSelector('.card-title');
     |              ^ Error: page.waitForSelector: Test timeout of 120000ms exceeded.
  13 |
  14 |   const hubCards = await page.locator('.card').all();
  15 |   const hubTitles = [];
  16 |   for (const card of hubCards) {
  17 |       const title = await card.locator('.card-title').textContent();
  18 |       hubTitles.push(title.trim());
  19 |   }
  20 |
  21 |   console.log(`Found ${hubTitles.length} hubs: ${hubTitles.join(', ')}`);
  22 |
  23 |   for (const title of hubTitles) {
  24 |       console.log(`\n--- Testing Hub: ${title} ---`);
  25 |       await page.goto('http://localhost:5173/?tab=toolbox');
  26 |       await page.locator('.card', { hasText: title }).first().click();
  27 |       await page.waitForTimeout(1000);
  28 |
  29 |       // Check for ErrorBoundary
  30 |       const errorMsg = page.locator('text=Epic Toolbox Error');
  31 |       if (await errorMsg.isVisible()) {
  32 |           console.log(`CRASH DETECTED on Hub: ${title}`);
  33 |           continue;
  34 |       }
  35 |
  36 |       // Test each sub-tab in the hub
  37 |       const subTabs = await page.locator('.tool-form > .pill-group > .pill').all();
  38 |       console.log(`Found ${subTabs.length} main sub-tabs in ${title}`);
  39 |
  40 |       for (let i = 0; i < subTabs.length; i++) {
  41 |           const tab = subTabs[i];
  42 |           const tabName = await tab.textContent();
  43 |           console.log(`  Testing Sub-tab: ${tabName.trim()}`);
  44 |
  45 |           try {
  46 |               await tab.click();
  47 |               await page.waitForTimeout(500);
  48 |               if (await errorMsg.isVisible()) {
  49 |                   console.log(`  !!! CRASH DETECTED on Sub-tab: ${tabName.trim()}`);
  50 |                   const errorText = await page.locator('pre').textContent();
  51 |                   console.log('  ERROR TEXT:', errorText);
  52 |                   // Reload hub to continue
  53 |                   await page.goto('http://localhost:5173/?tab=toolbox');
  54 |                   await page.locator('.card', { hasText: title }).first().click();
  55 |                   await page.waitForTimeout(1000);
  56 |               }
  57 |           } catch (e) {
  58 |               console.log(`  Could not click tab ${tabName.trim()}: ${e.message}`);
  59 |           }
  60 |       }
  61 |   }
  62 | });
  63 |
```