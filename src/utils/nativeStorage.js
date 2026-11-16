import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

export const NATIVE_MIRRORED_KEYS = [
  'ruh_devotion_state',
  'ruh_location_v1',
  'ruh_prayer_method_v1',
  'ruh_theme_mode_v1',
];

function isNative() {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

/**
 * Persist a key synchronously to localStorage and asynchronously mirror it
 * to native iOS/Android Preferences so OS WebView storage sweeps never wipe progress.
 */
export function mirroredSet(key, valueStr) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(key, valueStr);
    } catch {
      // Ignore WebView quota errors
    }
  }
  if (isNative()) {
    Preferences.set({ key, value: String(valueStr) }).catch(() => {});
  }
}

export function mirroredRemove(key) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore
    }
  }
  if (isNative()) {
    Preferences.remove({ key }).catch(() => {});
  }
}

/**
 * On native mobile launch, check Preferences for keys that may have been evicted
 * from WKWebView localStorage. Returns an object of recovered { key: value } pairs.
 */
export async function hydrateMissingFromPreferences(keys = NATIVE_MIRRORED_KEYS) {
  if (!isNative() || typeof window === 'undefined') return {};
  const recovered = {};
  try {
    await Promise.all(
      keys.map(async (key) => {
        const currentLocal = localStorage.getItem(key);
        if (currentLocal !== null && currentLocal !== '') return;
        const res = await Preferences.get({ key });
        if (res?.value) {
          localStorage.setItem(key, res.value);
          recovered[key] = res.value;
        }
      })
    );
  } catch {
    // Graceful no-op if native storage is unavailable
  }
  return recovered;
}
