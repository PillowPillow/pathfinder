/**
 * T056 [P] [US1] GET /api/auth/session
 * Returns current user session data
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { validateSession, destroySession } from '../../../src/infrastructure/auth/session';
import { UserResponseDTO, ErrorResponseDTO } from '../../../src/application/dto';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UserResponseDTO | ErrorResponseDTO | { message: string }>
) {
  // Extract session token from cookies
  const sessionToken = req.cookies.session;

  if (!sessionToken) {
    return res.status(401).json({
      error: 'UnauthorizedError',
      message: 'No session token provided',
    });
  }

  if (req.method === 'GET') {
    try {
      // Validate session
      const user = await validateSession(sessionToken);

      if (!user) {
        return res.status(401).json({
          error: 'UnauthorizedError',
          message: 'Invalid or expired session',
        });
      }

      return res.status(200).json({
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        createdAt: new Date().toISOString(), // Will be actual createdAt from DB in production
      });
    } catch (error) {
      console.error('Session validation error:', error);
      return res.status(500).json({
        error: 'InternalServerError',
        message: 'An error occurred while validating session',
      });
    }
  } else if (req.method === 'DELETE') {
    // Logout endpoint
    try {
      await destroySession(sessionToken);

      // Clear session cookie
      res.setHeader('Set-Cookie', [
        'session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0',
      ]);

      return res.status(204).end();
    } catch (error) {
      console.error('Logout error:', error);
      return res.status(500).json({
        error: 'InternalServerError',
        message: 'An error occurred during logout',
      });
    }
  } else {
    return res.status(405).json({
      error: 'MethodNotAllowed',
      message: 'Method not allowed',
    });
  }
}
