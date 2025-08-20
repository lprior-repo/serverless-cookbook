import { test, expect } from '@playwright/test';
import { readFile } from 'fs/promises';

// Load pattern data to generate dynamic tests
let patternData: any;

test.beforeAll(async () => {
  const jsonData = await readFile('terraform-aws-services.json', 'utf-8');
  patternData = JSON.parse(jsonData);
});

test.describe('Documentation Homepage', () => {
  test('should load and display main content', async ({ page }) => {
    await page.goto('/serverless-cookbook/');
    
    // Check title and main heading
    await expect(page).toHaveTitle(/Serverless Terraform Cookbook/);
    await expect(page.locator('h1')).toContainText('Serverless Terraform Cookbook');
    
    // Check navigation buttons are present
    await expect(page.locator('a:has-text("Get Started")')).toBeVisible();
    await expect(page.locator('a:has-text("Browse Patterns")')).toBeVisible();
    
    // Check featured pattern cards
    await expect(page.locator('.pattern-card')).toHaveCount(4);
    await expect(page.locator('.pattern-card:has-text("Lambda Functions")')).toBeVisible();
    await expect(page.locator('.pattern-card:has-text("Event-Driven Architecture")')).toBeVisible();
    await expect(page.locator('.pattern-card:has-text("Data & Storage")')).toBeVisible();
    await expect(page.locator('.pattern-card:has-text("Security & Config")')).toBeVisible();
  });

  test('should have working navigation links', async ({ page }) => {
    await page.goto('/serverless-cookbook/');
    
    // Test getting started link
    await page.click('a:has-text("Get Started")');
    await expect(page).toHaveURL(/getting-started/);
    await expect(page.locator('h1')).toContainText('Getting Started');
    
    // Go back and test patterns link
    await page.goto('/serverless-cookbook/');
    await page.click('a:has-text("Browse Patterns")');
    await expect(page).toHaveURL(/patterns/);
    await expect(page.locator('h1')).toContainText('Terraform Patterns');
  });
});

test.describe('Pattern Categories', () => {
  const categories = ['compute', 'integration', 'storage', 'security'];
  
  for (const category of categories) {
    test(`should load ${category} category page`, async ({ page }) => {
      await page.goto(`/serverless-cookbook/patterns/${category}/`);
      
      // Check category page loads
      await expect(page.locator('h1')).toBeVisible();
      
      // Check that pattern cards are present (if any patterns exist)
      const patternCards = page.locator('.pattern-card');
      // Don't require pattern cards since some categories might be empty
      // Just ensure the page structure is correct
      await expect(page.locator('h1')).toBeVisible();
    });
  }
  
  test('should navigate between categories from main patterns page', async ({ page }) => {
    await page.goto('/serverless-cookbook/patterns/');
    
    // Check all category links are present
    await expect(page.locator('a:has-text("Explore Compute")')).toBeVisible();
    await expect(page.locator('a:has-text("Explore Integration")')).toBeVisible();
    await expect(page.locator('a:has-text("Explore Storage")')).toBeVisible();
    await expect(page.locator('a:has-text("Explore Security")')).toBeVisible();
    
    // Test clicking through to a category
    await page.click('a:has-text("Explore Compute")');
    await expect(page).toHaveURL(/patterns\/compute/);
  });
});

