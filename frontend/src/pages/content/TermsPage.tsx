/**
 * Terms & Conditions Page Component for GameON Tele
 */

import React from 'react';
import { FileText, ArrowLeft, ShieldCheck } from 'lucide-react';

interface TermSection {
  number: string;
  title: string;
  paragraphs: string[];
  bulletPoints?: string[];
}

const GOPLAY_TERMS: TermSection[] = [
  {
    number: '1.0',
    title: 'GoPlay Service Description',
    paragraphs: [
      'GoPlay is an official interactive mobile gaming service integrated within the telebirr SuperApp ecosystem.',
      'GoPlay provides access to 26+ skill-based games, weekly competitive tournaments, verified real-time leaderboards, game coin transactions, and national championship rewards.',
    ],
  },
  {
    number: '2.0',
    title: 'Payment & Billing Terms',
    paragraphs: [
      'All purchases, coin pack top-ups, and subscription fees are debited directly from the subscriber’s verified telebirr SuperApp wallet balance in Ethiopian Birr (ETB).',
      'No SMS shortcodes or third-party premium SMS billing mechanisms are used. All transactions require direct authorization through the telebirr SuperApp interface and are instantaneous and non-refundable once activated.',
    ],
  },
  {
    number: '3.0',
    title: 'Subscription Terms & Validity',
    paragraphs: [
      'GoPlay offers three distinct subscription plans:',
    ],
    bulletPoints: [
      'Daily Plan: 5 Birr per 24 hours of unlimited catalog gameplay.',
      'Weekly Plan: 20 Birr per 7 days of unlimited catalog gameplay.',
      'Monthly Plan: 50 Birr per 30 days of unlimited catalog gameplay.',
      'Subscriptions remain active throughout their designated validity period.',
      'Subscribers may manage or cancel auto-renewal at any time without penalty directly within the Profile > Subscription tab.',
    ],
  },
  {
    number: '4.0',
    title: 'Coin Packages & Usage',
    paragraphs: [
      'Users can purchase game coins directly from their telebirr balance at standard package rates:',
    ],
    bulletPoints: [
      '10 Birr = 10 Coins',
      '25 Birr = 25 Coins',
      '50 Birr = 50 Coins',
      'Game coins can be utilized to enter coin-entry challenges or continue active gameplay sessions.',
    ],
  },
  {
    number: '5.0',
    title: 'Weekly Tournament Participation Rules',
    paragraphs: [
      'Weekly tournaments feature 4 designated games selected for that competition cycle.',
      'Any user with an active subscription or required entry entitlement may participate in any of the 4 tournament games during the tournament window.',
      'The Leaderboard tracks performance across each individual game tab as well as an "Overall Best" tab ranking the highest single score achieved across any of the 4 tournament games.',
    ],
  },
  {
    number: '6.0',
    title: 'Fair Play & Anti-Cheating Policy',
    paragraphs: [
      'All tournament games are strictly skill-based. Players must achieve scores solely through legitimate manual gameplay.',
      'Any use of automated scripts, bots, modified client software, network manipulation, score tampering, or multiple accounts to distort leaderboard outcomes is strictly prohibited.',
      'Violation of this Fair Play Policy will result in immediate disqualification, forfeiture of prizes, and permanent suspension of the account.',
    ],
  },
  {
    number: '7.0',
    title: 'Privacy & Data Protection',
    paragraphs: [
      'GoPlay respects player confidentiality. All mobile phone numbers (MSISDNs) are masked across all public leaderboard views (e.g., 091*****890) to prevent unauthorized identification.',
      'Personal data collected is limited to account authentication, score verification, and prize distribution in strict compliance with applicable Ethiopian data protection laws.',
    ],
  },
  {
    number: '8.0',
    title: 'Disputes & Customer Care',
    paragraphs: [
      'In the event of gameplay interruptions, score discrepancies, or billing questions, players should consult Help & Customer Care from within the Profile tab.',
      'GoPlay reserves the right to make technical updates to games and tournaments to ensure smooth operation and fair competition.',
    ],
  },
  {
    number: '9.0',
    title: 'Acceptance of Terms',
    paragraphs: [
      'By accessing GoPlay, subscribing to packages, or participating in tournaments, the player acknowledges and agrees to be bound by these Terms & Conditions.',
    ],
  },
];

interface TermsPageProps {
  onBack?: () => void;
  showHeader?: boolean;
}

export const TermsPage: React.FC<TermsPageProps> = ({ onBack, showHeader = true }) => {
  return (
    <div className="min-h-screen bg-white text-[#17202A] pb-24 max-w-md md:max-w-xl lg:max-w-3xl mx-auto px-3.5 pt-3 select-none">
      {/* 1. Header with Back Button */}
      {showHeader && (
        <div className="flex items-center justify-between gap-3 bg-[#1688C9] text-white p-3.5 rounded-2xl shadow-xs mb-4">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                id="terms-back-btn"
                onClick={onBack}
                className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors cursor-pointer shrink-0"
                title="Go Back"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-200 shrink-0" />
              <h1 className="text-base font-black tracking-tight">Terms & Conditions</h1>
            </div>
          </div>
        </div>
      )}

      {/* 2. Top Summary Card */}
      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed mb-4">
        <p className="font-bold text-[#17202A]">
          Official GoPlay Gaming Terms & Conditions
        </p>
        <p className="text-[11px] text-slate-500 mt-1">
          Governing tournament participation, fair play, telebirr billing, and data protection.
        </p>
      </div>

      {/* 3. Terms Sections */}
      <div className="space-y-3">
        {GOPLAY_TERMS.map((section) => (
          <div
            key={section.number}
            id={`term-section-${section.number.replace('.', '-')}`}
            className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2"
          >
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#1688C9] font-mono font-black text-xs">
                {section.number}
              </span>
              <h2 className="text-xs sm:text-sm font-black text-[#17202A]">{section.title}</h2>
            </div>

            <div className="space-y-1.5 text-xs text-slate-700 leading-relaxed pl-1">
              {section.paragraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}

              {section.bulletPoints && section.bulletPoints.length > 0 && (
                <ul className="list-disc list-inside space-y-1 text-slate-700 pl-2">
                  {section.bulletPoints.map((bp, bIdx) => (
                    <li key={bIdx}>{bp}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-bold">
        <ShieldCheck className="w-3.5 h-3.5 text-[#8BCB3D]" />
        <span>telebirr SuperApp Verified Service Terms</span>
      </div>
    </div>
  );
};

