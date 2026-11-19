import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PREFERENCE_STORAGE_KEYS,
  computeHabitCompletionSummary,
  parseAtmospherePhase,
  parseHapticsEnabled,
  parseTactileAudioEnabled,
  parseThemeMode,
  serializeAtmospherePhase,
  serializeHapticsEnabled,
  serializeTactileAudioEnabled,
  serializeThemeMode,
} from './preferencesLogic';
import { createHabitEntry, reorderHabitInList, updateHabitInList } from './habitLogic';
import { sanitizeBackupPayload } from './devotionLogic';

test('theme mode parsing and serialization round-trips safely', () => {
  assert.equal(parseThemeMode(null), false);
  assert.equal(parseThemeMode('dark'), false);
  assert.equal(parseThemeMode('light'), true);
  assert.equal(serializeThemeMode(true), 'light');
  assert.equal(serializeThemeMode(false), 'dark');
});

test('haptics preference defaults to true and parses/serializes cleanly', () => {
  assert.equal(parseHapticsEnabled(null), true);
  assert.equal(parseHapticsEnabled('true'), true);
  assert.equal(parseHapticsEnabled('false'), false);
  assert.equal(serializeHapticsEnabled(true), 'true');
  assert.equal(serializeHapticsEnabled(false), 'false');
});

test('tactile audio preference defaults to true and parses/serializes cleanly', () => {
  assert.equal(parseTactileAudioEnabled(null), true);
  assert.equal(parseTactileAudioEnabled('true'), true);
  assert.equal(parseTactileAudioEnabled('false'), false);
  assert.equal(parseTactileAudioEnabled(false), false);
  assert.equal(serializeTactileAudioEnabled(true), 'true');
  assert.equal(serializeTactileAudioEnabled(false), 'false');
});

test('atmosphere phase parsing and serialization validates solar range 0..4', () => {
  assert.equal(parseAtmospherePhase(null), null);
  assert.equal(parseAtmospherePhase(''), null);
  assert.equal(parseAtmospherePhase('7'), null);
  assert.equal(parseAtmospherePhase('-1'), null);
  assert.equal(parseAtmospherePhase('2'), 2);
  assert.equal(serializeAtmospherePhase(null), null);
  assert.equal(serializeAtmospherePhase(0), '0');
  assert.equal(serializeAtmospherePhase(4), '4');
  assert.equal(serializeAtmospherePhase(99), null);
});

test('computeHabitCompletionSummary tracks completed custom habits reactively', () => {
  const h1 = createHabitEntry({ id: 'h1', title: 'Surah Al-Mulk', target: 1 });
  const h2 = createHabitEntry({ id: 'h2', title: 'Salawat', target: 100 });
  const habits = [h1, h2];

  assert.deepEqual(computeHabitCompletionSummary([], {}), {
    completedHabitsCount: 0,
    totalHabitsCount: 0,
  });

  assert.deepEqual(computeHabitCompletionSummary(habits, { h1: 1, h2: 40 }), {
    completedHabitsCount: 1,
    totalHabitsCount: 2,
  });

  const loweredTarget = updateHabitInList(habits, 'h2', { target: 40 });
  assert.deepEqual(computeHabitCompletionSummary(loweredTarget, { h1: 1, h2: 40 }), {
    completedHabitsCount: 2,
    totalHabitsCount: 2,
  });
});

test('habit customization + preference payload round-trips cleanly through JSON backup sanitization', () => {
  const custom = createHabitEntry({
    id: 'custom_1',
    title: 'Morning Adhkar',
    arabic: 'أذكار',
    target: 3,
    unit: 'sets',
    cadence: 'Morning',
  });
  const extra = createHabitEntry({
    id: 'custom_2',
    title: 'Surah Al-Kahf',
    arabic: 'الكهف',
    target: 1,
    unit: 'reading',
    cadence: 'Fridays',
  });
  const ordered = reorderHabitInList([custom, extra], 'custom_2', 'up');

  const payload = {
    totalPrayers: 5,
    habits: ordered,
    settings: {
      isSimpleMode: true,
      isAmbientEnabled: true,
      notificationLeadMinutes: 10,
      notificationChime: false,
    },
  };

  const restored = sanitizeBackupPayload(JSON.parse(JSON.stringify(payload)));
  assert.ok(restored);
  assert.equal(restored.habits.length, 2);
  assert.equal(restored.habits[0].id, 'custom_2');
  assert.equal(restored.habits[1].title, 'Morning Adhkar');
  assert.equal(restored.settings.isSimpleMode, true);
  assert.equal(restored.settings.isAmbientEnabled, true);
  assert.equal(restored.settings.notificationLeadMinutes, 10);
  assert.equal(restored.settings.notificationChime, false);
  assert.ok(PREFERENCE_STORAGE_KEYS.DEVOTION_STATE);
});
