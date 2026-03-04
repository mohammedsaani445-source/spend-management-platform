import { test, expect } from '@playwright/test';

test.describe('Requisition & Approval Flow', () => {
    test('should load the Requisitions dashboard', async ({ page }) => {
        await page.goto('/dashboard/requisitions');

        await expect(page.getByRole('heading', { name: /Requisitions/i })).toBeVisible();
        await expect(page.getByRole('button', { name: /New Requisition/i })).toBeVisible();
    });

    test('should navigate to the approvals queue', async ({ page }) => {
        await page.goto('/dashboard/approvals');

        await expect(page.getByRole('heading', { name: /Approvals/i })).toBeVisible();
        // Verify there are tabs or sections for pending approvals
        await expect(page.getByText(/Pending/i)).toBeVisible();
    });
});
