/**
 * Global test setup
 * Initializes test database before running integration tests
 */
import path from 'path';
import fs from 'fs';
import Database from 'better-sqlite3';

export default async function globalSetup() {
  // Create test database directory
  const testDbPath = path.join(process.cwd(), 'database', 'pathfinder.db');
  const dbDir = path.dirname(testDbPath);

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  // Remove existing test database
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }

  // Create new test database
  const db = new Database(testDbPath);
  db.pragma('foreign_keys = ON');

  // Run migrations
  const migrationsDir = path.join(__dirname, '../../src/infrastructure/database/migrations');
  const migrationFiles = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  for (const file of migrationFiles) {
    const migration = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
    console.log(`Running migration: ${file}`);
    db.exec(migration);
  }

  db.close();
}
