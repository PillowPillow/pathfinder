# Research: Pathfinder Party Manager

**Feature**: 001-party-manager | **Date**: 2025-11-14

This document resolves all "NEEDS CLARIFICATION" items from the Technical Context and provides research-backed decisions for implementation.

## Testing Framework & Strategy

### Decision
**Jest 27.x + React Testing Library 12.x + Supertest** for comprehensive test coverage

### Rationale
- **Jest**: Standard testing framework for Next.js 11, excellent TypeScript support, built-in mocking, coverage reporting
- **React Testing Library**: Best practice for testing React components, focuses on user behavior over implementation details
- **Supertest**: HTTP assertion library for testing API routes (Next.js endpoints)
- All three integrate seamlessly with Next.js 11.x ecosystem

### Test Structure
```
tests/
├── contract/          # API contract tests using Supertest
├── integration/       # End-to-end workflow tests with Socket.IO simulation
└── unit/              # Domain logic and component tests with Jest + RTL
```

### Best Practices Applied
- **Test Pyramid**: 70% unit (domain logic + components), 20% integration (workflows), 10% contract (API boundaries)
- **TDD Workflow**: Red (write failing test) → Green (minimal implementation) → Refactor (apply SOLID/DRY)
- **Socket.IO Testing**: Use `socket.io-client` in tests to simulate real-time events
- **Database Testing**: Use in-memory SQLite (`:memory:`) for test isolation

### Alternatives Considered
- **Vitest**: Modern alternative to Jest, but less mature ecosystem for Next.js 11 (better for Next.js 13+)
- **Cypress/Playwright**: E2E frameworks, overkill for MVP scope, slower test execution

---

## Next.js 11 + Socket.IO Integration

### Decision
**Custom Next.js server with Socket.IO attached to HTTP server**

### Rationale
Next.js 11 uses API routes but doesn't natively support WebSocket/Socket.IO. Must create custom server:

```typescript
// server.ts (custom Next.js server)
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server as SocketIOServer } from 'socket.io';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new SocketIOServer(httpServer, {
    cors: { origin: '*' } // Configure for production
  });

  // Socket.IO event handlers
  io.on('connection', (socket) => {
    // Handle character updates, campaign events, etc.
  });

  httpServer.listen(3000, () => {
    console.log('> Ready on http://localhost:3000');
  });
});
```

### Best Practices Applied
- **Room-Based Broadcasting**: Each campaign gets a Socket.IO room for isolated updates
- **Authentication**: Validate session tokens before allowing socket connections
- **Event Typing**: Use TypeScript interfaces for all socket events (type-safe emit/on)
- **Reconnection Handling**: Client-side reconnection logic with state sync

### Alternatives Considered
- **Polling**: Simple but inefficient, doesn't meet <2s real-time update requirement
- **Server-Sent Events (SSE)**: Unidirectional, requires separate POST for client → server updates
- **WebSockets (native)**: Lower-level, Socket.IO provides better reconnection and room management

---

## SQLite with Next.js & TypeScript

### Decision
**better-sqlite3** as the SQLite driver with custom repository pattern

### Rationale
- **better-sqlite3**: Synchronous API (simpler code), faster than `sqlite3` async driver, excellent TypeScript support
- **Repository Pattern**: Aligns with DDD/SOLID, provides clean abstraction over database access
- **Migrations**: Simple SQL migration files executed on app startup

### Database Schema Approach
```sql
-- migrations/001_initial_schema.sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE campaigns (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  gm_user_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (gm_user_id) REFERENCES users(id)
);

CREATE TABLE invitations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  campaign_id INTEGER NOT NULL,
  token TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  revoked BOOLEAN DEFAULT 0,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id)
);

CREATE TABLE players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  campaign_id INTEGER NOT NULL,
  joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, campaign_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id)
);

CREATE TABLE characters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  level INTEGER DEFAULT 1,
  race TEXT,
  class TEXT,
  -- Ability scores
  strength INTEGER NOT NULL,
  dexterity INTEGER NOT NULL,
  constitution INTEGER NOT NULL,
  intelligence INTEGER NOT NULL,
  wisdom INTEGER NOT NULL,
  charisma INTEGER NOT NULL,
  -- Derived stats
  hit_points INTEGER,
  armor_class INTEGER,
  -- Status
  is_alive BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (player_id) REFERENCES players(id)
);

CREATE TABLE activity_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  character_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  field_name TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (character_id) REFERENCES characters(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Best Practices Applied
- **Foreign Keys**: Enforce referential integrity at database level
- **Indexes**: Add indexes on frequently queried fields (email, token, campaign_id)
- **Timestamps**: Track creation and updates for audit trail
- **Boolean Flags**: `is_alive` for one-living-character enforcement, `revoked` for invitation management

### Alternatives Considered
- **Prisma ORM**: Heavy for MVP, Next.js 11 compatibility concerns (better for Next.js 12+)
- **TypeORM**: Complex configuration, overkill for simple CRUD operations
- **Knex.js**: Query builder adds abstraction layer without significant benefit for SQLite

---

## Node.js Version & Deployment

### Decision
**Node.js 24.x LTS** (latest long-term support)

### Rationale
- **LTS Status**: Stable, security updates through April 2026
- **Performance**: V8 engine improvements, faster startup times
- **Compatibility**: Next.js 16 fully supports Node 20
- **TypeScript Support**: Native ESM support, better module resolution

### Development Setup
```json
// package.json engines field
{
  "engines": {
    "node": ">=20.0.0",
    "npm": ">=10.0.0"
  }
}
```

### Deployment Considerations
- **Local First**: SQLite database makes this ideal for local/single-server deployment
- **Production**: Simple deployment via PM2, Docker, or systemd service
- **No Cloud Lock-in**: Can run anywhere Node.js runs (VPS, Docker, local machine)

### Alternatives Considered
- **Node.js 18.x LTS**: Still supported but older, missing performance improvements
- **Node.js 21.x**: Current version but not LTS, less stable for production

---

## D&D/Pathfinder UI Design System

### Decision
**Tailwind CSS + Custom D&D Theme Variables**

### Rationale
- **Tailwind CSS**: Utility-first, excellent for responsive design, easy to customize
- **Custom Theme**: Define D&D-inspired color palette, typography, and spacing
- **Web Fonts**: Use fantasy-style fonts from Google Fonts (e.g., "Cinzel" for headers, "Lora" for body)
- **Textures**: Parchment background via CSS gradients or subtle SVG patterns

### Theme Configuration
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        parchment: { light: '#f4e4c1', DEFAULT: '#e8d5a8', dark: '#d4c194' },
        ink: { light: '#3a2a1a', DEFAULT: '#2c1f0f', dark: '#1a1308' },
        gold: { light: '#f4d03f', DEFAULT: '#d4af37', dark: '#b8941f' },
        leather: { light: '#8b4513', DEFAULT: '#6f3609', dark: '#4a2403' }
      },
      fontFamily: {
        heading: ['Cinzel', 'serif'],
        body: ['Lora', 'serif'],
        mono: ['Courier Prime', 'monospace']
      }
    }
  }
}
```

