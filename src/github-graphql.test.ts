import { describe, it, expect, vi } from 'vitest';
import { Effect } from 'effect';

const mockGraphqlClient = vi.fn();
vi.mock('@octokit/graphql', () => ({
  graphql: mockGraphqlClient,
}));

const { fetchTerraformPatterns } = await import('./github-graphql.js');

describe('GitHub GraphQL Terraform Fetcher', () => {
  it('should fetch Terraform patterns with single GraphQL query', async () => {
    // Arrange
    const mockResponse = {
      repository: {
        object: {
          entries: [
            {
              name: 'apigw-lambda-terraform',
              type: 'tree',
              object: {
                entries: [
                  {
                    name: 'example-pattern.json',
                    type: 'blob',
                    object: {
                      text: JSON.stringify({
                        title: 'API Gateway to Lambda',
                        patternType: 'terraform',
                        services: ['apigateway', 'lambda']
                      })
                    }
                  }
                ]
              }
            }
          ]
        }
      }
    };

    mockGraphqlClient.mockResolvedValue(mockResponse);

    // Act
    const result = await Effect.runPromise(fetchTerraformPatterns());

    // Assert
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('API Gateway to Lambda');
    expect(mockGraphqlClient).toHaveBeenCalledWith({
      query: expect.stringContaining('repository'),
      owner: 'aws-samples',
      name: 'serverless-patterns'
    });
  });

  it('should process GraphQL response and extract Terraform patterns only', async () => {
    // Arrange
    const mockResponse = {
      repository: {
        object: {
          entries: [
            {
              name: 's3-lambda-terraform',
              type: 'tree',
              object: {
                entries: [
                  {
                    name: 'example-pattern.json',
                    type: 'blob',
                    object: {
                      text: JSON.stringify({
                        title: 'S3 to Lambda with Terraform',
                        patternType: 'terraform',
                        services: ['s3', 'lambda']
                      })
                    }
                  }
                ]
              }
            },
            {
              name: 'apigw-lambda-sam',
              type: 'tree',
              object: {
                entries: [
                  {
                    name: 'example-pattern.json',
                    type: 'blob',
                    object: {
                      text: JSON.stringify({
                        title: 'API Gateway to Lambda with SAM',
                        patternType: 'sam',
                        services: ['apigateway', 'lambda']
                      })
                    }
                  }
                ]
              }
            }
          ]
        }
      }
    };

    mockGraphqlClient.mockResolvedValue(mockResponse);

    // Act
    const result = await Effect.runPromise(fetchTerraformPatterns());

    // Assert
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('S3 to Lambda with Terraform');
  });
});