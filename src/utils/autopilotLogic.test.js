import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_AUTOPILOT_CONFIG,
  FRIDAY_AUTOPILOT_TODO_ID,
  applyFridayAutopilotTodo,
  buildAutopilotPausedDates,
  computeMidnightQadaSweep,
  countActiveAutopilotRules,
  isAutopilotRestDay,
  isWithinQuietHours,
  normalizeAutopilotConfig,
  resolveAutopilotPracticeTab,
  shouldSilenceChimeForAutopilot,
} from './autopilotLogic.js';

test('normalizeAutopilotConfig returns safe defaults and sanitizes invalid values', () => {
  assert.deepEqual(normalizeAutopilotConfig(null), DEFAULT_AUTOPILOT_CONFIG);
  const cleaned = normalizeAutopilotConfig({
    enabled: 1,
    quietWorkHours: true,
    quietHoursPreset: 'unknown_preset',
    weeklyRestDay: 9,
  });
  assert.equal(cleaned.enabled, true);
  assert.equal(cleaned.quietHoursPreset, 'workday');
  assert.equal(cleaned.weeklyRestDay, null);

  const validRest = normalizeAutopilotConfig({ enabled: true, weeklyRestDay: 5 });
  assert.equal(validRest.weeklyRestDay, 5);
});

test('quiet work hours silences daytime chimes on weekdays while keeping Fajr and weekends audible', () => {
  const cfg = { enabled: true, quietWorkHours: true, quietHoursPreset: 'workday' };
  const wednesdayNoon = new Date(2026, 10, 18, 12, 30); // Wed 12:30
  const wednesdayEvening = new Date(2026, 10, 18, 18, 45); // Wed 18:45
  const saturdayNoon = new Date(2026, 10, 21, 12, 30); // Sat 12:30

  assert.equal(isWithinQuietHours(cfg, wednesdayNoon), true);
  assert.equal(shouldSilenceChimeForAutopilot(cfg, 'dhuhr', wednesdayNoon), true);
  assert.equal(shouldSilenceChimeForAutopilot(cfg, 'fajr', wednesdayNoon), false);
  assert.equal(shouldSilenceChimeForAutopilot(cfg, 'maghrib', wednesdayEvening), false);
  assert.equal(shouldSilenceChimeForAutopilot(cfg, 'dhuhr', saturdayNoon), false);

  const dailyCfg = { enabled: true, quietWorkHours: true, quietHoursPreset: 'daily_daytime' };
  assert.equal(shouldSilenceChimeForAutopilot(dailyCfg, 'dhuhr', saturdayNoon), true);

  const disabledCfg = { ...cfg, enabled: false };
  assert.equal(shouldSilenceChimeForAutopilot(disabledCfg, 'dhuhr', wednesdayNoon), false);
});

test('resolveAutopilotPracticeTab focuses incomplete Sabah/Masa set and falls back to Habits once done', () => {
  const sets = {
    sabah: { items: [{ id: 's1', target: 3 }, { id: 's2', target: 1 }] },
    masa: { items: [{ id: 'm1', target: 1 }] },
  };
  const cfg = { enabled: true, autoFocusPractice: true };

  assert.equal(
    resolveAutopilotPracticeTab({
      autopilot: cfg,
      recommendedPeriod: 'sabah',
      dailyTasks: { s1: 1, s2: 0 },
      practiceSets: sets,
    }),
    'sabah'
  );

  // Once Sabah is completed, return cleanly to Habits
  assert.equal(
    resolveAutopilotPracticeTab({
      autopilot: cfg,
      recommendedPeriod: 'sabah',
      dailyTasks: { s1: 3, s2: 1 },
      practiceSets: sets,
    }),
    'habits'
  );

  // Disabled autopilot always defaults to Habits
  assert.equal(
    resolveAutopilotPracticeTab({
      autopilot: { enabled: false, autoFocusPractice: true },
      recommendedPeriod: 'masa',
      dailyTasks: {},
      practiceSets: sets,
    }),
    'habits'
  );
});

