/**
 * Pure Gentle Adhan Chime profile synthesis plans & solar reminder sync helpers for Ruh.
 *
 * Zero browser/DOM globals — fully testable under node:test.
 */
import { formatDateToHHMM, NATIVE_PRAYER_IDS } from './notificationLogic';

export const DEFAULT_ADHAN_CHIME_PROFILE = 'hijaz_whisper';

export const ADHAN_CHIME_PROFILES = [
  {
    id: 'hijaz_whisper',
    label: 'Hijaz Adhan',
    arabic: 'حجازي',
    description: 'Soft Maqam Hijaz contemplative call',
  },
  {
    id: 'fajr_ney',
    label: 'Dawn Ney',
    arabic: 'ناي الفجر',
    description: 'Airy reed flute breath motif',
  },
  {
    id: 'sanctuary_bell',
    label: 'Sanctuary Bell',
    arabic: 'رنين هادئ',
    description: 'Warm harmonic singing-bowl fifths',
  },
  {
    id: 'silent',
    label: 'Silent',
    arabic: 'صامت',
    description: 'Visual banner & haptic only',
  },
];

const VALID_PROFILE_IDS = new Set(ADHAN_CHIME_PROFILES.map((p) => p.id));

export function isValidAdhanChimeProfile(profileId) {
  return typeof profileId === 'string' && VALID_PROFILE_IDS.has(profileId);
}

/**
 * Normalize profile ID while staying backward-compatible with legacy boolean `notificationChime`.
 */
export function normalizeAdhanChimeProfile(profileId, legacyChimeEnabled = true) {
  if (isValidAdhanChimeProfile(profileId)) return profileId;
  if (legacyChimeEnabled === false) return 'silent';
  return DEFAULT_ADHAN_CHIME_PROFILE;
}

export function getAdhanChimeProfileMeta(profileId) {
  const safeId = normalizeAdhanChimeProfile(profileId);
  return ADHAN_CHIME_PROFILES.find((p) => p.id === safeId) || ADHAN_CHIME_PROFILES[0];
}

/**
 * Build a deterministic, serene Web Audio note plan for the selected gentle Adhan chime profile.
 * - Adapts softly for Fajr & Isha (warmer low-pass filter, ~18% lower peak gain).
 * - Uses a shorter, lighter preparatory whisper when `leadMinutes > 0`.
 * - Uses the full contemplative phrase when `leadMinutes === 0` (at Adhan).
 */
