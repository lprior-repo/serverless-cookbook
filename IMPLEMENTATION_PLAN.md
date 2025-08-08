# Terraform Serverless Land Builder - Implementation Plan

## Current Status
✅ **Completed:**
- ESLint configuration with strict functional programming rules
- TDD Guard Vitest reporter setup
- Basic repository ingestion (`ingestServerlessTfModules`)
- Repository filtering (`filterTerraformModules`)
- Type definitions for Repository, OctokitClient, TerraformPattern

## Remaining Implementation

### 1. Pattern Extraction (`extractTerraformPattern`)
**Function Signature:**
```typescript
extractTerraformPattern(repository: Repository, terraformContent: string): TerraformPattern
```

**Core Logic:**
- Extract AWS service names from `resource "aws_*"` declarations
- Generate description from repository name and services
- Categorize based on primary service type (compute, database, storage, etc.)
- Return structured pattern object

**Helper Functions:**
- `extractAwsServices`: Parse terraform content for AWS resource types
- `createCategoryFromServices`: Map services to categories
- `createDescriptionFromRepo`: Generate human-readable descriptions

### 2. Main Builder Pipeline
**Function Signature:**
```typescript
buildServerlessTerraformCookbook(octokit: OctokitClient): Effect.Effect<readonly TerraformPattern[], Error>
```

**Pipeline Steps:**
1. Ingest repositories from serverless-tf organization
2. Filter for terraform modules
3. For each module, extract patterns from terraform files
4. Compose all patterns into final collection

### 3. JSON Output Generation
**Function Signature:**
```typescript
generateJsonOutput(patterns: readonly TerraformPattern[]): string
```

**Output Format:**
```json
{
  "patterns": [...],
  "metadata": {
    "generated_at": "ISO timestamp",
    "total_patterns": "number",
    "categories": ["compute", "database", ...]
  }
}
```

## Implementation Approach
Following strict TDD:
1. Write failing test for each function
2. Create minimal implementation to pass
3. Refactor using pure functional patterns
4. Maintain 100% test coverage

## Functional Programming Principles
- All functions are pure (no side effects)
- Use Effect.ts for managing side effects
- Immutable data structures throughout
- Function composition over imperative logic
- Proper error handling through Effect's error channel