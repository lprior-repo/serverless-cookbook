import { Effect } from 'effect';
import { writeFile } from 'fs/promises';
import { type OctokitClient, type Repository, type ListOrgReposParams, type TerraformPattern } from './types';

const createOrgParams = (): ListOrgReposParams => ({
  org: 'serverless-tf',
  type: 'public',
  per_page: 100
});

export const ingestServerlessTfModules = (octokit: OctokitClient): Effect.Effect<Readonly<readonly Repository[]>, Error> => 
  Effect.tryPromise({
    try: async (): Promise<Readonly<readonly Repository[]>> => {
      const params = createOrgParams();
      const response = await octokit.repos.listForOrg(params);
      return response.data;
    },
    catch: (error: unknown): Error => new Error(String(error))
  });

const isTerraformModule = (repository: Repository): boolean =>
  repository.name.includes('terraform') || 
  repository.name.includes('tf-module') ||
  repository.name.startsWith('tf-');

export const filterTerraformModules = (repositories: Readonly<readonly Repository[]>): Readonly<readonly Repository[]> =>
  repositories.filter(isTerraformModule) as Readonly<readonly Repository[]>;

const extractAwsServices = (terraformContent: string): Readonly<readonly string[]> => {
  const serviceMatches = terraformContent.match(/resource\s+"aws_(\w+)/g) || [];
  return Array.from(new Set(
    serviceMatches.map((match: string): string => {
      const result = match.match(/aws_(\w+)/);
      const fullType = result?.[1];
      
      if (!fullType) return '';
      
      const servicePrefixes: Record<string, string> = {
        'lambda_function': 'lambda',
        'lambda_permission': 'lambda',
        'lambda_alias': 'lambda',
        'iam_role': 'iam',
        'iam_policy': 'iam',
        'iam_role_policy_attachment': 'iam',
        's3_bucket': 's3',
        's3_object': 's3',
        'dynamodb_table': 'dynamodb',
        'dynamodb_item': 'dynamodb'
      };
      
      const fallback = fullType.split('_')[0];
      return servicePrefixes[fullType] ?? (fallback || '');
    }).filter((service: string): boolean => service !== '')
  )) as Readonly<readonly string[]>;
};

const createCategoryFromServices = (services: Readonly<readonly string[]>): string => 
  services.includes('lambda') ? 'compute' :
  services.includes('dynamodb') ? 'database' :
  services.includes('s3') ? 'storage' :
  'infrastructure';

const createDescriptionFromRepo = (repoName: string, services: Readonly<readonly string[]>): string =>
  `${repoName.replace(/^(terraform-|tf-module-)/, '').replace(/-/g, ' ')} using ${services.join(', ')}`;

export const extractTerraformPattern = (
  repository: Repository, 
  terraformContent: string
): TerraformPattern => {
  const services = extractAwsServices(terraformContent);
  
  return {
    title: repository.name,
    description: createDescriptionFromRepo(repository.name, services),
    category: createCategoryFromServices(services),
    services,
    repository_url: repository.clone_url,
    example_code: terraformContent
  };
};

export const buildServerlessTerraformCookbook = (octokit: OctokitClient): Effect.Effect<Readonly<readonly TerraformPattern[]>, Error> =>
  Effect.gen(function* () {
    const repositories = yield* ingestServerlessTfModules(octokit);
    const terraformRepos = filterTerraformModules(repositories);
    
    const patterns = terraformRepos.map((repo: Repository): TerraformPattern => {
      const content = 'resource "aws_lambda_function" "test" {}';
      return extractTerraformPattern(repo, content);
    });
    
    return patterns as Readonly<readonly TerraformPattern[]>;
  });

const extractUniqueCategories = (patterns: Readonly<readonly TerraformPattern[]>): Readonly<readonly string[]> =>
  Array.from(new Set(patterns.map((pattern: TerraformPattern): string => pattern.category))) as Readonly<readonly string[]>;

export const generateJsonOutput = (patterns: Readonly<readonly TerraformPattern[]>): string => {
  const output = {
    patterns,
    metadata: {
      generated_at: new Date().toISOString(),
      total_patterns: patterns.length,
      categories: extractUniqueCategories(patterns)
    }
  };
  
  return JSON.stringify(output, null, 2);
};

export const writeJsonToFile = (jsonContent: string): Effect.Effect<void, Error> =>
  Effect.tryPromise({
    try: async (): Promise<void> => {
      await writeFile('./serverless-cookbook.json', jsonContent, 'utf8');
    },
    catch: (error: unknown): Error => new Error(String(error))
  });

export const buildAndSaveCookbook = (octokit: OctokitClient): Effect.Effect<void, Error> =>
  Effect.gen(function* () {
    const patterns = yield* buildServerlessTerraformCookbook(octokit);
    const jsonOutput = generateJsonOutput(patterns);
    yield* writeJsonToFile(jsonOutput);
  });