/**
 * GoDigital - Games Help & Support Page Component
 * 
 * Features:
 * - Interactive expandable/collapsible accordion for all 9 support topics
 * - Dynamic '+' (collapsed) and '−' (expanded) icons
 * - Subscriber Assistance Guide banner
 * - Important official support notice (without invented numbers)
 * - Consistent destination header with Back button & warm sunset theme
 */

import React, { useState } from 'react';
import { 
  Headphones, 
  ArrowLeft, 
  Plus, 
  Minus, 
  LifeBuoy, 
  AlertCircle,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';
import { TELEPLUS_SUPPORT_TOPICS } from '../../data/teleplusContent';

interface HelpSupportPageProps {
  onBack?: () => void;
  showHeader?: boolean;
}

export const HelpSupportPage: React.FC<HelpSupportPageProps> = ({ onBack, showHeader = true }) => {
  // First topic expanded by default for quick guidance
  const [openTopicIds, setOpenTopicIds] = useState<Record<string, boolean>>({
    'sub-support': true,
  });

  const toggleTopic = (id: string) => {
    setOpenTopicIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const expandAll = () => {
    const allOpen: Record<string, boolean> = {};
    TELEPLUS_SUPPORT_TOPICS.forEach((t) => {
      allOpen[t.id] = true;
    });
    setOpenTopicIds(allOpen);
  };

  const collapseAll = () => {
    setOpenTopicIds({});
  };

  return (
    <div className="min-h-screen text-[#FFF0CF] pb-28 max-w-md md:max-w-xl lg:max-w-3xl mx-auto px-3.5 pt-3 select-none space-y-4 relative z-10">
      
      {/* 1. Header with Back Button */}
      {showHeader && (
        <div className="flex items-center justify-between gap-3 bg-[#352316] border border-[#81502B] text-[#FFF0CF] p-3.5 rounded-2xl shadow-xs">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                id="help-support-back-btn"
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
              <Headphones className="w-5 h-5 text-[#FFD35A] shrink-0" />
              <h1 className="text-base font-black tracking-tight text-[#FFF0CF]">Games Help & Support</h1>
            </div>
          </div>
          <span className="text-[11px] font-bold text-[#E6C8A4] bg-[#442C1B] px-2.5 py-0.5 rounded-full border border-[#81502B]">
            {TELEPLUS_SUPPORT_TOPICS.length} Topics
          </span>
        </div>
      )}

      {/* 2. Top Notice & Controls */}
      <div className="space-y-2.5">
        <div className="p-3.5 rounded-2xl bg-[#352316] border border-[#81502B] flex items-start gap-2.5 text-xs text-[#E6C8A4] leading-relaxed shadow-xs">
          <LifeBuoy className="w-4 h-4 text-[#FFD35A] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-[#FFF0CF]">Subscriber Assistance Guide: </span>
            Select a topic below to see what information to prepare and recommended resolution steps for service, billing, and gameplay inquiries.
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-[#E6C8A4] px-1">
          <span>Click any topic to expand details</span>
          <div className="flex items-center gap-3">
            <button
              onClick={expandAll}
              className="text-[#FFD35A] hover:underline font-bold cursor-pointer"
            >
              Expand All
            </button>
            <span>•</span>
            <button
              onClick={collapseAll}
              className="text-[#E6C8A4] hover:underline font-bold cursor-pointer"
            >
              Collapse All
            </button>
          </div>
        </div>
      </div>

      {/* 3. Accordion List of 9 Support Topics */}
      <div className="space-y-2.5">
        {TELEPLUS_SUPPORT_TOPICS.map((topic, index) => {
          const isOpen = !!openTopicIds[topic.id];

          return (
            <div
              key={topic.id}
              id={`support-topic-${topic.id}`}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isOpen
                  ? 'bg-[#352316] border-[#FFAA24]/70 shadow-md'
                  : 'bg-[#352316] border-[#81502B] hover:border-[#FFAA24]/40 shadow-xs'
              }`}
            >
              {/* Row Header */}
              <button
                type="button"
                onClick={() => toggleTopic(topic.id)}
                className="w-full px-4 py-3.5 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer select-none group"
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <span className="text-[10px] font-black font-mono text-[#FFD35A] shrink-0 px-1.5 py-0.5 rounded bg-[#442C1B] border border-[#81502B]">
                    {index + 1}
                  </span>
                  <span
                    className={`text-xs sm:text-sm font-black leading-snug transition-colors ${
                      isOpen ? 'text-[#FFD35A]' : 'text-[#FFF0CF] group-hover:text-[#FFD35A]'
                    }`}
                  >
                    {topic.title}
                  </span>
                </div>

                {/* Dynamic +/- toggle */}
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    isOpen
                      ? 'bg-gradient-to-r from-[#FFD35A] to-[#FFAA24] text-[#24170F]'
                      : 'bg-[#442C1B] text-[#E6C8A4] group-hover:bg-[#523521]'
                  }`}
                >
                  {isOpen ? (
                    <Minus className="w-3.5 h-3.5 stroke-[3]" />
                  ) : (
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  )}
                </div>
              </button>

              {/* Expanded Body */}
              {isOpen && (
                <div className="px-4 pb-4 pt-2.5 border-t border-[#81502B]/60 bg-[#2B1B10]/90 animate-in fade-in slide-in-from-top-1 duration-150 space-y-2.5 pl-6 sm:pl-8">
                  {topic.content.map((p, pIdx) => (
                    <p key={pIdx} className="text-xs text-[#E6C8A4] leading-relaxed">
                      {p}
                    </p>
                  ))}

                  {topic.steps && topic.steps.length > 0 && (
                    <ol className="list-decimal list-inside space-y-1 text-xs text-[#E6C8A4] font-medium pl-1">
                      {topic.steps.map((st, sIdx) => (
                        <li key={sIdx}>{st}</li>
                      ))}
                    </ol>
                  )}

                  {topic.note && (
                    <div className="mt-2 p-2.5 rounded-xl bg-[#442C1B] border border-[#FFAA24]/40 text-[11px] text-[#FFD35A] font-bold flex items-start gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-[#FFD35A] shrink-0 mt-0.5" />
                      <span>{topic.note}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 4. Official Notice Banner */}
      <div className="p-3.5 rounded-2xl bg-[#352316] border border-[#81502B] text-xs text-[#E6C8A4] leading-relaxed flex items-start gap-2.5 shadow-xs">
        <ShieldCheck className="w-4 h-4 text-[#FFD35A] shrink-0 mt-0.5" />
        <p className="font-medium text-[11px]">
          <span className="font-bold text-[#FFF0CF]">Official Support Channel: </span>
          Support requests are handled through authenticated telebirr SuperApp customer service. Our customer representatives will never ask for your telebirr PIN or sensitive credentials.
        </p>
      </div>

    </div>
  );
};

export default HelpSupportPage;
