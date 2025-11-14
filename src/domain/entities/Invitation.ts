export interface Invitation {
  id: number;
  token: string;
  campaignId: number;
  createdAt: Date;
  revokedAt: Date | null;
  revoked: boolean; // Computed: revokedAt !== null
}

export interface CreateInvitationDTO {
  token: string;
  campaignId: number;
}
