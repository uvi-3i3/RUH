import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeStreaks,
  normalizeText,
  splitParagraphs,
  resolveVerseCopy,
  selectActiveBurhan,
  gregorianToHijri,
  computeParallaxOffset,
  lerpParallax,
  resolveBurhanCopy,
  filterBurhansByCategory,
  findResonantVerse,
} from './devotionLogic.js';

test('computeStreaks calculates current and longest streaks accurately', () => {
  const refDate = new Date(2026, 10, 12, 12, 0, 0); // 2026-11-12
  const history = {
    '2026-11-01': { prayers: 5, verses: 2 },
    '2026-11-02': { prayers: 3, verses: 1 },
    '2026-11-03': { prayers: 4, verses: 0 },
    '2026-11-04': { prayers: 5, verses: 5 },
    // gap
    '2026-11-11': { prayers: 2, verses: 1 },
    '2026-11-12': { prayers: 1, verses: 0 },
  };

  const result = computeStreaks(history, refDate);
  assert.equal(result.currentStreak, 2);
  assert.equal(result.longestStreak, 4);
});

test('computeStreaks preserves streak if today has no activity yet but yesterday did', () => {
  const refDate = new Date(2026, 10, 12, 9, 0, 0); // 2026-11-12
  const history = {
    '2026-11-09': { prayers: 5, verses: 0 },
    '2026-11-10': { prayers: 5, verses: 0 },
    '2026-11-11': { prayers: 5, verses: 0 },
  };

  const result = computeStreaks(history, refDate);
  assert.equal(result.currentStreak, 3);
  assert.equal(result.longestStreak, 3);
});

test('normalizeText and splitParagraphs handle both literal and escaped newlines', () => {
  const raw = 'First paragraph.\\n\\nSecond paragraph.\n\nThird paragraph.';
  assert.equal(normalizeText('Line 1\\nLine 2'), 'Line 1\nLine 2');
  const paragraphs = splitParagraphs(raw);
  assert.deepEqual(paragraphs, [
    'First paragraph.',
    'Second paragraph.',
    'Third paragraph.',
  ]);
});

test('resolveVerseCopy respects isSimpleMode and cleans escaped newlines', () => {
  const verse = {
    t: 'Allah does not burden a soul\nbeyond that it can bear.',
    c: 'Deep theological context.',
    simpleT: 'God does not give a person\\nmore than they can handle.',
    simpleC: 'Simple context.',
  };

  const standard = resolveVerseCopy(verse, false);
  assert.equal(standard.translation, 'Allah does not burden a soul\nbeyond that it can bear.');
  assert.equal(standard.context, 'Deep theological context.');

  const simple = resolveVerseCopy(verse, true);
  assert.equal(simple.translation, 'God does not give a person\nmore than they can handle.');
  assert.equal(simple.context, 'Simple context.');
});

test('selectActiveBurhan is deterministic across TasksView and BurhanOverlay', () => {
  const list = [{ id: 'b1' }, { id: 'b2' }, { id: 'b3' }, { id: 'b4' }];
  assert.equal(selectActiveBurhan(list, 0, 0).id, 'b1');
  assert.equal(selectActiveBurhan(list, 1, 1).id, 'b4');
  assert.equal(selectActiveBurhan(list, 2, 1).id, 'b2');
});

test('gregorianToHijri returns valid Hijri date components', () => {
  const hijri = gregorianToHijri(new Date(2026, 10, 12));
  assert.ok(hijri.year >= 1447 && hijri.year <= 1449);
  assert.ok(hijri.month >= 1 && hijri.month <= 12);
  assert.ok(hijri.day >= 1 && hijri.day <= 30);
});

test('computeParallaxOffset maps viewport coordinates to clamped opposing depth offsets', () => {
  assert.deepEqual(computeParallaxOffset(720, 450, 1440, 900, 24, 14), { x: 0, y: 0 });
  assert.deepEqual(computeParallaxOffset(0, 0, 1440, 900, 24, 14), { x: 24, y: 14 });
  assert.deepEqual(computeParallaxOffset(1440, 900, 1440, 900, 24, 14), { x: -24, y: -14 });
  assert.deepEqual(computeParallaxOffset(5000, -200, 1440, 900, 24, 14), { x: -24, y: 14 });
  assert.deepEqual(computeParallaxOffset(100, 100, 0, 900, 24, 14), { x: 0, y: 0 });
});

test('lerpParallax smoothly interpolates toward target offset', () => {
  assert.equal(lerpParallax(0, 20, 0.1), 2);
  assert.equal(lerpParallax(10, 10, 0.08), 10);
});

