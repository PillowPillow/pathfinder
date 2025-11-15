/**
 * T078 [US2] CreateCharacter Use Case
 * Creates a new character for a player in a campaign
 */
import { CharacterRepository } from '../../infrastructure/database/repositories/CharacterRepository';
import { PlayerRepository } from '../../infrastructure/database/repositories/PlayerRepository';
import { CharacterValidator } from '../../domain/services/CharacterValidator';
import { CampaignRules } from '../../domain/services/CampaignRules';
import { AbilityCalculator } from '../../domain/services/AbilityCalculator';
import {
  CreateCharacterDTO,
  CharacterResponseDTO,
  ValidationError,
  PermissionError,
} from '../dto';

export class CreateCharacter {
  constructor(
    private characterRepo: CharacterRepository,
    private playerRepo: PlayerRepository
  ) {}

  async execute(dto: CreateCharacterDTO): Promise<CharacterResponseDTO> {
    // Validate character name
    const nameValidation = CharacterValidator.validateCharacterName(dto.name);
    if (!nameValidation.valid) {
      throw new ValidationError(nameValidation.error!);
    }

    // Validate all ability scores
    const scoresValidation = CharacterValidator.validateAllAbilityScores({
      strength: dto.strength,
      dexterity: dto.dexterity,
      constitution: dto.constitution,
      intelligence: dto.intelligence,
      wisdom: dto.wisdom,
      charisma: dto.charisma,
    });

    if (!scoresValidation.valid) {
      const errors = Object.entries(scoresValidation.errors)
        .map(([key, error]) => `${key}: ${error}`)
        .join(', ');
      throw new ValidationError(`Invalid ability scores: ${errors}`);
    }

    // Validate playerId
    if (!dto.playerId || dto.playerId <= 0) {
      throw new ValidationError('Valid player ID is required');
    }

    // Get player to verify exists
    const player = await this.playerRepo.findById(dto.playerId);
    if (!player) {
      throw new ValidationError('Player not found');
    }

    // Get player's existing characters
    const existingCharacters = await this.characterRepo.findByPlayerId(dto.playerId);

    // Enforce one-living-character rule
    const canCreate = CampaignRules.canCreateNewCharacter(existingCharacters);
    if (!canCreate.allowed) {
      throw new PermissionError(canCreate.reason!);
    }

    // Create the character
    const character = await this.characterRepo.create({
      playerId: dto.playerId,
      name: dto.name,
      strength: dto.strength,
      dexterity: dto.dexterity,
      constitution: dto.constitution,
      intelligence: dto.intelligence,
      wisdom: dto.wisdom,
      charisma: dto.charisma,
      class: dto.class,
      race: dto.race,
    });

    // Calculate ability modifiers
    const modifiers = {
      strength: AbilityCalculator.calculateModifier(character.abilityScores.strength),
      dexterity: AbilityCalculator.calculateModifier(character.abilityScores.dexterity),
      constitution: AbilityCalculator.calculateModifier(character.abilityScores.constitution),
      intelligence: AbilityCalculator.calculateModifier(character.abilityScores.intelligence),
      wisdom: AbilityCalculator.calculateModifier(character.abilityScores.wisdom),
      charisma: AbilityCalculator.calculateModifier(character.abilityScores.charisma),
    };

    // Return response DTO
    return {
      id: character.id,
      playerId: character.playerId,
      name: character.name,
      level: character.level,
      race: character.race,
      class: character.class,
      abilityScores: {
        strength: character.abilityScores.strength,
        dexterity: character.abilityScores.dexterity,
        constitution: character.abilityScores.constitution,
        intelligence: character.abilityScores.intelligence,
        wisdom: character.abilityScores.wisdom,
        charisma: character.abilityScores.charisma,
      },
      hitPoints: character.hitPoints,
      armorClass: character.armorClass,
      status: character.status,
      createdAt: character.createdAt.toISOString(),
      updatedAt: character.updatedAt.toISOString(),
      modifiers,
    };
  }
}
