# Feature Specification: Pathfinder Party Manager

**Feature Branch**: `001-party-manager`
**Created**: 2025-11-14
**Status**: Draft
**Input**: User description: "Build an web application (mobile/tablet compatible) helping to manage a role playing game party. A Game Master can create a Game Campaign and invite players using pre-signed url (token in link). When a player land on the link, he can login or create a new account then create his character for the Game Campaign. A character is composed like a character sheet (see char sheet.md), a player can only have 1 char alive at the same time. The GM can see every informations about his player characters and can update their data. The player is fully able to edit his data too. Players cannot see sheets of other players. Each time a modification is applyed, the players and GM are notified and update without any reload. The UI should follow DnD design like."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - GM Campaign Creation & Player Invitation (Priority: P1)

A Game Master creates a new campaign and invites players to join using a secure invitation link. This is the foundation that enables all other functionality - without campaigns and player invites, the party management system cannot function.

**Why this priority**: This is the entry point for all users. GMs cannot manage parties without creating campaigns, and players cannot participate without being invited. This story delivers immediate value by enabling the core workflow.

**Independent Test**: Can be fully tested by creating a campaign as GM, generating an invite link, and verifying that the link leads to a join page. Delivers the value of campaign setup and player recruitment.

**Acceptance Scenarios**:

1. **Given** a user has created an account, **When** they create a new campaign with a name and description, **Then** the campaign is created and they are assigned as the Game Master
2. **Given** a GM has created a campaign, **When** they generate an invitation link, **Then** a unique, secure token-based URL is created that remains valid until revoked
3. **Given** a player receives an invitation link, **When** they click the link, **Then** they are directed to a page showing campaign details and options to login or create an account
4. **Given** a player with an invitation link has no account, **When** they create an account from the invitation page, **Then** their account is created and they are automatically associated with the campaign
5. **Given** a player with an invitation link already has an account, **When** they login from the invitation page, **Then** they are authenticated and automatically joined to the campaign
6. **Given** a GM views their campaign, **When** they check the player list, **Then** they see all players who have joined via invitation links

---

### User Story 2 - Player Character Creation & Management (Priority: P2)

Players create and manage their Pathfinder character sheets within a campaign. Each player can maintain one active character at a time, with full control over their character's attributes, skills, and abilities based on Pathfinder rules.

**Why this priority**: Once players join a campaign, they need characters to participate. This story enables the core RPG experience and provides the data foundation for game sessions.

**Independent Test**: Can be tested by having a player join a campaign and create a complete character sheet with all six ability scores (STR, DEX, CON, INT, WIS, CHA), character name, and basic details. Delivers the value of character creation and personal character management.

**Acceptance Scenarios**:

1. **Given** a player has joined a campaign with no existing character, **When** they navigate to the campaign, **Then** they are prompted to create their first character
2. **Given** a player is creating a character, **When** they enter character name and six ability scores (Force, Dextérité, Constitution, Intelligence, Sagesse, Charisme), **Then** the system automatically calculates modifiers using the formula: modifier = ⌊(score - 10) / 2⌋
3. **Given** a player has entered ability scores, **When** they view their character sheet, **Then** all ability scores display with their calculated modifiers (e.g., "Force: 14 (+2)")
4. **Given** a player has one living character, **When** they attempt to create another character in the same campaign, **Then** they are prevented and shown a message that only one living character is allowed at a time
5. **Given** a player is viewing their character sheet, **When** they edit any ability score or character detail, **Then** the changes are immediately saved and modifiers are recalculated
6. **Given** a player has a complete character, **When** they view their campaign dashboard, **Then** they see their character summary with key stats

---

### User Story 3 - GM Character Oversight & Management (Priority: P3)

Game Masters view and manage all player characters in their campaign. GMs have full read and write access to player character sheets, enabling them to make adjustments based on game events, level-ups, or rule corrections.

**Why this priority**: GMs need to oversee and adjust player characters during gameplay (damage, level progression, item acquisition). This story enables the GM's moderator role and ensures game integrity.

