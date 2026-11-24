/**
 * Pure navigation structure and Twin-Portal Gateway metadata builders
 * for the middle Burhan & Miracles ("Signs & Proofs") window.
 */

export const SANCTUARY_NAV_ORDER = Object.freeze([
  'main',
  'tasks',
  'insights',
  'learning',
  'profile',
]);

/**
 * Returns the exact middle item id of the vertical Sanctuary navigation bar.
 */
export function getMiddleNavItemId(navOrder = SANCTUARY_NAV_ORDER) {
  if (!Array.isArray(navOrder) || navOrder.length === 0) return null;
  return navOrder[Math.floor(navOrder.length / 2)];
}

/**
 * Builds the two prominent portal entries for the expanding Burhan & Miracles
 * Twin-Portal Gateway window.
 */
export function buildInsightsMenuOptions({
  activeBurhan = null,
  burhanCompleted = false,
  totalBurhans = 0,
  burhanNotes = {},
  activeMiracle = null,
  exploredMiracleIds = [],
  totalMiracles = 0,
} = {}) {
  const exploredList = Array.isArray(exploredMiracleIds) ? exploredMiracleIds : [];
  const uniqueExploredCount = new Set(exploredList.filter(Boolean)).size;
  const miracleExplored = Boolean(activeMiracle?.id && exploredList.includes(activeMiracle.id));
  const signsCount = Number.isFinite(totalMiracles) && totalMiracles > 0 ? totalMiracles : 0;
  const treatiseCount = Number.isFinite(totalBurhans) && totalBurhans > 0 ? totalBurhans : 0;
  const notedTreatisesCount =
    burhanNotes && typeof burhanNotes === 'object'
      ? Object.values(burhanNotes).filter((n) => typeof n === 'string' && n.trim().length > 0).length
      : 0;

  const burhanProgressParts = [];
  if (treatiseCount > 0) burhanProgressParts.push(`${treatiseCount} treatises`);
  if (burhanCompleted) burhanProgressParts.push('Reflected today');
  else if (notedTreatisesCount > 0) burhanProgressParts.push(`${notedTreatisesCount} noted`);

  const miracleProgressParts = [];
  if (signsCount > 0) {
    miracleProgressParts.push(
      uniqueExploredCount > 0
        ? `${Math.min(uniqueExploredCount, signsCount)} of ${signsCount} explored`
        : `${signsCount} signs`
    );
  }
  if (activeMiracle?.surahRef) {
    miracleProgressParts.push(activeMiracle.surahRef);
  }

  return [
    {
      id: 'burhan',
      label: 'Burhan',
      arabic: 'بُرْهَان',
      houseLabel: 'House of Reason & Fitrah',
      tagline: 'Clear philosophical proofs and classical reflections on faith.',
      subtitle: activeBurhan?.scholar || 'Intellectual Proofs',
      previewTitle: activeBurhan?.title || 'Daily Reflection & Proof',
      progressLabel: burhanProgressParts.join(' · ') || 'Classical Proofs',
      enterLabel: 'Enter Burhan',
      isCompleted: Boolean(burhanCompleted),
      statusLabel: burhanCompleted ? 'Reflected' : 'Read',
      tone: 'teal',
    },
    {
      id: 'miracles',
      label: 'Miracles',
      arabic: 'إِعْجَاز',
      houseLabel: 'Atlas of Qur’anic Signs',
      tagline: 'Cosmic, historical, and linguistic signs revealed in the Qur’an.',
      subtitle:
        activeMiracle?.categoryLabel && signsCount > 0
          ? `${activeMiracle.categoryLabel} · ${signsCount} Signs`
          : signsCount > 0
            ? `${signsCount} Qur’anic Signs`
            : 'Qur’anic Signs',
      previewTitle: activeMiracle?.title || 'Explore Qur’anic Miracles',
      progressLabel: miracleProgressParts.join(' · ') || 'Qur’anic Signs',
      enterLabel: 'Enter Miracles',
      isCompleted: miracleExplored,
      statusLabel: miracleExplored ? 'Explored' : 'Explore',
      tone: 'gold',
    },
  ];
}

const VALID_CORE_VIEWS = new Set(['main', 'tasks', 'profile']);

/**
 * Resolves the single active destination in the 5-icon Sanctuary nav bar so
 * full-screen worlds (Burhan & Miracles, Study Sanctuary) never double-highlight
 * alongside the underlying Sanctuary view.
 */
export function resolveActiveNavDestination({
  currentView = 'main',
  isInsightsGatewayOpen = false,
  isInsightsGatewayClosing = false,
  isBurhanWorldOpen = false,
  isBurhanClosing = false,
  isMiraclesWorldOpen = false,
  isMiraclesClosing = false,
  isLearningPathOpen = false,
  isLearningPathClosing = false,
} = {}) {
  if (isLearningPathOpen && !isLearningPathClosing) {
    return 'learning';
  }
  if (
    (isBurhanWorldOpen && !isBurhanClosing) ||
    (isMiraclesWorldOpen && !isMiraclesClosing) ||
    (isInsightsGatewayOpen && !isInsightsGatewayClosing)
  ) {
    return 'insights';
  }
  return VALID_CORE_VIEWS.has(currentView) ? currentView : 'main';
}

