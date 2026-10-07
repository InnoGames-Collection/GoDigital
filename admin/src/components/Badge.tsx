import React from 'react';
import { AdminRole, PuzzleDifficulty, PuzzleStatus, ChallengeStatus } from '../types';

interface BadgeProps {
  status?: string | PuzzleDifficulty | PuzzleStatus | ChallengeStatus | AdminRole;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ status = 'ACTIVE', size = 'sm' }) => {
  const s = String(status).toUpperCase();
  const pad = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  let color = 'bg-slate-800 text-slate-300 border-slate-700';

  switch (s) {
    case 'ACTIVE':
    case 'SUCCESS':
    case 'APPROVED':
    case 'COMPLETED':
      color = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      break;
    case 'SCHEDULED':
    case 'PENDING':
    case 'UPCOMING':
      color = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      break;
    case 'DRAFT':
    case 'PAUSED':
      color = 'bg-slate-700/40 text-slate-300 border-slate-600/40';
      break;
    case 'ARCHIVED':
    case 'CANCELLED':
    case 'FAILED':
    case 'SUSPENDED':
      color = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      break;
    // Difficulty
    case 'EASY':
      color = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      break;
    case 'MEDIUM':
      color = 'bg-sky-500/15 text-sky-300 border-sky-500/30';
      break;
    case 'HARD':
      color = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      break;
    case 'EXPERT':
      color = 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      break;
    // Roles
    case 'SUPER_ADMIN':
      color = 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 font-mono';
      break;
    case 'CONTENT_CREATOR':
      color = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-mono';
      break;
    case 'OPERATIONS_MANAGER':
      color = 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-mono';
      break;
    case 'AUDITOR':
      color = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-mono';
      break;
  }

  return (
    <span className={`inline-flex items-center font-semibold rounded-full border ${pad} ${color}`}>
      {s.replace(/_/g, ' ')}
    </span>
  );
};
