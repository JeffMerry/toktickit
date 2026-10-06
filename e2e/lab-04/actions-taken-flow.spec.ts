import { expect, test } from '@playwright/test';
import { lab4Accounts, signInSeededAccount, signOut } from '../lab-03/helpers';

test('Requester and IT Staff complete a ticket with an auditable Action Taken', async ({ page }) => {
  await signInSeededAccount(page, lab4Accounts.requester);
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('button', { name: 'Create Ticket' }).click();
  await expect(page.getByRole('heading', { name: 'Create IT Support Ticket' })).toBeVisible();
  const selectors = page.locator('select');
  await selectors.nth(0).selectOption({ index: 0 });
  await selectors.nth(1).selectOption({ index: 0 });
  await page.getByRole('radio', { name: 'HIGH' }).check();
  const summary = `Lab 4 E2E action workflow ${Date.now()}`;
  await page.getByPlaceholder(/briefly describe/i).fill(summary);
  await page.getByPlaceholder(/provide detailed information/i).fill('Verify required follow-up blocks resolution until the Action Taken has a result.');
  await page.getByRole('button', { name: 'Submit Ticket' }).click();
  await expect(page.getByRole('heading', { name: 'Ticket Submitted Successfully!' })).toBeVisible();
  const ticketNumber = (await page.getByText(/^TKT-/).first().textContent())?.trim();
  expect(ticketNumber).toBeTruthy();
  await signOut(page);

  await signInSeededAccount(page, lab4Accounts.staff);
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('button', { name: 'Ticket Queue' }).click();
  await page.getByLabel('Search ticket, requester, or email').fill(ticketNumber!);
  await page.getByRole('button', { name: 'Apply filters' }).click();
  const ticketCard = page.locator('article').filter({ hasText: ticketNumber! });
  await expect(ticketCard).toBeVisible();
  await ticketCard.getByRole('button', { name: 'View operational detail' }).click();
  await expect(page.getByRole('heading', { name: summary })).toBeVisible();
  await page.getByRole('button', { name: 'Claim Ticket' }).click();
  await expect(page.getByLabel('Owner')).not.toHaveValue('');

  for (const status of ['OPEN', 'IN_PROGRESS']) {
    await page.getByLabel('Next status').selectOption(status);
    await page.getByRole('button', { name: 'Update status' }).click();
    await expect(page.getByLabel('Next status')).toHaveValue('');
  }

  await page.getByRole('button', { name: 'Add Action Taken' }).click();
  const form = page.getByRole('form', { name: 'Add Action Taken' });
  const actionDescription = `Investigate and restore access ${Date.now()}`;
  await form.getByLabel('Action description').fill(actionDescription);
  await form.getByLabel('Assignee').selectOption({ index: 1 });
  await form.getByLabel('Follow-up required').check();
  await form.getByLabel('Follow-up note').fill('Confirm service is working before resolving the ticket.');
  await form.getByRole('button', { name: 'Save Action' }).click();
  await expect(form).toHaveCount(0);
  const action = page.getByRole('article', { name: `Action Taken: ${actionDescription}` });
  await expect(action).toContainText('PLANNED');

  await page.getByLabel('Next status').selectOption('RESOLVED');
  await page.getByLabel('I confirm this status change.').check();
  await page.getByRole('button', { name: 'Update status' }).click();
  await expect(page.getByRole('alert')).toContainText(/completed action|unfinished follow-up/i);

  await action.getByRole('button', { name: 'Start' }).click();
  await expect(action).toContainText('IN PROGRESS');
  await action.getByRole('button', { name: 'Complete', exact: true }).click();
  await action.getByLabel('Completion result').fill('Service restored and verified with the requester.');
  await action.getByRole('button', { name: 'Confirm completion' }).click();
  await expect(action).toContainText('COMPLETED');
  await page.getByLabel('Next status').selectOption('RESOLVED');
  await page.getByLabel('I confirm this status change.').check();
  await page.getByRole('button', { name: 'Update status' }).click();
  await expect(page.getByLabel('Next status')).toHaveValue('');
  await signOut(page);

  await signInSeededAccount(page, lab4Accounts.requester);
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('button', { name: 'My Tickets' }).click();
  await page.getByText(summary, { exact: true }).first().click();
  await expect(page.getByRole('heading', { name: 'Actions Taken' })).toBeVisible();
  await expect(page.getByRole('article', { name: `Action Taken: ${actionDescription}` })).toContainText('Service restored and verified');
  await expect(page.getByRole('button', { name: 'Add Action Taken' })).toHaveCount(0);
});
