import { Effect } from 'effect';
import { z } from 'zod';
import { Octokit } from '@octokit/rest';
import { config } from 'dotenv';
import { fetchRepositoryReadme, extractRepositoryInfo } from './github-repository-service.js';
import { validateGitHubToken } from './environment-validator.js';

config();

const TerraformExampleSchema = z.object({
  title: z.string(),
  url: z.string().url(),
  services: z.array(z.string()),
  code: z.string(),
  description: z.string().optional()
});

const TerraformVariableSchema = z.object({
  name: z.string(),
  description: z.string(),
  type: z.string(),
  default: z.string().optional(),
  required: z.boolean()
});

const TerraformOutputSchema = z.object({
  name: z.string(),
  description: z.string(),
  sensitive: z.boolean().optional()
});

const TerraformDocumentationSchema = z.object({
  readme: z.string(),
  variables: z.array(TerraformVariableSchema),
  outputs: z.array(TerraformOutputSchema)
});

const AWSServiceSchema = z.object({
  serviceName: z.string(),
  description: z.string(),
  repositoryUrl: z.string().url(),
  examplesUrl: z.string().url(),
  terraformExamples: z.array(TerraformExampleSchema),
  documentation: TerraformDocumentationSchema
});

export type TerraformExample = z.infer<typeof TerraformExampleSchema>;
export type TerraformVariable = z.infer<typeof TerraformVariableSchema>;
export type TerraformOutput = z.infer<typeof TerraformOutputSchema>;
export type TerraformDocumentation = z.infer<typeof TerraformDocumentationSchema>;
export type AWSService = z.infer<typeof AWSServiceSchema>;

const createLambdaService = (): AWSService => ({
  serviceName: 'AWS Lambda',
  description: 'AWS Lambda lets you run code without provisioning or managing servers.',
  repositoryUrl: 'https://github.com/terraform-aws-modules/terraform-aws-lambda',
  examplesUrl: 'https://github.com/terraform-aws-modules/terraform-aws-lambda/tree/master/examples',
  terraformExamples: [
    {
      title: 'Lambda Basic Function',
      url: 'https://github.com/aws-samples/serverless-patterns/tree/main/lambda-terraform-basic',
      services: ['lambda'],
      code: 'resource "aws_lambda_function" "example" {}'
    }
  ],
  documentation: {
    readme: '',
    variables: [],
    outputs: []
  }
});

const createService = (params: Readonly<{
  serviceName: string;
  description: string;
  repositoryUrl: string;
  examplesUrl: string;
}>): AWSService => ({
  serviceName: params.serviceName,
  description: params.description,
  repositoryUrl: params.repositoryUrl,
  examplesUrl: params.examplesUrl,
  terraformExamples: [],
  documentation: {
    readme: '',
    variables: [],
    outputs: []
  }
});

