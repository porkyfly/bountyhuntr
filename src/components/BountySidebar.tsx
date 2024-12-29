'use client'

import { useState, useRef, useEffect } from 'react';
import { Bounty, Answer } from "@prisma/client";
import { getRemainingTime } from '@/utils/time';
import Image from 'next/image';

interface BountySidebarProps {
  bounty: (Bounty & { answers: Answer[] }) | null;
  onClose: () => void;
  onAnswerSubmit: () => void;
  onAnswerAdd: (answer: Answer) => void;
  isMobile?: boolean;
}

export default function BountySidebar({
  bounty,
  onClose,
  onAnswerSubmit,
  onAnswerAdd,
  isMobile = false,
}: BountySidebarProps) {
  if (!bounty) {
    return null;
  }

  const [isMinimized, setIsMinimized] = useState(false);
  const [newAnswer, setNewAnswer] = useState('');
  const [optimisticAnswers, setOptimisticAnswers] = useState<{ [key: string]: boolean }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newAnswer.trim() || isSubmitting) return;

    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('content', newAnswer);

      const response = await fetch(`/api/bounties/${bounty.id}/answers`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to submit answer');
      }

      const answer = await response.json();
      setNewAnswer('');
      onAnswerAdd(answer);
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAnswer = async (answerId: string, currentlyAccepted: boolean) => {
    setOptimisticAnswers(prev => ({
      ...prev,
      [answerId]: !currentlyAccepted
    }));

    try {
      const response = await fetch(
        `/api/bounties/${bounty.id}/answers/${answerId}/${currentlyAccepted ? 'unaccept' : 'accept'}`,
        { method: 'POST' }
      );

      if (!response.ok) throw new Error('Failed to toggle answer');
      onAnswerSubmit();
    } catch (error) {
      setOptimisticAnswers(prev => ({
        ...prev,
        [answerId]: currentlyAccepted
      }));
      console.error('Error toggling answer:', error);
    }
  };

  const remainingTime = bounty ? getRemainingTime(bounty.expiryMinutes, bounty.createdAt) : '';

  // Mobile Layout
  return (
    <div 
      className="bg-white h-full rounded-t-xl flex flex-col overflow-hidden pointer-events-auto"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center sticky top-0 bg-white z-10">
        <h2 className="text-xl font-semibold text-gray-800 flex-1">Bounty Details</h2>
        <button 
          onClick={onClose}
          className="p-2 -mr-2 active:bg-gray-100 rounded-full"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        {/* Question */}
        <div className="p-4 border-b bg-white">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{bounty.question}</h3>
              <span className="text-primary font-semibold">${bounty.reward}</span>
            </div>
            {remainingTime && (
              <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                remainingTime === 'Expired' 
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {remainingTime}
              </span>
            )}
          </div>
        </div>

        {/* Answers */}
        <div className="p-4 space-y-4">
          <h4 className="font-medium text-gray-700">Answers</h4>
          {bounty.answers.length === 0 ? (
            <p className="text-gray-500">No answers yet</p>
          ) : (
            bounty.answers.map((answer) => {
              const isAccepted = optimisticAnswers[answer.id] ?? answer.accepted;
              
              return (
                <div
                  key={answer.id}
                  onClick={() => toggleAnswer(answer.id, isAccepted)}
                  className={`p-3 border rounded-lg transition-all duration-200 cursor-pointer ${
                    isAccepted 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <p className="text-gray-800">{answer.content}</p>
                  {answer.imageUrl && (
                    <div className="mt-2">
                      <Image
                        src={answer.imageUrl}
                        alt="Answer image"
                        width={300}
                        height={200}
                        className="rounded-lg object-cover"
                      />
                    </div>
                  )}
                  {isAccepted && (
                    <div className="mt-2 text-sm font-medium text-green-600">
                      Accepted ✓
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Answer Input - Always show it */}
      <form onSubmit={handleSubmit} className="p-4 border-t bg-gray-50 sticky bottom-0">
        <textarea
          name="content"
          value={newAnswer}
          onChange={(e) => setNewAnswer(e.target.value)}
          placeholder="Write your answer..."
          className="w-full p-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
          rows={3}
        />
        <div className="mt-2 flex gap-2">
          <button
            type="submit"
            disabled={!newAnswer.trim() || isSubmitting}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 
              disabled:opacity-50 disabled:cursor-not-allowed text-center font-medium"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Answer'}
          </button>
        </div>
      </form>
    </div>
  );

} 