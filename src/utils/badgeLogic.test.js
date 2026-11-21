import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BADGE_TIERS,
  COZY_BADGE_CONFIG,
  SACRED_BADGES,
  computeBadgeProgress,
  evaluateBadges,
  extractBadgeMetrics,
  getBadgeTierStyle,
  getCozyBadgeConfig,
} from './badgeLogic.js';
import { getLocalDateStr } from './devotionLogic.js';

test('SACRED_BADGES defines balanced Silver, Gold, and Platinum tiers', () => {
  const silver = SACRED_BADGES.filter((b) => b.tier === 'silver');
  const gold = SACRED_BADGES.filter((b) => b.tier === 'gold');
  const platinum = SACRED_BADGES.filter((b) => b.tier === 'platinum');

  assert.equal(silver.length, 3);
  assert.equal(gold.length, 3);
  assert.equal(platinum.length, 3);
  assert.ok(BADGE_TIERS.silver.order < BADGE_TIERS.gold.order);
  assert.ok(BADGE_TIERS.gold.order < BADGE_TIERS.platinum.order);
});

test('COZY_BADGE_CONFIG maps every SACRED_BADGES motif with safe full-bleed crop scales', () => {
  assert.equal(Object.keys(COZY_BADGE_CONFIG).length, SACRED_BADGES.length);

  for (const badge of SACRED_BADGES) {
    const cfg = getCozyBadgeConfig(badge.motif);
    assert.equal(cfg.motif, badge.motif);
    assert.ok(
      cfg.cropScale >= 1.15 && cfg.cropScale <= 1.5,
      `Expected full-bleed cropScale for ${badge.motif}, got ${cfg.cropScale}`
    );
    assert.ok(cfg.sceneLabel && cfg.sceneLabel.length >= 6);
    assert.ok(cfg.alt && cfg.alt.length >= 20);
    assert.ok(cfg.warmGlow && cfg.warmGlow.startsWith('rgba('));
  }

  // Unknown motif safely falls back to crescent_dawn
  assert.equal(getCozyBadgeConfig('nonexistent_motif').motif, 'crescent_dawn');
});

test('extractBadgeMetrics aggregates prayers, dhikr, streaks, daily 5 prayers, and reflections', () => {
  const ref = new Date(2026, 10, 14, 12, 0, 0);
  const d0 = getLocalDateStr(ref);
  const d1 = getLocalDateStr(new Date(2026, 10, 13, 12, 0, 0));
  const d2 = getLocalDateStr(new Date(2026, 10, 12, 12, 0, 0));

  const metrics = extractBadgeMetrics(
    {
      totalPrayers: 12,
      totalDhikr: 18,
      dailyPrayers: { date: d0, completed: ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] },
      dailyTasks: { date: d0, counters: { istighfar: 20 }, burhanCompleted: true },
      savedVerses: [{ id: 'v1', note: 'Peace' }, { id: 'v2', note: '' }],
      burhanNotes: { b1: 'First cause proof' },
      history: {
        [d2]: { prayers: 3, verses: 1, practices: 5 },
        [d1]: { prayers: 4, verses: 2, practices: 10 },
        [d0]: { prayers: 5, verses: 1, practices: 12 },
      },
    },
    ref
  );

  assert.equal(metrics.totalPrayers, 12);
  assert.equal(metrics.bestStreak, 3);
  assert.equal(metrics.maxDailyPrayers, 5);
  assert.equal(metrics.totalDhikr, 27);
  assert.equal(metrics.totalReflections, 4);
});

