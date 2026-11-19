import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeDeltaScale,
  isPointerDrag,
  normalizeCompassHeading,
  resolveNextPrayerFocusIndex,
} from './smoothInteractionLogic.js';

test('computeDeltaScale normalizes 60Hz, 120Hz, and background tab spikes safely', () => {
  assert.ok(Math.abs(computeDeltaScale(16.6667) - 1) < 0.01);
  assert.ok(Math.abs(computeDeltaScale(8.3333) - 0.5) < 0.01);
  assert.equal(computeDeltaScale(500), 2.5);
  assert.equal(computeDeltaScale(-10), 1);
  assert.equal(computeDeltaScale(Number.NaN), 1);
});

test('isPointerDrag distinguishes stationary taps from vertical/diagonal scroll gestures', () => {
  assert.equal(isPointerDrag(100, 200, 104, 205, 10), false);
  assert.equal(isPointerDrag(100, 200, 100, 214, 10), true);
  assert.equal(isPointerDrag(100, 200, 108, 208, 10), true);
  assert.equal(isPointerDrag(Number.NaN, 0, 50, 50, 10), false);
});

test('normalizeCompassHeading wraps cleanly to 0..359 and deduplicates identical degrees', () => {
  assert.deepEqual(normalizeCompassHeading(359.7, null), { heading: 0, changed: true });
  assert.deepEqual(normalizeCompassHeading(-1, 359), { heading: 359, changed: false });
  assert.deepEqual(normalizeCompassHeading(45.2, 45), { heading: 45, changed: false });
  assert.deepEqual(normalizeCompassHeading(46.1, 45), { heading: 46, changed: true });
  assert.deepEqual(normalizeCompassHeading(Number.NaN, 90), { heading: 90, changed: false });
});

test('resolveNextPrayerFocusIndex finds the next uncompleted prayer after the logged prayer', () => {
  const prayers = [
    { id: 'fajr' },
    { id: 'dhuhr' },
    { id: 'asr' },
    { id: 'maghrib' },
    { id: 'isha' },
  ];
  assert.equal(resolveNextPrayerFocusIndex(prayers, 'fajr', ['fajr']), 1);
  assert.equal(resolveNextPrayerFocusIndex(prayers, 'fajr', ['fajr', 'dhuhr']), 2);
  assert.equal(
    resolveNextPrayerFocusIndex(prayers, 'isha', ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']),
    -1
  );
});
