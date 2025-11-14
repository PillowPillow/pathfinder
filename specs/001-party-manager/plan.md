# Implementation Plan: Pathfinder Party Manager

**Branch**: `001-party-manager` | **Date**: 2025-11-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-party-manager/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

A real-time web application for Pathfinder RPG party management enabling Game Masters to create campaigns, invite players via secure token URLs, and collaboratively manage character sheets. The system enforces one-living-character-per-campaign rule, provides real-time updates via Socket.IO, maintains player privacy (players cannot view other players' sheets), and gives GMs full oversight. Built with Next.js 16, TypeScript, Socket.IO for real-time communication, and SQLite for local data persistence.

## Technical Context

**Language/Version**: TypeScript with Node.js (latest LTS: 20.x)
**Primary Dependencies**: Next.js 16, React 18.x, Socket.IO 4.x, better-sqlite3 (SQLite driver)
**Storage**: SQLite database (local file-based, simple single-file DB)
**Testing**: NEEDS CLARIFICATION (Jest + React Testing Library standard for Next.js)
**Target Platform**: Web (responsive: mobile/tablet/desktop), Node.js server runtime
**Project Type**: Web application (full-stack with Next.js API routes + frontend)
**Performance Goals**: <2s real-time update latency, <1s save operations, <3min character creation workflow
**Constraints**: <500ms data operations, 60 concurrent campaigns (6 players each), responsive 320px-1920px
**Scale/Scope**: ~10 user scenarios, ~30 functional requirements, 6 core entities, MVP scope

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Test-First Development (TDD MANDATORY)
**Status**: ✅ PASS with clarification needed
- Testing framework not yet specified (NEEDS CLARIFICATION in research phase)
- Will use standard Next.js testing stack: Jest + React Testing Library
- Test-first approach will be enforced: contract tests → integration tests → unit tests
- **Action**: Research phase will define testing strategy and setup

### II. SOLID Principles (NON-NEGOTIABLE)
**Status**: ✅ PASS
- Architecture will follow SOLID from the start
- Domain layer (Character, Campaign, User entities) with no infrastructure dependencies
- Application layer for use cases (character creation, campaign management)
- Infrastructure layer for persistence (SQLite), Socket.IO, Next.js framework
- Clear separation via DDD approach (see Principle IV)

### III. DRY & Code Reuse
**Status**: ✅ PASS
- Shared validation logic will be centralized (ability score validation, modifier calculations)
- Socket.IO event handlers will use shared patterns
- React components will use composition for character sheet fields
- No anticipated duplication issues

### IV. Domain-Driven Design (DDD)
**Status**: ✅ PASS - Excellent alignment
- Clear bounded contexts: Campaign Management, Character Management, User Management
- Domain entities map directly to Pathfinder concepts (ubiquitous language)
- Character is aggregate root for AbilityScores, Skills, Equipment
- Campaign is aggregate root for Players and Invitations
- No infrastructure leakage into domain layer

### V. Code Quality Gates
**Status**: ✅ PASS with setup required
- ESLint + Prettier for TypeScript (standard Next.js setup)
- TypeScript strict mode enabled
- Coverage targets: 80% domain logic, 60% overall
- **Action**: Research phase will specify linting rules and CI setup

### VI. User Experience Consistency
**Status**: ✅ PASS
- Responsive design required (320px-1920px)
- D&D-inspired design system (FR-032: parchment, fantasy fonts, thematic colors)
- Accessibility: keyboard navigation, clear error messages
- Real-time feedback via Socket.IO (loading states, notifications)
- Pathfinder terminology used consistently

### VII. Performance Requirements
**Status**: ✅ PASS - Well-specified
- UI interactions: <100ms (target met with optimistic updates + Socket.IO)
- Data operations: <500ms (SQLite is fast for local operations)
- Calculations: <50ms (ability modifiers are trivial math operations)
- Startup: <2s (Next.js with minimal initial bundle)
- Real-time updates: <2s (Socket.IO broadcast latency)

**Constitution Compliance Summary**: ✅ **APPROVED** - All gates pass. NEEDS CLARIFICATION items will be resolved in Phase 0 research.

---

## Re-Evaluation After Phase 1 Design

*Re-checking Constitution compliance after completing data model, contracts, and architecture design.*

### I. Test-First Development (TDD MANDATORY)
**Status**: ✅ PASS - Fully specified
- Testing framework resolved: Jest 27.x + React Testing Library 12.x + Supertest
- Test structure defined in quickstart.md with coverage thresholds
- Contract tests specified for API routes and Socket.IO events
- Integration tests planned for user workflows
- Unit tests planned for domain logic (AbilityCalculator, CharacterValidator, CampaignRules)
- **No violations**

### II. SOLID Principles (NON-NEGOTIABLE)
**Status**: ✅ PASS - Architecture validates compliance
- **Single Responsibility**: Each entity/service has one clear purpose
  - AbilityCalculator: only calculates modifiers
  - CharacterValidator: only validates character data
  - CampaignRules: only enforces campaign business rules
- **Open/Closed**: Domain services are pure functions, easily extensible
- **Liskov Substitution**: Repository pattern allows substitution of data sources
- **Interface Segregation**: Separate DTOs for Create vs Update operations
- **Dependency Inversion**: Domain layer has zero infrastructure dependencies
- **No violations**

### III. DRY & Code Reuse
**Status**: ✅ PASS - Design eliminates duplication
- Ability modifier calculation centralized in AbilityCalculator service (used by both API and Socket.IO)
- Character validation centralized in CharacterValidator (used across create/update paths)
- Socket.IO event types defined once, shared between server and client
- Repository pattern eliminates SQL duplication
- **No violations**

### IV. Domain-Driven Design (DDD)
**Status**: ✅ PASS - Excellent DDD implementation
- Bounded contexts clearly defined: User Management, Campaign Management, Character Management
- Aggregate roots identified: Campaign (contains Invitations), Character (contains AbilityScores)
- Domain services implement business rules without infrastructure concerns
- Ubiquitous language: Pathfinder terminology used throughout (Ability Score, Modifier, Campaign, GM)
- Repository pattern isolates persistence from domain logic
- **No violations**

### V. Code Quality Gates
**Status**: ✅ PASS - All gates configured
- ESLint configured with strict rules (`@typescript-eslint/no-unused-vars: error`)
- Prettier configured for consistent formatting
- TypeScript strict mode enabled (`strict: true, strictNullChecks: true`)
- Jest coverage thresholds: 80% domain, 60% overall
- **No violations**

### VI. User Experience Consistency
**Status**: ✅ PASS - UX requirements met
- Tailwind CSS design system with D&D theme (parchment, gold, leather colors)
- Fantasy fonts configured (Cinzel for headings, Lora for body)
- Responsive design: 320px-1920px breakpoints
- Real-time feedback via Socket.IO notifications
- Clear error messages defined in API contracts (ValidationError, PermissionError, ConflictError)
- **No violations**

### VII. Performance Requirements
**Status**: ✅ PASS - Performance targets achievable
- UI interactions: <100ms via optimistic updates + Socket.IO immediate broadcast
- Data operations: <500ms (SQLite local file access is fast, better-sqlite3 is synchronous)
- Calculations: <50ms (ability modifiers are O(1) math operations)
- Startup: <2s (Next.js SSR + minimal JavaScript bundle)
- Real-time updates: <2s (Socket.IO WebSocket latency + broadcast to rooms)
- **No violations**

**Final Constitution Compliance**: ✅ **FULLY COMPLIANT** - All principles validated against final design. No complexity tracking required.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Next.js 11 full-stack web application structure
pages/
├── api/                      # Next.js API routes (backend endpoints)
│   ├── auth/                 # Authentication endpoints
│   │   ├── login.ts
│   │   ├── register.ts
│   │   └── session.ts
│   ├── campaigns/            # Campaign management endpoints
│   │   ├── [id].ts           # GET/PUT/DELETE campaign by ID
│   │   ├── create.ts         # POST create campaign
│   │   └── invite.ts         # POST generate invitation token
│   ├── characters/           # Character management endpoints
│   │   ├── [id].ts           # GET/PUT/DELETE character by ID
│   │   └── create.ts         # POST create character
│   └── socket.ts             # Socket.IO initialization endpoint
├── campaigns/                # Campaign pages
│   ├── [id].tsx              # Campaign dashboard (GM/player view)
│   └── invite/[token].tsx    # Invitation landing page
├── characters/               # Character pages
│   ├── [id].tsx              # Character sheet view/edit
│   └── create.tsx            # Character creation form
├── login.tsx                 # Login page
├── register.tsx              # Registration page
└── index.tsx                 # Home/landing page

src/
├── domain/                   # Domain layer (pure business logic)
│   ├── entities/
│   │   ├── User.ts
│   │   ├── Campaign.ts
│   │   ├── Character.ts
│   │   ├── AbilityScore.ts
│   │   └── Invitation.ts
│   ├── services/             # Domain services (business rules)
│   │   ├── AbilityCalculator.ts  # Modifier calculations
│   │   ├── CharacterValidator.ts
│   │   └── CampaignRules.ts      # One-living-character enforcement
│   └── types/                # Domain type definitions
│       └── index.ts
├── application/              # Application layer (use cases/workflows)
│   ├── useCases/
│   │   ├── CreateCampaign.ts
│   │   ├── GenerateInvitation.ts
│   │   ├── JoinCampaign.ts
│   │   ├── CreateCharacter.ts
│   │   ├── UpdateCharacter.ts
│   │   └── GetPartyView.ts
│   └── dto/                  # Data transfer objects
│       └── index.ts
├── infrastructure/           # Infrastructure layer (external concerns)
│   ├── database/
│   │   ├── sqlite.ts         # SQLite connection setup
│   │   ├── migrations/       # Database schema migrations
│   │   └── repositories/     # Data access layer
│   │       ├── UserRepository.ts
│   │       ├── CampaignRepository.ts
│   │       └── CharacterRepository.ts
│   ├── socket/
│   │   ├── server.ts         # Socket.IO server initialization
│   │   ├── events.ts         # Event type definitions
│   │   └── handlers/         # Socket event handlers
│   │       ├── characterUpdate.ts
│   │       └── campaignUpdate.ts
│   └── auth/
│       ├── hash.ts           # Password hashing (bcrypt)
│       └── session.ts        # Session management
└── components/               # React UI components
    ├── layout/
    │   ├── Header.tsx
    │   └── Layout.tsx
    ├── campaign/
    │   ├── CampaignCard.tsx
    │   ├── PartyList.tsx
    │   └── InviteLink.tsx
    ├── character/
    │   ├── CharacterSheet.tsx
    │   ├── AbilityScoreField.tsx
    │   └── CharacterSummary.tsx
    └── common/
        ├── Button.tsx
        ├── Input.tsx
        └── Notification.tsx

tests/
├── contract/                 # Contract tests (API boundaries)
│   ├── api/
│   │   ├── campaigns.test.ts
│   │   └── characters.test.ts
│   └── socket/
│       └── events.test.ts
├── integration/              # Integration tests (workflows)
│   ├── campaignCreation.test.ts
│   ├── characterManagement.test.ts
│   └── realTimeSync.test.ts
└── unit/                     # Unit tests (domain logic)
    ├── domain/
    │   ├── AbilityCalculator.test.ts
    │   ├── CharacterValidator.test.ts
    │   └── CampaignRules.test.ts
    └── components/
        └── AbilityScoreField.test.tsx

public/
├── styles/                   # Global styles and D&D theme assets
│   └── dnd-theme.css
└── fonts/                    # Fantasy fonts for D&D aesthetic

database/
└── pathfinder.db            # SQLite database file (gitignored)
```

**Structure Decision**: Using Next.js 11 full-stack structure with clear DDD layering. Pages directory handles routing and API routes (Next.js convention). Domain/Application/Infrastructure separation in `src/` follows constitution's DDD requirements. Tests organized by pyramid structure (contract/integration/unit). Socket.IO integrated as infrastructure concern. SQLite database stored locally.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
