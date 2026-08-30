import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const screenshotDir = path.join(__dirname, '../../artifacts/lab-02/screenshots');

test.beforeAll(() => {
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }
});

test.describe('Automated UI Screenshot Capture for Lab 2 Deliverables', () => {
  test('Capture all 6 real UI screenshots from running application', async ({ page }) => {
    // 1. Requester Selection Screen
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('http://localhost:3001');
    await expect(page.locator('h2')).toContainText('Select Development Requester');
    await page.screenshot({ path: path.join(screenshotDir, '01-requester-selection.png'), fullPage: true });

    // Submit selection to continue as Jennifer Anderson
    await page.click('button[type="submit"]');
    await page.waitForTimeout(600);

    // 2. Create Ticket Form Screen
    await page.click('button:has-text("+ Create Ticket")');
    await expect(page.locator('h2')).toContainText('Create IT Support Ticket');
    await page.screenshot({ path: path.join(screenshotDir, '02-create-ticket-form.png'), fullPage: true });

    // Fill form and attach a sample file
    await page.selectOption('select >> nth=0', { index: 1 });
    await page.selectOption('select >> nth=1', { index: 1 });
    await page.click('input[value="HIGH"]');
    const summaryText = `UI Real Screenshot Ticket - ${Date.now()}`;
    await page.fill('input[placeholder*="Briefly describe"]', summaryText);
    await page.fill('textarea', 'Description for capturing real screenshots for Lab 2 Deliverables.');

    // Attach sample file
    const sampleFilePath = path.join(__dirname, 'sample_doc.pdf');
    fs.writeFileSync(sampleFilePath, 'Sample PDF content for screenshot capture');
    await page.setInputFiles('input[type="file"]', sampleFilePath);

    await page.click('button[type="submit"]');

    await expect(page.locator('h2')).toContainText('Ticket Submitted Successfully!');
    await page.click('button:has-text("View My Tickets")');

    // 3. My Tickets Desktop View
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(page.locator('h1')).toContainText('My Tickets');
    await page.screenshot({ path: path.join(screenshotDir, '03-my-tickets-desktop.png'), fullPage: true });

    // 4. My Tickets Mobile Responsive View
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(screenshotDir, '04-my-tickets-mobile.png'), fullPage: true });

    // Restore Desktop View & Click First Ticket Row for Detail View
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.click('table tbody tr >> nth=0');
    await page.waitForTimeout(600);

    // 5. Ticket Detail View Screen
    await page.screenshot({ path: path.join(screenshotDir, '05-ticket-detail-view.png'), fullPage: true });

    // 6. Soft Removal / Add Attachment Modal Screen
    const modalBtn = page.locator('button:has-text("Remove"), button:has-text("Add Attachment")').first();
    if (await modalBtn.isVisible()) {
      await modalBtn.click();
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(screenshotDir, '06-soft-removal-modal.png') });
    }

    // Clean up sample file
    if (fs.existsSync(sampleFilePath)) {
      fs.unlinkSync(sampleFilePath);
    }
  });
});
