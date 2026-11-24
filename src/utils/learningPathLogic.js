/**
 * Pure geometry and state helpers for the Learning Path click-origin expansion
 * and Lesson I Sanctuary Study Window state.
 * Decoupled from React/DOM so bounds, radius math, intro summaries, and lesson progress are unit-testable.
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
  const rawRect =
    target && typeof target.getBoundingClientRect === 'function'
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

/**
 * Evaluates a learner's answer to a Pillar's quick comprehension check.
 */
export function evaluatePillarCheckAnswer(landmark, selectedOptionIndex) {
  const check = landmark?.checkQuestion;
  if (!check || !Array.isArray(check.options)) {
    return {
      answered: false,
      isCorrect: false,
      correctIndex: 0,
      explanation: '',
    };
  }
  const hasAnswer =
    typeof selectedOptionIndex === 'number' &&
    selectedOptionIndex >= 0 &&
    selectedOptionIndex < check.options.length;
  const correctIdx = Number(check.correctIndex) || 0;
  return {
    answered: hasAnswer,
    isCorrect: hasAnswer && selectedOptionIndex === correctIdx,
    correctIndex: correctIdx,
    explanation: check.explanation || '',
  };
}

export const LESSON_ONE_STEPS = [
  { id: 'intro', kind: 'intro', group: 'overview', label: 'Overview' },
  { id: 'islam-study', kind: 'study', group: 'islam', label: 'Pillars of Islam' },
  { id: 'islam-quiz', kind: 'quiz', group: 'islam', label: 'Islam Check' },
  { id: 'iman-study', kind: 'study', group: 'iman', label: 'Pillars of Faith' },
  { id: 'iman-quiz', kind: 'quiz', group: 'iman', label: 'Faith Check' },
  { id: 'complete', kind: 'complete', group: 'all', label: 'Complete' },
];

/**
 * Returns the active learning steps (study + quiz) along with their indices in LESSON_ONE_STEPS.
 */
export function getLearningSteps(steps = LESSON_ONE_STEPS) {
  const safeSteps = Array.isArray(steps) && steps.length > 0 ? steps : LESSON_ONE_STEPS;
  return safeSteps
    .map((step, stepIndex) => ({ ...step, stepIndex }))
    .filter((step) => step.kind === 'study' || step.kind === 'quiz');
}

/**
 * Computes progress metrics across the intro, 4 active learning steps, and completion seal.
 */
export function getStepProgress(stepIndex, steps = LESSON_ONE_STEPS) {
  const safeSteps = Array.isArray(steps) && steps.length > 0 ? steps : LESSON_ONE_STEPS;
  const maxIndex = safeSteps.length - 1;
  const clampedIndex = clamp(Math.floor(Number(stepIndex) || 0), 0, maxIndex);
  const current = safeSteps[clampedIndex];
  const learningSteps = getLearningSteps(safeSteps);
  const totalLearningSteps = Math.max(1, learningSteps.length);
  const isIntroStep = current?.kind === 'intro';
  const isCompleteStep = current?.kind === 'complete';

  const learningPosition = learningSteps.findIndex((item) => item.stepIndex === clampedIndex);
  const displayNumber = isIntroStep
    ? 0
    : isCompleteStep
      ? totalLearningSteps
      : Math.max(1, learningPosition + 1);

  const ratio = isIntroStep
    ? 0
    : isCompleteStep
      ? 1
      : displayNumber / totalLearningSteps;

  return {
    index: clampedIndex,
    step: current,
    displayNumber,
    totalLearningSteps,
    isIntroStep,
    isCompleteStep,
    ratio: clamp(ratio, 0, 1),
  };
}

/**
 * Steps forward or backward cleanly within the lesson sequence.
 */
export function getAdjacentStepIndex(
  currentIndex,
  direction = 1,
  totalSteps = LESSON_ONE_STEPS.length
) {
  const maxIdx = Math.max(0, (Number(totalSteps) || 1) - 1);
  const step = direction < 0 ? -1 : 1;
  return clamp((Number(currentIndex) || 0) + step, 0, maxIdx);
}

/**
 * Resolves the best step index when a learner clicks the primary CTA on the Study Intro page.
 */
export function resolveResumeStepIndex(
  discoveredIds = [],
  landmarks = [],
  steps = LESSON_ONE_STEPS
) {
  const safeSteps = Array.isArray(steps) && steps.length > 0 ? steps : LESSON_ONE_STEPS;
  const islamStepIdx = Math.max(
    0,
    safeSteps.findIndex((s) => s.id === 'islam-study')
  );
  const imanStepIdx = Math.max(
    0,
    safeSteps.findIndex((s) => s.id === 'iman-study')
  );

  const grouped = groupLessonOnePillars(landmarks, discoveredIds);
  if (grouped.islam.isComplete && !grouped.iman.isComplete) {
    return imanStepIdx;
  }
  return islamStepIdx;
}

/**
 * Returns the first unread pillar ID in a group, or the first pillar ID if all are read.
 */
export function resolveFirstUnreadPillarId(items = [], discoveredIds = []) {
  if (!Array.isArray(items) || items.length === 0) return null;
  const discoveredSet = new Set(Array.isArray(discoveredIds) ? discoveredIds : []);
  const unread = items.find((item) => item?.id && !discoveredSet.has(item.id));
  return unread?.id || items[0]?.id || null;
}

/**
 * Builds clean, deterministic display data for the Study Window Introductory Page.
 */
export function buildStudyIntroSummary(
  landmarks = [],
  discoveredIds = [],
  steps = LESSON_ONE_STEPS
) {
  const progress = computeLessonOneProgress(discoveredIds, landmarks.length || 11);
  const grouped = groupLessonOnePillars(landmarks, discoveredIds);
  const resumeStepIndex = resolveResumeStepIndex(discoveredIds, landmarks, steps);

  let ctaLabel = 'Start Lesson';
  let statusText = '11 short topics · 2 quick checks · ~5 min';

  if (progress.isComplete) {
    ctaLabel = 'Review Lesson';
    statusText = `All ${progress.totalCount} topics explored · Ready to review`;
  } else if (progress.discoveredCount > 0) {
    ctaLabel = 'Continue Lesson';
    statusText = `${progress.discoveredCount} of ${progress.totalCount} topics explored · ~5 min`;
  }

  return {
    ctaLabel,
    statusText,
    resumeStepIndex,
    progress,
    grouped,
  };
}

/**
 * Evaluates a single quiz question selection cleanly.
 */
export function evaluateQuizQuestion(question, selectedIndex) {
  if (!question || !Array.isArray(question.options)) {
    return { answered: false, isCorrect: false, correctIndex: 0, explanation: '' };
  }
  const hasAnswer =
    typeof selectedIndex === 'number' &&
    selectedIndex >= 0 &&
    selectedIndex < question.options.length;
  const correctIdx = Number(question.correctIndex) || 0;
  return {
    answered: hasAnswer,
    isCorrect: hasAnswer && selectedIndex === correctIdx,
    correctIndex: correctIdx,
    explanation: question.explanation || '',
  };
}
