import { Effect } from 'effect';
import { writeFile } from 'fs/promises';
import { enrichAwsServicesWithGitHubData } from './serverless-tf-extractor.js';

const runScraper = (): Effect.Effect<Readonly<{
  services: ReadonlyArray<unknown>;
  metadata: Readonly<{
    readonly generated_at: string;
    readonly total_services: number;
    readonly service_names: ReadonlyArray<string>;
  }>;
}>, Error> =>
  Effect.gen(function* () {
    const services = yield* enrichAwsServicesWithGitHubData();
    
    const output = {
      services,
      metadata: {
        generated_at: new Date().toISOString(),
        total_services: services.length,
        service_names: services.map((s: Readonly<{ readonly serviceName: string }>) => s.serviceName)
      }
    };
    
    yield* Effect.tryPromise({
      try: () => writeFile('terraform-aws-services.json', JSON.stringify(output, null, 2)),
      catch: (error: unknown) => new Error(`Failed to write file: ${String(error)}`)
    });
    
    return output;
  });

export { runScraper };