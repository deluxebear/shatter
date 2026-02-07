# Shatter

An interactive mobile app featuring a mesmerizing particle effect experience. Tap anywhere on screen to unleash colorful particles, ripples, and haptic feedback.

## Features

- **Interactive Particle Effects** - Tap to create bursts of colorful particles with smooth animations
- **Ripple Animations** - Beautiful ripple effects radiate from each tap point
- **Haptic Feedback** - Feel every tap with device vibration feedback
- **Tap Counter** - Track your total taps with a sleek counter display
- **Dark Theme** - A polished dark UI designed for immersive experience
- **Cross-Platform** - Runs on iOS, Android, and Web

## Tech Stack

### Frontend
- **Expo SDK 54** with React Native 0.81
- **expo-router** v6 - File-based routing
- **react-native-reanimated** - High-performance animations
- **expo-haptics** - Native haptic feedback
- **TanStack React Query** - Server state management
- **Space Grotesk** - Custom typography

### Backend
- **Express.js** v5 with TypeScript
- **Drizzle ORM** - Type-safe database access
- **PostgreSQL** - Primary database
- **Zod** - Schema validation

## Project Structure

```
app/                  # Expo Router screens
  _layout.tsx         # Root layout with providers
  index.tsx           # Main interactive particle screen
components/           # Reusable UI components
constants/            # Theme colors and configuration
lib/                  # Utilities and API client
server/               # Express.js backend
  index.ts            # Server entry point
  routes.ts           # API route definitions
  storage.ts          # Data storage layer
shared/               # Shared code (schema, types)
assets/               # Images, icons, fonts
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Expo Go app (for mobile testing)

### Installation

```bash
npm install
```

### Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `EXPO_PUBLIC_DOMAIN` | Public domain for API calls |

### Development

Start the backend server:

```bash
npm run server:dev
```

Start the Expo dev server:

```bash
npm run expo:dev
```

### Database

Push schema changes:

```bash
npm run db:push
```

## License

MIT
