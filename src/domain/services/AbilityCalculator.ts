/**
 * AbilityCalculator - Pure domain service for ability score calculations
 * Following Pathfinder rules: modifier = floor((score - 10) / 2)
 */
export class AbilityCalculator {
  /**
   * Calculate ability modifier from raw ability score
   * @param score - Raw ability score (typically 1-30)
   * @returns Calculated modifier
   *
   * @example
   * calculateModifier(10) // returns 0
   * calculateModifier(14) // returns +2
   * calculateModifier(8) // returns -1
   */
  static calculateModifier(score: number): number {
    return Math.floor((score - 10) / 2);
  }

  /**
   * Format ability score with modifier for display
   * @param score - Raw ability score
   * @returns Formatted string (e.g., "14 (+2)")
   */
  static formatWithModifier(score: number): string {
    const modifier = this.calculateModifier(score);
    const sign = modifier >= 0 ? '+' : '';
    return `${score} (${sign}${modifier})`;
  }

  /**
   * Calculate all ability modifiers from scores
   */
  static calculateAllModifiers(scores: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  }): Record<string, number> {
    return {
      strengthMod: this.calculateModifier(scores.strength),
      dexterityMod: this.calculateModifier(scores.dexterity),
      constitutionMod: this.calculateModifier(scores.constitution),
      intelligenceMod: this.calculateModifier(scores.intelligence),
      wisdomMod: this.calculateModifier(scores.wisdom),
      charismaMod: this.calculateModifier(scores.charisma),
    };
  }
}
