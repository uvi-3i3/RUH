/**
 * Procedural Web Audio engine for Ruh's tactile UI acoustic cues.
 * - Unlocks AudioContext cleanly across mobile & desktop gestures (click, touchend, pointerdown, keydown).
 * - Synthesizes crisp, zero-latency acoustic cues with zero external MP3 fetches.
 */

import {
  TACTILE_AUDIO_CUES,
  computeCardFlipAudioPlan,
  resolveBadgeAudioCue,
  shouldThrottleAudioCue,
} from './tactileAudioLogic';

let tactileAudioEnabled = true;
let sharedCtx = null;
let sharedMasterGain = null;
let sharedPinkNoiseBuffer = null;

const VALID_CUES = new Set(Object.values(TACTILE_AUDIO_CUES));
const lastFiredByCue = new Map();

export function setTactileAudioEnabled(enabled) {
  tactileAudioEnabled = enabled !== false;
}

function getAudioEngine() {
  if (typeof window === 'undefined') return null;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;

  try {
    if (!sharedCtx || sharedCtx.state === 'closed') {
      sharedCtx = new AudioCtx();
      sharedMasterGain = sharedCtx.createGain();
      sharedMasterGain.gain.value = 0.95;
      sharedMasterGain.connect(sharedCtx.destination);
      sharedPinkNoiseBuffer = null;
    }

    if (!sharedPinkNoiseBuffer) {
      const length = Math.floor(sharedCtx.sampleRate * 0.5);
      const buffer = sharedCtx.createBuffer(1, length, sharedCtx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0;
      let b1 = 0;
      let b2 = 0;
      let b3 = 0;
      let b4 = 0;
      let b5 = 0;
      let b6 = 0;
      for (let i = 0; i < length; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.969 * b2 + white * 0.153852;
        b3 = 0.8665 * b3 + white * 0.3104856;
        b4 = 0.55 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.016898;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.055;
        b6 = white * 0.115926;
      }
      sharedPinkNoiseBuffer = buffer;
    }

    return {
      ctx: sharedCtx,
      master: sharedMasterGain,
      noiseBuffer: sharedPinkNoiseBuffer,
    };
  } catch {
    return null;
  }
}

function runWithRunningContext(engine, fn) {
  if (!engine || !engine.ctx) return;
  const { ctx } = engine;
  if (ctx.state === 'running') {
    try {
      fn(engine);
    } catch {
      // Ignore Web Audio scheduling errors
    }
    return;
  }
  if (ctx.state === 'suspended' && typeof ctx.resume === 'function') {
    ctx
      .resume()
      .then(() => {
        if (ctx.state === 'running') {
          try {
            fn(engine);
          } catch {
            // Ignore Web Audio scheduling errors
          }
        }
      })
      .catch(() => {});
  }
}

// Unlock AudioContext on first user gesture so subsequent cues fire immediately
if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
  const unlockHandler = () => {
    const engine = getAudioEngine();
    if (engine?.ctx?.state === 'suspended') {
      engine.ctx.resume().catch(() => {});
    }
    if (sharedCtx && sharedCtx.state === 'running') {
      window.removeEventListener('pointerdown', unlockHandler, true);
      window.removeEventListener('touchend', unlockHandler, true);
      window.removeEventListener('click', unlockHandler, true);
      window.removeEventListener('keydown', unlockHandler, true);
    }
  };
  window.addEventListener('pointerdown', unlockHandler, { capture: true, passive: true });
  window.addEventListener('touchend', unlockHandler, { capture: true, passive: true });
  window.addEventListener('click', unlockHandler, { capture: true, passive: true });
  window.addEventListener('keydown', unlockHandler, { capture: true, passive: true });
}

function emitAudioEvent(detail) {
  if (typeof window === 'undefined' || typeof window.dispatchEvent !== 'function') return;
  try {
    window.dispatchEvent(new CustomEvent('ruh:audio-cue', { detail }));
  } catch {
    // Ignore in restricted environments
  }
}

