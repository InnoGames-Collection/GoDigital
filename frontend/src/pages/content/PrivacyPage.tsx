/**
 * GoDigital - Privacy Policy Page Component
 * 
 * Verbatim compliance & subscriber privacy text based on official specifications:
 * - Masked identity protection (091*****890) across public leaderboards
 * - Zero invasive device permissions
 * - TLS encrypted sessions and HMAC-SHA256 anti-cheat validation
 * - Rendered in a readable, smoothly scrollable content container
 * - Consistent destination header with Back button & warm sunset theme
 */

import React from 'react';
import { ShieldCheck, ArrowLeft, Lock, EyeOff, Shield, Server, FileCheck2 } from 'lucide-react';
import { TELEPLUS_PRIVACY_POLICY } from '../../data/teleplusContent';

interface PrivacyPageProps {
  onBack?: () => void;
  showHeader?: boolean;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onBack, showHeader = true }) => {
  const getSectionIcon = (idx: number) => {
    switch (idx) {
      case 0:
        return Server;
      case 1:
        return EyeOff;
      case 2:
        return Shield;
      case 3:
        return Lock;
      default:
        return FileCheck2;
    }
  };

  return (
    <div className="min-h-screen text-[#FFF0CF] pb-28 max-w-md md:max-w-xl lg:max-w-3xl mx-auto px-3.5 pt-3 select-none space-y-4 relative z-10">
      
      {/* 1. Header with Back Button */}
      {showHeader && (
        <div className="flex items-center justify-between gap-3 bg-[#352316] border border-[#81502B] text-[#FFF0CF] p-3.5 rounded-2xl shadow-xs">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                id="privacy-back-btn"
                type="button"
                onClick={onBack}
                className="w-8 h-8 rounded-xl bg-[#442C1B] hover:bg-[#352316] border border-[#81502B] hover:border-[#FFAA24]/60 flex items-center justify-center text-[#FFF0CF] transition-colors cursor-pointer shrink-0"
                title="Go Back"
                aria-label="Go Back"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#FFD35A] shrink-0" />
              <h1 className="text-base font-black tracking-tight text-[#FFF0CF]">Privacy Policy</h1>
            </div>
          </div>
          <span className="text-[11px] font-bold text-[#E6C8A4] bg-[#442C1B] px-2.5 py-0.5 rounded-full border border-[#81502B]">
            Identity Protected
          </span>
        </div>
      )}

      {/* 2. Overview Card */}
      <div className="p-4 rounded-2xl bg-[#352316] border border-[#81502B] shadow-xs text-xs text-[#E6C8A4] leading-relaxed space-y-1">
        <h2 className="font-black text-[#FFF0CF] text-sm">{TELEPLUS_PRIVACY_POLICY.title}</h2>
        <p className="text-[11px] text-[#E6C8A4]">
          {TELEPLUS_PRIVACY_POLICY.summary}
        </p>
      </div>

      {/* 3. Privacy Policy Sections */}
      <div className="space-y-3">
        {TELEPLUS_PRIVACY_POLICY.sections.map((section, idx) => {
          const SectionIcon = getSectionIcon(idx);
          return (
            <div
              key={idx}
              id={`privacy-section-${idx + 1}`}
              className="bg-[#352316] rounded-2xl p-4 border border-[#81502B] shadow-xs space-y-2.5"
            >
              <div className="flex items-center gap-2 pb-1.5 border-b border-[#81502B]/60">
                <SectionIcon className="w-4 h-4 text-[#FFD35A] shrink-0" />
                <h3 className="text-xs sm:text-sm font-black text-[#FFF0CF] leading-snug">
                  {section.title}
                </h3>
              </div>

              <div className="space-y-1.5 text-xs text-[#E6C8A4] leading-relaxed pl-1">
                {section.paragraphs.map((p, pIdx) => (
                  <p key={pIdx}>{p}</p>
                ))}

                {section.bulletPoints && section.bulletPoints.length > 0 && (
                  <ul className="list-disc list-inside space-y-1 text-[#E6C8A4] pl-2 pt-1">
                    {section.bulletPoints.map((bp, bIdx) => (
                      <li key={bIdx} className="leading-relaxed">{bp}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Footer */}
      <div className="pt-2 flex items-center justify-center gap-1.5 text-[10px] text-[#E6C8A4]/70 font-bold">
        <ShieldCheck className="w-3.5 h-3.5 text-[#FFD35A]" />
        <span>telebirr SSO Verified • Masked Identity Encryption Standard</span>
      </div>

    </div>
  );
};

export default PrivacyPage;
