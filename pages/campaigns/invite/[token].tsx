/**
 * T064 [P] [US1] Invitation landing page
 * Public page for viewing and accepting campaign invitations
 */
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '../../../src/components/layout/Layout';
import { Button } from '../../../src/components/common/Button';

interface InvitationInfo {
  campaignId: number;
  campaignName: string;
  gmName: string;
  token: string;
}

export default function InvitationPage() {
  const router = useRouter();
  const { token } = router.query;
  const [invitation, setInvitation] = useState<InvitationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) {
      checkInvitation();
      checkAuth();
    }
  }, [token]);

  const checkInvitation = async () => {
    try {
      const response = await fetch(`/api/campaigns/invite/${token}`);

      if (!response.ok) {
        setError('This invitation is invalid or has been revoked.');
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      setInvitation(data);
      setIsLoading(false);
    } catch (error) {
      setError('Failed to load invitation details.');
      setIsLoading(false);
    }
  };

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/session');
      setIsAuthenticated(response.ok);
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  const handleJoin = async () => {
    if (!isAuthenticated) {
      // Redirect to login with return URL
      router.push(`/login?redirect=/campaigns/invite/${token}`);
      return;
    }

    setIsJoining(true);
    setError('');

    try {
      const response = await fetch(`/api/campaigns/invite/${token}`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || 'Failed to join campaign');
        setIsJoining(false);
        return;
      }

      const player = await response.json();
      // Redirect to campaign page
      router.push(`/campaigns/${invitation!.campaignId}`);
    } catch (error) {
      setError('An unexpected error occurred');
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-ink">Loading invitation...</p>
        </div>
      </Layout>
    );
  }

  if (error && !invitation) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-parchment py-12 px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-heading font-bold text-ink mb-4">
              Invalid Invitation
            </h2>
            <p className="text-ink-light mb-6">{error}</p>
            <Button variant="primary" onClick={() => router.push('/')}>
              Go to Home
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-parchment py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-heading font-bold text-ink mb-2">
            You're Invited!
          </h2>
          <p className="text-ink-light mb-6">
            {invitation?.gmName} has invited you to join their Pathfinder campaign
          </p>

          <div className="bg-parchment rounded-lg p-4 mb-6">
            <h3 className="text-xl font-heading font-semibold text-ink mb-1">
              {invitation?.campaignName}
            </h3>
            <p className="text-sm text-ink-light">
              Game Master: {invitation?.gmName}
            </p>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 p-4 mb-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            <Button
              variant="primary"
              fullWidth
              onClick={handleJoin}
              disabled={isJoining}
            >
              {isJoining
                ? 'Joining...'
                : isAuthenticated
                ? 'Join Campaign'
                : 'Sign In to Join'}
            </Button>

            {!isAuthenticated && (
              <p className="text-sm text-center text-ink-light">
                Don't have an account?{' '}
                <a
                  href={`/register?redirect=/campaigns/invite/${token}`}
                  className="font-medium text-leather hover:text-leather-dark"
                >
                  Create one
                </a>
              </p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
