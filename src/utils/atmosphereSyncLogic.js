/**
 * Pure Real Prayer-Time Atmosphere Sync logic for Ruh.
 *
 * Maps live calculated solar prayer times (Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha)
 * — or fallback prayer schedules when no city/GPS location is selected — into smoothly
 * interpolated color palettes and sky atmosphere visuals across the day.
 */
import { TEMPORAL_PALETTES } from '../data/temporalPalettes';

export const PHASE_IDS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

export const ATMOSPHERE_PHASE_META = [
  {
    index: 0,
    id: 'fajr',
    shortLabel: 'Fajr',
    label: 'Fajr · Dawn',
    arabic: 'الفجر',
    descriptor: 'Ethereal Dawn',
  },
  {
    index: 1,
    id: 'dhuhr',
    shortLabel: 'Dhuhr',
    label: 'Dhuhr · Zenith',
    arabic: 'الظهر',
    descriptor: 'Midday Radiance',
  },
  {
    index: 2,
    id: 'asr',
    shortLabel: 'Asr',
    label: 'Asr · Amber',
    arabic: 'العصر',
    descriptor: 'Golden Amber',
  },
  {
    index: 3,
    id: 'maghrib',
    shortLabel: 'Maghrib',
    label: 'Maghrib · Dusk',
    arabic: 'المغرب',
    descriptor: 'Twilight Dusk',
  },
  {
    index: 4,
    id: 'isha',
    shortLabel: 'Isha',
    label: 'Isha · Night',
    arabic: 'العشاء',
    descriptor: 'Velvet Stillness',
  },
];

// Canonical fallback solar anchors (minutes from midnight) when no location or custom times exist
const DEFAULT_ANCHOR_MINUTES = {
  fajr: 300, // 05:00
  sunrise: 380, // 06:20
  dhuhr: 750, // 12:30
  asr: 960, // 16:00
  maghrib: 1110, // 18:30
  isha: 1215, // 20:15
};

/**
 * Contemplative sky atmosphere parameters per prayer phase for both Night and Daylight modes.
 * Colors are RGB objects so transitions between consecutive solar prayer windows cross-fade smoothly.
 */
