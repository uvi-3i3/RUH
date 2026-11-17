/**
 * Pure domain logic for Ruh's on-device Local AI Companion & Grounded Retrieval.
 * Decoupled from Web Worker / React runtime for deterministic unit testing and strict citation safety.
 */

export const LOCAL_AI_MODEL_ID = 'HuggingFaceTB/SmolLM2-360M-Instruct';
export const LOCAL_AI_APPROX_SIZE_MB = 260;
export const LOCAL_AI_PREFS_STORAGE_KEY = 'ruh_local_ai_prefs_v1';

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
  'am', 'im', 'today', 'right', 'now', 'before', 'after', 'during',
]);

export const SPIRITUAL_THEMES = {
  hardship: {
    label: 'ease through hardship',
    keywords: [
      'hard', 'hardship', 'difficult', 'difficulty', 'burden', 'heavy', 'struggle',
      'pain', 'hurt', 'trial', 'test', 'suffer', 'suffering', 'overwhelm', 'overwhelmed',
      'exhausted', 'tired', 'stress', 'stressed', 'relief', 'ease', 'bear', 'handle',
      'survive', 'pressure', 'problem', 'problems', 'distress', 'tightness', 'grief', 'sorrow',
    ],
  },
  patience: {
    label: 'steadfast patience',
    keywords: [
      'patient', 'patience', 'sabr', 'wait', 'waiting', 'endure', 'endurance',
      'anger', 'angry', 'mad', 'frustrated', 'rage', 'provoke', 'calm', 'restraint',
      'control', 'discipline', 'delay', 'steady', 'steadfast',
    ],
  },
  anxiety: {
    label: 'quiet trust amid worry',
    keywords: [
      'worry', 'worried', 'worries', 'anxious', 'anxiety', 'fear', 'afraid',
      'uncertain', 'uncertainty', 'future', 'tomorrow', 'panic', 'nervous', 'restless',
      'trust', 'tawakkul', 'rely', 'reliance', 'enough', 'sufficient', 'safety',
    ],
  },
  guidance: {
    label: 'clarity and guidance',
    keywords: [
      'guide', 'guidance', 'lost', 'confused', 'confusion', 'decision', 'choice',
      'crossroads', 'direction', 'path', 'clarity', 'clear', 'truth', 'wisdom',
      'conversation', 'speak', 'speech', 'exam', 'interview', 'work', 'courage', 'knowledge',
    ],
  },
  repentance: {
    label: 'mercy and return',
    keywords: [
      'sin', 'sins', 'sinned', 'mistake', 'mistakes', 'guilt', 'guilty', 'shame',
      'regret', 'sorry', 'forgive', 'forgiveness', 'pardon', 'mercy', 'merciful',
      'repent', 'repentance', 'tawbah', 'despair', 'hopeless', 'broken', 'brokenness',
      'return', 'clean', 'erase', 'slip', 'wronged',
    ],
  },
  gratitude: {
    label: 'gratitude and remembrance',
    keywords: [
      'grateful', 'gratitude', 'thank', 'thanks', 'thankful', 'shukr', 'blessing',
      'blessings', 'gift', 'gifts', 'goodness', 'kind', 'kindness', 'appreciate',
      'content', 'abundance', 'joy', 'peace', 'remember', 'remembrance', 'dhikr',
    ],
  },
  loneliness: {
    label: 'nearness when feeling alone',
    keywords: [
      'alone', 'lonely', 'loneliness', 'isolated', 'isolation', 'abandoned',
      'unseen', 'empty', 'forgotten', 'near', 'nearness', 'closer', 'presence',
      'companion', 'company',
    ],
  },
  protection: {
    label: 'peace and refuge',
    keywords: [
      'protect', 'protection', 'refuge', 'sleep', 'night', 'insomnia', 'rest',
      'morning', 'leave', 'commute', 'home', 'safe', 'guard', 'weakness',
    ],
  },
  family: {
    label: 'care for loved ones',
    keywords: [
      'family', 'parents', 'mother', 'father', 'mom', 'dad', 'spouse', 'husband',
      'wife', 'children', 'kids', 'home', 'marriage', 'household', 'loved',
    ],
  },
};

