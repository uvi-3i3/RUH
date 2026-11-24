import test from 'node:test';
import assert from 'node:assert/strict';
import {
  HABIT_STATUS_FILTERS,
  computeDailyPracticeOverview,
  computeTabCompletionBadges,
  filterHabitsByStatus,
  formatHabitMeta,
  resolveNextPracticeSuggestion,
  resolveVisiblePracticeTab,
} from './tasksPageLogic';
import { PRACTICE_SETS } from '../data/adhkarData';
import { DEFAULT_HABITS } from '../data/duasData';

test('HABIT_STATUS_FILTERS defines clean all, remaining, and done filters', () => {
  assert.deepEqual(
    HABIT_STATUS_FILTERS.map((f) => f.id),
    ['all', 'remaining', 'done']
  );
});

test('computeTabCompletionBadges counts completed items across habits and practice sets', () => {
  const habits = DEFAULT_HABITS.slice(0, 3);
  const dailyHabitLogs = {
    [habits[0].id]: habits[0].target,
    [habits[1].id]: Math.max(0, habits[1].target - 1),
  };
  const dailyTasks = {
    istighfar: 100,
    subhanallah: 33,
    sabah_kursi: 1,
  };

  const badges = computeTabCompletionBadges({
    habits,
    dailyHabitLogs,
    dailyTasks,
    practiceSets: PRACTICE_SETS,
  });

  assert.equal(badges.habits.completed, 1);
  assert.equal(badges.habits.total, 3);
  assert.equal(badges.habits.isDone, false);

  assert.equal(badges.wird.completed, 2);
  assert.equal(badges.wird.total, PRACTICE_SETS.wird.items.length);
  assert.equal(badges.sabah.completed, 1);
  assert.equal(badges.masa.completed, 0);
});

test('computeDailyPracticeOverview combines habits, daily todos, and recommended adhkar accurately', () => {
  const habits = [
    { id: 'h1', title: 'Quran', target: 2, unit: 'pages', cadence: 'Daily' },
    { id: 'h2', title: 'Duha', target: 1, unit: 'prayer', cadence: 'Morning' },
  ];
  const todos = [
    { id: 't1', text: 'Reflect on a verse', completed: true },
    { id: 't2', text: 'Call family', completed: false },
  ];
  const dailyTasks = {
    istighfar: 100,
    subhanallah: 33,
    alhamdulillah: 33,
    allahu_akbar: 34,
  };

  const overview = computeDailyPracticeOverview({
    habits,
    dailyHabitLogs: { h1: 2, h2: 0 },
    dailyTasks,
    dailyTodos: todos,
    practiceSets: PRACTICE_SETS,
    recommendedSetId: 'wird',
  });

  assert.equal(overview.habitsCompleted, 1);
  assert.equal(overview.habitsTotal, 2);
  assert.equal(overview.todosCompleted, 1);
  assert.equal(overview.todosTotal, 2);
  assert.equal(overview.activeWindowCompleted, 4);
  assert.equal(overview.activeWindowTotal, 4);
  assert.equal(overview.completedAll, 6);
  assert.equal(overview.totalAll, 8);
  assert.equal(overview.percentage, 75);
  assert.equal(overview.allComplete, false);
});

test('filterHabitsByStatus separates all, remaining, and completed habits cleanly', () => {
  const habits = [
    { id: 'h1', title: 'Quran', target: 2 },
    { id: 'h2', title: 'Duha', target: 1 },
    { id: 'h3', title: 'Witr', target: 1 },
  ];
  const logs = { h1: 2, h2: 0, h3: 1 };

  assert.equal(filterHabitsByStatus(habits, 'all', logs).length, 3);
  assert.deepEqual(
    filterHabitsByStatus(habits, 'remaining', logs).map((h) => h.id),
    ['h2']
  );
  assert.deepEqual(
    filterHabitsByStatus(habits, 'done', logs).map((h) => h.id),
    ['h1', 'h3']
  );
});

test('formatHabitMeta formats everyday progress and customization strings cleanly', () => {
  const dailyHabit = { title: 'Quran', target: 2, unit: 'pages', cadence: 'Daily' };
  const morningHabit = { title: 'Duha', target: 1, unit: 'prayer', cadence: 'Morning' };

  assert.equal(formatHabitMeta(dailyHabit, 0, false), '0 of 2 pages');
  assert.equal(formatHabitMeta(dailyHabit, 2, false), 'Completed · 2 pages');
  assert.equal(formatHabitMeta(morningHabit, 0, false), '0 of 1 prayer · Morning');
  assert.equal(formatHabitMeta(dailyHabit, 0, true), '2 pages · Daily');
  assert.equal(formatHabitMeta(morningHabit, 0, true), '1 prayer · Morning');
});

test('resolveNextPracticeSuggestion prioritizes active adhkar window, then remaining habit, then wird, then complete', () => {
  const habits = [{ id: 'h1', title: 'Quran Recitation', target: 2, unit: 'pages' }];

  const liveMorning = resolveNextPracticeSuggestion({
    habits,
    dailyHabitLogs: {},
    dailyTasks: {},
    recommendedWindow: { setId: 'sabah', label: 'Morning Adhkar', shortTag: 'Now' },
    practiceSets: PRACTICE_SETS,
  });
  assert.equal(liveMorning.kind, 'adhkar');
  assert.equal(liveMorning.tabId, 'sabah');
  assert.equal(liveMorning.actionLabel, 'Open Morning');

  // Once Sabah is finished, suggest remaining habit
  const sabahDone = Object.fromEntries(PRACTICE_SETS.sabah.items.map((i) => [i.id, i.target]));
  const nextHabit = resolveNextPracticeSuggestion({
    habits,
    dailyHabitLogs: { h1: 1 },
    dailyTasks: sabahDone,
    recommendedWindow: { setId: 'sabah', label: 'Morning Adhkar', shortTag: 'Now' },
    practiceSets: PRACTICE_SETS,
  });
  assert.equal(nextHabit.kind, 'habit');
  assert.equal(nextHabit.label, 'Quran Recitation');
  assert.equal(nextHabit.detail, '1 pages to go');

  // Once habits and wird are all done, show calm completion state
  const allDoneTasks = {
    ...sabahDone,
    ...Object.fromEntries(PRACTICE_SETS.wird.items.map((i) => [i.id, i.target])),
  };
  const complete = resolveNextPracticeSuggestion({
    habits,
    dailyHabitLogs: { h1: 2 },
    dailyTasks: allDoneTasks,
    recommendedWindow: { setId: 'sabah', label: 'Morning Adhkar', shortTag: 'Now' },
    practiceSets: PRACTICE_SETS,
  });
  assert.equal(complete.kind, 'complete');
  assert.equal(complete.actionLabel, null);
});

test('resolveVisiblePracticeTab preserves today tab on mobile and falls back to habits on desktop', () => {
  assert.equal(resolveVisiblePracticeTab('today', false), 'today');
  assert.equal(resolveVisiblePracticeTab('today', true), 'habits');
  assert.equal(resolveVisiblePracticeTab('sabah', true), 'sabah');
  assert.equal(resolveVisiblePracticeTab('masa', false), 'masa');
  assert.equal(resolveVisiblePracticeTab('unknown', false), 'habits');
});

