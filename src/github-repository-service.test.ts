import { Effect } from 'effect';

describe('GitHub Repository Service', () => {
  it('should fetch repository README content', async () => {
    const { fetchRepositoryReadme } = await import('./github-repository-service.js');
    
    expect(fetchRepositoryReadme).toBeDefined();
    expect(typeof fetchRepositoryReadme).toBe('function');
  });

  it('should extract owner and repo from GitHub URL', async () => {
    const { extractRepositoryInfo } = await import('./github-repository-service.js');
    
    const resultEffect = extractRepositoryInfo('https://github.com/terraform-aws-modules/terraform-aws-lambda');
    const result = Effect.runSync(resultEffect);
    
    expect(result.owner).toBe('terraform-aws-modules');
    expect(result.repo).toBe('terraform-aws-lambda');
  });

  it('should fail for invalid GitHub URL', async () => {
    const { extractRepositoryInfo } = await import('./github-repository-service.js');
    
    const resultEffect = extractRepositoryInfo('invalid-url');
    
    expect(() => Effect.runSync(resultEffect)).toThrow('Invalid GitHub URL: invalid-url');
  });
});