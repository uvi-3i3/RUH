/**
 * Pure geometry and state helpers for the Learning Path click-origin expansion.
 * Decoupled from React/DOM so bounds and radius math are unit-testable.
 */

export const DEFAULT_TRANSITION_MS = 460;

/**
 * Clamps a numeric value between min and max.
 */
export function clamp(value, min, max) {
  if (!Number.isFinite(value)) return min;
  if (max < min) return min;
  return Math.min(max, Math.max(min, value));
}

/**
 * Normalizes the click origin (point + source bounding rect) against viewport dimensions.
 * Handles missing rects or keyboard-triggered clicks (where clientX/clientY may be 0,0).
 */
export function normalizeClickOrigin(origin, viewport) {
  const vw = Math.max(1, Number(viewport?.width) || 390);
  const vh = Math.max(1, Number(viewport?.height) || 844);

  const rawRect = origin?.rect;
  const hasValidRect =
    rawRect &&
    Number.isFinite(rawRect.left) &&
    Number.isFinite(rawRect.top) &&
    Number.isFinite(rawRect.width) &&
    Number.isFinite(rawRect.height) &&
    rawRect.width > 0 &&
    rawRect.height > 0;

  const rect = hasValidRect
    ? {
        left: clamp(rawRect.left, 0, vw),
        top: clamp(rawRect.top, 0, vh),
        width: clamp(rawRect.width, 1, vw),
        height: clamp(rawRect.height, 1, vh),
      }
    : {
        left: Math.round(vw * 0.1),
        top: Math.round(vh * 0.65),
        width: Math.round(vw * 0.8),
        height: 92,
      };

  const rawPoint = origin?.point;
  const hasExplicitPoint =
    rawPoint &&
    Number.isFinite(rawPoint.x) &&
    Number.isFinite(rawPoint.y) &&
    (rawPoint.x !== 0 || rawPoint.y !== 0);

  const point = hasExplicitPoint
    ? {
        x: clamp(rawPoint.x, 0, vw),
        y: clamp(rawPoint.y, 0, vh),
      }
    : {
        x: clamp(rect.left + rect.width / 2, 0, vw),
        y: clamp(rect.top + rect.height / 2, 0, vh),
      };

  return {
    viewport: { width: vw, height: vh },
    rect,
    point,
  };
}

/**
 * Computes the minimum circular radius (in px) centered at `point`
 * needed to completely cover all 4 corners of the viewport.
 */
export function computeExpansionRadius(point, viewport) {
  const vw = Math.max(1, Number(viewport?.width) || 390);
  const vh = Math.max(1, Number(viewport?.height) || 844);
  const x = clamp(Number(point?.x) || vw / 2, 0, vw);
  const y = clamp(Number(point?.y) || vh / 2, 0, vh);

  const dx = Math.max(x, vw - x);
  const dy = Math.max(y, vh - y);

  // Add a small 16px buffer so subpixel rounding never leaves edge hairlines
  return Math.ceil(Math.hypot(dx, dy)) + 16;
}

/**
 * Computes CSS clip-path and transform-origin styles for each phase of the
 * click-origin engulf transition:
 * - 'idle-closed': collapsed at clicked point (0px circle)
 * - 'expanding' / 'open': expanded circle covering the full viewport
 * - 'closing': collapsed back to the clicked point
 */
