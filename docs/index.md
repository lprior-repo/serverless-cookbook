# Serverless Terraform Cookbook

> **Production-ready Terraform patterns for AWS serverless architecture**

Welcome to the Serverless Terraform Cookbook! This comprehensive collection of patterns and templates will help you build scalable, cost-effective serverless applications using Infrastructure as Code.

<div class="md-typeset" markdown>
<div class="md-grid">
<div class="md-cell md-cell--6">
<a href="getting-started/" title="Get Started" class="md-button md-button--primary">
🚀 Get Started
</a>
</div>
<div class="md-cell md-cell--6">
<a href="patterns/" title="Browse Patterns" class="md-button">
📦 Browse Patterns
</a>
</div>
</div>
</div>

---

## Why This Cookbook?

!!! success "Battle-tested patterns"

    Every pattern in this cookbook is based on real-world, production-ready Terraform modules from the **terraform-aws-modules** organization. You're getting infrastructure code that has been used and validated by thousands of developers.

!!! info "Comprehensive coverage"

    From simple Lambda functions to complex event-driven architectures, we cover all the essential AWS serverless services with practical examples and best practices.

!!! tip "Developer-friendly"

    Each pattern includes complete Terraform code, architecture diagrams, usage examples, and clear explanations of when and how to use each pattern.

---

## Featured Patterns

<div class="pattern-grid">

<div class="pattern-card">
<h3>:simple-awslambda: Lambda Functions</h3>
<p>Build serverless compute with AWS Lambda - from simple functions to complex container-based deployments.</p>
<a href="patterns/compute/" class="md-button">Explore Lambda Patterns</a>
</div>

<div class="pattern-card">
<h3>:material-calendar-sync: Event-Driven Architecture</h3>
<p>Create responsive, scalable systems using EventBridge, SNS, and SQS for seamless service integration.</p>
<a href="patterns/integration/" class="md-button">Explore Integration Patterns</a>
</div>

<div class="pattern-card">
<h3>:simple-amazons3: Data & Storage</h3>
<p>Manage data effectively with S3, DynamoDB, Aurora Serverless, and other AWS storage services.</p>
<a href="patterns/storage/" class="md-button">Explore Storage Patterns</a>
</div>

<div class="pattern-card">
<h3>:material-shield-check: Security & Config</h3>
<p>Implement robust security with Secrets Manager, Parameter Store, and AppConfig for configuration management.</p>
<a href="patterns/security/" class="md-button">Explore Security Patterns</a>
</div>

</div>

---

## Quick Start Example

Here's a taste of what you'll find in this cookbook - a simple serverless API:

```terraform title="main.tf"
module "lambda_api" {
  source = "terraform-aws-modules/lambda/aws"

  function_name = "my-api"
  handler       = "index.handler"
  runtime       = "nodejs20.x"
  source_path   = "./src"

  # API Gateway integration
  create_lambda_function_url = true
  cors = {
    allow_credentials = false
    allow_origins     = ["*"]
    allow_methods     = ["*"]
    allow_headers     = ["date", "keep-alive"]
    expose_headers    = ["date", "keep-alive"]
    max_age          = 86400
  }

  tags = {
    Environment = "dev"
    Project     = "my-serverless-api"
  }
}
```

!!! tip "Want to see more?"

    [Browse all patterns →](patterns/index.md) or [check out our getting started guide →](getting-started/index.md)

---

## Community & Support

- **Source Code**: All patterns are based on the official [terraform-aws-modules](https://github.com/terraform-aws-modules) repositories
- **Issues**: Found a problem? [Open an issue](https://github.com/terraform-aws-modules/terraform-aws-lambda/issues)
- **Contributions**: Want to contribute? Check out our [contribution guide](contributing/index.md)

---

*Last updated: December 2024*