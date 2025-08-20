import { Effect } from 'effect';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import type { AWSService, TerraformExample } from './serverless-tf-extractor.js';

const AWS_SERVICE_ICONS: Record<string, string> = {
  'AWS Lambda': ':simple-awslambda:',
  'AWS AppSync': ':simple-graphql:',
  'Amazon EventBridge': ':material-calendar-sync:',
  'AWS Step Functions': ':material-state-machine:',
  'Amazon CloudFront': ':simple-amazonaws:',
  'Amazon Aurora Serverless': ':simple-amazondynamodb:',
  'Amazon RDS Proxy': ':simple-amazondynamodb:',
  'Amazon S3': ':simple-amazons3:',
  'Amazon SNS': ':material-message:',
  'AWS AppConfig': ':material-cog:',
  'AWS SSM Parameter Store': ':material-database-settings:',
  'AWS Secrets Manager': ':material-key:'
};

const SERVICE_CATEGORIES: Record<string, string> = {
  'AWS Lambda': 'compute',
  'AWS AppSync': 'integration',
  'Amazon EventBridge': 'integration',
  'AWS Step Functions': 'integration',
  'Amazon CloudFront': 'storage',
  'Amazon Aurora Serverless': 'storage',
  'Amazon RDS Proxy': 'storage',
  'Amazon S3': 'storage',
  'Amazon SNS': 'integration',
  'AWS AppConfig': 'security',
  'AWS SSM Parameter Store': 'security',
  'AWS Secrets Manager': 'security',
  'Amazon DynamoDB': 'storage'
};

export const extractServiceTags = (example: Readonly<TerraformExample>): ReadonlyArray<string> => {
  const baseTags = ['serverless', 'terraform', 'aws'];
  const titleTags = example.title.toLowerCase()
    .split(/[\s\-_]+/)
    .filter(tag => tag.length > 2)
    .slice(0, 5);
    
  return [...baseTags, ...titleTags].filter((tag, index, arr) => arr.indexOf(tag) === index);
};

export const generateDifficultyLevel = (example: Readonly<TerraformExample>): 'beginner' | 'intermediate' | 'advanced' => {
  const title = example.title.toLowerCase();
  const description = example.description?.toLowerCase() || '';
  
  const complexityIndicators = [
    'vpc', 'security', 'custom', 'advanced', 'complex', 'multi', 'container', 'cicd', 'pipeline'
  ];
  
  const hasComplexity = complexityIndicators.some(indicator => 
    title.includes(indicator) || description.includes(indicator)
  );
  
  if (title.includes('simple') || title.includes('basic')) {
    return 'beginner';
  }
  
  if (hasComplexity || title.split('-').length > 4) {
    return 'intermediate';
  }
  
  return 'beginner';
};

const generateFrontmatter = (service: Readonly<AWSService>, example: Readonly<TerraformExample>): string => {
  const title = example.title.replace('AWS Lambda - ', '').replace(/^AWS\s+/, '').replace(/^Amazon\s+/, '');
  const cleanTitle = title.charAt(0).toUpperCase() + title.slice(1).replace(/-/g, ' ');
  const tags = extractServiceTags(example);
  
  return `---
title: ${cleanTitle}
description: ${example.description || service.description}
tags:
${tags.map(tag => `  - ${tag}`).join('\n')}
---`;
};

const generateAtAGlanceSection = (service: Readonly<AWSService>, example: Readonly<TerraformExample>): string => {
  const difficulty = generateDifficultyLevel(example);
  const difficultyIcon = difficulty === 'beginner' ? '★' : 
                        difficulty === 'intermediate' ? '★★' :
                        '★★★';
  
  const icon = AWS_SERVICE_ICONS[service.serviceName] || ':material-cloud:';
  const servicesList = example.services.map(s => `\`${s}\``).join(', ');
  
  return `

<div class="at-a-glance" markdown="1">

| Property | Value |
| --- | --- |
| **Level** | ${difficultyIcon} **${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}** |
| **AWS Services** | ${servicesList} |
| **Primary Use Case** | ${service.description} |
| **Source Repo** | [terraform-aws-modules](${service.repositoryUrl}) |
| **Category** | ${SERVICE_CATEGORIES[service.serviceName] || 'general'} |

</div>`;
};

