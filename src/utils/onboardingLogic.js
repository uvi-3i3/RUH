/**
 * Pure onboarding questionnaire state, personalization, interactive demo curation,
 * and Daily Plan logic for Ruh (رُوح).
 *
 * Zero DOM/React/binary imports — 100% unit-testable via node:test.
 */

import { getAdhanChimeProfileMeta, normalizeAdhanChimeProfile } from './adhanChimeLogic';

export const ONBOARDING_STORAGE_KEY = 'ruh_onboarding_v1';

export const ONBOARDING_STEPS = [
  'welcome',
  'goal',
  'struggles',
  'solution',
  'personalize',
  'location',
  'demo_verse',
  'demo_anchors',
  'processing',
  'charter',
  'reminders',
];

export const ONBOARDING_GOALS = [
  {
    id: 'guard_prayers',
    title: 'Pray all 5 prayers on time',
    arabic: 'الصلاة',
    subtitle: 'Get gentle reminders and track every prayer.',
    strugglePrompt: 'praying on time',
    recommendedIntention: 'Pray all five daily prayers on time',
    curatedVerseIds: ['s1v4', 's1v1', 's3v2'],
  },
  {
    id: 'quran_stillness',
    title: 'Read one verse each day',
    arabic: 'القرآن',
    subtitle: 'Slow down with clear meaning and short notes.',
    strugglePrompt: 'reading the Qur’an daily',
    recommendedIntention: 'Read one verse today and pause to reflect',
    curatedVerseIds: ['s2v2', 's1v2', 's3v1'],
  },
  {
    id: 'steady_dhikr',
    title: 'Keep a daily dhikr habit',
    arabic: 'الذكر',
    subtitle: 'Simple morning, evening, and prayer dhikr.',
    strugglePrompt: 'staying steady with dhikr',
    recommendedIntention: 'Make quiet remembrance a steady part of my day',
    curatedVerseIds: ['s3v1', 's2v1', 's1v2'],
  },
  {
    id: 'gentle_return',
    title: 'Get back into a routine',
    arabic: 'العودة',
    subtitle: 'Start fresh at your own pace with zero guilt.',
    strugglePrompt: 'getting back into a routine',
    recommendedIntention: 'Start fresh today, one sincere prayer at a time',
    curatedVerseIds: ['s4v1', 's4v3', 's1v2'],
  },
];

export const ONBOARDING_STRUGGLES = [
  {
    id: 'lose_track_time',
    label: 'My day gets busy and I lose track of prayer times.',
    solutionTitle: 'Accurate live prayer times',
    solutionDetail:
      'Ruh follows your city’s exact prayer schedule and sends a gentle chime before time runs out.',
    ruhFeature: 'Live Solar Times & Soft Chimes',
  },
  {
    id: 'noisy_apps',
    label: 'Other prayer apps feel cluttered and full of ads.',
    solutionTitle: 'Calm, private, and ad-free',
    solutionDetail:
      'No banner ads, no pop-ups, and no social feeds. Just your prayers, daily verse, and quiet space.',
    ruhFeature: 'Clean Sanctuary Design',
  },
  {
    id: 'lost_momentum',
    label: 'I miss one day and lose motivation.',
    solutionTitle: 'Consistency without guilt',
    solutionDetail:
      'Log prayers on time or as Qada, track missed prayers privately, and pause streaks on rest days.',
    ruhFeature: 'Honest Qada & Rest Days',
  },
  {
    id: 'rushed_reading',
    label: 'I rush through verses without time to think.',
    solutionTitle: 'One short verse at a time',
    solutionDetail:
      'Read clear everyday English, tap to see the short meaning, and save quick personal notes.',
    ruhFeature: 'Daily Verse & Notes',
  },
];

export const DEMO_ANCHOR_CATALOG = [
  {
    id: 'anchor_fajr_guard',
    label: 'Pray Fajr on time',
    detail: 'Start the morning inside the Fajr window',
    goals: ['guard_prayers', 'gentle_return'],
  },
  {
    id: 'anchor_tasbih_33',
    label: '33× Tasbih after one prayer',
    detail: 'SubhanAllah, Alhamdulillah, Allahu Akbar',
    goals: ['steady_dhikr', 'guard_prayers'],
  },
  {
    id: 'anchor_one_verse_note',
    label: 'Write a short note on 1 verse',
    detail: 'Save one thought in your journal',
    goals: ['quran_stillness'],
  },
  {
    id: 'anchor_morning_adhkar',
    label: '3-minute morning or evening dhikr',
    detail: 'Short, focused daily remembrance',
    goals: ['steady_dhikr', 'quran_stillness', 'gentle_return'],
  },
  {
    id: 'anchor_one_qada',
    label: 'Make up 1 missed prayer',
    detail: 'Clear your Qada list one step at a time',
    goals: ['gentle_return', 'guard_prayers'],
  },
  {
    id: 'anchor_isha_stillness',
    label: '33× Istighfar before sleep',
    detail: 'End your night on a calm note',
    goals: ['steady_dhikr', 'gentle_return', 'quran_stillness'],
  },
];

