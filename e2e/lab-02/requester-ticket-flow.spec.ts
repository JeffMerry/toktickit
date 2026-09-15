import { test, expect } from '@playwright/test';

test.describe('Lab 2 E2E User Journey: TokTickIT Requester Workflow', () => {
  test('Complete journey: Select Requester -> Create Ticket -> Search in My Tickets -> View Details', async ({ page }) => {
    // 1. Visit Client Web Application
    await page.goto('http://localhost:3001');

    // Clear previous storage and reload to ensure clean Requester Selection state
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForTimeout(500);

    // Verify Requester Selection screen renders initially
    await expect(page.locator('h2')).toContainText('Select Development Requester');

    // 2. Select Development Requester (Submit form to continue as Jennifer Anderson)
    await page.click('button[type="submit"]');
    await page.waitForTimeout(600);

    // 3. Verify Navigation to My Tickets
    await expect(page.locator('h1')).toContainText('My Tickets');

    // 4. Click "+ Create Ticket" button
    await page.click('button:has-text("+ Create Ticket")');

    // Verify Create Ticket Form renders
    await expect(page.locator('h2')).toContainText('Create IT Support Ticket');

    // 5. Fill out Create Ticket Form
    await page.selectOption('select >> nth=0', { index: 1 });
    await page.selectOption('select >> nth=1', { index: 1 });
    await page.click('input[value="HIGH"]');

    const uniqueSummary = `E2E Verified Ticket - ${Date.now()}`;
    await page.fill('input[placeholder*="Briefly describe"]', uniqueSummary);
    await page.fill('textarea', 'This is an automated E2E test description for TokTickIT Lab 2 verification.');

    // Submit Ticket Form
    await page.click('button[type="submit"]');

    // 6. Verify Ticket Creation Success Screen
    await expect(page.locator('h2')).toContainText('Ticket Submitted Successfully!');
    const ticketNumElement = page.locator('div:has-text("TKT-2026-")').last();
    await expect(ticketNumElement).toBeVisible();

    // 7. Return to My Tickets List
    await page.click('button:has-text("View My Tickets")');
    await expect(page.locator('h1')).toContainText('My Tickets');

    // 8. Search for the newly created ticket in My Tickets
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill(uniqueSummary);
    await page.waitForTimeout(400);

    // Verify created ticket appears in the list (use .first() to support responsive desktop/mobile DOM)
    const ticketItem = page.locator(`text=${uniqueSummary}`).first();
    await expect(ticketItem).toBeVisible();

    // 9. Click on the ticket to view details
    await ticketItem.click();
    await page.waitForTimeout(600);

    // Verify Ticket Detail View
    await expect(page.locator('text=Ticket Details')).toBeVisible();
    await expect(page.locator(`text=${uniqueSummary}`).first()).toBeVisible();
  });
});
