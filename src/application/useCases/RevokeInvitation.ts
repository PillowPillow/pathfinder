/**
 * T052a [US1] RevokeInvitation use case
 * Handles business logic for GMs revoking campaign invitations
 */
import { InvitationRepository } from '../../infrastructure/database/repositories/InvitationRepository';
import { CampaignRepository } from '../../infrastructure/database/repositories/CampaignRepository';
import { CampaignRules } from '../../domain/services/CampaignRules';
import { NotFoundError } from '../dto';

export interface RevokeInvitationDTO {
  token: string;
  userId: number;
}

export class RevokeInvitation {
  constructor(
    private invitationRepo: InvitationRepository,
    private campaignRepo: CampaignRepository,
    private campaignRules: CampaignRules
  ) {}

  async execute(dto: RevokeInvitationDTO): Promise<void> {
    // Find invitation by token
    const invitation = await this.invitationRepo.findByToken(dto.token);

    if (!invitation) {
      throw new NotFoundError('Invitation not found');
    }

    // Verify user is GM of the campaign
    await this.campaignRules.validateGMPermission(
      invitation.campaignId,
      dto.userId,
      this.campaignRepo
    );

    // Revoke invitation
    await this.invitationRepo.revoke(dto.token);
  }
}
