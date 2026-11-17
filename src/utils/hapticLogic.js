/**
 * Pure tactile haptic profile definitions, timing choreography, and throttling logic.
 * Maps distinct UI control categories to specialized Capacitor Haptics impact,
 * selection, and notification signatures.
 */

export const HAPTIC_TYPES = Object.freeze({
  DETENT: 'detent',
  TAP: 'tap',
  TOGGLE_ON: 'toggleOn',
  TOGGLE_OFF: 'toggleOff',
  NAVIGATE: 'navigate',
  DISMISS: 'dismiss',
  HEAVY: 'heavy',
  UNDO: 'undo',
  SUCCESS: 'success',
  CELEBRATE: 'celebrate',
  WARNING: 'warning',
  DESTRUCTIVE: 'destructive',
});

export const HAPTIC_SPECS = Object.freeze({
  [HAPTIC_TYPES.DETENT]: Object.freeze({
    type: HAPTIC_TYPES.DETENT,
    category: 'detent',
    throttleMs: 28,
    nativeSteps: Object.freeze([{ delayMs: 0, kind: 'selection' }]),
    webPattern: 7,
  }),
  [HAPTIC_TYPES.TAP]: Object.freeze({
    type: HAPTIC_TYPES.TAP,
    category: 'tap',
    throttleMs: 18,
    nativeSteps: Object.freeze([{ delayMs: 0, kind: 'impact', style: 'Light' }]),
    webPattern: 12,
  }),
  [HAPTIC_TYPES.TOGGLE_ON]: Object.freeze({
    type: HAPTIC_TYPES.TOGGLE_ON,
    category: 'toggle',
    throttleMs: 0,
    nativeSteps: Object.freeze([
      { delayMs: 0, kind: 'impact', style: 'Light' },
      { delayMs: 42, kind: 'impact', style: 'Medium' },
    ]),
    webPattern: Object.freeze([10, 26, 18]),
  }),
  [HAPTIC_TYPES.TOGGLE_OFF]: Object.freeze({
    type: HAPTIC_TYPES.TOGGLE_OFF,
    category: 'toggle',
    throttleMs: 0,
    nativeSteps: Object.freeze([
      { delayMs: 0, kind: 'impact', style: 'Light' },
      { delayMs: 36, kind: 'selection' },
    ]),
    webPattern: Object.freeze([12, 24, 6]),
  }),
  [HAPTIC_TYPES.NAVIGATE]: Object.freeze({
    type: HAPTIC_TYPES.NAVIGATE,
    category: 'navigate',
    throttleMs: 24,
    nativeSteps: Object.freeze([{ delayMs: 0, kind: 'impact', style: 'Medium' }]),
    webPattern: 18,
  }),
  [HAPTIC_TYPES.DISMISS]: Object.freeze({
    type: HAPTIC_TYPES.DISMISS,
    category: 'dismiss',
    throttleMs: 24,
    nativeSteps: Object.freeze([{ delayMs: 0, kind: 'impact', style: 'Light' }]),
    webPattern: 8,
  }),
  [HAPTIC_TYPES.HEAVY]: Object.freeze({
    type: HAPTIC_TYPES.HEAVY,
    category: 'heavy',
    throttleMs: 0,
    nativeSteps: Object.freeze([{ delayMs: 0, kind: 'impact', style: 'Heavy' }]),
    webPattern: 34,
  }),
  [HAPTIC_TYPES.UNDO]: Object.freeze({
    type: HAPTIC_TYPES.UNDO,
    category: 'undo',
    throttleMs: 20,
    nativeSteps: Object.freeze([
      { delayMs: 0, kind: 'impact', style: 'Light' },
      { delayMs: 44, kind: 'selection' },
    ]),
    webPattern: Object.freeze([14, 28, 7]),
  }),
  [HAPTIC_TYPES.SUCCESS]: Object.freeze({
    type: HAPTIC_TYPES.SUCCESS,
    category: 'success',
    throttleMs: 0,
    nativeSteps: Object.freeze([{ delayMs: 0, kind: 'notification', notificationType: 'Success' }]),
    webPattern: Object.freeze([22, 34, 48]),
  }),
  [HAPTIC_TYPES.CELEBRATE]: Object.freeze({
    type: HAPTIC_TYPES.CELEBRATE,
    category: 'celebrate',
    throttleMs: 0,
    nativeSteps: Object.freeze([
      { delayMs: 0, kind: 'impact', style: 'Heavy' },
      { delayMs: 85, kind: 'impact', style: 'Medium' },
      { delayMs: 175, kind: 'notification', notificationType: 'Success' },
    ]),
    webPattern: Object.freeze([32, 48, 22, 54, 60]),
  }),
  [HAPTIC_TYPES.WARNING]: Object.freeze({
    type: HAPTIC_TYPES.WARNING,
    category: 'warning',
    throttleMs: 0,
    nativeSteps: Object.freeze([{ delayMs: 0, kind: 'notification', notificationType: 'Warning' }]),
    webPattern: Object.freeze([24, 42, 24]),
  }),
  [HAPTIC_TYPES.DESTRUCTIVE]: Object.freeze({
    type: HAPTIC_TYPES.DESTRUCTIVE,
    category: 'destructive',
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
 * Prevent rapid motor flooding during continuous wheel detents or repeated taps.
 */
export function shouldThrottleHaptic(spec, lastFiredMs, nowMs) {
  if (!spec || !spec.throttleMs || spec.throttleMs <= 0) return false;
  if (typeof lastFiredMs !== 'number' || Number.isNaN(lastFiredMs)) return false;
  return nowMs - lastFiredMs < spec.throttleMs;
}
