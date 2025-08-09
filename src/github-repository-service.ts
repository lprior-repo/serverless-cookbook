import { Effect } from 'effect';
import { Octokit } from '@octokit/rest';

export const fetchRepositoryReadme = (octokit: Readonly<Octokit>, owner: string, repo: string): Effect.Effect<string, Error> =>
  Effect.tryPromise({
    try: async () => {
      const response = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: 'README.md'
      });
      
      return 'content' in response.data
        ? Buffer.from(response.data.content, 'base64').toString('utf-8')
        : Effect.runSync(Effect.fail(new Error(`README not found for ${owner}/${repo}`)));
    },
    catch: () => new Error(`Failed to fetch README from ${owner}/${repo}`)
  });

export const extractRepositoryInfo = (url: string): Effect.Effect<Readonly<{ owner: string; repo: string }>, Error> => {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  return match
    ? Effect.succeed({ owner: match[1]!, repo: match[2]! })
    : Effect.fail(new Error(`Invalid GitHub URL: ${url}`));
};