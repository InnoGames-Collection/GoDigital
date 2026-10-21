/**
 * EMOJI IQ — Active Gameplay View
 * Recreates the layout, diamond dividers, equation stack, timer, and 2x2 answer tiles from the reference video.
 */

import React, { useState, useEffect, useRef } from 'react';
import { EmojiIqQuestion, EmojiIqLevelConfig } from '../types';
import { EmojiIqEquationCard } from './EmojiIqEquationCard';
import { EMOJI_IQ_COLORS } from '../colors';
import { Flame } from 'lucide-react';
import { emojiIqAudio } from '../emojiIqAudio';

interface EmojiIqPlayViewProps {
  question: EmojiIqQuestion;
  levelConfig: EmojiIqLevelConfig;
  currentQuestionIndex: number;
  totalQuestions: number;
  levelScore: number;
  comboCount: number;
  hintsUsedOnCurrentQuestion: number;
  eliminatedOptionIndices: number[];
  onSelectAnswer: (optionIndex: number, timeRemainingSeconds: number) => void;
  onTimeExpired: () => void;
  onAdvanceQuestion: () => void;
}

export const EmojiIqPlayView: React.FC<EmojiIqPlayViewProps> = ({
  question,
  levelConfig,
  currentQuestionIndex,
  totalQuestions,
  levelScore,
  comboCount,
  eliminatedOptionIndices,
  onSelectAnswer,
  onTimeExpired,
  onAdvanceQuestion,
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(question.timeLimitSeconds);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [inlineFeedback, setInlineFeedback] = useState<{
    state: 'CORRECT' | 'INCORRECT' | 'TIMEOUT';
    selectedIdx: number | null;
    correctIdx: number;
  } | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const advanceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTickedSecondRef = useRef<number | null>(null);
  const answeredRef = useRef<boolean>(false);

  // Reset timer & selection state on question transition
  useEffect(() => {
    setTimeLeft(question.timeLimitSeconds);
    setSelectedIdx(null);
    setInlineFeedback(null);
    lastTickedSecondRef.current = null;
    answeredRef.current = false;
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
  }, [question.id, question.timeLimitSeconds]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    };
  }, []);

  // Main countdown timer interval
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0.1) {
          if (timerRef.current) clearInterval(timerRef.current);
          if (!answeredRef.current) {
            answeredRef.current = true;
            setInlineFeedback({
              state: 'TIMEOUT',
              selectedIdx: null,
              correctIdx: question.correctIndex,
            });
            onTimeExpired();
            advanceTimerRef.current = setTimeout(() => {
              onAdvanceQuestion();
            }, 900);
          }
          return 0;
        }

        const nextVal = Math.round((prev - 0.1) * 10) / 10;
        const intSecond = Math.ceil(nextVal);

        // Tick only once per integer second between 1s and 3s
        if (intSecond <= 3 && intSecond >= 1 && lastTickedSecondRef.current !== intSecond) {
          lastTickedSecondRef.current = intSecond;
          emojiIqAudio.playTick();
        }

        return nextVal;
      });
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [question.id, question.correctIndex, onTimeExpired, onAdvanceQuestion]);

  const handleChoose = (index: number) => {
    if (selectedIdx !== null || answeredRef.current || eliminatedOptionIndices.includes(index)) {
      return;
    }
    answeredRef.current = true;
    setSelectedIdx(index);
    if (timerRef.current) clearInterval(timerRef.current);

    const isCorrect = index === question.correctIndex;
    setInlineFeedback({
      state: isCorrect ? 'CORRECT' : 'INCORRECT',
      selectedIdx: index,
      correctIdx: question.correctIndex,
    });

    onSelectAnswer(index, timeLeft);

    advanceTimerRef.current = setTimeout(() => {
      onAdvanceQuestion();
    }, 850);
  };

  // Timer Bar calculation
  const timerPercent = Math.max(0, Math.min(100, (timeLeft / question.timeLimitSeconds) * 100));
  const timerColor =
    timerPercent > 50
      ? 'from-[#20C997] to-[#00B8D9]'
      : timerPercent > 25
      ? 'from-[#FFB703] to-[#FF9800]'
      : 'from-[#FF5A67] to-[#D63031]';

  return (
    <div className="relative w-full flex-1 flex flex-col justify-between items-center px-3 py-1 sm:px-4 sm:py-2 select-none overflow-hidden max-w-md mx-auto">
      {/* Level Title & Question Counter */}
      <div className="w-full flex flex-col items-center">
        <h2
          className="text-xl sm:text-2xl font-black font-['Fredoka',sans-serif] tracking-wide text-center uppercase"
          style={{ color: EMOJI_IQ_COLORS.textPrimary }}
        >
          {levelConfig.title}
        </h2>
        <span
          className="text-base sm:text-lg font-black font-mono tracking-widest"
          style={{ color: EMOJI_IQ_COLORS.primary }}
        >
          {currentQuestionIndex + 1}/{totalQuestions}
        </span>

        {/* Diamond Accent Line Divider (Reference Video Motif) */}
        <div className="w-full max-w-xs flex items-center justify-center my-1.5 opacity-70">
          <span className="text-xs" style={{ color: EMOJI_IQ_COLORS.primary }}>◇</span>
          <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-[#6C5CE7] to-transparent mx-1.5" />
          <span className="text-xs" style={{ color: EMOJI_IQ_COLORS.primary }}>◇</span>
        </div>

        {/* Smooth Countdown Timer Bar & Numerical Display */}
        <div className="w-full max-w-xs flex items-center gap-2 px-1">
          <div className="flex-1 h-3 bg-white rounded-full p-0.5 shadow-inner border border-[#6C5CE7]/20 overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${timerColor} transition-all duration-100 ease-linear shadow`}
              style={{ width: `${timerPercent}%` }}
            />
          </div>
          <span
            className={`text-xs font-black min-w-[28px] text-right font-mono ${
              timeLeft <= 3 ? 'text-[#FF5A67] font-extrabold animate-pulse' : 'text-[#241F3D]'
            }`}
          >
            {Math.ceil(timeLeft)}s
          </span>
        </div>
      </div>

      {/* Central Stage: The Equation/Puzzle Card Stack */}
      <div className="w-full flex-1 flex flex-col items-center justify-center my-auto py-2">
        <EmojiIqEquationCard question={question} equations={question.equations} />

        {/* Status Indicator / Accent Divider */}
        {inlineFeedback ? (
          <div className="w-full max-w-xs flex items-center justify-center my-2 animate-in fade-in zoom-in-95 duration-200">
            {inlineFeedback.state === 'CORRECT' ? (
              <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-500 text-white font-black text-xs sm:text-sm shadow-md animate-bounce">
                <span>✓</span>
                <span>CORRECT!</span>
              </div>
            ) : inlineFeedback.state === 'INCORRECT' ? (
              <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-rose-500 text-white font-black text-xs sm:text-sm shadow-md">
                <span>✕</span>
                <span>NOT QUITE!</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-500 text-white font-black text-xs sm:text-sm shadow-md">
                <span>⏰</span>
                <span>TIME'S UP!</span>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full max-w-xs flex items-center justify-center my-2 opacity-70">
            <span className="text-xs" style={{ color: EMOJI_IQ_COLORS.primary }}>◇</span>
            <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-[#6C5CE7] to-transparent mx-1.5" />
            <span className="text-xs" style={{ color: EMOJI_IQ_COLORS.primary }}>◇</span>
          </div>
        )}
      </div>

      {/* Answer Options: 2x2 Grid with high-contrast tactile styling */}
      <div className="w-full max-w-sm grid grid-cols-2 gap-2.5 sm:gap-3 pb-2">
        {question.options.map((option, idx) => {
          const isEliminated = eliminatedOptionIndices.includes(idx);
          const isSelected = selectedIdx === idx;
          const isLongString = typeof option === 'string' && option.length > 6;

          let buttonStyle =
            'bg-white border-2 border-[#6C5CE7]/30 border-b-[5px] border-b-[#6C5CE7] active:border-b-2 active:translate-y-1 shadow-md hover:border-[#6C5CE7] hover:scale-[1.02] text-[#241F3D]';

          if (isEliminated) {
            buttonStyle =
              'opacity-25 grayscale cursor-not-allowed bg-slate-200 border-b-2 border-slate-300 text-slate-400 line-through';
          } else if (inlineFeedback) {
            if (idx === question.correctIndex) {
              buttonStyle =
                'bg-emerald-500 border-2 border-emerald-600 border-b-[5px] border-b-emerald-700 text-white shadow-lg scale-[1.03] ring-2 ring-emerald-300';
            } else if (isSelected && inlineFeedback.state === 'INCORRECT') {
              buttonStyle =
                'bg-rose-500 border-2 border-rose-600 border-b-[4px] border-b-rose-700 text-white shadow-inner scale-95 opacity-90';
            } else {
              buttonStyle = 'opacity-30 bg-slate-100 border-slate-200 text-slate-400';
            }
          } else if (isSelected) {
            buttonStyle =
              'bg-[#00B8D9] border-b-2 border-[#0094b0] translate-y-1 shadow-inner text-white scale-98';
          }

          return (
            <button
              key={idx}
              onClick={() => handleChoose(idx)}
              disabled={isEliminated || selectedIdx !== null || inlineFeedback !== null}
              className={`group relative flex items-center justify-center py-3.5 sm:py-4 px-2.5 rounded-2xl font-black text-center transition-all ${buttonStyle}`}
            >
              <span
                className={`font-['Fredoka',sans-serif] font-black tracking-wide drop-shadow-sm flex items-center justify-center gap-1.5 ${
                  isLongString
                    ? 'text-xs sm:text-sm leading-tight text-center break-words'
                    : 'text-xl sm:text-2xl font-mono'
                }`}
              >
                {inlineFeedback && idx === question.correctIndex && <span>✓</span>}
                {inlineFeedback && isSelected && inlineFeedback.state === 'INCORRECT' && <span>✕</span>}
                <span>{option}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Bottom Status Ribbon: Level Score & Active Combo */}
      <div className="w-full max-w-sm flex items-center justify-between bg-white px-3.5 py-2 rounded-2xl shadow-sm border border-[#6C5CE7]/15 mt-1">
        <div className="flex flex-col">
          <span
            className="text-[10px] font-black uppercase tracking-wider"
            style={{ color: EMOJI_IQ_COLORS.textSecondary }}
          >
            LEVEL SCORE
          </span>
          <span
            className="text-base sm:text-lg font-black font-mono leading-none"
            style={{ color: EMOJI_IQ_COLORS.primary }}
          >
            {levelScore.toLocaleString()}
          </span>
        </div>

        {comboCount > 1 ? (
          <div
            className="flex items-center gap-1 text-white font-black text-xs px-3 py-1 rounded-full shadow-md animate-bounce"
            style={{
              backgroundColor: EMOJI_IQ_COLORS.accent,
              color: EMOJI_IQ_COLORS.bgDark,
            }}
          >
            <Flame className="w-3.5 h-3.5 fill-[#241F3D]" />
            <span>COMBO x{comboCount}</span>
          </div>
        ) : (
          <div
            className="text-[11px] font-bold"
            style={{ color: EMOJI_IQ_COLORS.textSecondary }}
          >
            Speed & Accuracy Bonus
          </div>
        )}
      </div>
    </div>
  );
};
