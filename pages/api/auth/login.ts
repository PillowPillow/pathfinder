/**
 * T055 [P] [US1] POST /api/auth/login
 * Handles user authentication with email and password
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { UserRepository } from '../../../src/infrastructure/database/repositories/UserRepository';
import { verifyPassword } from '../../../src/infrastructure/auth/hash';
import { createSession } from '../../../src/infrastructure/auth/session';
import { UserResponseDTO, ErrorResponseDTO } from '../../../src/application/dto';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UserResponseDTO | ErrorResponseDTO>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'MethodNotAllowed', message: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Email and password are required',
      });
    }

    const normalizedEmail = email.toLowerCase();
    const userRepo = new UserRepository();

    // Find user by email
    const user = await userRepo.findByEmail(normalizedEmail);
    if (!user) {
      return res.status(401).json({
        error: 'UnauthorizedError',
        message: 'Invalid email or password',
      });
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({
        error: 'UnauthorizedError',
        message: 'Invalid email or password',
      });
    }

    // Create session
    const session = await createSession(user.id);

    // Set session cookie
    res.setHeader('Set-Cookie', [
      `session=${session.token}; Path=/; HttpOnly; SameSite=Strict${
        process.env.NODE_ENV === 'production' ? '; Secure' : ''
      }; Max-Age=${30 * 24 * 60 * 60}`, // 30 days
    ]);

    return res.status(200).json({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      createdAt: user.createdAt.toISOString(),
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      error: 'InternalServerError',
      message: 'An error occurred during login',
    });
  }
}
