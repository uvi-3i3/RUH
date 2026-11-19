/**
 * Procedural Web Audio synthesizer for Ruh's subtle tactile audio cues.
 * Zero external asset requests, zero-click smooth envelopes, single lazily-created AudioContext.
 */

import {
  TACTILE_AUDIO_CUES,
  computeCardFlipAudioPlan,
  computeCardRippleAudioPlan,
  shouldThrottleAudioCue,
} from './tactileAudioLogic';

let tactileAudioEnabled = true;
let sharedCtx = null;
let sharedMasterGain = null;
let sharedPinkNoiseBuffer = null;
const lastFiredByCue = new Map();

export function setTactileAudioEnabled(enabled) {
  tactileAudioEnabled = enabled !== false;
}

export function getTactileAudioEnabled() {
  return tactileAudioEnabled;
}

function getAudioEngine() {
  if (typeof window === 'undefined') return null;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;

  try {
    if (!sharedCtx || sharedCtx.state === 'closed') {
      sharedCtx = new AudioCtx();
      sharedMasterGain = sharedCtx.createGain();
      sharedMasterGain.gain.value = 0.9;
      sharedMasterGain.connect(sharedCtx.destination);
      sharedPinkNoiseBuffer = null;
    }

    if (sharedCtx.state === 'suspended') {
      sharedCtx.resume().catch(() => {});
    }

    if (!sharedPinkNoiseBuffer) {
      // Pre-bake 0.5s of warm Paul-Kellet pink-tilted noise once (no per-tap allocation)
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

function connectWithOptionalPan(ctx, node, master, panValue = 0) {
  if (typeof ctx.createStereoPanner === 'function' && panValue !== 0) {
    const panner = ctx.createStereoPanner();
    panner.pan.setValueAtTime(panValue, ctx.currentTime);
    node.connect(panner);
    panner.connect(master);
    return panner;
  }
  node.connect(master);
  return null;
}

function emitAudioEvent(detail) {
  if (typeof window === 'undefined' || typeof window.dispatchEvent !== 'function') return;
  try {
    window.dispatchEvent(new CustomEvent('ruh:audio-cue', { detail }));
  } catch {
    // Ignore in restricted environments
  }
}

/**
 * Play the silky archival parchment card-flip cue (lift transient + air sweep + velvet settle).
 */
export function playCardFlipCue({ toFlipped = true, finish = 'obsidian', force = false } = {}) {
  if (!tactileAudioEnabled && !force) return false;

  const nowMs = Date.now();
  const lastFired = lastFiredByCue.get(TACTILE_AUDIO_CUES.CARD_FLIP);
  if (!force && shouldThrottleAudioCue(TACTILE_AUDIO_CUES.CARD_FLIP, lastFired, nowMs)) {
    return false;
  }
  lastFiredByCue.set(TACTILE_AUDIO_CUES.CARD_FLIP, nowMs);

  const plan = computeCardFlipAudioPlan({ toFlipped, finish });
  emitAudioEvent({
    cue: plan.cue,
    direction: plan.direction,
    finish: plan.finish,
    rootHz: plan.settle.rootHz,
  });

  const engine = getAudioEngine();
  if (!engine) return true;

  try {
    const { ctx, master, noiseBuffer } = engine;
    const now = ctx.currentTime;

    // Layer 1: Micro card-edge lift transient (warm damped woody impulse)
    const liftOsc = ctx.createOscillator();
    const liftGain = ctx.createGain();
    liftOsc.type = 'triangle';
    liftOsc.frequency.setValueAtTime(plan.lift.startHz, now);
    liftOsc.frequency.exponentialRampToValueAtTime(plan.lift.endHz, now + plan.lift.durationSec);
    liftGain.gain.setValueAtTime(0.0001, now);
    liftGain.gain.linearRampToValueAtTime(plan.lift.peakGain, now + 0.005);
    liftGain.gain.exponentialRampToValueAtTime(0.0001, now + plan.lift.durationSec);
    liftOsc.connect(liftGain);
    liftGain.connect(master);
    liftOsc.start(now);
    liftOsc.stop(now + plan.lift.durationSec + 0.01);

    // Layer 2: Bandpass-swept pink noise (parchment turning through air)
    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = noiseBuffer;
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.Q.setValueAtTime(plan.brush.q, now);
    bandpass.frequency.setValueAtTime(plan.brush.startHz, now);
    bandpass.frequency.exponentialRampToValueAtTime(plan.brush.peakHz, now + plan.brush.peakTimeSec);
    bandpass.frequency.exponentialRampToValueAtTime(plan.brush.endHz, now + plan.brush.durationSec);

    const brushGain = ctx.createGain();
    brushGain.gain.setValueAtTime(0.0001, now);
    brushGain.gain.linearRampToValueAtTime(plan.brush.peakGain, now + plan.brush.attackSec);
    brushGain.gain.exponentialRampToValueAtTime(0.0001, now + plan.brush.durationSec);

    noiseSrc.connect(bandpass);
    bandpass.connect(brushGain);
    brushGain.connect(master);
    noiseSrc.start(now);
    noiseSrc.stop(now + plan.brush.durationSec + 0.02);

    // Layer 3: Velvet/brass harmonic settle synchronized with flip landing
    const settleAt = now + plan.settle.delaySec;
    const settleOsc = ctx.createOscillator();
    const settleGain = ctx.createGain();
    settleOsc.type = 'sine';
    settleOsc.frequency.setValueAtTime(plan.settle.leadHz, settleAt);
    settleOsc.frequency.exponentialRampToValueAtTime(plan.settle.rootHz, settleAt + 0.048);
    settleGain.gain.setValueAtTime(0.0001, settleAt);
    settleGain.gain.linearRampToValueAtTime(plan.settle.peakGain, settleAt + 0.012);
    settleGain.gain.exponentialRampToValueAtTime(0.0001, settleAt + plan.settle.durationSec);
    settleOsc.connect(settleGain);
    settleGain.connect(master);
    settleOsc.start(settleAt);
    settleOsc.stop(settleAt + plan.settle.durationSec + 0.02);

    // Delicate 2nd harmonic shimmer on landing
    const overtoneOsc = ctx.createOscillator();
    const overtoneGain = ctx.createGain();
    overtoneOsc.type = 'sine';
    overtoneOsc.frequency.setValueAtTime(plan.settle.overtoneHz, settleAt + 0.008);
    overtoneGain.gain.setValueAtTime(0.0001, settleAt + 0.008);
    overtoneGain.gain.linearRampToValueAtTime(plan.settle.overtoneGain, settleAt + 0.022);
    overtoneGain.gain.exponentialRampToValueAtTime(0.0001, settleAt + plan.settle.durationSec * 0.85);
    overtoneOsc.connect(overtoneGain);
    overtoneGain.connect(master);
    overtoneOsc.start(settleAt + 0.008);
    overtoneOsc.stop(settleAt + plan.settle.durationSec + 0.01);
  } catch {
    // Ignore audio scheduling errors in restricted browser modes
  }

  return true;
}

/**
 * Play the warm spatial glass/water ripple cue anchored to the exact pointer contact point.
 */
export function playCardRippleCue({ xPct = 50, yPct = 50, finish = 'obsidian', force = false } = {}) {
  if (!tactileAudioEnabled && !force) return false;

  const nowMs = Date.now();
  const lastFired = lastFiredByCue.get(TACTILE_AUDIO_CUES.CARD_RIPPLE);
  if (!force && shouldThrottleAudioCue(TACTILE_AUDIO_CUES.CARD_RIPPLE, lastFired, nowMs)) {
    return false;
  }
  lastFiredByCue.set(TACTILE_AUDIO_CUES.CARD_RIPPLE, nowMs);

  const plan = computeCardRippleAudioPlan({ xPct, yPct, finish });
  emitAudioEvent({
    cue: plan.cue,
    finish: plan.finish,
    pan: plan.pan,
    baseFreq: plan.baseFreq,
  });

  const engine = getAudioEngine();
  if (!engine) return true;

  try {
    const { ctx, master, noiseBuffer } = engine;
    const now = ctx.currentTime;

    // Layer 1: Micro finger-contact damp (soft lowpass noise pulse)
    const tapSrc = ctx.createBufferSource();
    tapSrc.buffer = noiseBuffer;
    const tapFilter = ctx.createBiquadFilter();
    tapFilter.type = 'lowpass';
    tapFilter.frequency.setValueAtTime(plan.touchTap.filterHz, now);
    const tapGain = ctx.createGain();
    tapGain.gain.setValueAtTime(0.0001, now);
    tapGain.gain.linearRampToValueAtTime(plan.touchTap.peakGain, now + 0.003);
    tapGain.gain.exponentialRampToValueAtTime(0.0001, now + plan.touchTap.durationSec);
    tapSrc.connect(tapFilter);
    tapFilter.connect(tapGain);
    connectWithOptionalPan(ctx, tapGain, master, plan.pan);
    tapSrc.start(now);
    tapSrc.stop(now + plan.touchTap.durationSec + 0.01);

    // Layer 2: Luminous droplet/glass core resonance (subtle upward micro-bend)
    const bodyOsc = ctx.createOscillator();
    const bodyGain = ctx.createGain();
    bodyOsc.type = 'sine';
    bodyOsc.frequency.setValueAtTime(plan.body.startHz, now);
    bodyOsc.frequency.exponentialRampToValueAtTime(plan.body.endHz, now + plan.body.bendSec);
    bodyGain.gain.setValueAtTime(0.0001, now);
    bodyGain.gain.linearRampToValueAtTime(plan.body.peakGain, now + plan.body.attackSec);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + plan.body.durationSec);
    bodyOsc.connect(bodyGain);
    connectWithOptionalPan(ctx, bodyGain, master, plan.pan);
    bodyOsc.start(now);
    bodyOsc.stop(now + plan.body.durationSec + 0.02);

    // Layer 3: Expanding harmonic shimmer overtone mirroring the radial CSS light ring
    const shimmerAt = now + plan.shimmer.delaySec;
    const shimmerOsc = ctx.createOscillator();
    const shimmerFilter = ctx.createBiquadFilter();
    shimmerFilter.type = 'lowpass';
    shimmerFilter.frequency.setValueAtTime(plan.shimmer.lowpassHz, shimmerAt);
    const shimmerGain = ctx.createGain();
    shimmerOsc.type = 'sine';
    shimmerOsc.frequency.setValueAtTime(plan.shimmer.freqHz, shimmerAt);
    shimmerGain.gain.setValueAtTime(0.0001, shimmerAt);
    shimmerGain.gain.linearRampToValueAtTime(plan.shimmer.peakGain, shimmerAt + 0.018);
    shimmerGain.gain.exponentialRampToValueAtTime(0.0001, shimmerAt + plan.shimmer.durationSec);
    shimmerOsc.connect(shimmerFilter);
    shimmerFilter.connect(shimmerGain);
    connectWithOptionalPan(ctx, shimmerGain, master, plan.pan);
    shimmerOsc.start(shimmerAt);
    shimmerOsc.stop(shimmerAt + plan.shimmer.durationSec + 0.02);
  } catch {
    // Ignore audio scheduling errors in restricted browser modes
  }

  return true;
}

export { TACTILE_AUDIO_CUES };
