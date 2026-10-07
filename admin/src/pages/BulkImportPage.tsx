import React, { useState } from 'react';
import { UploadCloud, CheckCircle2, AlertTriangle, FileCode, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

const DEFAULT_TEMPLATE = JSON.stringify(
  [
    {
      game_id: "royal-water-sort",
      level_number: 10,
      title: "Royal Crimson Cascade",
      category: "puzzle",
      difficulty: "HARD",
      min_moves: 14,
      par_time_seconds: 90,
      hint_cost_coins: 15,
      stars_to_unlock: 0,
      status: "ACTIVE",
      puzzle_data: {
        tubes: [
          ["#ef4444", "#3b82f6", "#10b981", "#f59e0b"],
          ["#10b981", "#f59e0b", "#ef4444", "#3b82f6"],
          ["#3b82f6", "#ef4444", "#f59e0b", "#10b981"],
          ["#f59e0b", "#10b981", "#3b82f6", "#ef4444"],
          [],
          []
        ],
        tubeCapacity: 4
      },
      solution_data: {
        moves: 14,
        keyTubes: [0, 4, 1, 5]
      }
    },
    {
      game_id: "emoji-iq",
      level_number: 15,
      title: "Master Logic Matrix",
      category: "brain",
      difficulty: "EXPERT",
      min_moves: 4,
      par_time_seconds: 60,
      hint_cost_coins: 15,
      stars_to_unlock: 0,
      status: "ACTIVE",
      puzzle_data: {
        equation: "🦁 * 🐯 = 48; 🐯 + 🐻 = 14; 🐻 * 🦁 = 32; 🦁 = ?",
        options: [4, 6, 8, 12],
        answer: 8
      },
      solution_data: {
        correct: 8
      }
    }
  ],
  null,
  2
);

export const BulkImportPage: React.FC = () => {
  const [jsonText, setJsonText] = useState(DEFAULT_TEMPLATE);
  const [overwrite, setOverwrite] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    summary?: { totalReceived: number; inserted: number; updated: number };
    error?: string;
  } | null>(null);

  const handleValidateAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);

    let parsed: any;
    try {
      parsed = JSON.parse(jsonText);
    } catch (err: any) {
      setResult({
        success: false,
        message: 'JSON Syntax Error',
        error: `Could not parse JSON payload: ${err.message}`,
      });
      return;
    }

    if (!Array.isArray(parsed)) {
      setResult({
        success: false,
        message: 'Schema Violation',
        error: 'Root JSON payload must be an Array of level objects.',
      });
      return;
    }

    setLoading(true);
    try {
      const res = await api.bulkImportPuzzles(parsed, overwrite);
      setResult({
        success: true,
        message: res.message,
        summary: res.summary,
      });
    } catch (err: any) {
      setResult({
        success: false,
        message: 'Transaction Failed & Rolled Back',
        error: err.message || 'Database transaction error.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Transactional Bulk Puzzle Importer</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Atomically import or update entire puzzle level progression curves with Zod schema verification and instant PostgreSQL rollback protection.
        </p>
      </div>

      {result && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${
            result.success
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
          }`}
        >
          {result.success ? (
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle size={18} className="text-rose-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <div className="font-bold">{result.message}</div>
            {result.error && <div className="text-[11px] opacity-80 mt-1 font-mono">{result.error}</div>}
            {result.summary && (
              <div className="mt-2 font-mono text-[11px] flex gap-4 text-emerald-300">
                <span>Received: {result.summary.totalReceived}</span>
                <span>Inserted New: {result.summary.inserted}</span>
                <span>Updated Existing: {result.summary.updated}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleValidateAndSubmit} className="space-y-4">
        <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <FileCode size={15} className="text-sky-400" />
              <span>Puzzle Levels JSON Batch Array</span>
            </div>
            <button
              type="button"
              onClick={() => setJsonText(DEFAULT_TEMPLATE)}
              className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 transition"
            >
              <RefreshCw size={12} />
              <span>Reset Template</span>
            </button>
          </div>

          <textarea
            required
            rows={16}
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-emerald-400 focus:outline-hidden focus:border-sky-500"
          />

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={overwrite}
                onChange={(e) => setOverwrite(e.target.checked)}
                className="rounded border-slate-800 text-sky-600 focus:ring-0"
              />
              <span>Overwrite existing levels (ON CONFLICT UPDATE & increment version)</span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md shadow-sky-600/20 transition disabled:opacity-50"
            >
              <UploadCloud size={16} />
              <span>{loading ? 'Executing Transaction...' : 'Commit Import Batch'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
