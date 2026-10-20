/**
 * GoDigital - Recently Played Games Horizontal Strip
 * Conforming to reference design & warm sunset palette:
 * - Surface #352316 with subtle bronze border #81502B
 * - Sunset amber #FFAA24 highlights and warm cream typography #FFF0CF
 */

import React from 'react';
import { GameDefinition } from '../types';
import { Play, History } from 'lucide-react';

interface RecentlyPlayedSectionProps {
  games: GameDefinition[];
  onPlayGame: (game: GameDefinition) => void;
}

export const RecentlyPlayedSection: React.FC<RecentlyPlayedSectionProps> = ({
  games,
  onPlayGame,
}) => {
  if (!games || games.length === 0) return null;

  return (
    <section id="home-recently-played" className="space-y-2.5">
      <div className="flex items-center gap-2 px-1">
        <History className="w-4 h-4 text-[#FFAA24]" />
        <h2 className="text-sm sm:text-base font-black text-[#FFF0CF] tracking-tight">
          Recently Played
        </h2>
      </div>

      <div 
        className="flex gap-2.5 overflow-x-auto scrollbar-none pb-1 snap-x snap-mandatory"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {games.map((game) => (
          <div
            key={game.id}
            onClick={() => onPlayGame(game)}
            className="group flex items-center gap-2.5 p-2 rounded-2xl bg-[#352316] hover:bg-[#442C1B] border border-[#81502B] hover:border-[#FFAA24]/60 transition-all cursor-pointer shrink-0 snap-start select-none w-52 sm:w-60 shadow-xs"
          >
            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#24170F] shrink-0 border border-[#81502B]">
              <img
                src={game.thumbnailUrl || game.bannerUrl}
                alt={game.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
            </div>

            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-black text-[#FFF0CF] truncate group-hover:text-[#FFD35A] transition-colors">
                {game.title}
              </h4>
              <span className="text-[10px] text-[#E6C8A4] font-medium capitalize">
                {game.category}
              </span>
            </div>

            <div className="w-7 h-7 rounded-[9px] bg-gradient-to-r from-[#FFAA24] to-[#F47B20] text-[#24170F] flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-all">
              <Play className="w-3.5 h-3.5 fill-current" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RecentlyPlayedSection;
