import { Effect } from 'effect';

describe('Environment Validator', () => {
  it('should validate GitHub token is present for real data extraction', async () => {
    const { validateGitHubToken } = await import('./environment-validator.js');
    
    // Mock environment without token
    const originalToken = process.env.GITHUB_TOKEN;
    delete process.env.GITHUB_TOKEN;
    
    const result = await Effect.runPromise(
      Effect.either(validateGitHubToken())
    );
    
    expect(result._tag).toBe('Left');
    
    // Restore
    if (originalToken) process.env.GITHUB_TOKEN = originalToken;
  });
});