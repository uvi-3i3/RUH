import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeCardTilt,
  computeGyroTilt,
  computeSeekerRingProgress,
  evaluateCardSwipeFlip,
  formatCardMrzLine,
  formatJoinedYear,
  formatSeekerPassId,
  formatStationNumeral,
  parseCardFinishPreference,
  resolveCardFinish,
  resolveInitials,
} from './profileCardLogic';

test('formatSeekerPassId produces deterministic archival pass reference', () => {
  assert.equal(
    formatSeekerPassId({ hijriYear: 1448, joinedDate: '2026', activeDays: 7 }),
    'RUH-1448-2607'
  );
  assert.equal(
    formatSeekerPassId({ hijriYear: null, joinedDate: '', activeDays: 0 }),
    'RUH-1448-2600'
  );
  assert.equal(
    formatSeekerPassId({ hijriYear: 1449, joinedDate: '2027-01-12', activeDays: 125 }),
    'RUH-1449-27125'
  );
});

test('formatJoinedYear extracts clean 4-digit year from ISO dates and strings', () => {
  assert.equal(formatJoinedYear('2026-11-19'), '2026');
  assert.equal(formatJoinedYear('2025'), '2025');
  assert.equal(formatJoinedYear(''), '2026');
});

test('resolveInitials extracts 1-2 uppercase characters cleanly', () => {
  assert.equal(resolveInitials('Amina Noor'), 'AN');
  assert.equal(resolveInitials('Sayyid Uvais Al Bukhari'), 'SB');
  assert.equal(resolveInitials('Seeker'), 'SE');
  assert.equal(resolveInitials('   ', 'RH'), 'RH');
});

test('computeSeekerRingProgress clamps ratio and calculates SVG dash offset accurately', () => {
  const zero = computeSeekerRingProgress(0, 30, 300);
  assert.equal(zero.ratio, 0);
  assert.equal(zero.dashOffset, 300);
  assert.equal(zero.pct, 0);

  const half = computeSeekerRingProgress(15, 30, 300);
  assert.equal(half.ratio, 0.5);
  assert.equal(half.dashOffset, 150);
  assert.equal(half.pct, 50);

  const capped = computeSeekerRingProgress(45, 30, 300);
  assert.equal(capped.ratio, 1);
  assert.equal(capped.dashOffset, 0);
  assert.equal(capped.pct, 100);
});

test('formatStationNumeral converts zero-based station index to Roman numerals', () => {
  assert.equal(formatStationNumeral(0), 'I');
  assert.equal(formatStationNumeral(1), 'II');
  assert.equal(formatStationNumeral(3), 'IV');
  assert.equal(formatStationNumeral(-2), 'I');
});

test('formatCardMrzLine builds archival passport-style line and handles edge names safely', () => {
  assert.equal(
    formatCardMrzLine({
      name: 'Uwais Al-Bukhari',
      hijriYear: 1448,
      stationIndex: 0,
      joinedDate: '2026-11-19',
    }),
    'RUH‹‹UWAIS‹ALBUKHARI‹‹1448AH‹‹STN·I‹‹EST·2026'
  );
  assert.equal(
    formatCardMrzLine({ name: '   ', hijriYear: null, stationIndex: 2, joinedDate: '' }),
    'RUH‹‹SEEKER‹‹1448AH‹‹STN·III‹‹EST·2026'
  );
});

test('parseCardFinishPreference and resolveCardFinish validate and resolve material themes', () => {
  assert.equal(parseCardFinishPreference('emerald'), 'emerald');
  assert.equal(parseCardFinishPreference('OBSIDIAN'), 'obsidian');
  assert.equal(parseCardFinishPreference('unknown-metal'), 'auto');

  assert.equal(resolveCardFinish('auto', false), 'obsidian');
  assert.equal(resolveCardFinish('auto', true), 'ivory');
  assert.equal(resolveCardFinish('emerald', true), 'emerald');
  assert.equal(resolveCardFinish('ivory', false), 'ivory');
});

test('computeCardTilt clamps pointer coordinates, computes holoAngle and parallax, and handles invalid rects', () => {
  const fallback = computeCardTilt(100, 100, null);
  assert.deepEqual(fallback, { rx: 0, ry: 0, mxPct: 50, myPct: 50, holoAngle: 130, px: 0, py: 0 });

  const rect = { left: 100, top: 200, width: 400, height: 200 };
  const center = computeCardTilt(300, 300, rect, 4, 3);
  assert.deepEqual(center, { rx: 0, ry: 0, mxPct: 50, myPct: 50, holoAngle: 130, px: 0, py: 0 });

  const topRight = computeCardTilt(999, 0, rect, 4, 3);
  assert.deepEqual(topRight, { rx: 4, ry: 4, mxPct: 100, myPct: 0, holoAngle: 177, px: 3, py: -3 });
});

test('computeGyroTilt normalizes handheld angles and guards non-finite readings', () => {
  assert.equal(computeGyroTilt(null, 10), null);
  assert.equal(computeGyroTilt(45, Number.NaN), null);

  const neutral = computeGyroTilt(45, 0, 5, 3);
  assert.deepEqual(neutral, { rx: 0, ry: 0, mxPct: 50, myPct: 50, holoAngle: 130, px: 0, py: 0 });

  const extremeRight = computeGyroTilt(45, 90, 5, 3);
  assert.equal(extremeRight.ry, 5);
  assert.equal(extremeRight.mxPct, 92);
  assert.equal(extremeRight.px, 3);
});

test('evaluateCardSwipeFlip detects decisive horizontal swipes while ignoring taps and vertical scrolls', () => {
  assert.equal(evaluateCardSwipeFlip(-75, 10), 'left');
  assert.equal(evaluateCardSwipeFlip(82, -14), 'right');
  assert.equal(evaluateCardSwipeFlip(30, 2), null);
  assert.equal(evaluateCardSwipeFlip(70, 65), null);
  assert.equal(evaluateCardSwipeFlip(Number.NaN, 0), null);
});
