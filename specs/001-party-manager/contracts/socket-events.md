# Socket.IO Events Contract

**Feature**: 001-party-manager | **Date**: 2025-11-14

This document defines all Socket.IO events for real-time communication between server and clients.

## Connection & Authentication

### Client → Server: `authenticate`
**Purpose**: Authenticate socket connection with session token

**Payload**:
```typescript
{
  sessionToken: string; // HTTP session cookie value
}
```

**Server Response**: `authenticated` event or `auth:error` event

**Business Rules**:
- Must be first event sent after connection
- Invalid token disconnects socket
- Socket is assigned to user-specific room after authentication

---

### Server → Client: `authenticated`
**Purpose**: Confirm successful authentication

**Payload**:
```typescript
{
  userId: number;
  displayName: string;
}
```

---

### Server → Client: `auth:error`
**Purpose**: Authentication failed

**Payload**:
```typescript
{
  error: string; // "Invalid session" | "Session expired"
}
```

**Client Action**: Redirect to login page

---

## Campaign Events

### Client → Server: `campaign:join`
**Purpose**: Join campaign room to receive real-time updates

**Payload**:
```typescript
{
  campaignId: number;
}
```

**Server Action**:
- Verify user is GM or player in campaign
- Add socket to `campaign:{campaignId}` room
- Emit `campaign:joined` confirmation

**Authorization**: User must be GM or player in campaign

---

### Server → Client: `campaign:joined`
**Purpose**: Confirm socket joined campaign room

**Payload**:
```typescript
{
  campaignId: number;
  role: 'gm' | 'player';
}
```

---

### Client → Server: `campaign:leave`
**Purpose**: Leave campaign room (stop receiving updates)

**Payload**:
```typescript
{
  campaignId: number;
}
```

**Server Action**: Remove socket from `campaign:{campaignId}` room

---

### Server → Client: `campaign:player-joined`
**Purpose**: Broadcast when new player joins campaign

**Payload**:
```typescript
{
  campaignId: number;
  player: {
    id: number;
    userId: number;
    displayName: string;
    joinedAt: string; // ISO 8601 timestamp
  };
}
```

**Broadcast**: All users in `campaign:{campaignId}` room

**Trigger**: Player successfully joins via invitation token

---

## Character Events

### Client → Server: `character:update`
**Purpose**: Update character sheet fields

**Payload**:
```typescript
{
  characterId: number;
  updates: Partial<{
    name: string;
    level: number;
    race: string;
    class: string;
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
    hitPoints: number;
    armorClass: number;
    isAlive: boolean;
  }>;
  updatedAt: string; // ISO 8601 timestamp for conflict detection
}
```

**Server Action**:
1. Verify authorization (character owner or GM)
2. Validate updates (ability scores 1-30, etc.)
3. Check for conflicts (compare `updatedAt` with DB)
4. Apply updates to database
5. Log to `activity_logs` table
6. Broadcast `character:updated` to campaign room

**Authorization**:
- Character owner can update their own character
- GM can update any character in their campaign

**Conflict Handling**:
- If `updatedAt` < DB `updatedAt`: emit `character:conflict` to sender
- Else: apply changes and broadcast to all

---

### Server → Client: `character:updated`
**Purpose**: Broadcast character changes to all users in campaign

**Payload**:
```typescript
{
  characterId: number;
  playerId: number;
  characterName: string;
  updates: Partial<{
    name: string;
    level: number;
    race: string;
    class: string;
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
    hitPoints: number;
    armorClass: number;
    isAlive: boolean;
  }>;
  modifiers: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  updatedAt: string; // New timestamp after update
  updatedBy: {
    userId: number;
    displayName: string;
    role: 'gm' | 'player';
  };
}
```

**Broadcast**: All users in `campaign:{campaignId}` room

**Trigger**: Character successfully updated via `character:update` event or REST API

**Client Action**:
- If current user is character owner → update UI with new data
- If current user is GM → update UI with new data
- If current user is different player → ignore (privacy rule)

---

### Server → Client: `character:conflict`
**Purpose**: Notify user their update failed due to conflict

**Payload**:
```typescript
{
  characterId: number;
  error: 'ConflictError';
  message: string; // "Character was updated by another user"
  latestData: CharacterResponse; // Current state from DB
}
```