export const CURATED_POPULAR_CITY_IDS = [
  'makkah',
  'london',
  'new-york',
  'istanbul',
  'kuala-lumpur',
  'cairo',
];

export const REMINDER_LEAD_OPTIONS = [
  { value: 0, label: 'At Adhan' },
  { value: 5, label: '5 min' },
  { value: 10, label: '10 min' },
  { value: 15, label: '15 min' },
];

export function formatSimpleVerseText(verse) {
  if (!verse || typeof verse !== 'object') return '';
  const raw = verse.simpleT || verse.t || '';
  return String(raw)
    .replace(/\\n/g, ' ')
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getGoalById(goalId) {
  return ONBOARDING_GOALS.find((g) => g.id === goalId) || ONBOARDING_GOALS[0];
}

export function getStruggleById(struggleId) {
  return ONBOARDING_STRUGGLES.find((s) => s.id === struggleId) || null;
}

export function getAnchorById(anchorId) {
  return DEMO_ANCHOR_CATALOG.find((a) => a.id === anchorId) || null;
}

/**
 * Compute smooth progress percentage (0..100) for the top progress hairline.
 */
export function getOnboardingProgress(stepIndex) {
  const maxIndex = Math.max(1, ONBOARDING_STEPS.length - 1);
  const clamped = Math.min(maxIndex, Math.max(0, Number(stepIndex) || 0));
  return Math.round((clamped / maxIndex) * 100);
}

/**
 * Parse stored onboarding completion record safely.
 */
export function parseOnboardingState(raw) {
  if (!raw || typeof raw !== 'string') return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    if (typeof parsed.completed !== 'boolean') return null;
    return {
      completed: parsed.completed,
      skipped: Boolean(parsed.skipped),
      completedAt: typeof parsed.completedAt === 'string' ? parsed.completedAt : null,
      goalId: typeof parsed.goalId === 'string' ? parsed.goalId : null,
      struggleIds: Array.isArray(parsed.struggleIds)
        ? parsed.struggleIds.filter((id) => typeof id === 'string')
        : [],
      selectedVerseId: typeof parsed.selectedVerseId === 'string' ? parsed.selectedVerseId : null,
      selectedAnchorIds: Array.isArray(parsed.selectedAnchorIds)
        ? parsed.selectedAnchorIds.filter((id) => typeof id === 'string')
        : [],
    };
  } catch {
    return null;
  }
}

export function serializeOnboardingState(state) {
  const safe = state && typeof state === 'object' ? state : {};
  return JSON.stringify({
    completed: Boolean(safe.completed),
    skipped: Boolean(safe.skipped),
    completedAt: typeof safe.completedAt === 'string' ? safe.completedAt : new Date().toISOString(),
    goalId: typeof safe.goalId === 'string' ? safe.goalId : null,
    struggleIds: Array.isArray(safe.struggleIds)
      ? safe.struggleIds.filter((id) => typeof id === 'string')
      : [],
    selectedVerseId: typeof safe.selectedVerseId === 'string' ? safe.selectedVerseId : null,
    selectedAnchorIds: Array.isArray(safe.selectedAnchorIds)
      ? safe.selectedAnchorIds.filter((id) => typeof id === 'string')
      : [],
  });
}

/**
 * Determine whether a user already has meaningful prior Sanctuary activity.
 */
export function hasExistingUserActivity(devotionData) {
  if (!devotionData || typeof devotionData !== 'object') return false;
  if ((devotionData.totalPrayers || 0) > 0) return true;
  if ((devotionData.totalVerses || 0) > 0) return true;
  if ((devotionData.activeDays || 0) > 0) return true;
  if (Array.isArray(devotionData.savedVerses) && devotionData.savedVerses.length > 0) return true;
  const profileName = (devotionData.profile?.name || '').trim();
  if (profileName && profileName.toLowerCase() !== 'seeker') return true;
  return false;
}

/**
 * Decide whether onboarding should auto-open on launch.
 * Supports `?autostart=1` to jump straight into the main view.
 */
export function shouldAutoShowOnboarding({
  storedState = null,
  hasExistingActivity = false,
  searchParams = '',
} = {}) {
  if (typeof searchParams === 'string' && searchParams.length > 0) {
    const cleaned = searchParams.startsWith('?') ? searchParams.slice(1) : searchParams;
    const params = new URLSearchParams(cleaned);
    if (params.get('autostart') === '1' || params.get('skipOnboarding') === '1') {
      return false;
    }
    if (params.get('onboarding') === '1') {
      return true;
    }
  }
  if (storedState?.completed) return false;
  if (hasExistingActivity) return false;
  return true;
}

/**
 * Mirror back up to 3 of the user's selected struggles so the solution screen
 * always fits comfortably on a single non-scrolling screen.
 */
