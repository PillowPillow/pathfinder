# Quickstart Guide: Pathfinder Party Manager

**Feature**: 001-party-manager | **Date**: 2025-11-14

This guide provides step-by-step instructions for setting up the development environment and starting implementation.

## Prerequisites

- **Node.js**: v20.x LTS ([Download](https://nodejs.org/))
- **npm**: v10.x (bundled with Node.js)
- **Git**: For version control
- **Code Editor**: VS Code recommended (with TypeScript, ESLint, Prettier extensions)

## Project Initialization

### 1. Initialize Next.js Project

```bash
# From repository root
npx create-next-app@11.1.4 . --typescript --use-npm

# Answer prompts:
# - Would you like to use ESLint? Yes
# - Would you like to use `src/` directory? Yes
# - Would you like to use App Router? No (use Pages Router for Next.js 11)
```

**Note**: Next.js 11 uses Pages Router (not App Router which came in Next.js 13+)

### 2. Install Core Dependencies

```bash
npm install socket.io@4.7.4 socket.io-client@4.7.4
npm install better-sqlite3@11.7.0
npm install bcryptjs@2.4.3
npm install uuid@9.0.1

# Type definitions
npm install --save-dev @types/better-sqlite3
npm install --save-dev @types/bcryptjs
npm install --save-dev @types/uuid
```

### 3. Install Development Dependencies

```bash
# Testing
npm install --save-dev jest@27.5.1 @testing-library/react@12.1.5 @testing-library/jest-dom@5.16.5
npm install --save-dev supertest@6.3.3 @types/supertest

# Linting & Formatting (ESLint already installed by create-next-app)
npm install --save-dev prettier eslint-config-prettier

# Tailwind CSS (for D&D theme)
npm install --save-dev tailwindcss@3.4.1 postcss@8.4.33 autoprefixer@10.4.17
npx tailwindcss init -p
```

### 4. Configure TypeScript (Strict Mode)

Edit `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitAny": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

### 5. Configure Tailwind CSS (D&D Theme)

Edit `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          light: '#f4e4c1',
          DEFAULT: '#e8d5a8',
          dark: '#d4c194',
        },
        ink: {
          light: '#3a2a1a',
          DEFAULT: '#2c1f0f',
          dark: '#1a1308',
        },
        gold: {
          light: '#f4d03f',
          DEFAULT: '#d4af37',
          dark: '#b8941f',
        },
        leather: {
          light: '#8b4513',
          DEFAULT: '#6f3609',
          dark: '#4a2403',
        },
      },
      fontFamily: {
        heading: ['Cinzel', 'serif'],
        body: ['Lora', 'serif'],
        mono: ['Courier Prime', 'monospace'],
      },
    },
  },
  plugins: [],
}
```

### 6. Configure Jest

Create `jest.config.js`:

```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  testMatch: [
    '<rootDir>/tests/**/*.test.ts',
    '<rootDir>/tests/**/*.test.tsx',
  ],
  collectCoverageFrom: [
    'src/domain/**/*.ts',
    'src/application/**/*.ts',
    'src/infrastructure/**/*.ts',
    'src/components/**/*.tsx',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThresholds: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
    './src/domain/**/*.ts': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
}

module.exports = createJestConfig(customJestConfig)
```

Create `jest.setup.js`:

```javascript
import '@testing-library/jest-dom'
```

### 7. Configure ESLint & Prettier

Create `.prettierrc`:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

Update `.eslintrc.json`:

```json
{
  "extends": [
    "next/core-web-vitals",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn"
  }
}
```

### 8. Create Custom Next.js Server (for Socket.IO)

Create `server.ts` in project root:

```typescript
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server as SocketIOServer } from 'socket.io';
import { setupSocketHandlers } from './src/infrastructure/socket/server';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: dev ? '*' : 'https://yourdomain.com',
      methods: ['GET', 'POST'],
    },
  });

  setupSocketHandlers(io);

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
```

### 9. Update package.json Scripts

```json
{
  "scripts": {
    "dev": "ts-node server.ts",
    "build": "next build",
    "start": "NODE_ENV=production ts-node server.ts",
    "lint": "next lint",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,css,md}\"",
    "test": "jest --watch",
    "test:ci": "jest --ci --coverage",
    "test:unit": "jest tests/unit",
    "test:integration": "jest tests/integration",
    "test:contract": "jest tests/contract"
  }
}
```

### 10. Create Directory Structure

```bash
# From repository root
mkdir -p src/domain/entities
mkdir -p src/domain/services
mkdir -p src/domain/types
mkdir -p src/application/useCases
mkdir -p src/application/dto
mkdir -p src/infrastructure/database/migrations
mkdir -p src/infrastructure/database/repositories
mkdir -p src/infrastructure/socket/handlers
mkdir -p src/infrastructure/auth
mkdir -p src/components/layout
mkdir -p src/components/campaign
mkdir -p src/components/character
mkdir -p src/components/common
mkdir -p pages/api/auth
mkdir -p pages/api/campaigns
mkdir -p pages/api/characters
mkdir -p pages/campaigns/invite
mkdir -p pages/characters
mkdir -p tests/contract/api
mkdir -p tests/contract/socket
mkdir -p tests/integration
mkdir -p tests/unit/domain
mkdir -p tests/unit/components
mkdir -p public/styles
mkdir -p public/fonts
mkdir -p database
```

### 11. Initialize SQLite Database

Create `src/infrastructure/database/sqlite.ts`:

```typescript
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'database', 'pathfinder.db');

