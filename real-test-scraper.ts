#!/usr/bin/env tsx
import { Octokit } from '@octokit/rest';
import { Effect } from 'effect';
import { config } from 'dotenv';
import { writeFile } from 'fs/promises';

config();

interface TerraformPattern {
  readonly title: string;
  readonly description: string;
  readonly category: string;
  readonly services: readonly string[];
  readonly repository_url: string;
  readonly example_code: string;
  readonly pattern_path: string;
}

const extractAwsServices = (terraformContent: string): readonly string[] => {
  const serviceMatches = terraformContent.match(/resource\s+"aws_(\w+)/g) || [];
  const servicePrefixes: Record<string, string> = {
    'lambda_function': 'lambda',
    'lambda_permission': 'lambda',
    'lambda_alias': 'lambda',
    'lambda_layer_version': 'lambda',
    'iam_role': 'iam',
    'iam_policy': 'iam',
    'iam_role_policy_attachment': 'iam',
    's3_bucket': 's3',
    's3_object': 's3',
    'dynamodb_table': 'dynamodb',
    'dynamodb_item': 'dynamodb',
    'apigatewayv2_api': 'apigateway',
    'apigatewayv2_stage': 'apigateway',
    'apigatewayv2_integration': 'apigateway',
    'api_gateway_rest_api': 'apigateway',
    'cloudwatch_log_group': 'cloudwatch',
    'sns_topic': 'sns',
    'sqs_queue': 'sqs',
    'kinesis_stream': 'kinesis',
    'eventbridge_rule': 'eventbridge'
  };
  
  return Array.from(new Set(
    serviceMatches.map((match: string): string => {
      const result = match.match(/aws_(\w+)/);
      const fullType = result?.[1] || '';
      const fallback = fullType.split('_')[0] || '';
      return servicePrefixes[fullType] ?? fallback;
    }).filter((service: string): boolean => service !== '')
  ));
};

const createCategoryFromServices = (services: readonly string[]): string => 
  services.includes('lambda') ? 'compute' :
  services.includes('dynamodb') ? 'database' :
  services.includes('s3') ? 'storage' :
  services.includes('apigateway') ? 'api' :
  services.includes('eventbridge') ? 'messaging' :
  'infrastructure';

const scrapeTerraformPatterns = async (octokit: Octokit): Promise<TerraformPattern[]> => {
  console.log('🔍 Exploring aws-samples/serverless-patterns repository...');
  
  try {
    // Get contents of the serverless-patterns repository
    const contents = await octokit.repos.getContent({
      owner: 'aws-samples',
      repo: 'serverless-patterns',
      path: ''
    });
    
    if (!Array.isArray(contents.data)) {
      throw new Error('Repository contents not found');
    }
    
    console.log(`📂 Found ${contents.data.length} items in repository root`);
    
    const patterns: TerraformPattern[] = [];
    
    // Look for directories that might contain Terraform patterns
    const directories = contents.data.filter(item => 
      item.type === 'dir' && 
      (item.name.includes('terraform') || 
       item.name.includes('tf-') ||
       item.name.includes('cdk-') ||
       item.name.includes('lambda-') ||
       item.name.includes('eventbridge-') ||
       item.name.includes('s3-') ||
       item.name.includes('api-') ||
       item.name.includes('dynamodb-'))
    );
    
    console.log(`🎯 Found ${directories.length} potential pattern directories`);
    
    // Process first 5 directories to avoid rate limits
    for (const dir of directories.slice(0, 5)) {
      console.log(`  📁 Processing: ${dir.name}`);
      
      try {
        const dirContents = await octokit.repos.getContent({
          owner: 'aws-samples',
          repo: 'serverless-patterns',
          path: dir.name
        });
        
        if (!Array.isArray(dirContents.data)) continue;
        
        // Look for Terraform files
        const terraformFiles = dirContents.data.filter(file => 
          file.type === 'file' && (
            file.name.endsWith('.tf') ||
            file.name === 'main.tf' ||
            file.name === 'template.yaml' ||
            file.name === 'template.yml'
          )
        );
        
        if (terraformFiles.length > 0) {
          console.log(`    ✅ Found ${terraformFiles.length} infrastructure files`);
          
          // Get the first Terraform file content
          const firstFile = terraformFiles[0];
          if (firstFile.type === 'file') {
            const fileResponse = await octokit.repos.getContent({
              owner: 'aws-samples',
              repo: 'serverless-patterns',
              path: `${dir.name}/${firstFile.name}`
            });
            
            if ('content' in fileResponse.data && fileResponse.data.content) {
              const content = Buffer.from(fileResponse.data.content, 'base64').toString('utf8');
              const services = extractAwsServices(content);
              
              if (services.length > 0) {
                patterns.push({
                  title: dir.name,
                  description: `Serverless pattern: ${dir.name.replace(/-/g, ' ')} using ${services.join(', ')}`,
                  category: createCategoryFromServices(services),
                  services,
                  repository_url: `https://github.com/aws-samples/serverless-patterns/tree/main/${dir.name}`,
                  example_code: content.substring(0, 1000) + (content.length > 1000 ? '...' : ''),
                  pattern_path: `${dir.name}/${firstFile.name}`
                });
                console.log(`    🎉 Extracted pattern with services: ${services.join(', ')}`);
              }
            }
          }
        }
      } catch (error) {
        console.log(`    ⚠️  Could not process ${dir.name}: ${error}`);
      }
      
      // Small delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return patterns;
  } catch (error) {
    console.error('❌ Failed to scrape patterns:', error);
    return [];
  }
};

const main = async (): Promise<void> => {
  console.log('🚀 Starting real serverless patterns scraper...');
  
  const githubToken = process.env.GITHUB_TOKEN;
  if (!githubToken) {
    console.error('❌ GITHUB_TOKEN environment variable is required');
    process.exit(1);
  }
  
  const octokit = new Octokit({ auth: githubToken });
  
  try {
    const patterns = await scrapeTerraformPatterns(octokit);
    
    const output = {
      patterns,
      metadata: {
        generated_at: new Date().toISOString(),
        total_patterns: patterns.length,
        categories: Array.from(new Set(patterns.map(p => p.category))),
        source_repository: 'aws-samples/serverless-patterns'
      }
    };
    
    const jsonOutput = JSON.stringify(output, null, 2);
    await writeFile('./serverless-cookbook-real.json', jsonOutput, 'utf8');
    
    console.log(`✅ Successfully scraped ${patterns.length} patterns!`);
    console.log(`📄 Output saved to: ./serverless-cookbook-real.json`);
    console.log('\n📊 Summary:');
    console.log(`  - Total patterns: ${patterns.length}`);
    console.log(`  - Categories: ${output.metadata.categories.join(', ')}`);
    
  } catch (error) {
    console.error('❌ Scraper failed:', error);
    process.exit(1);
  }
};

main().catch(console.error);