# Agent Guidelines

## Project Overview

This is a Node.js authentication API built with Clean Architecture principles. Before making any changes, read the architecture documentation to understand the dependency flow and layer separation.

## Tech Stack

- Node.js with ES modules
- Check package.json for installed dependencies
- Key libraries: Hapi.js (server), PostgreSQL (database), Bcrypt (password hashing), Jest (testing)

## Package Manager

Always use pnpm for all package operations

## Development Commands

```bash
pnpm run start:dev    # Start development server with auto-reload
pnpm run test         # Run all Jest tests
pnpm run test:watch   # Run tests in watch mode
pnpm run migrate      # Run database migrations for development
pnpm run migrate:test # Run database migrations for test environment
pnpm run start        # Start production server
```

## Required Reading

Before working on features, review these documents:

- `docs/clean_architecture.md` - Understand the 5-layer architecture, dependency flow, and design patterns
- `docs/auth_api_postman.md` - API endpoints and test scenarios (currently only covers /users and /authentications endpoints)

## Architecture Rules

- Follow Clean Architecture dependency rule: dependencies only point inward
- Domains layer has zero external dependencies
- Use cases orchestrate business logic, never put business rules in handlers
- Always use dependency injection via the container
- Implement abstractions in Domains/Applications, implementations in Infrastructures
- All new features must follow existing layer structure

## Code Placement Guide

- Entities and validation rules: `src/Domains/{feature}/entities/`
- Repository interfaces: `src/Domains/{feature}/{Feature}Repository.js`
- Use cases: `src/Applications/use_case/`
- Service interfaces: `src/Applications/{service}/`
- Repository implementations: `src/Infrastructures/repository/`
- Service implementations: `src/Infrastructures/security/` or similar
- HTTP handlers: `src/Interfaces/http/api/{feature}/handler.js`
- Routes: `src/Interfaces/http/api/{feature}/routes.js`
- Error classes: `src/Commons/exceptions/`

## Testing Requirements

- Every new class must have a corresponding test file in \_test/ directory
- Run tests after making changes to verify nothing breaks
- Use test helpers in tests/ directory for database operations
- Mock dependencies in use case tests
- Use real implementations for infrastructure integration tests

## Database Operations

- Never write raw SQL in use cases or handlers
- All database queries go in repository implementations
- Use parameterized queries to prevent SQL injection
- Always handle database errors appropriately

## Error Handling

- Throw semantic errors in domain entities (e.g., 'REGISTER_USER.NOT_CONTAIN_NEEDED_PROPERTY')
- Add error translations to DomainErrorTranslator when adding new domain errors
- Use InvariantError for 400, AuthenticationError for 401, NotFoundError for 404
- Let the server's onPreResponse hook handle error responses

## Strict Constraints

- NEVER hardcode secrets, tokens, or credentials in code
- NEVER modify package.json unless explicitly requested
- NEVER modify migration files after they've been run
- NEVER skip writing tests for new code
- NEVER put business logic in HTTP handlers
- NEVER import infrastructure implementations in domain or application layers
- NEVER expose sensitive data in error messages or logs
- NEVER commit .env files or local configuration

## Configuration

- All environment variables must be defined in `.env.example`
- Access config only through `src/Commons/config.js`
- Never use process.env directly in business logic

## Git Practices

- Write clear commit messages describing what changed and why
- Don't commit console.log statements or commented-out code
- Don't commit node_modules, coverage, or .env files

## When Adding New Features

1. Define entities in Domains layer with validation
2. Create repository interface if data persistence needed
3. Create use case in Applications layer
4. Implement repository in Infrastructures layer
5. Create handler in Interfaces layer
6. Register dependencies in container.js
7. Add routes and plugin registration
8. Write tests for all layers
9. Update error translator if new errors added
10. Test API with Postman and update documentation if needed
