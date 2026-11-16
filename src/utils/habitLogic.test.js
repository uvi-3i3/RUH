import test from 'node:test';
import assert from 'node:assert/strict';
import {
  HABIT_PRESETS,
  cloneDefaultHabits,
  createHabitEntry,
  removeHabitFromList,
  reorderHabitInList,
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
