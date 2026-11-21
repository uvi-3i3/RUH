/**
 * Pure choreography & state-machine logic for the full-screen boxless
 * badge reward reveal sequence.
 */

export const REWARD_REVEAL_PHASES = {
  GATHERING: 'gathering',
  MATERIALIZING: 'materializing',
  PRESENTED: 'presented',
  EXITING: 'exiting',
};

/**
 * Compute phase durations (ms) for a reward reveal sequence.
 * - New unlocks get a brief gathering beat so background interactions pause
 *   visibly before the haptic burst and materialization crescendo.
 * - Earned vault inspections skip straight to a snappy materialization.
 * - Reduced motion collapses animation waits so dismissal is immediate.
 */
export function getRewardRevealTimings({
  isNewUnlock = true,
  reducedMotion = false,
} = {}) {
  if (reducedMotion) {
    return {
      gatherMs: 0,
      materializeMs: 0,
      copyRevealDelayMs: 0,
      exitMs: 120,
    };
  }

  if (isNewUnlock) {
    return {
      gatherMs: 220,
      materializeMs: 880,
      copyRevealDelayMs: 400,
      exitMs: 280,
    };
  }

  return {
    gatherMs: 0,
    materializeMs: 360,
    copyRevealDelayMs: 140,
    exitMs: 220,
  };
}

/**
 * Resolve the starting phase when a badge reward reveal mounts or replays.
 */
export function getInitialRevealPhase({
  isNewUnlock = true,
  reducedMotion = false,
} = {}) {
  if (reducedMotion) return REWARD_REVEAL_PHASES.PRESENTED;
  return isNewUnlock
    ? REWARD_REVEAL_PHASES.GATHERING
    : REWARD_REVEAL_PHASES.MATERIALIZING;
}

/**
 * Whether user dismissal (backdrop tap, Continue, Escape) is currently permitted.
 * Locked during gathering & materializing so an accidental follow-through tap
 * from completing a prayer or dhikr never skips a newly unlocked badge reveal.
 */
export function canDismissReveal(phase) {
  return phase === REWARD_REVEAL_PHASES.PRESENTED;
}

/**
 * Whether underlying screen interactions must be paused for the current phase.
 */
export function isScreenInteractionPaused(phase) {
  return (
    phase === REWARD_REVEAL_PHASES.GATHERING ||
    phase === REWARD_REVEAL_PHASES.MATERIALIZING ||
    phase === REWARD_REVEAL_PHASES.PRESENTED ||
    phase === REWARD_REVEAL_PHASES.EXITING
  );
}

/**
 * Whether the celebratory badge haptic burst should fire automatically on entering this phase.
 * Fires on materialization for new unlocks (and immediately on presented in reduced motion).
 */
export function shouldTriggerAutoRevealHaptic({
  isNewUnlock = true,
  phase = REWARD_REVEAL_PHASES.GATHERING,
  reducedMotion = false,
} = {}) {
  if (!isNewUnlock) return false;
  if (reducedMotion) return phase === REWARD_REVEAL_PHASES.PRESENTED;
  return phase === REWARD_REVEAL_PHASES.MATERIALIZING;
}

/**
 * Whether the badge medallion itself has materialized and should be visible.
 */
export function isBadgeMaterialized(phase) {
  return (
    phase === REWARD_REVEAL_PHASES.MATERIALIZING ||
    phase === REWARD_REVEAL_PHASES.PRESENTED ||
    phase === REWARD_REVEAL_PHASES.EXITING
  );
}
