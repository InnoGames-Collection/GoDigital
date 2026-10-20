/**
 * GoDigital - Terms & Conditions Page Component
 * 
 * Sourced directly from GoDigital specifications:
 * - Governing tournament participation, fair play, telebirr billing, and data protection
 * - Rendered in a readable, smoothly scrollable content container
 * - Consistent destination header with Back button & warm sunset theme
 */

import React from 'react';
import { FileText, ArrowLeft, ShieldCheck, Scale } from 'lucide-react';
import { TELEPLUS_TERMS_SECTIONS } from '../../data/teleplusContent';

interface TermsPageProps {
  onBack?: () => void;
  showHeader?: boolean;
}

export const TermsPage: React.FC<TermsPageProps> = ({ onBack, showHeader = true }) => {
  return (
    <div className="min-h-screen text-[#FFF0CF] pb-28 max-w-md md:max-w-xl lg:max-w-3xl mx-auto px-3.5 pt-3 select-none space-y-4 relative z-10">
      
      {/* 1. Header with Back Button */}
      {showHeader && (
        <div className="flex items-center justify-between gap-3 bg-[#352316] border border-[#81502B] text-[#FFF0CF] p-3.5 rounded-2xl shadow-xs">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                id="terms-back-btn"
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
              <FileText className="w-5 h-5 text-[#FFD35A] shrink-0" />
              <h1 className="text-base font-black tracking-tight text-[#FFF0CF]">Terms & Conditions</h1>
            </div>
          </div>
          <span className="text-[11px] font-bold text-[#E6C8A4] bg-[#442C1B] px-2.5 py-0.5 rounded-full border border-[#81502B]">
            Official Rules
          </span>
        </div>
      )}

      {/* 2. Top Summary Card */}
      <div className="p-4 rounded-2xl bg-[#352316] border border-[#81502B] shadow-xs text-xs text-[#E6C8A4] leading-relaxed space-y-1">
        <div className="flex items-center gap-2 font-black text-sm text-[#FFF0CF]">
          <Scale className="w-4 h-4 text-[#FFD35A]" />
          <span>Official GoDigital Gaming Terms & Conditions</span>
        </div>
        <p className="text-[11px] text-[#E6C8A4]">
          Governing catalog access, weekly tournaments, fair play, server-authoritative scoring, telebirr SuperApp billing, and subscriber data protection.
        </p>
      </div>

      {/* 3. Terms Sections in Scrollable Container */}
      <div className="space-y-3">
        {TELEPLUS_TERMS_SECTIONS.map((section) => (
          <div
            key={section.number}
            id={`term-section-${section.number.replace('.', '-')}`}
            className="bg-[#352316] rounded-2xl p-4 border border-[#81502B] shadow-xs space-y-2.5"
          >
            <div className="flex items-center gap-2 pb-1.5 border-b border-[#81502B]/60">
              <span className="px-2 py-0.5 rounded-md bg-[#442C1B] border border-[#81502B] text-[#FFD35A] font-mono font-black text-xs shrink-0">
                {section.number}
              </span>
              <h2 className="text-xs sm:text-sm font-black text-[#FFF0CF] leading-snug">
                {section.title}
              </h2>
            </div>

            <div className="space-y-1.5 text-xs text-[#E6C8A4] leading-relaxed pl-1">
              {section.paragraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
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
        ))}
      </div>

      {/* 4. Footer Verification Stamp */}
      <div className="pt-2 flex items-center justify-center gap-1.5 text-[10px] text-[#E6C8A4]/70 font-bold">
        <ShieldCheck className="w-3.5 h-3.5 text-[#FFD35A]" />
        <span>telebirr SuperApp Verified Service Terms • Last Updated October 2026</span>
      </div>

    </div>
  );
};

export default TermsPage;