const generateServiceExampleTabs = (service: Readonly<AWSService>): string => {
  const examples = service.terraformExamples;
  
  if (examples.length === 0) {
    return `
## Examples

No examples available for this service.`;
  }

  if (examples.length === 1) {
    // Single example - show file tabs like before
    const example = examples[0];
    if (!example) {
      return `\n## Examples\n\nNo examples available for this service.`;
    }
    return generateSingleExampleTabs(example);
  }

  // Multiple examples - show example tabs with nested file tabs
  const exampleTabs = examples.map((example, index) => {
    const cleanTitle = example.title
      .replace('AWS Lambda - ', '')
      .replace(/^AWS\s+/, '')
      .replace(/^Amazon\s+/, '')
      .replace(/-/g, ' ')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());

    const tabContent = generateSingleExampleContent(example);
    
    return `=== "${cleanTitle}"

    ${tabContent}`;
  }).join('\n\n');

  return `
## Examples

Explore different usage patterns and configurations. Click through the tabs to see various implementation approaches:

${exampleTabs}`;
};

const generateSingleExampleTabs = (example: Readonly<TerraformExample>): string => {
  if (!example.markdownContent) {
    return `
## Implementation

\`\`\`terraform title="main.tf"
${example.code || '# No code available'}
\`\`\``;
  }

  const sections = example.markdownContent.split('## ');
  
  const mainTfSection = sections.find(section => section.trim().startsWith('main.tf'));
  const outputsSection = sections.find(section => section.trim().startsWith('outputs.tf'));
  const variablesSection = sections.find(section => section.trim().startsWith('variables.tf'));
  const versionsSection = sections.find(section => section.trim().startsWith('versions.tf'));
  
  const extractCode = (section: string): string => {
    const hclMatch = section.match(/```hcl\n([\s\S]*?)\n```/);
    const terraformMatch = section.match(/```terraform\n([\s\S]*?)\n```/);
    const match = hclMatch || terraformMatch;
    return match ? match[1]?.trim() || '' : '';
  };
  
  const mainCode = mainTfSection ? extractCode(mainTfSection) : example.code || '# No main.tf code available';
  const outputsCode = outputsSection ? extractCode(outputsSection) : '';
  const variablesCode = variablesSection ? extractCode(variablesSection) : '';
  const versionsCode = versionsSection ? extractCode(versionsSection) : '';
  
  const indentCode = (code: string): string => {
    return code.split('\n').map(line => `    ${line}`).join('\n');
  };

  return `
## Implementation

Complete Terraform configuration files for this pattern:

=== "Main Configuration (\`main.tf\`)"

\`\`\`terraform title="main.tf"
${indentCode(mainCode)}
\`\`\`

=== "Variables (\`variables.tf\`)"

\`\`\`terraform title="variables.tf"
${indentCode(variablesCode || '# No variables defined')}
\`\`\`

=== "Outputs (\`outputs.tf\`)"

\`\`\`terraform title="outputs.tf"
${indentCode(outputsCode || '# No outputs defined')}
\`\`\`

=== "Requirements (\`versions.tf\`)"

\`\`\`terraform title="versions.tf"
${indentCode(versionsCode || '# No versions file')}
\`\`\``;
};

