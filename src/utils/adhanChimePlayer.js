/**
 * Web Audio Gentle Adhan Chime Player for Ruh.
 *
 * Synthesizes warm, contemplative sanctuary chimes (Hijaz Adhan, Dawn Ney, Sanctuary Bell)
 * with low-pass warmth, gentle envelopes, zero external audio file fetches, and clean
 * cancellation for instant non-overlapping previewing.
 */
import { buildAdhanChimeSequence } from './adhanChimeLogic';

let chimeCtx = null;
let breathBuffer = null;
let activeSession = null;

function getChimeAudioContext() {
  if (typeof window === 'undefined') return null;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  try {
    if (!chimeCtx || chimeCtx.state === 'closed') {
      chimeCtx = new AudioCtx();
      breathBuffer = null;
    }
    if (!breathBuffer) {
      const length = Math.floor(chimeCtx.sampleRate * 1.5);
      const buffer = chimeCtx.createBuffer(1, length, chimeCtx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0;
      let b1 = 0;
      let b2 = 0;
      for (let i = 0; i < length; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.997 * b0 + white * 0.029;
        b1 = 0.985 * b1 + white * 0.032;
        b2 = 0.95 * b2 + white * 0.048;
        data[i] = (b0 + b1 + b2) * 0.14;
      }
      breathBuffer = buffer;
    }
    return { ctx: chimeCtx, breathBuffer };
  } catch {
    return null;
  }
}

function emitChimeEvent(detail) {
  if (typeof window === 'undefined' || typeof window.dispatchEvent !== 'function') return;
  try {
    window.dispatchEvent(new CustomEvent('ruh:adhan-chime', { detail }));
  } catch {
    // Ignore in restricted environments
  }
}

export function stopAdhanChime() {
  if (!activeSession) return;
  const session = activeSession;
  activeSession = null;
  if (session.endTimer) {
    clearTimeout(session.endTimer);
  }
  try {
    const { ctx, sessionGain, nodes } = session;
    if (ctx && ctx.state === 'running' && sessionGain) {
      const now = ctx.currentTime;
      sessionGain.gain.cancelScheduledValues(now);
      sessionGain.gain.setValueAtTime(Math.max(0.0001, sessionGain.gain.value || 0.8), now);
      sessionGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
      setTimeout(() => {
        nodes.forEach((n) => {
          try {
            n.stop?.();
            n.disconnect?.();
          } catch {}
        });
      }, 120);
    } else {
      nodes.forEach((n) => {
        try {
          n.stop?.();
          n.disconnect?.();
        } catch {}
      });
    }
  } catch {
    // Ignore audio stop errors
  }
  session.onEnd?.();
}

export function isAdhanChimePlaying() {
  return Boolean(activeSession);
}

/**
 * Play a gentle synthesized Adhan chime for the selected profile.
 * Always stops any previously playing chime first so previews never collide.
 */
export function playAdhanChime(
  profileId,
  { prayerId = 'maghrib', leadMinutes = 0, isPreview = false, onEnd } = {}
) {
  stopAdhanChime();

  const plan = buildAdhanChimeSequence(profileId, { prayerId, leadMinutes, isPreview });
  if (plan.profileId === 'silent' || plan.notes.length === 0) {
    emitChimeEvent({
      profileId: 'silent',
      prayerId,
      leadMinutes: plan.leadMinutes,
      noteCount: 0,
      durationSec: 0,
      isPreview: Boolean(isPreview),
      muted: true,
    });
    onEnd?.();
    return { played: false, plan };
  }

  emitChimeEvent({
    profileId: plan.profileId,
    prayerId: plan.prayerId,
    leadMinutes: plan.leadMinutes,
    noteCount: plan.notes.length,
    durationSec: plan.totalDurationSec,
    isPreview: Boolean(isPreview),
    muted: false,
  });

  const engine = getChimeAudioContext();
  if (!engine) {
    onEnd?.();
    return { played: true, plan };
  }

  const scheduleNotes = () => {
    try {
      const { ctx, breathBuffer: noiseBuf } = engine;
      const now = ctx.currentTime + 0.02;

      const sessionGain = ctx.createGain();
      sessionGain.gain.setValueAtTime(0.95, now);

      const lowpass = ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.setValueAtTime(plan.filterCutoffHz, now);
      lowpass.Q.setValueAtTime(0.7, now);

      sessionGain.connect(lowpass);
      lowpass.connect(ctx.destination);

      const nodes = [];

      for (const note of plan.notes) {
        const startAt = now + note.startSec;
        const endAt = startAt + note.durationSec;

        // Primary warm voice
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = note.waveform || 'sine';
        osc.frequency.setValueAtTime(note.freqHz, startAt);

        gain.gain.setValueAtTime(0.0001, startAt);
        gain.gain.linearRampToValueAtTime(note.peakGain, startAt + note.attackSec);
        gain.gain.exponentialRampToValueAtTime(0.0001, endAt);

        osc.connect(gain);
        gain.connect(sessionGain);
        osc.start(startAt);
        osc.stop(endAt + 0.04);
        nodes.push(osc);

        // Subtle warm harmonic overtone shimmer
        if (note.overtoneRatio && note.overtoneGain > 0) {
          const overOsc = ctx.createOscillator();
          const overGain = ctx.createGain();
          overOsc.type = 'sine';
          overOsc.frequency.setValueAtTime(note.freqHz * note.overtoneRatio, startAt);

          const overPeak = Math.max(0.0002, note.peakGain * note.overtoneGain);
          overGain.gain.setValueAtTime(0.0001, startAt);
          overGain.gain.linearRampToValueAtTime(overPeak, startAt + note.attackSec * 1.15);
          overGain.gain.exponentialRampToValueAtTime(0.0001, startAt + note.durationSec * 0.85);

          overOsc.connect(overGain);
          overGain.connect(sessionGain);
          overOsc.start(startAt);
          overOsc.stop(endAt + 0.04);
          nodes.push(overOsc);
        }

        // Delicate airy reed breath texture for Dawn Ney
        if (note.breathGain > 0 && noiseBuf) {
          const src = ctx.createBufferSource();
          src.buffer = noiseBuf;
          src.loop = true;

          const bp = ctx.createBiquadFilter();
          bp.type = 'bandpass';
          bp.frequency.setValueAtTime(note.freqHz * 2.1, startAt);
          bp.Q.setValueAtTime(3.2, startAt);

          const bGain = ctx.createGain();
          bGain.gain.setValueAtTime(0.0001, startAt);
          bGain.gain.linearRampToValueAtTime(note.breathGain, startAt + note.attackSec);
          bGain.gain.exponentialRampToValueAtTime(0.0001, endAt);

          src.connect(bp);
          bp.connect(bGain);
          bGain.connect(sessionGain);
          src.start(startAt);
          src.stop(endAt + 0.04);
          nodes.push(src);
        }
      }

      const endTimer = setTimeout(() => {
        if (activeSession?.endTimer === endTimer) {
          activeSession = null;
          onEnd?.();
        }
      }, Math.ceil((plan.totalDurationSec + 0.12) * 1000));

      activeSession = {
        ctx,
        sessionGain,
        nodes,
        endTimer,
        onEnd,
      };
    } catch {
      onEnd?.();
    }
  };

  if (engine.ctx.state === 'running') {
    scheduleNotes();
  } else if (engine.ctx.state === 'suspended' && typeof engine.ctx.resume === 'function') {
    engine.ctx
      .resume()
      .then(() => {
        if (engine.ctx.state === 'running') {
          scheduleNotes();
        } else {
          onEnd?.();
        }
      })
      .catch(() => {
        onEnd?.();
      });
  } else {
    onEnd?.();
  }

  return { played: true, plan };
}
