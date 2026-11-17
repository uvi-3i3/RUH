import { useState, useEffect, useRef, useCallback } from 'react';
import { useTemporalPhase, rgbToHex } from './hooks/useTemporalPhase';
import { SavedVersesModal } from './components/layout/SavedVersesModal';
import { useLocalAI } from './hooks/useLocalAI';
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
  ChevronRightIcon,
  BookmarkIcon,
  BellIcon,
  SettingsIcon,
  MainNavIcon,
  ProfileNavIcon,
  TasksNavIcon,
  ShareIcon,
  CompassIcon,
  BookIcon,
  RotateCcwIcon,
} from './components/icons/Icons';
import { DevotionTimeline } from './components/layout/DevotionTimeline';
import { DevotionHeatmap } from './components/layout/DevotionHeatmap';
import { DailyStreakTracker } from './components/layout/DailyStreakTracker';
import { TasksView } from './components/layout/TasksView';
import { PRACTICE_SETS } from './data/adhkarData';
import { TasksSideColumn } from './components/layout/TasksSideColumn';
import { StationIndicator } from './components/layout/StationIndicator';
import { TafakkurOverlay } from './components/layout/TafakkurOverlay';
import { BurhanOverlay } from './components/layout/BurhanOverlay';
import { SettingsModal } from './components/layout/SettingsModal';
import { RemindersModal } from './components/layout/RemindersModal';
import { QiblaModal } from './components/layout/QiblaModal';
import { CityPickerModal } from './components/layout/CityPickerModal';
import { DuasModal } from './components/layout/DuasModal';
import { QadaModal } from './components/layout/QadaModal';
import { MisbahaMode } from './components/layout/MisbahaMode';
import { burhanData } from './data/burhanData';
import {
  computeQadaTotals,
  getSunnahCalendarContext,
  resolveVerseCopy,
  selectActiveBurhan,
} from './utils/devotionLogic';
import { PaintedClouds } from './components/layout/PaintedClouds';
import { BadgesShowcase } from './components/layout/BadgesShowcase';
import { BadgeRewardOverlay } from './components/badges/BadgeRewardOverlay';
import { SacredNotificationToast } from './components/layout/SacredNotificationToast';
import { registerNativeLifecycle } from './native';
import {
  hapticCelebrate,
  hapticDetent,
  hapticDismiss,
  hapticHeavy,
  hapticNavigate,
  hapticSuccess,
  hapticTapLight,
  hapticToggle,
  hapticUndo,
} from './utils/haptics';

