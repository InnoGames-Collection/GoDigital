/**
 * GoDigital - Official Game Catalog Discovery Page
 * Conforming to specification & target reference design:
 * 1. Primary catalog begins with the 12 games in exact requested order:
 *    Helix Jump, Flip Tile, Bubble Shooter, Emoji IQ, Royal Water Sort,
 *    Memory Match, Hill Climb, Sorting Ball, Block, Color Rush, Solitaire, Emoji Sorting Ball.
 * 2. Responsive two-column game grid (grid-cols-2) on mobile, tablet, and desktop screens.
 * 3. Premium card design with high-definition artwork, clean readable titles in warm cream (#FFF0CF),
 *    muted bronze borders (#81502B), and sunset amber play affordance (#FFAA24 / #FFD35A).
 * 4. Preserves debounced launch triggers to prevent duplicate session launches.
 */

import React, { useState, useMemo } from 'react';
import { GameDefinition, UserProfile } from '../types';
import { GameCatalog } from '../services/gameCatalog';
import { catalogGameToDefinition } from '../games/registry';
import { GameCard } from '../components/GameCard';
import { Search, X, Gamepad2 } from 'lucide-react';

interface GamesPageProps {
  games?: GameDefinition[];
  profile?: UserProfile;
  onLaunchGame: (game: GameDefinition) => void;
  initialCategory?: string;
  activeEntitlements?: Record<string, boolean>;
}

export const GamesPage: React.FC<GamesPageProps> = ({
  onLaunchGame,
  initialCategory = 'All Games',
  activeEntitlements = {},
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');

  // Categories with games (plus 'All Games')
  const categories = useMemo(() => {
    return GameCatalog.getCategoriesWithGames();
  }, []);

  // Filter games by category and search query while preserving mandatory order
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
    <div className="min-h-screen text-[#FFF0CF] pb-28 select-none relative z-10">
      <div className="max-w-md md:max-w-xl lg:max-w-3xl mx-auto px-3.5 sm:px-4 pt-3 space-y-4">
        
        {/* 1. SEARCH BAR */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#E6C8A4] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search games, categories, or genres..."
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-[#352316] hover:bg-[#442C1B] focus:bg-[#352316] text-[#FFF0CF] text-xs sm:text-sm font-bold border border-[#81502B] focus:border-[#FFAA24] outline-none transition-all placeholder:text-[#E6C8A4]/60 shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#442C1B] hover:bg-[#352316] text-[#E6C8A4] hover:text-[#FFF0CF] flex items-center justify-center transition-colors cursor-pointer border border-[#81502B]"
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
                className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs shrink-0 snap-start transition-all cursor-pointer active:scale-95 border ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#FFAA24] to-[#F47B20] text-[#24170F] border-[#FFD35A] shadow-xs shadow-[#FFAA24]/30 font-black'
                    : 'bg-[#352316] hover:bg-[#442C1B] border-[#81502B] hover:border-[#FFAA24]/50 text-[#E6C8A4] hover:text-[#FFF0CF]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* 3. TWO-COLUMN GAME GRID */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Gamepad2 className="w-4 h-4 text-[#FFD35A]" />
            <span className="text-xs font-black uppercase text-[#E6C8A4] tracking-wider">
              {selectedCategory} ({filteredGames.length})
            </span>
          </div>

          {filteredGames.length > 0 ? (
            <div 
              id="games-catalog-two-column-grid"
              className="grid grid-cols-2 gap-3 sm:gap-4"
            >
              {filteredGames.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  onPlay={onLaunchGame}
                  layout="grid"
                  hasActiveAccess={Boolean(activeEntitlements[game.id])}
                />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-[#352316] rounded-2xl border border-[#81502B] space-y-2">
              <p className="text-sm font-bold text-[#E6C8A4]">
                No games found matching "{searchQuery}"
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All Games');
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FFAA24] to-[#F47B20] text-[#24170F] text-xs font-black cursor-pointer transition-colors shadow-xs"
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

export default GamesPage;
