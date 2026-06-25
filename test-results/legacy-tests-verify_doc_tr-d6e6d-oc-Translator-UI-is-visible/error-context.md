# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: legacy/tests/verify_doc_translator.spec.js >> Doc Translator UI is visible
- Location: legacy/tests/verify_doc_translator.spec.js:3:1

# Error details

```
TimeoutError: page.waitForSelector: Timeout 15000ms exceeded.
Call log:
  - waiting for locator('.tool-form') to be visible

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
  3  | test('Doc Translator UI is visible', async ({ page }) => {
  4  |   // Use a longer timeout and go to the specific sub-tool
  5  |   await page.goto('http://localhost:5173/?tab=toolbox&tool=doc-translator', { waitUntil: 'networkidle' });
  6  |
  7  |   // The hub uses lazy loading, so wait for the component
> 8  |   await page.waitForSelector('.tool-form', { timeout: 15000 });
     |              ^ TimeoutError: page.waitForSelector: Timeout 15000ms exceeded.
  9  |
  10 |   // Check for file input and language select
  11 |   await expect(page.locator('input[type="file"]')).toBeVisible();
  12 |   await expect(page.locator('select')).toBeVisible();
  13 |   await expect(page.locator('button.btn-primary', { hasText: 'Translate Document' })).toBeVisible();
  14 | });
  15 |
```