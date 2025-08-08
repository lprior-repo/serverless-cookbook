import { Effect } from 'effect';
import { type OctokitClient, type Repository, type ListOrgReposParams, type TerraformPattern } from './types';

const createOrgParams = (): ListOrgReposParams => ({
  org: 'serverless-tf',
  type: 'public',
  per_page: 100
});

export const ingestServerlessTfModules = (octokit: OctokitClient): Effect.Effect<readonly Repository[], Error> => 
  Effect.tryPromise({
    try: async (): Promise<readonly Repository[]> => {
      const params = createOrgParams();
      const response = await octokit.repos.listForOrg(params);
      return response.data;
    },
    catch: (error): Error => error as Error
  });

const isTerraformModule = (repository: Repository): boolean =>
  repository.name.includes('terraform') || 
  repository.name.includes('tf-module') ||
  repository.name.startsWith('tf-');

export const filterTerraformModules = (repositories: readonly Repository[]): readonly Repository[] =>
  repositories.filter(isTerraformModule);

const extractAwsServices = (terraformContent: string): readonly string[] => {
  const serviceMatches = terraformContent.match(/resource\s+"aws_(\w+)"/g) || [];
  return Array.from(new Set(
    serviceMatches.map((match: string): string => match.replace(/resource\s+"aws_(\w+)".*/, '$1'))
  ));
};

const createCategoryFromServices = (services: readonly string[]): string => 
  services.includes('lambda') ? 'compute' :
  services.includes('dynamodb') ? 'database' :
  services.includes('s3') ? 'storage' :
  'infrastructure';

const createDescriptionFromRepo = (repoName: string, services: readonly string[]): string =>
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