/**
 * Pure acoustic parameter synthesis & pacing logic for Ruh's tactile audio cues.
 * Decoupled from Web Audio API runtime for deterministic unit testing and archival tuning.
 */

export const TACTILE_AUDIO_CUES = {
  CARD_FLIP: 'card-flip',
  CARD_RIPPLE: 'card-ripple',
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
  [TACTILE_AUDIO_CUES.CARD_RIPPLE]: 65,
};

function clamp(val, min, max) {
  if (typeof val !== 'number' || !Number.isFinite(val)) return min;
  return Math.max(min, Math.min(max, val));
}

export function resolveMaterialAudioProfile(finish = 'obsidian') {
  if (finish && MATERIAL_AUDIO_PROFILES[finish]) {
    return MATERIAL_AUDIO_PROFILES[finish];
  }
  return MATERIAL_AUDIO_PROFILES.obsidian;
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

/**
 * Compute spatial Web Audio synthesis parameters for the luminous press ripple on the card.
 * Maps pointer position (xPct, yPct) to subtle archival pentatonic resonance and gentle stereo pan.
 */
export function computeCardRippleAudioPlan({ xPct = 50, yPct = 50, finish = 'obsidian' } = {}) {
  const profile = resolveMaterialAudioProfile(finish);
  const nx = clamp(typeof xPct === 'number' && Number.isFinite(xPct) ? xPct : 50, 0, 100) / 100;
  const ny = clamp(typeof yPct === 'number' && Number.isFinite(yPct) ? yPct : 50, 0, 100) / 100;

  // Higher taps and rightward taps gently brighten the glass/water droplet resonance
  const spatialScalar = nx * 0.45 + (1 - ny) * 0.55;
  const rawBaseHz = 415 + spatialScalar * 125;
  const baseFreq = Math.round(rawBaseHz * profile.pitchMultiplier * 100) / 100;

  // Subtle stereo positioning (-0.34 left to +0.34 right)
  const pan = Number(((nx - 0.5) * 0.68).toFixed(3));

  return {
    cue: TACTILE_AUDIO_CUES.CARD_RIPPLE,
    finish: profile.id,
    pan,
    baseFreq,
    durationSec: Number((0.26 * profile.damping).toFixed(3)),
    body: {
      startHz: Math.round(baseFreq * 0.94 * 100) / 100,
      endHz: Math.round(baseFreq * 1.05 * 100) / 100,
      bendSec: 0.055,
      attackSec: 0.006,
      durationSec: Number((0.19 * profile.damping).toFixed(3)),
      peakGain: 0.024,
    },
    shimmer: {
      delaySec: 0.012,
      freqHz: Math.round(baseFreq * 2.0 * 100) / 100,
      lowpassHz: Math.round(2550 * profile.filterScale),
      durationSec: Number((0.23 * profile.damping).toFixed(3)),
      peakGain: 0.0075,
    },
    touchTap: {
      filterHz: Math.round(920 * profile.filterScale),
      durationSec: 0.02,
      peakGain: 0.012,
    },
  };
}
