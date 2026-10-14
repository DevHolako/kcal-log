import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';

test.describe('End-to-End User Experience', () => {
    test('complete user journey: register, onboarding, diary logging, custom food, strategy, and reports', async ({ page }) => {
        const uniqueId = Date.now();
        const testEmail = `user_${uniqueId}@example.com`;
        const testName = `Alex Carter ${uniqueId}`;
        const testPassword = 'Password123!';

        page.on('console', msg => console.log(`[BROWSER CONSOLE] ${msg.type()}: ${msg.text()}`));
        page.on('pageerror', exception => console.log(`[BROWSER ERROR] ${exception.stack || exception}`));

        // 1. User Registration
        await page.goto('/register');
        await expect(page).toHaveTitle(/Register/i);

        await page.fill('#name', testName);
        await page.fill('#email', testEmail);
        await page.fill('#password', testPassword);
        await page.fill('#password_confirmation', testPassword);

        await page.getByRole('button', { name: /create account/i }).click();

        // Wait for registration to complete and land on verify or onboarding
        await page.waitForURL(/.*(email\/verify|onboarding)/, { timeout: 15000 });
        console.log('Current URL after register:', page.url());

        // Verify the user email via artisan so the user can access dashboard
        execSync(`php artisan user:verify ${testEmail}`, { cwd: process.cwd() });

        // Navigate to Onboarding
        await page.goto('/onboarding');
        console.log('Current URL after goto onboarding:', page.url());
        await expect(page.getByText(/Body Metrics & Demographics/i)).toBeVisible({ timeout: 10000 });
        await page.screenshot({ path: 'test-results/screenshots/01-onboarding-step1.png' });

        // Step 1 -> Step 2
        await page.getByRole('button', { name: /continue/i }).click();
        await expect(page.getByText(/Daily Activity Level/i)).toBeVisible({ timeout: 5000 });

        // Step 2 -> Step 3
        await page.getByRole('button', { name: /continue/i }).click();
        await expect(page.getByText(/Primary Goal & Desired Rate/i)).toBeVisible({ timeout: 5000 });

        // Step 3 -> Step 4
        await page.getByRole('button', { name: /continue/i }).click();
        await expect(page.getByText(/Macronutrient Strategy/i)).toBeVisible({ timeout: 5000 });

        // Step 4 -> Step 5
        await page.getByRole('button', { name: /continue/i }).click();
        await expect(page.getByText(/Review Your Calibrated Targets/i)).toBeVisible({ timeout: 5000 });
        await page.screenshot({ path: 'test-results/screenshots/02-onboarding-step5.png' });

        // If not already submitted and transitioned, click start logging food
        const finishBtn = page.getByRole('button', { name: /start logging food/i });
        if (await finishBtn.isVisible().catch(() => false)) {
            await finishBtn.click();
        }

        // 3. Daily Diary Dashboard
        await page.waitForURL(/.*(dashboard|diary)/, { timeout: 15000 });
        await expect(page.getByText(/remaining/i).first()).toBeVisible({ timeout: 10000 });
        // UX Assertion: Exactly one sidebar toggle button on screen (no duplicate headers)
        await expect(page.getByRole('button', { name: /toggle sidebar/i })).toHaveCount(1);
        // UX Assertion: No raw ISO 8601 strings leaked into rendered text
        await expect(page.locator('body')).not.toHaveText(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
        await page.screenshot({ path: 'test-results/screenshots/03-dashboard-initial.png' });

        // 4. Quick Add Calories to Breakfast
        const breakfastQuickAdd = page.locator('button', { hasText: /quick add/i }).first();
        await breakfastQuickAdd.click();

        await page.waitForSelector('#quick-cal');
        await page.fill('#quick-cal', '420');
        await page.fill('#quick-desc', 'Oatmeal with Blueberries');
        await page.getByRole('button', { name: /add calories/i }).click();

        // Verify entry added
        await expect(page.getByText('Oatmeal with Blueberries')).toBeVisible({ timeout: 10000 });
        await expect(page.getByText('420 kcal').first()).toBeVisible();

        // 5. Water Hydration Logging
        const addWaterBtn = page.getByRole('button', { name: /\+250 ml/i });
        await addWaterBtn.click();
        await expect(page.getByText('250 /')).toBeVisible({ timeout: 10000 });
        await page.screenshot({ path: 'test-results/screenshots/04-diary-with-logged-entries.png' });

        // 6. Food Catalog & Custom Food Creation
        await page.locator('a[href="/foods"]').first().click({ force: true });
        await page.waitForURL('**/foods', { timeout: 10000 });
        await expect(page.getByRole('button', { name: /toggle sidebar/i })).toHaveCount(1);

        await page.getByRole('button', { name: /create custom food/i }).first().click();
        await page.waitForSelector('#custom-name');

        await page.fill('#custom-name', 'Greek Yogurt & Honey Bowl');
        await page.fill('#custom-brand', 'Homemade');
        await page.fill('#custom-cal', '310');
        await page.fill('#custom-pro', '28');
        await page.fill('#custom-carb', '35');
        await page.fill('#custom-fat', '6');

        await page.getByRole('button', { name: /save custom food/i }).click();

        // Verify custom food created
        await expect(page.getByText(/Greek Yogurt & Honey/i)).toBeVisible({ timeout: 10000 });
        await expect(page.getByText('310').first()).toBeVisible();
        await expect(page.locator('#custom-name')).toBeHidden({ timeout: 5000 });
        await page.screenshot({ path: 'test-results/screenshots/05-custom-food-created.png' });

        // 7. Adaptive Nutrition Strategy & Checkpoint Brief
        // Seed a pending adjustment with raw ISO timestamps to rigorously test UX formatting & layout
        execSync(
            `php artisan tinker --execute="\\$u = \\App\\Models\\User::where('email', '${testEmail}')->first(); \\App\\Models\\AdaptiveAdjustment::create(['user_id' => \\$u->id, 'review_date' => '2026-10-14', 'period_start' => '2026-10-07T00:00:00.000000Z', 'period_end' => '2026-10-14T00:00:00.000000Z', 'starting_weight_kg' => 80.0, 'ending_weight_kg' => 79.5, 'ewma_weight_change_kg' => -0.5, 'average_daily_calories' => 2050, 'calculated_tdee' => 2450, 'current_target_calories' => 2200, 'proposed_target_calories' => 2100, 'proposed_protein_g' => 160, 'proposed_carbs_g' => 200, 'proposed_fat_g' => 68, 'status' => 'pending']);"`,
            { cwd: process.cwd() }
        );

        await page.locator('a[href="/strategy"]').first().click({ force: true });
        await page.waitForURL('**/strategy', { timeout: 10000 });

        // UX Assertion 1: Single sidebar toggle (no double header nesting)
        await expect(page.getByRole('button', { name: /toggle sidebar/i })).toHaveCount(1);

        // UX Assertion 2: No unformatted raw ISO 8601 timestamps leaked into UI
        await expect(page.locator('body')).not.toHaveText(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);

        // UX Assertion 3: Clean, human-readable review window date range
        await expect(page.getByText(/Weekly Checkpoint Brief/i)).toBeVisible();
        await expect(page.getByText(/Decision Required/i)).toBeVisible();
        await expect(page.getByText(/Oct 7, 2026 to Oct 14, 2026/i)).toBeVisible();

        // UX Assertion 4: Comparative Plan Delta table has complete current -> proposed entries for all macros
        const comparisonCard = page.getByTestId('plan-comparison');
        await expect(comparisonCard).toBeVisible();
        await expect(comparisonCard.getByText(/Current → Proposed/i)).toBeVisible();
        await expect(comparisonCard.getByText('2200 kcal')).toBeVisible();
        await expect(comparisonCard.getByText('2100 kcal')).toBeVisible();
        await expect(comparisonCard.getByText('157 g')).toBeVisible();
        await expect(comparisonCard.getByText('160 g')).toBeVisible();
        await expect(comparisonCard.getByText('210 g')).toBeVisible();
        await expect(comparisonCard.getByText('200 g')).toBeVisible();
        await expect(comparisonCard.getByText('70 g')).toBeVisible();
        await expect(comparisonCard.getByText('68 g')).toBeVisible();

        // Accept the proposal and verify status update
        const acceptBtn = page.getByRole('button', { name: /accept & activate plan/i });
        await expect(acceptBtn).toBeVisible();
        await acceptBtn.click();
        await expect(page.getByText(/Decision Required/i)).toBeHidden({ timeout: 10000 });

        await expect(page.getByText(/Active Target Plan/i)).toBeVisible();
        await expect(page.getByText(/EWMA Weight Smoothing Trend/i)).toBeVisible();

        const recalcBtn = page.getByRole('button', { name: /recalculate trend/i });
        await expect(recalcBtn).toBeVisible();
        await recalcBtn.click();
        await page.screenshot({ path: 'test-results/screenshots/06-adaptive-strategy.png' });

        // 8. Reports & Data Exports
        await page.locator('a[href="/reports"]').first().click({ force: true });
        await page.waitForURL('**/reports', { timeout: 10000 });
        await expect(page.getByRole('button', { name: /toggle sidebar/i })).toHaveCount(1);
        await expect(page.locator('body')).not.toHaveText(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);

        await expect(page.getByRole('heading', { name: /reports & data exports/i })).toBeVisible();

        // Switch to CSV format
        await page.locator('button', { hasText: 'CSV' }).click();
        const exportBtn = page.getByRole('button', { name: /generate csv export/i });
        await expect(exportBtn).toBeVisible();
        await exportBtn.click();

        // Verify generated export file appears in history
        await expect(page.getByText(/CSV Report/i).first()).toBeVisible({ timeout: 15000 });
        await expect(page.getByRole('link', { name: /download/i }).first()).toBeVisible();
        await page.screenshot({ path: 'test-results/screenshots/07-reports-and-exports.png' });
    });
});
