export interface Repository {
  readonly name: string;
  readonly clone_url: string;
}

export interface GitHubResponse {
  readonly data: Readonly<Repository[]>;
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
  readonly files: Readonly<FileContent[]>;
}

export interface TerraformPattern {
  readonly title: string;
  readonly description: string;
  readonly category: string;
  readonly services: Readonly<string[]>;
  readonly repository_url: string;
  readonly example_code: string;
}