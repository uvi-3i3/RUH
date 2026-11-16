/**
 * Pure badge catalog, tier styling, and achievement evaluation logic for Ruh.
 * Tiers: Silver (foundations), Gold (rhythm & depth), Platinum (mastery & illumination).
 */

import { computeStreaks } from './devotionLogic';

export const BADGE_TIERS = {
  silver: {
    id: 'silver',
    label: 'Silver',
    arabic: 'فِضَّة',
    order: 1,
    dark: {
      primary: '#dce4ef',
      secondary: '#8f9bad',
      highlight: '#ffffff',
      rimDark: '#4e596b',
      dishTop: '#161b26',
      dishBottom: '#0b0e15',
      glow: 'rgba(214, 224, 238, 0.34)',
      ray: 'rgba(220, 228, 239, 0.18)',
      text: '#dce4ef',
    },
    light: {
      primary: '#4e5d70',
      secondary: '#374354',
      highlight: '#ffffff',
      rimDark: '#26303d',
      dishTop: '#f3f6fa',
      dishBottom: '#e1e7f0',
      glow: 'rgba(78, 93, 112, 0.28)',
      ray: 'rgba(78, 93, 112, 0.16)',
      text: '#3b4757',
    },
  },
  gold: {
    id: 'gold',
    label: 'Gold',
    arabic: 'ذَهَب',
    order: 2,
    dark: {
      primary: '#e8c16d',
      secondary: '#b8842c',
      highlight: '#fff3cc',
      rimDark: '#694713',
      dishTop: '#1d160c',
      dishBottom: '#0f0b06',
      glow: 'rgba(232, 193, 109, 0.42)',
      ray: 'rgba(232, 193, 109, 0.24)',
      text: '#e8c16d',
    },
    light: {
      primary: '#8d6319',
      secondary: '#6a490f',
      highlight: '#fff6da',
      rimDark: '#4a3107',
      dishTop: '#fbf5e6',
      dishBottom: '#efe1c1',
      glow: 'rgba(141, 99, 25, 0.30)',
      ray: 'rgba(141, 99, 25, 0.18)',
      text: '#7d5614',
    },
  },
  platinum: {
    id: 'platinum',
    label: 'Platinum',
    arabic: 'نُور',
    order: 3,
    dark: {
      primary: '#eef6ff',
      secondary: '#9ab7dc',
      highlight: '#ffffff',
      accentGem: '#9be7df',
      rimDark: '#4b6384',
      dishTop: '#111b2a',
      dishBottom: '#080e18',
      glow: 'rgba(196, 224, 255, 0.48)',
      ray: 'rgba(186, 220, 255, 0.28)',
      text: '#e4f0ff',
    },
    light: {
      primary: '#355075',
      secondary: '#233854',
      highlight: '#ffffff',
      accentGem: '#0d9488',
      rimDark: '#17273d',
      dishTop: '#f2f7fd',
      dishBottom: '#dbe6f5',
      glow: 'rgba(53, 80, 117, 0.32)',
      ray: 'rgba(53, 80, 117, 0.20)',
      text: '#233854',
    },
  },
};

export const SACRED_BADGES = [
  // --- SILVER (Foundations) ---
  {
    id: 'first_dawn',
    tier: 'silver',
    motif: 'crescent_dawn',
    title: 'First Dawn',
    arabic: 'فَجْر',
    subtitle: 'First Prayer Logged',
    description: 'You answered the call and anchored your first daily prayer in the Sanctuary.',
    metric: 'totalPrayers',
    target: 1,
    unit: 'prayer',
    unitPlural: 'prayers',
  },
  {
    id: 'whispered_dhikr',
    tier: 'silver',
    motif: 'tasbih_chaplet',
    title: 'Quiet Rosary',
    arabic: 'تَسْبِيح',
    subtitle: '10+ Remembrances',
    description: 'Ten quiet moments of remembrance woven into the stillness of your day.',
    metric: 'totalDhikr',
    target: 10,
    unit: 'dhikr',
    unitPlural: 'dhikr',
  },
  {
    id: 'steadfast_trio',
    tier: 'silver',
    motif: 'triple_flame',
    title: 'Steadfast Trio',
    arabic: 'ثَبَات',
    subtitle: '3-Day Streak',
    description: 'Three unbroken days mark the quiet shift from fleeting intention to rhythm.',
    metric: 'bestStreak',
    target: 3,
    unit: 'day',
    unitPlural: 'days',
  },

  // --- GOLD (Rhythm & Depth) ---
  {
    id: 'pillar_of_day',
    tier: 'gold',
    motif: 'mihrab_lamp',
    title: 'Pillar of Light',
    arabic: 'عِمَاد',
    subtitle: 'All 5 Daily Prayers',
    description: 'Every prayer of a single day fulfilled from pre-dawn light to nightfall.',
    metric: 'maxDailyPrayers',
    target: 5,
    unit: 'prayers in a day',
    unitPlural: 'prayers in a day',
  },
  {
    id: 'seeker_of_proof',
    tier: 'gold',
    motif: 'qalam_scroll',
    title: 'True Proof',
    arabic: 'بُرْهَان',
    subtitle: '3 Reflections & Proofs',
    description: 'Contemplation deepens conviction through saved verses and rational Burhan.',
    metric: 'totalReflections',
    target: 3,
    unit: 'reflection',
    unitPlural: 'reflections',
  },
  {
    id: 'lunar_week',
    tier: 'gold',
    motif: 'lunar_crown',
    title: 'Lunar Week',
    arabic: 'أُسْبُوع',
    subtitle: '7-Day Streak',
    description: 'Seven consecutive days walking under steady remembrance across a full week.',
    metric: 'bestStreak',
    target: 7,
    unit: 'day',
    unitPlural: 'days',
  },

  // --- PLATINUM (Mastery & Illumination) ---
  {
    id: 'fivefold_guardian',
    tier: 'platinum',
    motif: 'kaaba_compass',
    title: 'Guardian',
    arabic: 'مُحَافِظ',
    subtitle: '50 Prayers Fulfilled',
    description: 'Fifty prayers gathered as luminous milestones across mornings and nights.',
    metric: 'totalPrayers',
    target: 50,
    unit: 'prayer',
    unitPlural: 'prayers',
  },
  {
    id: 'heart_of_remembrance',
    tier: 'platinum',
    motif: 'astrolabe_star',
    title: 'Serene Heart',
    arabic: 'قَلْب سَلِيم',
    subtitle: '100+ Remembrances',
    description: 'One hundred remembrances settling like calm light over a wakeful heart.',
    metric: 'totalDhikr',
    target: 100,
    unit: 'dhikr',
    unitPlural: 'dhikr',
  },
  {
    id: 'thirty_dawns',
    tier: 'platinum',
    motif: 'celestial_prism',
    title: 'Full Moon',
    arabic: 'بَدْر',
    subtitle: '30-Day Streak',
    description: 'Thirty unbroken days turning devotion into the natural pulse of time.',
    metric: 'bestStreak',
    target: 30,
    unit: 'day',
    unitPlural: 'days',
  },
];