export function buildAdhanChimeSequence(
  profileId,
  { prayerId = 'maghrib', leadMinutes = 0, isPreview = false } = {}
) {
  const safeProfile = normalizeAdhanChimeProfile(profileId);
  if (safeProfile === 'silent') {
    return {
      profileId: 'silent',
      prayerId,
      leadMinutes: Math.max(0, Number(leadMinutes) || 0),
      isPreview: Boolean(isPreview),
      totalDurationSec: 0,
      filterCutoffHz: 1200,
      notes: [],
    };
  }

  const safeLead = Math.max(0, Number(leadMinutes) || 0);
  const isQuietHour = prayerId === 'fajr' || prayerId === 'isha';
  const gainScale = isQuietHour ? 0.82 : 1.0;
  const filterScale = isQuietHour ? 0.85 : 1.0;

  let notes = [];
  let baseFilterCutoffHz = 1650;

  if (safeProfile === 'hijaz_whisper') {
    // Maqam Hijaz rooted on D4 (293.66 Hz): D4 - Eb4 - F#4 - G4 - F#4 - Eb4 - D4
    baseFilterCutoffHz = 1550;
    const rawPhrase =
      safeLead > 0
        ? [
            // Gentle 3-note preparatory whisper (D4 -> F#4 -> G4)
            { freqHz: 293.66, startSec: 0.0, durationSec: 0.82, peakGain: 0.068, attackSec: 0.06 },
            { freqHz: 369.99, startSec: 0.44, durationSec: 0.88, peakGain: 0.074, attackSec: 0.065 },
            { freqHz: 392.0, startSec: 0.92, durationSec: 1.25, peakGain: 0.065, attackSec: 0.08 },
          ]
        : [
            // Full contemplative gentle Hijaz Adhan cadence
            { freqHz: 293.66, startSec: 0.0, durationSec: 0.95, peakGain: 0.072, attackSec: 0.065 },
            { freqHz: 311.13, startSec: 0.48, durationSec: 0.72, peakGain: 0.064, attackSec: 0.055 },
            { freqHz: 369.99, startSec: 0.92, durationSec: 0.96, peakGain: 0.08, attackSec: 0.07 },
            { freqHz: 392.0, startSec: 1.46, durationSec: 1.15, peakGain: 0.084, attackSec: 0.075 },
            { freqHz: 369.99, startSec: 2.1, durationSec: 0.85, peakGain: 0.066, attackSec: 0.06 },
            { freqHz: 293.66, startSec: 2.6, durationSec: 1.45, peakGain: 0.062, attackSec: 0.09 },
          ];

    notes = rawPhrase.map((n) => ({
      ...n,
      peakGain: Number((n.peakGain * gainScale).toFixed(4)),
      waveform: 'triangle',
      overtoneRatio: 2.0,
      overtoneGain: 0.24,
      breathGain: 0,
    }));
  } else if (safeProfile === 'fajr_ney') {
    // Airy contemplative Ney reed motif (A4 -> Bb4 -> C5 -> A4 -> G4 -> A4)
    baseFilterCutoffHz = 1350;
    const rawPhrase =
      safeLead > 0
        ? [
            { freqHz: 440.0, startSec: 0.0, durationSec: 0.95, peakGain: 0.058, attackSec: 0.14 },
            { freqHz: 523.25, startSec: 0.62, durationSec: 1.15, peakGain: 0.062, attackSec: 0.15 },
            { freqHz: 440.0, startSec: 1.32, durationSec: 1.25, peakGain: 0.052, attackSec: 0.16 },
          ]
        : [
            { freqHz: 440.0, startSec: 0.0, durationSec: 1.05, peakGain: 0.06, attackSec: 0.15 },
            { freqHz: 466.16, startSec: 0.62, durationSec: 0.82, peakGain: 0.056, attackSec: 0.13 },
            { freqHz: 523.25, startSec: 1.15, durationSec: 1.15, peakGain: 0.066, attackSec: 0.16 },
            { freqHz: 440.0, startSec: 1.92, durationSec: 1.05, peakGain: 0.058, attackSec: 0.14 },
            { freqHz: 392.0, startSec: 2.55, durationSec: 1.45, peakGain: 0.054, attackSec: 0.17 },
          ];

    notes = rawPhrase.map((n) => ({
      ...n,
      peakGain: Number((n.peakGain * gainScale).toFixed(4)),
      waveform: 'sine',
      overtoneRatio: 3.0,
      overtoneGain: 0.1,
      breathGain: Number((0.022 * gainScale).toFixed(4)),
    }));
  } else {
    // 'sanctuary_bell': Warm hand-struck harmonic singing-bowl fifths (432 Hz / 648 Hz / 864 Hz)
    baseFilterCutoffHz = 1850;
    const rawPhrase =
      safeLead > 0
        ? [
            { freqHz: 432.0, startSec: 0.0, durationSec: 1.55, peakGain: 0.066, attackSec: 0.025 },
            { freqHz: 648.0, startSec: 0.42, durationSec: 1.65, peakGain: 0.052, attackSec: 0.03 },
          ]
        : [
            { freqHz: 432.0, startSec: 0.0, durationSec: 1.85, peakGain: 0.072, attackSec: 0.024 },
            { freqHz: 648.0, startSec: 0.48, durationSec: 1.9, peakGain: 0.056, attackSec: 0.028 },
            { freqHz: 864.0, startSec: 1.04, durationSec: 2.05, peakGain: 0.042, attackSec: 0.032 },
            { freqHz: 540.0, startSec: 1.68, durationSec: 2.1, peakGain: 0.054, attackSec: 0.035 },
          ];

    notes = rawPhrase.map((n) => ({
      ...n,
      peakGain: Number((n.peakGain * gainScale).toFixed(4)),
      waveform: 'sine',
      overtoneRatio: 2.756, // warm singing-bowl partial
      overtoneGain: 0.14,
      breathGain: 0,
    }));
  }

  const totalDurationSec = Number(
    notes.reduce((maxEnd, n) => Math.max(maxEnd, n.startSec + n.durationSec), 0).toFixed(3)
  );

  return {
    profileId: safeProfile,
    prayerId,
    leadMinutes: safeLead,
    isPreview: Boolean(isPreview),
    totalDurationSec,
    filterCutoffHz: Math.round(baseFilterCutoffHz * filterScale),
    notes,
  };
}

/**
 * Compare current stored prayer reminder times against live calculated solar prayer times
 * and return a minimal patch if any prayer HH:MM differs. Preserves user enable/disable states.
 */
export function computeSolarReminderSyncPatch({ currentPrayers = {}, solarTimes = null } = {}) {
  if (!solarTimes || typeof solarTimes !== 'object') {
    return { hasChanges: false, nextTimesHHMM: {} };
  }

  const nextTimesHHMM = {};
  let hasChanges = false;

  for (const id of NATIVE_PRAYER_IDS) {
    const dt = solarTimes[id];
    if (!(dt instanceof Date) || Number.isNaN(dt.getTime())) continue;
    const hhmm = formatDateToHHMM(dt);
    if (!hhmm) continue;
    nextTimesHHMM[id] = hhmm;
    if (currentPrayers?.[id]?.time !== hhmm) {
      hasChanges = true;
    }
  }

  return { hasChanges, nextTimesHHMM };
}
