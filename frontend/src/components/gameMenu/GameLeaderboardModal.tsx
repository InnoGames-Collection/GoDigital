import React from 'react';
import { X, Trophy, Medal } from 'lucide-react';
import { getGameLeaderboard } from './leaderboardService';

interface GameLeaderboardModalProps {
  gameId: string;
  gameTitle: string;
  userScore: number;
  userPhone?: string;
  onClose: () => void;
}

export const GameLeaderboardModal: React.FC<GameLeaderboardModalProps> = ({
  gameId,
  gameTitle,
  userScore,
  userPhone,
  onClose,
}) => {
  const { top10, currentUserEntry } = getGameLeaderboard(gameId, userScore, userPhone);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 select-none font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="relative w-full max-w-sm sm:max-w-md bg-gradient-to-b from-[#1E2433] via-[#151926] to-[#0F131D] border-2 border-amber-400/40 rounded-3xl p-5 shadow-2xl text-white flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black uppercase tracking-wider text-amber-300">
                {gameTitle}
              </h2>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                Tournament Leaderboard
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Table Column Labels (Section 7) */}
        <div className="grid grid-cols-12 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-white/5">
          <span className="col-span-2 text-left">RANK</span>
          <span className="col-span-6 text-left">MASKED NUMBER</span>
          <span className="col-span-4 text-right">SCORE</span>
        </div>

        {/* Top 10 List */}
        <div className="flex-1 overflow-y-auto pr-1 my-1 space-y-1.5 divide-y divide-white/5">
          {top10.map((entry) => {
            const isTop3 = entry.rank <= 3;
            return (
              <div
                key={entry.rank}
                className={`grid grid-cols-12 items-center px-3 py-2 rounded-xl transition-all ${
                  entry.isCurrentUser
                    ? 'bg-amber-500/25 border border-amber-400/50 shadow-xs'
                    : isTop3
                    ? 'bg-white/5'
                    : 'hover:bg-white/5'
                }`}
              >
                {/* Rank */}
                <div className="col-span-2 flex items-center gap-1">
                  {entry.rank === 1 ? (
                    <Medal className="w-4 h-4 text-amber-400" />
                  ) : entry.rank === 2 ? (
                    <Medal className="w-4 h-4 text-slate-300" />
                  ) : entry.rank === 3 ? (
                    <Medal className="w-4 h-4 text-amber-600" />
                  ) : (
                    <span className="font-mono text-xs font-black text-slate-400">
                      #{entry.rank}
                    </span>
                  )}
                </div>

                {/* Masked Phone (Section 6: exact 3 + 5 asterisks + 3) */}
                <div className="col-span-6 flex items-center gap-2">
                  <span
                    className={`font-mono text-xs font-bold tracking-wider ${
                      entry.isCurrentUser ? 'text-amber-300' : 'text-slate-200'
                    }`}
                  >
                    {entry.maskedMsisdn}
                  </span>
                  {entry.isCurrentUser && (
                    <span className="px-1.5 py-0.5 rounded-md bg-amber-400 text-slate-950 font-black text-[9px] uppercase tracking-wide">
                      YOU
                    </span>
                  )}
                </div>

                {/* Score */}
                <div className="col-span-4 text-right font-mono font-black text-xs text-amber-400">
                  {entry.score.toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Current User Row if outside Top 10 (Section 5 & 8) */}
        {currentUserEntry && (
          <div className="pt-2 border-t border-white/10">
            <div className="text-[10px] font-black uppercase text-amber-400/90 tracking-wider mb-1 px-3">
              YOUR RANK
            </div>
            <div className="grid grid-cols-12 items-center px-3 py-2 rounded-xl bg-amber-500/20 border-2 border-amber-400/40 shadow-md">
              <div className="col-span-2 font-mono text-xs font-black text-amber-300">
                #{currentUserEntry.rank}
              </div>
              <div className="col-span-6 flex items-center gap-2">
                <span className="font-mono text-xs font-black text-amber-200 tracking-wider">
                  {currentUserEntry.maskedMsisdn}
                </span>
                <span className="px-1.5 py-0.5 rounded-md bg-amber-400 text-slate-950 font-black text-[9px] uppercase tracking-wide">
                  YOU
                </span>
              </div>
              <div className="col-span-4 text-right font-mono font-black text-xs text-amber-300">
                {currentUserEntry.score.toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {/* Footer Close Button */}
        <button
          onClick={onClose}
          className="mt-4 w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-98 text-slate-200 font-black text-xs uppercase tracking-wider transition-all cursor-pointer border border-white/10"
        >
          BACK
        </button>
      </div>
    </div>
  );
};