export function buildOriginMorphStyles(origin, viewport, phase = 'open', reducedMotion = false) {
  const { viewport: vp, point } = normalizeClickOrigin(origin, viewport);
  const maxRadius = computeExpansionRadius(point, vp);
  const originCss = `${Math.round(point.x)}px ${Math.round(point.y)}px`;

  if (reducedMotion) {
    const isVisible = phase === 'expanding' || phase === 'open';
    return {
      clipPath: 'none',
      transform: 'scale(1)',
      transformOrigin: originCss,
      opacity: isVisible ? 1 : 0,
      transition: 'opacity 180ms ease-out',
      point,
      maxRadius,
    };
  }

  const isEngulfed = phase === 'expanding' || phase === 'open';
  const radius = isEngulfed ? maxRadius : 0;

  return {
    clipPath: `circle(${radius}px at ${Math.round(point.x)}px ${Math.round(point.y)}px)`,
    transform: isEngulfed ? 'scale(1)' : 'scale(0.94)',
    transformOrigin: originCss,
    opacity: isEngulfed ? 1 : 0.88,
    transition: [
      `clip-path ${DEFAULT_TRANSITION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
      `transform ${DEFAULT_TRANSITION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
      `opacity ${Math.round(DEFAULT_TRANSITION_MS * 0.55)}ms ease-out`,
    ].join(', '),
    point,
    maxRadius,
  };
}

/**
 * Captures an origin payload from a DOM click / pointer event cleanly.
 */
export function captureClickOriginFromEvent(event, fallbackElement = null) {
  const target = event?.currentTarget || fallbackElement;
  const rawRect = target && typeof target.getBoundingClientRect === 'function'
    ? target.getBoundingClientRect()
    : null;

  const rect = rawRect
    ? {
        left: rawRect.left,
        top: rawRect.top,
        width: rawRect.width,
        height: rawRect.height,
      }
    : null;

  const clientX = typeof event?.clientX === 'number' ? event.clientX : 0;
  const clientY = typeof event?.clientY === 'number' ? event.clientY : 0;

  return {
    rect,
    point: { x: clientX, y: clientY },
  };
}

export const MAP_DEFAULT_WORLD = { width: 1500, height: 1120 };
export const MAP_MIN_ZOOM = 0.48;
export const MAP_MAX_ZOOM = 1.85;
export const MAP_DRAG_THRESHOLD_PX = 6;

/**
 * Resolves theme-specific coordinates `(x, y)` for a landmark or gate.
 */
export function resolveLandmarkPoint(item, isLightMode = false) {
  if (!item) return { x: 750, y: 560 };
  const x = isLightMode && Number.isFinite(item.dayX) ? item.dayX : item.x;
  const y = isLightMode && Number.isFinite(item.dayY) ? item.dayY : item.y;
  return { x: Number(x) || 750, y: Number(y) || 560 };
}

/**
 * Computes a comfortable initial zoom factor for the 1500x1120 Ancient Map Canvas.
 */
export function getInitialMapZoom(viewport) {
  const vw = Math.max(1, Number(viewport?.width) || 390);
  const vh = Math.max(1, Number(viewport?.height) || 844);
  if (vw < 640) {
    return clamp(Math.max(vw / 565, vh / 1220), 0.69, 0.84);
  }
  return clamp(Math.min(vw / 1640, vh / 1020), 0.86, 1.08);
}

/**
 * Clamps map translation `(x, y)` and `zoom` so the parchment map fills the
 * viewport without leaving void gaps past its outer margins.
 */
export function clampMapCamera(camera, viewport, worldSize = MAP_DEFAULT_WORLD) {
  const vw = Math.max(1, Number(viewport?.width) || 390);
  const vh = Math.max(1, Number(viewport?.height) || 844);
  const ww = Math.max(1, Number(worldSize?.width) || MAP_DEFAULT_WORLD.width);
  const wh = Math.max(1, Number(worldSize?.height) || MAP_DEFAULT_WORLD.height);

  const zoom = clamp(Number(camera?.zoom) || 1, MAP_MIN_ZOOM, MAP_MAX_ZOOM);
  const scaledW = ww * zoom;
  const scaledH = wh * zoom;

  let x;
  if (scaledW <= vw) {
    x = (vw - scaledW) / 2;
  } else {
    const minX = vw - scaledW;
    x = clamp(Number(camera?.x) || 0, minX, 0);
  }

  let y;
  if (scaledH <= vh) {
    y = (vh - scaledH) / 2;
  } else {
    const minY = vh - scaledH;
    y = clamp(Number(camera?.y) || 0, minY, 0);
  }

  return {
    x: Math.round(x * 100) / 100,
    y: Math.round(y * 100) / 100,
    zoom: Math.round(zoom * 1000) / 1000,
  };
}

/**
 * Centers the viewport on a world coordinate `(wx, wy)` at `zoom`, placing the
 * focal point at `focusYRatio` (e.g. 0.44 keeps landmarks visible above a bottom nameplate).
 */
export function centerCameraOnPoint(
  worldPoint,
  viewport,
  zoom = 1,
  worldSize = MAP_DEFAULT_WORLD,
  focusYRatio = 0.44
) {
  const vw = Math.max(1, Number(viewport?.width) || 390);
  const vh = Math.max(1, Number(viewport?.height) || 844);
  const safeZoom = clamp(Number(zoom) || 1, MAP_MIN_ZOOM, MAP_MAX_ZOOM);
  const wx = Number(worldPoint?.x) || worldSize.width / 2;
  const wy = Number(worldPoint?.y) || worldSize.height / 2;

  const targetX = vw * 0.5 - wx * safeZoom;
  const targetY = vh * clamp(focusYRatio, 0.2, 0.8) - wy * safeZoom;

  return clampMapCamera({ x: targetX, y: targetY, zoom: safeZoom }, viewport, worldSize);
}

/**
 * Zooms the camera toward `nextZoom` while anchoring the point at the center of the viewport.
 */
export function zoomCameraAtCenter(camera, nextZoom, viewport, worldSize = MAP_DEFAULT_WORLD) {
  const vw = Math.max(1, Number(viewport?.width) || 390);
  const vh = Math.max(1, Number(viewport?.height) || 844);
  const prevZoom = clamp(Number(camera?.zoom) || 1, MAP_MIN_ZOOM, MAP_MAX_ZOOM);
  const targetZoom = clamp(Number(nextZoom) || prevZoom, MAP_MIN_ZOOM, MAP_MAX_ZOOM);

  const worldCenterX = (vw * 0.5 - (Number(camera?.x) || 0)) / prevZoom;
  const worldCenterY = (vh * 0.5 - (Number(camera?.y) || 0)) / prevZoom;

  const x = vw * 0.5 - worldCenterX * targetZoom;
  const y = vh * 0.5 - worldCenterY * targetZoom;

  return clampMapCamera({ x, y, zoom: targetZoom }, viewport, worldSize);
}

/**
 * Distinguishes clean landmark taps from map drag pans.
 */
export function isPointerDragExceeded(startPoint, currentPoint, threshold = MAP_DRAG_THRESHOLD_PX) {
  if (!startPoint || !currentPoint) return false;
  const dx = (Number(currentPoint.x) || 0) - (Number(startPoint.x) || 0);
  const dy = (Number(currentPoint.y) || 0) - (Number(startPoint.y) || 0);
  return Math.hypot(dx, dy) > threshold;
}

/**
 * Sanitizes persisted landmark IDs against valid Lesson 1 landmark IDs.
 */
export function parseDiscoveredLandmarks(rawValue, validIds = []) {
  if (!rawValue) return [];
  const validSet = new Set(validIds);
  let parsed = rawValue;
  if (typeof rawValue === 'string') {
    try {
      parsed = JSON.parse(rawValue);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(parsed)) return [];

  const result = [];
  const seen = new Set();
  for (const item of parsed) {
    if (typeof item === 'string' && validSet.has(item) && !seen.has(item)) {
      seen.add(item);
      result.push(item);
    }
  }
  return result;
}

/**
 * Purely marks a landmark as discovered if valid and not already present.
 */
export function markLandmarkDiscovered(currentIds, landmarkId, validIds = []) {
  const safeCurrent = Array.isArray(currentIds) ? currentIds : [];
  if (typeof landmarkId !== 'string' || !validIds.includes(landmarkId)) {
    return { nextIds: safeCurrent, added: false };
  }
  if (safeCurrent.includes(landmarkId)) {
    return { nextIds: safeCurrent, added: false };
  }
  return { nextIds: [...safeCurrent, landmarkId], added: true };
}

/**
 * Computes Lesson 1 discovery summary.
 */
export function computeLessonOneProgress(discoveredIds, totalCount = 11) {
  const safeTotal = Math.max(1, Number(totalCount) || 11);
  const count = Array.isArray(discoveredIds)
    ? Math.min(safeTotal, new Set(discoveredIds).size)
    : 0;
  return {
    discoveredCount: count,
    totalCount: safeTotal,
    remainingCount: Math.max(0, safeTotal - count),
    isComplete: count >= safeTotal,
    ratio: count / safeTotal,
  };
}

/**
 * Returns the first undiscovered landmark in sequential order, or the first landmark if all discovered.
 */
export function getNextUndiscoveredLandmark(landmarks, discoveredIds = []) {
  if (!Array.isArray(landmarks) || landmarks.length === 0) return null;
  const discoveredSet = new Set(Array.isArray(discoveredIds) ? discoveredIds : []);
  const next = landmarks.find((item) => !discoveredSet.has(item.id));
  return next || landmarks[0];
}

/**
 * Returns world focal point for a named chapter zone ('islam' | 'iman' | 'horizon').
 */
export function getRegionFocusPoint(zoneKey) {
  if (zoneKey === 'all') {
    return { x: 750, y: 535, focusYRatio: 0.5 };
  }
  if (zoneKey === 'iman') {
    return { x: 1124, y: 538, focusYRatio: 0.5 };
  }
  if (zoneKey === 'horizon') {
    return { x: 750, y: 215, focusYRatio: 0.36 };
  }
  return { x: 376, y: 538, focusYRatio: 0.5 };
}

/**
 * Returns adjacent landmark ID along the trail (`direction`: 1 for Next, -1 for Prev).
 */
export function getAdjacentLandmarkId(landmarks, currentId, direction = 1) {
  if (!Array.isArray(landmarks) || landmarks.length === 0) return null;
  const idx = landmarks.findIndex((item) => item.id === currentId);
  if (idx === -1) {
    return landmarks[0].id;
  }
  const step = direction < 0 ? -1 : 1;
  const nextIdx = (idx + step + landmarks.length) % landmarks.length;
  return landmarks[nextIdx].id;
}

/**
 * Groups Lesson I Pillars into their two canonical sections ('islam' and 'iman')
 * with per-group discovery counts and completion status for immediate first-glance clarity.
 */
export function groupLessonOnePillars(landmarks = [], discoveredIds = []) {
  const safeList = Array.isArray(landmarks) ? landmarks : [];
  const discoveredSet = new Set(Array.isArray(discoveredIds) ? discoveredIds : []);

  const islamItems = safeList.filter((item) => item.region === 'islam');
  const imanItems = safeList.filter((item) => item.region === 'iman');

  const islamDiscovered = islamItems.filter((item) => discoveredSet.has(item.id)).length;
  const imanDiscovered = imanItems.filter((item) => discoveredSet.has(item.id)).length;

  return {
    islam: {
      id: 'islam',
      items: islamItems,
      discoveredCount: islamDiscovered,
      totalCount: islamItems.length,
      isComplete: islamItems.length > 0 && islamDiscovered >= islamItems.length,
    },
    iman: {
      id: 'iman',
      items: imanItems,
      discoveredCount: imanDiscovered,
      totalCount: imanItems.length,
      isComplete: imanItems.length > 0 && imanDiscovered >= imanItems.length,
    },
  };
}


