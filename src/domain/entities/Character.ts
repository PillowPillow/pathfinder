import { AbilityScores } from './AbilityScore';

export type CharacterStatus = 'living' | 'deceased' | 'retired';

export interface Character {
  id: number;
  playerId: number;
  name: string;
  status: CharacterStatus;
  level: number;
  class: string | null;
  race: string | null;
  abilityScores: AbilityScores;
  hitPoints: number | null;
  armorClass: number | null;
  skills: Record<string, any> | null;
  feats: Array<string> | null;
  equipment: Array<string> | null;
  spells: Array<string> | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCharacterDTO {
  playerId: number;
  name: string;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  class?: string;
  race?: string;
}

export interface UpdateCharacterDTO {
  name?: string;
  level?: number;
  class?: string;
  race?: string;
  strength?: number;
  dexterity?: number;
  constitution?: number;
  intelligence?: number;
  wisdom?: number;
  charisma?: number;
  hitPoints?: number;
  armorClass?: number;
  skills?: Record<string, any>;
  feats?: Array<string>;
  equipment?: Array<string>;
  spells?: Array<string>;
  notes?: string;
}
