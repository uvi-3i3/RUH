import {
  ALL_FIQH_BRANCHES,
  ALL_SACRED_TREE_NODES,
  FAITH_ROOTS,
  ISLAM_PILLARS,
} from '../data/sacredTreeData';

const VALID_NODE_IDS = new Set(ALL_SACRED_TREE_NODES.map((n) => n.id));
const VALID_FIQH_IDS = new Set(ALL_FIQH_BRANCHES.map((fb) => fb.id));

export function sanitizeSacredNodeIds(ids) {
  if (!Array.isArray(ids)) return [];
  const seen = new Set();
  const out = [];
  for (const id of ids) {
    if (typeof id === 'string' && VALID_NODE_IDS.has(id) && !seen.has(id)) {
      seen.add(id);
      out.push(id);
    }
  }
  return out;
}

export function toggleSacredNodeId(completedIds = [], nodeId) {
  if (typeof nodeId !== 'string' || !VALID_NODE_IDS.has(nodeId)) {
    return sanitizeSacredNodeIds(completedIds);
  }
  const clean = sanitizeSacredNodeIds(completedIds);
  if (clean.includes(nodeId)) {
    return clean.filter((id) => id !== nodeId);
  }
  return [...clean, nodeId];
}

export function sanitizeFiqhIds(ids) {
  if (!Array.isArray(ids)) return [];
  const seen = new Set();
  const out = [];
  for (const id of ids) {
    if (typeof id === 'string' && VALID_FIQH_IDS.has(id) && !seen.has(id)) {
      seen.add(id);
      out.push(id);
    }
  }
  return out;
}

export function toggleFiqhId(studiedIds = [], fiqhId) {
  if (typeof fiqhId !== 'string' || !VALID_FIQH_IDS.has(fiqhId)) {
    return sanitizeFiqhIds(studiedIds);
  }
  const clean = sanitizeFiqhIds(studiedIds);
  if (clean.includes(fiqhId)) {
    return clean.filter((id) => id !== fiqhId);
  }
  return [...clean, fiqhId];
}

export function filterSacredTreeNodes(filterMode = 'all') {
  if (filterMode === 'faith') return FAITH_ROOTS;
  if (filterMode === 'islam') return ISLAM_PILLARS;
  return ALL_SACRED_TREE_NODES;
}

export function getSacredNodeById(nodeId) {
  if (!nodeId) return null;
  return ALL_SACRED_TREE_NODES.find((n) => n.id === nodeId) || null;
}

export function getAdjacentSacredNodes(nodeId) {
  const idx = ALL_SACRED_TREE_NODES.findIndex((n) => n.id === nodeId);
  if (idx === -1) return { prevNode: null, nextNode: null };
  return {
    prevNode: idx > 0 ? ALL_SACRED_TREE_NODES[idx - 1] : null,
    nextNode: idx < ALL_SACRED_TREE_NODES.length - 1 ? ALL_SACRED_TREE_NODES[idx + 1] : null,
  };
}

export function getScholarRank(completedTotalCount = 0, studiedFiqhCount = 0) {
  const total = completedTotalCount + studiedFiqhCount;
  if (completedTotalCount >= ALL_SACRED_TREE_NODES.length && studiedFiqhCount >= ALL_FIQH_BRANCHES.length) {
    return { title: 'Illuminated Canopy', arabic: 'الشَّجَرَةُ المُنِيرَة' };
  }
  if (completedTotalCount >= 6) {
    return { title: 'Anchored in Certainty', arabic: 'الرَّاسِخُونَ فِي العِلْم' };
  }
  if (total >= 3) {
    return { title: 'Awakening Branches', arabic: 'طَالِبُ البَصِيرَة' };
  }
  return { title: 'Seeker of Knowledge', arabic: 'طَالِبُ العِلْم' };
}

export function computeSacredTreeProgress(completedIds = [], studiedFiqhIds = []) {
  const completedSet = new Set(sanitizeSacredNodeIds(completedIds));
  const studiedFiqhSet = new Set(sanitizeFiqhIds(studiedFiqhIds));

  const completedFaithCount = FAITH_ROOTS.filter((n) => completedSet.has(n.id)).length;
  const totalFaithCount = FAITH_ROOTS.length;

  const completedIslamCount = ISLAM_PILLARS.filter((n) => completedSet.has(n.id)).length;
  const totalIslamCount = ISLAM_PILLARS.length;

  const completedTotalCount = completedFaithCount + completedIslamCount;
  const totalCount = totalFaithCount + totalIslamCount;

  const studiedFiqhCount = ALL_FIQH_BRANCHES.filter((fb) => studiedFiqhSet.has(fb.id)).length;
  const totalFiqhCount = ALL_FIQH_BRANCHES.length;

  const percentage = totalCount > 0 ? Math.round((completedTotalCount / totalCount) * 100) : 0;
  const faithPercentage =
    totalFaithCount > 0 ? Math.round((completedFaithCount / totalFaithCount) * 100) : 0;
  const islamPercentage =
    totalIslamCount > 0 ? Math.round((completedIslamCount / totalIslamCount) * 100) : 0;

  // Recommend completing the 6 Roots of Faith first, then the 5 Pillars of Islam
  const nextRecommendedNode =
    ALL_SACRED_TREE_NODES.find((n) => !completedSet.has(n.id)) || null;

  const rank = getScholarRank(completedTotalCount, studiedFiqhCount);

  return {
    completedFaithCount,
    totalFaithCount,
    completedIslamCount,
    totalIslamCount,
    completedTotalCount,
    totalCount,
    studiedFiqhCount,
    totalFiqhCount,
    percentage,
    faithPercentage,
    islamPercentage,
    isRootsComplete: completedFaithCount === totalFaithCount,
    isCanopyComplete: completedIslamCount === totalIslamCount,
    isTreeComplete: completedTotalCount === totalCount,
    nextRecommendedNode,
    rank,
  };
}
