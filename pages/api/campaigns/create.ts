/**
 * T057 [P] [US1] POST /api/campaigns/create
 * Creates a new campaign with the authenticated user as GM
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { validateSession } from '../../../src/infrastructure/auth/session';
import { CampaignRepository } from '../../../src/infrastructure/database/repositories/CampaignRepository';
import { CreateCampaign } from '../../../src/application/useCases/CreateCampaign';
import { CampaignResponseDTO, ErrorResponseDTO, ValidationError } from '../../../src/application/dto';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CampaignResponseDTO | ErrorResponseDTO>
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

    const { name, description } = req.body;

    // Create campaign using use case
    const campaignRepo = new CampaignRepository();
    const createCampaign = new CreateCampaign(campaignRepo);

    const campaign = await createCampaign.execute({
      name,
      description,
      gmUserId: user.id,
    });

    return res.status(201).json(campaign);
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        error: 'ValidationError',
        message: error.message,
      });
    }

    console.error('Campaign creation error:', error);
    return res.status(500).json({
      error: 'InternalServerError',
      message: 'An error occurred while creating campaign',
    });
  }
}
