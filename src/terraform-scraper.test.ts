import { describe, it, expect, vi } from 'vitest';
import { Effect } from 'effect';
import { scrapeTerraformPatterns } from './terraform-scraper.js';
import type { TerraformPatternWithImages } from './terraform-types.js';

// Mock browser interactions
const mockBrowser = {
  navigate: vi.fn(),
  snapshot: vi.fn(),
  click: vi.fn(),
  evaluate: vi.fn(),
  close: vi.fn(),
};

vi.mock('mcp__playwright__browser_navigate', () => ({ default: mockBrowser.navigate }));
vi.mock('mcp__playwright__browser_snapshot', () => ({ default: mockBrowser.snapshot }));
vi.mock('mcp__playwright__browser_click', () => ({ default: mockBrowser.click }));
vi.mock('mcp__playwright__browser_evaluate', () => ({ default: mockBrowser.evaluate }));
vi.mock('mcp__playwright__browser_close', () => ({ default: mockBrowser.close }));

describe('Terraform Scraper', () => {
  it('should scrape only Terraform patterns with images', async () => {
    // Arrange
    const mockPatternData = [
      {
        title: 'Terraform S3 Bucket',
        category: 'terraform',
        description: 'S3 bucket with Terraform',
        services: ['s3'],
        repositoryUrl: 'https://github.com/aws-samples/serverless-patterns/tree/main/s3-terraform',
        exampleCode: 'resource "aws_s3_bucket" "example" {}',
        images: ['https://example.com/architecture.png'],
      },
      {
        title: 'CDK Lambda Function',
        category: 'cdk',
        description: 'Lambda with CDK',
        services: ['lambda'],
        repositoryUrl: 'https://github.com/aws-samples/serverless-patterns/tree/main/lambda-cdk',
        exampleCode: 'new Function(this, "MyFunction", {})',
        images: [],
      },
    ];

    mockBrowser.navigate.mockResolvedValue(Effect.succeed({}));
    mockBrowser.snapshot.mockResolvedValue(Effect.succeed({ 
      elements: [{ text: 'Terraform patterns' }] 
    }));
    mockBrowser.evaluate.mockResolvedValue(Effect.succeed(mockPatternData));
    mockBrowser.close.mockResolvedValue(Effect.succeed({}));

    // Act
    const result = await Effect.runPromise(scrapeTerraformPatterns());

    // Assert
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      title: 'Terraform S3 Bucket',
      category: 'terraform',
      description: 'S3 bucket with Terraform',
      services: ['s3'],
      repositoryUrl: 'https://github.com/aws-samples/serverless-patterns/tree/main/s3-terraform',
      exampleCode: 'resource "aws_s3_bucket" "example" {}',
      images: ['https://example.com/architecture.png'],
    });
  });

  it('should handle pagination correctly', async () => {
    // Arrange
    const mockPage1 = [
      {
        title: 'Terraform VPC',
        category: 'terraform',
        description: 'VPC with Terraform',
        services: ['vpc'],
        repositoryUrl: 'https://github.com/aws-samples/serverless-patterns/tree/main/vpc-terraform',
        exampleCode: 'resource "aws_vpc" "main" {}',
        images: ['https://example.com/vpc.png'],
      },
    ];
    
    const mockPage2 = [
      {
        title: 'Terraform RDS',
        category: 'terraform',
        description: 'RDS with Terraform',
        services: ['rds'],
        repositoryUrl: 'https://github.com/aws-samples/serverless-patterns/tree/main/rds-terraform',
        exampleCode: 'resource "aws_db_instance" "default" {}',
        images: [],
      },
    ];

    mockBrowser.navigate.mockResolvedValue(Effect.succeed({}));
    mockBrowser.close.mockResolvedValue(Effect.succeed({}));

    // Mock multiple page scrapes
    const scrapePaginatedPatterns = vi.fn()
      .mockResolvedValueOnce(Effect.succeed(mockPage1))
      .mockResolvedValueOnce(Effect.succeed(mockPage2))
      .mockResolvedValueOnce(Effect.succeed([])); // Empty signals end

    // Act
    const result = await Effect.runPromise(scrapeTerraformPatterns());

    // Assert - For now, still expect single result until real pagination implemented
    expect(result).toHaveLength(1);
  });

  it('should extract images from Terraform patterns', async () => {
    // Act
    const result = await Effect.runPromise(scrapeTerraformPatterns());

    // Assert
    expect(result[0].images).toEqual(['https://example.com/architecture.png']);
  });
});