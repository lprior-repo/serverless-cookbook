# Serverless Terraform Fetcher

A Node.js application that fetches and indexes Terraform patterns from AWS Serverless Land using Express, tRPC, and Zod for type safety.

## Features

- Fetches Terraform patterns from the AWS Serverless Patterns repository
- Generates searchable index of patterns with services and pattern types  
- Provides both tRPC and REST API to query patterns
- Type-safe validation using Zod schemas
- Simple web interface to browse and search patterns
- Real-time pattern search and filtering
- TDD-focused development with automated testing

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Fetch patterns** (optional - creates local index):
   ```bash
   npm run fetch
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** to `http://localhost:3000`

## API Endpoints

### tRPC Endpoints (Recommended)
- `POST /api/trpc/patterns.getAll` - Get all patterns
- `POST /api/trpc/patterns.getByName` - Get pattern by name
- `POST /api/trpc/patterns.search` - Search patterns
- `POST /api/trpc/patterns.getByService` - Filter by AWS service
- `POST /api/trpc/patterns.getByType` - Filter by pattern type
- `POST /api/trpc/patterns.getServices` - Get all available services
- `POST /api/trpc/patterns.getPatternTypes` - Get all pattern types

### REST Endpoints (Legacy)
- `GET /api/patterns` - Get all patterns
- `GET /api/patterns/:name` - Get pattern by name
- `GET /api/patterns/search/:query` - Search patterns
- `GET /api/patterns/by-service/:service` - Filter by AWS service
- `GET /api/patterns/by-type/:type` - Filter by pattern type
- `GET /api/services` - Get all available services
- `GET /api/pattern-types` - Get all pattern types

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript for production
- `npm run start` - Start production server
- `npm run fetch` - Fetch latest patterns from AWS Serverless Land
- `npm run typecheck` - Run TypeScript type checking
- `npm run test` - Run tests with Vitest and TDD guard

## Configuration

Set `GITHUB_TOKEN` environment variable for higher rate limits when fetching patterns.

## Structure

- `src/index.ts` - Main server application
- `src/fetcher.ts` - Pattern fetching and indexing logic
- `src/schemas.ts` - Zod validation schemas
- `src/services/` - Business logic services
- `src/routers/` - tRPC route definitions
- `terraform_patterns/` - Generated pattern index and documentation
- `public/` - Static assets (optional)

## Type Safety

This application uses Zod for runtime validation and TypeScript for compile-time type checking. All API inputs and outputs are validated against schemas defined in `src/schemas.ts`.

## Testing

The project uses Vitest for testing with TDD guard integration for continuous test running. Tests are located in `__tests__` directories alongside the source files.