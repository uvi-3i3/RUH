import test from 'node:test';
import assert from 'node:assert/strict';
import { burhanData } from '../data/burhanData.js';
import { quranMiraclesData } from '../data/quranMiraclesData.js';
import { burhanQaData } from '../data/burhanQaData.js';
import { miraclesQaData } from '../data/miraclesQaData.js';
import {
  QA_EXPLORED_STORAGE_KEY,
  computeTopicQaProgress,
  filterQaByCategory,
  formatQaIndex,
  getAvailableQaCategories,
  getQaCategoryLabel,
  getTopicQaCount,
  getTopicQaList,
  loadExploredQaIds,
  markQaExplored,
  resolveAdjacentQaId,
  resolveInTopicFollowUps,
  saveExploredQaIds,
} from './topicQaLogic.js';

test('every Burhan treatise (all 18) has strictly topic-owned Q&As with zero orphans or cross-topic leaks', () => {
  assert.equal(burhanData.length, 18);

  const validIds = new Set(burhanData.map((b) => b.id));
  const orphanKeys = Object.keys(burhanQaData).filter((k) => !validIds.has(k));
  assert.deepEqual(orphanKeys, [], `Unexpected orphan Burhan QA keys: ${orphanKeys.join(', ')}`);

  const globalQaIds = new Set();
  for (const item of burhanData) {
    const classical = getTopicQaList('burhan', item.id, false);
    const simple = getTopicQaList('burhan', item.id, true);

    assert.ok(
      classical.length >= 6,
      `Burhan treatise ${item.id} (${item.title}) should have at least 6 Q&As, got ${classical.length}`
    );
    assert.equal(simple.length, classical.length);
    assert.equal(getTopicQaCount('burhan', item.id), classical.length);

    const topicQaIds = new Set(classical.map((q) => q.id));
    for (let i = 0; i < classical.length; i += 1) {
      const c = classical[i];
      const s = simple[i];

      assert.ok(
        c.id.startsWith(`${item.id}-`),
        `QA id ${c.id} must match its Burhan topic prefix ${item.id}-`
      );
      assert.ok(!globalQaIds.has(c.id), `Duplicate QA id detected: ${c.id}`);
      globalQaIds.add(c.id);

      assert.ok(c.question.length > 15, `Classical question too short on ${item.id}/${c.id}`);
      assert.ok(c.answer.length > 100, `Classical answer too short on ${item.id}/${c.id}`);
      assert.ok(s.question.length > 15, `Simple question too short on ${item.id}/${s.id}`);
      assert.ok(s.answer.length > 90, `Simple answer too short on ${item.id}/${s.id}`);
      assert.notEqual(c.answer, s.answer, `Simple answer should differ from Classical on ${c.id}`);

      for (const fid of c.followUpIds) {
        assert.ok(
          topicQaIds.has(fid),
          `Follow-up ${fid} on ${item.id}/${c.id} must strictly remain inside topic ${item.id}`
        );
        assert.notEqual(fid, c.id, `Follow-up ${fid} must not reference itself`);
      }
    }
  }
});

test('every Qur’anic Miracle (all 22) has strictly topic-owned Q&As with zero orphans or cross-topic leaks', () => {
  assert.equal(quranMiraclesData.length, 22);

  const validIds = new Set(quranMiraclesData.map((m) => m.id));
  const orphanKeys = Object.keys(miraclesQaData).filter((k) => !validIds.has(k));
  assert.deepEqual(orphanKeys, [], `Unexpected orphan Miracle QA keys: ${orphanKeys.join(', ')}`);

  const globalQaIds = new Set();
  for (const item of quranMiraclesData) {
    const classical = getTopicQaList('miracles', item.id, false);
    const simple = getTopicQaList('miracles', item.id, true);

    assert.ok(
      classical.length >= 6,
      `Miracle ${item.id} (${item.title}) should have at least 6 Q&As, got ${classical.length}`
    );
    assert.equal(simple.length, classical.length);
    assert.equal(getTopicQaCount('miracles', item.id), classical.length);

    const topicQaIds = new Set(classical.map((q) => q.id));
    for (let i = 0; i < classical.length; i += 1) {
      const c = classical[i];
      const s = simple[i];

      assert.ok(!globalQaIds.has(c.id), `Duplicate Miracle QA id detected: ${c.id}`);
      globalQaIds.add(c.id);

      assert.ok(c.question.length > 15, `Classical question too short on ${item.id}/${c.id}`);
      assert.ok(c.answer.length > 100, `Classical answer too short on ${item.id}/${c.id}`);
      assert.ok(s.question.length > 15, `Simple question too short on ${item.id}/${s.id}`);
      assert.ok(s.answer.length > 90, `Simple answer too short on ${item.id}/${s.id}`);
      assert.notEqual(c.answer, s.answer, `Simple answer should differ from Classical on ${c.id}`);

      for (const fid of c.followUpIds) {
        assert.ok(
          topicQaIds.has(fid),
          `Follow-up ${fid} on ${item.id}/${c.id} must strictly remain inside topic ${item.id}`
        );
        assert.notEqual(fid, c.id, `Follow-up ${fid} must not reference itself`);
      }
    }
  }
});

