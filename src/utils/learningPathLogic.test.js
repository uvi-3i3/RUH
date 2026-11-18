import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildOriginMorphStyles,
  captureClickOriginFromEvent,
  centerCameraOnPoint,
  clampMapCamera,
  computeExpansionRadius,
  computeLessonOneProgress,
  getAdjacentLandmarkId,
  getInitialMapZoom,
  getNextUndiscoveredLandmark,
  getRegionFocusPoint,
  groupLessonOnePillars,
  isPointerDragExceeded,
  markLandmarkDiscovered,
  normalizeClickOrigin,
  parseDiscoveredLandmarks,
  resolveLandmarkPoint,
  zoomCameraAtCenter,
} from './learningPathLogic';
import {
  LESSON_ONE_LANDMARKS,
  LESSON_ONE_VALID_IDS,
  LOCKED_FUTURE_LESSONS,
  PILLAR_GROUPS,
} from '../data/learningPathData';

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

test('clampMapCamera keeps map edges locked within viewport bounds', () => {
  const viewport = { width: 390, height: 844 };
  const world = { width: 1500, height: 1120 };

  const overTopLeft = clampMapCamera({ x: 250, y: 120, zoom: 1 }, viewport, world);
  assert.equal(overTopLeft.x, 0);
  assert.equal(overTopLeft.y, 0);

  const overBottomRight = clampMapCamera({ x: -5000, y: -5000, zoom: 1 }, viewport, world);
  assert.equal(overBottomRight.x, 390 - 1500);
  assert.equal(overBottomRight.y, 844 - 1120);
});

test('centerCameraOnPoint positions landmark cleanly at focal viewport ratio and clamps edges', () => {
  const viewport = { width: 390, height: 844 };
  const cam = centerCameraOnPoint({ x: 410, y: 635 }, viewport, 1, { width: 1500, height: 1120 }, 0.44);

  assert.ok(cam.x <= 0 && cam.x >= viewport.width - 1500);
  assert.ok(cam.y <= 0 && cam.y >= viewport.height - 1120);
  assert.equal(Math.round(cam.x + 410), Math.round(viewport.width * 0.5));
});

test('zoomCameraAtCenter preserves the world point under the viewport center', () => {
  const viewport = { width: 600, height: 800 };
  const world = { width: 1500, height: 1120 };
  const start = { x: -240, y: -120, zoom: 1 };
  const zoomed = zoomCameraAtCenter(start, 1.35, viewport, world);

  const centerWorldBeforeX = (300 - start.x) / start.zoom;
  const centerWorldAfterX = (300 - zoomed.x) / zoomed.zoom;
  assert.ok(Math.abs(centerWorldBeforeX - centerWorldAfterX) < 1);
});

test('getInitialMapZoom returns larger overview zoom on desktop than mobile', () => {
  const mobileZoom = getInitialMapZoom({ width: 390, height: 844 });
  const desktopZoom = getInitialMapZoom({ width: 1440, height: 900 });
  assert.ok(mobileZoom >= 0.68 && mobileZoom <= 0.86);
  assert.ok(desktopZoom >= 0.86 && desktopZoom <= 1.12);
  assert.ok(desktopZoom > mobileZoom);
});

test('isPointerDragExceeded distinguishes calm taps from drag gestures', () => {
  assert.equal(isPointerDragExceeded({ x: 100, y: 100 }, { x: 103, y: 104 }), false);
  assert.equal(isPointerDragExceeded({ x: 100, y: 100 }, { x: 112, y: 100 }), true);
});

test('parseDiscoveredLandmarks deduplicates and filters invalid IDs safely', () => {
  const parsed = parseDiscoveredLandmarks(
    JSON.stringify(['shahadah', 'shahadah', 'invalid-id', 'iman-qadr']),
    LESSON_ONE_VALID_IDS
  );
  assert.deepEqual(parsed, ['shahadah', 'iman-qadr']);
  assert.deepEqual(parseDiscoveredLandmarks('{bad-json', LESSON_ONE_VALID_IDS), []);
});

