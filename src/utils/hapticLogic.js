/**
 * Pure tactile haptic profile definitions, timing choreography, and throttling logic.
 * Maps distinct UI interaction categories to specialized @capacitor/haptics
 * impact, selection, notification, and vibration signatures so that
 * task completion, navigation transitions, and badge unlocking each carry
 * an unmistakable physical feel.
 */

export const HAPTIC_TYPES = Object.freeze({
  DETENT: 'detent',
  TAP: 'tap',
  MEDIUM_TAP: 'mediumTap',
  TOGGLE_ON: 'toggleOn',
  TOGGLE_OFF: 'toggleOff',
  NAVIGATE: 'navigate',
  DISMISS: 'dismiss',
  HEAVY: 'heavy',
  UNDO: 'undo',
  TASK_COMPLETE: 'taskComplete',
  SUCCESS: 'success',
  CELEBRATE: 'celebrate',
  BADGE_UNLOCK: 'badgeUnlock',
  BADGE_UNLOCK_GOLD: 'badgeUnlockGold',
  BADGE_UNLOCK_PLATINUM: 'badgeUnlockPlatinum',
  WARNING: 'warning',
  DESTRUCTIVE: 'destructive',
});

export const HAPTIC_SPECS = Object.freeze({
  /** Crisp horological detent tick: wheel scroll slots, segmented tabs, steppers. */
  [HAPTIC_TYPES.DETENT]: Object.freeze({
    type: HAPTIC_TYPES.DETENT,
    category: 'detent',
    label: 'Detent Tick',
    throttleMs: 28,
    nativeSteps: Object.freeze([{ delayMs: 0, kind: 'selection' }]),
    webPattern: 7,
  }),

  /** Feather-light glass tap: bead increments, partial habit steps, context inspect. */
  [HAPTIC_TYPES.TAP]: Object.freeze({
    type: HAPTIC_TYPES.TAP,
    category: 'tap',
    label: 'Light Tap',
    throttleMs: 18,
    nativeSteps: Object.freeze([{ delayMs: 0, kind: 'impact', style: 'Light' }]),
    webPattern: 12,
  }),

  /** Focused medium pulse: Qibla alignment lock and physical hold triggers. */
  [HAPTIC_TYPES.MEDIUM_TAP]: Object.freeze({
    type: HAPTIC_TYPES.MEDIUM_TAP,
    category: 'mediumTap',
    label: 'Medium Lock',
    throttleMs: 24,
    nativeSteps: Object.freeze([{ delayMs: 0, kind: 'impact', style: 'Medium' }]),
    webPattern: 20,
  }),

  /** Asymmetric switch snap ON: ascending light-to-medium engagement. */
  [HAPTIC_TYPES.TOGGLE_ON]: Object.freeze({
    type: HAPTIC_TYPES.TOGGLE_ON,
    category: 'toggle',
    label: 'Toggle On',
    throttleMs: 0,
    nativeSteps: Object.freeze([
      { delayMs: 0, kind: 'impact', style: 'Light' },
      { delayMs: 42, kind: 'impact', style: 'Medium' },
    ]),
    webPattern: Object.freeze([10, 26, 18]),
  }),

  /** Asymmetric switch release OFF: crisp settle to selection detent. */
  [HAPTIC_TYPES.TOGGLE_OFF]: Object.freeze({
    type: HAPTIC_TYPES.TOGGLE_OFF,
    category: 'toggle',
    label: 'Toggle Off',
    throttleMs: 0,
    nativeSteps: Object.freeze([
      { delayMs: 0, kind: 'impact', style: 'Light' },
      { delayMs: 36, kind: 'selection' },
    ]),
    webPattern: Object.freeze([12, 24, 6]),
  }),

  /**
   * Navigation Transition: whisper-light threshold glide.
   * Uses Capacitor's selection lifecycle + feather-light arrival tap so crossing
   * views, opening worlds, or flipping cards feels smooth and airy — never heavy.
   */
  [HAPTIC_TYPES.NAVIGATE]: Object.freeze({
    type: HAPTIC_TYPES.NAVIGATE,
    category: 'navigationTransition',
    label: 'Navigation Transition',
    throttleMs: 24,
    nativeSteps: Object.freeze([
      { delayMs: 0, kind: 'selectionStart' },
      { delayMs: 14, kind: 'selectionChanged' },
      { delayMs: 44, kind: 'impact', style: 'Light' },
      { delayMs: 60, kind: 'selectionEnd' },
    ]),
    webPattern: Object.freeze([8, 18, 12]),
  }),

  /** Soft exhale click: closing sheets, dismissing overlays/prompts. */
  [HAPTIC_TYPES.DISMISS]: Object.freeze({
    type: HAPTIC_TYPES.DISMISS,
    category: 'dismiss',
    label: 'Dismiss',
    throttleMs: 24,
    nativeSteps: Object.freeze([
      { delayMs: 0, kind: 'selectionChanged' },
      { delayMs: 22, kind: 'selectionEnd' },
    ]),
    webPattern: 8,
  }),

  /** Deep physical thud: Qada long-press, Misbaha hold-launch, bulk actions. */
  [HAPTIC_TYPES.HEAVY]: Object.freeze({
    type: HAPTIC_TYPES.HEAVY,
    category: 'heavy',
    label: 'Heavy Press',
    throttleMs: 0,
    nativeSteps: Object.freeze([{ delayMs: 0, kind: 'impact', style: 'Heavy' }]),
    webPattern: 34,
  }),

  /** Reverse double-nudge: undoing steps, decrementing counts, unchecking prayers. */
  [HAPTIC_TYPES.UNDO]: Object.freeze({
    type: HAPTIC_TYPES.UNDO,
    category: 'undo',
    label: 'Undo',
    throttleMs: 20,
    nativeSteps: Object.freeze([
      { delayMs: 0, kind: 'impact', style: 'Light' },
      { delayMs: 44, kind: 'selection' },
    ]),
    webPattern: Object.freeze([14, 28, 7]),
  }),

  /**
   * Task Completion: crisp check-mark snap followed by a warm success settle.
   * Distinct from navigation's airy glide and badge unlocking's multi-beat crescendo.
   */
  [HAPTIC_TYPES.TASK_COMPLETE]: Object.freeze({
    type: HAPTIC_TYPES.TASK_COMPLETE,
    category: 'taskCompletion',
    label: 'Task Completion',
    throttleMs: 0,
    nativeSteps: Object.freeze([
      { delayMs: 0, kind: 'impact', style: 'Medium' },
      { delayMs: 62, kind: 'notification', notificationType: 'Success' },
    ]),
    webPattern: Object.freeze([16, 36, 30]),
  }),

  /** Warm general confirmation pulse: saving reflections, setting city, exporting backup. */
  [HAPTIC_TYPES.SUCCESS]: Object.freeze({
    type: HAPTIC_TYPES.SUCCESS,
    category: 'success',
    label: 'Confirmation',
    throttleMs: 0,
    nativeSteps: Object.freeze([{ delayMs: 0, kind: 'notification', notificationType: 'Success' }]),
    webPattern: Object.freeze([22, 34, 48]),
  }),

  /** Choreographed milestone cadence: completing 5/5 prayers, all daily intentions, Kashf unveiling. */
  [HAPTIC_TYPES.CELEBRATE]: Object.freeze({
    type: HAPTIC_TYPES.CELEBRATE,
    category: 'celebrate',
    label: 'Milestone Celebration',
    throttleMs: 0,
    nativeSteps: Object.freeze([
      { delayMs: 0, kind: 'impact', style: 'Heavy' },
      { delayMs: 85, kind: 'impact', style: 'Medium' },
      { delayMs: 175, kind: 'notification', notificationType: 'Success' },
    ]),
    webPattern: Object.freeze([32, 48, 22, 54, 60]),
  }),

  /**
   * Badge Unlock (Silver / Default): ascending 4-beat ceremonial medallion crescendo.
   * Builds Light → Medium → Heavy → Success notification for an unmistakable reward signature.
   */
  [HAPTIC_TYPES.BADGE_UNLOCK]: Object.freeze({
    type: HAPTIC_TYPES.BADGE_UNLOCK,
    category: 'badgeUnlock',
    label: 'Badge Unlock · Silver',
    throttleMs: 0,
    nativeSteps: Object.freeze([
      { delayMs: 0, kind: 'impact', style: 'Light' },
      { delayMs: 75, kind: 'impact', style: 'Medium' },
      { delayMs: 155, kind: 'impact', style: 'Heavy' },
      { delayMs: 250, kind: 'notification', notificationType: 'Success' },
    ]),
    webPattern: Object.freeze([14, 48, 24, 52, 38, 60, 56]),
  }),

  /**
   * Badge Unlock (Gold): luminous 5-beat ceremonial crest fanfare.
   */
  [HAPTIC_TYPES.BADGE_UNLOCK_GOLD]: Object.freeze({
    type: HAPTIC_TYPES.BADGE_UNLOCK_GOLD,
    category: 'badgeUnlock',
    label: 'Badge Unlock · Gold',
    throttleMs: 0,
    nativeSteps: Object.freeze([
      { delayMs: 0, kind: 'impact', style: 'Light' },
      { delayMs: 70, kind: 'impact', style: 'Medium' },
      { delayMs: 145, kind: 'impact', style: 'Heavy' },
      { delayMs: 215, kind: 'impact', style: 'Medium' },
      { delayMs: 300, kind: 'notification', notificationType: 'Success' },
    ]),
    webPattern: Object.freeze([14, 44, 24, 48, 40, 42, 22, 56, 62]),
  }),

  /**
   * Badge Unlock (Platinum): grand 6-beat sacred medallion resonance
   * culminating in a sustained Capacitor Haptics.vibrate bloom.
   */
  [HAPTIC_TYPES.BADGE_UNLOCK_PLATINUM]: Object.freeze({
    type: HAPTIC_TYPES.BADGE_UNLOCK_PLATINUM,
    category: 'badgeUnlock',
    label: 'Badge Unlock · Platinum',
    throttleMs: 0,
    nativeSteps: Object.freeze([
      { delayMs: 0, kind: 'impact', style: 'Light' },
      { delayMs: 65, kind: 'impact', style: 'Medium' },
      { delayMs: 135, kind: 'impact', style: 'Heavy' },
      { delayMs: 210, kind: 'impact', style: 'Heavy' },
      { delayMs: 305, kind: 'notification', notificationType: 'Success' },
      { delayMs: 405, kind: 'vibrate', durationMs: 55 },
    ]),
    webPattern: Object.freeze([14, 40, 26, 44, 42, 46, 44, 58, 68, 42, 55]),
  }),

  /** Caution double-pulse: arming destructive confirmations, Mute All, validation errors. */
  [HAPTIC_TYPES.WARNING]: Object.freeze({
    type: HAPTIC_TYPES.WARNING,
    category: 'warning',
    label: 'Warning',
    throttleMs: 0,
    nativeSteps: Object.freeze([{ delayMs: 0, kind: 'notification', notificationType: 'Warning' }]),
    webPattern: Object.freeze([24, 42, 24]),
  }),

  /** Firm confirmation signal: deleting habits/reminders, removing saved verses, confirming reset. */
  [HAPTIC_TYPES.DESTRUCTIVE]: Object.freeze({
    type: HAPTIC_TYPES.DESTRUCTIVE,
    category: 'destructive',
    label: 'Destructive',
    throttleMs: 0,
    nativeSteps: Object.freeze([{ delayMs: 0, kind: 'notification', notificationType: 'Error' }]),
    webPattern: Object.freeze([42, 32, 32]),
  }),
});

