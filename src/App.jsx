import { useState, useEffect, useRef, useCallback } from 'react';
import { useDevotionData } from './hooks/useDevotionData';
import { useTemporalPhase, rgbToHex } from './hooks/useTemporalPhase';
import { SavedVersesModal } from './components/layout/SavedVersesModal';
import { useLocalAI } from './hooks/useLocalAI';
import { useHijriDate } from './hooks/useHijriDate';
import { useCanvasEngine } from './hooks/useCanvasEngine';
import { usePrayerTimes } from './hooks/usePrayerTimes';
import { PRAYERS, DARK_HIGH, DARK_LOW, LIGHT_HIGH, LIGHT_LOW, AMBIENT_DHIKR } from './data/constants';
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
import { useLocalNotifications } from './hooks/useLocalNotifications';
import { registerNativeLifecycle, syncStatusBarTheme } from './native';
import { hapticSuccess, hapticTapLight, hapticTapMedium } from './utils/haptics';
import { hydrateMissingFromPreferences, mirroredSet } from './utils/nativeStorage';

export default function App() {
  const devotionData = useDevotionData();
  const localAI = useLocalAI();
  const hijri = useHijriDate();
  const prayerTimes = usePrayerTimes();
  const notifications = useLocalNotifications({ devotionData, prayerTimes });
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
  const [devTimePhase, setDevTimePhase] = useState(() => {
    try {
      const saved = localStorage.getItem('ruh_atmosphere_phase_v1');
      if (saved === null || saved === '') return null;
      const n = Number(saved);
      return Number.isInteger(n) && n >= 0 && n <= 4 ? n : null;
    } catch {
      return null;
    }
  });
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

  const [isLightMode, setIsLightMode] = useState(() => {
    try {
      return localStorage.getItem('ruh_theme_mode_v1') === 'light';
    } catch {
      return false;
    }
  });
  const [showContext, setShowContext] = useState(false);
  const [tafakkurPromptId, setTafakkurPromptId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    hydrateMissingFromPreferences(['ruh_theme_mode_v1']).then((recovered) => {
      if (!cancelled && recovered.ruh_theme_mode_v1) {
        setIsLightMode(recovered.ruh_theme_mode_v1 === 'light');
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    mirroredSet('ruh_theme_mode_v1', isLightMode ? 'light' : 'dark');
    syncStatusBarTheme(isLightMode);
  }, [isLightMode]);

  useEffect(() => {
    try {
      if (devTimePhase === null || devTimePhase === undefined) {
        localStorage.removeItem('ruh_atmosphere_phase_v1');
      } else {
        localStorage.setItem('ruh_atmosphere_phase_v1', String(devTimePhase));
      }
    } catch {}
  }, [devTimePhase]);

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
  const avatarRef = useRef(null);
  const engineRef = useRef({});
  const hikmahRef = useRef(false);

  const completedPrayers = devotionData.dailyCompletedPrayers || [];
  const prayerStatuses = devotionData.dailyPrayerStatuses || {};
  const targetHealth = completedPrayers.length / PRAYERS.length;
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
    health: 0,
    theme: 0,
    hikmahBlend: 0,
    pointerX: typeof window !== 'undefined' ? window.innerWidth / 2 : 0,
    pointerY: typeof window !== 'undefined' ? window.innerHeight / 2 : 0,
    currentPointerX: typeof window !== 'undefined' ? window.innerWidth / 2 : 0,
    currentPointerY: typeof window !== 'undefined' ? window.innerHeight / 2 : 0,
    isPressing: false,
    pressProgress: 0,
    lastPressP: -1,
    orbX: typeof window !== 'undefined' ? window.innerWidth / 2 : 0,
    orbY: typeof window !== 'undefined' ? window.innerHeight / 2 : 0,
    orbVx: 0,
    orbVy: 0,
    lastInteractionTime: 0,
  });

  useEffect(() => {
    stateRef.current.lastInteractionTime = Date.now();
  }, []);

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
    avatarRef,
    engineRef,
    stateRef,
    temporalRef,
    isLightModeRef,
    inTransitRef,
    hikmahRef,
    viewRef,
    targetHealth,
    DARK_HIGH,
    DARK_LOW,
    LIGHT_HIGH,
    LIGHT_LOW,
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
      hapticTapLight();
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
    stateRef.current.lastInteractionTime = Date.now();
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
    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
    const clientY = e.clientY || (e.touches && e.touches[0]?.clientY);
    if (!clientX || !clientY) return;

    stateRef.current.pointerX = clientX;
    stateRef.current.pointerY = clientY;
    stateRef.current.lastInteractionTime = Date.now();

    if (stateRef.current.isPressing) {
      const dist = Math.hypot(
        clientX - stateRef.current.pointerStartX,
        clientY - stateRef.current.pointerStartY
      );
      if (dist > 20) stateRef.current.isPressing = false;
    }
  };

  const handleTouchStart = (e) => {
    if (isAnyModalOpen || e.target.closest?.('[role="dialog"]')) return;
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    stateRef.current.lastInteractionTime = Date.now();
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
    stateRef.current.lastInteractionTime = Date.now();
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
    stateRef.current.lastInteractionTime = Date.now();

    if (completedPrayers.includes(prayerId)) {
      devotionData.togglePrayer(prayerId);
      return;
    }

    setCheckingId(prayerId);
    if (engineRef.current.triggerButtonBurst) engineRef.current.triggerButtonBurst();
    const nextCount = completedPrayers.length + 1;
    if (nextCount === PRAYERS.length) hapticSuccess();
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
    const { translation } = resolveVerseCopy(verse, devotionData.isSimpleMode);
    const textToShare = `${verse.a}\n\n${translation}\n\n— ${verse.s}`;
    if (navigator.share) {
      navigator.share({ title: 'Ruh — رُوح', text: textToShare }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard
        .writeText(textToShare)
        .then(() => {
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
      className={`w-full h-full min-h-screen ${tBg} overflow-clip font-sans relative select-none transition-colors duration-300`}
      onPointerMove={handlePointerMove}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
    >
      {/* Painterly Studio Ghibli-Style Gouache Cloud Backdrops (Animated + Mouse Parallax Depth Planes) */}
      <PaintedClouds isLightMode={isLightMode} />

      {/* Atmospheric Canvas (Optical Nur, Subtle Temporal Clouds & Embers) */}
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
      <header className="absolute top-[18px] md:top-[24px] left-0 right-0 z-30 grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-5 md:px-10 pointer-events-none">
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
            onClick={() => setShowCityPicker(true)}
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
          onClick={() => setIsLightMode(!isLightMode)}
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
            className="absolute inset-0 flex items-center justify-center transition-[opacity,transform,visibility] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] w-full"
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
                            onClick={() => setShowContext(!showContext)}
                            className={`min-h-[40px] px-2.5 flex items-center justify-center gap-1 transition-all duration-300 hover:scale-105 cursor-pointer ${
                              showContext
                                ? isLightMode
                                  ? 'text-[#7c5a1e] opacity-100'
                                  : 'text-[#d2a24b] opacity-100'
                                : isLightMode
                                  ? 'text-[#2c2720] opacity-72 hover:opacity-100'
                                  : 'text-[#e4dac8] opacity-60 hover:opacity-100'
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
                                  ? 'text-[#2c2720] opacity-65 hover:opacity-100'
                                  : 'text-[#e4dac8] opacity-55 hover:opacity-100'
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
                                  ? 'text-[#2c2720] opacity-65 hover:opacity-100'
                                  : 'text-[#e4dac8] opacity-55 hover:opacity-100'
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
            isLightMode={isLightMode}
            dailyTasks={devotionData.dailyTasks}
            rewardedSets={devotionData.rewardedSets}
            burhanCompleted={devotionData.burhanCompleted}
            currentStation={maq.currentStation}
            incrementTask={devotionData.incrementTask}
            markAdhkarSetRewarded={devotionData.markAdhkarSetRewarded}
            activeDays={devotionData.activeDays}
            onOpenBurhan={() => setShowBurhanModal(true)}
            onOpenMisbaha={(launch) => setMisbahaLaunch(launch)}
            habits={devotionData.habits}
            dailyHabitLogs={devotionData.dailyHabitLogs}
            onLogHabitStep={devotionData.logHabitStep}
            onAddCustomHabit={devotionData.addCustomHabit}
            onUpdateHabit={devotionData.updateHabit}
            onReorderHabit={devotionData.reorderHabit}
            onResetDefaultHabits={devotionData.resetDefaultHabits}
            onRemoveHabit={devotionData.removeHabit}
            dailyIntention={devotionData.dailyIntention}
            onSetDailyIntention={devotionData.setDailyIntention}
            sunnahContext={sunnahContext}
            qadaRemainingCount={qadaTotals.totalRemaining}
            onOpenDuas={() => setShowDuas(true)}
            onOpenQada={() => setShowQada(true)}
          />

          {/* === VIEW 3: PROFILE (THE SOUL MIRROR) === */}
          <div
            data-testid="journey-scroller"
            className="absolute inset-x-0 top-[70px] md:top-[80px] bottom-0 flex flex-col items-center transition-[opacity,transform,visibility] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] w-full overflow-y-auto hide-scrollbar pt-1 pb-4"
            style={{
              touchAction: 'pan-y',
              opacity: currentView === 'profile' ? 1 : 0,
              visibility: currentView === 'profile' ? 'visible' : 'hidden',
              transform: currentView === 'profile' ? 'scale(1)' : 'scale(1.02)',
              pointerEvents: currentView === 'profile' ? 'auto' : 'none',
              maskImage: currentView === 'profile'
                ? 'linear-gradient(to bottom, transparent 0px, black 12px, black calc(100% - 12px), transparent 100%)'
                : 'none',
              WebkitMaskImage: currentView === 'profile'
                ? 'linear-gradient(to bottom, transparent 0px, black 12px, black calc(100% - 12px), transparent 100%)'
                : 'none',
            }}
          >
            <div className="flex flex-col items-center justify-start w-full max-w-[300px] sm:max-w-[360px] md:max-w-[460px] px-1.5 sm:px-3 mx-auto">
              {/* Top Anchor */}
              <span
                className={`font-calligraphy text-[19px] leading-none ${tTextMain} opacity-75 mb-0.5 transition-colors duration-300`}
                dir="rtl"
              >
                الرحلة
              </span>

              {/* Avatar + Streak Integration (Optical Nur Orb centers behind this ring) */}
              <div
                ref={avatarRef}
                className="relative w-16 h-16 flex items-center justify-center mb-1.5 mx-auto shrink-0"
              >
                <svg
                  className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
                  viewBox="0 0 100 100"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="48"
                    fill="none"
                    stroke={isLightMode ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'}
                    strokeWidth="1"
                    strokeDasharray="2 4"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="48"
                    fill="none"
                    stroke={isLightMode ? '#9c7533' : '#d2a24b'}
                    strokeWidth="1.5"
                    strokeDasharray={circumference}
                    strokeDashoffset={dynamicDashOffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>

                <div
                  className={`flex flex-col items-center justify-center w-[48px] h-[48px] rounded-full border transition-all duration-300 z-10 ${
                    isLightMode
                      ? 'bg-white/65 border-white/85 island-light'
                      : 'bg-[#0b0e16]/65 border-white/[0.14] island-dark'
                  }`}
                >
                  <span
                    className={`font-serif-eng text-base font-light ${tTextMain} transition-colors duration-300`}
                    style={{
                      letterSpacing: '0.1em',
                      marginRight: '-0.1em',
                      textShadow: glowSub,
                    }}
                  >
                    {userProfile.initials || 'SK'}
                  </span>
                </div>
              </div>

              {/* User Identity */}
              <h2
                className={`font-serif-eng text-[18px] font-medium ${tTextMain} leading-tight transition-colors duration-300 flex items-center justify-center`}
                style={{
                  textShadow: glowSub,
                  letterSpacing: '0.05em',
                  marginRight: '-0.05em',
                }}
              >
                {userProfile.name}
              </h2>
              <p
                className={`font-serif-eng text-[8.5px] uppercase ${tTextGold} mb-2 transition-colors duration-300 text-center`}
                style={{ letterSpacing: '0.18em', marginRight: '-0.18em' }}
              >
                {currentStationData?.subtitle || 'Station of Patience'} · {maq.yaqeenProgress}% Yaqeen
              </p>

              {/* Compact 3-Pillar Lifetime Summary Strip */}
              <div
                className={`w-full grid grid-cols-3 divide-x rounded-[16px] border transition-all duration-300 mb-2 ${
                  isLightMode
                    ? 'bg-white/68 border-white/85 divide-black/[0.06] island-light'
                    : 'bg-[#0b0e16]/68 border-white/[0.09] divide-white/[0.06] island-dark'
                }`}
              >
                <div className="flex flex-col items-center justify-center py-2 px-2">
                  <span className={`font-serif-eng text-[17px] leading-none font-light tabular-nums ${tTextMain}`}>
                    {devotionData.totalPrayers}
                  </span>
                  <span
                    className={`font-serif-eng text-[7px] uppercase ${tTextSub} mt-1 opacity-80`}
                    style={{ letterSpacing: '0.14em' }}
                  >
                    Prayers
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center py-2 px-2">
                  <span className={`font-serif-eng text-[17px] leading-none font-light tabular-nums ${tTextMain}`}>
                    {devotionData.totalVerses}
                  </span>
                  <span
                    className={`font-serif-eng text-[7px] uppercase ${tTextSub} mt-1 opacity-80`}
                    style={{ letterSpacing: '0.14em' }}
                  >
                    Verses
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center py-2 px-2">
                  <span className={`font-serif-eng text-[17px] leading-none font-light tabular-nums ${tTextMain}`}>
                    {devotionData.activeDays}
                  </span>
                  <span
                    className={`font-serif-eng text-[7px] uppercase ${tTextSub} mt-1 opacity-80 whitespace-nowrap`}
                    style={{ letterSpacing: '0.14em' }}
                  >
                    Active Days
                  </span>
                </div>
              </div>

              {/* Clean Segmented Journey Switcher (Streak | Badges | Path) */}
              <div
                role="tablist"
                aria-label="Journey Sections"
                className={`w-full grid grid-cols-3 p-1 rounded-2xl border mb-2 backdrop-blur-md transition-colors ${
                  isLightMode
                    ? 'bg-[#e6dfd1]/75 border-black/[0.08]'
                    : 'bg-[#0b0e16]/75 border-white/[0.09]'
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
                      onClick={() => setJourneyTab(tab.id)}
                      className="min-h-[34px] rounded-xl font-serif-eng text-[9px] uppercase tracking-[0.11em] cursor-pointer flex items-center justify-center whitespace-nowrap px-1 border"
                      style={{
                        backgroundColor: active
                          ? isLightMode
                            ? '#fcfaf5'
                            : 'rgba(255,255,255,0.14)'
                          : 'transparent',
                        borderColor: active
                          ? isLightMode
                            ? 'rgba(156,117,51,0.28)'
                            : 'rgba(210,162,75,0.28)'
                          : 'transparent',
                        boxShadow: active
                          ? isLightMode
                            ? '0 2px 6px rgba(26,24,20,0.09)'
                            : '0 2px 8px rgba(0,0,0,0.35)'
                          : 'none',
                        color: active
                          ? isLightMode
                            ? '#7c5a1e'
                            : '#e5c17b'
                          : isLightMode
                            ? 'rgba(44,39,32,0.72)'
                            : 'rgba(228,218,200,0.68)',
                        fontWeight: active ? 600 : 400,
                      }}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Tab Panel */}
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
                <div className="w-full">
                  {stations.length > 0 && (
                    <StationIndicator
                      stations={stations}
                      currentStation={maq.currentStation}
                      unlockedStations={maq.unlockedStations || [0]}
                      yaqeenProgress={maq.yaqeenProgress}
                      accentHex={accentHex}
                      isLightMode={isLightMode}
                      onSelectStation={(idx) => {
                        setVerseIndex(0);
                        devotionData.goToStation(idx);
                      }}
                    />
                  )}
                  <DevotionHeatmap isLightMode={isLightMode} historyMap={devotionData.history} />
                </div>
              )}

              {/* Compact 2-Column Sanctuary Menu */}
              <div className="w-full grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowDuas(true)}
                  className={`min-h-[44px] px-3 py-2 rounded-[16px] border flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                    isLightMode
                      ? 'bg-white/50 hover:bg-white/75 border-white/65 island-light'
                      : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] island-dark'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <BookIcon size={14} className={`shrink-0 ${isLightMode ? 'text-[#9c7533]' : 'text-[#d2a24b]'}`} />
                    <span className={`font-serif-eng text-[10px] uppercase tracking-[0.12em] truncate ${tTextMain}`}>
                      Duas ({devotionData.favoriteDuaIds?.length || 0})
                    </span>
                  </div>
                  <ChevronRightIcon size={13} className={`${tTextSub} opacity-45 shrink-0`} />
                </button>

                <button
                  type="button"
                  onClick={() => setShowQada(true)}
                  className={`min-h-[44px] px-3 py-2 rounded-[16px] border flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                    isLightMode
                      ? 'bg-white/50 hover:bg-white/75 border-white/65 island-light'
                      : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] island-dark'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <RotateCcwIcon size={14} className={`shrink-0 ${isLightMode ? 'text-[#9c7533]' : 'text-[#d2a24b]'}`} />
                    <span className={`font-serif-eng text-[10px] uppercase tracking-[0.12em] truncate ${tTextMain}`}>
                      Qada ({qadaTotals.totalRemaining})
                    </span>
                  </div>
                  <ChevronRightIcon size={13} className={`${tTextSub} opacity-45 shrink-0`} />
                </button>

                <button
                  type="button"
                  onClick={() => setShowArchive(true)}
                  className={`min-h-[44px] px-3 py-2 rounded-[16px] border flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                    isLightMode
                      ? 'bg-white/50 hover:bg-white/75 border-white/65 island-light'
                      : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] island-dark'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <BookmarkIcon size={14} className={`shrink-0 ${isLightMode ? 'text-[#9c7533]' : 'text-[#d2a24b]'}`} />
                    <span className={`font-serif-eng text-[10px] uppercase tracking-[0.12em] truncate ${tTextMain}`}>
                      Saved ({devotionData.savedVerses.length})
                    </span>
                  </div>
                  <ChevronRightIcon size={13} className={`${tTextSub} opacity-45 shrink-0`} />
                </button>

                <button
                  type="button"
                  onClick={() => setShowReminders(true)}
                  className={`min-h-[44px] px-3 py-2 rounded-[16px] border flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                    isLightMode
                      ? 'bg-white/50 hover:bg-white/75 border-white/65 island-light'
                      : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] island-dark'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <BellIcon size={14} className={`shrink-0 ${isLightMode ? 'text-[#9c7533]' : 'text-[#d2a24b]'}`} />
                    <span className={`font-serif-eng text-[10px] uppercase tracking-[0.12em] truncate ${tTextMain}`}>
                      Alerts{enabledAlertsCount > 0 ? ` (${enabledAlertsCount})` : ''}
                    </span>
                  </div>
                  <ChevronRightIcon size={13} className={`${tTextSub} opacity-45 shrink-0`} />
                </button>

                <button
                  type="button"
                  onClick={() => setShowSettings(true)}
                  className={`col-span-2 min-h-[44px] px-3.5 py-2 rounded-[16px] border flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                    isLightMode
                      ? 'bg-white/50 hover:bg-white/75 border-white/65 island-light'
                      : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] island-dark'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <SettingsIcon size={14} className={`shrink-0 ${isLightMode ? 'text-[#9c7533]' : 'text-[#d2a24b]'}`} />
                    <span className={`font-serif-eng text-[10px] uppercase tracking-[0.14em] truncate ${tTextMain}`}>
                      Preferences &amp; Backup
                    </span>
                  </div>
                  <ChevronRightIcon size={14} className={`${tTextSub} opacity-45 shrink-0`} />
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
              onClick={() => setCurrentView('main')}
              className={`relative w-7 h-7 rounded-full transition-all duration-500 hover:scale-105 flex items-center justify-center cursor-pointer ${
                currentView === 'main'
                  ? isLightMode
                    ? 'text-[#9c7533] shadow-[0_2px_10px_rgba(156,117,51,0.2)] bg-white/50'
                    : 'text-[#d2a24b] shadow-[0_2px_10px_rgba(210,162,75,0.2)] bg-white/5'
                  : isLightMode
                    ? 'text-[#4a453d] opacity-50 hover:opacity-100'
                    : 'text-[#e4dac8] opacity-30 hover:opacity-100'
              }`}
            >
              <MainNavIcon size={15} />
            </button>

            {/* Daily Devotion / Practices Button */}
            <button
              type="button"
              aria-label="Practices"
              aria-current={currentView === 'tasks' ? 'page' : undefined}
              onClick={() => setCurrentView('tasks')}
              className={`relative w-7 h-7 rounded-full transition-all duration-500 hover:scale-105 flex items-center justify-center cursor-pointer ${
                currentView === 'tasks'
                  ? isLightMode
                    ? 'text-[#9c7533] shadow-[0_2px_10px_rgba(156,117,51,0.2)] bg-white/50'
                    : 'text-[#d2a24b] shadow-[0_2px_10px_rgba(210,162,75,0.2)] bg-white/5'
                  : isLightMode
                    ? 'text-[#4a453d] opacity-50 hover:opacity-100'
                    : 'text-[#e4dac8] opacity-30 hover:opacity-100'
              }`}
            >
              <TasksNavIcon size={15} />
            </button>

            {/* Soul Mirror / Profile Button */}
            <button
              type="button"
              aria-label="Journey"
              aria-current={currentView === 'profile' ? 'page' : undefined}
              onClick={() => setCurrentView('profile')}
              className={`relative w-7 h-7 rounded-full transition-all duration-500 hover:scale-105 flex items-center justify-center cursor-pointer ${
                currentView === 'profile'
                  ? isLightMode
                    ? 'text-[#9c7533] shadow-[0_2px_10px_rgba(156,117,51,0.2)] bg-white/50'
                    : 'text-[#d2a24b] shadow-[0_2px_10px_rgba(210,162,75,0.2)] bg-white/5'
                  : isLightMode
                    ? 'text-[#4a453d] opacity-50 hover:opacity-100'
                    : 'text-[#e4dac8] opacity-30 hover:opacity-100'
              }`}
            >
              <ProfileNavIcon size={15} />
            </button>
          </nav>
        </div>
      </div>

      {/* Bottom-Right Qibla Icon Trigger */}
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
        onClick={() => setShowQibla(true)}
        className={`absolute bottom-3.5 right-3.5 md:bottom-7 md:right-8 z-30 w-11 h-11 rounded-full border flex items-center justify-center transition-all duration-500 hover:scale-105 cursor-pointer pointer-events-auto ${
          showQibla
            ? isLightMode
              ? 'bg-white/75 border-[#9c7533]/40 text-[#9c7533] shadow-[0_2px_12px_rgba(156,117,51,0.22)] island-light'
              : 'bg-[#12100d]/70 border-[#d2a24b]/45 text-[#d2a24b] shadow-[0_2px_12px_rgba(210,162,75,0.22)] island-dark'
            : isLightMode
              ? 'bg-white/45 hover:bg-white/65 border-white/60 text-[#4a453d] hover:text-[#9c7533] engraved-light island-light'
              : 'bg-[#12100d]/45 hover:bg-[#12100d]/65 border-white/[0.08] text-[#e4dac8]/70 hover:text-[#d2a24b] engraved-dark island-dark'
        }`}
      >
        <CompassIcon size={17} />
      </button>

      {/* --- 5. FOCAL STACK (3D ROLODEX) - ONLY SHOW ON MAIN VIEW --- */}
      {currentView === 'main' && allCompleted && reviewPrayers && (
        <div className="absolute bottom-[174px] md:bottom-[184px] left-1/2 -translate-x-1/2 z-30 flex items-center justify-center pointer-events-auto">
          <button
            type="button"
            onClick={() => setReviewPrayers(false)}
            className={`px-3 py-1 font-serif-eng text-[8.5px] uppercase tracking-[0.2em] cursor-pointer transition-opacity opacity-75 hover:opacity-100 whitespace-nowrap ${tTextGold}`}
          >
            Done Reviewing
          </button>
        </div>
      )}

      <div
        className="absolute bottom-[56px] md:bottom-[64px] left-1/2 -translate-x-1/2 z-30 w-full max-w-[288px] sm:max-w-[308px] h-[64px] flex justify-center items-center pointer-events-none transition-[opacity,visibility] duration-500"
        style={{
          opacity: currentView === 'main' ? 1 : 0,
          visibility: currentView === 'main' ? 'visible' : 'hidden',
        }}
      >
        {PRAYERS.map((item, i) => {
          const offset = i - focusedIndex;
          const isActive = offset === 0;
          const isCompletedItem = completedPrayers.includes(item.id);
          const itemStatus = prayerStatuses[item.id] || 'ontime';
          const isChecking = checkingId === item.id;

          let yPos = offset * 48;
          const scale = 1 - Math.abs(offset) * 0.12;
          let opacity = isActive ? 1 : Math.max(0, 0.28 - Math.abs(offset) * 0.12);

          if (isLightMode && !isActive && opacity > 0) opacity += 0.24;
          if (Math.abs(offset) >= 3) opacity = 0;
          if (hideStackForSeal) {
            opacity = 0;
            yPos += 20;
          }

          const RenderIcon = getPrayerIcon(item.iconType);
          const isNextPrayer = prayerTimes.prayerData?.nextPrayer === item.id && !isCompletedItem;

          return (
            <div
              key={item.id}
              className="absolute w-full px-4 transition-[transform,opacity,visibility] duration-[700ms] ease-[cubic-bezier(0.25,1,0.3,1)]"
              style={{
                transform: `translateY(${yPos}px) scale(${scale})`,
                opacity,
                visibility: opacity > 0 && currentView === 'main' ? 'visible' : 'hidden',
                zIndex: 10 - Math.abs(offset),
                pointerEvents:
                  opacity > 0 && !hideStackForSeal && currentView === 'main' ? 'auto' : 'none',
              }}
            >
              <button
                type="button"
                aria-label={`${item.label} Prayer${
                  isCompletedItem
                    ? itemStatus === 'qada'
                      ? ' (Qada, tap to undo)'
                      : ' (Completed, tap to undo)'
                    : ''
                }`}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  prayerLongPressTriggered.current = false;
                  if (isActive && !isCompletedItem && !checkingId) {
                    prayerLongPressTimer.current = setTimeout(() => {
                      prayerLongPressTriggered.current = true;
                      prayerLongPressTimer.current = null;
                      hapticTapMedium();
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
                  if (prayerLongPressTriggered.current) {
                    prayerLongPressTriggered.current = false;
                    return;
                  }
                  if (checkingId) return;
                  if (!isActive) setFocusedIndex(i);
                  else handleTogglePrayer(item.id, 'ontime');
                }}
                className={`group relative flex items-center justify-between w-full px-4 py-3.5 rounded-2xl transition-all duration-300 ease-out overflow-hidden border cursor-pointer ${
                  isLightMode
                    ? isChecking || isCompletedItem
                      ? 'bg-white/82 border-[#9c7533]/45 island-light'
                      : 'bg-white/80 hover:bg-white/92 border-[#9c7533]/18 island-light'
                    : isChecking || isCompletedItem
                      ? 'bg-[#d2a24b]/14 border-[#d2a24b]/35 island-dark'
                      : 'bg-[#0b0e16]/76 hover:bg-[#0e1320]/88 border-white/[0.12] island-dark'
                }`}
              >
                <div className="flex items-center space-x-3 z-10 min-w-0">
                  <RenderIcon
                    size={16}
                    className={`shrink-0 transition-all duration-500 ${
                      isChecking || isCompletedItem
                        ? isLightMode
                          ? 'text-[#9c7533]'
                          : 'text-[#d2a24b]'
                        : isLightMode
                          ? 'text-[#4a453d] opacity-75 group-hover:opacity-95 group-hover:text-[#9c7533]'
                          : 'text-[#e4dac8] opacity-72 group-hover:opacity-95 group-hover:text-[#d2a24b]'
                    }`}
                  />
                  <div className="flex flex-col items-start min-w-0">
                    <span
                      className={`font-serif-eng uppercase text-[11px] leading-tight transition-all duration-500 ${
                        isChecking || isCompletedItem
                          ? isLightMode
                            ? 'text-[#9c7533] font-medium'
                            : 'text-[#d2a24b]'
                          : isLightMode
                            ? 'text-[#2c2720] opacity-90 group-hover:opacity-100'
                            : 'text-[#f2ead9] opacity-90 group-hover:opacity-100'
                      }`}
                      style={{ letterSpacing: '0.1em', marginRight: '-0.1em' }}
                    >
                      {item.label}
                    </span>
                    {isActive && (
                      <span
                        className={`font-serif-eng text-[8.5px] uppercase tracking-[0.14em] mt-0.5 leading-none ${
                          isCompletedItem
                            ? isLightMode
                              ? 'text-[#9c7533]/90'
                              : 'text-[#d2a24b]/90'
                            : isNextPrayer
                              ? isLightMode
                                ? 'text-[#9c7533]/92'
                                : 'text-[#d2a24b]/92'
                              : `${tTextSub} opacity-72`
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

                {/* Right Side: Prayer Time + Non-Overlapping Completion Ring */}
                <div className="flex items-center gap-2.5 z-10 shrink-0">
                  <span
                    className={`font-serif-eng text-[9px] tabular-nums transition-opacity duration-500 ${
                      isNextPrayer
                        ? isLightMode
                          ? 'text-[#9c7533] opacity-85'
                          : 'text-[#d2a24b] opacity-85'
                        : `${tTextSub} opacity-60`
                    }`}
                    style={{ letterSpacing: '0.06em' }}
                  >
                    {prayerTimes.prayerData?.formatted[item.id] ||
                      devotionData.prayers[item.id]?.time ||
                      ''}
                  </span>

                  <div className="relative w-5 h-5 flex items-center justify-center shrink-0">
                    {isChecking ? (
                      <CheckCircleIcon
                        size={18}
                        className={`animate-[checkmarkPop_0.4s_cubic-bezier(0.34,1.56,0.64,1)_forwards] ${
                          isLightMode ? 'text-[#9c7533]' : 'text-[#d2a24b]'
                        }`}
                      />
                    ) : isCompletedItem ? (
                      <CheckCircleIcon
                        size={18}
                        className={isLightMode ? 'text-[#9c7533] opacity-80' : 'text-[#d2a24b] opacity-80'}
                      />
                    ) : (
                      <CircleIcon
                        size={18}
                        className={`transition-all duration-300 ${
                          isLightMode
                            ? 'text-[#4a453d] opacity-20 group-hover:opacity-80 group-hover:text-[#9c7533]'
                            : 'text-[#e4dac8] opacity-20 group-hover:opacity-100 group-hover:text-[#d2a24b]'
                        }`}
                      />
                    )}
                  </div>
                </div>
              </button>
            </div>
          );
        })}

        {/* COMPLETION NODE — Weightless Interactive Calligraphic Seal */}
        <button
          type="button"
          aria-label="All prayers fulfilled. Tap to review or undo prayers."
          onClick={() => {
            if (hideStackForSeal) setReviewPrayers(true);
          }}
          className="absolute inset-x-0 flex flex-col items-center justify-center transition-all duration-[900ms] ease-[cubic-bezier(0.25,1,0.3,1)] px-4 cursor-pointer"
          style={{
            transform: `translateY(${hideStackForSeal ? 0 : 18}px) scale(${hideStackForSeal ? 1 : 0.94})`,
            opacity: hideStackForSeal ? 1 : 0,
            pointerEvents: hideStackForSeal && currentView === 'main' ? 'auto' : 'none',
            zIndex: 20,
          }}
        >
          <span
            aria-hidden="true"
            className="w-6 h-[1px] mb-2.5 opacity-35"
            style={{ backgroundColor: accentHex }}
          />
          <span
            className={`font-calligraphy text-[20px] leading-none whitespace-nowrap ${
              isLightMode ? 'text-[#9c7533]' : 'text-[#e5c17b]'
            }`}
            style={{
              textShadow: isLightMode ? 'none' : `0 0 24px ${accentRgba},0.28)`,
            }}
            dir="rtl"
          >
            تَمَّتْ الصَّلَوَات
          </span>
          <span
            className={`font-serif-eng italic text-[11px] tracking-wide mt-1 whitespace-nowrap ${
              isLightMode ? 'text-[#4a453d] opacity-65' : 'text-[rgba(228,218,200,0.55)]'
            }`}
          >
            All prayers fulfilled · Tap to adjust
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
        isLightMode={isLightMode}
        devotionData={devotionData}
        prayerTimes={prayerTimes}
        devTimePhase={devTimePhase}
        setDevTimePhase={setDevTimePhase}
        onOpenCityPicker={() => setShowCityPicker(true)}
      />

      <RemindersModal
        isOpen={showReminders}
        onClose={() => setShowReminders(false)}
        isLightMode={isLightMode}
        devotionData={devotionData}
        prayerTimes={prayerTimes}
        notifications={notifications}
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