test('markLandmarkDiscovered and computeLessonOneProgress track all 11 pillars cleanly', () => {
  let ids = [];
  const res1 = markLandmarkDiscovered(ids, 'shahadah', LESSON_ONE_VALID_IDS);
  assert.equal(res1.added, true);
  ids = res1.nextIds;

  const resDup = markLandmarkDiscovered(ids, 'shahadah', LESSON_ONE_VALID_IDS);
  assert.equal(resDup.added, false);

  const progress = computeLessonOneProgress(LESSON_ONE_VALID_IDS, LESSON_ONE_LANDMARKS.length);
  assert.equal(progress.discoveredCount, 11);
  assert.equal(progress.totalCount, 11);
  assert.equal(progress.remainingCount, 0);
  assert.equal(progress.isComplete, true);
});

test('getNextUndiscoveredLandmark and getRegionFocusPoint guide user sequentially', () => {
  const first = getNextUndiscoveredLandmark(LESSON_ONE_LANDMARKS, []);
  assert.equal(first.id, 'shahadah');

  const second = getNextUndiscoveredLandmark(LESSON_ONE_LANDMARKS, ['shahadah']);
  assert.equal(second.id, 'salah');

  const horizon = getRegionFocusPoint('horizon');
  assert.equal(horizon.y, 215);
  const allFocus = getRegionFocusPoint('all');
  assert.equal(allFocus.x, 750);
  assert.equal(LOCKED_FUTURE_LESSONS.length, 3);
});

test('getAdjacentLandmarkId cycles seamlessly forward and backward', () => {
  const next = getAdjacentLandmarkId(LESSON_ONE_LANDMARKS, 'shahadah', 1);
  assert.equal(next, 'salah');
  const prevWrap = getAdjacentLandmarkId(LESSON_ONE_LANDMARKS, 'shahadah', -1);
  assert.equal(prevWrap, 'iman-qadr');
});

test('resolveLandmarkPoint resolves Night (x,y) and Daylight (dayX,dayY) coordinates accurately', () => {
  const shahadah = LESSON_ONE_LANDMARKS[0];
  const nightPt = resolveLandmarkPoint(shahadah, false);
  const dayPt = resolveLandmarkPoint(shahadah, true);
  assert.deepEqual(nightPt, { x: shahadah.x, y: shahadah.y });
  assert.deepEqual(dayPt, { x: shahadah.dayX, y: shahadah.dayY });
});

test('Lesson I dataset has exactly 5 Pillars of Islam + 6 Pillars of Iman with spacious layout', () => {
  const islamCount = LESSON_ONE_LANDMARKS.filter((l) => l.region === 'islam').length;
  const imanCount = LESSON_ONE_LANDMARKS.filter((l) => l.region === 'iman').length;
  assert.equal(islamCount, 5);
  assert.equal(imanCount, 6);

  for (let i = 0; i < LESSON_ONE_LANDMARKS.length; i += 1) {
    for (let j = i + 1; j < LESSON_ONE_LANDMARKS.length; j += 1) {
      const a = LESSON_ONE_LANDMARKS[i];
      const b = LESSON_ONE_LANDMARKS[j];
      const nightDist = Math.hypot(a.x - b.x, a.y - b.y);
      const dayDist = Math.hypot(a.dayX - b.dayX, a.dayY - b.dayY);
      assert.ok(nightDist >= 180, `Expected Night ${a.id} and ${b.id} distance >= 180, got ${nightDist}`);
      assert.ok(dayDist >= 180, `Expected Daylight ${a.id} and ${b.id} distance >= 180, got ${dayDist}`);
    }
  }
});

test('groupLessonOnePillars separates 5 Pillars of Islam and 6 Pillars of Faith with artifact metadata', () => {
  assert.equal(PILLAR_GROUPS.length, 2);
  const grouped = groupLessonOnePillars(LESSON_ONE_LANDMARKS, ['shahadah', 'salah', 'iman-allah']);
  assert.equal(grouped.islam.totalCount, 5);
  assert.equal(grouped.islam.discoveredCount, 2);
  assert.equal(grouped.islam.isComplete, false);
  assert.equal(grouped.iman.totalCount, 6);
  assert.equal(grouped.iman.discoveredCount, 1);
  assert.equal(grouped.iman.isComplete, false);

  for (const item of LESSON_ONE_LANDMARKS) {
    assert.ok(item.englishMeaning && item.englishMeaning.length > 0, `Missing englishMeaning for ${item.id}`);
    assert.ok(item.artifactName && item.artifactName.length > 0, `Missing artifactName for ${item.id}`);
    assert.ok(item.artifactSheet && item.artifactSheet.length > 0, `Missing artifactSheet for ${item.id}`);
  }
});

