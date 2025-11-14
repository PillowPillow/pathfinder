export interface Player {
  id: number;
  userId: number;
  campaignId: number;
  joinedAt: Date;
}

export interface CreatePlayerDTO {
  userId: number;
  campaignId: number;
}
