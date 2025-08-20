# Getting Started

Welcome to the Serverless Terraform Cookbook! This guide will help you get up and running with serverless infrastructure patterns using Terraform and AWS.

---

## Prerequisites

Before diving into the patterns, make sure you have the following tools installed and configured:

### Required Tools

=== "Terraform"

    **Installation**
    ```bash
    # macOS (using Homebrew)
    brew install terraform
    
    # Linux (using package manager)
    wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
    echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
    sudo apt update && sudo apt install terraform
    ```
    
    **Verify Installation**
    ```bash
    terraform --version
    ```

=== "AWS CLI"

    **Installation**
    ```bash
    # macOS (using Homebrew)
    brew install awscli
    
    # Linux
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
    unzip awscliv2.zip
    sudo ./aws/install
    ```
    
    **Configure AWS Credentials**
    ```bash
    aws configure
    ```

=== "Git"

    **Installation**
    ```bash
    # macOS (using Homebrew)
    brew install git
    
    # Linux (Ubuntu/Debian)
    sudo apt update && sudo apt install git
    ```

### AWS Account Setup

!!! warning "Important"

    You'll need an AWS account with appropriate permissions to create resources. Some patterns may incur costs - always review the AWS pricing for services you plan to use.

**Required AWS Permissions:**
- IAM role/user creation
- Lambda function management
- API Gateway administration
- CloudWatch logs access
- S3 bucket operations
- DynamoDB table operations

---

## Quick Start

Let's deploy your first serverless pattern - a simple Lambda function:

### 1. Clone a Pattern

```bash
# Create a new directory for your project
mkdir my-serverless-app
cd my-serverless-app

# Create main.tf with a simple Lambda pattern
cat > main.tf << 'EOF'
module "lambda_function" {
  source = "terraform-aws-modules/lambda/aws"

  function_name = "hello-world"
  handler       = "index.handler"
  runtime       = "nodejs20.x"
  
  source_path = "./src/index.js"
  
  tags = {
    Environment = "dev"
    Project     = "hello-world"
  }
}
EOF
```

### 2. Create Function Code

```bash
mkdir src
cat > src/index.js << 'EOF'
exports.handler = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Hello from your first serverless function!',
      timestamp: new Date().toISOString()
    })
  };
};
EOF
```

### 3. Deploy with Terraform

```bash
# Initialize Terraform
terraform init

# Plan the deployment
terraform plan

# Apply the changes
terraform apply
```

### 4. Test Your Function

```bash
# Get the function name from Terraform output
FUNCTION_NAME=$(terraform output -raw lambda_function_name)

# Invoke the function
aws lambda invoke --function-name $FUNCTION_NAME response.json
cat response.json
```

🎉 **Congratulations!** You've deployed your first serverless function using our patterns.

---

## What's Next?

Now that you have the basics working, explore more advanced patterns:

<div class="pattern-grid">

<div class="pattern-card">
<h3>:material-api: REST APIs</h3>
<p>Build HTTP APIs with Lambda and API Gateway</p>
<a href="../patterns/compute/api-gateway-lambda/" class="md-button">View Pattern</a>
</div>

<div class="pattern-card">
<h3>:material-database: Data Storage</h3>
<p>Add DynamoDB for persistent data storage</p>
<a href="../patterns/storage/" class="md-button">View Patterns</a>
</div>

<div class="pattern-card">
<h3>:material-share: Event-Driven</h3>
<p>Create reactive systems with EventBridge</p>
<a href="../patterns/integration/" class="md-button">View Patterns</a>
</div>

</div>

---

## Best Practices

!!! tip "Infrastructure as Code Best Practices"

    - **Version Control**: Always keep your Terraform code in version control
    - **State Management**: Use remote state storage (S3 + DynamoDB)
    - **Environment Separation**: Use workspaces or separate state files for different environments
    - **Resource Naming**: Follow consistent naming conventions
    - **Tagging**: Tag all resources for cost tracking and organization

!!! warning "Security Considerations"

    - **Least Privilege**: Grant minimal required permissions
    - **Secrets Management**: Use AWS Secrets Manager or Parameter Store
    - **Network Security**: Implement VPC configurations when needed
    - **Logging**: Enable CloudWatch logging for all functions

---

## Troubleshooting

### Common Issues

??? question "Terraform init fails"

    **Problem**: `terraform init` fails with provider errors
    
    **Solution**: Ensure you have the latest Terraform version and internet connectivity:
    ```bash
    terraform version
    terraform init -upgrade
    ```

??? question "AWS permission errors"

    **Problem**: `AccessDenied` errors during terraform apply
    
    **Solution**: Verify your AWS credentials and permissions:
    ```bash
    aws sts get-caller-identity
    aws iam get-user
    ```

??? question "Function deployment fails"

    **Problem**: Lambda function creation fails
    
    **Solution**: Check the function code path and permissions:
    ```bash
    ls -la src/
    terraform plan -detailed-exitcode
    ```

### Getting Help

- **AWS Documentation**: [AWS Lambda Developer Guide](https://docs.aws.amazon.com/lambda/)
- **Terraform Documentation**: [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/)
- **Community Support**: [terraform-aws-modules GitHub](https://github.com/terraform-aws-modules)

---

Ready to explore more patterns? Head over to our [pattern library](../patterns/index.md) to discover what's possible with serverless Terraform!