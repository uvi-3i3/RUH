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
  MoonIcon, SunIcon, CircleIcon, CheckCircleIcon, SparklesIcon, 
  ChevronDownIcon, ChevronRightIcon, BookmarkIcon, BellIcon, 
  SettingsIcon, MainNavIcon, ProfileNavIcon, TasksNavIcon, ShareIcon
} from './components/icons/Icons';
import { DevotionTimeline } from './components/layout/DevotionTimeline';
import { DevotionHeatmap } from './components/layout/DevotionHeatmap';
import { TasksView } from './components/layout/TasksView';
import { TasksSideColumn } from './components/layout/TasksSideColumn';
import { StationIndicator } from './components/layout/StationIndicator';
import { TafakkurOverlay } from './components/layout/TafakkurOverlay';
import { BurhanOverlay } from './components/layout/BurhanOverlay';
import { SettingsModal } from './components/layout/SettingsModal';
import { RemindersModal } from './components/layout/RemindersModal';
import { burhanData } from './data/burhanData';

export default function App() {
  const devotionData = useDevotionData();
  const localAI = useLocalAI();
  const hijri = useHijriDate();
  const prayerTimes = usePrayerTimes();
  // --- APP STATE ---
  const [currentView, setCurrentView] = useState('main'); // 'main' or 'profile'
  const viewRef = useRef('main'); 
  
  const [verseIndex, setVerseIndex] = useState(0);
  const [contentData, setContentData] = useState(null);
  const [showAmbientTasks, setShowAmbientTasks] = useState(false);
  const [kashfCeremony, setKashfCeremony] = useState(false);
  const [devTimePhase, setDevTimePhase] = useState(null);
  const palette = useTemporalPhase(devTimePhase);
  const temporalRef = useRef(palette);
  temporalRef.current = palette;

  // UX-09: Content load error state
  const [contentError, setContentError] = useState(false);

  useEffect(() => {
    fetch('/data/content.json')
      .then(r => r.json())
      .then(data => { setContentData(data); setContentError(false); })
      .catch(e => { console.error("Error loading content:", e); setContentError(true); });
  }, []);

  // Derive current station's verses
  const maq = devotionData.maqamat || { currentStation: 0, yaqeenProgress: 0, unlockedStations: [0] };
  const stations = contentData?.stations || [];
  const currentStationData = stations[maq.currentStation];
  const verses = currentStationData?.verses || null;
  const fogOpacity = stations.length > maq.currentStation + 1 ? 1 - (maq.yaqeenProgress / 100) : 0;
  const nextStation = stations[maq.currentStation + 1] || null;;

  const [isLightMode, setIsLightMode] = useState(false);
  const [showContext, setShowContext] = useState(false); 
  const [tafakkurPromptId, setTafakkurPromptId] = useState(null);
  
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [checkingId, setCheckingId] = useState(null);
  const prayerFocusedRef = useRef(false); // FEAT-02: Track if we auto-focused
  
  const [inTransit, setInTransit] = useState(false);
  const [verseStyle, setVerseStyle] = useState({ opacity: 0, transform: 'translateY(14px)' });
  const [showSaveGlow, setShowSaveGlow] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [showBurhanModal, setShowBurhanModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showReminders, setShowReminders] = useState(false);
  const lastTapTime = useRef(0);
  const doubleTapCooldown = useRef(false); // BUG-06: Cooldown after double-tap

  // UX-02: Dynamic profile from devotionData (null = needs onboarding)
  const userProfile = devotionData.profile;
  const [showOnboarding, setShowOnboarding] = useState(!userProfile);
  const [onboardingName, setOnboardingName] = useState('');

  // UX-06: Context button discoverability hint
  const contextHintShown = useRef(false);
  const [showContextHint, setShowContextHint] = useState(false);

  // UX-07: Ambient mode dhikr — uses AMBIENT_DHIKR from constants (ARCH-07 + NEW-02)
  const [ambientDhikr, setAmbientDhikr] = useState(null);
  const ambientTimeoutsRef = useRef([]); // BUG-14: Track timeouts for cleanup

  const canvasRef = useRef(null);
  const verseWrapRef = useRef(null);
  const avatarRef = useRef(null);
  const engineRef = useRef({});
  const hikmahRef = useRef(false);
  
  const completedPrayers = devotionData.dailyCompletedPrayers || [];
  const targetHealth = completedPrayers.length / PRAYERS.length;
  const allCompleted = completedPrayers.length === PRAYERS.length;

  useEffect(() => {
    let timer;
    if (allCompleted) {
      timer = setTimeout(() => setShowAmbientTasks(true), 3000);
    } else {
      setShowAmbientTasks(false);
    }
    return () => clearTimeout(timer);
  }, [allCompleted]);

  // FEAT-02: Auto-focus rolodex on next prayer when data loads
  useEffect(() => {
    if (prayerFocusedRef.current || !prayerTimes.prayerData?.nextPrayer) return;
    const nextIdx = PRAYERS.findIndex(p => p.id === prayerTimes.prayerData.nextPrayer);
    if (nextIdx >= 0) {
      setFocusedIndex(nextIdx);
      prayerFocusedRef.current = true;
    }
  }, [prayerTimes.prayerData?.nextPrayer]);

  const stateRef = useRef({ 
    health: 0, theme: 0, hikmahBlend: 0,
    pointerX: typeof window !== 'undefined' ? window.innerWidth / 2 : 0, 
    pointerY: typeof window !== 'undefined' ? window.innerHeight / 2 : 0,
    currentPointerX: typeof window !== 'undefined' ? window.innerWidth / 2 : 0, 
    currentPointerY: typeof window !== 'undefined' ? window.innerHeight / 2 : 0,
    isPressing: false, pressProgress: 0, lastPressP: -1,
    orbX: typeof window !== 'undefined' ? window.innerWidth / 2 : 0, 
    orbY: typeof window !== 'undefined' ? window.innerHeight / 2 : 0,
    orbVx: 0, orbVy: 0, lastInteractionTime: 0  // BUG-01: No Date.now() in render
  });

  // BUG-01: Set the real interaction time in an effect
  useEffect(() => { stateRef.current.lastInteractionTime = Date.now(); }, []);

  // PERF-04: Refs for values read by the canvas loop to avoid re-init
  const isLightModeRef = useRef(isLightMode);
  useEffect(() => { isLightModeRef.current = isLightMode; }, [isLightMode]);
  const inTransitRef = useRef(inTransit);
  useEffect(() => { inTransitRef.current = inTransit; }, [inTransit]);

  const scrollCooldown = useRef(false);
  const touchStart = useRef({ x: 0, y: 0 }); // UX-03: Track x for horizontal swipe

  useEffect(() => {
    setTimeout(() => setVerseStyle({ opacity: 1, transform: 'translateY(0px)' }), 400);
  }, []);

  useEffect(() => { viewRef.current = currentView; }, [currentView]);

  const advanceVerse = useCallback((dir = 1) => {
    if (inTransit || currentView !== 'main' || !verses) return;
    setInTransit(true);
    setShowContext(false);
    
    setVerseStyle({ opacity: 0, transform: 'translateY(-12px)', transition: 'opacity 1.8s ease, transform 2.0s ease' });

    setTimeout(() => {
      setVerseIndex(prev => (prev + dir + verses.length) % verses.length);
      devotionData.logVerseSwipe();
      setVerseStyle({ opacity: 0, transform: 'translateY(14px)', transition: 'none' });
      
      requestAnimationFrame(() => requestAnimationFrame(() => {
        setVerseStyle({ opacity: 1, transform: 'translateY(0px)', transition: 'opacity 2.6s cubic-bezier(0.16,1,0.3,1), transform 2.8s cubic-bezier(0.16,1,0.3,1)' });
        setTimeout(() => setInTransit(false), 2200);
      }));
    }, 1700);
  }, [inTransit, currentView, verses, devotionData]);

  useEffect(() => { engineRef.current.advanceVerse = advanceVerse; }, [advanceVerse]);

  // --- RENDERING ENGINE (ARCH-01: Extracted to useCanvasEngine) ---
  useCanvasEngine({
    canvasRef, verseWrapRef, avatarRef, engineRef, stateRef,
    temporalRef, isLightModeRef, inTransitRef, hikmahRef, viewRef,
    targetHealth, DARK_HIGH, DARK_LOW, LIGHT_HIGH, LIGHT_LOW,
  });

  // --- INTERACTION HANDLERS ---
  const handleTextPointerDown = (e) => {
    if (inTransit || currentView !== 'main') return;
    // BUG-08: Check cooldown FIRST, before lastTapTime assignment
    if (doubleTapCooldown.current) return;

    const now = Date.now();
    if (now - lastTapTime.current < 400) { 
      if (activeVerse) {
        const isCurrentlySaved = devotionData.savedVerses.some(v => v?.id === activeVerse.id);
        if (!isCurrentlySaved) {
          devotionData.toggleSaveVerse(activeVerse.id);
          setTafakkurPromptId(activeVerse.id);
        } else {
          devotionData.toggleSaveVerse(activeVerse.id);
        }
        if (engineRef.current.triggerButtonBurst) engineRef.current.triggerButtonBurst();
        setShowSaveGlow(!isCurrentlySaved);
        setTimeout(() => setShowSaveGlow(false), 1200);
      }
      lastTapTime.current = 0;
      // BUG-06: Set cooldown to prevent press-advance after double-tap
      doubleTapCooldown.current = true;
      setTimeout(() => doubleTapCooldown.current = false, 400);
      return; 
    }
    lastTapTime.current = now;

    e.currentTarget.setPointerCapture(e.pointerId);
    stateRef.current.pointerStartX = e.clientX || (e.touches && e.touches[0].clientX);
    stateRef.current.pointerStartY = e.clientY || (e.touches && e.touches[0].clientY);
    stateRef.current.isPressing = true;
    stateRef.current.lastInteractionTime = Date.now();
  };

  const handleTextPointerUp = (e) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    stateRef.current.isPressing = false;
  };

  const handlePointerMove = (e) => {
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    if (!clientX || !clientY) return;

    stateRef.current.pointerX = clientX;
    stateRef.current.pointerY = clientY;
    stateRef.current.lastInteractionTime = Date.now();

    if (stateRef.current.isPressing) {
        const dist = Math.hypot(clientX - stateRef.current.pointerStartX, clientY - stateRef.current.pointerStartY);
        if (dist > 20) stateRef.current.isPressing = false; 
    }
  };

  const handleTouchStart = (e) => { 
      touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; // UX-03: Track x
      stateRef.current.lastInteractionTime = Date.now();
  };

  const handleTouchEnd = (e) => {
    if (e.target.closest('button') || currentView !== 'main') return; 
    const dx = touchStart.current.x - e.changedTouches[0].clientX; // UX-03: Horizontal swipe
    const dy = touchStart.current.y - e.changedTouches[0].clientY;
    
    // UX-03: Horizontal swipe advances verse
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      advanceVerse(dx > 0 ? 1 : -1);
      return;
    }
    
    if (Math.abs(dy) > 30 && !allCompleted) {
      if (dy > 0) setFocusedIndex(p => Math.min(PRAYERS.length - 1, p + 1));
      else setFocusedIndex(p => Math.max(0, p - 1));
    }
  };

  const handleWheel = (e) => {
    if (scrollCooldown.current || allCompleted || currentView !== 'main') return;
    stateRef.current.lastInteractionTime = Date.now();
    if (Math.abs(e.deltaY) > 20) {
      scrollCooldown.current = true;
      setFocusedIndex(p => e.deltaY > 0 ? Math.min(PRAYERS.length - 1, p + 1) : Math.max(0, p - 1));
      setTimeout(() => scrollCooldown.current = false, 300);
    }
  };

  const handleCompletePrayer = (prayerId) => {
    if (checkingId || completedPrayers.includes(prayerId)) return;
    setCheckingId(prayerId);
    stateRef.current.lastInteractionTime = Date.now();
    engineRef.current.triggerButtonBurst();

    setTimeout(() => {
      const nextCompleted = [...completedPrayers, prayerId];
      const nextIndex = PRAYERS.findIndex(p => !nextCompleted.includes(p.id));
      if (nextIndex !== -1) setFocusedIndex(nextIndex);
      
      devotionData.logPrayer(prayerId);
      setCheckingId(null);

      // Yaqeen: +20% when all 5 prayers done
      if (nextCompleted.length === PRAYERS.length) {
        devotionData.addYaqeen(20);
      }
    }, 850); 
  };

  // --- YAQEEN FROM TASKS (BUG-11: uses persisted rewardedIds) ---
  useEffect(() => {
    const TASK_TARGETS = { istighfar: 100, subhanallah: 33, alhamdulillah: 33, allahu_akbar: 34 };
    const tasks = devotionData.dailyTasks || {};
    const rewarded = devotionData.rewardedIds || [];
    Object.keys(TASK_TARGETS).forEach(id => {
      if ((tasks[id] || 0) >= TASK_TARGETS[id] && !rewarded.includes(id)) {
        devotionData.markTaskRewarded(id);
        devotionData.addYaqeen(5);
      }
    });
  }, [devotionData.dailyTasks, devotionData]);

  // --- KASHF TRIGGER: watch for yaqeen hitting 100 ---
  useEffect(() => {
    if (maq.yaqeenProgress >= 100 && nextStation && !kashfCeremony) {
      setKashfCeremony(true);
      setTimeout(() => {
        devotionData.advanceStation();
        setVerseIndex(0);
        setKashfCeremony(false);
      }, 3500);
    }
  }, [maq.yaqeenProgress, nextStation, kashfCeremony, devotionData]);

  // BUG-07: Clamp verseIndex defensively to prevent OOB access
  const activeVerse = verses ? verses[Math.min(verseIndex, verses.length - 1)] : null;
  const isSaved = activeVerse && devotionData.savedVerses.some(v => v?.id === activeVerse.id);
  const isHikmah = activeVerse?.type === 'hikmah';
  hikmahRef.current = isHikmah;

  // UX-06: Context button discoverability pulse — once per session after 4s
  useEffect(() => {
    if (activeVerse && !contextHintShown.current && currentView === 'main') {
      const timer = setTimeout(() => {
        if (!contextHintShown.current) {
          setShowContextHint(true);
          contextHintShown.current = true;
          setTimeout(() => setShowContextHint(false), 1500);
        }
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [activeVerse, currentView]);

  // BUG-13: Re-trigger onboarding if profile becomes null (e.g. after reset)
  useEffect(() => {
    if (!devotionData.profile) {
      setShowOnboarding(true);
      setOnboardingName('');
    }
  }, [devotionData.profile]);

  // UX-07: Ambient mode — cycle dhikr phrases every 30s (BUG-14: track timeouts)
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
    const textToShare = `${verse.a}\n\n${verse.t}\n\n- ${verse.s}`;
    if (navigator.share) {
      navigator.share({ title: 'Ruh', text: textToShare }).catch(() => {});
    } else {
      navigator.clipboard.writeText(textToShare);
    }
  };

  // --- RESOLVED VISUAL PALETTE (temporal + hikmah) ---
  const pSide = isLightMode ? palette.light : palette.dark;
  const accentHex = isHikmah ? (isLightMode ? '#0d9488' : '#14b8a6') : rgbToHex(pSide.accent);
  const accentBrightHex = isHikmah ? (isLightMode ? '#10b981' : '#34d399') : rgbToHex(pSide.accent);

  const tBg = 'bg-transparent'; // canvas paints the real background
      
  const tTextMain = isLightMode 
      ? (isHikmah ? 'text-[#064e3b]' : 'text-[#1a1814]') 
      : (isHikmah ? 'text-[#ccfbf1]' : 'text-[rgba(245,238,224,0.92)]');
      
  const tTextSub = isLightMode 
      ? (isHikmah ? 'text-[#0d9488]' : 'text-[#4a453d]') 
      : (isHikmah ? 'text-[rgba(45,212,191,0.6)]' : 'text-[rgba(228,218,200,0.48)]');

  const glowSub = isLightMode ? '0 1px 1px rgba(255,255,255,0.6)' : '0 1px 1px rgba(0,0,0,0.8)';
  const accentRgba = isHikmah
    ? (isLightMode ? 'rgba(13,148,136' : 'rgba(20,184,166')
    : `rgba(${pSide.accent.r},${pSide.accent.g},${pSide.accent.b}`;
  const glowArabic = isLightMode 
    ? `0 0 40px ${accentRgba},0.15), 0 1px 1px rgba(255,255,255,0.8)` 
    : `0 0 100px ${accentRgba},0.18), 0 1px 1px rgba(0,0,0,0.9), 0 -1px 0 rgba(255,255,255,0.02)`;
    
  const cBrightHexLight = isHikmah ? '#10b981' : rgbToHex(palette.light.accent);
  const cBrightHexDark = isHikmah ? '#34d399' : rgbToHex(palette.dark.accent);

  const getPrayerIcon = (iconType) => {
      if(iconType === 'moon') return MoonIcon;
      if(iconType === 'sun') return SunIcon;
      return SunIcon;
  };

  return (
    <div 
      className={`w-full h-screen ${tBg} overflow-hidden font-sans relative select-none transition-colors duration-1000`}
      style={{ touchAction: 'none' }}
      onPointerMove={handlePointerMove}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
    >

      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none block" />

      {/* Overlays */}
      <div 
        className={`absolute inset-0 z-10 pointer-events-none transition-opacity duration-1000 ${isLightMode ? 'opacity-[0.04] mix-blend-multiply' : 'opacity-[0.028] mix-blend-overlay'}`}
        style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.88%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')" }}
      />
      <div 
        className="absolute inset-0 z-10 pointer-events-none transition-all duration-[2000ms] ease-out"
        style={{ 
          background: isLightMode 
            ? (isHikmah 
               ? "radial-gradient(ellipse 80% 80% at 50% 50%, rgba(13,148,136,0.15) 0%, transparent 60%, rgba(235,244,241,0.8) 100%)"
               : "radial-gradient(ellipse 70% 70% at 50% 50%, transparent 40%, rgba(244,240,232,0.6) 100%)"
              )
            : (isHikmah
               ? "radial-gradient(ellipse 80% 80% at 50% 50%, rgba(13,148,136,0.15) 0%, transparent 50%, rgba(0,13,10,0.95) 100%)"
               : "radial-gradient(ellipse 68% 62% at 50% 50%, transparent 25%, rgba(4,3,2,0.80) 100%)"
              )
        }}
      />

      {/* Subtle Hikmah ambient wash */}
      <div className={`absolute inset-0 z-0 pointer-events-none transition-opacity duration-[3000ms] ${isHikmah ? 'opacity-100' : 'opacity-0'}`}>
         <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] rounded-full blur-[120px] ${isLightMode ? 'bg-[#34d399]' : 'bg-[#0d9488]'} opacity-[0.06]`} style={{ mixBlendMode: isLightMode ? 'multiply' : 'screen' }} />
      </div>

      {/* THEOLOGICAL WATERMARK / DEVOTION TIMELINE */}
      <TafakkurOverlay 
        isOpen={!!tafakkurPromptId} 
        verse={verses?.find(v => v.id === tafakkurPromptId)}
        isLightMode={isLightMode}
        localAI={localAI}
        allVerses={stations?.flatMap(s => s.verses) || []}
        onSave={(id, note) => {
          if (note.trim()) devotionData.updateVerseNote(id, note.trim());
          setTafakkurPromptId(null);
        }}
        onClose={() => setTafakkurPromptId(null)}
      />

      <DevotionTimeline completedCount={completedPrayers.length} isLightMode={isLightMode} isHikmah={isHikmah} accentColor={accentHex} accentGlow={`${accentRgba},0.6)`} />

      {/* Header */}
      <div className="absolute top-[40px] left-0 right-0 z-30 flex justify-between items-center px-10 pointer-events-none">
        {/* ARCH-05: Debug controls only visible in development */}
        {import.meta.env.DEV ? (
          <div className="flex gap-1 pointer-events-auto">
            <button 
               onClick={devotionData.resetData}
               className={`font-mono text-[9px] px-2 py-1 rounded border opacity-40 hover:opacity-100 transition-all ${isLightMode ? 'border-black text-black' : 'border-white text-white'}`}
            >
              [RESET]
            </button>
            <button 
               onClick={() => setDevTimePhase(p => p === null ? 0 : p >= 4 ? null : p + 1)}
               className={`font-mono text-[9px] px-2 py-1 rounded border opacity-40 hover:opacity-100 transition-all ${isLightMode ? 'border-black text-black' : 'border-white text-white'}`}
            >
              [{devTimePhase === null ? 'AUTO' : palette.name}]
            </button>
          </div>
        ) : <div />}
        <div className="text-center mix-blend-normal flex flex-col items-center">
          <span className={`font-arabic text-[17px] ${tTextMain} opacity-30 block mb-[2px] transition-colors duration-1000`} style={{ textShadow: glowSub, letterSpacing: '0.08em', marginRight: '-0.08em' }}>رُوح</span>
          <span className={`font-serif-eng text-[8px] uppercase ${tTextSub} opacity-40 block transition-colors duration-1000`} style={{ textShadow: glowSub, letterSpacing: '0.38em', marginRight: '-0.38em' }}>Ruh</span>
          {/* FEAT-05: Hijri date below logo */}
          <span className={`font-serif-eng text-[7px] uppercase ${tTextSub} opacity-20 block mt-1.5 transition-colors duration-1000`} style={{ letterSpacing: '0.2em', marginRight: '-0.2em' }}>
            {hijri.formatted}
          </span>
        </div>
        <button 
          onClick={() => setIsLightMode(!isLightMode)}
          className={`pointer-events-auto p-2 rounded-full transition-all duration-500 hover:scale-110 ${isLightMode ? 'hover:bg-black/5' : 'hover:bg-white/5 opacity-40 hover:opacity-100'}`}
          style={{ color: isLightMode ? accentHex : '#e4dac8' }}
        >
          {isLightMode ? <SunIcon size={16} /> : <MoonIcon size={16} />}
        </button>
      </div>

      {/* UX-07: Ambient Mode Dhikr Overlay */}
      {ambientDhikr && (
        <div 
          className="absolute top-[90px] left-0 right-0 z-20 flex justify-center pointer-events-none"
          style={{ animation: 'fadeInOut 5s ease-in-out forwards' }}
        >
          <span className={`font-arabic text-[14px] transition-colors duration-1000 ${tTextSub} opacity-40`} style={{ letterSpacing: '0.05em' }}>
            {ambientDhikr}
          </span>
        </div>
      )}

      {/* FEAT-05: Notable Islamic date banner */}
      {hijri.notable && (
        <div 
          className="absolute top-[90px] left-0 right-0 z-20 flex flex-col items-center pointer-events-none"
          style={{ animation: ambientDhikr ? 'none' : undefined }}
        >
          <span className={`font-arabic text-[13px] transition-colors duration-1000 opacity-50`} style={{ color: accentHex }}>
            {hijri.notable.labelAr}
          </span>
          <span className={`font-serif-eng text-[7px] uppercase tracking-[0.25em] mt-0.5 opacity-30 ${tTextSub}`}>
            {hijri.notable.label}
          </span>
        </div>
      )}

      {/* 3-COLUMN ARCHITECTURAL LAYOUT */}
      <div className="absolute inset-0 z-20 flex w-full h-full px-2 md:px-10 pointer-events-none">
        
        {/* Left Col - Spacer & Ambient Tasks Hub */}
        <div className="w-[60px] md:w-[140px] flex-shrink-0 h-full relative pointer-events-none flex items-center justify-center">
          <TasksSideColumn 
             isVisible={showAmbientTasks && currentView === 'main'}
             isLightMode={isLightMode}
             dailyTasks={devotionData.dailyTasks}
             incrementTask={devotionData.incrementTask}
          />
        </div>

        {/* Center Col - Dynamic Content Area (Swaps between Main and Profile) */}
        <div className="flex-grow flex flex-col items-center justify-center h-full relative">
          
          {/* --- VIEW: MAIN (Submersion Engine) --- */}
          <div 
            className="absolute inset-0 flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] w-full"
            style={{ 
              opacity: currentView === 'main' ? 1 : 0, 
              transform: currentView === 'main' ? 'scale(1)' : 'scale(0.95)',
              pointerEvents: currentView === 'main' ? 'auto' : 'none'
            }}
          >
            <div 
              ref={verseWrapRef}
              className="w-full max-w-[340px] flex flex-col items-center cursor-pointer rounded-3xl mx-auto"
              style={{ touchAction: 'none', WebkitUserSelect: 'none', '--press': '0', willChange: 'transform' }}
              onPointerDown={handleTextPointerDown}
              onPointerUp={handleTextPointerUp}
              onPointerLeave={handleTextPointerUp}
              onPointerCancel={handleTextPointerUp}
            >
              <div className="flex flex-col items-center w-full mix-blend-normal py-8 px-4" style={verseStyle}>
                
                {!activeVerse ? (
                  contentError ? (
                    <div className="flex flex-col items-center my-24 gap-4">
                      <span className={`font-serif-eng text-xs text-center opacity-60 ${tTextSub}`}>Unable to load content.<br/>Please check your connection.</span>
                      <button 
                        onClick={() => { setContentError(false); fetch('/data/content.json').then(r => r.json()).then(data => { setContentData(data); setContentError(false); }).catch(() => setContentError(true)); }}
                        className={`font-serif-eng text-[10px] uppercase tracking-widest px-5 py-2 rounded-full border transition-all hover:scale-105 ${isLightMode ? 'border-[#9c7533]/40 text-[#9c7533]' : 'border-[#d2a24b]/40 text-[#d2a24b]'}`}
                      >
                        Retry
                      </button>
                    </div>
                  ) : (
                   <div className={`font-serif-eng text-xs uppercase tracking-widest animate-pulse ${tTextSub} my-24`} style={{ letterSpacing: '0.2em' }}>Awakening Soul...</div>
                  )
                ) : (
                  <>
                    <div className="relative mb-[16px] w-full flex justify-center">
                      <div className={`absolute -top-4 -right-2 transition-all duration-700 ${isSaved ? 'opacity-70 scale-100' : 'opacity-0 scale-50'}`}>
                         <BookmarkIcon size={20} className="drop-shadow-md" style={{ color: accentBrightHex }} />
                      </div>
                      <div className={`absolute inset-0 z-30 flex items-center justify-center pointer-events-none transition-all duration-700 ${showSaveGlow ? 'opacity-100 scale-110 blur-0' : 'opacity-0 scale-50 blur-xl'}`}>
                         <BookmarkIcon size={120} className="drop-shadow-2xl" style={{ color: accentBrightHex }} />
                      </div>
                      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none transition-none" style={{ opacity: 'calc(var(--press) * 0.85)' }}>
                        <div className="rounded-full blur-2xl transition-none" style={{ width: '120%', height: '80%', background: isLightMode ? cBrightHexLight : cBrightHexDark, transform: 'scaleX(calc(0.5 + var(--press) * 0.5))' }} />
                      </div>

                  <p className={`font-arabic text-[clamp(20px,5vw,28px)] leading-[2.15] text-center ${tTextMain} transition-colors duration-1000 w-full relative z-10`} dir="rtl" style={{ textShadow: glowArabic, letterSpacing: '0.01em', marginRight: '-0.01em' }}>{activeVerse.a}</p>
                  <p className={`font-arabic text-[clamp(20px,5vw,28px)] leading-[2.15] text-center absolute top-0 pointer-events-none w-full z-20`} dir="rtl" style={{ color: accentBrightHex, clipPath: 'inset(0 0 0 calc(100% - var(--press) * 100%))', letterSpacing: '0.01em', marginRight: '-0.01em' }}>{activeVerse.a}</p>
                </div>

                <div className="w-full h-[1px] flex justify-center mb-[16px]">
                  <div className="h-full rounded-full" style={{ background: isLightMode ? cBrightHexLight : cBrightHexDark, width: 'calc(var(--press) * 85%)', opacity: 'calc(var(--press) * 1.5)', boxShadow: `0 0 20px ${accentRgba},0.9)` }} />
                </div>

                <div className="flex flex-col items-center pointer-events-none" style={{ opacity: 'calc(1 - var(--press) * 1.5)', transform: 'translateY(calc(var(--press) * 12px))' }}>
                  <p className={`font-serif-eng italic font-light text-[clamp(12px,3.2vw,15px)] leading-[2.0] text-center ${tTextSub} whitespace-pre-line w-full mb-[20px] transition-colors duration-1000`} style={{ textShadow: glowSub, letterSpacing: '0.04em', marginRight: '-0.04em' }}>{activeVerse.t}</p>
                  
                  <div className="flex flex-col items-center w-full">
                    <div className="flex flex-col items-center gap-1.5">
                      {activeVerse.type && (
                         <span className={`font-serif-eng text-[7px] border px-1.5 py-0.5 rounded-full uppercase tracking-widest`} style={{ color: accentHex, borderColor: `${accentHex}30`, backgroundColor: `${accentHex}0d` }}>
                           {activeVerse.type}
                         </span>
                      )}
                      <span className={`font-serif-eng text-[9px] uppercase text-center transition-colors duration-1000 mt-1`} style={{ color: accentHex, textShadow: glowSub, letterSpacing: '0.28em', marginRight: '-0.28em' }}>{activeVerse.s}</span>
                    </div>
                    
                    <div className="flex items-center space-x-6 mt-4">
                      <button onPointerDown={(e) => e.stopPropagation()} onClick={() => setShowContext(!showContext)} className={`flex items-center space-x-1 pointer-events-auto transition-all duration-300 hover:scale-105 ${showContext ? 'opacity-100' : showContextHint ? 'opacity-80' : (isLightMode ? 'text-[#4a453d] opacity-40' : 'text-[#e4dac8] opacity-30')}`} style={showContext || showContextHint ? { color: accentHex } : {}}>
                        <span className="font-serif-eng text-[8px] uppercase" style={{ letterSpacing: '0.3em', marginRight: '-0.3em' }}>Context</span>
                        <ChevronDownIcon size={12} className={`transition-transform duration-500 ml-1 ${showContext ? 'rotate-180' : ''}`} />
                      </button>
                      
                      <button onPointerDown={(e) => e.stopPropagation()} onClick={(e) => handleShare(e, activeVerse)} className={`flex items-center space-x-1 pointer-events-auto transition-all duration-300 hover:scale-105 ${isLightMode ? 'text-[#4a453d] opacity-40 hover:opacity-100' : 'text-[#e4dac8] opacity-30 hover:opacity-100'}`}>
                        <span className="font-serif-eng text-[8px] uppercase" style={{ letterSpacing: '0.3em', marginRight: '-0.3em' }}>Share</span>
                        <ShareIcon size={12} className="ml-1" />
                      </button>
                    </div>

                    <div className={`overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col items-center justify-start pointer-events-auto w-full`} style={{ maxHeight: showContext ? '220px' : '0px', opacity: showContext ? 1 : 0 }}>
                      <p className={`font-serif-eng mt-4 text-[12px] leading-[1.8] text-center ${tTextSub} opacity-80 w-full`} style={{ letterSpacing: '0.03em', marginRight: '-0.03em' }}>{devotionData.isSimpleMode && activeVerse.simpleC ? activeVerse.simpleC : activeVerse.c}</p>
                      {activeVerse.ts && <p className={`font-serif-eng text-[8px] uppercase opacity-60 mt-3 text-center transition-colors duration-1000`} style={{ color: accentHex, letterSpacing: '0.25em', marginRight: '-0.25em' }}>— {activeVerse.ts}</p>}
                    </div>
                  </div>
                </div>
                </>
                )}

              </div>
            </div>

          </div>

          {/* --- VIEW: PROFILE (The Soul Mirror) --- */}
          <div 
            className="absolute inset-0 flex flex-col items-center justify-center transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] w-full overflow-hidden"
            style={{ 
              opacity: currentView === 'profile' ? 1 : 0, 
              transform: currentView === 'profile' ? 'scale(1)' : 'scale(1.02)',
              pointerEvents: currentView === 'profile' ? 'auto' : 'none'
            }}
          >
            <div className="flex flex-col items-center justify-center w-full max-w-[340px] px-4 mx-auto h-[100dvh] pt-6 pb-2">

              {/* Top Anchor */}
              <span className={`font-arabic text-[18px] ${tTextMain} opacity-40 mb-1 transition-colors duration-1000 tracking-wide`}>الرحلة</span>

              {/* Avatar + Streak Integration */}
              <div ref={avatarRef} className="relative w-20 h-20 flex items-center justify-center mb-4 mx-auto mt-2">
                
                {/* The Streak Orbit (Progress Ring) */}
                <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="48" fill="none" stroke={isLightMode ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.03)'} strokeWidth="1" strokeDasharray="2 6" />
                  <circle cx="50" cy="50" r="48" fill="none" stroke={isLightMode ? '#9c7533' : '#d2a24b'} strokeWidth="1.5" strokeDasharray="301.59" strokeDashoffset="180.95" strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                </svg>

                {/* The Frosted Avatar Center */}
                <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-full backdrop-blur-xl border transition-all duration-1000 z-10
                    ${isLightMode ? 'bg-white/40 border-white/60 shadow-[inset_0_2px_10px_rgba(0,0,0,0.05),_0_10px_30px_rgba(0,0,0,0.05)]' : 'bg-white/5 border-white/10 shadow-[inset_0_2px_10px_rgba(255,255,255,0.05),_0_10px_30px_rgba(0,0,0,0.2)]'}
                `}>
                  <span className={`font-serif-eng text-xl font-light ${tTextMain} transition-colors duration-1000`} style={{ letterSpacing: '0.1em', marginRight: '-0.1em', textShadow: glowSub }}>
                    {userProfile?.initials || '?'}
                  </span>
                </div>
              </div>

              {/* User Identity */}
              <h2 className={`font-serif-eng text-xl font-medium ${tTextMain} mb-1 transition-colors duration-1000 flex items-center justify-center`} style={{ textShadow: glowSub, letterSpacing: '0.05em', marginRight: '-0.05em' }}>{userProfile?.name || 'Seeker'}</h2>
              <p className={`font-serif-eng text-[9px] uppercase mb-1 transition-colors duration-1000`} style={{ color: accentHex, letterSpacing: '0.2em', marginRight: '-0.2em' }}>{userProfile ? `Seeker • Joined ${userProfile.joinedDate?.slice(0,4)}` : 'Seeker'}</p>
              {/* FEAT-05: Hijri date in profile */}
              <p className={`font-arabic text-[11px] ${tTextSub} opacity-30 mb-5 transition-colors duration-1000`}>
                {hijri.formattedAr}
              </p>

              {/* 4-Pillar Data Grid — FEAT-01: Added Streak column */}
              <div className="grid grid-cols-4 gap-2 w-full mb-6">
                <div className={`flex flex-col items-center justify-center py-3 px-1 rounded-[16px] backdrop-blur-md border transition-all duration-1000 ${isLightMode ? 'bg-black/[0.02] border-black/[0.05]' : 'bg-white/[0.02] border-white/[0.05]'}`}>
                  <span className={`font-serif-eng text-lg leading-none font-light ${tTextMain} transition-colors duration-1000`}>{devotionData.currentStreak > 0 ? `${devotionData.currentStreak}🔥` : '0'}</span>
                  <span className={`font-serif-eng text-[7px] uppercase ${tTextSub} mt-2 opacity-80 transition-colors duration-1000`} style={{ letterSpacing: '0.12em', marginRight: '-0.12em' }}>Streak</span>
                </div>
                <div className={`flex flex-col items-center justify-center py-3 px-1 rounded-[16px] backdrop-blur-md border transition-all duration-1000 ${isLightMode ? 'bg-black/[0.02] border-black/[0.05]' : 'bg-white/[0.02] border-white/[0.05]'}`}>
                  <span className={`font-serif-eng text-lg leading-none font-light ${tTextMain} transition-colors duration-1000`}>{devotionData.activeDays}</span>
                  <span className={`font-serif-eng text-[7px] uppercase ${tTextSub} mt-2 opacity-80 transition-colors duration-1000`} style={{ letterSpacing: '0.12em', marginRight: '-0.12em' }}>Presence</span>
                </div>
                <div className={`flex flex-col items-center justify-center py-3 px-1 rounded-[16px] backdrop-blur-md border transition-all duration-1000 ${isLightMode ? 'bg-black/[0.02] border-black/[0.05]' : 'bg-white/[0.02] border-white/[0.05]'}`}>
                  <span className={`font-serif-eng text-lg leading-none font-light ${tTextMain} transition-colors duration-1000`}>{devotionData.totalPrayers}</span>
                  <span className={`font-serif-eng text-[7px] uppercase ${tTextSub} mt-2 opacity-80 transition-colors duration-1000`} style={{ letterSpacing: '0.12em', marginRight: '-0.12em' }}>Prayers</span>
                </div>
                <div className={`flex flex-col items-center justify-center py-3 px-1 rounded-[16px] backdrop-blur-md border transition-all duration-1000 ${isLightMode ? 'bg-black/[0.02] border-black/[0.05]' : 'bg-white/[0.02] border-white/[0.05]'}`}>
                  <span className={`font-serif-eng text-lg leading-none font-light ${tTextMain} transition-colors duration-1000`}>{devotionData.totalVerses}</span>
                  <span className={`font-serif-eng text-[8px] uppercase ${tTextSub} mt-2 opacity-80 transition-colors duration-1000`} style={{ letterSpacing: '0.15em', marginRight: '-0.15em' }}>Verses</span>
                </div>
              </div>

              {/* UX-11: Streak zero encouragement */}
              {devotionData.currentStreak === 0 && devotionData.longestStreak > 0 && (
                <p className={`font-serif-eng text-[10px] italic text-center opacity-40 -mt-4 mb-4 ${tTextSub} transition-colors duration-1000`}>
                  Your path continues — {devotionData.longestStreak} days was your milestone.
                </p>
              )}

              {/* Devotion Heatmap */}
              <DevotionHeatmap isLightMode={isLightMode} historyMap={devotionData.history} />

              {/* Actionable Preferences Menu Compression */}
              <div className="w-full flex justify-center items-center gap-8 mt-2">
                 <button onClick={() => setShowArchive(true)} className={`p-3 rounded-full backdrop-blur-md transition-all duration-500 hover:scale-[1.1] ${isLightMode ? 'text-[#4a453d] hover:bg-black/5 hover:text-[#9c7533]' : 'text-[#e4dac8] hover:bg-white/5 hover:text-[#d2a24b]'} opacity-70 hover:opacity-100`}>
                    <BookmarkIcon size={18} />
                 </button>
                 <button onClick={() => setShowReminders(true)} className={`p-3 rounded-full backdrop-blur-md transition-all duration-500 hover:scale-[1.1] ${isLightMode ? 'text-[#4a453d] hover:bg-black/5 hover:text-[#9c7533]' : 'text-[#e4dac8] hover:bg-white/5 hover:text-[#d2a24b]'} opacity-70 hover:opacity-100 relative`}>
                    <BellIcon size={18} />
                    {(Object.values(devotionData.prayers || {}).some(p => p.enabled) || (devotionData.customReminders || []).some(r => r.enabled)) && (
                       <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accentHex, boxShadow: `0 0 5px ${accentHex}` }} />
                    )}
                 </button>
                 <button onClick={() => setShowSettings(true)} className={`p-3 rounded-full backdrop-blur-md transition-all duration-500 hover:scale-[1.1] ${isLightMode ? 'text-[#4a453d] hover:bg-black/5 hover:text-[#9c7533]' : 'text-[#e4dac8] hover:bg-white/5 hover:text-[#d2a24b]'} opacity-70 hover:opacity-100`}>
                    <SettingsIcon size={18} />
                 </button>
              </div>

            </div>
          </div>

          {/* --- VIEW: TASKS (Active Execution Engine) --- */}
          <TasksView 
             currentView={currentView}
             isLightMode={isLightMode}
             dailyTasks={devotionData.dailyTasks}
             incrementTask={devotionData.incrementTask}
             activeDays={devotionData.activeDays}
             onOpenBurhan={() => setShowBurhanModal(true)}
          />

        </div>

        {/* Right Col - The Sleek, Thin Nav Island */}
        <div className="w-[60px] md:w-[140px] flex-shrink-0 h-full relative pointer-events-none pr-2 md:pr-10">
           <div 
            className={`absolute right-4 md:right-8 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3 py-3 px-1 w-[40px] rounded-full backdrop-blur-xl border pointer-events-auto transition-all duration-1000
              ${isLightMode ? 'bg-white/30 border-white/40 engraved-light' : 'bg-[#12100d]/40 border-white/5 engraved-dark island-dark'}`}
           >
              {/* Main Nav Button */}
              <button 
                onClick={() => setCurrentView('main')}
                className={`relative w-8 h-8 rounded-full transition-all duration-500 hover:scale-105 flex items-center justify-center
                  ${currentView === 'main' ? (isLightMode ? 'text-[#9c7533] shadow-[0_2px_10px_rgba(156,117,51,0.2)] bg-white/50' : 'text-[#d2a24b] shadow-[0_2px_10px_rgba(210,162,75,0.2)] bg-white/5') : (isLightMode ? 'text-[#4a453d] opacity-50 hover:opacity-100' : 'text-[#e4dac8] opacity-30 hover:opacity-100')}
                `}
              >
                <MainNavIcon size={16} />
              </button>

              {/* Tasks Nav Button */}
              <button 
                onClick={() => setCurrentView('tasks')}
                className={`relative w-8 h-8 rounded-full transition-all duration-500 hover:scale-105 flex items-center justify-center
                  ${currentView === 'tasks' ? (isLightMode ? 'text-[#9c7533] shadow-[0_2px_10px_rgba(156,117,51,0.2)] bg-white/50' : 'text-[#d2a24b] shadow-[0_2px_10px_rgba(210,162,75,0.2)] bg-white/5') : (isLightMode ? 'text-[#4a453d] opacity-50 hover:opacity-100' : 'text-[#e4dac8] opacity-30 hover:opacity-100')}
                `}
              >
                <TasksNavIcon size={16} />
              </button>

              {/* Profile Nav Button */}
              <button 
                onClick={() => setCurrentView('profile')}
                className={`relative w-8 h-8 rounded-full transition-all duration-500 hover:scale-105 flex items-center justify-center
                  ${currentView === 'profile' ? (isLightMode ? 'text-[#9c7533] shadow-[0_2px_10px_rgba(156,117,51,0.2)] bg-white/50' : 'text-[#d2a24b] shadow-[0_2px_10px_rgba(210,162,75,0.2)] bg-white/5') : (isLightMode ? 'text-[#4a453d] opacity-50 hover:opacity-100' : 'text-[#e4dac8] opacity-30 hover:opacity-100')}
                `}
              >
                <ProfileNavIcon size={16} />
              </button>
           </div>
        </div>

      </div>

      {/* 5. Focal Stack (Rolodex) - Only show on Main view */}
      <div 
        className="absolute bottom-[40px] md:bottom-[50px] left-1/2 -translate-x-1/2 z-30 w-full max-w-[280px] h-[70px] flex justify-center items-center pointer-events-none transition-opacity duration-700"
        style={{ opacity: currentView === 'main' ? 1 : 0 }}
      >
        {PRAYERS.map((item, i) => {
          const offset = i - focusedIndex;
          const isActive = offset === 0;
          const isCompletedItem = completedPrayers.includes(item.id);
          const isChecking = checkingId === item.id;

          let yPos = offset * 56;
          let scale = 1 - Math.abs(offset) * 0.12;
          let opacity = isActive ? 1 : Math.max(0, 0.4 - Math.abs(offset) * 0.15);
          
          if (isLightMode && !isActive && opacity > 0) opacity += 0.1;
          if (Math.abs(offset) >= 3) opacity = 0; 
          if (allCompleted) { opacity = 0; yPos += 20; }

          const RenderIcon = getPrayerIcon(item.iconType);

          return (
            <div 
              key={item.id}
              className="absolute w-full px-6 transition-all duration-[700ms] ease-[cubic-bezier(0.25,1,0.3,1)]"
              style={{
                transform: `translateY(${yPos}px) scale(${scale})`,
                opacity: opacity,
                zIndex: 10 - Math.abs(offset),
                pointerEvents: opacity > 0 && !allCompleted && currentView === 'main' ? 'auto' : 'none'
              }}
            >
              <button
                onPointerDown={(e) => e.stopPropagation()} 
                onClick={(e) => {
                  e.stopPropagation();
                  if (checkingId) return;
                  if (!isActive) setFocusedIndex(i);
                  else if (!isCompletedItem) handleCompletePrayer(item.id); 
                }}
                className={`group relative flex items-center justify-between w-full p-4 rounded-2xl backdrop-blur-sm transition-all duration-500 ease-out overflow-hidden border
                  ${isLightMode 
                    ? (isChecking || isCompletedItem ? 'bg-[#9c7533]/10 border-[#9c7533]/30' : 'bg-black/[0.02] hover:bg-black/[0.04] border-black/[0.05]') 
                    : (isChecking || isCompletedItem ? 'bg-[#d2a24b]/10 border-[#d2a24b]/30' : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.05]')
                  }`}
              >
                <div className="flex items-center space-x-4 z-10">
                  <RenderIcon 
                    size={16} 
                    className={`transition-all duration-500 
                      ${isChecking || isCompletedItem ? (isLightMode ? 'text-[#9c7533]' : 'text-[#d2a24b]') 
                                      : (isLightMode ? 'text-[#4a453d] opacity-50 group-hover:opacity-80 group-hover:text-[#9c7533]' : 'text-[#e4dac8] opacity-40 group-hover:opacity-70 group-hover:text-[#d2a24b]')}`} 
                  />
                  <div className="flex flex-col">
                    <span 
                      className={`font-serif-eng uppercase text-[11px] transition-all duration-500 
                        ${isChecking || isCompletedItem ? (isLightMode ? 'text-[#9c7533] font-medium' : 'text-[#d2a24b]') 
                                        : (isLightMode ? 'text-[#4a453d] opacity-70 group-hover:opacity-100' : 'text-[#e4dac8] opacity-60 group-hover:opacity-100')}`}
                      style={{ letterSpacing: '0.1em', marginRight: '-0.1em' }}
                    >
                      {item.label}
                    </span>
                    {/* FEAT-02: Arabic prayer name */}
                    <span className={`font-arabic text-[9px] -mt-0.5 transition-all duration-500 ${isLightMode ? 'text-[#4a453d] opacity-25' : 'text-[#e4dac8] opacity-20'}`}>
                      {prayerTimes.prayerData?.arabicNames[item.id] || ''}
                    </span>
                  </div>
                </div>
                
                {/* FEAT-02: Prayer time + check icon */}
                <div className="flex items-center gap-3 z-10">
                  {prayerTimes.prayerData?.formatted[item.id] && (
                    <span 
                      className={`font-serif-eng text-[9px] tabular-nums transition-all duration-500
                        ${prayerTimes.prayerData.nextPrayer === item.id && !isCompletedItem
                          ? (isLightMode ? 'text-[#9c7533] opacity-80' : 'text-[#d2a24b] opacity-70')
                          : (isLightMode ? 'text-[#4a453d] opacity-30' : 'text-[#e4dac8] opacity-25')
                        }`}
                    >
                      {prayerTimes.prayerData.formatted[item.id]}
                    </span>
                  )}
                  {isChecking ? (
                    <CheckCircleIcon size={18} className={`absolute animate-[checkmarkPop_0.4s_cubic-bezier(0.34,1.56,0.64,1)_forwards] ${isLightMode ? 'text-[#9c7533]' : 'text-[#d2a24b]'}`} />
                  ) : isCompletedItem ? (
                    <CheckCircleIcon size={18} className={`absolute ${isLightMode ? 'text-[#9c7533] opacity-80' : 'text-[#d2a24b] opacity-80'}`} />
                  ) : (
                    <CircleIcon size={18} className={`absolute transition-all duration-300 ${isLightMode ? 'text-[#4a453d] opacity-20 group-hover:opacity-80 group-hover:text-[#9c7533]' : 'text-[#e4dac8] opacity-20 group-hover:opacity-100 group-hover:text-[#d2a24b]'}`} />
                  )}
                </div>
              </button>
            </div>
          )
        })}



        {/* COMPLETION NODE */}
        <div 
          className="absolute w-full px-6 flex flex-col items-center justify-center transition-all duration-[900ms] ease-[cubic-bezier(0.25,1,0.3,1)] pointer-events-none"
          style={{ 
            transform: `translateY(${allCompleted ? 0 : 30}px) scale(${allCompleted ? 1 : 0.9})`, 
            opacity: allCompleted ? 1 : 0, 
            zIndex: 20 
          }}
        >
          <SparklesIcon size={16} className={`${isLightMode ? 'text-[#9c7533] opacity-60' : 'text-[#d2a24b] opacity-40 drop-shadow-[0_0_10px_rgba(210,162,75,0.4)]'} mb-3`} />
          <span className={`font-serif-eng uppercase text-[10px] ${isLightMode ? 'text-[#4a453d] opacity-50' : 'text-[#e4dac8] opacity-30'}`} style={{ letterSpacing: '0.1em', marginRight: '-0.1em' }}>
            Daily Devotion Complete
          </span>
        </div>

      </div>
      
      <SavedVersesModal 
        isOpen={showArchive} 
        onClose={() => setShowArchive(false)} 
        isLightMode={isLightMode} 
        savedVerses={devotionData.savedVerses} 
        allVerses={stations.flatMap(s => s.verses)} 
        onEditNote={(id) => setTafakkurPromptId(id)}
      />

      {/* STATION INDICATOR (bottom center) */}
      {stations.length > 0 && currentView === 'main' && (
        <div className="absolute bottom-[28px] left-0 right-0 z-30 flex justify-center pointer-events-none">
          <StationIndicator
            stations={stations}
            currentStation={maq.currentStation}
            unlockedStations={maq.unlockedStations || [0]}
            yaqeenProgress={maq.yaqeenProgress}
            accentHex={accentHex}
            fogOpacity={fogOpacity}
            nextStation={nextStation}
            onSelectStation={(idx) => { setVerseIndex(0); devotionData.goToStation(idx); }}
          />
        </div>
      )}

      {/* KASHF (UNVEILING) CEREMONY */}
      {kashfCeremony && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none" style={{ animation: 'kashfFade 3.5s ease-in-out forwards' }}>
          <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.25) 0%, transparent 60%)', animation: 'kashfFlare 3.5s ease-out forwards' }} />
          <div className="relative flex flex-col items-center" style={{ animation: 'kashfText 3.5s ease-in-out forwards' }}>
            <span className="font-arabic text-[52px] mb-3" style={{ color: accentHex, textShadow: `0 0 60px ${accentRgba},0.5)` }}>
              {nextStation?.name}
            </span>
            <span className={`font-serif-eng text-sm uppercase ${tTextSub}`} style={{ letterSpacing: '0.3em', marginRight: '-0.3em' }}>
              {nextStation?.subtitle}
            </span>
          </div>
        </div>
      )}

      <BurhanOverlay 
        isOpen={showBurhanModal}
        burhan={burhanData[(maq.currentStation * 2 + devotionData.activeDays) % burhanData.length]}
        isLightMode={isLightMode}
        isCompleted={devotionData.burhanCompleted}
        isSimpleMode={devotionData.isSimpleMode}
        onComplete={devotionData.completeBurhan}
        onClose={() => setShowBurhanModal(false)}
      />

      <SettingsModal 
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        isLightMode={isLightMode}
        devotionData={devotionData}
        prayerTimes={prayerTimes}
      />

      <RemindersModal 
        isOpen={showReminders}
        onClose={() => setShowReminders(false)}
        isLightMode={isLightMode}
        devotionData={devotionData}
      />

      {/* UX-02: Onboarding Modal */}
      {showOnboarding && !userProfile && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center" style={{ background: 'rgba(4,3,2,0.95)', backdropFilter: 'blur(30px)' }}>
          <div className="flex flex-col items-center w-full max-w-[320px] px-8">
            <span className="font-arabic text-[42px] text-[rgba(245,238,224,0.25)] mb-2" style={{ textShadow: '0 0 60px rgba(210,162,75,0.15)' }}>رُوح</span>
            <span className="font-serif-eng text-[10px] uppercase text-[rgba(228,218,200,0.3)] mb-12" style={{ letterSpacing: '0.4em' }}>Ruh</span>
            
            <h2 className="font-serif-eng text-2xl font-light text-[rgba(245,238,224,0.92)] mb-2 text-center" style={{ textShadow: '0 1px 1px rgba(0,0,0,0.8)' }}>
              What shall we call you?
            </h2>
            <p className="font-serif-eng text-[11px] text-[rgba(228,218,200,0.35)] mb-8 text-center">
              Your name personalizes your spiritual journey.
            </p>
            
            <input
              type="text"
              value={onboardingName}
              onChange={(e) => setOnboardingName(e.target.value)}
              placeholder="Your name"
              autoFocus
              className="w-full bg-transparent border-b border-white/20 outline-none text-center font-serif-eng text-xl text-[rgba(245,238,224,0.92)] pb-3 mb-10 placeholder:text-white/15 focus:border-[#d2a24b]/50 transition-colors"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && onboardingName.trim().length >= 2) {
                  devotionData.setProfile(onboardingName);
                  setShowOnboarding(false);
                }
              }}
            />
            
            <button
              onClick={() => {
                if (onboardingName.trim().length >= 2) {
                  devotionData.setProfile(onboardingName);
                  setShowOnboarding(false);
                }
              }}
              disabled={onboardingName.trim().length < 2}
              className={`w-full py-3.5 rounded-2xl font-serif-eng text-[11px] uppercase tracking-[0.25em] border transition-all duration-500
                ${onboardingName.trim().length >= 2
                  ? 'border-[#d2a24b]/40 text-[#d2a24b] hover:bg-[#d2a24b]/10 hover:border-[#d2a24b]/60'
                  : 'border-white/10 text-white/20 cursor-not-allowed'
                }
              `}
            >
              Begin Journey
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
