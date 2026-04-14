import { useState, useEffect, useMemo } from 'react';
import { TEMPORAL_PALETTES } from '../data/temporalPalettes';

// Keyframe timeline: [minutes_from_midnight, palette_index]
// Between keyframes of different palettes, the engine cross-fades.
// 0=fajr, 1=dhuhr, 2=asr, 3=maghrib, 4=isha
const STOPS = [
  [0,    4],   // 00:00 → deep night (isha)
  [240,  4],   // 04:00 → still isha
  [300,  0],   // 05:00 → fajr fully in (1hr transition from isha)
  [390,  0],   // 06:30 → fajr holding
  [720,  1],   // 12:00 → dhuhr fully in (5.5hr dawn→gold transition)
  [900,  1],   // 15:00 → dhuhr holding
  [960,  2],   // 16:00 → asr fully in (1hr transition)
  [1050, 2],   // 17:30 → asr holding
  [1110, 3],   // 18:30 → maghrib fully in (1hr transition)
  [1200, 3],   // 20:00 → maghrib holding
  [1260, 4],   // 21:00 → isha fully in (1hr transition)
  [1440, 4],   // 24:00 → wraps to midnight
];

function lerpVal(a, b, t) {
  return Math.round(a + (b - a) * t);
}

function lerpColor(a, b, t) {
  return { r: lerpVal(a.r, b.r, t), g: lerpVal(a.g, b.g, t), b: lerpVal(a.b, b.b, t) };
}

function lerpSide(a, b, t) {
  return {
    bg:        lerpColor(a.bg, b.bg, t),
    clouds:    a.clouds.map((c, i) => lerpColor(c, b.clouds[i], t)),
    orbCore:   lerpColor(a.orbCore, b.orbCore, t),
    orbGlow:   lerpColor(a.orbGlow, b.orbGlow, t),
    orbCorona: lerpColor(a.orbCorona, b.orbCorona, t),
    ember:     lerpColor(a.ember, b.ember, t),
    accent:    lerpColor(a.accent, b.accent, t),
  };
}

function blendPalettes(idxA, idxB, t) {
  const a = TEMPORAL_PALETTES[idxA];
  const b = TEMPORAL_PALETTES[idxB];
  return {
    name: t < 0.5 ? a.name : b.name,
    dark:  lerpSide(a.dark, b.dark, t),
    light: lerpSide(a.light, b.light, t),
  };
}

function getPaletteForMinute(minute) {
  for (let i = 0; i < STOPS.length - 1; i++) {
    const [mA, pA] = STOPS[i];
    const [mB, pB] = STOPS[i + 1];
    if (minute >= mA && minute < mB) {
      if (pA === pB) return TEMPORAL_PALETTES[pA];
      const t = (minute - mA) / (mB - mA);
      return blendPalettes(pA, pB, t);
    }
  }
  return TEMPORAL_PALETTES[4]; // fallback: isha
}

// Convert RGB object → hex string
export function rgbToHex(c) {
  return '#' + [c.r, c.g, c.b].map(x => Math.max(0, Math.min(255, x)).toString(16).padStart(2, '0')).join('');
}

export function useTemporalPhase(devOverride) {
  const [minuteOfDay, setMinuteOfDay] = useState(() => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  });

  useEffect(() => {
    if (devOverride !== null && devOverride !== undefined) return;
    const interval = setInterval(() => {
      const now = new Date();
      setMinuteOfDay(now.getHours() * 60 + now.getMinutes());
    }, 60000); // re-check every minute
    return () => clearInterval(interval);
  }, [devOverride]);

  const palette = useMemo(() => {
    if (devOverride !== null && devOverride !== undefined) {
      return TEMPORAL_PALETTES[devOverride];
    }
    return getPaletteForMinute(minuteOfDay);
  }, [minuteOfDay, devOverride]);

  return palette;
}
