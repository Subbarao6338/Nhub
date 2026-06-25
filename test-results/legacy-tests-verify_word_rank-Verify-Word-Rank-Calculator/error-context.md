# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: legacy/tests/verify_word_rank.spec.cjs >> Verify Word Rank Calculator
- Location: legacy/tests/verify_word_rank.spec.cjs:3:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForSelector: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('textarea[placeholder*="word-rank"]') to be visible

```

# Test source

```ts
  1  | const { test, expect } = require('@playwright/test');
  2  |
  3  | test('Verify Word Rank Calculator', async ({ page }) => {
  4  |     // Navigate to Word Rank tool directly
  5  |     await page.goto('http://localhost:5173/?tab=toolbox&tool=word-rank');
  6  |
  7  |     // Wait for the tool to load
> 8  |     await page.waitForSelector('textarea[placeholder*="word-rank"]');
     |                ^ Error: page.waitForSelector: Test timeout of 30000ms exceeded.
  9  |
  10 |     const textarea = page.locator('textarea[placeholder*="word-rank"]');
  11 |     const runButton = page.locator('button:has-text("Run word-rank")');
  12 |
  13 |     // Test Case 1: Simple word without duplicate letters (BAC)
  14 |     await textarea.fill('BAC');
  15 |     await runButton.click();
  16 |     await expect(page.locator('.tool-result')).toContainText('Rank of the word: 3');
  17 |
  18 |     // Test Case 2: Word with duplicate letters (BAA)
  19 |     await textarea.clear();
  20 |     await textarea.fill('BAA');
  21 |     await runButton.click();
  22 |     await expect(page.locator('.tool-result')).toContainText('Rank of the word: 3');
  23 |
  24 |     // Test Case 3: Another word with duplicate letters (BOOK)
  25 |     await textarea.clear();
  26 |     await textarea.fill('BOOK');
  27 |     await runButton.click();
  28 |     await expect(page.locator('.tool-result')).toContainText('Rank of the word: 3');
  29 |
  30 |     // Test Case 4: Long word for BigInt verification (ALPHABET)
  31 |     await textarea.clear();
  32 |     await textarea.fill('ALPHABET');
  33 |     await runButton.click();
  34 |     await expect(page.locator('.tool-result')).toContainText('Rank of the word:');
  35 | });
  36 |
```