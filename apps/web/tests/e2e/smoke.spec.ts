import { test, expect } from '@playwright/test';

test.describe('Smoke & System Health', () => {
    test('health check endpoint /up returns HTTP 200 OK', async ({ request }) => {
        const response = await request.get('/up');
        expect(response.status()).toBe(200);
    });

    test('welcome page renders successfully with branding and navigation', async ({ page }) => {
        await page.goto('/');

        await expect(page).toHaveTitle(/Welcome|kcal-log/i);
        const loginLink = page.getByRole('link', { name: /log in/i });
        const registerLink = page.getByRole('link', { name: /register/i });

        await expect(loginLink).toBeVisible();
        await expect(registerLink).toBeVisible();
    });

    test('registration page renders form fields', async ({ page }) => {
        await page.goto('/register');

        await expect(page.getByLabel(/name/i)).toBeVisible();
        await expect(page.getByLabel(/email address/i)).toBeVisible();
        await expect(page.getByLabel(/^password$/i)).toBeVisible();
        await expect(page.getByLabel(/confirm password/i)).toBeVisible();
        await expect(page.getByRole('button', { name: /create account/i })).toBeVisible();
    });
});
