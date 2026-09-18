import { expect, test } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import {
  e2eAccounts,
  openLogin,
  signIn,
  signInWithInitialPassword,
  signOut,
} from '../lab-03/helpers';

const screenshotDir = path.join(__dirname, '../../artifacts/lab-03/screenshots');

function screenshotPath(...segments: string[]) {
  const filePath = path.join(screenshotDir, ...segments);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  return filePath;
}

test.describe('Lab 3 release evidence capture', () => {
  test('captures the final role-based desktop and mobile workflows', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await openLogin(page);
    await signIn(page, 'unknown-user@example.test', 'NotThePassword123!');
    await expect(page.getByRole('alert')).toContainText(/invalid|unable/i);
    await page.screenshot({ path: screenshotPath('authentication', 'login-invalid-desktop.png'), fullPage: true });
    await page.setViewportSize({ width: 768, height: 900 });
    await page.screenshot({ path: screenshotPath('authentication', 'login-invalid-tablet.png'), fullPage: true });
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ path: screenshotPath('authentication', 'login-invalid-mobile.png'), fullPage: true });

    await page.setViewportSize({ width: 1280, height: 800 });
    await openLogin(page);
    await signIn(page, e2eAccounts.requesterOne.email, 'ChangeMe123!');
    await expect(page.getByRole('heading', { name: 'Set a new password' })).toBeVisible();
    await page.screenshot({ path: screenshotPath('authentication', 'change-password-desktop.png'), fullPage: true });
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ path: screenshotPath('authentication', 'change-password-mobile.png'), fullPage: true });
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.getByLabel('Current password').fill('ChangeMe123!');
    await page.getByRole('textbox', { name: 'New password', exact: true }).fill(e2eAccounts.requesterOne.replacementPassword);
    await page.getByRole('textbox', { name: 'Confirm new password', exact: true }).fill(e2eAccounts.requesterOne.replacementPassword);
    await page.getByRole('button', { name: 'Save new password' }).click();
    await expect(page.getByRole('heading', { name: 'My Tickets' })).toBeVisible();
    await page.getByText('Laptop keyboard key is loose', { exact: true }).first().click();
    await expect(page.getByText('Ticket Details', { exact: true })).toBeVisible();
    await page.screenshot({ path: screenshotPath('requester-ticket-detail', 'requester-detail-desktop.png'), fullPage: true });
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ path: screenshotPath('requester-ticket-detail', 'requester-detail-mobile.png'), fullPage: true });

    await page.setViewportSize({ width: 1280, height: 800 });
    await signOut(page);
    await signInWithInitialPassword(page, e2eAccounts.staff);
    await expect(page.getByRole('heading', { name: 'Ticket Queue' })).toBeVisible();
    await page.screenshot({ path: screenshotPath('staff-queue', 'queue-desktop.png'), fullPage: true });
    await page.setViewportSize({ width: 768, height: 900 });
    await page.screenshot({ path: screenshotPath('staff-queue', 'queue-tablet.png'), fullPage: true });
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ path: screenshotPath('staff-queue', 'queue-mobile.png'), fullPage: true });
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.getByLabel('Search ticket, requester, or email').fill('TKT-2026-SEED-001');
    await page.getByRole('button', { name: 'Apply filters' }).click();
    const ticketCard = page.locator('article').filter({ hasText: 'TKT-2026-SEED-001' });
    await expect(ticketCard).toBeVisible();
    await ticketCard.getByRole('button', { name: 'View operational detail' }).click();
    await expect(page.getByRole('heading', { name: 'Laptop keyboard key is loose' })).toBeVisible();
    await page.screenshot({ path: screenshotPath('staff-ticket-detail', 'staff-detail-desktop.png'), fullPage: true });
    await page.setViewportSize({ width: 768, height: 900 });
    await page.screenshot({ path: screenshotPath('staff-ticket-detail', 'staff-detail-tablet.png'), fullPage: true });
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ path: screenshotPath('staff-ticket-detail', 'staff-detail-mobile.png'), fullPage: true });

    await page.setViewportSize({ width: 1280, height: 800 });
    await signOut(page);
    await signInWithInitialPassword(page, e2eAccounts.administrator);
    await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible();
    await page.screenshot({ path: screenshotPath('user-management', 'users-desktop.png'), fullPage: true });
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ path: screenshotPath('user-management', 'users-mobile.png'), fullPage: true });
  });
});
