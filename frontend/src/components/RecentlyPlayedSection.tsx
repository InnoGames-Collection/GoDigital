/**
 * GameON Tele - Recently Played Games Horizontal Strip
 * Only renders when the user has actually played games, showing a clean horizontal strip.
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
        <History className="w-4 h-4 text-[#22D3EE]" />
        <h2 className="text-sm sm:text-base font-black text-white tracking-tight uppercase">
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
            className="group flex items-center gap-2.5 p-2 rounded-2xl bg-[#181C29] hover:bg-[#202536] border border-[#282E3D] hover:border-[#7C3AED]/50 transition-all cursor-pointer shrink-0 snap-start select-none w-52 sm:w-60 shadow-xs"
          >
            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#121622] shrink-0">
              <img
                src={game.thumbnailUrl || game.bannerUrl}
                alt={game.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
            </div>

            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-black text-white truncate">
                {game.title}
              </h4>
              <span className="text-[10px] text-[#AEB6C7] font-medium capitalize">
                {game.category}
              </span>
            </div>

            <div className="w-7 h-7 rounded-[9px] bg-[#7C3AED] group-hover:bg-[#6D28D9] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-all">
              <Play className="w-3.5 h-3.5 fill-current" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
