/**
 * Pure domain logic for Ruh's instant grounded reflection and supplication retrieval.
 * Decoupled from React runtime for deterministic unit testing and strict citation safety.
 */

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
 * Deterministically compose a grounded reflection anchored in the active verse and retrieved companions.
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
