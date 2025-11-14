import { db } from '../sqlite';
import { User, CreateUserDTO } from '../../../domain/entities/User';

export class UserRepository {
  async create(dto: CreateUserDTO & { passwordHash: string }): Promise<User> {
    const stmt = db.prepare(`
      INSERT INTO users (email, password_hash, display_name)
      VALUES (?, ?, ?)
    `);

    const result = stmt.run(dto.email.toLowerCase(), dto.passwordHash, dto.displayName);

    return this.findById(Number(result.lastInsertRowid))!;
  }

  async findById(id: number): Promise<User | null> {
    const stmt = db.prepare(`
      SELECT id, email, password_hash as passwordHash, display_name as displayName, created_at as createdAt
      FROM users
      WHERE id = ?
    `);

    const row = stmt.get(id) as any;
    if (!row) return null;

    return {
      ...row,
      createdAt: new Date(row.createdAt),
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    const stmt = db.prepare(`
      SELECT id, email, password_hash as passwordHash, display_name as displayName, created_at as createdAt
      FROM users
      WHERE email = ?
    `);

    const row = stmt.get(email.toLowerCase()) as any;
    if (!row) return null;

    return {
      ...row,
      createdAt: new Date(row.createdAt),
    };
  }

  async update(id: number, updates: Partial<Pick<User, 'displayName' | 'passwordHash'>>): Promise<User | null> {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.displayName !== undefined) {
      fields.push('display_name = ?');
      values.push(updates.displayName);
    }

    if (updates.passwordHash !== undefined) {
      fields.push('password_hash = ?');
      values.push(updates.passwordHash);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);

    const stmt = db.prepare(`
      UPDATE users
      SET ${fields.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...values);

    return this.findById(id);
  }
}
