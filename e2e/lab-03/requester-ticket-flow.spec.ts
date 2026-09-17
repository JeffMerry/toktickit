import { expect, test } from '@playwright/test';
import { e2eAccounts, signInWithInitialPassword } from './helpers';

test.describe('Lab 3 E2E: requester ticket and collaboration flow', () => {
  test('creates an owned ticket, opens its detail page, and posts a public comment', async ({ page }) => {
    await signInWithInitialPassword(page, e2eAccounts.requesterTwo);
    await expect(page.getByRole('heading', { name: 'My Tickets' })).toBeVisible();

    await page.getByRole('button', { name: /create ticket/i }).click();
    await expect(page.getByRole('heading', { name: 'Create IT Support Ticket' })).toBeVisible();

    const selectors = page.locator('select');
    await expect(selectors).toHaveCount(2);
    await selectors.nth(0).selectOption({ index: 0 });
    await selectors.nth(1).selectOption({ index: 0 });
    await page.getByRole('radio', { name: 'HIGH' }).check();

    const summary = `Lab 3 E2E requester ticket ${Date.now()}`;
    await page.getByPlaceholder(/briefly describe/i).fill(summary);
    await page.getByPlaceholder(/provide detailed information/i).fill('This ticket verifies the authenticated requester journey using a real local browser session.');
    await page.getByRole('button', { name: 'Submit Ticket' }).click();

    await expect(page.getByRole('heading', { name: 'Ticket Submitted Successfully!' })).toBeVisible();
    await page.getByRole('button', { name: /view my tickets/i }).click();
    await expect(page.getByRole('heading', { name: 'My Tickets' })).toBeVisible();

    const matchingTicket = page.getByText(summary, { exact: true }).first();
    await expect(matchingTicket).toBeVisible();
    await matchingTicket.click();
    await expect(page.getByText('Ticket Details', { exact: true })).toBeVisible();

    const comment = `Requester E2E public comment ${Date.now()}`;
    await page.getByLabel('Add Public Comment').fill(comment);
    await page.getByRole('button', { name: 'Post Comment' }).click();
    await expect(page.getByText(comment, { exact: true })).toBeVisible();
  });
});
