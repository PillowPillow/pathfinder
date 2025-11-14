/**
 * CharacterValidator - Domain service for validating character data
 */
export class CharacterValidator {
  /**
   * Validate ability score is within acceptable range
   * Pathfinder typical range: 1-30
   */
  static validateAbilityScore(score: number): { valid: boolean; error?: string } {
    if (!Number.isInteger(score)) {
      return { valid: false, error: 'Ability score must be an integer' };
    }

    if (score < 1 || score > 30) {
      return {
        valid: false,
        error: 'Ability score must be between 1 and 30',
      };
    }

    return { valid: true };
  }

  /**
   * Validate all ability scores
   */
  static validateAllAbilityScores(scores: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  }): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    const abilities = [
      { name: 'Strength', value: scores.strength },
      { name: 'Dexterity', value: scores.dexterity },
      { name: 'Constitution', value: scores.constitution },
      { name: 'Intelligence', value: scores.intelligence },
      { name: 'Wisdom', value: scores.wisdom },
      { name: 'Charisma', value: scores.charisma },
    ];

    for (const ability of abilities) {
      const result = this.validateAbilityScore(ability.value);
      if (!result.valid) {
        errors.push(`${ability.name}: ${result.error}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate character name
   */
  static validateCharacterName(name: string): { valid: boolean; error?: string } {
    if (!name || name.trim().length === 0) {
      return { valid: false, error: 'Character name is required' };
    }

    if (name.length < 2) {
      return { valid: false, error: 'Character name must be at least 2 characters' };
    }

    if (name.length > 50) {
      return { valid: false, error: 'Character name must be less than 50 characters' };
    }

    return { valid: true };
  }

  /**
   * Validate character level
   */
  static validateLevel(level: number): { valid: boolean; error?: string } {
    if (!Number.isInteger(level)) {
      return { valid: false, error: 'Level must be an integer' };
    }

    if (level < 1 || level > 20) {
      return { valid: false, error: 'Level must be between 1 and 20' };
    }

    return { valid: true };
  }
}
