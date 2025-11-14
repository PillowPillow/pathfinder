/**
 * T049 [P] [US1] Integration test for player invitation workflow
 * Tests end-to-end workflow: GM creates campaign → generates invite → player joins
 */
import { createMocks } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from 'next';

describe('Player Invitation Workflow Integration', () => {
  let gmSessionCookie: string;
  let playerSessionCookie: string;
  let campaignId: number;
  let invitationToken: string;

  beforeAll(async () => {
    // Setup: Create GM user and campaign
    const { req: gmRegReq, res: gmRegRes } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        email: 'invite-gm@example.com',
        password: 'GMPass123',
        displayName: 'Invite GM',
      },
    });
    const registerHandler = (await import('../../pages/api/auth/register')).default;
    await registerHandler(gmRegReq, gmRegRes);

    const { req: gmLoginReq, res: gmLoginRes } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        email: 'invite-gm@example.com',
        password: 'GMPass123',
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
        name: 'Invitation Test Campaign',
        description: 'Testing player invitations',
      },
    });
    const createCampaignHandler = (await import('../../pages/api/campaigns/create')).default;
    await createCampaignHandler(campaignReq, campaignRes);
    campaignId = JSON.parse(campaignRes._getData()).id;

    // Setup: Create player user
    const { req: playerRegReq, res: playerRegRes } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        email: 'invite-player@example.com',
        password: 'PlayerPass123',
        displayName: 'Invited Player',
      },
    });
    await registerHandler(playerRegReq, playerRegRes);

    const { req: playerLoginReq, res: playerLoginRes } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        email: 'invite-player@example.com',
        password: 'PlayerPass123',
      },
    });
    await loginHandler(playerLoginReq, playerLoginRes);
    playerSessionCookie = playerLoginRes._getHeaders()['set-cookie'][0].split(';')[0];
  });

  it('should complete full player invitation workflow', async () => {
    // Step 1: GM generates invitation
    const { req: inviteReq, res: inviteRes } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      headers: {
        cookie: gmSessionCookie,
      },
      body: {
        campaignId,
      },
    });
    const generateInviteHandler = (await import('../../pages/api/campaigns/invite')).default;
    await generateInviteHandler(inviteReq, inviteRes);

    expect(inviteRes._getStatusCode()).toBe(201);
    const inviteData = JSON.parse(inviteRes._getData());
    expect(inviteData).toHaveProperty('token');
    expect(inviteData.token).toMatch(/^[0-9a-f]{64}$/);
    expect(inviteData).toHaveProperty('inviteUrl');
    expect(inviteData.campaignId).toBe(campaignId);
    invitationToken = inviteData.token;

    // Step 2: Player views invitation (public endpoint)
    const { req: viewReq, res: viewRes } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
      query: {
        token: invitationToken,
      },
    });
    const viewInviteHandler = (await import('../../pages/api/campaigns/invite/[token]')).default;
    await viewInviteHandler(viewReq, viewRes);

    expect(viewRes._getStatusCode()).toBe(200);
    const viewData = JSON.parse(viewRes._getData());
    expect(viewData).toHaveProperty('campaignId', campaignId);
    expect(viewData).toHaveProperty('campaignName', 'Invitation Test Campaign');
    expect(viewData).toHaveProperty('gmName');

    // Step 3: Player joins campaign using token
    const { req: joinReq, res: joinRes } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      headers: {
        cookie: playerSessionCookie,
      },
      query: {
        token: invitationToken,
      },
    });
    const joinHandler = (await import('../../pages/api/campaigns/invite/[token]')).default;
    await joinHandler(joinReq, joinRes);

    expect(joinRes._getStatusCode()).toBe(201);
    const playerData = JSON.parse(joinRes._getData());
    expect(playerData).toHaveProperty('id');
    expect(playerData).toHaveProperty('campaignId', campaignId);
    expect(playerData).toHaveProperty('userId');

    // Step 4: Verify player is in campaign
    const { req: getCampaignReq, res: getCampaignRes } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
      headers: {
        cookie: playerSessionCookie,
      },
      query: {
        id: campaignId.toString(),
      },
    });
    const getCampaignHandler = (await import('../../pages/api/campaigns/[id]')).default;
    await getCampaignHandler(getCampaignReq, getCampaignRes);

    expect(getCampaignRes._getStatusCode()).toBe(200);
    const campaignData = JSON.parse(getCampaignRes._getData());
    expect(campaignData.players).toBeDefined();
    expect(campaignData.players.length).toBeGreaterThan(0);
    expect(campaignData.players[0].user.email).toBe('invite-player@example.com');
  });

  it('should reject joining with revoked invitation', async () => {
    // Step 1: GM generates new invitation
    const { req: inviteReq, res: inviteRes } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      headers: {
        cookie: gmSessionCookie,
      },
      body: {
        campaignId,
      },
    });
    const generateInviteHandler = (await import('../../pages/api/campaigns/invite')).default;
    await generateInviteHandler(inviteReq, inviteRes);
    const newToken = JSON.parse(inviteRes._getData()).token;

    // Step 2: GM revokes invitation
    const { req: revokeReq, res: revokeRes } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'DELETE',
      headers: {
        cookie: gmSessionCookie,
      },
      query: {
        token: newToken,
      },
    });
    const revokeHandler = (await import('../../pages/api/campaigns/invite/[token]')).default;
    await revokeHandler(revokeReq, revokeRes);
    expect(revokeRes._getStatusCode()).toBe(204);

    // Step 3: Player tries to join with revoked token
    const { req: joinReq, res: joinRes } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      headers: {
        cookie: playerSessionCookie,
      },
      query: {
        token: newToken,
      },
    });
    const joinHandler = (await import('../../pages/api/campaigns/invite/[token]')).default;
    await joinHandler(joinReq, joinRes);

    expect(joinRes._getStatusCode()).toBe(404);
    const error = JSON.parse(joinRes._getData());
    expect(error.message).toContain('Invalid or revoked');
  });

  it('should reject duplicate join attempts', async () => {
    // Player tries to join the same campaign again
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      headers: {
        cookie: playerSessionCookie,
      },
      query: {
        token: invitationToken,
      },
    });
    const handler = (await import('../../pages/api/campaigns/invite/[token]')).default;
    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const error = JSON.parse(res._getData());
    expect(error.message).toContain('already joined');
  });
});
