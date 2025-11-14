export interface Invitation {
  id: number;
  token: string;
  campaignId: number;
  createdAt: Date;
  revokedAt: Date | null;
}

export interface CreateInvitationDTO {
  token: string;
  campaignId: number;
}
