/**
 * T058a [P] [US1] GET/POST/DELETE /api/campaigns/invite/[token]
 * GET: View invitation details (public)
 * POST: Join campaign using invitation token
 * DELETE: Revoke invitation (GM only)
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { validateSession } from '../../../../src/infrastructure/auth/session';
import { InvitationRepository } from '../../../../src/infrastructure/database/repositories/InvitationRepository';
import { CampaignRepository } from '../../../../src/infrastructure/database/repositories/CampaignRepository';
import { PlayerRepository } from '../../../../src/infrastructure/database/repositories/PlayerRepository';
import { UserRepository } from '../../../../src/infrastructure/database/repositories/UserRepository';
import { CampaignRules } from '../../../../src/domain/services/CampaignRules';
import { JoinCampaign } from '../../../../src/application/useCases/JoinCampaign';
import { RevokeInvitation } from '../../../../src/application/useCases/RevokeInvitation';
import {
  InvitationInfoDTO,
  PlayerResponseDTO,
  ErrorResponseDTO,
  NotFoundError,
  ConflictError,
  PermissionError,
} from '../../../../src/application/dto';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<InvitationInfoDTO | PlayerResponseDTO | ErrorResponseDTO | {}>
) {
  const { token } = req.query;

  if (!token || typeof token !== 'string') {
    return res.status(400).json({
      error: 'ValidationError',
      message: 'Invalid invitation token',
    });
  }

  const invitationRepo = new InvitationRepository();
  const campaignRepo = new CampaignRepository();
  const playerRepo = new PlayerRepository();
  const userRepo = new UserRepository();

  if (req.method === 'GET') {
    // View invitation details (public endpoint)
    try {
      const invitation = await invitationRepo.findByToken(token);

      if (!invitation || invitation.revoked) {
        return res.status(404).json({
          error: 'NotFoundError',
          message: 'Invalid or revoked invitation',
        });
      }

      const campaign = await campaignRepo.findById(invitation.campaignId);
      if (!campaign) {
        return res.status(404).json({
          error: 'NotFoundError',
          message: 'Campaign not found',
        });
      }

      const gm = await userRepo.findById(campaign.gmUserId);
      if (!gm) {
        throw new Error('GM user not found');
      }

      return res.status(200).json({
        campaignId: campaign.id,
        campaignName: campaign.name,
        gmName: gm.displayName,
        token: invitation.token,
      });
    } catch (error) {
      console.error('Invitation view error:', error);
      return res.status(500).json({
        error: 'InternalServerError',
        message: 'An error occurred while retrieving invitation',
      });
    }
  } else if (req.method === 'POST') {
    // Join campaign using invitation
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

      // Join campaign using use case
      const joinCampaign = new JoinCampaign(
        playerRepo,
        invitationRepo,
        campaignRepo,
        userRepo
      );

      const player = await joinCampaign.execute({
        userId: user.id,
        campaignId: 0, // Will be fetched from invitation
        invitationToken: token,
      });

      return res.status(201).json(player);
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json({
          error: 'NotFoundError',
          message: error.message,
        });
      }

      if (error instanceof ConflictError) {
        return res.status(400).json({
          error: 'ConflictError',
          message: error.message,
        });
      }

      console.error('Join campaign error:', error);
      return res.status(500).json({
        error: 'InternalServerError',
        message: 'An error occurred while joining campaign',
      });
    }
  } else if (req.method === 'DELETE') {
    // Revoke invitation (GM only)
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

      // Revoke invitation using use case
      const campaignRules = new CampaignRules();
      const revokeInvitation = new RevokeInvitation(
        invitationRepo,
        campaignRepo,
        campaignRules
      );

      await revokeInvitation.execute({
        token,
        userId: user.id,
      });

      return res.status(204).end();
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json({
          error: 'NotFoundError',
          message: error.message,
        });
      }

      if (error instanceof PermissionError) {
        return res.status(403).json({
          error: 'PermissionError',
          message: error.message,
        });
      }

      console.error('Revoke invitation error:', error);
      return res.status(500).json({
        error: 'InternalServerError',
        message: 'An error occurred while revoking invitation',
      });
    }
  } else {
    return res.status(405).json({
      error: 'MethodNotAllowed',
      message: 'Method not allowed',
    });
  }
}
