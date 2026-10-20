/**
 * GoDigital - FAQ Page Component
 * 
 * Features:
 * - Expandable/collapsible accordion with dynamic +/- indicator
 * - Questions clearly visible before expansion in warm cream (#FFF0CF)
 * - Answers fully readable upon expansion in warm neutral (#E6C8A4)
 * - Quick search filter + Expand All / Collapse All controls
 * - Consistent destination header with Back button & warm sunset theme
 */

import React, { useState } from 'react';
import { HelpCircle, ArrowLeft, Plus, Minus, Search, Sparkles } from 'lucide-react';
import { TELEPLUS_FAQ_ITEMS } from '../../data/teleplusContent';

interface FAQPageProps {
  onBack?: () => void;
  showHeader?: boolean;
}

export const FAQPage: React.FC<FAQPageProps> = ({ onBack, showHeader = true }) => {
  // First item open by default for immediate preview
  const [openItemIds, setOpenItemIds] = useState<Record<string, boolean>>({
    'faq-1': true,
  });
  const [searchQuery, setSearchQuery] = useState('');

  const toggleItem = (id: string) => {
    setOpenItemIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const expandAll = () => {
    const allOpen: Record<string, boolean> = {};
    TELEPLUS_FAQ_ITEMS.forEach((item) => {
      allOpen[item.id] = true;
    });
    setOpenItemIds(allOpen);
  };

  const collapseAll = () => {
    setOpenItemIds({});
  };

  const filteredItems = TELEPLUS_FAQ_ITEMS.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen text-[#FFF0CF] pb-28 max-w-md md:max-w-xl lg:max-w-3xl mx-auto px-3.5 pt-3 select-none space-y-4 relative z-10">
      
      {/* 1. Header with Back Button */}
      {showHeader && (
        <div className="flex items-center justify-between gap-3 bg-[#352316] border border-[#81502B] text-[#FFF0CF] p-3.5 rounded-2xl shadow-xs">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                id="faq-back-btn"
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
              <HelpCircle className="w-5 h-5 text-[#FFD35A] shrink-0" />
              <h1 className="text-base font-black tracking-tight text-[#FFF0CF]">FAQ</h1>
            </div>
          </div>
          <span className="text-[11px] font-bold text-[#E6C8A4] bg-[#442C1B] px-2.5 py-0.5 rounded-full border border-[#81502B]">
            {TELEPLUS_FAQ_ITEMS.length} Questions
          </span>
        </div>
      )}

      {/* 2. Quick Search & Controls */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#E6C8A4]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions or topics..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#352316] border border-[#81502B] text-xs font-medium text-[#FFF0CF] placeholder:text-[#E6C8A4]/60 focus:outline-none focus:border-[#FFAA24]"
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-[#E6C8A4] px-1">
          <span>Click any question to view answer</span>
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

      {/* 3. Accordion List of FAQ Items */}
      <div className="space-y-2.5">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center bg-[#352316] rounded-2xl border border-[#81502B] text-[#E6C8A4] text-xs">
            No questions matched your search query.
          </div>
        ) : (
          filteredItems.map((item, index) => {
            const isOpen = !!openItemIds[item.id];
            return (
              <div
                key={item.id}
                id={`faq-item-${item.id}`}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'bg-[#352316] border-[#FFAA24]/70 shadow-md'
                    : 'bg-[#352316] border-[#81502B] hover:border-[#FFAA24]/40 shadow-xs'
                }`}
              >
                {/* Accordion Row Header */}
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  className="w-full px-4 py-3.5 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer select-none group"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <span className="text-[10px] font-black font-mono text-[#FFD35A] mt-0.5 shrink-0 px-1.5 py-0.5 rounded bg-[#442C1B] border border-[#81502B]">
                      Q{index + 1}
                    </span>
                    <span
                      className={`text-xs sm:text-sm font-black leading-snug transition-colors ${
                        isOpen ? 'text-[#FFD35A]' : 'text-[#FFF0CF] group-hover:text-[#FFD35A]'
                      }`}
                    >
                      {item.question}
                    </span>
                  </div>

                  {/* Dynamic + / − Toggle Icon */}
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isOpen
                        ? 'bg-gradient-to-r from-[#FFAA24] to-[#F47B20] text-[#24170F]'
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

                {/* Expanded Answer Content */}
                {isOpen && (
                  <div className="px-4 pb-4 pt-2.5 border-t border-[#81502B]/60 bg-[#2B1B10]/90 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="text-xs text-[#E6C8A4] leading-relaxed whitespace-pre-line pl-7">
                      {item.answer}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

export default FAQPage;
