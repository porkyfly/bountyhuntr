'use client'

import { useState, useEffect } from 'react';
import { Bounty } from '@prisma/client';
import { getRemainingTime } from '@/utils/time';

interface BountyListProps {
  bounties: Bounty[];
  onBountyClick: (bountyId: string) => void;
  onBountyHover: (bountyId: string | null) => void;
  className?: string;
  isMobile?: boolean;
  onMinimizedChange?: (isMinimized: boolean) => void;
}

export default function BountyList({
  bounties,
  onBountyClick,
  onBountyHover,
  className = '',
  isMobile = false,
  onMinimizedChange,
}: BountyListProps) {
  const [isMinimized, setIsMinimized] = useState(!isMobile);

  useEffect(() => {
    onMinimizedChange?.(isMinimized);
  }, [isMinimized, onMinimizedChange]);

  const handleBountyClick = (bountyId: string) => {
    if (isMobile) setIsMinimized(true);
    setTimeout(() => onBountyClick(bountyId), 100);
  };

  const renderBountyItem = (bounty: Bounty) => {
    const remainingTime = getRemainingTime(bounty.expiryMinutes, bounty.createdAt);
    const timeStatusClasses = remainingTime === 'Expired' 
      ? 'bg-red-100 text-red-800'
      : 'bg-yellow-100 text-yellow-800';

    return (
      <div
        key={bounty.id}
        onClick={() => handleBountyClick(bounty.id)}
        onMouseEnter={() => onBountyHover(bounty.id)}
        onMouseLeave={() => onBountyHover(null)}
        className={`p-${isMobile ? '3' : '4'} border border-gray-200 rounded-lg cursor-pointer 
          hover:bg-green-50 hover:border-green-200 
          ${isMobile ? 'active:bg-green-100' : ''} transition-all duration-200`}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-medium truncate text-gray-800 flex-1 mr-4">
            {bounty.question}
          </h3>
          <span className="text-primary font-semibold whitespace-nowrap">
            ${bounty.reward}
          </span>
          {remainingTime && (
            <span className={`text-sm font-medium px-2 py-1 rounded-full ${timeStatusClasses}`}>
              {remainingTime}
            </span>
          )}
        </div>
      </div>
    );
  };

  const renderBountyList = () => (
    <div className="space-y-3">
      {bounties.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No bounties in this area</p>
      ) : (
        bounties.map(renderBountyItem)
      )}
    </div>
  );

  if (isMobile) {
    return (
      <div className={`
        fixed bottom-0 left-0 right-0 
        transition-transform duration-300 ease-in-out
        ${isMinimized ? 'translate-y-[calc(100%-40px)]' : 'translate-y-0'}
      `}>
        <div className="bg-white rounded-t-xl shadow-lg">
          <div
            className="h-10 flex items-center justify-center cursor-pointer"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            <div className="w-12 h-1 bg-gray-300 rounded-full" />
          </div>

          <div className="max-h-[40vh]">
            <div className="px-4 py-2 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">Bounties in View</h2>
                <span className="text-sm text-gray-500">
                  {bounties.length} {bounties.length === 1 ? 'bounty' : 'bounties'}
                </span>
              </div>
            </div>

            <div className="overflow-y-auto p-4" style={{ maxHeight: 'calc(40vh - 56px)' }}>
              {renderBountyList()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white shadow-lg">
      <div className="h-full flex">
        <button
          className="w-10 border-r hover:bg-gray-100 flex items-center justify-center"
          onClick={() => setIsMinimized(!isMinimized)}
        >
          <svg
            className={`w-4 h-4 transform transition-transform ${!isMinimized && 'rotate-180'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <div className={`transition-all duration-300 overflow-hidden ${
          isMinimized ? 'w-0' : 'w-[390px]'
        }`}>
          <div className="p-4 h-full overflow-y-auto min-w-[390px]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Bounties in View</h2>
              <span className="text-sm text-gray-500">
                {bounties.length} {bounties.length === 1 ? 'bounty' : 'bounties'}
              </span>
            </div>
            {renderBountyList()}
          </div>
        </div>
      </div>
    </div>
  );
}