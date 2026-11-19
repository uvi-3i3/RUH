/**
 * Pure user preferences parsing, serialization, and state helpers for Ruh.
 */

export const PREFERENCE_STORAGE_KEYS = {
  THEME_MODE: 'ruh_theme_mode_v1',
  ATMOSPHERE_PHASE: 'ruh_atmosphere_phase_v1',
  HAPTICS_ENABLED: 'ruh_haptics_enabled_v1',
  TACTILE_AUDIO_ENABLED: 'ruh_tactile_audio_enabled_v1',
  DEVOTION_STATE: 'ruh_devotion_state',
  LOCATION: 'ruh_location_v1',
  PRAYER_METHOD: 'ruh_prayer_method_v1',
};

export function parseThemeMode(raw) {
  return raw === 'light';
}

export function serializeThemeMode(isLightMode) {
  return isLightMode ? 'light' : 'dark';
}

export function parseHapticsEnabled(raw) {
  if (raw === 'false' || raw === false) return false;
  return true;
}

export function serializeHapticsEnabled(enabled) {
  return enabled === false ? 'false' : 'true';
}

export function parseTactileAudioEnabled(raw) {
  if (raw === 'false' || raw === false) return false;
  return true;
}

export function serializeTactileAudioEnabled(enabled) {
  return enabled === false ? 'false' : 'true';
}

export function parseAtmospherePhase(raw) {
  if (raw === null || raw === undefined || raw === '') return null;
  const num = Number(raw);
  return Number.isInteger(num) && num >= 0 && num <= 4 ? num : null;
}

export function serializeAtmospherePhase(phase) {
  if (phase === null || phase === undefined || phase === '') return null;
  const num = Number(phase);
  return Number.isInteger(num) && num >= 0 && num <= 4 ? String(num) : null;
}

export function computeHabitCompletionSummary(habits = [], dailyHabitLogs = {}) {
  if (!Array.isArray(habits) || habits.length === 0) {
    return { completedHabitsCount: 0, totalHabitsCount: 0 };
  }
  const counts = dailyHabitLogs && typeof dailyHabitLogs === 'object' ? dailyHabitLogs : {};
  let completedHabitsCount = 0;
  for (const habit of habits) {
    if (!habit || !habit.id) continue;
    const target = Math.max(1, Number(habit.target) || 1);
    const current = Math.max(0, Number(counts[habit.id]) || 0);
    if (current >= target) {
      completedHabitsCount += 1;
    }
  }
  return {
    completedHabitsCount,
    totalHabitsCount: habits.length,
  };
}
