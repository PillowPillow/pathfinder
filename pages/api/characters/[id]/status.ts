/**
 * T082a [P] [US2] PATCH /api/characters/[id]/status
 * Changes a character's status (living/deceased/retired) - GM only
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { validateSession } from '../../../../src/infrastructure/auth/session';
import { CharacterRepository } from '../../../../src/infrastructure/database/repositories/CharacterRepository';
import { CampaignRepository } from '../../../../src/infrastructure/database/repositories/CampaignRepository';
import { CampaignRules } from '../../../../src/domain/services/CampaignRules';
import { ChangeCharacterStatus } from '../../../../src/application/useCases/ChangeCharacterStatus';
import {
  CharacterResponseDTO,
  ErrorResponseDTO,
  ValidationError,
  PermissionError,
  NotFoundError,
} from '../../../../src/application/dto';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CharacterResponseDTO | ErrorResponseDTO>
) {
  if (req.method !== 'PATCH') {
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

    const characterId = Number(req.query.id);
    const { status, campaignId } = req.body;

    // Validate inputs
    if (!status) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Status is required',
      });
    }

    if (!campaignId) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Campaign ID is required',
      });
    }

    // Change character status using use case
    const characterRepo = new CharacterRepository();
    const campaignRepo = new CampaignRepository();
    const campaignRules = new CampaignRules();

    const changeStatus = new ChangeCharacterStatus(
      characterRepo,
      campaignRepo,
      campaignRules
    );

    const character = await changeStatus.execute({
      characterId,
      newStatus: status,
      gmUserId: user.id,
      campaignId: Number(campaignId),
    });

    return res.status(200).json(character);
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

    if (error instanceof NotFoundError) {
      return res.status(404).json({
        error: 'NotFoundError',
        message: error.message,
      });
    }

    console.error('Status change error:', error);
    return res.status(500).json({
      error: 'InternalServerError',
      message: 'An error occurred while changing character status',
    });
  }
}
