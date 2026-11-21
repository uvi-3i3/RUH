import test from 'node:test';
import assert from 'node:assert/strict';
import {
  REWARD_REVEAL_PHASES,
  canDismissReveal,
  getInitialRevealPhase,
  getRewardRevealTimings,
  isBadgeMaterialized,
  isScreenInteractionPaused,
  shouldTriggerAutoRevealHaptic,
} from './rewardRevealLogic.js';

test('new badge unlock starts in gathering phase with non-zero anticipation and materialization timings', () => {
  const timings = getRewardRevealTimings({ isNewUnlock: true, reducedMotion: false });
  assert.ok(timings.gatherMs >= 150 && timings.gatherMs <= 350);
  assert.ok(timings.materializeMs >= 650 && timings.materializeMs <= 1200);
  assert.ok(timings.exitMs >= 180 && timings.exitMs <= 400);

  assert.equal(
    getInitialRevealPhase({ isNewUnlock: true, reducedMotion: false }),
    REWARD_REVEAL_PHASES.GATHERING
  );
});

test('earned badge inspection starts directly in materializing phase with faster unlock', () => {
  const newTimings = getRewardRevealTimings({ isNewUnlock: true, reducedMotion: false });
  const inspectTimings = getRewardRevealTimings({ isNewUnlock: false, reducedMotion: false });

  assert.equal(inspectTimings.gatherMs, 0);
  assert.ok(inspectTimings.materializeMs < newTimings.materializeMs);
  assert.equal(
    getInitialRevealPhase({ isNewUnlock: false, reducedMotion: false }),
    REWARD_REVEAL_PHASES.MATERIALIZING
  );
});

test('reduced motion skips gathering and materializing delays while still firing auto haptic on new unlock', () => {
  const timings = getRewardRevealTimings({ isNewUnlock: true, reducedMotion: true });
  assert.equal(timings.gatherMs, 0);
  assert.equal(timings.materializeMs, 0);

  const initial = getInitialRevealPhase({ isNewUnlock: true, reducedMotion: true });
  assert.equal(initial, REWARD_REVEAL_PHASES.PRESENTED);
  assert.equal(canDismissReveal(initial), true);
  assert.equal(
    shouldTriggerAutoRevealHaptic({ isNewUnlock: true, phase: initial, reducedMotion: true }),
    true
  );
});

test('dismissal is locked during gathering and materializing, and unlocked only once presented', () => {
  assert.equal(canDismissReveal(REWARD_REVEAL_PHASES.GATHERING), false);
  assert.equal(canDismissReveal(REWARD_REVEAL_PHASES.MATERIALIZING), false);
  assert.equal(canDismissReveal(REWARD_REVEAL_PHASES.PRESENTED), true);
  assert.equal(canDismissReveal(REWARD_REVEAL_PHASES.EXITING), false);
});

test('screen interactions stay paused across all active reveal phases and resume when inactive', () => {
  assert.equal(isScreenInteractionPaused(REWARD_REVEAL_PHASES.GATHERING), true);
  assert.equal(isScreenInteractionPaused(REWARD_REVEAL_PHASES.MATERIALIZING), true);
  assert.equal(isScreenInteractionPaused(REWARD_REVEAL_PHASES.PRESENTED), true);
  assert.equal(isScreenInteractionPaused(REWARD_REVEAL_PHASES.EXITING), true);
  assert.equal(isScreenInteractionPaused(null), false);
});

test('auto haptic burst fires precisely on materialization for new unlocks and does not double-fire for vault inspections', () => {
  assert.equal(
    shouldTriggerAutoRevealHaptic({
      isNewUnlock: true,
      phase: REWARD_REVEAL_PHASES.GATHERING,
    }),
    false
  );
  assert.equal(
    shouldTriggerAutoRevealHaptic({
      isNewUnlock: true,
      phase: REWARD_REVEAL_PHASES.MATERIALIZING,
    }),
    true
  );
  assert.equal(
    shouldTriggerAutoRevealHaptic({
      isNewUnlock: true,
      phase: REWARD_REVEAL_PHASES.PRESENTED,
    }),
    false
  );
  assert.equal(
    shouldTriggerAutoRevealHaptic({
      isNewUnlock: false,
      phase: REWARD_REVEAL_PHASES.MATERIALIZING,
    }),
    false
  );
});

test('isBadgeMaterialized hides medallion during gathering light seed and shows it once materializing', () => {
  assert.equal(isBadgeMaterialized(REWARD_REVEAL_PHASES.GATHERING), false);
  assert.equal(isBadgeMaterialized(REWARD_REVEAL_PHASES.MATERIALIZING), true);
  assert.equal(isBadgeMaterialized(REWARD_REVEAL_PHASES.PRESENTED), true);
  assert.equal(isBadgeMaterialized(REWARD_REVEAL_PHASES.EXITING), true);
});
