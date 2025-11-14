/**
 * T063 [P] [US1] Campaign dashboard page
 * Shows campaign details, players, and invitation management (GM view)
 */
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '../../src/components/layout/Layout';
import { Button } from '../../src/components/common/Button';
import { InviteLink } from '../../src/components/campaign/InviteLink';
import { Breadcrumb, BreadcrumbItem } from '../../src/components/layout/Breadcrumb';

interface User {
  id: number;
  email: string;
  displayName: string;
  createdAt: string;
}

interface Player {
  id: number;
  userId: number;
  campaignId: number;
  user: User;
  joinedAt: string;
}

interface Campaign {
  id: number;
  name: string;
  description: string | null;
  gmUserId: number;
  createdAt: string;
  gm: User;
  players: Player[];
  characters: any[];
}

export default function CampaignDashboardPage() {
  const router = useRouter();
  const { id } = router.query;
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    if (id) {
      fetchCampaign();
    }
  }, [id]);

  const fetchCampaign = async () => {
    try {
      // Check auth first
      const authResponse = await fetch('/api/auth/session');
      if (!authResponse.ok) {
        router.push('/login');
        return;
      }
      const user = await authResponse.json();
      setCurrentUser(user);

      // Fetch campaign
      const response = await fetch(`/api/campaigns/${id}`);
      if (!response.ok) {
        router.push('/');
        return;
      }

      const data = await response.json();
      setCampaign(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch campaign:', error);
      router.push('/');
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-ink">Loading campaign...</p>
        </div>
      </Layout>
    );
  }

  if (!campaign) {
    return null;
  }

  const isGM = campaign.gmUserId === currentUser?.id;

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: campaign.name },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-parchment py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Breadcrumb items={breadcrumbs} />

          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-heading font-bold text-ink">
                  {campaign.name}
                </h1>
                {campaign.description && (
                  <p className="mt-2 text-ink-light">{campaign.description}</p>
                )}
                <p className="mt-1 text-sm text-ink-light">
                  GM: {campaign.gm.displayName}
                  {isGM && ' (You)'}
                </p>
              </div>
            </div>
          </div>

          {isGM && (
            <div className="mb-8">
              <h2 className="text-xl font-heading font-bold text-ink mb-4">
                Invite Players
              </h2>
              <InviteLink campaignId={campaign.id} />
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-xl font-heading font-bold text-ink mb-4">
              Party Members ({campaign.players.length})
            </h2>
            {campaign.players.length === 0 ? (
              <p className="text-ink-light">
                {isGM
                  ? 'No players have joined yet. Share the invitation link above.'
                  : 'No other players in this campaign yet.'}
              </p>
            ) : (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-parchment-dark">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-ink-dark uppercase tracking-wider">
                        Player
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-ink-dark uppercase tracking-wider">
                        Joined
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {campaign.players.map((player) => (
                      <tr key={player.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-ink">
                            {player.user.displayName}
                          </div>
                          <div className="text-sm text-ink-light">
                            {player.user.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-ink-light">
                          {new Date(player.joinedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-xl font-heading font-bold text-ink mb-4">
              Characters
            </h2>
            <p className="text-ink-light">
              Character management will be available in the next phase.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
