import React from 'react';
import { Crown } from 'lucide-react';

interface GoDigitalLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
}

/**
 * Official GoDigital Brand Identity Wordmark & Emblem
 * 
 * Design System Specifications:
 * - Bright Golden Highlight Crown Emblem (#FFD35A)
 * - Modern Geometric Dual-Tone Wordmark: "Go" (#FFF0CF) + "Digital" (#FFAA24 to #F47B20)
 * - Warm Sunset Gaming Portal Aesthetic
 */
export const GoDigitalLogo: React.FC<GoDigitalLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = false,
}) => {
  // Sizing matrix for emblem and typography
  const config = {
    xs: {
      crownSize: 'w-3 h-3',
      textClass: 'text-[15px]',
      gap: 'gap-1',
      subTextClass: 'text-[7px]',
    },
    sm: {
      crownSize: 'w-3.5 h-3.5',
      textClass: 'text-[18px]',
      gap: 'gap-1.5',
      subTextClass: 'text-[8px]',
    },
    md: {
      crownSize: 'w-4 h-4',
      textClass: 'text-[22px]',
      gap: 'gap-1.5',
      subTextClass: 'text-[9px]',
    },
    lg: {
      crownSize: 'w-5 h-5',
      textClass: 'text-[28px]',
      gap: 'gap-2',
      subTextClass: 'text-[10px]',
    },
    xl: {
      crownSize: 'w-7 h-7',
      textClass: 'text-[36px]',
      gap: 'gap-2.5',
      subTextClass: 'text-[12px]',
    },
  }[size];

  return (
    <div className={`inline-flex flex-col items-center select-none shrink-0 ${className}`}>
      <div className={`flex items-center ${config.gap} leading-none tracking-tight`}>
        {/* Golden Gaming Crown Emblem */}
        <div className="relative flex items-center justify-center shrink-0">
          <Crown className={`${config.crownSize} text-[#FFD35A] fill-[#FFD35A] drop-shadow-[0_2px_8px_rgba(255,170,36,0.55)]`} />
        </div>

        {/* Brand Wordmark: "Go" in Warm Cream, "Digital" in Sunset Amber-Orange Gradient */}
        <div className={`font-black italic ${config.textClass} flex items-center`}>
          <span className="text-[#FFF0CF] drop-shadow-sm tracking-tight">Go</span>
          <span className="bg-gradient-to-r from-[#FFD35A] via-[#FFAA24] to-[#F47B20] bg-clip-text text-transparent drop-shadow-[0_2px_12px_rgba(255,170,36,0.35)] tracking-tight ml-0.5">
            Digital
          </span>
        </div>
      </div>

      {showSubtitle && (
        <span className={`${config.subTextClass} font-extrabold uppercase tracking-[0.22em] text-[#E6C8A4] mt-0.5`}>
          Gaming Portal
        </span>
      )}
    </div>
  );
};

export default GoDigitalLogo;