const generateSingleExampleContent = (example: Readonly<TerraformExample>): string => {
  if (!example.markdownContent) {
    return `
    \`\`\`terraform title="main.tf"
    ${example.code || '# No code available'}
    \`\`\``;
  }

  const sections = example.markdownContent.split('## ');
  
  const mainTfSection = sections.find(section => section.trim().startsWith('main.tf'));
  const outputsSection = sections.find(section => section.trim().startsWith('outputs.tf'));
  const variablesSection = sections.find(section => section.trim().startsWith('variables.tf'));
  const versionsSection = sections.find(section => section.trim().startsWith('versions.tf'));
  
  const extractCode = (section: string): string => {
    const hclMatch = section.match(/```hcl\n([\s\S]*?)\n```/);
    const terraformMatch = section.match(/```terraform\n([\s\S]*?)\n```/);
    const match = hclMatch || terraformMatch;
    return match ? match[1]?.trim() || '' : '';
  };
  
  const mainCode = mainTfSection ? extractCode(mainTfSection) : example.code || '# No main.tf code available';
  const outputsCode = outputsSection ? extractCode(outputsSection) : '';
  const variablesCode = variablesSection ? extractCode(variablesSection) : '';
  const versionsCode = versionsSection ? extractCode(versionsSection) : '';
  
  const indentCode = (code: string): string => {
    return code.split('\n').map(line => `        ${line}`).join('\n');
  };

  return `
    === "Configuration"

        \`\`\`terraform title="main.tf"
${indentCode(mainCode)}
        \`\`\`

    === "Outputs"

        \`\`\`terraform title="outputs.tf"
${indentCode(outputsCode || '# No outputs defined')}
        \`\`\`

    === "Variables"

        \`\`\`terraform title="variables.tf"
${indentCode(variablesCode || '# No variables defined')}
        \`\`\``;
};

export const generateServiceMarkdown = (service: Readonly<AWSService>): string => {
  const serviceName = service.serviceName.replace(/^AWS\s+/, '').replace(/^Amazon\s+/, '');
  const cleanServiceName = serviceName.charAt(0).toUpperCase() + serviceName.slice(1);
  
  const frontmatter = generateServiceFrontmatter(service);
  const atAGlance = generateServiceAtAGlanceSection(service);
  const exampleTabs = generateServiceExampleTabs(service);
  
  return `${frontmatter}

# ${cleanServiceName}

${service.description}

<div class="md-typeset" markdown>
<div class="md-grid">
<div class="md-cell md-cell--12">
<a href="${service.repositoryUrl}" title="View Source" class="md-button md-button--primary">
View Source Repository
</a>
</div>
</div>
</div>

---

## At a Glance

${atAGlance}

---

## When to Use ${cleanServiceName}

!!! info "Use ${cleanServiceName} when you need to:"

    * ${service.description}
    * Build serverless applications with ${service.serviceName}
    * Implement scalable, cost-effective solutions
    * Follow infrastructure as code best practices

---

## Architecture

${cleanServiceName} is a key component of AWS serverless architecture. The implementation follows AWS best practices and uses the terraform-aws-modules for reliable, tested infrastructure components.

${exampleTabs}

---

## Next Steps

!!! tip "Related Resources"

    * [Official ${service.serviceName} Documentation](https://docs.aws.amazon.com/)
    * [Terraform AWS Provider Documentation](https://registry.terraform.io/providers/hashicorp/aws/latest)
    * [Source Repository](${service.repositoryUrl})

---

## Contributing

Found an issue or want to improve these patterns? [Open an issue](${service.repositoryUrl}/issues) or submit a pull request to the source repository.
`;
};

const generateServiceFrontmatter = (service: Readonly<AWSService>): string => {
  const serviceName = service.serviceName.replace(/^AWS\s+/, '').replace(/^Amazon\s+/, '');
  const cleanServiceName = serviceName.charAt(0).toUpperCase() + serviceName.slice(1);
  
  // Get all unique tags from all examples
  const allTags = service.terraformExamples.flatMap(example => extractServiceTags(example));
  const uniqueTags = [...new Set(allTags)];
  
  return `---
title: ${cleanServiceName}
description: ${service.description}
tags:
${uniqueTags.map(tag => `  - ${tag}`).join('\n')}
---`;
};

