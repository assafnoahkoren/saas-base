# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a full-stack SaaS application with a monorepo structure:

- `server/` - NestJS backend API server (TypeScript)
- `webapp/` - React frontend with Vite and TypeScript

## Development Commands

### Server (NestJS)
```bash
cd server
npm install
npm run dev          # Development with watch mode
npm run build        # Build for production
npm run start:prod   # Run production build
npm run lint         # Run ESLint with auto-fix
npm run format       # Format code with Prettier
npm run test         # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run test:e2e     # Run end-to-end tests
npm run test:cov     # Run tests with coverage
npm run repl         # Start interactive REPL

# Prisma Database Commands
npm run prisma:generate  # Generate Prisma client
npm run prisma:push      # Push schema to database (dev only)
npm run prisma:pull      # Pull schema from database
npm run prisma:migrate   # Create and run migrations
npm run prisma:studio    # Open Prisma Studio (database GUI)
npm run prisma:reset     # Reset database and run migrations

# Migration Workflow
- Use `npm run prisma:migrate` for development changes
- Migration files are in `prisma/migrations/` and should be committed
- Database schema is tracked with proper migration history
```

### Webapp (React + Vite)
```bash
cd webapp
npm install
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

## Architecture Notes

- Server uses NestJS framework with Express platform
- Webapp uses React 19 with Vite as the build tool
- Both projects use TypeScript with strict typing
- Server includes Jest for testing with both unit and e2e test configurations
- ESLint is configured for both projects with TypeScript support
- Server includes Prettier for code formatting
- **Database**: Prisma ORM with PostgreSQL
  - Schema: `server/prisma/schema.prisma`
  - Example User and Organization models included
  - Global PrismaService with logging integration
  - Transaction support with error handling
- **CORS**: Configured for development (open policy)
  - Allows any origin (`origin: true`)
  - Supports all standard HTTP methods
  - Includes credentials support for authentication
  - Note: For production, should be restricted to specific domains

### Logging System
- **Centralized logging** with Winston + Loki integration
- **Structured JSON logging** with consistent metadata
- **HTTP request/response logging** with request IDs for tracing
- **Automatic error tracking** with stack traces
- **Method-level logging** using `@Log()` decorator
- **Sensitive data sanitization** (passwords, tokens, etc.)
- **Multi-transport support** (console + Loki)
- **Error-level failsafe** - Error logs always go to console regardless of settings
- **Environment-based configuration**:
  - `LOG_LEVEL` - Controls logging verbosity (debug, info, warn, error)
  - `ENABLE_CONSOLE_LOGGER` - Enables/disables console output (true/false)
    - When `true`: All log levels go to console
    - When `false`: Only error level logs go to console

## Infrastructure Services

The project includes a Docker Compose setup with the following services:

### Database & Storage
- **PostgreSQL**: Main database (port 5432)
  - Database: `saas_dev`
  - User/Password: `postgres/postgres`
- **Redis**: Caching and session storage (port 6379)

### Message Queue
- **RabbitMQ**: Message broker (ports 5672, 15672)
  - AMQP: port 5672
  - Management UI: http://localhost:15672 (admin/admin)

### Development Tools
- **MailHog**: Email testing (ports 1025, 8025)
  - SMTP: port 1025
  - Web UI: http://localhost:8025

### Logging & Monitoring (Loki Stack)
- **Loki**: Log aggregation system (port 3100)
  - API: http://localhost:3100
- **Grafana**: Visualization and dashboards (port 3000)
  - Web UI: http://localhost:3000 (admin/admin)
- **Promtail**: Log collection agent
  - Collects container logs and system logs
  - Forwards to Loki for storage and querying

### Running Services
```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs [service_name]
```

All service credentials and connection strings are available in `server/.env`.

## Testing

- Server: Jest with ts-jest transformer, separate configs for unit tests (default) and e2e tests
- Run single test file: `npm run test -- filename.spec.ts`
- Webapp: No test framework configured yet

## Work Loop Guidelines

When working on tasks in this codebase, follow these guidelines:

### Code Quality
1. **Always run linting** after making changes:
   - Server: `cd server && npm run lint`
   - Webapp: `cd webapp && npm run lint`

2. **Format code** when needed:
   - Server: `cd server && npm run format`

3. **Run tests** to verify changes:
   - Server unit tests: `cd server && npm run test`
   - Server e2e tests: `cd server && npm run test:e2e`

### Linting Guidelines
**IMPORTANT**: When encountering linting errors, NEVER disable linting rules with eslint-disable comments. Instead:

1. **Fix the actual issue** by:
   - Creating proper TypeScript type definitions for untyped modules
   - Using proper imports/exports (e.g., use `esModuleInterop` in tsconfig.json for CommonJS modules)
   - Adding missing type annotations
   - Refactoring code to be type-safe

2. **If needed, modify tsconfig.json** to enable proper module handling:
   - Add `"esModuleInterop": true` for CommonJS module imports
   - Adjust `"strict"` settings if absolutely necessary
   - Use `"allowSyntheticDefaultImports": true` for default imports

3. **For third-party modules without types**:
   - Check if `@types/package-name` exists
   - If not, create a type declaration file in `src/types/package-name.d.ts`

4. **Each package has its own ESLint configuration**:
   - Server: `/server/eslint.config.mjs`
   - Webapp: `/webapp/eslint.config.mjs`
   - Modify these configs only when adding new plugins or adjusting project-wide rules

### Development Tools
1. **Use REPL for debugging/exploration**:
   - Server: `cd server && npm run repl`
   - Interactive access to NestJS application context

2. **Use Playwright MCP for browser automation** when tasks involve:
   - Web UI testing
   - Browser automation
   - Screenshot capture
   - Form interactions
   - Navigation testing

### Task Completion Checklist
Before marking any task as complete:
- [ ] Code has been linted and passes all checks
- [ ] Code has been formatted (if applicable)
- [ ] Tests have been run and pass
- [ ] REPL tested functionality (if applicable)
- [ ] Browser functionality verified with Playwright (if web-related)