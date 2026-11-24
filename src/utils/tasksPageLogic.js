/**
 * Pure logic for the Daily Practices (Tasks) workspace in Ruh.
 * Decouples progress rollups, habit filtering, tab completion counts,
 * and time-aware "Up Next" practice suggestions from React UI components.
 */

export const HABIT_STATUS_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'remaining', label: 'Remaining' },
  { id: 'done', label: 'Completed' },
];

/**
 * Computes completion counts for each practice tab (Habits, Wird, Sabah, Masa).
 */
export function computeTabCompletionBadges({
  habits = [],
  dailyHabitLogs = {},
  dailyTasks = {},
  practiceSets = {},
} = {}) {
  const safeHabits = Array.isArray(habits) ? habits.filter(Boolean) : [];
  const habitsCompleted = safeHabits.filter((h) => {
    const target = Math.max(1, Number(h.target) || 1);
    return (Number(dailyHabitLogs?.[h.id]) || 0) >= target;
  }).length;

  const result = {
    habits: {
      completed: habitsCompleted,
      total: safeHabits.length,
      isDone: safeHabits.length > 0 && habitsCompleted >= safeHabits.length,
    },
  };

  Object.values(practiceSets || {}).forEach((set) => {
    if (!set || !set.id) return;
    const items = Array.isArray(set.items) ? set.items : [];
    const completed = items.filter((item) => {
      const target = Math.max(1, Number(item.target) || 1);
      return (Number(dailyTasks?.[item.id]) || 0) >= target;
    }).length;
    result[set.id] = {
      completed,
      total: items.length,
      isDone: items.length > 0 && completed >= items.length,
    };
  });

  return result;
}

/**
 * Computes an overall daily practice snapshot combining Habits, Today's Intentions,
 * and the currently recommended Adhkar/Wird set so users see honest, grounded momentum.
 */
export function computeDailyPracticeOverview({
  habits = [],
  dailyHabitLogs = {},
  dailyTasks = {},
  dailyTodos = [],
  practiceSets = {},
  recommendedSetId = 'wird',
} = {}) {
  const badges = computeTabCompletionBadges({
    habits,
    dailyHabitLogs,
    dailyTasks,
    practiceSets,
  });

  const safeTodos = Array.isArray(dailyTodos) ? dailyTodos.filter(Boolean) : [];
  const todosCompleted = safeTodos.filter((t) => Boolean(t.completed)).length;
  const todosTotal = safeTodos.length;

  const activeWindowBadge = badges[recommendedSetId] || badges.wird || { completed: 0, total: 0 };

  const completedCore = badges.habits.completed + todosCompleted;
  const totalCore = badges.habits.total + todosTotal;

  // Include active adhkar/wird set in overall percentage when core items exist or adhkar has progress
  const completedAll = completedCore + activeWindowBadge.completed;
  const totalAll = totalCore + activeWindowBadge.total;
  const percentage = totalAll > 0 ? Math.round((completedAll / totalAll) * 100) : 0;

  return {
    badges,
    habitsCompleted: badges.habits.completed,
    habitsTotal: badges.habits.total,
    todosCompleted,
    todosTotal,
    activeWindowCompleted: activeWindowBadge.completed,
    activeWindowTotal: activeWindowBadge.total,
    completedAll,
    totalAll,
    percentage,
    allComplete: totalAll > 0 && completedAll >= totalAll,
  };
}

/**
 * Filters habits by completion status ('all' | 'remaining' | 'done').
 */
export function filterHabitsByStatus(habits = [], statusFilter = 'all', dailyHabitLogs = {}) {
  const safeHabits = Array.isArray(habits) ? habits.filter(Boolean) : [];
  if (statusFilter === 'remaining') {
    return safeHabits.filter((h) => {
      const target = Math.max(1, Number(h.target) || 1);
      return (Number(dailyHabitLogs?.[h.id]) || 0) < target;
    });
  }
  if (statusFilter === 'done') {
    return safeHabits.filter((h) => {
      const target = Math.max(1, Number(h.target) || 1);
      return (Number(dailyHabitLogs?.[h.id]) || 0) >= target;
    });
  }
  return safeHabits;
}

