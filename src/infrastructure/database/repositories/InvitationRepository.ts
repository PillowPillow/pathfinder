import { db } from '../sqlite';
import { Invitation, CreateInvitationDTO } from '../../../domain/entities/Invitation';

export class InvitationRepository {
  async create(dto: CreateInvitationDTO): Promise<Invitation> {
    const stmt = db.prepare(`
      INSERT INTO invitations (token, campaign_id)
      VALUES (?, ?)
    `);

    const result = stmt.run(dto.token, dto.campaignId);

    return this.findById(Number(result.lastInsertRowid))!;
  }

  async findByToken(token: string): Promise<Invitation | null> {
    const stmt = db.prepare(`
      SELECT id, token, campaign_id as campaignId, created_at as createdAt, revoked_at as revokedAt
      FROM invitations
      WHERE token = ?
    `);

    const row = stmt.get(token) as any;
    if (!row) return null;

    return {
      ...row,
      createdAt: new Date(row.createdAt),
      revokedAt: row.revokedAt ? new Date(row.revokedAt) : null,
      revoked: row.revokedAt !== null,
    };
  }

  async findById(id: number): Promise<Invitation | null> {
    const stmt = db.prepare(`
      SELECT id, token, campaign_id as campaignId, created_at as createdAt, revoked_at as revokedAt
      FROM invitations
      WHERE id = ?
    `);

    const row = stmt.get(id) as any;
    if (!row) return null;

    return {
      ...row,
      createdAt: new Date(row.createdAt),
      revokedAt: row.revokedAt ? new Date(row.revokedAt) : null,
      revoked: row.revokedAt !== null,
    };
  }

  async revoke(token: string): Promise<boolean> {
    const stmt = db.prepare(`
      UPDATE invitations
      SET revoked_at = CURRENT_TIMESTAMP
      WHERE token = ?
    `);

    const result = stmt.run(token);
    return result.changes > 0;
  }

  async isValid(token: string): Promise<boolean> {
    const invitation = await this.findByToken(token);
    return invitation !== null && invitation.revokedAt === null;
  }
}
