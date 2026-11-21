import test from 'node:test';
import assert from 'node:assert/strict';
import {
  HAPTIC_SPECS,
  HAPTIC_TYPES,
  getHapticSpec,
  getNativeHapticSignature,
  getWebHapticSignature,
  resolveBadgeUnlockHapticType,
  resolveToggleHapticType,
  shouldThrottleHaptic,
} from './hapticLogic';

const VALID_STEP_KINDS = new Set([
  'selectionStart',
  'selection',
  'selectionChanged',
  'selectionEnd',
  'impact',
  'notification',
  'vibrate',
]);

test('every declared HAPTIC_TYPE has a valid spec with monotonic nativeSteps and webPattern', () => {
  for (const key of Object.keys(HAPTIC_TYPES)) {
    const type = HAPTIC_TYPES[key];
    const spec = getHapticSpec(type);
    assert.equal(spec.type, type);
    assert.ok(typeof spec.label === 'string' && spec.label.length > 0);
    assert.ok(Array.isArray(spec.nativeSteps) && spec.nativeSteps.length > 0);

    let prevDelay = -1;
    for (const step of spec.nativeSteps) {
      assert.ok(VALID_STEP_KINDS.has(step.kind), `Unexpected step kind: ${step.kind}`);
      assert.ok(typeof step.delayMs === 'number' && step.delayMs >= prevDelay);
      prevDelay = step.delayMs;
    }

    assert.ok(
      typeof spec.webPattern === 'number' ||
        (Array.isArray(spec.webPattern) && spec.webPattern.length > 0)
    );
  }
});

test('every haptic profile in HAPTIC_SPECS has a globally unique native AND web signature', () => {
  const nativeSeen = new Map();
  const webSeen = new Map();

  for (const type of Object.values(HAPTIC_TYPES)) {
    const spec = getHapticSpec(type);
    const nativeSig = getNativeHapticSignature(spec);
    const webSig = getWebHapticSignature(spec);

    assert.equal(
      nativeSeen.has(nativeSig),
      false,
      `Duplicate native haptic signature between ${nativeSeen.get(nativeSig)} and ${type}`
    );
    nativeSeen.set(nativeSig, type);

    assert.equal(
      webSeen.has(webSig),
      false,
      `Duplicate web vibration pattern between ${webSeen.get(webSig)} and ${type}`
    );
    webSeen.set(webSig, type);
  }
});

test('task completion, navigation transitions, and badge unlocking have unmistakable tactile signatures', () => {
  const taskSpec = getHapticSpec(HAPTIC_TYPES.TASK_COMPLETE);
  const navSpec = getHapticSpec(HAPTIC_TYPES.NAVIGATE);
  const silverBadge = getHapticSpec(HAPTIC_TYPES.BADGE_UNLOCK);
  const goldBadge = getHapticSpec(HAPTIC_TYPES.BADGE_UNLOCK_GOLD);
  const platinumBadge = getHapticSpec(HAPTIC_TYPES.BADGE_UNLOCK_PLATINUM);

  assert.equal(taskSpec.category, 'taskCompletion');
  assert.equal(navSpec.category, 'navigationTransition');
  assert.equal(silverBadge.category, 'badgeUnlock');
  assert.equal(goldBadge.category, 'badgeUnlock');
  assert.equal(platinumBadge.category, 'badgeUnlock');

  // Navigation uses selection lifecycle glide without heavy impacts or notifications
  assert.equal(navSpec.nativeSteps[0].kind, 'selectionStart');
  assert.equal(navSpec.nativeSteps.some((s) => s.kind === 'notification'), false);
  assert.equal(navSpec.nativeSteps.some((s) => s.style === 'Heavy'), false);

  // Task completion pairs a medium snap with a warm Success notification
  assert.equal(taskSpec.nativeSteps[0].kind, 'impact');
  assert.equal(taskSpec.nativeSteps[0].style, 'Medium');
  assert.equal(taskSpec.nativeSteps[1].kind, 'notification');
  assert.equal(taskSpec.nativeSteps[1].notificationType, 'Success');

  // Badge unlocking escalates in length and ceremony across Silver -> Gold -> Platinum
  assert.ok(silverBadge.nativeSteps.length > taskSpec.nativeSteps.length);
  assert.ok(goldBadge.nativeSteps.length > silverBadge.nativeSteps.length);
  assert.ok(platinumBadge.nativeSteps.length > goldBadge.nativeSteps.length);
  assert.equal(platinumBadge.nativeSteps.at(-1).kind, 'vibrate');
});

test('resolveBadgeUnlockHapticType maps tiers accurately with safe silver fallback', () => {
  assert.equal(resolveBadgeUnlockHapticType('silver'), HAPTIC_TYPES.BADGE_UNLOCK);
  assert.equal(resolveBadgeUnlockHapticType('gold'), HAPTIC_TYPES.BADGE_UNLOCK_GOLD);
  assert.equal(resolveBadgeUnlockHapticType('platinum'), HAPTIC_TYPES.BADGE_UNLOCK_PLATINUM);
  assert.equal(resolveBadgeUnlockHapticType('GOLD'), HAPTIC_TYPES.BADGE_UNLOCK_GOLD);
  assert.equal(resolveBadgeUnlockHapticType(undefined), HAPTIC_TYPES.BADGE_UNLOCK);
});

test('toggle haptic distinguishes enabling vs disabling states', () => {
  assert.equal(resolveToggleHapticType(true), HAPTIC_TYPES.TOGGLE_ON);
  assert.equal(resolveToggleHapticType(false), HAPTIC_TYPES.TOGGLE_OFF);
});

test('unknown haptic type falls back safely to light tap', () => {
  assert.equal(getHapticSpec('nonexistent'), HAPTIC_SPECS[HAPTIC_TYPES.TAP]);
});

test('throttling prevents rapid detent flooding while allowing discrete completion/badge pulses', () => {
  const detent = getHapticSpec(HAPTIC_TYPES.DETENT);
  assert.equal(shouldThrottleHaptic(detent, 1000, 1010), true);
  assert.equal(shouldThrottleHaptic(detent, 1000, 1030), false);
  assert.equal(shouldThrottleHaptic(detent, undefined, 1010), false);

  const taskComplete = getHapticSpec(HAPTIC_TYPES.TASK_COMPLETE);
  assert.equal(shouldThrottleHaptic(taskComplete, 1000, 1005), false);

  const badgeUnlock = getHapticSpec(HAPTIC_TYPES.BADGE_UNLOCK);
  assert.equal(shouldThrottleHaptic(badgeUnlock, 1000, 1005), false);
});
