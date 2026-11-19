import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  LESSON_ONE_GROUP_QUIZZES,
  LESSON_ONE_LANDMARKS,
  LESSON_ONE_STORAGE_KEY,
  LESSON_ONE_VALID_IDS,
  LOCKED_FUTURE_LESSONS,
  PILLAR_GROUPS,
} from '../../data/learningPathData';
import {
  LESSON_ONE_STEPS,
  computeLessonOneProgress,
  evaluatePillarCheckAnswer,
  getAdjacentStepIndex,
  getStepProgress,
  groupLessonOnePillars,
  markLandmarkDiscovered,
  parseDiscoveredLandmarks,
} from '../../utils/learningPathLogic';
import {
  hapticCelebrate,
  hapticDetent,
  hapticTapLight,
} from '../../utils/haptics';
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

/**
 * Zero-Scroll Duolingo-Style Sanctuary Study Window for Lesson I:
 * Foundations of Islam & Faith (Arkan al-Islam & Arkan al-Iman).
 *
 * - Fits cleanly inside the viewport (zero scrolling on desktop & mobile).
 * - Minimal top chrome: Back button + thin segmented progress bar.
 * - Top of main content: Prominent display heading + concise context.
 * - Center: Grouped Pillars formatted in a tactile Prayer-Checklist frosted stack
 *   with staggered 3D entrance, active lift & golden sheen transitions.
 * - Below main topic: Smoothly transitioning Context & inline Quick Check tray,
 *   paired with dedicated Duolingo-style group check steps.
 */
