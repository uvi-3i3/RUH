import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { App as CapApp } from '@capacitor/app';

/**
 * Initialize native platform features.
 * Called once at app boot. Safe to call on web — all calls are no-ops when not on a native platform.
 */
export async function initNativePlatform() {
  if (!Capacitor.isNativePlatform()) return;

  try {
    // Transparent, overlaid status bar so our gradient bleeds edge-to-edge
    await StatusBar.setOverlaysWebView({ overlay: true });
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#00000000' });
  } catch (e) {
    console.warn('[Ruh] StatusBar init skipped:', e);
  }

  try {
    // Hide the native splash once React has mounted
    await SplashScreen.hide({ fadeOutDuration: 500 });
  } catch (e) {
    console.warn('[Ruh] SplashScreen hide skipped:', e);
  }
}

/**
 * Keep status bar icon contrast synchronized with Daylight vs Midnight Sanctuary theme.
 */
export async function syncStatusBarTheme(isLightMode) {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await StatusBar.setStyle({ style: isLightMode ? Style.Light : Style.Dark });
  } catch {
    // Ignore on platforms where StatusBar style changes are restricted
  }
}

/**
 * Register Android hardware back button handling and foreground resume hooks.
 * Returns a cleanup callback suitable for useEffect.
 */
export function registerNativeLifecycle({ onBackButton, onForeground } = {}) {
  if (!Capacitor.isNativePlatform()) return () => {};

  const handles = [];
  let active = true;

  CapApp.addListener('backButton', () => {
    const handled = onBackButton?.();
    if (!handled) {
      CapApp.exitApp().catch(() => {});
    }
  })
    .then((h) => {
      if (active) handles.push(h);
      else h.remove().catch(() => {});
    })
    .catch(() => {});

  CapApp.addListener('appStateChange', ({ isActive }) => {
    if (isActive) {
      onForeground?.();
    }
  })
    .then((h) => {
      if (active) handles.push(h);
      else h.remove().catch(() => {});
    })
    .catch(() => {});

  return () => {
    active = false;
    handles.forEach((h) => h.remove?.().catch(() => {}));
  };
}

/**
 * Check if we are running inside a native container.
 */
export function isNative() {
  return Capacitor.isNativePlatform();
}

/**
 * Get the current platform: 'ios', 'android', or 'web'.
 */
export function getPlatform() {
  return Capacitor.getPlatform();
}
