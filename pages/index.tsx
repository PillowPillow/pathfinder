/**
 * T062 [P] [US1] Home/landing page
 * Main dashboard showing user's campaigns
 */
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '../src/components/layout/Layout';
import { Button } from '../src/components/common/Button';
import { CampaignCard } from '../src/components/campaign/CampaignCard';

interface User {
  id: number;
  email: string;
  displayName: string;
}

interface Campaign {
  id: number;
  name: string;
  description: string | null;
  gmUserId: number;
  createdAt: string;
}

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState('');
  const [newCampaignDesc, setNewCampaignDesc] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/session');

      if (!response.ok) {
        router.push('/login');
        return;
      }

      const userData = await response.json();
      setUser(userData);
      // TODO: Fetch user's campaigns
      setIsLoading(false);
    } catch (error) {
      router.push('/login');
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/campaigns/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newCampaignName,
          description: newCampaignDesc || undefined,
        }),
      });

      if (response.ok) {
        const campaign = await response.json();
        setCampaigns([...campaigns, campaign]);
        setShowCreateForm(false);
        setNewCampaignName('');
        setNewCampaignDesc('');
        // Navigate to campaign page
        router.push(`/campaigns/${campaign.id}`);
      }
    } catch (error) {
      console.error('Failed to create campaign:', error);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-ink">Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-parchment py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-heading font-bold text-ink">
              Welcome, {user?.displayName}
            </h1>
            <p className="mt-2 text-ink-light">
              Manage your Pathfinder campaigns and characters
            </p>
          </div>

          <div className="mb-6">
            <Button
              variant="primary"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              {showCreateForm ? 'Cancel' : '+ Create New Campaign'}
            </Button>
          </div>

          {showCreateForm && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-heading font-bold text-ink mb-4">
                Create New Campaign
              </h2>
              <form onSubmit={handleCreateCampaign} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">
                    Campaign Name *
                  </label>
                  <input
                    type="text"
                    value={newCampaignName}
                    onChange={(e) => setNewCampaignName(e.target.value)}
                    required
                    minLength={3}
                    maxLength={100}
                    className="w-full px-3 py-2 border border-ink-light rounded-md"
                    placeholder="e.g., Rise of the Runelords"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">
                    Description (optional)
                  </label>
                  <textarea
                    value={newCampaignDesc}
                    onChange={(e) => setNewCampaignDesc(e.target.value)}
                    maxLength={500}
                    rows={3}
                    className="w-full px-3 py-2 border border-ink-light rounded-md"
                    placeholder="Describe your campaign..."
                  />
                </div>
                <Button type="submit" variant="primary">
                  Create Campaign
                </Button>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-ink-light">
                  No campaigns yet. Create one to get started!
                </p>
              </div>
            ) : (
              campaigns.map((campaign) => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  isGM={campaign.gmUserId === user?.id}
                  onClick={() => router.push(`/campaigns/${campaign.id}`)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