### Best Practices Applied
- **Accessibility**: Maintain WCAG AA contrast ratios (4.5:1 for text)
- **Responsive**: Mobile-first approach with breakpoints at 640px (mobile), 768px (tablet), 1024px (desktop)
- **Performance**: Purge unused Tailwind classes in production builds

### Alternatives Considered
- **CSS Modules**: More verbose, harder to maintain responsive design
- **Styled Components**: Runtime overhead, slower than Tailwind's build-time approach
- **Material-UI**: Wrong aesthetic for D&D theme, harder to customize

---

## Authentication & Security

### Decision
**bcrypt for password hashing + HTTP-only cookies for sessions**

### Rationale
- **bcrypt**: Industry standard, configurable work factor (defense against brute force)
- **HTTP-only Cookies**: Prevents XSS attacks, automatic inclusion in requests
- **Session Management**: Simple session store in SQLite (user_id + token + expiry)

### Security Implementation
```typescript
// Password hashing (bcrypt work factor: 12)
import bcrypt from 'bcryptjs';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Session token generation (crypto-random)
import crypto from 'crypto';

export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}
```

### Security Best Practices Applied
- **Password Requirements**: Min 8 characters, enforced at API level
- **Token Security**: Cryptographically random tokens (crypto.randomBytes)
- **SQL Injection**: Parameterized queries via better-sqlite3 prevent injection
- **CSRF Protection**: Next.js built-in CSRF protection for API routes

### Alternatives Considered
- **JWT**: More complex, requires signature verification, overkill for session-based auth
- **Passport.js**: Heavy middleware stack, unnecessary for simple email/password auth
- **argon2**: Newer algorithm but bcrypt is battle-tested and sufficient for MVP

---

## Real-Time Conflict Resolution

### Decision
**Last-write-wins with client notification**

### Rationale
- **Simplicity**: No complex merge logic or operational transforms required for MVP
- **User Feedback**: Both users notified when conflict occurs (toast notification)
- **Timestamp-Based**: Use `updated_at` timestamp to determine "last" write

### Implementation Strategy
```typescript
// Conflict detection in update handler
async function updateCharacter(characterId: number, updates: Partial<Character>, userId: number) {
  const current = await characterRepo.findById(characterId);

  if (updates.updated_at && updates.updated_at < current.updated_at) {
    // Conflict detected: client data is stale
    throw new ConflictError('Character was updated by another user');
  }

  // Apply update with new timestamp
  const updated = await characterRepo.update(characterId, {
    ...updates,
    updated_at: new Date()
  });

  // Broadcast to all users in campaign room
  io.to(`campaign:${current.campaignId}`).emit('character:updated', {
    characterId,
    updates,
    updatedBy: userId
  });

  return updated;
}
```

### Best Practices Applied
- **Optimistic Updates**: Client immediately shows change, rolls back if conflict
- **Notification UI**: Toast message: "Character updated by [User]" or "Conflict: your changes were overwritten"
- **Audit Trail**: All changes logged to `activity_logs` table for investigation

### Alternatives Considered
- **Field-level Locking**: Complex, requires lock management and timeout handling
- **Operational Transform**: Used by Google Docs, extreme overkill for character sheets
- **Manual Merge UI**: Interrupts user flow, poor UX for simple data like ability scores

---

## Summary of Decisions

| Topic | Decision | Rationale |
|-------|----------|-----------|
| **Testing** | Jest + React Testing Library + Supertest | Standard Next.js stack, TDD-friendly |
| **Socket.IO Integration** | Custom Next.js server with attached Socket.IO | Required for WebSocket support in Next.js 11 |
| **Database Driver** | better-sqlite3 with repository pattern | Fast, synchronous, DDD-aligned |
| **Node Version** | Node.js 24.x LTS | Stable, performant, long-term support |
| **UI Framework** | Tailwind CSS with custom D&D theme | Responsive, customizable, performant |
| **Authentication** | bcrypt + HTTP-only cookies | Secure, simple, battle-tested |
| **Conflict Resolution** | Last-write-wins with notifications | Simple, sufficient for MVP scope |

All "NEEDS CLARIFICATION" items resolved. Ready to proceed to Phase 1 (data model and contracts).
