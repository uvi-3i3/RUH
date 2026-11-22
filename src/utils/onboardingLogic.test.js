import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CURATED_POPULAR_CITY_IDS,
  DEMO_ANCHOR_CATALOG,
  DEMO_ANCHOR_CATEGORIES,
  ONBOARDING_GOALS,
  ONBOARDING_STEPS,
  ONBOARDING_STRUGGLES,
  buildCharterShareText,
  buildOnboardingDemoContent,
  buildPersonalizedSolutions,
  buildSanctuaryCharter,
  formatSimpleVerseText,
  getAnchorsByCategory,
  getOnboardingProgress,
  getStrugglesForGoal,
  hasExistingUserActivity,
  parseOnboardingState,
  sanitizeStruggleIdsForGoal,
  serializeOnboardingState,
  shouldAutoShowOnboarding,
} from './onboardingLogic';
import { CITY_PRESETS } from '../data/cities';
import { filterCities } from './devotionLogic';

const MOCK_STATIONS = [
  {
    id: 'sabr',
    name: 'الصبر',
    nameEn: 'Patience',
    verses: [
      {
        id: 's1v1',
        a: 'لَا يُكَلِّفُ اللَّهُ',
        t: 'Allah does not burden a soul.',
        simpleT: 'God does not give a person\\nmore than they can handle.',
        s: '2:286',
      },
      {
        id: 's1v2',
        a: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
        t: 'With hardship comes ease.',
        simpleT: 'With every hardship\\ncomes ease.',
        s: '94:6',
      },
      {
        id: 's1v4',
        a: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ',
        t: 'Actions are by intentions.',
        simpleT: 'Actions are judged\\nby their intentions.',
        s: 'Bukhari 1',
      },
    ],
  },
  {
    id: 'tawakkul',
    name: 'التوكل',
    nameEn: 'Reliance',
    verses: [
      { id: 's3v1', a: 'وَنَحْنُ أَقْرَبُ', t: 'Closer than the jugular vein.', s: '50:16' },
      { id: 's3v2', a: 'وَمَن يَتَوَكَّلْ', t: 'Whoever trusts Allah, He is sufficient.', s: '65:3' },
    ],
  },
  {
    id: 'tawbah',
    name: 'التوبة',
    nameEn: 'Repentance',
    verses: [
      { id: 's4v1', a: 'لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ', t: 'Do not despair of Allah’s mercy.', s: '39:53' },
      { id: 's4v3', a: 'وَهُوَ الَّذِي يَقْبَلُ التَّوْبَةَ', t: 'He accepts repentance.', s: '42:25' },
    ],
  },
];

test('ONBOARDING_STEPS splits interactive demo cleanly into verse and anchors steps', () => {
  assert.equal(ONBOARDING_STEPS[0], 'welcome');
  assert.equal(ONBOARDING_STEPS.includes('demo_verse'), true);
  assert.equal(ONBOARDING_STEPS.includes('demo_anchors'), true);
  assert.equal(ONBOARDING_STEPS.includes('processing'), true);
  assert.equal(ONBOARDING_STEPS.includes('charter'), true);
  assert.equal(ONBOARDING_STEPS[ONBOARDING_STEPS.length - 1], 'reminders');
});

test('formatSimpleVerseText normalizes escaped and literal line breaks into clean sentences', () => {
  assert.equal(
    formatSimpleVerseText(MOCK_STATIONS[0].verses[0]),
    'God does not give a person more than they can handle.'
  );
  assert.equal(formatSimpleVerseText(MOCK_STATIONS[0].verses[1]), 'With every hardship comes ease.');
});

test('getOnboardingProgress clamps cleanly between 0 and 100', () => {
  assert.equal(getOnboardingProgress(0), 0);
  assert.equal(getOnboardingProgress(-5), 0);
  assert.equal(getOnboardingProgress(ONBOARDING_STEPS.length - 1), 100);
  assert.equal(getOnboardingProgress(999), 100);
});

