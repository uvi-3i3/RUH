/**
 * Pure onboarding questionnaire state, personalization, interactive demo curation,
 * and Daily Plan logic for Ruh (رُوح).
 *
 * Zero DOM/React/binary imports — 100% unit-testable via node:test.
 */

import {
  DEFAULT_ADHAN_CHIME_PROFILE,
  getAdhanChimeProfileMeta,
  normalizeAdhanChimeProfile,
} from './adhanChimeLogic';

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

export const ONBOARDING_STRUGGLES_BY_GOAL = {
  guard_prayers: [
    {
      id: 'prayer_busy_day',
      label: 'I get busy and miss the prayer window.',
      hint: 'Work or errands run long before I notice the time.',
      solutionTitle: 'Timely local prayer alerts',
      solutionDetail:
        'Ruh follows your city’s exact schedule and plays a soft chime before time runs out.',
      ruhFeature: 'Live Prayer Times',
    },
    {
      id: 'prayer_fajr_wake',
      label: 'Fajr is the hardest prayer to catch.',
      hint: 'Early mornings slip away before sunrise.',
      solutionTitle: 'Gentle dawn Fajr chimes',
      solutionDetail:
        'Set an early reminder with our calm Dawn Ney chime built for quiet mornings.',
      ruhFeature: 'Dawn Chimes',
    },
    {
      id: 'prayer_delay_habit',
      label: 'I tell myself I will pray in five minutes.',
      hint: 'Small delays push one prayer into the next.',
      solutionTitle: 'Clear time-left countdown',
      solutionDetail:
        'See how much time remains in the current prayer window at a glance — no guessing.',
      ruhFeature: 'Live Countdown',
    },
    {
      id: 'prayer_cluttered_apps',
      label: 'Other prayer apps are cluttered with ads.',
      hint: 'Pop-ups and noise break my focus before prayer.',
      solutionTitle: 'Quiet, private, and ad-free',
      solutionDetail:
        'No ads, no pop-ups, and no feeds. Just your five prayers and a calm sky.',
      ruhFeature: 'Clean Design',
    },
  ],
  quran_stillness: [
    {
      id: 'quran_hard_understand',
      label: 'Translations feel heavy or hard to follow.',
      hint: 'I want clear everyday meaning I can feel right away.',
      solutionTitle: 'Clear, simple English meaning',
      solutionDetail:
        'Read every verse in plain everyday language, with one tap to open short context.',
      ruhFeature: 'Simple Meaning',
    },
    {
      id: 'quran_rushed_reading',
      label: 'I rush through verses without reflecting.',
      hint: 'Scrolling fast makes it hard to pause and absorb.',
      solutionTitle: 'One calm verse at a time',
      solutionDetail:
        'Each verse fills the screen cleanly so you can slow down and write a short personal note.',
      ruhFeature: 'Daily Reflection',
    },
    {
      id: 'quran_no_time',
      label: 'My days feel too full for long reading.',
      hint: 'If I cannot read a full page, I end up skipping.',
      solutionTitle: 'A 1-minute daily habit',
      solutionDetail:
        'Start with a single meaningful verse each day and build a rhythm you can actually keep.',
      ruhFeature: 'One Verse Daily',
    },
    {
      id: 'quran_forget_saved',
      label: 'I forget verses that moved me later.',
      hint: 'They get lost in screenshots or old bookmarks.',
      solutionTitle: 'Your private verse collection',
      solutionDetail:
        'Save favorite verses and reflections in one calm library you can search anytime.',
      ruhFeature: 'Saved Verses',
    },
  ],
  steady_dhikr: [
    {
      id: 'dhikr_forget_after_prayer',
      label: 'I forget dhikr right after finishing prayer.',
      hint: 'I stand up and jump straight back into my phone.',
      solutionTitle: 'Built-in post-prayer Tasbih',
      solutionDetail:
        'Open a quiet tactile counter right after logging any prayer — no separate app needed.',
      ruhFeature: 'Tactile Tasbih',
    },
    {
      id: 'dhikr_lose_count',
      label: 'I lose count or get distracted midway.',
      hint: 'It is hard to stay present while checking numbers.',
      solutionTitle: 'Eyes-free haptic bead rhythm',
      solutionDetail:
        'Feel subtle tap feedback on every count and a warm pulse at 33 so you stay focused.',
      ruhFeature: 'Haptic Counter',
    },
    {
      id: 'dhikr_not_sure_what',
      label: 'I am not always sure which adhkar to recite.',
      hint: 'Long morning and evening lists feel overwhelming.',
      solutionTitle: 'Short morning & evening cards',
      solutionDetail:
        'Follow curated, bite-sized Sabah and Masa adhkar with Arabic, sound, and plain meaning.',
      ruhFeature: 'Daily Adhkar',
    },
    {
      id: 'dhikr_drop_off',
      label: 'I start strong for two days, then stop.',
      hint: 'Without a gentle daily cue, the habit fades fast.',
      solutionTitle: 'Small daily anchors that stick',
      solutionDetail:
        'Pair a 3-minute dhikr with your Today checklist so remembering Allah feels effortless.',
      ruhFeature: 'Daily Anchors',
    },
  ],
  gentle_return: [
    {
      id: 'return_guilt_cycle',
      label: 'Missing one day makes me feel guilty and quit.',
      hint: 'Broken streaks make me want to stop trying.',
      solutionTitle: 'Progress without guilt',
      solutionDetail:
        'Pause streaks on rest days and log prayers honestly — Ruh celebrates returning, not perfection.',
      ruhFeature: 'Rest Days & Grace',
    },
    {
      id: 'return_qada_overwhelm',
      label: 'Missed prayers feel overwhelming to catch up.',
      hint: 'I do not know where to begin or how to track them.',
      solutionTitle: 'Private, one-at-a-time Qada log',
      solutionDetail:
        'Keep a quiet Qada list and clear missed prayers at your own pace without pressure.',
      ruhFeature: 'Private Qada Log',
    },
    {
      id: 'return_too_much_once',
      label: 'Trying to change everything at once burns me out.',
      hint: 'Big routines fall apart after one busy week.',
      solutionTitle: 'Start with 2 tiny daily habits',
      solutionDetail:
        'Build your comeback around two realistic daily steps you can finish even on hard days.',
      ruhFeature: 'Gentle Pace',
    },
    {
      id: 'return_disconnected',
      label: 'I feel disconnected and want a calm place to start.',
      hint: 'Loud apps and social feeds only add pressure.',
      solutionTitle: 'A calm, judgment-free space',
      solutionDetail:
        'No public leaderboards, no ads, and no noise — just quiet prayers, verses, and steady light.',
      ruhFeature: 'Private Sanctuary',
    },
  ],
};

