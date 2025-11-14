import { db } from '../sqlite';
import { Character, CreateCharacterDTO, UpdateCharacterDTO } from '../../../domain/entities/Character';
import { AbilityScores } from '../../../domain/entities/AbilityScore';

export class CharacterRepository {
  async create(dto: CreateCharacterDTO): Promise<Character> {
    const stmt = db.prepare(`
      INSERT INTO characters (
        player_id, name, status, class, race,
        strength, dexterity, constitution, intelligence, wisdom, charisma,
        created_at, updated_at
      )
      VALUES (?, ?, 'living', ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);

    const result = stmt.run(
      dto.playerId,
      dto.name,
      dto.class || null,
      dto.race || null,
      dto.strength,
      dto.dexterity,
      dto.constitution,
      dto.intelligence,
      dto.wisdom,
      dto.charisma
    );

    return (await this.findById(Number(result.lastInsertRowid)))!;
  }

  async findById(id: number): Promise<Character | null> {
    const stmt = db.prepare(`
      SELECT * FROM characters WHERE id = ?
    `);

    const row = stmt.get(id) as any;
    if (!row) return null;

    return this.mapRowToCharacter(row);
  }

  async findByPlayerId(playerId: number): Promise<Character[]> {
    const stmt = db.prepare(`
      SELECT * FROM characters WHERE player_id = ? ORDER BY created_at DESC
    `);

    const rows = stmt.all(playerId) as any[];
    return rows.map(this.mapRowToCharacter);
  }

  async findLivingByPlayerId(playerId: number): Promise<Character[]> {
    const stmt = db.prepare(`
      SELECT * FROM characters WHERE player_id = ? AND status = 'living' ORDER BY created_at DESC
    `);

    const rows = stmt.all(playerId) as any[];
    return rows.map(this.mapRowToCharacter);
  }

  async update(id: number, updates: UpdateCharacterDTO): Promise<Character | null> {
    const fields: string[] = ['updated_at = CURRENT_TIMESTAMP'];
    const values: any[] = [];

    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }

    if (updates.level !== undefined) {
      fields.push('level = ?');
      values.push(updates.level);
    }

    if (updates.class !== undefined) {
      fields.push('class = ?');
      values.push(updates.class);
    }

    if (updates.race !== undefined) {
      fields.push('race = ?');
      values.push(updates.race);
    }

    // Ability scores
    ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'].forEach((ability) => {
      if ((updates as any)[ability] !== undefined) {
        fields.push(`${ability} = ?`);
        values.push((updates as any)[ability]);
      }
    });

    if (updates.hitPoints !== undefined) {
      fields.push('hit_points = ?');
      values.push(updates.hitPoints);
    }

    if (updates.armorClass !== undefined) {
      fields.push('armor_class = ?');
      values.push(updates.armorClass);
    }

    if (updates.skills !== undefined) {
      fields.push('skills = ?');
      values.push(JSON.stringify(updates.skills));
    }

    if (updates.feats !== undefined) {
      fields.push('feats = ?');
      values.push(JSON.stringify(updates.feats));
    }

    if (updates.equipment !== undefined) {
      fields.push('equipment = ?');
      values.push(JSON.stringify(updates.equipment));
    }

    if (updates.spells !== undefined) {
      fields.push('spells = ?');
      values.push(JSON.stringify(updates.spells));
    }

    if (updates.notes !== undefined) {
      fields.push('notes = ?');
      values.push(updates.notes);
    }

    values.push(id);

    const stmt = db.prepare(`
      UPDATE characters
      SET ${fields.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...values);

    return await this.findById(id);
  }

  async updateStatus(id: number, status: 'living' | 'deceased' | 'retired'): Promise<Character | null> {
    const stmt = db.prepare(`
      UPDATE characters
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(status, id);

    return await this.findById(id);
  }

  private mapRowToCharacter(row: any): Character {
    const abilityScores: AbilityScores = {
      strength: row.strength,
      dexterity: row.dexterity,
      constitution: row.constitution,
      intelligence: row.intelligence,
      wisdom: row.wisdom,
      charisma: row.charisma,
    };

    return {
      id: row.id,
      playerId: row.player_id,
      name: row.name,
      status: row.status,
      level: row.level || 1,
      class: row.class,
      race: row.race,
      abilityScores,
      hitPoints: row.hit_points,
      armorClass: row.armor_class,
      skills: row.skills ? JSON.parse(row.skills) : null,
      feats: row.feats ? JSON.parse(row.feats) : null,
      equipment: row.equipment ? JSON.parse(row.equipment) : null,
      spells: row.spells ? JSON.parse(row.spells) : null,
      notes: row.notes,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
