/**
 * Pure domain logic for Ruh — Spiritual Companion
 * Decoupled for deterministic unit testing and cross-component consistency.
 */

import { sanitizeHabitList } from './habitLogic.js';

export const getLocalDateStr = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/**
 * Compute current and longest streak from the history map.
 * Supports optional pausedDates ({ [dateStr]: true }) for travel, illness, or exemption days
 * so streaks remain unbroken across honored rest days without inflating active counts.
 */
export function computeStreaks(history, referenceDate = new Date(), pausedDates = {}) {
  if (!history || typeof history !== 'object') {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const safePaused = pausedDates && typeof pausedDates === 'object' ? pausedDates : {};

  const hasActivityOn = (dateStr) => {
    const entry = history[dateStr];
    if (!entry) return false;
    if (typeof entry === 'number') return entry > 0;
    return (entry.prayers || 0) + (entry.verses || 0) + (entry.practices || 0) > 0;
  };

  const activeKeys = Object.keys(history)
    .filter((k) => hasActivityOn(k))
    .sort();

  if (activeKeys.length === 0) return { currentStreak: 0, longestStreak: 0 };

  const allIntermediatePaused = (prevStr, currStr) => {
    const [py, pm, pd] = prevStr.split('-').map(Number);
    const [cy, cm, cd] = currStr.split('-').map(Number);
    const prevDate = new Date(py, pm - 1, pd);
    const currTime = new Date(cy, cm - 1, cd).getTime();
    const cursor = new Date(prevDate.getTime());
    cursor.setDate(cursor.getDate() + 1);
    while (cursor.getTime() < currTime) {
      if (!safePaused[getLocalDateStr(cursor)]) return false;
      cursor.setDate(cursor.getDate() + 1);
    }
    return true;
  };

  let longestStreak = 1;
  let tempStreak = 1;

  for (let i = 1; i < activeKeys.length; i++) {
    const [py, pm, pd] = activeKeys[i - 1].split('-').map(Number);
    const [cy, cm, cd] = activeKeys[i].split('-').map(Number);
    const prevUTC = Date.UTC(py, pm - 1, pd);
    const currUTC = Date.UTC(cy, cm - 1, cd);
    const diffDays = Math.round((currUTC - prevUTC) / (1000 * 3600 * 24));

    if (diffDays === 1 || (diffDays > 1 && allIntermediatePaused(activeKeys[i - 1], activeKeys[i]))) {
      tempStreak++;
    } else if (diffDays > 1) {
      tempStreak = 1;
    }
    if (tempStreak > longestStreak) longestStreak = tempStreak;
  }

  const today = getLocalDateStr(referenceDate);
  const yd = new Date(referenceDate.getTime());
  yd.setDate(yd.getDate() - 1);
  const yesterday = getLocalDateStr(yd);

  let currentStreak = 0;
  if (hasActivityOn(today) || hasActivityOn(yesterday) || safePaused[today] || safePaused[yesterday]) {
    const checkDate = new Date(referenceDate.getTime());
    if (!hasActivityOn(today) && !safePaused[today]) {
      checkDate.setDate(checkDate.getDate() - 1);
    }
    let consecutivePaused = 0;
    while (consecutivePaused < 90) {
      const dateStr = getLocalDateStr(checkDate);
      if (hasActivityOn(dateStr)) {
        currentStreak++;
        consecutivePaused = 0;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (safePaused[dateStr]) {
        consecutivePaused++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
  };
}

/**
 * Normalize escaped newlines (e.g., "\\n") and split into clean paragraphs.
 */
export function normalizeText(str) {
  if (!str) return '';
  return String(str).replace(/\\n/g, '\n');
}

export function splitParagraphs(str) {
  if (!str) return [];
  return normalizeText(str)
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/**
 * Resolve verse translation and commentary based on Simple Language mode.
 */
export function resolveVerseCopy(verse, isSimpleMode = false) {
  if (!verse) return { translation: '', context: '' };
  const rawT = isSimpleMode && verse.simpleT ? verse.simpleT : verse.t;
  const rawC = isSimpleMode && verse.simpleC ? verse.simpleC : verse.c;
  return {
    translation: normalizeText(rawT),
    context: normalizeText(rawC),
  };
}

/**
 * Resolve Daily Burhan body paragraphs and closing contemplation prompt based on Simple Language mode.
 */
export function resolveBurhanCopy(burhan, isSimpleMode = false) {
  if (!burhan) return { paragraphs: [], question: '', premises: [], conclusion: '' };
  const rawText = isSimpleMode && burhan.simpleContent ? burhan.simpleContent : burhan.content;
  const rawQuestion =
    isSimpleMode && burhan.simpleQuestion ? burhan.simpleQuestion : burhan.question || '';
  const logicSteps =
    isSimpleMode && burhan.simpleLogicSteps ? burhan.simpleLogicSteps : burhan.logicSteps;
  const rawPremises = Array.isArray(logicSteps?.premises)
    ? logicSteps.premises
    : isSimpleMode && Array.isArray(burhan.simplePremises)
      ? burhan.simplePremises
      : Array.isArray(burhan.premises)
        ? burhan.premises
        : [];
  const rawConclusion =
    logicSteps?.conclusion ||
    (isSimpleMode && burhan.simpleConclusion ? burhan.simpleConclusion : burhan.conclusion || '');
  return {
    paragraphs: splitParagraphs(rawText),
    question: normalizeText(rawQuestion).trim(),
    premises: rawPremises.map((p) => (typeof p === 'string' ? p : p?.text || '')).filter(Boolean),
    conclusion: normalizeText(rawConclusion).trim(),
  };
}

/**
 * Filter Burhan treasury entries by category ('all' | 'islam' | 'theism').
 */
export function filterBurhansByCategory(burhanList, category = 'all') {
  if (!Array.isArray(burhanList)) return [];
  if (category === 'islam') {
    return burhanList.filter((item) => item?.category === 'islam');
  }
  if (category === 'theism') {
    return burhanList.filter((item) => item?.category !== 'islam');
  }
  return burhanList;
}

/**
 * Deterministically select the active Burhan so TasksView card and BurhanOverlay always match.
 */
export function selectActiveBurhan(burhanList, currentStation = 0, activeDays = 0) {
  if (!Array.isArray(burhanList) || burhanList.length === 0) return null;
  const safeStation = Math.max(0, currentStation || 0);
  const safeDays = Math.max(0, activeDays || 0);
  const index = (safeStation * 2 + safeDays) % burhanList.length;
  return burhanList[index];
}

/**
 * Convert a Gregorian Date to Hijri { year, month, day } using the tabular Islamic calendar.
 */
export function gregorianToHijri(gDate = new Date()) {
  const y = gDate.getFullYear();
  const m = gDate.getMonth() + 1;
  const d = gDate.getDate();

  let jd;
  if (m <= 2) {
    jd = Math.floor(365.25 * (y - 1 + 4716)) + Math.floor(30.6001 * (m + 12 + 1)) + d - 1524.5;
  } else {
    jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d - 1524.5;
  }

  const a = Math.floor((y - (m <= 2 ? 1 : 0)) / 100);
  jd = jd + 2 - a + Math.floor(a / 4);

  const l = Math.floor(jd) - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j =
    Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) +
    Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
  const l3 =
    l2 -
    Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
    29;

  const hijriMonth = Math.floor((24 * l3) / 709);
  const hijriDay = l3 - Math.floor((709 * hijriMonth) / 24);
  const hijriYear = 30 * n + j - 30;

  return { year: hijriYear, month: hijriMonth, day: hijriDay };
}

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
  'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has',
  'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'can', 'may',
  'might', 'must', 'i', 'me', 'my', 'myself', 'we', 'our', 'you', 'your', 'he',
  'him', 'his', 'she', 'her', 'it', 'its', 'they', 'them', 'their', 'this', 'that',
  'these', 'those', 'what', 'which', 'who', 'whom', 'when', 'where', 'why', 'how',
  'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such',
  'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just',
  'feel', 'feeling', 'felt', 'really', 'like', 'about', 'into', 'through', 'even',
]);

const SPIRITUAL_CLUSTERS = {
  hardship: [
    'hard', 'hardship', 'difficult', 'difficulty', 'burden', 'heavy', 'struggle',
    'pain', 'hurt', 'trial', 'test', 'suffer', 'suffering', 'overwhelm', 'overwhelmed',
    'exhausted', 'tired', 'stress', 'stressed', 'relief', 'ease', 'bear', 'handle',
    'survive', 'pressure', 'problem', 'problems',
  ],
  patience: [
    'patient', 'patience', 'sabr', 'wait', 'waiting', 'endure', 'endurance',
    'anger', 'angry', 'mad', 'frustrated', 'rage', 'provoke', 'calm', 'restraint',
    'control', 'discipline', 'delay', 'steady',
  ],
  gratitude: [
    'grateful', 'gratitude', 'thank', 'thanks', 'thankful', 'shukr', 'blessing',
    'blessings', 'gift', 'gifts', 'goodness', 'kind', 'kindness', 'appreciate',
    'content', 'abundance',
  ],
  loneliness: [
    'alone', 'lonely', 'loneliness', 'isolated', 'isolation', 'abandoned',
    'unseen', 'empty', 'forgotten', 'near', 'nearness', 'closer', 'presence',
    'companion', 'company',
  ],
  trust: [
    'worry', 'worried', 'worries', 'anxious', 'anxiety', 'fear', 'afraid',
    'uncertain', 'uncertainty', 'future', 'tomorrow', 'control', 'trust',
    'tawakkul', 'rely', 'reliance', 'enough', 'sufficient', 'safety', 'delegate',
  ],
  repentance: [
    'sin', 'sins', 'sinned', 'mistake', 'mistakes', 'guilt', 'guilty', 'shame',
    'regret', 'sorry', 'forgive', 'forgiveness', 'pardon', 'mercy', 'merciful',
    'repent', 'repentance', 'tawbah', 'despair', 'hopeless', 'broken', 'brokenness',
    'return', 'clean', 'erase', 'wipe',
  ],
  sincerity: [
    'sincere', 'sincerity', 'intention', 'intentions', 'motive', 'motives',
    'ego', 'pride', 'praise', 'approval', 'criticism', 'insult', 'judged',
    'hidden', 'authentic', 'pure', 'show', 'showing',
  ],
  speech: [
    'speak', 'speech', 'words', 'tongue', 'silent', 'silence', 'quiet', 'gossip',
    'harm', 'harmless', 'hurtful', 'mouth', 'listen', 'behave', 'character',
    'manners', 'gentle',
  ],
};

const STEM_WORD = (w) => {
  if (w.length <= 4) return w;
  return w
    .replace(/(ingly|edly|ness|ment|tion|able|ible|less|ful|ing|ies|ied|ed|es|s)$/i, '')
    .toLowerCase();
};

function tokenizeWithConcepts(text) {
  const words = String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, ' ')
    .split(/\s+/)
    .map((w) => w.replace(/^['-]+|['-]+$/g, ''))
    .filter((w) => w.length >= 2 && !STOP_WORDS.has(w));

  const tokens = [];
  for (const w of words) {
    tokens.push(w);
    const stemmed = STEM_WORD(w);
    if (stemmed && stemmed !== w && stemmed.length >= 3) {
      tokens.push(stemmed);
    }
    for (const [concept, cluster] of Object.entries(SPIRITUAL_CLUSTERS)) {
      if (cluster.includes(w) || cluster.includes(stemmed)) {
        tokens.push(`__concept_${concept}`);
      }
    }
  }
  return tokens;
}

/**
 * Find the most thematically resonant verse for a reflection note completely offline.
 * Combines concept-cluster expansion with TF-IDF cosine similarity.
 */
export function findResonantVerse(userReflection, potentialVerses, excludeVerseId = null) {
  if (!userReflection || !String(userReflection).trim() || !Array.isArray(potentialVerses) || potentialVerses.length === 0) {
    return null;
  }

  const candidates = excludeVerseId
    ? potentialVerses.filter((v) => v && v.id !== excludeVerseId)
    : potentialVerses.filter(Boolean);
  const pool = candidates.length > 0 ? candidates : potentialVerses.filter(Boolean);
  if (pool.length === 0) return null;

  const queryTokens = tokenizeWithConcepts(userReflection);
  if (queryTokens.length === 0) return null;

  const docTokenLists = pool.map((verse) => {
    const meaning = `${verse.t || ''} ${verse.c || ''} ${verse.simpleT || ''} ${verse.simpleC || ''}`;
    return tokenizeWithConcepts(meaning);
  });

  // Compute IDF across the local corpus
  const docFreq = new Map();
  for (const tokens of docTokenLists) {
    const unique = new Set(tokens);
    for (const tok of unique) {
      docFreq.set(tok, (docFreq.get(tok) || 0) + 1);
    }
  }

  const N = pool.length;
  const toWeightedVector = (tokens) => {
    const tf = new Map();
    for (const tok of tokens) {
      tf.set(tok, (tf.get(tok) || 0) + 1);
    }
    const vec = new Map();
    for (const [tok, count] of tf.entries()) {
      const df = docFreq.get(tok) || 0;
      const idf = Math.log(1 + N / (1 + df));
      const weight = tok.startsWith('__concept_') ? 1.35 : 1.0;
      vec.set(tok, count * idf * weight);
    }
    return vec;
  };

  const queryVec = toWeightedVector(queryTokens);

  let bestVerse = null;
  let bestScore = 0;

  for (let i = 0; i < pool.length; i++) {
    const docVec = toWeightedVector(docTokenLists[i]);
    let dot = 0;
    let normQ = 0;
    let normD = 0;
    for (const [k, qv] of queryVec.entries()) {
      normQ += qv * qv;
      if (docVec.has(k)) {
        dot += qv * docVec.get(k);
      }
    }
    for (const dv of docVec.values()) {
      normD += dv * dv;
    }
    const denom = Math.sqrt(normQ) * Math.sqrt(normD);
    const score = denom > 0 ? dot / denom : 0;
    if (score > bestScore) {
      bestScore = score;
      bestVerse = pool[i];
    }
  }

  return bestVerse || pool[0];
}

/**
 * Deterministic PRNG (Mulberry32) for consistent, non-flickering starfield layout.
 */
function mulberry32(seed) {
  let t = seed >>> 0;
  return function next() {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), t | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generate a serene, non-overlapping starfield with guaranteed pairwise spacing.
 * Coordinates are in viewport percentages: x in [4..96], y in [4..53].
 */
export function generateCleanStarfield({
  count = 36,
  minDistance = 7.4,
  seed = 1448,
} = {}) {
  const rand = mulberry32(seed);
  const stars = [];
  const palette = ['#f5f1e6', '#e6efff', '#fdf7e4', '#dce8fb'];
  let attempts = 0;
  const maxAttempts = count * 80;

  while (stars.length < count && attempts < maxAttempts) {
    attempts++;
    const x = Number((4 + rand() * 92).toFixed(2));
    // Bias stars slightly higher in the upper firmament while gently tapering toward y=52%
    const yRaw = 4 + Math.pow(rand(), 1.15) * 48;
    const y = Number(yRaw.toFixed(2));

    // Keep the top-center wordmark area (x: 38..62, y < 12) calm and uncluttered
    if (x > 38 && x < 62 && y < 12) continue;

    let tooClose = false;
    for (let i = 0; i < stars.length; i++) {
      const dx = x - stars[i].x;
      // Weight vertical distance slightly taller (portrait 390x844 ratio ~ 2.1x)
      const dy = (y - stars[i].y) * 1.45;
      if (Math.hypot(dx, dy) < minDistance) {
        tooClose = true;
        break;
      }
    }
    if (tooClose) continue;

    const roll = rand();
    const tier = stars.length < 4 && y < 38 ? 'bright' : roll > 0.72 ? 'medium' : 'distant';
    const size =
      tier === 'bright'
        ? Number((2.0 + rand() * 0.4).toFixed(2))
        : tier === 'medium'
          ? Number((1.4 + rand() * 0.4).toFixed(2))
          : Number((0.9 + rand() * 0.35).toFixed(2));

    // Gently dim stars closer to the horizon mist
    const horizonFade = y > 38 ? Math.max(0.45, 1 - (y - 38) / 24) : 1;
    const baseOpacity =
      tier === 'bright' ? 0.94 : tier === 'medium' ? 0.72 + rand() * 0.16 : 0.44 + rand() * 0.22;

    stars.push({
      id: `star-${stars.length}`,
      x,
      y,
      size,
      tier,
      opacity: Number((baseOpacity * horizonFade).toFixed(2)),
      color: tier === 'bright' ? '#fbf3dd' : palette[Math.floor(rand() * palette.length)],
      duration: Number((5.5 + rand() * 4.5).toFixed(2)),
      delay: Number((rand() * 5).toFixed(2)),
    });
  }

  return stars;
}

const KAABA_LAT = 21.422487;
const KAABA_LNG = 39.826206;

const toRadians = (deg) => (deg * Math.PI) / 180;
const toDegrees = (rad) => (rad * 180) / Math.PI;

/**
 * Compute initial true-north Qibla bearing in degrees [0, 360) from coordinates.
 */
export function calculateQiblaBearing(lat, lng) {
  if (
    typeof lat !== 'number' ||
    typeof lng !== 'number' ||
    !Number.isFinite(lat) ||
    !Number.isFinite(lng)
  ) {
    return null;
  }

  const phi1 = toRadians(lat);
  const phi2 = toRadians(KAABA_LAT);
  const dLambda = toRadians(KAABA_LNG - lng);

  const y = Math.sin(dLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLambda);

  const theta = Math.atan2(y, x);
  const bearing = (toDegrees(theta) + 360) % 360;
  return Number(bearing.toFixed(1));
}

/**
 * Great-circle Haversine distance in kilometers to the Kaaba in Makkah.
 */
export function calculateDistanceToKaabaKm(lat, lng) {
  if (
    typeof lat !== 'number' ||
    typeof lng !== 'number' ||
    !Number.isFinite(lat) ||
    !Number.isFinite(lng)
  ) {
    return null;
  }

  const R = 6371;
  const dLat = toRadians(KAABA_LAT - lat);
  const dLng = toRadians(KAABA_LNG - lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat)) *
      Math.cos(toRadians(KAABA_LAT)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Convert a compass bearing [0, 360) into an 8-point cardinal label (N, NE, E, etc.).
 */
export function formatCardinalDirection(degrees) {
  if (typeof degrees !== 'number' || !Number.isFinite(degrees)) return '';
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const normalized = ((degrees % 360) + 360) % 360;
  return dirs[Math.round(normalized / 45) % 8];
}

/**
 * Format minutes remaining until next prayer into compact readable text.
 */
export function formatCountdown(minutes) {
  if (typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes < 0) return '';
  if (minutes === 0) return 'Now';
  const hrs = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hrs === 0) return `${mins}m`;
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
}

/**
 * Shortest signed angular difference (-180..180] from currentHeading to targetBearing.
 */
export function getAngularDelta(currentHeading, targetBearing) {
  if (
    typeof currentHeading !== 'number' ||
    typeof targetBearing !== 'number' ||
    !Number.isFinite(currentHeading) ||
    !Number.isFinite(targetBearing)
  ) {
    return null;
  }
  return ((targetBearing - currentHeading + 540) % 360) - 180;
}

/**
 * Choose 'sabah' (Morning) or 'masa' (Evening) based on local hour.
 * Morning window runs before 14:00 (2 PM); Evening window from 14:00 onward.
 */
export function getRecommendedAdhkarPeriod(date = new Date()) {
  const hour = date instanceof Date ? date.getHours() : 8;
  return hour < 14 ? 'sabah' : 'masa';
}

/**
 * Filter city presets by city name or country (case-insensitive).
 */
export function filterCities(cities, query = '') {
  if (!Array.isArray(cities)) return [];
  const q = String(query || '').trim().toLowerCase();
  if (!q) return cities;
  return cities.filter(
    (c) =>
      c &&
      (String(c.name || '').toLowerCase().includes(q) ||
        String(c.country || '').toLowerCase().includes(q))
  );
}

export const STREAK_MILESTONES = [
  {
    id: 'bidayah',
    days: 1,
    title: 'First Light',
    arabic: 'البداية',
    note: 'Every enduring sanctuary begins with a single deliberate day.',
  },
  {
    id: 'thabat',
    days: 3,
    title: 'Steadfast',
    arabic: 'ثبات',
    note: 'Three unbroken days mark the quiet shift from impulse to rhythm.',
  },
  {
    id: 'usbu',
    days: 7,
    title: 'Lunar Week',
    arabic: 'أسبوع',
    note: 'Seven consecutive days carrying remembrance through a full week.',
  },
  {
    id: 'nisf',
    days: 14,
    title: 'Fortnight',
    arabic: 'بدر',
    note: 'Fourteen days—half a lunar cycle of anchored presence.',
  },
  {
    id: 'shahr',
    days: 30,
    title: 'Full Moon',
    arabic: 'شهر',
    note: 'Thirty unbroken days of devotion woven naturally into daily time.',
  },
  {
    id: 'arbaun',
    days: 40,
    title: 'Murabatah',
    arabic: 'أربعون',
    note: 'Forty consistent days anchors a righteous habit deeply in the heart.',
  },
  {
    id: 'miah',
    days: 100,
    title: 'Centurion',
    arabic: 'مئة',
    note: 'One hundred days walking steadily toward the Light.',
  },
];

const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Build comprehensive daily streak status, 7-day rolling rhythm, and milestone rewards.
 */
export function buildStreakStatus(history = {}, referenceDate = new Date(), pausedDates = {}) {
  const safeHistory = history && typeof history === 'object' ? history : {};
  const safePaused = pausedDates && typeof pausedDates === 'object' ? pausedDates : {};
  const { currentStreak, longestStreak } = computeStreaks(safeHistory, referenceDate, safePaused);

  const weekDays = [];
  for (let offset = 6; offset >= 0; offset--) {
    const d = new Date(
      referenceDate.getFullYear(),
      referenceDate.getMonth(),
      referenceDate.getDate() - offset
    );
    const dateStr = getLocalDateStr(d);
    const entry = safeHistory[dateStr];

    let prayers = 0;
    let verses = 0;
    let practices = 0;
    if (typeof entry === 'number') {
      prayers = entry;
    } else if (entry && typeof entry === 'object') {
      prayers = entry.prayers || 0;
      verses = entry.verses || 0;
      practices = entry.practices || 0;
    }

    const totalActions = prayers + verses + practices;
    const active = totalActions > 0;
    const paused = Boolean(safePaused[dateStr]) && !active;
    const categoriesCount = (prayers > 0 ? 1 : 0) + (verses > 0 ? 1 : 0) + (practices > 0 ? 1 : 0);

    let tier = 0;
    if (prayers >= 5 || categoriesCount === 3 || totalActions >= 8) {
      tier = 3;
    } else if (categoriesCount >= 2 || totalActions >= 3) {
      tier = 2;
    } else if (active) {
      tier = 1;
    }

    weekDays.push({
      dateStr,
      dayLetter: DAY_LETTERS[d.getDay()],
      dayShort: DAY_SHORT[d.getDay()],
      dayNum: d.getDate(),
      isToday: offset === 0,
      prayers,
      verses,
      practices,
      totalActions,
      active,
      paused,
      tier,
    });
  }

  const todayEntry = weekDays[weekDays.length - 1];
  const todayActive = Boolean(todayEntry?.active);
  const todayPaused = Boolean(todayEntry?.paused);
  const atRisk = currentStreak > 0 && !todayActive && !todayPaused;

  const earnedAnchor = Math.max(currentStreak, longestStreak);
  const unlockedMilestoneIds = STREAK_MILESTONES.filter((m) => m.days <= earnedAnchor).map(
    (m) => m.id
  );

  const activeMilestones = STREAK_MILESTONES.filter((m) => m.days <= currentStreak);
  const activeMilestone =
    activeMilestones.length > 0 ? activeMilestones[activeMilestones.length - 1] : null;

  const nextMilestone =
    STREAK_MILESTONES.find((m) => m.days > currentStreak) ||
    STREAK_MILESTONES[STREAK_MILESTONES.length - 1];

  const prevTarget = activeMilestone ? activeMilestone.days : 0;
  const span = Math.max(1, nextMilestone.days - prevTarget);
  const progressToNextPct =
    currentStreak >= STREAK_MILESTONES[STREAK_MILESTONES.length - 1].days
      ? 100
      : Math.max(0, Math.min(100, Math.round(((currentStreak - prevTarget) / span) * 100)));

  let headline = 'Begin Day 1 today';
  let subline = 'Log a prayer, verse, or dhikr to spark your rhythm';
  if (todayActive) {
    headline = currentStreak === 1 ? "Today's light is lit" : 'Steady cadence kept';
    subline =
      currentStreak >= 100
        ? 'Century of steadfast remembrance sealed'
        : `${nextMilestone.days - currentStreak} ${nextMilestone.days - currentStreak === 1 ? 'day' : 'days'} to ${nextMilestone.title}`;
  } else if (todayPaused) {
    headline = 'Rest & exemption honored';
    subline = 'Your streak is protected while resting or traveling';
  } else if (atRisk) {
    headline = 'Preserve your flame today';
    subline = 'Log 1 prayer, verse, or dhikr before nightfall';
  }

  return {
    currentStreak,
    longestStreak,
    todayActive,
    todayPaused,
    atRisk,
    weekDays,
    todayBreakdown: {
      prayers: todayEntry?.prayers || 0,
      verses: todayEntry?.verses || 0,
      practices: todayEntry?.practices || 0,
    },
    unlockedMilestoneIds,
    activeMilestone,
    nextMilestone,
    progressToNextPct,
    headline,
    subline,
  };
}

/**
 * Compute a deterministic celebration signature for today's active streak.
 * Returns null if today has no logged devotion yet so inactive days do not celebrate.
 */
export function getStreakCelebrationSignature(status) {
  if (!status || !status.todayActive) return null;
  const todayNode = Array.isArray(status.weekDays)
    ? status.weekDays[status.weekDays.length - 1]
    : null;
  const dateStr = todayNode?.dateStr || '';
  const tier = todayNode?.tier || 1;
  return `${dateStr}|${status.currentStreak || 0}|${tier}`;
}

/**
 * Determine timely Sunnah lifestyle prompts based on the day of week and Hijri calendar date.
 */
export function getSunnahCalendarContext(date = new Date(), hijri = null) {
  const safeHijri = hijri && typeof hijri.day === 'number' ? hijri : gregorianToHijri(date);
  const dow = date.getDay(); // 0=Sun .. 5=Fri
  const isFriday = dow === 5;
  const isMonOrThu = dow === 1 || dow === 4;
  const isWhiteDay = safeHijri.day >= 13 && safeHijri.day <= 15 && safeHijri.month !== 9;
  const isRamadan = safeHijri.month === 9;
  const isLastTenNights = isRamadan && safeHijri.day >= 21;
  const isAshura = safeHijri.month === 1 && (safeHijri.day === 9 || safeHijri.day === 10);
  const isArafah = safeHijri.month === 12 && safeHijri.day === 9;

  const prompts = [];
  if (isFriday) {
    prompts.push({
      id: 'kahf_friday',
      label: "Jumu'ah Sunnah",
      arabic: 'الْكَهْف',
      detail: 'Recite Surah Al-Kahf & send abundant Salawat before sunset.',
    });
  }
  if (isLastTenNights) {
    prompts.push({
      id: 'qadr_nights',
      label: 'Last 10 Nights',
      arabic: 'لَيْلَةُ الْقَدْر',
      detail: 'Seek Laylat al-Qadr with quiet night prayer and heartfelt Istighfar.',
    });
  } else if (isArafah) {
    prompts.push({
      id: 'arafah_fast',
      label: 'Day of Arafah',
      arabic: 'عَرَفَة',
      detail: 'A sacred day of fasting, forgiveness, and heartfelt Dua.',
    });
  } else if (isAshura) {
    prompts.push({
      id: 'ashura_fast',
      label: "Tasu'a / Ashura",
      arabic: 'عَاشُورَاء',
      detail: 'Prophetic Sunnah of fasting on the 9th and 10th of Muharram.',
    });
  } else if (isWhiteDay) {
    prompts.push({
      id: 'white_days',
      label: 'Ayyam al-Bid',
      arabic: 'الأَيَّامُ البِيض',
      detail: `White Days (${safeHijri.day}th Hijri) · Sunnah voluntary fast & reflection.`,
    });
  } else if (isMonOrThu) {
    prompts.push({
      id: 'mon_thu_fast',
      label: dow === 1 ? 'Monday Sunnah' : 'Thursday Sunnah',
      arabic: 'صِيَامُ السُّنَّة',
      detail: 'Deeds are presented on Mondays & Thursdays — ideal for fasting or extra kindness.',
    });
  }

  return {
    isFriday,
    isMonOrThu,
    isWhiteDay,
    isRamadan,
    isLastTenNights,
    prompts,
    primaryPrompt: prompts[0] || {
      id: 'daily_sunnah',
      label: 'Daily Sunnah',
      arabic: 'سُنَّة',
      detail: 'Anchor your day with two quiet units of Duha & three verses of reflection.',
    },
  };
}

/**
 * Aggregate remaining Qada (make-up) prayers & fasts and lifetime completed Qada acts.
 */
export function computeQadaTotals(qada = {}) {
  const prayers = qada?.prayers || {};
  const fajr = Math.max(0, Number(prayers.fajr) || 0);
  const dhuhr = Math.max(0, Number(prayers.dhuhr) || 0);
  const asr = Math.max(0, Number(prayers.asr) || 0);
  const maghrib = Math.max(0, Number(prayers.maghrib) || 0);
  const isha = Math.max(0, Number(prayers.isha) || 0);
  const fasts = Math.max(0, Number(qada?.fasts) || 0);
  const completedTotal = Math.max(0, Number(qada?.completedTotal) || 0);

  const remainingPrayers = fajr + dhuhr + asr + maghrib + isha;
  const totalRemaining = remainingPrayers + fasts;
  const totalTracked = totalRemaining + completedTotal;
  const completionPct =
    totalTracked > 0 ? Math.round((completedTotal / totalTracked) * 100) : 0;

  return {
    prayers: { fajr, dhuhr, asr, maghrib, isha },
    fasts,
    remainingPrayers,
    totalRemaining,
    completedTotal,
    completionPct,
  };
}

/**
 * Filter categorized Duas by category ('all' | 'favorites' | categoryId) and search text.
 */
export function filterDuas(duas = [], category = 'all', query = '', favoriteIds = []) {
  if (!Array.isArray(duas)) return [];
  const favSet = new Set(Array.isArray(favoriteIds) ? favoriteIds : []);
  const q = (query || '').trim().toLowerCase();

  return duas.filter((d) => {
    if (!d) return false;
    if (category === 'favorites') {
      if (!favSet.has(d.id)) return false;
    } else if (category && category !== 'all') {
      if (d.category !== category) return false;
    }
    if (!q) return true;
    const haystack = `${d.title || ''} ${d.translation || ''} ${d.transliteration || ''} ${d.moment || ''} ${d.source || ''}`.toLowerCase();
    return haystack.includes(q);
  });
}

/**
 * Validate and normalize an imported Ruh JSON backup payload safely.
 */
export function sanitizeBackupPayload(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  if (typeof raw.totalPrayers !== 'number' && !raw.history && !raw.profile) return null;

  const cleanMaqamat =
    raw.maqamat && typeof raw.maqamat === 'object' && !Array.isArray(raw.maqamat)
      ? {
          currentStation: Math.max(0, Math.floor(Number(raw.maqamat.currentStation) || 0)),
          yaqeenProgress: Math.max(
            0,
            Math.min(100, Math.floor(Number(raw.maqamat.yaqeenProgress) || 0))
          ),
          unlockedStations: Array.isArray(raw.maqamat.unlockedStations)
            ? Array.from(
                new Set(
                  raw.maqamat.unlockedStations
                    .map((n) => Math.floor(Number(n)))
                    .filter((n) => Number.isFinite(n) && n >= 0)
                )
              )
            : [0],
        }
      : undefined;

  if (cleanMaqamat && cleanMaqamat.unlockedStations.length === 0) {
    cleanMaqamat.unlockedStations = [0];
  }

  let cleanSettings;
  if (raw.settings && typeof raw.settings === 'object' && !Array.isArray(raw.settings)) {
    const rawPrayers =
      raw.settings.prayers && typeof raw.settings.prayers === 'object' ? raw.settings.prayers : {};
    const safePrayers = {};
    for (const id of ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']) {
      const cfg = rawPrayers[id];
      if (cfg && typeof cfg === 'object') {
        const timeStr =
          typeof cfg.time === 'string' && /^\d{2}:\d{2}$/.test(cfg.time) ? cfg.time : '05:15';
        safePrayers[id] = { enabled: Boolean(cfg.enabled), time: timeStr };
      }
    }
    const leadNum = Number(raw.settings.notificationLeadMinutes);
    cleanSettings = {
      isSimpleMode: Boolean(raw.settings.isSimpleMode),
      isAmbientEnabled: Boolean(raw.settings.isAmbientEnabled),
      notificationLeadMinutes: [0, 5, 10, 15].includes(leadNum) ? leadNum : 0,
      notificationChime: raw.settings.notificationChime !== false,
      prayers: Object.keys(safePrayers).length > 0 ? safePrayers : undefined,
      customReminders: Array.isArray(raw.settings.customReminders)
        ? raw.settings.customReminders
            .filter(
              (r) =>
                r &&
                typeof r === 'object' &&
                typeof r.title === 'string' &&
                r.title.trim() &&
                typeof r.time === 'string' &&
                /^\d{2}:\d{2}$/.test(r.time)
            )
            .map((r) => ({
              id: typeof r.id === 'string' && r.id ? r.id : `custom-${Date.now()}`,
              title: r.title.trim().slice(0, 80),
              time: r.time,
              enabled: Boolean(r.enabled),
            }))
        : [],
    };
  }

  let cleanProfile;
  if (raw.profile && typeof raw.profile === 'object' && !Array.isArray(raw.profile)) {
    const name = String(raw.profile.name || '').trim().slice(0, 60) || 'Seeker';
    const initials =
      name
        .split(/\s+/)
        .map((w) => w[0]?.toUpperCase() || '')
        .join('')
        .slice(0, 2) || 'SK';
    cleanProfile = {
      name,
      initials,
      joinedDate:
        typeof raw.profile.joinedDate === 'string' && raw.profile.joinedDate
          ? raw.profile.joinedDate
          : getLocalDateStr(),
    };
  }

  return {
    totalVerses: Math.max(0, Number(raw.totalVerses) || 0),
    totalPrayers: Math.max(0, Number(raw.totalPrayers) || 0),
    totalDhikr: Math.max(0, Number(raw.totalDhikr) || 0),
    maxDailyPrayers: Math.max(0, Number(raw.maxDailyPrayers) || 0),
    history: raw.history && typeof raw.history === 'object' && !Array.isArray(raw.history) ? raw.history : {},
    savedVerses: Array.isArray(raw.savedVerses)
      ? raw.savedVerses
          .filter((v) => typeof v === 'string' || (v && typeof v === 'object' && v.id))
          .map((v) =>
            typeof v === 'string'
              ? { id: v, note: '', timestamp: Date.now() }
              : {
                  id: String(v.id),
                  note: typeof v.note === 'string' ? v.note : '',
                  timestamp: typeof v.timestamp === 'number' ? v.timestamp : Date.now(),
                }
          )
      : [],
    unlockedBadges:
      raw.unlockedBadges && typeof raw.unlockedBadges === 'object' && !Array.isArray(raw.unlockedBadges)
        ? raw.unlockedBadges
        : {},
    burhanNotes:
      raw.burhanNotes && typeof raw.burhanNotes === 'object' && !Array.isArray(raw.burhanNotes)
        ? raw.burhanNotes
        : {},
    habits: sanitizeHabitList(raw.habits),
    qada: raw.qada && typeof raw.qada === 'object' && !Array.isArray(raw.qada) ? raw.qada : undefined,
    favoriteDuaIds: Array.isArray(raw.favoriteDuaIds)
      ? raw.favoriteDuaIds.filter((id) => typeof id === 'string')
      : [],
    streakPausedDates:
      raw.streakPausedDates && typeof raw.streakPausedDates === 'object' && !Array.isArray(raw.streakPausedDates)
        ? raw.streakPausedDates
        : {},
    maqamat: cleanMaqamat,
    settings: cleanSettings,
    profile: cleanProfile,
  };
}






