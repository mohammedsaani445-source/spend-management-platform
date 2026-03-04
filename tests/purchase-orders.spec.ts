import { test, expect } from '@playwright/test';

test.describe('Purchase Order Flow', () => {
    // We assume the user is somewhat authenticated or the page is accessible for testing
    test('should load the Purchase Orders dashboard', async ({ page }) => {
        // Navigate to the PO dashboard
        await page.goto('/dashboard/purchase-orders');

        // Verify the page title or header
        await expect(page.getByRole('heading', { name: /Purchase Orders/i })).toBeVisible();

        // Verify that the "Create PO" or similar action button exists
        await expect(page.getByRole('button', { name: /Create PO|New Purchase Order/i })).toBeVisible({ timeout: 10000 });
    });

    test('should open the new PO form', async ({ page }) => {
        await page.goto('/dashboard/purchase-orders');

        // Click the create button
        await page.getByRole('button', { name: /Create PO|New Purchase Order/i }).click();

        // Verify the modal or new page opens
        await expect(page.getByText(/Create New Purchase Order/i)).toBeVisible();
        await expect(page.getByLabel(/Vendor/i)).toBeVisible();
    });
});
