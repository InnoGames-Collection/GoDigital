/**
 * EMOJI IQ — Game Header
 * Clean header with Exit, Emoji IQ badge, Hints counter, Sound toggle, and Settings.
 * Completely free of lives/hearts and coin balance systems.
 */

import React from 'react';
import { Settings, Volume2, VolumeX, Lightbulb, ArrowLeft, Brain } from 'lucide-react';
import { EMOJI_IQ_COLORS } from '../colors';
import { emojiIqAudio } from '../emojiIqAudio';

interface EmojiIqHeaderProps {
  availableHints: number;
  onOpenSettings: () => void;
  onBack?: () => void;
  onUseHint?: () => void;
  showHintButton?: boolean;
  hintsDisabled?: boolean;
  coins?: number;
  lives?: number;
  maxLives?: number;
  onOpenStore?: () => void;
}

export const EmojiIqHeader: React.FC<EmojiIqHeaderProps> = ({
  availableHints,
  onOpenSettings,
  onBack,
  onUseHint,
  showHintButton = false,
  hintsDisabled = false,
}) => {
  const [sfxOn, setSfxOn] = React.useState<boolean>(emojiIqAudio.sfxEnabled);

  const handleToggleSound = () => {
    const nextState = emojiIqAudio.toggleSfx();
    setSfxOn(nextState);
  };

  return (
    <header className="w-full max-w-md mx-auto flex items-center justify-between px-3 py-2 sm:px-4 sm:py-2.5 z-20 select-none">
      {/* Top Left: Exit Button */}
      <div className="flex items-center gap-2">
        {onBack && (
          <button
            id="emoji-iq-back-btn"
            onClick={() => {
              emojiIqAudio.playPop();
              onBack();
            }}
            className="h-8 px-2.5 rounded-full bg-white border border-[#6C5CE7]/20 flex items-center gap-1.5 text-[#241F3D] hover:scale-105 active:scale-95 transition-transform shadow-xs cursor-pointer"
            title="Exit Game"
            aria-label="Exit Game"
          >
            <ArrowLeft className="w-4 h-4 text-[#6C5CE7] stroke-[2.5]" />
            <span className="text-[11px] font-bold text-[#6C5CE7]">Exit</span>
          </button>
        )}
      </div>

      {/* Center: Clean Game Identity Badge */}
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm border border-[#6C5CE7]/20 shadow-xs">
        <Brain className="w-4 h-4 text-[#6C5CE7]" />
        <span
          className="text-xs font-black uppercase tracking-wider font-['Fredoka',sans-serif]"
          style={{ color: EMOJI_IQ_COLORS.textPrimary }}
        >
          EMOJI <span style={{ color: EMOJI_IQ_COLORS.primary }}>IQ</span>
        </span>
      </div>

      {/* Right Controls: Hint, Sound, Settings */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Hint Button (during gameplay) */}
        {showHintButton && (
          <button
            onClick={onUseHint}
            disabled={hintsDisabled || availableHints <= 0}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black shadow-xs transition-all ${
              hintsDisabled || availableHints <= 0
                ? 'opacity-40 bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-white hover:scale-105 active:scale-95 text-[#241F3D] border border-[#FFB703]'
            }`}
            title={availableHints > 0 ? `Use Hint (${availableHints} remaining)` : 'No hints remaining'}
          >
            <Lightbulb className="w-3.5 h-3.5 text-[#FFB703] fill-[#FFB703]" />
            <span className="font-mono text-xs">{availableHints}</span>
          </button>
        )}

        {/* Sound Toggle */}
        <button
          onClick={handleToggleSound}
          className="w-8 h-8 rounded-full bg-white border border-[#6C5CE7]/20 flex items-center justify-center text-[#241F3D] hover:scale-105 active:scale-95 transition-transform shadow-xs"
          title={sfxOn ? 'Mute Sound' : 'Enable Sound'}
          aria-label={sfxOn ? 'Mute Sound' : 'Enable Sound'}
        >
          {sfxOn ? (
            <Volume2 className="w-4 h-4 text-[#6C5CE7]" />
          ) : (
            <VolumeX className="w-4 h-4 text-[#6B6780]" />
          )}
        </button>

        {/* Settings Button */}
        <button
          onClick={() => {
            emojiIqAudio.playPop();
            onOpenSettings();
          }}
          className="w-8 h-8 rounded-full bg-white border border-[#6C5CE7]/20 flex items-center justify-center text-[#241F3D] hover:scale-105 active:scale-95 transition-transform shadow-xs"
          title="Game Settings"
          aria-label="Game Settings"
        >
          <Settings className="w-4 h-4 text-[#6C5CE7]" />
        </button>
      </div>
    </header>
  );
};
