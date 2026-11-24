import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  LESSON_ONE_GROUP_QUIZZES,
  LESSON_ONE_INTRO,
  LESSON_ONE_LANDMARKS,
  LESSON_ONE_STORAGE_KEY,
  LESSON_ONE_VALID_IDS,
  LOCKED_FUTURE_LESSONS,
  PILLAR_GROUPS,
} from '../../data/learningPathData';
import {
  LESSON_ONE_STEPS,
  buildStudyIntroSummary,
  computeLessonOneProgress,
  evaluatePillarCheckAnswer,
  getAdjacentStepIndex,
  getLearningSteps,
  getStepProgress,
  groupLessonOnePillars,
  markLandmarkDiscovered,
  parseDiscoveredLandmarks,
  resolveFirstUnreadPillarId,
} from '../../utils/learningPathLogic';
import {
  hapticCelebrate,
  hapticDetent,
  hapticTapLight,
} from '../../utils/haptics';
import { StudyIntroStage } from './StudyIntroStage';
import { LessonCompleteStage, LessonQuizStage } from './LessonQuizStage';
import sanctuaryDayBackdropImg from '../../assets/images/sacred_tree_sanctuary_daylight_1794915112786.jpg';
import sanctuaryNightBackdropImg from '../../assets/images/sacred_tree_sanctuary_night_1794915113559.jpg';