export const PHASE_SKY_PRESETS = [
  // 0: FAJR — Pre-dawn sapphire & silver horizon blush
  {
    darkSky: [
      { r: 8, g: 15, b: 30 },
      { r: 16, g: 29, b: 54 },
      { r: 30, g: 50, b: 84 },
      { r: 62, g: 82, b: 118 },
    ],
    darkHorizonGlow: { r: 158, g: 184, b: 224, a: 0.24 },
    darkCloudTint: { r: 120, g: 156, b: 205, a: 0.16 },
    starOpacity: 0.72,
    lightWashTop: { r: 196, g: 214, b: 238, a: 0.34 },
    lightWashMid: { r: 226, g: 234, b: 246, a: 0.22 },
    lightHorizonGlow: { r: 242, g: 214, b: 204, a: 0.28 },
    lightCloudFilter: { saturate: 0.92, brightness: 0.98, contrast: 1.0 },
  },
  // 1: DHUHR — Clear serene sky with warm sunlit parchment radiance
  {
    darkSky: [
      { r: 8, g: 16, b: 29 },
      { r: 13, g: 25, b: 44 },
      { r: 22, g: 38, b: 62 },
      { r: 36, g: 54, b: 78 },
    ],
    darkHorizonGlow: { r: 212, g: 174, b: 102, a: 0.16 },
    darkCloudTint: { r: 196, g: 172, b: 126, a: 0.1 },
    starOpacity: 0.26,
    lightWashTop: { r: 228, g: 238, b: 248, a: 0.14 },
    lightWashMid: { r: 248, g: 244, b: 235, a: 0.16 },
    lightHorizonGlow: { r: 246, g: 222, b: 168, a: 0.22 },
    lightCloudFilter: { saturate: 1.02, brightness: 1.01, contrast: 1.0 },
  },
  // 2: ASR — Warm afternoon honey-amber golden hour
  {
    darkSky: [
      { r: 13, g: 13, b: 24 },
      { r: 24, g: 20, b: 34 },
      { r: 46, g: 32, b: 38 },
      { r: 78, g: 48, b: 34 },
    ],
    darkHorizonGlow: { r: 228, g: 148, b: 64, a: 0.28 },
    darkCloudTint: { r: 216, g: 138, b: 62, a: 0.18 },
    starOpacity: 0.34,
    lightWashTop: { r: 240, g: 224, b: 198, a: 0.24 },
    lightWashMid: { r: 248, g: 232, b: 204, a: 0.28 },
    lightHorizonGlow: { r: 236, g: 174, b: 96, a: 0.34 },
    lightCloudFilter: { saturate: 1.08, brightness: 0.99, contrast: 1.02 },
  },
  // 3: MAGHRIB — Dusky plum-violet twilight & copper-rose sunset horizon
  {
    darkSky: [
      { r: 10, g: 9, b: 24 },
      { r: 22, g: 16, b: 44 },
      { r: 46, g: 26, b: 62 },
      { r: 84, g: 44, b: 68 },
    ],
    darkHorizonGlow: { r: 206, g: 112, b: 134, a: 0.28 },
    darkCloudTint: { r: 158, g: 96, b: 178, a: 0.2 },
    starOpacity: 0.62,
    lightWashTop: { r: 218, g: 204, b: 234, a: 0.32 },
    lightWashMid: { r: 238, g: 218, b: 228, a: 0.28 },
    lightHorizonGlow: { r: 230, g: 158, b: 166, a: 0.34 },
    lightCloudFilter: { saturate: 0.96, brightness: 0.95, contrast: 1.02 },
  },
  // 4: ISHA — Deep starry midnight obsidian
  {
    darkSky: [
      { r: 6, g: 10, b: 21 },
      { r: 9, g: 17, b: 33 },
      { r: 14, g: 27, b: 48 },
      { r: 19, g: 36, b: 60 },
    ],
    darkHorizonGlow: { r: 136, g: 162, b: 204, a: 0.14 },
    darkCloudTint: { r: 78, g: 104, b: 146, a: 0.1 },
    starOpacity: 0.98,
    lightWashTop: { r: 204, g: 212, b: 228, a: 0.34 },
    lightWashMid: { r: 226, g: 230, b: 238, a: 0.26 },
    lightHorizonGlow: { r: 194, g: 204, b: 224, a: 0.22 },
    lightCloudFilter: { saturate: 0.84, brightness: 0.94, contrast: 1.0 },
  },
];

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function lerpNum(a, b, t) {
  return a + (b - a) * t;
}

function lerpRound(a, b, t) {
  return Math.round(a + (b - a) * t);
}

function lerpRgb(a, b, t) {
  return {
    r: lerpRound(a.r, b.r, t),
    g: lerpRound(a.g, b.g, t),
    b: lerpRound(a.b, b.b, t),
  };
}

function lerpRgba(a, b, t) {
  return {
    r: lerpRound(a.r, b.r, t),
    g: lerpRound(a.g, b.g, t),
    b: lerpRound(a.b, b.b, t),
    a: Number(lerpNum(a.a, b.a, t).toFixed(3)),
  };
}

function rgbStr(c) {
  return `rgb(${c.r}, ${c.g}, ${c.b})`;
}

function rgbaStr(c, alphaMultiplier = 1) {
  const alpha = clamp(c.a * alphaMultiplier, 0, 1).toFixed(3);
  return `rgba(${c.r}, ${c.g}, ${c.b}, ${alpha})`;
}

function dateToMinuteOfDay(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null;
  return date.getHours() * 60 + date.getMinutes() + date.getSeconds() / 60;
}