test('serializeOnboardingState and parseOnboardingState round-trip safely', () => {
  const raw = serializeOnboardingState({
    completed: true,
    skipped: false,
    completedAt: '2026-05-01T10:00:00.000Z',
    goalId: 'guard_prayers',
    struggleIds: ['lose_track_time', 'noisy_apps'],
    selectedVerseId: 's1v4',
    selectedAnchorIds: ['anchor_fajr_guard', 'anchor_tasbih_33'],
  });
  const parsed = parseOnboardingState(raw);
  assert.equal(parsed.completed, true);
  assert.equal(parsed.goalId, 'guard_prayers');
  assert.deepEqual(parsed.struggleIds, ['lose_track_time', 'noisy_apps']);
  assert.equal(parsed.selectedVerseId, 's1v4');
  assert.deepEqual(parsed.selectedAnchorIds, ['anchor_fajr_guard', 'anchor_tasbih_33']);
  assert.equal(parseOnboardingState('bad-json'), null);
});

test('shouldAutoShowOnboarding respects first launch, completion, existing activity, and ?autostart=1', () => {
  assert.equal(
    shouldAutoShowOnboarding({ storedState: null, hasExistingActivity: false, searchParams: '' }),
    true
  );
  assert.equal(
    shouldAutoShowOnboarding({
      storedState: { completed: true },
      hasExistingActivity: false,
      searchParams: '',
    }),
    false
  );
  assert.equal(
    shouldAutoShowOnboarding({ storedState: null, hasExistingActivity: true, searchParams: '' }),
    false
  );
  assert.equal(
    shouldAutoShowOnboarding({
      storedState: null,
      hasExistingActivity: false,
      searchParams: '?autostart=1',
    }),
    false
  );
  assert.equal(
    shouldAutoShowOnboarding({
      storedState: { completed: true },
      hasExistingActivity: true,
      searchParams: '?onboarding=1',
    }),
    true
  );
});

test('hasExistingUserActivity detects prior progress cleanly while leaving fresh state false', () => {
  assert.equal(
    hasExistingUserActivity({
      totalPrayers: 0,
      totalVerses: 0,
      activeDays: 0,
      savedVerses: [],
      profile: { name: 'Seeker' },
    }),
    false
  );
  assert.equal(hasExistingUserActivity({ totalPrayers: 1 }), true);
  assert.equal(hasExistingUserActivity({ savedVerses: [{ id: 's1v1' }] }), true);
  assert.equal(hasExistingUserActivity({ profile: { name: 'Layla' } }), true);
});

test('every Step 1 goal maps to 4 unique goal-specific Step 2 challenges and mirrored solutions', () => {
  const seenIds = new Set();
  const seenLabels = new Set();

  for (const goal of ONBOARDING_GOALS) {
    const struggles = getStrugglesForGoal(goal.id);
    assert.equal(struggles.length, 4, `Goal "${goal.id}" should have 4 tailored Step 2 challenges`);
    for (const s of struggles) {
      assert.equal(seenIds.has(s.id), false, `Duplicate challenge ID "${s.id}" across goals`);
      assert.equal(seenLabels.has(s.label), false, `Duplicate challenge label "${s.label}" across goals`);
      assert.ok(s.hint && s.hint.length > 0, `Challenge "${s.id}" should include supporting hint copy`);
      seenIds.add(s.id);
      seenLabels.add(s.label);
    }
  }

  assert.equal(ONBOARDING_STRUGGLES.length, 16);

  // Selected challenges for guard_prayers mirror in order and cap at 3
  const mirrored = buildPersonalizedSolutions(
    ['prayer_fajr_wake', 'prayer_delay_habit', 'prayer_busy_day', 'prayer_cluttered_apps'],
    'guard_prayers'
  );
  assert.equal(mirrored.length, 3);
  assert.equal(mirrored[0].id, 'prayer_fajr_wake');
  assert.equal(mirrored[1].id, 'prayer_delay_habit');
  assert.equal(mirrored[2].id, 'prayer_busy_day');

  // Empty selection falls back to the chosen goal's top 3 challenges
  const quranFallback = buildPersonalizedSolutions([], 'quran_stillness');
  assert.equal(quranFallback.length, 3);
  assert.equal(quranFallback[0].id, 'quran_hard_understand');

  const returnFallback = buildPersonalizedSolutions([], 'gentle_return');
  assert.equal(returnFallback.length, 3);
  assert.equal(returnFallback[0].id, 'return_guilt_cycle');

  // Switching Step 1 goal strips stale Step 2 selections from the previous goal
  assert.deepEqual(
    sanitizeStruggleIdsForGoal(['prayer_fajr_wake', 'quran_no_time'], 'quran_stillness'),
    ['quran_no_time']
  );
  assert.deepEqual(
    sanitizeStruggleIdsForGoal(['prayer_fajr_wake'], 'steady_dhikr'),
    []
  );
});

