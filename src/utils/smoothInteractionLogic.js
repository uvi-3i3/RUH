/**
 * Pure interaction & frame-pacing utilities that keep Ruh smooth across
 * 60Hz / 120Hz / 144Hz displays and touch scroll gestures.
 */

/**
 * Normalize an animation frame delta (in milliseconds) to a 60fps-equivalent step multiplier.
 * Clamps extreme spikes (e.g. tab returning from background) and ignores negative/NaN deltas.
 */
export function computeDeltaScale(deltaMs, targetFps = 60, maxScale = 2.5) {
  if (typeof deltaMs !== 'number' || !Number.isFinite(deltaMs) || deltaMs <= 0) {
    return 1;
  }
  const frameBudgetMs = 1000 / Math.max(1, targetFps);
  const rawScale = deltaMs / frameBudgetMs;
  return Math.max(0.2, Math.min(maxScale, rawScale));
}

/**
 * Returns true if pointer movement exceeds the tap/scroll deadzone threshold.
 * Prevents vertical touch scrolling on mobile lists from accidentally counting as taps.
 */
export function isPointerDrag(startX, startY, currentX, currentY, thresholdPx = 10) {
  if (
    !Number.isFinite(startX) ||
    !Number.isFinite(startY) ||
    !Number.isFinite(currentX) ||
    !Number.isFinite(currentY)
  ) {
    return false;
  }
  const dx = currentX - startX;
  const dy = currentY - startY;
  return Math.hypot(dx, dy) > thresholdPx;
}

/**
 * Normalize a compass heading to integer degrees [0, 359] and report whether
 * the rounded heading actually changed from the previous state.
 */
export function normalizeCompassHeading(rawHeading, prevHeading = null) {
  if (typeof rawHeading !== 'number' || !Number.isFinite(rawHeading)) {
    return { heading: prevHeading, changed: false };
  }
  const wrapped = ((Math.round(rawHeading) % 360) + 360) % 360;
  return {
    heading: wrapped,
    changed: wrapped !== prevHeading,
  };
}

/**
 * Given the ordered prayers array, the prayer just completed, and the updated completed IDs,
 * returns the index of the next uncompleted prayer after the current one, or -1 if none remain.
 */
export function resolveNextPrayerFocusIndex(prayers, currentPrayerId, completedIds) {
  if (!Array.isArray(prayers) || prayers.length === 0) return -1;
  const currentIdx = prayers.findIndex((p) => p?.id === currentPrayerId);
  if (currentIdx < 0) return -1;
  const completedSet = new Set(Array.isArray(completedIds) ? completedIds : []);
  return prayers.findIndex((p, idx) => idx > currentIdx && !completedSet.has(p.id));
}
