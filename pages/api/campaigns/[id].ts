/**
 * T059 [P] [US1] GET /api/campaigns/[id]
 * Retrieves campaign details with players and characters
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { validateSession } from '../../../src/infrastructure/auth/session';
import { CampaignRepository } from '../../../src/infrastructure/database/repositories/CampaignRepository';
import { PlayerRepository } from '../../../src/infrastructure/database/repositories/PlayerRepository';
import { CharacterRepository } from '../../../src/infrastructure/database/repositories/CharacterRepository';
import { UserRepository } from '../../../src/infrastructure/database/repositories/UserRepository';
import {
  CampaignDetailResponseDTO,
  ErrorResponseDTO,
  NotFoundError,
} from '../../../src/application/dto';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CampaignDetailResponseDTO | ErrorResponseDTO>
) {
  if (req.method !== 'GET') {
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

    const { id } = req.query;
    const campaignId = Number(id);

    if (isNaN(campaignId)) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Invalid campaign ID',
      });
    }

    // Fetch campaign
    const campaignRepo = new CampaignRepository();
    const campaign = await campaignRepo.findById(campaignId);

    if (!campaign) {
      return res.status(404).json({
        error: 'NotFoundError',
        message: 'Campaign not found',
      });
    }

    // Check if user has access (GM or player)
    const playerRepo = new PlayerRepository();
    const isGM = campaign.gmUserId === user.id;
    const isPlayer = await playerRepo.findByUserAndCampaign(user.id, campaignId);

    if (!isGM && !isPlayer) {
      return res.status(403).json({
        error: 'PermissionError',
        message: 'You do not have access to this campaign',
      });
    }

    // Fetch GM details
    const userRepo = new UserRepository();
    const gm = await userRepo.findById(campaign.gmUserId);

    if (!gm) {
      throw new Error('GM user not found');
    }

    // Fetch players
    const players = await playerRepo.findByCampaign(campaignId);
    const playersWithUsers = await Promise.all(
      players.map(async (player) => {
        const playerUser = await userRepo.findById(player.userId);
        return {
          id: player.id,
          userId: player.userId,
          campaignId: player.campaignId,
          user: {
            id: playerUser!.id,
            email: playerUser!.email,
            displayName: playerUser!.displayName,
            createdAt: playerUser!.createdAt.toISOString(),
          },
          joinedAt: player.joinedAt.toISOString(),
        };
      })
    );

    // Fetch characters (placeholder - will be populated in Phase 4)
    const characters: any[] = [];

    return res.status(200).json({
      id: campaign.id,
      name: campaign.name,
      description: campaign.description,
      gmUserId: campaign.gmUserId,
      createdAt: campaign.createdAt.toISOString(),
      gm: {
        id: gm.id,
        email: gm.email,
        displayName: gm.displayName,
        createdAt: gm.createdAt.toISOString(),
      },
      players: playersWithUsers,
      characters,
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return res.status(404).json({
        error: 'NotFoundError',
        message: error.message,
      });
    }

    console.error('Campaign retrieval error:', error);
    return res.status(500).json({
      error: 'InternalServerError',
      message: 'An error occurred while retrieving campaign',
    });
  }
}