function stemToken(word) {
  if (!word || word.length <= 4) return word;
  return word
    .replace(/(ingly|edly|ness|ment|tion|able|ible|less|ful|ing|ies|ied|ed|es|s)$/i, '')
    .toLowerCase();
}

export function extractSemanticTokens(text) {
  const words = String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, ' ')
    .split(/\s+/)
    .map((w) => w.replace(/^['-]+|['-]+$/g, ''))
    .filter((w) => w.length >= 2 && !STOP_WORDS.has(w));

  const tokens = [];
  const concepts = new Set();

  for (const w of words) {
    tokens.push(w);
    const stemmed = stemToken(w);
    if (stemmed && stemmed !== w && stemmed.length >= 3) {
      tokens.push(stemmed);
    }
    for (const [concept, meta] of Object.entries(SPIRITUAL_THEMES)) {
      if (meta.keywords.includes(w) || meta.keywords.includes(stemmed)) {
        tokens.push(`__theme_${concept}`);
        concepts.add(concept);
      }
    }
  }

  return { tokens, concepts: Array.from(concepts) };
}

function scoreCorpus(query, items, extractDocText, options = {}) {
  const { limit = 5, exactBonusFn = null } = options;
  if (!Array.isArray(items) || items.length === 0) return [];

  const qRaw = String(query || '').trim().toLowerCase();
  const { tokens: queryTokens, concepts: queryConcepts } = extractSemanticTokens(qRaw);
  if (queryTokens.length === 0) {
    return items.slice(0, limit).map((item) => ({ item, score: 0, matchedConcepts: [] }));
  }

  const docData = items.map((item) => {
    const text = extractDocText(item);
    const { tokens, concepts } = extractSemanticTokens(text);
    return { item, text: text.toLowerCase(), tokens, concepts };
  });

  const docFreq = new Map();
  for (const doc of docData) {
    for (const tok of new Set(doc.tokens)) {
      docFreq.set(tok, (docFreq.get(tok) || 0) + 1);
    }
  }

  const N = docData.length;
  const toVec = (tokens) => {
    const tf = new Map();
    for (const tok of tokens) {
      tf.set(tok, (tf.get(tok) || 0) + 1);
    }
    const vec = new Map();
    for (const [tok, count] of tf.entries()) {
      const df = docFreq.get(tok) || 0;
      const idf = Math.log(1 + N / (1 + df));
      const weight = tok.startsWith('__theme_') ? 1.45 : 1.0;
      vec.set(tok, count * idf * weight);
    }
    return vec;
  };

  const queryVec = toVec(queryTokens);

  const scored = docData.map((doc) => {
    const docVec = toVec(doc.tokens);
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
    let score = denom > 0 ? dot / denom : 0;

    if (qRaw.length >= 3 && doc.text.includes(qRaw)) {
      score += 0.28;
    }
    if (typeof exactBonusFn === 'function') {
      score += exactBonusFn(doc.item, qRaw, queryConcepts);
    }

    const matchedConcepts = queryConcepts.filter((c) => doc.concepts.includes(c));
    return { item: doc.item, score, matchedConcepts };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}

/**
 * Rank canonical verses by resonance with a seeker's reflection note.
 */
export function rankVersesByResonance(query, verses = [], options = {}) {
  const { excludeVerseId = null, limit = 2 } = options;
  if (!Array.isArray(verses) || verses.length === 0) return [];
  const filtered = excludeVerseId
    ? verses.filter((v) => v && v.id !== excludeVerseId)
    : verses.filter(Boolean);
  const pool = filtered.length > 0 ? filtered : verses.filter(Boolean);

  return scoreCorpus(
    query,
    pool,
    (v) => `${v.t || ''} ${v.c || ''} ${v.simpleT || ''} ${v.simpleC || ''} ${v.s || ''}`,
    { limit }
  );
}

/**
 * Rank Hisn al-Muslim Duas by category, moment resonance, and lexical match.
 */
export function rankDuasByMoment(duas = [], options = {}) {
  const { category = 'all', query = '', favoriteIds = [] } = options;
  if (!Array.isArray(duas)) return [];

  const favSet = new Set(Array.isArray(favoriteIds) ? favoriteIds : []);
  const categoryFiltered = duas.filter((d) => {
    if (!d) return false;
    if (category === 'favorites') return favSet.has(d.id);
    if (category && category !== 'all') return d.category === category;
    return true;
  });

  const q = String(query || '').trim();
  if (!q) {
    return categoryFiltered.map((item) => ({ item, score: 1, matchedConcepts: [] }));
  }

  const ranked = scoreCorpus(
    q,
    categoryFiltered,
    (d) => `${d.title || ''} ${d.moment || ''} ${d.translation || ''} ${d.transliteration || ''} ${d.category || ''} ${d.source || ''}`,
    {
      limit: categoryFiltered.length,
      exactBonusFn: (d, qLower, queryConcepts) => {
        let bonus = 0;
        if (String(d.moment || '').toLowerCase().includes(qLower)) bonus += 0.22;
        if (String(d.title || '').toLowerCase().includes(qLower)) bonus += 0.18;
        if (queryConcepts.includes(d.category)) bonus += 0.18;
        return bonus;
      },
    }
  );

  // Filter out completely zero-score noise when query has valid tokens
  const { tokens } = extractSemanticTokens(q);
  if (tokens.length > 0) {
    const positive = ranked.filter((r) => r.score > 0.02);
    if (positive.length > 0) return positive;
    // Fallback to raw substring check if tokens were purely non-English/short transliteration
    const qLower = q.toLowerCase();
    return categoryFiltered
      .filter((d) =>
        `${d.title || ''} ${d.translation || ''} ${d.transliteration || ''} ${d.moment || ''} ${d.source || ''}`
          .toLowerCase()
          .includes(qLower)
      )
      .map((item) => ({ item, score: 0.5, matchedConcepts: [] }));
  }

  return ranked;
}

/**
 * Determine whether a Duas search query warrants contextual moment guidance copy.
 */
export function shouldShowDuaGuidance(query = '') {
  const trimmed = String(query || '').trim();
  if (!trimmed) return false;
  const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
  return wordCount >= 2 || trimmed.length >= 9;
}

/**
 * Build compact grounded chat messages for SmolLM2-Instruct inside the Web Worker.
 * Strictly forbids inventing Quranic Arabic or verse numbers outside retrieved candidates.
 */
export function buildTafakkurPromptMessages({
  note,
  activeVerse,
  candidateVerses = [],
  candidateDua = null,
  isSimpleMode = false,
}) {
  const activeText = String(
    (isSimpleMode && activeVerse?.simpleT ? activeVerse.simpleT : activeVerse?.t) || ''
  ).replace(/\\n|\n/g, ' ');
  const activeLesson = String(
    (isSimpleMode && activeVerse?.simpleC ? activeVerse.simpleC : activeVerse?.c) || ''
  ).replace(/\\n|\n/g, ' ');

  const verseOptions = candidateVerses
    .filter(Boolean)
    .slice(0, 2)
    .map(
      (v) =>
        `- ID "${v.id}" (${v.s}): "${String(v.t || '').replace(/\\n|\n/g, ' ')}"`
    )
    .join('\n');

  const duaLine = candidateDua
    ? `- ID "${candidateDua.id}" (${candidateDua.title} — ${candidateDua.moment})`
    : '- None';

  const systemPrompt = [
    'You are Ruh, a gentle Islamic reflection companion.',
    'Write 2 or 3 warm, grounded sentences in plain English responding to the user reflection.',
    'Connect their feeling softly to the active verse and offer one quiet spiritual takeaway.',
    'CRITICAL RULE: Never invent, quote, or guess Arabic text, Quran verses, or Surah numbers from memory.',
    'After your 2-3 sentences, end cleanly with:',
    'REF_VERSE: <chosen verse ID from list>',
    'REF_DUA: <chosen dua ID from list>',
  ].join('\n');

  const userPrompt = [
    `Active Verse (${activeVerse?.s || 'Selected'}): "${activeText}"`,
    activeLesson ? `Core Lesson: ${activeLesson}` : '',
    `User Reflection: "${String(note || '').trim().slice(0, 420)}"`,
    verseOptions ? `Candidate Companion Verses:\n${verseOptions}` : '',
    `Candidate Supplication:\n${duaLine}`,
    'Respond with your 2-3 sentence reflection and the two ID lines.',
  ]
    .filter(Boolean)
    .join('\n\n');

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];
}

/**
 * Build compact prompt for moment-aware Duas contextual guidance.
 */
export function buildDuaGuidanceMessages({ query, topDua }) {
  return [
    {
      role: 'system',
      content:
        'You are Ruh, a serene Islamic companion. Write 1 or 2 brief, calming sentences explaining why the provided authentic Dua fits the seeker moment. Do not invent Arabic text or additional citations.',
    },
    {
      role: 'user',
      content: `Seeker Moment: "${String(query || '').trim().slice(0, 220)}"\nMatched Dua: "${topDua?.title}" (${topDua?.source})\nPurpose: "${topDua?.moment}"\nMeaning: "${topDua?.translation}"`,
    },
  ];
}

/**
 * Strip structural tags & unwanted markdown/chat artifacts from small-LLM text cleanly.
 */
export function cleanModelCommentary(rawText = '') {
  return String(rawText || '')
    .replace(/REF_VERSE\s*:[^\n]*/gi, '')
    .replace(/REF_DUA\s*:[^\n]*/gi, '')
    .replace(/^(Reflection|Response|Answer|Ruh)\s*:\s*/i, '')
    .replace(/\*\*|__|`/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Deterministically compose a grounded reflection when model weights are still caching or paused.
 */
export function composeGroundedTafakkurFallback({
  note,
  activeVerse,
  candidateVerses = [],
  candidateDua = null,
  isSimpleMode = false,
}) {
  const { concepts } = extractSemanticTokens(note);
  const topTheme = concepts[0] ? SPIRITUAL_THEMES[concepts[0]]?.label : null;
  const companionVerse = candidateVerses[0] || null;
  const lessonSnippet = String(
    (isSimpleMode && activeVerse?.simpleC ? activeVerse.simpleC : activeVerse?.c) || ''
  )
    .replace(/\\n|\n/g, ' ')
    .trim();
  const firstSentence = lessonSnippet.split(/(?<=[.!?])\s+/)[0] || '';

  const opening = topTheme
    ? `Your reflection touches deeply on ${topTheme}.`
    : 'Thank you for pausing to sit honestly with what is moving inside your heart.';

  const anchor = firstSentence
    ? ` Holding onto ${activeVerse?.s || 'this remembrance'} reminds you: ${firstSentence}`
    : ` ${activeVerse?.s || 'This remembrance'} anchors you back to steady presence.`;

  const bridge = companionVerse
    ? ` Let ${companionVerse.s} walk beside you as a quiet companion today.`
    : '';

  return {
    commentary: `${opening}${anchor}${bridge}`.trim(),
    companionVerse,
    companionDua: candidateDua || null,
    sourceMode: 'fallback',
    matchedConcepts: concepts,
  };
}

/**
 * Deterministically compose a moment-aware note for the top retrieved Dua.
 */
export function composeGroundedDuaFallback(query, topDua) {
  if (!topDua) return '';
  const { concepts } = extractSemanticTokens(query);
  const themePhrase = concepts[0] ? SPIRITUAL_THEMES[concepts[0]]?.label : null;
  if (themePhrase) {
    return `For ${themePhrase}, "${topDua.title}" (${topDua.source}) is taught specifically for ${topDua.moment?.toLowerCase() || 'moments like this'}.`;
  }
  return `"${topDua.title}" (${topDua.source}) meets this moment: ${topDua.moment}.`;
}

/**
 * Parse and validate small-LLM Tafakkur output, enforcing canonical ID resolution.
 */
export function parseTafakkurModelOutput(rawText, context) {
  const {
    note = '',
    activeVerse = null,
    candidateVerses = [],
    candidateDua = null,
    allVerses = [],
    allDuas = [],
    isSimpleMode = false,
  } = context || {};

  const text = String(rawText || '');
  const verseMatch = text.match(/REF_VERSE\s*:\s*([a-zA-Z0-9_-]+)/i);
  const duaMatch = text.match(/REF_DUA\s*:\s*([a-zA-Z0-9_-]+)/i);

  const allowedVersePool = candidateVerses.length > 0 ? candidateVerses : allVerses;
  const resolvedVerse =
    (verseMatch && allowedVersePool.find((v) => v && v.id === verseMatch[1])) ||
    candidateVerses[0] ||
    null;

  const allowedDuaPool = allDuas.length > 0 ? allDuas : candidateDua ? [candidateDua] : [];
  const resolvedDua =
    (duaMatch && allowedDuaPool.find((d) => d && d.id === duaMatch[1])) ||
    candidateDua ||
    null;

  const cleaned = cleanModelCommentary(text);
  // Guard against empty or truncated single-fragment output
  if (cleaned.length < 24 || !/[a-zA-Z]{3,}/.test(cleaned)) {
    return composeGroundedTafakkurFallback({
      note,
      activeVerse,
      candidateVerses,
      candidateDua,
      isSimpleMode,
    });
  }

  // Clamp overly chatty responses gently to the first 3 sentences
  const sentences = cleaned.split(/(?<=[.!?])\s+/).filter(Boolean);
  const commentary = sentences.slice(0, 3).join(' ').slice(0, 420);

  return {
    commentary,
    companionVerse: resolvedVerse,
    companionDua: resolvedDua,
    sourceMode: 'llm',
    matchedConcepts: extractSemanticTokens(note).concepts,
  };
}

/**
 * Parse and validate small-LLM Dua contextual guidance output.
 */
export function parseDuaGuidanceOutput(rawText, topDua, query = '') {
  const cleaned = cleanModelCommentary(rawText);
  if (cleaned.length < 20 || !/[a-zA-Z]{3,}/.test(cleaned)) {
    return composeGroundedDuaFallback(query, topDua);
  }
  const sentences = cleaned.split(/(?<=[.!?])\s+/).filter(Boolean);
  return sentences.slice(0, 2).join(' ').slice(0, 260);
}

/**
 * Aggregate per-file download byte counts reported by Transformers.js into smooth 0–100% metrics.
 */
export function aggregateDownloadProgress(fileProgressMap = {}) {
  const entries = Object.values(fileProgressMap || {}).filter(Boolean);
  if (entries.length === 0) {
    return { percent: 0, loadedBytes: 0, totalBytes: 0 };
  }

  let loadedBytes = 0;
  let totalBytes = 0;
  let pctSum = 0;
  let pctCount = 0;

  for (const entry of entries) {
    const loaded = Math.max(0, Number(entry.loaded) || 0);
    const total = Math.max(0, Number(entry.total) || 0);
    if (total > 0) {
      loadedBytes += Math.min(loaded, total);
      totalBytes += total;
    } else if (typeof entry.progress === 'number' && Number.isFinite(entry.progress)) {
      pctSum += Math.max(0, Math.min(100, entry.progress));
      pctCount += 1;
    }
  }

  if (totalBytes > 0) {
    const percent = Math.max(0, Math.min(100, Math.round((loadedBytes / totalBytes) * 100)));
    return { percent, loadedBytes, totalBytes };
  }

  const percent = pctCount > 0 ? Math.max(0, Math.min(100, Math.round(pctSum / pctCount))) : 0;
  return { percent, loadedBytes, totalBytes };
}

export function formatBytesCompact(bytes = 0) {
  const safe = Math.max(0, Number(bytes) || 0);
  if (safe < 1024 * 1024) {
    return `${Math.max(1, Math.round(safe / 1024))} KB`;
  }
  return `${Math.round(safe / (1024 * 1024))} MB`;
}

export function parseLocalAIPrefs(raw) {
  if (!raw) return { userPaused: false, bannerDismissed: false };
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!parsed || typeof parsed !== 'object') {
      return { userPaused: false, bannerDismissed: false };
    }
    return {
      userPaused: Boolean(parsed.userPaused),
      bannerDismissed: Boolean(parsed.bannerDismissed),
    };
  } catch {
    return { userPaused: false, bannerDismissed: false };
  }
}

export function serializeLocalAIPrefs(prefs = {}) {
  return JSON.stringify({
    userPaused: Boolean(prefs.userPaused),
    bannerDismissed: Boolean(prefs.bannerDismissed),
  });
}
