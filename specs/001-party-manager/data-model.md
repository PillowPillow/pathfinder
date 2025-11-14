# Data Model: Pathfinder Party Manager

**Feature**: 001-party-manager | **Date**: 2025-11-14

This document defines all entities, their relationships, validation rules, and state transitions following Domain-Driven Design principles.

## Entity Definitions

### User

**Purpose**: Represents a person with an account who can participate as GM or player across multiple campaigns.

**Domain Layer (TypeScript)**:
```typescript
// src/domain/entities/User.ts
export interface User {
  id: number;
  email: string;
  passwordHash: string;
  displayName: string;
  createdAt: Date;
}

export interface CreateUserDTO {
  email: string;
  password: string; // Plain password (will be hashed)
  displayName: string;
}
```

**Database Schema**:
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_users_email ON users(email);
```

**Validation Rules**:
- `email`: Must be valid email format (RFC 5322), max 255 chars, unique across system
- `password`: Min 8 characters, must contain at least one letter and one number (enforced pre-hash)
- `displayName`: Min 2 chars, max 50 chars, no special characters except spaces/hyphens
- `passwordHash`: bcrypt hash with work factor 12

**Business Rules**:
- Email is case-insensitive (normalize to lowercase before storage)
- Display name is editable post-registration
- Password changes require current password verification
- Users cannot be deleted if they are GM of active campaigns (must transfer ownership first)

---

### Campaign

**Purpose**: Represents a game session/story arc managed by one Game Master, containing multiple players and their characters.

**Domain Layer (TypeScript)**:
```typescript
// src/domain/entities/Campaign.ts
export interface Campaign {
  id: number;
  name: string;
  description: string | null;
  gmUserId: number;
  createdAt: Date;
}