export const buildAwsServicesCatalog = (): Effect.Effect<ReadonlyArray<AWSService>, never> => {
  const services = [
    createLambdaService(),
    createService({
      serviceName: 'AWS AppSync',
      description: 'AWS AppSync simplifies application development by letting you create a flexible GraphQL API.',
      repositoryUrl: 'https://github.com/terraform-aws-modules/terraform-aws-appsync',
      examplesUrl: 'https://github.com/terraform-aws-modules/terraform-aws-appsync/tree/master/examples'
    }),
    createService({
      serviceName: 'Amazon EventBridge',
      description: 'Amazon EventBridge is a serverless event bus.',
      repositoryUrl: 'https://github.com/terraform-aws-modules/terraform-aws-eventbridge',
      examplesUrl: 'https://github.com/terraform-aws-modules/terraform-aws-eventbridge/tree/master/examples'
    }),
    createService({
      serviceName: 'AWS Step Functions',
      description: 'AWS Step Functions is a serverless function orchestrator.',
      repositoryUrl: 'https://github.com/terraform-aws-modules/terraform-aws-step-functions',
      examplesUrl: 'https://github.com/terraform-aws-modules/terraform-aws-step-functions/tree/master/examples/complete'
    }),
    createService({
      serviceName: 'Amazon CloudFront',
      description: 'Amazon CloudFront is a fast content delivery network (CDN) service.',
      repositoryUrl: 'https://github.com/terraform-aws-modules/terraform-aws-cloudfront',
      examplesUrl: 'https://github.com/terraform-aws-modules/terraform-aws-cloudfront/tree/master/examples'
    }),
    createService({
      serviceName: 'Amazon Aurora Serverless',
      description: 'Amazon Aurora Serverless is an on-demand, auto-scaling configuration.',
      repositoryUrl: 'https://github.com/terraform-aws-modules/terraform-aws-rds-aurora/tree/master/examples/serverless',
      examplesUrl: 'https://github.com/terraform-aws-modules/terraform-aws-rds-aurora/tree/master/examples/serverless'
    }),
    createService({
      serviceName: 'Amazon RDS Proxy',
      description: 'Amazon RDS Proxy is a fully managed database proxy.',
      repositoryUrl: 'https://github.com/terraform-aws-modules/terraform-aws-rds-proxy',
      examplesUrl: 'https://github.com/terraform-aws-modules/terraform-aws-rds-proxy/tree/master/examples'
    }),
    createService({
      serviceName: 'Amazon S3',
      description: 'Amazon S3 provides secure, durable, highly-scalable object storage.',
      repositoryUrl: 'https://github.com/terraform-aws-modules/terraform-aws-s3-bucket',
      examplesUrl: 'https://github.com/terraform-aws-modules/terraform-aws-s3-bucket/tree/master/examples'
    }),
    createService({
      serviceName: 'Amazon SNS',
      description: 'Amazon SNS is a fully managed pub/sub messaging service.',
      repositoryUrl: 'https://github.com/terraform-aws-modules/terraform-aws-sns',
      examplesUrl: 'https://github.com/terraform-aws-modules/terraform-aws-sns/tree/master/examples'
    }),
    createService({
      serviceName: 'AWS AppConfig',
      description: 'AppConfig helps create, manage, and deploy application configurations.',
      repositoryUrl: 'https://github.com/terraform-aws-modules/terraform-aws-appconfig',
      examplesUrl: 'https://github.com/terraform-aws-modules/terraform-aws-appconfig/tree/master/examples'
    }),
    createService({
      serviceName: 'AWS SSM Parameter Store',
      description: 'Parameter Store provides secure, hierarchical storage for configuration data.',
      repositoryUrl: 'https://github.com/terraform-aws-modules/terraform-aws-ssm-parameter',
      examplesUrl: 'https://github.com/terraform-aws-modules/terraform-aws-ssm-parameter/tree/master/examples'
    }),
    createService({
      serviceName: 'AWS Secrets Manager',
      description: 'AWS Secrets Manager helps you manage, retrieve, and rotate secrets.',
      repositoryUrl: 'https://github.com/terraform-aws-modules/terraform-aws-secrets-manager',
      examplesUrl: 'https://github.com/terraform-aws-modules/terraform-aws-secrets-manager/tree/master/examples'
    })
  ];
  
  return Effect.succeed(z.array(AWSServiceSchema).parse(services));
};

const enrichServiceWithDocumentation = (octokit: Readonly<Octokit>, service: Readonly<AWSService>): Effect.Effect<AWSService, never> =>
  Effect.gen(function* () {
    const repositoryInfo = yield* extractRepositoryInfo(service.repositoryUrl);
    
    const readme = yield* fetchRepositoryReadme(octokit, repositoryInfo.owner, repositoryInfo.repo);
    
    return {
      ...service,
      documentation: {
        ...service.documentation,
        readme
      }
    };
  }).pipe(
    Effect.catchAll(() => Effect.succeed(service))
  );

export const enrichAwsServicesWithGitHubData = (): Effect.Effect<ReadonlyArray<AWSService>, never> => {
  const githubToken = process.env.GITHUB_TOKEN;
  
  return githubToken
    ? Effect.gen(function* () {
        const octokit = new Octokit({
          auth: githubToken
        });
        
        const services = yield* buildAwsServicesCatalog();
        
        const servicesWithRealData = yield* Effect.all(
          services.map((service: Readonly<AWSService>) => enrichServiceWithDocumentation(octokit, service))
        );
        
        return servicesWithRealData;
      })
    : Effect.gen(function* () {
        yield* Effect.log('GITHUB_TOKEN not found, returning basic catalog without enriched data');
        return yield* buildAwsServicesCatalog();
      });
};