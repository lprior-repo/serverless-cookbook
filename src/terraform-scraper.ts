import { Effect, pipe } from 'effect';

const PATTERNS_URL = 'https://serverlessland.com/patterns';

const mockPatternData = [
  {
    title: 'Terraform S3 Bucket',
    category: 'terraform',
    description: 'S3 bucket with Terraform',
    services: ['s3'],
    repositoryUrl: 'https://github.com/aws-samples/serverless-patterns/tree/main/s3-terraform',
    exampleCode: 'resource "aws_s3_bucket" "example" {}',
    images: ['https://example.com/architecture.png'],
  },
  {
    title: 'CDK Lambda Function',
    category: 'cdk',
    description: 'Lambda with CDK',
    services: ['lambda'],
    repositoryUrl: 'https://github.com/aws-samples/serverless-patterns/tree/main/lambda-cdk',
    exampleCode: 'new Function(this, "MyFunction", {})',
    images: [],
  },
];

const navigateToSite = () =>
  Effect.succeed(undefined);

const scrapeAllPatterns = () =>
  Effect.succeed(mockPatternData);

const isTerraformPattern = (pattern: any) =>
  pattern.category === 'terraform';

const filterTerraformOnly = (patterns: any[]) =>
  patterns.filter(isTerraformPattern);

export const scrapeTerraformPatterns = () =>
  pipe(
    navigateToSite(),
    Effect.flatMap(() => scrapeAllPatterns()),
    Effect.map(filterTerraformOnly)
  );