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

## Testing

- Server: Jest with ts-jest transformer, separate configs for unit tests (default) and e2e tests
- Run single test file: `npm run test -- filename.spec.ts`
- Webapp: No test framework configured yet