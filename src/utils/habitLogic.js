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

export const DEFAULT_DAILY_TODOS = [
  {
    id: 'todo_verse_reflect',
    text: 'Reflect on a verse',
    reward: 5,
    completed: false,
    rewarded: false,
  },
  {
    id: 'todo_adhkar_moment',
    text: 'Morning or evening dhikr',
    reward: 5,
    completed: false,
    rewarded: false,
  },
  {
    id: 'todo_family_kindness',
    text: 'One quiet act of kindness',
    reward: 5,
    completed: false,
    rewarded: false,
  },
];

export function cloneDefaultDailyTodos(defaults = DEFAULT_DAILY_TODOS) {
  return Array.isArray(defaults)
    ? defaults.map((item) => ({
        ...item,
        reward: typeof item.reward === 'number' ? item.reward : 5,
        completed: Boolean(item.completed),
        rewarded: Boolean(item.rewarded),
      }))
    : [];
}

export function createDailyTodoItem(text, id) {
  const cleaned = String(text || '').trim().slice(0, 72);
  if (!cleaned) return null;
  return {
    id: id || `todo_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    text: cleaned,
    reward: 5,
    completed: false,
    rewarded: false,
    isCustom: true,
  };
}

export function addDailyTodoToList(todos = [], text, id) {
  const list = Array.isArray(todos) ? todos : [];
  if (list.length >= 12) return list;
  const item = createDailyTodoItem(text, id);
  if (!item) return list;
  return [...list, item];
}

export function toggleDailyTodoInList(todos = [], todoId) {
  if (!Array.isArray(todos) || !todoId) return Array.isArray(todos) ? todos : [];
  return todos.map((item) => {
    if (!item || item.id !== todoId) return item;
    const nextCompleted = !item.completed;
    return {
      ...item,
      completed: nextCompleted,
      rewarded: Boolean(item.rewarded || nextCompleted),
    };
  });
}

export function removeDailyTodoFromList(todos = [], todoId) {
  if (!Array.isArray(todos)) return [];
  return todos.filter((item) => item && item.id !== todoId);
}

export function clearCompletedDailyTodosInList(todos = []) {
  if (!Array.isArray(todos)) return [];
  return todos.filter((item) => item && !item.completed);
}

export function computeTodaySummary({ dailyTodos = [] } = {}) {
  const safeTodos = Array.isArray(dailyTodos) ? dailyTodos.filter(Boolean) : [];
  const completedTodos = safeTodos.filter((t) => Boolean(t.completed)).length;
  const totalTodos = safeTodos.length;
  const percentage = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;
  const allCompleted = totalTodos > 0 && completedTodos >= totalTodos;

  return {
    completedTodos,
    totalTodos,
    totalCompleted: completedTodos,
    totalItems: totalTodos,
    percentage,
    allCompleted,
  };
}
