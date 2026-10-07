import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { FlipTileLevel, TileItem, TurnOwner } from './types';
import { getFlipTileLevel } from './levels';
import { FlipTileBotAI } from './bot';
import { FlipTileAudio } from './audio';
import { FlipTileResultModal } from './FlipTileResultModal';
import { saveLevelResult, loadFlipTileProgress } from './storage';

interface FlipTileGameplayProps {
  levelNumber: number;
  onExitToLevelSelect: () => void;
  onNextLevel: (nextLvl: number) => void;
  onSessionComplete?: (score: number, durationSeconds: number) => void;
}

export const FlipTileGameplay: React.FC<FlipTileGameplayProps> = ({
  levelNumber,
  onExitToLevelSelect,
  onNextLevel,
  onSessionComplete,
}) => {
  const levelData: FlipTileLevel = getFlipTileLevel(levelNumber);

  // Turn owner: 'player' or 'bot'
  const [turn, setTurn] = useState<TurnOwner>('player');
  const [tiles, setTiles] = useState<TileItem[]>([]);
  const [playerPairs, setPlayerPairs] = useState<number>(0);
  const [botPairs, setBotPairs] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Flipped tiles in current turn (max 2)
  const [flippedIds, setFlippedIds] = useState<number[]>([]);

  // Modals
  const [isResultOpen, setIsResultOpen] = useState<boolean>(false);
  const [isVictory, setIsVictory] = useState<boolean>(false);
  const [earnedStars, setEarnedStars] = useState<number>(3);

  // Bot AI instance & timing refs
  const botAiRef = useRef<FlipTileBotAI>(new FlipTileBotAI(levelData.botMemoryRate));
  const startTimeRef = useRef<number>(Date.now());
  const tilesRef = useRef<TileItem[]>([]);
  const botTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isBotRunningRef = useRef<boolean>(false);
  const totalPairs = (levelData.rows * levelData.cols) / 2;

  // Keep tilesRef synchronized with latest tiles state
  useEffect(() => {
    tilesRef.current = tiles;
  }, [tiles]);

  // Initialize Board
  const initBoard = useCallback(() => {
    if (botTimerRef.current) {
      clearTimeout(botTimerRef.current);
      botTimerRef.current = null;
    }
    isBotRunningRef.current = false;

    botAiRef.current = new FlipTileBotAI(levelData.botMemoryRate);

    // Pick (rows * cols / 2) unique icons from level pool
    const neededPairs = totalPairs;
    const shuffledIcons = [...levelData.icons].sort(() => Math.random() - 0.5);
    const chosenIcons = shuffledIcons.slice(0, neededPairs);

    // Create 2 of each icon
    const tileList: TileItem[] = [];
    chosenIcons.forEach((icon, pairIdx) => {
      tileList.push({
        id: pairIdx * 2,
        pairId: pairIdx,
        icon,
        isFlipped: false,
        isMatched: false,
      });
      tileList.push({
        id: pairIdx * 2 + 1,
        pairId: pairIdx,
        icon,
        isFlipped: false,
        isMatched: false,
      });
    });

    // Shuffle board tiles
    const shuffledTiles = tileList.sort(() => Math.random() - 0.5);

    setTiles(shuffledTiles);
    setFlippedIds([]);
    setPlayerPairs(0);
    setBotPairs(0);
    setScore(0);
    setTurn('player');
    setIsProcessing(false);
    setIsResultOpen(false);
    startTimeRef.current = Date.now();
  }, [levelData, totalPairs]);

  useEffect(() => {
    initBoard();
  }, [initBoard]);

  // Audio start & cleanup
  useEffect(() => {
    FlipTileAudio.startBgm();
    return () => {
      FlipTileAudio.stopBgm();
    };
  }, []);

  // Handle turn resolution when 2 tiles are flipped
  const resolveTurn = useCallback(
    (firstId: number, secondId: number, currentTurn: TurnOwner) => {
      setIsProcessing(true);

      const currentTiles = tilesRef.current;
      const t1 = currentTiles.find((t) => t.id === firstId);
      const t2 = currentTiles.find((t) => t.id === secondId);

      if (!t1 || !t2) {
        setIsProcessing(false);
        setFlippedIds([]);
        isBotRunningRef.current = false;
        return;
      }

      // Check if match
      const isMatch = t1.pairId === t2.pairId;

      if (isMatch) {
        // MATCH!
        FlipTileAudio.playMatchSound();

        // Let the tiles show for 500ms, then vanish
        setTimeout(() => {
          setTiles((prev) =>
            prev.map((t) => {
              if (t.id === firstId || t.id === secondId) {
                return { ...t, isMatched: true, isFlipped: false };
              }
              return t;
            })
          );

          botAiRef.current.onTilesMatched([firstId, secondId]);

          let nextPlayerPairs = playerPairs;
          let nextBotPairs = botPairs;

          if (currentTurn === 'player') {
            nextPlayerPairs += 1;
            setPlayerPairs(nextPlayerPairs);
            setScore((s) => s + 150 + levelNumber * 10);
          } else {
            nextBotPairs += 1;
            setBotPairs(nextBotPairs);
          }

          setFlippedIds([]);
          setIsProcessing(false);
          isBotRunningRef.current = false;

          // Check if board complete
          if (nextPlayerPairs + nextBotPairs >= totalPairs) {
            handleGameOver(nextPlayerPairs, nextBotPairs);
          } else {
            // Matched player/bot continues turn!
            setTurn(currentTurn);
          }
        }, 550);
      } else {
        // NO MATCH
        FlipTileAudio.playMismatchSound();

        // Keep flipped for 850ms, then flip back
        setTimeout(() => {
          setTiles((prev) =>
            prev.map((t) => {
              if (t.id === firstId || t.id === secondId) {
                return { ...t, isFlipped: false, flippedBy: undefined };
              }
              return t;
            })
          );

          setFlippedIds([]);
          setIsProcessing(false);
          isBotRunningRef.current = false;

          // Turn passes to other player
          const nextTurn: TurnOwner = currentTurn === 'player' ? 'bot' : 'player';
          setTurn(nextTurn);
          if (nextTurn === 'bot') {
            FlipTileAudio.playBotTurnSound();
          }
        }, 850);
      }
    },
    [playerPairs, botPairs, totalPairs, levelNumber]
  );

  // Game over check
  const handleGameOver = (finalPlayerPairs: number, finalBotPairs: number) => {
    const isPlayerWin = finalPlayerPairs > finalBotPairs;
    setIsVictory(isPlayerWin);

    if (isPlayerWin) {
      FlipTileAudio.playVictorySound();
    } else {
      FlipTileAudio.playDefeatSound();
    }

    const { stars } = saveLevelResult(levelNumber, score, finalPlayerPairs, finalBotPairs, isPlayerWin);
    setEarnedStars(stars);

    const durationSec = Math.round((Date.now() - startTimeRef.current) / 1000);
    if (onSessionComplete) {
      onSessionComplete(score, durationSec);
    }

    setTimeout(() => {
      setIsResultOpen(true);
    }, 600);
  };

  // Bot Turn Engine
  useEffect(() => {
    if (turn !== 'bot' || isResultOpen || isBotRunningRef.current) return;

    isBotRunningRef.current = true;
    setIsProcessing(true);

    const thinkSpeed = Math.min(650, Math.max(400, levelData.botThinkingSpeedMs || 550));

    // Delay for "Thinking"
    botTimerRef.current = setTimeout(() => {
      // 1. Choose First Tile from latest tilesRef
      const currentTiles = tilesRef.current;
      const availableTiles = currentTiles.filter((t) => !t.isFlipped && !t.isMatched);

      if (availableTiles.length < 2) {
        setIsProcessing(false);
        isBotRunningRef.current = false;
        return;
      }

      const firstTile = botAiRef.current.chooseFirstTile(availableTiles) || availableTiles[0];

      // Flip first tile
      FlipTileAudio.playFlipSound();
      botAiRef.current.observeTile(firstTile.id, firstTile.icon);

      setTiles((prev) =>
        prev.map((t) => (t.id === firstTile.id ? { ...t, isFlipped: true, flippedBy: 'bot' } : t))
      );
      setFlippedIds([firstTile.id]);

      // Delay between first and second tile (450ms)
      botTimerRef.current = setTimeout(() => {
        const remainingTiles = tilesRef.current.filter(
          (t) => !t.isMatched && !t.isFlipped && t.id !== firstTile.id
        );

        if (remainingTiles.length === 0) {
          setIsProcessing(false);
          isBotRunningRef.current = false;
          return;
        }

        const secondTile =
          botAiRef.current.chooseSecondTile(firstTile, remainingTiles) || remainingTiles[0];

        // Flip second tile
        FlipTileAudio.playFlipSound();
        botAiRef.current.observeTile(secondTile.id, secondTile.icon);

        setTiles((prev) =>
          prev.map((t) => (t.id === secondTile.id ? { ...t, isFlipped: true, flippedBy: 'bot' } : t))
        );
        setFlippedIds([firstTile.id, secondTile.id]);

        // Resolve turn - isBotRunningRef will reset when resolveTurn finishes
        resolveTurn(firstTile.id, secondTile.id, 'bot');
      }, 450);
    }, thinkSpeed);

    return () => {
      if (botTimerRef.current) {
        clearTimeout(botTimerRef.current);
      }
    };
  }, [turn, isResultOpen, levelData.botThinkingSpeedMs, resolveTurn]);

  // Player Tile Tap
  const handleTileTap = (tappedTile: TileItem) => {
    if (turn !== 'player' || isProcessing || tappedTile.isFlipped || tappedTile.isMatched) return;

    FlipTileAudio.playFlipSound();
    botAiRef.current.observeTile(tappedTile.id, tappedTile.icon);

    if (flippedIds.length === 0) {
      // First tile flipped
      setTiles((prev) =>
        prev.map((t) => (t.id === tappedTile.id ? { ...t, isFlipped: true, flippedBy: 'player' } : t))
      );
      setFlippedIds([tappedTile.id]);
    } else if (flippedIds.length === 1) {
      // Second tile flipped
      const firstId = flippedIds[0];
      if (firstId === tappedTile.id) return;

      setTiles((prev) =>
        prev.map((t) => (t.id === tappedTile.id ? { ...t, isFlipped: true, flippedBy: 'player' } : t))
      );
      setFlippedIds([firstId, tappedTile.id]);

      resolveTurn(firstId, tappedTile.id, 'player');
    }
  };

  // Background color switches dynamically based on turn owner (Exact from Video!)
  const isPlayerTurn = turn === 'player';
  const currentBgColor = isPlayerTurn ? levelData.playerBgColor : levelData.botBgColor;

  return (
    <div
      style={{ backgroundColor: currentBgColor }}
      className="relative w-full h-full flex flex-col justify-between items-center select-none overflow-hidden touch-none font-['Plus_Jakarta_Sans',sans-serif] transition-colors duration-500 text-slate-900"
    >
      {/* ----------------- TOP HEADER / SCORES ----------------- */}
      <div className="relative z-30 w-full max-w-md px-4 pt-3 pb-1 flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          {/* Top Back / Exit Button */}
          <button
            onClick={onExitToLevelSelect}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 hover:bg-white text-xs font-black text-slate-800 shadow-xs active:scale-95 transition-all cursor-pointer"
            title="Back to Game Menu"
          >
            <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>BACK</span>
          </button>

          {/* Difficulty & Stage Indicator (Exact from Video at 00:03) */}
          <div className="px-3.5 py-1 rounded-full bg-white/80 text-xs font-black text-slate-800 shadow-xs uppercase tracking-wider">
            {levelData.difficultyLabel} • LVL {levelNumber}
          </div>

          {/* Reset Current Level Button */}
          <button
            onClick={initBoard}
            className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-800 flex items-center justify-center shadow-xs active:rotate-180 transition-transform cursor-pointer"
            title="Restart Level"
          >
            <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>

        {/* Live Scores Row (Always on top, Section 10) */}
        <div className="flex items-center justify-between gap-2 px-1 text-xs font-black text-slate-900 uppercase">
          <div className="flex items-center gap-1.5 bg-white/85 px-3 py-1 rounded-full shadow-2xs">
            <span className="text-emerald-700">YOU:</span>
            <span className="font-mono text-sm font-black">{playerPairs}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-white/85 px-3 py-1 rounded-full shadow-2xs">
            <span className="text-slate-500">PAIRS:</span>
            <span className="font-mono text-sm font-black">
              {playerPairs + botPairs}/{totalPairs}
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-white/85 px-3 py-1 rounded-full shadow-2xs">
            <span className="text-indigo-700">BOT:</span>
            <span className="font-mono text-sm font-black">{botPairs}</span>
          </div>
        </div>
      </div>

      {/* ----------------- TOP TURN BANNER (BOT THINKING / RADAR) ----------------- */}
      {!isPlayerTurn && (
        <div className="relative z-20 flex flex-col items-center justify-center my-1 animate-in fade-in duration-200">
          <div className="relative flex items-center justify-center">
            {/* Radar Ripple Effect (from video 00:05) */}
            <div className="absolute w-28 h-28 rounded-full border-2 border-white/60 animate-ping pointer-events-none" />
            <div className="px-5 py-2 rounded-full bg-white/95 text-indigo-900 font-black text-xs sm:text-sm tracking-wider uppercase shadow-md flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
              <span>BOT THINKING</span>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- MAIN FLIP TILE BOARD ----------------- */}
      <div className="relative z-20 w-full max-w-md flex-1 px-4 flex flex-col items-center justify-center my-auto">
        {/* Dark Slate-Purple Board Container (Exact from Reference Video 00:02) */}
        <div className="w-full max-w-[340px] sm:max-w-[360px] aspect-4/5 rounded-3xl bg-[#2B243B] p-4 sm:p-5 shadow-[0_12px_36px_rgba(0,0,0,0.35)] border-4 border-[#3D3352] flex flex-col items-center justify-center">
          {/* Tiles Grid */}
          <div
            style={{
              gridTemplateColumns: `repeat(${levelData.cols}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${levelData.rows}, minmax(0, 1fr))`,
            }}
            className="w-full h-full grid gap-2 sm:gap-2.5"
          >
            {tiles.map((tile) => {
              if (tile.isMatched) {
                // Matched tiles vanish from the board (leaves empty space, exact from video!)
                return <div key={tile.id} className="w-full h-full opacity-0 pointer-events-none" />;
              }

              return (
                <button
                  key={tile.id}
                  onClick={() => handleTileTap(tile)}
                  disabled={!isPlayerTurn || isProcessing}
                  style={{
                    perspective: '1000px',
                  }}
                  className="w-full h-full relative cursor-pointer active:scale-95 transition-transform"
                >
                  <div
                    style={{
                      transformStyle: 'preserve-3d',
                      transform: tile.isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                      transition: 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                    className="w-full h-full relative rounded-xl sm:rounded-2xl shadow-md"
                  >
                    {/* BACK FACE (Golden Mustard, exact from video 00:02) */}
                    <div
                      style={{
                        backgroundColor: levelData.tileBackColor,
                        borderColor: levelData.tileBackBorder,
                        backfaceVisibility: 'hidden',
                      }}
                      className="absolute inset-0 rounded-xl sm:rounded-2xl border-2 sm:border-3 flex items-center justify-center shadow-inner"
                    >
                      {/* Subtle Bevel Highlight */}
                      <div className="absolute top-1 inset-x-1.5 h-1/3 bg-white/20 rounded-t-lg pointer-events-none" />
                    </div>

                    {/* FRONT FACE (Revealed Emoji Icon on White Face) */}
                    <div
                      style={{
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                      }}
                      className="absolute inset-0 rounded-xl sm:rounded-2xl bg-white border-2 border-slate-300 flex items-center justify-center text-2xl sm:text-3xl shadow-sm select-none"
                    >
                      {tile.icon}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ----------------- BOTTOM TURN BADGE & SCORE PILL ----------------- */}
      <div className="relative z-30 w-full max-w-md px-5 pb-4 pt-1 flex items-center justify-between">
        {/* Bottom-Left Live Pair Badge: 0 • 1 (Exact from Video at 00:14) */}
        <div className="px-3.5 py-1.5 rounded-full bg-[#9381FF] border border-white text-white font-mono font-black text-xs shadow-md">
          {playerPairs} • {botPairs}
        </div>

        {/* YOUR TURN Bottom Banner (when Player turn active, exact from video 00:03) */}
        {isPlayerTurn && (
          <div className="px-6 py-2 rounded-full bg-white text-[#E11D48] font-black text-xs sm:text-sm tracking-wider uppercase shadow-md flex items-center gap-1.5 animate-bounce">
            <span>YOUR TURN</span>
          </div>
        )}

        {/* Right side spacer for symmetry */}
        <div className="w-12" />
      </div>

      {/* ----------------- RESULT MODAL ----------------- */}
      {isResultOpen && (
        <FlipTileResultModal
          levelNumber={levelNumber}
          playerPairs={playerPairs}
          botPairs={botPairs}
          totalPairs={totalPairs}
          score={score}
          stars={earnedStars}
          isVictory={isVictory}
          onNextLevel={() => {
            if (levelNumber < 40) {
              onNextLevel(levelNumber + 1);
            } else {
              onExitToLevelSelect();
            }
          }}
          onRestart={initBoard}
          onLevelSelect={onExitToLevelSelect}
        />
      )}
    </div>
  );
};