**Independent Test**: Can be tested by having a GM view all player characters in their campaign, select one character, and make an edit (e.g., change hit points or ability scores). Delivers the value of GM oversight and campaign management.

**Acceptance Scenarios**:

1. **Given** a GM is viewing their campaign dashboard, **When** they navigate to the party view, **Then** they see a list of all player characters with summary information (name, level, key stats)
2. **Given** a GM views the party list, **When** they select a player's character, **Then** they see the complete character sheet with all details
3. **Given** a GM is viewing a player's character sheet, **When** they edit any character data (ability scores, hit points, equipment, etc.), **Then** the changes are saved and the player sees the updates immediately
4. **Given** a GM is viewing a character sheet, **When** they change an ability score, **Then** the modifier is automatically recalculated and displayed
5. **Given** a GM makes a change to a character, **When** the change is saved, **Then** the player who owns that character receives a notification of the change
6. **Given** a GM is managing multiple characters, **When** they switch between character sheets, **Then** all displayed data is accurate and up-to-date without page reload

---

### User Story 4 - Real-Time Updates & Collaboration (Priority: P4)

All users see changes to character sheets in real-time without manually refreshing. When a GM updates a character or a player edits their own sheet, all connected users see the updates instantly, enabling live gameplay and collaborative storytelling.

**Why this priority**: Real-time updates enhance the live gameplay experience and prevent conflicts from outdated data. This story transforms the application from a simple CRUD tool into a collaborative platform.

**Independent Test**: Can be tested by having a GM and player both viewing the same character sheet simultaneously, making an edit from one side, and verifying the other side updates immediately. Delivers the value of live collaboration and data synchronization.

**Acceptance Scenarios**:

1. **Given** a player is viewing their character sheet and the GM is viewing the same sheet, **When** the player changes an ability score, **Then** the GM sees the change appear immediately without refreshing
2. **Given** a GM is viewing a player's character sheet and the player is viewing their own sheet, **When** the GM makes an edit, **Then** the player sees the change appear immediately without refreshing
3. **Given** a player or GM makes a change to a character, **When** the change is saved, **Then** a notification appears for all relevant users (GM and character owner) showing what changed
4. **Given** multiple users are viewing the same campaign dashboard, **When** a new player joins or a character is created, **Then** all users see the updated party list immediately
5. **Given** a user experiences a temporary connection loss, **When** their connection is restored, **Then** they automatically receive all changes that occurred while disconnected
6. **Given** two users edit the same field simultaneously, **When** both changes are submitted, **Then** the later change wins and both users see a notification about the conflict

---

### User Story 5 - Player Privacy & Access Control (Priority: P5)

Players can only view and edit their own character sheets, while GMs can view and edit all characters in their campaigns. This ensures player privacy and prevents metagaming while maintaining GM authority.

**Why this priority**: Privacy controls are essential for competitive play and preventing cheating. This story ensures fair gameplay and maintains trust in the system.

**Independent Test**: Can be tested by having two players in the same campaign attempt to view each other's character sheets and verify they cannot, while verifying the GM can see both. Delivers the value of secure, private character data.

**Acceptance Scenarios**:

1. **Given** a player is logged into a campaign with multiple players, **When** they view the party list, **Then** they see only their own character details and see other characters as "hidden" or with minimal public information (name only)
2. **Given** a player attempts to directly access another player's character sheet URL, **When** the page loads, **Then** they receive an "access denied" message and cannot view the sheet
3. **Given** a player is viewing the campaign, **When** another player's character is updated, **Then** they do NOT receive notifications about other players' changes
4. **Given** a GM is viewing the campaign, **When** any character is updated (by player or GM), **Then** they receive notifications about all changes
5. **Given** a player has GM access to one campaign and is a player in another, **When** they switch between campaigns, **Then** their access level changes appropriately (GM vs player permissions)
6. **Given** a GM views the party list, **When** they select any character, **Then** they have full read and write access regardless of which player owns it

---

### Edge Cases

