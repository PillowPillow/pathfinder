import db from '../sqlite';
import { Invitation, CreateInvitationDTO } from '@/domain/entities/Invitation';

export class InvitationRepository {
  static create(dto: CreateInvitationDTO): Invitation {
    const stmt = db.prepare(`
      INSERT INTO invitations (token, campaign_id)
      VALUES (?, ?)
    `);

    const result = stmt.run(dto.token, dto.campaignId);

    return this.findById(Number(result.lastInsertRowid))!;
  }

  static findByToken(token: string): Invitation | null {
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
    };
  }

  static findById(id: number): Invitation | null {
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
    };
  }

  static revoke(token: string): boolean {
    const stmt = db.prepare(`
      UPDATE invitations
      SET revoked_at = CURRENT_TIMESTAMP
      WHERE token = ?
    `);

    const result = stmt.run(token);
    return result.changes > 0;
  }

  static isValid(token: string): boolean {
    const invitation = this.findByToken(token);
    return invitation !== null && invitation.revokedAt === null;
  }
}
