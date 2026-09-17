import { expect, type Page } from '@playwright/test';

export const temporaryPassword = 'ChangeMe123!';

export const e2eAccounts = {
  requesterOne: {
    email: 'jennifer.anderson@kmutt.ac.th',
    replacementPassword: 'Lab3E2ERequester1!',
  },
  requesterTwo: {
    email: 'michael.brown@kmutt.ac.th',
    replacementPassword: 'Lab3E2ERequester2!',
  },
  staff: {
    email: 'mary.support@kmutt.ac.th',
    replacementPassword: 'Lab3E2EStaff1!',
  },
  administrator: {
    email: 'admin@kmutt.ac.th',
    replacementPassword: 'Lab3E2EAdmin1!',
  },
} as const;

export async function openLogin(page: Page) {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'TokTickIT' })).toBeVisible();
}

export async function signIn(page: Page, email: string, password: string) {
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
}

export async function changeTemporaryPassword(page: Page, replacementPassword: string) {
  await expect(page.getByRole('heading', { name: 'Set a new password' })).toBeVisible();
  await page.getByLabel('Current password').fill(temporaryPassword);
  await page.getByLabel('New password').fill(replacementPassword);
  await page.getByLabel('Confirm new password').fill(replacementPassword);
  await page.getByRole('button', { name: 'Save new password' }).click();
}

export async function signInWithInitialPassword(
  page: Page,
  account: { email: string; replacementPassword: string },
) {
  await openLogin(page);
  await signIn(page, account.email, temporaryPassword);
  await changeTemporaryPassword(page, account.replacementPassword);
}

export async function signOut(page: Page) {
  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page.getByRole('heading', { name: 'TokTickIT' })).toBeVisible();
}

export async function expectViewportFits(page: Page) {
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
}
