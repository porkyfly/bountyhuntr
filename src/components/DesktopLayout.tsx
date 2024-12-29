'use client'

import { Bounty, Answer } from "@prisma/client";
import BountyList from "./BountyList";
import BountySidebar from "./BountySidebar";

interface DesktopLayoutProps {
  bounties: Bounty[];
  selectedBounty: (Bounty & { answers: Answer[] }) | null;
  onBountyClick: (bountyId: string) => void;
  onBountyHover: (bountyId: string | null) => void;
  onBountyClose: () => void;
  onAnswerSubmit: () => void;
  onAnswerAdd: (answer: Answer) => void;
}

export default function DesktopLayout({
  bounties,
  selectedBounty,
  onBountyClick,
  onBountyHover,
  onBountyClose,
  onAnswerSubmit,
  onAnswerAdd,
}: DesktopLayoutProps) {
  return (
    <div className="absolute inset-0 grid grid-cols-[auto_1fr_auto]">
      {/* Left Sidebar - BountySidebar */}
      <div className="z-10 pointer-events-auto h-screen overflow-y-auto">
        <BountySidebar
          bounty={selectedBounty}
          onClose={onBountyClose}
          onAnswerSubmit={onAnswerSubmit}
          onAnswerAdd={onAnswerAdd}
          isMobile={false}
        />
      </div>

      {/* Map Area - Allow clicks to pass through */}
      <div className="z-0" />

      {/* Right Sidebar - BountyList */}
      <div className="z-10 pointer-events-auto h-screen overflow-y-auto">
        <BountyList
          bounties={bounties}
          onBountyClick={onBountyClick}
          onBountyHover={onBountyHover}
          className="h-full"
          isMobile={false}
        />
      </div>
    </div>
  );
} 