const generateServiceAtAGlanceSection = (service: Readonly<AWSService>): string => {
  const icon = AWS_SERVICE_ICONS[service.serviceName] || ':material-cloud:';
  const exampleCount = service.terraformExamples.length;
  const allServices = [...new Set(service.terraformExamples.flatMap(e => e.services))];
  const servicesList = allServices.map(s => `\`${s}\``).join(', ');
  
  return `

<div class="at-a-glance" markdown="1">

| Property | Value |
| --- | --- |
| **Examples** | ${exampleCount} implementation pattern${exampleCount !== 1 ? 's' : ''} |
| **AWS Services** | ${servicesList} |
| **Primary Use Case** | ${service.description} |
| **Source Repo** | [terraform-aws-modules](${service.repositoryUrl}) |
| **Category** | ${SERVICE_CATEGORIES[service.serviceName] || 'general'} |

</div>`;
};

const generateCategoryIndex = (category: string, services: ReadonlyArray<AWSService>): string => {
  const categoryServices = services.filter(service => SERVICE_CATEGORIES[service.serviceName] === category);
  
  return `# ${category.charAt(0).toUpperCase() + category.slice(1)} Patterns

Collection of ${category} patterns for AWS serverless architecture.

<div class="pattern-grid">

${categoryServices.map(service => {
    const serviceName = service.serviceName.replace(/^AWS\s+/, '').replace(/^Amazon\s+/, '');
    const cleanServiceName = serviceName.charAt(0).toUpperCase() + serviceName.slice(1);
    const filename = serviceName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const exampleCount = service.terraformExamples.length;
    
    return `
<div class="pattern-card">
<h3>${cleanServiceName}</h3>
<p>${service.description}</p>
<p><strong>${exampleCount} example${exampleCount !== 1 ? 's' : ''}</strong> available</p>
<a href="${filename}/" class="md-button">View Patterns</a>
</div>`;
  }).join('')}

</div>
`;
};

export const generateAllDocs = (services: ReadonlyArray<AWSService>): Effect.Effect<void, Error> =>
  Effect.gen(function* () {
    const docsDir = 'docs';
    
    // Create category directories
    const categories = ['compute', 'integration', 'storage', 'security'];
    yield* Effect.all(
      categories.map(category =>
        Effect.tryPromise({
          try: () => mkdir(join(docsDir, 'patterns', category), { recursive: true }),
          catch: (error: unknown) => new Error(`Failed to create category directory: ${String(error)}`)
        })
      )
    );
    
    // Generate one page per service (instead of per example)
    yield* Effect.all(
      services.map(service =>
        Effect.gen(function* () {
          const markdown = generateServiceMarkdown(service);
          const serviceName = service.serviceName.replace(/^AWS\s+/, '').replace(/^Amazon\s+/, '');
          const filename = serviceName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '.md';
          
          const category = SERVICE_CATEGORIES[service.serviceName] || 'general';
          const filepath = join(docsDir, 'patterns', category, filename);
          
          yield* Effect.tryPromise({
            try: () => writeFile(filepath, markdown),
            catch: (error: unknown) => new Error(`Failed to write file ${filepath}: ${String(error)}`)
          });
        })
      )
    );
    
    // Generate category index pages
    yield* Effect.all(
      categories.map(category =>
        Effect.gen(function* () {
          const indexContent = generateCategoryIndex(category, services);
          const filepath = join(docsDir, 'patterns', category, 'index.md');
          
          yield* Effect.tryPromise({
            try: () => writeFile(filepath, indexContent),
            catch: (error: unknown) => new Error(`Failed to write category index: ${String(error)}`)
          });
        })
      )
    );
    
    yield* Effect.log(`Generated documentation for ${services.length} services with tabbed examples`);
  });