test('resolveBurhanCopy splits Classical and Simple paragraphs, logic steps, and questions', () => {
  const flatBurhan = {
    content: 'Para one.\\n\\nPara two.',
    simpleContent: 'Easy one.\\n\\nEasy two.',
    question: 'Deep question?',
    simpleQuestion: 'Simple question?',
    premises: ['Formal P1', 'Formal P2'],
    conclusion: 'Therefore C.',
    simplePremises: ['Simple P1', 'Simple P2'],
    simpleConclusion: 'So C.',
  };
  assert.deepEqual(resolveBurhanCopy(flatBurhan, false), {
    paragraphs: ['Para one.', 'Para two.'],
    question: 'Deep question?',
    premises: ['Formal P1', 'Formal P2'],
    conclusion: 'Therefore C.',
  });
  assert.deepEqual(resolveBurhanCopy(flatBurhan, true), {
    paragraphs: ['Easy one.', 'Easy two.'],
    question: 'Simple question?',
    premises: ['Simple P1', 'Simple P2'],
    conclusion: 'So C.',
  });
  const nestedBurhan = {
    content: 'Nested body.',
    logicSteps: { premises: ['NP1'], conclusion: 'NC' },
    simpleLogicSteps: { premises: ['SNP1'], conclusion: 'SNC' },
  };
  assert.deepEqual(resolveBurhanCopy(nestedBurhan, false).premises, ['NP1']);
  assert.equal(resolveBurhanCopy(nestedBurhan, true).conclusion, 'SNC');
  assert.deepEqual(resolveBurhanCopy(null, false), {
    paragraphs: [],
    question: '',
    premises: [],
    conclusion: '',
  });
});

test('filterBurhansByCategory isolates islam and theism proofs cleanly', () => {
  const sample = [
    { id: 'b1', category: 'theism' },
    { id: 'b9', category: 'islam' },
    { id: 'b10', category: 'islam' },
  ];
  assert.equal(filterBurhansByCategory(sample, 'all').length, 3);
  assert.deepEqual(
    filterBurhansByCategory(sample, 'islam').map((x) => x.id),
    ['b9', 'b10']
  );
  assert.deepEqual(
    filterBurhansByCategory(sample, 'theism').map((x) => x.id),
    ['b1']
  );
});

test('findResonantVerse matches reflection themes offline and excludes the current verse', () => {
  const verses = [
    {
      id: 's1v1',
      t: 'Allah does not burden a soul beyond that it can bear.',
      c: 'A guarantee of resilience during hard trials.',
    },
    {
      id: 's3v1',
      t: 'We are closer to him than his jugular vein.',
      c: 'Comfort in moments of intense isolation and loneliness.',
    },
    {
      id: 's4v1',
      t: 'Do not despair of the mercy of Allah.',
      c: 'Comforting verse for anyone carrying guilt of past sins and seeking forgiveness.',
    },
    {
      id: 's2h1',
      t: 'Whoever gives thanks for a blessing has bound it.',
      c: 'Gratitude preserves and multiplies good things.',
    },
  ];

  const lonelyMatch = findResonantVerse('I feel completely alone and isolated tonight.', verses, 's1v1');
  assert.equal(lonelyMatch?.id, 's3v1');

  const guiltMatch = findResonantVerse('I feel ashamed of my mistakes and need forgiveness.', verses, 's1v1');
  assert.equal(guiltMatch?.id, 's4v1');

  const excludedSelf = findResonantVerse('Trying to bear a heavy trial', verses, 's1v1');
  assert.notEqual(excludedSelf?.id, 's1v1');

  assert.equal(findResonantVerse('', verses), null);
  assert.equal(findResonantVerse('gratitude', []), null);
});

test('generateCleanStarfield guarantees non-overlapping stars within clean sky bounds', async () => {
  const { generateCleanStarfield } = await import('./devotionLogic.js');
  const stars = generateCleanStarfield({ count: 36, minDistance: 7.4, seed: 1448 });
  assert.ok(stars.length >= 24 && stars.length <= 36);

  for (let i = 0; i < stars.length; i++) {
    const a = stars[i];
    assert.ok(a.x >= 4 && a.x <= 96);
    assert.ok(a.y >= 4 && a.y <= 53);
    assert.ok(a.size >= 0.8 && a.size <= 2.5);
    assert.equal(a.x > 38 && a.x < 62 && a.y < 12, false);

    for (let j = i + 1; j < stars.length; j++) {
      const b = stars[j];
      const dist = Math.hypot(a.x - b.x, (a.y - b.y) * 1.45);
      assert.ok(dist >= 7.4, `Stars ${i} and ${j} too close: ${dist}`);
    }
  }
});

test('calculateQiblaBearing and calculateDistanceToKaabaKm match known geographic bearings', async () => {
  const {
    calculateQiblaBearing,
    calculateDistanceToKaabaKm,
    formatCardinalDirection,
  } = await import('./devotionLogic.js');

  // London -> ~118.9° (ESE / SE)
  const londonQibla = calculateQiblaBearing(51.5074, -0.1278);
  assert.ok(londonQibla >= 117 && londonQibla <= 121, `Expected ~119°, got ${londonQibla}`);
  assert.equal(formatCardinalDirection(londonQibla), 'SE');
  const londonDist = calculateDistanceToKaabaKm(51.5074, -0.1278);
  assert.ok(londonDist >= 4750 && londonDist <= 4850, `Expected ~4790km, got ${londonDist}`);

  // New York -> ~58.5° (NE)
  const nycQibla = calculateQiblaBearing(40.7128, -74.006);
  assert.ok(nycQibla >= 56 && nycQibla <= 61, `Expected ~58.5°, got ${nycQibla}`);
  assert.equal(formatCardinalDirection(nycQibla), 'NE');

  // Invalid inputs
  assert.equal(calculateQiblaBearing(null, 10), null);
  assert.equal(calculateDistanceToKaabaKm(undefined, 10), null);
});

