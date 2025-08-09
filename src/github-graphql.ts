#!/usr/bin/env tsx
import { Effect } from 'effect';
import { graphql } from '@octokit/graphql';
import { config } from 'dotenv';
import { writeFile } from 'fs/promises';

config();

const PATTERNS_QUERY = `
  query($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      object(expression: "HEAD:") {
        ... on Tree {
          entries {
            name
            type
            object {
              ... on Tree {
                entries {
                  name
                  type
                  object {
                    ... on Blob {
                      text
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

const parsePatternFile = (text: string) => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const isTerraformPattern = (pattern: any) =>
  pattern?.patternType === 'terraform';

const extractPatternData = (pattern: any) => ({
  title: pattern.title,
  services: pattern.services,
  patternType: pattern.patternType
});

const processDirectoryEntry = (entry: any) =>
  entry.type === 'tree' && entry.object?.entries
    ? entry.object.entries
        .filter((file: any) => file.name === 'example-pattern.json' && file.object?.text)
        .map((file: any) => parsePatternFile(file.object.text))
        .filter(isTerraformPattern)
        .map(extractPatternData)
    : [];

const processGraphQLResponse = (response: any) =>
  (response.repository?.object?.entries || [])
    .flatMap(processDirectoryEntry);

export const fetchTerraformPatterns = () =>
  Effect.tryPromise({
    try: () => graphql({
      query: PATTERNS_QUERY,
      owner: 'aws-samples',
      name: 'serverless-patterns',
      headers: {
        authorization: `token ${process.env.GITHUB_TOKEN}`,
      },
    }),
    catch: (error) => new Error(`GraphQL failed: ${String(error)}`)
  }).pipe(
    Effect.map(processGraphQLResponse)
  );