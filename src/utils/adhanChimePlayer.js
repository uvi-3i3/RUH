/**
 * Authentic Adhan Audio & Gentle Chime Player for Ruh (رُوح).
 *
 * - Plays bundled offline-ready vocal Adhan MP3 recordings (Makkah, Madinah, Mishary Al-Afasy,
 *   plus dedicated Fajr Adhan) via HTMLAudioElement with smooth fade-out and instant cancellation.
 * - Falls back gracefully to Web Audio contemplative chimes (Hijaz Chime, Dawn Ney, Sanctuary Bell)
 *   for chime profiles or if audio decoding is unavailable.
 */
import { buildAdhanChimeSequence, resolveAdhanAudioTrack } from './adhanChimeLogic';

let chimeCtx = null;
let breathBuffer = null;
let activeSession = null;
let sessionSeq = 0;

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

function fadeOutAndStopHtmlAudio(audioEl) {
  if (!audioEl) return;
  try {
    const startVol = Math.max(0, Math.min(1, Number(audioEl.volume) || 0.8));
    if (audioEl.paused || startVol <= 0.02) {
      audioEl.pause();
      audioEl.currentTime = 0;
      return;
    }
    const steps = 6;
    let step = 0;
    const timer = setInterval(() => {
      step += 1;
      try {
        if (step >= steps) {
          clearInterval(timer);
          audioEl.volume = 0;
          audioEl.pause();
          audioEl.currentTime = 0;
        } else {
          audioEl.volume = Math.max(0, startVol * (1 - step / steps));
        }
      } catch {
        clearInterval(timer);
      }
    }, 28);
  } catch {
    try {
      audioEl.pause();
      audioEl.currentTime = 0;
    } catch {}
  }
}

export function stopAdhanChime({ invokeOnEnd = true } = {}) {
  sessionSeq += 1;
  if (!activeSession) return;
  const session = activeSession;
  activeSession = null;

  if (session.endTimer) {
    clearTimeout(session.endTimer);
  }

  if (session.kind === 'audio' && session.audioEl) {
    session.audioEl.onended = null;
    session.audioEl.onerror = null;
    fadeOutAndStopHtmlAudio(session.audioEl);
    if (invokeOnEnd) session.onEnd?.();
    return;
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
    } else if (Array.isArray(nodes)) {
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
  if (invokeOnEnd) session.onEnd?.();
}

export function isAdhanChimePlaying() {
  return Boolean(activeSession);
}

function playSynthesizedChime(profileId, { prayerId, leadMinutes, isPreview, onEnd, token }) {
  const plan = buildAdhanChimeSequence(profileId, { prayerId, leadMinutes, isPreview });
  if (plan.profileId === 'silent' || plan.notes.length === 0) {
    onEnd?.();
    return { played: false, mode: 'silent', plan };
  }

  emitChimeEvent({
    mode: 'chime',
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
    return { played: true, mode: 'chime', plan };
  }

  const scheduleNotes = () => {
    if (token !== sessionSeq) return;
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
        kind: 'chime',
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
        if (token === sessionSeq && engine.ctx.state === 'running') {
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

  return { played: true, mode: 'chime', plan };
}

/**
 * Play the selected Adhan voice recording or gentle chime.
 * Always stops any previously playing Adhan first so previews never overlap.
 */
export function playAdhanChime(
  profileId,
  { prayerId = 'maghrib', leadMinutes = 0, isPreview = false, onEnd } = {}
) {
  stopAdhanChime({ invokeOnEnd: false });
  const token = sessionSeq;

  const track = resolveAdhanAudioTrack(profileId, { prayerId, leadMinutes, isPreview });
  if (track.mode === 'silent') {
    emitChimeEvent({
      mode: 'silent',
      profileId: 'silent',
      prayerId,
      leadMinutes: Number(leadMinutes) || 0,
      isPreview: Boolean(isPreview),
      muted: true,
    });
    onEnd?.();
    return { played: false, mode: 'silent', track };
  }

  if (track.mode === 'audio' && track.audioUrl && typeof Audio !== 'undefined') {
    try {
      const audioEl = new Audio(track.audioUrl);
      audioEl.preload = 'auto';
      audioEl.volume = track.volume;

      const finish = () => {
        if (activeSession?.audioEl === audioEl) {
          activeSession = null;
          onEnd?.();
        }
      };

      audioEl.onended = finish;
      audioEl.onerror = () => {
        if (token !== sessionSeq) return;
        if (activeSession?.audioEl === audioEl) {
          activeSession = null;
        }
        // Fallback smoothly to warm Maqam Hijaz chime if audio asset fails to decode
        if (track.fallbackChimeProfileId) {
          playSynthesizedChime(track.fallbackChimeProfileId, {
            prayerId,
            leadMinutes,
            isPreview,
            onEnd,
            token,
          });
        } else {
          onEnd?.();
        }
      };

      activeSession = {
        kind: 'audio',
        audioEl,
        onEnd,
      };

      emitChimeEvent({
        mode: 'audio',
        profileId: track.profileId,
        audioUrl: track.audioUrl,
        isFajrVariant: track.isFajrVariant,
        prayerId,
        leadMinutes: track.leadMinutes,
        isPreview: Boolean(isPreview),
        muted: false,
      });

      const playPromise = audioEl.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          if (token !== sessionSeq) return;
          if (activeSession?.audioEl === audioEl) {
            activeSession = null;
          }
          if (track.fallbackChimeProfileId) {
            playSynthesizedChime(track.fallbackChimeProfileId, {
              prayerId,
              leadMinutes,
              isPreview,
              onEnd,
              token,
            });
          } else {
            onEnd?.();
          }
        });
      }

      return { played: true, mode: 'audio', track };
    } catch {
      // Fall through cleanly to synthesized chime
    }
  }

  return playSynthesizedChime(track.fallbackChimeProfileId || profileId, {
    prayerId,
    leadMinutes,
    isPreview,
    onEnd,
    token,
  });
}
