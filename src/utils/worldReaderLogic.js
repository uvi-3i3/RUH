/**
 * Pure editorial formatting and navigation helpers for the full-screen
 * Fitrah / Burhan (House of Reason) and Miracles of the Qur'an (Observatory of Signs) worlds.
 * Decoupled from React/DOM for deterministic unit testing.
 */

const ROMAN_NUMERALS = [
  [1000, 'M'],
  [900, 'CM'],
  [500, 'D'],
  [400, 'CD'],
  [100, 'C'],
  [90, 'XC'],
  [50, 'L'],
  [40, 'XL'],
  [10, 'X'],
  [9, 'IX'],
  [5, 'V'],
  [4, 'IV'],
  [1, 'I'],
];

/**
 * Converts a positive integer (1..3999) into uppercase Roman numerals for editorial indexing.
 */
export function formatRomanNumeral(num) {
  const n = Math.floor(Number(num) || 0);
  if (n <= 0 || n >= 4000) return String(Math.max(1, n));
  let remainder = n;
  let out = '';
  for (const [value, symbol] of ROMAN_NUMERALS) {
    while (remainder >= value) {
      out += symbol;
      remainder -= value;
    }
  }
  return out;
}

/**
 * Computes counts for the Burhan compendium category filters.
 */
export function getBurhanCategoryCounts(burhans = []) {
  const safe = Array.isArray(burhans) ? burhans : [];
  let islam = 0;
  let theism = 0;
  for (const item of safe) {
    if (item?.category === 'islam') {
      islam += 1;
    } else if (item) {
      theism += 1;
    }
  }
  return {
    all: safe.length,
    islam,
    theism,
  };
}

/**
 * Resolves the previous or next Burhan ID within a list with smooth wrap-around.
 */
export function resolveAdjacentBurhanId(burhans = [], currentId = null, delta = 1) {
  if (!Array.isArray(burhans) || burhans.length === 0) return null;
  const idx = burhans.findIndex((item) => item?.id === currentId);
  const startIdx = idx >= 0 ? idx : 0;
  const step = delta < 0 ? -1 : 1;
  const nextIdx = (startIdx + step + burhans.length) % burhans.length;
  return burhans[nextIdx]?.id || null;
}

/**
 * Structures Burhan essay paragraphs into numbered editorial movements.
 */
export function buildBurhanMovements(paragraphs = []) {
  if (!Array.isArray(paragraphs)) return [];
  return paragraphs
    .map((p) => String(p || '').trim())
    .filter(Boolean)
    .map((text, idx) => ({
      index: idx,
      roman: formatRomanNumeral(idx + 1),
      text,
      isOpening: idx === 0,
    }));
}

/**
 * Splits Burhan prose movements into an opening woven block (paired with the
 * inline feathered illumination) and a closing synthesis block after the
 * deductive proof spine so prose height always balances the woven artwork.
 */
export function planBurhanEditorialFlow(movements = []) {
  const safe = Array.isArray(movements) ? movements : [];
  if (safe.length <= 2) {
    return {
      leadMovements: safe,
      closingMovements: [],
    };
  }
  return {
    leadMovements: safe.slice(0, 2),
    closingMovements: safe.slice(2),
  };
}

/**
 * Computes 1-based position and normalized progress ratio for an active item inside a compendium.
 */
export function getCompendiumPosition(items = [], activeId = null) {
  const safe = Array.isArray(items) ? items : [];
  const total = safe.length;
  if (total === 0) {
    return { position: 0, total: 0, ratio: 0 };
  }
  const idx = safe.findIndex((item) => item?.id === activeId);
  const position = idx >= 0 ? idx + 1 : 1;
  return {
    position,
    total,
    ratio: position / total,
  };
}

/**
 * Computes a concise, domain-authentic caption for the Miracles Revelation-to-Discovery Time-Bridge.
 */
export function buildMiracleTimeBridge(miracle) {
  const revealed = String(miracle?.revealedEra || '7th Century CE').trim();
  const confirmed = String(miracle?.confirmedEra || 'Modern Corroboration').trim();
  const category = String(miracle?.category || '').toLowerCase();

  const yearMatch = confirmed.match(/\b(1[5-9]\d{2}|20\d{2})\b/);
  let spanLabel = 'Spanning Centuries';
  if (yearMatch) {
    const confirmedYear = Number(yearMatch[1]);
    const centuries = Math.max(1, Math.round((confirmedYear - 622) / 100));
    spanLabel = `~${centuries} Centuries Later`;
  } else if (category === 'linguistic') {
    spanLabel = 'Unmatched Across 14 Centuries';
  } else if (category === 'numerology') {
    spanLabel = 'Structural Symmetry';
  } else if (category === 'history') {
    spanLabel = 'Rediscovered by Archaeology';
  } else if (category === 'biology') {
    spanLabel = 'Before Modern Microscopy';
  }

  return {
    revealed,
    confirmed,
    spanLabel,
  };
}

/**
 * Formats read-time strings or numbers cleanly without duplicating "min".
 */
export function formatReadMinutes(raw) {
  if (raw === null || raw === undefined) return '';
  const text = String(raw).trim();
  if (!text) return '';
  if (/\bmin(s|utes?)?\b/i.test(text)) {
    return text;
  }
  const num = Number(text);
  if (Number.isFinite(num) && num > 0) {
    return `${Math.round(num)} min`;
  }
  return text;
}

