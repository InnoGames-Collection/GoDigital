/**
 * GameON Tele - Game Details & Instructions Modal
 */

import React from 'react';
import { GameDefinition } from '../types';
import { 
  X, 
  Play, 
  Star, 
  Gamepad2, 
  BookOpen, 
  ShieldCheck, 
  Trophy, 
  Flame, 
  Sparkles,
  Coins
} from 'lucide-react';

interface GameDetailsModalProps {
  game: GameDefinition | null;
  isOpen: boolean;
  onClose: () => void;
  onPlayGame: (game: GameDefinition) => void;
  hasActiveAccess?: boolean;
}

export const GameDetailsModal: React.FC<GameDetailsModalProps> = ({
  game,
  isOpen,
  onClose,
  onPlayGame,
  hasActiveAccess = false,
}) => {
  if (!isOpen || !game) return null;

  const isFreeDirectGame = game.id === 'candy-blast' || game.id === 'world-legends';
  const isCoinGame = !isFreeDirectGame && (game.accessType === 'COIN' || (!game.isFree && Boolean(game.requiresCoins)));
  const isSubscriptionGame = !isFreeDirectGame && game.accessType === 'SUBSCRIPTION';
  const coinCost = isFreeDirectGame ? 0 : (game.coinCost || 10);

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200 select-none">
      <div 
        className="w-full max-w-lg bg-[#181C29] rounded-t-3xl sm:rounded-3xl border border-[#282E3D] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-6 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner Artwork */}
        <div className="relative h-48 sm:h-56 w-full bg-[#121622] overflow-hidden shrink-0">
          <img
            src={game.bannerUrl || game.thumbnailUrl}
            alt={game.title}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#181C29] via-[#181C29]/40 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#121622]/70 hover:bg-[#202536] border border-[#282E3D] text-white flex items-center justify-center transition-colors cursor-pointer z-10"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-[#7C3AED] text-white text-[10px] font-black uppercase tracking-wider">
              {game.category}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#202536]/80 border border-[#282E3D] text-[#F5B942] text-[9.5px] font-bold">
              ★ {game.rating}
            </span>
          </div>

          <div className="absolute bottom-3 left-4 right-4 text-white">
            <h2 className="text-2xl font-black leading-tight drop-shadow-sm text-white">
              {game.title}
            </h2>
            <p className="text-xs text-[#AEB6C7] mt-0.5 line-clamp-1">
              {game.tagline}
            </p>
          </div>
        </div>

        {/* Modal Scroll Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-[#202536] border border-[#282E3D]">
              <div className="text-[10px] font-bold text-[#AEB6C7] uppercase">Access</div>
              <div className="text-xs font-black text-white mt-0.5">
                {isCoinGame ? `🪙 ${coinCost} Coins` : isSubscriptionGame ? 'Subscription' : 'Free Access'}
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#202536] border border-[#282E3D]">
              <div className="text-[10px] font-bold text-[#AEB6C7] uppercase">Plays</div>
              <div className="text-xs font-black text-white mt-0.5">
                {Math.floor(game.playsCount / 1000)}k+
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#202536] border border-[#282E3D]">
              <div className="text-[10px] font-bold text-[#AEB6C7] uppercase">Ranking</div>
              <div className="text-xs font-black text-[#22D3EE] mt-0.5">
                {game.leaderboardEnabled ? 'Per-Game' : 'Practice'}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">
              About the Game
            </h4>
            <p className="text-xs text-[#AEB6C7] leading-relaxed">
              {game.description}
            </p>
          </div>

          {/* Instructions */}
          {game.instructions && game.instructions.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-black text-white uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5 text-[#22D3EE]" />
                <span>How to Play</span>
              </div>
              <ul className="space-y-1">
                {game.instructions.map((inst, i) => (
                  <li key={i} className="text-xs text-[#AEB6C7] flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-[#202536] border border-[#282E3D] text-[#AEB6C7] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{inst}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Controls */}
          {game.controlsDescription && (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-black text-white uppercase tracking-wider">
                <Gamepad2 className="w-3.5 h-3.5 text-[#7C3AED]" />
                <span>Controls</span>
              </div>
              <p className="text-xs text-[#AEB6C7] bg-[#202536] p-2.5 rounded-xl border border-[#282E3D]">
                {game.controlsDescription}
              </p>
            </div>
          )}

          {/* Play Action */}
          <div className="pt-2">
            <button
              onClick={() => {
                onClose();
                onPlayGame(game);
              }}
              className="w-full py-3.5 px-4 rounded-[14px] font-black text-sm transition-all shadow-sm shadow-[#7C3AED]/30 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] bg-[#7C3AED] hover:bg-[#6D28D9] active:bg-[#5B21B6] text-white border-none"
            >
              <Play className="w-4 h-4 fill-current text-white" />
              <span>
                {isCoinGame && !hasActiveAccess ? `Unlock & Play (${coinCost} Coins)` : 'Play Now'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
