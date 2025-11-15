/**
 * T042-T044 [P] [US1] Contract tests for authentication endpoints
 * Tests POST /api/auth/register, POST /api/auth/login, GET /api/auth/session
 */
import { createMocks } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from 'next';
import { extractSessionToken } from '../../helpers/cookies';

describe('Authentication API Contracts', () => {
  describe('POST /api/auth/register (T042)', () => {
    it('should register new user with valid data', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          email: 'newuser@example.com',
          password: 'SecurePass123',
          displayName: 'Test User',
        },
      });

      // Import handler dynamically to avoid import errors before implementation
      const handler = (await import('../../../pages/api/auth/register')).default;
      await handler(req, res);

      expect(res._getStatusCode()).toBe(201);
      const data = JSON.parse(res._getData());
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('email', 'newuser@example.com');
      expect(data).toHaveProperty('displayName', 'Test User');
      expect(data).not.toHaveProperty('passwordHash');
    });

    it('should reject registration with invalid email', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          email: 'invalid-email',
          password: 'SecurePass123',
          displayName: 'Test User',
        },
      });

      const handler = (await import('../../../pages/api/auth/register')).default;
      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data).toHaveProperty('error');
      expect(data.message).toContain('email');
    });

    it('should reject registration with short password (<8 chars)', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          email: 'user@example.com',
          password: 'Pass12',
          displayName: 'Test User',
        },
      });

      const handler = (await import('../../../pages/api/auth/register')).default;
      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data).toHaveProperty('error');
      expect(data.message.toLowerCase()).toContain('password');
    });

    it('should reject duplicate email', async () => {
      const email = 'duplicate@example.com';
      const userData = {
        email,
        password: 'SecurePass123',
        displayName: 'First User',
      };

      // First registration
      const { req: req1, res: res1 } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: userData,
      });
      const handler = (await import('../../../pages/api/auth/register')).default;
      await handler(req1, res1);
      expect(res1._getStatusCode()).toBe(201);

      // Duplicate registration
      const { req: req2, res: res2 } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: { ...userData, displayName: 'Second User' },
      });
      await handler(req2, res2);

      expect(res2._getStatusCode()).toBe(409);
      const data = JSON.parse(res2._getData());
      expect(data).toHaveProperty('error');
      expect(data.message).toContain('already registered');
    });
  });

  describe('POST /api/auth/login (T043)', () => {
    beforeAll(async () => {
      // Create a test user
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          email: 'logintest@example.com',
          password: 'TestPass123',
          displayName: 'Login Test User',
        },
      });
      const registerHandler = (await import('../../../pages/api/auth/register')).default;
      await registerHandler(req, res);
    });

    it('should login with valid credentials', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          email: 'logintest@example.com',
          password: 'TestPass123',
        },
      });

      const handler = (await import('../../../pages/api/auth/login')).default;
      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('email', 'logintest@example.com');

      // Check session cookie is set
      const cookies = res._getHeaders()['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies.toString()).toContain('session=');
      expect(cookies.toString()).toContain('HttpOnly');
    });

    it('should reject login with wrong password', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          email: 'logintest@example.com',
          password: 'WrongPassword',
        },
      });

      const handler = (await import('../../../pages/api/auth/login')).default;
      await handler(req, res);

      expect(res._getStatusCode()).toBe(401);
      const data = JSON.parse(res._getData());
      expect(data).toHaveProperty('error');
      expect(data.message).toContain('Invalid');
    });

    it('should reject login with non-existent email', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          email: 'nonexistent@example.com',
          password: 'AnyPassword123',
        },
      });

      const handler = (await import('../../../pages/api/auth/login')).default;
      await handler(req, res);

      expect(res._getStatusCode()).toBe(401);
      const data = JSON.parse(res._getData());
      expect(data).toHaveProperty('error');
    });
  });

  describe('GET /api/auth/session (T044)', () => {
    let sessionToken: string;

    beforeAll(async () => {
      // Login to get session
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          email: 'logintest@example.com',
          password: 'TestPass123',
        },
      });
      const loginHandler = (await import('../../../pages/api/auth/login')).default;
      await loginHandler(req, res);

      const cookies = res._getHeaders()['set-cookie'];
      sessionToken = extractSessionToken(cookies);
    });

    it('should return current user with valid session', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        cookies: {
          session: sessionToken!,
        },
      });

      const handler = (await import('../../../pages/api/auth/session')).default;
      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('email', 'logintest@example.com');
    });

    it('should return 401 without session cookie', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
      });

      const handler = (await import('../../../pages/api/auth/session')).default;
      await handler(req, res);

      expect(res._getStatusCode()).toBe(401);
      const data = JSON.parse(res._getData());
      expect(data).toHaveProperty('error');
    });

    it('should return 401 with invalid session token', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        headers: {
          cookie: 'session=invalid_token_12345',
        },
      });

      const handler = (await import('../../../pages/api/auth/session')).default;
      await handler(req, res);

      expect(res._getStatusCode()).toBe(401);
    });
  });
});
