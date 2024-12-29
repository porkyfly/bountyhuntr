'use client'

import { Bounty } from "@prisma/client";
import { useState } from "react";
import { getRemainingTime } from "@/utils/time";

interface BountyListProps {
  bounties: Bounty[];
  onBountyClick: (bountyId: string) => void;
  onBountyHover: (bountyId: string | null) => void;
  className?: string;
  isMobile?: boolean;
}

export default function BountyList({
  bounties,
  onBountyClick,
  onBountyHover,
  className = "",
  isMobile = false
}: BountyListProps) {
  const [highlightedBountyId, setHighlightedBountyId] = useState<string | null>(null);

  const handleBountyClick = (bountyId: string) => {
    if (isMobile) {
      if (highlightedBountyId === bountyId) {
        // If already highlighted, open the bounty
        onBountyClick(bountyId);
        setHighlightedBountyId(null);
      } else {
        // Just highlight the bounty
        setHighlightedBountyId(bountyId);
        onBountyHover(bountyId);
      }
    } else {
      // Desktop behavior remains unchanged
      onBountyClick(bountyId);
    }
  };

  return (
    <div className={`bg-white shadow-lg ${className}`}>
      <div className="p-4 space-y-2 max-h-[50vh] overflow-y-auto">
        <h2 className="text-lg font-semibold text-gray-900">Nearby Bounties</h2>
        {bounties.length === 0 ? (
          <p className="text-gray-500">No bounties in this area</p>
        ) : (
          bounties.map((bounty) => {
            const remainingTime = getRemainingTime(bounty.expiryMinutes, bounty.createdAt);
            const isHighlighted = bounty.id === highlightedBountyId;

            return (
              <div
                key={bounty.id}
                onClick={() => handleBountyClick(bounty.id)}
                onMouseEnter={() => !isMobile && onBountyHover(bounty.id)}
                onMouseLeave={() => !isMobile && onBountyHover(null)}
                className={`
                  p-3 border rounded-lg cursor-pointer transition-all
                  ${isHighlighted 
                    ? 'bg-blue-50 border-blue-300 shadow-md' 
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                  }
                `}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{bounty.question}</p>
                    <span className="text-green-600 font-semibold">${bounty.reward}</span>
                  </div>
                  {remainingTime && (
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      remainingTime === 'Expired' 
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {remainingTime}
                    </span>
                  )}
                </div>
                {isMobile && isHighlighted && (
                  <p className="mt-2 text-sm text-blue-600">
                    Tap again to view details
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}