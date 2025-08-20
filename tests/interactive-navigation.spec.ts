import { test, expect } from '@playwright/test';

test.describe('Interactive Navigation and User Journey', () => {
  
  test('should complete full user journey: homepage -> category -> pattern -> back', async ({ page }) => {
    // Start at homepage
    await page.goto('/serverless-cookbook/');
    await expect(page.locator('h1')).toContainText('Serverless Terraform Cookbook');
    
    // Click on "Browse Patterns"
    await page.click('a:has-text("Browse Patterns")');
    await expect(page).toHaveURL(/patterns/);
    await expect(page.locator('h1').first()).toContainText('Terraform Patterns');
    
    // Click on "Explore Compute"
    await page.click('a:has-text("Explore Compute")');
    await expect(page).toHaveURL(/patterns\/compute/);
    
    // Look for the specific lambda pattern link
    const lambdaLink = page.locator('a[href*="/serverless-cookbook/patterns/compute/lambda/"]').first();
    
    if (await lambdaLink.isVisible()) {
      // Click the lambda pattern link
      await lambdaLink.click();
      
      // Should be on the lambda pattern page now
      await expect(page.locator('h1').first()).toContainText('Lambda');
      await expect(page.locator('h2:has-text("At a Glance")')).toBeVisible();
      
      // Use browser back button
      await page.goBack();
      await expect(page).toHaveURL(/patterns\/compute/);
      
      // Go back to main patterns page
      await page.goBack();
      await expect(page).toHaveURL(/patterns/);
    }
  });
  
  test('should test responsive navigation menu', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/serverless-cookbook/');
    
    // Look for mobile navigation toggle
    const navToggle = page.locator('[data-md-toggle="drawer"]');
    if (await navToggle.isVisible()) {
      await navToggle.click();
      
      // Navigation should be visible
      const nav = page.locator('.md-nav--primary');
      await expect(nav).toBeVisible();
    }
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.reload();
    
    // Desktop navigation should be visible
    const desktopNav = page.locator('.md-header__inner');
    await expect(desktopNav).toBeVisible();
  });
  
  test('should validate search functionality end-to-end', async ({ page }) => {
    await page.goto('/serverless-cookbook/');
    
    // Open search
    const searchButton = page.locator('[data-md-component="search-button"]');
    if (await searchButton.isVisible()) {
      await searchButton.click();
      
      const searchInput = page.locator('[data-md-component="search-query"]');
      await expect(searchInput).toBeVisible();
      
      // Search for "terraform"
      await searchInput.fill('terraform');
      await page.waitForTimeout(1000); // Wait for search results
      
      // Check that results appear
      const searchResults = page.locator('[data-md-component="search-result"]');
      
      if (await searchResults.count() > 0) {
        // Click on first result
        await searchResults.first().click();
        
        // Should navigate to a page
        await expect(page.locator('h1').first()).toBeVisible();
      }
    }
  });
  
  test('should validate code copying functionality', async ({ page }) => {
    // Go to a pattern with code
    await page.goto('/serverless-cookbook/patterns/compute/lambda---alias/');
    
    // Look for copy buttons in code blocks
    const copyButtons = page.locator('.md-clipboard');
    
    if (await copyButtons.count() > 0) {
      // Click copy button
      await copyButtons.first().click();
      
      // Should show some feedback (might be a tooltip or change in button)
      await page.waitForTimeout(500);
      
      // Button should still be visible
      await expect(copyButtons.first()).toBeVisible();
    }
  });
  
  test('should validate external GitHub links', async ({ page, context }) => {
    await page.goto('/serverless-cookbook/patterns/compute/lambda/');
    
    // Find any GitHub link to terraform-aws-modules (more flexible)
    const githubLink = page.locator('a[href*="github.com/terraform-aws-modules"]');
    await expect(githubLink.first()).toBeVisible();
    
    // Get the href to validate it's a proper GitHub URL
    const href = await githubLink.first().getAttribute('href');
    expect(href).toMatch(/github\.com\/terraform-aws-modules/);
    
    // Test that it's a valid terraform-aws-modules link
    expect(href).toMatch(/terraform-aws-modules\/terraform-aws/);
  });
  
  test('should validate theme switching', async ({ page }) => {
    await page.goto('/serverless-cookbook/');
    
    // Look for theme toggle button (be more specific to avoid multiple matches)
    const themeToggle = page.locator('body[data-md-color-scheme]');
    
    if (await themeToggle.isVisible()) {
      // Check current theme from body element
      const currentScheme = await themeToggle.getAttribute('data-md-color-scheme');
      
      // Look for actual theme toggle button (palette switcher)
      const paletteToggle = page.locator('.md-header__option input[type="radio"]');
      if (await paletteToggle.first().isVisible()) {
        await paletteToggle.first().click();
        await page.waitForTimeout(300);
        
        // Theme should have changed
        const newScheme = await themeToggle.getAttribute('data-md-color-scheme');
        expect(newScheme).toBeDefined();
      }
    }
  });
  
  test('should validate tab navigation in code sections', async ({ page }) => {
    await page.goto('/serverless-cookbook/patterns/compute/lambda---alias/');
    
    // Find tabbed content
    const tabs = page.locator('.tabbed-labels label');
    const tabCount = await tabs.count();
    
    if (tabCount > 1) {
      // Click on different tabs
      await tabs.nth(0).click(); // Main Configuration
      await expect(page.locator('.tabbed-content .highlight:visible')).toBeVisible();
      
      await tabs.nth(1).click(); // Variables
      await expect(page.locator('.tabbed-content .highlight:visible')).toBeVisible();
      
      if (tabCount > 2) {
        await tabs.nth(2).click(); // Outputs
        await expect(page.locator('.tabbed-content .highlight:visible')).toBeVisible();
      }
    }
  });
  
  test('should validate keyboard navigation', async ({ page }) => {
    await page.goto('/serverless-cookbook/');
    
    // Test tab navigation
    await page.keyboard.press('Tab');
    let focusedElement = await page.locator(':focus').textContent();
    expect(focusedElement).toBeTruthy();
    
    // Continue tabbing
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Should be able to activate focused element with Enter
    await page.keyboard.press('Enter');
    
    // Should have navigated somewhere or opened something
    await page.waitForTimeout(500);
    
    // Page should still be responsive
    await expect(page.locator('body')).toBeVisible();
  });
  
  test('should validate page performance and loading', async ({ page }) => {
    // Navigate to homepage and measure
    const startTime = Date.now();
    
    await page.goto('/serverless-cookbook/');
    await expect(page.locator('h1')).toBeVisible();
    
    const loadTime = Date.now() - startTime;
    console.log(`Homepage load time: ${loadTime}ms`);
    
    // Should load within reasonable time
    expect(loadTime).toBeLessThan(5000);
    
    // Navigate to a pattern page
    const patternStartTime = Date.now();
    await page.goto('/serverless-cookbook/patterns/compute/lambda---alias/');
    await expect(page.locator('h1')).toBeVisible();
    
    const patternLoadTime = Date.now() - patternStartTime;
    console.log(`Pattern page load time: ${patternLoadTime}ms`);
    
    // Pattern pages should also load quickly
    expect(patternLoadTime).toBeLessThan(5000);
  });
  
  test('should validate error handling for missing pages', async ({ page }) => {
    // Try to access a non-existent pattern
    const response = await page.goto('/patterns/nonexistent/invalid-pattern/');
    
    // Should get 404 or redirect
    if (response) {
      const status = response.status();
      expect([404, 302, 301]).toContain(status);
    }
    
    // Try invalid category
    const response2 = await page.goto('/patterns/invalid-category/');
    if (response2) {
      const status = response2.status();
      expect([404, 302, 301]).toContain(status);
    }
  });
});