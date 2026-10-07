/**
 * Official telebirr SuperApp Game Center Launcher Modal - GoDigital
 * High-performance mobile container for GoDigital (12 Games).
 */

import React from 'react';
import { GameDefinition, UserProfile, GameSessionResult } from '../types';
import { HelixJumpGame } from '../games/helixJump';
import { BubbleShooterGame } from '../games/bubbleShooter/BubbleShooterGame';
import { EmojiIqGame } from '../games/emojiIq/EmojiIqGame';
import { RoyalWaterSortGame } from '../games/royalWaterSort';
import { HillRiderGame } from '../games/hillRider/HillRiderGame';
import { SortingBallsGame } from '../games/sortingBalls/SortingBallsGame';
import { PuzzleBlockGame } from '../games/puzzleBlock/PuzzleBlockGame';
import { MemoryMatchGame } from '../games/memoryMatch/MemoryMatchGame';
import { ColorRushGame } from '../games/colorRush/ColorRushGame';
import { SolitaireGame } from '../games/solitaire/SolitaireGame';
import { EmojiSortingBallGame } from '../games/emojiSortingBall/EmojiSortingBallGame';
import { FlipTileGame } from '../games/flipTile';
import { InteractiveGameRunner } from '../games/interactiveSimulator';

interface GameLauncherModalProps {
  game: GameDefinition;
  profile: UserProfile;
  lastResult: GameSessionResult | null;
  onClose: () => void;
  onGameOver: (finalScore: number, durationSeconds: number) => void;
  onPlayAgain?: () => void;
  isAudioEnabled?: boolean;
}

