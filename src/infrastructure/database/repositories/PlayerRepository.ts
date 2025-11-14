import { db } from '../sqlite';
import { Player, CreatePlayerDTO } from '../../../domain/entities/Player';

export class PlayerRepository {
  async create(dto: CreatePlayerDTO): Promise<Player> {
    const stmt = db.prepare(`
      INSERT INTO players (user_id, campaign_id)
      VALUES (?, ?)
    `);

    const result = stmt.run(dto.userId, dto.campaignId);

    return (await this.findById(Number(result.lastInsertRowid)))!;
  }

  async findById(id: number): Promise<Player | null> {
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

  async findByUserAndCampaign(userId: number, campaignId: number): Promise<Player | null> {
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

  async findByCampaign(campaignId: number): Promise<Player[]> {
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
