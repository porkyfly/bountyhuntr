'use client'

import { useState } from 'react';

interface BountyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { question: string; reward: number; expiryMinutes?: number }) => void;
}

export default function BountyModal({ isOpen, onClose, onSubmit }: BountyModalProps) {
  const [question, setQuestion] = useState('');
  const [reward, setReward] = useState('0');
  const [expiryMinutes, setExpiryMinutes] = useState('30');

  if (!isOpen) return null;

  const handleSubmit = () => {
    const rewardNumber = Number(reward);
    const minutes = Number(expiryMinutes);
    if (question.trim() && !isNaN(rewardNumber) && rewardNumber >= 0) {
      onSubmit({ 
        question: question.trim(), 
        reward: rewardNumber,
        expiryMinutes: !isNaN(minutes) ? minutes : 30
      });
      setQuestion('');
      setReward('0');
      setExpiryMinutes('30');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <h2 className="text-xl font-semibold mb-4">Create a Bounty</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question
            </label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="What would you like to know?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reward ($)
            </label>
            <input
              type="number"
              value={reward}
              onChange={(e) => setReward(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter reward amount"
              min="0"
              step="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expires in (minutes)
            </label>
            <input
              type="number"
              value={expiryMinutes}
              onChange={(e) => setExpiryMinutes(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter number of minutes (optional)"
              min="1"
              step="1"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!question.trim() || !reward || Number(reward) < 0}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 
              disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Create Bounty
          </button>
        </div>
      </div>
    </div>
  );
} 