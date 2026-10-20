/**
 * Tournament Details & Registration Modal
 */

import React from 'react';
import { Tournament, GameDefinition } from '../types';
import { 
  X, 
  Trophy, 
  Users, 
  Gift, 
  Flame, 
  ArrowRight,
  ShieldCheck,
  Coins
} from 'lucide-react';
import { formatCurrencyETB } from '../utils/formatters';

interface TournamentModalProps {
  tournament: Tournament;
  game?: GameDefinition;
  onClose: () => void;
  onEnterTournament: (game: GameDefinition, tourneyId: string) => void;
}

export const TournamentModal: React.FC<TournamentModalProps> = ({
  tournament,
  game,
  onClose,
  onEnterTournament,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-[#24170F]/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-[#352316] rounded-2xl border border-[#81502B] shadow-2xl p-6 relative my-6 text-[#FFF0CF]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl bg-[#442C1B]/80 text-[#E6C8A4] hover:text-[#FFF0CF] hover:bg-[#442C1B] border border-[#81502B] z-10 transition-colors shadow-sm"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Tournament Hero Banner */}
        <div className="relative h-40 rounded-xl overflow-hidden mb-4 bg-[#24170F] border border-[#81502B]">
          <img
            src={tournament.bannerImage}
            alt={tournament.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#24170F] via-[#24170F]/40 to-transparent" />

          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-[#FFD35A] to-[#FFAA24] text-[#24170F] text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
              <Flame className="w-3 h-3 fill-current" /> Active Cup
            </span>
          </div>

          <div className="absolute bottom-3 left-3 right-3">
            <div className="text-[11px] text-[#E6C8A4] font-medium">Sponsor: {tournament.sponsor}</div>
            <h3 className="text-lg font-black text-[#FFF0CF] leading-tight">
              {tournament.title}
            </h3>
          </div>
        </div>

        {/* Prize Pool Highlight Block */}
        <div className="bg-[#442C1B] rounded-xl p-4 border border-[#81502B] mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#FFD35A]/15 border border-[#FFD35A]/30 flex items-center justify-center text-[#FFD35A]">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] text-[#E6C8A4] font-bold uppercase tracking-wider">
                Total Prize Pool
              </div>
              <div className="text-xl font-black text-[#FFD35A] font-mono leading-none">
                {formatCurrencyETB(tournament.prizePoolETB)}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] text-[#E6C8A4] font-semibold uppercase">Participants</div>
            <div className="text-sm font-bold text-[#FFF0CF] font-mono flex items-center gap-1.5 justify-end">
              <Users className="w-3.5 h-3.5 text-[#FFD35A]" />
              <span>{tournament.participantsCount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Prize Breakdown Ladder */}
        <div className="mb-5">
          <div className="text-xs font-bold text-[#E6C8A4] uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Gift className="w-3.5 h-3.5 text-[#FFD35A]" /> Prize Ladder
          </div>
          <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
            {tournament.prizes.map((p, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-[#24170F]/80 border border-[#81502B] flex items-center justify-between text-xs"
              >
                <span className="font-black text-[#FFD35A]">{p.rank}</span>
                <span className="text-[#FFF0CF] font-semibold text-right text-[11px]">{p.reward}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Enter Tournament Button */}
        {game ? (
          <button
            onClick={() => {
              onClose();
              onEnterTournament(game, tournament.id);
            }}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#FFD35A] to-[#FFAA24] hover:opacity-95 text-[#24170F] font-black text-sm active:scale-[0.98] transition-all shadow-lg shadow-[#FFAA24]/20 flex items-center justify-center gap-2 uppercase tracking-wider"
          >
            <span>ENTER CUP ({tournament.entryFeeEnergy * 10 || 10} COINS)</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        ) : (
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-[#442C1B] text-[#E6C8A4] hover:text-[#FFF0CF] font-bold text-xs border border-[#81502B]"
          >
            Close
          </button>
        )}

        <div className="mt-3 text-center text-[11px] text-[#E6C8A4] flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#FFD35A]" />
          <span>Scores are recorded on the official EthioTelecom Championship Leaderboard.</span>
        </div>
      </div>
    </div>
  );
};

