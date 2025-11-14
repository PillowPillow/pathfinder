/**
 * Ability Scores following Pathfinder rules
 * French names for UI display, English property names for code
 */
export interface AbilityScores {
  strength: number; // Force (FOR)
  dexterity: number; // Dextérité (DEX)
  constitution: number; // Constitution (CON)
  intelligence: number; // Intelligence (INT)
  wisdom: number; // Sagesse (SAG)
  charisma: number; // Charisme (CHA)
}

export interface AbilityScore {
  name: string; // e.g., "Force", "Dextérité"
  value: number; // Raw ability score (1-30 typical)
  modifier: number; // Calculated modifier
}

/**
 * French ability score labels for UI display
 */
export const ABILITY_LABELS = {
  strength: 'Force',
  dexterity: 'Dextérité',
  constitution: 'Constitution',
  intelligence: 'Intelligence',
  wisdom: 'Sagesse',
  charisma: 'Charisme',
} as const;

export type AbilityType = keyof typeof ABILITY_LABELS;
