export interface Repository {
  readonly name: string;
  readonly clone_url: string;
}

export type GitHubResponse = Readonly<{
  readonly data: Readonly<readonly Repository[]>;
}>;

export type OctokitClient = Readonly<{
  readonly repos: Readonly<{
    readonly listForOrg: (params: ListOrgReposParams) => Promise<GitHubResponse>;
  }>;
}>;

export interface ListOrgReposParams {
  readonly org: string;
  readonly type: 'public' | 'private' | 'all';
  readonly per_page: number;
}

export interface FileContent {
  readonly name: string;
  readonly path: string;
  readonly content: string;
  readonly encoding: string;
}

export interface FileResponse {
  readonly data: FileContent;
}

export type RepositoryContents = Readonly<{
  readonly repository: Repository;
  readonly files: Readonly<readonly FileContent[]>;
}>;

export type TerraformPattern = Readonly<{
  readonly title: string;
  readonly description: string;
  readonly category: string;
  readonly services: Readonly<readonly string[]>;
  readonly repository_url: string;
  readonly example_code: string;
}>;