export default function App() {
  const { devotionData, prayerTimes, notifications } = useSanctuary();
  const { isLightMode, toggleLightMode, devTimePhase } = usePreferences();
  const { completedHabitsCount, totalHabitsCount } = useHabits();
  const localAI = useLocalAI();
  const hijri = useHijriDate();
  const enabledAlertsCount =
    PRAYERS.filter((p) => devotionData.prayers?.[p.id]?.enabled).length +
    (devotionData.customReminders || []).filter((r) => r.enabled).length;

  // --- APP STATE ---
  const [currentView, setCurrentView] = useState('main'); // 'main' | 'tasks' | 'profile'
  const viewRef = useRef('main');

  const [verseIndex, setVerseIndex] = useState(0);
  const [contentData, setContentData] = useState(null);
  const [showAmbientTasks, setShowAmbientTasks] = useState(false);
  const [kashfCeremony, setKashfCeremony] = useState(false);
  const kashfTimerRef = useRef(null);
  const palette = useTemporalPhase(devTimePhase);
  const temporalRef = useRef(palette);
  temporalRef.current = palette;

  const [contentError, setContentError] = useState(false);
  const [copiedFeedback, setCopiedFeedback] = useState(false);

  useEffect(() => {
    fetch('/data/content.json')
      .then((r) => r.json())
      .then((data) => {
        setContentData(data);
        setContentError(false);
      })
      .catch((e) => {
        console.error('Error loading content:', e);
        setContentError(true);
      });
  }, []);

  // Derive current station's verses
  const maq = devotionData.maqamat || { currentStation: 0, yaqeenProgress: 0, unlockedStations: [0] };
  const stations = contentData?.stations || [];
  const currentStationData = stations[maq.currentStation] || stations[0];
  const verses = currentStationData?.verses || null;
  const nextStation = stations[maq.currentStation + 1] || null;

  const [showContext, setShowContext] = useState(false);
  const [tafakkurPromptId, setTafakkurPromptId] = useState(null);

  const [focusedIndex, setFocusedIndex] = useState(0);
  const [checkingId, setCheckingId] = useState(null);
  const prayerFocusedRef = useRef(false);

  const [inTransit, setInTransit] = useState(false);
  const [verseStyle, setVerseStyle] = useState({ opacity: 1, transform: 'translateY(0px)' });
  const [showSaveGlow, setShowSaveGlow] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [showBurhanModal, setShowBurhanModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showReminders, setShowReminders] = useState(false);
  const [showQibla, setShowQibla] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [showDuas, setShowDuas] = useState(false);
  const [showQada, setShowQada] = useState(false);
  const [misbahaLaunch, setMisbahaLaunch] = useState(null);
  const [reviewPrayers, setReviewPrayers] = useState(false);
  const [inspectedBadge, setInspectedBadge] = useState(null);
  const [journeyTab, setJourneyTab] = useState('streak'); // 'streak' | 'badges' | 'path'
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

  const isAnyModalOpen = Boolean(
    tafakkurPromptId ||
      showArchive ||
      showBurhanModal ||
      showSettings ||
      showReminders ||
      showQibla ||
      showCityPicker ||
      showDuas ||
      showQada ||
      misbahaLaunch ||
      inspectedBadge ||
      devotionData.activeCelebrationBadge
  );

  // Prioritized Escape dismissal: close strictly the topmost open dialog
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key !== 'Escape') return;
      if (devotionData.activeCelebrationBadge || inspectedBadge) return;
      if (typeof document !== 'undefined' && document.querySelector('[data-habit-editor-open="true"]')) {
        return;
      }
      if (misbahaLaunch) setMisbahaLaunch(null);
      else if (showCityPicker) setShowCityPicker(false);
      else if (tafakkurPromptId) setTafakkurPromptId(null);
      else if (showReminders) setShowReminders(false);
      else if (showSettings) setShowSettings(false);
      else if (showQibla) setShowQibla(false);
      else if (showDuas) setShowDuas(false);
      else if (showQada) setShowQada(false);
      else if (showArchive) setShowArchive(false);
      else if (showBurhanModal) setShowBurhanModal(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    devotionData.activeCelebrationBadge,
    inspectedBadge,
    misbahaLaunch,
    showCityPicker,
    tafakkurPromptId,
    showReminders,
    showSettings,
    showQibla,
    showDuas,
    showQada,
    showArchive,
    showBurhanModal,
  ]);

  // Android hardware back button & mobile app foreground resume lifecycle
  const nativeBackHandlerRef = useRef(() => false);
  nativeBackHandlerRef.current = () => {
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
    if (showBurhanModal) {
      setShowBurhanModal(false);
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
    let timer;
    if (allCompleted) {
      timer = setTimeout(() => setShowAmbientTasks(true), 2400);
    } else {
      setShowAmbientTasks(false);
      setReviewPrayers(false);
    }
    return () => clearTimeout(timer);
  }, [allCompleted]);

  useEffect(() => {
    if (prayerFocusedRef.current || !prayerTimes.prayerData?.nextPrayer) return;
    const nextIdx = PRAYERS.findIndex((p) => p.id === prayerTimes.prayerData.nextPrayer);
    if (nextIdx >= 0) {
      setFocusedIndex(nextIdx);
      prayerFocusedRef.current = true;
    }
  }, [prayerTimes.prayerData?.nextPrayer]);

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
  const touchStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    viewRef.current = currentView;
  }, [currentView]);

  const advanceVerse = useCallback(
    (dir = 1) => {
      if (inTransit || viewRef.current !== 'main' || !verses || verses.length === 0) return;
      hapticDetent();
      setInTransit(true);
      setShowContext(false);

      setVerseStyle({
        opacity: 0,
        transform: `translateY(${dir > 0 ? '-12px' : '12px'})`,
        transition: 'opacity 0.6s ease, transform 0.7s ease',
      });

      setTimeout(() => {
        setVerseIndex((prev) => (prev + dir + verses.length) % verses.length);
        devotionData.logVerseSwipe();
        setVerseStyle({
          opacity: 0,
          transform: `translateY(${dir > 0 ? '14px' : '-14px'})`,
          transition: 'none',
        });

        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            setVerseStyle({
              opacity: 1,
              transform: 'translateY(0px)',
              transition:
                'opacity 1.1s cubic-bezier(0.16,1,0.3,1), transform 1.2s cubic-bezier(0.16,1,0.3,1)',
            });
            setTimeout(() => setInTransit(false), 800);
          })
        );
      }, 550);
    },
    [inTransit, verses, devotionData]
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
      devotionData.toggleSaveVerse(verse.id);
      if (!isSaved) {
        setTafakkurPromptId(verse.id);
      }
      if (engineRef.current.triggerButtonBurst) engineRef.current.triggerButtonBurst();
      setShowSaveGlow(true);
      setTimeout(() => setShowSaveGlow(false), 1000);
    },
    [devotionData, isSaved]
  );

  const handleTextPointerDown = (e) => {
    if (inTransit || currentView !== 'main') return;
    if (e.target.closest('button')) return;
    if (doubleTapCooldown.current) return;

    const now = Date.now();
    if (now - lastTapTime.current < 380) {
      if (activeVerse) {
        handleBookmarkAndReflect(activeVerse);
      }
      lastTapTime.current = 0;
      doubleTapCooldown.current = true;
      setTimeout(() => (doubleTapCooldown.current = false), 400);
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
    stateRef.current.isPressing = true;
    engineRef.current.startPressLoop?.();
  };

  const handleTextPointerUp = (e) => {
    if (e.currentTarget.releasePointerCapture && e.pointerId !== undefined) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
    }
    stateRef.current.isPressing = false;
  };

  const handlePointerMove = (e) => {
    if (!stateRef.current.isPressing) return;
    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
    const clientY = e.clientY || (e.touches && e.touches[0]?.clientY);
    if (!clientX || !clientY) return;

    const dist = Math.hypot(
      clientX - stateRef.current.pointerStartX,
      clientY - stateRef.current.pointerStartY
    );
    if (dist > 20) stateRef.current.isPressing = false;
  };

  const handleTouchStart = (e) => {
    if (isAnyModalOpen || e.target.closest?.('[role="dialog"]')) return;
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = (e) => {
    if (isAnyModalOpen || e.target.closest?.('[role="dialog"]') || e.target.closest('button') || currentView !== 'main') return;
    const dx = touchStart.current.x - e.changedTouches[0].clientX;
    const dy = touchStart.current.y - e.changedTouches[0].clientY;

    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      advanceVerse(dx > 0 ? 1 : -1);
      return;
    }

    if (Math.abs(dy) > 30 && !hideStackForSeal) {
      if (dy > 0) setFocusedIndex((p) => Math.min(PRAYERS.length - 1, p + 1));
      else setFocusedIndex((p) => Math.max(0, p - 1));
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
      scrollCooldown.current = true;
      setFocusedIndex((p) =>
        e.deltaY > 0 ? Math.min(PRAYERS.length - 1, p + 1) : Math.max(0, p - 1)
      );
      setTimeout(() => (scrollCooldown.current = false), 300);
    }
  };

  const handleTogglePrayer = (prayerId, status = 'ontime') => {
    if (checkingId) return;

    if (completedPrayers.includes(prayerId)) {
      hapticUndo();
      devotionData.togglePrayer(prayerId);
      return;
    }

    setCheckingId(prayerId);
    if (engineRef.current.triggerButtonBurst) engineRef.current.triggerButtonBurst();
    const nextCount = completedPrayers.length + 1;
    if (nextCount === PRAYERS.length) hapticCelebrate();
    else if (status === 'qada') hapticHeavy();
    else hapticTapLight();

    setTimeout(() => {
      const currentIdx = PRAYERS.findIndex((p) => p.id === prayerId);
      const nextCompleted = [...completedPrayers, prayerId];
      const nextLaterIdx = PRAYERS.findIndex(
        (p, idx) => idx > currentIdx && !nextCompleted.includes(p.id)
      );
      if (nextLaterIdx !== -1) setFocusedIndex(nextLaterIdx);

      devotionData.togglePrayer(prayerId, status);
      setCheckingId(null);
      if (nextCompleted.length === PRAYERS.length) {
        setReviewPrayers(false);
      }
    }, 600);
  };

  // Yaqeen from tasks
  useEffect(() => {
    const TASK_TARGETS = { istighfar: 100, subhanallah: 33, alhamdulillah: 33, allahu_akbar: 34 };
    const tasks = devotionData.dailyTasks || {};
    const rewarded = devotionData.rewardedIds || [];
    Object.keys(TASK_TARGETS).forEach((id) => {
      if ((tasks[id] || 0) >= TASK_TARGETS[id] && !rewarded.includes(id)) {
        devotionData.markTaskRewarded(id);
        devotionData.addYaqeen(5);
      }
    });
  }, [devotionData.dailyTasks, devotionData.rewardedIds, devotionData]);

  // Kashf ceremony trigger
  useEffect(() => {
    if (maq.yaqeenProgress >= 100 && nextStation && !kashfCeremony) {
      hapticCelebrate();
      setKashfCeremony(true);
      if (kashfTimerRef.current) clearTimeout(kashfTimerRef.current);
      kashfTimerRef.current = setTimeout(() => {
        kashfTimerRef.current = null;
        devotionData.advanceStation();
        setVerseIndex(0);
        setKashfCeremony(false);
      }, 3200);
    }
  }, [maq.yaqeenProgress, nextStation, kashfCeremony, devotionData]);

  const celebrationBadgeId = devotionData.activeCelebrationBadge?.id;
  useEffect(() => {
    if (celebrationBadgeId) {
      hapticCelebrate();
    }
  }, [celebrationBadgeId]);

  useEffect(() => {
    return () => {
      if (kashfTimerRef.current) {
        clearTimeout(kashfTimerRef.current);
        kashfTimerRef.current = null;
      }
    };
  }, []);

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
          setTimeout(() => setCopiedFeedback(false), 1800);
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

  const circumference = 301.59;
  const streakPercentage = Math.min(1, devotionData.currentStreak / 30);
  const dynamicDashOffset = circumference - streakPercentage * circumference;

  const sunnahContext = getSunnahCalendarContext(new Date(), hijri);
  const qadaTotals = computeQadaTotals(devotionData.qada);

  const allVersesFlat = stations.flatMap((s) => s.verses || []);
  const tafakkurVerse = tafakkurPromptId
    ? allVersesFlat.find((v) => v.id === tafakkurPromptId)
    : null;
  const tafakkurExistingNote = tafakkurPromptId
    ? devotionData.savedVerses.find((v) => v?.id === tafakkurPromptId)?.note || ''
    : '';

  return (
    <div
      className={`w-full h-full ${tBg} overflow-clip font-sans relative select-none transition-colors duration-300`}
      onPointerMove={handlePointerMove}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
    >
      {/* Calm Static Gouache Cloud Backdrop */}
      <PaintedClouds isLightMode={isLightMode} />

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
              : 'linear-gradient(to bottom, rgba(6,9,18,0.55) 0%, rgba(6,9,18,0.22) 24%, rgba(6,9,18,0.18) 76%, rgba(5,7,14,0.62) 100%), radial-gradient(ellipse 74% 66% at 50% 48%, rgba(7,10,19,0.46) 0%, rgba(6,9,16,0.34) 58%, rgba(4,6,12,0.68) 100%)',
        }}
      />

      {/* THEOLOGICAL WATERMARK / DEVOTION TIMELINE (Main Sanctuary only) */}
      <DevotionTimeline
        completedCount={completedPrayers.length}
        isLightMode={isLightMode}
        isHikmah={isHikmah}
        accentColor={accentHex}
        accentGlow={`${accentRgba},0.6)`}
        isVisible={currentView === 'main'}
      />

      {/* AMBIENT SIDE COLUMN (Materializes on the left when all 5 prayers are complete) */}
      <TasksSideColumn
        isVisible={showAmbientTasks && currentView === 'main'}
        isLightMode={isLightMode}
        dailyTasks={devotionData.dailyTasks}
        incrementTask={devotionData.incrementTask}
        accentColor={accentHex}
      />

      {/* --- WHISPER-QUIET SPATIAL HEADER --- */}
      <header
        className="absolute left-0 right-0 z-30 grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-5 md:px-10 pointer-events-none"
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
      <div className="absolute inset-0 z-20 flex w-full h-full px-1 md:px-10 pointer-events-none">
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
                  contentError ? (
                    <div className="flex flex-col items-center my-12 gap-4">
                      <span
                        className={`font-serif-eng text-[11px] uppercase tracking-widest ${tTextSub} opacity-60 text-center`}
                      >
                        Unable to load sanctuary content
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          hapticTapLight();
                          setContentError(false);
                          fetch('/data/content.json')
                            .then((r) => r.json())
                            .then((data) => {
                              setContentData(data);
                              setContentError(false);
                            })
                            .catch(() => setContentError(true));
                        }}
                        className={`font-serif-eng text-[10px] uppercase tracking-widest px-4 py-2 rounded-full border transition-all duration-300 pointer-events-auto cursor-pointer ${
                          isLightMode
                            ? 'border-[#9c7533]/40 text-[#9c7533] hover:bg-[#9c7533]/10'
                            : 'border-[#d2a24b]/40 text-[#d2a24b] hover:bg-[#d2a24b]/10'
                        }`}
                      >
                        Retry
                      </button>
                    </div>
                  ) : (
                    <div
                      className={`font-serif-eng text-[11px] uppercase tracking-widest ${tTextSub} opacity-30 animate-pulse my-12`}
                    >
                      Entering Sanctuary...
                    </div>
                  )
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

          {/* === VIEW 2: TASKS (DAILY DEVOTION & BURHAN) === */}
          <TasksView
            currentView={currentView}
            dailyTasks={devotionData.dailyTasks}
            rewardedSets={devotionData.rewardedSets}
            burhanCompleted={devotionData.burhanCompleted}
            currentStation={maq.currentStation}
            incrementTask={devotionData.incrementTask}
            markAdhkarSetRewarded={devotionData.markAdhkarSetRewarded}
            activeDays={devotionData.activeDays}
            onOpenBurhan={() => setShowBurhanModal(true)}
            onOpenMisbaha={(launch) => setMisbahaLaunch(launch)}
            sunnahContext={sunnahContext}
            qadaRemainingCount={qadaTotals.totalRemaining}
            onOpenDuas={() => setShowDuas(true)}
            onOpenQada={() => setShowQada(true)}
          />

          {/* === VIEW 3: PROFILE (THE SOUL MIRROR) === */}
          <div
            data-testid="journey-scroller"
            className="absolute inset-x-0 bottom-0 flex flex-col items-center transition-[opacity,transform,visibility] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] w-full overflow-y-auto hide-scrollbar pt-2"
            style={{
              top: 'calc(72px + var(--sat))',
              paddingBottom: 'calc(24px + var(--sab))',
              touchAction: 'pan-y',
              opacity: currentView === 'profile' ? 1 : 0,
              visibility: currentView === 'profile' ? 'visible' : 'hidden',
              transform: currentView === 'profile' ? 'scale(1)' : 'scale(1.015)',
              pointerEvents: currentView === 'profile' ? 'auto' : 'none',
              maskImage: currentView === 'profile'
                ? 'linear-gradient(to bottom, transparent 0px, black 12px, black calc(100% - 14px), transparent 100%)'
                : 'none',
              WebkitMaskImage: currentView === 'profile'
                ? 'linear-gradient(to bottom, transparent 0px, black 12px, black calc(100% - 14px), transparent 100%)'
                : 'none',
            }}
          >
            <div className="w-full max-w-[360px] sm:max-w-[420px] md:max-w-[460px] px-3 sm:px-4 mx-auto flex flex-col items-center gap-3 pb-4">
              {/* Quiet Editorial Identity Crest */}
              <div className="w-full flex flex-col items-center text-center pt-1">
                <span
                  className={`font-calligraphy text-[18px] leading-none ${tTextMain} opacity-75 mb-2 transition-colors duration-300`}
                  dir="rtl"
                >
                  الرحلة
                </span>

                <div className="relative w-14 h-14 flex items-center justify-center mb-2">
                  <svg
                    className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
                    viewBox="0 0 100 100"
                    aria-hidden="true"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="47"
                      fill="none"
                      stroke={isLightMode ? 'rgba(26,24,20,0.1)' : 'rgba(255,255,255,0.1)'}
                      strokeWidth="1.25"
                      strokeDasharray="2 4"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="47"
                      fill="none"
                      stroke={isLightMode ? '#9c7533' : '#d2a24b'}
                      strokeWidth="2"
                      strokeDasharray={circumference}
                      strokeDashoffset={dynamicDashOffset}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>

                  <div
                    className={`flex items-center justify-center w-[42px] h-[42px] rounded-full border transition-colors duration-300 ${
                      isLightMode
                        ? 'bg-white/75 border-black/[0.08]'
                        : 'bg-[#0b0e16]/75 border-white/[0.12]'
                    }`}
                  >
                    <span
                      className={`font-serif-eng text-[15px] font-light ${tTextMain}`}
                      style={{ letterSpacing: '0.08em', marginRight: '-0.08em' }}
                    >
                      {userProfile.initials || 'SK'}
                    </span>
                  </div>
                </div>

                <h2
                  className={`font-serif-eng text-[20px] font-medium ${tTextMain} leading-tight tracking-[0.04em]`}
                  style={{ textShadow: glowSub }}
                >
                  {userProfile.name}
                </h2>
                <p
                  className={`font-serif-eng italic text-[11.5px] leading-snug mt-0.5 ${tTextGold}`}
                >
                  {currentStationData?.subtitle || 'Station of Patience'} · {maq.yaqeenProgress}% Yaqeen
                  {totalHabitsCount > 0 ? ` · ${completedHabitsCount}/${totalHabitsCount} Habits` : ''}
                </p>
              </div>

              {/* Unboxed Open Hairline Summary Ledger */}
              <div
                className={`w-full grid grid-cols-3 divide-x border-y py-2.5 ${
                  isLightMode
                    ? 'border-black/[0.08] divide-black/[0.07]'
                    : 'border-white/[0.08] divide-white/[0.07]'
                }`}
              >
                <div className="flex flex-col items-center justify-center px-2">
                  <span className={`font-serif-eng text-[19px] leading-none font-light tabular-nums ${tTextMain}`}>
                    {devotionData.totalPrayers}
                  </span>
                  <span className={`font-serif-eng text-[8.5px] uppercase tracking-[0.16em] ${tTextSub} mt-1 opacity-75`}>
                    Prayers
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center px-2">
                  <span className={`font-serif-eng text-[19px] leading-none font-light tabular-nums ${tTextMain}`}>
                    {devotionData.totalVerses}
                  </span>
                  <span className={`font-serif-eng text-[8.5px] uppercase tracking-[0.16em] ${tTextSub} mt-1 opacity-75`}>
                    Verses
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center px-2">
                  <span className={`font-serif-eng text-[19px] leading-none font-light tabular-nums ${tTextMain}`}>
                    {devotionData.activeDays}
                  </span>
                  <span className={`font-serif-eng text-[8.5px] uppercase tracking-[0.16em] ${tTextSub} mt-1 opacity-75 whitespace-nowrap`}>
                    Active Days
                  </span>
                </div>
              </div>

              {/* Sleek Architectural Underline Tab Bar */}
              <div
                role="tablist"
                aria-label="Journey Sections"
                className={`w-full grid grid-cols-3 border-b ${
                  isLightMode ? 'border-black/[0.08]' : 'border-white/[0.08]'
                }`}
              >
                {[
                  { id: 'streak', label: `Streak · ${devotionData.currentStreak}d` },
                  { id: 'badges', label: `Badges · ${devotionData.unlockedBadgeCount}/${devotionData.totalBadgeCount}` },
                  { id: 'path', label: 'Path' },
                ].map((tab) => {
                  const active = journeyTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => {
                        if (journeyTab !== tab.id) {
                          hapticDetent();
                          setJourneyTab(tab.id);
                        }
                      }}
                      className="relative min-h-[40px] font-serif-eng text-[10px] uppercase tracking-[0.14em] cursor-pointer flex items-center justify-center whitespace-nowrap px-1.5 transition-colors"
                      style={{
                        color: active
                          ? isLightMode
                            ? '#8a6423'
                            : '#e5c17b'
                          : isLightMode
                            ? 'rgba(44,39,32,0.62)'
                            : 'rgba(228,218,200,0.58)',
                        fontWeight: active ? 600 : 400,
                      }}
                    >
                      <span>{tab.label}</span>
                      {active && (
                        <span
                          aria-hidden="true"
                          className="absolute bottom-[-1px] left-3 right-3 h-[1.5px] rounded-full"
                          style={{ backgroundColor: isLightMode ? '#9c7533' : '#d2a24b' }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Active Journey Panel */}
              <div className="w-full">
                {journeyTab === 'streak' && (
                  <DailyStreakTracker
                    historyMap={devotionData.history}
                    pausedDates={devotionData.streakPausedDates}
                    onTogglePauseToday={devotionData.toggleStreakPauseToday}
                    isLightMode={isLightMode}
                    isVisible={currentView === 'profile' && journeyTab === 'streak'}
                  />
                )}

                {journeyTab === 'badges' && (
                  <BadgesShowcase
                    badgeStatuses={devotionData.badgeStatuses}
                    unlockedCount={devotionData.unlockedBadgeCount}
                    totalCount={devotionData.totalBadgeCount}
                    isLightMode={isLightMode}
                    onInspectBadge={(badge) => setInspectedBadge(badge)}
                  />
                )}

                {journeyTab === 'path' && (
                  <div className="w-full flex flex-col gap-2">
                    {stations.length > 0 && (
                      <StationIndicator
                        stations={stations}
                        currentStation={maq.currentStation}
                        unlockedStations={maq.unlockedStations || [0]}
                        yaqeenProgress={maq.yaqeenProgress}
                        accentHex={accentHex}
                        isLightMode={isLightMode}
                        onSelectStation={(idx) => {
                          if (idx !== maq.currentStation) hapticNavigate();
                          setVerseIndex(0);
                          devotionData.goToStation(idx);
                        }}
                      />
                    )}
                    <DevotionHeatmap isLightMode={isLightMode} historyMap={devotionData.history} />
                  </div>
                )}
              </div>

              {/* Unified Sanctuary Ledger Menu */}
              <div
                className={`w-full rounded-2xl border overflow-hidden divide-y transition-colors ${
                  isLightMode
                    ? 'bg-white/62 border-white/80 divide-black/[0.06] island-light'
                    : 'bg-[#0b0e16]/68 border-white/[0.09] divide-white/[0.07] island-dark'
                }`}
              >
                <div className={`grid grid-cols-2 divide-x ${isLightMode ? 'divide-black/[0.06]' : 'divide-white/[0.07]'}`}>
                  <button
                    type="button"
                    onClick={() => {
                      hapticNavigate();
                      setShowDuas(true);
                    }}
                    className={`min-h-[46px] px-3.5 py-2.5 flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                      isLightMode ? 'hover:bg-black/[0.025]' : 'hover:bg-white/[0.035]'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <BookIcon size={14} className={`shrink-0 ${isLightMode ? 'text-[#9c7533]' : 'text-[#d2a24b]'}`} />
                      <span className={`font-serif-eng text-[10.5px] uppercase tracking-[0.12em] truncate ${tTextMain}`}>
                        Duas
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className={`font-serif-eng text-[11px] tabular-nums ${tTextSub} opacity-70`}>
                        {devotionData.favoriteDuaIds?.length || 0}
                      </span>
                      <ChevronRightIcon size={12} className={`${tTextSub} opacity-40`} />
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      hapticNavigate();
                      setShowQada(true);
                    }}
                    className={`min-h-[46px] px-3.5 py-2.5 flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                      isLightMode ? 'hover:bg-black/[0.025]' : 'hover:bg-white/[0.035]'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <RotateCcwIcon size={14} className={`shrink-0 ${isLightMode ? 'text-[#9c7533]' : 'text-[#d2a24b]'}`} />
                      <span className={`font-serif-eng text-[10.5px] uppercase tracking-[0.12em] truncate ${tTextMain}`}>
                        Qada
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className={`font-serif-eng text-[11px] tabular-nums ${tTextSub} opacity-70`}>
                        {qadaTotals.totalRemaining}
                      </span>
                      <ChevronRightIcon size={12} className={`${tTextSub} opacity-40`} />
                    </div>
                  </button>
                </div>

                <div className={`grid grid-cols-2 divide-x ${isLightMode ? 'divide-black/[0.06]' : 'divide-white/[0.07]'}`}>
                  <button
                    type="button"
                    onClick={() => {
                      hapticNavigate();
                      setShowArchive(true);
                    }}
                    className={`min-h-[46px] px-3.5 py-2.5 flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                      isLightMode ? 'hover:bg-black/[0.025]' : 'hover:bg-white/[0.035]'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <BookmarkIcon size={14} className={`shrink-0 ${isLightMode ? 'text-[#9c7533]' : 'text-[#d2a24b]'}`} />
                      <span className={`font-serif-eng text-[10.5px] uppercase tracking-[0.12em] truncate ${tTextMain}`}>
                        Saved
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className={`font-serif-eng text-[11px] tabular-nums ${tTextSub} opacity-70`}>
                        {devotionData.savedVerses.length}
                      </span>
                      <ChevronRightIcon size={12} className={`${tTextSub} opacity-40`} />
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      hapticNavigate();
                      setShowReminders(true);
                    }}
                    className={`min-h-[46px] px-3.5 py-2.5 flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                      isLightMode ? 'hover:bg-black/[0.025]' : 'hover:bg-white/[0.035]'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <BellIcon size={14} className={`shrink-0 ${isLightMode ? 'text-[#9c7533]' : 'text-[#d2a24b]'}`} />
                      <span className={`font-serif-eng text-[10.5px] uppercase tracking-[0.12em] truncate ${tTextMain}`}>
                        Alerts
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className={`font-serif-eng text-[11px] tabular-nums ${tTextSub} opacity-70`}>
                        {enabledAlertsCount}
                      </span>
                      <ChevronRightIcon size={12} className={`${tTextSub} opacity-40`} />
                    </div>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    hapticNavigate();
                    setShowSettings(true);
                  }}
                  className={`w-full min-h-[46px] px-3.5 py-2.5 flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                    isLightMode ? 'hover:bg-black/[0.025]' : 'hover:bg-white/[0.035]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <SettingsIcon size={14} className={`shrink-0 ${isLightMode ? 'text-[#9c7533]' : 'text-[#d2a24b]'}`} />
                    <span className={`font-serif-eng text-[10.5px] uppercase tracking-[0.13em] truncate ${tTextMain}`}>
                      Preferences &amp; Backup
                    </span>
                  </div>
                  <ChevronRightIcon size={13} className={`${tTextSub} opacity-40 shrink-0`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col - The Sleek, Thin Vertical Nav Island */}
        <div className="w-[44px] md:w-[140px] flex-shrink-0 h-full relative pointer-events-none pr-1 md:pr-10">
          <nav
            aria-label="Sanctuary Navigation"
            className={`absolute right-2 md:right-8 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 py-2 px-1 w-[38px] rounded-full border pointer-events-auto transition-all duration-300 ${
              isLightMode
                ? 'bg-white/30 border-white/40 engraved-light island-light'
                : 'bg-[#12100d]/35 border-white/[0.06] engraved-dark island-dark'
            }`}
          >
            {/* Main Sanctuary Button */}
            <button
              type="button"
              aria-label="Sanctuary"
              aria-current={currentView === 'main' ? 'page' : undefined}
              onClick={() => {
                if (currentView === 'main') hapticDetent();
                else hapticNavigate();
                setCurrentView('main');
              }}
              className={`relative w-7 h-7 rounded-full transition-all duration-500 hover:scale-105 flex items-center justify-center cursor-pointer ${
                currentView === 'main'
                  ? isLightMode
                    ? 'text-[#9c7533] shadow-[0_2px_10px_rgba(156,117,51,0.2)] bg-white/65 ring-1 ring-[#9c7533]/30'
                    : 'text-[#d2a24b] shadow-[0_2px_10px_rgba(210,162,75,0.22)] bg-white/10 ring-1 ring-[#d2a24b]/35'
                  : isLightMode
                    ? 'text-[#4a453d] opacity-55 hover:opacity-100'
                    : 'text-[#e4dac8] opacity-40 hover:opacity-100'
              }`}
            >
              <MainNavIcon size={15} />
            </button>

            {/* Daily Devotion / Practices Button */}
            <button
              type="button"
              aria-label="Practices"
              aria-current={currentView === 'tasks' ? 'page' : undefined}
              onClick={() => {
                if (currentView === 'tasks') hapticDetent();
                else hapticNavigate();
                setCurrentView('tasks');
              }}
              className={`relative w-7 h-7 rounded-full transition-all duration-500 hover:scale-105 flex items-center justify-center cursor-pointer ${
                currentView === 'tasks'
                  ? isLightMode
                    ? 'text-[#9c7533] shadow-[0_2px_10px_rgba(156,117,51,0.2)] bg-white/65 ring-1 ring-[#9c7533]/30'
                    : 'text-[#d2a24b] shadow-[0_2px_10px_rgba(210,162,75,0.22)] bg-white/10 ring-1 ring-[#d2a24b]/35'
                  : isLightMode
                    ? 'text-[#4a453d] opacity-55 hover:opacity-100'
                    : 'text-[#e4dac8] opacity-40 hover:opacity-100'
              }`}
            >
              <TasksNavIcon size={15} />
            </button>

            {/* Soul Mirror / Profile Button */}
            <button
              type="button"
              aria-label="Journey"
              aria-current={currentView === 'profile' ? 'page' : undefined}
              onClick={() => {
                if (currentView === 'profile') hapticDetent();
                else hapticNavigate();
                setCurrentView('profile');
              }}
              className={`relative w-7 h-7 rounded-full transition-all duration-500 hover:scale-105 flex items-center justify-center cursor-pointer ${
                currentView === 'profile'
                  ? isLightMode
                    ? 'text-[#9c7533] shadow-[0_2px_10px_rgba(156,117,51,0.2)] bg-white/65 ring-1 ring-[#9c7533]/30'
                    : 'text-[#d2a24b] shadow-[0_2px_10px_rgba(210,162,75,0.22)] bg-white/10 ring-1 ring-[#d2a24b]/35'
                  : isLightMode
                    ? 'text-[#4a453d] opacity-55 hover:opacity-100'
                    : 'text-[#e4dac8] opacity-40 hover:opacity-100'
              }`}
            >
              <ProfileNavIcon size={15} />
            </button>
          </nav>
        </div>
      </div>

      {/* --- 5. 3D PRAYER SCROLL WHEEL + ALIGNED QIBLA DOCK (MAIN VIEW ONLY) --- */}
      <div
        className="absolute inset-x-0 bottom-0 z-30 pointer-events-none transition-[opacity,visibility,transform] duration-500"
        style={{
          height: 'calc(216px + var(--sab))',
          opacity: currentView === 'main' ? 1 : 0,
          visibility: currentView === 'main' ? 'visible' : 'hidden',
          transform: currentView === 'main' ? 'translateY(0)' : 'translateY(10px)',
        }}
      >
        {/* Done Reviewing toggle floating just above the scroll wheel when adjusting completed prayers */}
        {currentView === 'main' && allCompleted && reviewPrayers && (
          <div
            className="absolute left-1/2 -translate-x-1/2 z-40 flex justify-center"
            style={{ bottom: 'calc(176px + var(--sab))' }}
          >
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
                const steps = Math.round(-deltaY / 32);
                const nextIdx = Math.max(0, Math.min(PRAYERS.length - 1, drag.startIndex + steps));
                if (nextIdx !== drag.lastStepIndex) {
                  drag.lastStepIndex = nextIdx;
                  hapticDetent();
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
                setTimeout(() => {
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
              const isNextPrayer =
                prayerTimes.prayerData?.nextPrayer === item.id && !isCompletedItem;

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
                  ? 1
                  : isAdjacent
                    ? isLightMode
                      ? 0.68
                      : 0.6
                    : isLightMode
                      ? 0.25
                      : 0.22;

              return (
                <button
                  key={item.id}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  aria-hidden={!isVisible}
                  tabIndex={isActive ? 0 : -1}
                  aria-label={`${item.label} Prayer${
                    isCompletedItem
                      ? itemStatus === 'qada'
                        ? ' (Qada, tap to undo)'
                        : ' (Completed, tap to undo)'
                      : ''
                  }`}
                  onPointerDown={() => {
                    if (!isActive) return;
                    prayerLongPressTriggered.current = false;
                    if (!isCompletedItem && !checkingId) {
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
                      hapticDetent();
                      setFocusedIndex(i);
                      return;
                    }
                    if (prayerLongPressTriggered.current) {
                      prayerLongPressTriggered.current = false;
                      return;
                    }
                    if (checkingId) return;
                    handleTogglePrayer(item.id, 'ontime');
                  }}
                  className={`group absolute left-0 right-0 top-1/2 flex items-center justify-between px-3 sm:px-4 rounded-2xl transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] overflow-hidden border cursor-pointer ${
                    isActive ? 'h-[56px]' : 'h-[48px]'
                  } ${
                    isLightMode
                      ? isActive
                        ? isChecking || isCompletedItem
                          ? 'bg-white/88 border-[#9c7533]/48 island-light'
                          : 'bg-white/84 hover:bg-white/94 border-[#9c7533]/24 island-light'
                        : 'bg-white/66 border-[#9c7533]/16'
                      : isActive
                        ? isChecking || isCompletedItem
                          ? 'bg-[#d2a24b]/16 border-[#d2a24b]/42 island-dark'
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
                              : isNextPrayer
                                ? isLightMode
                                  ? 'text-[#9c7533]/92'
                                  : 'text-[#d2a24b]/92'
                                : `${tTextSub} opacity-75`
                          }`}
                        >
                          {isCompletedItem
                            ? itemStatus === 'qada'
                              ? 'Qada · Tap to undo'
                              : 'Prayed · Tap to undo'
                            : isNextPrayer && prayerTimes.prayerData?.formattedCountdown
                              ? `In ${prayerTimes.prayerData.formattedCountdown} · Hold Qada`
                              : 'Tap to log · Hold Qada'}
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
                          : `${tTextSub} opacity-75`
                      }`}
                      style={{ letterSpacing: '0.04em' }}
                    >
                      {prayerTimes.prayerData?.formatted[item.id] ||
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

      {/* --- OVERLAYS & MODALS --- */}
      <TafakkurOverlay
        isOpen={!!tafakkurPromptId}
        verse={tafakkurVerse}
        initialNote={tafakkurExistingNote}
        isLightMode={isLightMode}
        localAI={localAI}
        allVerses={allVersesFlat}
        onSave={(id, note) => {
          if (note.trim()) devotionData.updateVerseNote(id, note.trim());
          setTafakkurPromptId(null);
        }}
        onClose={() => setTafakkurPromptId(null)}
      />

      <SavedVersesModal
        isOpen={showArchive}
        onClose={() => setShowArchive(false)}
        isLightMode={isLightMode}
        savedVerses={devotionData.savedVerses}
        allVerses={allVersesFlat}
        isSimpleMode={devotionData.isSimpleMode}
        onEditNote={(id) => {
          setShowArchive(false);
          setTafakkurPromptId(id);
        }}
        onRemoveSaved={(id) => devotionData.toggleSaveVerse(id)}
      />

      <BurhanOverlay
        isOpen={showBurhanModal}
        burhan={selectActiveBurhan(burhanData, maq.currentStation, devotionData.activeDays)}
        allBurhans={burhanData}
        burhanNotes={devotionData.burhanNotes}
        isLightMode={isLightMode}
        isCompleted={devotionData.burhanCompleted}
        isSimpleMode={devotionData.isSimpleMode}
        onSaveNote={devotionData.saveBurhanNote}
        onComplete={devotionData.completeBurhan}
        onClose={() => setShowBurhanModal(false)}
      />

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onOpenCityPicker={() => setShowCityPicker(true)}
      />

      <RemindersModal
        isOpen={showReminders}
        onClose={() => setShowReminders(false)}
        onOpenCityPicker={() => setShowCityPicker(true)}
      />

      <QiblaModal
        isOpen={showQibla}
        onClose={() => setShowQibla(false)}
        isLightMode={isLightMode}
        prayerTimes={prayerTimes}
        onOpenCityPicker={() => setShowCityPicker(true)}
      />

      <CityPickerModal
        isOpen={showCityPicker}
        onClose={() => setShowCityPicker(false)}
        isLightMode={isLightMode}
        prayerTimes={prayerTimes}
      />

      <DuasModal
        isOpen={showDuas}
        onClose={() => setShowDuas(false)}
        isLightMode={isLightMode}
        favoriteDuaIds={devotionData.favoriteDuaIds}
        onToggleFavorite={devotionData.toggleFavoriteDua}
      />

      <QadaModal
        isOpen={showQada}
        onClose={() => setShowQada(false)}
        isLightMode={isLightMode}
        qada={devotionData.qada}
        onSetCount={devotionData.setQadaCount}
        onBulkAddYears={devotionData.bulkAddQadaYears}
        onCompleteOne={devotionData.completeOneQada}
      />

      {misbahaLaunch && (
        <MisbahaMode
          isOpen={!!misbahaLaunch}
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
      <SacredNotificationToast
        toast={notifications.activeToast}
        isLightMode={isLightMode}
        isAlreadyCompleted={Boolean(
          notifications.activeToast?.prayerId &&
            devotionData.dailyCompletedPrayers?.includes(notifications.activeToast.prayerId)
        )}
        onMarkPrayed={(prayerId) => {
          devotionData.logPrayer(prayerId, 'ontime');
          notifications.dismissToast();
        }}
        onDismiss={notifications.dismissToast}
      />
    </div>
  );
}
