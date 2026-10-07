import React, { useState, useEffect } from 'react';
import { GameDefinition, UserProfile } from '../../types';
import { FlipTileScreen, FlipTileProgress } from './types';
import { loadFlipTileProgress } from './storage';
import { FlipTileAudio } from './audio';
import { FlipTileMenu } from './FlipTileMenu';
import { FlipTileLevelSelect } from './FlipTileLevelSelect';
import { FlipTileGameplay } from './FlipTileGameplay';

interface FlipTileGameProps {
  game?: GameDefinition;
  profile?: UserProfile;
  onGameOver?: (score: number, durationSeconds: number) => void;
  onExit: () => void;
  isAudioEnabled?: boolean;
}

export const FlipTileGame: React.FC<FlipTileGameProps> = ({
  onGameOver,
  onExit,
  isAudioEnabled = true,
}) => {
  const [screen, setScreen] = useState<FlipTileScreen>('menu');
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [progress, setProgress] = useState<FlipTileProgress>(() => loadFlipTileProgress());

  // Synchronize audio mute state with portal settings
  useEffect(() => {
    FlipTileAudio.setMusicMuted(!isAudioEnabled);
    FlipTileAudio.setSoundMuted(!isAudioEnabled);
  }, [isAudioEnabled]);

  // Clean up BGM on unmount
  useEffect(() => {
    return () => {
      FlipTileAudio.stopBgm();
    };
  }, []);

  // Android device Back button support
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      if (screen === 'gameplay') {
        setScreen('menu');
      } else if (screen === 'level-select') {
        setScreen('menu');
      } else {
        onExit();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [screen, onExit]);

  const handlePlayLevel = () => {
    const loaded = loadFlipTileProgress();
    setProgress(loaded);
    setCurrentLevel(loaded.unlockedLevel);
    setScreen('gameplay');
  };

  const handleSelectLevel = (lvlNum: number) => {
    setCurrentLevel(lvlNum);
    setScreen('gameplay');
  };

  const handleNextLevel = (nextLvl: number) => {
    const loaded = loadFlipTileProgress();
    setProgress(loaded);
    setCurrentLevel(nextLvl);
    setScreen('gameplay');
  };

  const handleSessionComplete = (score: number, durationSeconds: number) => {
    setProgress(loadFlipTileProgress());
    if (onGameOver) {
      onGameOver(score, durationSeconds);
    }
  };

  return (
    <div className="w-full h-full max-w-md mx-auto flex flex-col items-center justify-center overflow-hidden bg-[#1A162B] font-['Plus_Jakarta_Sans',sans-serif]">
      {screen === 'menu' && (
        <FlipTileMenu
          progress={progress}
          onPlayLevel={handlePlayLevel}
          onOpenLevelSelect={() => {
            setProgress(loadFlipTileProgress());
            setScreen('level-select');
          }}
          onExit={onExit}
          isAudioEnabled={isAudioEnabled}
        />
      )}

      {screen === 'level-select' && (
        <FlipTileLevelSelect
          progress={progress}
          onSelectLevel={handleSelectLevel}
          onBack={() => setScreen('menu')}
        />
      )}

      {screen === 'gameplay' && (
        <FlipTileGameplay
          levelNumber={currentLevel}
          onExitToLevelSelect={() => {
            setProgress(loadFlipTileProgress());
            setScreen('menu');
          }}
          onNextLevel={handleNextLevel}
          onSessionComplete={handleSessionComplete}
        />
      )}
    </div>
  );
};