export interface CreateCampaignDTO {
  name: string;
  description?: string;
  gmUserId: number;
}
```

**Database Schema**:
```sql
CREATE TABLE campaigns (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  gm_user_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (gm_user_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX idx_campaigns_gm ON campaigns(gm_user_id);
```

**Validation Rules**:
- `name`: Min 3 chars, max 100 chars, required
- `description`: Optional, max 500 chars
- `gmUserId`: Must reference existing User

**Business Rules**:
- Campaign creator is automatically assigned as GM
- GM cannot be changed after creation (future feature: transfer GM role)
- Campaign cannot be deleted if it has active (living) characters (must retire all characters first)
- Campaign name must be unique per GM (same GM cannot have two campaigns with identical names)

---

### Invitation

**Purpose**: Secure token-based URL allowing players to join a campaign. Remains valid until explicitly revoked by GM.

**Domain Layer (TypeScript)**:
```typescript
// src/domain/entities/Invitation.ts
export interface Invitation {
  id: number;
  campaignId: number;
  token: string; // UUID v4 or crypto-random hex
  createdAt: Date;
  revoked: boolean;
}

export interface GenerateInvitationDTO {
  campaignId: number;
}
```

**Database Schema**:
```sql
CREATE TABLE invitations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  campaign_id INTEGER NOT NULL,
  token TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  revoked BOOLEAN DEFAULT 0,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX idx_invitations_token ON invitations(token);
CREATE INDEX idx_invitations_campaign ON invitations(campaign_id);
```

**Validation Rules**:
- `token`: Cryptographically random, 64 characters (32 bytes hex-encoded), unique across system
- `campaignId`: Must reference existing Campaign
- `revoked`: Boolean, defaults to false

**Business Rules**:
- Only GM of the campaign can generate/revoke invitations
- Token is single-use per player (once used to join, same player cannot re-use)
- Revoked invitations return "Invalid or expired invitation" error
- Invitation URL format: `https://app.example.com/campaigns/invite/{token}`

**State Transitions**:
```
[Created (revoked=false)] → [Revoked (revoked=true)]
```
(One-way transition, no un-revoking)

---

### Player

**Purpose**: Represents a User's participation in a specific Campaign. Join table linking User ↔ Campaign with metadata.

**Domain Layer (TypeScript)**:
```typescript
// src/domain/entities/Player.ts
export interface Player {
  id: number;
  userId: number;
  campaignId: number;
  joinedAt: Date;
}

export interface JoinCampaignDTO {
  userId: number;
  campaignId: number;
  invitationToken: string;
}
```

**Database Schema**:
```sql
CREATE TABLE players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  campaign_id INTEGER NOT NULL,
  joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, campaign_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX idx_players_user_campaign ON players(user_id, campaign_id);
CREATE INDEX idx_players_campaign ON players(campaign_id);
```

**Validation Rules**:
- `userId` + `campaignId`: Unique composite (user can only join campaign once)
- Both must reference existing records

**Business Rules**:
- User joins campaign by using valid (non-revoked) invitation token
- User can be player in multiple campaigns simultaneously
- User can be GM of one campaign and player in another campaign
- Player cannot be removed if they have a living character (must retire character first)
- GM of a campaign is not a "player" in that campaign (separate role)

---

### Character

**Purpose**: Represents a Pathfinder character sheet with ability scores, stats, and metadata. Belongs to one Player in one Campaign.

**Domain Layer (TypeScript)**:
```typescript
// src/domain/entities/Character.ts
export interface Character {
  id: number;
  playerId: number;
  name: string;
  level: number;
  race: string | null;
  class: string | null;
  // Ability Scores (Force, Dextérité, Constitution, Intelligence, Sagesse, Charisme)
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  // Derived Stats
  hitPoints: number | null;
  armorClass: number | null;
  // Status
  isAlive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCharacterDTO {
  playerId: number;
  name: string;
  level?: number;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface UpdateCharacterDTO {
  name?: string;
  level?: number;
  race?: string;
  class?: string;
  strength?: number;
  dexterity?: number;
  constitution?: number;
  intelligence?: number;
  wisdom?: number;
  charisma?: number;
  hitPoints?: number;
  armorClass?: number;
}
```

**Database Schema**:
```sql
CREATE TABLE characters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  level INTEGER DEFAULT 1,
  race TEXT,
  class TEXT,
  -- Ability scores (Force/STR, Dextérité/DEX, Constitution/CON, Intelligence/INT, Sagesse/WIS, Charisme/CHA)
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
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
);

CREATE INDEX idx_characters_player ON characters(player_id);
CREATE INDEX idx_characters_alive ON characters(is_alive);
```

**Validation Rules**:
- `name`: Min 2 chars, max 50 chars, required
- `level`: Integer 1-20 (Pathfinder standard level range)
- `race`, `class`: Optional strings, max 50 chars each
- **Ability Scores** (strength, dexterity, constitution, intelligence, wisdom, charisma):
  - Integer range: 1-30 (Pathfinder standard, 1=disabled, 30=godlike)
  - Required on character creation (all six must be provided)
- `hitPoints`: Positive integer or null
- `armorClass`: Integer 1-50 or null

**Business Rules**:
- **One-Living-Character Rule**: Player can have max 1 character with `isAlive=true` per campaign
  - Enforced at application layer before INSERT
  - Checked by counting existing living characters for (playerId, campaignId)
- **Ability Modifier Calculation** (auto-calculated, not stored):
  - Formula: `modifier = Math.floor((score - 10) / 2)`
  - Examples: Score 14 → +2, Score 10 → +0, Score 8 → -1
  - Calculated on-demand in domain service (`AbilityCalculator`)
- **Character Death/Retirement**:
  - GM can set `isAlive=false` to mark character as deceased/retired
  - This allows player to create a new character (one-living-character rule no longer blocks)
- **Updated Timestamp**: `updatedAt` must be updated on every field modification (used for conflict detection)

**State Transitions**:
```
[Created (isAlive=true)] → [Deceased/Retired (isAlive=false)]
```
(One-way transition for MVP, no resurrection feature)

---

### AbilityScore (Value Object)

**Purpose**: Represents a single Pathfinder ability score with its calculated modifier. Not a database entity, but a domain value object.

**Domain Layer (TypeScript)**:
```typescript
// src/domain/entities/AbilityScore.ts
export interface AbilityScore {
  name: 'Force' | 'Dextérité' | 'Constitution' | 'Intelligence' | 'Sagesse' | 'Charisme';
  score: number; // 1-30
  modifier: number; // Calculated: Math.floor((score - 10) / 2)
}

export type AbilityName = 'strength' | 'dexterity' | 'constitution' | 'intelligence' | 'wisdom' | 'charisma';
```

**Validation Rules**:
- `score`: Integer 1-30 (enforced by CharacterValidator)
- `modifier`: Auto-calculated, read-only

**Business Rules**:
- Modifier is never stored in database (always calculated on-read)
- Calculation service (`AbilityCalculator.calculateModifier(score)`) is pure function
- UI displays both score and modifier: "Force: 14 (+2)"

---

### ActivityLog (Audit Trail)

**Purpose**: Records all changes to Character fields for audit trail, notifications, and conflict investigation.

**Domain Layer (TypeScript)**:
```typescript
// src/domain/entities/ActivityLog.ts
export interface ActivityLog {
  id: number;
  characterId: number;
  userId: number;
  fieldName: string; // e.g., "strength", "hitPoints", "name"
  oldValue: string | null;
  newValue: string | null;
  changedAt: Date;
}

export interface LogActivityDTO {
  characterId: number;
  userId: number;
  fieldName: string;
  oldValue: string | null;
  newValue: string | null;
}
```

**Database Schema**:
```sql
CREATE TABLE activity_logs (
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

CREATE INDEX idx_activity_logs_character ON activity_logs(character_id);
CREATE INDEX idx_activity_logs_timestamp ON activity_logs(changed_at);
```

**Validation Rules**:
- `fieldName`: Must match valid Character field name
- `oldValue`, `newValue`: Serialized as strings (numbers/booleans converted to string)

**Business Rules**:
- Activity logged on every Character UPDATE operation (before and after values)
- Used for generating notifications: "GM updated your character: Strength 14 → 16"
- Used for conflict investigation: "Who changed this field last?"
- Logs are append-only (never updated or deleted)

---

## Entity Relationships

```
User (1) ──────── GM of ───────── (*) Campaign
  │                                     │
  │                                     │
  └─── (*) Player (M:N join) ────────── ┘
            │
            │
            └─── (1:*) ──────────── Character
                                        │
                                        │
                                        └─── (1:*) ──────── ActivityLog

Campaign (1) ──────── (*) Invitation

User (1) ──────── (*) ActivityLog (who made the change)
```

**Key Relationships**:
- **User → Campaign (GM)**: 1:many (one user can GM multiple campaigns)
- **User ↔ Campaign (Player)**: Many:many via `players` join table
- **Player → Character**: 1:many (but constrained by one-living-character rule)
- **Campaign → Invitation**: 1:many (one campaign can have multiple invitations)
- **Character → ActivityLog**: 1:many (all changes to character logged)
- **User → ActivityLog**: 1:many (all changes made by user logged)

---

## Aggregate Roots (DDD)

### Campaign Aggregate
**Root**: Campaign
**Contains**: Invitations, Players (references)
**Invariants**:
- Only GM can add/revoke invitations
- Players join via valid invitations
- Campaign cannot be deleted with active characters

### Character Aggregate
**Root**: Character
**Contains**: AbilityScores (value objects), ActivityLogs (audit)
**Invariants**:
- One living character per player per campaign
- Ability scores always have valid modifiers
- All updates logged to ActivityLog

---

## Domain Services

### AbilityCalculator
**Purpose**: Calculate ability modifiers from scores (pure function, no state)

```typescript
// src/domain/services/AbilityCalculator.ts
export class AbilityCalculator {
  static calculateModifier(score: number): number {
    if (score < 1 || score > 30) {
      throw new Error('Ability score must be between 1 and 30');
    }
    return Math.floor((score - 10) / 2);
  }

  static calculateAllModifiers(character: Character): Record<AbilityName, number> {
    return {
      strength: this.calculateModifier(character.strength),
      dexterity: this.calculateModifier(character.dexterity),
      constitution: this.calculateModifier(character.constitution),
      intelligence: this.calculateModifier(character.intelligence),
      wisdom: this.calculateModifier(character.wisdom),
      charisma: this.calculateModifier(character.charisma)
    };
  }
}
```

### CharacterValidator
**Purpose**: Validate character data against business rules

```typescript
// src/domain/services/CharacterValidator.ts
export class CharacterValidator {
  static validateAbilityScore(score: number): void {
    if (!Number.isInteger(score)) {
      throw new ValidationError('Ability score must be an integer');
    }
    if (score < 1 || score > 30) {
      throw new ValidationError('Ability score must be between 1 and 30');
    }
  }

  static validateCharacterName(name: string): void {
    if (name.length < 2 || name.length > 50) {
      throw new ValidationError('Character name must be 2-50 characters');
    }
  }

  static validateLevel(level: number): void {
    if (!Number.isInteger(level) || level < 1 || level > 20) {
      throw new ValidationError('Character level must be 1-20');
    }
  }
}
```

### CampaignRules
**Purpose**: Enforce campaign-level business rules (one-living-character, GM permissions)

```typescript
// src/domain/services/CampaignRules.ts
export class CampaignRules {
  async enforceOneLivingCharacter(playerId: number, characterRepo: CharacterRepository): Promise<void> {
    const livingCharacters = await characterRepo.findLivingByPlayer(playerId);
    if (livingCharacters.length > 0) {
      throw new BusinessRuleError('Player already has a living character in this campaign');
    }
  }

  async validateGMPermission(campaignId: number, userId: number, campaignRepo: CampaignRepository): Promise<void> {
    const campaign = await campaignRepo.findById(campaignId);
    if (!campaign || campaign.gmUserId !== userId) {
      throw new PermissionError('Only the Game Master can perform this action');
    }
  }
}
```

---

## Summary

All entities defined with:
- ✅ TypeScript interfaces (domain layer)
- ✅ SQLite schema (infrastructure layer)
- ✅ Validation rules (CharacterValidator, email validation, etc.)
- ✅ Business rules (one-living-character, GM permissions, last-write-wins)
- ✅ State transitions (Character alive → deceased, Invitation valid → revoked)
- ✅ Relationships (foreign keys, indexes)
- ✅ Aggregate roots (Campaign, Character)
- ✅ Domain services (AbilityCalculator, CharacterValidator, CampaignRules)

Ready to proceed to API contract generation.
