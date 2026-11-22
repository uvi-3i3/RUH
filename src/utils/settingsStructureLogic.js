/**
 * Pure information-architecture, category metadata, live section summaries,
 * and cross-category keyword search for Sanctuary Settings in Ruh (رُوح).
 *
 * Zero DOM/React imports — 100% unit-testable via node:test.
 */

import { getAdhanChimeProfileMeta, normalizeAdhanChimeProfile } from './adhanChimeLogic';
import { countActiveAutopilotRules, normalizeAutopilotConfig } from './autopilotLogic';

export const DEFAULT_SETTINGS_SECTION_ID = 'prayer';

export const SETTINGS_SECTIONS = [
  {
    id: 'prayer',
    label: 'Prayer & Location',
    shortLabel: 'Prayer',
    arabic: 'الصلاة والموقع',
    description: 'Live location, calculation method, Adhan voice, and travel mode.',
  },
  {
    id: 'autopilot',
    label: 'Quiet Autopilot',
    shortLabel: 'Autopilot',
    arabic: 'التنظيم التلقائي',
    description: 'Set your daily rhythm once and let Ruh adjust quietly in the background.',
  },
  {
    id: 'appearance',
    label: 'Appearance & Reading',
    shortLabel: 'Appearance',
    arabic: 'المظهر والقراءة',
    description: 'Night or Daylight theme, solar sky light, plain English, and header dhikr.',
  },
  {
    id: 'sensory',
    label: 'Sound & Touch',
    shortLabel: 'Sound',
    arabic: 'الصوت واللمس',
    description: 'Gentle acoustic interaction cues and tactile haptic feedback.',
  },
  {
    id: 'account',
    label: 'Profile & Data',
    shortLabel: 'Profile',
    arabic: 'الملف والبيانات',
    description: 'Your name, guided setup replay, private backup export, and reset.',
  },
];

