import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

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

/**
 * Subtle physical click for bead taps, prayer checkoffs, and habit increments.
 */
export function hapticTapLight() {
  if (isNative()) {
    Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
    return;
  }
  webVibrate(12);
}

/**
 * Distinct tactile detent for long-press actions (Qada, Misbaha launch) and Qibla lock-on.
 */
export function hapticTapMedium() {
  if (isNative()) {
    Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {});
    return;
  }
  webVibrate(26);
}

/**
 * Warm completion pulse for finishing a tasbih round, full prayer day, or habit goal.
 */
export function hapticSuccess() {
  if (isNative()) {
    Haptics.notification({ type: NotificationType.Success }).catch(() => {});
    return;
  }
  webVibrate([40, 28, 55]);
}
