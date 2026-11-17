import test from 'node:test';
import assert from 'node:assert/strict';
import {
  aggregateDownloadProgress,
  buildDuaGuidanceMessages,
  buildTafakkurPromptMessages,
  cleanModelCommentary,
  composeGroundedDuaFallback,
  composeGroundedTafakkurFallback,
  formatBytesCompact,
  parseDuaGuidanceOutput,
  parseLocalAIPrefs,
  parseTafakkurModelOutput,
  rankDuasByMoment,
  rankVersesByResonance,
  serializeLocalAIPrefs,
  shouldShowDuaGuidance,
} from './localAiLogic.js';
import { ESSENTIAL_DUAS } from '../data/duasData.js';

const SAMPLE_VERSES = [
  {
    id: 's1v1',
    s: 'Al-Baqarah · 2:286',
    t: 'Allah does not burden a soul beyond that it can bear.',
    c: 'A divine guarantee that you possess the internal strength to endure trials.',
    simpleT: 'God does not give a person more than they can handle.',
    simpleC: 'If you are facing a problem right now, God knows you can survive it.',
  },
  {
    id: 's1v2',
    s: 'Ash-Sharh · 94:6',
    t: 'With every hardship comes ease.',
    c: 'Multiple avenues of relief unfold alongside a single difficulty.',
    simpleT: 'With every hardship comes ease.',
    simpleC: 'Relief is already being created for you.',
  },
  {
    id: 's1v3',
    s: 'Sahih al-Bukhari 6114',
    t: 'The strong person controls himself when angry.',
    c: 'True strength is internal emotional restraint during provocation.',
  },
];

test('rankVersesByResonance excludes active verse and surfaces hardship verse for grief/overwhelmed reflection', () => {
  const ranked = rankVersesByResonance(
    'I feel exhausted and overwhelmed by heavy difficulties today',
    SAMPLE_VERSES,
    { excludeVerseId: 's1v3', limit: 2 }
  );
  assert.equal(ranked.length, 2);
  assert.ok(ranked.every((r) => r.item.id !== 's1v3'));
  assert.ok(['s1v1', 's1v2'].includes(ranked[0].item.id));
});

test('rankDuasByMoment surfaces anxiety/difficulty Duas for natural feeling queries', () => {
  const ranked = rankDuasByMoment(ESSENTIAL_DUAS, {
    category: 'all',
    query: 'feeling overwhelmed before a hard conversation',
  });
  assert.ok(ranked.length > 0);
  const topIds = ranked.slice(0, 4).map((r) => r.item.id);
  assert.ok(
    topIds.includes('dua_ease_affair') || topIds.includes('dua_grief_relief'),
    `Expected difficulty/overwhelm Duas in top 4, got ${topIds.join(', ')}`
  );
});

test('rankDuasByMoment respects category and favorites filter', () => {
  const favOnly = rankDuasByMoment(ESSENTIAL_DUAS, {
    category: 'favorites',
    query: '',
    favoriteIds: ['dua_yunus'],
  });
  assert.equal(favOnly.length, 1);
  assert.equal(favOnly[0].item.id, 'dua_yunus');
});

test('shouldShowDuaGuidance triggers only for multi-word or meaningful natural queries', () => {
  assert.equal(shouldShowDuaGuidance(''), false);
  assert.equal(shouldShowDuaGuidance('sabr'), false);
  assert.equal(shouldShowDuaGuidance('feeling anxious'), true);
  assert.equal(shouldShowDuaGuidance('overwhelmed'), true);
});

test('buildTafakkurPromptMessages grounds prompt strictly in candidate IDs and active verse', () => {
  const messages = buildTafakkurPromptMessages({
    note: 'Trying to trust Allah while waiting on uncertain news.',
    activeVerse: SAMPLE_VERSES[0],
    candidateVerses: [SAMPLE_VERSES[1]],
    candidateDua: ESSENTIAL_DUAS[0],
    isSimpleMode: false,
  });
  assert.equal(messages.length, 2);
  assert.equal(messages[0].role, 'system');
  assert.ok(messages[0].content.includes('Never invent'));
  assert.ok(messages[1].content.includes('s1v2'));
  assert.ok(messages[1].content.includes('dua_yunus'));
});

