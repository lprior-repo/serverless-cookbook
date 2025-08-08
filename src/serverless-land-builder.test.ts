import { describe, it, expect, vi } from 'vitest';
import { Effect } from 'effect';
import { ingestServerlessTfModules, filterTerraformModules, extractTerraformPattern, buildServerlessTerraformCookbook } from './serverless-land-builder';
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
});