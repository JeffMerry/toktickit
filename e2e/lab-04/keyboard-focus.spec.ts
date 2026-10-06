import { expect, test } from '@playwright/test';
import { lab4Accounts, signInSeededAccount } from '../lab-03/helpers';

test('Actions Taken panel moves and restores keyboard focus', async ({ page }) => {
  await signInSeededAccount(page, lab4Accounts.staff);
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('button', { name: 'Ticket Queue' }).click();
  await page.getByLabel('Search ticket, requester, or email').fill('TKT-2026-SEED-002');
  await page.getByRole('button', { name: 'Apply filters' }).click();
  const ticket = page.locator('article').filter({ hasText: 'TKT-2026-SEED-002' });
  await ticket.getByRole('button', { name: 'View operational detail' }).click();
  await expect(page.getByRole('heading', { name: 'Actions Taken' })).toBeVisible();

  const addAction = page.getByRole('button', { name: 'Add Action Taken' });
  await addAction.focus();
  await page.keyboard.press('Enter');
  const form = page.getByRole('form', { name: 'Add Action Taken' });
  await expect(form).toBeVisible();
  await expect(form.getByLabel('Action date and time')).toBeFocused();

  await form.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(form).toHaveCount(0);
  await expect(addAction).toBeFocused();

  const action = page.getByRole('article', { name: /Review VPN disconnect diagnostics/ });
  const complete = action.getByRole('button', { name: 'Complete', exact: true });
  await complete.focus();
  await page.keyboard.press('Enter');
  await expect(action.getByLabel('Completion result')).toBeFocused();
  await action.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(complete).toBeFocused();

  await addAction.focus();
  await page.keyboard.press('Enter');
  await form.getByLabel('Action description').fill(`Keyboard focus save ${Date.now()}`);
  await form.getByRole('button', { name: 'Save Action' }).click();
  await expect(form).toHaveCount(0);
  await expect(addAction).toBeFocused();

  await action.getByRole('button', { name: 'Start' }).click();
  await expect(action).toContainText('IN PROGRESS');
  await expect(addAction).toBeFocused();
  await complete.click();
  await action.getByLabel('Completion result').fill('Keyboard focus regression verified.');
  await action.getByRole('button', { name: 'Confirm completion' }).click();
  await expect(action).toContainText('COMPLETED');
  await expect(addAction).toBeFocused();
});