export const SETTINGS_SEARCH_INDEX = [
  {
    id: 'location',
    sectionId: 'prayer',
    title: 'Location & Locality',
    description: 'Detect current GPS locality or choose a city for exact prayer times and Qibla.',
    keywords: ['gps', 'city', 'locality', 'location', 'coordinates', 'qibla', 'map', 'neighborhood'],
  },
  {
    id: 'calculation_method',
    sectionId: 'prayer',
    title: 'Prayer Calculation Method',
    description: 'Choose your regional convention (ISNA, Umm Al-Qura, MUIS, Moonsighting, Karachi).',
    keywords: ['method', 'convention', 'isna', 'makkah', 'umm al-qura', 'muis', 'karachi', 'fajr', 'isha', 'angle'],
  },
  {
    id: 'adhan_alerts',
    sectionId: 'prayer',
    title: 'Adhan Voice & Prayer Alerts',
    description: 'Pick Makkah, Madinah, or Mishary vocal Adhan, lead timing, and prayer reminders.',
    keywords: ['adhan', 'azan', 'athan', 'voice', 'muadhin', 'makkah', 'madinah', 'mishary', 'chime', 'notification', 'reminder', 'alert'],
  },
  {
    id: 'travel_mode',
    sectionId: 'prayer',
    title: 'Travel Mode (Combining Prayers)',
    description: "Unlocks upcoming prayers early for Jam' Taqdim when traveling.",
    keywords: ['travel', 'combine', 'jam', 'taqdim', 'qasr', 'musafir', 'journey', 'flight'],
  },
  {
    id: 'quiet_autopilot',
    sectionId: 'autopilot',
    title: 'Quiet Autopilot',
    description: 'Master switch for quiet daily automation rules.',
    keywords: ['autopilot', 'automatic', 'set it and forget it', 'schedule', 'rules'],
  },
  {
    id: 'quiet_work_hours',
    sectionId: 'autopilot',
    title: 'Quiet Work Hours',
    description: 'Silences daytime prayer audio during work hours while keeping Fajr untouched.',
    keywords: ['quiet', 'work', 'mute', 'silence', 'office', 'hours', 'do not disturb', 'dnd'],
  },
  {
    id: 'auto_focus',
    sectionId: 'autopilot',
    title: 'Auto-Focus Time of Day',
    description: 'Opens Morning or Evening Adhkar automatically when due.',
    keywords: ['adhkar', 'morning', 'evening', 'focus', 'practices', 'auto'],
  },
  {
    id: 'friday_autopilot',
    sectionId: 'autopilot',
    title: "Friday (Jumu'ah) Autopilot",
    description: 'Automatically adds Surah Al-Kahf and Salawat on Fridays.',
    keywords: ['friday', 'jumuah', 'jummah', 'kahf', 'salawat', 'sunnah'],
  },
  {
    id: 'midnight_qada',
    sectionId: 'autopilot',
    title: 'Midnight Qada Sweep',
    description: 'Quietly records unmarked prayers from yesterday into your Qada ledger.',
    keywords: ['qada', 'missed', 'prayer', 'prayers', 'sweep', 'midnight', 'ledger', 'makeup'],
  },
  {
    id: 'weekly_rest_day',
    sectionId: 'autopilot',
    title: 'Weekly Auto-Rest Day',
    description: 'Protects your streak automatically on one chosen day each week.',
    keywords: ['rest', 'streak', 'pause', 'weekly', 'day off', 'freeze'],
  },
  {
    id: 'theme_mode',
    sectionId: 'appearance',
    title: 'Theme Mode (Night & Daylight)',
    description: 'Switch between dark obsidian Night mode and warm parchment Daylight mode.',
    keywords: ['theme', 'dark', 'light', 'night', 'daylight', 'mode', 'brightness', 'color'],
  },
  {
    id: 'sanctuary_atmosphere',
    sectionId: 'appearance',
    title: 'Sanctuary Atmosphere',
    description: 'Sync sky light and horizon warmth to solar prayer phases or lock one phase.',
    keywords: ['atmosphere', 'sky', 'solar', 'phase', 'dawn', 'dusk', 'palette', 'horizon'],
  },
  {
    id: 'simple_english',
    sectionId: 'appearance',
    title: 'Simple English Translation',
    description: 'Shows clear, everyday English across commentary and proofs.',
    keywords: ['simple', 'english', 'language', 'translation', 'plain', 'reading', 'easy'],
  },
  {
    id: 'ambient_dhikr',
    sectionId: 'appearance',
    title: 'Ambient Dhikr Whisper',
    description: 'Softly rotates remembrance phrases in the Sanctuary header.',
    keywords: ['ambient', 'dhikr', 'zikr', 'whisper', 'remembrance', 'header'],
  },
  {
    id: 'tactile_audio',
    sectionId: 'sensory',
    title: 'Tactile Audio Cues',
    description: 'Gentle acoustic feedback for prayer toggles, task check-offs, and badge reveals.',
    keywords: ['audio', 'sound', 'acoustic', 'click', 'tick', 'cue', 'sfx'],
  },
  {
    id: 'tactile_haptics',
    sectionId: 'sensory',
    title: 'Tactile Haptics',
    description: 'Distinct vibration signatures for completions, navigation, and unlocks.',
    keywords: ['haptic', 'vibration', 'vibrate', 'touch', 'tactile', 'feedback'],
  },
  {
    id: 'seeker_identity',
    sectionId: 'account',
    title: 'Seeker Identity',
    description: 'Update the name displayed on your Sanctuary Pass and daily plan.',
    keywords: ['name', 'profile', 'identity', 'seeker', 'pass'],
  },
  {
    id: 'guided_setup',
    sectionId: 'account',
    title: 'Guided Setup (Onboarding)',
    description: 'Replay the setup flow to update your goal, Adhan voice, city, and habits.',
    keywords: ['onboarding', 'setup', 'wizard', 'replay', 'goal', 'habits'],
  },
  {
    id: 'backup_restore',
    sectionId: 'account',
    title: 'Sanctuary Backup & Restore',
    description: 'Export all prayers, streaks, Qada ledger, and notes to JSON or restore from file.',
    keywords: ['backup', 'export', 'import', 'restore', 'json', 'download', 'save', 'data'],
  },
  {
    id: 'reset_data',
    sectionId: 'account',
    title: 'Reset Sanctuary Journey',
    description: 'Permanently clear all progress, saved reflections, and daily streaks.',
    keywords: ['reset', 'delete', 'clear', 'wipe', 'erase', 'factory', 'danger'],
  },
];

