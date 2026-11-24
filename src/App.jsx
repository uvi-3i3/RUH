import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTemporalPhase, rgbToHex } from './hooks/useTemporalPhase';
import { SavedVersesModal } from './components/layout/SavedVersesModal';
import { useHijriDate } from './hooks/useHijriDate';
import { useCanvasEngine } from './hooks/useCanvasEngine';
import { useHabits, usePreferences, useSanctuary } from './context/sanctuaryStore';
import { PRAYERS, AMBIENT_DHIKR } from './data/constants';
import {
  MoonIcon,
  SunIcon,
  CircleIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  BookmarkIcon,
  MainNavIcon,
  ProfileNavIcon,
  TasksNavIcon,
  InsightsNavIcon,
  LearningPathNavIcon,
  ShareIcon,
  CompassIcon,
  LockIcon,
} from './components/icons/Icons';
import { TasksView } from './components/layout/TasksView';
import { ProfileIdCard } from './components/layout/ProfileIdCard';
import { LearningPathPage } from './components/layout/LearningPathPage';
import { captureClickOriginFromEvent } from './utils/learningPathLogic';
import {
  resolveActiveNavDestination,
  resolveNavTargetTransition,
  resolveSanctuaryNavPresentation,
} from './utils/navInsightsLogic';
import { isPointerDrag, resolveNextPrayerFocusIndex } from './utils/smoothInteractionLogic';
import {
  evaluatePrayerWindow,
  resolveInitialPrayerFocusIndex,
  resolveNextUpcomingPrayer,
  resolveTodayPrayerSchedule,
} from './utils/prayerWindowLogic';
import { PRACTICE_SETS } from './data/adhkarData';
import { TasksSideColumn } from './components/layout/TasksSideColumn';
import { PropheticLifeArtwork } from './components/layout/PropheticLifeArtwork';
import { TafakkurOverlay } from './components/layout/TafakkurOverlay';
import { BurhanOverlay } from './components/layout/BurhanOverlay';
import { MiraclesOverlay } from './components/layout/MiraclesOverlay';
import { InsightsGatewayOverlay } from './components/layout/InsightsGatewayOverlay';
import { SharePassModal } from './components/layout/SharePassModal';
import { SettingsModal } from './components/layout/SettingsModal';
import { RemindersModal } from './components/layout/RemindersModal';
import { QiblaModal } from './components/layout/QiblaModal';
import { CityPickerModal } from './components/layout/CityPickerModal';
import { DuasModal } from './components/layout/DuasModal';
import { QadaModal } from './components/layout/QadaModal';
import { MisbahaMode } from './components/layout/MisbahaMode';
import { burhanData } from './data/burhanData';
import { quranMiraclesData } from './data/quranMiraclesData';
import CONTENT_DATA from './data/content.json';
import {
  computeQadaTotals,
  getSunnahCalendarContext,
  resolveVerseCopy,
  selectActiveBurhan,
} from './utils/devotionLogic';
import {
  MIRACLES_EXPLORED_STORAGE_KEY,
  parseExploredMiracleIds,
  selectActiveMiracle,
} from './utils/miraclesLogic';
import { PaintedClouds } from './components/layout/PaintedClouds';
import { BadgeRewardOverlay } from './components/badges/BadgeRewardOverlay';
import { SacredNotificationToast } from './components/layout/SacredNotificationToast';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import {
  hasExistingUserActivity,
  shouldAutoShowOnboarding,
} from './utils/onboardingLogic';
import { registerNativeLifecycle } from './native';
import {
  hapticCelebrate,
  hapticDetent,
  hapticDismiss,
  hapticHeavy,
  hapticNavigate,
  hapticSuccess,
  hapticTapLight,
  hapticTaskComplete,
  hapticToggle,
  hapticUndo,
} from './utils/haptics';
import { playPrayerToggleCue, playTaskTickOffCue } from './utils/tactileAudio';

const STATIONS = CONTENT_DATA?.stations || [];
const ALL_VERSES_FLAT = STATIONS.flatMap((s) => s.verses || []);

