/**
 * Pure, strictly topic-scoped Q&A Codex logic for Burhan (18 treatises)
 * and Miracles of the Qur'an (22 signs).
 *
 * Zero AI simulation, zero cross-topic leakage: every question, filter,
 * follow-up connection, and progress metric stays strictly inside its own topic.
 */

import { burhanQaData } from '../data/burhanQaData.js';
import { miraclesQaData } from '../data/miraclesQaData.js';

export const QA_EXPLORED_STORAGE_KEY = 'ruh_qa_explored_v1';

const CATEGORY_DEFS = {
  burhan: [
    { key: 'all', label: 'All' },
    { key: 'objection', label: 'Objections' },
    { key: 'proof', label: 'Logic & Proof' },
    { key: 'evidence', label: 'Evidence' },
    { key: 'deep', label: 'Deep Dive' },
    { key: 'practice', label: 'Daily Life' },
  ],
  miracles: [
    { key: 'all', label: 'All' },
    { key: 'objection', label: 'Objections' },
    { key: 'evidence', label: 'Evidence' },
    { key: 'deep', label: 'Arabic & Context' },
    { key: 'practice', label: 'Reflection' },
  ],
};

const SINGULAR_CATEGORY_LABELS = {
  burhan: {
    objection: 'Objection',
    proof: 'Logic & Proof',
    evidence: 'Evidence',
    deep: 'Deep Dive',
    practice: 'Daily Life',
  },
  miracles: {
    objection: 'Objection',
    proof: 'Logic & Proof',
    evidence: 'Evidence',
    deep: 'Arabic & Context',
    practice: 'Reflection',
  },
};

export function getWorldQaBank(world = 'burhan') {
  return world === 'miracles' ? miraclesQaData : burhanQaData;
}

export function getQaCategoryLabel(category = 'deep', world = 'burhan') {
  const table = SINGULAR_CATEGORY_LABELS[world === 'miracles' ? 'miracles' : 'burhan'];
  return table[category] || table.deep;
}

export function formatQaIndex(oneBasedIndex) {
  const n = Math.max(1, Number(oneBasedIndex) || 1);
  return n < 10 ? `0${n}` : String(n);
}

export function resolveQaEntryCopy(entry, isSimpleMode = false) {
  if (!entry) return null;
  return {
    id: entry.id,
    category: entry.category || 'deep',
    question: String(
      isSimpleMode && entry.simpleQuestion ? entry.simpleQuestion : entry.question || ''
    ).trim(),
    answer: String(
      isSimpleMode && entry.simpleAnswer ? entry.simpleAnswer : entry.answer || ''
    ).trim(),
    followUpIds: Array.isArray(entry.followUpIds) ? entry.followUpIds : [],
  };
}

/**
 * Returns the complete resolved Q&A list strictly for a single topic ID.
 */
export function getTopicQaList(world = 'burhan', topicId = '', isSimpleMode = false) {
  const bank = getWorldQaBank(world);
  const rawList = Array.isArray(bank[topicId]) ? bank[topicId] : [];
  return rawList.map((entry) => resolveQaEntryCopy(entry, isSimpleMode)).filter(Boolean);
}

export function getTopicQaCount(world = 'burhan', topicId = '') {
  const bank = getWorldQaBank(world);
  return Array.isArray(bank[topicId]) ? bank[topicId].length : 0;
}

/**
 * Returns only the filter categories that actually contain entries for the active topic.
 */
export function getAvailableQaCategories(qaList = [], world = 'burhan') {
  const safe = Array.isArray(qaList) ? qaList : [];
  const defs = CATEGORY_DEFS[world === 'miracles' ? 'miracles' : 'burhan'];
  const counts = {};
  for (const item of safe) {
    const k = item?.category || 'deep';
    counts[k] = (counts[k] || 0) + 1;
  }
  return defs
    .filter((d) => d.key === 'all' || (counts[d.key] || 0) > 0)
    .map((d) => ({
      ...d,
      count: d.key === 'all' ? safe.length : counts[d.key] || 0,
    }));
}

export function filterQaByCategory(qaList = [], category = 'all') {
  const safe = Array.isArray(qaList) ? qaList : [];
  if (!category || category === 'all') return safe;
  return safe.filter((item) => item?.category === category);
}

/**
 * Resolves curated in-topic follow-up links strictly inside the provided topic's qaList.
 */
export function resolveInTopicFollowUps(qaList = [], entry = null, limit = 2) {
  const safe = Array.isArray(qaList) ? qaList : [];
  if (!entry || safe.length <= 1) return [];

  const byId = new Map(safe.map((q) => [q.id, q]));
  const result = [];

  if (Array.isArray(entry.followUpIds)) {
    for (const fid of entry.followUpIds) {
      if (fid === entry.id) continue;
      const candidate = byId.get(fid);
      if (candidate && !result.includes(candidate)) {
        result.push(candidate);
      }
      if (result.length >= limit) return result;
    }
  }

  for (const q of safe) {
    if (result.length >= limit) break;
    if (q.id !== entry.id && !result.includes(q)) {
      result.push(q);
    }
  }

  return result;
}

/**
 * Steps sequentially to the previous or next question inside the current visible list.
 * Returns null at list boundaries so Prev/Next controls disable cleanly instead of looping unexpectedly.
 */
export function resolveAdjacentQaId(qaList = [], currentId = '', delta = 1) {
  const safe = Array.isArray(qaList) ? qaList : [];
  if (safe.length === 0) return null;
  const idx = safe.findIndex((item) => item?.id === currentId);
  if (idx === -1) return safe[0]?.id || null;
  const targetIdx = idx + delta;
  if (targetIdx < 0 || targetIdx >= safe.length) return null;
  return safe[targetIdx]?.id || null;
}

/**
 * Computes live reading progress for the active topic's Q&As.
 */
export function computeTopicQaProgress(qaList = [], exploredIds = []) {
  const safe = Array.isArray(qaList) ? qaList : [];
  const total = safe.length;
  if (total === 0) {
    return { exploredCount: 0, total: 0, ratio: 0, isComplete: false };
  }
  const exploredSet = new Set(Array.isArray(exploredIds) ? exploredIds : []);
  let exploredCount = 0;
  for (const q of safe) {
    if (exploredSet.has(q.id)) exploredCount += 1;
  }
  return {
    exploredCount,
    total,
    ratio: exploredCount / total,
    isComplete: exploredCount >= total,
  };
}

export function markQaExplored(exploredIds = [], qaId = '') {
  const safe = Array.isArray(exploredIds) ? exploredIds : [];
  if (!qaId || safe.includes(qaId)) return safe;
  return [...safe, qaId];
}

export function loadExploredQaIds(storage = null) {
  const target = storage || (typeof window !== 'undefined' ? window.localStorage : null);
  if (!target || typeof target.getItem !== 'function') return [];
  try {
    const raw = target.getItem(QA_EXPLORED_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id) => typeof id === 'string' && id.trim().length > 0);
  } catch {
    return [];
  }
}

export function saveExploredQaIds(ids = [], storage = null) {
  const target = storage || (typeof window !== 'undefined' ? window.localStorage : null);
  if (!target || typeof target.setItem !== 'function') return;
  try {
    const unique = Array.from(new Set((Array.isArray(ids) ? ids : []).filter((x) => typeof x === 'string')));
    target.setItem(QA_EXPLORED_STORAGE_KEY, JSON.stringify(unique));
  } catch {
    // Ignore storage quota or private-mode errors gracefully
  }
}
