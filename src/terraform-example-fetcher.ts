import { Effect } from 'effect';
import { Octokit } from '@octokit/rest';
import { z } from 'zod';

const TerraformFileSchema = z.object({
  name: z.string(),
  content: z.string(),
  type: z.enum(['terraform', 'markdown', 'json', 'yaml', 'shell', 'text'])
});

const TerraformExampleFilesSchema = z.object({
  path: z.string(),
  files: z.array(TerraformFileSchema)
});

export type TerraformFile = z.infer<typeof TerraformFileSchema>;
export type TerraformExampleFiles = z.infer<typeof TerraformExampleFilesSchema>;

const getFileType = (filename: string): TerraformFile['type'] => {
  const extension = filename.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'tf':
    case 'hcl':
      return 'terraform';
    case 'md':
      return 'markdown';
    case 'json':
      return 'json';
    case 'yml':
    case 'yaml':
      return 'yaml';
    case 'sh':
      return 'shell';
    default:
      return 'text';
  }
};

const fetchFileContent = (octokit: Readonly<Octokit>, owner: string, repo: string, path: string): Effect.Effect<string, Error> =>
  Effect.tryPromise({
    try: async () => {
      const response = await octokit.rest.repos.getContent({
        owner,
        repo,
        path
      });
      
      if (Array.isArray(response.data) || !('content' in response.data)) {
        return Effect.runSync(Effect.fail(new Error(`File content not found: ${path}`)));
      }
      
      return Buffer.from(response.data.content, 'base64').toString('utf-8');
    },
    catch: (error: unknown) => new Error(`Failed to fetch file ${path}: ${String(error)}`)
  });

export const fetchTerraformExample = (
  octokit: Readonly<Octokit>, 
  owner: string, 
  repo: string, 
  examplePath: string
): Effect.Effect<TerraformExampleFiles, Error> =>
  Effect.gen(function* () {
    const directoryResponse = yield* Effect.tryPromise({
      try: () => octokit.rest.repos.getContent({
        owner,
        repo,
        path: examplePath
      }),
      catch: (error: unknown) => new Error(`Failed to fetch directory ${examplePath}: ${String(error)}`)
    });

    if (!Array.isArray(directoryResponse.data)) {
      return yield* Effect.fail(new Error(`Path ${examplePath} is not a directory`));
    }

    const terraformFiles = directoryResponse.data.filter(
      (item: Readonly<{ type: string; name: string }>) => 
        item.type === 'file' && 
        (item.name.endsWith('.tf') || 
         item.name.endsWith('.md') || 
         item.name.endsWith('.json') ||
         item.name.endsWith('.yml') ||
         item.name.endsWith('.yaml') ||
         item.name.endsWith('.sh'))
    );

    const files = yield* Effect.all(
      terraformFiles.map((file: Readonly<{ name: string }>) =>
        Effect.gen(function* () {
          const content = yield* fetchFileContent(octokit, owner, repo, `${examplePath}/${file.name}`);
          return {
            name: file.name,
            content,
            type: getFileType(file.name)
          };
        })
      )
    );

    return TerraformExampleFilesSchema.parse({
      path: examplePath,
      files
    });
  });

export const formatExampleAsMarkdown = (exampleFiles: Readonly<TerraformExampleFiles>): string => {
  const { path, files } = exampleFiles;
  
  const markdownParts = [
    `# Terraform Example: ${path}`,
    ''
  ];

  files.forEach((file: Readonly<TerraformFile>) => {
    markdownParts.push(`## ${file.name}`);
    markdownParts.push('');
    
    if (file.type === 'markdown') {
      markdownParts.push(file.content);
    } else {
      const language = file.type === 'terraform' ? 'hcl' : file.type;
      markdownParts.push(`\`\`\`${language}`);
      markdownParts.push(file.content);
      markdownParts.push('```');
    }
    
    markdownParts.push('');
  });

  return markdownParts.join('\n');
};