export function buildPersonalizedSolutions(struggleIds = [], goalId = null) {
  const uniqueIds = Array.from(new Set(Array.isArray(struggleIds) ? struggleIds : []));
  const matched = uniqueIds
    .map((id) => getStruggleById(id))
    .filter(Boolean)
    .slice(0, 3);

  if (matched.length > 0) {
    return matched;
  }

  const fallbackMap = {
    guard_prayers: ['lose_track_time', 'noisy_apps', 'lost_momentum'],
    quran_stillness: ['rushed_reading', 'noisy_apps', 'lose_track_time'],
    steady_dhikr: ['lose_track_time', 'lost_momentum', 'noisy_apps'],
    gentle_return: ['lost_momentum', 'noisy_apps', 'lose_track_time'],
  };
  const fallbackIds = fallbackMap[goalId] || ['lose_track_time', 'noisy_apps', 'lost_momentum'];
  return fallbackIds.map((id) => getStruggleById(id)).filter(Boolean).slice(0, 3);
}

/**
 * Curate the Interactive Demo options (3 real verses + 4 daily habits)
 * tailored to the user's chosen goal.
 */
export function buildOnboardingDemoContent(goalId, stations = []) {
  const goal = getGoalById(goalId);
  const allVerses = Array.isArray(stations)
    ? stations.flatMap((station) =>
        Array.isArray(station?.verses)
          ? station.verses.map((v) => ({
              ...v,
              simpleText: formatSimpleVerseText(v),
              stationNameEn: station.nameEn || '',
              stationNameAr: station.name || '',
            }))
          : []
      )
    : [];

  const verseById = new Map(allVerses.map((v) => [v.id, v]));
  const curatedVerses = [];
  for (const vid of goal.curatedVerseIds) {
    const found = verseById.get(vid);
    if (found) curatedVerses.push(found);
  }
  for (const fallbackVerse of allVerses) {
    if (curatedVerses.length >= 3) break;
    if (!curatedVerses.some((v) => v.id === fallbackVerse.id)) {
      curatedVerses.push(fallbackVerse);
    }
  }

  const prioritizedAnchors = [
    ...DEMO_ANCHOR_CATALOG.filter((a) => a.goals.includes(goal.id)),
    ...DEMO_ANCHOR_CATALOG.filter((a) => !a.goals.includes(goal.id)),
  ].slice(0, 4);

  return {
    goal,
    verses: curatedVerses.slice(0, 3),
    anchors: prioritizedAnchors,
  };
}

/**
 * Build the structured Daily Plan displayed on the reveal screen and shared.
 */
export function buildSanctuaryCharter({
  name = 'Seeker',
  goalId = 'guard_prayers',
  struggleIds = [],
  selectedVerse = null,
  selectedAnchorIds = [],
  cityLabel = null,
  chimeProfileId = 'hijaz_whisper',
  leadMinutes = 10,
  isLightMode = false,
} = {}) {
  const cleanName = (name || '').trim() || 'Seeker';
  const goal = getGoalById(goalId);
  const safeChimeId = normalizeAdhanChimeProfile(chimeProfileId);
  const chimeMeta = getAdhanChimeProfileMeta(safeChimeId);
  const anchors = (Array.isArray(selectedAnchorIds) ? selectedAnchorIds : [])
    .map((id) => getAnchorById(id))
    .filter(Boolean);

  return {
    seekerName: cleanName,
    goalTitle: goal.title,
    goalArabic: goal.arabic,
    dailyIntention: goal.recommendedIntention,
    struggleCount: Array.isArray(struggleIds) ? struggleIds.length : 0,
    cityLabel: cityLabel ? String(cityLabel).trim() : null,
    atmosphereMode: isLightMode ? 'Daylight' : 'Night',
    chimeLabel: chimeMeta.label,
    chimeArabic: chimeMeta.arabic,
    leadMinutes: Math.max(0, Number(leadMinutes) || 0),
    openingVerse: selectedVerse
      ? {
          id: selectedVerse.id,
          arabic: selectedVerse.a || '',
          translation: formatSimpleVerseText(selectedVerse),
          source: selectedVerse.s || '',
        }
      : null,
    anchors,
  };
}

/**
 * Format a clean plain-text version of the Daily Plan for Web Share / clipboard.
 */
export function buildCharterShareText(charter) {
  if (!charter || typeof charter !== 'object') return 'Ruh (رُوح) · My Daily Plan';
  const lines = [
    `Ruh (رُوح) — ${charter.seekerName}'s Daily Plan`,
    `Goal: ${charter.goalTitle}`,
  ];
  if (charter.cityLabel) {
    lines.push(`City: ${charter.cityLabel} · Chime: ${charter.chimeLabel}`);
  } else {
    lines.push(`Chime: ${charter.chimeLabel}`);
  }
  if (charter.openingVerse?.arabic) {
    lines.push('');
    lines.push(charter.openingVerse.arabic);
    lines.push(`"${charter.openingVerse.translation}" — ${charter.openingVerse.source}`);
  }
  if (Array.isArray(charter.anchors) && charter.anchors.length > 0) {
    lines.push('');
    lines.push('Daily Habits:');
    charter.anchors.forEach((a) => {
      lines.push(`• ${a.label}`);
    });
  }
  return lines.join('\n');
}
