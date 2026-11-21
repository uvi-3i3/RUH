import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildBurhanMovements,
  buildMiracleTimeBridge,
  formatReadMinutes,
  formatRomanNumeral,
  getBurhanCategoryCounts,
  getCompendiumPosition,
  planBurhanEditorialFlow,
  resolveAdjacentBurhanId,
} from './worldReaderLogic.js';

test('formatReadMinutes avoids duplicate min suffixes', () => {
  assert.equal(formatReadMinutes('1 min'), '1 min');
  assert.equal(formatReadMinutes('2 mins'), '2 mins');
  assert.equal(formatReadMinutes(3), '3 min');
  assert.equal(formatReadMinutes('4'), '4 min');
  assert.equal(formatReadMinutes(''), '');
  assert.equal(formatReadMinutes(null), '');
});

test('formatRomanNumeral converts positive integers accurately', () => {
  assert.equal(formatRomanNumeral(1), 'I');
  assert.equal(formatRomanNumeral(4), 'IV');
  assert.equal(formatRomanNumeral(9), 'IX');
  assert.equal(formatRomanNumeral(14), 'XIV');
  assert.equal(formatRomanNumeral(16), 'XVI');
  assert.equal(formatRomanNumeral(0), '1');
});

test('getBurhanCategoryCounts partitions islam vs theism cleanly', () => {
  const sample = [
    { id: 'b1', category: 'islam' },
    { id: 'b2', category: 'theism' },
    { id: 'b3', category: 'islam' },
    { id: 'b4' },
  ];
  assert.deepEqual(getBurhanCategoryCounts(sample), {
    all: 4,
    islam: 2,
    theism: 2,
  });
});

test('resolveAdjacentBurhanId wraps forward and backward cleanly', () => {
  const list = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
  assert.equal(resolveAdjacentBurhanId(list, 'a', 1), 'b');
  assert.equal(resolveAdjacentBurhanId(list, 'c', 1), 'a');
  assert.equal(resolveAdjacentBurhanId(list, 'a', -1), 'c');
  assert.equal(resolveAdjacentBurhanId(list, 'missing', 1), 'b');
  assert.equal(resolveAdjacentBurhanId([], 'a', 1), null);
});

test('buildBurhanMovements filters blanks and assigns Roman indices', () => {
  const movements = buildBurhanMovements(['  First thought.  ', '', 'Second thought.']);
  assert.equal(movements.length, 2);
  assert.deepEqual(movements[0], {
    index: 0,
    roman: 'I',
    text: 'First thought.',
    isOpening: true,
  });
  assert.deepEqual(movements[1], {
    index: 1,
    roman: 'II',
    text: 'Second thought.',
    isOpening: false,
  });
});

test('planBurhanEditorialFlow balances opening woven prose and closing synthesis cleanly', () => {
  const short = buildBurhanMovements(['Only one paragraph.']);
  assert.deepEqual(planBurhanEditorialFlow(short), {
    leadMovements: short,
    closingMovements: [],
  });

  const two = buildBurhanMovements(['First.', 'Second.']);
  assert.deepEqual(planBurhanEditorialFlow(two), {
    leadMovements: two,
    closingMovements: [],
  });

  const four = buildBurhanMovements(['One.', 'Two.', 'Three.', 'Four.']);
  const plan = planBurhanEditorialFlow(four);
  assert.equal(plan.leadMovements.length, 2);
  assert.equal(plan.closingMovements.length, 2);
  assert.equal(plan.closingMovements[0].roman, 'III');
});

test('getCompendiumPosition computes 1-based position and ratio', () => {
  const items = [{ id: 'x' }, { id: 'y' }, { id: 'z' }, { id: 'w' }];
  assert.deepEqual(getCompendiumPosition(items, 'y'), {
    position: 2,
    total: 4,
    ratio: 0.5,
  });
  assert.deepEqual(getCompendiumPosition([], 'x'), {
    position: 0,
    total: 0,
    ratio: 0,
  });
});

test('buildMiracleTimeBridge calculates century span when year is present and uses domain fallbacks', () => {
  const cosmology = buildMiracleTimeBridge({
    category: 'cosmology',
    revealedEra: '7th Century CE',
    confirmedEra: 'Edwin Hubble, 1929',
  });
  assert.equal(cosmology.revealed, '7th Century CE');
  assert.equal(cosmology.confirmed, 'Edwin Hubble, 1929');
  assert.equal(cosmology.spanLabel, '~13 Centuries Later');

  const biology = buildMiracleTimeBridge({
    category: 'biology',
    revealedEra: '7th Century CE',
    confirmedEra: 'Modern Microscopy & Embryology',
  });
  assert.equal(biology.spanLabel, 'Before Modern Microscopy');

  const linguistic = buildMiracleTimeBridge({
    category: 'linguistic',
    revealedEra: '7th Century CE',
    confirmedEra: 'Classical & Modern Rhetoric',
  });
  assert.equal(linguistic.spanLabel, 'Unmatched Across 14 Centuries');
});

test('every Burhan and Miracle entry resolves to a curated visual plate with title, caption, and alt', async () => {
  const { burhanData } = await import('../data/burhanData.js');
  const { quranMiraclesData } = await import('../data/quranMiraclesData.js');
  const {
    VISUAL_PLATE_KEYS,
    resolveBurhanVisualMeta,
    resolveMiracleVisualMeta,
  } = await import('./worldVisualCatalog.js');

  const validKeys = new Set(Object.values(VISUAL_PLATE_KEYS));

  for (const item of burhanData) {
    const meta = resolveBurhanVisualMeta(item);
    assert.ok(meta, `Missing visual meta for Burhan ${item.id}`);
    assert.ok(validKeys.has(meta.plateKey), `Invalid plateKey for Burhan ${item.id}`);
    assert.ok(meta.figureTitle.length > 3, `Empty figureTitle for Burhan ${item.id}`);
    assert.ok(meta.caption.length > 15, `Empty caption for Burhan ${item.id}`);
    assert.ok(meta.alt.length > 10, `Empty alt for Burhan ${item.id}`);
  }

  for (const item of quranMiraclesData) {
    const meta = resolveMiracleVisualMeta(item);
    assert.ok(meta, `Missing visual meta for Miracle ${item.id}`);
    assert.ok(validKeys.has(meta.plateKey), `Invalid plateKey for Miracle ${item.id}`);
    assert.ok(meta.figureTitle.length > 3, `Empty figureTitle for Miracle ${item.id}`);
    assert.ok(meta.caption.length > 15, `Empty caption for Miracle ${item.id}`);
    assert.ok(meta.alt.length > 10, `Empty alt for Miracle ${item.id}`);
  }

  const fallbackBurhan = resolveBurhanVisualMeta({ id: 'unknown', category: 'islam', title: 'Custom' });
  assert.equal(fallbackBurhan.plateKey, VISUAL_PLATE_KEYS.BURHAN_SCRIPTURE);

  const fallbackMiracle = resolveMiracleVisualMeta({ id: 'unknown', category: 'biology', title: 'Custom' });
  assert.equal(fallbackMiracle.plateKey, VISUAL_PLATE_KEYS.MIRACLE_WATER_CELL);
});

