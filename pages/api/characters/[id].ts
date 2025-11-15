/**
 * T081-T082 [P] [US2] GET/PUT /api/characters/[id]
 * Retrieves or updates a character
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { validateSession } from '../../../src/infrastructure/auth/session';
import { CharacterRepository } from '../../../src/infrastructure/database/repositories/CharacterRepository';
import { UpdateCharacter } from '../../../src/application/useCases/UpdateCharacter';
import { AbilityCalculator } from '../../../src/domain/services/AbilityCalculator';
import {
  CharacterResponseDTO,
  ErrorResponseDTO,
  ValidationError,
  NotFoundError,
} from '../../../src/application/dto';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CharacterResponseDTO | ErrorResponseDTO>
) {
  try {
    // Authenticate user
    const sessionToken = req.cookies.session;
    if (!sessionToken) {
      return res.status(401).json({
        error: 'UnauthorizedError',
        message: 'Authentication required',
      });
    }

    const user = await validateSession(sessionToken);
    if (!user) {
      return res.status(401).json({
        error: 'UnauthorizedError',
        message: 'Invalid or expired session',
      });
    }

    const characterId = Number(req.query.id);
    if (!characterId || characterId <= 0) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Valid character ID is required',
      });
    }

    const characterRepo = new CharacterRepository();

    if (req.method === 'GET') {
      // Get character
      const character = await characterRepo.findById(characterId);

      if (!character) {
        return res.status(404).json({
          error: 'NotFoundError',
          message: 'Character not found',
        });
      }

      // TODO: Add ownership check in Phase 7/US5
      // For now, allow anyone authenticated to view

      // Calculate ability modifiers
      const modifiers = {
        strength: AbilityCalculator.calculateModifier(character.abilityScores.strength),
        dexterity: AbilityCalculator.calculateModifier(character.abilityScores.dexterity),
        constitution: AbilityCalculator.calculateModifier(character.abilityScores.constitution),
        intelligence: AbilityCalculator.calculateModifier(character.abilityScores.intelligence),
        wisdom: AbilityCalculator.calculateModifier(character.abilityScores.wisdom),
        charisma: AbilityCalculator.calculateModifier(character.abilityScores.charisma),
      };

      return res.status(200).json({
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
      });
    } else if (req.method === 'PUT') {
      // Update character
      // TODO: Add ownership check in Phase 7/US5
      // For now, allow any authenticated user to update

      const updateCharacter = new UpdateCharacter(characterRepo);

      const character = await updateCharacter.execute(characterId, req.body);

      return res.status(200).json(character);
    } else {
      return res.status(405).json({ error: 'MethodNotAllowed', message: 'Method not allowed' });
    }
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        error: 'ValidationError',
        message: error.message,
      });
    }

    if (error instanceof NotFoundError) {
      return res.status(404).json({
        error: 'NotFoundError',
        message: error.message,
      });
    }

    console.error('Character operation error:', error);
    return res.status(500).json({
      error: 'InternalServerError',
      message: 'An error occurred while processing character request',
    });
  }
}
