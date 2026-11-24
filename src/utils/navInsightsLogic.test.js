import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SANCTUARY_NAV_ORDER,
  getMiddleNavItemId,
  buildInsightsMenuOptions,
  resolveActiveNavDestination,
  resolveSanctuaryNavPresentation,
  resolveNavTargetTransition,
} from './navInsightsLogic';

test('SANCTUARY_NAV_ORDER places insights (Burhan & Miracles) in the exact middle of 5 nav items', () => {
  assert.equal(SANCTUARY_NAV_ORDER.length, 5);
  assert.equal(SANCTUARY_NAV_ORDER[2], 'insights');
  assert.equal(getMiddleNavItemId(), 'insights');
});

test('buildInsightsMenuOptions returns rich Burhan and Miracles gateway portals with live metadata and progress', () => {
  const options = buildInsightsMenuOptions({
    activeBurhan: { id: 'b1', title: 'The Cosmological Anchor', scholar: 'Imam Al-Ghazali' },
    burhanCompleted: true,
    totalBurhans: 14,
    burhanNotes: { b1: 'Deeply grounding.' },
    activeMiracle: {
      id: 'm1',
      title: 'The Expanding Cosmos',
      categoryLabel: 'Cosmology',
      surahRef: 'Surah Adh-Dhariyat · 51:47',
    },
    exploredMiracleIds: ['m1', 'm2'],
    totalMiracles: 16,
  });

  assert.equal(options.length, 2);
  assert.equal(options[0].id, 'burhan');
  assert.equal(options[0].arabic, 'بُرْهَان');
  assert.equal(options[0].houseLabel, 'House of Reason & Fitrah');
  assert.equal(options[0].previewTitle, 'The Cosmological Anchor');
  assert.equal(options[0].subtitle, 'Imam Al-Ghazali');
  assert.equal(options[0].progressLabel, '14 treatises · Reflected today');
  assert.equal(options[0].enterLabel, 'Enter Burhan');
  assert.equal(options[0].isCompleted, true);
  assert.equal(options[0].statusLabel, 'Reflected');

  assert.equal(options[1].id, 'miracles');
  assert.equal(options[1].arabic, 'إِعْجَاز');
  assert.equal(options[1].houseLabel, 'Atlas of Qur’anic Signs');
  assert.equal(options[1].previewTitle, 'The Expanding Cosmos');
  assert.equal(options[1].subtitle, 'Cosmology · 16 Signs');
  assert.equal(options[1].progressLabel, '2 of 16 explored · Surah Adh-Dhariyat · 51:47');
  assert.equal(options[1].enterLabel, 'Enter Miracles');
  assert.equal(options[1].isCompleted, true);
  assert.equal(options[1].statusLabel, 'Explored');
});

test('buildInsightsMenuOptions handles missing or empty inputs gracefully', () => {
  const options = buildInsightsMenuOptions();
  assert.equal(options.length, 2);
  assert.equal(options[0].isCompleted, false);
  assert.equal(options[0].statusLabel, 'Read');
  assert.equal(options[0].progressLabel, 'Classical Proofs');
  assert.equal(options[1].isCompleted, false);
  assert.equal(options[1].statusLabel, 'Explore');
  assert.equal(options[1].progressLabel, 'Qur’anic Signs');
});

test('resolveActiveNavDestination highlights only the active full-screen world or core view', () => {
  assert.equal(resolveActiveNavDestination({ currentView: 'tasks' }), 'tasks');
  assert.equal(
    resolveActiveNavDestination({ currentView: 'main', isInsightsGatewayOpen: true }),
    'insights'
  );
  assert.equal(
    resolveActiveNavDestination({ currentView: 'profile', isBurhanWorldOpen: true }),
    'insights'
  );
  assert.equal(
    resolveActiveNavDestination({
      currentView: 'main',
      isInsightsGatewayOpen: true,
      isLearningPathOpen: true,
    }),
    'learning'
  );
  assert.equal(
    resolveActiveNavDestination({
      currentView: 'tasks',
      isLearningPathOpen: true,
      isLearningPathClosing: true,
    }),
    'tasks'
  );
});

test('resolveSanctuaryNavPresentation switches cleanly between standard, subtle world, and hidden modes', () => {
  const standard = resolveSanctuaryNavPresentation({});
  assert.deepEqual(standard, {
    mode: 'standard',
    tone: 'gold',
    zIndexClass: 'z-[40]',
    isInteractive: true,
  });

  const burhanSubtle = resolveSanctuaryNavPresentation({
    isInsightsGatewayOpen: true,
    isBurhanWorldOpen: true,
  });
  assert.deepEqual(burhanSubtle, {
    mode: 'subtle',
    tone: 'teal',
    zIndexClass: 'z-[95]',
    isInteractive: true,
  });

  const studySubtle = resolveSanctuaryNavPresentation({
    isLearningPathOpen: true,
  });
  assert.deepEqual(studySubtle, {
    mode: 'subtle',
    tone: 'gold',
    zIndexClass: 'z-[95]',
    isInteractive: true,
  });

  const hiddenInModal = resolveSanctuaryNavPresentation({
    isBlockingModalOpen: true,
    isBurhanWorldOpen: true,
  });
  assert.deepEqual(hiddenInModal, {
    mode: 'hidden',
    tone: 'gold',
    zIndexClass: 'z-[40]',
    isInteractive: false,
  });
});

test('resolveNavTargetTransition handles direct world-to-world and world-to-view switching cleanly', () => {
  // Leaving Burhan (stacked above Gateway) directly to Sanctuary clears Gateway immediately and animates Burhan closing
  const burhanToSanctuary = resolveNavTargetTransition({
    target: 'main',
    currentView: 'main',
    isInsightsGatewayOpen: true,
    isBurhanWorldOpen: true,
  });
  assert.equal(burhanToSanctuary.action, 'switch-view');
  assert.equal(burhanToSanctuary.nextView, 'main');
  assert.equal(burhanToSanctuary.closeBurhan, 'animate');
  assert.equal(burhanToSanctuary.closeGateway, 'immediate');

  // Tapping middle insights icon while inside Miracles steps back smoothly to Twin-Portal Gateway
  const miraclesToGateway = resolveNavTargetTransition({
    target: 'insights',
    currentView: 'main',
    isInsightsGatewayOpen: true,
    isMiraclesWorldOpen: true,
  });
  assert.equal(miraclesToGateway.action, 'return-to-gateway');
  assert.equal(miraclesToGateway.closeMiracles, 'animate');
  assert.equal(miraclesToGateway.ensureGatewayOpen, false);

  // Jumping from Burhan directly into Study Sanctuary clears Burhan/Gateway immediately
  const burhanToLearning = resolveNavTargetTransition({
    target: 'learning',
    currentView: 'main',
    isInsightsGatewayOpen: true,
    isBurhanWorldOpen: true,
  });
  assert.equal(burhanToLearning.action, 'open-learning');
  assert.equal(burhanToLearning.closeBurhan, 'immediate');
  assert.equal(burhanToLearning.closeGateway, 'immediate');

  // Jumping from Study Sanctuary directly into Burhan & Miracles Gateway clears Study immediately
  const learningToInsights = resolveNavTargetTransition({
    target: 'insights',
    currentView: 'main',
    isLearningPathOpen: true,
  });
  assert.equal(learningToInsights.action, 'open-gateway');
  assert.equal(learningToInsights.closeLearning, 'immediate');
  assert.equal(learningToInsights.ensureGatewayOpen, true);
});