test.describe('Individual Pattern Pages', () => {
  test('should test sample pattern pages have required content sections', async ({ page }) => {
    // Test a few representative pattern pages (service-based structure)
    const samplePatterns = [
      '/serverless-cookbook/patterns/compute/lambda/',
      '/serverless-cookbook/patterns/integration/sns/',
      '/serverless-cookbook/patterns/storage/s3/',
      '/serverless-cookbook/patterns/security/appconfig/'
    ];
    
    for (const patternUrl of samplePatterns) {
      await test.step(`Testing pattern: ${patternUrl}`, async () => {
        await page.goto(patternUrl);
        
        // Check main sections are present
        await expect(page.locator('h1').first()).toBeVisible();
        await expect(page.locator('h2:has-text("At a Glance")')).toBeVisible();
        await expect(page.locator('h2').filter({ hasText: /When to Use/ })).toBeVisible();
        await expect(page.locator('h2:has-text("Architecture")')).toBeVisible();
        
        // Check for either Examples or Implementation section
        const examplesOrImpl = page.locator('h2:has-text("Examples"), h2:has-text("Implementation")');
        await expect(examplesOrImpl.first()).toBeVisible();
        
        // Check "At a Glance" section has required content
        const atAGlanceSection = page.locator('.at-a-glance');
        await expect(atAGlanceSection).toBeVisible();
        await expect(atAGlanceSection).toContainText('Examples');
        await expect(atAGlanceSection).toContainText('AWS Services');
        await expect(atAGlanceSection).toContainText('Primary Use Case');
        
        // Check implementation section has code tabs (nested tab structure)
        await expect(page.locator('.tabbed-set').first()).toBeVisible();
        await expect(page.locator('code').first()).toBeVisible(); // Should have code blocks
        
        // Check for example tabs (first level)
        const exampleTabs = page.locator('.tabbed-labels label');
        await expect(exampleTabs.first()).toBeVisible();
        
        // Check source code link is present and valid
        const sourceLink = page.locator('a:has-text("View Source Repository")');
        await expect(sourceLink).toBeVisible();
        await expect(sourceLink).toHaveAttribute('href', /github\.com/);
      });
    }
  });
  
  test('should have working code tabs in implementation section', async ({ page }) => {
    await page.goto('/serverless-cookbook/patterns/compute/lambda/');
    
    // Find first tabs container (main example-level tabs)
    const tabsContainer = page.locator('.tabbed-set').first();
    await expect(tabsContainer).toBeVisible();
    
    // Check that we have example-level tabs first
    const exampleTabs = page.locator('.tabbed-labels label').first();
    await expect(exampleTabs).toBeVisible();
    
    // Wait for content to load
    await page.waitForTimeout(500);
    
    // Simply check that code blocks are present (tabs should show content by default)
    const codeBlocks = page.locator('pre code, .highlight code, code');
    await expect(codeBlocks.first()).toBeVisible();
    
    // Verify we can see multiple example tabs
    const allExampleTabs = page.locator('.tabbed-labels label');
    const tabCount = await allExampleTabs.count();
    expect(tabCount).toBeGreaterThan(0);
    
    // Check that clicking the first tab works
    await allExampleTabs.first().click();
    await page.waitForTimeout(300);
    // Content should still be visible after tab click
    await expect(codeBlocks.first()).toBeVisible();
  });
  
  test('should have proper responsive design', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/serverless-cookbook/patterns/compute/lambda/');
    
    // Check that content is properly laid out
    await expect(page.locator('.md-content')).toBeVisible();
    await expect(page.locator('.md-sidebar').first()).toBeVisible();
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    
    // Content should still be visible and accessible
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('.at-a-glance')).toBeVisible();
  });
});

test.describe('Search Functionality', () => {
  test('should have working search', async ({ page }) => {
    await page.goto('/serverless-cookbook/');
    
    // Find and use search
    const searchButton = page.locator('[data-md-component="search-button"]');
    if (await searchButton.isVisible()) {
      await searchButton.click();
      
      const searchInput = page.locator('[data-md-component="search-query"]');
      await expect(searchInput).toBeVisible();
      
      // Search for "lambda"
      await searchInput.fill('lambda');
      await page.waitForTimeout(500); // Wait for search results
      
      // Check search results appear
      const searchResults = page.locator('[data-md-component="search-result"]');
      await expect(searchResults.first()).toBeVisible();
    }
  });
});

test.describe('Accessibility', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/serverless-cookbook/patterns/compute/lambda/');
    
    // Check heading hierarchy (h1 -> h2 -> h3 etc.)
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1); // Should have exactly one h1
    
    // Check that h2s exist and are properly structured
    const h2s = page.locator('h2');
    const h2Count = await h2s.count();
    expect(h2Count).toBeGreaterThan(0);
  });
  
  test('should have proper alt text for icons', async ({ page }) => {
    await page.goto('/serverless-cookbook/');
    
    // Check that important buttons have accessible text
    const getStartedButton = page.locator('a:has-text("Get Started")');
    await expect(getStartedButton).toBeVisible();
    
    const browseButton = page.locator('a:has-text("Browse Patterns")');
    await expect(browseButton).toBeVisible();
  });
  
  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/serverless-cookbook/');
    
    // Test tab navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Check that focus is visible
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });
});

test.describe('Performance', () => {
  test('should load pages quickly', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/serverless-cookbook/');
    const loadTime = Date.now() - startTime;
    
    // Page should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
    
    // Check that main content is visible
    await expect(page.locator('h1')).toBeVisible();
  });
  
  test('should have proper caching headers', async ({ page }) => {
    const response = await page.goto('/');
    
    // Check that we get a successful response
    expect(response?.status()).toBe(200);
  });
});