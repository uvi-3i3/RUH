/**
 * Pure acoustic parameter synthesis & pacing logic for Ruh's tactile audio cues.
 * Decoupled from Web Audio API runtime for deterministic unit testing and archival tuning.
 */

export const TACTILE_AUDIO_CUES = {
  CARD_FLIP: 'card-flip',
  PRAYER_TOGGLE: 'prayer-toggle',
  PRAYER_TASK_TICKOFF: 'prayer-task-tickoff',
  BADGE_BRONZE: 'badge-bronze',
  BADGE_SILVER: 'badge-silver',
  BADGE_GOLD: 'badge-gold',
  BADGE_PLATINUM: 'badge-platinum',
};

export const MATERIAL_AUDIO_PROFILES = {
  obsidian: {
    id: 'obsidian',
    pitchMultiplier: 1.03,
    filterScale: 1.08,
    damping: 0.96,
  },
  emerald: {
    id: 'emerald',
    pitchMultiplier: 0.96,
    filterScale: 0.94,
    damping: 1.06,
  },
  parchment: {
    id: 'parchment',
    pitchMultiplier: 1.0,
    filterScale: 1.04,
    damping: 1.0,
  },
};

const CUE_COOLDOWN_MS = {
  [TACTILE_AUDIO_CUES.CARD_FLIP]: 140,
  [TACTILE_AUDIO_CUES.PRAYER_TOGGLE]: 45,
  [TACTILE_AUDIO_CUES.PRAYER_TASK_TICKOFF]: 70,
  [TACTILE_AUDIO_CUES.BADGE_BRONZE]: 220,
  [TACTILE_AUDIO_CUES.BADGE_SILVER]: 220,
  [TACTILE_AUDIO_CUES.BADGE_GOLD]: 220,
  [TACTILE_AUDIO_CUES.BADGE_PLATINUM]: 220,
};

export function resolveMaterialAudioProfile(finish = 'obsidian') {
  if (finish && MATERIAL_AUDIO_PROFILES[finish]) {
    return MATERIAL_AUDIO_PROFILES[finish];
  }
  return MATERIAL_AUDIO_PROFILES.obsidian;
}

export function resolveBadgeAudioCue(tier = 'bronze') {
  const normalized = String(tier || '').trim().toLowerCase();
  if (normalized === 'platinum') return TACTILE_AUDIO_CUES.BADGE_PLATINUM;
  if (normalized === 'gold') return TACTILE_AUDIO_CUES.BADGE_GOLD;
  if (normalized === 'silver') return TACTILE_AUDIO_CUES.BADGE_SILVER;
  return TACTILE_AUDIO_CUES.BADGE_BRONZE;
}

export function shouldThrottleAudioCue(cueType, lastFiredMs, nowMs) {
  const cooldown = CUE_COOLDOWN_MS[cueType] ?? 60;
  if (typeof lastFiredMs !== 'number' || !Number.isFinite(lastFiredMs)) {
    return false;
  }
  const elapsed = (Number(nowMs) || 0) - lastFiredMs;
  return elapsed >= 0 && elapsed < cooldown;
}

/**
 * Compute layered Web Audio synthesis parameters for the 3D Sanctuary Pass card flip.
 * Combines:
 *  - Layer 1: Micro lift-off wooden/cardboard impulse
 *  - Layer 2: Bandpass-swept pink noise (parchment air turn across the 180° arc)
 *  - Layer 3: Soft velvet/brass harmonic settle synchronized with flip deceleration
 */
export function computeCardFlipAudioPlan({ toFlipped = true, finish = 'obsidian' } = {}) {
  const profile = resolveMaterialAudioProfile(finish);
  const direction = toFlipped ? 'to-records' : 'to-front';
  const pm = profile.pitchMultiplier;
  const fs = profile.filterScale;
  const damp = profile.damping;

  const brushStartHz = Math.round((toFlipped ? 580 : 700) * fs);
  const brushPeakHz = Math.round((toFlipped ? 1520 : 1340) * fs);
  const brushEndHz = Math.round((toFlipped ? 640 : 480) * fs);

  const settleRootHz = Math.round((toFlipped ? 293.66 : 220.0) * pm * 100) / 100;
  const settleLeadHz = Math.round((toFlipped ? 220.0 : 261.63) * pm * 100) / 100;

  return {
    cue: TACTILE_AUDIO_CUES.CARD_FLIP,
    direction,
    finish: profile.id,
    durationSec: Number((0.34 * damp).toFixed(3)),
    lift: {
      startHz: Math.round(156 * pm),
      endHz: Math.round(86 * pm),
      durationSec: 0.042,
      peakGain: 0.024,
    },
    brush: {
      startHz: brushStartHz,
      peakHz: brushPeakHz,
      endHz: brushEndHz,
      q: profile.id === 'parchment' ? 1.45 : 1.75,
      attackSec: 0.055,
      peakTimeSec: 0.115,
      durationSec: Number((0.24 * damp).toFixed(3)),
      peakGain: profile.id === 'parchment' ? 0.034 : 0.028,
    },
    settle: {
      delaySec: 0.165,
      leadHz: settleLeadHz,
      rootHz: settleRootHz,
      overtoneHz: Math.round(settleRootHz * 2 * 100) / 100,
      durationSec: Number((0.14 * damp).toFixed(3)),
      peakGain: 0.017,
      overtoneGain: 0.0055,
    },
  };
}
