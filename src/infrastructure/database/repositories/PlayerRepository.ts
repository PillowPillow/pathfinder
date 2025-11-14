import db from '../sqlite';
import { Player, CreatePlayerDTO } from '@/domain/entities/Player';

export class PlayerRepository {
  static create(dto: CreatePlayerDTO): Player {
    const stmt = db.prepare(`
      INSERT INTO players (user_id, campaign_id)
      VALUES (?, ?)
    `);

    const result = stmt.run(dto.userId, dto.campaignId);

    return this.findById(Number(result.lastInsertRowid))!;
  }

  static findById(id: number): Player | null {
    const stmt = db.prepare(`
      SELECT id, user_id as userId, campaign_id as campaignId, joined_at as joinedAt
      FROM players
      WHERE id = ?
    `);

    const row = stmt.get(id) as any;
    if (!row) return null;

    return {
      ...row,
      joinedAt: new Date(row.joinedAt),
    };
  }

  static findByUserAndCampaign(userId: number, campaignId: number): Player | null {
    const stmt = db.prepare(`
      SELECT id, user_id as userId, campaign_id as campaignId, joined_at as joinedAt
      FROM players
      WHERE user_id = ? AND campaign_id = ?
    `);

    const row = stmt.get(userId, campaignId) as any;
    if (!row) return null;

    return {
      ...row,
      joinedAt: new Date(row.joinedAt),
    };
  }

  static findByCampaign(campaignId: number): Player[] {
    const stmt = db.prepare(`
      SELECT id, user_id as userId, campaign_id as campaignId, joined_at as joinedAt
      FROM players
      WHERE campaign_id = ?
      ORDER BY joined_at ASC
    `);

    const rows = stmt.all(campaignId) as any[];

    return rows.map((row) => ({
      ...row,
      joinedAt: new Date(row.joinedAt),
    }));
  }
}
