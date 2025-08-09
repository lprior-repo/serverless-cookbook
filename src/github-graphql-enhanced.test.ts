import { describe, it, expect, vi } from 'vitest';
import { Effect } from 'effect';

const mockGraphqlClient = vi.fn();
vi.mock('@octokit/graphql', () => ({
  graphql: mockGraphqlClient,
}));

const { fetchTerraformPatternsWithRetries } = await import('./github-graphql-enhanced.js');

describe('GitHub GraphQL Enhanced with Retries', () => {
  it('should retry on 502 errors with exponential backoff', async () => {
    // Arrange
    const error502 = new Error('GraphQL failed: HttpError: 502 Bad Gateway');
    const successResponse = {
      repository: {
        object: {
          entries: [
            {
              name: 'test-terraform',
              type: 'tree',
              object: {
                entries: [
                  {
                    name: 'example-pattern.json',
                    type: 'blob',
                    object: {
                      text: JSON.stringify({
                        title: 'Test Pattern',
                        patternType: 'terraform',
                        services: ['s3']
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

    mockGraphqlClient
      .mockRejectedValueOnce(error502)
      .mockRejectedValueOnce(error502)
      .mockResolvedValueOnce(successResponse);

    // Act
    const result = await Effect.runPromise(fetchTerraformPatternsWithRetries());

    // Assert
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Test Pattern');
    expect(mockGraphqlClient).toHaveBeenCalledTimes(3); // 2 failures + 1 success
  }, 10000);

  it('should monitor and log rate limit information', async () => {
    // Arrange
    const responsWithRateLimit = {
      repository: { object: { entries: [] } },
      rateLimit: {
        remaining: 4500,
        limit: 5000,
        cost: 1
      }
    };

    const consoleSpy = vi.spyOn(console, 'log');
    mockGraphqlClient.mockResolvedValue(responsWithRateLimit);

    // Act
    await Effect.runPromise(fetchTerraformPatternsWithRetries());

    // Assert
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Rate limit: 4500/5000')
    );
    
    consoleSpy.mockRestore();
  });
});