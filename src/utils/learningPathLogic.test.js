import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildOriginMorphStyles,
  captureClickOriginFromEvent,
  computeExpansionRadius,
  normalizeClickOrigin,
} from './learningPathLogic';

test('normalizeClickOrigin preserves valid click point and clamps to viewport', () => {
  const result = normalizeClickOrigin(
    {
      rect: { left: 24, top: 520, width: 342, height: 96 },
      point: { x: 280, y: 560 },
    },
    { width: 390, height: 844 }
  );

  assert.deepEqual(result.point, { x: 280, y: 560 });
  assert.deepEqual(result.rect, { left: 24, top: 520, width: 342, height: 96 });
});

test('normalizeClickOrigin falls back to rect center on keyboard activation (0,0)', () => {
  const result = normalizeClickOrigin(
    {
      rect: { left: 40, top: 500, width: 300, height: 100 },
      point: { x: 0, y: 0 },
    },
    { width: 390, height: 844 }
  );

  assert.deepEqual(result.point, { x: 190, y: 550 });
});

test('normalizeClickOrigin supplies safe fallback rect when origin is missing', () => {
  const result = normalizeClickOrigin(null, { width: 1440, height: 900 });

  assert.ok(result.rect.width > 0);
  assert.ok(result.rect.height > 0);
  assert.ok(result.point.x > 0 && result.point.x <= 1440);
  assert.ok(result.point.y > 0 && result.point.y <= 900);
});

test('computeExpansionRadius reaches farthest viewport corner from off-center click', () => {
  // Bottom-right click on 390x844 must cover distance to top-left corner (0, 0)
  const radius = computeExpansionRadius({ x: 360, y: 800 }, { width: 390, height: 844 });
  const exactDistance = Math.hypot(360, 800);

  assert.ok(radius >= Math.ceil(exactDistance));
});

test('buildOriginMorphStyles collapses to clicked point initially and engulfs when open', () => {
  const origin = {
    rect: { left: 24, top: 600, width: 342, height: 94 },
    point: { x: 195, y: 647 },
  };
  const viewport = { width: 390, height: 844 };

  const collapsed = buildOriginMorphStyles(origin, viewport, 'idle-closed', false);
  assert.equal(collapsed.clipPath, 'circle(0px at 195px 647px)');
  assert.equal(collapsed.transformOrigin, '195px 647px');
  assert.equal(collapsed.transform, 'scale(0.94)');

  const expanded = buildOriginMorphStyles(origin, viewport, 'open', false);
  assert.ok(expanded.clipPath.startsWith(`circle(${expanded.maxRadius}px at 195px 647px)`));
  assert.equal(expanded.transform, 'scale(1)');
  assert.equal(expanded.opacity, 1);
});

test('buildOriginMorphStyles uses gentle fade when reduced motion is preferred', () => {
  const origin = {
    rect: { left: 24, top: 600, width: 342, height: 94 },
    point: { x: 195, y: 647 },
  };
  const viewport = { width: 390, height: 844 };

  const start = buildOriginMorphStyles(origin, viewport, 'idle-closed', true);
  assert.equal(start.clipPath, 'none');
  assert.equal(start.opacity, 0);

  const open = buildOriginMorphStyles(origin, viewport, 'open', true);
  assert.equal(open.clipPath, 'none');
  assert.equal(open.opacity, 1);
});

test('captureClickOriginFromEvent extracts rect and coordinates from DOM event', () => {
  const mockEvent = {
    clientX: 210,
    clientY: 620,
    currentTarget: {
      getBoundingClientRect: () => ({ left: 20, top: 580, width: 350, height: 96 }),
    },
  };

  const captured = captureClickOriginFromEvent(mockEvent);
  assert.deepEqual(captured, {
    rect: { left: 20, top: 580, width: 350, height: 96 },
    point: { x: 210, y: 620 },
  });
});
