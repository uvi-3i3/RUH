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
