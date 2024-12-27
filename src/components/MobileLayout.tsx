'use client'

import { Bounty, Answer } from "@prisma/client";
import BountyList from "./BountyList";
import BountySidebar from "./BountySidebar";

interface MobileLayoutProps {
  bounties: Bounty[];
  selectedBounty: (Bounty & { answers: Answer[] }) | null;
  onBountyClick: (bountyId: string) => void;
  onBountyHover: (bountyId: string | null) => void;
  onBountyClose: () => void;
  onAnswerSubmit: () => void;
  onAnswerAdd: (answer: Answer) => void;
}

export default function MobileLayout({
  bounties,
  selectedBounty,
  onBountyClick,
  onBountyHover,
  onBountyClose,
  onAnswerSubmit,
  onAnswerAdd,
}: MobileLayoutProps) {
  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-auto">
        <BountyList
          bounties={bounties}
          onBountyClick={onBountyClick}
          onBountyHover={onBountyHover}
          className="w-full"
          isMobile={true}
        />
      </div>

      {selectedBounty && (
        <div className="fixed inset-0 z-50">
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={onBountyClose}
          />
          <div className="absolute inset-x-0 bottom-0 top-20 pointer-events-auto">
            <BountySidebar
              bounty={selectedBounty}
              onClose={onBountyClose}
              onAnswerSubmit={onAnswerSubmit}
              onAnswerAdd={onAnswerAdd}
              isMobile={true}
            />
          </div>
        </div>
      )}
    </>
  );
} 