- What happens when a player tries to join a campaign using an expired or revoked invitation token?
- How does the system handle a player attempting to create a second living character?
- What happens when two users (GM and player, or system conflict) attempt to save contradicting changes to the same character field simultaneously?
- How does the system behave when a player loses network connection while editing their character?
- What happens if a player deletes their account while having an active character in campaigns?
- How does the system handle extremely long character names or invalid ability score values (negative, decimals, extremely high)?
- What happens when a GM attempts to delete a campaign that has active players and characters?

## Requirements *(mandatory)*

### Functional Requirements

**Account & Authentication**

- **FR-001**: System MUST allow users to create accounts with email and password
- **FR-002**: System MUST validate email addresses and require password strength standards (minimum 8 characters)
- **FR-003**: System MUST allow users to login with their email and password credentials
- **FR-004**: System MUST maintain user sessions across browser tabs and device switches

**Campaign Management**

- **FR-005**: Game Masters MUST be able to create campaigns with a unique name and optional description
- **FR-006**: System MUST assign the campaign creator as the Game Master with full permissions
- **FR-007**: System MUST generate unique, secure, token-based invitation URLs for each campaign
- **FR-008**: Invitation links MUST remain valid until explicitly revoked by the GM
- **FR-009**: System MUST allow players to join campaigns by accessing invitation URLs
- **FR-010**: System MUST automatically associate a player with the campaign when they accept an invitation

**Character Creation & Management**

- **FR-011**: Players MUST be able to create characters with a name and six ability scores (Force, Dextérité, Constitution, Intelligence, Sagesse, Charisme)
- **FR-012**: System MUST enforce the one-living-character-per-campaign rule for players
- **FR-013**: System MUST automatically calculate ability modifiers using the formula: ⌊(score - 10) / 2⌋
- **FR-014**: System MUST display ability scores with their calculated modifiers (e.g., "14 (+2)")
- **FR-015**: Players MUST be able to edit all fields on their own character sheets
- **FR-016**: System MUST validate ability scores are within reasonable ranges (1-30 typical for Pathfinder)
- **FR-017**: System MUST persist all character data changes immediately upon save

**GM Permissions & Oversight**

- **FR-018**: Game Masters MUST be able to view all character sheets in their campaigns
- **FR-019**: Game Masters MUST be able to edit any field on any character sheet in their campaigns
- **FR-020**: System MUST apply the same calculation rules (ability modifiers) when GMs edit characters
- **FR-021**: System MUST track which user made the last change to each character field (for audit purposes)

**Access Control & Privacy**

- **FR-022**: Players MUST only be able to view and edit their own character sheets
- **FR-023**: Players MUST NOT be able to view other players' character sheets in the same campaign
- **FR-024**: System MUST enforce access control at the data layer (not just UI hiding)
- **FR-025**: System MUST restrict direct URL access to character sheets based on ownership/GM status

**Real-Time Updates & Notifications**

- **FR-026**: System MUST broadcast character sheet changes to all authorized viewers in real-time (without page reload)
- **FR-027**: Players MUST receive notifications when a GM modifies their character
- **FR-028**: GMs MUST receive notifications when any player modifies their character
- **FR-029**: System MUST synchronize data for users who reconnect after temporary disconnection
- **FR-030**: System MUST handle simultaneous edit conflicts using last-write-wins strategy with user notification

**User Experience & Interface**

- **FR-031**: Application MUST be fully responsive and functional on mobile phones, tablets, and desktop computers
- **FR-032**: UI MUST use fantasy/D&D-inspired design aesthetics (parchment textures, fantasy fonts, thematic colors)
- **FR-033**: System MUST provide clear feedback for all user actions (save confirmations, error messages, loading states)
- **FR-034**: Navigation MUST be intuitive and follow standard web application patterns

### Key Entities

- **User**: Represents a person with an account. Has email, password (hashed), and display name. Can be a GM in some campaigns and a player in others.

