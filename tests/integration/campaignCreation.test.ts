/**
 * T048 [P] [US1] Integration test for campaign creation workflow
 * Tests end-to-end workflow: register → login → create campaign
 */
import { createMocks } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from 'next';

describe('Campaign Creation Workflow Integration', () => {
  it('should complete full campaign creation workflow', async () => {
    // Step 1: Register new user
    const { req: regReq, res: regRes } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        email: 'workflow-gm@example.com',
        password: 'WorkflowPass123',
        displayName: 'Workflow GM',
      },
    });
    const registerHandler = (await import('../../pages/api/auth/register')).default;
    await registerHandler(regReq, regRes);

    expect(regRes._getStatusCode()).toBe(201);
    const userData = JSON.parse(regRes._getData());
    expect(userData).toHaveProperty('id');
    expect(userData.email).toBe('workflow-gm@example.com');

    // Step 2: Login
    const { req: loginReq, res: loginRes } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        email: 'workflow-gm@example.com',
        password: 'WorkflowPass123',
      },
    });
    const loginHandler = (await import('../../pages/api/auth/login')).default;
    await loginHandler(loginReq, loginRes);

    expect(loginRes._getStatusCode()).toBe(200);
    const cookies = loginRes._getHeaders()['set-cookie'];
    expect(cookies).toBeDefined();
    const sessionCookie = cookies[0].split(';')[0];

    // Step 3: Verify session
    const { req: sessionReq, res: sessionRes } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
      headers: {
        cookie: sessionCookie,
      },
    });
    const sessionHandler = (await import('../../pages/api/auth/session')).default;
    await sessionHandler(sessionReq, sessionRes);

    expect(sessionRes._getStatusCode()).toBe(200);
    const sessionData = JSON.parse(sessionRes._getData());
    expect(sessionData.id).toBe(userData.id);

    // Step 4: Create campaign
    const { req: campaignReq, res: campaignRes } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      headers: {
        cookie: sessionCookie,
      },
      body: {
        name: 'Integration Test Campaign',
        description: 'Created via integration test',
      },
    });
    const createCampaignHandler = (await import('../../pages/api/campaigns/create')).default;
    await createCampaignHandler(campaignReq, campaignRes);

    expect(campaignRes._getStatusCode()).toBe(201);
    const campaignData = JSON.parse(campaignRes._getData());
    expect(campaignData).toHaveProperty('id');
    expect(campaignData.name).toBe('Integration Test Campaign');
    expect(campaignData.gmUserId).toBe(userData.id);

    // Step 5: Retrieve campaign details
    const { req: getReq, res: getRes } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
      headers: {
        cookie: sessionCookie,
      },
      query: {
        id: campaignData.id.toString(),
      },
    });
    const getCampaignHandler = (await import('../../pages/api/campaigns/[id]')).default;
    await getCampaignHandler(getReq, getRes);

    expect(getRes._getStatusCode()).toBe(200);
    const retrievedCampaign = JSON.parse(getRes._getData());
    expect(retrievedCampaign.id).toBe(campaignData.id);
    expect(retrievedCampaign.gm).toHaveProperty('displayName', 'Workflow GM');
  });

  it('should handle campaign creation errors gracefully', async () => {
    // Login as existing user
    const { req: loginReq, res: loginRes } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        email: 'workflow-gm@example.com',
        password: 'WorkflowPass123',
      },
    });
    const loginHandler = (await import('../../pages/api/auth/login')).default;
    await loginHandler(loginReq, loginRes);
    const sessionCookie = loginRes._getHeaders()['set-cookie'][0].split(';')[0];

    // Try to create campaign with invalid name
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      headers: {
        cookie: sessionCookie,
      },
      body: {
        name: 'AB', // Too short
      },
    });
    const handler = (await import('../../pages/api/campaigns/create')).default;
    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const error = JSON.parse(res._getData());
    expect(error).toHaveProperty('error');
    expect(error.message).toContain('name');
  });
});
