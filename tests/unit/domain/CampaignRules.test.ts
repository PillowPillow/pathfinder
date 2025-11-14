/**
 * T041 [P] [US1] Unit test for CampaignRules.validateGMPermission
 * Tests GM permission validation business rule
 */
import { CampaignRules } from '../../../src/domain/services/CampaignRules';
import { CampaignRepository } from '../../../src/infrastructure/database/repositories/CampaignRepository';

// Mock the repository
jest.mock('../../../src/infrastructure/database/repositories/CampaignRepository');

describe('CampaignRules', () => {
  let campaignRules: CampaignRules;
  let mockCampaignRepo: jest.Mocked<CampaignRepository>;

  beforeEach(() => {
    mockCampaignRepo = new CampaignRepository() as jest.Mocked<CampaignRepository>;
    campaignRules = new CampaignRules();
  });

  describe('validateGMPermission', () => {
    it('should allow GM to perform action', async () => {
      const campaignId = 1;
      const gmUserId = 10;

      mockCampaignRepo.findById.mockResolvedValue({
        id: campaignId,
        name: 'Test Campaign',
        description: null,
        gmUserId: gmUserId,
        createdAt: new Date(),
      });

      await expect(
        campaignRules.validateGMPermission(campaignId, gmUserId, mockCampaignRepo)
      ).resolves.not.toThrow();
    });

    it('should reject non-GM user', async () => {
      const campaignId = 1;
      const gmUserId = 10;
      const nonGmUserId = 20;

      mockCampaignRepo.findById.mockResolvedValue({
        id: campaignId,
        name: 'Test Campaign',
        description: null,
        gmUserId: gmUserId,
        createdAt: new Date(),
      });

      await expect(
        campaignRules.validateGMPermission(campaignId, nonGmUserId, mockCampaignRepo)
      ).rejects.toThrow('Only the Game Master can perform this action');
    });

    it('should reject if campaign does not exist', async () => {
      const campaignId = 999;
      const userId = 10;

      mockCampaignRepo.findById.mockResolvedValue(null);

      await expect(
        campaignRules.validateGMPermission(campaignId, userId, mockCampaignRepo)
      ).rejects.toThrow();
    });
  });
});