/**
 * Resolves whether the floating right-edge Sanctuary nav bar should render in
 * standard mode (core views), subtle whisper mode (Burhan/Miracles & Study
 * Sanctuary full-screen worlds), or hidden (onboarding & blocking modals).
 */
export function resolveSanctuaryNavPresentation({
  isOnboardingOpen = false,
  isRewardRevealActive = false,
  isBlockingModalOpen = false,
  isInsightsGatewayOpen = false,
  isInsightsGatewayClosing = false,
  isBurhanWorldOpen = false,
  isBurhanClosing = false,
  isMiraclesWorldOpen = false,
  isMiraclesClosing = false,
  isLearningPathOpen = false,
  isLearningPathClosing = false,
} = {}) {
  if (isOnboardingOpen || isRewardRevealActive || isBlockingModalOpen) {
    return {
      mode: 'hidden',
      tone: 'gold',
      zIndexClass: 'z-[40]',
      isInteractive: false,
    };
  }

  const activeLearning = Boolean(isLearningPathOpen && !isLearningPathClosing);
  const activeBurhan = Boolean(isBurhanWorldOpen && !isBurhanClosing);
  const activeMiracles = Boolean(isMiraclesWorldOpen && !isMiraclesClosing);
  const activeGateway = Boolean(isInsightsGatewayOpen && !isInsightsGatewayClosing);

  if (activeLearning || activeBurhan || activeMiracles || activeGateway) {
    return {
      mode: 'subtle',
      tone: activeBurhan && !activeMiracles && !activeLearning ? 'teal' : 'gold',
      zIndexClass: 'z-[95]',
      isInteractive: true,
    };
  }

  return {
    mode: 'standard',
    tone: 'gold',
    zIndexClass: 'z-[40]',
    isInteractive: true,
  };
}

/**
 * Computes a clean, collision-free transition plan when any of the 5 Sanctuary
 * navigation destinations is chosen from either a core view or a full-screen world.
 */
export function resolveNavTargetTransition({
  target,
  currentView = 'main',
  isInsightsGatewayOpen = false,
  isBurhanWorldOpen = false,
  isMiraclesWorldOpen = false,
  isLearningPathOpen = false,
} = {}) {
  const basePlan = {
    action: 'stay',
    nextView: null,
    closeLearning: 'none',
    closeBurhan: 'none',
    closeMiracles: 'none',
    closeGateway: 'none',
    ensureGatewayOpen: false,
  };

  if (VALID_CORE_VIEWS.has(target)) {
    const anyWorldOpen = Boolean(
      isLearningPathOpen || isMiraclesWorldOpen || isBurhanWorldOpen || isInsightsGatewayOpen
    );

    if (!anyWorldOpen) {
      if (currentView === target) return basePlan;
      return {
        ...basePlan,
        action: 'switch-view',
        nextView: target,
      };
    }

    if (isLearningPathOpen) {
      return {
        ...basePlan,
        action: 'switch-view',
        nextView: target,
        closeLearning: 'animate',
        closeBurhan: isBurhanWorldOpen ? 'immediate' : 'none',
        closeMiracles: isMiraclesWorldOpen ? 'immediate' : 'none',
        closeGateway: isInsightsGatewayOpen ? 'immediate' : 'none',
      };
    }

    if (isMiraclesWorldOpen) {
      return {
        ...basePlan,
        action: 'switch-view',
        nextView: target,
        closeMiracles: 'animate',
        closeBurhan: isBurhanWorldOpen ? 'immediate' : 'none',
        closeGateway: isInsightsGatewayOpen ? 'immediate' : 'none',
      };
    }

    if (isBurhanWorldOpen) {
      return {
        ...basePlan,
        action: 'switch-view',
        nextView: target,
        closeBurhan: 'animate',
        closeGateway: isInsightsGatewayOpen ? 'immediate' : 'none',
      };
    }

    return {
      ...basePlan,
      action: 'switch-view',
      nextView: target,
      closeGateway: 'animate',
    };
  }

  if (target === 'insights') {
    if (!isLearningPathOpen && (isBurhanWorldOpen || isMiraclesWorldOpen)) {
      return {
        ...basePlan,
        action: 'return-to-gateway',
        closeBurhan: isBurhanWorldOpen ? 'animate' : 'none',
        closeMiracles: isMiraclesWorldOpen ? 'animate' : 'none',
        ensureGatewayOpen: !isInsightsGatewayOpen,
      };
    }

    if (!isLearningPathOpen && isInsightsGatewayOpen) {
      return basePlan;
    }

    return {
      ...basePlan,
      action: 'open-gateway',
      closeLearning: isLearningPathOpen ? 'immediate' : 'none',
      ensureGatewayOpen: true,
    };
  }

  if (target === 'learning') {
    if (isLearningPathOpen) {
      return basePlan;
    }

    return {
      ...basePlan,
      action: 'open-learning',
      closeBurhan: isBurhanWorldOpen ? 'immediate' : 'none',
      closeMiracles: isMiraclesWorldOpen ? 'immediate' : 'none',
      closeGateway: isInsightsGatewayOpen ? 'immediate' : 'none',
    };
  }

  return basePlan;
}