test('formatCountdown and getAngularDelta handle prayer countdowns and compass delta cleanly', async () => {
  const { formatCountdown, getAngularDelta } = await import('./devotionLogic.js');

  assert.equal(formatCountdown(0), 'Now');
  assert.equal(formatCountdown(42), '42m');
  assert.equal(formatCountdown(60), '1h');
  assert.equal(formatCountdown(135), '2h 15m');
  assert.equal(formatCountdown(-5), '');

  assert.equal(getAngularDelta(350, 10), 20);
  assert.equal(getAngularDelta(10, 350), -20);
  assert.equal(getAngularDelta(119, 119), 0);
});

test('getRecommendedAdhkarPeriod and filterCities behave deterministically', async () => {
  const { getRecommendedAdhkarPeriod, filterCities } = await import('./devotionLogic.js');

  assert.equal(getRecommendedAdhkarPeriod(new Date(2026, 10, 13, 7, 30)), 'sabah');
  assert.equal(getRecommendedAdhkarPeriod(new Date(2026, 10, 13, 16, 45)), 'masa');

  const sampleCities = [
    { id: 'makkah', name: 'Makkah', country: 'Saudi Arabia' },
    { id: 'london', name: 'London', country: 'United Kingdom' },
    { id: 'karachi', name: 'Karachi', country: 'Pakistan' },
  ];
  assert.equal(filterCities(sampleCities, '').length, 3);
  assert.deepEqual(filterCities(sampleCities, 'lon').map((c) => c.id), ['london']);
  assert.deepEqual(filterCities(sampleCities, 'pak').map((c) => c.id), ['karachi']);
});

test('buildStreakStatus tracks 7-day cadence, practices activity, at-risk state, and milestones', async () => {
  const { buildStreakStatus, computeStreaks } = await import('./devotionLogic.js');
  const ref = new Date(2026, 10, 13, 17, 0); // 2026-11-13

  // 1. Practices alone count as a valid streak day
  const practiceOnlyHistory = {
    '2026-11-11': { prayers: 0, verses: 0, practices: 2 },
    '2026-11-12': { prayers: 2, verses: 1, practices: 0 },
    '2026-11-13': { prayers: 5, verses: 2, practices: 1 },
  };
  assert.deepEqual(computeStreaks(practiceOnlyHistory, ref), {
    currentStreak: 3,
    longestStreak: 3,
  });

  const activeStatus = buildStreakStatus(practiceOnlyHistory, ref);
  assert.equal(activeStatus.currentStreak, 3);
  assert.equal(activeStatus.todayActive, true);
  assert.equal(activeStatus.atRisk, false);
  assert.equal(activeStatus.weekDays.length, 7);
  assert.equal(activeStatus.weekDays[6].isToday, true);
  assert.equal(activeStatus.weekDays[6].tier, 3); // all 3 categories + 5 prayers
  assert.equal(activeStatus.activeMilestone?.id, 'thabat');
  assert.equal(activeStatus.nextMilestone?.id, 'usbu');
  assert.ok(activeStatus.unlockedMilestoneIds.includes('bidayah'));
  assert.ok(activeStatus.unlockedMilestoneIds.includes('thabat'));
  assert.equal(activeStatus.unlockedMilestoneIds.includes('usbu'), false);

  // 2. Yesterday active, today idle -> atRisk === true
  const atRiskHistory = {
    '2026-11-01': { prayers: 5, verses: 5 },
    '2026-11-02': { prayers: 5, verses: 5 },
    '2026-11-03': { prayers: 5, verses: 5 },
    '2026-11-04': { prayers: 5, verses: 5 },
    '2026-11-05': { prayers: 5, verses: 5 },
    '2026-11-06': { prayers: 5, verses: 5 },
    '2026-11-07': { prayers: 5, verses: 5 },
    '2026-11-12': { prayers: 1, verses: 0 },
  };
  const atRiskStatus = buildStreakStatus(atRiskHistory, ref);
  assert.equal(atRiskStatus.currentStreak, 1);
  assert.equal(atRiskStatus.longestStreak, 7);
  assert.equal(atRiskStatus.todayActive, false);
  assert.equal(atRiskStatus.atRisk, true);
  // 7-day Lunar Week milestone remains permanently unlocked from longestStreak
  assert.ok(atRiskStatus.unlockedMilestoneIds.includes('usbu'));

  // 3. Empty history
  const emptyStatus = buildStreakStatus({}, ref);
  assert.equal(emptyStatus.currentStreak, 0);
  assert.equal(emptyStatus.todayActive, false);
  assert.equal(emptyStatus.atRisk, false);
  assert.equal(emptyStatus.activeMilestone, null);
  assert.equal(emptyStatus.nextMilestone.id, 'bidayah');
  assert.equal(emptyStatus.progressToNextPct, 0);
});


