/**
 * T053 [P] [US1] Data Transfer Objects for application layer
 * Defines request/response types for use cases and API routes
 */

// ==================== Authentication DTOs ====================

export interface RegisterUserDTO {
  email: string;
  password: string;
  displayName: string;
}

export interface LoginUserDTO {
  email: string;
  password: string;
}

export interface UserResponseDTO {
  id: number;
  email: string;
  displayName: string;
  createdAt: string;
}

// ==================== Campaign DTOs ====================

export interface CreateCampaignDTO {
  name: string;
  description?: string;
  gmUserId: number;
}

export interface CampaignResponseDTO {
  id: number;
  name: string;
  description: string | null;
  gmUserId: number;
  createdAt: string;
}

export interface CampaignDetailResponseDTO extends CampaignResponseDTO {
  gm: UserResponseDTO;
  players: PlayerResponseDTO[];
  characters: CharacterResponseDTO[];
}

// ==================== Invitation DTOs ====================

export interface GenerateInvitationDTO {
  campaignId: number;
  gmUserId: number;
}

export interface InvitationResponseDTO {
  id: number;
  campaignId: number;
  token: string;
  inviteUrl: string;
  createdAt: string;
  revoked: boolean;
}

export interface InvitationInfoDTO {
  campaignId: number;
  campaignName: string;
  gmName: string;
  token: string;
}

// ==================== Player DTOs ====================

export interface JoinCampaignDTO {
  userId: number;
  campaignId: number;
  invitationToken: string;
}

export interface PlayerResponseDTO {
  id: number;
  userId: number;
  campaignId: number;
  user: UserResponseDTO;
  joinedAt: string;
}

// ==================== Character DTOs ====================

export interface CreateCharacterDTO {
  playerId: number;
  name: string;
  level?: number;
  race?: string;
  class?: string;
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
  status?: 'living' | 'deceased' | 'retired';
}

export interface CharacterResponseDTO {
  id: number;
  playerId: number;
  name: string;
  level: number;
  race: string | null;
  class: string | null;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  hitPoints: number | null;
  armorClass: number | null;
  status: 'living' | 'deceased' | 'retired';
  createdAt: string;
  updatedAt: string;
  modifiers: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
}

// ==================== Error DTOs ====================

export interface ErrorResponseDTO {
  error: string;
  message: string;
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class PermissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PermissionError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

export class BusinessRuleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BusinessRuleError';
  }
}
