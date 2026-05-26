import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('Login page should render and contain Google OAuth button', async ({ page }) => {
    // Navigate to the login page
    await page.goto('/login')
    
    // Verify the page title or a specific heading to ensure it loaded
    await expect(page.locator('text=Welcome back')).toBeVisible()
    
    // Check for the Google login button specifically
    const googleBtn = page.locator('button:has-text("Continue with Google")')
    await expect(googleBtn).toBeVisible()
  })

  test('Clicking Google login should initiate OAuth redirect', async ({ page }) => {
    await page.goto('/login')
    
    // Listen for the request or navigation
    // We expect clicking this button to redirect us to accounts.google.com
    const googleBtn = page.locator('button:has-text("Continue with Google")')
    
    // We wrap the click in a Promise.all to wait for the navigation
    // Because Google's auth page is external, we just wait for the URL to change
    // to include accounts.google.com
    
    const [request] = await Promise.all([
      page.waitForRequest((req) => req.url().includes('accounts.google.com')),
      googleBtn.click()
    ])

    expect(request.url()).toContain('accounts.google.com')
  })
})
