import test from 'node:test';
import assert from 'node:assert/strict';
import { quranMiraclesData } from '../data/quranMiraclesData';
import {
  MIRACLE_CATEGORIES,
  filterMiraclesByCategory,
  getMiracleCategoryCounts,
  parseExploredMiracleIds,
  resolveAdjacentMiracleId,
  resolveMiracleCopy,
  selectActiveMiracle,
} from './miraclesLogic';

test('quranMiraclesData covers cosmology, science, biology, numerology, history, and linguistic categories', () => {
  const counts = getMiracleCategoryCounts(quranMiraclesData);
  assert.equal(counts.all, quranMiraclesData.length);
  for (const cat of MIRACLE_CATEGORIES) {
    assert.ok(counts[cat.key] >= 1, `Expected at least 1 miracle in category ${cat.key}`);
  }
});

test('filterMiraclesByCategory returns all items for "all" and narrows cleanly by category', () => {
  const all = filterMiraclesByCategory(quranMiraclesData, 'all');
  assert.equal(all.length, quranMiraclesData.length);

  const numerology = filterMiraclesByCategory(quranMiraclesData, 'numerology');
  assert.ok(numerology.length >= 2);
  assert.ok(numerology.every((m) => m.category === 'numerology'));

  const history = filterMiraclesByCategory(quranMiraclesData, 'history');
  assert.ok(history.length >= 2);
  assert.ok(history.every((m) => m.category === 'history'));
});

test('selectActiveMiracle is deterministic and handles edge inputs safely', () => {
  assert.equal(selectActiveMiracle([], 0, 0), null);
  const day0 = selectActiveMiracle(quranMiraclesData, 0, 0);
  const day0Again = selectActiveMiracle(quranMiraclesData, 0, 0);
  assert.equal(day0.id, day0Again.id);

  const day1 = selectActiveMiracle(quranMiraclesData, 0, 1);
  assert.notEqual(day0.id, day1.id);
});

test('resolveMiracleCopy switches cleanly between Classical and Simple phrasing', () => {
  const sample = quranMiraclesData[0];
  const classical = resolveMiracleCopy(sample, false);
  const simple = resolveMiracleCopy(sample, true);

  assert.equal(classical.translation, sample.translation);
  assert.equal(simple.translation, sample.simpleTranslation);
  assert.notEqual(classical.quranicSign, simple.quranicSign);
  assert.notEqual(classical.evidence, simple.evidence);
});

test('resolveAdjacentMiracleId wraps around both ends cleanly', () => {
  const firstId = quranMiraclesData[0].id;
  const lastId = quranMiraclesData[quranMiraclesData.length - 1].id;

  assert.equal(resolveAdjacentMiracleId(quranMiraclesData, firstId, -1), lastId);
  assert.equal(resolveAdjacentMiracleId(quranMiraclesData, lastId, 1), firstId);
  assert.equal(resolveAdjacentMiracleId(quranMiraclesData, firstId, 1), quranMiraclesData[1].id);
});

test('parseExploredMiracleIds deduplicates valid IDs and guards corrupt JSON', () => {
  assert.deepEqual(parseExploredMiracleIds('["a","b","a","",123]'), ['a', 'b']);
  assert.deepEqual(parseExploredMiracleIds('{invalid json'), []);
  assert.deepEqual(parseExploredMiracleIds(null), []);
});
