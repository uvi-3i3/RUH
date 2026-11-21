import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import {
  HAPTIC_TYPES,
  getHapticSpec,
  resolveBadgeUnlockHapticType,
  resolveToggleHapticType,
  shouldThrottleHaptic,
} from './hapticLogic';

let hapticsEnabled = true;
const lastFiredByType = new Map();
const pendingStepTimers = new Set();

function isNative() {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

function clearPendingSequenceTimers() {
  for (const timerId of pendingStepTimers) {
    clearTimeout(timerId);
  }
  pendingStepTimers.clear();
}

function webVibrate(pattern) {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(pattern);
    }
  } catch {
    // Ignore on browsers without vibration permission
  }
}

function runNativeStep(step) {
  try {
    if (step.kind === 'selectionStart') {
      Haptics.selectionStart().catch(() => {});
      return;
    }
    if (step.kind === 'selection' || step.kind === 'selectionChanged') {
      Haptics.selectionChanged().catch(() => {});
      return;
    }
    if (step.kind === 'selectionEnd') {
      Haptics.selectionEnd().catch(() => {});
      return;
    }
    if (step.kind === 'impact') {
      const style = ImpactStyle[step.style] || ImpactStyle.Light;
      Haptics.impact({ style }).catch(() => {});
      return;
    }
    if (step.kind === 'notification') {
      const type = NotificationType[step.notificationType] || NotificationType.Success;
      Haptics.notification({ type }).catch(() => {});
      return;
    }
    if (step.kind === 'vibrate') {
      const duration = Math.max(15, Math.min(300, Number(step.durationMs) || 40));
      Haptics.vibrate({ duration }).catch(() => {});
    }
  } catch {
    // Ignore on environments where Haptics plugin is unavailable
  }
}

function dispatchNativeSequence(steps, { force = false } = {}) {
  if (!Array.isArray(steps) || steps.length === 0) return;
  for (const step of steps) {
    if (!step.delayMs || step.delayMs <= 0) {
      runNativeStep(step);
    } else {
      const timerId = setTimeout(() => {
        pendingStepTimers.delete(timerId);
        if (hapticsEnabled || force) {
          runNativeStep(step);
        }
      }, step.delayMs);
      pendingStepTimers.add(timerId);
    }
  }
}

export function setHapticsEnabled(enabled) {
  hapticsEnabled = enabled !== false;
  if (!hapticsEnabled) {
    clearPendingSequenceTimers();
  }
}

/**
 * Core tactile dispatcher using @capacitor/haptics on native iOS/Android
 * and timed Vibration API patterns on supported mobile browsers.
 */
export function triggerHaptic(type, options = {}) {
  const { force = false } = options;
  if (!hapticsEnabled && !force) return false;

  const spec = getHapticSpec(type);
  const now = Date.now();
  const lastFired = lastFiredByType.get(spec.type);
  if (shouldThrottleHaptic(spec, lastFired, now)) {
    return false;
  }
  lastFiredByType.set(spec.type, now);

  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    try {
      window.dispatchEvent(
        new CustomEvent('ruh:haptic', {
          detail: {
            type: spec.type,
            category: spec.category,
            label: spec.label,
            nativeSteps: spec.nativeSteps,
            webPattern: spec.webPattern,
          },
        })
      );
    } catch {
      // Ignore CustomEvent failure in restricted contexts
    }
  }

  if (isNative()) {
    dispatchNativeSequence(spec.nativeSteps, { force });
    return true;
  }

  webVibrate(spec.webPattern);
  return true;
}

/** Crisp horological detent tick: wheel scroll slots, segmented tabs, steppers, filter chips. */
export function hapticDetent() {
  return triggerHaptic(HAPTIC_TYPES.DETENT);
}

/** Feather-light glass tap: bead clicks, partial habit steps, share/copy, context inspect. */
export function hapticTapLight() {
  return triggerHaptic(HAPTIC_TYPES.TAP);
}

/** Smooth threshold glide: switching views, opening sheets/worlds, Maqamat stations, card flips. */
export function hapticNavigate() {
  return triggerHaptic(HAPTIC_TYPES.NAVIGATE);
}

/** Semantic alias for navigation transitions. */
export function hapticNavigationTransition() {
  return triggerHaptic(HAPTIC_TYPES.NAVIGATE);
}

/** Soft release click: closing drawers, dismissing alerts/modals. */
export function hapticDismiss() {
  return triggerHaptic(HAPTIC_TYPES.DISMISS);
}

/** Distinct medium physical detent for Qibla alignment lock and focused triggers. */
export function hapticTapMedium() {
  return triggerHaptic(HAPTIC_TYPES.MEDIUM_TAP);
}

/** Deep physical thud: Qada long-press, Misbaha hold-launch, +1 Year bulk action. */
export function hapticHeavy() {
  return triggerHaptic(HAPTIC_TYPES.HEAVY);
}

/** Asymmetric switch snap: firmer dual pulse on ON, lighter release on OFF. */
export function hapticToggle(isEnabling = true) {
  return triggerHaptic(resolveToggleHapticType(Boolean(isEnabling)));
}

/** Reverse double-nudge: undoing steps, decrementing counts, unchecking prayers. */
export function hapticUndo() {
  return triggerHaptic(HAPTIC_TYPES.UNDO);
}

/** Crisp check-off snap + warm settle: completing a prayer, habit, dhikr target, Qada, or daily intention. */
export function hapticTaskComplete(options = {}) {
  return triggerHaptic(HAPTIC_TYPES.TASK_COMPLETE, options);
}

/** Warm general confirmation pulse: saving reflections, setting city, exporting backup. */
export function hapticSuccess() {
  return triggerHaptic(HAPTIC_TYPES.SUCCESS);
}

/** Choreographed milestone cadence: completing 5/5 prayers, all daily intentions, Kashf unveiling. */
export function hapticCelebrate() {
  return triggerHaptic(HAPTIC_TYPES.CELEBRATE);
}

/** Ceremonial ascending medallion crescendo scaled by badge tier (silver / gold / platinum). */
export function hapticBadgeUnlock(tier = 'silver', options = {}) {
  return triggerHaptic(resolveBadgeUnlockHapticType(tier), options);
}

/** Caution double-pulse: arming destructive confirmations, Mute All, validation errors. */
export function hapticWarning() {
  return triggerHaptic(HAPTIC_TYPES.WARNING);
}

/** Firm confirmation signal: deleting habits/reminders, removing saved verses, confirming reset. */
export function hapticDestructive() {
  return triggerHaptic(HAPTIC_TYPES.DESTRUCTIVE);
}

export { HAPTIC_TYPES };
