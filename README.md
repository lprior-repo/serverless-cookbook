# Serverless Terraform Cookbook

A TypeScript scraper that fetches Terraform patterns from GitHub using GraphQL API for efficient data extraction.

## Features

- **GraphQL API Integration**: Single query fetches all repository data instead of hundreds of REST calls
- **Terraform-Only Filtering**: Extracts only Terraform patterns from serverless repositories  
- **Image Extraction**: Includes architecture diagrams and images from patterns
- **Effect.ts Integration**: Robust error handling and functional programming approach
- **100% Test Coverage**: TDD-driven development with comprehensive testing
- **Type Safety**: Full TypeScript with strict functional programming patterns

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure GitHub token**:
   ```bash
   # Token already configured in .env
   GITHUB_TOKEN=your_token_here
   ```

3. **Build and run the Terraform scraper**:
   ```bash
   npm run build
   node dist/github-graphql.js
   ```

This will fetch Terraform patterns using a single GraphQL query instead of multiple REST API calls.

## Scripts

- `npm run build` - Build TypeScript to JavaScript
- `npm run scrape` - Run the cookbook scraper
- `npm run test` - Run tests with Vitest
- `npm run typecheck` - Run TypeScript type checking
- `npm run lint` - Run ESLint with functional programming rules

## Configuration

Create a `.env` file with your GitHub token for higher API rate limits:

```bash
GITHUB_TOKEN=your_github_token_here
```

## Output Format

The scraper generates a JSON file with the following structure:

```json
{
  "patterns": [
    {
      "title": "terraform-aws-lambda",
      "description": "aws lambda using lambda",
      "category": "compute",
      "services": ["lambda"],
      "repository_url": "https://github.com/org/repo.git",
      "example_code": "resource \"aws_lambda_function\" \"example\" { ... }"
    }
  ],
  "metadata": {
    "generated_at": "2025-08-09T01:37:00.776Z",
    "total_patterns": 1,
    "categories": ["compute"]
  }
}
```

## Architecture

Built with functional programming principles using:

- **Effect.ts** - Side effect management and error handling
- **TypeScript** - Type safety and compile-time validation
- **Vitest** - Testing framework with TDD approach
- **ESLint** - Functional programming rule enforcement
- **Octokit** - GitHub API client

## Project Structure

```
src/
├── serverless-land-builder.ts    # Main scraper implementation
├── serverless-land-builder.test.ts # Comprehensive test suite
├── types.ts                      # TypeScript type definitions
└── run-scraper.ts               # CLI runner script (future)
```

## Development

This project follows strict TDD and functional programming principles:

- All functions are pure with no side effects
- Immutable data structures throughout
- Effect.ts for managing side effects
- 100% test coverage requirement
- ESLint functional programming rules enforced

## Testing

Run the test suite:

```bash
npm test
```

Tests cover all functionality including GitHub API integration, pattern extraction, JSON generation, and file operations.