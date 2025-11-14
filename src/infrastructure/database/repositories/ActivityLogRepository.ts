import db from '../sqlite';
import { ActivityLog, CreateActivityLogDTO } from '@/domain/entities/ActivityLog';

export class ActivityLogRepository {
  static create(dto: CreateActivityLogDTO): ActivityLog {
    const stmt = db.prepare(`
      INSERT INTO activity_logs (character_id, user_id, field_name, old_value, new_value)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      dto.characterId,
      dto.userId,
      dto.fieldName,
      dto.oldValue,
      dto.newValue
    );

    return this.findById(Number(result.lastInsertRowid))!;
  }

  static findById(id: number): ActivityLog | null {
    const stmt = db.prepare(`
      SELECT id, character_id as characterId, user_id as userId,
             field_name as fieldName, old_value as oldValue,
             new_value as newValue, changed_at as changedAt
      FROM activity_logs
      WHERE id = ?
    `);

    const row = stmt.get(id) as any;
    if (!row) return null;

    return {
      ...row,
      changedAt: new Date(row.changedAt),
    };
  }

  static findByCharacter(characterId: number, limit: number = 50): ActivityLog[] {
    const stmt = db.prepare(`
      SELECT id, character_id as characterId, user_id as userId,
             field_name as fieldName, old_value as oldValue,
             new_value as newValue, changed_at as changedAt
      FROM activity_logs
      WHERE character_id = ?
      ORDER BY changed_at DESC
      LIMIT ?
    `);

    const rows = stmt.all(characterId, limit) as any[];

    return rows.map((row) => ({
      ...row,
      changedAt: new Date(row.changedAt),
    }));
  }
}
