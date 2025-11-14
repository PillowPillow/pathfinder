/**
 * T051 [US1] GenerateInvitation use case
 * Handles business logic for generating campaign invitation tokens
 */
import crypto from 'crypto';
import { InvitationRepository } from '../../infrastructure/database/repositories/InvitationRepository';
import { CampaignRepository } from '../../infrastructure/database/repositories/CampaignRepository';
import { CampaignRules } from '../../domain/services/CampaignRules';
import { GenerateInvitationDTO, InvitationResponseDTO, NotFoundError } from '../dto';

export class GenerateInvitation {
  constructor(
    private invitationRepo: InvitationRepository,
    private campaignRepo: CampaignRepository,
    private campaignRules: CampaignRules
  ) {}

  async execute(dto: GenerateInvitationDTO): Promise<InvitationResponseDTO> {
    // Verify campaign exists
    const campaign = await this.campaignRepo.findById(dto.campaignId);
    if (!campaign) {
      throw new NotFoundError('Campaign not found');
    }

    // Verify user is GM
    await this.campaignRules.validateGMPermission(
      dto.campaignId,
      dto.gmUserId,
      this.campaignRepo
    );

    // Generate cryptographically secure token
    const token = crypto.randomBytes(32).toString('hex'); // 64 characters

    // Create invitation
    const invitation = await this.invitationRepo.create({
      campaignId: dto.campaignId,
      token,
    });

    // Build invite URL (use environment variable in production)
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const inviteUrl = `${baseUrl}/campaigns/invite/${token}`;

    return {
      id: invitation.id,
      campaignId: invitation.campaignId,
      token: invitation.token,
      inviteUrl,
      createdAt: invitation.createdAt.toISOString(),
      revoked: invitation.revoked,
    };
  }
}
