import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import {
  HAPTIC_TYPES,
  getHapticSpec,
  resolveToggleHapticType,
  shouldThrottleHaptic,
} from './hapticLogic';

let hapticsEnabled = true;
const lastFiredByType = new Map();

function isNative() {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
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
    if (step.kind === 'selection') {
      Haptics.selectionChanged().catch(() => {});
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
    }
  } catch {
    // Ignore on environments where Haptics plugin is unavailable
  }
}

function dispatchNativeSequence(steps) {
  if (!Array.isArray(steps) || steps.length === 0) return;
  for (const step of steps) {
    if (!step.delayMs || step.delayMs <= 0) {
      runNativeStep(step);
    } else {
      setTimeout(() => {
        if (hapticsEnabled) {
          runNativeStep(step);
        }
      }, step.delayMs);
    }
  }
}

export function setHapticsEnabled(enabled) {
  hapticsEnabled = enabled !== false;
}

export function getHapticsEnabled() {
  return hapticsEnabled;
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
            nativeSteps: spec.nativeSteps,
          },
        })
      );
    } catch {
      // Ignore CustomEvent failure in restricted contexts
    }
  }

  if (isNative()) {
    dispatchNativeSequence(spec.nativeSteps);
    return true;
  }

  webVibrate(spec.webPattern);
  return true;
}

/** Crisp horological detent tick: wheel scroll slots, segmented tabs, steppers, filter chips. */
export function hapticDetent() {
  return triggerHaptic(HAPTIC_TYPES.DETENT);
}

/** Feather-light glass tap: bead clicks, partial habit/prayer logs, share/copy, context inspect. */
export function hapticTapLight() {
  return triggerHaptic(HAPTIC_TYPES.TAP);
}

/** Grounded spatial transition pulse: switching views, opening sheets/modals, Maqamat stations. */
export function hapticNavigate() {
  return triggerHaptic(HAPTIC_TYPES.NAVIGATE);
}

/** Soft release click: closing drawers, dismissing alerts/modals. */
export function hapticDismiss() {
  return triggerHaptic(HAPTIC_TYPES.DISMISS);
}

/** Distinct tactile detent for Qibla alignment lock and medium actions. */
export function hapticTapMedium() {
  return triggerHaptic(HAPTIC_TYPES.NAVIGATE);
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

/** Warm completion pulse: hitting a habit/dhikr goal, saving reflections, Qada made up. */
export function hapticSuccess() {
  return triggerHaptic(HAPTIC_TYPES.SUCCESS);
}

/** Choreographed ceremonial cadence: completing 5/5 prayers, badge unlocks, Kashf unveiling. */
export function hapticCelebrate() {
  return triggerHaptic(HAPTIC_TYPES.CELEBRATE);
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
