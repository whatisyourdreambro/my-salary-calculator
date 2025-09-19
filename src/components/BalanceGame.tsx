// src/components/BalanceGame.tsx
"use client";

import { useState } from "react";
import { voteForPoll } from "@/app/actions";

interface Poll {
  id: number;
  topic: string;
  optionA_text: string;
  optionA_votes: number;
  optionB_text: string;
  optionB_votes: number;
}

interface BalanceGameProps {
  initialPoll: Poll;
}

export default function BalanceGame({ initialPoll }: BalanceGameProps) {
  const [poll, setPoll] = useState(initialPoll);
  const [voted, setVoted] = useState(false);

  const totalVotes = poll.optionA_votes + poll.optionB_votes;
  const percentageA =
    totalVotes > 0 ? (poll.optionA_votes / totalVotes) * 100 : 0;
  const percentageB =
    totalVotes > 0 ? (poll.optionB_votes / totalVotes) * 100 : 0;

  const handleVote = async (option: "A" | "B") => {
    if (voted) return;
    setVoted(true);
    const result = await voteForPoll(poll.id, option);
    if (result.success && result.updatedPoll) {
      setPoll(result.updatedPoll);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-lg border">
      <h2 className="text-2xl font-bold text-center mb-6">{poll.topic}</h2>
      <div className="grid grid-cols-2 gap-4">
        {/* Option A */}
        <div
          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
            voted ? "" : "hover:border-signature-blue"
          }`}
          onClick={() => handleVote("A")}
        >
          <div className="text-xl font-bold text-center text-blue-500">VS</div>
          <p className="text-center font-semibold my-4 h-16 flex items-center justify-center">
            {poll.optionA_text}
          </p>
          {voted && (
            <div className="w-full bg-gray-200 rounded-full h-8 dark:bg-gray-700 relative overflow-hidden">
              <div
                className="bg-blue-600 h-8 rounded-full flex items-center justify-center text-white font-bold"
                style={{ width: `${percentageA}%` }}
              >
                {percentageA.toFixed(1)}%
              </div>
            </div>
          )}
        </div>

        {/* Option B */}
        <div
          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
            voted ? "" : "hover:border-brand-red"
          }`}
          onClick={() => handleVote("B")}
        >
          <div className="text-xl font-bold text-center text-red-500">VS</div>
          <p className="text-center font-semibold my-4 h-16 flex items-center justify-center">
            {poll.optionB_text}
          </p>
          {voted && (
            <div className="w-full bg-gray-200 rounded-full h-8 dark:bg-gray-700 relative overflow-hidden">
              <div
                className="bg-red-600 h-8 rounded-full flex items-center justify-center text-white font-bold"
                style={{ width: `${percentageB}%` }}
              >
                {percentageB.toFixed(1)}%
              </div>
            </div>
          )}
        </div>
      </div>
      {voted && (
        <p className="text-center mt-4 font-semibold">
          총 {totalVotes.toLocaleString()}명 참여
        </p>
      )}
    </div>
  );
}
