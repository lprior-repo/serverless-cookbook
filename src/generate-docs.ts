import { Effect } from 'effect';
import { readFile } from 'fs/promises';
import { generateAllDocs } from './docs-generator.js';
import type { AWSService } from './serverless-tf-extractor.js';

const generateDocs = (): Effect.Effect<void, Error> =>
  Effect.gen(function* () {
    // Read the existing JSON data
    const jsonData = yield* Effect.tryPromise({
      try: () => readFile('terraform-aws-services.json', 'utf-8'),
      catch: (error: unknown) => new Error(`Failed to read JSON data: ${String(error)}`)
    });

    const parsedData = JSON.parse(jsonData) as { services: ReadonlyArray<AWSService> };
    
    yield* Effect.log(`Generating documentation for ${parsedData.services.length} services`);
    
    // Generate all documentation
    yield* generateAllDocs(parsedData.services);
    
    yield* Effect.log('Documentation generation completed!');
  });

// Run the generator
Effect.runPromise(generateDocs()).catch(console.error);