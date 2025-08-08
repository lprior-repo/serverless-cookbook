export interface Repository {
  readonly name: string;
  readonly clone_url: string;
}

export interface GitHubResponse {
  readonly data: readonly Repository[];
}

export interface OctokitClient {
  readonly repos: {
    readonly listForOrg: (params: ListOrgReposParams) => Promise<GitHubResponse>;
  };
}

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

export interface RepositoryContents {
  readonly repository: Repository;
  readonly files: readonly FileContent[];
}

export interface TerraformPattern {
  readonly title: string;
  readonly description: string;
  readonly category: string;
  readonly services: readonly string[];
  readonly repository_url: string;
  readonly example_code: string;
}