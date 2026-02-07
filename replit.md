# Shatter - Replit Agent Guide

## Overview

Shatter is a mobile-first application built with Expo (React Native) and an Express.js backend. The app currently features an interactive particle/tap effect experience with a dark-themed UI. It uses a file-based routing system (expo-router), a PostgreSQL database with Drizzle ORM for data modeling, and TanStack React Query for client-server data fetching. The project is configured for development and deployment on Replit with proxy support for the Expo dev server.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend (Expo / React Native)

- **Framework**: Expo SDK 54 with React Native 0.81, using the new architecture (`newArchEnabled: true`) and React Compiler experiment.
- **Routing**: expo-router v6 with file-based routing. All screens live in the `app/` directory. The root layout (`app/_layout.tsx`) sets up providers (QueryClient, GestureHandler, StatusBar).
- **Styling**: Dark theme by default (`userInterfaceStyle: "dark"`). Colors are centralized in `constants/colors.ts`. The app uses a Space Grotesk custom font loaded via `@expo-google-fonts/space-grotesk`.
- **State Management**: TanStack React Query for server state. The query client and API helper functions are in `lib/query-client.ts`.
- **Animations**: react-native-reanimated for animations, expo-haptics for haptic feedback.
- **Error Handling**: Custom `ErrorBoundary` class component wrapping the app, with an `ErrorFallback` UI component.
- **Platform Support**: Primarily targets iOS and Android. Web support exists (react-native-web) but is secondary. The app is portrait-only and does not support tablets.

### Backend (Express.js)

- **Server**: Express v5 running in `server/index.ts`. Serves API routes and, in production, serves the static Expo web build.
- **Routes**: Defined in `server/routes.ts` via `registerRoutes()`. All API routes should be prefixed with `/api`.
- **CORS**: Dynamically configured based on Replit environment variables (`REPLIT_DEV_DOMAIN`, `REPLIT_DOMAINS`) and allows localhost origins for local Expo web dev.
- **Storage Layer**: Abstracted behind an `IStorage` interface in `server/storage.ts`. Currently uses in-memory storage (`MemStorage`). This can be swapped to a database-backed implementation using Drizzle ORM.

### Database

- **ORM**: Drizzle ORM with PostgreSQL dialect. Schema is defined in `shared/schema.ts`.
- **Schema**: Currently has a `users` table with `id` (UUID, auto-generated), `username` (unique text), and `password` (text).
- **Validation**: Uses `drizzle-zod` to generate Zod schemas from Drizzle table definitions for insert validation.
- **Migrations**: Drizzle Kit configured in `drizzle.config.ts`, outputs to `./migrations`. Use `npm run db:push` to push schema changes.
- **Connection**: Requires `DATABASE_URL` environment variable pointing to a PostgreSQL instance.

### Build & Deployment

- **Development**: Two processes run concurrently — `expo:dev` for the Expo bundler and `server:dev` for the Express backend (using `tsx`).
- **Production Build**: `expo:static:build` generates a static web bundle. `server:build` bundles the server with esbuild. `server:prod` runs the production server.
- **Replit Integration**: The server uses Replit environment variables for domain/proxy configuration. The build script (`scripts/build.js`) handles Replit deployment domain detection.

### Shared Code

- The `shared/` directory contains code shared between frontend and backend (currently just the database schema and types).
- Path aliases configured: `@/*` maps to project root, `@shared/*` maps to `./shared/*`.

## External Dependencies

### Core Services
- **PostgreSQL**: Primary database, connected via `DATABASE_URL` environment variable. Required for Drizzle ORM operations.

### Key NPM Packages
- **expo** (~54.0.27): Core mobile framework
- **express** (^5.0.1): Backend HTTP server
- **drizzle-orm** (^0.39.3) + **drizzle-kit**: Database ORM and migration tooling
- **@tanstack/react-query** (^5.83.0): Client-side data fetching and caching
- **pg** (^8.16.3): PostgreSQL client driver
- **zod** + **drizzle-zod**: Schema validation
- **react-native-reanimated** (~4.1.1): Animations
- **expo-haptics**: Device haptic feedback
- **http-proxy-middleware**: Dev server proxying for Expo on Replit

### Fonts
- **Space Grotesk** (Regular 400, Bold 700): Primary app font via `@expo-google-fonts/space-grotesk`

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (required for database operations)
- `REPLIT_DEV_DOMAIN`: Replit development domain (used for CORS and Expo proxy)
- `REPLIT_DOMAINS`: Comma-separated production domains (used for CORS)
- `EXPO_PUBLIC_DOMAIN`: Public-facing domain for API calls from the client