import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Clock,
  Coins,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { PuzzleLevel, AdminRole } from '../types';
import { Badge } from '../components/Badge';
import { PuzzleModal } from '../components/PuzzleModal';
import { api } from '../services/api';

interface PuzzleCatalogPageProps {
  currentRole: AdminRole;
}

export const PuzzleCatalogPage: React.FC<PuzzleCatalogPageProps> = ({ currentRole }) => {
  const [puzzles, setPuzzles] = useState<PuzzleLevel[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [selectedGame, setSelectedGame] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activePuzzle, setActivePuzzle] = useState<PuzzleLevel | null>(null);

  const canEdit = ['SUPER_ADMIN', 'CONTENT_CREATOR'].includes(currentRole);

  const fetchPuzzles = async () => {
    setLoading(true);
    try {
      const res = await api.getPuzzles({
        page,
        pageSize: 15,
        gameId: selectedGame || undefined,
        difficulty: selectedDifficulty || undefined,
        search: searchQuery || undefined,
      });
      setPuzzles(res.items);
      setTotalPages(res.pagination.totalPages);
      setTotalCount(res.pagination.total);
    } catch (err) {
      console.error('Failed to fetch puzzles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPuzzles();
  }, [page, selectedGame, selectedDifficulty]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchPuzzles();
  };

  const handleSavePuzzle = async (data: Partial<PuzzleLevel>) => {
    if (activePuzzle) {
      await api.updatePuzzle(activePuzzle.id, data);
    } else {
      await api.createPuzzle(data);
    }
    fetchPuzzles();
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Puzzle Catalog & Progression Controller</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage {totalCount} puzzle levels, minimum mathematical solutions, par times, and coin hint pricing.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={() => {
              setActivePuzzle(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md shadow-sky-600/20 transition self-start"
          >
            <Plus size={15} />
            <span>Add Puzzle Level</span>
          </button>
        )}
      </div>

      {/* Filter Ribbon */}
      <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 flex flex-wrap items-center gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[220px]">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search level title or game..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-hidden focus:border-sky-500"
            />
          </div>
        </form>

        {/* Game Filter */}
        <div className="flex items-center gap-2 text-xs">
          <Filter size={14} className="text-slate-500" />
          <select
            value={selectedGame}
            onChange={(e) => {
              setSelectedGame(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-hidden focus:border-sky-500"
          >
            <option value="">All Games</option>
            <option value="royal-water-sort">Royal Water Sort</option>
            <option value="emoji-iq">Emoji IQ</option>
            <option value="bubble-shooter">Bubble Shooter</option>
            <option value="helix-jump">Helix Jump</option>
            <option value="memory-match">Memory Match</option>
          </select>
        </div>

        {/* Difficulty Filter */}
        <div>
          <select
            value={selectedDifficulty}
            onChange={(e) => {
              setSelectedDifficulty(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-hidden focus:border-sky-500"
          >
            <option value="">All Difficulties</option>
            <option value="EASY">EASY</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HARD">HARD</option>
            <option value="EXPERT">EXPERT</option>
          </select>
        </div>
      </div>

      {/* Puzzles Table */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 text-slate-400 border-b border-slate-800 font-mono">
              <tr>
                <th className="p-3.5 font-semibold">Game Title</th>
                <th className="p-3.5 font-semibold">Level #</th>
                <th className="p-3.5 font-semibold">Level Name</th>
                <th className="p-3.5 font-semibold">Difficulty</th>
                <th className="p-3.5 font-semibold">Min Moves</th>
                <th className="p-3.5 font-semibold">Par Time</th>
                <th className="p-3.5 font-semibold">Hint Price</th>
                <th className="p-3.5 font-semibold">Version</th>
                <th className="p-3.5 font-semibold">Status</th>
                {canEdit && <th className="p-3.5 font-semibold text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
                      <span>Querying PostgreSQL puzzle catalog...</span>
                    </div>
                  </td>
                </tr>
              ) : puzzles.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-500">
                    No puzzle levels match the selected criteria.
                  </td>
                </tr>
              ) : (
                puzzles.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3.5 font-mono font-bold text-sky-400">{p.game_id}</td>
                    <td className="p-3.5 font-mono text-white">Lvl {p.level_number}</td>
                    <td className="p-3.5 font-semibold text-white">{p.title}</td>
                    <td className="p-3.5">
                      <Badge status={p.difficulty} size="sm" />
                    </td>
                    <td className="p-3.5 font-mono text-slate-300">{p.min_moves} moves</td>
                    <td className="p-3.5 font-mono text-slate-300 flex items-center gap-1">
                      <Clock size={12} className="text-slate-500" />
                      {p.par_time_seconds}s
                    </td>
                    <td className="p-3.5 font-mono text-amber-400">
                      <span className="flex items-center gap-1 font-bold">
                        <Coins size={12} />
                        {p.hint_cost_coins}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-400">v{p.version}</td>
                    <td className="p-3.5">
                      <Badge status={p.status} size="sm" />
                    </td>
                    {canEdit && (
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => {
                            setActivePuzzle(p);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded-lg transition"
                          title="Tune level difficulty curve"
                        >
                          <Edit2 size={15} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Server-Side Pagination Controls */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing Page <span className="text-white font-bold">{page}</span> of{' '}
            <span className="text-white font-bold">{totalPages || 1}</span> ({totalCount} levels total)
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1 || loading}
              onClick={() => setPage(page - 1)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 disabled:opacity-40 transition"
            >
              <ChevronLeft size={14} />
              <span>Previous</span>
            </button>
            <button
              disabled={page >= totalPages || loading}
              onClick={() => setPage(page + 1)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 disabled:opacity-40 transition"
            >
              <span>Next</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Modal */}
      <PuzzleModal
        puzzle={activePuzzle}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePuzzle}
      />
    </div>
  );
};
