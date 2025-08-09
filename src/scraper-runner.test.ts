import { Effect } from 'effect';
import { readFile } from 'fs/promises';

// Mock Octokit to avoid ES module issues
jest.mock('@octokit/rest', () => ({
  Octokit: jest.fn().mockImplementation(() => ({
    rest: {
      repos: {
        getContent: jest.fn()
      }
    }
  }))
}));

describe('scraper-runner', () => {
  it('should generate JSON file with all 12 AWS services', async () => {
    const { runScraper } = await import('./scraper-runner.js');
    
    const result = await Effect.runPromise(runScraper());
    
    expect(result).toHaveProperty('services');
    expect(result).toHaveProperty('metadata');
    expect(result.services).toHaveLength(12);
    expect(result.metadata.total_services).toBe(12);
    expect(result.metadata.service_names).toContain('AWS Lambda');
  });

  it('should write terraform-aws-services.json file', async () => {
    const { runScraper } = await import('./scraper-runner.js');
    
    await Effect.runPromise(runScraper());
    
    const fileContent = await readFile('terraform-aws-services.json', 'utf-8');
    const data = JSON.parse(fileContent);
    
    expect(data).toHaveProperty('services');
    expect(data).toHaveProperty('metadata');
    expect(data.services).toHaveLength(12);
  });
});