import { describe, it, expect, vi } from 'vitest';
import { Effect } from 'effect';
import { ingestServerlessTfModules, filterTerraformModules, extractTerraformPattern, buildServerlessTerraformCookbook, generateJsonOutput, writeJsonToFile, buildAndSaveCookbook } from './serverless-land-builder';
import { type OctokitClient, type Repository } from './types';

describe('ServerlessLandBuilder', () => {
  describe('ingestServerlessTfModules', () => {
    it('should fetch repositories from serverless-tf organization using Effect', async () => {
      const mockRepos: readonly Repository[] = [
        { name: 'test-repo', clone_url: 'https://github.com/serverless-tf/test-repo.git' }
      ];
      
      const mockOctokit: OctokitClient = {
        repos: {
          listForOrg: vi.fn().mockResolvedValue({ data: mockRepos })
        }
      };

      const effect = ingestServerlessTfModules(mockOctokit);
      const result = await Effect.runPromise(effect);
      
      expect(mockOctokit.repos.listForOrg).toHaveBeenCalledWith({
        org: 'serverless-tf',
        type: 'public',
        per_page: 100
      });
      expect(result).toEqual(mockRepos);
    });

    it('should return typed Repository array', async () => {
      const mockRepos = [
        { name: 'typed-repo', clone_url: 'https://github.com/serverless-tf/typed-repo.git' }
      ];
      
      const mockOctokit = {
        repos: {
          listForOrg: vi.fn().mockResolvedValue({ data: mockRepos })
        }
      };

      const effect = ingestServerlessTfModules(mockOctokit);
      const result = await Effect.runPromise(effect);
      
      // This should be typed as Repository[]
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('clone_url');
      expect(typeof result[0].name).toBe('string');
      expect(typeof result[0].clone_url).toBe('string');
    });
  });

  describe('filterTerraformModules', () => {
    it('should filter repositories that contain terraform modules', () => {
      const repositories: readonly Repository[] = [
        { name: 'terraform-aws-lambda', clone_url: 'https://github.com/serverless-tf/terraform-aws-lambda.git' },
        { name: 'regular-repo', clone_url: 'https://github.com/serverless-tf/regular-repo.git' },
        { name: 'tf-module-dynamodb', clone_url: 'https://github.com/serverless-tf/tf-module-dynamodb.git' }
      ];

      const result = filterTerraformModules(repositories);
      
      expect(result).toHaveLength(2);
      expect(result).toEqual([
        { name: 'terraform-aws-lambda', clone_url: 'https://github.com/serverless-tf/terraform-aws-lambda.git' },
        { name: 'tf-module-dynamodb', clone_url: 'https://github.com/serverless-tf/tf-module-dynamodb.git' }
      ]);
    });
  });

  describe('extractTerraformPattern', () => {
    it('should extract pattern information from terraform files', () => {
      const repository: Repository = {
        name: 'terraform-aws-lambda',
        clone_url: 'https://github.com/serverless-tf/terraform-aws-lambda.git'
      };

      const terraformContent = `resource "aws_lambda_function" "example" {
  filename         = "lambda_function_payload.zip"
  function_name    = "lambda_function_name"
  role            = aws_iam_role.iam_for_lambda.arn
  handler         = "index.test"
  runtime         = "nodejs18.x"
}

resource "aws_iam_role" "iam_for_lambda" {
  name = "iam_for_lambda"
}`;

      const result = extractTerraformPattern(repository, terraformContent);

      expect(result.title).toBe('terraform-aws-lambda');
      expect(result.repository_url).toBe('https://github.com/serverless-tf/terraform-aws-lambda.git');
      expect(result.services).toContain('lambda');
      expect(result.services).toContain('iam');
      expect(result.example_code).toBe(terraformContent);
    });
  });

  describe('buildServerlessTerraformCookbook', () => {
    it('should build complete terraform pattern collection', async () => {
      const mockRepos: readonly Repository[] = [
        { name: 'terraform-aws-lambda', clone_url: 'https://github.com/serverless-tf/terraform-aws-lambda.git' },
        { name: 'regular-repo', clone_url: 'https://github.com/serverless-tf/regular-repo.git' }
      ];
      
      const mockOctokit: OctokitClient = {
        repos: {
          listForOrg: vi.fn().mockResolvedValue({ data: mockRepos }),
          getContent: vi.fn().mockResolvedValue({
            data: {
              content: Buffer.from('resource "aws_lambda_function" "test" {}').toString('base64')
            }
          })
        }
      };

      const effect = buildServerlessTerraformCookbook(mockOctokit);
      const result = await Effect.runPromise(effect);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('title', 'terraform-aws-lambda');
      expect(result[0]).toHaveProperty('services');
      expect(result[0].services).toContain('lambda');
    });
  });

  describe('generateJsonOutput', () => {
    it('should generate structured JSON output with metadata', () => {
      const patterns = [
        {
          title: 'terraform-aws-lambda',
          description: 'aws lambda using lambda',
          category: 'compute',
          services: ['lambda'],
          repository_url: 'https://github.com/serverless-tf/terraform-aws-lambda.git',
          example_code: 'resource "aws_lambda_function" "test" {}'
        },
        {
          title: 'terraform-aws-dynamodb',
          description: 'aws dynamodb using dynamodb',
          category: 'database',
          services: ['dynamodb'],
          repository_url: 'https://github.com/serverless-tf/terraform-aws-dynamodb.git',
          example_code: 'resource "aws_dynamodb_table" "test" {}'
        }
      ] as const;

      const result = generateJsonOutput(patterns);
      const parsed = JSON.parse(result);
      
      expect(parsed).toHaveProperty('patterns');
      expect(parsed).toHaveProperty('metadata');
      expect(parsed.patterns).toHaveLength(2);
      expect(parsed.metadata).toHaveProperty('total_patterns', 2);
      expect(parsed.metadata).toHaveProperty('categories');
      expect(parsed.metadata.categories).toContain('compute');
      expect(parsed.metadata.categories).toContain('database');
      expect(parsed.metadata).toHaveProperty('generated_at');
    });
  });

  describe('writeJsonToFile', () => {
    it('should write JSON content to serverless-cookbook.json file', async () => {
      const jsonContent = '{"test": "data"}';

      const effect = writeJsonToFile(jsonContent);
      const result = await Effect.runPromise(effect);
      
      // Since we can't easily mock fs in this context, just verify the function doesn't throw
      expect(result).toBeUndefined();
      
      // Verify the file exists and contains correct content
      const fs = await import('fs/promises');
      const fileContent = await fs.readFile('./serverless-cookbook.json', 'utf8');
      expect(fileContent).toBe(jsonContent);
      
      // Clean up
      await fs.unlink('./serverless-cookbook.json').catch(() => {});
    });
  });

  describe('buildAndSaveCookbook', () => {
    it('should build cookbook and save to file', async () => {
      const mockRepos: readonly Repository[] = [
        { name: 'terraform-aws-lambda', clone_url: 'https://github.com/serverless-tf/terraform-aws-lambda.git' }
      ];
      
      const mockOctokit: OctokitClient = {
        repos: {
          listForOrg: vi.fn().mockResolvedValue({ data: mockRepos })
        }
      };

      const effect = buildAndSaveCookbook(mockOctokit);
      await Effect.runPromise(effect);
      
      // Verify the file was created and contains valid JSON
      const fs = await import('fs/promises');
      const fileContent = await fs.readFile('./serverless-cookbook.json', 'utf8');
      const parsed = JSON.parse(fileContent);
      
      expect(parsed).toHaveProperty('patterns');
      expect(parsed).toHaveProperty('metadata');
      expect(parsed.patterns).toHaveLength(1);
      
      // Clean up
      await fs.unlink('./serverless-cookbook.json').catch(() => {});
    });
  });
});