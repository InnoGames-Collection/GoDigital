/**
 * GoDigital - My High Scores Page
 * Lists player's high scores across catalog games.
 * Conforming to GoDigital warm sunset gaming theme:
 * - Surfaces: #352316 / #24170F
 * - Accent: #FFAA24 / #FFD35A
 * - Borders: #81502B
 * - Text: #FFF0CF / #E6C8A4
 */

import React from 'react';
import { ArrowLeft, Trophy } from 'lucide-react';
import { UserProfile } from '../../types';
import { GameCatalog } from '../../services/gameCatalog';

interface MyScoresPageProps {
  profile: UserProfile;
  onBack?: () => void;
  showHeader?: boolean;
}

export const MyScoresPage: React.FC<MyScoresPageProps> = ({
  profile,
  onBack,
  showHeader = true,
}) => {
  const games = GameCatalog.getAll();

  return (
    <div className="min-h-screen text-[#FFF0CF] pb-28 max-w-md md:max-w-xl lg:max-w-3xl mx-auto px-3.5 pt-3 select-none space-y-4 relative z-10">
      {showHeader && (
        <div className="flex items-center justify-between gap-3 bg-[#352316] border border-[#81502B] text-[#FFF0CF] p-3.5 rounded-2xl shadow-xs">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                id="my-scores-back-btn"
                type="button"
                onClick={onBack}
                className="w-8 h-8 rounded-xl bg-[#442C1B] hover:bg-[#352316] border border-[#81502B] hover:border-[#FFAA24]/60 flex items-center justify-center text-[#FFF0CF] transition-colors cursor-pointer shrink-0"
                title="Go Back"
                aria-label="Go Back"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#FFD35A] shrink-0" />
              <h1 className="text-base font-black tracking-tight text-[#FFF0CF]">My High Scores</h1>
            </div>
          </div>
          <span className="text-xs font-bold text-[#E6C8A4] bg-[#442C1B] px-2.5 py-0.5 rounded-full border border-[#81502B]">
            {games.length} Games
          </span>
        </div>
      )}

      <div className="rounded-2xl border border-[#81502B] overflow-hidden bg-[#352316] shadow-xs divide-y divide-[#81502B]">
        {games.map((game) => {
          const score = profile.highScores?.[game.gameId] ?? 0;
          return (
            <div
              key={game.gameId}
              className="p-3.5 flex items-center justify-between hover:bg-[#442C1B]/60 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={game.thumbnail || game.banner}
                  alt={game.gameName}
                  className="w-10 h-10 rounded-xl object-cover bg-[#24170F] shrink-0 border border-[#81502B]"
                />
                <div className="min-w-0">
                  <div className="text-xs font-black text-[#FFF0CF] truncate">
                    {game.gameName}
                  </div>
                  <div className="text-[10px] text-[#E6C8A4] capitalize">
                    {game.category || 'Standard Game'}
                  </div>
                </div>
              </div>
              <div className="text-sm font-black font-mono shrink-0">
                {score > 0 ? (
                  <span className="text-[#FFD35A]">{score.toLocaleString()} pts</span>
                ) : (
                  <span className="text-[#E6C8A4]/70 text-xs font-normal">Not Played</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyScoresPage;
