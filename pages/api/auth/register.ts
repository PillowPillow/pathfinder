/**
 * T054 [P] [US1] POST /api/auth/register
 * Handles user registration with email validation and password requirements
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { UserRepository } from '../../../src/infrastructure/database/repositories/UserRepository';
import { hashPassword } from '../../../src/infrastructure/auth/hash';
import { createSession } from '../../../src/infrastructure/auth/session';
import { ValidationError, UserResponseDTO, ErrorResponseDTO } from '../../../src/application/dto';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UserResponseDTO | ErrorResponseDTO>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'MethodNotAllowed', message: 'Method not allowed' });
  }

  try {
    const { email, password, displayName } = req.body;

    // Validate input
    if (!email || !password || !displayName) {
      throw new ValidationError('Email, password, and display name are required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError('Invalid email format');
    }

    // Validate password length (min 8 chars)
    if (password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters');
    }

    // Validate display name
    if (displayName.length < 2 || displayName.length > 50) {
      throw new ValidationError('Display name must be between 2 and 50 characters');
    }

    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase();

    const userRepo = new UserRepository();

    // Check if email already exists
    const existingUser = await userRepo.findByEmail(normalizedEmail);
    if (existingUser) {
      return res.status(409).json({
        error: 'ConflictError',
        message: 'Email is already registered',
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await userRepo.create({
      email: normalizedEmail,
      passwordHash,
      displayName,
    });

    // Create session
    const session = await createSession(user.id);

    // Set session cookie (HTTP-only, secure in production)
    res.setHeader('Set-Cookie', [
      `session=${session.token}; Path=/; HttpOnly; SameSite=Strict${
        process.env.NODE_ENV === 'production' ? '; Secure' : ''
      }; Max-Age=${30 * 24 * 60 * 60}`, // 30 days
    ]);

    return res.status(201).json({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      createdAt: user.createdAt.toISOString(),
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        error: 'ValidationError',
        message: error.message,
      });
    }

    console.error('Registration error:', error);
    return res.status(500).json({
      error: 'InternalServerError',
      message: 'An error occurred during registration',
    });
  }
}
