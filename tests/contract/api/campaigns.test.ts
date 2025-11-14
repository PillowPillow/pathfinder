/**
 * T045-T047a [P] [US1] Contract tests for campaign endpoints
 * Tests POST /api/campaigns/create, POST /api/campaigns/invite,
 * GET /api/campaigns/[id], DELETE /api/campaigns/invite/:token
 */
import { createMocks } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from 'next';

describe('Campaign API Contracts', () => {
  let gmSessionCookie: string;
  let gmUserId: number;
  let campaignId: number;
  let invitationToken: string;

  beforeAll(async () => {
    // Register and login as GM
    const { req: regReq, res: regRes } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        email: 'gm@example.com',
        password: 'GMPassword123',
        displayName: 'Game Master',
      },
    });
    const registerHandler = (await import('../../../pages/api/auth/register')).default;
    await registerHandler(regReq, regRes);
    gmUserId = JSON.parse(regRes._getData()).id;

    const { req: loginReq, res: loginRes } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        email: 'gm@example.com',
        password: 'GMPassword123',
      },
    });
    const loginHandler = (await import('../../../pages/api/auth/login')).default;
    await loginHandler(loginReq, loginRes);
    const cookies = loginRes._getHeaders()['set-cookie'];
    gmSessionCookie = cookies[0].split(';')[0];
  });

  describe('POST /api/campaigns/create (T045)', () => {
    it('should create campaign with authenticated GM', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        headers: {
          cookie: gmSessionCookie,
        },
        body: {
          name: 'Rise of the Runelords',
          description: 'A classic Pathfinder adventure',
        },
      });

      const handler = (await import('../../../pages/api/campaigns/create')).default;
      await handler(req, res);

      expect(res._getStatusCode()).toBe(201);
      const data = JSON.parse(res._getData());
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('name', 'Rise of the Runelords');
      expect(data).toHaveProperty('description', 'A classic Pathfinder adventure');
      expect(data).toHaveProperty('gmUserId', gmUserId);
      expect(data).toHaveProperty('createdAt');

      // Save for later tests
      campaignId = data.id;
    });

    it('should reject campaign creation without authentication', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          name: 'Unauthorized Campaign',
        },
      });

      const handler = (await import('../../../pages/api/campaigns/create')).default;
      await handler(req, res);

      expect(res._getStatusCode()).toBe(401);
    });

    it('should reject campaign with name too short (<3 chars)', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        headers: {
          cookie: gmSessionCookie,
        },
        body: {
          name: 'AB',
        },
      });

      const handler = (await import('../../../pages/api/campaigns/create')).default;
      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data).toHaveProperty('error');
      expect(data.message).toContain('name');
    });

    it('should create campaign with optional description', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        headers: {
          cookie: gmSessionCookie,
        },
        body: {
          name: 'Campaign Without Description',
        },
      });

      const handler = (await import('../../../pages/api/campaigns/create')).default;
      await handler(req, res);

      expect(res._getStatusCode()).toBe(201);
      const data = JSON.parse(res._getData());
      expect(data).toHaveProperty('description', null);
    });
  });

  describe('POST /api/campaigns/invite (T046)', () => {
    it('should generate invitation token for GM', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        headers: {
          cookie: gmSessionCookie,
        },
        body: {
          campaignId,
        },
      });

      const handler = (await import('../../../pages/api/campaigns/invite')).default;
      await handler(req, res);

      expect(res._getStatusCode()).toBe(201);
      const data = JSON.parse(res._getData());
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('campaignId', campaignId);
      expect(data).toHaveProperty('token');
      expect(data.token).toMatch(/^[0-9a-f]{64}$/); // 64 hex chars
      expect(data).toHaveProperty('inviteUrl');
      expect(data.inviteUrl).toContain(data.token);
      expect(data).toHaveProperty('revoked', false);

      // Save for later tests
      invitationToken = data.token;
    });

    it('should reject invitation creation by non-GM', async () => {
      // Create another user (non-GM)
      const { req: regReq, res: regRes } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          email: 'player@example.com',
          password: 'PlayerPass123',
          displayName: 'Player',
        },
      });
      const registerHandler = (await import('../../../pages/api/auth/register')).default;
      await registerHandler(regReq, regRes);

      const { req: loginReq, res: loginRes } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          email: 'player@example.com',
          password: 'PlayerPass123',
        },
      });
      const loginHandler = (await import('../../../pages/api/auth/login')).default;
      await loginHandler(loginReq, loginRes);
      const playerCookie = loginRes._getHeaders()['set-cookie'][0].split(';')[0];

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        headers: {
          cookie: playerCookie,
        },
        body: {
          campaignId,
        },
      });

      const handler = (await import('../../../pages/api/campaigns/invite')).default;
      await handler(req, res);

      expect(res._getStatusCode()).toBe(403);
      const data = JSON.parse(res._getData());
      expect(data.message).toContain('Game Master');
    });

    it('should reject invitation for non-existent campaign', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        headers: {
          cookie: gmSessionCookie,
        },
        body: {
          campaignId: 99999,
        },
      });

      const handler = (await import('../../../pages/api/campaigns/invite')).default;
      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
    });
  });

  describe('GET /api/campaigns/[id] (T047)', () => {
    it('should return campaign details for GM', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        headers: {
          cookie: gmSessionCookie,
        },
        query: {
          id: campaignId.toString(),
        },
      });

      const handler = (await import('../../../pages/api/campaigns/[id]')).default;
      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data).toHaveProperty('id', campaignId);
      expect(data).toHaveProperty('name');
      expect(data).toHaveProperty('gmUserId', gmUserId);
      expect(data).toHaveProperty('gm');
      expect(data.gm).toHaveProperty('displayName', 'Game Master');
    });

    it('should return 401 for unauthenticated request', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        query: {
          id: campaignId.toString(),
        },
      });

      const handler = (await import('../../../pages/api/campaigns/[id]')).default;
      await handler(req, res);

      expect(res._getStatusCode()).toBe(401);
    });

    it('should return 404 for non-existent campaign', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        headers: {
          cookie: gmSessionCookie,
        },
        query: {
          id: '99999',
        },
      });

      const handler = (await import('../../../pages/api/campaigns/[id]')).default;
      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
    });
  });

  describe('DELETE /api/campaigns/invite/:token (T047a)', () => {
    it('should revoke invitation by GM', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'DELETE',
        headers: {
          cookie: gmSessionCookie,
        },
        query: {
          token: invitationToken,
        },
      });

      const handler = (await import('../../../pages/api/campaigns/invite/[token]')).default;
      await handler(req, res);

      expect(res._getStatusCode()).toBe(204);
    });

    it('should return 404 for non-existent invitation token', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'DELETE',
        headers: {
          cookie: gmSessionCookie,
        },
        query: {
          token: 'invalid_token_123',
        },
      });

      const handler = (await import('../../../pages/api/campaigns/invite/[token]')).default;
      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
    });

    it('should reject revocation by non-GM', async () => {
      // Create new invitation first
      const { req: inviteReq, res: inviteRes } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        headers: {
          cookie: gmSessionCookie,
        },
        body: {
          campaignId,
        },
      });
      const inviteHandler = (await import('../../../pages/api/campaigns/invite')).default;
      await inviteHandler(inviteReq, inviteRes);
      const newToken = JSON.parse(inviteRes._getData()).token;

      // Try to revoke as non-GM (using player cookie from earlier test)
      const { req: loginReq, res: loginRes } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          email: 'player@example.com',
          password: 'PlayerPass123',
        },
      });
      const loginHandler = (await import('../../../pages/api/auth/login')).default;
      await loginHandler(loginReq, loginRes);
      const playerCookie = loginRes._getHeaders()['set-cookie'][0].split(';')[0];

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'DELETE',
        headers: {
          cookie: playerCookie,
        },
        query: {
          token: newToken,
        },
      });

      const handler = (await import('../../../pages/api/campaigns/invite/[token]')).default;
      await handler(req, res);

      expect(res._getStatusCode()).toBe(403);
    });
  });
});
