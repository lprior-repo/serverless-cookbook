import { Effect } from 'effect';
import { Octokit } from '@octokit/rest';
import { 
  fetchTerraformExample, 
  formatExampleAsMarkdown,
  type TerraformExampleFiles 
} from './terraform-example-fetcher.js';

describe('terraform-example-fetcher', () => {
  describe('fetchTerraformExample', () => {
    it('should fetch all files from a terraform example directory', async () => {
      const mockOctokit = {
        rest: {
          repos: {
            getContent: jest.fn()
          }
        }
      } as unknown as Octokit;

      const mockFiles = [
        { name: 'main.tf', type: 'file' },
        { name: 'README.md', type: 'file' },
        { name: 'variables.tf', type: 'file' },
        { name: 'outputs.tf', type: 'file' }
      ];

      const mockFileContent = {
        content: Buffer.from('test content').toString('base64'),
        encoding: 'base64'
      };

      (mockOctokit.rest.repos.getContent as jest.Mock)
        .mockResolvedValueOnce({ data: mockFiles })
        .mockResolvedValue({ data: mockFileContent });

      const result = await Effect.runPromise(
        fetchTerraformExample(mockOctokit, 'terraform-aws-modules', 'terraform-aws-lambda', 'examples/simple')
      );

      expect(result.files).toHaveLength(4);
      expect(result.files.map(f => f.name)).toEqual(['main.tf', 'README.md', 'variables.tf', 'outputs.tf']);
    });

    it('should handle empty directories gracefully', async () => {
      const mockOctokit = {
        rest: {
          repos: {
            getContent: jest.fn().mockResolvedValue({ data: [] })
          }
        }
      } as unknown as Octokit;

      const result = await Effect.runPromise(
        fetchTerraformExample(mockOctokit, 'owner', 'repo', 'path')
      );

      expect(result.files).toHaveLength(0);
    });
  });

  describe('formatExampleAsMarkdown', () => {
    it('should format terraform files as markdown with proper code blocks', () => {
      const exampleFiles: TerraformExampleFiles = {
        path: 'examples/simple',
        files: [
          {
            name: 'main.tf',
            content: 'resource "aws_lambda_function" "example" {}',
            type: 'terraform'
          },
          {
            name: 'README.md',
            content: '# Simple Example\nThis is a test.',
            type: 'markdown'
          }
        ]
      };

      const result = formatExampleAsMarkdown(exampleFiles);

      expect(result).toContain('# Terraform Example: examples/simple');
      expect(result).toContain('## main.tf');
      expect(result).toContain('```hcl');
      expect(result).toContain('resource "aws_lambda_function" "example" {}');
      expect(result).toContain('```');
      expect(result).toContain('## README.md');
      expect(result).toContain('# Simple Example\nThis is a test.');
    });

    it('should handle files with different extensions appropriately', () => {
      const exampleFiles: TerraformExampleFiles = {
        path: 'examples/test',
        files: [
          {
            name: 'variables.tf',
            content: 'variable "test" {}',
            type: 'terraform'
          },
          {
            name: 'package.json',
            content: '{"name": "test"}',
            type: 'json'
          }
        ]
      };

      const result = formatExampleAsMarkdown(exampleFiles);

      expect(result).toContain('```hcl');
      expect(result).toContain('```json');
    });
  });
});