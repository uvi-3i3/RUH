/**
 * Pure formatting and interactive physics helpers for the Sanctuary Seeker ID Card.
 */

const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

export const CARD_FINISH_STORAGE_KEY = 'ruh_sanctuary_card_finish_v1';
export const VALID_CARD_FINISHES = ['auto', 'obsidian', 'emerald', 'ivory'];

/**
 * Formats a calm, deterministic archival Sanctuary Pass identifier.
 */
export function formatSeekerPassId({ hijriYear, joinedDate, activeDays = 0 } = {}) {
  const yearPart =
    Number.isFinite(Number(hijriYear)) && Number(hijriYear) > 0
      ? String(Math.floor(Number(hijriYear)))
      : '1448';
  const joinedDigits = String(joinedDate || '').match(/\d{2,4}/)?.[0] || '26';
  const suffixYear = joinedDigits.slice(-2).padStart(2, '0');
  const daysNum = Math.max(0, Math.min(999, Math.floor(Number(activeDays) || 0)));
  const dayCode = String(daysNum).padStart(2, '0');
  return `RUH-${yearPart}-${suffixYear}${dayCode}`;
}

/**
 * Extracts a clean 4-digit archival establishment year from a joinedDate string.
 */
export function formatJoinedYear(joinedDate = '') {
  const match = String(joinedDate || '').match(/\b(19|20)\d{2}\b/);
  return match ? match[0] : '2026';
}

/**
 * Resolves clean 1-2 character uppercase monogram initials from a seeker's name.
 */
export function resolveInitials(name = '', fallback = 'SK') {
  const cleaned = String(name || '').trim();
  if (!cleaned) return String(fallback || 'SK').slice(0, 2).toUpperCase();
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
  }
  return cleaned.slice(0, 2).toUpperCase();
}

/**
 * Computes circular 30-day streak ring progress for the Seeker crest.
 */
export function computeSeekerRingProgress(
  currentStreak = 0,
  cycleDays = 30,
  circumference = 289.03
) {
  const safeStreak = Math.max(0, Number(currentStreak) || 0);
  const safeCycle = Math.max(1, Number(cycleDays) || 30);
  const ratio = Math.min(1, safeStreak / safeCycle);
  const dashOffset = Number((circumference * (1 - ratio)).toFixed(2));
  const pct = Math.round(ratio * 100);
  return { ratio, dashOffset, pct };
}

/**
 * Formats a zero-based station index into a classical Roman numeral label.
 */
export function formatStationNumeral(stationIndex = 0) {
  const idx = Math.max(0, Math.floor(Number(stationIndex) || 0));
  return ROMAN_NUMERALS[idx] || String(idx + 1);
}

/**
 * Builds an archival passport-style machine-readable footer line for the ID card.
 */
export function formatCardMrzLine({
  name = 'Seeker',
  hijriYear = 1448,
  stationIndex = 0,
  joinedDate = '2026',
} = {}) {
  const asciiName = String(name || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '‹')
    .toUpperCase()
    .slice(0, 16);
  const holderToken = asciiName || 'SEEKER';
  const safeHijri =
    Number.isFinite(Number(hijriYear)) && Number(hijriYear) > 0
      ? String(Math.floor(Number(hijriYear)))
      : '1448';
  const stationToken = formatStationNumeral(stationIndex);
  const yearToken = formatJoinedYear(joinedDate);
  return `RUH‹‹${holderToken}‹‹${safeHijri}AH‹‹STN·${stationToken}‹‹EST·${yearToken}`;
}

/**
 * Validates and normalizes a stored card finish preference.
 */
export function parseCardFinishPreference(raw) {
  const normalized = String(raw || '').trim().toLowerCase();
  return VALID_CARD_FINISHES.includes(normalized) ? normalized : 'auto';
}

/**
 * Resolves the active physical card material finish based on user preference & theme.
 */
export function resolveCardFinish(preference = 'auto', isLightMode = false) {
  const pref = parseCardFinishPreference(preference);
  if (pref === 'auto') {
    return isLightMode ? 'ivory' : 'obsidian';
  }
  return pref;
}

/**
 * Computes clamped micro-tilt angles, specular highlight coordinates, hologram angle,
 * and subtle depth parallax offsets from a pointer position over a card bounding rect.
 */
export function computeCardTilt(clientX, clientY, rect, maxDeg = 6, maxParallaxPx = 3.5) {
  if (!rect || !rect.width || !rect.height) {
    return { rx: 0, ry: 0, mxPct: 50, myPct: 50, holoAngle: 130, px: 0, py: 0 };
  }
  const nx = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  const ny = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
  const dx = nx - 0.5;
  const dy = ny - 0.5;
  const rx = Number((-dy * maxDeg * 2).toFixed(2));
  const ry = Number((dx * maxDeg * 2).toFixed(2));
  const holoAngle = Math.round(95 + nx * 70 - dy * 24);
  const px = Number((dx * maxParallaxPx * 2).toFixed(2));
  const py = Number((dy * maxParallaxPx * 2).toFixed(2));
  return {
    rx,
    ry,
    mxPct: Math.round(nx * 100),
    myPct: Math.round(ny * 100),
    holoAngle,
    px,
    py,
  };
}

/**
 * Maps mobile device orientation angles (beta, gamma) around a natural resting handheld
 * posture into subtle clamped 3D tilt, specular foil highlight, and parallax offsets.
 */
export function computeGyroTilt(beta, gamma, maxDeg = 5, maxParallaxPx = 3) {
  if (!Number.isFinite(beta) || !Number.isFinite(gamma)) {
    return null;
  }
  // Natural handheld reading posture is ~45deg beta, 0deg gamma
  const normX = Math.max(-1, Math.min(1, gamma / 28));
  const normY = Math.max(-1, Math.min(1, (beta - 45) / 28));
  const rx = Number((-normY * maxDeg).toFixed(2));
  const ry = Number((normX * maxDeg).toFixed(2));
  const mxPct = Math.round(50 + normX * 42);
  const myPct = Math.round(50 + normY * 42);
  const holoAngle = Math.round(130 + normX * 45 - normY * 20);
  const px = Number((normX * maxParallaxPx).toFixed(2));
  const py = Number((normY * maxParallaxPx).toFixed(2));
  return { rx, ry, mxPct, myPct, holoAngle, px, py };
}

/**
 * Evaluates whether a horizontal pointer drag across the card qualifies as a tactile flip gesture.
 */
export function evaluateCardSwipeFlip(dx, dy, thresholdPx = 58) {
  if (!Number.isFinite(dx) || !Number.isFinite(dy)) return null;
  if (Math.abs(dx) < thresholdPx) return null;
  if (Math.abs(dx) <= Math.abs(dy) * 1.45) return null;
  return dx < 0 ? 'left' : 'right';
}
