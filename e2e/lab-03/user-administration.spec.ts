import { expect, test } from '@playwright/test';
import { e2eAccounts, expectViewportFits, signInWithInitialPassword } from './helpers';

test.describe('Lab 3 E2E: administrator user management', () => {
  test('creates, finds, edits, and resets an account initial password', async ({ page }) => {
    await signInWithInitialPassword(page, e2eAccounts.administrator);
    await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible();

    const suffix = Date.now();
    const email = `lab3-e2e-${suffix}@example.test`;
    const initialPassword = 'Lab3E2EManaged1!';

    await page.getByRole('button', { name: 'Create User' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Name').fill('Lab 3 E2E Managed User');
    await dialog.getByLabel('Email').fill(email);
    await dialog.getByLabel('Role').selectOption('REQUESTER');
    await dialog.getByLabel('Initial Password').fill(initialPassword);
    await dialog.getByLabel('Confirm Password').fill(initialPassword);
    await dialog.getByRole('button', { name: 'Create User' }).click();
    await expect(page.getByText(/user created/i)).toBeVisible();

    await page.getByLabel('Search name or email').fill(email);
    await page.getByRole('button', { name: 'Search' }).click();
    const userCard = page.locator('article').filter({ hasText: email });
    await expect(userCard).toBeVisible();
    await userCard.getByRole('button', { name: 'Edit' }).click();

    await dialog.getByLabel('Name').fill('Lab 3 E2E Updated User');
    await dialog.getByRole('button', { name: 'Save Changes' }).click();
    await expect(page.getByText(/user details saved/i)).toBeVisible();

    await page.getByLabel('Search name or email').fill(email);
    await page.getByRole('button', { name: 'Search' }).click();
    await page.locator('article').filter({ hasText: email }).getByRole('button', { name: 'Edit' }).click();
    await dialog.getByLabel('Initial Password').fill('Lab3E2EReset1!');
    await dialog.getByLabel('Confirm Password').fill('Lab3E2EReset1!');
    await dialog.getByRole('button', { name: 'Set New Initial Password' }).click();
    await expect(page.getByText(/new initial password was set/i)).toBeVisible();

    await page.setViewportSize({ width: 375, height: 667 });
    await expectViewportFits(page);
  });
});
