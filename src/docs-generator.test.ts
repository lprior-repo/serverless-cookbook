import { generatePatternMarkdown, extractServiceTags, generateDifficultyLevel } from './docs-generator.js';
import type { AWSService } from './serverless-tf-extractor.js';

describe('docs-generator', () => {
  const mockService: AWSService = {
    serviceName: 'AWS Lambda',
    description: 'AWS Lambda lets you run code without provisioning or managing servers.',
    repositoryUrl: 'https://github.com/terraform-aws-modules/terraform-aws-lambda',
    examplesUrl: 'https://github.com/terraform-aws-modules/terraform-aws-lambda/tree/master/examples',
    terraformExamples: [
      {
        title: 'AWS Lambda - simple',
        url: 'https://github.com/terraform-aws-modules/terraform-aws-lambda/tree/master/examples/simple',
        services: ['aws-lambda'],
        code: 'resource "aws_lambda_function" "example" {}',
        description: 'Simple Lambda example',
        markdownContent: '# Simple Example\n\n## main.tf\n\n```hcl\nresource "aws_lambda_function" "example" {}\n```'
      }
    ],
    documentation: {
      readme: '# AWS Lambda Module\n\nThis module creates Lambda functions.',
      variables: [],
      outputs: []
    }
  };

  describe('extractServiceTags', () => {
    it('should extract service tags from example', () => {
      const tags = extractServiceTags(mockService.terraformExamples[0]!);
      expect(tags).toContain('lambda');
      expect(tags).toContain('serverless');
      expect(tags).toContain('simple');
    });
  });

  describe('generateDifficultyLevel', () => {
    it('should return beginner for simple examples', () => {
      const difficulty = generateDifficultyLevel(mockService.terraformExamples[0]!);
      expect(difficulty).toBe('beginner');
    });

    it('should return intermediate for complex examples', () => {
      const complexExample = {
        ...mockService.terraformExamples[0]!,
        title: 'AWS Lambda - container-image-with-vpc-and-security-groups'
      };
      const difficulty = generateDifficultyLevel(complexExample);
      expect(difficulty).toBe('intermediate');
    });
  });

  describe('generatePatternMarkdown', () => {
    it('should generate valid markdown with frontmatter', () => {
      const markdown = generatePatternMarkdown(mockService, mockService.terraformExamples[0]!);
      
      expect(markdown).toContain('---');
      expect(markdown).toContain('title: Simple');
      expect(markdown).toContain('description:');
      expect(markdown).toContain('tags:');
      expect(markdown).toContain('# Simple');
      expect(markdown).toContain('## At a Glance');
      expect(markdown).toContain('## Implementation');
      expect(markdown).toContain('```terraform');
    });

    it('should handle missing markdown content gracefully', () => {
      const exampleWithoutMarkdown = {
        ...mockService.terraformExamples[0]!,
        markdownContent: undefined
      };
      
      const markdown = generatePatternMarkdown(mockService, exampleWithoutMarkdown);
      expect(markdown).toContain('# Simple');
      expect(markdown).not.toContain('undefined');
    });
  });
});