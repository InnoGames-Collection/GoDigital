/**
 * EMOJI IQ — Main Game Container
 * Professional 40-Stage Tournament Emoji Reasoning & Math Puzzle Game
 * Strictly adheres to the mandatory color palette and reference video presentation.
 * 
 * Free of coins, lives, and pay-to-continue prompts.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { EmojiIqScreen, EmojiIqPlayerStats, TournamentScoreCalculation, EmojiIqQuestion } from './types';
import { EMOJI_IQ_LEVELS, getQuestionsForLevel } from './questionDatabase';
import { calculateIqTournamentScore } from './scoringEngine';
import { EmojiIqLeaderboardService } from './tournamentLeaderboardService';
import { EMOJI_IQ_COLORS } from './colors';
import { emojiIqAudio } from './emojiIqAudio';

import { EmojiIqHeader } from './components/EmojiIqHeader';
import { EmojiIqHome } from './components/EmojiIqHome';
import { EmojiIqLevelSelect } from './components/EmojiIqLevelSelect';
import { EmojiIqLevelInfo } from './components/EmojiIqLevelInfo';
import { EmojiIqPlayView } from './components/EmojiIqPlayView';
import { EmojiIqFeedbackModal, FeedbackType } from './components/EmojiIqFeedbackModal';
import { EmojiIqLeaderboardModal } from './components/EmojiIqLeaderboardModal';
import { EmojiIqSettingsModal } from './components/EmojiIqSettingsModal';
import { EmojiIqHowToPlayModal } from './components/EmojiIqHowToPlayModal';

interface EmojiIqGameProps {
  onClose?: () => void;
  onGameCompleted?: (score: number) => void;
}

export const EmojiIqGame: React.FC<EmojiIqGameProps> = ({ onClose, onGameCompleted }) => {
  // Navigation & Screen Lifecycle
  const [screen, setScreen] = useState<EmojiIqScreen>('HOME');
  const [selectedLevelNumber, setSelectedLevelNumber] = useState<number>(1);

  // Modals Visibility
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);
  const [feedbackType, setFeedbackType] = useState<FeedbackType | null>(null);

  // Player Stats (Persistent)
  const [playerStats, setPlayerStats] = useState<EmojiIqPlayerStats>(() =>
    EmojiIqLeaderboardService.loadPlayerStats()
  );

  const refreshStats = useCallback(() => {
    setPlayerStats(EmojiIqLeaderboardService.loadPlayerStats());
  }, []);

  // Active Questions State (Loaded per level start to guarantee stability during play)
  const [activeQuestions, setActiveQuestions] = useState<EmojiIqQuestion[]>(() =>
    getQuestionsForLevel(1)
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);

  // Runtime In-Level Scoring State
  const [levelScore, setLevelScore] = useState<number>(0);
  const [comboCount, setComboCount] = useState<number>(0);
  const [levelBestCombo, setLevelBestCombo] = useState<number>(0);
  const [levelCorrectCount, setLevelCorrectCount] = useState<number>(0);
  const [levelPerfectCount, setLevelPerfectCount] = useState<number>(0);
  const [availableHints, setAvailableHints] = useState<number>(3);
  const [hintsUsedInQuestion, setHintsUsedInQuestion] = useState<number>(0);
  const [eliminatedOptions, setEliminatedOptions] = useState<number[]>([]);
  const [lastScoreCalc, setLastScoreCalc] = useState<TournamentScoreCalculation | null>(null);

  // Clean audio stop when unmounting
  useEffect(() => {
    return () => {
      emojiIqAudio.stopAll();
    };
  }, []);

  // Active level config
  const currentLevelConfig = EMOJI_IQ_LEVELS[selectedLevelNumber - 1] || EMOJI_IQ_LEVELS[0];

  // Initialize questions on level start
  const startLevel = useCallback((levelNum: number) => {
    setSelectedLevelNumber(levelNum);
    const newQuestions = getQuestionsForLevel(levelNum);
    setActiveQuestions(newQuestions);
    setCurrentQuestionIndex(0);
    setLevelScore(0);
    setComboCount(0);
    setLevelBestCombo(0);
    setLevelCorrectCount(0);
    setLevelPerfectCount(0);
    setAvailableHints(3); // 3 fresh hints per level
    setHintsUsedInQuestion(0);
    setEliminatedOptions([]);
    setFeedbackType(null);
    setScreen('PLAYING');
  }, []);

  // Handle User Answer Selection
  const handleSelectAnswer = useCallback((optionIndex: number, timeRemainingSeconds: number) => {
    const question = activeQuestions[currentQuestionIndex];
    if (!question) return;

    const isCorrect = optionIndex === question.correctIndex;

    const calc = calculateIqTournamentScore({
      isCorrect,
      basePoints: question.basePoints,
      timeRemainingSeconds,
      totalTimeSeconds: question.timeLimitSeconds,
      currentCombo: comboCount,
      hintsUsedOnQuestion: hintsUsedInQuestion,
      difficulty: question.difficulty,
    });

    setLastScoreCalc(calc);

    if (isCorrect) {
      if (calc.isPerfect) {
        emojiIqAudio.playPerfect();
      } else {
        emojiIqAudio.playCorrect();
      }

      const nextCombo = comboCount + 1;
      setComboCount(nextCombo);
      if (nextCombo > levelBestCombo) {
        setLevelBestCombo(nextCombo);
      }
      if (nextCombo >= 2) {
        emojiIqAudio.playCombo(nextCombo);
      }

      setLevelScore((prev) => prev + calc.totalPointsAwarded);
      setLevelCorrectCount((prev) => prev + 1);
      if (calc.isPerfect) {
        setLevelPerfectCount((prev) => prev + 1);
      }
      // Answer feedback is now displayed inline on the question board
    } else {
      // Quiet, gentle non-disruptive feedback
      emojiIqAudio.playIncorrect();
      setComboCount(0);
      // No life reduction, no coin penalty, continues smoothly with inline feedback
    }
  }, [activeQuestions, currentQuestionIndex, comboCount, hintsUsedInQuestion, levelBestCombo]);

  // Handle Time Expired on Question
  const handleTimeExpired = useCallback(() => {
    emojiIqAudio.playIncorrect();
    setComboCount(0);
    // Inline timeout feedback handled smoothly on play view
  }, []);

  // Handle Hint Usage
  const handleUseHint = useCallback(() => {
    if (availableHints <= 0) return;

    const question = activeQuestions[currentQuestionIndex];
    if (!question) return;

    // Find wrong options that haven't been eliminated yet
    const wrongIndices = question.options
      .map((_, idx) => idx)
      .filter((idx) => idx !== question.correctIndex && !eliminatedOptions.includes(idx));

    if (wrongIndices.length === 0) return;

    // Eliminate 1 wrong option
    const toEliminate = wrongIndices.slice(0, 1);
    setEliminatedOptions((prev) => [...prev, ...toEliminate]);
    setHintsUsedInQuestion((prev) => prev + 1);
    setAvailableHints((prev) => Math.max(0, prev - 1));

    emojiIqAudio.playHint();
  }, [availableHints, activeQuestions, currentQuestionIndex, eliminatedOptions]);

  // Advance to next question or complete level
  const handleAdvanceQuestion = useCallback(() => {
    const nextIdx = currentQuestionIndex + 1;

    if (nextIdx >= activeQuestions.length) {
      // LEVEL COMPLETE!
      emojiIqAudio.playLevelClear();

      const finalAccuracy = Math.round(
        (levelCorrectCount / activeQuestions.length) * 100
      );

      EmojiIqLeaderboardService.recordLevelCompletion(
        selectedLevelNumber,
        levelScore,
        finalAccuracy,
        levelBestCombo,
        0,
        levelPerfectCount
      );
      refreshStats();

      if (onGameCompleted) {
        onGameCompleted(levelScore);
      }

      setFeedbackType('LEVEL_CLEAR');
    } else {
      setCurrentQuestionIndex(nextIdx);
      setHintsUsedInQuestion(0);
      setEliminatedOptions([]);
      setFeedbackType(null);
    }
  }, [
    currentQuestionIndex,
    activeQuestions.length,
    levelCorrectCount,
    selectedLevelNumber,
    levelScore,
    levelBestCombo,
    levelPerfectCount,
    refreshStats,
    onGameCompleted,
  ]);

  // Advance from Level Clear Modal to next level
  const handleAdvanceFromFeedback = useCallback(() => {
    if (feedbackType === 'LEVEL_CLEAR') {
      const nextLevel = Math.min(40, selectedLevelNumber + 1);
      setSelectedLevelNumber(nextLevel);
      setFeedbackType(null);
      setScreen('LEVEL_INFO');
    }
  }, [feedbackType, selectedLevelNumber]);

  // Reset Progress
  const handleResetProgress = () => {
    localStorage.removeItem('emoji_iq_player_stats_v1');
    refreshStats();
    setSelectedLevelNumber(1);
    setScreen('HOME');
  };

  const activeQuestion = activeQuestions[currentQuestionIndex] || activeQuestions[0];

  return (
    <div
      className="relative w-full h-full min-h-[600px] flex flex-col justify-between overflow-hidden"
      style={{
        backgroundColor: EMOJI_IQ_COLORS.bgLight,
        color: EMOJI_IQ_COLORS.textPrimary,
        fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      {/* Background Decorative Soft Gradients */}
      <div
        className="absolute -top-32 -left-32 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-40"
        style={{ backgroundColor: 'rgba(108, 92, 231, 0.25)' }}
      />
      <div
        className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-40"
        style={{ backgroundColor: 'rgba(0, 184, 217, 0.25)' }}
      />

      {/* Global Header Bar */}
      <EmojiIqHeader
        availableHints={availableHints}
        onOpenSettings={() => setShowSettings(true)}
        onBack={() => {
          if (screen === 'HOME') {
            if (onClose) onClose();
          } else {
            setScreen('HOME');
          }
        }}
        onUseHint={handleUseHint}
        showHintButton={screen === 'PLAYING'}
        hintsDisabled={eliminatedOptions.length >= 2 || availableHints <= 0}
      />

      {/* Active Screen Container */}
      <main className="relative flex-1 w-full flex flex-col justify-between z-10 overflow-hidden">
        {screen === 'HOME' && (
          <EmojiIqHome
            playerStats={playerStats}
            onPlay={() => {
              setSelectedLevelNumber(playerStats.unlockedLevel);
              setScreen('LEVEL_INFO');
            }}
            onOpenLevelSelect={() => setScreen('LEVEL_SELECT')}
            onOpenLeaderboard={() => setShowLeaderboard(true)}
            onOpenHowToPlay={() => setShowHowToPlay(true)}
          />
        )}

        {screen === 'LEVEL_SELECT' && (
          <EmojiIqLevelSelect
            playerStats={playerStats}
            onSelectLevel={(lvl) => {
              setSelectedLevelNumber(lvl);
              setScreen('LEVEL_INFO');
            }}
            onBack={() => setScreen('HOME')}
            onOpenLeaderboard={() => setShowLeaderboard(true)}
          />
        )}

        {screen === 'LEVEL_INFO' && (
          <EmojiIqLevelInfo
            levelConfig={currentLevelConfig}
            playerStats={playerStats}
            onStartLevel={() => startLevel(selectedLevelNumber)}
            onOpenLeaderboard={() => setShowLeaderboard(true)}
            onBack={() => setScreen('LEVEL_SELECT')}
          />
        )}

        {screen === 'PLAYING' && activeQuestion && (
          <EmojiIqPlayView
            question={activeQuestion}
            levelConfig={currentLevelConfig}
            currentQuestionIndex={currentQuestionIndex}
            totalQuestions={activeQuestions.length}
            levelScore={levelScore}
            comboCount={comboCount}
            hintsUsedOnCurrentQuestion={hintsUsedInQuestion}
            eliminatedOptionIndices={eliminatedOptions}
            onSelectAnswer={handleSelectAnswer}
            onTimeExpired={handleTimeExpired}
            onAdvanceQuestion={handleAdvanceQuestion}
          />
        )}
      </main>

      {/* Feedback Modal (Popups from Reference Video) */}
      {feedbackType && (
        <EmojiIqFeedbackModal
          type={feedbackType}
          levelConfig={currentLevelConfig}
          lastScoreCalc={lastScoreCalc}
          levelScore={levelScore}
          totalScore={playerStats.totalTournamentScore}
          accuracy={
            activeQuestions.length > 0
              ? Math.round((levelCorrectCount / (currentQuestionIndex + 1)) * 100)
              : 100
          }
          bestCombo={levelBestCombo}
          perfectCount={levelPerfectCount}
          explanation={activeQuestion?.explanation}
          onAdvance={handleAdvanceFromFeedback}
          onOpenLeaderboard={() => {
            setFeedbackType(null);
            setShowLeaderboard(true);
          }}
          onGoHome={() => {
            setFeedbackType(null);
            setScreen('HOME');
          }}
        />
      )}

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <EmojiIqLeaderboardModal
          playerStats={playerStats}
          onClose={() => setShowLeaderboard(false)}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <EmojiIqSettingsModal
          onGoHome={() => {
            setFeedbackType(null);
            setScreen('HOME');
          }}
          onResetProgress={handleResetProgress}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* How To Play Modal */}
      {showHowToPlay && (
        <EmojiIqHowToPlayModal onClose={() => setShowHowToPlay(false)} />
      )}
    </div>
  );
};

export default EmojiIqGame;
