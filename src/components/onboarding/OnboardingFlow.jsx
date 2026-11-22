import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BellIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  CompassIcon,
  MapPinIcon,
  MoonIcon,
  SearchIcon,
  SunIcon,
  VolumeOffIcon,
  VolumeOnIcon,
} from '../icons/Icons';
import { CITY_PRESETS } from '../../data/cities';
import { filterCities } from '../../utils/devotionLogic';
import {
  ADHAN_CHIME_PROFILES,
  DEFAULT_ADHAN_CHIME_PROFILE,
} from '../../utils/adhanChimeLogic';
import {
  CURATED_POPULAR_CITY_IDS,
  DEMO_ANCHOR_CATEGORIES,
  ONBOARDING_GOALS,
  ONBOARDING_STEPS,
  REMINDER_LEAD_OPTIONS,
  buildOnboardingDemoContent,
  buildPersonalizedSolutions,
  buildSanctuaryCharter,
  getAnchorsByCategory,
  getGoalById,
  getOnboardingProgress,
  getStrugglesForGoal,
  sanitizeStruggleIdsForGoal,
} from '../../utils/onboardingLogic';
import {
  hapticCelebrate,
  hapticDetent,
  hapticDismiss,
  hapticNavigate,
  hapticSuccess,
  hapticTaskComplete,
  hapticToggle,
} from '../../utils/haptics';
import { playTaskTickOffCue } from '../../utils/tactileAudio';
import { SanctuaryCharterCard } from './SanctuaryCharterCard';
import welcomeSanctuaryImg from '../../assets/images/onboarding_welcome_sanctuary_1795261537976.jpg';
import solarSkyImg from '../../assets/images/onboarding_solar_sky_1795261538174.jpg';
import planCrestImg from '../../assets/images/onboarding_plan_crest_1795261558677.jpg';

const PROCESSING_MESSAGES = [
  'Setting your prayer times…',
  'Saving your Adhan sound…',
  'Building your daily plan…',
];