test('evaluateBadges unlocks exact badges and detects newly unlocked deltas', () => {
  const ref = new Date(2026, 10, 14, 12, 0, 0);
  const d0 = getLocalDateStr(ref);

  const initialEval = evaluateBadges(
    {
      totalPrayers: 1,
      totalDhikr: 10,
      history: { [d0]: { prayers: 1, practices: 10 } },
    },
    {},
    ref
  );

  const unlockedIds = initialEval.statuses.filter((s) => s.unlocked).map((s) => s.id);
  assert.deepEqual(unlockedIds.sort(), ['first_dawn', 'whispered_dhikr']);
  assert.equal(initialEval.newlyUnlocked.length, 2);

  // Subsequent evaluation with prior map should only flag newly crossed milestones
  const prior = {
    first_dawn: { unlockedAt: d0 },
    whispered_dhikr: { unlockedAt: d0 },
  };
  const nextEval = evaluateBadges(
    {
      totalPrayers: 50,
      totalDhikr: 100,
      dailyPrayers: { date: d0, completed: ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] },
      history: { [d0]: { prayers: 5, practices: 100 } },
    },
    prior,
    ref
  );

  const newlyIds = nextEval.newlyUnlocked.map((b) => b.id).sort();
  assert.deepEqual(newlyIds, ['fivefold_guardian', 'heart_of_remembrance', 'pillar_of_day']);
  assert.equal(nextEval.unlockedCount, 5);
});

test('computeBadgeProgress clamps percentage and preserved prior unlocks never regress', () => {
  const guardian = SACRED_BADGES.find((b) => b.id === 'fivefold_guardian');
  const half = computeBadgeProgress(guardian, { totalPrayers: 25 });
  assert.equal(half.pct, 50);
  assert.equal(half.unlocked, false);

  const capped = computeBadgeProgress(guardian, { totalPrayers: 120 });
  assert.equal(capped.current, 50);
  assert.equal(capped.pct, 100);
  assert.equal(capped.unlocked, true);

  // Already unlocked stays unlocked even if active metric was lower
  const evaluated = evaluateBadges(
    { totalPrayers: 0 },
    { first_dawn: { unlockedAt: '2026-11-10' } }
  );
  const firstDawn = evaluated.statuses.find((b) => b.id === 'first_dawn');
  assert.equal(firstDawn.unlocked, true);
});

test('getBadgeTierStyle provides both night and daylight palettes for all tiers', () => {
  for (const tier of ['silver', 'gold', 'platinum']) {
    const dark = getBadgeTierStyle(tier, false);
    const light = getBadgeTierStyle(tier, true);
    assert.ok(dark.palette.primary.startsWith('#'));
    assert.ok(light.palette.primary.startsWith('#'));
    assert.notEqual(dark.palette.dishTop, light.palette.dishTop);
  }
});

test('extractBadgeMetrics honors streakPausedDates for streak milestone badges', () => {
  const ref = new Date(2026, 10, 14, 12, 0, 0);
  const metrics = extractBadgeMetrics(
    {
      totalPrayers: 5,
      history: {
        '2026-11-11': { prayers: 2, verses: 0 },
        '2026-11-12': { prayers: 3, verses: 0 },
      },
      streakPausedDates: {
        '2026-11-13': true,
        '2026-11-14': true,
      },
    },
    ref
  );
  assert.equal(metrics.bestStreak, 2);
  const threeDayMetrics = extractBadgeMetrics(
    {
      history: {
        '2026-11-10': { prayers: 1 },
        '2026-11-11': { prayers: 1 },
        '2026-11-12': { prayers: 1 },
      },
      streakPausedDates: {
        '2026-11-13': true,
        '2026-11-14': true,
      },
    },
    ref
  );
  const trioEval = evaluateBadges(threeDayMetrics ? {
    history: {
      '2026-11-10': { prayers: 1 },
      '2026-11-11': { prayers: 1 },
      '2026-11-12': { prayers: 1 },
    },
    streakPausedDates: {
      '2026-11-13': true,
      '2026-11-14': true,
    },
  } : {}, {}, ref);
  assert.equal(threeDayMetrics.bestStreak, 3);
  assert.equal(trioEval.statuses.find((b) => b.id === 'steadfast_trio').unlocked, true);
});

