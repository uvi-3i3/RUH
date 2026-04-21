import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

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
    // StatusBar plugin may not be available on all platforms
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
