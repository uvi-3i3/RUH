import test from 'node:test';
import assert from 'node:assert/strict';
import {
  composeGroundedDuaFallback,
  composeGroundedTafakkurFallback,
  rankDuasByMoment,
  rankVersesByResonance,
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

test('composeGroundedTafakkurFallback returns anchored reflection with canonical verse and dua companions', () => {
  const result = composeGroundedTafakkurFallback({
    note: 'I feel anxious about tomorrow and heavy difficulties',
    activeVerse: SAMPLE_VERSES[0],
    candidateVerses: [SAMPLE_VERSES[1]],
    candidateDua: ESSENTIAL_DUAS[0],
  });
  assert.equal(result.sourceMode, 'fallback');
  assert.ok(result.commentary.length > 30);
  assert.ok(result.commentary.includes('Al-Baqarah'));
  assert.equal(result.companionVerse?.id, 's1v2');
  assert.equal(result.companionDua?.id, 'dua_yunus');
});

test('composeGroundedDuaFallback returns serene moment-aware guidance', () => {
  const topDua = ESSENTIAL_DUAS[2]; // dua_ease_affair
  const guidance = composeGroundedDuaFallback('anxious before difficult exam', topDua);
  assert.ok(guidance.includes(topDua.title));
  assert.ok(guidance.includes(topDua.source));
});
