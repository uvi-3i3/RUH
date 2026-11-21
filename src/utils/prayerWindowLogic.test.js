import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeWeeklyMuhasabah,
  evaluatePrayerWindow,
  parseTimeStringToTodayDate,
  resolveInitialPrayerFocusIndex,
  resolveNextUpcomingPrayer,
  resolveRecommendedAdhkarPeriod,
  resolveTodayPrayerSchedule,
} from './prayerWindowLogic.js';
import { getLocalDateStr } from './devotionLogic.js';

test('parseTimeStringToTodayDate parses valid 24h strings and rejects invalid input', () => {
  const ref = new Date(2026, 10, 20, 11, 30, 0);
  const dhuhr = parseTimeStringToTodayDate('12:45', ref);
  assert.equal(dhuhr.getHours(), 12);
  assert.equal(dhuhr.getMinutes(), 45);
  assert.equal(parseTimeStringToTodayDate('25:99', ref), null);
  assert.equal(parseTimeStringToTodayDate('invalid', ref), null);
});

test('evaluatePrayerWindow locks upcoming prayers, respects 5m grace buffer, and allows travel override', () => {
  const now = new Date(2026, 10, 20, 11, 30, 0); // 11:30 AM
  const schedule = resolveTodayPrayerSchedule({ now });

  // Fajr (05:15, sunrise ~06:40) has passed by 11:30 AM -> canLog true, status 'passed'
  const fajr = evaluatePrayerWindow('fajr', { schedule, now });
  assert.equal(fajr.status, 'passed');
  assert.equal(fajr.canLog, true);

  // Dhuhr (12:45) is 75m in the future -> locked ('upcoming')
  const dhuhrLocked = evaluatePrayerWindow('dhuhr', { schedule, now, isTravelMode: false });
  assert.equal(dhuhrLocked.status, 'upcoming');
  assert.equal(dhuhrLocked.canLog, false);
  assert.equal(dhuhrLocked.minutesUntil, 75);

  // Travel Mode unlocks upcoming prayer cleanly
  const dhuhrTravel = evaluatePrayerWindow('dhuhr', { schedule, now, isTravelMode: true });
  assert.equal(dhuhrTravel.status, 'travel-unlocked');
  assert.equal(dhuhrTravel.canLog, true);

  // 3 minutes before Dhuhr (12:42) falls inside default 5-minute grace window -> active & loggable
  const nearDhuhr = new Date(2026, 10, 20, 12, 42, 0);
  const dhuhrGrace = evaluatePrayerWindow('dhuhr', { schedule, now: nearDhuhr });
  assert.equal(dhuhrGrace.status, 'active');
  assert.equal(dhuhrGrace.canLog, true);

  // During Asr window (17:00), Asr is active while Dhuhr is passed and Maghrib is locked
  const afternoon = new Date(2026, 10, 20, 17, 0, 0);
  assert.equal(evaluatePrayerWindow('dhuhr', { schedule, now: afternoon }).status, 'passed');
  assert.equal(evaluatePrayerWindow('asr', { schedule, now: afternoon }).status, 'active');
  assert.equal(evaluatePrayerWindow('maghrib', { schedule, now: afternoon }).status, 'upcoming');
});

test('resolveNextUpcomingPrayer returns next prayer today and wraps to tomorrow Fajr after Isha', () => {
  const morning = new Date(2026, 10, 20, 11, 30, 0);
  const schedule = resolveTodayPrayerSchedule({ now: morning });
  const next = resolveNextUpcomingPrayer({ schedule, now: morning });
  assert.equal(next.id, 'dhuhr');
  assert.equal(next.isTomorrow, false);
  assert.equal(next.minutesUntil, 75);

  const lateNight = new Date(2026, 10, 20, 22, 0, 0);
  const nextAfterIsha = resolveNextUpcomingPrayer({ schedule, now: lateNight });
  assert.equal(nextAfterIsha.id, 'fajr');
  assert.equal(nextAfterIsha.isTomorrow, true);
});

test('resolveInitialPrayerFocusIndex prioritizes active unlogged prayer, then recent passed, then upcoming', () => {
  const atAsr = new Date(2026, 10, 20, 17, 0, 0);
  const schedule = resolveTodayPrayerSchedule({ now: atAsr });

  // Asr (index 2) is active and unlogged -> focuses index 2
  assert.equal(resolveInitialPrayerFocusIndex({ schedule, completedPrayers: [], now: atAsr }), 2);

  // If Asr is logged but Dhuhr wasn't -> focuses Dhuhr (index 1, most recent passed unlogged)
  assert.equal(
    resolveInitialPrayerFocusIndex({ schedule, completedPrayers: ['asr'], now: atAsr }),
    1
  );

  // If Fajr, Dhuhr, Asr are all logged -> focuses Maghrib (index 3, next upcoming)
  assert.equal(
    resolveInitialPrayerFocusIndex({
      schedule,
      completedPrayers: ['fajr', 'dhuhr', 'asr'],
      now: atAsr,
    }),
    3
  );
});

test('resolveRecommendedAdhkarPeriod highlights Sabah in morning and Masa in evening', () => {
  const morning = new Date(2026, 10, 20, 8, 15, 0);
  const schedule = resolveTodayPrayerSchedule({ now: morning });
  assert.equal(resolveRecommendedAdhkarPeriod(morning, schedule).setId, 'sabah');

  const evening = new Date(2026, 10, 20, 17, 45, 0);
  assert.equal(resolveRecommendedAdhkarPeriod(evening, schedule).setId, 'masa');

  const midday = new Date(2026, 10, 20, 14, 0, 0);
  assert.equal(resolveRecommendedAdhkarPeriod(midday, schedule).setId, 'wird');
});

test('computeWeeklyMuhasabah aggregates 7-day history cleanly with calm reflection copy', () => {
  const now = new Date(2026, 10, 20, 12, 0, 0);
  const empty = computeWeeklyMuhasabah({}, now);
  assert.equal(empty.weekPrayers, 0);
  assert.equal(empty.activeDays, 0);
  assert.match(empty.reflection, /Begin gently/);

  const history = {};
  for (let i = 0; i < 5; i++) {
    const d = new Date(2026, 10, 20 - i);
    history[getLocalDateStr(d)] = { prayers: 5, verses: 2 };
  }
  const strong = computeWeeklyMuhasabah(history, now);
  assert.equal(strong.weekPrayers, 25);
  assert.equal(strong.fullDays, 5);
  assert.equal(strong.activeDays, 5);
  assert.match(strong.reflection, /Steadfast week/);
});
