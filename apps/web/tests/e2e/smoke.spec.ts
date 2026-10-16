import { test, expect } from '@playwright/test';

test.describe('Smoke & System Health', () => {
    test('health check endpoint /up returns HTTP 200 OK', async ({
        request,
    }) => {
        const response = await request.get('/up');
        expect(response.status()).toBe(200);
    });

    test('welcome page renders successfully with branding and navigation', async ({
        page,
    }) => {
        await page.goto('/');

        await expect(page).toHaveTitle(/Welcome|kcal-log/i);
        const loginLink = page.getByRole('link', { name: /log in/i });
        const registerLink = page.getByRole('link', { name: /register/i });

        await expect(loginLink).toBeVisible();
        await expect(registerLink).toBeVisible();

        // Verify macro calculator computes real grams and has zero NaN instances
        await expect(page.getByText('NaN', { exact: true })).toHaveCount(0);
        await expect(
            page.getByText(/Calculated Daily Fuel Target/i),
        ).toBeVisible();
    });

    test('registration page renders form fields', async ({ page }) => {
        await page.goto('/register');

        await expect(page.getByLabel(/name/i)).toBeVisible();
        await expect(page.getByLabel(/email address/i)).toBeVisible();
        await expect(page.getByLabel(/^password$/i)).toBeVisible();
        await expect(page.getByLabel(/confirm password/i)).toBeVisible();
        await expect(
            page.getByRole('button', { name: /create account/i }),
        ).toBeVisible();
    });

    test('OpenAPI spec endpoint /docs/api.json returns valid OpenAPI 3.1 document', async ({
        request,
    }) => {
        const response = await request.get('/docs/api.json');
        expect(response.status()).toBe(200);
        const data = await response.json();
        expect(data.openapi).toMatch(/^3\.1/);
        expect(data.info.title).toContain('kcal-log');
    });

    test('Scalar API documentation /docs/api renders interactive API explorer', async ({
        page,
    }) => {
        const response = await page.goto('/docs/api');
        expect(response?.status()).toBe(200);
        await expect(page).toHaveTitle(/kcal-log/i);
    });
});
