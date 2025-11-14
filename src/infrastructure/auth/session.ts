import { v4 as uuidv4 } from 'uuid';

// Simple in-memory session store for MVP
// In production, use Redis or database-backed sessions
const sessions = new Map<string, { userId: number; createdAt: Date }>();

const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Create a new session for a user
 */
export function createSession(userId: number): string {
  const token = uuidv4();
  sessions.set(token, {
    userId,
    createdAt: new Date(),
  });
  return token;
}

/**
 * Get user ID from session token
 */
export function getUserFromSession(token: string): number | null {
  const session = sessions.get(token);

  if (!session) {
    return null;
  }

  // Check if session is expired
  const age = Date.now() - session.createdAt.getTime();
  if (age > SESSION_DURATION) {
    sessions.delete(token);
    return null;
  }

  return session.userId;
}

/**
 * Destroy a session
 */
export function destroySession(token: string): void {
  sessions.delete(token);
}

/**
 * Clean up expired sessions
 */
export function cleanupExpiredSessions(): void {
  const now = Date.now();
  for (const [token, session] of sessions.entries()) {
    const age = now - session.createdAt.getTime();
    if (age > SESSION_DURATION) {
      sessions.delete(token);
    }
  }
}

// Run cleanup every hour
setInterval(cleanupExpiredSessions, 60 * 60 * 1000);