test('buildOnboardingDemoContent curates 3 goal-specific simple verses and 8 prioritized habits from 16 categorized choices', () => {
  const returnDemo = buildOnboardingDemoContent('gentle_return', MOCK_STATIONS);
  assert.equal(returnDemo.goal.id, 'gentle_return');
  assert.equal(returnDemo.verses.length, 3);
  assert.equal(returnDemo.verses[0].id, 's4v1');
  assert.equal(returnDemo.anchors.length, 8);
  assert.equal(returnDemo.anchors[0].goals.includes('gentle_return'), true);

  const prayerDemo = buildOnboardingDemoContent('guard_prayers', MOCK_STATIONS);
  assert.equal(prayerDemo.verses[0].id, 's1v4');
  assert.equal(prayerDemo.verses[0].simpleText, 'Actions are judged by their intentions.');
  assert.equal(ONBOARDING_GOALS.length, 4);

  assert.equal(DEMO_ANCHOR_CATALOG.length, 16);
  assert.equal(new Set(DEMO_ANCHOR_CATALOG.map((a) => a.id)).size, 16);
  assert.equal(DEMO_ANCHOR_CATEGORIES.length, 5);
  assert.equal(getAnchorsByCategory('prayer', 'guard_prayers').length, 4);
  assert.equal(getAnchorsByCategory('quran', 'guard_prayers').length, 4);
  assert.equal(getAnchorsByCategory('dhikr', 'guard_prayers').length, 4);
  assert.equal(getAnchorsByCategory('sunnah', 'guard_prayers').length, 4);
  assert.equal(getAnchorsByCategory('recommended', 'quran_stillness').length, 8);
});

test('buildSanctuaryCharter and buildCharterShareText produce clean plain-English plan output', () => {
  const charter = buildSanctuaryCharter({
    name: '  Layla  ',
    goalId: 'guard_prayers',
    struggleIds: ['lose_track_time', 'noisy_apps'],
    selectedVerse: MOCK_STATIONS[0].verses[2],
    selectedAnchorIds: ['anchor_fajr_guard', 'anchor_tasbih_33'],
    cityLabel: 'Makkah',
    chimeProfileId: 'fajr_ney',
    leadMinutes: 5,
    isLightMode: true,
  });

  assert.equal(charter.seekerName, 'Layla');
  assert.equal(charter.cityLabel, 'Makkah');
  assert.equal(charter.chimeLabel, 'Dawn Ney');
  assert.equal(charter.atmosphereMode, 'Daylight');
  assert.equal(charter.openingVerse.translation, 'Actions are judged by their intentions.');
  assert.equal(charter.anchors.length, 2);

  const shareText = buildCharterShareText(charter);
  assert.match(shareText, /Layla's Daily Plan/);
  assert.match(shareText, /Makkah/);
  assert.match(shareText, /Dawn Ney/);
  assert.match(shareText, /Pray Fajr on time/);
});

test('city search over CITY_PRESETS handles city, country, and unmatched queries safely', () => {
  assert.equal(filterCities(CITY_PRESETS, 'toronto').some((c) => c.id === 'toronto'), true);
  assert.equal(filterCities(CITY_PRESETS, 'united kingdom').length >= 2, true);
  assert.deepEqual(filterCities(CITY_PRESETS, 'zzzz-no-such-city'), []);

  const byId = new Set(CITY_PRESETS.map((c) => c.id));
  for (const id of CURATED_POPULAR_CITY_IDS) {
    assert.equal(byId.has(id), true, `Expected curated popular city "${id}" in CITY_PRESETS`);
  }
});
