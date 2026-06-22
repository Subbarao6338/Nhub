const { test, expect } = require('@playwright/test');

const hubs = [
  { name: 'AI Hub', id: 'ai-main' },
  { name: 'Agent Lab', id: 'agent-main' },
  { name: 'Media & Docs', id: 'doc-main' },
  { name: 'Web Tools', id: 'web-main' },
  { name: 'Data Science', id: 'data-main' },
  { name: 'Dev Hub', id: 'dev-main' },
  { name: 'Network Hub', id: 'network-main' },
  { name: 'Ops Center', id: 'ops-main' },
  { name: 'Notion Hub', id: 'notion-main' },
  { name: 'Date & Time', id: 'time-main' }
];

test.describe('Hub Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.addStyleTag({ content: `
      *, *::before, *::after {
        transition: none !important;
        animation: none !important;
      }
    `});
  });

  for (const hub of hubs) {
    test(`Verify ${hub.name} Hub renders sub-tabs`, async ({ page }) => {
      console.log(`Navigating to ${hub.name} (ID: ${hub.id})...`);
      await page.goto(`http://localhost:3001/?tool=${hub.id}`);
      await page.waitForLoadState('networkidle');

      const hubContent = page.locator('.hub-content');
      await expect(hubContent).toBeVisible({ timeout: 15000 });

      const subTabs = page.locator('.pill-group.scrollable-x .pill');
      await expect(subTabs.first()).toBeVisible({ timeout: 10000 });
      const count = await subTabs.count();
      console.log(`Hub ${hub.name} has ${count} sub-tabs.`);

      expect(count).toBeGreaterThan(0);
      await page.screenshot({ path: `verification/screenshots/${hub.id}.png`, fullPage: true });
    });
  }
});
