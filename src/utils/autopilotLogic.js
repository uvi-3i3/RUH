/**
 * Pure "Quiet Autopilot" (Set-It-and-Forget-It) logic for Ruh (رُوح).
 * Zero DOM/React/binary imports — 100% deterministic & unit-testable via node:test.
 */

export const PRAYER_IDS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

export const FRIDAY_AUTOPILOT_TODO_ID = 'autopilot_jumuah_kahf';
export const FRIDAY_AUTOPILOT_TODO_TEXT = 'Read Surah Al-Kahf & send Salawat';

export const QUIET_HOURS_PRESETS = [
  { id: 'workday', label: 'Weekdays · 9–5', startHour: 9, endHour: 17, weekdaysOnly: true },
  { id: 'daily_daytime', label: 'Every Day · 9–5', startHour: 9, endHour: 17, weekdaysOnly: false },
  { id: 'midday', label: 'Midday · 11–4', startHour: 11, endHour: 16, weekdaysOnly: true },
];

export const WEEKDAY_OPTIONS = [
  { value: null, label: 'Off' },
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];

export const DEFAULT_AUTOPILOT_CONFIG = {
  enabled: false,
  quietWorkHours: true,
  quietHoursPreset: 'workday',
  autoFocusPractice: true,
  fridayAutopilot: true,
  midnightQadaSweep: false,
  weeklyRestDay: null, // null or 0..6 (Sun..Sat)
};

export function normalizeAutopilotConfig(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ...DEFAULT_AUTOPILOT_CONFIG };
  }
  const validPresets = new Set(QUIET_HOURS_PRESETS.map((p) => p.id));
  const preset = validPresets.has(raw.quietHoursPreset)
    ? raw.quietHoursPreset
    : DEFAULT_AUTOPILOT_CONFIG.quietHoursPreset;

  let weeklyRestDay = null;
  if (raw.weeklyRestDay !== null && raw.weeklyRestDay !== undefined && raw.weeklyRestDay !== '') {
    const parsedDay = Number(raw.weeklyRestDay);
    if (Number.isInteger(parsedDay) && parsedDay >= 0 && parsedDay <= 6) {
      weeklyRestDay = parsedDay;
    }
  }

  return {
    enabled: Boolean(raw.enabled),
    quietWorkHours:
      typeof raw.quietWorkHours === 'boolean'
        ? raw.quietWorkHours
        : DEFAULT_AUTOPILOT_CONFIG.quietWorkHours,
    quietHoursPreset: preset,
    autoFocusPractice:
      typeof raw.autoFocusPractice === 'boolean'
        ? raw.autoFocusPractice
        : DEFAULT_AUTOPILOT_CONFIG.autoFocusPractice,
    fridayAutopilot:
      typeof raw.fridayAutopilot === 'boolean'
        ? raw.fridayAutopilot
        : DEFAULT_AUTOPILOT_CONFIG.fridayAutopilot,
    midnightQadaSweep:
      typeof raw.midnightQadaSweep === 'boolean'
        ? raw.midnightQadaSweep
        : DEFAULT_AUTOPILOT_CONFIG.midnightQadaSweep,
    weeklyRestDay,
  };
}

export function getQuietHoursPreset(presetId) {
  return QUIET_HOURS_PRESETS.find((p) => p.id === presetId) || QUIET_HOURS_PRESETS[0];
}

/**
 * Determine whether `date` falls inside the configured quiet work hours window.
 */
export function isWithinQuietHours(autopilot, date = new Date()) {
  const cfg = normalizeAutopilotConfig(autopilot);
  if (!cfg.enabled || !cfg.quietWorkHours) return false;
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return false;

  const preset = getQuietHoursPreset(cfg.quietHoursPreset);
  const dow = date.getDay(); // 0=Sun .. 6=Sat
  if (preset.weekdaysOnly && (dow === 0 || dow === 6)) {
    return false;
  }

  const hour = date.getHours();
  if (preset.startHour < preset.endHour) {
    return hour >= preset.startHour && hour < preset.endHour;
  }
  // Overnight range fallback
  return hour >= preset.startHour || hour < preset.endHour;
}

/**
 * Decide whether an audible prayer chime should be silenced automatically
 * (visual toast + subtle haptic still deliver calmly).
 */
export function shouldSilenceChimeForAutopilot(autopilot, prayerId = null, date = new Date()) {
  const cfg = normalizeAutopilotConfig(autopilot);
  if (!cfg.enabled || !cfg.quietWorkHours) return false;
  // Never silence Fajr during daytime work presets
  if (prayerId === 'fajr') return false;
  return isWithinQuietHours(cfg, date);
}

/**
 * Choose which Practice tab (`sabah`, `masa`, or `habits`) should auto-focus
 * when entering the Practice view under Quiet Autopilot.
 */
export function resolveAutopilotPracticeTab({
  autopilot,
  recommendedPeriod = null,
  dailyTasks = {},
  practiceSets = {},
} = {}) {
  const cfg = normalizeAutopilotConfig(autopilot);
  if (!cfg.enabled || !cfg.autoFocusPractice) return 'habits';

  if (recommendedPeriod !== 'sabah' && recommendedPeriod !== 'masa') {
    return 'habits';
  }

  const set = practiceSets?.[recommendedPeriod];
  const items = Array.isArray(set?.items) ? set.items : [];
  if (items.length === 0) return 'habits';

  const alreadyComplete = items.every(
    (item) => (Number(dailyTasks?.[item.id]) || 0) >= (Number(item.target) || 1)
  );
  return alreadyComplete ? 'habits' : recommendedPeriod;
}

