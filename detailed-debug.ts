#!/usr/bin/env tsx
import { Octokit } from '@octokit/rest';
import { config } from 'dotenv';

config();

const main = async (): Promise<void> => {
  console.log('🔍 Detailed debugging of serverless patterns...');
  
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  
  try {
    // Look at one specific directory in detail
    console.log('\n📁 Examining: activemq-lambda-sam-java');
    
    const dirContents = await octokit.repos.getContent({
      owner: 'aws-samples',
      repo: 'serverless-patterns',
      path: 'activemq-lambda-sam-java'
    });
    
    if (Array.isArray(dirContents.data)) {
      console.log('Files in directory:');
      dirContents.data.forEach(file => {
        console.log(`  - ${file.name} (${file.type})`);
      });
      
      // Look for template files
      const templateFiles = dirContents.data.filter(file =>
        file.name.includes('template') || file.name.endsWith('.tf') || file.name.endsWith('.yaml')
      );
      
      console.log(`\n📄 Found ${templateFiles.length} template-like files`);
      
      if (templateFiles.length > 0) {
        const firstTemplate = templateFiles[0];
        console.log(`\n📖 Reading: ${firstTemplate.name}`);
        
        const fileResponse = await octokit.repos.getContent({
          owner: 'aws-samples',
          repo: 'serverless-patterns',
          path: `activemq-lambda-sam-java/${firstTemplate.name}`
        });
        
        if ('content' in fileResponse.data && fileResponse.data.content) {
          const content = Buffer.from(fileResponse.data.content, 'base64').toString('utf8');
          console.log('\n📝 File content preview (first 500 chars):');
          console.log(content.substring(0, 500));
          console.log('\n🔍 Looking for AWS resources...');
          
          // Check for Terraform resources
          const terraformMatches = content.match(/resource\s+"aws_(\w+)/g) || [];
          console.log(`Terraform resources found: ${terraformMatches.length}`);
          terraformMatches.forEach(match => console.log(`  - ${match}`));
          
          // Check for SAM/CloudFormation resources
          const samMatches = content.match(/Type:\s*AWS::(\w+::\w+)/g) || [];
          console.log(`SAM/CloudFormation resources found: ${samMatches.length}`);
          samMatches.forEach(match => console.log(`  - ${match}`));
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
};

main().catch(console.error);