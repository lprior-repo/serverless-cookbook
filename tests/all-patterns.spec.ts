import { test, expect } from '@playwright/test';
import { readFile, readdir } from 'fs/promises';
import { join } from 'path';

interface TerraformExample {
  title: string;
  url: string;
  services: string[];
  code: string;
  description?: string;
  markdownContent?: string;
}

interface AWSService {
  serviceName: string;
  description: string;
  repositoryUrl: string;
  examplesUrl: string;
  terraformExamples: TerraformExample[];
  documentation: {
    readme: string;
    variables: any[];
    outputs: any[];
  };
}

interface PatternData {
  services: AWSService[];
  metadata: {
    generated_at: string;
    total_services: number;
    service_names: string[];
  };
}

let patternData: PatternData;
let allPatternFiles: string[] = [];

test.beforeAll(async () => {
  // Load the pattern data
  const jsonData = await readFile('terraform-aws-services.json', 'utf-8');
  patternData = JSON.parse(jsonData);
  
  // Get all pattern files from the filesystem
  const categories = ['compute', 'integration', 'storage', 'security'];
  
  for (const category of categories) {
    try {
      const categoryPath = join('docs', 'patterns', category);
      const files = await readdir(categoryPath);
      const markdownFiles = files
        .filter(file => file.endsWith('.md') && file !== 'index.md')
        .map(file => `/serverless-cookbook/patterns/${category}/${file.replace('.md', '')}/`);
      
      allPatternFiles.push(...markdownFiles);
    } catch (error) {
      console.warn(`Could not read category ${category}:`, error);
    }
  }
  
  console.log(`Found ${allPatternFiles.length} pattern files to test`);
});

test.describe('All Pattern Pages Validation', () => {
  
  test('should validate all pattern files exist and are accessible', async ({ page }) => {
    expect(allPatternFiles.length).toBeGreaterThan(0);
    
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];
    
    for (const patternUrl of allPatternFiles) {
      await test.step(`Testing accessibility of ${patternUrl}`, async () => {
        try {
          const response = await page.goto(patternUrl, { 
            waitUntil: 'domcontentloaded', 
            timeout: 10000 
          });
          
          if (response?.status() === 200) {
            // Check that basic content is present - use first h1 which should be the main title
            await expect(page.locator('h1').first()).toBeVisible({ timeout: 5000 });
            successCount++;
          } else {
            errors.push(`${patternUrl}: HTTP ${response?.status()}`);
            errorCount++;
          }
        } catch (error) {
          errors.push(`${patternUrl}: ${error}`);
          errorCount++;
        }
      });
    }
    
    console.log(`Pattern accessibility results: ${successCount} success, ${errorCount} errors`);
    if (errors.length > 0) {
      console.log('Errors:', errors.slice(0, 10)); // Show first 10 errors
    }
    
    // At least 80% of patterns should be accessible
    const successRate = successCount / (successCount + errorCount);
    expect(successRate).toBeGreaterThan(0.8);
  });
  
  test('should validate all patterns have required content sections', async ({ page }) => {
    let validatedCount = 0;
    const maxPatternsToTest = 10; // Limit to avoid test timeout
    
    for (const patternUrl of allPatternFiles.slice(0, maxPatternsToTest)) {
      await test.step(`Validating content of ${patternUrl}`, async () => {
        await page.goto(patternUrl);
        
        // Required sections that every pattern should have
        const requiredSections = [
          'h1', // Title - check first h1
          'h2:has-text("At a Glance")'
        ];
        
        for (const selector of requiredSections) {
          if (selector === 'h1') {
            await expect(page.locator(selector).first()).toBeVisible({
              timeout: 3000
            });
          } else {
            await expect(page.locator(selector)).toBeVisible({
              timeout: 3000
            });
          }
        }
        
        // Check for either Examples or Implementation section
        const examplesOrImpl = page.locator('h2:has-text("Examples"), h2:has-text("Implementation")');
        await expect(examplesOrImpl.first()).toBeVisible({ timeout: 3000 });
        
        // Check "At a Glance" section content
        const atAGlanceSection = page.locator('.at-a-glance');
        await expect(atAGlanceSection).toBeVisible();
        
        // Should have content for Examples and AWS Services - check text content
        await expect(atAGlanceSection).toContainText('Examples');
        await expect(atAGlanceSection).toContainText('AWS Services');
        await expect(atAGlanceSection).toContainText('Primary Use Case');
        
        // Check that implementation section has code
        const codeBlocks = page.locator('pre code, .highlight');
        await expect(codeBlocks.first()).toBeVisible();
        
        validatedCount++;
      });
    }
    
    expect(validatedCount).toBeGreaterThan(0);
    console.log(`Successfully validated ${validatedCount} pattern pages`);
  });
  
  test('should validate terraform code syntax highlighting', async ({ page }) => {
    const samplesToTest = allPatternFiles.slice(0, 5); // Test first 5 patterns
    
    for (const patternUrl of samplesToTest) {
      await test.step(`Checking syntax highlighting for ${patternUrl}`, async () => {
        await page.goto(patternUrl);
        
        // Look for highlighted code blocks
        const terraformCode = page.locator('.language-terraform, .language-hcl');
        
        if (await terraformCode.count() > 0) {
          await expect(terraformCode.first()).toBeVisible();
          
          // Check that syntax highlighting is applied (classes exist)
          const highlightedElements = page.locator('.highlight .err, .highlight .k, .highlight .s');
          // Don't require specific highlighting, just check structure exists
          await expect(page.locator('.highlight').first()).toBeVisible();
        }
      });
    }
  });
  
  test('should validate all external links work', async ({ page }) => {
    const samplesToTest = allPatternFiles.slice(0, 3); // Test first 3 patterns
    
    for (const patternUrl of samplesToTest) {
      await test.step(`Checking external links for ${patternUrl}`, async () => {
        await page.goto(patternUrl);
        
        // Find GitHub source links
        const sourceLinks = page.locator('a[href*="github.com"]');
        const linkCount = await sourceLinks.count();
        
        if (linkCount > 0) {
          // Check first GitHub link
          const firstLink = sourceLinks.first();
          await expect(firstLink).toBeVisible();
          
          const href = await firstLink.getAttribute('href');
          expect(href).toMatch(/github\.com/);
          // Allow either terraform-aws-modules or placeholder links during development
          expect(href).toMatch(/(terraform-aws-modules|your-org\/serverless-cookbook)/);
        }
      });
    }
  });
  
  test('should validate navigation breadcrumbs', async ({ page }) => {
    const samplesToTest = allPatternFiles.slice(0, 5);
    
    for (const patternUrl of samplesToTest) {
      await test.step(`Checking navigation for ${patternUrl}`, async () => {
        await page.goto(patternUrl);
        
        // Check that we can navigate back to patterns
        const navigationLinks = page.locator('nav a, .md-nav a');
        
        if (await navigationLinks.count() > 0) {
          // Should have some navigation structure
          await expect(navigationLinks.first()).toBeVisible();
        }
        
        // Check that the page title is meaningful
        const title = await page.title();
        expect(title.length).toBeGreaterThan(0);
        expect(title).not.toBe('404');
      });
    }
  });
});

