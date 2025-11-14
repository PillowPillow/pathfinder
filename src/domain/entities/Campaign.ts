export interface Campaign {
  id: number;
  name: string;
  description: string | null;
  gmUserId: number;
  createdAt: Date;
}

export interface CreateCampaignDTO {
  name: string;
  description?: string;
  gmUserId: number;
}
