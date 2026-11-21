import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_DAILY_TODOS,
  HABIT_PRESETS,
  addDailyTodoToList,
  clearCompletedDailyTodosInList,
  cloneDefaultDailyTodos,
  cloneDefaultHabits,
  computeTodaySummary,
  createDailyTodoItem,
  createHabitEntry,
  removeDailyTodoFromList,
  removeHabitFromList,
  reorderHabitInList,
  toggleDailyTodoInList,
  updateHabitInList,
} from './habitLogic';
import { DEFAULT_HABITS } from '../data/duasData';

test('createHabitEntry validates required title and clamps target/unit/cadence', () => {
  assert.equal(createHabitEntry({ title: '   ' }), null);

  const created = createHabitEntry({
    id: 'h1',
    title: '  Surah Al-Mulk  ',
    arabic: '',
    target: 5000,
    unit: '  pages ',
    cadence: 'Night',
  });

  assert.equal(created.id, 'h1');
  assert.equal(created.title, 'Surah Al-Mulk');
  assert.equal(created.arabic, 'عَمَل');
  assert.equal(created.target, 999);
  assert.equal(created.unit, 'pages');
  assert.equal(created.cadence, 'Night');
  assert.equal(created.isCustom, true);
});

test('updateHabitInList edits built-in and custom habits without mutating peers', () => {
  const starter = cloneDefaultHabits(DEFAULT_HABITS);
  const updated = updateHabitInList(starter, 'habit_quran', {
    title: 'Tadabbur & Recitation',
    target: 4,
    unit: 'pages',
    cadence: 'Morning',
  });

  const quran = updated.find((h) => h.id === 'habit_quran');
  assert.equal(quran.title, 'Tadabbur & Recitation');
  assert.equal(quran.target, 4);
  assert.equal(quran.cadence, 'Morning');
  assert.equal(updated.length, starter.length);

  // Blank title update preserves prior title safely
  const ignoredBlank = updateHabitInList(updated, 'habit_quran', { title: '   ' });
  assert.equal(ignoredBlank.find((h) => h.id === 'habit_quran').title, 'Tadabbur & Recitation');
});

test('removeHabitFromList removes any habit including built-ins and allows empty list', () => {
  const starter = cloneDefaultHabits(DEFAULT_HABITS);
  const afterOne = removeHabitFromList(starter, 'habit_duha');
  assert.equal(afterOne.length, starter.length - 1);
  assert.equal(afterOne.some((h) => h.id === 'habit_duha'), false);

  let remaining = starter;
  for (const h of starter) {
    remaining = removeHabitFromList(remaining, h.id);
  }
  assert.deepEqual(remaining, []);
});

test('reorderHabitInList moves habits up/down cleanly and respects list boundaries', () => {
  const starter = cloneDefaultHabits(DEFAULT_HABITS);
  const firstId = starter[0].id;
  const secondId = starter[1].id;

  // Moving first item up is a no-op
  const noopUp = reorderHabitInList(starter, firstId, 'up');
  assert.equal(noopUp[0].id, firstId);

  // Moving first item down swaps with second
  const swapped = reorderHabitInList(starter, firstId, 'down');
  assert.equal(swapped[0].id, secondId);
  assert.equal(swapped[1].id, firstId);

  // Moving second item back up restores original order
  const restored = reorderHabitInList(swapped, firstId, 'up');
  assert.equal(restored[0].id, firstId);
  assert.equal(restored[1].id, secondId);
});

test('HABIT_PRESETS provide valid customizable starters', () => {
  assert.ok(HABIT_PRESETS.length >= 5);
  for (const preset of HABIT_PRESETS) {
    const entry = createHabitEntry(preset);
    assert.ok(entry);
    assert.ok(entry.title.length > 0);
    assert.ok(entry.arabic.length > 0);
  }
});

test('Today List todo helpers add, toggle, remove, and clear completed items cleanly', () => {
  assert.equal(createDailyTodoItem('   '), null);

  const starter = cloneDefaultDailyTodos(DEFAULT_DAILY_TODOS);
  assert.equal(starter.length, 3);

  const withAdded = addDailyTodoToList(starter, '  Read Surah Al-Kahf  ', 'todo_kahf');
  assert.equal(withAdded.length, 4);
  assert.equal(withAdded[3].text, 'Read Surah Al-Kahf');
  assert.equal(withAdded[3].completed, false);

  const toggled = toggleDailyTodoInList(withAdded, 'todo_kahf');
  assert.equal(toggled.find((t) => t.id === 'todo_kahf').completed, true);

  const cleared = clearCompletedDailyTodosInList(toggled);
  assert.equal(cleared.length, 3);
  assert.equal(cleared.some((t) => t.id === 'todo_kahf'), false);

  const removed = removeDailyTodoFromList(cleared, starter[0].id);
  assert.equal(removed.length, 2);
});

test('computeTodaySummary tracks daily quest completion and percentage cleanly', () => {
  const todos = [
    { id: 't1', text: 'Task 1', completed: true },
    { id: 't2', text: 'Task 2', completed: false },
    { id: 't3', text: 'Task 3', completed: true },
  ];
  const summary = computeTodaySummary({ dailyTodos: todos });

  assert.equal(summary.completedTodos, 2);
  assert.equal(summary.totalTodos, 3);
  assert.equal(summary.totalCompleted, 2);
  assert.equal(summary.totalItems, 3);
  assert.equal(summary.percentage, 67);
  assert.equal(summary.allCompleted, false);
});
