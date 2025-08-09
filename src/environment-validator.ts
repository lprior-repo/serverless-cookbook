import { Effect } from 'effect';

export const validateGitHubToken = (): Effect.Effect<string, Error> =>
  process.env.GITHUB_TOKEN
    ? Effect.succeed(process.env.GITHUB_TOKEN)
    : Effect.fail(new Error('GITHUB_TOKEN is required'));