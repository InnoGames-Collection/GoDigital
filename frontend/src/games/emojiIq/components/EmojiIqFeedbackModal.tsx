/**
 * EMOJI IQ — Feedback Modals
 * Visual popups matching the reference video:
 * - Correct: Sunglasses face 😎 "You are doing great" [ Continue ]
 * - Incorrect: Neutral face 😐 "Incorrect answer! Don't give up, try again!" [ Continue ]
 * - Time Out: ⏰ "Time's up! Think faster on the next puzzle!" [ Continue ]
 * - Level Clear: 🤩 "LEVEL CLEAR!" celebration with stage stats and [ Next Level ]
 * 
 * Free of lives/hearts and coin purchase mechanics.
 */

import React from 'react';
import { EMOJI_IQ_COLORS } from '../colors';
import { TournamentScoreCalculation, EmojiIqLevelConfig } from '../types';
import { Trophy, ArrowRight, Home, Flame } from 'lucide-react';
import { emojiIqAudio } from '../emojiIqAudio';

export type FeedbackType = 'LEVEL_CLEAR';

interface EmojiIqFeedbackModalProps {
  type: FeedbackType | string;
  levelConfig: EmojiIqLevelConfig;
  lastScoreCalc?: TournamentScoreCalculation | null;
  levelScore: number;
  totalScore: number;
  accuracy: number;
  bestCombo: number;
  perfectCount: number;
  explanation?: string;
  onAdvance: () => void;
  onOpenLeaderboard: () => void;
  onGoHome: () => void;
  coinsWon?: number;
  remainingLives?: number;
  onUseCoinsForLives?: () => void;
  playerCoins?: number;
}

export const EmojiIqFeedbackModal: React.FC<EmojiIqFeedbackModalProps> = ({
  type,
  levelConfig,
  levelScore,
  totalScore,
  accuracy,
  bestCombo,
  onAdvance,
  onOpenLeaderboard,
  onGoHome,
}) => {
  // Only the Level Clear celebration modal is rendered.
  // Question-by-question feedback is rendered non-blockingly inline.
  if (type !== 'LEVEL_CLEAR') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div
        className="w-full max-w-sm rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200 border-2"
        style={{
          backgroundColor: '#FFFFFF',
          borderColor: EMOJI_IQ_COLORS.primary,
        }}
      >
        {/* LEVEL CLEAR CELEBRATION (Star-Struck Face 🤩) */}
        <div className="text-6xl sm:text-7xl mb-1 filter drop-shadow-lg animate-bounce">🤩</div>

        <div className="flex items-center gap-1 my-1">
          <span className="text-2xl">🎉</span>
          <h3
            className="text-2xl sm:text-3xl font-black font-['Fredoka',sans-serif] tracking-wider uppercase"
            style={{ color: EMOJI_IQ_COLORS.primary }}
          >
            LEVEL COMPLETE!
          </h3>
          <span className="text-2xl">🎉</span>
        </div>

        <p className="text-xs font-bold mb-3" style={{ color: EMOJI_IQ_COLORS.textSecondary }}>
          Stage {levelConfig.level}: {levelConfig.title}
        </p>

        {/* Performance Stats Grid */}
        <div className="w-full grid grid-cols-2 gap-2 my-2 text-left">
          <div className="bg-[#F7F5FF] p-2.5 rounded-2xl border border-[#6C5CE7]/15 flex flex-col">
            <span className="text-[10px] font-bold text-[#6B6780] uppercase">Stage Score</span>
            <span className="text-lg font-black font-mono text-[#6C5CE7]">
              +{levelScore.toLocaleString()}
            </span>
          </div>

          <div className="bg-[#F7F5FF] p-2.5 rounded-2xl border border-[#6C5CE7]/15 flex flex-col">
            <span className="text-[10px] font-bold text-[#6B6780] uppercase">Tournament Total</span>
            <span className="text-lg font-black font-mono text-[#241F3D]">
              {totalScore.toLocaleString()}
            </span>
          </div>

          <div className="bg-[#F7F5FF] p-2.5 rounded-2xl border border-[#6C5CE7]/15 flex flex-col">
            <span className="text-[10px] font-bold text-[#6B6780] uppercase">Accuracy</span>
            <span className="text-lg font-black font-mono text-[#20C997]">
              {accuracy}%
            </span>
          </div>

          <div className="bg-[#F7F5FF] p-2.5 rounded-2xl border border-[#6C5CE7]/15 flex flex-col">
            <span className="text-[10px] font-bold text-[#6B6780] uppercase">Best Combo</span>
            <span className="text-lg font-black font-mono text-[#FFB703] flex items-center gap-1">
              <Flame className="w-4 h-4 fill-[#FFB703]" /> {bestCombo}x
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2 mt-3">
          <button
            onClick={() => {
              emojiIqAudio.playPop();
              onAdvance();
            }}
            className="w-full py-3.5 rounded-2xl text-white font-black text-lg shadow-md hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            style={{
              backgroundColor: EMOJI_IQ_COLORS.primary,
              boxShadow: '0 4px 16px rgba(108, 92, 231, 0.4)',
            }}
          >
            <span>Next Level</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <div className="w-full grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                emojiIqAudio.playPop();
                onOpenLeaderboard();
              }}
              className="py-2.5 rounded-xl font-bold text-xs border flex items-center justify-center gap-1 bg-white hover:bg-slate-50 transition-all cursor-pointer"
              style={{
                borderColor: 'rgba(108, 92, 231, 0.2)',
                color: EMOJI_IQ_COLORS.textPrimary,
              }}
            >
              <Trophy className="w-3.5 h-3.5 text-[#FFB703]" />
              <span>Leaderboard</span>
            </button>

            <button
              onClick={() => {
                emojiIqAudio.playPop();
                onGoHome();
              }}
              className="py-2.5 rounded-xl font-bold text-xs border flex items-center justify-center gap-1 bg-white hover:bg-slate-50 transition-all cursor-pointer"
              style={{
                borderColor: 'rgba(108, 92, 231, 0.2)',
                color: EMOJI_IQ_COLORS.textPrimary,
              }}
            >
              <Home className="w-3.5 h-3.5 text-[#6C5CE7]" />
              <span>Home</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
