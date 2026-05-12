const { test, expect } = require('@playwright/test');

test('Verify PDF Tools migration', async ({ page }) => {
  await page.goto('http://localhost:3001/?tab=toolbox');

  // Check PDF Tools card
  const pdfCard = page.locator('#card-pdf-main');
  await expect(pdfCard).toBeVisible();
  await pdfCard.click();

  // Check sub-tools in PDF Hub
  const expectedSubTools = [
    'Merge', 'Split', 'Delete', 'Rearrange', 'Rotate', 'Sign', 'Watermark',
    'Numbers', 'Crop', 'Lock', 'Unlock', 'Metadata', 'Compress', 'Grayscale',
    'Flatten', 'Img to PDF', 'PDF to Img', 'Word to PDF', 'Excel to PDF',
    'PDF to Word', 'PDF to Text', 'PDF to ZIP', 'Extract Assets', 'Scan PDF (OCR)'
  ];

  for (const label of expectedSubTools) {
    // Wait for at least one to be visible to ensure Hub loaded
    await page.waitForSelector('.pill');
    await expect(page.locator(`button.pill:has-text("${label}")`).first()).toBeVisible();
  }

  // Go back to Toolbox
  await page.locator('div.breadcrumb-item').filter({ hasText: 'Toolbox' }).first().click();

  // Check Doc Tools hub
  const docCard = page.locator('#card-doc-main');
  await expect(docCard).toBeVisible();
  await docCard.click();

  // Doc hub should only have Markdown Editor now
  await expect(page.locator('button.pill:has-text("Markdown Editor")')).toBeVisible();
  await expect(page.locator('button.pill:has-text("PDF to Word")')).not.toBeVisible();
});