export function getBadgeById(id) {
  return SACRED_BADGES.find((b) => b.id === id) || null;
}

export function getBadgeTierStyle(tier, isLightMode = false) {
  const tierDef = BADGE_TIERS[tier] || BADGE_TIERS.silver;
  return {
    ...tierDef,
    palette: isLightMode ? tierDef.light : tierDef.dark,
  };
}

/**
 * Derive aggregate badge evaluation metrics cleanly from persisted devotion state.
 */
export function extractBadgeMetrics(data = {}, referenceDate = new Date()) {
  const safe = data && typeof data === 'object' ? data : {};
  const history = safe.history && typeof safe.history === 'object' ? safe.history : {};
  const { currentStreak, longestStreak } = computeStreaks(
    history,
    referenceDate,
    safe.streakPausedDates
  );
  const bestStreak = Math.max(currentStreak || 0, longestStreak || 0);

  let historyMaxPrayers = 0;
  let historyPracticesSum = 0;
  for (const entry of Object.values(history)) {
    if (typeof entry === 'number') {
      if (entry > historyMaxPrayers) historyMaxPrayers = entry;
    } else if (entry && typeof entry === 'object') {
      if ((entry.prayers || 0) > historyMaxPrayers) historyMaxPrayers = entry.prayers || 0;
      historyPracticesSum += entry.practices || 0;
    }
  }

  const todayPrayerCount = Array.isArray(safe.dailyPrayers?.completed)
    ? safe.dailyPrayers.completed.length
    : 0;
  const maxDailyPrayers = Math.max(
    safe.maxDailyPrayers || 0,
    todayPrayerCount,
    historyMaxPrayers
  );

  const todayCounters = safe.dailyTasks?.counters || {};
  const todayCountersSum = Object.values(todayCounters).reduce(
    (sum, n) => sum + (typeof n === 'number' && n > 0 ? n : 0),
    0
  );
  const totalDhikr = Math.max(
    safe.totalDhikr || 0,
    todayCountersSum,
    historyPracticesSum
  );

  const savedCount = Array.isArray(safe.savedVerses) ? safe.savedVerses.length : 0;
  const burhanNotesCount =
    safe.burhanNotes && typeof safe.burhanNotes === 'object'
      ? Object.values(safe.burhanNotes).filter((v) => String(v || '').trim().length > 0).length
      : 0;
  const burhanCompletedBonus = safe.dailyTasks?.burhanCompleted ? 1 : 0;
  const totalReflections = Math.max(
    safe.totalReflections || 0,
    savedCount + burhanNotesCount + burhanCompletedBonus
  );

  return {
    totalPrayers: Math.max(0, safe.totalPrayers || 0),
    totalDhikr,
    bestStreak,
    maxDailyPrayers,
    totalReflections,
  };
}

/**
 * Compute live progress toward a single badge.
 */
export function computeBadgeProgress(badge, metrics = {}) {
  if (!badge) return { current: 0, target: 1, pct: 0, unlocked: false };
  const raw = Math.max(0, metrics[badge.metric] || 0);
  const target = Math.max(1, badge.target || 1);
  const current = Math.min(raw, target);
  const pct = Math.min(100, Math.round((current / target) * 100));
  return {
    current,
    target,
    pct,
    unlocked: raw >= target,
  };
}

/**
 * Evaluate all badges and return statuses + newly unlocked IDs relative to prior unlocked map.
 */
export function evaluateBadges(data = {}, priorUnlockedMap = {}, referenceDate = new Date()) {
  const metrics = extractBadgeMetrics(data, referenceDate);
  const safePrior = priorUnlockedMap && typeof priorUnlockedMap === 'object' ? priorUnlockedMap : {};

  const statuses = SACRED_BADGES.map((badge) => {
    const progress = computeBadgeProgress(badge, metrics);
    const unlocked = progress.unlocked || Boolean(safePrior[badge.id]);
    const priorEntry = safePrior[badge.id] || null;
    return {
      ...badge,
      ...progress,
      unlocked,
      unlockedAt: priorEntry?.unlockedAt || null,
    };
  });

  const newlyUnlocked = statuses.filter((b) => b.unlocked && !safePrior[b.id]);

  return {
    metrics,
    statuses,
    unlockedCount: statuses.filter((b) => b.unlocked).length,
    totalCount: statuses.length,
    newlyUnlocked,
  };
}
