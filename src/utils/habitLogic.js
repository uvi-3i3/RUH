/**
 * Pure customizable habit management logic for Ruh.
 */

export const HABIT_CADENCES = ['Daily', 'Morning', 'Midday', 'Evening', 'Night', 'Fridays'];

export const HABIT_UNIT_SUGGESTIONS = ['times', 'pages', 'mins', 'rak‘ahs', 'sets', 'act'];

export const HABIT_PRESETS = [
  {
    id: 'preset_mulk',
    title: 'Surah Al-Mulk',
    arabic: 'الملك',
    category: 'Quran',
    target: 1,
    unit: 'night',
    cadence: 'Night',
  },
  {
    id: 'preset_tahajjud',
    title: 'Tahajjud Night Prayer',
    arabic: 'تَهَجُّد',
    category: 'Salah',
    target: 2,
    unit: 'rak‘ahs',
    cadence: 'Night',
  },
  {
    id: 'preset_salawat',
    title: 'Salawat on the Prophet',
    arabic: 'صَلَوَات',
    category: 'Dhikr',
    target: 100,
    unit: 'times',
    cadence: 'Daily',
  },
  {
    id: 'preset_kahf',
    title: 'Surah Al-Kahf',
    arabic: 'الكَهف',
    category: 'Quran',
    target: 1,
    unit: 'reading',
    cadence: 'Fridays',
  },
  {
    id: 'preset_parents',
    title: 'Check In With Family',
    arabic: 'صِلَة',
    category: 'Character',
    target: 1,
    unit: 'call',
    cadence: 'Daily',
  },
  {
    id: 'preset_fast',
    title: 'Sunnah Voluntary Fast',
    arabic: 'صِيَام',
    category: 'Fasting',
    target: 1,
    unit: 'day',
    cadence: 'Daily',
  },
];

export function normalizeHabitTarget(value) {
  const num = Math.floor(Number(value));
  if (!Number.isFinite(num) || num < 1) return 1;
  return Math.min(999, num);
}

export function normalizeHabitUnit(unit) {
  const cleaned = String(unit || '').trim().slice(0, 18);
  return cleaned || 'time';
}

export function normalizeHabitCadence(cadence) {
  const cleaned = String(cadence || '').trim();
  return HABIT_CADENCES.includes(cleaned) ? cleaned : 'Daily';
}

export function createHabitEntry({
  title,
  arabic = 'عَمَل',
  target = 1,
  unit = 'time',
  cadence = 'Daily',
  category = 'Personal',
  id,
} = {}) {
  const cleanedTitle = String(title || '').trim().slice(0, 56);
  if (!cleanedTitle) return null;

  const cleanedArabic = String(arabic || '').trim().slice(0, 24) || 'عَمَل';
  return {
    id: id || `habit_custom_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    title: cleanedTitle,
    arabic: cleanedArabic,
    category: String(category || 'Personal').trim() || 'Personal',
    target: normalizeHabitTarget(target),
    unit: normalizeHabitUnit(unit),
    cadence: normalizeHabitCadence(cadence),
    isCustom: true,
  };
}

export function updateHabitInList(habits = [], habitId, patch = {}) {
  if (!Array.isArray(habits) || !habitId) return Array.isArray(habits) ? habits : [];
  return habits.map((habit) => {
    if (!habit || habit.id !== habitId) return habit;
    const nextTitle =
      patch.title !== undefined ? String(patch.title || '').trim().slice(0, 56) : habit.title;
    if (!nextTitle) return habit;

    return {
      ...habit,
      title: nextTitle,
      arabic:
        patch.arabic !== undefined
          ? String(patch.arabic || '').trim().slice(0, 24) || habit.arabic || 'عَمَل'
          : habit.arabic || 'عَمَل',
      target: patch.target !== undefined ? normalizeHabitTarget(patch.target) : habit.target,
      unit: patch.unit !== undefined ? normalizeHabitUnit(patch.unit) : habit.unit,
      cadence:
        patch.cadence !== undefined ? normalizeHabitCadence(patch.cadence) : habit.cadence || 'Daily',
    };
  });
}

export function removeHabitFromList(habits = [], habitId) {
  if (!Array.isArray(habits)) return [];
  return habits.filter((h) => h && h.id !== habitId);
}

export function reorderHabitInList(habits = [], habitId, direction = 'up') {
  if (!Array.isArray(habits) || habits.length < 2) return Array.isArray(habits) ? habits : [];
  const idx = habits.findIndex((h) => h && h.id === habitId);
  if (idx === -1) return habits;

  const targetIdx = direction === 'down' ? idx + 1 : idx - 1;
  if (targetIdx < 0 || targetIdx >= habits.length) return habits;

  const next = [...habits];
  const [moved] = next.splice(idx, 1);
  next.splice(targetIdx, 0, moved);
  return next;
}

export function cloneDefaultHabits(defaultHabits = []) {
  return Array.isArray(defaultHabits) ? defaultHabits.map((h) => ({ ...h })) : [];
}

export function sanitizeHabitList(habits) {
  if (!Array.isArray(habits)) return undefined;
  const result = [];
  const seenIds = new Set();
  for (const item of habits) {
    if (!item || typeof item !== 'object') continue;
    const rawId = typeof item.id === 'string' && item.id.trim() ? item.id.trim().slice(0, 64) : undefined;
    const entry = createHabitEntry({
      id: rawId,
      title: item.title,
      arabic: item.arabic || 'عَمَل',
      target: item.target,
      unit: item.unit,
      cadence: item.cadence,
      category: item.category || 'Personal',
    });
    if (!entry) continue;
    if (seenIds.has(entry.id)) continue;
    seenIds.add(entry.id);
    if (item.isCustom === false) entry.isCustom = false;
    result.push(entry);
  }
  return result;
}

