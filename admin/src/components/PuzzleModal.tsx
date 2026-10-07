import React, { useState, useEffect } from 'react';
import { Gamepad2, X, AlertCircle } from 'lucide-react';
import { PuzzleLevel, PuzzleDifficulty, PuzzleStatus } from '../types';

interface PuzzleModalProps {
  puzzle: PuzzleLevel | null; // null if creating
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<PuzzleLevel>) => Promise<void>;
}

export const PuzzleModal: React.FC<PuzzleModalProps> = ({
  puzzle,
  isOpen,
  onClose,
  onSave,
}) => {
  const [gameId, setGameId] = useState('royal-water-sort');
  const [levelNumber, setLevelNumber] = useState(1);
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState<PuzzleDifficulty>('MEDIUM');
  const [minMoves, setMinMoves] = useState(5);
  const [parTime, setParTime] = useState(60);
  const [hintCost, setHintCost] = useState(10);
  const [status, setStatus] = useState<PuzzleStatus>('ACTIVE');
  const [jsonText, setJsonText] = useState('{}');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (puzzle) {
      setGameId(puzzle.game_id);
      setLevelNumber(puzzle.level_number);
      setTitle(puzzle.title);
      setDifficulty(puzzle.difficulty);
      setMinMoves(puzzle.min_moves);
      setParTime(puzzle.par_time_seconds);
      setHintCost(puzzle.hint_cost_coins);
      setStatus(puzzle.status);
      setJsonText(JSON.stringify(puzzle.puzzle_data, null, 2));
    } else {
      setGameId('royal-water-sort');
      setLevelNumber(1);
      setTitle('New Puzzle Level');
      setDifficulty('MEDIUM');
      setMinMoves(6);
      setParTime(60);
      setHintCost(10);
      setStatus('ACTIVE');
      setJsonText(JSON.stringify({
        tubes: [["#ef4444", "#3b82f6"], ["#ef4444", "#3b82f6"], []],
        tubeCapacity: 4
      }, null, 2));
    }
  }, [puzzle, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let parsedJson: any;
    try {
      parsedJson = JSON.parse(jsonText);
    } catch (err: any) {
      setError(`Invalid JSON puzzle configuration: ${err.message}`);
      return;
    }

    setLoading(true);
    try {
      await onSave({
        game_id: gameId,
        level_number: Number(levelNumber),
        title,
        difficulty,
        min_moves: Number(minMoves),
        par_time_seconds: Number(parTime),
        hint_cost_coins: Number(hintCost),
        status,
        puzzle_data: parsedJson,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save puzzle level.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400">
            <Gamepad2 size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              {puzzle ? `Edit Level ${puzzle.level_number} (${puzzle.game_id})` : 'Create New Puzzle Level'}
            </h3>
            <p className="text-xs text-slate-400">
              Configure progression metrics, minimum moves, and hint pricing.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300 mb-4 flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Game Identifier:</label>
              <select
                disabled={!!puzzle}
                value={gameId}
                onChange={(e) => setGameId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-sky-500 disabled:opacity-60"
              >
                <option value="royal-water-sort">Royal Water Sort (royal-water-sort)</option>
                <option value="emoji-iq">Emoji IQ (emoji-iq)</option>
                <option value="bubble-shooter">Bubble Shooter (bubble-shooter)</option>
                <option value="helix-jump">Helix Jump (helix-jump)</option>
                <option value="memory-match">Memory Match (memory-match)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Level Number:</label>
              <input
                type="number"
                min={1}
                required
                disabled={!!puzzle}
                value={levelNumber}
                onChange={(e) => setLevelNumber(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-sky-500 disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Level Title:</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Difficulty Tier:</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as PuzzleDifficulty)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-sky-500"
              >
                <option value="EASY">EASY</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HARD">HARD</option>
                <option value="EXPERT">EXPERT</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Minimum Solution Moves:</label>
              <input
                type="number"
                min={1}
                required
                value={minMoves}
                onChange={(e) => setMinMoves(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Par Time (Seconds):</label>
              <input
                type="number"
                min={10}
                required
                value={parTime}
                onChange={(e) => setParTime(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Hint Cost (Coins):</label>
              <input
                type="number"
                min={0}
                required
                value={hintCost}
                onChange={(e) => setHintCost(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Status:</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PuzzleStatus)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-sky-500"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="DRAFT">DRAFT</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Puzzle Data Payload (JSON):
            </label>
            <textarea
              required
              rows={6}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-emerald-400 focus:outline-hidden focus:border-sky-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 border border-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 shadow-md shadow-sky-600/20 transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : puzzle ? 'Update Level' : 'Create Level'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
