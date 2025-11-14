/**
 * T049a [P] [US1] Integration test for invitation revocation workflow
 * Tests GM's ability to revoke invitations and prevent usage
 */
import { createMocks } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from 'next';

describe('Invitation Revocation Workflow Integration', () => {
  let gmSessionCookie: string;
  let playerSessionCookie: string;
  let campaignId: number;

  beforeAll(async () => {
    // Setup: Create GM and campaign
    const { req: gmRegReq, res: gmRegRes } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        email: 'revoke-gm@example.com',
        password: 'RevokeGM123',
        displayName: 'Revoke GM',
      },
    });
    const registerHandler = (await import('../../pages/api/auth/register')).default;
    await registerHandler(gmRegReq, gmRegRes);

    const { req: gmLoginReq, res: gmLoginRes } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        email: 'revoke-gm@example.com',
        password: 'RevokeGM123',
      },
    });
    const loginHandler = (await import('../../pages/api/auth/login')).default;
    await loginHandler(gmLoginReq, gmLoginRes);
    gmSessionCookie = gmLoginRes._getHeaders()['set-cookie'][0].split(';')[0];

    const { req: campaignReq, res: campaignRes } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      headers: {
        cookie: gmSessionCookie,
      },
      body: {
        name: 'Revocation Test Campaign',
      },
    });
    const createCampaignHandler = (await import('../../pages/api/campaigns/create')).default;
    await createCampaignHandler(campaignReq, campaignRes);
    campaignId = JSON.parse(campaignRes._getData()).id;

    // Setup: Create player
    const { req: playerRegReq, res: playerRegRes } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        email: 'revoke-player@example.com',
        password: 'PlayerPass123',
        displayName: 'Test Player',
      },
    });
    await registerHandler(playerRegReq, playerRegRes);

    const { req: playerLoginReq, res: playerLoginRes } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        email: 'revoke-player@example.com',
        password: 'PlayerPass123',
      },
    });
    await loginHandler(playerLoginReq, playerLoginRes);
    playerSessionCookie = playerLoginRes._getHeaders()['set-cookie'][0].split(';')[0];
  });

  it('should prevent usage of revoked invitation', async () => {
    // Step 1: GM creates invitation
    const { req: inviteReq, res: inviteRes } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      headers: {
        cookie: gmSessionCookie,
      },
      body: {
        campaignId,
      },
    });
    const inviteHandler = (await import('../../pages/api/campaigns/invite')).default;
    await inviteHandler(inviteReq, inviteRes);

    const inviteData = JSON.parse(inviteRes._getData());
    const token = inviteData.token;

    // Step 2: Verify invitation is valid
    const { req: viewReq1, res: viewRes1 } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
      query: {
        token,
      },
    });
    const viewHandler = (await import('../../pages/api/campaigns/invite/[token]')).default;
    await viewHandler(viewReq1, viewRes1);
    expect(viewRes1._getStatusCode()).toBe(200);

    // Step 3: GM revokes invitation
    const { req: revokeReq, res: revokeRes } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'DELETE',
      headers: {
        cookie: gmSessionCookie,
      },
      query: {
        token,
      },
    });
    const revokeHandler = (await import('../../pages/api/campaigns/invite/[token]')).default;
    await revokeHandler(revokeReq, revokeRes);
    expect(revokeRes._getStatusCode()).toBe(204);

    // Step 4: Verify invitation is now invalid for viewing
    const { req: viewReq2, res: viewRes2 } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
      query: {
        token,
      },
    });
    await viewHandler(viewReq2, viewRes2);
    expect(viewRes2._getStatusCode()).toBe(404);

    // Step 5: Verify player cannot join with revoked token
    const { req: joinReq, res: joinRes } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      headers: {
        cookie: playerSessionCookie,
      },
      query: {
        token,
      },
    });
    const joinHandler = (await import('../../pages/api/campaigns/invite/[token]')).default;
    await joinHandler(joinReq, joinRes);
    expect(joinRes._getStatusCode()).toBe(404);
  });

  it('should allow GM to revoke multiple invitations', async () => {
    // Create 3 invitations
    const tokens: string[] = [];
    const inviteHandler = (await import('../../pages/api/campaigns/invite')).default;

    for (let i = 0; i < 3; i++) {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        headers: {
          cookie: gmSessionCookie,
        },
        body: {
          campaignId,
        },
      });
      await inviteHandler(req, res);
      const token = JSON.parse(res._getData()).token;
      tokens.push(token);
    }

    // Revoke all 3
    const revokeHandler = (await import('../../pages/api/campaigns/invite/[token]')).default;

    for (const token of tokens) {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'DELETE',
        headers: {
          cookie: gmSessionCookie,
        },
        query: {
          token,
        },
      });
      await revokeHandler(req, res);
      expect(res._getStatusCode()).toBe(204);
    }

    // Verify all are revoked
    const viewHandler = (await import('../../pages/api/campaigns/invite/[token]')).default;

    for (const token of tokens) {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        query: {
          token,
        },
      });
      await viewHandler(req, res);
      expect(res._getStatusCode()).toBe(404);
    }
  });

  it('should not allow non-GM to revoke invitations', async () => {
    // Create invitation
    const { req: inviteReq, res: inviteRes } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      headers: {
        cookie: gmSessionCookie,
      },
      body: {
        campaignId,
      },
    });
    const inviteHandler = (await import('../../pages/api/campaigns/invite')).default;
    await inviteHandler(inviteReq, inviteRes);
    const token = JSON.parse(inviteRes._getData()).token;

    // Try to revoke as player
    const { req: revokeReq, res: revokeRes } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'DELETE',
      headers: {
        cookie: playerSessionCookie,
      },
      query: {
        token,
      },
    });
    const revokeHandler = (await import('../../pages/api/campaigns/invite/[token]')).default;
    await revokeHandler(revokeReq, revokeRes);

    expect(revokeRes._getStatusCode()).toBe(403);
    const error = JSON.parse(revokeRes._getData());
    expect(error.message).toContain('Game Master');

    // Verify invitation is still valid
    const { req: viewReq, res: viewRes } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
      query: {
        token,
      },
    });
    const viewHandler = (await import('../../pages/api/campaigns/invite/[token]')).default;
    await viewHandler(viewReq, viewRes);
    expect(viewRes._getStatusCode()).toBe(200);
  });
});