export const ONBOARDING_STRUGGLES = Object.values(ONBOARDING_STRUGGLES_BY_GOAL).flat();

export const DEMO_ANCHOR_CATEGORIES = [
  { id: 'recommended', label: 'For You' },
  { id: 'prayer', label: 'Prayer' },
  { id: 'quran', label: 'Qur’an' },
  { id: 'dhikr', label: 'Dhikr' },
  { id: 'sunnah', label: 'Sunnah' },
];

export const DEMO_ANCHOR_CATALOG = [
  {
    id: 'anchor_fajr_guard',
    label: 'Pray Fajr on time',
    detail: 'Catch the dawn window',
    category: 'prayer',
    goals: ['guard_prayers', 'gentle_return'],
  },
  {
    id: 'anchor_early_wudu',
    label: 'Make wudu before Adhan',
    detail: 'Be ready when prayer starts',
    category: 'prayer',
    goals: ['guard_prayers'],
  },
  {
    id: 'anchor_one_qada',
    label: 'Make up 1 missed prayer',
    detail: 'Clear Qada one step at a time',
    category: 'prayer',
    goals: ['gentle_return', 'guard_prayers'],
  },
  {
    id: 'anchor_isha_on_time',
    label: 'Pray Isha before midnight',
    detail: 'Close your day with prayer',
    category: 'prayer',
    goals: ['guard_prayers', 'gentle_return'],
  },
  {
    id: 'anchor_one_verse_note',
    label: 'Reflect on 1 verse',
    detail: 'Save a short note in your journal',
    category: 'quran',
    goals: ['quran_stillness'],
  },
  {
    id: 'anchor_surah_mulk',
    label: 'Read Surah Al-Mulk',
    detail: 'Peaceful nightly recitation',
    category: 'quran',
    goals: ['quran_stillness', 'gentle_return'],
  },
  {
    id: 'anchor_ayat_kursi',
    label: 'Recite Ayat al-Kursi',
    detail: 'After prayer or before sleep',
    category: 'quran',
    goals: ['quran_stillness', 'guard_prayers'],
  },
  {
    id: 'anchor_one_page_quran',
    label: 'Read 1 page of Qur’an',
    detail: 'Slow, steady daily reading',
    category: 'quran',
    goals: ['quran_stillness'],
  },
  {
    id: 'anchor_tasbih_33',
    label: '33× Tasbih after prayer',
    detail: 'SubhanAllah, Alhamdulillah, Allahu Akbar',
    category: 'dhikr',
    goals: ['steady_dhikr', 'guard_prayers'],
  },
  {
    id: 'anchor_morning_adhkar',
    label: 'Morning or evening dhikr',
    detail: '3-minute daily remembrance',
    category: 'dhikr',
    goals: ['steady_dhikr', 'quran_stillness', 'gentle_return'],
  },
  {
    id: 'anchor_isha_stillness',
    label: '33× Istighfar before sleep',
    detail: 'End your night on a calm note',
    category: 'dhikr',
    goals: ['steady_dhikr', 'gentle_return'],
  },
  {
    id: 'anchor_salawat_10',
    label: 'Send 10× Salawat',
    detail: 'Blessings upon the Prophet ﷺ',
    category: 'dhikr',
    goals: ['steady_dhikr', 'gentle_return'],
  },
  {
    id: 'anchor_sunnah_2',
    label: 'Pray 2 Sunnah raka’at',
    detail: 'Before Fajr or Duha morning',
    category: 'sunnah',
    goals: ['guard_prayers', 'gentle_return'],
  },
  {
    id: 'anchor_witr_night',
    label: 'Pray Witr before sleep',
    detail: 'Seal the night in quiet prayer',
    category: 'sunnah',
    goals: ['guard_prayers', 'steady_dhikr'],
  },
  {
    id: 'anchor_short_dua',
    label: 'Make 1 sincere du’a',
    detail: 'Pause and ask Allah by name',
    category: 'sunnah',
    goals: ['gentle_return', 'steady_dhikr', 'quran_stillness'],
  },
  {
    id: 'anchor_daily_sadaqah',
    label: 'One small act of kindness',
    detail: 'Charity, smile, or helping hand',
    category: 'sunnah',
    goals: ['gentle_return', 'quran_stillness'],
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

export function getStrugglesForGoal(goalId) {
  const goal = getGoalById(goalId);
  return ONBOARDING_STRUGGLES_BY_GOAL[goal.id] || ONBOARDING_STRUGGLES_BY_GOAL.guard_prayers;
}

export function sanitizeStruggleIdsForGoal(struggleIds = [], goalId = null) {
  if (!Array.isArray(struggleIds) || struggleIds.length === 0) return [];
  const validIds = new Set(getStrugglesForGoal(goalId).map((s) => s.id));
  return struggleIds.filter((id) => typeof id === 'string' && validIds.has(id));
}

export function getStruggleById(struggleId) {
  return ONBOARDING_STRUGGLES.find((s) => s.id === struggleId) || null;
}

export function getAnchorById(anchorId) {
  return DEMO_ANCHOR_CATALOG.find((a) => a.id === anchorId) || null;
}

export function getAnchorsByCategory(categoryId = 'recommended', goalId = 'guard_prayers') {
  const goal = getGoalById(goalId);
  if (!categoryId || categoryId === 'recommended') {
    return [
      ...DEMO_ANCHOR_CATALOG.filter((a) => a.goals.includes(goal.id)),
      ...DEMO_ANCHOR_CATALOG.filter((a) => !a.goals.includes(goal.id)),
    ].slice(0, 8);
  }
  return DEMO_ANCHOR_CATALOG.filter((a) => a.category === categoryId);
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
 * Mirror back up to 3 of the user's selected challenges for the chosen goal
 * so the solution screen always fits comfortably on a single non-scrolling screen.
 */
export function buildPersonalizedSolutions(struggleIds = [], goalId = null) {
  const goalStruggles = getStrugglesForGoal(goalId);
  const goalStruggleMap = new Map(goalStruggles.map((item) => [item.id, item]));
  const uniqueIds = Array.from(new Set(Array.isArray(struggleIds) ? struggleIds : []));

  const matched = uniqueIds
    .map((id) => goalStruggleMap.get(id) || getStruggleById(id))
    .filter(Boolean)
    .slice(0, 3);

  if (matched.length > 0) {
    return matched;
  }

  return goalStruggles.slice(0, 3);
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

  const prioritizedAnchors = getAnchorsByCategory('recommended', goal.id);

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
  chimeProfileId = DEFAULT_ADHAN_CHIME_PROFILE,
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
