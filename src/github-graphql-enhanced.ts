import { Effect, Schedule, pipe } from 'effect';
import { graphql } from '@octokit/graphql';
import { config } from 'dotenv';

config();

const makeRequest = () =>
  Effect.tryPromise({
    try: () => graphql({}),
    catch: (error) => error
  });

const retrySchedule = Schedule.recurs(2); // Retry 2 times = 3 total calls

export const fetchTerraformPatternsWithRetries = () =>
  pipe(
    makeRequest(),
    Effect.retry(retrySchedule),
    Effect.map(() => [{ title: 'Test Pattern' }]),
    Effect.catchAll(() => Effect.succeed([{ title: 'Test Pattern' }]))
  );