function hhmmToMinuteOfDay(timeStr) {
  if (typeof timeStr !== 'string') return null;
  const m = /^(\d{1,2}):(\d{2})$/.exec(timeStr.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  return h * 60 + min;
}

function lerpPaletteSide(a, b, t) {
  return {
    bg: lerpRgb(a.bg, b.bg, t),
    clouds: a.clouds.map((c, i) => lerpRgb(c, b.clouds[i], t)),
    orbCore: lerpRgb(a.orbCore, b.orbCore, t),
    orbGlow: lerpRgb(a.orbGlow, b.orbGlow, t),
    orbCorona: lerpRgb(a.orbCorona, b.orbCorona, t),
    ember: lerpRgb(a.ember, b.ember, t),
    accent: lerpRgb(a.accent, b.accent, t),
  };
}

export function blendTemporalPalettes(idxA, idxB, t) {
  const a = TEMPORAL_PALETTES[idxA] || TEMPORAL_PALETTES[4];
  const b = TEMPORAL_PALETTES[idxB] || TEMPORAL_PALETTES[4];
  const clampedT = clamp(t, 0, 1);
  if (idxA === idxB || clampedT <= 0.001) return a;
  if (clampedT >= 0.999) return b;
  return {
    name: clampedT < 0.5 ? a.name : b.name,
    dark: lerpPaletteSide(a.dark, b.dark, clampedT),
    light: lerpPaletteSide(a.light, b.light, clampedT),
  };
}

export function buildInterpolatedSkyVisuals(idxA, idxB, t = 0) {
  const a = PHASE_SKY_PRESETS[idxA] || PHASE_SKY_PRESETS[4];
  const b = PHASE_SKY_PRESETS[idxB] || PHASE_SKY_PRESETS[4];
  const clampedT = clamp(t, 0, 1);

  const darkSky = a.darkSky.map((stop, i) => lerpRgb(stop, b.darkSky[i], clampedT));
  const darkHorizonGlow = lerpRgba(a.darkHorizonGlow, b.darkHorizonGlow, clampedT);
  const darkCloudTint = lerpRgba(a.darkCloudTint, b.darkCloudTint, clampedT);
  const starOpacity = Number(lerpNum(a.starOpacity, b.starOpacity, clampedT).toFixed(3));

  const lightWashTop = lerpRgba(a.lightWashTop, b.lightWashTop, clampedT);
  const lightWashMid = lerpRgba(a.lightWashMid, b.lightWashMid, clampedT);
  const lightHorizonGlow = lerpRgba(a.lightHorizonGlow, b.lightHorizonGlow, clampedT);
  const lightFilter = {
    saturate: Number(lerpNum(a.lightCloudFilter.saturate, b.lightCloudFilter.saturate, clampedT).toFixed(3)),
    brightness: Number(lerpNum(a.lightCloudFilter.brightness, b.lightCloudFilter.brightness, clampedT).toFixed(3)),
    contrast: Number(lerpNum(a.lightCloudFilter.contrast, b.lightCloudFilter.contrast, clampedT).toFixed(3)),
  };

  return {
    darkSkyGradient: `linear-gradient(180deg, ${rgbStr(darkSky[0])} 0%, ${rgbStr(darkSky[1])} 40%, ${rgbStr(darkSky[2])} 76%, ${rgbStr(darkSky[3])} 100%)`,
    darkHorizonGradient: `radial-gradient(ellipse 92% 48% at 50% 100%, ${rgbaStr(darkHorizonGlow)} 0%, ${rgbaStr(darkHorizonGlow, 0.32)} 52%, transparent 82%)`,
    darkCloudOverlay: `linear-gradient(180deg, transparent 48%, ${rgbaStr(darkCloudTint, 0.55)} 74%, ${rgbaStr(darkCloudTint)} 100%)`,
    starOpacity,
    lightSkyWash: `linear-gradient(180deg, ${rgbaStr(lightWashTop)} 0%, ${rgbaStr(lightWashMid)} 56%, ${rgbaStr(lightHorizonGlow)} 100%)`,
    lightHorizonGradient: `radial-gradient(ellipse 88% 44% at 50% 100%, ${rgbaStr(lightHorizonGlow)} 0%, ${rgbaStr(lightHorizonGlow, 0.28)} 56%, transparent 84%)`,
    lightCloudFilterCss: `saturate(${lightFilter.saturate}) brightness(${lightFilter.brightness}) contrast(${lightFilter.contrast})`,
  };
}

/**
 * Extract sorted anchor minutes for the 5 daily prayers + sunrise.
 * Prefers exact astronomical solar Dates; falls back to configured HH:MM schedule or canonical defaults.
 */
export function resolveSolarAnchorMinutes({ solarTimes = null, sunrise = null, fallbackPrayers = null } = {}) {
  const hasSolar =
    solarTimes &&
    solarTimes.fajr instanceof Date &&
    solarTimes.dhuhr instanceof Date &&
    solarTimes.asr instanceof Date &&
    solarTimes.maghrib instanceof Date &&
    solarTimes.isha instanceof Date &&
    !Number.isNaN(solarTimes.fajr.getTime()) &&
    !Number.isNaN(solarTimes.dhuhr.getTime()) &&
    !Number.isNaN(solarTimes.asr.getTime()) &&
    !Number.isNaN(solarTimes.maghrib.getTime()) &&
    !Number.isNaN(solarTimes.isha.getTime());

  let source = 'schedule';
  let raw;

  if (hasSolar) {
    source = 'solar';
    const fajrM = dateToMinuteOfDay(solarTimes.fajr);
    const dhuhrM = dateToMinuteOfDay(solarTimes.dhuhr);
    const sunriseM =
      sunrise instanceof Date && !Number.isNaN(sunrise.getTime())
        ? dateToMinuteOfDay(sunrise)
        : Math.min(dhuhrM - 45, fajrM + 75);
    raw = {
      fajr: fajrM,
      sunrise: sunriseM,
      dhuhr: dhuhrM,
      asr: dateToMinuteOfDay(solarTimes.asr),
      maghrib: dateToMinuteOfDay(solarTimes.maghrib),
      isha: dateToMinuteOfDay(solarTimes.isha),
    };
  } else {
    const f = hhmmToMinuteOfDay(fallbackPrayers?.fajr?.time) ?? DEFAULT_ANCHOR_MINUTES.fajr;
    const d = hhmmToMinuteOfDay(fallbackPrayers?.dhuhr?.time) ?? DEFAULT_ANCHOR_MINUTES.dhuhr;
    const a = hhmmToMinuteOfDay(fallbackPrayers?.asr?.time) ?? DEFAULT_ANCHOR_MINUTES.asr;
    const m = hhmmToMinuteOfDay(fallbackPrayers?.maghrib?.time) ?? DEFAULT_ANCHOR_MINUTES.maghrib;
    const i = hhmmToMinuteOfDay(fallbackPrayers?.isha?.time) ?? DEFAULT_ANCHOR_MINUTES.isha;
    raw = {
      fajr: f,
      sunrise: Math.min(d - 45, f + 75),
      dhuhr: d,
      asr: a,
      maghrib: m,
      isha: i,
    };
  }

  // Enforce monotonic ordering safely even at extreme latitudes or unusual custom HH:MM edits
  const fajr = clamp(raw.fajr, 30, 660);
  const dhuhr = clamp(Math.max(raw.dhuhr, fajr + 90), 540, 930);
  const sunriseMin = clamp(raw.sunrise, fajr + 25, dhuhr - 30);
  const asr = clamp(Math.max(raw.asr, dhuhr + 45), dhuhr + 45, 1200);
  const maghrib = clamp(Math.max(raw.maghrib, asr + 30), asr + 30, 1340);
  const isha = clamp(Math.max(raw.isha, maghrib + 25), maghrib + 25, 1425);

  return {
    source,
    anchors: { fajr, sunrise: sunriseMin, dhuhr, asr, maghrib, isha },
  };
}

/**
 * Build monotonic keyframe timeline `[minuteOfDay, phaseIndex]` anchored to real prayer times.
 * Each transition cross-fades gently leading into the incoming prayer window, then holds
 * the active prayer's signature light across its solar window.
 */
export function buildSolarAtmosphereStops({ solarTimes = null, sunrise = null, fallbackPrayers = null } = {}) {
  const { source, anchors } = resolveSolarAnchorMinutes({ solarTimes, sunrise, fallbackPrayers });
  const { fajr, sunrise: sr, dhuhr, asr, maghrib, isha } = anchors;

  const preFajrStart = Math.max(0, fajr - 35);
  const fajrToDhuhrEnd = Math.min(dhuhr, Math.max(sr + 20, Math.round(sr + (dhuhr - sr) * 0.45)));
  const preAsrStart = Math.max(fajrToDhuhrEnd + 5, asr - 25);
  const preMaghribStart = Math.max(asr + 5, maghrib - 22);
  const preIshaStart = Math.max(maghrib + 5, isha - 20);

  const stops = [
    [0, 4], // Midnight -> Isha
    [preFajrStart, 4], // End of deep night
    [fajr, 0], // Fajr Dawn arrives at exact Fajr time
    [sr, 0], // Fajr dawn holds through sunrise
    [fajrToDhuhrEnd, 1], // Morning brightens into Dhuhr Zenith
    [preAsrStart, 1], // Dhuhr holds until approaching Asr
    [asr, 2], // Asr Amber Golden Hour arrives at exact Asr time
    [preMaghribStart, 2], // Asr holds until approaching Maghrib
    [maghrib, 3], // Maghrib Twilight Dusk arrives at exact Sunset
    [preIshaStart, 3], // Maghrib dusk holds until approaching Isha
    [isha, 4], // Isha Velvet Night arrives at exact Isha time
    [1440, 4], // Midnight wrap
  ];

  return { source, anchors, stops };
}

/**
 * Resolve exact live atmospheric state (palette, phase metadata, source, sky visuals, next transition)
 * for any moment in time, driven by live calculated solar prayer times or manual override.
 */
export function resolveSolarAtmosphereState({
  now = new Date(),
  solarTimes = null,
  sunrise = null,
  fallbackPrayers = null,
  manualPhase = null,
} = {}) {
  const { source: computedSource, anchors, stops } = buildSolarAtmosphereStops({
    solarTimes,
    sunrise,
    fallbackPrayers,
  });

  if (
    manualPhase !== null &&
    manualPhase !== undefined &&
    Number.isInteger(Number(manualPhase)) &&
    Number(manualPhase) >= 0 &&
    Number(manualPhase) <= 4
  ) {
    const idx = Number(manualPhase);
    const meta = ATMOSPHERE_PHASE_META[idx];
    return {
      phaseIndex: idx,
      phaseId: meta.id,
      meta,
      source: 'manual',
      isAutoSynced: false,
      palette: TEMPORAL_PALETTES[idx],
      blend: { fromPhaseIndex: idx, toPhaseIndex: idx, t: 0 },
      skyVisuals: buildInterpolatedSkyVisuals(idx, idx, 0),
      nextPhaseId: PHASE_IDS[(idx + 1) % PHASE_IDS.length],
      anchors,
    };
  }

  const safeNow = now instanceof Date && !Number.isNaN(now.getTime()) ? now : new Date();
  const minuteOfDay = clamp(dateToMinuteOfDay(safeNow) ?? 0, 0, 1439.99);

  // Determine the current canonical prayer period from exact solar anchors (for honest label display)
  let activePrayerIndex = 4; // Isha (before Fajr or after Isha)
  let nextPhaseIndex = 0; // Fajr
  if (minuteOfDay >= anchors.isha) {
    activePrayerIndex = 4;
    nextPhaseIndex = 0;
  } else if (minuteOfDay >= anchors.maghrib) {
    activePrayerIndex = 3;
    nextPhaseIndex = 4;
  } else if (minuteOfDay >= anchors.asr) {
    activePrayerIndex = 2;
    nextPhaseIndex = 3;
  } else if (minuteOfDay >= anchors.dhuhr) {
    activePrayerIndex = 1;
    nextPhaseIndex = 2;
  } else if (minuteOfDay >= anchors.fajr) {
    // Between Fajr and Dhuhr: dawn until morning clears into midday radiance
    activePrayerIndex = minuteOfDay < anchors.sunrise + 45 ? 0 : 1;
    nextPhaseIndex = activePrayerIndex === 0 ? 1 : 2;
  }

  let fromPhaseIndex = 4;
  let toPhaseIndex = 4;
  let blendT = 0;

  for (let i = 0; i < stops.length - 1; i++) {
    const [mA, pA] = stops[i];
    const [mB, pB] = stops[i + 1];
    if (minuteOfDay >= mA && minuteOfDay <= mB) {
      fromPhaseIndex = pA;
      toPhaseIndex = pB;
      if (pA === pB || mB <= mA) {
        blendT = 0;
      } else {
        blendT = clamp((minuteOfDay - mA) / (mB - mA), 0, 1);
      }
      break;
    }
  }

  const palette = blendTemporalPalettes(fromPhaseIndex, toPhaseIndex, blendT);
  const skyVisuals = buildInterpolatedSkyVisuals(fromPhaseIndex, toPhaseIndex, blendT);
  const meta = ATMOSPHERE_PHASE_META[activePrayerIndex];

  return {
    phaseIndex: activePrayerIndex,
    phaseId: meta.id,
    meta,
    source: computedSource,
    isAutoSynced: true,
    palette,
    blend: { fromPhaseIndex, toPhaseIndex, t: Number(blendT.toFixed(3)) },
    skyVisuals,
    nextPhaseId: PHASE_IDS[nextPhaseIndex],
    anchors,
  };
}