function playSynthesizedCue(engine, cueType, { playbackRate = 1.0, meta = {} } = {}) {
  const { ctx, master, noiseBuffer } = engine;
  const now = ctx.currentTime;

  if (cueType === TACTILE_AUDIO_CUES.PRAYER_TOGGLE) {
    // Soft warm wood/watch-bezel detent tick
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(620 * playbackRate, now);
    osc.frequency.exponentialRampToValueAtTime(210 * playbackRate, now + 0.03);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.038);
    osc.connect(gain);
    gain.connect(master);
    osc.start(now);
    osc.stop(now + 0.045);

    const clickSrc = ctx.createBufferSource();
    clickSrc.buffer = noiseBuffer;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(1750 * playbackRate, now);
    bp.Q.setValueAtTime(1.8, now);
    const clickGain = ctx.createGain();
    clickGain.gain.setValueAtTime(0.0001, now);
    clickGain.gain.linearRampToValueAtTime(0.09, now + 0.003);
    clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);
    clickSrc.connect(bp);
    bp.connect(clickGain);
    clickGain.connect(master);
    clickSrc.start(now);
    clickSrc.stop(now + 0.028);
    return;
  }

  if (cueType === TACTILE_AUDIO_CUES.PRAYER_TASK_TICKOFF) {
    // Gentle muted pop + soft rising harmonic confirmation
    const popOsc = ctx.createOscillator();
    const popGain = ctx.createGain();
    popOsc.type = 'sine';
    popOsc.frequency.setValueAtTime(320 * playbackRate, now);
    popOsc.frequency.exponentialRampToValueAtTime(590 * playbackRate, now + 0.046);
    popGain.gain.setValueAtTime(0.0001, now);
    popGain.gain.linearRampToValueAtTime(0.11, now + 0.006);
    popGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.085);
    popOsc.connect(popGain);
    popGain.connect(master);
    popOsc.start(now);
    popOsc.stop(now + 0.095);

    const chimeAt = now + 0.045;
    const chimeOsc = ctx.createOscillator();
    const chimeGain = ctx.createGain();
    chimeOsc.type = 'sine';
    chimeOsc.frequency.setValueAtTime(784 * playbackRate, chimeAt);
    chimeGain.gain.setValueAtTime(0.0001, chimeAt);
    chimeGain.gain.linearRampToValueAtTime(0.08, chimeAt + 0.014);
    chimeGain.gain.exponentialRampToValueAtTime(0.0001, chimeAt + 0.22);
    chimeOsc.connect(chimeGain);
    chimeGain.connect(master);
    chimeOsc.start(chimeAt);
    chimeOsc.stop(chimeAt + 0.24);
    return;
  }

  if (cueType === TACTILE_AUDIO_CUES.CARD_FLIP) {
    const plan = computeCardFlipAudioPlan({
      toFlipped: meta.direction !== 'to-front',
      finish: meta.finish || 'obsidian',
    });

    const liftOsc = ctx.createOscillator();
    const liftGain = ctx.createGain();
    liftOsc.type = 'triangle';
    liftOsc.frequency.setValueAtTime(plan.lift.startHz * 1.25, now);
    liftOsc.frequency.exponentialRampToValueAtTime(plan.lift.endHz, now + 0.045);
    liftGain.gain.setValueAtTime(0.0001, now);
    liftGain.gain.linearRampToValueAtTime(0.09, now + 0.005);
    liftGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
    liftOsc.connect(liftGain);
    liftGain.connect(master);
    liftOsc.start(now);
    liftOsc.stop(now + 0.058);

    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = noiseBuffer;
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.Q.setValueAtTime(1.5, now);
    bandpass.frequency.setValueAtTime(plan.brush.startHz, now);
    bandpass.frequency.exponentialRampToValueAtTime(plan.brush.peakHz, now + 0.09);
    bandpass.frequency.exponentialRampToValueAtTime(plan.brush.endHz, now + 0.21);
    const brushGain = ctx.createGain();
    brushGain.gain.setValueAtTime(0.0001, now);
    brushGain.gain.linearRampToValueAtTime(0.2, now + 0.038);
    brushGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
    noiseSrc.connect(bandpass);
    bandpass.connect(brushGain);
    brushGain.connect(master);
    noiseSrc.start(now);
    noiseSrc.stop(now + 0.24);

    const settleAt = now + 0.14;
    const settleOsc = ctx.createOscillator();
    const settleGain = ctx.createGain();
    settleOsc.type = 'sine';
    settleOsc.frequency.setValueAtTime(plan.settle.leadHz, settleAt);
    settleOsc.frequency.exponentialRampToValueAtTime(plan.settle.rootHz, settleAt + 0.05);
    settleGain.gain.setValueAtTime(0.0001, settleAt);
    settleGain.gain.linearRampToValueAtTime(0.07, settleAt + 0.012);
    settleGain.gain.exponentialRampToValueAtTime(0.0001, settleAt + 0.17);
    settleOsc.connect(settleGain);
    settleGain.connect(master);
    settleOsc.start(settleAt);
    settleOsc.stop(settleAt + 0.19);
    return;
  }

  // Tiered Bronze / Silver / Gold / Platinum harmonic chimes
  const chordByCue = {
    [TACTILE_AUDIO_CUES.BADGE_BRONZE]: [392.0, 493.88, 587.33],
    [TACTILE_AUDIO_CUES.BADGE_SILVER]: [440.0, 554.37, 659.25],
    [TACTILE_AUDIO_CUES.BADGE_GOLD]: [523.25, 659.25, 783.99, 1046.5],
    [TACTILE_AUDIO_CUES.BADGE_PLATINUM]: [587.33, 739.99, 880.0, 1174.66, 1479.98],
  };
  const notes = chordByCue[cueType] || chordByCue[TACTILE_AUDIO_CUES.BADGE_BRONZE];
  notes.forEach((freq, idx) => {
    const startAt = now + idx * 0.075;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = idx === 0 ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(freq, startAt);
    const peak = Math.max(0.06, 0.12 - idx * 0.015);
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.linearRampToValueAtTime(peak, startAt + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.72);
    osc.connect(gain);
    gain.connect(master);
    osc.start(startAt);
    osc.stop(startAt + 0.76);
  });
}

