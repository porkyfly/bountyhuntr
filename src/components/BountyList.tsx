'use client'

import { Bounty } from '@prisma/client';

interface BountyListProps {
  bounties: Bounty[];
  onBountyClick: (bountyId: string) => void;
  className?: string;
}

export default function BountyList({ bounties, onBountyClick, className = '' }: BountyListProps) {
  return (
    <div className={`bg-white shadow-lg rounded-xl p-6 overflow-y-auto ${className}`}>
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Bounties in View</h2>
      <div className="space-y-3">
        {bounties.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No bounties in this area</p>
        ) : (
          bounties.map((bounty) => (
            <div
              key={bounty.id}
              onClick={() => onBountyClick(bounty.id)}
              className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-colors duration-200"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium truncate text-gray-800 flex-1 mr-4">{bounty.question}</h3>
                <span className="text-green-600 font-semibold whitespace-nowrap">${bounty.reward}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 