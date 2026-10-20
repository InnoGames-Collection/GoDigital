/**
 * GoDigital - My Games Page Component
 * 
 * Lists all available games in the catalog with:
 * - Real-time personal high score tracking
 * - Quick play launcher buttons
 * - Game categories and artwork thumbnails
 * - Consistent destination header with Back button & warm sunset theme
 */

import React from 'react';
import { ArrowLeft, Gamepad2 } from 'lucide-react';
import { GameDefinition, UserProfile } from '../../types';
import { GameCatalog } from '../../services/gameCatalog';
import { catalogGameToDefinition } from '../../games/registry';

interface MyGamesPageProps {
  games?: GameDefinition[];
  profile: UserProfile;
  onPlayGame: (game: GameDefinition) => void;
  onBack?: () => void;
  showHeader?: boolean;
}

export const MyGamesPage: React.FC<MyGamesPageProps> = ({
  profile,
  onPlayGame,
  onBack,
  showHeader = true,
}) => {
  const allAvailableGames = GameCatalog.getAll().map(catalogGameToDefinition);

  return (
    <div className="min-h-screen text-[#FFF0CF] pb-28 max-w-md md:max-w-xl lg:max-w-3xl mx-auto px-3.5 pt-3 select-none space-y-4 relative z-10">
      
      {/* 1. Header with Back Button */}
      {showHeader && (
        <div className="flex items-center justify-between gap-3 bg-[#352316] border border-[#81502B] text-[#FFF0CF] p-3.5 rounded-2xl shadow-xs">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                id="my-games-back-btn"
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
              <Gamepad2 className="w-5 h-5 text-[#FFD35A] shrink-0" />
              <h1 className="text-base font-black tracking-tight text-[#FFF0CF]">My Games</h1>
            </div>
          </div>
          <span className="text-xs font-bold text-[#E6C8A4] bg-[#442C1B] px-2.5 py-0.5 rounded-full border border-[#81502B]">
            {allAvailableGames.length} Games
          </span>
        </div>
      )}

      {/* 2. List of Games */}
      <div className="space-y-2.5">
        {allAvailableGames.map((g) => {
          const personalHighScore = profile.highScores?.[g.id] ?? 0;
          return (
            <div
              key={g.id}
              className="flex items-center justify-between p-3 rounded-2xl bg-[#352316] border border-[#81502B] hover:border-[#FFAA24]/60 transition-all shadow-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={g.thumbnailUrl || g.bannerUrl}
                  alt={g.title}
                  className="w-12 h-12 rounded-xl object-cover bg-[#24170F] border border-[#81502B] shrink-0"
                />
                <div className="min-w-0">
                  <h3 className="text-sm font-black text-[#FFF0CF] truncate">{g.title}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-[#E6C8A4] capitalize">{g.category}</span>
                    <span className="text-[10px] text-[#81502B]">•</span>
                    <span className="text-[11px] font-black text-[#FFD35A]">
                      Best: {personalHighScore > 0 ? `${personalHighScore.toLocaleString()} pts` : '-'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onPlayGame(g)}
                className="px-3.5 py-1.5 rounded-[12px] bg-gradient-to-r from-[#FFAA24] to-[#F47B20] hover:brightness-110 active:scale-95 text-[#24170F] text-xs font-black shrink-0 transition-transform cursor-pointer shadow-xs border-none"
              >
                Play
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default MyGamesPage;
