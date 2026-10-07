export interface LeaderboardEntry {
  rank: number;
  maskedMsisdn: string;
  score: number;
  isCurrentUser: boolean;
}

export function formatMaskedMsisdn(phone?: string, seed: string = 'player'): string {
  if (phone) {
    const digits = phone.replace(/\D/g, '');
    if (digits.length >= 6) {
      const first3 = digits.slice(0, 3);
      const last3 = digits.slice(-3);
      return `${first3}*****${last3}`;
    }
  }
  // Deterministic fallback based on seed: exactly 3 digits + 5 asterisks + 3 digits
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const prefixes = ['091', '092', '093', '094', '096', '097', '251'];
  const prefix = prefixes[hash % prefixes.length];
  const suffix = String(100 + (hash % 899));
  return `${prefix}*****${suffix}`;
}

// Baseline top scores per game
const BENCHMARKS: Record<string, number[]> = {
  'sky-hopper': [9850, 9420, 9100, 8750, 8400, 7920, 7650, 7200, 6890, 6500],
  'hockey': [3450, 3200, 2980, 2750, 2520, 2350, 2180, 2040, 1890, 1750],
  'fruit-fancy': [34800, 32500, 30200, 28900, 26700, 25100, 23800, 22400, 20900, 19500],
  'picture-match': [16400, 15200, 14100, 13350, 12600, 11800, 11050, 10400, 9800, 9250],
  'candy-bomb': [48200, 45100, 42300, 39800, 37500, 35200, 33100, 31400, 29800, 28200],
  'link-color': [28500, 26400, 24800, 23100, 21500, 19800, 18400, 17200, 15900, 14600],
  'bubble-sort': [14200, 13100, 12400, 11500, 10800, 9950, 9200, 8650, 8100, 7550],
  'color-tap-sprint': [115, 108, 98, 92, 85, 78, 74, 69, 64, 58],
  'flip-tile': [4250, 3980, 3720, 3500, 3280, 3050, 2890, 2710, 2540, 2380],
};

export function getGameLeaderboard(
  gameId: string,
  userScore: number = 0,
  userPhone?: string
): { top10: LeaderboardEntry[]; currentUserEntry: LeaderboardEntry | null } {
  const baseScores = BENCHMARKS[gameId] || [9000, 8000, 7000, 6000, 5000, 4000, 3000, 2000, 1500, 1000];
  const userMsisdn = formatMaskedMsisdn(userPhone, `user_${gameId}`);

  // Construct baseline top 10
  const bots: { score: number; msisdn: string }[] = baseScores.map((score, idx) => ({
    score,
    msisdn: formatMaskedMsisdn(undefined, `${gameId}_bot_${idx}`),
  }));

  // Check if current user is within Top 10
  const userValid = userScore > 0;
  const tenthScore = baseScores[baseScores.length - 1];

  if (userValid && userScore >= tenthScore) {
    // Insert user into list and take top 10
    const all = [
      ...bots,
      { score: userScore, msisdn: userMsisdn, isUser: true },
    ].sort((a, b) => b.score - a.score);

    const top10: LeaderboardEntry[] = all.slice(0, 10).map((item, idx) => ({
      rank: idx + 1,
      maskedMsisdn: item.msisdn,
      score: item.score,
      isCurrentUser: 'isUser' in item && Boolean(item.isUser),
    }));

    return { top10, currentUserEntry: null };
  } else {
    // Current user is outside top 10
    const top10: LeaderboardEntry[] = bots.slice(0, 10).map((item, idx) => ({
      rank: idx + 1,
      maskedMsisdn: item.msisdn,
      score: item.score,
      isCurrentUser: false,
    }));

    // Estimate user rank between 11 and 280 based on score
    let calculatedRank = 185;
    if (userScore > 0) {
      calculatedRank = Math.max(11, Math.min(290, Math.floor(11 + (tenthScore - userScore) / (tenthScore / 250))));
    } else {
      calculatedRank = 291;
    }

    const currentUserEntry: LeaderboardEntry = {
      rank: calculatedRank,
      maskedMsisdn: userMsisdn,
      score: userScore,
      isCurrentUser: true,
    };

    return { top10, currentUserEntry };
  }
}
