import { test, expect } from '@playwright/test';

test.describe('Lab 2 E2E User Journey: TokTickIT Requester Workflow', () => {
  test('Complete journey: Select Requester -> Create Ticket -> Search in My Tickets -> View Details', async ({ page }) => {
    // 1. Visit Client Web Application
    await page.goto('http://localhost:3001');

    // Verify Requester Selection screen renders initially
    await expect(page.locator('h1, h2')).toContainText(/Select Requester/i);

    // 2. Select Development Requester (e.g., Jennifer Anderson)
    const requesterCard = page.locator('text=Jennifer Anderson').first();
    await expect(requesterCard).toBeVisible();
    await requesterCard.click();

    // 3. Verify Navigation to My Tickets
    await expect(page.locator('h1')).toContainText('My Tickets');

    // 4. Click "+ Create Ticket" button
    await page.click('button:has-text("+ Create Ticket")');

    // Verify Create Ticket Form renders
    await expect(page.locator('h2')).toContainText('Create IT Support Ticket');

    // 5. Fill out Create Ticket Form
    // Select Category (e.g., Hardware)
    await page.selectOption('select', { index: 1 });

    // Select Priority (e.g., HIGH)
    await page.click('input[value="HIGH"]');

    // Fill Summary and Description
    const uniqueSummary = `E2E Test Ticket - ${Date.now()}`;
    await page.fill('input[placeholder*="summary"]', uniqueSummary);
    await page.fill('textarea[placeholder*="description"]', 'This is an automated E2E test description for TokTickIT Lab 2 verification.');

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

    // Verify created ticket appears in the list
    await expect(page.locator(`text=${uniqueSummary}`)).toBeVisible();

    // 9. Click on the ticket to view details
    await page.click(`text=${uniqueSummary}`);

    // Verify Ticket Detail View
    await expect(page.locator('text=Ticket Details')).toBeVisible();
    await expect(page.locator(`text=${uniqueSummary}`)).toBeVisible();
  });
});
