'use client'

import { useState, useEffect } from 'react';
import { Bounty, Answer } from '@prisma/client';

interface BountySidebarProps {
  bounty: (Bounty & { answers: Answer[] }) | null;
  onClose: () => void;
  onAnswerSubmit?: () => void;
}

export default function BountySidebar({ bounty, onClose, onAnswerSubmit }: BountySidebarProps) {
  const [answer, setAnswer] = useState('');
  const [localBounty, setLocalBounty] = useState(bounty);

  useEffect(() => {
    setLocalBounty(bounty);
  }, [bounty]);

  const handleAcceptAnswer = async (answerId: string) => {
    if (!localBounty) return;
    
    try {
      const response = await fetch(`/api/bounties/${localBounty.id}/answers/${answerId}/accept`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to accept answer');

      // Update local state
      setLocalBounty(prev => prev ? {
        ...prev,
        status: 'completed',
        answers: prev.answers.map(a => ({
          ...a,
          accepted: a.id === answerId
        }))
      } : null);
      
      onAnswerSubmit?.();
    } catch (error) {
      console.error('Error accepting answer:', error);
    }
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`/api/bounties/${localBounty!.id}/answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: answer }),
      });

      if (!response.ok) throw new Error('Failed to submit answer');
      
      const newAnswer = await response.json();
      
      // Update local bounty with new answer
      setLocalBounty(prev => prev ? {
        ...prev,
        answers: [...prev.answers, newAnswer]
      } : null);
      
      setAnswer('');
      onAnswerSubmit?.();
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  return (
    <div className="w-96 h-screen bg-white shadow-lg">
      {localBounty ? (
        <div className="h-full p-6 overflow-y-auto">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">{localBounty.question}</h2>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                ${localBounty.reward}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Answers</h3>
            {localBounty.answers.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No answers yet</p>
            ) : (
              <div className="space-y-4">
                {localBounty.answers.map((answer) => (
                  <div 
                    key={answer.id} 
                    className={`p-4 rounded-lg border transition-colors ${
                      answer.accepted 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-gray-50 border-gray-100'
                    }`}
                  >
                    <p className="text-gray-800 mb-2">{answer.content}</p>
                    {localBounty.status === 'open' && (
                      <button
                        onClick={() => handleAcceptAnswer(answer.id)}
                        className="text-sm text-green-600 hover:text-green-700 font-medium"
                      >
                        Accept Answer
                      </button>
                    )}
                    {answer.accepted && (
                      <div className="text-sm text-green-600 font-medium flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Accepted Answer
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {localBounty.status === 'open' && (
            <form onSubmit={handleSubmitAnswer} className="space-y-4">
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors"
                rows={4}
                placeholder="Write your answer..."
                required
              />
              <button
                type="submit"
                className="w-full bg-blue-600 text-white rounded-lg py-2 px-4 hover:bg-blue-700 transition-colors font-medium"
              >
                Submit Answer
              </button>
            </form>
          )}
        </div>
      ) : (
        <div className="h-full bg-gray-50 flex items-center justify-center">
          <p className="text-gray-500">Select a bounty to view details</p>
        </div>
      )}
    </div>
  );
} 