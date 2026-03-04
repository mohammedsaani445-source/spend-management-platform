import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {

    test('should navigate to the login page and verify 2-step flow UI', async ({ page }) => {
        await page.goto('/login');
        // Step 1: Email
        await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible();
        await expect(page.getByPlaceholder(/you@company.com/i)).toBeVisible();
        await expect(page.getByRole('button', { name: 'Continue', exact: true })).toBeVisible();

        // Fill email and go to step 2
        await page.getByPlaceholder(/you@company.com/i).fill('test@company.com');
        await page.getByRole('button', { name: 'Continue', exact: true }).click();

        // Step 2: Password
        await expect(page.getByRole('heading', { name: /Hello, test!/i })).toBeVisible();
        await expect(page.getByPlaceholder(/Enter your password/i)).toBeVisible();
        await expect(page.getByRole('button', { name: 'Sign In', exact: true })).toBeVisible();
    });

    test('should display error message on invalid credentials', async ({ page }) => {
        await page.goto('/login');

        // Step 1: Fill email
        await page.getByPlaceholder(/you@company.com/i).fill('invalid.user@example.com');
        await page.getByRole('button', { name: 'Continue', exact: true }).click();

        // Step 2: Fill invalid password
        await page.getByPlaceholder(/Enter your password/i).fill('wrongpassword123');

        // Attempt sign in
        await page.getByRole('button', { name: 'Sign In', exact: true }).click();

        // Wait for the specific error message
        await expect(page.getByText(/Incorrect password or account not found/i)).toBeVisible({ timeout: 10000 });
    });

    test('should trigger password reset email flow', async ({ page }) => {
        await page.goto('/login');

        // Step 1: Fill email to reach the password step
        await page.getByPlaceholder(/you@company.com/i).fill('test_reset@example.com');
        await page.getByRole('button', { name: 'Continue', exact: true }).click();

        // Step 2: Click 'Forgot password?'
        await page.getByRole('button', { name: 'Forgot password?', exact: true }).click();

        // Wait for the specific success message
        await expect(page.getByText(/Password reset email sent! Please check your inbox./i)).toBeVisible({ timeout: 10000 });
    });
});
