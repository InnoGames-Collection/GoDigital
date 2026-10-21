/**
 * SORTING BALLS - Professional Tournament-Quality 3D Experience
 * - Deep navy/midnight purple ambient gradient arena with subtle glow and vignette
 * - Coordinated color-group multi-ball transfers (2-4 balls move together as a unit)
 * - Authentic 3D glass tubes with metallic dual rims and floor contact shadows
 * - Substantial glossy 3D spheres occupying 85-90% of inner tube diameter (never shrunk!)
 * - Tournament HUD with real-time score, par efficiency rating, and rank badges
 * - 40 verified challenging tournament levels with strict progression locking
 * - Full Web Audio procedural synthesis with harmonic chords and fanfare
 * - Proper Main Menu opening, full navigation, in-game Back button, and multi-tier leaderboards
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameDefinition, UserProfile } from '../../types';
import { SORTING_LEVELS, TOTAL_SORTING_LEVELS } from './levels';
import {
  BallColorKey,
  GameState,
  MoveRecord,
  SortingPlayerProgress,
  SortingLevelConfig,
  LevelScoreBreakdown,
} from './types';
import { SortingRenderer3D } from './sortingRenderer3D';
import { sortingAudio } from './sortingAudio';
import { isStateSolved, findNextBestMove } from './solver';
import { SortingReferenceVideoModal } from './SortingReferenceVideoModal';
import { SortingMenuModal } from './components/SortingMenuModal';
import { SortingLeaderboardModal } from './components/SortingLeaderboardModal';
import { SortingHowToPlayModal } from './components/SortingHowToPlayModal';
import { SortingAchievementsModal } from './components/SortingAchievementsModal';
import { SortingStatisticsModal } from './components/SortingStatisticsModal';
import { SortingSettingsModal } from './components/SortingSettingsModal';
import { SortingAboutModal } from './components/SortingAboutModal';
import { SortingLevelSelectModal } from './components/SortingLevelSelectModal';
import { SortingVictoryModal } from './components/SortingVictoryModal';
import {
  ArrowLeft,
  RotateCcw,
  Undo2,
  Plus,
  Play,
  Home,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  X,
  Star,
  Film,
  Trophy,
  Flame,
  Lightbulb,
  Clock,
  HelpCircle,
} from 'lucide-react';

interface SortingBallsGameProps {
  game: GameDefinition;
  profile?: UserProfile;
  onGameOver: (score: number, duration: number) => void;
  onExit: () => void;
  isAudioEnabled?: boolean;
}

const STORAGE_KEY = 'teleplus_sorting_balls_progression_v3';

export const SortingBallsGame: React.FC<SortingBallsGameProps> = ({
  game,
  profile,
  onGameOver,
  onExit,
  isAudioEnabled = true,
}) => {
  // 1. Persistent Progression & Scoring
  const [progress, setProgress] = useState<SortingPlayerProgress>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          unlockedLevel: parsed.unlockedLevel || 1,
          completedLevels: parsed.completedLevels || [],
          totalCumulativeScore: parsed.totalCumulativeScore || 0,
          levelScores: parsed.levelScores || {},
          bestMoves: parsed.bestMoves || {},
          stars: parsed.stars || parsed.levelStars || {},
          levelStars: parsed.levelStars || {},
          levelBestTimes: parsed.levelBestTimes || {},
          stats: parsed.stats || {
            gamesPlayed: 0,
            totalUndosUsed: 0,
            totalHintsUsed: 0,
            totalExtraTubesUsed: 0,
          },
          highScore: parsed.highScore || 0,
        };
      }
    } catch {
      // Fallback
    }
    return {
      unlockedLevel: 1,
      completedLevels: [],
      totalCumulativeScore: 0,
      levelScores: {},
      bestMoves: {},
      stars: {},
      levelStars: {},
      levelBestTimes: {},
      stats: {
        gamesPlayed: 0,
        totalUndosUsed: 0,
        totalHintsUsed: 0,
        totalExtraTubesUsed: 0,
      },
      highScore: 0,
    };
  });

  const saveProgress = (newProg: SortingPlayerProgress) => {
    setProgress(newProg);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProg));
    } catch {
      // Storage fallback
    }
  };

  // 2. Active Game Flow States (Defaults to MENU per prompt requirement)
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [currentLevelNumber, setCurrentLevelNumber] = useState<number>(1);
  const [currentTubes, setCurrentTubes] = useState<BallColorKey[][]>([]);
  const [selectedTubeIndex, setSelectedTubeIndex] = useState<number | null>(null);
  const [selectedGroupCount, setSelectedGroupCount] = useState<number>(1);
  const [moveHistory, setMoveHistory] = useState<MoveRecord[]>([]);
  const [undosRemaining, setUndosRemaining] = useState<number>(5);
  const [movesCount, setMovesCount] = useState<number>(0);
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [lastScoreGain, setLastScoreGain] = useState<{ amount: number; label: string } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [soundActive, setSoundActive] = useState<boolean>(isAudioEnabled);
  const [extraTubesAdded, setExtraTubesAdded] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState<boolean>(false);
  const [undosUsedCount, setUndosUsedCount] = useState<number>(0);
  const [hintsUsedCount, setHintsUsedCount] = useState<number>(0);
  const [activeHintMessage, setActiveHintMessage] = useState<string | null>(null);

  // Authoritative guard refs for atomic single-use and idempotent initialization
  const extraTubeUsedRef = useRef<boolean>(false);
  const isLevelCompletedRef = useRef<boolean>(false);
  const isInitializingRef = useRef<boolean>(false);
  const levelSelectSourceRef = useRef<'MENU' | 'PLAYING'>('MENU');

  // Active Gameplay Timer (seconds)
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const levelTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Score breakdown for Victory modal
  const [lastScoreBreakdown, setLastScoreBreakdown] = useState<LevelScoreBreakdown>({
    basePoints: 1000,
    moveBonus: 500,
    timeBonus: 250,
    undoPenalty: 0,
    hintPenalty: 0,
    extraTubePenalty: 0,
    totalScore: 1750,
    moves: 12,
    optimalParMoves: 12,
    timeTakenSeconds: 30,
    stars: 3,
  });
  const [isNewBestScore, setIsNewBestScore] = useState<boolean>(false);

  // 3. 3D WebGL Canvas
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const renderer3DRef = useRef<SortingRenderer3D | null>(null);
  const sessionStartTimeRef = useRef<number>(Date.now());

  // Sync audio master mute
  useEffect(() => {
    sortingAudio.isAudioEnabled = soundActive;
  }, [soundActive]);

  // Active level timer ticker (strictly active during PLAYING only)
  useEffect(() => {
    if (gameState === 'PLAYING') {
      levelTimerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (levelTimerRef.current) {
        clearInterval(levelTimerRef.current);
        levelTimerRef.current = null;
      }
    }
    return () => {
      if (levelTimerRef.current) {
        clearInterval(levelTimerRef.current);
        levelTimerRef.current = null;
      }
    };
  }, [gameState]);

  // Current Level Config
  const currentConfig: SortingLevelConfig =
    SORTING_LEVELS.find((lvl) => lvl.level === currentLevelNumber) || SORTING_LEVELS[0];

  /**
   * Authoritative, idempotent game starter:
   * Initializes the selected level, resets all counters, loads 3D tubes/balls,
   * resizes the viewport, and transitions into PLAYING cleanly.
   */
  const startGame = useCallback((lvlNumber: number) => {
    if (isInitializingRef.current) return;
    isInitializingRef.current = true;
    sortingAudio.playButton();

    try {
      const config = SORTING_LEVELS.find((l) => l.level === lvlNumber) || SORTING_LEVELS[0];
      if (!config || !config.tubes || config.tubes.length === 0) {
        setGameState('ERROR');
        isInitializingRef.current = false;
        return;
      }

      const freshTubes = config.tubes.map((t) => [...t]);

      // Atomic state reset
      setCurrentLevelNumber(config.level);
      setCurrentTubes(freshTubes);
      setSelectedTubeIndex(null);
      setSelectedGroupCount(1);
      setMoveHistory([]);
      setMovesCount(0);
      setExtraTubesAdded(0);
      extraTubeUsedRef.current = false;
      isLevelCompletedRef.current = false;
      setUndosRemaining(5);
      setUndosUsedCount(0);
      setHintsUsedCount(0);
      setActiveHintMessage(null);
      setElapsedSeconds(0);
      setCurrentScore(0);
      setIsAnimating(false);
      setLastScoreGain(null);

      // Render board immediately in Three.js WebGL scene
      if (renderer3DRef.current) {
        renderer3DRef.current.setLevelState(freshTubes, null, 1);
        renderer3DRef.current.resize();
      }

      // Enter PLAYING state
      setGameState('PLAYING');

      // Double-rAF ensures DOM layout of header has settled and renderer matches final pixel dimensions
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (renderer3DRef.current) {
            renderer3DRef.current.resize();
          }
          isInitializingRef.current = false;
        });
      });
    } catch (err) {
      console.error('Failed to initialize level:', err);
      setGameState('ERROR');
      isInitializingRef.current = false;
    }
  }, []);

  // Mount WebGL renderer and immediately pre-render the initial level
  useEffect(() => {
    if (!canvasContainerRef.current) return;

    let renderer: SortingRenderer3D | null = null;
    try {
      renderer = new SortingRenderer3D(canvasContainerRef.current);
      renderer3DRef.current = renderer;

      // Immediately pre-populate the 3D scene with current level tubes so the board is ready before Play
      const lvl = currentLevelNumber || progress.unlockedLevel || 1;
      const config = SORTING_LEVELS.find((l) => l.level === lvl) || SORTING_LEVELS[0];
      const initialTubes = config.tubes.map((t) => [...t]);
      setCurrentTubes(initialTubes);
      renderer.setLevelState(initialTubes, null, 1);
      renderer.resize();
    } catch (err) {
      console.warn('SortingBalls: WebGL initialization failed on this device:', err);
    }

    return () => {
      if (renderer) {
        renderer.dispose();
      }
      renderer3DRef.current = null;
    };
  }, []);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  /**
   * Add 1 Extra Empty Tube (Strictly maximum 1 per active level attempt)
   * Penalty: -250 PTS
   */
  const handleAddExtraTube = () => {
    if (
      extraTubeUsedRef.current ||
      extraTubesAdded >= 1 ||
      gameState !== 'PLAYING' ||
      isAnimating ||
      isLevelCompletedRef.current
    ) {
      if (extraTubeUsedRef.current || extraTubesAdded >= 1) {
        setLastScoreGain({ amount: 0, label: 'EXTRA TUBE ALREADY USED (MAX 1)' });
        setTimeout(() => setLastScoreGain(null), 1800);
      }
      return;
    }
    // Commit atomically before any async dispatch
    extraTubeUsedRef.current = true;
    sortingAudio.playButton();

    const updated = [...currentTubes, []];
    setCurrentTubes(updated);
    setExtraTubesAdded(1);

    // Update lifetime stats
    saveProgress({
      ...progress,
      stats: {
        ...progress.stats,
        totalExtraTubesUsed: (progress.stats?.totalExtraTubesUsed || 0) + 1,
      },
    });

    setLastScoreGain({ amount: -250, label: 'EXTRA TUBE -250 PTS' });
    setTimeout(() => setLastScoreGain(null), 2000);

    if (renderer3DRef.current) {
      renderer3DRef.current.setLevelState(updated, selectedTubeIndex, selectedGroupCount);
      renderer3DRef.current.resize();
    }
  };

  /**
   * Hint Feature
   * Analyzes current tubes with BFS solver and flashes the best move
   * Penalty: -150 PTS
   */
  const handleRequestHint = () => {
    if (gameState !== 'PLAYING' || isAnimating) return;
    sortingAudio.playButton();

    const nextMove = findNextBestMove(currentTubes, currentConfig.capacity);
    if (!nextMove) {
      setActiveHintMessage('No simple move found. Try using Undo or Add a Tube.');
      setTimeout(() => setActiveHintMessage(null), 3000);
      return;
    }

    setHintsUsedCount((prev) => prev + 1);
    saveProgress({
      ...progress,
      stats: {
        ...progress.stats,
        totalHintsUsed: (progress.stats?.totalHintsUsed || 0) + 1,
      },
    });

    const msg = `Hint: Move from Tube ${nextMove.from + 1} ➔ Tube ${nextMove.to + 1}`;
    setActiveHintMessage(msg);
    setTimeout(() => setActiveHintMessage(null), 4500);

    // Animate subtle tube shake to guide attention
    renderer3DRef.current?.shakeTube(nextMove.from);

    setLastScoreGain({ amount: -150, label: 'HINT USED -150 PTS' });
    setTimeout(() => setLastScoreGain(null), 2000);
  };

  /**
   * Check if a tube has completed 4 matching balls
   */
  const isTubeComplete = (tube: BallColorKey[], capacity: number) => {
    return tube.length === capacity && tube.every((c) => c === tube[0]);
  };

  /**
   * Execute Coordinated Group Transfer
   * Moves the connected group of identical-colored balls sequentially
   */
  const executeGroupTransfer = (
    fromIdx: number,
    toIdx: number,
    transferCount: number,
    movingColor: BallColorKey
  ) => {
    if (transferCount <= 0) return;

    setIsAnimating(true);

    // Play audio matching group size
    if (transferCount > 1) {
      sortingAudio.playGroupMove(transferCount);
      if (transferCount >= 3) {
        sortingAudio.playCombo(transferCount);
      }
    } else {
      sortingAudio.playDrop();
    }

    // Calculate score for this move
    let pts = transferCount * 100;
    let label = `+${pts}`;
    if (transferCount === 2) {
      pts = 260;
      label = `DUAL TRANSFER +${pts}`;
    } else if (transferCount === 3) {
      pts = 450;
      label = `TRIPLE COMBO +${pts}`;
    } else if (transferCount === 4) {
      pts = 750;
      label = `QUAD SWEEP +${pts}`;
    }

    const destCurrentCount = currentTubes[toIdx].length;

    // Sequential Automatic Group Move in Three.js
    if (renderer3DRef.current) {
      renderer3DRef.current.animateSequentialGroupMove(
        fromIdx,
        toIdx,
        movingColor,
        transferCount,
        destCurrentCount,
        (stepIdx) => {
          sortingAudio.playSequentialBallLaunch(stepIdx);
        },
        (stepIdx) => {
          sortingAudio.playBallSettle(stepIdx);
        },
        () => {
          // Animation complete callback: apply state update
          const nextTubes = currentTubes.map((t) => [...t]);
          for (let m = 0; m < transferCount; m++) {
            const b = nextTubes[fromIdx].pop()!;
            nextTubes[toIdx].push(b);
          }

          // Check if destination tube was completed
          let tubeBonus = 0;
          if (isTubeComplete(nextTubes[toIdx], currentConfig.capacity)) {
            tubeBonus = 350;
            sortingAudio.playTubeComplete();
            label = `TUBE COMPLETE! +${pts + tubeBonus}`;
          }

          const totalMovePts = pts + tubeBonus;
          setCurrentScore((prev) => prev + totalMovePts);
          setLastScoreGain({ amount: totalMovePts, label });
          setTimeout(() => setLastScoreGain(null), 1800);

          setCurrentTubes(nextTubes);
          setSelectedTubeIndex(null);
          setSelectedGroupCount(1);
          setMoveHistory((prev) => [
            ...prev,
            {
              fromIndex: fromIdx,
              toIndex: toIdx,
              color: movingColor,
              count: transferCount,
            },
          ]);
          setMovesCount((prev) => prev + 1);
          setIsAnimating(false);

          if (renderer3DRef.current) {
            renderer3DRef.current.setLevelState(nextTubes, null, 1);
          }

          // Check win condition
          if (isStateSolved(nextTubes, currentConfig.capacity)) {
            handleLevelComplete(nextTubes);
          }
        }
      );
    }
  };

  /**
   * Handle Tube Interaction: Tap Source -> Lift; Tap Dest -> Transfer
   */
  const handleTubeInteraction = (tappedIndex: number) => {
    if (gameState !== 'PLAYING' || isAnimating) return;

    // A. No tube currently selected: Select Source Tube
    if (selectedTubeIndex === null) {
      const tube = currentTubes[tappedIndex];
      if (!tube || tube.length === 0) return;

      // If already completed tube, feedback
      if (isTubeComplete(tube, currentConfig.capacity)) {
        sortingAudio.playInvalid();
        renderer3DRef.current?.shakeTube(tappedIndex);
        return;
      }

      // Detect top contiguous group of matching color
      const topColor = tube[tube.length - 1];
      let groupCount = 0;
      for (let k = tube.length - 1; k >= 0; k--) {
        if (tube[k] === topColor) groupCount++;
        else break;
      }

      // Elevate top group to clearly indicate selection
      setSelectedTubeIndex(tappedIndex);
      setSelectedGroupCount(groupCount);
      sortingAudio.playSelect();

      if (renderer3DRef.current) {
        renderer3DRef.current.setLevelState(currentTubes, tappedIndex, groupCount);
      }
      return;
    }

    // B. Same tube tapped again: Deselect
    if (selectedTubeIndex === tappedIndex) {
      setSelectedTubeIndex(null);
      setSelectedGroupCount(1);
      sortingAudio.playSelect();
      if (renderer3DRef.current) {
        renderer3DRef.current.setLevelState(currentTubes, null, 1);
      }
      return;
    }

    // C. Different tube tapped: Destination Tube
    const fromIdx = selectedTubeIndex;
    const toIdx = tappedIndex;
    const sourceTube = currentTubes[fromIdx];
    const destTube = currentTubes[toIdx];

    if (!sourceTube || sourceTube.length === 0) {
      setSelectedTubeIndex(null);
      setSelectedGroupCount(1);
      return;
    }

    const movingColor = sourceTube[sourceTube.length - 1];
    const isDestEmpty = destTube.length === 0;
    const destSpace = currentConfig.capacity - destTube.length;
    const destMatchesColor = !isDestEmpty && destTube[destTube.length - 1] === movingColor;

    // If destination is not empty and colors don't match:
    if (!isDestEmpty && !destMatchesColor) {
      // If tapped destination is another tube with balls and not complete, switch selection to it!
      if (destTube.length > 0 && !isTubeComplete(destTube, currentConfig.capacity)) {
        const newTopColor = destTube[destTube.length - 1];
        let newGroupCount = 0;
        for (let k = destTube.length - 1; k >= 0; k--) {
          if (destTube[k] === newTopColor) newGroupCount++;
          else break;
        }
        setSelectedTubeIndex(toIdx);
        setSelectedGroupCount(newGroupCount);
        sortingAudio.playSelect();
        if (renderer3DRef.current) {
          renderer3DRef.current.setLevelState(currentTubes, toIdx, newGroupCount);
        }
        return;
      }

      sortingAudio.playInvalid();
      renderer3DRef.current?.shakeTube(toIdx);
      return;
    }

    // Check if destination has room
    if (destSpace <= 0) {
      sortingAudio.playInvalid();
      renderer3DRef.current?.shakeTube(toIdx);
      return;
    }

    // Respect destination capacity
    const transferCount = Math.min(selectedGroupCount, destSpace);
    if (transferCount <= 0) {
      sortingAudio.playInvalid();
      renderer3DRef.current?.shakeTube(toIdx);
      return;
    }

    // Execute sequential transfer
    executeGroupTransfer(fromIdx, toIdx, transferCount, movingColor);
  };

  /**
   * Pointer Down on 3D Canvas
   */
  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (gameState !== 'PLAYING' || isAnimating) return;
    if (!renderer3DRef.current) return;

    const tubeIndex = renderer3DRef.current.getTubeAtCoordinates(e.clientX, e.clientY);

    if (tubeIndex !== null) {
      handleTubeInteraction(tubeIndex);
    } else if (selectedTubeIndex !== null) {
      // Tap background: Deselect
      setSelectedTubeIndex(null);
      setSelectedGroupCount(1);
      sortingAudio.playSelect();
      if (renderer3DRef.current) {
        renderer3DRef.current.setLevelState(currentTubes, null, 1);
      }
    }
  };

  /**
   * Undo last move
   */
  const handleUndo = () => {
    if (moveHistory.length === 0 || gameState !== 'PLAYING' || isAnimating) return;
    if (undosRemaining <= 0) return;

    const lastMove = moveHistory[moveHistory.length - 1];
    const { fromIndex, toIndex, color, count = 1 } = lastMove;

    const nextTubes = currentTubes.map((t) => [...t]);
    if (nextTubes[toIndex].length < count) return;

    setIsAnimating(true);
    sortingAudio.playUndo();

    const destStart = nextTubes[fromIndex].length;

    if (renderer3DRef.current) {
      renderer3DRef.current.animateSequentialGroupMove(
        toIndex,
        fromIndex,
        color,
        count,
        destStart,
        (stepIdx) => sortingAudio.playSequentialBallLaunch(stepIdx),
        (stepIdx) => sortingAudio.playBallSettle(stepIdx),
        () => {
          for (let i = 0; i < count; i++) {
            const ball = nextTubes[toIndex].pop()!;
            nextTubes[fromIndex].push(ball);
          }

          setCurrentTubes(nextTubes);
          setSelectedTubeIndex(null);
          setSelectedGroupCount(1);
          setMoveHistory((prev) => prev.slice(0, -1));
          setUndosRemaining((prev) => Math.max(0, prev - 1));
          setUndosUsedCount((prev) => prev + 1);

          // Update lifetime stats
          saveProgress({
            ...progress,
            stats: {
              ...progress.stats,
              totalUndosUsed: (progress.stats?.totalUndosUsed || 0) + 1,
            },
          });

          setIsAnimating(false);

          if (renderer3DRef.current) {
            renderer3DRef.current.setLevelState(nextTubes, null, 1);
          }
        }
      );
    }
  };

  /**
   * Reset current level
   */
  const handleReset = () => {
    startGame(currentLevelNumber);
  };

  /**
   * Handle Comprehensive Level Complete & Scoring
   */
  const handleLevelComplete = (finalTubes: BallColorKey[][]) => {
    if (isLevelCompletedRef.current) return;
    isLevelCompletedRef.current = true;
    setGameState('LEVEL_COMPLETE');
    sortingAudio.playLevelWin();

    const finalMoves = movesCount + 1;
    const par = currentConfig.optimalMoves;
    const timeTaken = Math.max(1, elapsedSeconds);

    // 1. Base points: 1000
    const basePoints = 1000;

    // 2. Move Efficiency / Par bonus
    let moveBonus = 500;
    if (finalMoves <= par) {
      moveBonus = 500 + (par - finalMoves) * 150;
    } else {
      moveBonus = Math.max(50, 500 - (finalMoves - par) * 45);
    }

    // 3. Time speed bonus
    let timeBonus = 100;
    if (timeTaken <= 20) timeBonus = 400;
    else if (timeTaken <= 40) timeBonus = 250;
    else if (timeTaken <= 80) timeBonus = 120;
    else timeBonus = 40;

    // 4. Penalties
    const undoPenalty = undosUsedCount * 50;
    const hintPenalty = hintsUsedCount * 150;
    const extraTubePenalty = extraTubesAdded * 250;

    // 5. Total Level Score
    const totalLevelScore = Math.max(
      150,
      basePoints + moveBonus + timeBonus - undoPenalty - hintPenalty - extraTubePenalty
    );

    // Stars: 3 if <= par and no extra tubes, 2 if par+2, 1 otherwise
    let stars = 1;
    if (finalMoves <= par && extraTubesAdded === 0) stars = 3;
    else if (finalMoves <= par + 3) stars = 2;

    const breakdown: LevelScoreBreakdown = {
      basePoints,
      moveBonus,
      timeBonus,
      undoPenalty,
      hintPenalty,
      extraTubePenalty,
      totalScore: totalLevelScore,
      moves: finalMoves,
      optimalParMoves: par,
      timeTakenSeconds: timeTaken,
      stars,
    };
    setLastScoreBreakdown(breakdown);

    // Check if new best score
    const prevBestScore = progress.levelScores[currentLevelNumber] || 0;
    const isNewBest = totalLevelScore > prevBestScore;
    setIsNewBestScore(isNewBest);

    // Update Persistent Progress
    const nextUnlocked = Math.max(progress.unlockedLevel, Math.min(40, currentLevelNumber + 1));
    const completedSet = new Set<number>(progress.completedLevels);
    completedSet.add(currentLevelNumber);

    const updatedScores = {
      ...progress.levelScores,
      [currentLevelNumber]: Math.max(prevBestScore, totalLevelScore),
    };

    const prevBestMoves = progress.bestMoves[currentLevelNumber];
    const updatedBestMoves = {
      ...progress.bestMoves,
      [currentLevelNumber]: prevBestMoves ? Math.min(prevBestMoves, finalMoves) : finalMoves,
    };

    const prevBestTime = progress.levelBestTimes[currentLevelNumber];
    const updatedBestTimes = {
      ...progress.levelBestTimes,
      [currentLevelNumber]: prevBestTime ? Math.min(prevBestTime, timeTaken) : timeTaken,
    };

    const updatedStars = {
      ...progress.levelStars,
      [currentLevelNumber]: Math.max(stars, progress.levelStars[currentLevelNumber] || 0),
    };

    // Calculate total cumulative score across all completed levels
    const totalCumulative = (Object.values(updatedScores) as number[]).reduce((a: number, b: number) => a + b, 0);

    const newProgress: SortingPlayerProgress = {
      unlockedLevel: nextUnlocked,
      completedLevels: Array.from(completedSet),
      totalCumulativeScore: totalCumulative,
      levelScores: updatedScores,
      bestMoves: updatedBestMoves,
      stars: updatedStars,
      levelStars: updatedStars,
      levelBestTimes: updatedBestTimes,
      stats: {
        ...progress.stats,
        gamesPlayed: (progress.stats?.gamesPlayed || 0) + 1,
      },
      highScore: Math.max(progress.highScore || 0, totalLevelScore),
    };

    saveProgress(newProgress);

    if (currentLevelNumber >= 40) {
      onGameOver(totalCumulative, elapsedSeconds);
    }
  };

  /**
   * Reset All Progress (Settings Modal)
   */
  const handleResetProgress = () => {
    const blank: SortingPlayerProgress = {
      unlockedLevel: 1,
      completedLevels: [],
      totalCumulativeScore: 0,
      levelScores: {},
      bestMoves: {},
      stars: {},
      levelStars: {},
      levelBestTimes: {},
      stats: {
        gamesPlayed: 0,
        totalUndosUsed: 0,
        totalHintsUsed: 0,
        totalExtraTubesUsed: 0,
      },
      highScore: 0,
    };
    saveProgress(blank);
    startGame(1);
    setGameState('MENU');
  };

  /**
   * Exit Game Handler
   */
  const handleExitGame = () => {
    sortingAudio.playButton();
    if (progress.totalCumulativeScore > 0) {
      onGameOver(progress.totalCumulativeScore, elapsedSeconds);
    }
    onExit();
  };

  /**
   * Format seconds to MM:SS
   */
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-between overflow-hidden select-none font-['Plus_Jakarta_Sans',sans-serif]"
      style={{ backgroundColor: '#F3E9D8', color: '#40372F' }}
    >
      {/* ===================================================================
          1. IN-GAME TOURNAMENT APP BAR (Strictly 6 items in exact order)
             1. Back, 2. Time, 3. Sound, 4. Moves, 5. Undo, 6. Add Tube
         =================================================================== */}
      {gameState === 'PLAYING' && (
        <header
          className="w-full h-13 sm:h-16 flex items-center justify-between px-1.5 sm:px-4 border-b border-[#D4C3AA] z-30 shrink-0 shadow-xs flex-nowrap"
          style={{ backgroundColor: '#F3E9D8' }}
        >
          {/* Left: Primary controls (1. Back, 2. Time, 3. Sound) */}
          <div className="flex items-center gap-1 sm:gap-2 flex-nowrap shrink-0">
            {/* 1. Back */}
            <button
              onClick={() => {
                sortingAudio.playButton();
                setGameState('MENU');
              }}
              className="px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg bg-[#E6D8C3] hover:bg-[#d8c8b0] active:scale-95 text-[#40372F] flex items-center gap-1 transition-all cursor-pointer border border-[#D4C3AA] shadow-xs text-xs font-bold"
              title="Return to Menu"
              aria-label="Back to Menu"
            >
              <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#40372F] shrink-0" />
              <span className="font-bold uppercase tracking-wider text-[11px] sm:text-xs">Back</span>
            </button>

            {/* 2. Time */}
            <div className="flex items-center gap-1 px-1.5 py-1 sm:px-2.5 sm:py-1.5 rounded-lg bg-[#E6D8C3] border border-[#D4C3AA] text-[#40372F] font-mono text-[11px] sm:text-xs font-bold shadow-xs">
              <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#786B5B] shrink-0" />
              <span>{formatTime(elapsedSeconds)}</span>
            </div>

            {/* 3. Sound */}
            <button
              onClick={() => setSoundActive(!soundActive)}
              className="w-7 h-7 sm:w-8.5 sm:h-8.5 rounded-lg bg-[#E6D8C3] hover:bg-[#d8c8b0] active:scale-95 text-[#40372F] flex items-center justify-center transition-all cursor-pointer border border-[#D4C3AA] shadow-xs shrink-0"
              aria-label="Toggle Sound"
              title="Toggle Sound"
            >
              {soundActive ? (
                <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#40372F]" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#786B5B]" />
              )}
            </button>
          </div>

          {/* Right: Gameplay actions (4. Moves, 5. Undo, 6. Add Tube) */}
          <div className="flex items-center gap-1 sm:gap-2 flex-nowrap shrink-0">
            {/* 4. Moves */}
            <div className="flex items-center gap-1 px-1.5 py-1 sm:px-2.5 sm:py-1.5 rounded-lg bg-[#E6D8C3] border border-[#D4C3AA] text-[#40372F] font-mono text-[11px] sm:text-xs font-bold shadow-xs">
              <span className="text-[#786B5B] text-[10px] font-sans uppercase font-bold hidden min-[370px]:inline">Moves</span>
              <span>{movesCount}</span>
            </div>

            {/* 5. Undo */}
            <button
              onClick={handleUndo}
              disabled={moveHistory.length === 0 || undosRemaining <= 0 || isAnimating}
              className={`px-1.5 py-1 sm:px-2.5 sm:py-1.5 rounded-lg bg-[#E6D8C3] hover:bg-[#d8c8b0] active:scale-95 text-[#40372F] flex items-center gap-1 text-[11px] sm:text-xs font-bold transition-all cursor-pointer border border-[#D4C3AA] shadow-xs ${
                moveHistory.length === 0 || undosRemaining <= 0 || isAnimating
                  ? 'opacity-40 cursor-not-allowed'
                  : ''
              }`}
              aria-label="Undo Move"
              title={`Undo (${undosRemaining} left)`}
            >
              <Undo2 className="w-3.5 h-3.5 text-[#40372F] stroke-[2.2] shrink-0" />
              <span className="text-[10px] font-mono bg-[#D4C3AA] text-[#40372F] px-1 rounded-full font-bold">
                {undosRemaining}
              </span>
            </button>

            {/* 6. Add Tube (Strictly maximum 1 per attempt) */}
            <button
              onClick={handleAddExtraTube}
              disabled={extraTubesAdded >= 1 || extraTubeUsedRef.current || isAnimating}
              className={`px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg flex items-center gap-1 text-[11px] sm:text-xs font-bold transition-all border shadow-xs ${
                extraTubesAdded >= 1 || extraTubeUsedRef.current
                  ? 'opacity-40 cursor-not-allowed bg-[#E6D8C3] border-[#D4C3AA] text-[#786B5B]'
                  : 'bg-[#D58A36] hover:bg-[#c47b2c] active:scale-95 text-white border-[#b87024] cursor-pointer'
              }`}
              aria-label="Add Extra Buffer Tube (-250 PTS)"
              title={
                extraTubesAdded >= 1 || extraTubeUsedRef.current
                  ? 'Extra tube already used (Max 1 per attempt)'
                  : 'Add 1 Tube (-250 PTS)'
              }
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
              <span>Tube</span>
              {(extraTubesAdded >= 1 || extraTubeUsedRef.current) && (
                <span className="text-[9px] font-mono opacity-80">(1/1)</span>
              )}
            </button>
          </div>
        </header>
      )}

      {/* ===================================================================
          2. PUZZLE ARENA (3D Canvas + In-Game HUD Controls)
         =================================================================== */}
      <main
        className="relative flex-1 w-full min-h-0 flex flex-col overflow-hidden"
        style={{ backgroundColor: '#F3E9D8' }}
      >
        {/* Live Score Gain / Penalty Floating Notification */}
        {lastScoreGain && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div
              className={`px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider shadow-lg backdrop-blur-sm flex items-center gap-1.5 font-mono ${
                lastScoreGain.amount < 0
                  ? 'bg-rose-100 border-rose-400 text-rose-800'
                  : 'bg-amber-100 border-amber-400 text-amber-800'
              }`}
            >
              <span>✦</span>
              <span>{lastScoreGain.label}</span>
              <span>✦</span>
            </div>
          </div>
        )}

        {/* Active Hint Banner */}
        {activeHintMessage && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="px-4 py-1.5 rounded-full bg-[#E6D8C3] border border-[#D58A36] text-[#40372F] text-xs font-bold tracking-wide shadow-xl backdrop-blur-md flex items-center gap-2">
              <Lightbulb className="w-3.5 h-3.5 text-[#D58A36] shrink-0" />
              <span>{activeHintMessage}</span>
            </div>
          </div>
        )}

        {/* 3D WEBGL ARENA CONTAINER */}
        <div
          ref={canvasContainerRef}
          onPointerDown={handleCanvasPointerDown}
          className="absolute inset-0 w-full h-full cursor-pointer touch-none"
        />
      </main>

      {/* ===================================================================
          3. FULL MAIN PRE-GAME MENU MODAL (Opening Screen by Default)
         =================================================================== */}
      {gameState === 'MENU' && (
        <SortingMenuModal
          progress={progress}
          onPlay={() => {
            startGame(progress.unlockedLevel || 1);
          }}
          onOpenLevels={() => {
            sortingAudio.playButton();
            levelSelectSourceRef.current = 'MENU';
            setGameState('LEVEL_SELECT');
          }}
          onOpenLeaderboard={() => {
            sortingAudio.playButton();
            setGameState('LEADERBOARD');
          }}
          onOpenHowToPlay={() => {
            sortingAudio.playButton();
            setGameState('HOW_TO_PLAY');
          }}
          onOpenAchievements={() => {
            sortingAudio.playButton();
            setGameState('ACHIEVEMENTS');
          }}
          onOpenStatistics={() => {
            sortingAudio.playButton();
            setGameState('STATISTICS');
          }}
          onOpenSettings={() => {
            sortingAudio.playButton();
            setGameState('SETTINGS');
          }}
          onOpenAbout={() => {
            sortingAudio.playButton();
            setGameState('ABOUT');
          }}
          onExit={handleExitGame}
        />
      )}

      {/* ===================================================================
          4. LEADERBOARD MODAL
         =================================================================== */}
      <SortingLeaderboardModal
        isOpen={gameState === 'LEADERBOARD'}
        onClose={() => setGameState('MENU')}
        progress={progress}
        playerName={profile?.displayName || profile?.phoneNumber || 'You'}
      />

      {/* ===================================================================
          5. HOW TO PLAY MODAL
         =================================================================== */}
      <SortingHowToPlayModal
        isOpen={gameState === 'HOW_TO_PLAY'}
        onClose={() => setGameState('MENU')}
      />

      {/* ===================================================================
          6. ACHIEVEMENTS MODAL
         =================================================================== */}
      <SortingAchievementsModal
        isOpen={gameState === 'ACHIEVEMENTS'}
        onClose={() => setGameState('MENU')}
        progress={progress}
      />

      {/* ===================================================================
          7. STATISTICS MODAL
         =================================================================== */}
      <SortingStatisticsModal
        isOpen={gameState === 'STATISTICS'}
        onClose={() => setGameState('MENU')}
        progress={progress}
      />

      {/* ===================================================================
          8. SETTINGS MODAL
         =================================================================== */}
      <SortingSettingsModal
        isOpen={gameState === 'SETTINGS'}
        onClose={() => setGameState('MENU')}
        onResetProgress={handleResetProgress}
      />

      {/* ===================================================================
          9. ABOUT MODAL
         =================================================================== */}
      <SortingAboutModal
        isOpen={gameState === 'ABOUT'}
        onClose={() => setGameState('MENU')}
      />

      {/* ===================================================================
          10. 40-LEVEL SELECTION MODAL
         =================================================================== */}
      <SortingLevelSelectModal
        isOpen={gameState === 'LEVEL_SELECT'}
        onClose={() => setGameState(levelSelectSourceRef.current || 'MENU')}
        progress={progress}
        currentLevel={currentLevelNumber}
        onSelectLevel={(lvl) => {
          startGame(lvl);
        }}
      />

      {/* ===================================================================
          11. LEVEL VICTORY MODAL
         =================================================================== */}
      <SortingVictoryModal
        isOpen={gameState === 'LEVEL_COMPLETE'}
        level={currentLevelNumber}
        totalLevels={TOTAL_SORTING_LEVELS}
        scoreBreakdown={lastScoreBreakdown}
        cumulativeTotalScore={progress.totalCumulativeScore}
        isNewBest={isNewBestScore}
        onNextLevel={() => {
          if (currentLevelNumber < TOTAL_SORTING_LEVELS) {
            startGame(currentLevelNumber + 1);
          } else {
            setGameState('LEADERBOARD');
          }
        }}
        onReplay={() => {
          startGame(currentLevelNumber);
        }}
        onGoToMenu={() => {
          sortingAudio.playButton();
          setGameState('MENU');
        }}
        onOpenLeaderboard={() => {
          sortingAudio.playButton();
          setGameState('LEADERBOARD');
        }}
      />

      {/* Recoverable Error Modal */}
      {gameState === 'ERROR' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-[#E6D8C3] border border-[#D4C3AA] p-6 text-center shadow-xl space-y-4 font-['Plus_Jakarta_Sans',sans-serif]">
            <h3 className="text-lg font-black text-[#40372F] uppercase">Level Initialization Error</h3>
            <p className="text-xs text-[#786B5B] font-medium leading-relaxed">
              Unable to load the selected puzzle board. Please retry or return to the menu.
            </p>
            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={() => startGame(currentLevelNumber || 1)}
                className="px-5 py-2.5 rounded-xl bg-[#D58A36] hover:bg-[#c47b2c] active:scale-95 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs"
              >
                Retry
              </button>
              <button
                onClick={() => setGameState('MENU')}
                className="px-5 py-2.5 rounded-xl bg-[#D4C3AA] hover:bg-[#c4b39a] active:scale-95 text-[#40372F] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs"
              >
                Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sample Reference Video Modal */}
      <SortingReferenceVideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
      />
    </div>
  );
};
