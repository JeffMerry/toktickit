import { expect, test } from '@playwright/test';
import {
  e2eAccounts,
  expectViewportFits,
  openLogin,
  signIn,
  signInWithInitialPassword,
  signOut,
} from './helpers';

test.describe('Lab 3 E2E: authentication and requester access', () => {
  test('rejects invalid credentials, requires a password change, and invalidates the session on logout', async ({ page }) => {
    await openLogin(page);
    await signIn(page, 'unknown-user@example.test', 'NotThePassword123!');
    await expect(page.getByRole('alert')).toContainText(/invalid|unable/i);

    await signInWithInitialPassword(page, e2eAccounts.requesterOne);
    await expect(page.getByRole('heading', { name: 'My Tickets' })).toBeVisible();

    await page.setViewportSize({ width: 375, height: 667 });
    await expectViewportFits(page);

    await signOut(page);
    await signIn(page, e2eAccounts.requesterOne.email, e2eAccounts.requesterOne.replacementPassword);
    await expect(page.getByRole('heading', { name: 'My Tickets' })).toBeVisible();
  });
});
