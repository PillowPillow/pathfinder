/**
 * T080 [P] [US2] POST /api/characters/create
 * Creates a new character for a player in a campaign
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { validateSession } from '../../../src/infrastructure/auth/session';
import { CharacterRepository } from '../../../src/infrastructure/database/repositories/CharacterRepository';
import { PlayerRepository } from '../../../src/infrastructure/database/repositories/PlayerRepository';
import { CreateCharacter } from '../../../src/application/useCases/CreateCharacter';
import {
  CharacterResponseDTO,
  ErrorResponseDTO,
  ValidationError,
  PermissionError,
} from '../../../src/application/dto';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CharacterResponseDTO | ErrorResponseDTO>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'MethodNotAllowed', message: 'Method not allowed' });
  }

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

    const { campaignId, name, class: charClass, race, strength, dexterity, constitution, intelligence, wisdom, charisma } = req.body;

    // Validate campaignId
    if (!campaignId) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Campaign ID is required',
      });
    }

    // Verify user is a player in the campaign
    const playerRepo = new PlayerRepository();
    const player = await playerRepo.findByUserAndCampaign(user.id, Number(campaignId));

    if (!player) {
      return res.status(403).json({
        error: 'PermissionError',
        message: 'You must be a player in this campaign to create a character',
      });
    }

    // Create character using use case
    const characterRepo = new CharacterRepository();
    const createCharacter = new CreateCharacter(characterRepo, playerRepo);

    const character = await createCharacter.execute({
      playerId: player.id,
      name,
      class: charClass,
      race,
      strength: Number(strength),
      dexterity: Number(dexterity),
      constitution: Number(constitution),
      intelligence: Number(intelligence),
      wisdom: Number(wisdom),
      charisma: Number(charisma),
    });

    return res.status(201).json(character);
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        error: 'ValidationError',
        message: error.message,
      });
    }

    if (error instanceof PermissionError) {
      return res.status(403).json({
        error: 'PermissionError',
        message: error.message,
      });
    }

    console.error('Character creation error:', error);
    return res.status(500).json({
      error: 'InternalServerError',
      message: 'An error occurred while creating character',
    });
  }
}