export default function App() {
  const { devotionData, prayerTimes, notifications } = useSanctuary();
  const {
    logVerseSwipe,
    toggleSaveVerse,
    togglePrayer,
    markTaskRewarded,
    addYaqeen,
    advanceStation,
  } = devotionData;
  const {
    isLightMode,
    setIsLightMode,
    toggleLightMode,
    devTimePhase,
    isTravelMode,
    onboardingRecord,
    saveOnboardingRecord,
  } = usePreferences();
  const { completedHabitsCount, totalHabitsCount } = useHabits();
  const hijri = useHijriDate();
  const enabledAlertsCount =
    PRAYERS.filter((p) => devotionData.prayers?.[p.id]?.enabled).length +
    (devotionData.customReminders || []).filter((r) => r.enabled).length;

  // --- APP STATE ---
  const [currentView, setCurrentView] = useState('main'); // 'main' | 'tasks' | 'profile'
  const viewRef = useRef('main');

  const [verseIndex, setVerseIndex] = useState(0);
  const [showTodayList, setShowTodayList] = useState(false);
  const [kashfCeremony, setKashfCeremony] = useState(false);
  const kashfTimerRef = useRef(null);
  const [clockMs, setClockMs] = useState(() => Date.now());
  const nowDate = useMemo(() => new Date(clockMs), [clockMs]);
  const palette = useTemporalPhase(devTimePhase, {
    solarTimes: prayerTimes.prayerData?.times || null,
    sunrise: prayerTimes.prayerData?.sunrise || null,
    fallbackPrayers: devotionData.prayers,
    nowDate,
  });
  const temporalRef = useRef(palette);
  temporalRef.current = palette;

  const [copiedFeedback, setCopiedFeedback] = useState(false);

  // Derive current station's verses synchronously from bundled content
  const maq = devotionData.maqamat || { currentStation: 0, yaqeenProgress: 0, unlockedStations: [0] };
  const stations = STATIONS;
  const currentStationData = stations[maq.currentStation] || stations[0];
  const verses = currentStationData?.verses || null;
  const nextStation = stations[maq.currentStation + 1] || null;

  const [showContext, setShowContext] = useState(false);
  const [tafakkurPromptId, setTafakkurPromptId] = useState(null);

  const [focusedIndex, setFocusedIndex] = useState(0);
  const [checkingId, setCheckingId] = useState(null);
  const [lockedNotice, setLockedNotice] = useState(null);
  const [pendingPassedPrayerId, setPendingPassedPrayerId] = useState(null);
  const prayerManualFocusRef = useRef(false);
  const prayerSolarAlignedRef = useRef(false);
  const prayerInitialAlignedRef = useRef(false);
  const lockedNoticeTimerRef = useRef(null);

  const [inTransit, setInTransit] = useState(false);
  const [verseStyle, setVerseStyle] = useState({ opacity: 1, transform: 'translateY(0px)' });
  const [showSaveGlow, setShowSaveGlow] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [insightsGatewayOrigin, setInsightsGatewayOrigin] = useState(null);
  const [insightsGatewayClosing, setInsightsGatewayClosing] = useState(false);
  const [burhanOrigin, setBurhanOrigin] = useState(null);
  const [burhanClosing, setBurhanClosing] = useState(false);
  const [miraclesOrigin, setMiraclesOrigin] = useState(null);
  const [miraclesClosing, setMiraclesClosing] = useState(false);
  const [exploredMiracleIds, setExploredMiracleIds] = useState(() => {
    try {
      return parseExploredMiracleIds(localStorage.getItem(MIRACLES_EXPLORED_STORAGE_KEY));
    } catch {
      return [];
    }
  });
  const [sharePassLaunch, setSharePassLaunch] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showReminders, setShowReminders] = useState(false);
  const [showQibla, setShowQibla] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [showDuas, setShowDuas] = useState(false);
  const [showQada, setShowQada] = useState(false);
  const [misbahaLaunch, setMisbahaLaunch] = useState(null);
  const [learningPathOrigin, setLearningPathOrigin] = useState(null);
  const [learningPathClosing, setLearningPathClosing] = useState(false);
  const [reviewPrayers, setReviewPrayers] = useState(false);
  const [inspectedBadge, setInspectedBadge] = useState(null);
  const [showLifeArtwork, setShowLifeArtwork] = useState(false);
  const [onboardingMode, setOnboardingMode] = useState(() => {
    const searchParams = typeof window !== 'undefined' ? window.location.search : '';
    const shouldShow = shouldAutoShowOnboarding({
      storedState: onboardingRecord,
      hasExistingActivity: hasExistingUserActivity(devotionData),
      searchParams,
    });
    return shouldShow ? 'initial' : null;
  });
  const isOnboardingOpen = Boolean(onboardingMode);
  const prayerLongPressTimer = useRef(null);
  const prayerLongPressTriggered = useRef(false);
  const wheelDragRef = useRef({
    active: false,
    pointerId: null,
    startY: 0,
    startIndex: 0,
    lastStepIndex: 0,
    didDrag: false,
  });
  const lastTapTime = useRef(0);
  const doubleTapCooldown = useRef(false);
  const verseFadeTimerRef = useRef(null);
  const verseUnlockTimerRef = useRef(null);
  const verseRaf1Ref = useRef(null);
  const verseRaf2Ref = useRef(null);
  const prayerAutoFocusTimerRef = useRef(null);
  const checkingTimerRef = useRef(null);
  const pressDelayTimerRef = useRef(null);
  const wheelCooldownTimerRef = useRef(null);
  const saveGlowTimerRef = useRef(null);
  const copiedTimerRef = useRef(null);
  const doubleTapTimerRef = useRef(null);
  const wheelDragResetTimerRef = useRef(null);

  const isLearningPathOpen = Boolean(learningPathOrigin);
  const isInsightsGatewayOpen = Boolean(insightsGatewayOrigin);
  const isBurhanWorldOpen = Boolean(burhanOrigin);
  const isMiraclesWorldOpen = Boolean(miraclesOrigin);
  const isFullScreenWorldOpen = Boolean(
    isLearningPathOpen || isInsightsGatewayOpen || isBurhanWorldOpen || isMiraclesWorldOpen
  );
  const isRewardRevealActive = Boolean(
    !isOnboardingOpen && (devotionData.activeCelebrationBadge || inspectedBadge)
  );
  const isBackgroundPaused = isFullScreenWorldOpen || isRewardRevealActive || isOnboardingOpen;

  const isBlockingModalOpen = Boolean(
    showTodayList ||
      showLifeArtwork ||
      tafakkurPromptId ||
      showArchive ||
      sharePassLaunch ||
      showSettings ||
      showReminders ||
      showQibla ||
      showCityPicker ||
      showDuas ||
      showQada ||
      misbahaLaunch
  );

  const activeNavDestination = resolveActiveNavDestination({
    currentView,
    isInsightsGatewayOpen,
    isInsightsGatewayClosing: insightsGatewayClosing,
    isBurhanWorldOpen,
    isBurhanClosing: burhanClosing,
    isMiraclesWorldOpen,
    isMiraclesClosing: miraclesClosing,
    isLearningPathOpen,
    isLearningPathClosing: learningPathClosing,
  });

  const navPresentation = resolveSanctuaryNavPresentation({
    isOnboardingOpen,
    isRewardRevealActive,
    isBlockingModalOpen,
    isInsightsGatewayOpen,
    isInsightsGatewayClosing: insightsGatewayClosing,
    isBurhanWorldOpen,
    isBurhanClosing: burhanClosing,
    isMiraclesWorldOpen,
    isMiraclesClosing: miraclesClosing,
    isLearningPathOpen,
    isLearningPathClosing: learningPathClosing,
  });

  const isAnyModalOpen = Boolean(
    isOnboardingOpen ||
      isBlockingModalOpen ||
      isInsightsGatewayOpen ||
      isBurhanWorldOpen ||
      isMiraclesWorldOpen ||
      isLearningPathOpen ||
      inspectedBadge ||
      devotionData.activeCelebrationBadge
  );

  // Prioritized Escape dismissal: close strictly the topmost open dialog
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key !== 'Escape') return;
      if (isOnboardingOpen) return;
      if (devotionData.activeCelebrationBadge || inspectedBadge) return;
      if (typeof document !== 'undefined' && document.querySelector('[data-habit-editor-open="true"]')) {
        return;
      }
      if (learningPathOrigin) {
        if (!learningPathClosing) {
          hapticDismiss();
          setLearningPathClosing(true);
        }
      } else if (miraclesOrigin) {
        if (!miraclesClosing) {
          hapticDismiss();
          setMiraclesClosing(true);
        }
      } else if (burhanOrigin) {
        if (!burhanClosing) {
          hapticDismiss();
          setBurhanClosing(true);
        }
      } else if (insightsGatewayOrigin) {
        if (!insightsGatewayClosing) {
          hapticDismiss();
          setInsightsGatewayClosing(true);
        }
      } else if (sharePassLaunch) setSharePassLaunch(null);
      else if (misbahaLaunch) setMisbahaLaunch(null);
      else if (showCityPicker) setShowCityPicker(false);
      else if (tafakkurPromptId) setTafakkurPromptId(null);
      else if (showTodayList) setShowTodayList(false);
      else if (showLifeArtwork) setShowLifeArtwork(false);
      else if (showReminders) setShowReminders(false);
      else if (showSettings) setShowSettings(false);
      else if (showQibla) setShowQibla(false);
      else if (showDuas) setShowDuas(false);
      else if (showQada) setShowQada(false);
      else if (showArchive) setShowArchive(false);
      else if (pendingPassedPrayerId) setPendingPassedPrayerId(null);
      else if (lockedNotice) setLockedNotice(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isOnboardingOpen,
    devotionData.activeCelebrationBadge,
    inspectedBadge,
    learningPathOrigin,
    learningPathClosing,
    miraclesOrigin,
    miraclesClosing,
    burhanOrigin,
    burhanClosing,
    insightsGatewayOrigin,
    insightsGatewayClosing,
    sharePassLaunch,
    misbahaLaunch,
    showCityPicker,
    tafakkurPromptId,
    showTodayList,
    showLifeArtwork,
    showReminders,
    showSettings,
    showQibla,
    showDuas,
    showQada,
    showArchive,
    pendingPassedPrayerId,
    lockedNotice,
  ]);

  // Android hardware back button & mobile app foreground resume lifecycle
  const nativeBackHandlerRef = useRef(() => false);
  nativeBackHandlerRef.current = () => {
    if (isOnboardingOpen) {
      if (onboardingMode === 'replay') {
        handleSkipOnboarding();
      }
      return true;
    }
    if (devotionData.activeCelebrationBadge) {
      devotionData.dismissCelebrationBadge();
      return true;
    }
    if (inspectedBadge) {
      setInspectedBadge(null);
      return true;
    }
    if (typeof document !== 'undefined' && document.querySelector('[data-habit-editor-open="true"]')) {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      return true;
    }
    if (learningPathOrigin) {
      if (!learningPathClosing) setLearningPathClosing(true);
      return true;
    }
    if (miraclesOrigin) {
      if (!miraclesClosing) setMiraclesClosing(true);
      return true;
    }
    if (burhanOrigin) {
      if (!burhanClosing) setBurhanClosing(true);
      return true;
    }
    if (insightsGatewayOrigin) {
      if (!insightsGatewayClosing) setInsightsGatewayClosing(true);
      return true;
    }
    if (sharePassLaunch) {
      setSharePassLaunch(null);
      return true;
    }
    if (misbahaLaunch) {
      setMisbahaLaunch(null);
      return true;
    }
    if (showCityPicker) {
      setShowCityPicker(false);
      return true;
    }
    if (tafakkurPromptId) {
      setTafakkurPromptId(null);
      return true;
    }
    if (showTodayList) {
      setShowTodayList(false);
      return true;
    }
    if (showLifeArtwork) {
      setShowLifeArtwork(false);
      return true;
    }
    if (showReminders) {
      setShowReminders(false);
      return true;
    }
    if (showSettings) {
      setShowSettings(false);
      return true;
    }
    if (showQibla) {
      setShowQibla(false);
      return true;
    }
    if (showDuas) {
      setShowDuas(false);
      return true;
    }
    if (showQada) {
      setShowQada(false);
      return true;
    }
    if (showArchive) {
      setShowArchive(false);
      return true;
    }
    if (miraclesOrigin) {
      if (!miraclesClosing) setMiraclesClosing(true);
      return true;
    }
    if (burhanOrigin) {
      if (!burhanClosing) setBurhanClosing(true);
      return true;
    }
    if (pendingPassedPrayerId) {
      setPendingPassedPrayerId(null);
      return true;
    }
    if (lockedNotice) {
      setLockedNotice(null);
      return true;
    }
    if (currentView !== 'main') {
      setCurrentView('main');
      return true;
    }
    return false;
  };

  const nativeForegroundRef = useRef(() => {});
  nativeForegroundRef.current = () => {
    setClockMs(Date.now());
    prayerTimes.refresh?.();
    notifications.refreshPermission?.();
    notifications.syncAllNativePrayerSchedules?.();
  };

  useEffect(() => {
    return registerNativeLifecycle({
      onBackButton: () => nativeBackHandlerRef.current(),
      onForeground: () => nativeForegroundRef.current(),
    });
  }, []);

  const userProfile = devotionData.profile || { name: 'Seeker', initials: 'SK', joinedDate: '2026' };

  // Ambient mode dhikr
  const [ambientDhikr, setAmbientDhikr] = useState(null);
  const ambientTimeoutsRef = useRef([]);

  const canvasRef = useRef(null);
  const verseWrapRef = useRef(null);
  const engineRef = useRef({});
  const hikmahRef = useRef(false);

  const completedPrayers = devotionData.dailyCompletedPrayers || [];
  const prayerStatuses = devotionData.dailyPrayerStatuses || {};
  const allCompleted = completedPrayers.length === PRAYERS.length;
  const hideStackForSeal = allCompleted && !reviewPrayers;

  useEffect(() => {
    if (!allCompleted) {
      setReviewPrayers(false);
    }
  }, [allCompleted]);

  // Live 30s clock tick so prayer unlock windows, countdowns & solar atmosphere advance automatically
  useEffect(() => {
    const id = setInterval(() => setClockMs(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  const todaySchedule = useMemo(
    () =>
      resolveTodayPrayerSchedule({
        prayerTimesData: prayerTimes.prayerData,
        fallbackPrayers: devotionData.prayers,
        now: nowDate,
      }),
    [prayerTimes.prayerData, devotionData.prayers, nowDate]
  );

  const prayerWindows = useMemo(() => {
    const map = {};
    PRAYERS.forEach((p) => {
      map[p.id] = evaluatePrayerWindow(p.id, {
        schedule: todaySchedule,
        now: nowDate,
        isTravelMode,
      });
    });
    return map;
  }, [todaySchedule, nowDate, isTravelMode]);

  const nextUpcomingPrayer = useMemo(
    () => resolveNextUpcomingPrayer({ schedule: todaySchedule, now: nowDate }),
    [todaySchedule, nowDate]
  );

  // Focus the currently open or most relevant unlogged prayer on launch (and once when solar times hydrate)
  useEffect(() => {
    if (prayerManualFocusRef.current) return;
    if (!prayerInitialAlignedRef.current) {
      prayerInitialAlignedRef.current = true;
      setFocusedIndex(
        resolveInitialPrayerFocusIndex({
          schedule: todaySchedule,
          completedPrayers,
          now: nowDate,
          isTravelMode,
        })
      );
      if (todaySchedule.isLiveSolar) {
        prayerSolarAlignedRef.current = true;
      }
      return;
    }
    if (todaySchedule.isLiveSolar && !prayerSolarAlignedRef.current) {
      prayerSolarAlignedRef.current = true;
      setFocusedIndex(
        resolveInitialPrayerFocusIndex({
          schedule: todaySchedule,
          completedPrayers,
          now: nowDate,
          isTravelMode,
        })
      );
    }
  }, [todaySchedule, completedPrayers, nowDate, isTravelMode]);

  // Dismiss any prayer-level prompt when navigating away from Sanctuary
  useEffect(() => {
    if (currentView !== 'main') {
      setPendingPassedPrayerId(null);
      setLockedNotice(null);
    }
  }, [currentView]);

  const stateRef = useRef({
    isPressing: false,
    pressProgress: 0,
    lastPressP: -1,
    pointerStartX: 0,
    pointerStartY: 0,
  });

  const isLightModeRef = useRef(isLightMode);
  useEffect(() => {
    isLightModeRef.current = isLightMode;
    if (engineRef.current.forceRender) {
      engineRef.current.forceRender();
    }
  }, [isLightMode]);

  const inTransitRef = useRef(inTransit);
  useEffect(() => {
    inTransitRef.current = inTransit;
  }, [inTransit]);

  const scrollCooldown = useRef(false);
  const touchStart = useRef({ x: 0, y: 0, valid: false });

  const cancelVerseTransition = useCallback(() => {
    if (verseFadeTimerRef.current) {
      clearTimeout(verseFadeTimerRef.current);
      verseFadeTimerRef.current = null;
    }
    if (verseUnlockTimerRef.current) {
      clearTimeout(verseUnlockTimerRef.current);
      verseUnlockTimerRef.current = null;
    }
    if (verseRaf1Ref.current) {
      cancelAnimationFrame(verseRaf1Ref.current);
      verseRaf1Ref.current = null;
    }
    if (verseRaf2Ref.current) {
      cancelAnimationFrame(verseRaf2Ref.current);
      verseRaf2Ref.current = null;
    }
  }, []);

  const cancelPrayerAutoFocus = useCallback(() => {
    if (prayerAutoFocusTimerRef.current) {
      clearTimeout(prayerAutoFocusTimerRef.current);
      prayerAutoFocusTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    viewRef.current = currentView;
    if (currentView !== 'main') {
      if (pressDelayTimerRef.current) {
        clearTimeout(pressDelayTimerRef.current);
        pressDelayTimerRef.current = null;
      }
      stateRef.current.isPressing = false;
      cancelVerseTransition();
      setInTransit(false);
      setVerseStyle({ opacity: 1, transform: 'translateY(0px)' });
    }
  }, [currentView, cancelVerseTransition]);

  const advanceVerse = useCallback(
    (dir = 1) => {
      if (inTransitRef.current || viewRef.current !== 'main' || !verses || verses.length === 0) return;
      hapticDetent();
      cancelVerseTransition();
      inTransitRef.current = true;
      setInTransit(true);
      setShowContext(false);

      setVerseStyle({
        opacity: 0,
        transform: `translateY(${dir > 0 ? '-10px' : '10px'})`,
        transition: 'opacity 0.24s ease, transform 0.24s ease',
      });

      verseFadeTimerRef.current = setTimeout(() => {
        verseFadeTimerRef.current = null;
        setVerseIndex((prev) => (prev + dir + verses.length) % verses.length);
        logVerseSwipe();
        setVerseStyle({
          opacity: 0,
          transform: `translateY(${dir > 0 ? '12px' : '-12px'})`,
          transition: 'none',
        });

        verseRaf1Ref.current = requestAnimationFrame(() => {
          verseRaf1Ref.current = null;
          verseRaf2Ref.current = requestAnimationFrame(() => {
            verseRaf2Ref.current = null;
            setVerseStyle({
              opacity: 1,
              transform: 'translateY(0px)',
              transition:
                'opacity 0.45s cubic-bezier(0.16,1,0.3,1), transform 0.48s cubic-bezier(0.16,1,0.3,1)',
            });
            verseUnlockTimerRef.current = setTimeout(() => {
              verseUnlockTimerRef.current = null;
              inTransitRef.current = false;
              setInTransit(false);
            }, 280);
          });
        });
      }, 240);
    },
    [verses, logVerseSwipe, cancelVerseTransition]
  );

  useEffect(() => {
    engineRef.current.advanceVerse = advanceVerse;
  }, [advanceVerse]);

  useCanvasEngine({
    canvasRef,
    verseWrapRef,
    engineRef,
    stateRef,
    temporalRef,
    isLightModeRef,
    inTransitRef,
    hikmahRef,
    viewRef,
  });

  // Clamp verseIndex defensively
  const activeVerse = verses ? verses[Math.min(verseIndex, verses.length - 1)] : null;
  const savedVerseObj =
    activeVerse && devotionData.savedVerses.find((v) => v?.id === activeVerse.id);
  const isSaved = !!savedVerseObj;
  const isHikmah = activeVerse?.type === 'hikmah';
  hikmahRef.current = isHikmah;

  const { translation: activeTranslation, context: activeContext } = resolveVerseCopy(
    activeVerse,
    devotionData.isSimpleMode
  );

  const handleBookmarkAndReflect = useCallback(
    (verse) => {
      if (!verse) return;
      if (!isSaved) hapticSuccess();
      else hapticToggle(false);
      toggleSaveVerse(verse.id);
      if (!isSaved) {
        setTafakkurPromptId(verse.id);
      }
      if (engineRef.current.triggerButtonBurst) engineRef.current.triggerButtonBurst();
      setShowSaveGlow(true);
      if (saveGlowTimerRef.current) clearTimeout(saveGlowTimerRef.current);
      saveGlowTimerRef.current = setTimeout(() => {
        saveGlowTimerRef.current = null;
        setShowSaveGlow(false);
      }, 1000);
    },
    [toggleSaveVerse, isSaved]
  );

  const cancelPendingPress = useCallback(() => {
    if (pressDelayTimerRef.current) {
      clearTimeout(pressDelayTimerRef.current);
      pressDelayTimerRef.current = null;
    }
    stateRef.current.isPressing = false;
  }, []);

  const handleTextPointerDown = (e) => {
    if (inTransitRef.current || currentView !== 'main') return;
    if (e.target.closest('button')) return;
    if (doubleTapCooldown.current) return;

    const now = Date.now();
    if (now - lastTapTime.current < 380) {
      cancelPendingPress();
      if (activeVerse) {
        handleBookmarkAndReflect(activeVerse);
      }
      lastTapTime.current = 0;
      doubleTapCooldown.current = true;
      if (doubleTapTimerRef.current) clearTimeout(doubleTapTimerRef.current);
      doubleTapTimerRef.current = setTimeout(() => {
        doubleTapTimerRef.current = null;
        doubleTapCooldown.current = false;
      }, 400);
      return;
    }
    lastTapTime.current = now;

    if (e.currentTarget.setPointerCapture && e.pointerId !== undefined) {
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {}
    }
    stateRef.current.pointerStartX = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
    stateRef.current.pointerStartY = e.clientY || (e.touches && e.touches[0]?.clientY) || 0;

    if (pressDelayTimerRef.current) clearTimeout(pressDelayTimerRef.current);
    pressDelayTimerRef.current = setTimeout(() => {
      pressDelayTimerRef.current = null;
      if (inTransitRef.current || viewRef.current !== 'main') return;
      stateRef.current.isPressing = true;
      engineRef.current.startPressLoop?.();
    }, 120);
  };

  const handleTextPointerUp = (e) => {
    if (e.currentTarget.releasePointerCapture && e.pointerId !== undefined) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
    }
    cancelPendingPress();
  };

  const handlePointerMove = (e) => {
    if (!stateRef.current.isPressing && !pressDelayTimerRef.current) return;
    const clientX = e.clientX ?? (e.touches && e.touches[0]?.clientX);
    const clientY = e.clientY ?? (e.touches && e.touches[0]?.clientY);
    if (clientX == null || clientY == null) return;

    if (
      isPointerDrag(
        stateRef.current.pointerStartX,
        stateRef.current.pointerStartY,
        clientX,
        clientY,
        16
      )
    ) {
      cancelPendingPress();
    }
  };

  const handleTouchStart = (e) => {
    if (isAnyModalOpen || e.target.closest?.('[role="dialog"]') || !e.touches?.[0]) {
      touchStart.current.valid = false;
      return;
    }
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, valid: true };
  };

  const handleTouchEnd = (e) => {
    const start = touchStart.current;
    touchStart.current.valid = false;
    if (
      !start.valid ||
      !e.changedTouches?.[0] ||
      isAnyModalOpen ||
      e.target.closest?.('[role="dialog"]') ||
      e.target.closest('button') ||
      currentView !== 'main'
    ) {
      return;
    }
    const dx = start.x - e.changedTouches[0].clientX;
    const dy = start.y - e.changedTouches[0].clientY;

    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      advanceVerse(dx > 0 ? 1 : -1);
      return;
    }

    if (Math.abs(dy) > 30 && !hideStackForSeal) {
      cancelPrayerAutoFocus();
      const nextIdx =
        dy > 0 ? Math.min(PRAYERS.length - 1, focusedIndex + 1) : Math.max(0, focusedIndex - 1);
      if (nextIdx !== focusedIndex) {
        prayerManualFocusRef.current = true;
        setPendingPassedPrayerId(null);
        setLockedNotice(null);
        hapticDetent();
        playPrayerToggleCue({ direction: dy > 0 ? 1 : -1 });
        setFocusedIndex(nextIdx);
      }
    }
  };

  const handleWheel = (e) => {
    if (
      isAnyModalOpen ||
      e.target.closest?.('[role="dialog"]') ||
      scrollCooldown.current ||
      hideStackForSeal ||
      currentView !== 'main'
    ) {
      return;
    }
    if (Math.abs(e.deltaY) > 20) {
      cancelPrayerAutoFocus();
      scrollCooldown.current = true;
      const nextIdx =
        e.deltaY > 0
          ? Math.min(PRAYERS.length - 1, focusedIndex + 1)
          : Math.max(0, focusedIndex - 1);
      if (nextIdx !== focusedIndex) {
        prayerManualFocusRef.current = true;
        setPendingPassedPrayerId(null);
        setLockedNotice(null);
        hapticDetent();
        playPrayerToggleCue({ direction: e.deltaY > 0 ? 1 : -1 });
        setFocusedIndex(nextIdx);
      }
      if (wheelCooldownTimerRef.current) clearTimeout(wheelCooldownTimerRef.current);
      wheelCooldownTimerRef.current = setTimeout(() => {
        wheelCooldownTimerRef.current = null;
        scrollCooldown.current = false;
      }, 150);
    }
  };

  const showLockedPrayerWhisper = useCallback((prayerId, windowInfo) => {
    const prayerObj = PRAYERS.find((p) => p.id === prayerId);
    if (!prayerObj) return;
    if (lockedNoticeTimerRef.current) clearTimeout(lockedNoticeTimerRef.current);
    setLockedNotice({
      prayerId,
      label: prayerObj.label,
      formattedStart: windowInfo?.formattedStart || '',
      formattedCountdown: windowInfo?.formattedCountdown || '',
    });
    lockedNoticeTimerRef.current = setTimeout(() => {
      lockedNoticeTimerRef.current = null;
      setLockedNotice(null);
    }, 4200);
  }, []);

  const commitPrayerToggle = (prayerId, status = 'ontime') => {
    cancelPrayerAutoFocus();
    setPendingPassedPrayerId(null);
    setLockedNotice(null);

    if (completedPrayers.includes(prayerId)) {
      hapticUndo();
      togglePrayer(prayerId);
      return;
    }

    // Commit immediately so rapid taps on adjacent prayers are never dropped
    togglePrayer(prayerId, status);
    playTaskTickOffCue({ kind: 'prayer' });
    setCheckingId(prayerId);
    if (checkingTimerRef.current) clearTimeout(checkingTimerRef.current);
    checkingTimerRef.current = setTimeout(() => {
      checkingTimerRef.current = null;
      setCheckingId(null);
    }, 340);

    if (engineRef.current.triggerButtonBurst) engineRef.current.triggerButtonBurst();
    const nextCompleted = [...completedPrayers, prayerId];
    if (nextCompleted.length === PRAYERS.length) hapticCelebrate();
    else if (status === 'qada') hapticHeavy();
    else hapticTaskComplete();

    const nextIdx = resolveNextPrayerFocusIndex(PRAYERS, prayerId, nextCompleted);
    prayerAutoFocusTimerRef.current = setTimeout(() => {
      prayerAutoFocusTimerRef.current = null;
      if (nextIdx !== -1) setFocusedIndex(nextIdx);
      if (nextCompleted.length === PRAYERS.length) {
        setReviewPrayers(false);
      }
    }, 340);
  };

  const handleTogglePrayer = (prayerId, status = 'ontime') => {
    cancelPrayerAutoFocus();
    prayerManualFocusRef.current = true;

    if (completedPrayers.includes(prayerId)) {
      commitPrayerToggle(prayerId);
      return;
    }

    const windowInfo = prayerWindows[prayerId];
    if (windowInfo && !windowInfo.canLog) {
      setPendingPassedPrayerId(null);
      hapticDetent();
      showLockedPrayerWhisper(prayerId, windowInfo);
      return;
    }

    // When a prayer's window has already closed, invite an honest On-Time vs. Qada choice
    if (windowInfo?.status === 'passed' && status === 'ontime') {
      setLockedNotice(null);
      hapticDetent();
      setPendingPassedPrayerId((cur) => (cur === prayerId ? null : prayerId));
      return;
    }

    commitPrayerToggle(prayerId, status);
  };

  // Yaqeen from tasks
  useEffect(() => {
    const TASK_TARGETS = { istighfar: 100, subhanallah: 33, alhamdulillah: 33, allahu_akbar: 34 };
    const tasks = devotionData.dailyTasks || {};
    const rewarded = devotionData.rewardedIds || [];
    Object.keys(TASK_TARGETS).forEach((id) => {
      if ((tasks[id] || 0) >= TASK_TARGETS[id] && !rewarded.includes(id)) {
        markTaskRewarded(id);
        addYaqeen(5);
      }
    });
  }, [devotionData.dailyTasks, devotionData.rewardedIds, markTaskRewarded, addYaqeen]);

  // Kashf ceremony trigger
  useEffect(() => {
    if (maq.yaqeenProgress >= 100 && nextStation && !kashfCeremony) {
      hapticCelebrate();
      setKashfCeremony(true);
      if (kashfTimerRef.current) clearTimeout(kashfTimerRef.current);
      kashfTimerRef.current = setTimeout(() => {
        kashfTimerRef.current = null;
        advanceStation();
        setVerseIndex(0);
        setKashfCeremony(false);
      }, 3200);
    }
  }, [maq.yaqeenProgress, nextStation, kashfCeremony, advanceStation]);

  useEffect(() => {
    return () => {
      cancelVerseTransition();
      cancelPrayerAutoFocus();
      if (kashfTimerRef.current) clearTimeout(kashfTimerRef.current);
      if (checkingTimerRef.current) clearTimeout(checkingTimerRef.current);
      if (pressDelayTimerRef.current) clearTimeout(pressDelayTimerRef.current);
      if (wheelCooldownTimerRef.current) clearTimeout(wheelCooldownTimerRef.current);
      if (saveGlowTimerRef.current) clearTimeout(saveGlowTimerRef.current);
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
      if (doubleTapTimerRef.current) clearTimeout(doubleTapTimerRef.current);
      if (wheelDragResetTimerRef.current) clearTimeout(wheelDragResetTimerRef.current);
      if (prayerLongPressTimer.current) clearTimeout(prayerLongPressTimer.current);
      if (lockedNoticeTimerRef.current) clearTimeout(lockedNoticeTimerRef.current);
    };
  }, [cancelVerseTransition, cancelPrayerAutoFocus]);

  // Ambient mode dhikr
  useEffect(() => {
    if (!devotionData.isAmbientEnabled) {
      setAmbientDhikr(null);
      return;
    }
    let idx = 0;
    const show = () => {
      setAmbientDhikr(AMBIENT_DHIKR[idx % AMBIENT_DHIKR.length]);
      idx++;
      const tid = setTimeout(() => setAmbientDhikr(null), 5000);
      ambientTimeoutsRef.current.push(tid);
    };
    show();
    const interval = setInterval(show, 30000);
    return () => {
      clearInterval(interval);
      ambientTimeoutsRef.current.forEach(clearTimeout);
      ambientTimeoutsRef.current = [];
    };
  }, [devotionData.isAmbientEnabled]);

  const handleShare = (e, verse) => {
    e.stopPropagation();
    if (!verse) return;
    hapticTapLight();
    const { translation } = resolveVerseCopy(verse, devotionData.isSimpleMode);
    const textToShare = `${verse.a}\n\n${translation}\n\n— ${verse.s}`;
    if (navigator.share) {
      navigator.share({ title: 'Ruh — رُوح', text: textToShare }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard
        .writeText(textToShare)
        .then(() => {
          hapticSuccess();
          setCopiedFeedback(true);
          if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
          copiedTimerRef.current = setTimeout(() => {
            copiedTimerRef.current = null;
            setCopiedFeedback(false);
          }, 1800);
        })
        .catch(() => {});
    }
  };

  // --- TEMPORAL ACCENT COLORS ---
  const tAccent = isLightMode ? palette.light.accent : palette.dark.accent;
  const tAccentBright = isLightMode ? palette.light.ember : palette.dark.ember;
  const accentHex = isHikmah ? (isLightMode ? '#0d9488' : '#14b8a6') : rgbToHex(tAccent);
  const accentBrightHex = isHikmah ? (isLightMode ? '#0f766e' : '#2dd4bf') : rgbToHex(tAccentBright);
  const accentRgba = isHikmah
    ? isLightMode
      ? 'rgba(13,148,136'
      : 'rgba(20,184,166'
    : `rgba(${tAccent.r},${tAccent.g},${tAccent.b}`;

  const tBg = isLightMode ? 'bg-[#dce7f3]' : 'bg-[#080c16]';
  const tTextMain = isLightMode ? 'text-[#1a1814]' : 'text-[rgba(245,238,224,0.94)]';
  const tTextSub = isLightMode ? 'text-[#2c2720]' : 'text-[rgba(228,218,200,0.68)]';
  const tTextGold = isLightMode ? 'text-[#7c5a1e]' : 'text-[rgba(210,172,90,0.78)]';

  const cBrightHexDark = accentBrightHex;
  const cBrightHexLight = accentHex;

  const glowSub = isLightMode
    ? '0 1px 2px rgba(255,255,255,0.75)'
    : '0 1px 2px rgba(0,0,0,0.85)';
  const glowArabic = isLightMode
    ? `0 0 36px rgba(255,252,245,0.7), 0 1px 1px rgba(255,255,255,0.85)`
    : `0 0 90px ${accentRgba},0.16), 0 1px 2px rgba(0,0,0,0.92)`;

  const getPrayerIcon = (type) => (type === 'moon' ? MoonIcon : SunIcon);

  const sunnahContext = useMemo(
    () => getSunnahCalendarContext(new Date(), hijri),
    [hijri]
  );
  const qadaTotals = useMemo(
    () => computeQadaTotals(devotionData.qada),
    [devotionData.qada]
  );
  const activeBurhan = useMemo(
    () => selectActiveBurhan(burhanData, maq.currentStation, devotionData.activeDays),
    [maq.currentStation, devotionData.activeDays]
  );
  const activeMiracle = useMemo(
    () => selectActiveMiracle(quranMiraclesData, maq.currentStation, devotionData.activeDays),
    [maq.currentStation, devotionData.activeDays]
  );

  const allVersesFlat = ALL_VERSES_FLAT;
  const tafakkurVerse = tafakkurPromptId
    ? allVersesFlat.find((v) => v.id === tafakkurPromptId)
    : null;
  const tafakkurExistingNote = tafakkurPromptId
    ? devotionData.savedVerses.find((v) => v?.id === tafakkurPromptId)?.note || ''
    : '';

  const openTodayList = useCallback(() => {
    setShowLifeArtwork(false);
    setShowTodayList(true);
  }, []);
  const closeTodayList = useCallback(() => setShowTodayList(false), []);
  const openLifeArtwork = useCallback(() => {
    setShowTodayList(false);
    setShowLifeArtwork(true);
  }, []);
  const closeLifeArtwork = useCallback(() => setShowLifeArtwork(false), []);
  const openBurhanModal = useCallback((event) => {
    const origin = captureClickOriginFromEvent(event);
    setBurhanClosing(false);
    setBurhanOrigin(origin);
  }, []);
  const openMiraclesModal = useCallback((event) => {
    const origin = captureClickOriginFromEvent(event);
    setMiraclesClosing(false);
    setMiraclesOrigin(origin);
  }, []);
  const handleSanctuaryNavSelect = useCallback(
    (target, event) => {
      const plan = resolveNavTargetTransition({
        target,
        currentView,
        isInsightsGatewayOpen,
        isBurhanWorldOpen,
        isMiraclesWorldOpen,
        isLearningPathOpen,
      });

      if (plan.action === 'stay') {
        hapticDetent();
        return;
      }

      hapticNavigate();

      if (plan.nextView) {
        setCurrentView(plan.nextView);
      }

      if (plan.closeLearning === 'immediate') {
        setLearningPathOrigin(null);
        setLearningPathClosing(false);
      } else if (plan.closeLearning === 'animate') {
        setLearningPathClosing(true);
      }

      if (plan.closeBurhan === 'immediate') {
        setBurhanOrigin(null);
        setBurhanClosing(false);
      } else if (plan.closeBurhan === 'animate') {
        setBurhanClosing(true);
      }

      if (plan.closeMiracles === 'immediate') {
        setMiraclesOrigin(null);
        setMiraclesClosing(false);
      } else if (plan.closeMiracles === 'animate') {
        setMiraclesClosing(true);
      }

      if (plan.closeGateway === 'immediate') {
        setInsightsGatewayOrigin(null);
        setInsightsGatewayClosing(false);
      } else if (plan.closeGateway === 'animate') {
        setInsightsGatewayClosing(true);
      }

      if (plan.action === 'open-gateway' || plan.ensureGatewayOpen) {
        const origin = captureClickOriginFromEvent(event);
        setInsightsGatewayClosing(false);
        setInsightsGatewayOrigin(origin);
      } else if (plan.action === 'open-learning') {
        const origin = captureClickOriginFromEvent(event);
        setLearningPathClosing(false);
        setLearningPathOrigin(origin);
      }
    },
    [
      currentView,
      isInsightsGatewayOpen,
      isBurhanWorldOpen,
      isMiraclesWorldOpen,
      isLearningPathOpen,
    ]
  );
  const handleMarkMiracleExplored = useCallback((miracleId) => {
    if (!miracleId) return;
    setExploredMiracleIds((prev) => {
      if (prev.includes(miracleId)) return prev;
      const next = [...prev, miracleId];
      try {
        localStorage.setItem(MIRACLES_EXPLORED_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore storage write errors
      }
      return next;
    });
  }, []);
  const handleOpenSharePass = useCallback((payload) => {
    setSharePassLaunch(payload);
  }, []);
  const openDuasModal = useCallback(() => setShowDuas(true), []);
  const openQadaModal = useCallback(() => setShowQada(true), []);
  const openArchiveModal = useCallback(() => setShowArchive(true), []);
  const openRemindersModal = useCallback(() => setShowReminders(true), []);
  const openSettingsModal = useCallback(() => setShowSettings(true), []);
  const handleReplayOnboarding = useCallback(() => setOnboardingMode('replay'), []);
  const handleSkipOnboarding = useCallback(() => {
    if (onboardingMode === 'initial') {
      saveOnboardingRecord({
        completed: true,
        skipped: true,
        completedAt: new Date().toISOString(),
      });
    }
    setOnboardingMode(null);
  }, [onboardingMode, saveOnboardingRecord]);
  const handleCompleteOnboarding = useCallback(
    async (result) => {
      if (result?.name) {
        devotionData.setProfile(result.name);
      }
      if (result?.chimeProfileId) {
        devotionData.setNotificationChimeProfile(result.chimeProfileId);
      }
      if (typeof result?.leadMinutes === 'number') {
        devotionData.setNotificationLeadMinutes(result.leadMinutes);
      }
      if (result?.dailyIntention) {
        devotionData.setDailyIntention(result.dailyIntention);
      }
      if (result?.selectedVerseId) {
        devotionData.toggleSaveVerse(result.selectedVerseId, true);
      }
      if (Array.isArray(result?.selectedAnchorLabels) && result.selectedAnchorLabels.length > 0) {
        const existingTodoTexts = new Set(
          (devotionData.dailyTodos || []).map((t) => (t?.text || '').trim().toLowerCase())
        );
        result.selectedAnchorLabels.forEach((label) => {
          const clean = (label || '').trim();
          if (clean && !existingTodoTexts.has(clean.toLowerCase())) {
            devotionData.addDailyTodo(clean);
            existingTodoTexts.add(clean.toLowerCase());
          }
        });
      }
      if (result?.enableReminders) {
        devotionData.setAutoSyncSolarReminders(true);
        devotionData.setAllPrayerRemindersEnabled(true);
        try {
          await notifications.requestPermission?.();
        } catch {
          // Graceful fallback if browser blocks or denies notification prompt
        }
      }
      saveOnboardingRecord({
        completed: true,
        skipped: false,
        completedAt: new Date().toISOString(),
        goalId: result?.goalId || null,
        struggleIds: result?.struggleIds || [],
        selectedVerseId: result?.selectedVerseId || null,
        selectedAnchorIds: result?.selectedAnchorIds || [],
      });
      setOnboardingMode(null);
    },
    [devotionData, notifications, saveOnboardingRecord]
  );
  const handleOpenMisbaha = useCallback((launch) => setMisbahaLaunch(launch), []);
  const handleInspectBadge = useCallback((badge) => setInspectedBadge(badge), []);
  const { goToStation } = devotionData;
  const handleSelectStation = useCallback(
    (idx) => {
      if (idx !== maq.currentStation) hapticNavigate();
      setVerseIndex(0);
      goToStation(idx);
    },
    [maq.currentStation, goToStation]
  );

  return (
    <div
      className={`w-full h-full ${tBg} overflow-clip font-sans relative select-none transition-colors duration-300`}
      onPointerMove={handlePointerMove}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
    >
      {/* Live Prayer-Time Synced Gouache Cloud Backdrop */}
      <PaintedClouds isLightMode={isLightMode} atmosphere={palette} />

      {/* On-Demand Interactive Effects Canvas (Press Ring & Celebration Embers) */}
      <canvas ref={canvasRef} className="absolute inset-0 z-[1] pointer-events-none block" />

      {/* Measured Contrast & Atmosphere Scrim */}
      <div
        className="absolute inset-0 z-10 pointer-events-none transition-[background] duration-300"
        style={{
          background: isLightMode
            ? isHikmah
              ? 'linear-gradient(to bottom, rgba(246,243,236,0.72) 0%, rgba(246,243,236,0.34) 22%, rgba(246,243,236,0.28) 78%, rgba(244,240,232,0.58) 100%), radial-gradient(ellipse 74% 66% at 50% 48%, rgba(248,245,238,0.68) 0%, rgba(235,244,242,0.32) 60%, rgba(220,234,238,0.18) 100%)'
              : 'linear-gradient(to bottom, rgba(248,245,238,0.68) 0%, rgba(248,245,238,0.22) 22%, rgba(248,245,238,0.18) 78%, rgba(244,240,232,0.52) 100%), radial-gradient(ellipse 74% 66% at 50% 48%, rgba(252,249,243,0.62) 0%, rgba(246,242,235,0.28) 58%, rgba(240,236,228,0.12) 100%)'
            : isHikmah
              ? 'radial-gradient(ellipse 76% 68% at 50% 48%, rgba(4,16,14,0.42) 0%, rgba(3,12,11,0.62) 60%, rgba(2,8,10,0.82) 100%)'
              : 'linear-gradient(to bottom, rgba(6,9,18,0.46) 0%, rgba(6,9,18,0.14) 24%, rgba(6,9,18,0.12) 76%, rgba(5,7,14,0.52) 100%), radial-gradient(ellipse 74% 66% at 50% 48%, rgba(7,10,19,0.38) 0%, rgba(6,9,16,0.24) 58%, rgba(4,6,12,0.56) 100%)',
        }}
      />

      {/* LEFT-CENTER SACRED LINE ARTWORK (LIFE, HOPES & CALAMITIES — CENTERED ALONE) */}
      <div
        aria-hidden={currentView !== 'main' || isBackgroundPaused || undefined}
        inert={currentView !== 'main' || isBackgroundPaused}
        className={`fixed left-2 md:left-6 top-0 bottom-0 z-30 flex items-center justify-center pointer-events-none transition-opacity duration-400 ${
          currentView === 'main' && !isFullScreenWorldOpen && !isOnboardingOpen
            ? 'opacity-100'
            : 'opacity-0'
        }`}
      >
        <div
          className={`transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            currentView === 'main' && !isFullScreenWorldOpen && !isOnboardingOpen && !showTodayList
              ? 'opacity-100 translate-x-0 pointer-events-auto'
              : 'opacity-0 -translate-x-3 pointer-events-none'
          }`}
        >
          <PropheticLifeArtwork
            completedCount={completedPrayers.length}
            totalPrayers={PRAYERS.length}
            isLightMode={isLightMode}
            accentColor={accentHex}
            isOpen={showLifeArtwork}
            onOpen={openLifeArtwork}
            onClose={closeLifeArtwork}
          />
        </div>
      </div>

      {/* --- WHISPER-QUIET SPATIAL HEADER --- */}
      <header
        aria-hidden={isBackgroundPaused || undefined}
        inert={isBackgroundPaused}
        className={`absolute left-0 right-0 z-30 grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-5 md:px-10 pointer-events-none transition-opacity duration-300 ${
          isOnboardingOpen ? 'opacity-0 invisible' : 'opacity-100'
        }`}
        style={{ top: 'calc(12px + var(--sat))' }}
      >
        {/* Left Cell: Editorial Hijri Date Stamp + Quiet City Location Trigger */}
        <div
          className="justify-self-start text-left min-w-0 max-w-full flex flex-col justify-center"
          aria-label={`Hijri date: ${hijri.formatted}${hijri.notable ? ` (${hijri.notable.label})` : ''}`}
        >
          <span
            className={`font-serif-eng text-[8.5px] md:text-[9.5px] uppercase tracking-[0.14em] leading-tight truncate ${tTextSub} ${isLightMode ? 'opacity-80' : 'opacity-72'} transition-colors duration-300`}
            style={{ textShadow: glowSub }}
          >
            {hijri.day} {hijri.monthName}
          </span>
          <button
            type="button"
            onClick={() => {
              hapticNavigate();
              setShowCityPicker(true);
            }}
            aria-label={
              prayerTimes.hasLocation
                ? `Location: ${prayerTimes.cityLabel}. Tap to change city.`
                : 'Set city for live prayer times'
            }
            className={`pointer-events-auto text-left font-serif-eng text-[7.5px] md:text-[8px] uppercase tracking-[0.16em] leading-tight mt-0.5 truncate cursor-pointer transition-opacity hover:opacity-100 ${
              prayerTimes.hasLocation ? (hijri.notable ? '' : tTextSub) : tTextGold
            }`}
            style={{
              color: hijri.notable ? accentHex : undefined,
              opacity: hijri.notable ? 0.92 : isLightMode ? 0.68 : 0.64,
              textShadow: glowSub,
            }}
          >
            {hijri.notable
              ? `${hijri.notable.label} · ${prayerTimes.hasLocation ? prayerTimes.cityLabel : 'Set City'}`
              : `${hijri.year} AH · ${prayerTimes.hasLocation ? prayerTimes.cityLabel : 'Set City'}`}
          </button>
        </div>

        {/* Center Cell: Pure Calligraphic Wordmark */}
        <div className="justify-self-center text-center mix-blend-normal flex flex-col items-center">
          <span
            aria-label="Ruh"
            className={`font-calligraphy text-[28px] md:text-[32px] leading-none ${tTextMain} opacity-85 block transition-colors duration-300`}
            style={{ textShadow: glowSub }}
            dir="rtl"
          >
            رُوح
          </span>

          {ambientDhikr && (
            <span
              className="font-calligraphy text-[13px] mt-1.5 transition-all duration-1000 pointer-events-none"
              style={{
                color: accentHex,
                opacity: 0.78,
                animation: 'fadeInOut 5s ease-in-out forwards',
              }}
              dir="rtl"
            >
              {ambientDhikr}
            </span>
          )}
        </div>

        {/* Right Cell: Celestial Theme Toggle */}
        <button
          type="button"
          aria-label={isLightMode ? 'Switch to Night Mode' : 'Switch to Daylight Mode'}
          onClick={() => {
            hapticToggle(!isLightMode);
            toggleLightMode();
          }}
          className={`justify-self-end pointer-events-auto min-w-[44px] min-h-[44px] -mr-2 flex items-center justify-center rounded-full transition-all duration-500 hover:scale-110 cursor-pointer ${
            isLightMode
              ? 'text-[#9c7533] hover:bg-[#9c7533]/10'
              : 'text-[#e4dac8] hover:bg-white/5 opacity-70 hover:opacity-100'
          }`}
        >
          {isLightMode ? <SunIcon size={16} /> : <MoonIcon size={16} />}
        </button>
      </header>

      {/* --- 3-COLUMN ARCHITECTURAL LAYOUT --- */}
      <div
        aria-hidden={isBackgroundPaused || undefined}
        inert={isBackgroundPaused}
        className={`absolute inset-0 z-20 flex w-full h-full px-1 md:px-10 pointer-events-none transition-opacity duration-300 ${
          isOnboardingOpen ? 'opacity-0 invisible' : 'opacity-100'
        }`}
      >
        {/* Left Col - Spatial Margin Spacer */}
        <div className="w-[44px] md:w-[140px] flex-shrink-0 h-full pl-1 md:pl-10" />

        {/* Center Col - Dynamic Content Area (Swaps between Sanctuary, Devotion, and Soul Mirror) */}
        <div className="flex-grow min-w-0 flex flex-col items-center justify-center h-full relative">
          {/* === VIEW 1: MAIN (SUBMERSION ENGINE) === */}
          <div
            className="absolute inset-0 flex items-center justify-center pb-[154px] md:pb-[168px] pt-[52px] transition-[opacity,transform,visibility] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] w-full"
            style={{
              opacity: currentView === 'main' ? 1 : 0,
              visibility: currentView === 'main' ? 'visible' : 'hidden',
              transform: currentView === 'main' ? 'scale(1)' : 'scale(0.95)',
              pointerEvents: currentView === 'main' ? 'auto' : 'none',
            }}
          >
            <div
              ref={verseWrapRef}
              className="w-full max-w-[300px] sm:max-w-[340px] md:max-w-[440px] flex flex-col items-center cursor-pointer rounded-3xl mx-auto"
              style={{
                touchAction: 'none',
                WebkitUserSelect: 'none',
                '--press': '0',
                willChange: 'transform',
              }}
              onPointerDown={handleTextPointerDown}
              onPointerUp={handleTextPointerUp}
              onPointerLeave={handleTextPointerUp}
              onPointerCancel={handleTextPointerUp}
            >
              <div className="flex flex-col items-center w-full mix-blend-normal py-6 px-3 sm:px-5" style={verseStyle}>
                {!activeVerse ? (
                  <div
                    className={`font-serif-eng text-[11px] uppercase tracking-widest ${tTextSub} opacity-30 animate-pulse my-12`}
                  >
                    Entering Sanctuary...
                  </div>
                ) : (
                  <>
                    {/* Arabic Verse + Press Charge Glow */}
                    <div className="relative mb-[16px] w-full flex justify-center">
                      <div
                        className={`absolute inset-0 z-30 flex items-center justify-center pointer-events-none transition-all duration-500 ${
                          showSaveGlow ? 'opacity-90 scale-110' : 'opacity-0 scale-50'
                        }`}
                      >
                        <BookmarkIcon
                          size={88}
                          filled
                          className="drop-shadow-lg"
                          style={{ color: accentBrightHex }}
                        />
                      </div>

                      <div
                        className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none transition-none"
                        style={{ opacity: 'calc(var(--press) * 0.85)' }}
                      >
                        <div
                          className="rounded-full blur-2xl transition-none"
                          style={{
                            width: '120%',
                            height: '80%',
                            background: isLightMode ? cBrightHexLight : cBrightHexDark,
                            transform: 'scaleX(calc(0.5 + var(--press) * 0.5))',
                          }}
                        />
                      </div>

                      <p
                        className={`font-arabic text-[clamp(22px,5.4vw,30px)] leading-[2.15] text-center ${tTextMain} transition-colors duration-300 w-full relative z-10`}
                        dir="rtl"
                        style={{ textShadow: glowArabic }}
                      >
                        {activeVerse.a}
                      </p>
                      <p
                        className="font-arabic text-[clamp(22px,5.4vw,30px)] leading-[2.15] text-center absolute top-0 pointer-events-none w-full z-20"
                        dir="rtl"
                        style={{
                          color: accentBrightHex,
                          clipPath: 'inset(0 0 0 calc(100% - var(--press) * 100%))',
                        }}
                      >
                        {activeVerse.a}
                      </p>
                    </div>

                    {/* Press Charge Hairline + Quiet Manuscript Diamond */}
                    <div className="relative w-full h-[14px] flex items-center justify-center mb-[14px]">
                      <div
                        className="flex items-center justify-center gap-2 transition-opacity duration-500"
                        style={{ opacity: 'calc(0.45 - var(--press) * 0.45)' }}
                        aria-hidden="true"
                      >
                        <span className="w-4 h-[1px]" style={{ backgroundColor: accentHex }} />
                        <span className="w-1 h-1 rotate-45" style={{ backgroundColor: accentHex }} />
                        <span className="w-4 h-[1px]" style={{ backgroundColor: accentHex }} />
                      </div>
                      <div
                        className="absolute h-[1px] rounded-full"
                        style={{
                          background: isLightMode ? cBrightHexLight : cBrightHexDark,
                          width: 'calc(var(--press) * 85%)',
                          opacity: 'calc(var(--press) * 1.5)',
                          boxShadow: isLightMode
                            ? `0 0 15px ${accentRgba},0.9)`
                            : `0 0 20px ${accentRgba},0.9), 0 0 40px rgba(255,255,255,0.4)`,
                        }}
                      />
                    </div>

                    {/* Translation, Surah Reference & Whisper-Quiet Context Drawer */}
                    <div
                      className="flex flex-col items-center pointer-events-none w-full"
                      style={{
                        opacity: 'calc(1 - var(--press) * 1.5)',
                        transform: 'translateY(calc(var(--press) * 12px))',
                      }}
                    >
                      <p
                        className={`font-serif-eng italic font-light text-[clamp(14px,3.3vw,16.5px)] leading-[1.9] text-center ${
                          isLightMode ? 'text-[#3a3630]' : 'text-[rgba(232,223,207,0.78)]'
                        } whitespace-pre-line w-full mb-[18px] transition-colors duration-300`}
                        style={{
                          textShadow: glowSub,
                          letterSpacing: '0.025em',
                          marginRight: '-0.025em',
                        }}
                      >
                        {activeTranslation}
                      </p>

                      <div className="flex flex-col items-center w-full">
                        <span
                          className="font-serif-eng text-[9.5px] uppercase text-center transition-colors duration-300"
                          style={{
                            color: isLightMode && !isHikmah ? '#3d3528' : accentHex,
                            opacity: isLightMode ? 0.92 : 0.85,
                            textShadow: glowSub,
                            letterSpacing: '0.26em',
                            marginRight: '-0.26em',
                          }}
                        >
                          {activeVerse.s}
                        </span>

                        {/* Minimalist Borderless Micro-Triggers (Context, Bookmark/Reflect, Share) */}
                        <div className="mt-2.5 flex items-center justify-center gap-3 pointer-events-auto">
                          <button
                            type="button"
                            aria-expanded={showContext}
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={() => {
                              hapticToggle(!showContext);
                              setShowContext(!showContext);
                            }}
                            className={`min-h-[40px] px-2.5 flex items-center justify-center gap-1 transition-all duration-300 hover:scale-105 cursor-pointer ${
                              showContext
                                ? isLightMode
                                  ? 'text-[#7c5a1e] opacity-100'
                                  : 'text-[#d2a24b] opacity-100'
                                : isLightMode
                                  ? 'text-[#2c2720] opacity-78 hover:opacity-100'
                                  : 'text-[#e4dac8] opacity-72 hover:opacity-100'
                            }`}
                          >
                            <span
                              className="font-serif-eng text-[8.5px] uppercase"
                              style={{ letterSpacing: '0.26em', marginRight: '-0.26em' }}
                            >
                              Context
                            </span>
                            <ChevronDownIcon
                              size={12}
                              className={`transition-transform duration-500 ${
                                showContext ? 'rotate-180' : ''
                              }`}
                            />
                          </button>

                          <button
                            type="button"
                            aria-label={isSaved ? 'Reflect on Saved Verse' : 'Save & Reflect'}
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={() => handleBookmarkAndReflect(activeVerse)}
                            className={`min-w-[40px] min-h-[40px] flex items-center justify-center transition-all duration-300 hover:scale-105 cursor-pointer ${
                              isSaved
                                ? isLightMode
                                  ? 'text-[#7c5a1e] opacity-95'
                                  : 'text-[#d2a24b] opacity-95'
                                : isLightMode
                                  ? 'text-[#2c2720] opacity-75 hover:opacity-100'
                                  : 'text-[#e4dac8] opacity-68 hover:opacity-100'
                            }`}
                          >
                            <BookmarkIcon size={12} filled={isSaved} />
                          </button>

                          <button
                            type="button"
                            aria-label="Share Verse"
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => handleShare(e, activeVerse)}
                            className={`min-w-[40px] min-h-[40px] flex items-center justify-center transition-all duration-300 hover:scale-105 cursor-pointer ${
                              copiedFeedback
                                ? isLightMode
                                  ? 'text-[#7c5a1e] opacity-100'
                                  : 'text-[#d2a24b] opacity-100'
                                : isLightMode
                                  ? 'text-[#2c2720] opacity-75 hover:opacity-100'
                                  : 'text-[#e4dac8] opacity-68 hover:opacity-100'
                            }`}
                          >
                            {copiedFeedback ? (
                              <span
                                className="font-serif-eng text-[8px] uppercase"
                                style={{ letterSpacing: '0.22em' }}
                              >
                                Copied
                              </span>
                            ) : (
                              <ShareIcon size={12} />
                            )}
                          </button>
                        </div>

                        <div
                          className="overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col items-center justify-start pointer-events-auto w-full"
                          style={{
                            maxHeight: showContext ? '240px' : '0px',
                            opacity: showContext ? 1 : 0,
                          }}
                        >
                          <div
                            className={`w-full border-t pt-3.5 mt-3.5 ${
                              isLightMode ? 'border-black/[0.08]' : 'border-white/[0.08]'
                            }`}
                          >
                            <p
                              className={`font-serif-eng text-[12px] leading-[1.8] text-center ${
                                isLightMode ? 'text-[#3a3630]' : 'text-[rgba(228,218,200,0.72)]'
                              } w-full`}
                              style={{ letterSpacing: '0.03em', marginRight: '-0.03em' }}
                            >
                              {activeContext}
                            </p>
                            {activeVerse.ts && (
                              <p
                                className="font-serif-eng text-[8px] uppercase opacity-70 mt-3 text-center transition-colors duration-300"
                                style={{
                                  color: accentHex,
                                  letterSpacing: '0.25em',
                                  marginRight: '-0.25em',
                                }}
                              >
                                — {activeVerse.ts}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* === VIEW 2: TASKS (DAILY DEVOTION & HABITS) === */}
          <TasksView
            currentView={currentView}
            dailyTasks={devotionData.dailyTasks}
            rewardedSets={devotionData.rewardedSets}
            incrementTask={devotionData.incrementTask}
            markAdhkarSetRewarded={devotionData.markAdhkarSetRewarded}
            onOpenMisbaha={handleOpenMisbaha}
            sunnahContext={sunnahContext}
            todaySchedule={todaySchedule}
            qadaRemainingCount={qadaTotals.totalRemaining}
            onOpenDuas={openDuasModal}
            onOpenQada={openQadaModal}
          />

          {/* === VIEW 3: PROFILE (SANCTUARY SEEKER ID CARD) === */}
          <div
            data-testid="journey-scroller"
            className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-center transition-[opacity,transform,visibility] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] w-full overflow-hidden px-1 sm:px-2"
            style={{
              top: 'calc(64px + var(--sat))',
              paddingBottom: 'calc(18px + var(--sab))',
              opacity: currentView === 'profile' ? 1 : 0,
              visibility: currentView === 'profile' ? 'visible' : 'hidden',
              transform: currentView === 'profile' ? 'scale(1)' : 'scale(0.985)',
              pointerEvents: currentView === 'profile' ? 'auto' : 'none',
            }}
          >
            {currentView === 'profile' && (
              <ProfileIdCard
                userProfile={userProfile}
                hijri={hijri}
                devotionData={devotionData}
                stations={stations}
                currentStationData={currentStationData}
                maq={maq}
                completedHabitsCount={completedHabitsCount}
                totalHabitsCount={totalHabitsCount}
                qadaRemainingCount={qadaTotals.totalRemaining}
                enabledAlertsCount={enabledAlertsCount}
                accentHex={accentHex}
                isLightMode={isLightMode}
                onSelectStation={handleSelectStation}
                onInspectBadge={handleInspectBadge}
                onOpenDuas={openDuasModal}
                onOpenQada={openQadaModal}
                onOpenArchive={openArchiveModal}
                onOpenReminders={openRemindersModal}
                onOpenSettings={openSettingsModal}
                onOpenSharePass={handleOpenSharePass}
              />
            )}
          </div>
        </div>

        {/* Right Col - Spatial Margin Spacer (Nav Island is fixed above backdrop at z-40) */}
        <div className="w-[44px] md:w-[140px] flex-shrink-0 h-full pointer-events-none pr-1 md:pr-10" />
      </div>

      {/* --- RIGHT-EDGE SLIM FLOATING VERTICAL NAV ISLAND (STANDARD IN CORE VIEWS, SUBTLE WHISPER IN FULL-SCREEN WORLDS) --- */}
      {(() => {
        const isNavHidden = navPresentation.mode === 'hidden';
        const isSubtleNav = navPresentation.mode === 'subtle';
        const isTealTone = navPresentation.tone === 'teal';

        const getNavItemClass = (itemId) => {
          const isActive = activeNavDestination === itemId;
          const sizeClass = isSubtleNav ? 'w-[24px] h-[24px]' : 'w-[26px] h-[26px]';

          if (isActive) {
            if (isSubtleNav && isTealTone) {
              return `${sizeClass} ${
                isLightMode
                  ? 'text-[#0f766e] bg-[#0f766e]/12 ring-1 ring-[#0f766e]/32'
                  : 'text-[#5eead4] bg-[#2dd4bf]/14 ring-1 ring-[#5eead4]/36'
              }`;
            }
            if (isSubtleNav) {
              return `${sizeClass} ${
                isLightMode
                  ? 'text-[#8c621c] bg-[#8c621c]/12 ring-1 ring-[#8c621c]/30'
                  : 'text-[#e4be70] bg-[#e4be70]/14 ring-1 ring-[#e4be70]/35'
              }`;
            }
            return `${sizeClass} ${
              isLightMode
                ? 'text-[#9c7533] shadow-[0_2px_8px_rgba(156,117,51,0.18)] bg-white/65 ring-1 ring-[#9c7533]/30'
                : 'text-[#d2a24b] shadow-[0_2px_8px_rgba(210,162,75,0.2)] bg-white/10 ring-1 ring-[#d2a24b]/35'
            }`;
          }

          return `${sizeClass} ${
            isLightMode
              ? 'text-[#4a453d] opacity-55 hover:opacity-100'
              : 'text-[#e4dac8] opacity-45 hover:opacity-100'
          }`;
        };

        const navShellClass = isSubtleNav
          ? `flex flex-col items-center gap-1 py-1.5 px-0.5 w-[30px] rounded-full border backdrop-blur-md pointer-events-auto opacity-[0.44] sm:opacity-[0.48] hover:opacity-100 has-[:focus-visible]:opacity-100 active:opacity-100 transition-all duration-300 ease-out ${
              isLightMode
                ? isTealTone
                  ? 'bg-[#f6f5f0]/62 hover:bg-[#fbfaf7]/92 border-[#0f766e]/16 shadow-[0_6px_20px_rgba(15,60,56,0.08)]'
                  : 'bg-[#fbf7ef]/62 hover:bg-[#fdfaf3]/92 border-[#8c621c]/18 shadow-[0_6px_20px_rgba(68,48,18,0.09)]'
                : isTealTone
                  ? 'bg-[#071316]/52 hover:bg-[#09191d]/88 border-[#5eead4]/16 shadow-[0_8px_24px_rgba(0,0,0,0.34)]'
                  : 'bg-[#0d1018]/52 hover:bg-[#121622]/88 border-white/[0.11] shadow-[0_8px_24px_rgba(0,0,0,0.38)]'
            }`
          : `flex flex-col items-center gap-1.5 py-1.5 px-0.5 w-[32px] rounded-full border pointer-events-auto transition-all duration-300 ${
              isLightMode
                ? 'bg-white/32 border-white/45 engraved-light island-light'
                : 'bg-[#12100d]/38 border-white/[0.07] engraved-dark island-dark'
            }`;

        return (
          <div
            aria-hidden={isNavHidden || undefined}
            inert={isNavHidden}
            className={`fixed top-1/2 -translate-y-1/2 pointer-events-none transition-[opacity,right] duration-300 ${navPresentation.zIndexClass} ${
              isSubtleNav ? 'right-1.5 sm:right-3 md:right-4' : 'right-2 md:right-8'
            } ${isNavHidden ? 'opacity-0 invisible' : 'opacity-100'}`}
          >
            <div className="relative flex items-center">
              <nav
                aria-label="Sanctuary Navigation"
                data-testid="sanctuary-nav-bar"
                data-nav-mode={navPresentation.mode}
                data-active-destination={activeNavDestination}
                className={navShellClass}
              >
                {/* 1. Main Sanctuary Button */}
                <button
                  type="button"
                  data-testid="nav-sanctuary"
                  title="Sanctuary"
                  aria-label="Sanctuary"
                  aria-current={activeNavDestination === 'main' ? 'page' : undefined}
                  onClick={(e) => handleSanctuaryNavSelect('main', e)}
                  className={`relative rounded-full transition-all duration-300 hover:scale-105 flex items-center justify-center cursor-pointer ${getNavItemClass('main')}`}
                >
                  <MainNavIcon size={isSubtleNav ? 12.5 : 13} />
                </button>

                {/* 2. Daily Devotion / Practices Button */}
                <button
                  type="button"
                  data-testid="nav-practices"
                  title="Practices"
                  aria-label="Practices"
                  aria-current={activeNavDestination === 'tasks' ? 'page' : undefined}
                  onClick={(e) => handleSanctuaryNavSelect('tasks', e)}
                  className={`relative rounded-full transition-all duration-300 hover:scale-105 flex items-center justify-center cursor-pointer ${getNavItemClass('tasks')}`}
                >
                  <TasksNavIcon size={isSubtleNav ? 12.5 : 13} />
                </button>

                {/* 3. MIDDLE WINDOW: Burhan & Miracles — Expands into Twin-Portal Gateway */}
                <button
                  type="button"
                  data-testid="nav-burhan-miracles"
                  title={
                    isBurhanWorldOpen || isMiraclesWorldOpen
                      ? 'Signs & Proofs Gateway'
                      : 'Burhan & Miracles'
                  }
                  aria-label={
                    isBurhanWorldOpen || isMiraclesWorldOpen
                      ? 'Signs and Proofs Gateway'
                      : 'Burhan and Miracles'
                  }
                  aria-current={activeNavDestination === 'insights' ? 'page' : undefined}
                  aria-expanded={activeNavDestination === 'insights'}
                  onClick={(e) => handleSanctuaryNavSelect('insights', e)}
                  className={`relative rounded-full transition-all duration-300 hover:scale-105 flex items-center justify-center cursor-pointer ${getNavItemClass('insights')}`}
                >
                  <InsightsNavIcon size={isSubtleNav ? 13 : 13.5} />
                </button>

                {/* 4. Learning Path / Study Sanctuary Button */}
                <button
                  type="button"
                  data-testid="nav-learning-path"
                  title="Study Sanctuary"
                  aria-label="Learning Path"
                  aria-current={activeNavDestination === 'learning' ? 'page' : undefined}
                  aria-expanded={activeNavDestination === 'learning'}
                  onClick={(e) => handleSanctuaryNavSelect('learning', e)}
                  className={`relative rounded-full transition-all duration-300 hover:scale-105 flex items-center justify-center cursor-pointer ${getNavItemClass('learning')}`}
                >
                  <LearningPathNavIcon size={isSubtleNav ? 12.5 : 13} />
                </button>

                {/* 5. Soul Mirror / Journey Button */}
                <button
                  type="button"
                  data-testid="nav-journey"
                  title="Journey"
                  aria-label="Journey"
                  aria-current={activeNavDestination === 'profile' ? 'page' : undefined}
                  onClick={(e) => handleSanctuaryNavSelect('profile', e)}
                  className={`relative rounded-full transition-all duration-300 hover:scale-105 flex items-center justify-center cursor-pointer ${getNavItemClass('profile')}`}
                >
                  <ProfileNavIcon size={isSubtleNav ? 12.5 : 13} />
                </button>
              </nav>
            </div>
          </div>
        );
      })()}

      {/* --- 5. 3D PRAYER SCROLL WHEEL + ALIGNED QIBLA DOCK (MAIN VIEW ONLY) --- */}
      <div
        aria-hidden={isBackgroundPaused || undefined}
        inert={isBackgroundPaused}
        className="absolute inset-x-0 bottom-0 z-30 pointer-events-none transition-[opacity,visibility,transform] duration-500"
        style={{
          height: 'calc(216px + var(--sab))',
          opacity: currentView === 'main' && !isFullScreenWorldOpen && !isOnboardingOpen ? 1 : 0,
          visibility:
            currentView === 'main' && !isFullScreenWorldOpen && !isOnboardingOpen
              ? 'visible'
              : 'hidden',
          transform: currentView === 'main' ? 'translateY(0)' : 'translateY(10px)',
        }}
      >
        {/* Single Mutually-Exclusive Slot Above the Prayer Scroll Wheel */}
        {currentView === 'main' && !isFullScreenWorldOpen && !isOnboardingOpen && (
          <div
            className="absolute left-1/2 -translate-x-1/2 z-40 flex justify-center w-[calc(100%-32px)] max-w-[360px]"
            style={{ bottom: 'calc(176px + var(--sab))' }}
          >
            {pendingPassedPrayerId ? (
              (() => {
                const pendingObj = PRAYERS.find((p) => p.id === pendingPassedPrayerId);
                return (
                  <div
                    role="group"
                    aria-label={`${pendingObj?.label || 'Prayer'} window passed options`}
                    data-testid="passed-prayer-prompt"
                    className={`pointer-events-auto flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-2xl border backdrop-blur-md transition-all max-w-full ${
                      isLightMode
                        ? 'bg-[#fbf8f1]/94 border-[#9c7533]/28 text-[#1a1814] island-light'
                        : 'bg-[#0b0e16]/92 border-[#d2a24b]/28 text-[#f5eee0] island-dark'
                    }`}
                  >
                    <span
                      className={`font-serif-eng text-[8px] sm:text-[8.5px] uppercase tracking-[0.1em] sm:tracking-[0.12em] px-1 whitespace-nowrap ${tTextSub} opacity-80`}
                    >
                      {pendingObj?.label}
                    </span>
                    <button
                      type="button"
                      data-testid="passed-prayer-ontime"
                      onClick={(e) => {
                        e.stopPropagation();
                        commitPrayerToggle(pendingPassedPrayerId, 'ontime');
                      }}
                      className={`min-h-[28px] px-2 sm:px-2.5 py-1 rounded-xl font-serif-eng text-[8.5px] sm:text-[9px] uppercase tracking-[0.09em] sm:tracking-[0.11em] whitespace-nowrap cursor-pointer transition-colors ${
                        isLightMode
                          ? 'bg-[#9c7533] text-white hover:bg-[#856227]'
                          : 'bg-[#d2a24b]/24 text-[#f0d18d] border border-[#d2a24b]/38 hover:bg-[#d2a24b]/34'
                      }`}
                    >
                      Prayed on time
                    </button>
                    <button
                      type="button"
                      data-testid="passed-prayer-qada"
                      onClick={(e) => {
                        e.stopPropagation();
                        commitPrayerToggle(pendingPassedPrayerId, 'qada');
                      }}
                      className={`min-h-[28px] px-2 sm:px-2.5 py-1 rounded-xl font-serif-eng text-[8.5px] sm:text-[9px] uppercase tracking-[0.09em] sm:tracking-[0.11em] whitespace-nowrap cursor-pointer border transition-colors ${
                        isLightMode
                          ? 'border-black/14 text-[#4a453d] hover:bg-black/5'
                          : 'border-white/15 text-[#e4dac8]/85 hover:bg-white/10'
                      }`}
                    >
                      Missed · Qada
                    </button>
                    <button
                      type="button"
                      aria-label="Dismiss"
                      onClick={(e) => {
                        e.stopPropagation();
                        hapticDismiss();
                        setPendingPassedPrayerId(null);
                      }}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-[13px] leading-none cursor-pointer opacity-60 hover:opacity-100 shrink-0 ${tTextSub}`}
                    >
                      ×
                    </button>
                  </div>
                );
              })()
            ) : lockedNotice ? (
              <div
                role="status"
                aria-live="polite"
                data-testid="locked-prayer-notice"
                className={`pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-2xl border backdrop-blur-md transition-all ${
                  isLightMode
                    ? 'bg-[#fbf8f1]/92 border-[#9c7533]/24 text-[#1a1814] island-light'
                    : 'bg-[#0b0e16]/90 border-white/15 text-[#f5eee0] island-dark'
                }`}
              >
                <LockIcon
                  size={12}
                  className={isLightMode ? 'text-[#9c7533] shrink-0' : 'text-[#d2a24b] shrink-0'}
                />
                <span className="font-serif-eng text-[10px] tracking-[0.04em] whitespace-nowrap">
                  {lockedNotice.label} opens at {lockedNotice.formattedStart}
                  {lockedNotice.formattedCountdown ? ` · ${lockedNotice.formattedCountdown}` : ''}
                </span>
                {!prayerTimes.hasLocation ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      hapticNavigate();
                      setLockedNotice(null);
                      setShowCityPicker(true);
                    }}
                    className="font-serif-eng text-[9px] uppercase tracking-[0.14em] underline underline-offset-2 whitespace-nowrap cursor-pointer"
                    style={{ color: accentHex }}
                  >
                    Set City
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      hapticNavigate();
                      setLockedNotice(null);
                      setShowSettings(true);
                    }}
                    className="font-serif-eng text-[9px] uppercase tracking-[0.14em] underline underline-offset-2 whitespace-nowrap cursor-pointer opacity-80 hover:opacity-100"
                    style={{ color: accentHex }}
                  >
                    Travel?
                  </button>
                )}
              </div>
            ) : allCompleted && reviewPrayers ? (
              <button
                type="button"
                onClick={() => {
                  hapticDismiss();
                  setReviewPrayers(false);
                }}
                className={`px-3.5 py-1.5 rounded-full font-serif-eng text-[8.5px] uppercase tracking-[0.2em] cursor-pointer pointer-events-auto transition-all opacity-85 hover:opacity-100 whitespace-nowrap border ${
                  isLightMode
                    ? 'bg-white/75 border-[#9c7533]/25 text-[#9c7533]'
                    : 'bg-[#0b0e16]/75 border-[#d2a24b]/25 text-[#e5c17b]'
                }`}
              >
                Done Reviewing
              </button>
            ) : !hideStackForSeal && nextUpcomingPrayer ? (
              <div
                data-testid="next-prayer-whisper"
                className="flex items-center justify-center gap-1.5 text-center pointer-events-auto"
              >
                <span
                  className={`font-serif-eng text-[9.5px] sm:text-[10px] uppercase tracking-[0.15em] whitespace-nowrap ${tTextSub} ${
                    isLightMode ? 'opacity-78' : 'opacity-70'
                  }`}
                  style={{ textShadow: glowSub }}
                >
                  {nextUpcomingPrayer.label} in {nextUpcomingPrayer.formattedCountdown}
                  <span className="opacity-65"> · {nextUpcomingPrayer.formattedTime}</span>
                  {isTravelMode ? (
                    <span className="ml-1.5" style={{ color: accentHex }}>
                      · Travel
                    </span>
                  ) : null}
                </span>
                {!prayerTimes.hasLocation && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      hapticNavigate();
                      setShowCityPicker(true);
                    }}
                    className="font-serif-eng text-[9px] uppercase tracking-[0.16em] whitespace-nowrap cursor-pointer opacity-85 hover:opacity-100 transition-opacity"
                    style={{ color: accentHex, textShadow: glowSub }}
                  >
                    · Set City
                  </button>
                )}
              </div>
            ) : null}
          </div>
        )}

        {/* All-Prayers-Fulfilled Seal (aligned at the wheel focal height) */}
        {hideStackForSeal ? (
          <div
            className="absolute left-1/2 -translate-x-1/2 w-[calc(100%-130px)] max-w-[308px] pointer-events-auto"
            style={{ bottom: 'calc(67px + var(--sab))' }}
          >
            <button
              type="button"
              aria-label="All prayers fulfilled. Tap to review or undo prayers."
              onClick={() => {
                hapticNavigate();
                setReviewPrayers(true);
              }}
              className={`w-full h-[56px] px-4 rounded-2xl border flex flex-col items-center justify-center transition-all duration-500 cursor-pointer ${
                isLightMode
                  ? 'bg-white/80 hover:bg-white/92 border-[#9c7533]/35 island-light'
                  : 'bg-[#0b0e16]/80 hover:bg-[#0e1320]/92 border-[#d2a24b]/35 island-dark'
              }`}
            >
              <span
                className={`font-calligraphy text-[17px] leading-none whitespace-nowrap ${
                  isLightMode ? 'text-[#9c7533]' : 'text-[#e5c17b]'
                }`}
                style={{
                  textShadow: isLightMode ? 'none' : `0 0 22px ${accentRgba},0.28)`,
                }}
                dir="rtl"
              >
                تَمَّتْ الصَّلَوَات
              </span>
              <span
                className={`font-serif-eng italic text-[10px] tracking-wide mt-1 whitespace-nowrap ${
                  isLightMode ? 'text-[#4a453d] opacity-75' : 'text-[rgba(228,218,200,0.68)]'
                }`}
              >
                All prayers fulfilled · Tap to adjust
              </span>
            </button>
          </div>
        ) : (
          /* 3D Vertical Rolodex Prayer Scroll Wheel */
          <div
            role="listbox"
            aria-label="Daily Prayers Scroll Wheel"
            onTouchStart={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            onPointerDown={(e) => {
              if (e.button !== undefined && e.button !== 0 && e.pointerType === 'mouse') return;
              wheelDragRef.current = {
                active: true,
                pointerId: e.pointerId,
                startY: e.clientY,
                startIndex: focusedIndex,
                lastStepIndex: focusedIndex,
                didDrag: false,
              };
            }}
            onPointerMove={(e) => {
              const drag = wheelDragRef.current;
              if (!drag.active) return;
              const deltaY = e.clientY - drag.startY;
              if (Math.abs(deltaY) > 8) {
                if (!drag.didDrag) {
                  drag.didDrag = true;
                  try {
                    e.currentTarget.setPointerCapture?.(e.pointerId);
                  } catch {}
                }
                if (prayerLongPressTimer.current) {
                  clearTimeout(prayerLongPressTimer.current);
                  prayerLongPressTimer.current = null;
                }
              }
              if (drag.didDrag) {
                cancelPrayerAutoFocus();
                const steps = Math.round(-deltaY / 32);
                const nextIdx = Math.max(0, Math.min(PRAYERS.length - 1, drag.startIndex + steps));
                if (nextIdx !== drag.lastStepIndex) {
                  const dir = nextIdx > drag.lastStepIndex ? 1 : -1;
                  drag.lastStepIndex = nextIdx;
                  prayerManualFocusRef.current = true;
                  setPendingPassedPrayerId(null);
                  setLockedNotice(null);
                  hapticDetent();
                  playPrayerToggleCue({ direction: dir });
                  setFocusedIndex(nextIdx);
                }
              }
            }}
            onPointerUp={(e) => {
              wheelDragRef.current.active = false;
              try {
                if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
                  e.currentTarget.releasePointerCapture(e.pointerId);
                }
              } catch {}
              if (wheelDragRef.current.didDrag) {
                if (wheelDragResetTimerRef.current) clearTimeout(wheelDragResetTimerRef.current);
                wheelDragResetTimerRef.current = setTimeout(() => {
                  wheelDragResetTimerRef.current = null;
                  wheelDragRef.current.didDrag = false;
                }, 60);
              }
            }}
            onPointerCancel={(e) => {
              wheelDragRef.current.active = false;
              wheelDragRef.current.didDrag = false;
              try {
                if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
                  e.currentTarget.releasePointerCapture(e.pointerId);
                }
              } catch {}
              if (prayerLongPressTimer.current) {
                clearTimeout(prayerLongPressTimer.current);
                prayerLongPressTimer.current = null;
              }
            }}
            className="absolute left-1/2 -translate-x-1/2 w-[calc(100%-130px)] max-w-[308px] h-[150px] pointer-events-auto select-none"
            style={{
              bottom: 'calc(20px + var(--sab))',
              touchAction: 'none',
              perspective: '720px',
              WebkitMaskImage:
                'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.92) 10%, #000 18%, #000 82%, rgba(0,0,0,0.92) 90%, transparent 100%)',
              maskImage:
                'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.92) 10%, #000 18%, #000 82%, rgba(0,0,0,0.92) 90%, transparent 100%)',
            }}
          >
            {PRAYERS.map((item, i) => {
              const offset = i - focusedIndex;
              const absOffset = Math.abs(offset);
              const isVisible = absOffset <= 2;
              const isActive = offset === 0;
              const isAdjacent = absOffset === 1;
              const isCompletedItem = completedPrayers.includes(item.id);
              const itemStatus = prayerStatuses[item.id] || 'ontime';
              const isChecking = checkingId === item.id;
              const RenderIcon = getPrayerIcon(item.iconType);
              const windowInfo = prayerWindows[item.id] || {
                status: 'active',
                canLog: true,
                formattedCountdown: '',
                formattedStart: '',
              };
              const isLocked = !isCompletedItem && !windowInfo.canLog;
              const isPassedUnlogged = !isCompletedItem && windowInfo.status === 'passed';
              const isTravelUnlocked = !isCompletedItem && windowInfo.status === 'travel-unlocked';
              const isNextPrayer =
                nextUpcomingPrayer?.id === item.id && !nextUpcomingPrayer.isTomorrow && !isCompletedItem;

              const yPos =
                offset === 0
                  ? 0
                  : offset > 0
                    ? absOffset === 1
                      ? 41
                      : 71
                    : absOffset === 1
                      ? -41
                      : -71;
              const scale = isActive ? 1 : isAdjacent ? 0.89 : 0.76;
              const rotateX = isActive ? 0 : isAdjacent ? offset * -23 : offset * -38;
              const cardOpacity = !isVisible
                ? 0
                : isActive
                  ? isLocked
                    ? 0.92
                    : 1
                  : isAdjacent
                    ? isLightMode
                      ? 0.68
                      : 0.6
                    : isLightMode
                      ? 0.25
                      : 0.22;

              const subtitleText = isCompletedItem
                ? itemStatus === 'qada'
                  ? 'Qada · Tap to undo'
                  : 'Prayed · Tap to undo'
                : isLocked
                  ? windowInfo.formattedCountdown
                    ? `Opens in ${windowInfo.formattedCountdown}`
                    : `Opens at ${windowInfo.formattedStart}`
                  : isPassedUnlogged
                    ? 'Window passed · Tap to log'
                    : isTravelUnlocked
                      ? 'Travel · Combining'
                      : 'Now open · Tap to log';

              return (
                <button
                  key={item.id}
                  type="button"
                  role="option"
                  data-prayer-id={item.id}
                  data-prayer-window={windowInfo.status}
                  aria-selected={isActive}
                  aria-hidden={!isVisible}
                  tabIndex={isActive ? 0 : -1}
                  aria-label={`${item.label} Prayer${
                    isCompletedItem
                      ? itemStatus === 'qada'
                        ? ' (Qada, tap to undo)'
                        : ' (Completed, tap to undo)'
                      : isLocked
                        ? ` (Locked until ${windowInfo.formattedStart})`
                        : isPassedUnlogged
                          ? ' (Window passed, tap to log on time or Qada)'
                          : ''
                  }`}
                  onPointerDown={() => {
                    if (!isActive) return;
                    prayerLongPressTriggered.current = false;
                    if (!isCompletedItem && windowInfo.canLog) {
                      prayerLongPressTimer.current = setTimeout(() => {
                        if (wheelDragRef.current.didDrag) return;
                        prayerLongPressTriggered.current = true;
                        prayerLongPressTimer.current = null;
                        handleTogglePrayer(item.id, 'qada');
                      }, 480);
                    }
                  }}
                  onPointerUp={() => {
                    if (prayerLongPressTimer.current) {
                      clearTimeout(prayerLongPressTimer.current);
                      prayerLongPressTimer.current = null;
                    }
                  }}
                  onPointerLeave={() => {
                    if (prayerLongPressTimer.current) {
                      clearTimeout(prayerLongPressTimer.current);
                      prayerLongPressTimer.current = null;
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (wheelDragRef.current.didDrag) {
                      wheelDragRef.current.didDrag = false;
                      return;
                    }
                    if (!isActive) {
                      cancelPrayerAutoFocus();
                      prayerManualFocusRef.current = true;
                      setPendingPassedPrayerId(null);
                      setLockedNotice(null);
                      hapticDetent();
                      playPrayerToggleCue({ direction: i > focusedIndex ? 1 : -1 });
                      setFocusedIndex(i);
                      return;
                    }
                    if (prayerLongPressTriggered.current) {
                      prayerLongPressTriggered.current = false;
                      return;
                    }
                    handleTogglePrayer(item.id, 'ontime');
                  }}
                  className={`group absolute left-0 right-0 top-1/2 h-[54px] flex items-center justify-between px-3 sm:px-4 rounded-2xl transition-[transform,opacity,background-color,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] overflow-hidden border cursor-pointer ${
                    isLightMode
                      ? isActive
                        ? isChecking || isCompletedItem
                          ? 'bg-white/88 border-[#9c7533]/48 island-light'
                          : isLocked
                            ? 'bg-white/70 border-[#9c7533]/14 island-light'
                            : 'bg-white/84 hover:bg-white/94 border-[#9c7533]/24 island-light'
                        : 'bg-white/66 border-[#9c7533]/16'
                      : isActive
                        ? isChecking || isCompletedItem
                          ? 'bg-[#d2a24b]/16 border-[#d2a24b]/42 island-dark'
                          : isLocked
                            ? 'bg-[#0b0e16]/74 border-white/[0.1] island-dark'
                            : 'bg-[#0b0e16]/86 hover:bg-[#0e1320]/94 border-white/[0.16] island-dark'
                        : 'bg-[#0b0e16]/68 border-white/[0.11]'
                  }`}
                  style={{
                    transform: `translate3d(0, calc(-50% + ${yPos}px), 0) scale(${scale}) rotateX(${rotateX}deg)`,
                    transformOrigin: 'center center',
                    backfaceVisibility: 'hidden',
                    opacity: cardOpacity,
                    zIndex: isActive ? 30 : isAdjacent ? 20 : 10,
                    pointerEvents: isVisible ? 'auto' : 'none',
                  }}
                >
                  <div className="flex items-center gap-2 sm:gap-3 z-10 min-w-0">
                    <RenderIcon
                      size={isActive ? 15 : 14}
                      className={`shrink-0 transition-all duration-300 ${
                        isChecking || isCompletedItem
                          ? isLightMode
                            ? 'text-[#9c7533]'
                            : 'text-[#d2a24b]'
                          : isLocked
                            ? isLightMode
                              ? 'text-[#4a453d] opacity-45'
                              : 'text-[#e4dac8] opacity-45'
                            : isLightMode
                              ? 'text-[#4a453d] opacity-80 group-hover:text-[#9c7533]'
                              : 'text-[#e4dac8] opacity-80 group-hover:text-[#d2a24b]'
                      }`}
                    />
                    <div className="flex flex-col items-start min-w-0">
                      <span
                        className={`font-serif-eng uppercase leading-tight transition-all duration-300 ${
                          isActive ? 'text-[11px] sm:text-[11.5px]' : 'text-[10.5px]'
                        } ${
                          isChecking || isCompletedItem
                            ? isLightMode
                              ? 'text-[#9c7533] font-medium'
                              : 'text-[#d2a24b]'
                            : isLocked
                              ? isLightMode
                                ? 'text-[#1a1814]/68'
                                : 'text-[#f5eee0]/68'
                              : isLightMode
                                ? 'text-[#1a1814]'
                                : 'text-[#f5eee0]'
                        }`}
                        style={{ letterSpacing: '0.12em' }}
                      >
                        {item.label}
                      </span>
                      {isActive && (
                        <span
                          className={`font-serif-eng text-[7.5px] sm:text-[8.5px] uppercase tracking-[0.06em] sm:tracking-[0.1em] mt-0.5 leading-none truncate max-w-full ${
                            isCompletedItem
                              ? isLightMode
                                ? 'text-[#9c7533]/90'
                                : 'text-[#d2a24b]/90'
                              : isTravelUnlocked || isNextPrayer
                                ? isLightMode
                                  ? 'text-[#9c7533]/92'
                                  : 'text-[#d2a24b]/92'
                                : `${tTextSub} opacity-75`
                          }`}
                        >
                          {subtitleText}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2.5 z-10 shrink-0 ml-1.5">
                    <span
                      className={`font-serif-eng tabular-nums transition-opacity duration-300 ${
                        isActive ? 'text-[9.5px] sm:text-[10px]' : 'text-[9.5px]'
                      } ${
                        isNextPrayer
                          ? isLightMode
                            ? 'text-[#9c7533] opacity-90'
                            : 'text-[#d2a24b] opacity-90'
                          : isLocked
                            ? `${tTextSub} opacity-55`
                            : `${tTextSub} opacity-75`
                      }`}
                      style={{ letterSpacing: '0.04em' }}
                    >
                      {prayerTimes.prayerData?.formatted[item.id] ||
                        windowInfo.formattedStart ||
                        devotionData.prayers[item.id]?.time ||
                        ''}
                    </span>

                    <div className="relative w-5 h-5 flex items-center justify-center shrink-0">
                      {isChecking ? (
                        <CheckCircleIcon
                          size={isActive ? 18 : 15}
                          className={`animate-[checkmarkPop_0.4s_cubic-bezier(0.34,1.56,0.64,1)_forwards] ${
                            isLightMode ? 'text-[#9c7533]' : 'text-[#d2a24b]'
                          }`}
                        />
                      ) : isCompletedItem ? (
                        <CheckCircleIcon
                          size={isActive ? 18 : 15}
                          className={isLightMode ? 'text-[#9c7533] opacity-85' : 'text-[#d2a24b] opacity-85'}
                        />
                      ) : isLocked ? (
                        <LockIcon
                          size={isActive ? 15 : 13}
                          className={isLightMode ? 'text-[#4a453d] opacity-42' : 'text-[#e4dac8] opacity-42'}
                        />
                      ) : (
                        <CircleIcon
                          size={isActive ? 18 : 15}
                          className={`transition-all duration-300 ${
                            isLightMode
                              ? 'text-[#4a453d] opacity-28 group-hover:opacity-80 group-hover:text-[#9c7533]'
                              : 'text-[#e4dac8] opacity-28 group-hover:opacity-100 group-hover:text-[#d2a24b]'
                          }`}
                        />
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Bottom-Left Today Intentions Dock Twin + Unfurling Illuminated Ledger */}
        <TasksSideColumn
          isVisible={currentView === 'main' && !isFullScreenWorldOpen && !showLifeArtwork}
          isOpen={showTodayList}
          onOpen={openTodayList}
          onClose={closeTodayList}
          accentColor={accentHex}
        />

        {/* Qibla Compass Button aligned cleanly beside the focal slot of the wheel */}
        <button
          type="button"
          aria-label={
            prayerTimes.hasLocation && prayerTimes.prayerData?.qiblaBearing != null
              ? `Qibla Compass (${prayerTimes.prayerData.qiblaBearing}° ${prayerTimes.prayerData.qiblaCardinal})`
              : 'Qibla Compass'
          }
          title={
            prayerTimes.hasLocation && prayerTimes.prayerData?.qiblaBearing != null
              ? `Qibla · ${prayerTimes.prayerData.qiblaBearing}° ${prayerTimes.prayerData.qiblaCardinal}`
              : 'Qibla Compass'
          }
          onClick={() => {
            hapticNavigate();
            setShowQibla(true);
          }}
          style={{ bottom: 'calc(67px + var(--sab))' }}
          className={`pointer-events-auto absolute right-3 sm:right-6 w-[44px] h-[56px] rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all duration-300 active:scale-[0.97] cursor-pointer z-30 ${
            showQibla
              ? isLightMode
                ? 'bg-white/88 border-[#9c7533]/48 text-[#9c7533] island-light'
                : 'bg-[#0b0e16]/88 border-[#d2a24b]/48 text-[#d2a24b] island-dark'
              : isLightMode
                ? 'bg-white/78 hover:bg-white/90 border-[#9c7533]/22 text-[#4a453d] hover:text-[#9c7533] island-light'
                : 'bg-[#0b0e16]/80 hover:bg-[#0e1320]/90 border-white/[0.14] text-[#e4dac8]/80 hover:text-[#d2a24b] island-dark'
          }`}
        >
          <CompassIcon size={16} />
          <span className="font-serif-eng text-[7px] uppercase tracking-[0.14em] leading-none opacity-75">
            Qibla
          </span>
        </button>
      </div>

      {/* --- OVERLAYS & MODALS (Conditionally mounted so closed modals incur zero hook/render cost) --- */}
      {!!tafakkurPromptId && (
        <TafakkurOverlay
          isOpen
          verse={tafakkurVerse}
          initialNote={tafakkurExistingNote}
          isLightMode={isLightMode}
          allVerses={allVersesFlat}
          onSave={(id, note) => {
            if (note.trim()) devotionData.updateVerseNote(id, note.trim());
            setTafakkurPromptId(null);
          }}
          onClose={() => setTafakkurPromptId(null)}
        />
      )}

      {showArchive && (
        <SavedVersesModal
          isOpen
          onClose={() => setShowArchive(false)}
          isLightMode={isLightMode}
          savedVerses={devotionData.savedVerses}
          allVerses={allVersesFlat}
          isSimpleMode={devotionData.isSimpleMode}
          onEditNote={(id) => {
            setShowArchive(false);
            setTafakkurPromptId(id);
          }}
          onRemoveSaved={(id) => toggleSaveVerse(id)}
        />
      )}

      {insightsGatewayOrigin && (
        <InsightsGatewayOverlay
          origin={insightsGatewayOrigin}
          isClosing={insightsGatewayClosing}
          isSubWorldOpen={isBurhanWorldOpen || isMiraclesWorldOpen}
          isLightMode={isLightMode}
          activeBurhan={activeBurhan}
          burhanCompleted={devotionData.burhanCompleted}
          totalBurhans={burhanData.length}
          burhanNotes={devotionData.burhanNotes}
          activeMiracle={activeMiracle}
          exploredMiracleIds={exploredMiracleIds}
          totalMiracles={quranMiraclesData.length}
          onSelectBurhan={openBurhanModal}
          onSelectMiracles={openMiraclesModal}
          onRequestClose={() => setInsightsGatewayClosing(true)}
          onExited={() => {
            setInsightsGatewayOrigin(null);
            setInsightsGatewayClosing(false);
          }}
        />
      )}

      {burhanOrigin && (
        <BurhanOverlay
          origin={burhanOrigin}
          isClosing={burhanClosing}
          burhan={activeBurhan}
          allBurhans={burhanData}
          burhanNotes={devotionData.burhanNotes}
          isLightMode={isLightMode}
          isCompleted={devotionData.burhanCompleted}
          isSimpleMode={devotionData.isSimpleMode}
          onSaveNote={devotionData.saveBurhanNote}
          onComplete={devotionData.completeBurhan}
          onRequestClose={() => setBurhanClosing(true)}
          onExited={() => {
            setBurhanOrigin(null);
            setBurhanClosing(false);
          }}
        />
      )}

      {miraclesOrigin && (
        <MiraclesOverlay
          origin={miraclesOrigin}
          isClosing={miraclesClosing}
          featuredMiracle={activeMiracle}
          allMiracles={quranMiraclesData}
          exploredIds={exploredMiracleIds}
          isLightMode={isLightMode}
          isSimpleMode={devotionData.isSimpleMode}
          onMarkExplored={handleMarkMiracleExplored}
          onRequestClose={() => setMiraclesClosing(true)}
          onExited={() => {
            setMiraclesOrigin(null);
            setMiraclesClosing(false);
          }}
        />
      )}

      {sharePassLaunch && (
        <SharePassModal
          isOpen
          initialFinish={sharePassLaunch.finish}
          isLightMode={isLightMode}
          cardData={sharePassLaunch}
          onClose={() => setSharePassLaunch(null)}
        />
      )}

      {showSettings && (
        <SettingsModal
          isOpen
          atmosphere={palette}
          onClose={() => setShowSettings(false)}
          onOpenCityPicker={() => setShowCityPicker(true)}
          onOpenReminders={() => {
            setShowSettings(false);
            setShowReminders(true);
          }}
          onReplayOnboarding={handleReplayOnboarding}
        />
      )}

      {showReminders && (
        <RemindersModal
          isOpen
          onClose={() => setShowReminders(false)}
          onOpenCityPicker={() => setShowCityPicker(true)}
        />
      )}

      {showQibla && (
        <QiblaModal
          isOpen
          onClose={() => setShowQibla(false)}
          isLightMode={isLightMode}
          prayerTimes={prayerTimes}
          onOpenCityPicker={() => setShowCityPicker(true)}
        />
      )}

      {showCityPicker && (
        <CityPickerModal
          isOpen
          onClose={() => setShowCityPicker(false)}
          isLightMode={isLightMode}
          prayerTimes={prayerTimes}
        />
      )}

      {showDuas && (
        <DuasModal
          isOpen
          onClose={() => setShowDuas(false)}
          isLightMode={isLightMode}
          favoriteDuaIds={devotionData.favoriteDuaIds}
          onToggleFavorite={devotionData.toggleFavoriteDua}
        />
      )}

      {showQada && (
        <QadaModal
          isOpen
          onClose={() => setShowQada(false)}
          isLightMode={isLightMode}
          qada={devotionData.qada}
          onSetCount={devotionData.setQadaCount}
          onBulkAddYears={devotionData.bulkAddQadaYears}
          onCompleteOne={devotionData.completeOneQada}
        />
      )}

      {misbahaLaunch && (
        <MisbahaMode
          isOpen
          tasks={(PRACTICE_SETS[misbahaLaunch.setId] || PRACTICE_SETS.wird).items}
          initialIndex={misbahaLaunch.initialIndex}
          setLabel={(PRACTICE_SETS[misbahaLaunch.setId] || PRACTICE_SETS.wird).label}
          dailyTasks={devotionData.dailyTasks}
          isLightMode={isLightMode}
          onIncrement={devotionData.incrementTask}
          onClose={() => setMisbahaLaunch(null)}
        />
      )}

      {/* SACRED BADGE LOTTIE-STYLE REWARD & SHOWCASE OVERLAY */}
      {!isOnboardingOpen && (devotionData.activeCelebrationBadge || inspectedBadge) && (
        <BadgeRewardOverlay
          badge={devotionData.activeCelebrationBadge || inspectedBadge}
          isLightMode={isLightMode}
          isNewUnlock={Boolean(devotionData.activeCelebrationBadge)}
          queueRemaining={
            devotionData.activeCelebrationBadge
              ? Math.max(0, (devotionData.pendingBadgeCount || 0) - 1)
              : 0
          }
          onClose={() => {
            if (devotionData.activeCelebrationBadge) {
              devotionData.dismissCelebrationBadge();
            } else {
              setInspectedBadge(null);
            }
          }}
        />
      )}

      {/* GUIDED SANCTUARY ONBOARDING FLOW */}
      {isOnboardingOpen && (
        <OnboardingFlow
          isOpen
          isReplay={onboardingMode === 'replay'}
          isLightMode={isLightMode}
          setIsLightMode={setIsLightMode}
          accentHex={accentHex}
          stations={stations}
          devotionData={devotionData}
          prayerTimes={prayerTimes}
          notifications={notifications}
          initialRecord={onboardingRecord}
          onComplete={handleCompleteOnboarding}
          onSkip={handleSkipOnboarding}
        />
      )}

      {/* FULL-SCREEN EXPANDING LEARNING PATH PAGE (Zero navigation chrome) */}
      {learningPathOrigin && (
        <LearningPathPage
          origin={learningPathOrigin}
          isClosing={learningPathClosing}
          isLightMode={isLightMode}
          onRequestClose={() => setLearningPathClosing(true)}
          onExited={() => {
            setLearningPathOrigin(null);
            setLearningPathClosing(false);
          }}
        />
      )}

      {/* KASHF (UNVEILING) CEREMONY */}
      {kashfCeremony && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center pointer-events-none"
          style={{ animation: 'kashfFade 3.2s ease-in-out forwards' }}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.22) 0%, transparent 60%)',
              animation: 'kashfFlare 3.2s ease-out forwards',
            }}
          />
          <div
            className="relative flex flex-col items-center"
            style={{ animation: 'kashfText 3.2s ease-in-out forwards' }}
          >
            <span
              className="font-calligraphy text-[56px] leading-tight mb-3"
              dir="rtl"
              style={{ color: accentHex, textShadow: `0 0 60px ${accentRgba},0.5)` }}
            >
              {nextStation?.name}
            </span>
            <span
              className={`font-serif-eng text-sm uppercase tracking-[0.3em] ${tTextSub}`}
            >
              {nextStation?.nameEn || nextStation?.subtitle}
            </span>
          </div>
        </div>
      )}
      {/* SERENE LOCAL PRAYER NOTIFICATION BANNER */}
      {!isFullScreenWorldOpen && !isOnboardingOpen && (
        <SacredNotificationToast
          toast={notifications.activeToast}
          isLightMode={isLightMode}
          isAlreadyCompleted={Boolean(
            notifications.activeToast?.prayerId &&
              devotionData.dailyCompletedPrayers?.includes(notifications.activeToast.prayerId)
          )}
          isPlayingAdhan={Boolean(notifications.playingChimeProfileId)}
          onStopAdhan={notifications.stopAdhanChimePreview}
          onMarkPrayed={(prayerId) => {
            devotionData.logPrayer(prayerId, 'ontime');
            notifications.dismissToast();
          }}
          onDismiss={notifications.dismissToast}
        />
      )}
    </div>
  );
}
