import { describe, it, expect } from 'vitest';
import { Effect } from 'effect';
import { graphql } from '@octokit/graphql';
import { config } from 'dotenv';

config();

describe('GitHub GraphQL E2E Integration', () => {
  it('should connect to GitHub GraphQL API successfully', async () => {
    // Arrange - Simple query to test connectivity
    const simpleQuery = `
      query {
        viewer {
          login
        }
      }
    `;

    // Act - Test basic GraphQL connectivity
    const result = await Effect.runPromise(
      Effect.tryPromise({
        try: () => graphql({
          query: simpleQuery,
          headers: {
            authorization: `token ${process.env.GITHUB_TOKEN}`,
          },
        }),
        catch: (error) => new Error(`GraphQL connectivity failed: ${String(error)}`)
      })
    );

    // Assert - Verify we can connect and get user info
    expect(result).toHaveProperty('viewer');
    expect(result.viewer).toHaveProperty('login');
    expect(typeof result.viewer.login).toBe('string');
  }, 15000);

  it('should fetch repository structure successfully', async () => {
    // Arrange - Simple repository query
    const repoQuery = `
      query {
        repository(owner: "octocat", name: "Hello-World") {
          name
          description
          object(expression: "HEAD:") {
            ... on Tree {
              entries {
                name
                type
              }
            }
          }
        }
      }
    `;

    // Act - Test repository structure query
    const result = await Effect.runPromise(
      Effect.tryPromise({
        try: () => graphql({
          query: repoQuery,
          headers: {
            authorization: `token ${process.env.GITHUB_TOKEN}`,
          },
        }),
        catch: (error) => new Error(`Repository query failed: ${String(error)}`)
      })
    );

    // Assert - Verify repository data structure  
    expect(result).toHaveProperty('repository');
    expect(result.repository).toHaveProperty('name', 'Hello-World');
    expect(result.repository.object).toHaveProperty('entries');
    expect(Array.isArray(result.repository.object.entries)).toBe(true);
  }, 15000);
});