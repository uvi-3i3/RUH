import test from 'node:test';
import assert from 'node:assert/strict';
import {
  advanceCloudPosition,
  computeCloudPixelAlpha,
  computeCloudY,
  createGouacheCloudLayerSpec,
} from './cloudPainter.js';

test('advanceCloudPosition moves clouds continuously and wraps smoothly past edges', () => {
  const vw = 1280;
  const sw = 320;
  const margin = 48;

  const x1 = advanceCloudPosition(100, 30, 1.5, vw, sw, margin);
  assert.equal(x1, 145);

  const wrapped = advanceCloudPosition(1320, 30, 1.0, vw, sw, margin);
  const minX = -sw - margin;
  assert.ok(wrapped >= minX && wrapped < -sw + 30, `Expected wrapped x near minX, got ${wrapped}`);

  const revWrapped = advanceCloudPosition(-365, -20, 1.0, vw, sw, margin);
  assert.ok(revWrapped <= vw + margin && revWrapped > vw, `Expected reverse wrap near maxX, got ${revWrapped}`);
});

test('createGouacheCloudLayerSpec returns ordered parallax depths and safe inner crop rects', () => {
  const specs = createGouacheCloudLayerSpec();
  assert.ok(specs.length >= 4);

  const far = specs.filter((s) => s.depth < 0.5);
  const near = specs.filter((s) => s.depth >= 0.85);
  assert.ok(far.length >= 1 && near.length >= 1);

  const maxFarSpeed = Math.max(...far.map((s) => s.speed));
  const minNearSpeed = Math.min(...near.map((s) => s.speed));
  assert.ok(minNearSpeed > maxFarSpeed, 'Foreground clouds should move faster than distant clouds');

  for (const spec of specs) {
    assert.ok(spec.yRatio > 0 && spec.yRatio < 1);
    assert.ok(spec.cropDay.sx >= 0.05 && spec.cropDay.sx + spec.cropDay.sw <= 0.95);
    assert.ok(spec.cropDay.sy >= 0.05 && spec.cropDay.sy + spec.cropDay.sh <= 0.95);
    assert.ok(spec.cropNight.sx >= 0.05 && spec.cropNight.sx + spec.cropNight.sw <= 0.95);
    assert.ok(spec.cropNight.sy >= 0.05 && spec.cropNight.sy + spec.cropNight.sh <= 0.95);
  }
});

test('computeCloudY produces smooth bounded vertical bobbing', () => {
  const baseY = 200;
  const amp = 6;
  const y0 = computeCloudY(baseY, amp, 0.5, 0, 0);
  const yQuarter = computeCloudY(baseY, amp, Math.PI / 2, 1, 0);

  assert.equal(y0, baseY);
  assert.ok(Math.abs(yQuarter - (baseY + amp)) < 1e-9);
});

test('computeCloudPixelAlpha keys out sky blue and night sky while keeping bright painted clouds', () => {
  // Pure cerulean sky blue should have ~0 alpha in day mode
  assert.equal(computeCloudPixelAlpha(105, 148, 205, 0.5, 0.5, 'day'), 0);

  // Sunlit cream-ivory cloud center should be opaque in day mode
  const dayCrestAlpha = computeCloudPixelAlpha(250, 242, 226, 0.5, 0.5, 'day');
  assert.ok(dayCrestAlpha > 0.95, `Expected sunlit day cloud alpha > 0.95, got ${dayCrestAlpha}`);

  // Deep midnight sky should be keyed out in night mode
  assert.equal(computeCloudPixelAlpha(14, 22, 40, 0.5, 0.5, 'night'), 0);

  // Moonlit slate-indigo cloud crest should be visible in night mode
  const nightCloudAlpha = computeCloudPixelAlpha(96, 108, 134, 0.5, 0.5, 'night');
  assert.ok(nightCloudAlpha > 0.8, `Expected moonlit night cloud alpha > 0.8, got ${nightCloudAlpha}`);

  // Edge pixels fade to 0 regardless of brightness so patches never show rectangular seams
  assert.equal(computeCloudPixelAlpha(255, 255, 255, 0, 0.5, 'day'), 0);
  assert.equal(computeCloudPixelAlpha(255, 255, 255, 0.5, 1, 'night'), 0);
});
