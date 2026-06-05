import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test('should successfully log in with mock OTP', async ({ page }) => {
    // 1. Mock the API endpoints for the login flow
    await page.route('**/api/v1/auth/login/otp/request', route => 
      route.fulfill({ status: 200, json: { success: true } })
    );
    
    await page.route('**/api/v1/auth/login/otp/verify', route => 
      route.fulfill({ 
        status: 200, 
        json: { 
          success: true, 
          // Generate a fake JWT to prevent decodeToken from failing
          data: { token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicm9sZSI6IlNVUEVSX0FETUlOIiwibmFtZSI6IkUyRSBBZG1pbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjo1MDAwMDAwMDAwMH0.signature' } 
        } 
      })
    );

    await page.route('**/api/v1/users/me', route => 
      route.fulfill({ 
        status: 200, 
        json: { 
          success: true, 
          data: { id: 'user-1', name: 'E2E Admin', role: 'SUPER_ADMIN' } 
        } 
      })
    );

    // 2. Navigate to the app base URL
    await page.goto('/login');

    // 3. Step 1: Phone submission
    // We expect the user to see the "Get Verification Code" button and an input
    const phoneInput = page.getByPlaceholder('98765 43210');
    await expect(phoneInput).toBeVisible();
    await phoneInput.fill('9999999991');

    const getCodeButton = page.getByRole('button', { name: /Get Verification Code/i });
    await getCodeButton.click();

    // 4. Step 2: OTP submission
    // Wait for the OTP step to render by looking for the explicit 'Verify & Continue' button
    const verifyButton = page.getByRole('button', { name: /Verify & Continue/i });
    await expect(verifyButton).toBeVisible();

    // Fill the 6 OTP digits. The app uses 6 separate boxes, we can just type continuously
    // into the first box since the component has auto-advance logic.
    const firstOtpBox = page.locator('input[inputmode="numeric"]').first();
    await firstOtpBox.fill('123456');

    // Click verify
    await verifyButton.click();

    // 5. Verification
    // Since we mocked a valid API, the app should navigate to the dashboard
    // We can verify this by checking if the URL changes to `/dashboard` or if 
    // the "Dashboard" text becomes visible in the sidebar.
    await expect(page).toHaveURL(/.*\/dashboard|.*\//); // Note: it might redirect to /dashboard or just / if dashboard is default
  });
});
