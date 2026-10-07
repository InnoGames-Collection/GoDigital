import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Plus,
  Calendar,
  X,
} from 'lucide-react';
import { DailyChallenge, PuzzleDifficulty, AdminRole } from '../types';
import { Badge } from '../components/Badge';
import { api } from '../services/api';

interface DailyChallengePageProps {
  currentRole: AdminRole;
}

export const DailyChallengePage: React.FC<DailyChallengePageProps> = ({ currentRole }) => {
  const [challenges, setChallenges] = useState<DailyChallenge[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [challengeDate, setChallengeDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [gameId, setGameId] = useState('royal-water-sort');
  const [title, setTitle] = useState('Daily Flow Conundrum');
  const [difficulty, setDifficulty] = useState<PuzzleDifficulty>('HARD');
  const [bonusCoins, setBonusCoins] = useState(30);
  const [targetScore, setTargetScore] = useState(1500);
  const [timeLimit, setTimeLimit] = useState(120);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canManage = ['SUPER_ADMIN', 'CONTENT_CREATOR'].includes(currentRole);

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      const res = await api.getDailyChallenges();
      setChallenges(res.challenges);
    } catch (err) {
      console.error('Failed to load daily challenges:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.createDailyChallenge({
        challenge_date: challengeDate,
        game_id: gameId,
        title,
        difficulty,
        bonus_coins: bonusCoins,
        target_score: targetScore,
        time_limit_seconds: timeLimit,
        status: 'SCHEDULED',
      });
      setIsModalOpen(false);
      fetchChallenges();
    } catch (err: any) {
      setError(err.message || 'Failed to schedule daily challenge.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Daily Brain Training Challenges</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Schedule high-retention daily cognitive streaks with coin rewards and qualification targets.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md shadow-sky-600/20 transition self-start"
          >
            <Plus size={15} />
            <span>Schedule Daily Challenge</span>
          </button>
        )}
      </div>

      {/* Challenges Schedule List */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 text-slate-400 border-b border-slate-800 font-mono">
              <tr>
                <th className="p-3.5 font-semibold">Challenge Date</th>
                <th className="p-3.5 font-semibold">Game Title</th>
                <th className="p-3.5 font-semibold">Challenge Name</th>
                <th className="p-3.5 font-semibold">Difficulty</th>
                <th className="p-3.5 font-semibold">Bonus Reward</th>
                <th className="p-3.5 font-semibold">Target Score</th>
                <th className="p-3.5 font-semibold">Time Limit</th>
                <th className="p-3.5 font-semibold">Participants</th>
                <th className="p-3.5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500">
                    Loading daily challenge calendar...
                  </td>
                </tr>
              ) : challenges.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500">
                    No daily challenges scheduled.
                  </td>
                </tr>
              ) : (
                challenges.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3.5 font-mono font-bold text-white flex items-center gap-2">
                      <Calendar size={13} className="text-sky-400" />
                      {c.challenge_date}
                    </td>
                    <td className="p-3.5 font-mono text-sky-400 font-bold">{c.game_id}</td>
                    <td className="p-3.5 font-semibold text-white">{c.title}</td>
                    <td className="p-3.5">
                      <Badge status={c.difficulty} size="sm" />
                    </td>
                    <td className="p-3.5 font-mono text-amber-400 font-bold">
                      +{c.bonus_coins} Coins
                    </td>
                    <td className="p-3.5 font-mono text-slate-300">{c.target_score} pts</td>
                    <td className="p-3.5 font-mono text-slate-300">{c.time_limit_seconds}s</td>
                    <td className="p-3.5 font-mono text-slate-400">
                      {c.participants_count || 0} ({c.completions_count || 0} won)
                    </td>
                    <td className="p-3.5">
                      <Badge status={c.status} size="sm" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400">
                <CalendarDays size={20} />
              </div>
              <h3 className="text-base font-bold text-white">Schedule Daily Brain Challenge</h3>
            </div>

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300 mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Challenge Date:</label>
                <input
                  type="date"
                  required
                  value={challengeDate}
                  onChange={(e) => setChallengeDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Game:</label>
                <select
                  value={gameId}
                  onChange={(e) => setGameId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-sky-500"
                >
                  <option value="royal-water-sort">Royal Water Sort</option>
                  <option value="emoji-iq">Emoji IQ</option>
                  <option value="bubble-shooter">Bubble Shooter</option>
                  <option value="helix-jump">Helix Jump</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Challenge Title:</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Difficulty:</label>
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
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Bonus Coins:</label>
                  <input
                    type="number"
                    min={5}
                    required
                    value={bonusCoins}
                    onChange={(e) => setBonusCoins(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Score:</label>
                  <input
                    type="number"
                    min={100}
                    required
                    value={targetScore}
                    onChange={(e) => setTargetScore(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Time Limit (Sec):</label>
                  <input
                    type="number"
                    min={30}
                    required
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 border border-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 shadow-md shadow-sky-600/20 transition disabled:opacity-50"
                >
                  {saving ? 'Scheduling...' : 'Confirm Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