- **Campaign**: Represents a game session or story arc managed by one GM. Has a name, description, creation date, and belongs to one Game Master (User). Contains multiple Players and Characters.

- **Player**: Represents a User's participation in a specific Campaign. Links a User to a Campaign with a join date. Each Player can have one living Character per Campaign.

- **Character**: Represents a player's Pathfinder character sheet. Belongs to one Player in one Campaign. Contains:
  - Basic info: Character name, level, class, race
  - Ability Scores: Force (FOR), Dextérité (DEX), Constitution (CON), Intelligence (INT), Sagesse (SAG), Charisme (CHA) - each with calculated modifier
  - Derived Stats: Hit points, armor class, saving throws
  - Additional data: Skills, feats, equipment, spells, notes

- **Invitation**: Represents a secure, token-based invitation link for a Campaign. Has a unique token, creation date, expiration status, and belongs to one Campaign. Used once per Player to join.

- **Activity Log**: Represents audit trail of changes to Characters. Records which User made what change, when, and to which Character field. Used for notifications and conflict resolution.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create an account, create a campaign, and generate an invitation link in under 3 minutes
- **SC-002**: Players can join a campaign via invitation link and create a complete character sheet (name + 6 ability scores) in under 5 minutes
- **SC-003**: Character sheet changes made by one user appear on another user's screen within 2 seconds without manual refresh
- **SC-004**: System supports at least 10 concurrent campaigns with 6 players each (60 active users) without performance degradation
- **SC-005**: Application is fully functional on mobile devices (iOS Safari, Android Chrome) and tablets with screen sizes from 320px to 1920px width
- **SC-006**: 90% of users successfully create their first character without encountering errors or confusion
- **SC-007**: Ability modifier calculations are accurate 100% of the time according to Pathfinder rules: ⌊(score - 10) / 2⌋
- **SC-008**: Players cannot access other players' character sheets - 100% enforcement of privacy controls with zero unauthorized access incidents
- **SC-009**: All critical user actions (save character, join campaign, edit ability scores) complete within 1 second on standard broadband connections (10 Mbps+)
- **SC-010**: System maintains data consistency with zero data loss during simultaneous edits - conflict resolution always preserves last change

## Assumptions

Since certain details were not specified in the original requirements, the following assumptions guide this specification:

1. **Authentication Method**: Standard email/password authentication is sufficient for MVP. OAuth2/SSO can be added later if needed.

2. **Character Death/Retirement**: The "one living character" rule implies characters can die or be retired. Assumed that GMs can mark characters as "deceased" or "retired" to allow players to create new ones.

3. **Data Retention**: User accounts, campaigns, and character data are retained indefinitely unless explicitly deleted by users. No automatic cleanup or archival.

4. **Campaign Capacity**: No hard limit on players per campaign for MVP. Reasonable expectation is 3-8 players per campaign based on typical RPG party sizes.

5. **Character Sheet Complexity**: MVP focuses on core Pathfinder attributes (ability scores with modifiers). Additional character sheet features (skills, feats, equipment, spells) can be added incrementally.

6. **Invitation Link Security**: Token-based URLs provide sufficient security for MVP. Tokens should be cryptographically random (UUID v4 or similar) and remain valid until explicitly revoked.

7. **Real-Time Technology**: WebSocket or Server-Sent Events will be used for real-time updates. Fallback to polling is acceptable if needed.

8. **Conflict Resolution**: Last-write-wins is acceptable for MVP. No complex merge strategies or field-level locking required initially.

9. **Mobile/Tablet Compatibility**: Responsive web application (not native apps). Supports modern browsers: Chrome, Safari, Firefox, Edge (last 2 versions).

10. **D&D-Inspired Design**: Fantasy aesthetic using web-safe approaches (CSS styling, web fonts, SVG decorations). No requirement for custom artwork or illustrations in MVP.

11. **Notification Method**: In-app notifications displayed as toast/banner messages. No email or push notifications required for MVP.

12. **Multi-Campaign Support**: Users can be GMs of multiple campaigns and players in multiple campaigns simultaneously.