test('computeMidnightQadaSweep sweeps only unmarked prayers once per rolled-over date', () => {
  const cfg = { enabled: true, midnightQadaSweep: true };
  const prevDailyPrayers = {
    date: '2026-11-20',
    completed: ['fajr', 'dhuhr', 'maghrib'],
  };

  const firstSweep = computeMidnightQadaSweep({
    autopilot: cfg,
    prevDailyPrayers,
    currentDate: '2026-11-21',
    lastQadaSweepDate: null,
  });
  assert.deepEqual(firstSweep.missedPrayers, ['asr', 'isha']);
  assert.equal(firstSweep.sweptDate, '2026-11-20');

  // Guard against double-sweeping the same date
  const duplicateSweep = computeMidnightQadaSweep({
    autopilot: cfg,
    prevDailyPrayers,
    currentDate: '2026-11-21',
    lastQadaSweepDate: '2026-11-20',
  });
  assert.deepEqual(duplicateSweep.missedPrayers, []);

  // Same calendar day never sweeps
  const sameDay = computeMidnightQadaSweep({
    autopilot: cfg,
    prevDailyPrayers,
    currentDate: '2026-11-20',
    lastQadaSweepDate: null,
  });
  assert.deepEqual(sameDay.missedPrayers, []);
});

test('applyFridayAutopilotTodo adds Jumuah item idempotently on Fridays and removes it on other days', () => {
  const cfg = { enabled: true, fridayAutopilot: true };
  const friday = new Date(2026, 10, 20, 10, 0); // Friday
  const saturday = new Date(2026, 10, 21, 10, 0); // Saturday
  const baseTodos = [{ id: 't1', text: 'Pray Fajr', completed: false, rewarded: false, reward: 5 }];

  const fridayTodos = applyFridayAutopilotTodo({ autopilot: cfg, todos: baseTodos, date: friday });
  assert.equal(fridayTodos.length, 2);
  assert.equal(fridayTodos[0].id, FRIDAY_AUTOPILOT_TODO_ID);
  assert.equal(fridayTodos[0].completed, false);
  assert.equal(fridayTodos[0].rewarded, false);
  assert.equal(fridayTodos[0].reward, 5);

  // Idempotent on second call
  const fridayTwice = applyFridayAutopilotTodo({ autopilot: cfg, todos: fridayTodos, date: friday });
  assert.equal(fridayTwice.length, 2);

  // Cleaned up automatically on Saturday
  const saturdayTodos = applyFridayAutopilotTodo({ autopilot: cfg, todos: fridayTodos, date: saturday });
  assert.equal(saturdayTodos.length, 1);
  assert.equal(saturdayTodos[0].id, 't1');
});

test('isAutopilotRestDay, buildAutopilotPausedDates, and countActiveAutopilotRules track recurring weekly grace day cleanly', () => {
  const sunday = new Date(2026, 10, 22, 9, 0); // Sunday (0)
  const monday = new Date(2026, 10, 23, 9, 0); // Monday (1)
  const cfg = {
    enabled: true,
    quietWorkHours: true,
    autoFocusPractice: true,
    fridayAutopilot: true,
    midnightQadaSweep: true,
    weeklyRestDay: 0,
  };

  assert.equal(isAutopilotRestDay(cfg, sunday), true);
  assert.equal(isAutopilotRestDay(cfg, monday), false);
  assert.equal(countActiveAutopilotRules(cfg), 5);
  assert.equal(countActiveAutopilotRules({ ...cfg, enabled: false }), 0);

  const mergedPaused = buildAutopilotPausedDates({
    autopilot: cfg,
    streakPausedDates: { '2026-11-18': true },
    history: { '2026-11-14': { prayers: 5 }, '2026-11-16': { prayers: 5 } },
    referenceDate: monday,
  });
  assert.equal(mergedPaused['2026-11-18'], true); // manual pause preserved
  assert.equal(mergedPaused['2026-11-15'], true); // prior Sunday auto-paused
  assert.equal(mergedPaused['2026-11-22'], true); // current Sunday auto-paused
  assert.equal(mergedPaused['2026-11-23'], undefined); // Monday not paused
});
