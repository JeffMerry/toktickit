import { expect, test } from '@playwright/test';
import { e2eAccounts, expectViewportFits, lab4Accounts, signInSeededAccount, signOut } from '../lab-03/helpers';

test('Requester dashboard scopes Ticket data and opens matching My Tickets filters', async ({ page }) => {
  await signInSeededAccount(page, lab4Accounts.dashboardRequester);
  await expect(page.getByRole('heading', { name: 'My Dashboard' })).toBeVisible();
  await expect(page.getByRole('button', { name: /View \d+ open tickets/i })).toBeVisible();
  const denied = await page.evaluate(async () => {
    const response = await fetch('http://localhost:5000/api/dashboard/staff', { credentials: 'include' });
    return response.status;
  });
  expect(denied).toBe(403);

  await page.getByRole('button', { name: /View \d+ open tickets/i }).click();
  await expect(page.getByRole('heading', { name: 'My Tickets' })).toBeVisible();
  await expect(page.getByRole('status')).toContainText('Dashboard filter active');
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('button', { name: 'Dashboard' }).click();
  const recent = page.getByRole('region', { name: 'Needs attention / recently updated' });
  await recent.getByRole('button').first().click();
  await expect(page.getByText('Ticket Details', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Actions Taken' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Add Action Taken' })).toHaveCount(0);
  await page.setViewportSize({ width: 320, height: 760 });
  await expectViewportFits(page);
});

test('Staff and Administrator dashboards retain operational drill-down and role navigation', async ({ page }) => {
  await signInSeededAccount(page, lab4Accounts.dashboardStaff);
  await expect(page.getByRole('heading', { name: 'IT Staff Dashboard' })).toBeVisible();
  await page.getByRole('button', { name: /View \d+ urgent active tickets/i }).click();
  await expect(page.getByRole('heading', { name: 'Ticket Queue' })).toBeVisible();
  await expect(page.getByRole('status')).toContainText('urgent active');
  await page.setViewportSize({ width: 768, height: 900 });
  await expectViewportFits(page);
  await signOut(page);

  await signInSeededAccount(page, e2eAccounts.administrator);
  await expect(page.getByRole('heading', { name: 'IT Staff Dashboard' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Main navigation' }).getByRole('button', { name: 'User Management' })).toBeVisible();
  await page.setViewportSize({ width: 1440, height: 900 });
  await expectViewportFits(page);
});
