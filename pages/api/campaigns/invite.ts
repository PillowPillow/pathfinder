/**
 * T058 [P] [US1] POST /api/campaigns/invite
 * Generates an invitation token for a campaign (GM only)
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { validateSession } from '../../../src/infrastructure/auth/session';
import { InvitationRepository } from '../../../src/infrastructure/database/repositories/InvitationRepository';
import { CampaignRepository } from '../../../src/infrastructure/database/repositories/CampaignRepository';
import { CampaignRules } from '../../../src/domain/services/CampaignRules';
import { GenerateInvitation } from '../../../src/application/useCases/GenerateInvitation';
import {
  InvitationResponseDTO,
  ErrorResponseDTO,
  ValidationError,
  PermissionError,
  NotFoundError,
} from '../../../src/application/dto';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<InvitationResponseDTO | ErrorResponseDTO>
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

    const { campaignId } = req.body;

    if (!campaignId) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Campaign ID is required',
      });
    }

    // Generate invitation using use case
    const invitationRepo = new InvitationRepository();
    const campaignRepo = new CampaignRepository();
    const campaignRules = new CampaignRules();

    const generateInvitation = new GenerateInvitation(
      invitationRepo,
      campaignRepo,
      campaignRules
    );

    const invitation = await generateInvitation.execute({
      campaignId: Number(campaignId),
      gmUserId: user.id,
    });

    return res.status(201).json(invitation);
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

    console.error('Invitation generation error:', error);
    return res.status(500).json({
      error: 'InternalServerError',
      message: 'An error occurred while generating invitation',
    });
  }
}