export const GameLauncherModal: React.FC<GameLauncherModalProps> = ({
  game,
  profile,
  lastResult,
  onClose,
  onGameOver,
  onPlayAgain,
  isAudioEnabled = true,
}) => {
  const handleGameEnd = (scoreOrResult: any, duration?: number) => {
    if (typeof scoreOrResult === 'object' && scoreOrResult !== null) {
      onGameOver(Number(scoreOrResult.score) || 0, Number(scoreOrResult.durationSeconds) || duration || 30);
    } else {
      onGameOver(Number(scoreOrResult) || 0, duration || 30);
    }
  };

  // Dedicated routes for GoDigital games
  
  if (game.id === 'helix-jump') {
    return (
      <div className="fixed inset-0 z-50 bg-[#090A10] flex flex-col justify-center items-center overflow-hidden animate-in fade-in duration-200 font-['Plus_Jakarta_Sans',sans-serif] touch-none overscroll-none select-none">
        <HelixJumpGame
          onExit={onClose}
        />
      </div>
    );
  }

  if (game.id === 'bubble-shooter') {
    return (
      <div className="fixed inset-0 z-50 bg-[#090A10] flex flex-col justify-center items-center overflow-hidden animate-in fade-in duration-200 font-['Plus_Jakarta_Sans',sans-serif] touch-none overscroll-none select-none">
        <BubbleShooterGame
          game={game}
          profile={profile}
          onExit={onClose}
          onGameOver={(score, duration) => handleGameEnd(score, duration)}
          isAudioEnabled={isAudioEnabled}
        />
      </div>
    );
  }

  if (game.id === 'emoji-iq') {
    return (
      <div className="fixed inset-0 z-50 bg-[#090A10] flex flex-col justify-center items-center overflow-hidden animate-in fade-in duration-200 font-['Plus_Jakarta_Sans',sans-serif] touch-none overscroll-none select-none">
        <EmojiIqGame
          onClose={onClose}
          onGameCompleted={(score) => handleGameEnd(score, 60)}
        />
      </div>
    );
  }

  if (game.id === 'royal-water-sort') {
    return (
      <div className="fixed inset-0 z-50 bg-[#090A10] flex flex-col justify-center items-center overflow-hidden animate-in fade-in duration-200 font-['Plus_Jakarta_Sans',sans-serif] touch-none overscroll-none select-none">
        <RoyalWaterSortGame
          game={game}
          profile={profile}
          onExit={onClose}
          onGameOver={(score, duration) => handleGameEnd(score, duration)}
          isAudioEnabled={isAudioEnabled}
        />
      </div>
    );
  }

  if (game.id === 'hill-rider') {
    return (
      <div className="fixed inset-0 z-50 bg-[#090A10] flex flex-col justify-center items-center overflow-hidden animate-in fade-in duration-200 font-['Plus_Jakarta_Sans',sans-serif] touch-none overscroll-none select-none">
        <HillRiderGame
          game={game}
          profile={profile}
          onExit={onClose}
          onGameOver={(score, duration) => handleGameEnd(score, duration)}
          isAudioEnabled={isAudioEnabled}
        />
      </div>
    );
  }

  if (game.id === 'sorting-balls') {
    return (
      <div className="fixed inset-0 z-50 bg-[#090A10] flex flex-col justify-center items-center overflow-hidden animate-in fade-in duration-200 font-['Plus_Jakarta_Sans',sans-serif] touch-none overscroll-none select-none">
        <SortingBallsGame
          game={game}
          profile={profile}
          onExit={onClose}
          onGameOver={(score, duration) => handleGameEnd(score, duration)}
          isAudioEnabled={isAudioEnabled}
        />
      </div>
    );
  }

  if (game.id === 'puzzle-block') {
    return (
      <div className="fixed inset-0 z-50 bg-[#090A10] flex flex-col justify-center items-center overflow-hidden animate-in fade-in duration-200 font-['Plus_Jakarta_Sans',sans-serif] touch-none overscroll-none select-none">
        <PuzzleBlockGame
          onExit={onClose}
        />
      </div>
    );
  }

  if (game.id === 'memory-match') {
    return (
      <div className="fixed inset-0 z-50 bg-[#090A10] flex flex-col justify-center items-center overflow-hidden animate-in fade-in duration-200 font-['Plus_Jakarta_Sans',sans-serif] touch-none overscroll-none select-none">
        <MemoryMatchGame
          game={game}
          onExit={onClose}
          onGameOver={(score, duration) => handleGameEnd(score, duration)}
          isAudioEnabled={isAudioEnabled}
        />
      </div>
    );
  }

  if (game.id === 'color-rush') {
    return (
      <div className="fixed inset-0 z-50 bg-[#090A10] flex flex-col justify-center items-center overflow-hidden animate-in fade-in duration-200 font-['Plus_Jakarta_Sans',sans-serif] touch-none overscroll-none select-none">
        <ColorRushGame
          game={game}
          profile={profile}
          onExit={onClose}
          onGameOver={(score, duration) => handleGameEnd(score, duration)}
          isAudioEnabled={isAudioEnabled}
        />
      </div>
    );
  }

  if (game.id === 'solitaire') {
    return (
      <div className="fixed inset-0 z-50 bg-[#090A10] flex flex-col justify-center items-center overflow-hidden animate-in fade-in duration-200 font-['Plus_Jakarta_Sans',sans-serif] touch-none overscroll-none select-none">
        <SolitaireGame
          onExit={onClose}
        />
      </div>
    );
  }

  if (game.id === 'emoji-sorting-ball') {
    return (
      <div className="fixed inset-0 z-50 bg-[#090A10] flex flex-col justify-center items-center overflow-hidden animate-in fade-in duration-200 font-['Plus_Jakarta_Sans',sans-serif] touch-none overscroll-none select-none">
        <EmojiSortingBallGame
          game={game}
          profile={profile}
          onExit={onClose}
          onGameOver={(score, duration) => handleGameEnd(score, duration)}
          isAudioEnabled={isAudioEnabled}
        />
      </div>
    );
  }

  if (game.id === 'flip-tile') {
    return (
      <div className="fixed inset-0 z-50 bg-[#090A10] flex flex-col justify-center items-center overflow-hidden animate-in fade-in duration-200 font-['Plus_Jakarta_Sans',sans-serif] touch-none overscroll-none select-none">
        <FlipTileGame
          game={game}
          profile={profile}
          onExit={onClose}
          onGameOver={(score, duration) => handleGameEnd(score, duration)}
          isAudioEnabled={isAudioEnabled}
        />
      </div>
    );
  }

  // Fallback simulator for unexpected game IDs
  return (
    <div className="fixed inset-0 z-50 bg-[#090A10] flex flex-col justify-center items-center overflow-hidden animate-in fade-in duration-200 font-['Plus_Jakarta_Sans',sans-serif] touch-none overscroll-none select-none">
      <InteractiveGameRunner
        game={game}
        onGameOver={(score, duration) => handleGameEnd(score, duration)}
        onRequestRevive={() => {}}
        isAudioEnabled={isAudioEnabled}
      />
    </div>
  );
};
