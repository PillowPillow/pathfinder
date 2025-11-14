/**
 * T065 [P] [US1] CampaignCard component
 * Displays campaign information in a card format
 */
import React from 'react';

export interface CampaignCardProps {
  campaign: {
    id: number;
    name: string;
    description: string | null;
    gmUserId: number;
    createdAt: string;
  };
  isGM: boolean;
  onClick?: () => void;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({
  campaign,
  isGM,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer p-6 border-2 border-parchment-dark"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-xl font-heading font-bold text-ink">
          {campaign.name}
        </h3>
        {isGM && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gold text-ink">
            GM
          </span>
        )}
      </div>

      {campaign.description && (
        <p className="text-sm text-ink-light mb-4 line-clamp-2">
          {campaign.description}
        </p>
      )}

      <div className="flex items-center justify-between text-xs text-ink-light">
        <span>Created {new Date(campaign.createdAt).toLocaleDateString()}</span>
        <span className="text-leather hover:text-leather-dark font-medium">
          View Details →
        </span>
      </div>
    </div>
  );
};