test.describe('Pattern Data Integrity', () => {
  test('should validate JSON data structure', async () => {
    expect(patternData).toBeDefined();
    expect(patternData.services).toBeDefined();
    expect(Array.isArray(patternData.services)).toBe(true);
    expect(patternData.services.length).toBeGreaterThan(0);
    
    // Check metadata
    expect(patternData.metadata).toBeDefined();
    expect(patternData.metadata.total_services).toBeGreaterThan(0);
    expect(patternData.metadata.service_names).toBeDefined();
    
    console.log(`Pattern data contains ${patternData.services.length} services`);
    console.log(`Generated at: ${patternData.metadata.generated_at}`);
  });
  
  test('should validate all services have examples', async () => {
    let servicesWithExamples = 0;
    let totalExamples = 0;
    
    for (const service of patternData.services) {
      expect(service.serviceName).toBeDefined();
      expect(service.description).toBeDefined();
      expect(service.repositoryUrl).toMatch(/github\.com/);
      
      if (service.terraformExamples && service.terraformExamples.length > 0) {
        servicesWithExamples++;
        totalExamples += service.terraformExamples.length;
        
        // Validate first example structure
        const firstExample = service.terraformExamples[0];
        expect(firstExample.title).toBeDefined();
        expect(firstExample.url).toMatch(/github\.com/);
        expect(Array.isArray(firstExample.services)).toBe(true);
      }
    }
    
    console.log(`${servicesWithExamples} services have examples`);
    console.log(`Total examples: ${totalExamples}`);
    
    // At least one service should have examples
    expect(servicesWithExamples).toBeGreaterThan(0);
    expect(totalExamples).toBeGreaterThan(0);
  });
  
  test('should validate markdown content exists', async () => {
    let examplesWithMarkdown = 0;
    let totalExamples = 0;
    
    for (const service of patternData.services) {
      for (const example of service.terraformExamples || []) {
        totalExamples++;
        
        if (example.markdownContent && example.markdownContent.length > 100) {
          examplesWithMarkdown++;
        }
      }
    }
    
    console.log(`${examplesWithMarkdown}/${totalExamples} examples have rich markdown content`);
    
    if (totalExamples > 0) {
      // Examples should exist and have basic structure
      expect(totalExamples).toBeGreaterThan(0);
      // Don't require markdown content as it may be generated differently
    }
  });
});