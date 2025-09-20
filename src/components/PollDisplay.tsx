// src/components/PollDisplay.tsx
"use client";

import { useState } from "react";
import { voteOnPoll } from "@/app/actions";
import type { Post } from "@/app/types";

interface PollDisplayProps {
  post: Post;
}

export default function PollDisplay({ post }: PollDisplayProps) {
  const [currentPost, setCurrentPost] = useState(post);
  const [voted, setVoted] = useState(false);

  const handleVote = async (optionIndex: 0 | 1) => {
    if (voted || !currentPost.pollOptions) return;
    setVoted(true);
    const result = await voteOnPoll(currentPost.id, optionIndex);
    if (result.success && result.updatedPost) {
      setCurrentPost(result.updatedPost as Post);
    }
  };

  const totalVotes = currentPost.pollOptions
    ? currentPost.pollOptions[0].votes + currentPost.pollOptions[1].votes
    : 0;

  const getPercentage = (votes: number) => {
    return totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
  };

  return (
    <div className="mt-4 space-y-3">
      {currentPost.pollOptions?.map((option, index) => {
        const percentage = getPercentage(option.votes);
        return (
          <button
            key={index}
            onClick={() => handleVote(index as 0 | 1)}
            disabled={voted}
            className="w-full text-left p-3 border-2 rounded-lg transition-all relative overflow-hidden disabled:cursor-not-allowed hover:border-signature-blue dark:border-gray-700"
          >
            {voted && (
              <div
                className="absolute top-0 left-0 h-full bg-signature-blue/20"
                style={{ width: `${percentage}%` }}
              />
            )}
            <div className="relative z-10 flex justify-between items-center">
              <span className="font-semibold">{option.text}</span>
              {voted && (
                <span className="font-bold text-signature-blue">
                  {option.votes}표 ({percentage.toFixed(1)}%)
                </span>
              )}
            </div>
          </button>
        );
      })}
      {voted && (
        <p className="text-xs text-center text-gray-500 mt-2">
          총 {totalVotes.toLocaleString()}명 참여
        </p>
      )}
    </div>
  );
}
