/**
 * T050 [US1] CreateCampaign use case
 * Handles business logic for campaign creation
 */
import { CampaignRepository } from '../../infrastructure/database/repositories/CampaignRepository';
import { CreateCampaignDTO, CampaignResponseDTO, ValidationError } from '../dto';

export class CreateCampaign {
  constructor(private campaignRepo: CampaignRepository) {}

  async execute(dto: CreateCampaignDTO): Promise<CampaignResponseDTO> {
    // Validate input
    this.validateInput(dto);

    // Create campaign
    const campaign = await this.campaignRepo.create({
      name: dto.name,
      description: dto.description || null,
      gmUserId: dto.gmUserId,
    });

    return {
      id: campaign.id,
      name: campaign.name,
      description: campaign.description,
      gmUserId: campaign.gmUserId,
      createdAt: campaign.createdAt.toISOString(),
    };
  }

  private validateInput(dto: CreateCampaignDTO): void {
    if (!dto.name || dto.name.trim().length < 3) {
      throw new ValidationError('Campaign name must be at least 3 characters');
    }

    if (dto.name.length > 100) {
      throw new ValidationError('Campaign name must be at most 100 characters');
    }

    if (dto.description && dto.description.length > 500) {
      throw new ValidationError('Campaign description must be at most 500 characters');
    }

    if (!dto.gmUserId || dto.gmUserId <= 0) {
      throw new ValidationError('Valid GM user ID is required');
    }
  }
}