/**
 * Formats a clean, plain-English metadata line for a habit row.
 */
export function formatHabitMeta(habit, count = 0, isCustomizing = false) {
  if (!habit) return '';
  const target = Math.max(1, Number(habit.target) || 1);
  const safeCount = Math.max(0, Number(count) || 0);
  const unit = String(habit.unit || 'time').trim() || 'time';
  const cadence = habit.cadence && habit.cadence !== 'Daily' ? habit.cadence : '';

  if (isCustomizing) {
    return cadence ? `${target} ${unit} · ${cadence}` : `${target} ${unit} · Daily`;
  }

  if (safeCount >= target) {
    return cadence ? `Completed · ${target} ${unit} · ${cadence}` : `Completed · ${target} ${unit}`;
  }

  return cadence ? `${safeCount} of ${target} ${unit} · ${cadence}` : `${safeCount} of ${target} ${unit}`;
}

/**
 * Resolves a calm, actionable "Up Next" suggestion for the top of the Practices page.
 */
export function resolveNextPracticeSuggestion({
  habits = [],
  dailyHabitLogs = {},
  dailyTasks = {},
  recommendedWindow = null,
  practiceSets = {},
} = {}) {
  const recSetId = recommendedWindow?.setId;
  if (recommendedWindow?.shortTag === 'Now' && recSetId && practiceSets?.[recSetId]) {
    const recSet = practiceSets[recSetId];
    const items = Array.isArray(recSet.items) ? recSet.items : [];
    const remaining = items.filter((item) => (Number(dailyTasks?.[item.id]) || 0) < (item.target || 1)).length;
    if (remaining > 0) {
      return {
        kind: 'adhkar',
        tabId: recSetId,
        label: recommendedWindow.label || recSet.subtitle || recSet.label,
        detail: `${remaining} remaining`,
        actionLabel: `Open ${recSetId === 'sabah' ? 'Morning' : recSetId === 'masa' ? 'Evening' : recSet.label}`,
      };
    }
  }

  const nextHabit = (Array.isArray(habits) ? habits : []).find((h) => {
    if (!h) return false;
    const target = Math.max(1, Number(h.target) || 1);
    return (Number(dailyHabitLogs?.[h.id]) || 0) < target;
  });

  if (nextHabit) {
    const count = Number(dailyHabitLogs?.[nextHabit.id]) || 0;
    const target = Math.max(1, Number(nextHabit.target) || 1);
    const left = Math.max(1, target - count);
    return {
      kind: 'habit',
      tabId: 'habits',
      itemId: nextHabit.id,
      label: nextHabit.title,
      detail: `${left} ${nextHabit.unit || 'left'} to go`,
      actionLabel: 'Focus',
    };
  }

  const wirdItems = practiceSets?.wird?.items || [];
  const wirdRemaining = wirdItems.filter(
    (item) => (Number(dailyTasks?.[item.id]) || 0) < (item.target || 1)
  ).length;
  if (wirdRemaining > 0) {
    return {
      kind: 'adhkar',
      tabId: 'wird',
      label: 'Daily Wird',
      detail: `${wirdRemaining} remembrances open`,
      actionLabel: 'Open Wird',
    };
  }

  return {
    kind: 'complete',
    tabId: 'habits',
    label: 'Today’s practice is complete',
    detail: 'Rest in gratitude',
    actionLabel: null,
  };
}

/**
 * Resolves which tab is active in the primary ledger column.
 * On mobile (< lg), 'today' is a dedicated tab so Today's Intentions fit without scrolling.
 * On desktop (lg+), Today's Intentions are always visible in the right companion column,
 * so 'today' gracefully falls back to 'habits' in the left ledger.
 */
export function resolveVisiblePracticeTab(activeTab, isDesktop = false) {
  if (isDesktop && activeTab === 'today') return 'habits';
  const allowed = new Set(['habits', 'today', 'wird', 'sabah', 'masa']);
  return allowed.has(activeTab) ? activeTab : 'habits';
}

