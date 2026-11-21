/**
 * Pure domain logic for the Miracles of the Qur'an (I'jaz) section.
 * Decoupled for deterministic selection, category filtering, and unit testing.
 */

import { normalizeText } from './devotionLogic.js';

export const MIRACLES_EXPLORED_STORAGE_KEY = 'ruh_miracles_explored_v1';

export const MIRACLE_CATEGORIES = [
  { key: 'all', label: 'All Signs' },
  { key: 'cosmology', label: 'Cosmology' },
  { key: 'science', label: 'Science' },
  { key: 'biology', label: 'Biology' },
  { key: 'numerology', label: 'Numerology' },
  { key: 'history', label: 'History' },
  { key: 'linguistic', label: 'Linguistic' },
];

/**
 * Filters miracles by category ('all' or a specific category key).
 */
export function filterMiraclesByCategory(miracles = [], category = 'all') {
  if (!Array.isArray(miracles)) return [];
  if (!category || category === 'all') return miracles;
  return miracles.filter((item) => item?.category === category);
}

/**
 * Computes item counts for each category key so filter tabs display accurate numbers.
 */
export function getMiracleCategoryCounts(miracles = []) {
  const safe = Array.isArray(miracles) ? miracles : [];
  const counts = { all: safe.length };
  for (const cat of MIRACLE_CATEGORIES) {
    if (cat.key !== 'all') {
      counts[cat.key] = safe.filter((m) => m?.category === cat.key).length;
    }
  }
  return counts;
}

/**
 * Deterministically selects the featured Miracle of the Day so TasksView and MiraclesOverlay match.
 */
export function selectActiveMiracle(miracles = [], currentStation = 0, activeDays = 0) {
  if (!Array.isArray(miracles) || miracles.length === 0) return null;
  const safeStation = Math.max(0, Math.floor(Number(currentStation) || 0));
  const safeDays = Math.max(0, Math.floor(Number(activeDays) || 0));
  const index = (safeStation * 3 + safeDays) % miracles.length;
  return miracles[index];
}

/**
 * Resolves Classical vs. Simple language copy for a Miracle entry.
 */
export function resolveMiracleCopy(miracle, isSimpleMode = false) {
  if (!miracle) {
    return {
      translation: '',
      quranicSign: '',
      evidence: '',
      reflection: '',
    };
  }
  return {
    translation: normalizeText(
      isSimpleMode && miracle.simpleTranslation ? miracle.simpleTranslation : miracle.translation
    ).trim(),
    quranicSign: normalizeText(
      isSimpleMode && miracle.simpleQuranicSign ? miracle.simpleQuranicSign : miracle.quranicSign
    ).trim(),
    evidence: normalizeText(
      isSimpleMode && miracle.simpleEvidence ? miracle.simpleEvidence : miracle.evidence
    ).trim(),
    reflection: normalizeText(
      isSimpleMode && miracle.simpleReflection ? miracle.simpleReflection : miracle.reflection
    ).trim(),
  };
}

/**
 * Resolves the previous or next miracle ID with smooth wrap-around.
 */
export function resolveAdjacentMiracleId(miracles = [], currentId = null, delta = 1) {
  if (!Array.isArray(miracles) || miracles.length === 0) return null;
  const idx = miracles.findIndex((m) => m?.id === currentId);
  const startIdx = idx >= 0 ? idx : 0;
  const step = delta < 0 ? -1 : 1;
  const nextIdx = (startIdx + step + miracles.length) % miracles.length;
  return miracles[nextIdx]?.id || null;
}

/**
 * Safely parses stored explored miracle IDs from localStorage JSON.
 */
export function parseExploredMiracleIds(raw) {
  if (!raw) return [];
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!Array.isArray(parsed)) return [];
    return [...new Set(parsed.filter((id) => typeof id === 'string' && id.trim().length > 0))];
  } catch {
    return [];
  }
}