/**
 * Resolve the haptic specification for a given semantic button/interaction type.
 * Falls back gracefully to a light tap for unknown types.
 */
export function getHapticSpec(type) {
  return HAPTIC_SPECS[type] || HAPTIC_SPECS[HAPTIC_TYPES.TAP];
}

/**
 * Resolve toggle haptic type based on the next active boolean state.
 */
export function resolveToggleHapticType(isEnabling) {
  return isEnabling ? HAPTIC_TYPES.TOGGLE_ON : HAPTIC_TYPES.TOGGLE_OFF;
}

/**
 * Resolve the distinct badge-unlock haptic profile based on badge tier.
 */
export function resolveBadgeUnlockHapticType(tier = 'silver') {
  const normalized = typeof tier === 'string' ? tier.trim().toLowerCase() : '';
  if (normalized === 'platinum') return HAPTIC_TYPES.BADGE_UNLOCK_PLATINUM;
  if (normalized === 'gold') return HAPTIC_TYPES.BADGE_UNLOCK_GOLD;
  return HAPTIC_TYPES.BADGE_UNLOCK;
}

/**
 * Serialize a haptic profile's native Capacitor steps into a canonical signature string
 * for deterministic uniqueness verification.
 */
export function getNativeHapticSignature(spec) {
  return JSON.stringify(spec?.nativeSteps || []);
}

/**
 * Serialize a haptic profile's web vibration pattern into a canonical signature string.
 */
export function getWebHapticSignature(spec) {
  return JSON.stringify(spec?.webPattern ?? null);
}

/**
 * Prevent rapid motor flooding during continuous wheel detents or repeated taps.
 */
export function shouldThrottleHaptic(spec, lastFiredMs, nowMs) {
  if (!spec || !spec.throttleMs || spec.throttleMs <= 0) return false;
  if (typeof lastFiredMs !== 'number' || Number.isNaN(lastFiredMs)) return false;
  return nowMs - lastFiredMs < spec.throttleMs;
}