/**
 * Compute unmarked prayers from a previous active day to sweep into Qada once
 * when rolling over to a new calendar date.
 */
export function computeMidnightQadaSweep({
  autopilot,
  prevDailyPrayers,
  currentDate,
  lastQadaSweepDate = null,
} = {}) {
  const cfg = normalizeAutopilotConfig(autopilot);
  if (!cfg.enabled || !cfg.midnightQadaSweep) {
    return { missedPrayers: [], sweptDate: null };
  }

  const prevDate = typeof prevDailyPrayers?.date === 'string' ? prevDailyPrayers.date : null;
  if (!prevDate || !currentDate || prevDate >= currentDate) {
    return { missedPrayers: [], sweptDate: null };
  }
  if (lastQadaSweepDate === prevDate) {
    return { missedPrayers: [], sweptDate: null };
  }

  const completedSet = new Set(
    Array.isArray(prevDailyPrayers?.completed) ? prevDailyPrayers.completed : []
  );
  const missedPrayers = PRAYER_IDS.filter((id) => !completedSet.has(id));

  return {
    missedPrayers,
    sweptDate: prevDate,
  };
}

/**
 * Idempotently sync the Friday Jumu'ah checklist anchor in Today's Todos.
 * Adds it only on Fridays when enabled; removes it cleanly on other days or when off.
 */
export function applyFridayAutopilotTodo({ autopilot, todos = [], date = new Date() } = {}) {
  const safeTodos = Array.isArray(todos) ? todos : [];
  const cfg = normalizeAutopilotConfig(autopilot);
  const isFriday = date instanceof Date && !Number.isNaN(date.getTime()) && date.getDay() === 5;
  const shouldInclude = cfg.enabled && cfg.fridayAutopilot && isFriday;

  const hasAutoItem = safeTodos.some((item) => item?.id === FRIDAY_AUTOPILOT_TODO_ID);

  if (shouldInclude) {
    if (hasAutoItem) return safeTodos;
    return [
      {
        id: FRIDAY_AUTOPILOT_TODO_ID,
        text: FRIDAY_AUTOPILOT_TODO_TEXT,
        reward: 5,
        completed: false,
        rewarded: false,
        auto: true,
      },
      ...safeTodos,
    ];
  }

  if (!hasAutoItem) return safeTodos;
  return safeTodos.filter((item) => item?.id !== FRIDAY_AUTOPILOT_TODO_ID);
}

/**
 * Determine whether `date` matches the user's configured recurring weekly rest day.
 */
export function isAutopilotRestDay(autopilot, date = new Date()) {
  const cfg = normalizeAutopilotConfig(autopilot);
  if (!cfg.enabled || cfg.weeklyRestDay === null) return false;
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return false;
  return date.getDay() === cfg.weeklyRestDay;
}

/**
 * Merge manual streakPausedDates with automatic recurring weekly rest days across
 * the user's recorded history span (up to referenceDate) so streaks stay protected
 * without manually tapping Pause Streak.
 */
export function buildAutopilotPausedDates({
  autopilot,
  streakPausedDates = {},
  history = {},
  referenceDate = new Date(),
} = {}) {
  const base =
    streakPausedDates && typeof streakPausedDates === 'object' && !Array.isArray(streakPausedDates)
      ? { ...streakPausedDates }
      : {};
  const cfg = normalizeAutopilotConfig(autopilot);
  if (!cfg.enabled || cfg.weeklyRestDay === null) return base;
  if (!(referenceDate instanceof Date) || Number.isNaN(referenceDate.getTime())) return base;

  const formatLocal = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const refDay = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate()
  );

  // Determine earliest date to backfill (earliest history date or 30 days back, capped at 400 days)
  let earliest = new Date(refDay);
  earliest.setDate(earliest.getDate() - 30);

  if (history && typeof history === 'object') {
    const keys = Object.keys(history)
      .filter((k) => /^\d{4}-\d{2}-\d{2}$/.test(k))
      .sort();
    if (keys.length > 0) {
      const [y, m, d] = keys[0].split('-').map(Number);
      const firstHistoryDate = new Date(y, m - 1, d);
      if (!Number.isNaN(firstHistoryDate.getTime()) && firstHistoryDate < earliest) {
        const capDate = new Date(refDay);
        capDate.setDate(capDate.getDate() - 400);
        earliest = firstHistoryDate < capDate ? capDate : firstHistoryDate;
      }
    }
  }

  const cursor = new Date(earliest);
  while (cursor <= refDay) {
    if (cursor.getDay() === cfg.weeklyRestDay) {
      base[formatLocal(cursor)] = true;
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return base;
}

/**
 * Count active automations when Quiet Autopilot is enabled (for Settings status summary).
 */
export function countActiveAutopilotRules(autopilot) {
  const cfg = normalizeAutopilotConfig(autopilot);
  if (!cfg.enabled) return 0;
  let count = 0;
  if (cfg.quietWorkHours) count += 1;
  if (cfg.autoFocusPractice) count += 1;
  if (cfg.fridayAutopilot) count += 1;
  if (cfg.midnightQadaSweep) count += 1;
  if (cfg.weeklyRestDay !== null) count += 1;
  return count;
}
