import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PROPHETIC_DIAGRAM_HADITH,
  PROPHETIC_DIAGRAM_LEGEND,
  TOTAL_CALAMITY_STROKES,
  computePropheticIllumination,
} from './propheticDiagramLogic.js';

test('computePropheticIllumination progresses monotonically from 0 to 5 prayers', () => {
  const states = [0, 1, 2, 3, 4, 5].map((n) => computePropheticIllumination(n));

  assert.equal(states[0].stage, 0);
  assert.equal(states[0].isFullyLit, false);
  assert.equal(states[0].parts.soulGlow, 0);
  assert.equal(states[0].parts.frameProgress, 0);
  assert.equal(states[0].parts.hopeProgress, 0);
  assert.equal(states[0].parts.calamitiesLitCount, 0);
  assert.equal(states[0].parts.crownGlow, 0);

  for (let i = 1; i < states.length; i++) {
    const prev = states[i - 1];
    const curr = states[i];
    assert.ok(curr.stage > prev.stage, `stage should increase at prayer ${i}`);
    assert.ok(curr.parts.soulGlow >= prev.parts.soulGlow, `soulGlow monotonic at ${i}`);
    assert.ok(curr.parts.frameProgress >= prev.parts.frameProgress, `frameProgress monotonic at ${i}`);
    assert.ok(curr.parts.hopeProgress >= prev.parts.hopeProgress, `hopeProgress monotonic at ${i}`);
    assert.ok(
      curr.parts.calamitiesLitCount >= prev.parts.calamitiesLitCount,
      `calamitiesLitCount monotonic at ${i}`
    );
    assert.ok(curr.parts.haloOpacity > prev.parts.haloOpacity, `haloOpacity increases at ${i}`);
  }

  const full = states[5];
  assert.equal(full.isFullyLit, true);
  assert.equal(full.parts.frameProgress, 1);
  assert.equal(full.parts.hopeProgress, 1);
  assert.equal(full.parts.calamitiesLitCount, TOTAL_CALAMITY_STROKES);
  assert.equal(full.parts.crownGlow, 1);
});

test('computePropheticIllumination clamps invalid, negative, and overflowing counts safely', () => {
  assert.equal(computePropheticIllumination(-3).completed, 0);
  assert.equal(computePropheticIllumination(99).completed, 5);
  assert.equal(computePropheticIllumination(NaN).completed, 0);
  assert.equal(computePropheticIllumination(undefined).completed, 0);
});

test('Prophetic diagram metadata contains authentic Bukhari 6417 reference and 4 symbolic elements', () => {
  assert.match(PROPHETIC_DIAGRAM_HADITH.source, /6417/);
  assert.equal(PROPHETIC_DIAGRAM_LEGEND.length, 4);
  const ids = PROPHETIC_DIAGRAM_LEGEND.map((item) => item.id);
  assert.deepEqual(ids, ['soul', 'ajal', 'amal', 'arad']);
});