test('category tabs, filtering, labels, and index formatting stay accurate per topic', () => {
  const b13List = getTopicQaList('burhan', 'b13', false);
  assert.equal(b13List.length, 7);

  const cats = getAvailableQaCategories(b13List, 'burhan');
  assert.equal(cats[0].key, 'all');
  assert.equal(cats[0].count, 7);

  const objections = filterQaByCategory(b13List, 'objection');
  assert.ok(objections.length >= 4);
  assert.ok(objections.every((q) => q.category === 'objection'));
  assert.equal(filterQaByCategory(b13List, 'all').length, 7);

  assert.equal(getQaCategoryLabel('deep', 'miracles'), 'Arabic & Context');
  assert.equal(getQaCategoryLabel('deep', 'burhan'), 'Deep Dive');
  assert.equal(formatQaIndex(1), '01');
  assert.equal(formatQaIndex(12), '12');
});

test('in-topic follow-ups and Prev/Next stepping stay strictly within the active topic list', () => {
  const list = getTopicQaList('miracles', 'm-expanding-universe', false);
  const first = list[0];

  const followUps = resolveInTopicFollowUps(list, first, 2);
  assert.equal(followUps.length, 2);
  assert.ok(followUps.every((f) => f.id !== first.id && list.some((q) => q.id === f.id)));

  assert.equal(resolveAdjacentQaId(list, list[0].id, -1), null);
  assert.equal(resolveAdjacentQaId(list, list[0].id, 1), list[1].id);
  assert.equal(resolveAdjacentQaId(list, list[list.length - 1].id, 1), null);
  assert.equal(resolveAdjacentQaId(list, list[list.length - 1].id, -1), list[list.length - 2].id);
});

test('explored Q&A progress tracking and offline persistence handle edge cases cleanly', () => {
  const list = getTopicQaList('burhan', 'b1', false);
  assert.deepEqual(computeTopicQaProgress(list, []), {
    exploredCount: 0,
    total: 6,
    ratio: 0,
    isComplete: false,
  });

  let explored = markQaExplored([], list[0].id);
  explored = markQaExplored(explored, list[0].id); // dedupe
  explored = markQaExplored(explored, list[1].id);
  // Extra IDs from other topics must not inflate this topic's count
  explored = markQaExplored(explored, 'b2-q1');

  const mid = computeTopicQaProgress(list, explored);
  assert.equal(mid.exploredCount, 2);
  assert.equal(mid.total, 6);
  assert.equal(mid.isComplete, false);

  const allIds = list.map((q) => q.id);
  const done = computeTopicQaProgress(list, allIds);
  assert.equal(done.exploredCount, 6);
  assert.equal(done.ratio, 1);
  assert.equal(done.isComplete, true);

  // Storage round-trip + malformed JSON safety
  const mem = new Map();
  const mockStorage = {
    getItem: (k) => (mem.has(k) ? mem.get(k) : null),
    setItem: (k, v) => mem.set(k, v),
  };
  saveExploredQaIds(['b1-q1', 'b1-q1', 'b1-q2'], mockStorage);
  assert.deepEqual(loadExploredQaIds(mockStorage), ['b1-q1', 'b1-q2']);

  mockStorage.setItem(QA_EXPLORED_STORAGE_KEY, '{corrupted json');
  assert.deepEqual(loadExploredQaIds(mockStorage), []);
});
