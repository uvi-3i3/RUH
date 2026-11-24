import test from 'node:test';
import assert from 'node:assert/strict';
import {
  LESSON_ONE_STEPS,
  buildOriginMorphStyles,
  buildStudyIntroSummary,
  captureClickOriginFromEvent,
  computeExpansionRadius,
  computeLessonOneProgress,
  evaluatePillarCheckAnswer,
  evaluateQuizQuestion,
  getAdjacentStepIndex,
  getLearningSteps,
  getStepProgress,
  groupLessonOnePillars,
  markLandmarkDiscovered,
  normalizeClickOrigin,
  parseDiscoveredLandmarks,
  resolveFirstUnreadPillarId,
  resolveResumeStepIndex,
} from './learningPathLogic';
import {
  LESSON_ONE_GROUP_QUIZZES,
  LESSON_ONE_INTRO,
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

test('Lesson I dataset has intro metadata, 5 Pillars of Islam, 6 Pillars of Iman, and concise copy', () => {
  assert.ok(LESSON_ONE_INTRO.title.length > 0);
  assert.ok(LESSON_ONE_INTRO.subtitle.length > 0 && LESSON_ONE_INTRO.subtitle.length <= 130);

  const islamCount = LESSON_ONE_LANDMARKS.filter((l) => l.region === 'islam').length;
  const imanCount = LESSON_ONE_LANDMARKS.filter((l) => l.region === 'iman').length;
  assert.equal(islamCount, 5);
  assert.equal(imanCount, 6);
  assert.ok(LOCKED_FUTURE_LESSONS.length >= 1);
  assert.equal(LESSON_ONE_GROUP_QUIZZES.islam.length, 2);
  assert.equal(LESSON_ONE_GROUP_QUIZZES.iman.length, 2);

  for (const item of LESSON_ONE_LANDMARKS) {
    assert.ok(
      item.shortSummary && item.shortSummary.length > 20 && item.shortSummary.length <= 170,
      `shortSummary should stay concise for ${item.id}`
    );
    assert.ok(
      Array.isArray(item.shortPractice) && item.shortPractice.length === 2,
      `Expected 2 concise shortPractice takeaways for ${item.id}`
    );
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
    assert.ok(item.arabicFormula && item.arabicFormula.length > 0, `Missing arabicFormula for ${item.id}`);
    assert.ok(Array.isArray(item.keyTerms) && item.keyTerms.length === 3, `Expected 3 keyTerms for ${item.id}`);
    assert.ok(item.checkQuestion && Array.isArray(item.checkQuestion.options), `Missing checkQuestion for ${item.id}`);
  }
});

test('evaluatePillarCheckAnswer and evaluateQuizQuestion evaluate answers accurately', () => {
  const shahadah = LESSON_ONE_LANDMARKS[0];
  const unanswered = evaluatePillarCheckAnswer(shahadah, undefined);
  assert.equal(unanswered.answered, false);
  assert.equal(unanswered.isCorrect, false);

  const correctEval = evaluatePillarCheckAnswer(shahadah, shahadah.checkQuestion.correctIndex);
  assert.equal(correctEval.answered, true);
  assert.equal(correctEval.isCorrect, true);
  assert.ok(correctEval.explanation.length > 10);

  const quizQ = LESSON_ONE_GROUP_QUIZZES.islam[0];
  const wrongQ = evaluateQuizQuestion(quizQ, 1);
  assert.equal(wrongQ.answered, true);
  assert.equal(wrongQ.isCorrect, false);
  const rightQ = evaluateQuizQuestion(quizQ, quizQ.correctIndex);
  assert.equal(rightQ.answered, true);
  assert.equal(rightQ.isCorrect, true);
});

test('getStepProgress and getAdjacentStepIndex handle intro, 4 learning steps, and completion', () => {
  assert.equal(LESSON_ONE_STEPS.length, 6);
  const learningSteps = getLearningSteps(LESSON_ONE_STEPS);
  assert.equal(learningSteps.length, 4);

  const intro = getStepProgress(0);
  assert.equal(intro.step.id, 'intro');
  assert.equal(intro.isIntroStep, true);
  assert.equal(intro.displayNumber, 0);
  assert.equal(intro.totalLearningSteps, 4);
  assert.equal(intro.ratio, 0);

  const firstStudy = getStepProgress(1);
  assert.equal(firstStudy.step.id, 'islam-study');
  assert.equal(firstStudy.isIntroStep, false);
  assert.equal(firstStudy.displayNumber, 1);
  assert.equal(firstStudy.ratio, 0.25);

  const complete = getStepProgress(5);
  assert.equal(complete.isCompleteStep, true);
  assert.equal(complete.ratio, 1);

  assert.equal(getAdjacentStepIndex(0, -1), 0);
  assert.equal(getAdjacentStepIndex(0, 1), 1);
  assert.equal(getAdjacentStepIndex(5, 1), 5);
});

test('buildStudyIntroSummary, resolveResumeStepIndex, and resolveFirstUnreadPillarId adapt to learner progress', () => {
  const fresh = buildStudyIntroSummary(LESSON_ONE_LANDMARKS, []);
  assert.equal(fresh.ctaLabel, 'Start Lesson');
  assert.equal(fresh.resumeStepIndex, 1);

  const partialIslam = buildStudyIntroSummary(LESSON_ONE_LANDMARKS, ['shahadah', 'salah']);
  assert.equal(partialIslam.ctaLabel, 'Continue Lesson');
  assert.equal(partialIslam.resumeStepIndex, 1);

  const islamDoneIds = LESSON_ONE_LANDMARKS.filter((l) => l.region === 'islam').map((l) => l.id);
  assert.equal(resolveResumeStepIndex(islamDoneIds, LESSON_ONE_LANDMARKS), 3);

  const allDone = buildStudyIntroSummary(LESSON_ONE_LANDMARKS, LESSON_ONE_VALID_IDS);
  assert.equal(allDone.ctaLabel, 'Review Lesson');
  assert.equal(allDone.progress.isComplete, true);

  const islamItems = LESSON_ONE_LANDMARKS.filter((l) => l.region === 'islam');
  assert.equal(resolveFirstUnreadPillarId(islamItems, ['shahadah']), 'salah');
  assert.equal(resolveFirstUnreadPillarId(islamItems, islamDoneIds), 'shahadah');
});
