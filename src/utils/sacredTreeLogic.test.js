import { describe, expect, test } from 'bun:test';
import { ALL_FIQH_BRANCHES, FAITH_ROOTS, ISLAM_PILLARS } from '../data/sacredTreeData';
import {
  computeSacredTreeProgress,
  filterSacredTreeNodes,
  getAdjacentSacredNodes,
  getScholarRank,
  sanitizeFiqhIds,
  sanitizeSacredNodeIds,
  toggleFiqhId,
  toggleSacredNodeId,
} from './sacredTreeLogic';

describe('sacredTreeLogic', () => {
  test('FAITH_ROOTS and ISLAM_PILLARS have 6 roots and 5 branches with valid coordinates, checks, and Fiqh rulings', () => {
    expect(FAITH_ROOTS.length).toBe(6);
    expect(ISLAM_PILLARS.length).toBe(5);
    expect(ALL_FIQH_BRANCHES.length).toBe(12);

    for (const root of FAITH_ROOTS) {
      expect(root.kind).toBe('faith');
      expect(typeof root.coords.x).toBe('number');
      expect(typeof root.coords.y).toBe('number');
      expect(root.pillarsOfUnderstanding.length).toBe(3);
      expect(root.reflectionCheck?.choices.length).toBe(3);
    }

    for (const pillar of ISLAM_PILLARS) {
      expect(pillar.kind).toBe('islam');
      expect(Array.isArray(pillar.fiqhBranches)).toBe(true);
      expect(pillar.fiqhBranches.length).toBeGreaterThanOrEqual(2);
      expect(pillar.reflectionCheck?.choices.length).toBe(3);
      for (const fb of pillar.fiqhBranches) {
        expect(Array.isArray(fb.rulings)).toBe(true);
        expect(fb.rulings.length).toBeGreaterThanOrEqual(2);
      }
    }
  });

  test('toggleSacredNodeId and sanitizeSacredNodeIds handle valid and invalid IDs cleanly', () => {
    expect(sanitizeSacredNodeIds(['iman_allah', 'bogus', 'iman_allah'])).toEqual(['iman_allah']);

    const added = toggleSacredNodeId([], 'iman_allah');
    expect(added).toEqual(['iman_allah']);

    const removed = toggleSacredNodeId(added, 'iman_allah');
    expect(removed).toEqual([]);

    expect(toggleSacredNodeId(added, 'nonexistent')).toEqual(['iman_allah']);
  });

  test('toggleFiqhId and sanitizeFiqhIds handle Fiqh sub-branch study cleanly', () => {
    expect(sanitizeFiqhIds(['fiqh_salah_taharah', 'invalid', 'fiqh_salah_taharah'])).toEqual([
      'fiqh_salah_taharah',
    ]);

    const added = toggleFiqhId([], 'fiqh_salah_taharah');
    expect(added).toEqual(['fiqh_salah_taharah']);

    const removed = toggleFiqhId(added, 'fiqh_salah_taharah');
    expect(removed).toEqual([]);
  });

  test('computeSacredTreeProgress calculates roots, branches, Fiqh counts, rank, and next recommendation accurately', () => {
    const empty = computeSacredTreeProgress([], []);
    expect(empty.completedTotalCount).toBe(0);
    expect(empty.totalCount).toBe(11);
    expect(empty.studiedFiqhCount).toBe(0);
    expect(empty.totalFiqhCount).toBe(12);
    expect(empty.nextRecommendedNode?.id).toBe('iman_allah');
    expect(empty.rank.title).toBe('Seeker of Knowledge');

    const partial = computeSacredTreeProgress(
      ['iman_allah', 'iman_angels', 'islam_shahadah'],
      ['fiqh_salah_taharah', 'fiqh_salah_arkan']
    );
    expect(partial.completedFaithCount).toBe(2);
    expect(partial.completedIslamCount).toBe(1);
    expect(partial.completedTotalCount).toBe(3);
    expect(partial.studiedFiqhCount).toBe(2);
    expect(partial.nextRecommendedNode?.id).toBe('iman_books');
    expect(getScholarRank(6, 2).title).toBe('Anchored in Certainty');
  });

  test('filterSacredTreeNodes and getAdjacentSacredNodes navigate across the tree', () => {
    expect(filterSacredTreeNodes('faith').length).toBe(6);
    expect(filterSacredTreeNodes('islam').length).toBe(5);
    expect(filterSacredTreeNodes('all').length).toBe(11);

    const adjFirst = getAdjacentSacredNodes('iman_allah');
    expect(adjFirst.prevNode).toBeNull();
    expect(adjFirst.nextNode?.id).toBe('iman_angels');

    const adjMiddle = getAdjacentSacredNodes('islam_shahadah');
    expect(adjMiddle.prevNode?.id).toBe('iman_qadar');
    expect(adjMiddle.nextNode?.id).toBe('islam_salah');
  });
});