**Client Action**:
- Show toast notification: "Character was updated by [User]. Your changes were not saved."
- Replace local state with `latestData` from server
- User can re-apply their changes manually

---

### Server → Client: `character:created`
**Purpose**: Broadcast when new character is created in campaign

**Payload**:
```typescript
{
  character: CharacterResponse; // Full character data
  player: {
    userId: number;
    displayName: string;
  };
}
```

**Broadcast**: All users in `campaign:{campaignId}` room

**Trigger**: Character successfully created via REST API

---

### Server → Client: `character:deleted`
**Purpose**: Broadcast when character is deleted

**Payload**:
```typescript
{
  characterId: number;
  deletedBy: {
    userId: number;
    displayName: string;
    role: 'gm' | 'player';
  };
}
```

**Broadcast**: All users in `campaign:{campaignId}` room

---

## Notification Events

### Server → Client: `notification`
**Purpose**: Generic notification for user actions (character updated by GM, etc.)

**Payload**:
```typescript
{
  id: string; // Unique notification ID (UUID)
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string; // ISO 8601
  metadata?: {
    characterId?: number;
    campaignId?: number;
    userId?: number;
  };
}
```

**Examples**:
- GM updates player's character:
  ```json
  {
    "type": "info",
    "title": "Character Updated",
    "message": "Game Master updated your character: Strength 14 → 16"
  }
  ```
- Player updates character (GM sees notification):
  ```json
  {
    "type": "info",
    "title": "Character Updated",
    "message": "Gandalf updated Valeros: Hit Points 12 → 8"
  }
  ```

**Privacy Rule**:
- Players only receive notifications about their own characters
- GM receives notifications about all characters in their campaigns

---

## Connection Management

### Server → Client: `disconnect`
**Purpose**: Socket connection lost

**Client Action**:
- Attempt automatic reconnection (Socket.IO built-in)
- Show UI indicator: "Connection lost, reconnecting..."

---

### Client → Server: `reconnect`
**Purpose**: Socket reconnected after disconnect

**Client Action**:
1. Re-authenticate (`authenticate` event)
2. Re-join campaign rooms (`campaign:join` events)
3. Request state sync (`sync:request` event)

---

### Client → Server: `sync:request`
**Purpose**: Request full state sync after reconnection

**Payload**:
```typescript
{
  campaignId: number;
}
```

**Server Action**:
- Fetch all characters in campaign
- Emit `sync:campaign-state` with full data

---

### Server → Client: `sync:campaign-state`
**Purpose**: Full state sync for campaign (post-reconnection)

**Payload**:
```typescript
{
  campaignId: number;
  characters: CharacterResponse[];
  players: PlayerResponse[];
  lastSyncAt: string; // ISO 8601 server timestamp
}
```

---

## Room Structure

### Room Naming Convention
- **User room**: `user:{userId}` (for user-specific notifications)
- **Campaign room**: `campaign:{campaignId}` (for campaign-wide broadcasts)

### Room Assignment Logic
```typescript
// On authentication
socket.join(`user:${userId}`);

// On campaign:join
socket.join(`campaign:${campaignId}`);

// On campaign:leave or disconnect
socket.leave(`campaign:${campaignId}`);
```

---

## Error Events

### Server → Client: `error`
**Purpose**: Generic error event for failed operations

**Payload**:
```typescript
{
  event: string; // Original event name that failed
  error: string; // Error type (ValidationError, PermissionError, etc.)
  message: string; // Human-readable error message
}
```

**Examples**:
- Invalid ability score:
  ```json
  {
    "event": "character:update",
    "error": "ValidationError",
    "message": "Ability score must be between 1 and 30"
  }
  ```
- Unauthorized update:
  ```json
  {
    "event": "character:update",
    "error": "PermissionError",
    "message": "You can only edit your own character"
  }
  ```

---

## Event Flow Examples

### Scenario 1: Player Updates Character (No Conflict)

```
Player Client                Server                     GM Client
     |                          |                            |
     |--- character:update ---> |                            |
     |    (strength: 14→16)      |                            |
     |                          |                            |
     |                          | [Validate & Save]          |
     |                          |                            |
     |<-- character:updated --- | --- character:updated ---> |
     |    (with modifiers)       |     (with modifiers)       |
     |                          |                            |
     |<-- notification --------- | --- notification ---------> |
     |    "Saved successfully"   |     "Gandalf updated char" |
```

