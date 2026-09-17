import { expect, test } from '@playwright/test';
import { e2eAccounts, expectViewportFits, signInWithInitialPassword } from './helpers';

test.describe('Lab 3 E2E: IT Staff ticket operations', () => {
  test('filters the queue, claims a ticket, and adds operational collaboration', async ({ page }) => {
    await signInWithInitialPassword(page, e2eAccounts.staff);
    await expect(page.getByRole('heading', { name: 'Ticket Queue' })).toBeVisible();

    await page.getByLabel('Search ticket, requester, or email').fill('TKT-2026-SEED-001');
    await page.getByRole('button', { name: 'Apply filters' }).click();
    const ticketCard = page.locator('article').filter({ hasText: 'TKT-2026-SEED-001' });
    await expect(ticketCard).toBeVisible();
    await ticketCard.getByRole('button', { name: 'View operational detail' }).click();

    await expect(page.getByRole('heading', { name: 'Laptop keyboard key is loose' })).toBeVisible();
    await page.getByRole('button', { name: 'Claim Ticket' }).click();
    await expect(page.getByText('Mary Support', { exact: true })).toBeVisible();

    await page.getByLabel('IT Priority').selectOption('URGENT');
    await expect(page.getByText('URGENT', { exact: true })).toBeVisible();

    await page.getByLabel('Next status').selectOption('OPEN');
    await page.getByRole('button', { name: 'Update status' }).click();
    await expect(page.getByText('OPEN', { exact: true }).first()).toBeVisible();

    const publicComment = `Staff E2E public update ${Date.now()}`;
    await page.getByLabel('Add Public Comment').fill(publicComment);
    await page.getByRole('button', { name: 'Add Public Comment' }).click();
    await expect(page.getByText(publicComment, { exact: true })).toBeVisible();

    const internalNote = `Staff E2E internal note ${Date.now()}`;
    await page.getByLabel('Add Internal Note').fill(internalNote);
    await page.getByRole('button', { name: 'Add Internal Note' }).click();
    await expect(page.getByText(internalNote, { exact: true })).toBeVisible();

    await page.setViewportSize({ width: 768, height: 900 });
    await expectViewportFits(page);
  });
});
