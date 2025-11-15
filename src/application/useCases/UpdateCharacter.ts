/**
 * T079 [US2] UpdateCharacter Use Case
 * Updates an existing character's attributes
 */
import { CharacterRepository } from '../../infrastructure/database/repositories/CharacterRepository';
import { CharacterValidator } from '../../domain/services/CharacterValidator';
import { AbilityCalculator } from '../../domain/services/AbilityCalculator';
import {
  UpdateCharacterDTO,
  CharacterResponseDTO,
  ValidationError,
  NotFoundError,
} from '../dto';

export class UpdateCharacter {
  constructor(private characterRepo: CharacterRepository) {}

  async execute(characterId: number, dto: UpdateCharacterDTO): Promise<CharacterResponseDTO> {
    // Validate characterId
    if (!characterId || characterId <= 0) {
      throw new ValidationError('Valid character ID is required');
    }

    // Verify character exists
    const existingCharacter = await this.characterRepo.findById(characterId);
    if (!existingCharacter) {
      throw new NotFoundError('Character not found');
    }

    // Validate name if provided
    if (dto.name !== undefined) {
      const nameValidation = CharacterValidator.validateCharacterName(dto.name);
      if (!nameValidation.valid) {
        throw new ValidationError(nameValidation.error!);
      }
    }

    // Validate level if provided
    if (dto.level !== undefined) {
      const levelValidation = CharacterValidator.validateLevel(dto.level);
      if (!levelValidation.valid) {
        throw new ValidationError(levelValidation.error!);
      }
    }

    // Validate individual ability scores if provided
    const abilityScoreFields = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
    for (const field of abilityScoreFields) {
      const value = (dto as any)[field];
      if (value !== undefined) {
        const scoreValidation = CharacterValidator.validateAbilityScore(value);
        if (!scoreValidation.valid) {
          throw new ValidationError(`${field}: ${scoreValidation.error}`);
        }
      }
    }

    // Update the character
    const updatedCharacter = await this.characterRepo.update(characterId, dto);
    if (!updatedCharacter) {
      throw new NotFoundError('Character not found after update');
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