function playCue(cueType, { force = false, playbackRate = 1.0, meta = {} } = {}) {
  if (!tactileAudioEnabled && !force) return false;
  if (!VALID_CUES.has(cueType)) return false;

  const nowMs = Date.now();
  const lastFired = lastFiredByCue.get(cueType);
  if (!force && shouldThrottleAudioCue(cueType, lastFired, nowMs)) {
    return false;
  }
  lastFiredByCue.set(cueType, nowMs);

  const effectiveRate =
    typeof playbackRate === 'number' && Number.isFinite(playbackRate) ? playbackRate : 1.0;

  emitAudioEvent({
    cue: cueType,
    playbackRate: effectiveRate,
    source: 'web-audio',
    ...meta,
  });

  const engine = getAudioEngine();
  if (!engine) return true;

  runWithRunningContext(engine, (eng) => {
    playSynthesizedCue(eng, cueType, { playbackRate: effectiveRate, meta });
  });

  return true;
}

export function playCardFlipCue({ toFlipped = true, finish = 'obsidian', force = false } = {}) {
  return playCue(TACTILE_AUDIO_CUES.CARD_FLIP, {
    force,
    playbackRate: toFlipped ? 1.0 : 0.96,
    meta: {
      direction: toFlipped ? 'to-records' : 'to-front',
      finish,
    },
  });
}

export function playPrayerToggleCue({ direction = 1, force = false } = {}) {
  return playCue(TACTILE_AUDIO_CUES.PRAYER_TOGGLE, {
    force,
    playbackRate: direction >= 0 ? 1.0 : 0.96,
    meta: { direction: direction >= 0 ? 'next' : 'prev' },
  });
}

export function playTaskTickOffCue({ kind = 'prayer', force = false } = {}) {
  return playCue(TACTILE_AUDIO_CUES.PRAYER_TASK_TICKOFF, {
    force,
    playbackRate: kind === 'habit' ? 1.03 : 1.0,
    meta: { kind },
  });
}

export function playBadgeRevealCue(tier = 'bronze', { force = false } = {}) {
  const cueType = resolveBadgeAudioCue(tier);
  return playCue(cueType, {
    force,
    meta: { tier: String(tier || 'bronze').toLowerCase() },
  });
}

export { TACTILE_AUDIO_CUES };
