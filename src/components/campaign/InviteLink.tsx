/**
 * T066 + T066a [P] [US1] InviteLink component
 * Displays and manages campaign invitation links (with revocation)
 */
import React, { useState, useEffect } from 'react';
import { Button } from '../common/Button';

export interface InviteLinkProps {
  campaignId: number;
}

interface Invitation {
  id: number;
  campaignId: number;
  token: string;
  inviteUrl: string;
  createdAt: string;
  revoked: boolean;
}

export const InviteLink: React.FC<InviteLinkProps> = ({ campaignId }) => {
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const generateInvitation = async () => {
    setIsGenerating(true);
    setError('');

    try {
      const response = await fetch('/api/campaigns/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ campaignId }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || 'Failed to generate invitation');
        setIsGenerating(false);
        return;
      }

      const data = await response.json();
      setInvitation(data);
      setIsGenerating(false);
    } catch (error) {
      setError('An unexpected error occurred');
      setIsGenerating(false);
    }
  };

  const revokeInvitation = async () => {
    if (!invitation) return;

    setIsRevoking(true);
    setError('');

    try {
      const response = await fetch(`/api/campaigns/invite/${invitation.token}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || 'Failed to revoke invitation');
        setIsRevoking(false);
        return;
      }

      setInvitation(null);
      setIsRevoking(false);
    } catch (error) {
      setError('An unexpected error occurred');
      setIsRevoking(false);
    }
  };

  const copyToClipboard = async () => {
    if (!invitation) return;

    try {
      await navigator.clipboard.writeText(invitation.inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  if (!invitation) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-ink-light mb-4">
          Generate an invitation link to invite players to your campaign.
        </p>
        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 p-4 mb-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
        <Button
          variant="primary"
          onClick={generateInvitation}
          disabled={isGenerating}
        >
          {isGenerating ? 'Generating...' : 'Generate Invitation Link'}
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-heading font-semibold text-ink mb-3">
        Invitation Link
      </h3>
      <p className="text-sm text-ink-light mb-4">
        Share this link with players to invite them to your campaign.
      </p>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-4 mb-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="flex items-center space-x-2 mb-4">
        <input
          type="text"
          value={invitation.inviteUrl}
          readOnly
          className="flex-1 px-3 py-2 border border-ink-light rounded-md bg-parchment-light font-mono text-sm"
        />
        <Button
          variant="secondary"
          onClick={copyToClipboard}
        >
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-ink-light">
          Created {new Date(invitation.createdAt).toLocaleDateString()}
        </p>
        <Button
          variant="danger"
          onClick={revokeInvitation}
          disabled={isRevoking}
        >
          {isRevoking ? 'Revoking...' : 'Revoke Link'}
        </Button>
      </div>
    </div>
  );
};