test('parseTafakkurModelOutput rejects unverified IDs and extracts clean commentary + canonical entities', () => {
  const parsed = parseTafakkurModelOutput(
    '**Reflection:** Hold steady; even when the chest feels tight, relief is unfolding beside the trial. Let patience become a quiet shelter tonight.\nREF_VERSE: s1v2\nREF_DUA: fabricated_id_999',
    {
      note: 'chest feels tight with hardship',
      activeVerse: SAMPLE_VERSES[0],
      candidateVerses: [SAMPLE_VERSES[1]],
      candidateDua: ESSENTIAL_DUAS[0],
      allVerses: SAMPLE_VERSES,
      allDuas: ESSENTIAL_DUAS,
    }
  );
  assert.equal(parsed.sourceMode, 'llm');
  assert.equal(parsed.companionVerse?.id, 's1v2');
  // Unverified REF_DUA falls back strictly to retrieved candidateDua
  assert.equal(parsed.companionDua?.id, 'dua_yunus');
  assert.ok(!parsed.commentary.includes('REF_VERSE'));
  assert.ok(!parsed.commentary.includes('**'));
});

test('parseTafakkurModelOutput falls back gracefully on empty or garbled LLM output', () => {
  const directFallback = composeGroundedTafakkurFallback({
    note: 'I feel anxious about tomorrow',
    activeVerse: SAMPLE_VERSES[0],
    candidateVerses: [SAMPLE_VERSES[1]],
    candidateDua: ESSENTIAL_DUAS[0],
  });
  assert.equal(directFallback.sourceMode, 'fallback');

  const parsed = parseTafakkurModelOutput('... ---', {
    note: 'I feel anxious about tomorrow',
    activeVerse: SAMPLE_VERSES[0],
    candidateVerses: [SAMPLE_VERSES[1]],
    candidateDua: ESSENTIAL_DUAS[0],
    allVerses: SAMPLE_VERSES,
    allDuas: ESSENTIAL_DUAS,
  });
  assert.equal(parsed.sourceMode, 'fallback');
  assert.ok(parsed.commentary.length > 30);
  assert.equal(parsed.companionVerse?.id, 's1v2');
});

test('composeGroundedDuaFallback and parseDuaGuidanceOutput return clean serene guidance', () => {
  const topDua = ESSENTIAL_DUAS[2]; // dua_ease_affair
  const msgs = buildDuaGuidanceMessages({ query: 'before an exam', topDua });
  assert.equal(msgs.length, 2);

  const fallback = composeGroundedDuaFallback('anxious before difficult exam', topDua);
  assert.ok(fallback.includes(topDua.title));

  const parsed = parseDuaGuidanceOutput(
    'This prophetic supplication steadies the heart before overwhelming tasks by reminding you that ease rests solely with Allah.',
    topDua,
    'before difficult task'
  );
  assert.ok(parsed.includes('prophetic supplication'));
  assert.equal(cleanModelCommentary('Response: Simple calm.'), 'Simple calm.');
});

test('aggregateDownloadProgress and formatBytesCompact compute multi-file download telemetry', () => {
  const progress = aggregateDownloadProgress({
    'tokenizer.json': { loaded: 500_000, total: 500_000 },
    'onnx/model_q4.onnx': { loaded: 100_000_000, total: 299_500_000 },
  });
  assert.equal(progress.percent, 34);
  assert.equal(formatBytesCompact(100_500_000), '96 MB');
});

test('parseLocalAIPrefs and serializeLocalAIPrefs round-trip safely', () => {
  const encoded = serializeLocalAIPrefs({ userPaused: true, bannerDismissed: true });
  assert.deepEqual(parseLocalAIPrefs(encoded), { userPaused: true, bannerDismissed: true });
  assert.deepEqual(parseLocalAIPrefs('corrupt{'), { userPaused: false, bannerDismissed: false });
});
