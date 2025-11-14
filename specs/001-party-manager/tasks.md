# Tasks: Pathfinder Party Manager

**Input**: Design documents from `/specs/001-party-manager/`
**Prerequisites**: plan.md, spec.md, data-model.md, research.md, quickstart.md, contracts/socket-events.md

**Tests**: This feature specifies TDD approach (Constitution Principle I). ALL test tasks are MANDATORY and must be written FIRST before implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Single Next.js project: `src/`, `pages/`, `tests/` at repository root
- Domain layer: `src/domain/`
- Infrastructure: `src/infrastructure/`
- Components: `src/components/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure per quickstart.md

- [X] T001 Initialize Next.js 16 project with TypeScript at repository root
- [X] T002 [P] Install core dependencies (socket.io@4.7.4, better-sqlite3@11.7.0, bcryptjs@2.4.3, uuid@9.0.1)
- [X] T003 [P] Install development dependencies (jest@29.0.0, @testing-library/react@14.0.0, supertest@6.3.3, tailwindcss@3.4.1)
- [X] T004 [P] Configure TypeScript strict mode in tsconfig.json per quickstart.md
- [X] T005 [P] Configure Tailwind CSS with D&D theme (parchment, ink, gold, leather colors) in tailwind.config.js
- [X] T006 [P] Configure Jest with coverage thresholds in jest.config.js
- [X] T007 [P] Configure ESLint and Prettier in .eslintrc.json and .prettierrc
- [X] T008 [P] Create directory structure (src/domain, src/application, src/infrastructure, src/components, pages, tests)
- [X] T009 Update package.json scripts (dev, test, test:ci, lint, format)
- [X] T010 [P] Add database/ to .gitignore for SQLite files

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T011 Create SQLite connection setup in src/infrastructure/database/sqlite.ts
- [X] T012 Create initial schema migration in src/infrastructure/database/migrations/001_initial_schema.sql (include Character.status enum: living/deceased/retired)
- [X] T013 [P] Create User entity in src/domain/entities/User.ts
- [X] T014 [P] Create Campaign entity in src/domain/entities/Campaign.ts
- [X] T015 [P] Create Invitation entity in src/domain/entities/Invitation.ts
- [X] T016 [P] Create Player entity in src/domain/entities/Player.ts
- [X] T017 [P] Create Character entity in src/domain/entities/Character.ts
- [X] T018 [P] Create AbilityScore value object in src/domain/entities/AbilityScore.ts
- [X] T019 [P] Create ActivityLog entity in src/domain/entities/ActivityLog.ts
- [X] T020 [P] Create AbilityCalculator domain service in src/domain/services/AbilityCalculator.ts
- [X] T021 [P] Create CharacterValidator domain service in src/domain/services/CharacterValidator.ts
- [X] T022 [P] Create CampaignRules domain service in src/domain/services/CampaignRules.ts
- [X] T023 [P] Create UserRepository in src/infrastructure/database/repositories/UserRepository.ts
- [X] T024 [P] Create CampaignRepository in src/infrastructure/database/repositories/CampaignRepository.ts
- [X] T025 [P] Create InvitationRepository in src/infrastructure/database/repositories/InvitationRepository.ts
- [X] T026 [P] Create PlayerRepository in src/infrastructure/database/repositories/PlayerRepository.ts
- [X] T027 [P] Create CharacterRepository in src/infrastructure/database/repositories/CharacterRepository.ts
- [X] T028 [P] Create ActivityLogRepository in src/infrastructure/database/repositories/ActivityLogRepository.ts
- [X] T029 [P] Create password hashing utilities in src/infrastructure/auth/hash.ts (bcrypt)
- [X] T030 [P] Create session management utilities in src/infrastructure/auth/session.ts
- [X] T031 Create custom Next.js server with Socket.IO in server.ts
- [X] T032 Create Socket.IO event type definitions in src/infrastructure/socket/events.ts
- [X] T033 Create Socket.IO server setup in src/infrastructure/socket/server.ts
- [X] T034 [P] Create base Layout component in src/components/layout/Layout.tsx
- [X] T035 [P] Create Header component with navigation links (Campaigns, Characters, Profile/Logout) in src/components/layout/Header.tsx
- [X] T035a [P] Create Breadcrumb component in src/components/layout/Breadcrumb.tsx
- [X] T036 [P] Create common Button component in src/components/common/Button.tsx
- [X] T037 [P] Create common Input component in src/components/common/Input.tsx
- [X] T038 [P] Create common Notification component in src/components/common/Notification.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - GM Campaign Creation & Player Invitation (Priority: P1) 🎯 MVP

**Goal**: Enable GMs to create campaigns and invite players via secure token URLs. Foundation for all other functionality.

**Independent Test**: Create campaign as GM, generate invite link, verify link leads to join page.

### Tests for User Story 1 (TDD MANDATORY)

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T039 [P] [US1] Unit test for password hashing in tests/unit/infrastructure/auth/hash.test.ts
- [X] T040 [P] [US1] Unit test for session token generation in tests/unit/infrastructure/auth/session.test.ts
- [X] T041 [P] [US1] Unit test for CampaignRules.validateGMPermission in tests/unit/domain/CampaignRules.test.ts
- [X] T042 [P] [US1] Contract test for POST /api/auth/register in tests/contract/api/auth.test.ts
- [X] T043 [P] [US1] Contract test for POST /api/auth/login in tests/contract/api/auth.test.ts
- [X] T044 [P] [US1] Contract test for GET /api/auth/session in tests/contract/api/auth.test.ts
- [X] T045 [P] [US1] Contract test for POST /api/campaigns/create in tests/contract/api/campaigns.test.ts
- [X] T046 [P] [US1] Contract test for POST /api/campaigns/invite in tests/contract/api/campaigns.test.ts
- [X] T047 [P] [US1] Contract test for GET /api/campaigns/[id] in tests/contract/api/campaigns.test.ts
- [X] T047a [P] [US1] Contract test for DELETE /api/campaigns/invite/:token (revoke invitation) in tests/contract/api/campaigns.test.ts
- [X] T048 [P] [US1] Integration test for campaign creation workflow in tests/integration/campaignCreation.test.ts
- [X] T049 [P] [US1] Integration test for player invitation workflow in tests/integration/playerInvitation.test.ts
- [X] T049a [P] [US1] Integration test for invitation revocation workflow in tests/integration/invitationRevocation.test.ts

### Implementation for User Story 1

- [X] T050 [US1] Create CreateCampaign use case in src/application/useCases/CreateCampaign.ts
- [X] T051 [US1] Create GenerateInvitation use case in src/application/useCases/GenerateInvitation.ts
- [X] T052 [US1] Create JoinCampaign use case in src/application/useCases/JoinCampaign.ts
- [X] T052a [US1] Create RevokeInvitation use case in src/application/useCases/RevokeInvitation.ts
- [X] T053 [P] [US1] Create DTO types in src/application/dto/index.ts
- [X] T054 [P] [US1] Implement POST /api/auth/register with email validation and password length validation (min 8 chars) in pages/api/auth/register.ts
- [X] T055 [P] [US1] Implement POST /api/auth/login in pages/api/auth/login.ts
- [X] T056 [P] [US1] Implement GET /api/auth/session in pages/api/auth/session.ts
- [X] T057 [P] [US1] Implement POST /api/campaigns/create in pages/api/campaigns/create.ts
- [X] T058 [P] [US1] Implement POST /api/campaigns/invite in pages/api/campaigns/invite.ts
- [X] T058a [P] [US1] Implement DELETE /api/campaigns/invite/[token] (revoke invitation) in pages/api/campaigns/invite/[token].ts
- [X] T059 [P] [US1] Implement GET /api/campaigns/[id] in pages/api/campaigns/[id].ts
- [X] T060 [P] [US1] Create registration page in pages/register.tsx
- [X] T061 [P] [US1] Create login page in pages/login.tsx
- [X] T062 [P] [US1] Create home/landing page in pages/index.tsx
- [X] T063 [P] [US1] Create campaign dashboard page in pages/campaigns/[id].tsx
- [X] T064 [P] [US1] Create invitation landing page in pages/campaigns/invite/[token].tsx
- [X] T065 [P] [US1] Create CampaignCard component in src/components/campaign/CampaignCard.tsx
- [X] T066 [P] [US1] Create InviteLink component in src/components/campaign/InviteLink.tsx
- [X] T066a [P] [US1] Add invitation revocation control to InviteLink component (revoke button for GM)
- [X] T067 [US1] Add validation and error handling for campaign operations
- [X] T068 [US1] Add logging for campaign and authentication operations

**Checkpoint**: At this point, User Story 1 should be fully functional - GMs can create campaigns, generate invites, players can join

---

## Phase 4: User Story 2 - Player Character Creation & Management (Priority: P2)

**Goal**: Enable players to create and manage Pathfinder character sheets with automatic ability modifier calculations.

**Independent Test**: Player joins campaign, creates complete character sheet with 6 ability scores, verify modifiers calculated correctly.

### Tests for User Story 2 (TDD MANDATORY)

- [ ] T069 [P] [US2] Unit test for AbilityCalculator.calculateModifier in tests/unit/domain/AbilityCalculator.test.ts
- [ ] T070 [P] [US2] Unit test for CharacterValidator.validateAbilityScore in tests/unit/domain/CharacterValidator.test.ts
- [ ] T071 [P] [US2] Unit test for CharacterValidator.validateCharacterName in tests/unit/domain/CharacterValidator.test.ts
- [ ] T072 [P] [US2] Unit test for CampaignRules.enforceOneLivingCharacter in tests/unit/domain/CampaignRules.test.ts
- [ ] T072a [P] [US2] Unit test for character status transitions (living/deceased/retired) in tests/unit/domain/Character.test.ts
- [ ] T073 [P] [US2] Contract test for POST /api/characters/create in tests/contract/api/characters.test.ts
- [ ] T074 [P] [US2] Contract test for GET /api/characters/[id] in tests/contract/api/characters.test.ts
- [ ] T075 [P] [US2] Contract test for PUT /api/characters/[id] in tests/contract/api/characters.test.ts
- [ ] T076 [P] [US2] Integration test for character creation workflow in tests/integration/characterCreation.test.ts
- [ ] T077 [P] [US2] Integration test for one-living-character enforcement in tests/integration/characterRules.test.ts
- [ ] T077a [P] [US2] Integration test for character death/retirement workflow in tests/integration/characterStatus.test.ts

### Implementation for User Story 2

- [ ] T078 [US2] Create CreateCharacter use case in src/application/useCases/CreateCharacter.ts
- [ ] T079 [US2] Create UpdateCharacter use case in src/application/useCases/UpdateCharacter.ts
- [ ] T079a [US2] Create ChangeCharacterStatus use case in src/application/useCases/ChangeCharacterStatus.ts
- [ ] T080 [P] [US2] Implement POST /api/characters/create in pages/api/characters/create.ts
- [ ] T081 [P] [US2] Implement GET /api/characters/[id] in pages/api/characters/[id].ts (read character)
- [ ] T082 [P] [US2] Implement PUT /api/characters/[id] in pages/api/characters/[id].ts (update character)
- [ ] T082a [P] [US2] Implement PATCH /api/characters/[id]/status (GM only - change character status) in pages/api/characters/[id]/status.ts
- [ ] T083 [P] [US2] Create character creation page in pages/characters/create.tsx
- [ ] T084 [P] [US2] Create character sheet view/edit page in pages/characters/[id].tsx
- [ ] T085 [P] [US2] Create CharacterSheet component in src/components/character/CharacterSheet.tsx
- [ ] T086 [P] [US2] Create AbilityScoreField component with French labels (Force, Dextérité, Constitution, Intelligence, Sagesse, Charisme) in src/components/character/AbilityScoreField.tsx
- [ ] T087 [P] [US2] Create CharacterSummary component in src/components/character/CharacterSummary.tsx
- [ ] T087a [P] [US2] Create CharacterStatusControl component (GM only - dropdown to change status) in src/components/character/CharacterStatusControl.tsx
- [ ] T088 [US2] Add client-side validation for ability scores (1-30 range)
- [ ] T089 [US2] Add one-living-character rule enforcement in character creation (check for living characters only)
- [ ] T090 [US2] Display ability modifiers with scores (e.g., "14 (+2)")

**Checkpoint**: At this point, User Story 2 should work - players can create and edit characters with automatic modifier calculations

---

## Phase 5: User Story 3 - GM Character Oversight & Management (Priority: P3)

**Goal**: Enable GMs to view and edit all player characters in their campaigns.

**Independent Test**: GM views party list, selects player character, makes edit, verify player sees update.

### Tests for User Story 3 (TDD MANDATORY)

- [ ] T091 [P] [US3] Contract test for GET /api/campaigns/[id]/party in tests/contract/api/campaigns.test.ts
- [ ] T091a [P] [US3] Contract test for GET /api/characters/[id]/activity (audit trail) in tests/contract/api/characters.test.ts
- [ ] T092 [P] [US3] Integration test for GM oversight workflow in tests/integration/gmOversight.test.ts
- [ ] T093 [P] [US3] Integration test for GM character editing in tests/integration/gmCharacterEdit.test.ts
- [ ] T093a [P] [US3] Integration test for activity logging in tests/integration/activityLog.test.ts

### Implementation for User Story 3

- [ ] T094 [US3] Create GetPartyView use case in src/application/useCases/GetPartyView.ts
- [ ] T095 [US3] Implement GET /api/campaigns/[id]/party in pages/api/campaigns/[id]/party.ts
- [ ] T096 [P] [US3] Create PartyList component in src/components/campaign/PartyList.tsx
- [ ] T097 [US3] Add GM/player role detection in campaign dashboard (pages/campaigns/[id].tsx)
- [ ] T098 [US3] Add GM-specific UI for party list view in campaign dashboard
- [ ] T099 [US3] Implement GM permission checks in character edit API routes
- [ ] T100 [US3] Add GM override capability in character sheet component
- [ ] T101 [US3] Add activity logging for all character edits (player and GM) to ActivityLog table
- [ ] T101a [P] [US3] Implement GET /api/characters/[id]/activity (audit trail) in pages/api/characters/[id]/activity.ts
- [ ] T101b [P] [US3] Create ActivityLogViewer component for GM audit trail in src/components/character/ActivityLogViewer.tsx
- [ ] T101c [US3] Integrate ActivityLogViewer into character sheet page (GM view only)

**Checkpoint**: At this point, User Story 3 should work - GMs can view all characters and make edits

---

## Phase 6: User Story 4 - Real-Time Updates & Collaboration (Priority: P4)

**Goal**: Enable real-time synchronization of character sheet changes via Socket.IO.

**Independent Test**: GM and player both view same character, player edits ability score, GM sees update immediately without reload.

### Tests for User Story 4 (TDD MANDATORY)

- [ ] T102 [P] [US4] Contract test for socket authentication flow in tests/contract/socket/auth.test.ts
- [ ] T103 [P] [US4] Contract test for character:update event in tests/contract/socket/characterEvents.test.ts
- [ ] T104 [P] [US4] Contract test for character:updated broadcast in tests/contract/socket/characterEvents.test.ts
- [ ] T105 [P] [US4] Contract test for character:conflict event in tests/contract/socket/characterEvents.test.ts
- [ ] T106 [P] [US4] Contract test for sync:campaign-state event in tests/contract/socket/syncEvents.test.ts
- [ ] T107 [P] [US4] Integration test for real-time sync workflow in tests/integration/realTimeSync.test.ts
- [ ] T108 [P] [US4] Integration test for conflict resolution in tests/integration/conflictResolution.test.ts

### Implementation for User Story 4

- [ ] T109 [P] [US4] Implement authentication handler in src/infrastructure/socket/handlers/authenticate.ts
- [ ] T110 [P] [US4] Implement campaign join/leave handlers in src/infrastructure/socket/handlers/campaign.ts
- [ ] T111 [P] [US4] Implement character update handler in src/infrastructure/socket/handlers/characterUpdate.ts
- [ ] T112 [P] [US4] Implement sync request handler in src/infrastructure/socket/handlers/sync.ts
- [ ] T113 [US4] Wire up socket handlers in src/infrastructure/socket/server.ts (setupSocketHandlers - runs after T109-T112)
- [ ] T114 [US4] Implement Socket.IO room management (user rooms, campaign rooms)
- [ ] T115 [US4] Implement conflict detection using updatedAt timestamps
- [ ] T116 [US4] Implement last-write-wins conflict resolution
- [ ] T117 [P] [US4] Create useSocket hook in src/hooks/useSocket.ts (client-side)
- [ ] T118 [P] [US4] Create useCharacterSync hook in src/hooks/useCharacterSync.ts (client-side)
- [ ] T119 [US4] Integrate Socket.IO client in character sheet component
- [ ] T120 [US4] Implement optimistic updates in character sheet UI
- [ ] T121 [US4] Implement reconnection logic with state sync
- [ ] T122 [US4] Add notification UI for character updates (toast/banner)
- [ ] T123 [US4] Add notification routing (GM gets all, players get own only)

**Checkpoint**: At this point, User Story 4 should work - real-time updates broadcast to all connected users

---

## Phase 7: User Story 5 - Player Privacy & Access Control (Priority: P5)

**Goal**: Enforce player privacy (players can't see other players' sheets) while allowing GM full access.

**Independent Test**: Two players in same campaign attempt to view each other's sheets, verify access denied. GM can see both.

### Tests for User Story 5 (TDD MANDATORY)

- [ ] T124 [P] [US5] Contract test for character access control in tests/contract/api/characters.test.ts
- [ ] T125 [P] [US5] Integration test for player privacy enforcement in tests/integration/privacy.test.ts
- [ ] T126 [P] [US5] Integration test for GM all-access in tests/integration/gmAccess.test.ts

### Implementation for User Story 5

- [ ] T127 [US5] Implement character ownership check in CharacterRepository
- [ ] T128 [US5] Add authorization middleware for character routes in pages/api/characters/[id].ts
- [ ] T129 [US5] Enforce player-only access in GET /api/characters/[id]
- [ ] T130 [US5] Enforce player-only access in PUT /api/characters/[id]
- [ ] T131 [US5] Add GM override for all character access
- [ ] T132 [US5] Filter party list by role (players see own character only)
- [ ] T133 [US5] Hide other players' character details in campaign dashboard
- [ ] T134 [US5] Filter Socket.IO notifications by ownership (players receive own char updates only)
- [ ] T135 [US5] Add access denied error handling in character sheet component

**Checkpoint**: At this point, User Story 5 should work - privacy rules fully enforced

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T136 [P] Add comprehensive API error messages with proper HTTP status codes
- [ ] T137 [P] Add loading states to all async operations
- [ ] T138 [P] Add form validation feedback (inline errors, success messages)
- [ ] T139 [P] Apply D&D theme styling to all pages (parchment backgrounds, fantasy fonts)
- [ ] T140 [P] Add responsive design breakpoints (mobile 320px, tablet 768px, desktop 1024px+)
- [ ] T141 [P] Add keyboard navigation support for accessibility
- [ ] T142 [P] Add ARIA labels for screen readers
- [ ] T142a [P] Verify navigation structure meets FR-034 criteria (3-click rule, breadcrumbs, clear labels)
- [ ] T143 Code cleanup and refactoring (DRY, SOLID compliance)
- [ ] T144 Performance optimization (bundle size, lazy loading)
- [ ] T145 Security hardening (input sanitization, SQL injection prevention)
- [ ] T146 Run quickstart.md validation (verify all setup steps work)
- [ ] T147 Run full test suite with coverage report (npm run test:ci)
- [ ] T148 Verify constitution compliance (TDD, SOLID, DDD, code quality gates)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4 → P5)
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational - Requires US1 for campaign context but independently testable
- **User Story 3 (P3)**: Can start after Foundational - Requires US2 for characters but independently testable
- **User Story 4 (P4)**: Can start after Foundational - Requires US2 for character data but independently testable
- **User Story 5 (P5)**: Can start after Foundational - Requires US2, US3, US4 for full functionality but independently testable

### Within Each User Story

- Tests MUST be written and FAIL before implementation (TDD)
- Domain services before use cases
- Use cases before API routes
- API routes before UI pages
- Components before page integration
- Core implementation before edge cases
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T002-T010)
- All Foundational entity tasks can run in parallel (T013-T019)
- All Foundational repository tasks can run in parallel (T023-T028)
- All Foundational auth/component tasks can run in parallel (T029-T030, T034-T038)
- All tests for a user story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members (after Foundational)
- All Polish tasks marked [P] can run in parallel (T136-T142)

---

## Parallel Example: User Story 1

```bash
# Launch all contract tests for User Story 1 together (write tests first):
Task T042: "Contract test for POST /api/auth/register in tests/contract/api/auth.test.ts"
Task T043: "Contract test for POST /api/auth/login in tests/contract/api/auth.test.ts"
Task T044: "Contract test for GET /api/auth/session in tests/contract/api/auth.test.ts"
Task T045: "Contract test for POST /api/campaigns/create in tests/contract/api/campaigns.test.ts"

# Launch all API route implementations together (after tests written):
Task T054: "Implement POST /api/auth/register in pages/api/auth/register.ts"
Task T055: "Implement POST /api/auth/login in pages/api/auth/login.ts"
Task T056: "Implement GET /api/auth/session in pages/api/auth/session.ts"
Task T057: "Implement POST /api/campaigns/create in pages/api/campaigns/create.ts"

# Launch all page components together:
Task T060: "Create registration page in pages/register.tsx"
Task T061: "Create login page in pages/login.tsx"
Task T062: "Create home/landing page in pages/index.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T010)
2. Complete Phase 2: Foundational (T011-T038) - CRITICAL
3. Complete Phase 3: User Story 1 (T039-T068)
4. **STOP and VALIDATE**: Run tests, verify GM can create campaigns and invite players
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Add User Story 5 → Test independently → Deploy/Demo
7. Add Polish → Final release

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (campaign creation)
   - Developer B: User Story 2 (character management)
   - Developer C: User Story 4 (real-time sync infrastructure)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- TDD is MANDATORY: Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- Constitution compliance: 80% coverage for domain layer, 60% overall