// Ensure database directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new Database(dbPath, { verbose: console.log });

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Run migrations on startup
export function runMigrations(): void {
  const migrationsDir = path.join(__dirname, 'migrations');
  const migrationFiles = fs.readdirSync(migrationsDir).sort();

  for (const file of migrationFiles) {
    if (file.endsWith('.sql')) {
      console.log(`Running migration: ${file}`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
      db.exec(sql);
    }
  }

  console.log('All migrations completed');
}

// Initialize database on import
runMigrations();
```

Create first migration `src/infrastructure/database/migrations/001_initial_schema.sql`:

```sql
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  gm_user_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (gm_user_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_campaigns_gm ON campaigns(gm_user_id);

-- Invitations table
CREATE TABLE IF NOT EXISTS invitations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  campaign_id INTEGER NOT NULL,
  token TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  revoked BOOLEAN DEFAULT 0,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_campaign ON invitations(campaign_id);

-- Players table
CREATE TABLE IF NOT EXISTS players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  campaign_id INTEGER NOT NULL,
  joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, campaign_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_players_user_campaign ON players(user_id, campaign_id);
CREATE INDEX IF NOT EXISTS idx_players_campaign ON players(campaign_id);

-- Characters table
CREATE TABLE IF NOT EXISTS characters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  level INTEGER DEFAULT 1,
  race TEXT,
  class TEXT,
  strength INTEGER NOT NULL,
  dexterity INTEGER NOT NULL,
  constitution INTEGER NOT NULL,
  intelligence INTEGER NOT NULL,
  wisdom INTEGER NOT NULL,
  charisma INTEGER NOT NULL,
  hit_points INTEGER,
  armor_class INTEGER,
  is_alive BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_characters_player ON characters(player_id);
CREATE INDEX IF NOT EXISTS idx_characters_alive ON characters(is_alive);

-- Activity logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  character_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  field_name TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_character ON activity_logs(character_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON activity_logs(changed_at);

-- Sessions table (for authentication)
CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
```

### 12. Create .gitignore

Add to `.gitignore`:

```
# Database
database/
*.db
*.db-journal

# Dependencies
node_modules/

# Next.js
.next/
out/

# Production
build/
dist/

# Misc
.DS_Store
*.log

# Environment
.env
.env.local
.env.production.local

# Testing
coverage/
.nyc_output/

# IDE
.vscode/
.idea/
```

## Development Workflow

### TDD Workflow (Test-First Approach)

1. **Write Failing Test** (Red)
```bash
# Example: Test ability modifier calculation
npm run test tests/unit/domain/AbilityCalculator.test.ts
```

2. **Write Minimal Implementation** (Green)
```typescript
// src/domain/services/AbilityCalculator.ts
export class AbilityCalculator {
  static calculateModifier(score: number): number {
    return Math.floor((score - 10) / 2);
  }
}
```

3. **Refactor** (Refactor)
- Apply SOLID principles
- Eliminate duplication
- Improve naming

4. **Repeat** for next feature

### Running the Application

```bash
# Development mode (with hot reload)
npm run dev

# Visit http://localhost:3000

# Run tests in watch mode
npm test

# Run specific test suite
npm run test:unit
npm run test:integration
npm run test:contract

# Lint code
npm run lint

# Format code
npm run format
```

## Implementation Order (Following User Stories)

### Phase 1: Foundation (User Story 1 - P1)
1. **Domain Layer**: User, Campaign, Invitation entities
2. **Infrastructure**: Database repositories, authentication helpers
3. **API Routes**: `/api/auth/register`, `/api/auth/login`, `/api/campaigns/create`, `/api/campaigns/invite`
4. **Pages**: Login, Register, Campaign Dashboard
5. **Tests**: Contract tests for auth + campaign APIs

### Phase 2: Character Management (User Story 2 - P2)
1. **Domain Layer**: Character entity, AbilityCalculator service
2. **Infrastructure**: Character repository, validation
3. **API Routes**: `/api/characters/create`, `/api/characters/[id]`
4. **Pages**: Character creation form, character sheet view
5. **Tests**: Unit tests for ability calculations, integration tests for character creation

### Phase 3: GM Oversight (User Story 3 - P3)
1. **Application Layer**: GetPartyView use case, UpdateCharacter use case
2. **API Routes**: Permission checks for GM vs player
3. **UI Components**: Party list (GM view), character edit permissions
4. **Tests**: Authorization tests, GM permission checks

### Phase 4: Real-Time (User Story 4 - P4)
1. **Infrastructure**: Socket.IO server setup, event handlers
2. **Socket Events**: `character:update`, `character:updated`, `campaign:player-joined`
3. **Client Integration**: Socket.IO client hooks, optimistic updates
4. **Tests**: Socket event contract tests, real-time sync integration tests

### Phase 5: Privacy & Access Control (User Story 5 - P5)
1. **Authorization Layer**: Player-only character access, GM all-access
2. **UI**: Hide other players' characters, show only own character
3. **Tests**: Privacy enforcement tests, access control integration tests

## Verification Checklist

Before moving to Phase 2 (tasks.md generation):

- ✅ All dependencies installed
- ✅ TypeScript strict mode enabled
- ✅ ESLint + Prettier configured
- ✅ Jest configured with coverage thresholds
- ✅ Tailwind CSS configured with D&D theme
- ✅ Custom Next.js server with Socket.IO ready
- ✅ Directory structure created
- ✅ SQLite database initialized with migrations
- ✅ Git repository initialized (branch: 001-party-manager)

Run verification:

```bash
# Check TypeScript compilation
npx tsc --noEmit

# Check linting
npm run lint

# Check formatting
npm run format

# Run initial (empty) test suite
npm run test:ci

# Start dev server (should run without errors)
npm run dev
```

All checks pass? **Ready to proceed to /speckit.tasks for task breakdown!**
