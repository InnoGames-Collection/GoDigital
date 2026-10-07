/**
 * GameON Tele - Official Game Catalog Discovery Page
 * 
 * Category-driven discovery:
 * - Category filter pills: [ All Games ] [ Action ] [ Arcade ] [ Puzzle ] [ Racing ] [ Sports ] [ Board ] [ Music ]
 * - Only displays categories that currently contain games (except All Games).
 * - Instant search filter across 100+ scalable games architecture.
 * - Large banner-style cards with clear access indicators (FREE, COIN, SUBSCRIPTION).
 */

import React, { useState, useMemo } from 'react';
import { GameDefinition, UserProfile } from '../types';
import { GameCatalog } from '../services/gameCatalog';
import { catalogGameToDefinition } from '../games/registry';
import { GameCard } from '../components/GameCard';
import { GameDetailsModal } from '../components/GameDetailsModal';
import { Search, Sparkles, Filter, X } from 'lucide-react';

interface GamesPageProps {
  games: GameDefinition[];
  profile: UserProfile;
  onLaunchGame: (game: GameDefinition) => void;
  initialCategory?: string;
  activeEntitlements?: Record<string, boolean>;
}

export const GamesPage: React.FC<GamesPageProps> = ({
  games,
  profile,
  onLaunchGame,
  initialCategory = 'All Games',
  activeEntitlements = {},
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGameForDetails, setSelectedGameForDetails] = useState<GameDefinition | null>(null);

  // Categories with games (plus 'All Games')
  const categories = useMemo(() => {
    return GameCatalog.getCategoriesWithGames();
  }, []);

  // Filter games by category and search query
  const filteredGames = useMemo(() => {
    let result = GameCatalog.getAll();

    if (selectedCategory !== 'All Games') {
      result = result.filter(
        (g) => g.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (g) =>
          g.gameName.toLowerCase().includes(q) ||
          g.titleAmharic.includes(searchQuery) ||
          g.category.toLowerCase().includes(q) ||
          g.tagline.toLowerCase().includes(q) ||
          g.genre.toLowerCase().includes(q)
      );
    }

    return result.map(catalogGameToDefinition);
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-[#0B0D14] text-white pb-28 select-none">
      <div className="max-w-md md:max-w-xl lg:max-w-3xl mx-auto px-3.5 sm:px-4 pt-3 space-y-4">
        
        {/* Game Details Modal */}
        <GameDetailsModal
          game={selectedGameForDetails}
          isOpen={Boolean(selectedGameForDetails)}
          onClose={() => setSelectedGameForDetails(null)}
          onPlayGame={onLaunchGame}
          hasActiveAccess={selectedGameForDetails ? Boolean(activeEntitlements[selectedGameForDetails.id]) : false}
        />

        {/* 1. SEARCH BAR */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#70798D] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search games, categories, or tags..."
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-[#181C29] hover:bg-[#202536] focus:bg-[#181C29] text-white text-xs sm:text-sm font-bold border border-[#282E3D] focus:border-[#7C3AED] outline-none transition-all placeholder:text-[#70798D] shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#202536] hover:bg-[#282E3D] text-[#AEB6C7] hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-[#282E3D]"
              aria-label="Clear search"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* 2. CATEGORY FILTER PILLS */}
        <div 
          className="flex gap-2 overflow-x-auto scrollbar-none pb-1 snap-x snap-mandatory"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs shrink-0 snap-start transition-all cursor-pointer active:scale-95 ${
                  isSelected
                    ? 'bg-[#7C3AED] text-white shadow-xs shadow-[#7C3AED]/30 font-black'
                    : 'bg-[#181C29] hover:bg-[#202536] border border-[#282E3D] hover:border-[#7C3AED]/40 text-[#AEB6C7] hover:text-white'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* 3. CATALOG GRID */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-black uppercase text-[#AEB6C7] tracking-wider">
              {selectedCategory} ({filteredGames.length})
            </span>
          </div>

          {filteredGames.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {filteredGames.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  onPlay={onLaunchGame}
                  onClickDetails={(g) => setSelectedGameForDetails(g)}
                  layout="grid"
                  hasActiveAccess={Boolean(activeEntitlements[game.id])}
                />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-[#181C29] rounded-2xl border border-[#282E3D] space-y-2">
              <p className="text-sm font-bold text-[#AEB6C7]">
                No games found matching "{searchQuery}"
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All Games');
                }}
                className="px-4 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-black cursor-pointer transition-colors shadow-xs"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
