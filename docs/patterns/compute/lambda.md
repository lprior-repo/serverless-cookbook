---
title: Lambda
description: AWS Lambda lets you run code without provisioning or managing servers.
tags:
  - serverless
  - terraform
  - aws
  - lambda
  - basic
  - function
---

# Lambda

AWS Lambda lets you run code without provisioning or managing servers.

<div class="md-typeset" markdown>
<div class="md-grid">
<div class="md-cell md-cell--12">
<a href="https://github.com/terraform-aws-modules/terraform-aws-lambda" title="View Source" class="md-button md-button--primary">
View Source Repository
</a>
</div>
</div>
</div>

---

## At a Glance



<div class="at-a-glance" markdown="1">

| Property | Value |
| --- | --- |
| **Examples** | 1 implementation pattern |
| **AWS Services** | `lambda` |
| **Primary Use Case** | AWS Lambda lets you run code without provisioning or managing servers. |
| **Source Repo** | [terraform-aws-modules](https://github.com/terraform-aws-modules/terraform-aws-lambda) |
| **Category** | compute |

</div>

---

## When to Use Lambda

!!! info "Use Lambda when you need to:"

    * AWS Lambda lets you run code without provisioning or managing servers.
    * Build serverless applications with AWS Lambda
    * Implement scalable, cost-effective solutions
    * Follow infrastructure as code best practices

---

## Architecture

Lambda is a key component of AWS serverless architecture. The implementation follows AWS best practices and uses the terraform-aws-modules for reliable, tested infrastructure components.


## Implementation

```terraform title="main.tf"
resource "aws_lambda_function" "example" {}
```

---

## Next Steps

!!! tip "Related Resources"

    * [Official AWS Lambda Documentation](https://docs.aws.amazon.com/)
    * [Terraform AWS Provider Documentation](https://registry.terraform.io/providers/hashicorp/aws/latest)
    * [Source Repository](https://github.com/terraform-aws-modules/terraform-aws-lambda)

---

## Contributing

Found an issue or want to improve these patterns? [Open an issue](https://github.com/terraform-aws-modules/terraform-aws-lambda/issues) or submit a pull request to the source repository.