### Scenario 2: Simultaneous Edit (Conflict)

```
Player Client                Server                     GM Client
     |                          |                            |
     |--- character:update ---> |                            |
     |    (strength: 14→16)      | <-- character:update ----- |
     |    updatedAt: T1          |     (hitPoints: 12→8)      |
     |                          |     updatedAt: T1          |
     |                          |                            |
     |                          | [GM update arrives first,  |
     |                          |  saves at T2]              |
     |                          |                            |
     |                          | [Player update arrives,    |
     |                          |  T1 < T2 → conflict!]      |
     |                          |                            |
     |<-- character:conflict -- |                            |
     |    (latestData with HP=8) |                            |
     |                          |                            |
     |<-- notification --------- |                            |
     |    "Update conflict"      | --- character:updated ---> |
     |                          |     (hitPoints: 12→8)      |
```

### Scenario 3: Player Reconnects After Disconnect

```
Player Client                Server
     |                          |
     | [disconnect]             |
     |                          |
     | [connection restored]    |
     |                          |
     |--- authenticate -------> |
     |                          |
     |<-- authenticated ------- |
     |                          |
     |--- campaign:join ------> |
     |    (campaignId: 1)       |
     |                          |
     |--- sync:request -------> |
     |    (campaignId: 1)       |
     |                          |
     |<-- sync:campaign-state - |
     |    (all chars + players) |
```

---

## TypeScript Type Definitions

```typescript
// src/infrastructure/socket/events.ts

export interface SocketEvents {
  // Connection
  authenticate: (data: { sessionToken: string }) => void;
  authenticated: (data: { userId: number; displayName: string }) => void;
  'auth:error': (data: { error: string }) => void;

  // Campaign
  'campaign:join': (data: { campaignId: number }) => void;
  'campaign:joined': (data: { campaignId: number; role: 'gm' | 'player' }) => void;
  'campaign:leave': (data: { campaignId: number }) => void;
  'campaign:player-joined': (data: { campaignId: number; player: any }) => void;

  // Character
  'character:update': (data: { characterId: number; updates: any; updatedAt: string }) => void;
  'character:updated': (data: { characterId: number; updates: any; modifiers: any; updatedAt: string; updatedBy: any }) => void;
  'character:conflict': (data: { characterId: number; error: string; message: string; latestData: any }) => void;
  'character:created': (data: { character: any; player: any }) => void;
  'character:deleted': (data: { characterId: number; deletedBy: any }) => void;

  // Sync
  'sync:request': (data: { campaignId: number }) => void;
  'sync:campaign-state': (data: { campaignId: number; characters: any[]; players: any[]; lastSyncAt: string }) => void;

  // Notifications
  notification: (data: { id: string; type: string; title: string; message: string; timestamp: string }) => void;

  // Errors
  error: (data: { event: string; error: string; message: string }) => void;
}
```

---

## Testing Checklist

### Contract Tests (Socket Events)
- ✅ Authentication flow: valid token → `authenticated` event
- ✅ Authentication flow: invalid token → `auth:error` event → disconnect
- ✅ Campaign room join: authorized user → `campaign:joined` event
- ✅ Campaign room join: unauthorized user → `error` event
- ✅ Character update: valid data → broadcast `character:updated` to room
- ✅ Character update: invalid ability score → `error` event
- ✅ Character update: conflict detection → `character:conflict` event
- ✅ Character update: privacy rule → GM sees all, players see own only
- ✅ Reconnection: `sync:request` → `sync:campaign-state` with full data
- ✅ Notification routing: player gets own char notifications only, GM gets all

### Integration Tests (Real-Time Workflows)
- ✅ Two clients update same character simultaneously → last-write-wins
- ✅ Player updates character → GM sees update immediately
- ✅ GM updates character → player sees update immediately
- ✅ Player disconnects and reconnects → receives all missed updates
- ✅ New player joins campaign → all users notified via `campaign:player-joined`

---

All Socket.IO events defined with type-safe contracts. Ready for implementation and testing.
