import React from 'react';
import { Trophy, X, Medal } from 'lucide-react';
import { SortingPlayerProgress, SortingLeaderboardEntry } from '../types';

interface SortingLeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: SortingPlayerProgress;
  playerName?: string;
}

export const SortingLeaderboardModal: React.FC<SortingLeaderboardModalProps> = ({
  isOpen,
  onClose,
  progress,
  playerName = 'You',
}) => {
  if (!isOpen) return null;

  const currentCumulative = progress.totalCumulativeScore || 0;
  const currentLevel = progress.unlockedLevel || 1;

  // Base leaderboard competitors calibrated to our 40-level scoring system
  const defaultCompetitors: Omit<SortingLeaderboardEntry, 'rank'>[] = [
    { name: 'Abebe B.', avatar: '🦁', totalScore: 32450, level: 40, winRate: '98%' },
    { name: 'Kalkidan T.', avatar: '⚡', totalScore: 28900, level: 38, winRate: '95%' },
    { name: 'Dawit M.', avatar: '👑', totalScore: 25400, level: 35, winRate: '92%' },
    { name: 'Hanna S.', avatar: '🌟', totalScore: 21850, level: 32, winRate: '89%' },
    { name: 'Yared G.', avatar: '🦅', totalScore: 18600, level: 28, winRate: '87%' },
    { name: 'Selam W.', avatar: '💎', totalScore: 15300, level: 24, winRate: '85%' },
    { name: 'Biniyam K.', avatar: '🔥', totalScore: 12200, level: 19, winRate: '82%' },
    { name: 'Meron F.', avatar: '🎯', totalScore: 9450, level: 15, winRate: '80%' },
    { name: 'Tewodros A.', avatar: '⚔️', totalScore: 6800, level: 11, winRate: '78%' },
  ];

  // Insert current player dynamically based on score
  const allEntries: SortingLeaderboardEntry[] = [];

  const playerObj: Omit<SortingLeaderboardEntry, 'rank'> = {
    name: playerName,
    avatar: '🎮',
    totalScore: currentCumulative,
    level: currentLevel,
    winRate: progress.completedLevels.length > 0 ? '88%' : '--',
    isPlayer: true,
  };

  const combined = [...defaultCompetitors];
  combined.push(playerObj);
  combined.sort((a, b) => b.totalScore - a.totalScore);

  combined.forEach((entry, idx) => {
    allEntries.push({
      ...entry,
      rank: idx + 1,
    });
  });

  const playerRank = allEntries.find((e) => e.isPlayer)?.rank || combined.length;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-start items-center p-4 sm:p-6 overflow-y-auto select-none font-['Plus_Jakarta_Sans',sans-serif]"
      style={{ backgroundColor: '#F3E9D8', color: '#40372F' }}
    >
      <div className="w-full max-w-lg mx-auto space-y-4 pb-8 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#D4C3AA] pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E6D8C3] border border-[#D4C3AA] flex items-center justify-center text-[#D58A36]">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#40372F] uppercase tracking-tight">
                TOURNAMENT LEADERBOARD
              </h2>
              <p className="text-xs text-[#786B5B]">
                Official Sorting Ball Cumulative Championship Rankings
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-[#E6D8C3] hover:bg-[#d8c8b0] active:scale-95 text-[#40372F] flex items-center justify-center transition-colors cursor-pointer border border-[#D4C3AA]"
            aria-label="Close Leaderboard"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Player Rank Highlight Banner */}
        <div className="p-3.5 rounded-2xl bg-[#E6D8C3] border-2 border-[#D58A36] flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#D58A36] text-white font-black font-mono flex items-center justify-center shadow-xs">
              #{playerRank}
            </div>
            <div>
              <div className="text-sm font-bold text-[#40372F] flex items-center gap-1.5">
                <span>{playerName}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#648B75] text-white font-sans uppercase font-bold">
                  You
                </span>
              </div>
              <div className="text-xs text-[#786B5B] font-mono">
                Level {currentLevel} • {progress.completedLevels.length} Completed
              </div>
            </div>
          </div>
          <div className="text-right font-mono">
            <div className="text-xs text-[#786B5B] font-sans uppercase tracking-wider font-semibold">
              Total Score
            </div>
            <div className="text-base font-black text-[#D58A36]">
              {currentCumulative.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Leaderboard Table List */}
        <div className="space-y-1.5">
          {allEntries.slice(0, 10).map((entry) => {
            const isTop3 = entry.rank <= 3;
            const rankBadgeColor =
              entry.rank === 1
                ? 'bg-[#D58A36] text-white border-[#b87024]'
                : entry.rank === 2
                ? 'bg-[#D4C3AA] text-[#40372F] border-[#c4b39a]'
                : entry.rank === 3
                ? 'bg-[#cbb597] text-[#40372F] border-[#bda688]'
                : 'bg-[#E6D8C3] text-[#786B5B] border-[#D4C3AA]';

            return (
              <div
                key={`${entry.rank}-${entry.name}`}
                className={`p-3 rounded-xl flex items-center justify-between transition-all ${
                  entry.isPlayer
                    ? 'bg-[#E6D8C3] border-2 border-[#D58A36] shadow-xs'
                    : 'bg-[#E6D8C3] border border-[#D4C3AA] hover:bg-[#dfd0bb]'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Rank Badge */}
                  <div
                    className={`w-7 h-7 rounded-lg border flex items-center justify-center text-xs font-black font-mono ${rankBadgeColor}`}
                  >
                    {isTop3 ? (
                      <Medal className="w-3.5 h-3.5" />
                    ) : (
                      entry.rank
                    )}
                  </div>

                  {/* Avatar & Name */}
                  <div className="flex items-center gap-2">
                    <span className="text-base">{entry.avatar}</span>
                    <div>
                      <div className="text-xs font-bold text-[#40372F] flex items-center gap-1">
                        <span>{entry.name}</span>
                        {entry.isPlayer && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#648B75] text-white font-black uppercase">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-[#786B5B] font-mono">
                        Level {entry.level}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Score */}
                <div className="text-right font-mono">
                  <div className="text-xs font-black text-[#D58A36]">
                    {entry.totalScore.toLocaleString()} PTS
                  </div>
                  <div className="text-[10px] text-[#786B5B]">
                    Win Rate: {entry.winRate}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
