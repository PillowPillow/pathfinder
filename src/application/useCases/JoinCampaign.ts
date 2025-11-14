/**
 * T052 [US1] JoinCampaign use case
 * Handles business logic for players joining campaigns via invitation token
 */
import { PlayerRepository } from '../../infrastructure/database/repositories/PlayerRepository';
import { InvitationRepository } from '../../infrastructure/database/repositories/InvitationRepository';
import { CampaignRepository } from '../../infrastructure/database/repositories/CampaignRepository';
import { UserRepository } from '../../infrastructure/database/repositories/UserRepository';
import { JoinCampaignDTO, PlayerResponseDTO, NotFoundError, ConflictError } from '../dto';

export class JoinCampaign {
  constructor(
    private playerRepo: PlayerRepository,
    private invitationRepo: InvitationRepository,
    private campaignRepo: CampaignRepository,
    private userRepo: UserRepository
  ) {}

  async execute(dto: JoinCampaignDTO): Promise<PlayerResponseDTO> {
    // Validate invitation token
    const invitation = await this.invitationRepo.findByToken(dto.invitationToken);

    if (!invitation || invitation.revoked) {
      throw new NotFoundError('Invalid or revoked invitation');
    }

    // Check if user already joined this campaign
    const existingPlayer = await this.playerRepo.findByUserAndCampaign(
      dto.userId,
      invitation.campaignId
    );

    if (existingPlayer) {
      throw new ConflictError('You have already joined this campaign');
    }

    // Create player record
    const player = await this.playerRepo.create({
      userId: dto.userId,
      campaignId: invitation.campaignId,
    });

    // Fetch user details for response
    const user = await this.userRepo.findById(dto.userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return {
      id: player.id,
      userId: player.userId,
      campaignId: player.campaignId,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        createdAt: user.createdAt.toISOString(),
      },
      joinedAt: player.joinedAt.toISOString(),
    };
  }
}