const ChevronLeftIcon = ({ size = 15, style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
    aria-hidden="true"
  >
    <path d="m15 18-6-6 6-6" />
  </svg>
);

const ChevronRightIcon = ({ size = 15, style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
    aria-hidden="true"
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
);

const CheckCircleIcon = ({ size = 16, style, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.1"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
    className={className}
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="m8.5 12.2 2.4 2.4 4.8-4.8" />
  </svg>
);

const CircleOutlineIcon = ({ size = 16, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    className={className}
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="9" />
  </svg>
);

const CARD_TABS = [
  { id: 'essence', label: 'Essence' },
  { id: 'practice', label: 'Daily Life' },
  { id: 'check', label: 'Quick Check' },
];

/**
 * Serene Sanctuary Study Window for Lesson I: Foundations of Islam & Faith.
 *
 * Flow:
 *  0. Intro Overview (StudyIntroStage)
 *  1. Part I: Five Pillars of Islam (focused one-pillar-at-a-time study card)
 *  2. Part I: Understanding Check
 *  3. Part II: Six Pillars of Faith (focused one-pillar-at-a-time study card)
 *  4. Part II: Understanding Check
 *  5. Completion Seal
 */
export const AncientMapCanvas = ({
  isLightMode = false,
  isAnimating = false,
  onProgressChange,
  onBack,
}) => {
  const [discoveredIds, setDiscoveredIds] = useState(() => {
    try {
      const raw = localStorage.getItem(LESSON_ONE_STORAGE_KEY);
      return parseDiscoveredLandmarks(raw, LESSON_ONE_VALID_IDS);
    } catch {
      return [];
    }
  });

  // 0: Intro | 1: 5 Pillars of Islam | 2: Islam Check | 3: 6 Pillars of Faith | 4: Faith Check | 5: Complete
  const [stepIndex, setStepIndex] = useState(0);
  const [stepDirection, setStepDirection] = useState(1);

  // Active focused Pillar within each group
  const [activeIslamId, setActiveIslamId] = useState(() => LESSON_ONE_LANDMARKS[0].id);
  const [activeImanId, setActiveImanId] = useState(
    () =>
      LESSON_ONE_LANDMARKS.find((item) => item.region === 'iman')?.id ||
      LESSON_ONE_LANDMARKS[5].id
  );

  // Progressive disclosure tabs inside the focused study card: 'essence' | 'practice' | 'check'
  const [cardTab, setCardTab] = useState('essence');
  const [pillarChecks, setPillarChecks] = useState({});
  const [groupQuizAnswers, setGroupQuizAnswers] = useState({});

  useEffect(() => {
    try {
      localStorage.setItem(LESSON_ONE_STORAGE_KEY, JSON.stringify(discoveredIds));
    } catch {
      // Ignore storage errors
    }
  }, [discoveredIds]);

  const progress = useMemo(
    () => computeLessonOneProgress(discoveredIds, LESSON_ONE_LANDMARKS.length),
    [discoveredIds]
  );

  const grouped = useMemo(
    () => groupLessonOnePillars(LESSON_ONE_LANDMARKS, discoveredIds),
    [discoveredIds]
  );

  const introSummary = useMemo(
    () => buildStudyIntroSummary(LESSON_ONE_LANDMARKS, discoveredIds, LESSON_ONE_STEPS),
    [discoveredIds]
  );

  const learningSteps = useMemo(() => getLearningSteps(LESSON_ONE_STEPS), []);

  useEffect(() => {
    onProgressChange?.(progress);
  }, [progress, onProgressChange]);

  const stepMeta = useMemo(() => getStepProgress(stepIndex, LESSON_ONE_STEPS), [stepIndex]);
  const currentStep = stepMeta.step;

  const markPillarDiscovered = useCallback((pillarId) => {
    setDiscoveredIds((prev) => {
      const { nextIds, added } = markLandmarkDiscovered(prev, pillarId, LESSON_ONE_VALID_IDS);
      return added ? nextIds : prev;
    });
  }, []);

  const markGroupDiscovered = useCallback((groupKey) => {
    const groupItems = LESSON_ONE_LANDMARKS.filter((item) => item.region === groupKey);
    setDiscoveredIds((prev) => {
      let next = prev;
      for (const item of groupItems) {
        const res = markLandmarkDiscovered(next, item.id, LESSON_ONE_VALID_IDS);
        next = res.nextIds;
      }
      return next;
    });
  }, []);

  // Automatically record the currently focused pillar once inside a study stage
  useEffect(() => {
    if (currentStep.id === 'islam-study') {
      markPillarDiscovered(activeIslamId);
    } else if (currentStep.id === 'iman-study') {
      markPillarDiscovered(activeImanId);
    }
  }, [currentStep.id, activeIslamId, activeImanId, markPillarDiscovered]);

  const goToStep = useCallback(
    (targetIdx) => {
      const clamped = Math.max(0, Math.min(LESSON_ONE_STEPS.length - 1, targetIdx));
      if (clamped === stepIndex) return;
      if (clamped > stepIndex) {
        if (stepIndex === 1 && clamped >= 2) {
          markGroupDiscovered('islam');
        }
        if (stepIndex === 3 && clamped >= 4) {
          markGroupDiscovered('iman');
        }
      }
      hapticTapLight();
      setStepDirection(clamped > stepIndex ? 1 : -1);
      setCardTab('essence');
      setStepIndex(clamped);
    },
    [stepIndex, markGroupDiscovered]
  );

  const handleEnterPart = useCallback(
    (partId) => {
      const targetStepId = partId === 'iman' ? 'iman-study' : 'islam-study';
      const targetIdx = LESSON_ONE_STEPS.findIndex((s) => s.id === targetStepId);
      if (partId === 'iman') {
        const nextId = resolveFirstUnreadPillarId(grouped.iman.items, discoveredIds);
        if (nextId) setActiveImanId(nextId);
      } else {
        const nextId = resolveFirstUnreadPillarId(grouped.islam.items, discoveredIds);
        if (nextId) setActiveIslamId(nextId);
      }
      if (targetIdx >= 0) {
        hapticDetent();
        setStepDirection(1);
        setCardTab('essence');
        setStepIndex(targetIdx);
      }
    },
    [discoveredIds, grouped.iman.items, grouped.islam.items]
  );

  const handleStartFromIntro = useCallback(() => {
    const targetIdx = introSummary.resumeStepIndex;
    const targetStep = LESSON_ONE_STEPS[targetIdx];
    if (targetStep?.id === 'iman-study') {
      const nextId = resolveFirstUnreadPillarId(grouped.iman.items, discoveredIds);
      if (nextId) setActiveImanId(nextId);
    } else {
      const nextId = resolveFirstUnreadPillarId(grouped.islam.items, discoveredIds);
      if (nextId) setActiveIslamId(nextId);
    }
    hapticDetent();
    setStepDirection(1);
    setCardTab('essence');
    setStepIndex(targetIdx);
  }, [discoveredIds, grouped.iman.items, grouped.islam.items, introSummary.resumeStepIndex]);

  const handleStepForward = useCallback(() => {
    if (currentStep.id === 'islam-study') {
      markGroupDiscovered('islam');
    } else if (currentStep.id === 'iman-study') {
      markGroupDiscovered('iman');
    }
    const nextIdx = getAdjacentStepIndex(stepIndex, 1, LESSON_ONE_STEPS.length);
    if (nextIdx === LESSON_ONE_STEPS.length - 1) {
      markGroupDiscovered('islam');
      markGroupDiscovered('iman');
      hapticCelebrate();
    } else {
      hapticDetent();
    }
    setStepDirection(1);
    setCardTab('essence');
    setStepIndex(nextIdx);
  }, [currentStep.id, markGroupDiscovered, stepIndex]);

  const handleStepBackward = useCallback(() => {
    const prevIdx = getAdjacentStepIndex(stepIndex, -1, LESSON_ONE_STEPS.length);
    if (prevIdx === stepIndex) return;
    hapticTapLight();
    setStepDirection(-1);
    setCardTab('essence');
    setStepIndex(prevIdx);
  }, [stepIndex]);

  const handleSelectPillar = useCallback(
    (item) => {
      if (!item) return;
      hapticDetent();
      if (item.region === 'islam') {
        setActiveIslamId(item.id);
      } else {
        setActiveImanId(item.id);
      }
      setCardTab('essence');
      markPillarDiscovered(item.id);
    },
    [markPillarDiscovered]
  );

  const handleAnswerInlineCheck = useCallback(
    (landmark, optIdx) => {
      if (!landmark) return;
      setPillarChecks((prev) => ({ ...prev, [landmark.id]: optIdx }));
      const res = evaluatePillarCheckAnswer(landmark, optIdx);
      if (res.isCorrect) {
        hapticDetent();
        markPillarDiscovered(landmark.id);
      } else {
        hapticTapLight();
      }
    },
    [markPillarDiscovered]
  );

  // Active group metadata & selected pillar for Study Steps
  const isIntroStep = currentStep.id === 'intro';
  const isIslamStudy = currentStep.id === 'islam-study';
  const isImanStudy = currentStep.id === 'iman-study';
  const isStudyStep = isIslamStudy || isImanStudy;

  const activeGroupInfo = useMemo(() => {
    const key = currentStep.group === 'iman' ? 'iman' : 'islam';
    return PILLAR_GROUPS.find((g) => g.id === key) || PILLAR_GROUPS[0];
  }, [currentStep.group]);

  const activeGroupItems = isImanStudy ? grouped.iman.items : grouped.islam.items;
  const focusedPillarId = isImanStudy ? activeImanId : activeIslamId;
  const focusedIndexInGroup = useMemo(() => {
    const idx = activeGroupItems.findIndex((item) => item.id === focusedPillarId);
    return idx >= 0 ? idx : 0;
  }, [activeGroupItems, focusedPillarId]);

  const focusedPillar = activeGroupItems[focusedIndexInGroup] || activeGroupItems[0];
  const isFirstPillarInGroup = focusedIndexInGroup === 0;
  const isLastPillarInGroup = focusedIndexInGroup >= activeGroupItems.length - 1;
  const footerLeftIsOverview = isStudyStep && isFirstPillarInGroup && stepIndex === 1;

  const handleStudyPrevious = useCallback(() => {
    if (!isStudyStep) {
      handleStepBackward();
      return;
    }
    if (!isFirstPillarInGroup) {
      handleSelectPillar(activeGroupItems[focusedIndexInGroup - 1]);
    } else {
      handleStepBackward();
    }
  }, [
    isStudyStep,
    isFirstPillarInGroup,
    activeGroupItems,
    focusedIndexInGroup,
    handleSelectPillar,
    handleStepBackward,
  ]);

  const handleStudyNext = useCallback(() => {
    if (!isStudyStep) {
      handleStepForward();
      return;
    }
    if (!isLastPillarInGroup) {
      handleSelectPillar(activeGroupItems[focusedIndexInGroup + 1]);
    } else {
      handleStepForward();
    }
  }, [
    isStudyStep,
    isLastPillarInGroup,
    activeGroupItems,
    focusedIndexInGroup,
    handleSelectPillar,
    handleStepForward,
  ]);

  const inlineCheckEval = useMemo(
    () => evaluatePillarCheckAnswer(focusedPillar, pillarChecks[focusedPillar?.id]),
    [focusedPillar, pillarChecks]
  );

  // Keyboard navigation (Up/Down or Left/Right steps cleanly through pillars)
  useEffect(() => {
    if (!isStudyStep) return undefined;
    const onKeyDown = (e) => {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      e.preventDefault();
      const idx = activeGroupItems.findIndex((i) => i.id === focusedPillar?.id);
      if (idx === -1) return;
      const nextIdx =
        e.key === 'ArrowDown'
          ? (idx + 1) % activeGroupItems.length
          : (idx - 1 + activeGroupItems.length) % activeGroupItems.length;
      handleSelectPillar(activeGroupItems[nextIdx]);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isStudyStep, activeGroupItems, focusedPillar, handleSelectPillar]);

  // Cozy Ruh theme tokens (dual-theme legibility)
  const accentHex = isLightMode ? '#8a6220' : '#d4af6a';
  const textMain = isLightMode ? 'text-[#1c160f]' : 'text-[rgba(246,239,226,0.95)]';
  const textSub = isLightMode ? 'text-[#4e3f2b]' : 'text-[rgba(232,222,204,0.80)]';
  const textMuted = isLightMode ? 'text-[#665136]' : 'text-[rgba(218,205,184,0.68)]';
  const hairline = isLightMode ? 'border-[#8a6220]/16' : 'border-white/[0.09]';

  const bgIllustration = isLightMode
    ? sanctuaryDayBackdropImg
    : sanctuaryNightBackdropImg;

  const stageAnimClass =
    stepDirection >= 0 ? 'animate-lesson-stage-next' : 'animate-lesson-stage-prev';

  const primaryNextLesson = LOCKED_FUTURE_LESSONS[0];

  return (
    <div
      data-testid="practical-lesson-studio"
      className={`relative w-full h-full flex flex-col overflow-hidden select-none ${
        isLightMode ? 'bg-[#f3ebdb]' : 'bg-[#0b0e16]'
      } ${textMain}`}
    >
      {/* AMBIENT SANCTUARY BACKDROP */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden">
        <img
          src={bgIllustration}
          alt=""
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover scale-105 transition-opacity duration-500 ${
            isLightMode ? 'opacity-[0.15]' : 'opacity-[0.13]'
          }`}
        />
        <div
          className="absolute inset-0"
          style={{
            background: isLightMode
              ? 'radial-gradient(ellipse 75% 65% at 50% 35%, rgba(252,248,239,0.62) 0%, rgba(243,235,219,0.95) 80%)'
              : 'radial-gradient(ellipse 76% 64% at 50% 32%, rgba(212,175,106,0.10) 0%, rgba(11,14,22,0.93) 78%)',
          }}
        />
      </div>

      {/* ====================================================================
          1. MINIMAL TOP BAR (Calm Centered Masthead on Intro; Progress Bar During Lesson)
      ==================================================================== */}
      <header
        className="relative z-20 shrink-0 px-4 sm:px-8 pb-1.5 flex items-center justify-center"
        style={{ paddingTop: 'calc(14px + var(--sat))' }}
      >
        {isIntroStep ? (
          <span
            className={`font-serif-eng text-[12px] tracking-[0.12em] uppercase whitespace-nowrap ${textMuted}`}
          >
            Study Sanctuary
          </span>
        ) : (
          <div className="w-full max-w-[820px] flex items-center justify-between gap-4">
            <span
              className={`hidden sm:inline font-serif-eng text-[12px] tracking-[0.06em] whitespace-nowrap shrink-0 ${textMuted}`}
            >
              Study Sanctuary
            </span>

            {/* 4-Segment Lesson Progress Bar */}
            <div
              role="navigation"
              aria-label="Lesson progress steps"
              className="flex-1 max-w-[340px] flex items-center gap-1.5"
            >
              {learningSteps.map((step) => {
                const isPast = stepIndex > step.stepIndex;
                const isCurrent = stepIndex === step.stepIndex;
                return (
                  <button
                    key={step.id}
                    type="button"
                    aria-label={`Go to ${step.label}`}
                    aria-current={isCurrent ? 'step' : undefined}
                    data-testid={`lesson-step-bar-${step.id}`}
                    onClick={() => goToStep(step.stepIndex)}
                    className="group flex-1 py-2.5 cursor-pointer focus:outline-none"
                  >
                    <span
                      className={`block h-[4px] w-full rounded-full overflow-hidden transition-colors duration-300 ${
                        isLightMode ? 'bg-[#7c5a1e]/18' : 'bg-white/[0.12]'
                      }`}
                    >
                      <span
                        className="block h-full rounded-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] origin-left"
                        style={{
                          backgroundColor: accentHex,
                          transform: isPast || isCurrent ? 'scaleX(1)' : 'scaleX(0)',
                          opacity: isCurrent ? 1 : isPast ? 0.72 : 0,
                        }}
                      />
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Quiet Unboxed Overview Jump + Step Counter */}
            <div className="shrink-0 flex items-center gap-3">
              {!footerLeftIsOverview && !stepMeta.isCompleteStep && (
                <button
                  type="button"
                  data-testid="lesson-overview-btn"
                  onClick={() => goToStep(0)}
                  className={`inline-flex min-h-[36px] items-center font-serif-eng text-[12px] whitespace-nowrap hover:underline underline-offset-4 cursor-pointer ${textMuted}`}
                >
                  Overview
                </button>
              )}
              <span
                data-testid="lesson-step-counter"
                className={`font-serif-eng text-[12px] tabular-nums whitespace-nowrap ${textSub}`}
              >
                {stepMeta.isCompleteStep
                  ? 'Done'
                  : `${stepMeta.displayNumber} / ${stepMeta.totalLearningSteps}`}
              </span>
            </div>
          </div>
        )}
      </header>

      {/* ====================================================================
          2. MAIN CENTERED STAGE
      ==================================================================== */}
      <main
        data-testid="active-pillar-stage"
        className="relative z-10 flex-1 min-h-0 flex flex-col items-center justify-center pl-4 pr-11 sm:px-12 py-2 overflow-y-auto hide-scrollbar"
      >
        {/* === STEP 0: INTRODUCTORY OVERVIEW PAGE === */}
        {isIntroStep && (
          <StudyIntroStage
            intro={LESSON_ONE_INTRO}
            groups={PILLAR_GROUPS}
            summary={introSummary}
            nextLesson={primaryNextLesson}
            isLightMode={isLightMode}
            accentHex={accentHex}
            textSub={textSub}
            textMuted={textMuted}
            stageAnimClass={stageAnimClass}
            onStart={handleStartFromIntro}
            onSelectPart={handleEnterPart}
          />
        )}

        {/* === STUDY STEPS: CLEAN TWO-ZONE FOCUSED PILLAR READER === */}
        {isStudyStep && focusedPillar && (
          <div
            key={currentStep.id}
            className={`w-full max-w-[820px] mx-auto flex flex-col gap-4 sm:gap-6 ${stageAnimClass}`}
          >
            {/* A. Airy Two-Line Section Masthead */}
            <div className="text-center px-1">
              <div className="inline-flex items-center justify-center gap-2.5 flex-wrap">
                <span className={`font-serif-eng text-[12px] tracking-[0.04em] ${textMuted}`}>
                  {activeGroupInfo.numberLabel}
                </span>
                <span aria-hidden="true" className={`opacity-35 ${textMuted}`}>
                  ·
                </span>
                <span
                  dir="rtl"
                  className="font-calligraphy text-[19px] sm:text-[22px] leading-none"
                  style={{ color: accentHex }}
                >
                  {activeGroupInfo.arabic}
                </span>
              </div>

              <h1
                id="learning-path-heading"
                className="font-serif-eng text-[24px] sm:text-[32px] font-semibold leading-tight mt-1 text-balance"
              >
                {activeGroupInfo.title}
              </h1>

              <p
                className={`font-serif-eng text-[13px] sm:text-[14.5px] leading-snug mt-1 max-w-[460px] mx-auto ${textSub}`}
              >
                {activeGroupInfo.summary}
              </p>
            </div>

            {/* B. Clean Two-Zone Layout: Quiet Pillar Selector + Spacious Focused Study Card */}
            <div className="grid grid-cols-1 md:grid-cols-[224px_minmax(0,1fr)] gap-3 sm:gap-5 items-stretch">
              {/* Quiet Pillar Selector (Single Responsive Listbox: Numbered Strip on Mobile, Hairline Rail on Desktop) */}
              <div
                role="listbox"
                aria-label={activeGroupInfo.title}
                data-testid={`grouped-list-${activeGroupInfo.id}`}
                className={`rounded-2xl border overflow-hidden ${hairline} ${
                  isLightMode ? 'bg-white/65' : 'bg-[#0f131d]/74'
                } grid ${
                  isImanStudy ? 'grid-cols-6' : 'grid-cols-5'
                } md:flex md:flex-col md:divide-y ${
                  isLightMode ? 'md:divide-[#8a6220]/12' : 'md:divide-white/[0.07]'
                }`}
              >
                {activeGroupItems.map((item) => {
                  const isSelected = item.id === focusedPillar.id;
                  const isDiscovered = discoveredIds.includes(item.id);

                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      aria-label={`${item.regionOrder}. ${item.title}`}
                      data-testid={`landmark-${item.id}`}
                      data-discovered={isDiscovered ? 'true' : 'false'}
                      onClick={() => handleSelectPillar(item)}
                      className={`group relative min-h-[44px] md:flex-1 md:min-h-[50px] px-2 md:px-4 py-2 flex items-center justify-center md:justify-between gap-2 transition-colors cursor-pointer ${
                        isSelected
                          ? isLightMode
                            ? 'bg-white text-[#1c160f] font-semibold'
                            : 'bg-[#d4af6a]/16 text-[#f6efe2] font-semibold'
                          : isLightMode
                            ? 'hover:bg-white/75 text-[#4e3f2b]'
                            : 'hover:bg-white/[0.04] text-[rgba(232,222,204,0.74)]'
                      }`}
                    >
                      {/* Mobile Compact Number + Architectural Hairline Bar */}
                      <span className="md:hidden flex flex-col items-center justify-center leading-none gap-1.5">
                        <span
                          className="font-serif-eng text-[14px] tabular-nums"
                          style={{ color: isSelected ? accentHex : undefined }}
                        >
                          {item.regionOrder}
                        </span>
                        <span
                          aria-hidden="true"
                          className="h-[2px] w-4 rounded-full transition-opacity"
                          style={{
                            backgroundColor: accentHex,
                            opacity: isSelected ? 1 : isDiscovered ? 0.5 : 0.14,
                          }}
                        />
                      </span>

                      {/* Desktop Clean Single-Line Title */}
                      <span className="hidden md:flex items-center gap-2.5 min-w-0">
                        <span className="shrink-0 w-4 h-4 flex items-center justify-center">
                          {isSelected || isDiscovered ? (
                            <CheckCircleIcon
                              size={15}
                              className={isSelected ? 'opacity-100' : 'opacity-65'}
                              style={{ color: accentHex }}
                            />
                          ) : (
                            <CircleOutlineIcon
                              size={15}
                              className={
                                isLightMode
                                  ? 'text-[#4a453d]/30 group-hover:text-[#8a6220]/75'
                                  : 'text-[#e4dac8]/28 group-hover:text-[#d4af6a]/80'
                              }
                            />
                          )}
                        </span>
                        <span
                          className="font-serif-eng text-[14px] truncate"
                          style={{ color: isSelected ? accentHex : undefined }}
                        >
                          {item.regionOrder}. {item.title}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Spacious Focused Pillar Study Card (One Topic at a Time) */}
              <section
                data-testid="pillar-context-tray"
                className={`rounded-2xl border px-5 sm:px-7 py-4 sm:py-6 flex flex-col justify-between min-h-[320px] sm:min-h-[360px] ${
                  isLightMode
                    ? 'bg-[#fbf7ee]/94 border-[#8a6220]/20 shadow-[0_14px_38px_rgba(62,42,16,0.08)]'
                    : 'bg-[#111520]/90 border-[#d4af6a]/20 shadow-[0_16px_42px_rgba(0,0,0,0.48)]'
                }`}
                style={
                  isAnimating
                    ? undefined
                    : { backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }
                }
              >
                {/* Card Top Utility Row: Quiet Counter + 3 Progressive Disclosure Tabs */}
                <div className={`flex items-center justify-between gap-3 pb-3.5 border-b ${hairline}`}>
                  <span className={`font-serif-eng text-[12px] tabular-nums whitespace-nowrap ${textMuted}`}>
                    {focusedIndexInGroup + 1} of {activeGroupItems.length}
                  </span>

                  <div
                    role="tablist"
                    aria-label="Study view"
                    className={`inline-flex items-center p-0.5 rounded-xl border ${
                      isLightMode
                        ? 'bg-[#eee5d3]/80 border-[#8a6220]/14'
                        : 'bg-white/[0.04] border-white/[0.08]'
                    }`}
                  >
                    {CARD_TABS.map((tab) => {
                      const isActive = cardTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          role="tab"
                          aria-selected={isActive}
                          data-testid={
                            tab.id === 'check'
                              ? 'toggle-inline-check-btn'
                              : `pillar-tab-${tab.id}`
                          }
                          onClick={() => {
                            if (cardTab !== tab.id) {
                              hapticTapLight();
                              setCardTab(tab.id);
                            }
                          }}
                          className={`min-h-[34px] px-3 rounded-lg font-serif-eng text-[12px] whitespace-nowrap transition-colors cursor-pointer ${
                            isActive
                              ? isLightMode
                                ? 'bg-white text-[#1c160f] font-semibold shadow-xs'
                                : 'bg-[#d4af6a]/22 text-[#f6efe2] font-semibold'
                              : `${textMuted} hover:opacity-100`
                          }`}
                        >
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Card Body (Smoothly Animates on Pillar or Tab Switch) */}
                <div
                  key={`${focusedPillar.id}-${cardTab}`}
                  className="flex-1 flex flex-col justify-center py-4 sm:py-5 animate-lesson-context"
                >
                  {cardTab === 'essence' && (
                    <div className="flex flex-col items-center text-center gap-4">
                      {/* Pillar Title & Calligraphy */}
                      <div>
                        <p
                          dir="rtl"
                          className="font-calligraphy text-[24px] sm:text-[28px] leading-snug"
                          style={{ color: accentHex }}
                        >
                          {focusedPillar.arabic}
                        </p>
                        <h2 className="font-serif-eng text-[23px] sm:text-[28px] font-semibold leading-tight mt-0.5">
                          {focusedPillar.title}
                        </h2>
                        <p className={`font-serif-eng italic text-[13.5px] sm:text-[14.5px] mt-0.5 ${textMuted}`}>
                          {focusedPillar.englishMeaning}
                        </p>
                      </div>

                      {/* Single Clear Everyday-English Explanation */}
                      <p className="font-serif-eng text-[15.5px] sm:text-[17px] leading-[1.68] max-w-[46ch]">
                        {focusedPillar.shortSummary || focusedPillar.recognitionCue}
                      </p>

                      {/* Hairline-Separated Key Verse / Quote */}
                      <div className={`w-full pt-4 mt-1 border-t ${hairline} space-y-1.5`}>
                        <p
                          dir="rtl"
                          className="font-arabic text-[17px] sm:text-[19px] leading-relaxed"
                          style={{ color: accentHex }}
                        >
                          {focusedPillar.arabicFormula}
                        </p>
                        <p className={`font-serif-eng italic text-[13px] sm:text-[14px] leading-snug max-w-[50ch] mx-auto ${textSub}`}>
                          {focusedPillar.formulaTranslation}
                        </p>
                        {focusedPillar.classicalProof?.source && (
                          <p className={`font-serif-eng text-[11.5px] pt-0.5 ${textMuted}`}>
                            {focusedPillar.classicalProof.source}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {cardTab === 'practice' && (
                    <div data-testid="pillar-practice-panel" className="space-y-5 text-left">
                      <div>
                        <p
                          className="font-serif-eng text-[12px] font-semibold tracking-[0.04em] mb-2.5"
                          style={{ color: accentHex }}
                        >
                          Living {focusedPillar.title} Daily
                        </p>
                        <ul className="space-y-2.5">
                          {(focusedPillar.shortPractice || focusedPillar.dailyPractice.slice(0, 2)).map(
                            (line, idx) => (
                              <li
                                key={idx}
                                className="flex items-start gap-2.5 font-serif-eng text-[14.5px] sm:text-[15.5px] leading-relaxed"
                              >
                                <span
                                  className="font-semibold tabular-nums shrink-0 mt-0.5 text-[12px]"
                                  style={{ color: accentHex }}
                                >
                                  0{idx + 1}.
                                </span>
                                <span>{line}</span>
                              </li>
                            )
                          )}
                        </ul>
                      </div>

                      {Array.isArray(focusedPillar.keyTerms) && focusedPillar.keyTerms.length > 0 && (
                        <div className={`pt-4 border-t ${hairline}`}>
                          <p className={`font-serif-eng text-[12px] font-semibold tracking-[0.04em] mb-2.5 ${textMuted}`}>
                            Key Terms
                          </p>
                          <dl className="space-y-2">
                            {focusedPillar.keyTerms.map((entry, idx) => (
                              <div
                                key={idx}
                                className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-0.5 sm:gap-4"
                              >
                                <dt className="font-serif-eng text-[13.5px] font-semibold shrink-0">
                                  {entry.term}
                                </dt>
                                <dd className={`font-serif-eng text-[13px] leading-snug sm:text-right ${textSub}`}>
                                  {entry.meaning}
                                </dd>
                              </div>
                            ))}
                          </dl>
                        </div>
                      )}
                    </div>
                  )}

                  {cardTab === 'check' && (
                    <div data-testid="inline-pillar-check" className="space-y-3 text-left">
                      <p className="font-serif-eng text-[15px] sm:text-[16.5px] font-semibold leading-snug">
                        {focusedPillar.checkQuestion?.prompt}
                      </p>

                      <div className="flex flex-col gap-2">
                        {(focusedPillar.checkQuestion?.options || []).map((opt, optIdx) => {
                          const chosenIdx = pillarChecks[focusedPillar.id];
                          const isChosen = chosenIdx === optIdx;
                          const isRight = optIdx === focusedPillar.checkQuestion?.correctIndex;

                          const optClass = isChosen
                            ? isRight
                              ? isLightMode
                                ? 'bg-[#eadbc0] border-[#7c5a1e] font-semibold'
                                : 'bg-[#2a2217] border-[#d4af6a] font-semibold'
                              : isLightMode
                                ? 'bg-[#fae8e4] border-[#a83a32]/50'
                                : 'bg-[#2d1a1a] border-[#e07a72]/50'
                            : isLightMode
                              ? 'bg-white/75 border-[#7c5a1e]/18 hover:border-[#7c5a1e]/45'
                              : 'bg-[#171b27]/80 border-white/[0.10] hover:border-[#d4af6a]/45';

                          return (
                            <button
                              key={optIdx}
                              type="button"
                              data-testid={`inline-check-option-${optIdx}`}
                              onClick={() => handleAnswerInlineCheck(focusedPillar, optIdx)}
                              className={`w-full min-h-[44px] rounded-xl border px-3.5 py-2.5 text-left font-serif-eng text-[13.5px] sm:text-[14px] leading-snug transition cursor-pointer flex items-start gap-2.5 ${optClass}`}
                            >
                              <span
                                className="font-bold shrink-0 text-[12px] mt-0.5"
                                style={{ color: accentHex }}
                              >
                                {String.fromCharCode(65 + optIdx)}.
                              </span>
                              <span>{opt}</span>
                            </button>
                          );
                        })}
                      </div>

                      {inlineCheckEval.answered && (
                        <p className={`font-serif-eng text-[13px] leading-snug pt-1 ${textSub}`}>
                          <strong style={{ color: accentHex }}>
                            {inlineCheckEval.isCorrect ? 'Correct · ' : 'Try again · '}
                          </strong>
                          {inlineCheckEval.isCorrect
                            ? inlineCheckEval.explanation
                            : 'Look back at Essence for a quick clue and try another choice.'}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        )}

        {/* === QUIZ STEP I: PILLARS OF ISLAM === */}
        {currentStep.id === 'islam-quiz' && (
          <LessonQuizStage
            groupTitle="Part I · Five Pillars of Islam"
            groupArabic="أَرْكَانُ الإِسْلَام"
            questions={LESSON_ONE_GROUP_QUIZZES.islam}
            answersById={groupQuizAnswers}
            onSelectAnswer={(qId, optIdx) =>
              setGroupQuizAnswers((prev) => ({ ...prev, [qId]: optIdx }))
            }
            onAllCorrectComplete={handleStepForward}
            isLightMode={isLightMode}
            accentHex={accentHex}
            textSub={textSub}
            textMuted={textMuted}
            stageAnimClass={stageAnimClass}
          />
        )}

        {/* === QUIZ STEP II: PILLARS OF FAITH === */}
        {currentStep.id === 'iman-quiz' && (
          <LessonQuizStage
            groupTitle="Part II · Six Pillars of Faith"
            groupArabic="أَرْكَانُ الإِيمَان"
            questions={LESSON_ONE_GROUP_QUIZZES.iman}
            answersById={groupQuizAnswers}
            onSelectAnswer={(qId, optIdx) =>
              setGroupQuizAnswers((prev) => ({ ...prev, [qId]: optIdx }))
            }
            onAllCorrectComplete={handleStepForward}
            isLightMode={isLightMode}
            accentHex={accentHex}
            textSub={textSub}
            textMuted={textMuted}
            stageAnimClass={stageAnimClass}
          />
        )}

        {/* === COMPLETION SEAL === */}
        {currentStep.id === 'complete' && (
          <LessonCompleteStage
            islamItems={grouped.islam.items}
            imanItems={grouped.iman.items}
            nextLesson={primaryNextLesson}
            isLightMode={isLightMode}
            accentHex={accentHex}
            textSub={textSub}
            stageAnimClass={stageAnimClass}
            onBackToOverview={() => {
              hapticTapLight();
              setStepDirection(-1);
              setStepIndex(0);
            }}
            onRestart={() => {
              hapticTapLight();
              setGroupQuizAnswers({});
              setStepDirection(-1);
              setStepIndex(1);
            }}
            onExit={onBack}
          />
        )}
      </main>

      {/* ====================================================================
          3. CLEAN BOTTOM STEP ACTION BAR (Hidden on Intro & Complete)
      ==================================================================== */}
      {!isIntroStep && currentStep.id !== 'complete' && (
        <footer
          className="relative z-20 shrink-0 pl-4 pr-11 sm:px-12 pt-2"
          style={{ paddingBottom: 'calc(14px + var(--sab))' }}
        >
          <div className="w-full max-w-[820px] mx-auto flex items-center justify-between gap-3">
            <button
              type="button"
              data-testid="lesson-prev-step-btn"
              onClick={handleStudyPrevious}
              className={`min-h-[44px] px-4 rounded-2xl border font-serif-eng text-[13px] font-medium flex items-center gap-1 whitespace-nowrap transition cursor-pointer active:scale-95 ${
                isLightMode
                  ? 'bg-white/75 hover:bg-white/95 border-[#9c7533]/24 text-[#2b1f11]'
                  : 'bg-[#12100d]/72 hover:bg-[#1a1612] border-white/[0.12] text-[#efe5d4]'
              }`}
            >
              <ChevronLeftIcon size={14} style={{ color: accentHex }} />
              <span>{footerLeftIsOverview ? 'Overview' : 'Previous'}</span>
            </button>

            {isStudyStep ? (
              <div className="flex items-center gap-4 ml-auto">
                {!isLastPillarInGroup && (
                  <button
                    type="button"
                    data-testid="lesson-jump-check-btn"
                    onClick={handleStepForward}
                    className={`hidden sm:inline-flex min-h-[44px] items-center font-serif-eng text-[12.5px] whitespace-nowrap hover:underline underline-offset-4 cursor-pointer ${textMuted}`}
                  >
                    Skip to check
                  </button>
                )}

                <button
                  type="button"
                  data-testid="lesson-continue-btn"
                  onClick={handleStudyNext}
                  className={`min-h-[44px] px-5 sm:px-6 rounded-2xl font-serif-eng text-[13.5px] font-semibold tracking-[0.03em] flex items-center justify-center gap-1.5 whitespace-nowrap transition cursor-pointer active:scale-[0.98] ${
                    isLightMode
                      ? 'bg-[#463219] text-[#faf3e4] hover:bg-[#594020] shadow-[0_8px_24px_rgba(70,50,25,0.22)]'
                      : 'bg-[#d4af6a] text-[#17120c] hover:bg-[#e1be7c] shadow-[0_8px_24px_rgba(212,175,106,0.22)]'
                  }`}
                >
                  <span>{isLastPillarInGroup ? 'Check Understanding' : 'Next Pillar'}</span>
                  <ChevronRightIcon size={15} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                data-testid="lesson-skip-quiz-btn"
                onClick={handleStepForward}
                className={`min-h-[44px] px-4 font-serif-eng text-[13px] whitespace-nowrap transition cursor-pointer ml-auto hover:underline underline-offset-4 ${textSub}`}
              >
                {currentStep.id === 'islam-quiz'
                  ? 'Continue to Pillars of Faith →'
                  : 'Finish Lesson →'}
              </button>
            )}
          </div>
        </footer>
      )}
    </div>
  );
};
