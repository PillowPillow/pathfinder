import { Character, CharacterStatus } from '../entities/Character';

/**
 * CampaignRules - Domain service for enforcing campaign business rules
 */
export class CampaignRules {
  /**
   * Enforce one-living-character-per-campaign rule
   * Players can only have ONE living character per campaign
   *
   * @param existingCharacters - All characters for the player in this campaign
   * @returns Whether player can create a new character
   */
  static canCreateNewCharacter(existingCharacters: Character[]): {
    allowed: boolean;
    reason?: string;
  } {
    const livingCharacters = existingCharacters.filter((c) => c.status === 'living');

    if (livingCharacters.length > 0) {
      return {
        allowed: false,
        reason:
          'You already have a living character. Ask your GM to mark your current character as deceased or retired before creating a new one.',
      };
    }

    return { allowed: true };
  }

  /**
   * Validate GM permission for a campaign
   */
  static validateGMPermission(userId: number, campaignGMId: number): {
    hasPermission: boolean;
    reason?: string;
  } {
    if (userId !== campaignGMId) {
      return {
        hasPermission: false,
        reason: 'Only the Game Master can perform this action',
      };
    }

    return { hasPermission: true };
  }

  /**
   * Validate if user can edit character
   * Either the character owner OR the campaign GM
   */
  static canEditCharacter(
    userId: number,
    characterOwnerId: number,
    campaignGMId: number
  ): {
    canEdit: boolean;
    reason?: string;
  } {
    const isOwner = userId === characterOwnerId;
    const isGM = userId === campaignGMId;

    if (!isOwner && !isGM) {
      return {
        canEdit: false,
        reason: 'You do not have permission to edit this character',
      };
    }

    return { canEdit: true };
  }

  /**
   * Validate campaign name
   */
  static validateCampaignName(name: string): { valid: boolean; error?: string } {
    if (!name || name.trim().length === 0) {
      return { valid: false, error: 'Campaign name is required' };
    }

    if (name.length < 3) {
      return { valid: false, error: 'Campaign name must be at least 3 characters' };
    }

    if (name.length > 100) {
      return { valid: false, error: 'Campaign name must be less than 100 characters' };
    }

    return { valid: true };
  }

  /**
   * Validate character status transitions
   */
  static canChangeStatus(
    currentStatus: CharacterStatus,
    newStatus: CharacterStatus
  ): {
    allowed: boolean;
    reason?: string;
  } {
    // GMs can change any status to any other status
    // (business rule: only GMs can call this, enforced at application layer)
    return { allowed: true };
  }
}
