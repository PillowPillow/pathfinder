import crypto from 'crypto';
import { db } from '../database/sqlite';
import { UserRepository } from '../database/repositories/UserRepository';

const SESSION_DURATION_DAYS = 30;

export interface Session {
  userId: number;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

/**
 * Generate a cryptographically secure random session token
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex'); // 64 hex characters
}

/**
 * Create a new session for a user
 */
export async function createSession(userId: number): Promise<Session> {
  const token = generateSessionToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);

  const stmt = db.prepare(`
    INSERT INTO sessions (user_id, token, expires_at)
    VALUES (?, ?, ?)
  `);

  stmt.run(userId, token, expiresAt.toISOString());

  return {
    userId,
    token,
    expiresAt,
    createdAt: new Date(),
  };
}

/**
 * Validate a session token and return the user
 */
export async function validateSession(token: string): Promise<{ id: number; email: string; displayName: string } | null> {
  const stmt = db.prepare(`
    SELECT s.user_id, s.expires_at, u.email, u.display_name
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.token = ? AND s.expires_at > datetime('now')
  `);

  const row = stmt.get(token) as { user_id: number; expires_at: string; email: string; display_name: string } | undefined;

  if (!row) {
    return null;
  }

  return {
    id: row.user_id,
    email: row.email,
    displayName: row.display_name,
  };
}

/**
 * Get user ID from session token (backward compatibility)
 */
export async function getUserFromSession(token: string): Promise<number | null> {
  const user = await validateSession(token);
  return user ? user.id : null;
}

/**
 * Destroy a session
 */
export async function destroySession(token: string): Promise<void> {
  const stmt = db.prepare('DELETE FROM sessions WHERE token = ?');
  stmt.run(token);
}

/**
 * Clean up expired sessions
 */
export function cleanupExpiredSessions(): void {
  const stmt = db.prepare("DELETE FROM sessions WHERE expires_at < datetime('now')");
  stmt.run();
}

// Run cleanup every hour
setInterval(cleanupExpiredSessions, 60 * 60 * 1000);
