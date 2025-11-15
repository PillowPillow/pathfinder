/**
 * T079a [US2] ChangeCharacterStatus Use Case
 * Changes a character's status (living/deceased/retired) - GM only
 */
import { CharacterRepository } from '../../infrastructure/database/repositories/CharacterRepository';
import { CampaignRepository } from '../../infrastructure/database/repositories/CampaignRepository';
import { CampaignRules } from '../../domain/services/CampaignRules';
import { AbilityCalculator } from '../../domain/services/AbilityCalculator';
import {
  CharacterResponseDTO,
  ValidationError,
  PermissionError,
  NotFoundError,
} from '../dto';

export interface ChangeCharacterStatusDTO {
  characterId: number;
  newStatus: 'living' | 'deceased' | 'retired';
  gmUserId: number;
  campaignId: number;
}

export class ChangeCharacterStatus {
  constructor(
    private characterRepo: CharacterRepository,
    private campaignRepo: CampaignRepository,
    private campaignRules: CampaignRules
  ) {}

  async execute(dto: ChangeCharacterStatusDTO): Promise<CharacterResponseDTO> {
    // Validate inputs
    if (!dto.characterId || dto.characterId <= 0) {
      throw new ValidationError('Valid character ID is required');
    }

    if (!dto.gmUserId || dto.gmUserId <= 0) {
      throw new ValidationError('Valid GM user ID is required');
    }

    if (!dto.campaignId || dto.campaignId <= 0) {
      throw new ValidationError('Valid campaign ID is required');
    }

    // Validate status value
    const validStatuses = ['living', 'deceased', 'retired'];
    if (!validStatuses.includes(dto.newStatus)) {
      throw new ValidationError('Status must be one of: living, deceased, retired');
    }

    // Verify character exists
    const character = await this.characterRepo.findById(dto.characterId);
    if (!character) {
      throw new NotFoundError('Character not found');
    }

    // Validate GM permission (this will throw PermissionError if not GM)
    await this.campaignRules.validateGMPermission(
      dto.campaignId,
      dto.gmUserId,
      this.campaignRepo
    );

    // Validate status transition
    const canChange = CampaignRules.canChangeStatus(character.status, dto.newStatus);
    if (!canChange.allowed) {
      throw new ValidationError(canChange.reason!);
    }

    // Update character status
    const updatedCharacter = await this.characterRepo.updateStatus(dto.characterId, dto.newStatus);
    if (!updatedCharacter) {
      throw new NotFoundError('Character not found after status update');
    }

    // Calculate ability modifiers
    const modifiers = {
      strength: AbilityCalculator.calculateModifier(updatedCharacter.abilityScores.strength),
      dexterity: AbilityCalculator.calculateModifier(updatedCharacter.abilityScores.dexterity),
      constitution: AbilityCalculator.calculateModifier(updatedCharacter.abilityScores.constitution),
      intelligence: AbilityCalculator.calculateModifier(updatedCharacter.abilityScores.intelligence),
      wisdom: AbilityCalculator.calculateModifier(updatedCharacter.abilityScores.wisdom),
      charisma: AbilityCalculator.calculateModifier(updatedCharacter.abilityScores.charisma),
    };

    // Return response DTO
    return {
      id: updatedCharacter.id,
      playerId: updatedCharacter.playerId,
      name: updatedCharacter.name,
      level: updatedCharacter.level,
      race: updatedCharacter.race,
      class: updatedCharacter.class,
      abilityScores: {
        strength: updatedCharacter.abilityScores.strength,
        dexterity: updatedCharacter.abilityScores.dexterity,
        constitution: updatedCharacter.abilityScores.constitution,
        intelligence: updatedCharacter.abilityScores.intelligence,
        wisdom: updatedCharacter.abilityScores.wisdom,
        charisma: updatedCharacter.abilityScores.charisma,
      },
      hitPoints: updatedCharacter.hitPoints,
      armorClass: updatedCharacter.armorClass,
      status: updatedCharacter.status,
      createdAt: updatedCharacter.createdAt.toISOString(),
      updatedAt: updatedCharacter.updatedAt.toISOString(),
      modifiers,
    };
  }
}
