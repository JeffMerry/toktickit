import { expect, test, type Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { expectViewportFits, lab4Accounts, signInSeededAccount, signOut } from '../lab-03/helpers';

const screenshotDir = path.join(__dirname, '../../artifacts/lab-04/screenshots');
const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 900 },
  { name: 'mobile', width: 320, height: 760 },
] as const;

async function captureResponsive(page: Page, section: string) {
  fs.mkdirSync(screenshotDir, { recursive: true });
  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await expectViewportFits(page);
    await page.screenshot({ path: path.join(screenshotDir, `${section}-${viewport.name}.png`), fullPage: true });
  }
  await page.setViewportSize({ width: 1440, height: 900 });
}

test('captures role-based dashboards and Actions Taken at three viewport widths', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await signInSeededAccount(page, lab4Accounts.dashboardRequester);
  await expect(page.getByRole('heading', { name: 'My Dashboard' })).toBeVisible();
  await captureResponsive(page, 'requester-dashboard');

  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('button', { name: 'My Tickets' }).click();
  await page.getByPlaceholder('Search by ticket number or summary...').fill('TKT-2026-SEED-003');
  await page.getByText('Grade submission page cannot save', { exact: true }).first().click();
  await expect(page.getByRole('heading', { name: 'Actions Taken' })).toBeVisible();
  await expect(page.getByRole('article', { name: /Action Taken:/ }).first()).toBeVisible();
  await captureResponsive(page, 'requester-actions-read-only');

  await signOut(page);
  await signInSeededAccount(page, lab4Accounts.dashboardStaff);
  await expect(page.getByRole('heading', { name: 'IT Staff Dashboard' })).toBeVisible();
  await captureResponsive(page, 'staff-dashboard');

  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('button', { name: 'Ticket Queue' }).click();
  await page.getByLabel('Search ticket, requester, or email').fill('TKT-2026-SEED-003');
  await page.getByRole('button', { name: 'Apply filters' }).click();
  await page.locator('article').filter({ hasText: 'TKT-2026-SEED-003' }).getByRole('button', { name: 'View operational detail' }).click();
  await expect(page.getByRole('heading', { name: 'Actions Taken' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Add Action Taken' })).toBeVisible();
  await captureResponsive(page, 'staff-actions-operational');
});
