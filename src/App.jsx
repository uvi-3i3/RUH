import { useState, useEffect, useRef, useCallback } from 'react';
import { useDevotionData } from './hooks/useDevotionData';
import { useTemporalPhase, rgbToHex } from './hooks/useTemporalPhase';
import { SavedVersesModal } from './components/layout/SavedVersesModal';
import { useLocalAI } from './hooks/useLocalAI';
import { PRAYERS, DARK_HIGH, DARK_LOW, LIGHT_HIGH, LIGHT_LOW } from './data/constants';
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

  useEffect(() => {
    fetch('/data/content.json')
      .then(r => r.json())
      .then(data => setContentData(data))
      .catch(e => console.error("Error loading content:", e));
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

  // UX-07: Ambient mode dhikr phrases
  const DHIKR_PHRASES = ['سُبْحَانَ اللَّهِ', 'الْحَمْدُ لِلَّهِ', 'اللَّهُ أَكْبَرُ', 'لَا إِلٰهَ إِلَّا اللَّهُ', 'أَسْتَغْفِرُ اللَّهَ', 'بِسْمِ اللَّهِ'];
  const [ambientDhikr, setAmbientDhikr] = useState(null);

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

  // --- RENDERING ENGINE (ZERO LAG OPTIMIZED) ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    let animationFrameId;
    let embers = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, navigator.hardwareConcurrency < 4 ? 1 : 2); // PERF-03: Adaptive DPR
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if(stateRef.current) {
          stateRef.current.pointerX = window.innerWidth / 2;
          stateRef.current.pointerY = window.innerHeight / 2;
      }
    };

    window.addEventListener('resize', resize);
    resize();

    const spawnEmbers = (cx, cy, count, forceGold = false, burstSpeed = 1) => {
      const safeCount = Math.min(count, 35); 
      for (let i = 0; i < safeCount; i++) {
        const isGold = forceGold || Math.random() < 0.55;
        embers.push({
          x: cx + (Math.random() - 0.5) * (count > 10 ? 280 : 30),
          y: cy + (Math.random() - 0.5) * (count > 10 ? 130 : 30),
          vx: (Math.random() - 0.5) * 1.5 * burstSpeed,
          vy: -(Math.random() * 0.8 + 0.2) * burstSpeed,
          life: Math.random() * 0.75 + 0.3,
          decay: Math.random() * 0.0035 + 0.0018,
          r: Math.random() * 1.1 + 0.25,
          twinkleSpeed: Math.random() * 0.055 + 0.018,
          twinklePhase: Math.random() * Math.PI * 2,
          wobble: (Math.random() - 0.5) * 0.007,
          gold: isGold,
        });
      }
    };

    engineRef.current.triggerTextBurst = () => {
      const W = window.innerWidth, H = window.innerHeight;
      spawnEmbers(W/2, H/2 - 40, 60, true, 3.0); 
    };

    engineRef.current.triggerButtonBurst = () => {
      const W = window.innerWidth, H = window.innerHeight;
      spawnEmbers(W/2, H - 100, 35, true, 1.5); 
    };

    const lerp = (start, end, t) => start + (end - start) * t;

    const drawLight = (radius, alpha, coreColor, edgeColor) => {
        if (radius <= 0) return;
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
        grad.addColorStop(0, `rgba(${coreColor.r},${coreColor.g},${coreColor.b},${alpha})`);
        grad.addColorStop(0.3, `rgba(${edgeColor.r},${edgeColor.g},${edgeColor.b},${alpha * 0.5})`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();
    };

    const loop = (time) => {
      const W = window.innerWidth, H = window.innerHeight;
      const min = Math.min(W, H);

      stateRef.current.health += (targetHealth - stateRef.current.health) * 0.02;
      const targetTheme = isLightModeRef.current ? 1 : 0;  // PERF-04: Read from ref
      stateRef.current.theme += (targetTheme - stateRef.current.theme) * 0.05;

      const targetHikmah = hikmahRef.current ? 1 : 0;
      stateRef.current.hikmahBlend += (targetHikmah - stateRef.current.hikmahBlend) * 0.025;
      
      const h = stateRef.current.health;
      const t = stateRef.current.theme;
      const hk = stateRef.current.hikmahBlend;

      if (stateRef.current.isPressing && !inTransitRef.current && viewRef.current === 'main') {  // PERF-04: Read from ref
        stateRef.current.pressProgress += 0.035; 
        if (stateRef.current.pressProgress >= 1) {
           stateRef.current.pressProgress = 0;
           stateRef.current.isPressing = false;
           if (engineRef.current.advanceVerse) engineRef.current.advanceVerse(1);
           if (engineRef.current.triggerTextBurst) engineRef.current.triggerTextBurst();
        }
      } else {
        stateRef.current.pressProgress = Math.max(0, stateRef.current.pressProgress - 0.06);
      }

      const pressP = stateRef.current.pressProgress;

      if (verseWrapRef.current && !inTransitRef.current && Math.abs(stateRef.current.lastPressP - pressP) > 0.005) {  // PERF-04
        verseWrapRef.current.style.transform = `scale(${1 - pressP * 0.02})`;
        verseWrapRef.current.style.setProperty('--press', pressP.toFixed(3));
        stateRef.current.lastPressP = pressP;
      }

      const timeSinceInteraction = Date.now() - stateRef.current.lastInteractionTime;
      const isIdle = timeSinceInteraction > 2000 && !stateRef.current.isPressing;

      let orbTargetX = stateRef.current.pointerX;
      let orbTargetY = stateRef.current.pointerY;
      let springStiffness = 0.04;
      let springDamping = 0.15;

      // PROFILE PHYSICS: Centers beautifully behind the User Avatar ring
      if (viewRef.current === 'profile') {
        if (avatarRef.current) {
          const rect = avatarRef.current.getBoundingClientRect();
          orbTargetX = rect.left + rect.width / 2;
          orbTargetY = rect.top + rect.height / 2;
        } else {
          orbTargetX = W / 2;
          orbTargetY = H * 0.25; 
        }
        springStiffness = 0.05;  
        springDamping = 0.15;
      } else if (stateRef.current.isPressing) {
        orbTargetX = W / 2;
        orbTargetY = H / 2 - 35;
        springStiffness = 0.2; 
        springDamping = 0.3;
      } else if (isIdle) {
        orbTargetX = W / 2 + Math.sin(time * 0.0008) * (W * 0.3);
        orbTargetY = H / 2 + Math.cos(time * 0.0011) * (H * 0.2);
        springStiffness = 0.01; 
        springDamping = 0.05;
      }

      const ax = (orbTargetX - stateRef.current.orbX) * springStiffness;
      const ay = (orbTargetY - stateRef.current.orbY) * springStiffness;
      stateRef.current.orbVx += ax;
      stateRef.current.orbVy += ay;
      stateRef.current.orbVx *= (1 - springDamping);
      stateRef.current.orbVy *= (1 - springDamping);

      stateRef.current.orbX += stateRef.current.orbVx;
      stateRef.current.orbY += stateRef.current.orbVy;

      stateRef.current.currentPointerX += (stateRef.current.pointerX - stateRef.current.currentPointerX) * 0.03;
      stateRef.current.currentPointerY += (stateRef.current.pointerY - stateRef.current.currentPointerY) * 0.03;
      const pX = (stateRef.current.currentPointerX - W / 2) * 0.05;
      const pY = (stateRef.current.currentPointerY - H / 2) * 0.05;
      const cx = (W / 2) + pX;
      const cy = (H / 2) + pY;

      ctx.globalCompositeOperation = 'source-over';

      const tp = temporalRef.current;
      const tpD = tp.dark;
      const tpL = tp.light;
      const bgR = Math.floor(lerp(lerp(tpD.bg.r, tpL.bg.r, t), lerp(1, 228, t), hk));
      const bgG = Math.floor(lerp(lerp(tpD.bg.g, tpL.bg.g, t), lerp(10, 242, t), hk));
      const bgB = Math.floor(lerp(lerp(tpD.bg.b, tpL.bg.b, t), lerp(8, 238, t), hk));
      ctx.fillStyle = `rgb(${bgR},${bgG},${bgB})`;
      ctx.fillRect(0, 0, W, H);

      // 4-7-8 Breathing Cycle (19s = 19000ms)
      const breathTime = time % 19000;
      let breathPhase = 0;
      if (breathTime < 4000) {
        const tIn = breathTime / 4000;
        breathPhase = 0.5 - Math.cos(tIn * Math.PI) * 0.5;
      } else if (breathTime < 11000) {
        breathPhase = 1;
      } else {
        const tOut = (breathTime - 11000) / 8000;
        breathPhase = 0.5 + Math.cos(tOut * Math.PI) * 0.5;
      }

      // Cloud colors: temporal palette → hikmah override
      const HIKMAH_CLOUD = [{r:20, g:184, b:166}, {r:45, g:212, b:191}, {r:13, g:148, b:136}];

      for (let i = 0; i < 3; i++) {
        const dC = tpD.clouds[i];
        const lC = tpL.clouds[i];
        const dimF = 0.15 + h * 0.85;
        let baseR = Math.floor(lerp(dC.r, lC.r, t) * dimF);
        let baseG = Math.floor(lerp(dC.g, lC.g, t) * dimF);
        let baseB = Math.floor(lerp(dC.b, lC.b, t) * dimF);
        
        const finalR = Math.floor(lerp(baseR, HIKMAH_CLOUD[i].r, hk));
        const finalG = Math.floor(lerp(baseG, HIKMAH_CLOUD[i].g, hk));
        const finalB = Math.floor(lerp(baseB, HIKMAH_CLOUD[i].b, hk));

        // BUG-05: Use light or dark cloud constants based on current theme
        const cloudHigh = t > 0.5 ? LIGHT_HIGH[i] : DARK_HIGH[i];
        const cloudLow = t > 0.5 ? LIGHT_LOW[i] : DARK_LOW[i];
        const base = cloudHigh; 
        const bF = lerp(cloudLow.bF, base.bF, h);
        const rV = lerp(cloudLow.rV, base.rV, h);
        const bA = lerp(cloudLow.bA, base.bA, h) * 0.25; 
        const aV = lerp(cloudLow.aV, base.aV, h) * 0.25; 
        const speedMult = (1 + (h * 0.5)) * 0.35;
        
        const x = cx + Math.sin(time * base.xS * speedMult + base.xO) * W * base.xA;
        const y = cy + Math.cos(time * base.yS * speedMult + base.yO) * H * base.yA;
        
        const baseRadius = min * bF;
        const driftRadius = Math.sin(time * base.rS * speedMult) * min * rV;
        const breathRadiusBonus = baseRadius * 0.55 * breathPhase; 
        const radius = Math.max(baseRadius + driftRadius + breathRadiusBonus, 1);

        const baseAlpha = bA;
        const driftAlpha = Math.sin(time * base.aS * speedMult) * aV;
        const breathAlphaBonus = baseAlpha * 1.50 * breathPhase;
        const alpha = Math.max(0, baseAlpha + driftAlpha + breathAlphaBonus);


        if(alpha > 0) {
            const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
            grad.addColorStop(0, `rgba(${finalR},${finalG},${finalB},${alpha})`);
            grad.addColorStop(0.5, `rgba(${finalR},${finalG},${finalB},${alpha * 0.4})`);
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI*2);
            ctx.fill();
        }
      }

      // --- OPTICAL NUR ---
      const orbSpd = Math.hypot(stateRef.current.orbVx, stateRef.current.orbVy);
      const chargeScale = 1 + Math.pow(pressP, 2) * 5; 
      const stretchX = stateRef.current.isPressing ? 1 : Math.max(1, 1 + orbSpd * 0.04);
      const stretchY = stateRef.current.isPressing ? 1 : Math.max(0.5, 1 - orbSpd * 0.02);
      
      ctx.save();
      ctx.translate(stateRef.current.orbX, stateRef.current.orbY);
      if (!stateRef.current.isPressing && orbSpd > 0.5) {
          ctx.rotate(Math.atan2(stateRef.current.orbVy, stateRef.current.orbVx));
      }
      ctx.scale(stretchX, stretchY);

      ctx.globalCompositeOperation = t > 0.5 ? 'source-over' : 'screen';

      // Nur orb colors: temporal palette → hikmah teal override
      const coreBase = t > 0.5 ? tpL.orbCore : tpD.orbCore;
      const coreTeal = {r:204, g:251, b:241};
      const coreC = {r: Math.floor(lerp(coreBase.r, coreTeal.r, hk)), g: Math.floor(lerp(coreBase.g, coreTeal.g, hk)), b: Math.floor(lerp(coreBase.b, coreTeal.b, hk))};

      const glowBase = t > 0.5 ? tpL.orbGlow : tpD.orbGlow;
      const glowTeal = t > 0.5 ? {r:13, g:148, b:136} : {r:20, g:184, b:166};
      const glowC = {r: Math.floor(lerp(glowBase.r, glowTeal.r, hk)), g: Math.floor(lerp(glowBase.g, glowTeal.g, hk)), b: Math.floor(lerp(glowBase.b, glowTeal.b, hk))};

      const coronaBase = t > 0.5 ? tpL.orbCorona : tpD.orbCorona;
      const coronaTeal = t > 0.5 ? {r:6, g:95, b:70} : {r:15, g:118, b:110};
      const coronaC = {r: Math.floor(lerp(coronaBase.r, coronaTeal.r, hk)), g: Math.floor(lerp(coronaBase.g, coronaTeal.g, hk)), b: Math.floor(lerp(coronaBase.b, coronaTeal.b, hk))};

      const coronaR = (45 + Math.sin(time * 0.002) * 5) * chargeScale;
      drawLight(coronaR, 0.4 + pressP * 0.2, glowC, coronaC);
      const glowR = (20 + Math.cos(time * 0.003) * 2) * chargeScale;
      drawLight(glowR, 0.8, coreC, glowC);
      const coreR = 6 * chargeScale;
      drawLight(coreR, 1.0, coreC, coreC);

      if (pressP > 0) {
          ctx.rotate(time * 0.001); 
          ctx.beginPath();
          ctx.arc(0, 0, 30 + Math.pow(pressP, 2) * 80, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${glowC.r},${glowC.g},${glowC.b},${pressP * 0.6})`;
          ctx.lineWidth = 1 + pressP * 1.5;
          ctx.stroke();
      }

      ctx.restore();
      ctx.globalCompositeOperation = 'source-over';

      if (orbSpd > 2 || stateRef.current.isPressing) {
          const spawnChance = stateRef.current.isPressing ? (0.2 + pressP) : (0.15 + orbSpd * 0.05);
          if (Math.random() < spawnChance) {
              spawnEmbers(stateRef.current.orbX, stateRef.current.orbY, 1, true, 0.4);
          }
      }

      for (let i = embers.length - 1; i >= 0; i--) {
        const e = embers[i];
        e.x += e.vx + Math.sin(e.twinklePhase) * 0.12 - (pX * 0.01);
        e.y += e.vy - (pY * 0.01);
        e.vx += e.wobble;
        e.twinklePhase += e.twinkleSpeed;
        e.life -= e.decay;
        
        if (e.life <= 0) {
          embers.splice(i, 1);
        } else {
          const tw = 0.5 + 0.5 * Math.sin(e.twinklePhase);
          const alpha = Math.max(0, e.life) * tw;
          const eBase = t > 0.5 ? tpL.ember : tpD.ember;
          const eR = Math.floor(lerp(eBase.r, t > 0.5 ? 20 : 45, hk));
          const eG = Math.floor(lerp(eBase.g, t > 0.5 ? 184 : 212, hk));
          const eB = Math.floor(lerp(eBase.b, t > 0.5 ? 166 : 191, hk));
          const goldColor = `rgba(${eR},${eG},${eB},${alpha * (t > 0.5 ? 1 : 0.88)})`;
          const ashColor  = t > 0.5 ? `rgba(100,90,80,${alpha * 0.6})` : `rgba(235,225,208,${alpha * 0.62})`;
          
          ctx.fillStyle = e.gold ? goldColor : ashColor;
          ctx.beginPath();
          ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [targetHealth]); // PERF-04: Removed isLightMode and inTransit — read via refs

  // --- INTERACTION HANDLERS ---
  const handleTextPointerDown = (e) => {
    if (inTransit || currentView !== 'main') return;

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

    // BUG-06: Block pressing during double-tap cooldown
    if (doubleTapCooldown.current) return;

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

  // --- YAQEEN FROM TASKS ---
  const rewardedTasksRef = useRef(new Set());
  useEffect(() => {
    const TASK_TARGETS = { istighfar: 100, subhanallah: 33, alhamdulillah: 33, allahu_akbar: 34 };
    const tasks = devotionData.dailyTasks || {};
    Object.keys(TASK_TARGETS).forEach(id => {
      if ((tasks[id] || 0) >= TASK_TARGETS[id] && !rewardedTasksRef.current.has(id)) {
        rewardedTasksRef.current.add(id);
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

  const activeVerse = verses ? verses[verseIndex] : null;
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

  // UX-07: Ambient mode — cycle dhikr phrases every 30s
  useEffect(() => {
    if (!devotionData.isAmbientEnabled) {
      setAmbientDhikr(null);
      return;
    }
    let idx = 0;
    const show = () => {
      setAmbientDhikr(DHIKR_PHRASES[idx % DHIKR_PHRASES.length]);
      idx++;
      setTimeout(() => setAmbientDhikr(null), 5000); // visible for 5s
    };
    show(); // Show immediately
    const interval = setInterval(show, 30000);
    return () => clearInterval(interval);
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
                   <div className={`font-serif-eng text-xs uppercase tracking-widest animate-pulse ${tTextSub} my-24`} style={{ letterSpacing: '0.2em' }}>Awakening Soul...</div>
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
              <p className={`font-serif-eng text-[9px] uppercase mb-6 transition-colors duration-1000`} style={{ color: accentHex, letterSpacing: '0.2em', marginRight: '-0.2em' }}>{userProfile ? `Seeker • Joined ${userProfile.joinedDate?.slice(0,4)}` : 'Seeker'}</p>

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
                  <span 
                    className={`font-serif-eng uppercase text-[11px] transition-all duration-500 
                      ${isChecking || isCompletedItem ? (isLightMode ? 'text-[#9c7533] font-medium' : 'text-[#d2a24b]') 
                                      : (isLightMode ? 'text-[#4a453d] opacity-70 group-hover:opacity-100' : 'text-[#e4dac8] opacity-60 group-hover:opacity-100')}`}
                    style={{ letterSpacing: '0.1em', marginRight: '-0.1em' }}
                  >
                    {item.label}
                  </span>
                </div>
                
                <div className="relative w-5 h-5 flex items-center justify-center z-10">
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
            onSelectStation={(idx) => { devotionData.goToStation(idx); setVerseIndex(0); }}
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
            <span className={`font-serif-eng text-[10px] uppercase ${tTextSub}`} style={{ letterSpacing: '0.3em', marginRight: '-0.3em' }}>
              {nextStation?.subtitle}
            </span>
          </div>
        </div>
      )}

      <BurhanOverlay 
        isOpen={showBurhanModal}
        burhan={burhanData[devotionData.activeDays % burhanData.length]}
        isLightMode={isLightMode}
        isCompleted={devotionData.dailyTasks?.burhanCompleted}
        isSimpleMode={devotionData.isSimpleMode}
        onComplete={devotionData.completeBurhan}
        onClose={() => setShowBurhanModal(false)}
      />

      <SettingsModal 
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        isLightMode={isLightMode}
        devotionData={devotionData}
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