function formatShortTime(dateObj) {
  if (!(dateObj instanceof Date) || Number.isNaN(dateObj.getTime())) return '—';
  return dateObj.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export const OnboardingFlow = ({
  isOpen,
  isReplay = false,
  isLightMode,
  setIsLightMode,
  accentHex,
  stations,
  devotionData,
  prayerTimes,
  notifications,
  initialRecord = null,
  onComplete,
  onSkip,
}) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState('next');

  // Questionnaire & personalization answers
  const [selectedGoalId, setSelectedGoalId] = useState(
    () => initialRecord?.goalId || 'guard_prayers'
  );
  const [selectedStruggleIds, setSelectedStruggleIds] = useState(
    () => (Array.isArray(initialRecord?.struggleIds) ? initialRecord.struggleIds : [])
  );
  const [nameInput, setNameInput] = useState(() => {
    const existing = String(devotionData?.profile?.name || '').trim();
    return existing && existing.toLowerCase() !== 'seeker' ? existing : '';
  });
  const [chimeProfileId, setChimeProfileId] = useState(
    () => devotionData?.notificationChimeProfile || DEFAULT_ADHAN_CHIME_PROFILE
  );
  const [cityQuery, setCityQuery] = useState('');
  const [gpsStatus, setGpsStatus] = useState(null);
  const [selectedVerseId, setSelectedVerseId] = useState(
    () => initialRecord?.selectedVerseId || null
  );
  const [selectedAnchorIds, setSelectedAnchorIds] = useState(
    () => (Array.isArray(initialRecord?.selectedAnchorIds) ? initialRecord.selectedAnchorIds : [])
  );
  const [anchorCategory, setAnchorCategory] = useState('recommended');
  const [leadMinutes, setLeadMinutes] = useState(
    () => devotionData?.notificationLeadMinutes ?? 10
  );
  const [processingLineIndex, setProcessingLineIndex] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);

  const stepId = ONBOARDING_STEPS[stepIndex] || 'welcome';
  const progressPct = getOnboardingProgress(stepIndex);

  const activeGoal = useMemo(() => getGoalById(selectedGoalId), [selectedGoalId]);
  const activeGoalStruggles = useMemo(
    () => getStrugglesForGoal(selectedGoalId),
    [selectedGoalId]
  );
  const personalizedSolutions = useMemo(
    () => buildPersonalizedSolutions(selectedStruggleIds, selectedGoalId),
    [selectedStruggleIds, selectedGoalId]
  );
  const demoContent = useMemo(
    () => buildOnboardingDemoContent(selectedGoalId, stations),
    [selectedGoalId, stations]
  );
  const visibleAnchors = useMemo(
    () => getAnchorsByCategory(anchorCategory, selectedGoalId),
    [anchorCategory, selectedGoalId]
  );

  const activeDemoVerse = useMemo(() => {
    if (!selectedVerseId) return null;
    return (
      demoContent.verses.find((v) => v.id === selectedVerseId) ||
      stations.flatMap((s) => s.verses || []).find((v) => v.id === selectedVerseId) ||
      null
    );
  }, [selectedVerseId, demoContent.verses, stations]);

  const popularCities = useMemo(() => {
    const byId = new Map(CITY_PRESETS.map((c) => [c.id, c]));
    return CURATED_POPULAR_CITY_IDS.map((id) => byId.get(id)).filter(Boolean);
  }, []);

  const filteredCities = useMemo(() => {
    const q = cityQuery.trim();
    if (!q) return [];
    return filterCities(CITY_PRESETS, q).slice(0, 4);
  }, [cityQuery]);

  const activeCityLabel = prayerTimes?.hasLocation ? prayerTimes.cityLabel : null;

  const charter = useMemo(
    () =>
      buildSanctuaryCharter({
        name: nameInput || 'Seeker',
        goalId: selectedGoalId,
        struggleIds: selectedStruggleIds,
        selectedVerse: activeDemoVerse || demoContent.verses[0] || null,
        selectedAnchorIds,
        cityLabel: activeCityLabel,
        chimeProfileId,
        leadMinutes,
        isLightMode,
      }),
    [
      nameInput,
      selectedGoalId,
      selectedStruggleIds,
      activeDemoVerse,
      demoContent.verses,
      selectedAnchorIds,
      activeCityLabel,
      chimeProfileId,
      leadMinutes,
      isLightMode,
    ]
  );

  const goToStep = useCallback((nextIdx, dir = 'next') => {
    const clamped = Math.min(ONBOARDING_STEPS.length - 1, Math.max(0, nextIdx));
    setDirection(dir);
    setStepIndex(clamped);
  }, []);

  const handleNext = useCallback(() => {
    hapticNavigate();
    goToStep(stepIndex + 1, 'next');
  }, [goToStep, stepIndex]);

  const handleBack = useCallback(() => {
    if (stepIndex <= 0) return;
    hapticDetent();
    const prevIdx = ONBOARDING_STEPS[stepIndex - 1] === 'processing' ? stepIndex - 2 : stepIndex - 1;
    goToStep(Math.max(0, prevIdx), 'prev');
  }, [goToStep, stepIndex]);

  // Processing auto-advance timer (respects prefers-reduced-motion)
  useEffect(() => {
    if (!isOpen || stepId !== 'processing') return undefined;
    setProcessingLineIndex(0);

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      const quick = setTimeout(() => {
        goToStep(ONBOARDING_STEPS.indexOf('charter'), 'next');
      }, 260);
      return () => clearTimeout(quick);
    }

    const t1 = setTimeout(() => setProcessingLineIndex(1), 580);
    const t2 = setTimeout(() => setProcessingLineIndex(2), 1160);
    const t3 = setTimeout(() => {
      hapticSuccess();
      goToStep(ONBOARDING_STEPS.indexOf('charter'), 'next');
    }, 1780);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isOpen, stepId, goToStep]);

  // Escape closes when replaying from Settings
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKey = (e) => {
      if (e.key === 'Escape' && isReplay) {
        hapticDismiss();
        onSkip?.();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, isReplay, onSkip]);

  if (!isOpen) return null;

  const tMain = isLightMode ? 'text-[#181510]' : 'text-[#f8f3e8]';
  const tSub = isLightMode ? 'text-[#3c3429]' : 'text-[rgba(235,226,208,0.88)]';
  const tMuted = isLightMode ? 'text-[#5b5143]' : 'text-[rgba(218,208,188,0.72)]';

  const cardBase = isLightMode
    ? 'bg-white/94 border-[#1a1814]/14 shadow-[0_8px_22px_-14px_rgba(28,22,14,0.14)] hover:bg-white hover:border-[#9c7533]/50 backdrop-blur-md'
    : 'bg-[#111728]/86 border-white/16 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_28px_-16px_rgba(0,0,0,0.65)] hover:bg-[#161e33]/92 hover:border-[#d2a24b]/50 backdrop-blur-md';
  const cardSelected = isLightMode
    ? 'bg-[#fdf7e8] border-[#9c7533] shadow-[0_12px_28px_-12px_rgba(156,117,51,0.34)] ring-1 ring-[#9c7533]/35 backdrop-blur-md'
    : 'bg-[#211b11]/94 border-[#e0b35a] shadow-[inset_0_1px_0_rgba(240,208,136,0.22),0_14px_34px_-12px_rgba(210,162,75,0.42)] ring-1 ring-[#e0b35a]/45 backdrop-blur-md';

  const primaryBtnClass = isLightMode
    ? 'bg-[#8f6722] text-[#fdfbf7] hover:bg-[#7b5619] active:scale-[0.985] shadow-[0_12px_28px_-10px_rgba(125,88,27,0.52)]'
    : 'bg-[#dfb155] text-[#141008] hover:bg-[#eac068] active:scale-[0.985] shadow-[0_14px_34px_-10px_rgba(223,177,85,0.44)]';

  const handleSelectGoal = (goalId) => {
    hapticDetent();
    setSelectedGoalId(goalId);
    setSelectedStruggleIds((prev) => sanitizeStruggleIdsForGoal(prev, goalId));
  };

  const toggleStruggle = (id) => {
    hapticDetent();
    setSelectedStruggleIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectDemoVerse = (verseId) => {
    hapticTaskComplete();
    playTaskTickOffCue({ kind: 'task' });
    setSelectedVerseId(verseId);
  };

  const handleToggleDemoAnchor = (anchorId) => {
    setSelectedAnchorIds((prev) => {
      if (prev.includes(anchorId)) {
        hapticDetent();
        return prev.filter((id) => id !== anchorId);
      }
      if (prev.length >= 2) {
        hapticTaskComplete();
        playTaskTickOffCue({ kind: 'task' });
        return [prev[1], anchorId];
      }
      hapticTaskComplete();
      playTaskTickOffCue({ kind: 'task' });
      return [...prev, anchorId];
    });
  };

  const handleUseGps = async () => {
    hapticNavigate();
    setGpsStatus('detecting');
    try {
      const res = await prayerTimes?.requestLocation?.();
      if (res && res.ok === false) {
        setGpsStatus('error');
        return;
      }
      setGpsStatus(null);
      hapticSuccess();
    } catch {
      setGpsStatus('error');
    }
  };

  const handlePickCity = (city) => {
    hapticTaskComplete();
    playTaskTickOffCue({ kind: 'task' });
    prayerTimes?.selectCity?.(city);
    setCityQuery('');
    setGpsStatus(null);
  };

  const handleFinish = async (enableReminders) => {
    if (isFinishing) return;
    setIsFinishing(true);
    hapticCelebrate();
    try {
      const chosenVerse = activeDemoVerse || demoContent.verses[0] || null;
      const chosenAnchors = charter.anchors.map((a) => a.label);
      await onComplete?.({
        name: (nameInput || '').trim() || 'Seeker',
        goalId: selectedGoalId,
        struggleIds: selectedStruggleIds,
        chimeProfileId,
        leadMinutes,
        enableReminders: Boolean(enableReminders),
        selectedVerseId: chosenVerse?.id || null,
        selectedAnchorIds,
        selectedAnchorLabels: chosenAnchors,
        dailyIntention: activeGoal.recommendedIntention,
      });
    } finally {
      setIsFinishing(false);
    }
  };

  const isVerseReady = Boolean(activeDemoVerse);
  const isAnchorsReady = selectedAnchorIds.length === 2;
  const anchorsRemaining = Math.max(0, 2 - selectedAnchorIds.length);

  const animClass =
    direction === 'prev' ? 'animate-lesson-stage-prev' : 'animate-lesson-stage-next';

  const solarTimes = prayerTimes?.prayerData?.times || null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Ruh Onboarding"
      data-testid="onboarding-flow"
      data-onboarding-step={stepId}
      className="fixed inset-0 z-[130] h-[100dvh] w-full flex flex-col justify-between overflow-hidden pointer-events-auto select-none"
    >
      {/* Calm atmospheric scrim over live PaintedClouds canvas */}
      <div
        className="absolute inset-0 pointer-events-none transition-colors duration-300"
        style={{
          background: isLightMode
            ? 'linear-gradient(180deg, rgba(247,242,233,0.74) 0%, rgba(247,242,233,0.54) 48%, rgba(243,237,225,0.84) 100%)'
            : 'linear-gradient(180deg, rgba(7,10,19,0.72) 0%, rgba(8,11,22,0.56) 50%, rgba(6,8,16,0.86) 100%)',
        }}
      />

      {/* Compact Top Bar */}
      <div
        className="relative z-10 w-full max-w-2xl mx-auto px-5 sm:px-8 shrink-0"
        style={{ paddingTop: 'calc(10px + var(--sat))' }}
      >
        <div className="flex items-center justify-between gap-3 h-[44px]">
          <div className="w-14 flex items-center justify-start">
            {stepIndex > 0 && stepId !== 'processing' ? (
              <button
                type="button"
                data-testid="onboarding-back-btn"
                aria-label="Go back"
                onClick={handleBack}
                className={`w-11 h-11 -ml-2 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                  isLightMode
                    ? 'text-[#2c2720] hover:bg-black/6'
                    : 'text-[#f5eee0]/90 hover:bg-white/10'
                }`}
              >
                <ChevronLeftIcon size={20} />
              </button>
            ) : (
              <span className="w-11 h-11" aria-hidden="true" />
            )}
          </div>

          <div
            role="progressbar"
            aria-label="Onboarding progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progressPct}
            className={`flex-1 max-w-[260px] h-[4px] rounded-full overflow-hidden ${
              isLightMode ? 'bg-black/12' : 'bg-white/16'
            }`}
          >
            <div
              className="h-full rounded-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{
                width: `${Math.max(8, progressPct)}%`,
                backgroundColor: accentHex,
              }}
            />
          </div>

          <div className="w-14 flex items-center justify-end">
            {stepId !== 'processing' && (
              <button
                type="button"
                data-testid="onboarding-skip-btn"
                onClick={() => {
                  hapticDismiss();
                  onSkip?.();
                }}
                className={`min-h-[44px] px-1.5 font-serif-eng text-xs uppercase tracking-[0.16em] transition-opacity opacity-75 hover:opacity-100 cursor-pointer ${tSub}`}
              >
                {isReplay ? 'Close' : 'Skip'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Zero-Scroll Single-Screen Stage */}
      <div
        data-testid="onboarding-stage"
        className="relative z-10 flex-1 min-h-0 w-full overflow-hidden flex items-center justify-center"
      >
        <div
          key={stepId}
          className={`w-full max-w-2xl mx-auto px-5 sm:px-8 py-2 flex flex-col justify-center ${animClass}`}
        >
          {/* SCREEN 1: WELCOME */}
          {stepId === 'welcome' && (
            <div className="flex flex-col items-center text-center gap-4 sm:gap-5">
              {/* High-craft Architectural Courtyard Artwork */}
              <div
                className={`w-full max-w-[520px] h-[196px] sm:h-[264px] rounded-[24px] overflow-hidden border shadow-[0_24px_56px_-14px_rgba(0,0,0,0.52)] relative ${
                  isLightMode ? 'border-[#9c7533]/32' : 'border-[#d2a24b]/34'
                }`}
              >
                <img
                  src={welcomeSanctuaryImg}
                  alt="Quiet courtyard arch opening to a twilight sky and crescent moon"
                  className="w-full h-full object-cover scale-[1.09]"
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(8,11,20,0.05) 0%, rgba(8,11,20,0.28) 100%)',
                  }}
                />
              </div>

              <div className="flex flex-col items-center gap-2 max-w-lg">
                <span
                  className="font-calligraphy text-4xl sm:text-5xl leading-none"
                  style={{ color: accentHex }}
                  dir="rtl"
                >
                  رُوح
                </span>
                <h1 className={`font-serif-eng text-[30px] sm:text-[42px] font-semibold leading-[1.12] tracking-[-0.015em] [text-wrap:balance] ${tMain}`}>
                  Pray on time. Feel calm every day.
                </h1>
                <p className={`font-serif-eng text-base sm:text-[18px] leading-relaxed ${tSub}`}>
                  Accurate prayer times, soft chimes, and one short verse a day. Private and
                  ad-free.
                </p>
              </div>
            </div>
          )}

          {/* SCREEN 2: GOAL (STEP 1) */}
          {stepId === 'goal' && (
            <div className="flex flex-col gap-4 sm:gap-5">
              <div className="flex flex-col gap-1.5">
                <p
                  className="font-serif-eng text-xs font-medium tracking-[0.14em]"
                  style={{ color: accentHex }}
                >
                  Step 1 · Your Main Goal
                </p>
                <h1 className={`font-serif-eng text-[26px] sm:text-[36px] font-semibold leading-[1.14] tracking-[-0.015em] [text-wrap:balance] ${tMain}`}>
                  What do you want help with most?
                </h1>
                <p className={`font-serif-eng text-[15px] sm:text-[17px] leading-snug ${tSub}`}>
                  Pick one focus. The next steps will adapt to it.
                </p>
              </div>

              <div className="flex flex-col gap-2.5 sm:gap-3" role="radiogroup" aria-label="Main goal">
                {ONBOARDING_GOALS.map((goal) => {
                  const selected = selectedGoalId === goal.id;
                  return (
                    <button
                      key={goal.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      data-testid={`onboarding-goal-${goal.id}`}
                      onClick={() => handleSelectGoal(goal.id)}
                      className={`w-full min-h-[68px] sm:min-h-[76px] text-left px-4 py-3 sm:px-5 sm:py-4 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3.5 cursor-pointer ${
                        selected ? cardSelected : cardBase
                      }`}
                    >
                      <span
                        className={`w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
                          selected
                            ? isLightMode
                              ? 'bg-[#8f6722] border-[#8f6722] text-white'
                              : 'bg-[#dfb155] border-[#dfb155] text-[#141008]'
                            : isLightMode
                              ? 'border-[#1a1814]/26'
                              : 'border-white/28'
                        }`}
                        aria-hidden="true"
                      >
                        {selected && (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path
                              d="M2.4 6.2L4.9 8.7L9.6 3.5"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className={`font-serif-eng text-[16px] sm:text-[18px] font-semibold block leading-snug ${tMain}`}>
                          {goal.title}
                        </span>
                        <span className={`font-serif-eng text-[13px] sm:text-[14px] block mt-0.5 leading-snug ${tMuted}`}>
                          {goal.subtitle}
                        </span>
                      </div>
                      <span
                        className={`font-calligraphy text-xl sm:text-2xl shrink-0 transition-all duration-200 ${
                          selected ? 'opacity-100' : `${tSub} opacity-80`
                        }`}
                        style={{ color: selected ? accentHex : undefined }}
                        dir="rtl"
                      >
                        {goal.arabic}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* SCREEN 3: GOAL-TAILORED DAILY CHALLENGES (STEP 2) */}
          {stepId === 'struggles' && (
            <div className="flex flex-col gap-4 sm:gap-5">
              <div className="flex flex-col gap-1.5">
                <p
                  className="font-serif-eng text-xs font-medium tracking-[0.12em] flex items-center gap-2 flex-wrap"
                  style={{ color: accentHex }}
                >
                  <span>Step 2 · Tailored to your goal</span>
                  <span aria-hidden="true" className="opacity-55">·</span>
                  <span className="opacity-90">{activeGoal.title}</span>
                </p>
                <h1 className={`font-serif-eng text-[26px] sm:text-[36px] font-semibold leading-[1.14] tracking-[-0.015em] [text-wrap:balance] ${tMain}`}>
                  What makes {activeGoal.strugglePrompt} hard right now?
                </h1>
                <p className={`font-serif-eng text-[15px] sm:text-[17px] leading-snug ${tSub}`}>
                  Pick all that feel true for you.
                </p>
              </div>

              <div className="flex flex-col gap-2.5 sm:gap-3" data-testid="onboarding-struggles-list">
                {activeGoalStruggles.map((item) => {
                  const selected = selectedStruggleIds.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      aria-pressed={selected}
                      data-testid={`onboarding-struggle-${item.id}`}
                      onClick={() => toggleStruggle(item.id)}
                      className={`w-full min-h-[66px] sm:min-h-[74px] text-left px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl border transition-all duration-200 flex items-center gap-3.5 cursor-pointer ${
                        selected ? cardSelected : cardBase
                      }`}
                    >
                      <span
                        className={`w-[22px] h-[22px] rounded-lg border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
                          selected
                            ? isLightMode
                              ? 'bg-[#8f6722] border-[#8f6722] text-white'
                              : 'bg-[#dfb155] border-[#dfb155] text-[#141008]'
                            : isLightMode
                              ? 'border-[#1a1814]/26'
                              : 'border-white/28'
                        }`}
                        aria-hidden="true"
                      >
                        {selected && (
                          <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
                            <path
                              d="M2.2 6.2L4.9 8.9L9.8 3.4"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className={`font-serif-eng text-[15px] sm:text-[17px] font-semibold block leading-snug ${tMain}`}>
                          {item.label}
                        </span>
                        {item.hint && (
                          <span className={`font-serif-eng text-[12.5px] sm:text-[13.5px] block mt-0.5 leading-snug ${tMuted}`}>
                            {item.hint}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* SCREEN 4: SOLUTION BRIDGE */}
          {stepId === 'solution' && (
            <div className="flex flex-col gap-4 sm:gap-5">
              <div className="flex flex-col gap-1.5">
                <p
                  className="font-serif-eng text-xs font-medium tracking-[0.12em] flex items-center gap-2 flex-wrap"
                  style={{ color: accentHex }}
                >
                  <span>How Ruh Helps</span>
                  <span aria-hidden="true" className="opacity-55">·</span>
                  <span className="opacity-90">{activeGoal.title}</span>
                </p>
                <h1 className={`font-serif-eng text-[26px] sm:text-[36px] font-semibold leading-[1.14] tracking-[-0.015em] [text-wrap:balance] ${tMain}`}>
                  Simple tools built for your day
                </h1>
                <p className={`font-serif-eng text-[15px] sm:text-[17px] leading-snug ${tSub}`}>
                  Here is how Ruh solves what you just shared.
                </p>
              </div>

              <div className="flex flex-col gap-2.5 sm:gap-3" data-testid="onboarding-solution-list">
                {personalizedSolutions.map((item, idx) => (
                  <div
                    key={item.id}
                    data-testid={`onboarding-solution-${item.id}`}
                    className={`w-full rounded-2xl border px-4 py-3.5 sm:px-5 sm:py-4 flex items-start gap-3.5 ${cardBase}`}
                  >
                    <span
                      className="font-serif-eng text-sm sm:text-base font-semibold tabular-nums pt-0.5 shrink-0"
                      style={{ color: accentHex }}
                    >
                      0{idx + 1}
                    </span>
                    <div className="min-w-0 flex-1 flex flex-col gap-1">
                      <div className="flex items-baseline justify-between gap-2 flex-wrap">
                        <h2 className={`font-serif-eng text-[16px] sm:text-[18px] font-semibold leading-snug ${tMain}`}>
                          {item.solutionTitle}
                        </h2>
                        <span
                          className="font-serif-eng text-[11px] font-medium tracking-[0.12em] shrink-0"
                          style={{ color: accentHex }}
                        >
                          {item.ruhFeature}
                        </span>
                      </div>
                      <p className={`font-serif-eng text-[13.5px] sm:text-[15px] leading-snug ${tSub}`}>
                        {item.solutionDetail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SCREEN 5: PERSONALIZE (NAME + THEME + CHIME) */}
          {stepId === 'personalize' && (
            <div className="flex flex-col gap-3.5 sm:gap-4">
              <div className="flex flex-col gap-1">
                <p
                  className="font-serif-eng text-[10.5px] uppercase tracking-[0.22em]"
                  style={{ color: accentHex }}
                >
                  Step 3 · Style &amp; Sound
                </p>
                <h1 className={`font-serif-eng text-2xl sm:text-[34px] font-medium leading-tight ${tMain}`}>
                  Make Ruh feel like yours
                </h1>
              </div>

              {/* Name Input */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="onboarding-seeker-name"
                  className={`font-serif-eng text-[11px] uppercase tracking-[0.18em] ${tSub}`}
                >
                  Your Name <span className="opacity-60">(optional)</span>
                </label>
                <input
                  id="onboarding-seeker-name"
                  data-testid="onboarding-name-input"
                  type="text"
                  maxLength={36}
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Enter your first name"
                  className={`w-full h-[46px] px-4 rounded-xl border font-serif-eng text-base outline-none transition-colors ${
                    isLightMode
                      ? 'bg-white/88 border-black/15 text-[#1a1814] placeholder:text-[#6f6659] focus:border-[#8f6722]'
                      : 'bg-[#0e1320]/84 border-white/15 text-[#f5eee0] placeholder:text-[#a89f8f] focus:border-[#d2a24b]'
                  }`}
                />
              </div>

              {/* Theme Toggle */}
              <div className="flex flex-col gap-1.5">
                <span className={`font-serif-eng text-[11px] uppercase tracking-[0.18em] ${tSub}`}>
                  Theme
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    data-testid="onboarding-theme-night"
                    aria-pressed={!isLightMode}
                    onClick={() => {
                      hapticToggle(false);
                      setIsLightMode?.(false);
                    }}
                    className={`min-h-[46px] px-3 py-2 rounded-xl border flex items-center justify-center gap-2 font-serif-eng text-sm font-medium transition-all cursor-pointer ${
                      !isLightMode ? cardSelected : cardBase
                    } ${tMain}`}
                  >
                    <MoonIcon size={16} style={{ color: !isLightMode ? accentHex : undefined }} />
                    <span>Night</span>
                  </button>
                  <button
                    type="button"
                    data-testid="onboarding-theme-daylight"
                    aria-pressed={isLightMode}
                    onClick={() => {
                      hapticToggle(true);
                      setIsLightMode?.(true);
                    }}
                    className={`min-h-[46px] px-3 py-2 rounded-xl border flex items-center justify-center gap-2 font-serif-eng text-sm font-medium transition-all cursor-pointer ${
                      isLightMode ? cardSelected : cardBase
                    } ${tMain}`}
                  >
                    <SunIcon size={16} style={{ color: isLightMode ? accentHex : undefined }} />
                    <span>Daylight</span>
                  </button>
                </div>
              </div>

              {/* Adhan Voice & Sound Grid */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className={`font-serif-eng text-[11px] uppercase tracking-[0.18em] ${tSub}`}>
                    Adhan Sound
                  </span>
                  <span className={`font-serif-eng text-xs ${tMuted}`}>
                    {notifications?.playingChimeProfileId ? 'Tap again to stop' : 'Tap to hear'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {ADHAN_CHIME_PROFILES.map((profile) => {
                    const selected = chimeProfileId === profile.id;
                    const isPlaying = notifications?.playingChimeProfileId === profile.id;
                    return (
                      <button
                        key={profile.id}
                        type="button"
                        aria-pressed={selected}
                        data-testid={`onboarding-chime-${profile.id}`}
                        onClick={() => {
                          hapticDetent();
                          setChimeProfileId(profile.id);
                          if (profile.id === 'silent' || isPlaying) {
                            notifications?.stopAdhanChimePreview?.();
                          } else {
                            notifications?.previewAdhanChime?.(profile.id, { prayerId: 'maghrib' });
                          }
                        }}
                        className={`min-h-[54px] rounded-xl border px-3 py-2 text-left flex items-center justify-between gap-2 transition-all cursor-pointer ${
                          selected ? cardSelected : cardBase
                        }`}
                      >
                        <div className="min-w-0">
                          <span className={`font-serif-eng text-sm font-medium block truncate ${tMain}`}>
                            {profile.label}
                          </span>
                          <span className={`font-serif-eng text-[11px] block truncate ${tMuted}`}>
                            {isPlaying
                              ? 'Playing…'
                              : profile.id === 'silent'
                                ? 'Visual only'
                                : profile.arabic}
                          </span>
                        </div>
                        {profile.id !== 'silent' ? (
                          <VolumeOnIcon
                            size={15}
                            className={`shrink-0 ${selected || isPlaying ? '' : tMuted}`}
                            style={{ color: selected || isPlaying ? accentHex : undefined, opacity: selected || isPlaying ? 1 : 0.72 }}
                          />
                        ) : (
                          <VolumeOffIcon size={15} className={`shrink-0 opacity-60 ${tMuted}`} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 6: SOLAR LOCATION */}
          {stepId === 'location' && (
            <div className="flex flex-col gap-3 sm:gap-3.5">
              {/* High-craft Solar Horizon Illustration */}
              <div
                className={`w-full h-[96px] sm:h-[126px] rounded-[18px] overflow-hidden border relative ${
                  isLightMode ? 'border-[#9c7533]/25' : 'border-[#d2a24b]/25'
                }`}
              >
                <img
                  src={solarSkyImg}
                  alt="Golden sun arc and compass over soft dawn clouds"
                  className="w-full h-full object-cover scale-[1.09]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <h1 className={`font-serif-eng text-2xl sm:text-[32px] font-medium leading-tight ${tMain}`}>
                  Set your city for exact times
                </h1>
                <p className={`font-serif-eng text-xs sm:text-sm ${tSub}`}>
                  Used for prayer times, Qibla direction, and sky colors. Stays on your device.
                </p>
              </div>

              {/* Compact Confirmed Live Times Bar OR Current Location Button */}
              {prayerTimes?.hasLocation ? (
                <div
                  data-testid="onboarding-location-confirmed"
                  className={`w-full rounded-xl border px-3.5 py-2.5 flex flex-col gap-1.5 ${cardSelected}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <CompassIcon size={15} style={{ color: accentHex }} className="shrink-0" />
                      <div className="min-w-0">
                        <span className={`font-serif-eng text-sm font-medium block truncate ${tMain}`}>
                          {prayerTimes.localityLabel || prayerTimes.cityLabel}
                        </span>
                        {prayerTimes.locationSubtitle && (
                          <span className={`font-serif-eng text-[11px] block truncate ${tMuted}`}>
                            {prayerTimes.locationSubtitle}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      data-testid="onboarding-gps-btn"
                      onClick={handleUseGps}
                      disabled={gpsStatus === 'detecting' || prayerTimes?.localityResolving}
                      className="font-serif-eng text-[10px] uppercase tracking-[0.14em] shrink-0 cursor-pointer hover:opacity-100 opacity-90"
                      style={{ color: accentHex }}
                    >
                      {gpsStatus === 'detecting' || prayerTimes?.localityResolving
                        ? 'Locating…'
                        : 'Use GPS'}
                    </button>
                  </div>
                  {solarTimes && (
                    <div className="grid grid-cols-5 gap-1 text-center">
                      {['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].map((pid) => (
                        <div key={pid} className="flex flex-col">
                          <span className={`font-serif-eng text-[9px] uppercase tracking-[0.1em] ${tMuted}`}>
                            {pid}
                          </span>
                          <span className={`font-serif-eng text-[11px] sm:text-xs font-medium ${tMain}`}>
                            {formatShortTime(solarTimes[pid])}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  data-testid="onboarding-gps-btn"
                  onClick={handleUseGps}
                  disabled={gpsStatus === 'detecting' || prayerTimes?.localityResolving}
                  className={`w-full min-h-[44px] px-4 py-2 rounded-xl border flex items-center justify-center gap-2 font-serif-eng text-xs uppercase tracking-[0.14em] transition-colors cursor-pointer ${
                    isLightMode
                      ? 'bg-white/85 border-[#9c7533]/35 text-[#7c5a1e] hover:bg-[#fbf4e4]'
                      : 'bg-[#121624]/85 border-[#d2a24b]/35 text-[#e6c478] hover:bg-[#1c202e]'
                  }`}
                >
                  <MapPinIcon size={15} />
                  <span>
                    {gpsStatus === 'detecting'
                      ? 'Getting GPS location…'
                      : prayerTimes?.localityResolving
                        ? 'Finding your locality…'
                        : 'Use My Current Location'}
                  </span>
                </button>
              )}

              {(gpsStatus === 'error' || prayerTimes?.locationError) && (
                <p className={`font-serif-eng text-xs ${tMuted}`} role="status">
                  {prayerTimes?.locationError || 'Location was not allowed. Pick a city below.'}
                </p>
              )}

              {/* Search + Compact 6-City Quick Pick */}
              <div className="relative">
                <SearchIcon
                  size={15}
                  className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${tMuted}`}
                />
                <input
                  type="search"
                  aria-label="Search city"
                  data-testid="onboarding-city-search"
                  value={cityQuery}
                  onChange={(e) => setCityQuery(e.target.value)}
                  placeholder="Search your city (London, Makkah, Toronto…)"
                  className={`w-full h-[42px] pl-10 pr-3.5 rounded-xl border font-serif-eng text-sm outline-none transition-colors ${
                    isLightMode
                      ? 'bg-white/86 border-black/14 text-[#1a1814] placeholder:text-[#6f6659] focus:border-[#8f6722]'
                      : 'bg-[#0e1320]/80 border-white/14 text-[#f5eee0] placeholder:text-[#a89f8f] focus:border-[#d2a24b]'
                  }`}
                />
              </div>

              {cityQuery.trim() ? (
                <div className="grid grid-cols-2 gap-2">
                  {filteredCities.length > 0 ? (
                    filteredCities.map((city) => {
                      const isPicked =
                        prayerTimes?.hasLocation && prayerTimes.cityLabel === city.name;
                      return (
                        <button
                          key={city.id}
                          type="button"
                          data-testid={`onboarding-city-${city.id}`}
                          onClick={() => handlePickCity(city)}
                          className={`min-h-[44px] px-3 py-2 rounded-xl border text-left flex flex-col justify-center transition-all cursor-pointer ${
                            isPicked ? cardSelected : cardBase
                          }`}
                        >
                          <span className={`font-serif-eng text-sm font-medium leading-tight truncate ${tMain}`}>
                            {city.name}
                          </span>
                          <span className={`font-serif-eng text-[11px] leading-tight truncate ${tMuted}`}>
                            {city.country}
                          </span>
                        </button>
                      );
                    })
                  ) : (
                    <p className={`col-span-2 font-serif-eng text-xs py-1 ${tMuted}`}>
                      No matching city found. Try another spelling.
                    </p>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {popularCities.map((city) => {
                    const isPicked =
                      prayerTimes?.hasLocation && prayerTimes.cityLabel === city.name;
                    return (
                      <button
                        key={city.id}
                        type="button"
                        data-testid={`onboarding-city-${city.id}`}
                        onClick={() => handlePickCity(city)}
                        className={`min-h-[44px] px-2.5 py-2 rounded-xl border text-left flex flex-col justify-center transition-all cursor-pointer ${
                          isPicked ? cardSelected : cardBase
                        }`}
                      >
                        <span className={`font-serif-eng text-xs sm:text-sm font-medium leading-tight truncate ${tMain}`}>
                          {city.name}
                        </span>
                        <span className={`font-serif-eng text-[10.5px] leading-tight truncate ${tMuted}`}>
                          {city.country}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* SCREEN 7A: INTERACTIVE DEMO PART 1 — PICK 1 VERSE */}
          {stepId === 'demo_verse' && (
            <div className="flex flex-col gap-3.5 sm:gap-4">
              <div className="flex flex-col gap-1">
                <p
                  className="font-serif-eng text-[10.5px] uppercase tracking-[0.22em]"
                  style={{ color: accentHex }}
                >
                  Try Ruh · 1 of 2
                </p>
                <h1 className={`font-serif-eng text-2xl sm:text-[34px] font-medium leading-tight ${tMain}`}>
                  Pick your first saved verse
                </h1>
                <p className={`font-serif-eng text-sm sm:text-base ${tSub}`}>
                  Tap one verse to save it to your collection today.
                </p>
              </div>

              <div className="flex flex-col gap-2.5">
                {demoContent.verses.map((verse) => {
                  const selected = activeDemoVerse?.id === verse.id;
                  return (
                    <button
                      key={verse.id}
                      type="button"
                      aria-pressed={selected}
                      data-testid={`onboarding-demo-verse-${verse.id}`}
                      onClick={() => handleSelectDemoVerse(verse.id)}
                      className={`w-full text-left rounded-2xl border px-4 py-3 sm:px-5 sm:py-3.5 flex flex-col gap-1.5 transition-all cursor-pointer ${
                        selected ? cardSelected : cardBase
                      }`}
                    >
                      <p
                        className={`font-arabic text-lg sm:text-2xl leading-[1.65] text-right ${tMain}`}
                        dir="rtl"
                      >
                        {verse.a}
                      </p>
                      <div className="flex items-end justify-between gap-3">
                        <p className={`font-serif-eng text-xs sm:text-sm leading-snug ${tSub}`}>
                          &ldquo;{verse.simpleText}&rdquo;
                        </p>
                        <span
                          className={`font-serif-eng text-[10.5px] uppercase tracking-[0.14em] shrink-0 ${
                            selected ? '' : tMuted
                          }`}
                          style={{ color: selected ? accentHex : undefined }}
                        >
                          {verse.s}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* SCREEN 7B: INTERACTIVE DEMO PART 2 — PICK 2 DAILY HABITS */}
          {stepId === 'demo_anchors' && (
            <div className="flex flex-col gap-3 sm:gap-3.5">
              <div className="flex flex-col gap-1">
                <p
                  className="font-serif-eng text-xs font-medium tracking-[0.14em]"
                  style={{ color: accentHex }}
                >
                  Try Ruh · 2 of 2
                </p>
                <h1 className={`font-serif-eng text-[26px] sm:text-[34px] font-semibold leading-[1.14] tracking-[-0.015em] [text-wrap:balance] ${tMain}`}>
                  Pick 2 simple daily habits
                </h1>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <p className={`font-serif-eng text-[14px] sm:text-[16px] leading-snug ${tSub}`}>
                    We will add these to your Today checklist.
                  </p>
                  <span
                    data-testid="onboarding-anchors-count"
                    className="font-serif-eng text-xs sm:text-sm font-medium tabular-nums shrink-0"
                    style={{ color: accentHex }}
                  >
                    {selectedAnchorIds.length} of 2 picked
                  </span>
                </div>
              </div>

              {/* Clean Segmented Category Tabs */}
              <div
                role="tablist"
                aria-label="Daily habit categories"
                className={`grid grid-cols-5 gap-1 p-1 rounded-xl border ${
                  isLightMode
                    ? 'bg-black/[0.04] border-[#1a1814]/10'
                    : 'bg-[#0b101d]/75 border-white/12'
                }`}
              >
                {DEMO_ANCHOR_CATEGORIES.map((cat) => {
                  const active = anchorCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      data-testid={`onboarding-anchor-tab-${cat.id}`}
                      onClick={() => {
                        hapticDetent();
                        setAnchorCategory(cat.id);
                      }}
                      className={`min-h-[36px] px-1.5 py-1 rounded-lg font-serif-eng text-[12px] sm:text-[13px] font-medium whitespace-nowrap transition-all cursor-pointer ${
                        active
                          ? isLightMode
                            ? 'bg-white text-[#181510] shadow-sm'
                            : 'bg-[#211b11] text-[#f8f3e8] ring-1 ring-[#e0b35a]/45'
                          : isLightMode
                            ? 'text-[#5b5143] hover:text-[#181510]'
                            : 'text-[rgba(218,208,188,0.72)] hover:text-[#f8f3e8]'
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              <div
                data-testid="onboarding-anchors-grid"
                className="grid grid-cols-2 gap-2 sm:gap-2.5"
              >
                {visibleAnchors.map((anchor) => {
                  const selected = selectedAnchorIds.includes(anchor.id);
                  return (
                    <button
                      key={anchor.id}
                      type="button"
                      aria-pressed={selected}
                      data-testid={`onboarding-demo-anchor-${anchor.id}`}
                      onClick={() => handleToggleDemoAnchor(anchor.id)}
                      className={`min-h-[68px] sm:min-h-[72px] text-left rounded-2xl border px-3 py-2.5 sm:px-4 sm:py-3 flex items-start gap-2.5 transition-all cursor-pointer ${
                        selected ? cardSelected : cardBase
                      }`}
                    >
                      <CheckCircleIcon
                        size={17}
                        className={`shrink-0 mt-0.5 transition-opacity ${selected ? '' : tMuted}`}
                        style={{
                          color: selected ? accentHex : undefined,
                          opacity: selected ? 1 : 0.55,
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <span className={`font-serif-eng text-[13.5px] sm:text-[15.5px] font-semibold block leading-snug ${tMain}`}>
                          {anchor.label}
                        </span>
                        <span className={`font-serif-eng text-[11px] sm:text-[12.5px] block mt-0.5 leading-snug line-clamp-1 ${tMuted}`}>
                          {anchor.detail}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* SCREEN 8: PROCESSING */}
          {stepId === 'processing' && (
            <div
              data-testid="onboarding-processing"
              className="flex flex-col items-center justify-center text-center gap-5 py-6"
            >
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg
                  className="absolute inset-0 w-full h-full animate-badge-orbit-cw"
                  viewBox="0 0 120 120"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    cx="60"
                    cy="60"
                    r="56"
                    stroke={accentHex}
                    strokeOpacity="0.38"
                    strokeWidth="1.2"
                    strokeDasharray="4 6"
                  />
                </svg>
                <div className="w-24 h-24 rounded-full overflow-hidden shadow-[0_14px_34px_rgba(0,0,0,0.45)] ring-1 ring-[#d2a24b]/45">
                  <img
                    src={planCrestImg}
                    alt=""
                    className="w-full h-full object-cover scale-[1.39]"
                  />
                </div>
              </div>

              <div className="flex flex-col items-center gap-1.5">
                <h2 className={`font-serif-eng text-2xl sm:text-[28px] font-medium ${tMain}`}>
                  Setting up your plan
                </h2>
                <p
                  role="status"
                  aria-live="polite"
                  className={`font-serif-eng text-base ${tSub}`}
                >
                  {PROCESSING_MESSAGES[processingLineIndex] || PROCESSING_MESSAGES[0]}
                </p>
              </div>
            </div>
          )}

          {/* SCREEN 9: DAILY PLAN REVEAL */}
          {stepId === 'charter' && (
            <div className="flex flex-col gap-3.5 sm:gap-4">
              <div className="flex flex-col gap-1">
                <p
                  className="font-serif-eng text-[10.5px] uppercase tracking-[0.22em]"
                  style={{ color: accentHex }}
                >
                  All Set
                </p>
                <h1 className={`font-serif-eng text-2xl sm:text-[34px] font-medium leading-tight ${tMain}`}>
                  Your daily plan is ready, {charter.seekerName}
                </h1>
              </div>

              <SanctuaryCharterCard
                charter={charter}
                isLightMode={isLightMode}
                accentHex={accentHex}
              />
            </div>
          )}

          {/* SCREEN 10: BENEFIT-PRIMED PRAYER REMINDERS */}
          {stepId === 'reminders' && (
            <div className="flex flex-col gap-3.5 sm:gap-4">
              <div className="flex items-center gap-3.5">
                <div
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden shrink-0 shadow-[0_8px_22px_rgba(0,0,0,0.35)] ring-1 ring-[#d2a24b]/40"
                  aria-hidden="true"
                >
                  <img
                    src={planCrestImg}
                    alt=""
                    className="w-full h-full object-cover scale-[1.39]"
                  />
                </div>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <p
                    className="font-serif-eng text-[10px] uppercase tracking-[0.22em]"
                    style={{ color: accentHex }}
                  >
                    Final Step · Prayer Alerts
                  </p>
                  <h1 className={`font-serif-eng text-2xl sm:text-[32px] font-medium leading-tight ${tMain}`}>
                    Get gentle prayer reminders
                  </h1>
                </div>
              </div>

              <p className={`font-serif-eng text-sm sm:text-base ${tSub}`}>
                Quiet local alerts synced to your city. No spam, ever.
              </p>

              {/* 3 Short Clear Promises */}
              <div className={`w-full rounded-2xl border px-4 py-3.5 flex flex-col gap-3 ${cardBase}`}>
                {[
                  `Plays your ${charter.chimeLabel} softly at prayer time.`,
                  prayerTimes?.hasLocation
                    ? `Updates automatically for ${prayerTimes.cityLabel}.`
                    : 'Updates automatically when you set your city.',
                  'Stays silent once you mark a prayer done.',
                ].map((line) => (
                  <div key={line} className="flex items-center gap-2.5">
                    <BellIcon
                      size={16}
                      className="shrink-0"
                      style={{ color: accentHex }}
                    />
                    <span className={`font-serif-eng text-sm sm:text-[15px] leading-snug ${tMain}`}>
                      {line}
                    </span>
                  </div>
                ))}
              </div>

              {/* Compact Lead Time Picker */}
              <div className="flex flex-col gap-1.5">
                <span className={`font-serif-eng text-[11px] uppercase tracking-[0.18em] ${tSub}`}>
                  Remind me
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {REMINDER_LEAD_OPTIONS.map((opt) => {
                    const selected = leadMinutes === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        aria-pressed={selected}
                        data-testid={`onboarding-lead-${opt.value}`}
                        onClick={() => {
                          hapticDetent();
                          setLeadMinutes(opt.value);
                        }}
                        className={`min-h-[44px] px-2 py-2 rounded-xl border font-serif-eng text-xs sm:text-sm transition-all cursor-pointer ${
                          selected ? cardSelected : cardBase
                        } ${tMain}`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compact Thumb-Zone Footer */}
      {stepId !== 'processing' && (
        <div
          className="relative z-10 w-full max-w-2xl mx-auto px-5 sm:px-8 pt-2 shrink-0"
          style={{ paddingBottom: 'calc(14px + var(--sab))' }}
        >
          {stepId === 'welcome' && (
            <div className="flex flex-col items-center gap-1.5">
              <button
                type="button"
                data-testid="onboarding-cta"
                onClick={handleNext}
                className={`w-full min-h-[54px] px-6 py-3.5 rounded-2xl font-serif-eng text-[16px] sm:text-[17px] font-semibold tracking-[0.02em] transition-all cursor-pointer ${primaryBtnClass}`}
              >
                Get Started
              </button>
              <button
                type="button"
                onClick={() => {
                  hapticDismiss();
                  onSkip?.();
                }}
                className={`min-h-[34px] px-3 font-serif-eng text-xs tracking-[0.1em] opacity-70 hover:opacity-100 transition-opacity cursor-pointer ${tSub}`}
              >
                {isReplay ? 'Return to app' : 'Skip for now'}
              </button>
            </div>
          )}

          {stepId === 'goal' && (
            <button
              type="button"
              data-testid="onboarding-cta"
              onClick={handleNext}
              className={`w-full min-h-[54px] px-6 py-3.5 rounded-2xl font-serif-eng text-[16px] sm:text-[17px] font-semibold tracking-[0.02em] transition-all cursor-pointer ${primaryBtnClass}`}
            >
              Continue
            </button>
          )}

          {stepId === 'struggles' && (
            <button
              type="button"
              data-testid="onboarding-cta"
              onClick={handleNext}
              className={`w-full min-h-[54px] px-6 py-3.5 rounded-2xl font-serif-eng text-[16px] sm:text-[17px] font-semibold tracking-[0.02em] transition-all cursor-pointer ${primaryBtnClass}`}
            >
              {selectedStruggleIds.length > 0
                ? `See How Ruh Helps (${selectedStruggleIds.length})`
                : 'See How Ruh Helps'}
            </button>
          )}

          {stepId === 'solution' && (
            <button
              type="button"
              data-testid="onboarding-cta"
              onClick={handleNext}
              className={`w-full min-h-[54px] px-6 py-3.5 rounded-2xl font-serif-eng text-[16px] sm:text-[17px] font-semibold tracking-[0.02em] transition-all cursor-pointer ${primaryBtnClass}`}
            >
              Customize My App
            </button>
          )}

          {stepId === 'personalize' && (
            <button
              type="button"
              data-testid="onboarding-cta"
              onClick={handleNext}
              className={`w-full min-h-[54px] px-6 py-3.5 rounded-2xl font-serif-eng text-[16px] sm:text-[17px] font-semibold tracking-[0.02em] transition-all cursor-pointer ${primaryBtnClass}`}
            >
              Set My City
            </button>
          )}

          {stepId === 'location' && (
            <button
              type="button"
              data-testid="onboarding-cta"
              onClick={handleNext}
              className={`w-full min-h-[54px] px-6 py-3.5 rounded-2xl font-serif-eng text-[16px] sm:text-[17px] font-semibold tracking-[0.02em] transition-all cursor-pointer ${primaryBtnClass}`}
            >
              {prayerTimes?.hasLocation
                ? `Continue With ${prayerTimes.cityLabel}`
                : 'Skip City for Now'}
            </button>
          )}

          {stepId === 'demo_verse' && (
            <button
              type="button"
              data-testid="onboarding-cta"
              disabled={!isVerseReady}
              onClick={handleNext}
              className={`w-full min-h-[54px] px-6 py-3.5 rounded-2xl font-serif-eng text-[16px] sm:text-[17px] font-semibold tracking-[0.02em] transition-all ${
                isVerseReady
                  ? `${primaryBtnClass} cursor-pointer`
                  : isLightMode
                    ? 'bg-black/10 text-black/45 cursor-not-allowed'
                    : 'bg-white/10 text-white/45 cursor-not-allowed'
              }`}
            >
              {isVerseReady ? 'Save Verse & Continue' : 'Tap 1 verse to continue'}
            </button>
          )}

          {stepId === 'demo_anchors' && (
            <button
              type="button"
              data-testid="onboarding-cta"
              disabled={!isAnchorsReady}
              onClick={handleNext}
              className={`w-full min-h-[54px] px-6 py-3.5 rounded-2xl font-serif-eng text-[16px] sm:text-[17px] font-semibold tracking-[0.02em] transition-all ${
                isAnchorsReady
                  ? `${primaryBtnClass} cursor-pointer`
                  : isLightMode
                    ? 'bg-black/10 text-black/45 cursor-not-allowed'
                    : 'bg-white/10 text-white/45 cursor-not-allowed'
              }`}
            >
              {isAnchorsReady
                ? 'Build My Daily Plan'
                : `Pick ${anchorsRemaining} ${anchorsRemaining === 1 ? 'more habit' : 'habits'} to continue`}
            </button>
          )}

          {stepId === 'charter' && (
            <button
              type="button"
              data-testid="onboarding-cta"
              onClick={handleNext}
              className={`w-full min-h-[54px] px-6 py-3.5 rounded-2xl font-serif-eng text-[16px] sm:text-[17px] font-semibold tracking-[0.02em] transition-all cursor-pointer ${primaryBtnClass}`}
            >
              Set Prayer Reminders
            </button>
          )}

          {stepId === 'reminders' && (
            <div className="flex flex-col items-center gap-1.5">
              <button
                type="button"
                data-testid="onboarding-finish-enable"
                disabled={isFinishing}
                onClick={() => handleFinish(true)}
                className={`w-full min-h-[54px] px-6 py-3.5 rounded-2xl font-serif-eng text-[16px] sm:text-[17px] font-semibold tracking-[0.02em] transition-all cursor-pointer ${primaryBtnClass}`}
              >
                Enable Reminders &amp; Start
              </button>
              <button
                type="button"
                data-testid="onboarding-finish-quiet"
                disabled={isFinishing}
                onClick={() => handleFinish(false)}
                className={`min-h-[34px] px-3 font-serif-eng text-xs tracking-[0.12em] uppercase opacity-75 hover:opacity-100 transition-opacity cursor-pointer ${tSub}`}
              >
                Not now, open Ruh
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