export const AncientMapCanvas = ({
  isLightMode = false,
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

  // 0: 5 Pillars of Islam | 1: Islam Check | 2: 6 Pillars of Faith | 3: Faith Check | 4: Complete
  const [stepIndex, setStepIndex] = useState(0);
  const [stepDirection, setStepDirection] = useState(1);

  // Active focused Pillar within each grouped deck
  const [activeIslamId, setActiveIslamId] = useState(() => LESSON_ONE_LANDMARKS[0].id);
  const [activeImanId, setActiveImanId] = useState(
    () => LESSON_ONE_LANDMARKS.find((item) => item.region === 'iman')?.id || LESSON_ONE_LANDMARKS[5].id
  );

  // Context panel below the main topic can reveal a 1-tap inline quick check per pillar
  const [contextMode, setContextMode] = useState('context'); // 'context' | 'check'
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

  // Automatically record the initially focused pillar in each study group
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
      hapticTapLight();
      setStepDirection(clamped > stepIndex ? 1 : -1);
      setContextMode('context');
      setStepIndex(clamped);
    },
    [stepIndex]
  );

  const handleStepForward = useCallback(() => {
    if (currentStep.id === 'islam-study') {
      markGroupDiscovered('islam');
    } else if (currentStep.id === 'iman-study') {
      markGroupDiscovered('iman');
    }
    const nextIdx = getAdjacentStepIndex(stepIndex, 1, LESSON_ONE_STEPS.length);
    if (nextIdx === LESSON_ONE_STEPS.length - 1) {
      hapticCelebrate();
    } else {
      hapticDetent();
    }
    setStepDirection(1);
    setContextMode('context');
    setStepIndex(nextIdx);
  }, [currentStep.id, markGroupDiscovered, stepIndex]);

  const handleStepBackward = useCallback(() => {
    const prevIdx = getAdjacentStepIndex(stepIndex, -1, LESSON_ONE_STEPS.length);
    if (prevIdx === stepIndex) return;
    hapticTapLight();
    setStepDirection(-1);
    setContextMode('context');
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
      setContextMode('context');
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
  const isIslamStudy = currentStep.id === 'islam-study';
  const isImanStudy = currentStep.id === 'iman-study';
  const isStudyStep = isIslamStudy || isImanStudy;

  const activeGroupInfo = useMemo(() => {
    const key = currentStep.group === 'iman' ? 'iman' : 'islam';
    return PILLAR_GROUPS.find((g) => g.id === key) || PILLAR_GROUPS[0];
  }, [currentStep.group]);

  const activeGroupItems = isImanStudy ? grouped.iman.items : grouped.islam.items;
  const focusedPillarId = isImanStudy ? activeImanId : activeIslamId;
  const focusedPillar = useMemo(
    () =>
      activeGroupItems.find((item) => item.id === focusedPillarId) || activeGroupItems[0],
    [activeGroupItems, focusedPillarId]
  );

  const inlineCheckEval = useMemo(
    () => evaluatePillarCheckAnswer(focusedPillar, pillarChecks[focusedPillar?.id]),
    [focusedPillar, pillarChecks]
  );

  // Keyboard navigation (Up/Down moves cleanly through the grouped pillars)
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

  // Cozy Ruh theme tokens
  const accentHex = isLightMode ? '#8a6220' : '#d4af6a';
  const textMain = isLightMode ? 'text-[#1c160f]' : 'text-[rgba(246,239,226,0.95)]';
  const textSub = isLightMode ? 'text-[#4e3f2b]' : 'text-[rgba(232,222,204,0.78)]';
  const textMuted = isLightMode ? 'text-[#665136]' : 'text-[rgba(218,205,184,0.68)]';

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
      {/* ====================================================================
          AMBIENT SANCTUARY BACKDROP (Matches Ruh's Calm Candlelit Atmosphere)
      ==================================================================== */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none overflow-hidden"
      >
        <img
          src={bgIllustration}
          alt=""
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover scale-105 transition-opacity duration-700 ${
            isLightMode ? 'opacity-[0.20] blur-[4px]' : 'opacity-[0.17] blur-[5px]'
          }`}
        />
        <div
          className="absolute inset-0"
          style={{
            background: isLightMode
              ? 'radial-gradient(ellipse 75% 65% at 50% 35%, rgba(252,248,239,0.58) 0%, rgba(243,235,219,0.94) 80%)'
              : 'radial-gradient(ellipse 76% 64% at 50% 32%, rgba(212,175,106,0.11) 0%, rgba(11,14,22,0.92) 78%)',
          }}
        />
      </div>

      {/* ====================================================================
          1. MINIMAL DUOLINGO-STYLE TOP BAR (Back Button + Segmented Progress)
      ==================================================================== */}
      <header
        className="relative z-20 shrink-0 px-4 sm:px-8 pb-1 flex items-center justify-between gap-4"
        style={{ paddingTop: 'calc(12px + var(--sat))' }}
      >
        {/* Back Button */}
        <div className="shrink-0">
          {onBack && (
            <button
              type="button"
              data-testid="learning-path-back"
              aria-label="Back to Sanctuary"
              onClick={onBack}
              className={`min-h-[40px] pl-2.5 pr-3.5 rounded-full border flex items-center gap-1 font-serif-eng text-[12px] tracking-[0.06em] whitespace-nowrap transition cursor-pointer active:scale-95 ${
                isLightMode
                  ? 'bg-white/75 hover:bg-white/95 border-[#9c7533]/24 text-[#2b1f11] island-light'
                  : 'bg-[#12100d]/72 hover:bg-[#1a1612]/90 border-white/[0.12] text-[#efe5d4] island-dark'
              }`}
            >
              <ChevronLeftIcon size={15} style={{ color: accentHex }} />
              <span>Back</span>
            </button>
          )}
        </div>

        {/* Sleek 4-Segment Lesson Progress Bar */}
        <div
          role="navigation"
          aria-label="Lesson progress steps"
          className="flex-1 max-w-[340px] flex items-center gap-1.5"
        >
          {LESSON_ONE_STEPS.slice(0, 4).map((step, idx) => {
            const isPast = stepIndex > idx;
            const isCurrent = stepIndex === idx;
            return (
              <button
                key={step.id}
                type="button"
                aria-label={`Go to ${step.label}`}
                aria-current={isCurrent ? 'step' : undefined}
                data-testid={`lesson-step-bar-${step.id}`}
                onClick={() => goToStep(idx)}
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

        {/* Quiet Unboxed Step Counter */}
        <span
          data-testid="lesson-step-counter"
          className={`shrink-0 font-serif-eng text-[12px] tabular-nums whitespace-nowrap ${textSub}`}
        >
          {stepMeta.isCompleteStep
            ? 'Done'
            : `${stepMeta.displayNumber} / ${stepMeta.totalLearningSteps}`}
        </span>
      </header>

      {/* ====================================================================
          2. ZERO-SCROLL CENTERED STUDY STAGE
      ==================================================================== */}
      <main
        data-testid="active-pillar-stage"
        className="relative z-10 flex-1 min-h-0 flex flex-col items-center justify-center px-4 sm:px-8 py-1 overflow-hidden"
      >
        {/* === STUDY STEPS: GROUPED 5 PILLARS OF ISLAM OR 6 PILLARS OF FAITH === */}
        {isStudyStep && focusedPillar && (
          <div
            key={currentStep.id}
            className={`w-full ${
              isImanStudy ? 'max-w-[748px]' : 'max-w-[680px]'
            } mx-auto flex flex-col gap-2.5 sm:gap-4 ${stageAnimClass}`}
          >
            {/* A. TOP OF MAIN CONTENT: ONLY A PROMINENT HEADING + SMALL CONTEXT */}
            <div className="text-center px-1">
              <span
                dir="rtl"
                className="font-calligraphy text-[20px] sm:text-[26px] leading-snug block"
                style={{ color: accentHex }}
              >
                {activeGroupInfo.arabic}
              </span>
              <h1
                id="learning-path-heading"
                className="font-serif-eng text-[24px] sm:text-[34px] font-semibold leading-tight mt-0.5 text-balance"
              >
                {activeGroupInfo.title}
              </h1>
              <p
                className={`font-serif-eng italic text-[12.5px] sm:text-[14.5px] leading-snug mt-0.5 sm:mt-1 max-w-[540px] mx-auto ${textSub}`}
              >
                {activeGroupInfo.summary}
              </p>
            </div>

            {/* B. CENTER: GROUPED PILLARS IN PRAYER-CHECKLIST FROSTED STACK */}
            <div
              role="listbox"
              aria-label={activeGroupInfo.title}
              data-testid={`grouped-list-${activeGroupInfo.id}`}
              className={
                isImanStudy
                  ? 'grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2.5 w-full'
                  : 'flex flex-col gap-1.5 sm:gap-2 w-full'
              }
            >
              {activeGroupItems.map((item, idx) => {
                const isSelected = item.id === focusedPillar.id;
                const isDiscovered = discoveredIds.includes(item.id);

                const rowSurface = isLightMode
                  ? isSelected
                    ? 'bg-white/92 border-[#9c7533]/52 island-light'
                    : 'bg-white/68 hover:bg-white/84 border-[#9c7533]/18'
                  : isSelected
                  ? 'bg-[#d4af6a]/15 border-[#d4af6a]/48 island-dark'
                  : 'bg-[#0e121c]/74 hover:bg-[#141926]/86 border-white/[0.11]';

                return (
                  <button
                    key={item.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    data-testid={`landmark-${item.id}`}
                    data-discovered={isDiscovered ? 'true' : 'false'}
                    onClick={() => handleSelectPillar(item)}
                    style={{
                      '--row-delay': `${idx * 42}ms`,
                      transform: isSelected ? 'scale(1.012)' : 'scale(0.992)',
                    }}
                    className={`group relative w-full ${
                      isImanStudy
                        ? 'h-[42px] sm:h-[60px] px-3 sm:px-4'
                        : 'h-[45px] sm:h-[52px] px-3.5 sm:px-4'
                    } rounded-2xl border flex items-center justify-between gap-2.5 overflow-hidden cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] animate-lesson-row ${rowSurface}`}
                  >
                    {/* Tactile Gold Shimmer Sweep When Active */}
                    {isSelected && (
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-y-0 left-0 w-1/2 animate-lesson-shimmer"
                        style={{
                          background: isLightMode
                            ? 'linear-gradient(90deg, transparent, rgba(156,117,51,0.16), transparent)'
                            : 'linear-gradient(90deg, transparent, rgba(212,175,106,0.20), transparent)',
                        }}
                      />
                    )}

                    {/* Left: Check Icon + Title & Concise Meaning */}
                    <div className="flex items-center gap-2.5 min-w-0 relative z-10">
                      <div className="shrink-0 w-5 h-5 flex items-center justify-center">
                        {isSelected ? (
                          <CheckCircleIcon
                            size={16}
                            className="animate-[checkmarkPop_0.36s_cubic-bezier(0.34,1.56,0.64,1)_forwards]"
                            style={{ color: accentHex }}
                          />
                        ) : isDiscovered ? (
                          <CheckCircleIcon
                            size={15}
                            className="opacity-75"
                            style={{ color: accentHex }}
                          />
                        ) : (
                          <CircleOutlineIcon
                            size={15}
                            className={
                              isLightMode
                                ? 'text-[#4a453d]/32 group-hover:text-[#9c7533]/80'
                                : 'text-[#e4dac8]/30 group-hover:text-[#d4af6a]/85'
                            }
                          />
                        )}
                      </div>

                      {isImanStudy ? (
                        <div className="flex flex-col items-start min-w-0 leading-tight">
                          <span
                            className="font-serif-eng text-[13.5px] sm:text-[14.5px] font-semibold truncate max-w-full"
                            style={{ color: isSelected ? accentHex : undefined }}
                          >
                            {item.regionOrder}. {item.title}
                          </span>
                          <span
                            className={`hidden sm:block font-serif-eng italic text-[11.5px] leading-snug truncate max-w-full ${textMuted}`}
                          >
                            {item.englishMeaning}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-baseline gap-1.5 min-w-0 truncate">
                          <span
                            className="font-serif-eng text-[14px] sm:text-[15.5px] font-semibold truncate"
                            style={{ color: isSelected ? accentHex : undefined }}
                          >
                            {item.regionOrder}. {item.title}
                          </span>
                          <span
                            className={`font-serif-eng italic text-[11.5px] sm:text-[12.5px] truncate ${textMuted}`}
                          >
                            · {item.englishMeaning}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Right: Arabic Calligraphy */}
                    <span
                      dir="rtl"
                      className={`font-calligraphy ${
                        isImanStudy
                          ? 'text-[15px] sm:text-[17px]'
                          : 'text-[16px] sm:text-[19px]'
                      } leading-none shrink-0 relative z-10 transition-opacity ${
                        isSelected ? 'opacity-100' : 'opacity-72 group-hover:opacity-95'
                      }`}
                      style={{ color: accentHex }}
                    >
                      {item.arabic}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* C. BELOW MAIN TOPIC: SMOOTH CONTEXT & INLINE QUICK-CHECK TRAY */}
            <section
              key={`${focusedPillar.id}-${contextMode}`}
              data-testid="pillar-context-tray"
              className={`w-full rounded-2xl border px-4 sm:px-5 py-3 sm:py-4 animate-lesson-context ${
                isLightMode
                  ? 'bg-[#faf4e8]/88 border-[#7c5a1e]/20 shadow-[0_12px_34px_rgba(62,42,16,0.08)]'
                  : 'bg-[#11141e]/84 border-[#d4af6a]/20 shadow-[0_14px_38px_rgba(0,0,0,0.48)]'
              }`}
              style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
            >
              {/* Quiet Metadata & Inline Context / Quick Check Toggle */}
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-current/10">
                <span className={`font-serif-eng text-[11.5px] sm:text-[12px] truncate ${textSub}`}>
                  <strong className="font-semibold" style={{ color: accentHex }}>
                    {focusedPillar.title}
                  </strong>
                  <span aria-hidden="true"> · </span>
                  <span className="italic sm:hidden">{focusedPillar.englishMeaning}</span>
                  <span className="italic hidden sm:inline">
                    {focusedPillar.classicalProof?.source}
                  </span>
                </span>

                <button
                  type="button"
                  data-testid="toggle-inline-check-btn"
                  onClick={() => {
                    hapticTapLight();
                    setContextMode((m) => (m === 'context' ? 'check' : 'context'));
                  }}
                  className="shrink-0 font-serif-eng text-[11.5px] font-semibold whitespace-nowrap underline-offset-4 hover:underline cursor-pointer"
                  style={{ color: accentHex }}
                >
                  {contextMode === 'context' ? 'Quick check' : 'Back to context'}
                </button>
              </div>

              {contextMode === 'context' ? (
                <div className="pt-2.5 flex flex-col gap-1.5">
                  <p
                    dir="rtl"
                    className="font-calligraphy text-[17px] sm:text-[21px] leading-snug text-center line-clamp-2"
                    style={{ color: accentHex }}
                  >
                    {focusedPillar.arabicFormula}
                  </p>
                  <p className={`font-serif-eng italic text-[12px] sm:text-[13.5px] text-center leading-snug line-clamp-2 ${textSub}`}>
                    {focusedPillar.formulaTranslation}
                  </p>
                  <p className="font-serif-eng text-[12.5px] sm:text-[13.5px] text-center leading-snug line-clamp-2 pt-0.5">
                    {focusedPillar.recognitionCue}
                  </p>
                </div>
              ) : (
                <div data-testid="inline-pillar-check" className="pt-2 space-y-1.5">
                  <p className="font-serif-eng text-[13px] sm:text-[14px] font-semibold leading-snug">
                    {focusedPillar.checkQuestion?.prompt}
                  </p>
                  <div className="grid grid-cols-1 gap-1.5">
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
                          className={`w-full rounded-xl border px-3 py-1.5 text-left font-serif-eng text-[12px] sm:text-[12.5px] leading-snug transition cursor-pointer flex items-start gap-2 ${optClass}`}
                        >
                          <span className="font-bold shrink-0" style={{ color: accentHex }}>
                            {String.fromCharCode(65 + optIdx)}.
                          </span>
                          <span className="line-clamp-2">{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                  {inlineCheckEval.answered && (
                    <p
                      className={`font-serif-eng text-[11.5px] sm:text-[12px] leading-snug pt-0.5 ${textSub}`}
                    >
                      <strong style={{ color: accentHex }}>
                        {inlineCheckEval.isCorrect ? 'Correct · ' : 'Hint · '}
                      </strong>
                      {inlineCheckEval.explanation}
                    </p>
                  )}
                </div>
              )}
            </section>
          </div>
        )}

        {/* === QUIZ STEP I: PILLARS OF ISLAM === */}
        {currentStep.id === 'islam-quiz' && (
          <LessonQuizStage
            groupTitle="Part I · The Five Pillars of Islam"
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
            groupTitle="Part II · The Six Pillars of Faith"
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
            onRestart={() => {
              hapticTapLight();
              setGroupQuizAnswers({});
              setStepDirection(-1);
              setStepIndex(0);
            }}
            onExit={onBack}
          />
        )}
      </main>

      {/* ====================================================================
          3. CLEAN BOTTOM STEP ACTION BAR (Only on Study & Quiz Steps)
      ==================================================================== */}
      {currentStep.id !== 'complete' && (
        <footer
          className="relative z-20 shrink-0 px-4 sm:px-8 pt-1.5"
          style={{ paddingBottom: 'calc(14px + var(--sab))' }}
        >
          <div
            className={`w-full ${
              isImanStudy ? 'max-w-[748px]' : 'max-w-[680px]'
            } mx-auto flex items-center justify-between gap-3`}
          >
            {stepIndex > 0 ? (
              <button
                type="button"
                data-testid="lesson-prev-step-btn"
                onClick={handleStepBackward}
                className={`min-h-[44px] px-4 rounded-2xl border font-serif-eng text-[12.5px] font-medium flex items-center gap-1 whitespace-nowrap transition cursor-pointer active:scale-95 ${
                  isLightMode
                    ? 'bg-white/75 hover:bg-white/95 border-[#9c7533]/24 text-[#2b1f11]'
                    : 'bg-[#12100d]/72 hover:bg-[#1a1612] border-white/[0.12] text-[#efe5d4]'
                }`}
              >
                <ChevronLeftIcon size={14} style={{ color: accentHex }} />
                <span>Previous</span>
              </button>
            ) : (
              <span className={`font-serif-eng italic text-[12px] hidden sm:inline ${textMuted}`}>
                Tap any pillar to explore its context
              </span>
            )}

            {isStudyStep ? (
              <button
                type="button"
                data-testid="lesson-continue-btn"
                onClick={handleStepForward}
                className={`min-h-[44px] px-5 sm:px-6 rounded-2xl font-serif-eng text-[13px] font-semibold tracking-[0.04em] flex items-center justify-center gap-1.5 whitespace-nowrap transition cursor-pointer active:scale-[0.98] ml-auto ${
                  isLightMode
                    ? 'bg-[#463219] text-[#faf3e4] hover:bg-[#594020] shadow-[0_8px_24px_rgba(70,50,25,0.22)]'
                    : 'bg-[#d4af6a] text-[#17120c] hover:bg-[#e1be7c] shadow-[0_8px_24px_rgba(212,175,106,0.22)]'
                }`}
              >
                <span>Check Understanding</span>
                <ChevronRightIcon size={15} />
              </button>
            ) : (
              <button
                type="button"
                data-testid="lesson-skip-quiz-btn"
                onClick={handleStepForward}
                className={`min-h-[44px] px-4 font-serif-eng text-[12.5px] whitespace-nowrap transition cursor-pointer ml-auto hover:underline underline-offset-4 ${textSub}`}
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