export function isValidSettingsSectionId(sectionId) {
  return SETTINGS_SECTIONS.some((section) => section.id === sectionId);
}

export function getSettingsSectionMeta(sectionId) {
  return (
    SETTINGS_SECTIONS.find((section) => section.id === sectionId) ||
    SETTINGS_SECTIONS[0]
  );
}

/**
 * Filter settings entries across all 5 categories by keyword, title, description, or category name.
 * Returns matched items enriched with their parent section label.
 */
export function searchSettingsItems(query) {
  const cleaned = String(query || '').trim().toLowerCase();
  if (!cleaned) return [];
  const tokens = cleaned.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [];

  const sectionLabelMap = new Map(SETTINGS_SECTIONS.map((s) => [s.id, s.label]));

  const scored = [];
  for (const item of SETTINGS_SEARCH_INDEX) {
    const titleLower = item.title.toLowerCase();
    const descLower = item.description.toLowerCase();
    const sectionLower = (sectionLabelMap.get(item.sectionId) || '').toLowerCase();
    const haystack = `${titleLower} ${descLower} ${sectionLower} ${item.keywords.join(' ')}`;

    const matchesAll = tokens.every((tok) => haystack.includes(tok));
    if (!matchesAll) continue;

    let score = 0;
    if (titleLower.startsWith(cleaned)) score += 60;
    else if (titleLower.includes(cleaned)) score += 40;
    for (const tok of tokens) {
      if (titleLower.includes(tok)) score += 15;
      else if (item.keywords.some((kw) => kw.startsWith(tok))) score += 10;
      else score += 4;
    }

    scored.push({
      ...item,
      sectionLabel: sectionLabelMap.get(item.sectionId) || '',
      score,
    });
  }

  return scored.sort((a, b) => b.score - a.score);
}

/**
 * Compute concise, human-readable live status summaries for each Settings category rail item.
 */
export function buildSettingsSectionSummaries({
  prayerTimes,
  devotionData,
  isLightMode = false,
  devTimePhase = null,
  atmosphere,
  isHapticsEnabled = true,
  isTactileAudioEnabled = true,
} = {}) {
  const autopilot = normalizeAutopilotConfig(devotionData?.autopilot);
  const activeRuleCount = countActiveAutopilotRules(autopilot);

  const chimeProfileId = normalizeAdhanChimeProfile(
    devotionData?.notificationChimeProfile,
    devotionData?.notificationChime !== false
  );
  const chimeMeta = getAdhanChimeProfileMeta(chimeProfileId);

  const locationSummary = prayerTimes?.hasLocation
    ? prayerTimes.cityLabel || prayerTimes.localityLabel || 'Location set'
    : 'Set location';

  const prayerSummary = `${locationSummary} · ${chimeMeta.label}`;

  const autopilotSummary = autopilot.enabled
    ? `${activeRuleCount} ${activeRuleCount === 1 ? 'rule' : 'rules'} active`
    : 'Off';

  const themeLabel = isLightMode ? 'Daylight' : 'Night';
  const phaseLabel =
    devTimePhase === null
      ? atmosphere?.meta?.shortLabel
        ? `Auto · ${atmosphere.meta.shortLabel}`
        : 'Auto Solar'
      : atmosphere?.meta?.shortLabel || 'Custom';
  const appearanceSummary = `${themeLabel} · ${phaseLabel}`;

  const sensoryParts = [];
  if (isTactileAudioEnabled) sensoryParts.push('Audio');
  if (isHapticsEnabled) sensoryParts.push('Haptics');
  const sensorySummary = sensoryParts.length > 0 ? sensoryParts.join(' · ') : 'Muted';

  const profileName = String(devotionData?.profile?.name || 'Seeker').trim() || 'Seeker';

  return {
    prayer: prayerSummary,
    autopilot: autopilotSummary,
    appearance: appearanceSummary,
    sensory: sensorySummary,
    account: profileName,
  };
}
