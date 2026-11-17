import test from 'node:test';
import assert from 'node:assert/strict';
import {
  HAPTIC_SPECS,
  HAPTIC_TYPES,
  getHapticSpec,
  resolveToggleHapticType,
  shouldThrottleHaptic,
} from './hapticLogic';

test('every declared HAPTIC_TYPE has a valid spec with nativeSteps and webPattern', () => {
  for (const key of Object.keys(HAPTIC_TYPES)) {
    const type = HAPTIC_TYPES[key];
    const spec = getHapticSpec(type);
    assert.equal(spec.type, type);
    assert.ok(Array.isArray(spec.nativeSteps) && spec.nativeSteps.length > 0);
    assert.ok(
      typeof spec.webPattern === 'number' ||
        (Array.isArray(spec.webPattern) && spec.webPattern.length > 0)
    );
  }
});

test('distinct button categories map to distinct tactile signatures', () => {
  const signature = (spec) => JSON.stringify({ native: spec.nativeSteps, web: spec.webPattern });

  assert.notEqual(signature(getHapticSpec(HAPTIC_TYPES.DETENT)), signature(getHapticSpec(HAPTIC_TYPES.TAP)));
  assert.notEqual(signature(getHapticSpec(HAPTIC_TYPES.TOGGLE_ON)), signature(getHapticSpec(HAPTIC_TYPES.TOGGLE_OFF)));
  assert.notEqual(signature(getHapticSpec(HAPTIC_TYPES.NAVIGATE)), signature(getHapticSpec(HAPTIC_TYPES.DISMISS)));
  assert.notEqual(signature(getHapticSpec(HAPTIC_TYPES.SUCCESS)), signature(getHapticSpec(HAPTIC_TYPES.CELEBRATE)));
  assert.notEqual(signature(getHapticSpec(HAPTIC_TYPES.WARNING)), signature(getHapticSpec(HAPTIC_TYPES.DESTRUCTIVE)));
  assert.notEqual(signature(getHapticSpec(HAPTIC_TYPES.HEAVY)), signature(getHapticSpec(HAPTIC_TYPES.UNDO)));
});

test('toggle haptic distinguishes enabling vs disabling states', () => {
  assert.equal(resolveToggleHapticType(true), HAPTIC_TYPES.TOGGLE_ON);
  assert.equal(resolveToggleHapticType(false), HAPTIC_TYPES.TOGGLE_OFF);
});

test('unknown haptic type falls back safely to light tap', () => {
  assert.equal(getHapticSpec('nonexistent'), HAPTIC_SPECS[HAPTIC_TYPES.TAP]);
});

test('throttling prevents rapid detent flooding while allowing discrete state pulses', () => {
  const detent = getHapticSpec(HAPTIC_TYPES.DETENT);
  assert.equal(shouldThrottleHaptic(detent, 1000, 1010), true);
  assert.equal(shouldThrottleHaptic(detent, 1000, 1030), false);
  assert.equal(shouldThrottleHaptic(detent, undefined, 1010), false);

  const success = getHapticSpec(HAPTIC_TYPES.SUCCESS);
  assert.equal(shouldThrottleHaptic(success, 1000, 1005), false);
});
