import { db } from '../sqlite';
import { Campaign, CreateCampaignDTO } from '../../../domain/entities/Campaign';

export class CampaignRepository {
  async create(dto: CreateCampaignDTO): Promise<Campaign> {
    const stmt = db.prepare(`
      INSERT INTO campaigns (name, description, gm_user_id)
      VALUES (?, ?, ?)
    `);

    const result = stmt.run(dto.name, dto.description || null, dto.gmUserId);

    return (await this.findById(Number(result.lastInsertRowid)))!;
  }

  async findById(id: number): Promise<Campaign | null> {
    const stmt = db.prepare(`
      SELECT id, name, description, gm_user_id as gmUserId, created_at as createdAt
      FROM campaigns
      WHERE id = ?
    `);

    const row = stmt.get(id) as any;
    if (!row) return null;

    return {
      ...row,
      createdAt: new Date(row.createdAt),
    };
  }

  async findByGM(gmUserId: number): Promise<Campaign[]> {
    const stmt = db.prepare(`
      SELECT id, name, description, gm_user_id as gmUserId, created_at as createdAt
      FROM campaigns
      WHERE gm_user_id = ?
      ORDER BY created_at DESC
    `);

    const rows = stmt.all(gmUserId) as any[];

    return rows.map((row) => ({
      ...row,
      createdAt: new Date(row.createdAt),
    }));
  }

  async update(id: number, updates: Partial<Pick<Campaign, 'name' | 'description'>>): Promise<Campaign | null> {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }

    if (updates.description !== undefined) {
      fields.push('description = ?');
      values.push(updates.description);
    }

    if (fields.length === 0) {
      return await this.findById(id);
    }

    values.push(id);

    const stmt = db.prepare(`
      UPDATE campaigns
      SET ${fields.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...values);

    return await this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const stmt = db.prepare('DELETE FROM campaigns WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
}
