import { memo, useMemo, useState, useRef, useEffect } from 'react';
import {
  BookIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  EditIcon,
  PlusIcon,
  RotateCcwIcon,
  TrashIcon,
} from '../icons/Icons';
import { PRACTICE_SETS } from '../../data/adhkarData';
import { resolveRecommendedAdhkarPeriod } from '../../utils/prayerWindowLogic';
import { resolveAutopilotPracticeTab } from '../../utils/autopilotLogic';
import { isPointerDrag } from '../../utils/smoothInteractionLogic';
import {
  HABIT_STATUS_FILTERS,
  computeDailyPracticeOverview,
  filterHabitsByStatus,
  formatHabitMeta,
  resolveNextPracticeSuggestion,
  resolveVisiblePracticeTab,
} from '../../utils/tasksPageLogic';
import { HabitEditorSheet } from './HabitEditorSheet';
import { TasksIntentionsPanel } from './TasksIntentionsPanel';
import {
  hapticDestructive,
  hapticDetent,
  hapticDismiss,
  hapticHeavy,
  hapticNavigate,
  hapticTapLight,
  hapticTaskComplete,
  hapticToggle,
  hapticUndo,
  hapticWarning,
} from '../../utils/haptics';
import { playTaskTickOffCue } from '../../utils/tactileAudio';
import {
  useOptionalHabits,
  useOptionalPreferences,
  useOptionalSanctuary,
} from '../../context/sanctuaryStore';

const BeadsMiniIcon = ({ size = 14, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <circle cx="12" cy="5.5" r="2.2" />
    <circle cx="17.8" cy="9.5" r="2.2" />
    <circle cx="15.8" cy="16.2" r="2.2" />
    <circle cx="8.2" cy="16.2" r="2.2" />
    <circle cx="6.2" cy="9.5" r="2.2" />
    <path d="M12 18.4v3.1" />
  </svg>
);

const DESKTOP_PRACTICE_TABS = [
  { id: 'habits', label: 'Habits' },
  { id: 'wird', label: 'Wird' },
  { id: 'sabah', label: 'Morning' },
  { id: 'masa', label: 'Evening' },
];

const MOBILE_PRACTICE_TABS = [
  { id: 'habits', label: 'Habits' },
  { id: 'today', label: 'Today' },
  { id: 'wird', label: 'Wird' },
  { id: 'sabah', label: 'Morning' },
  { id: 'masa', label: 'Evening' },
];

export const TasksView = memo(({
  currentView,
  isLightMode: isLightModeProp,
  dailyTasks,
  rewardedSets = [],
  incrementTask,
  markAdhkarSetRewarded,
  onOpenMisbaha,
  habits: habitsProp,
  dailyHabitLogs: dailyHabitLogsProp,
  onLogHabitStep: onLogHabitStepProp,
  onAddCustomHabit: onAddCustomHabitProp,
  onUpdateHabit: onUpdateHabitProp,
  onReorderHabit: onReorderHabitProp,
  onResetDefaultHabits: onResetDefaultHabitsProp,
  onRemoveHabit: onRemoveHabitProp,
  dailyIntention: dailyIntentionProp,
  onSetDailyIntention: onSetDailyIntentionProp,
  sunnahContext,
  todaySchedule = null,
  qadaRemainingCount = 0,
  onOpenDuas,
  onOpenQada,
}) => {
  const sanctuaryCtx = useOptionalSanctuary();
  const prefsCtx = useOptionalPreferences();
  const habitsCtx = useOptionalHabits();
  const autopilot = sanctuaryCtx?.devotionData?.autopilot;

  const isLightMode = isLightModeProp ?? prefsCtx?.isLightMode ?? false;
  const habits = useMemo(() => habitsProp ?? habitsCtx?.habits ?? [], [habitsProp, habitsCtx]);
  const dailyHabitLogs = useMemo(
    () => dailyHabitLogsProp ?? habitsCtx?.dailyHabitLogs ?? {},
    [dailyHabitLogsProp, habitsCtx]
  );
  const dailyTodos = useMemo(() => habitsCtx?.dailyTodos ?? [], [habitsCtx]);
  const onLogHabitStep = onLogHabitStepProp ?? habitsCtx?.logHabitStep;
  const onReorderHabit = onReorderHabitProp ?? habitsCtx?.reorderHabit;
  const onResetDefaultHabits = onResetDefaultHabitsProp ?? habitsCtx?.resetDefaultHabits;
  const onRemoveHabit = onRemoveHabitProp ?? habitsCtx?.removeHabit;
  const dailyIntention = dailyIntentionProp ?? habitsCtx?.dailyIntention ?? '';
  const onSetDailyIntention = onSetDailyIntentionProp ?? habitsCtx?.setDailyIntention;

  const tTextMain = isLightMode ? 'text-[#1c160f]' : 'text-[rgba(246,239,226,0.95)]';
  const tTextSub = isLightMode ? 'text-[#4e3f2b]' : 'text-[rgba(232,222,204,0.80)]';
  const tTextMuted = isLightMode ? 'text-[#665136]' : 'text-[rgba(218,205,184,0.66)]';
  const hairline = isLightMode ? 'border-[#8a6220]/14' : 'border-white/[0.09]';
  const divideLine = isLightMode ? 'divide-[#8a6220]/10' : 'divide-white/[0.07]';
  const glowSub = isLightMode ? '0 1px 2px rgba(255,255,255,0.75)' : '0 1px 3px rgba(0,0,0,0.65)';

  const recommendedWindow = resolveRecommendedAdhkarPeriod(new Date(), todaySchedule);
  const recommendedPeriod = recommendedWindow.setId;

  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(min-width: 1024px)').matches
      : true
  );
  const [activeSetId, setActiveSetId] = useState('habits');
  const [habitFilter, setHabitFilter] = useState('all');
  const [isCustomizingHabits, setIsCustomizingHabits] = useState(false);
  const [habitEditor, setHabitEditor] = useState(null);
  const [intentionDraft, setIntentionDraft] = useState(dailyIntention || '');
  const [expandedDhikrId, setExpandedDhikrId] = useState(null);

  const longPressTimer = useRef(null);
  const pressOriginRef = useRef(null);
  const pressDraggedRef = useRef(false);
  const wasTasksActiveRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(min-width: 1024px)');
    const handleChange = (e) => setIsDesktop(e.matches);
    setIsDesktop(mq.matches);
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    setIntentionDraft(dailyIntention || '');
  }, [dailyIntention]);

  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    };
  }, []);

  useEffect(() => {
    ['sabah', 'masa'].forEach((setKey) => {
      const items = PRACTICE_SETS[setKey].items;
      const done = items.every((item) => (dailyTasks[item.id] || 0) >= item.target);
      if (done && !rewardedSets.includes(setKey) && markAdhkarSetRewarded) {
        markAdhkarSetRewarded(setKey);
      }
    });
  }, [dailyTasks, rewardedSets, markAdhkarSetRewarded]);

  const isTasksActive = currentView === 'tasks';

  useEffect(() => {
    const wasActive = wasTasksActiveRef.current;
    wasTasksActiveRef.current = isTasksActive;
    if (isTasksActive && !wasActive && autopilot?.enabled && autopilot?.autoFocusPractice) {
      const nextTab = resolveAutopilotPracticeTab({
        autopilot,
        recommendedPeriod,
        dailyTasks,
        practiceSets: PRACTICE_SETS,
      });
      setActiveSetId(nextTab);
    }
  }, [isTasksActive, autopilot, recommendedPeriod, dailyTasks]);

  const effectiveTab = resolveVisiblePracticeTab(activeSetId, isDesktop);
  const isHabitsTab = effectiveTab === 'habits';
  const isTodayTab = effectiveTab === 'today';
  const activeSet = PRACTICE_SETS[effectiveTab] || PRACTICE_SETS.wird;
  const activeItems = activeSet.items;

  const overview = useMemo(
    () =>
      computeDailyPracticeOverview({
        habits,
        dailyHabitLogs,
        dailyTasks,
        dailyTodos,
        practiceSets: PRACTICE_SETS,
        recommendedSetId: recommendedPeriod,
      }),
    [habits, dailyHabitLogs, dailyTasks, dailyTodos, recommendedPeriod]
  );

  const nextSuggestion = useMemo(
    () =>
      resolveNextPracticeSuggestion({
        habits,
        dailyHabitLogs,
        dailyTasks,
        recommendedWindow,
        practiceSets: PRACTICE_SETS,
      }),
    [habits, dailyHabitLogs, dailyTasks, recommendedWindow]
  );

  const visibleHabits = useMemo(
    () =>
      isCustomizingHabits
        ? habits
        : filterHabitsByStatus(habits, habitFilter, dailyHabitLogs),
    [habits, habitFilter, dailyHabitLogs, isCustomizingHabits]
  );

  const cancelPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    pressOriginRef.current = null;
  };

  const startPress = (e, index, current, target) => {
    if (current >= target) return;
    cancelPress();
    pressDraggedRef.current = false;
    pressOriginRef.current = { x: e.clientX, y: e.clientY };

    longPressTimer.current = setTimeout(() => {
      if (pressDraggedRef.current) return;
      onOpenMisbaha?.({ setId: effectiveTab, initialIndex: index });
      longPressTimer.current = null;
      pressOriginRef.current = null;
      hapticHeavy();
    }, 450);
  };

  const movePress = (e) => {
    if (!pressOriginRef.current) return;
    if (isPointerDrag(pressOriginRef.current.x, pressOriginRef.current.y, e.clientX, e.clientY, 10)) {
      pressDraggedRef.current = true;
      cancelPress();
    }
  };

  const endPress = (id, current, target) => {
    if (current >= target) return;
    const hadPending = Boolean(longPressTimer.current);
    const wasDragged = pressDraggedRef.current;
    cancelPress();
    if (hadPending && !wasDragged) {
      if (current + 1 >= target) {
        hapticTaskComplete();
        playTaskTickOffCue({ kind: 'dhikr' });
      } else {
        hapticTapLight();
      }
      incrementTask(id, 1);
    }
  };

  const launchSequenceInMisbaha = (explicitIndex = null) => {
    hapticNavigate();
    const firstIncomplete = activeItems.findIndex((item) => (dailyTasks[item.id] || 0) < item.target);
    const initialIndex =
      typeof explicitIndex === 'number'
        ? explicitIndex
        : firstIncomplete >= 0
          ? firstIncomplete
          : 0;
    onOpenMisbaha?.({
      setId: effectiveTab,
      initialIndex,
    });
  };

  const handleCompleteHabitNow = (habit, remainingSteps) => {
    if (!habit || remainingSteps <= 0) return;
    hapticTaskComplete();
    playTaskTickOffCue({ kind: 'habit' });
    onLogHabitStep?.(habit.id, remainingSteps);
  };

  const handleCompleteDhikrNow = (task, remainingSteps) => {
    if (!task || remainingSteps <= 0) return;
    hapticTaskComplete();
    playTaskTickOffCue({ kind: 'dhikr' });
    incrementTask?.(task.id, remainingSteps);
  };

  const accentHex = isLightMode ? '#8a6220' : '#d4af6a';

  const cardSurface = isLightMode
    ? `bg-[#fbf7ee]/86 border-[#8a6220]/18 ${isTasksActive ? 'island-light' : ''}`
    : `bg-[#0d111c]/82 border-white/[0.10] ${isTasksActive ? 'island-dark' : ''}`;

  // Progress ring geometry
  const ringR = 15;
  const ringCirc = 2 * Math.PI * ringR;
  const ringPct = Math.min(1, Math.max(0, overview.percentage / 100));

  const practiceTabs = isDesktop ? DESKTOP_PRACTICE_TABS : MOBILE_PRACTICE_TABS;
  const activeSetBadge = overview.badges[effectiveTab] || { completed: 0, total: 0, isDone: false };

  const getTabBadge = (tabId) => {
    if (tabId === 'today') {
      return {
        completed: overview.todosCompleted,
        total: overview.todosTotal,
        isDone: overview.todosTotal > 0 && overview.todosCompleted >= overview.todosTotal,
      };
    }
    return overview.badges[tabId] || { completed: 0, total: 0, isDone: false };
  };

  const headerArabic = isHabitsTab
    ? 'العَادَات'
    : isTodayTab
      ? 'النِّيَّة'
      : activeSet.arabicTitle;
  const headerSubtitle = isHabitsTab
    ? 'Daily Sunnah & Habits'
    : isTodayTab
      ? 'Today’s Intentions'
      : activeSet.subtitle;

  return (
    <div
      data-testid="tasks-scroller"
      className="absolute inset-x-0 bottom-0 flex flex-col items-center transition-[opacity,transform,visibility] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] w-full overflow-hidden pt-1.5 lg:pt-2"
      style={{
        top: 'calc(70px + var(--sat))',
        paddingBottom: 'calc(12px + var(--sab))',
        opacity: isTasksActive ? 1 : 0,
        visibility: isTasksActive ? 'visible' : 'hidden',
        transform: isTasksActive ? 'scale(1)' : 'scale(1.015)',
        pointerEvents: isTasksActive ? 'auto' : 'none',
      }}
    >
      <div className="w-full h-full min-h-0 max-w-[960px] px-1 sm:px-3 md:px-4 mx-auto flex flex-col gap-2 lg:gap-3.5">
        {/* ====================================================================
            1. FIXED-VIEWPORT MASTHEAD + DAILY MOMENTUM SUMMARY
        ==================================================================== */}
        {isDesktop ? (
          <header className="shrink-0 w-full grid grid-cols-[minmax(0,1fr)_316px] items-end gap-5 pt-0.5">
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span
                  className="font-calligraphy text-[24px] leading-none"
                  style={{ color: accentHex, textShadow: glowSub }}
                  dir="rtl"
                >
                  {headerArabic}
                </span>
                <span aria-hidden="true" className={`opacity-35 ${tTextMuted}`}>
                  ·
                </span>
                <span className={`font-serif-eng text-[12.5px] ${tTextSub}`} style={{ textShadow: glowSub }}>
                  {headerSubtitle}
                </span>
              </div>

              <div className="flex items-baseline gap-3 mt-0.5 min-w-0">
                <h1
                  className={`font-serif-eng text-[27px] font-semibold leading-tight shrink-0 ${tTextMain}`}
                  style={{ textShadow: glowSub }}
                >
                  Daily Practices
                </h1>
                {sunnahContext?.primaryPrompt && (
                  <p
                    className={`font-serif-eng italic text-[12.5px] leading-snug truncate ${tTextSub}`}
                    style={{ textShadow: glowSub }}
                  >
                    <span className="not-italic font-semibold mr-1.5" style={{ color: accentHex }}>
                      {sunnahContext.primaryPrompt.label}
                    </span>
                    {sunnahContext.primaryPrompt.detail}
                  </p>
                )}
              </div>
            </div>

            {/* Aligned Daily Progress Summary Card (316px Companion Column Width) */}
            <div
              data-testid="tasks-daily-summary"
              className={`w-full rounded-[20px] border px-3.5 py-2.5 flex items-center justify-between gap-2.5 transition-colors ${cardSurface}`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
                  <svg className="w-9 h-9 -rotate-90" viewBox="0 0 38 38" aria-hidden="true">
                    <circle
                      cx="19"
                      cy="19"
                      r={ringR}
                      fill="none"
                      stroke={isLightMode ? 'rgba(138,98,32,0.16)' : 'rgba(255,255,255,0.12)'}
                      strokeWidth="2.4"
                    />
                    {ringPct > 0 && (
                      <circle
                        cx="19"
                        cy="19"
                        r={ringR}
                        fill="none"
                        stroke={accentHex}
                        strokeWidth="2.6"
                        strokeLinecap="round"
                        strokeDasharray={ringCirc}
                        strokeDashoffset={ringCirc * (1 - ringPct)}
                        className="transition-all duration-500 ease-out"
                      />
                    )}
                  </svg>
                  <span
                    className={`absolute font-serif-eng text-[10.5px] font-semibold tabular-nums ${tTextMain}`}
                  >
                    {overview.percentage}%
                  </span>
                </div>

                <div className="min-w-0">
                  <p className={`font-serif-eng text-[13.5px] font-semibold leading-tight truncate ${tTextMain}`}>
                    {overview.allComplete
                      ? 'All practices complete'
                      : `${overview.completedAll} of ${overview.totalAll} completed`}
                  </p>
                  <p className={`font-serif-eng text-[12px] leading-snug truncate mt-0.5 ${tTextMuted}`}>
                    {nextSuggestion.kind === 'complete'
                      ? nextSuggestion.detail
                      : `${nextSuggestion.label.replace(/\s+window$/i, '')} · ${nextSuggestion.detail}`}
                  </p>
                </div>
              </div>

              {nextSuggestion.actionLabel && nextSuggestion.tabId !== effectiveTab && (
                <button
                  type="button"
                  data-testid="adhkar-window-cue"
                  aria-label={nextSuggestion.actionLabel}
                  onClick={() => {
                    hapticDetent();
                    setActiveSetId(nextSuggestion.tabId);
                    setExpandedDhikrId(null);
                  }}
                  className="min-h-[36px] px-3 rounded-xl font-serif-eng text-[12px] font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors active:scale-95"
                  style={{
                    backgroundColor: isLightMode ? 'rgba(138,98,32,0.12)' : 'rgba(212,175,106,0.18)',
                    color: accentHex,
                  }}
                >
                  Open
                </button>
              )}
            </div>
          </header>
        ) : (
          /* Compact Single-Row Mobile Masthead + Inline Progress Ring */
          <header
            data-testid="tasks-daily-summary"
            className="shrink-0 w-full flex items-center justify-between gap-2 px-0.5 pt-0.5"
          >
            <div className="min-w-0">
              <h1
                className={`font-serif-eng text-[20px] font-semibold leading-tight whitespace-nowrap ${tTextMain}`}
                style={{ textShadow: glowSub }}
              >
                Daily Practices
              </h1>
              <div className="flex items-center gap-1.5 min-w-0 mt-0.5">
                <span
                  className="font-calligraphy text-[14px] leading-none shrink-0"
                  style={{ color: accentHex, textShadow: glowSub }}
                  dir="rtl"
                >
                  {headerArabic}
                </span>
                <span aria-hidden="true" className={`opacity-40 text-[11px] shrink-0 ${tTextMuted}`}>
                  ·
                </span>
                <p
                  className={`font-serif-eng text-[11.5px] leading-snug truncate ${tTextSub}`}
                  style={{ textShadow: glowSub }}
                >
                  {overview.allComplete
                    ? 'All practices complete'
                    : `${overview.completedAll} of ${overview.totalAll} completed`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {nextSuggestion.actionLabel && nextSuggestion.tabId !== effectiveTab && (
                <button
                  type="button"
                  data-testid="adhkar-window-cue"
                  aria-label={nextSuggestion.actionLabel}
                  onClick={() => {
                    hapticDetent();
                    setActiveSetId(nextSuggestion.tabId);
                    setExpandedDhikrId(null);
                  }}
                  className="min-h-[34px] px-2.5 rounded-xl font-serif-eng text-[11.5px] font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors active:scale-95"
                  style={{
                    backgroundColor: isLightMode ? 'rgba(138,98,32,0.14)' : 'rgba(212,175,106,0.18)',
                    color: accentHex,
                  }}
                >
                  Open
                </button>
              )}

              <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
                <svg className="w-9 h-9 -rotate-90" viewBox="0 0 38 38" aria-hidden="true">
                  <circle
                    cx="19"
                    cy="19"
                    r={ringR}
                    fill="none"
                    stroke={isLightMode ? 'rgba(138,98,32,0.18)' : 'rgba(255,255,255,0.14)'}
                    strokeWidth="2.4"
                  />
                  {ringPct > 0 && (
                    <circle
                      cx="19"
                      cy="19"
                      r={ringR}
                      fill="none"
                      stroke={accentHex}
                      strokeWidth="2.6"
                      strokeLinecap="round"
                      strokeDasharray={ringCirc}
                      strokeDashoffset={ringCirc * (1 - ringPct)}
                      className="transition-all duration-500 ease-out"
                    />
                  )}
                </svg>
                <span
                  className={`absolute font-serif-eng text-[10px] font-semibold tabular-nums ${tTextMain}`}
                >
                  {overview.percentage}%
                </span>
              </div>
            </div>
          </header>
        )}

        {/* ====================================================================
            2. VIEWPORT-LOCKED WORKSPACE (Zero Outer Page Scroll)
        ==================================================================== */}
        <div
          className={`flex-1 min-h-0 w-full grid gap-3 lg:gap-5 items-stretch ${
            isDesktop ? 'grid-cols-[minmax(0,1fr)_316px]' : 'grid-cols-1'
          }`}
        >
          {/* LEFT / PRIMARY COLUMN: Segmented Switcher + Viewport-Fitted Ledger */}
          <div className="min-w-0 min-h-0 flex flex-col gap-2 lg:gap-2.5">
            {/* Segmented Practice Switcher (4 tabs desktop / 5 tabs mobile with Today) */}
            <div
              role="tablist"
              aria-label="Practice categories"
              className={`shrink-0 w-full grid p-1 rounded-2xl border backdrop-blur-md transition-colors ${
                isDesktop ? 'grid-cols-4' : 'grid-cols-5'
              } ${
                isLightMode
                  ? 'bg-[#e9e1d2]/85 border-[#8a6220]/16'
                  : 'bg-[#0b0f19]/82 border-white/[0.10]'
              }`}
            >
              {practiceTabs.map((tab) => {
                const isActive = effectiveTab === tab.id;
                const isLiveWindow = tab.id === recommendedPeriod && recommendedWindow.shortTag === 'Now';
                const badge = getTabBadge(tab.id);

                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    data-testid={`tasks-tab-${tab.id}`}
                    aria-selected={isActive}
                    onClick={() => {
                      if (effectiveTab !== tab.id) {
                        hapticDetent();
                        setActiveSetId(tab.id);
                        setExpandedDhikrId(null);
                        if (tab.id !== 'habits') setIsCustomizingHabits(false);
                      }
                    }}
                    className={`relative min-h-[42px] lg:min-h-[40px] px-0.5 sm:px-2.5 rounded-xl font-serif-eng text-[11px] sm:text-[13px] cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 whitespace-nowrap transition-all ${
                      isActive
                        ? isLightMode
                          ? 'bg-[#fcfaf5] text-[#1c160f] font-semibold shadow-xs'
                          : 'bg-white/[0.14] text-[#f6efe2] font-semibold shadow-xs'
                        : isLightMode
                          ? 'text-[#4e3f2b] hover:text-[#1c160f]'
                          : 'text-[rgba(232,222,204,0.74)] hover:text-[#f6efe2]'
                    }`}
                  >
                    <span className="truncate">{tab.label}</span>
                    {badge.total > 0 && (
                      <span
                        className={`text-[10px] sm:text-[11.5px] tabular-nums leading-none ${
                          badge.isDone ? '' : 'opacity-65'
                        }`}
                        style={badge.isDone || isActive ? { color: accentHex } : undefined}
                      >
                        {badge.isDone ? '✓' : `${badge.completed}/${badge.total}`}
                      </span>
                    )}
                    {isLiveWindow && !isActive && (
                      <span
                        aria-hidden="true"
                        className="absolute top-1 left-1/2 -translate-x-1/2 h-[2px] w-3.5 rounded-full opacity-80"
                        style={{ backgroundColor: accentHex }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Main Practice Surface (Mobile Today Tab OR Habits/Adhkar Ledger) */}
            {!isDesktop && isTodayTab ? (
              <TasksIntentionsPanel
                isLightMode={isLightMode}
                accentHex={accentHex}
                isTasksActive={isTasksActive}
              />
            ) : (
              <section
                aria-label={isHabitsTab ? 'Daily Habits' : activeSet.label}
                className={`w-full flex-1 min-h-0 flex flex-col rounded-[22px] border overflow-hidden transition-colors duration-300 ${cardSurface}`}
              >
                {isHabitsTab ? (
                  <>
                    {/* Today's Niyyah (Intention) Row */}
                    <div
                      className={`shrink-0 px-3.5 sm:px-4 py-2 border-b flex items-center gap-2.5 ${hairline} ${
                        isLightMode ? 'bg-white/45' : 'bg-white/[0.02]'
                      }`}
                    >
                      <label
                        htmlFor="daily-niyyah-input"
                        className="font-serif-eng text-[12px] font-semibold shrink-0 whitespace-nowrap"
                        style={{ color: accentHex }}
                      >
                        Niyyah
                      </label>
                      <span className={`${tTextMuted} opacity-40`} aria-hidden="true">
                        ·
                      </span>
                      <input
                        id="daily-niyyah-input"
                        type="text"
                        maxLength={140}
                        value={intentionDraft}
                        onChange={(e) => setIntentionDraft(e.target.value)}
                        onBlur={() => {
                          if (intentionDraft !== dailyIntention) {
                            onSetDailyIntention?.(intentionDraft);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.currentTarget.blur();
                          }
                        }}
                        placeholder="Set a quiet intention for today..."
                        className={`flex-1 min-w-0 min-h-[32px] bg-transparent font-serif-eng text-[13.5px] sm:text-[14px] outline-none ${tTextMain} ${
                          isLightMode ? 'placeholder:text-[#665136]/60' : 'placeholder:text-[#e8decb]/56'
                        }`}
                      />
                    </div>

                    {/* Habits Filter & Quick Actions Toolbar (Always Crisp Single-Row) */}
                    <div
                      className={`shrink-0 px-3 sm:px-4 py-1.5 border-b flex items-center justify-between gap-1.5 ${hairline}`}
                    >
                      {isCustomizingHabits ? (
                        <span className={`font-serif-eng text-[12.5px] font-medium truncate ${tTextSub}`}>
                          Reorder, edit, or remove
                        </span>
                      ) : (
                        <div className="flex items-center gap-0.5 sm:gap-1 min-w-0" role="group" aria-label="Filter habits">
                          {HABIT_STATUS_FILTERS.map((f) => {
                            const active = habitFilter === f.id;
                            const mobileLabel =
                              f.id === 'remaining' ? 'Left' : f.id === 'done' ? 'Done' : f.label;
                            return (
                              <button
                                key={f.id}
                                type="button"
                                data-testid={`habit-filter-${f.id}`}
                                aria-pressed={active}
                                onClick={() => {
                                  hapticTapLight();
                                  setHabitFilter(f.id);
                                }}
                                className={`min-h-[34px] px-2 sm:px-2.5 rounded-lg font-serif-eng text-[12px] cursor-pointer whitespace-nowrap transition-colors ${
                                  active
                                    ? isLightMode
                                      ? 'bg-[#8a6220]/14 text-[#1c160f] font-semibold'
                                      : 'bg-[#d4af6a]/18 text-[#f6efe2] font-semibold'
                                    : `${tTextMuted} hover:opacity-100`
                                }`}
                              >
                                <span className="sm:hidden">{mobileLabel}</span>
                                <span className="hidden sm:inline">{f.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      <div className="flex items-center gap-1 sm:gap-1.5 ml-auto shrink-0">
                        {isCustomizingHabits ? (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                hapticWarning();
                                onResetDefaultHabits?.();
                              }}
                              className={`min-h-[34px] px-2.5 rounded-lg font-serif-eng text-[12px] flex items-center gap-1 cursor-pointer whitespace-nowrap transition-colors ${
                                isLightMode ? 'text-[#4e3f2b] hover:bg-black/5' : 'text-[#e8decb]/80 hover:bg-white/10'
                              }`}
                            >
                              <RotateCcwIcon size={12} />
                              <span>Reset</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                hapticDismiss();
                                setIsCustomizingHabits(false);
                              }}
                              className="min-h-[34px] px-3.5 rounded-xl font-serif-eng text-[12.5px] font-semibold cursor-pointer whitespace-nowrap"
                              style={{
                                backgroundColor: isLightMode ? '#463219' : '#d4af6a',
                                color: isLightMode ? '#faf3e4' : '#17120c',
                              }}
                            >
                              Done
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              data-testid="habits-customize-btn"
                              aria-label="Customize habits"
                              onClick={() => {
                                hapticToggle(true);
                                setIsCustomizingHabits(true);
                              }}
                              className={`min-h-[34px] min-w-[34px] px-2 sm:px-2.5 rounded-lg font-serif-eng text-[12.5px] flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors ${
                                isLightMode
                                  ? 'text-[#4e3f2b] hover:bg-black/5'
                                  : 'text-[rgba(232,222,204,0.82)] hover:bg-white/[0.08]'
                              }`}
                            >
                              <EditIcon size={13} />
                              <span className="hidden sm:inline">Customize</span>
                            </button>
                            <button
                              type="button"
                              data-testid="habits-add-btn"
                              aria-label="Add Habit"
                              onClick={() => {
                                hapticNavigate();
                                setHabitEditor({ mode: 'create' });
                              }}
                              className="min-h-[34px] px-2.5 sm:px-3 rounded-xl font-serif-eng text-[12px] sm:text-[12.5px] font-semibold flex items-center gap-1 cursor-pointer whitespace-nowrap transition-colors active:scale-95"
                              style={{
                                backgroundColor: isLightMode ? 'rgba(138,98,32,0.12)' : 'rgba(212,175,106,0.16)',
                                color: accentHex,
                              }}
                            >
                              <PlusIcon size={13} />
                              <span className="sm:hidden">Add</span>
                              <span className="hidden sm:inline">Add Habit</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Habits List (Contained Flex-Fitted Region) */}
                    {habits.length === 0 ? (
                      <div className="flex-1 min-h-0 px-6 py-8 text-center flex flex-col items-center justify-center gap-3.5">
                        <p className={`font-serif-eng italic text-[14px] leading-relaxed max-w-[38ch] ${tTextSub}`}>
                          Your habit list is clear. Add a personal daily practice or restore the starter Sunnah habits.
                        </p>
                        <div className="flex items-center gap-2.5 flex-wrap justify-center">
                          <button
                            type="button"
                            onClick={() => {
                              hapticNavigate();
                              setHabitEditor({ mode: 'create' });
                            }}
                            className="min-h-[40px] px-4 rounded-xl font-serif-eng text-[13px] font-semibold cursor-pointer flex items-center gap-1.5"
                            style={{
                              backgroundColor: isLightMode ? '#463219' : '#d4af6a',
                              color: isLightMode ? '#faf3e4' : '#17120c',
                            }}
                          >
                            <PlusIcon size={13} />
                            <span>Add Habit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              hapticWarning();
                              onResetDefaultHabits?.();
                            }}
                            className={`min-h-[40px] px-4 rounded-xl border font-serif-eng text-[13px] cursor-pointer ${
                              isLightMode ? 'border-black/15 text-[#2c2720]' : 'border-white/15 text-[#e4dac8]'
                            }`}
                          >
                            Restore Starters
                          </button>
                        </div>
                      </div>
                    ) : visibleHabits.length === 0 ? (
                      <div className="flex-1 min-h-0 px-6 py-8 text-center flex flex-col items-center justify-center gap-2.5">
                        <p className={`font-serif-eng text-[14.5px] ${tTextSub}`}>
                          {habitFilter === 'remaining'
                            ? 'Every habit is complete for today.'
                            : 'No completed habits yet today.'}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            hapticTapLight();
                            setHabitFilter('all');
                          }}
                          className="min-h-[38px] px-3 font-serif-eng text-[13px] font-medium hover:underline underline-offset-4 cursor-pointer"
                          style={{ color: accentHex }}
                        >
                          Show all habits
                        </button>
                      </div>
                    ) : (
                      <div
                        data-testid="habits-list-region"
                        className={`flex-1 min-h-0 overflow-y-auto hide-scrollbar flex flex-col divide-y ${divideLine}`}
                      >
                        {visibleHabits.map((habit, idx) => {
                          const count = dailyHabitLogs[habit.id] || 0;
                          const target = Math.max(1, habit.target || 1);
                          const progress = Math.min(1, count / target);
                          const isComplete = count >= target;
                          const remaining = Math.max(0, target - count);
                          const radius = 9;
                          const circ = 2 * Math.PI * radius;
                          const metaLine = formatHabitMeta(habit, count, isCustomizingHabits);

                          if (isCustomizingHabits) {
                            return (
                              <div
                                key={habit.id}
                                className={`shrink-0 w-full min-h-[54px] pl-3.5 sm:pl-4 pr-2 py-2 flex items-center justify-between gap-2 transition-colors ${
                                  isLightMode ? 'hover:bg-white/50' : 'hover:bg-white/[0.03]'
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    hapticNavigate();
                                    setHabitEditor({ mode: 'edit', habit });
                                  }}
                                  className="flex-1 min-w-0 text-left py-0.5 cursor-pointer"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className={`font-serif-eng text-[14.5px] leading-snug font-medium truncate ${tTextMain}`}>
                                      {habit.title}
                                    </span>
                                    <span
                                      className="hidden sm:inline font-arabic text-[13px] opacity-75 shrink-0"
                                      style={{ color: accentHex }}
                                      dir="rtl"
                                    >
                                      {habit.arabic}
                                    </span>
                                  </div>
                                  <span className={`font-serif-eng text-[11.5px] leading-snug tabular-nums block mt-0.5 ${tTextMuted} truncate`}>
                                    {metaLine}
                                  </span>
                                </button>

                                <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
                                  <button
                                    type="button"
                                    aria-label={`Move ${habit.title} up`}
                                    disabled={idx === 0}
                                    onClick={() => {
                                      hapticDetent();
                                      onReorderHabit?.(habit.id, 'up');
                                    }}
                                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-opacity ${
                                      idx === 0
                                        ? 'opacity-20 pointer-events-none'
                                        : `cursor-pointer opacity-80 hover:opacity-100 ${isLightMode ? 'hover:bg-black/5 text-[#2c2720]' : 'hover:bg-white/10 text-[#e4dac8]'}`
                                    }`}
                                  >
                                    <ChevronUpIcon size={15} />
                                  </button>
                                  <button
                                    type="button"
                                    aria-label={`Move ${habit.title} down`}
                                    disabled={idx === habits.length - 1}
                                    onClick={() => {
                                      hapticDetent();
                                      onReorderHabit?.(habit.id, 'down');
                                    }}
                                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-opacity ${
                                      idx === habits.length - 1
                                        ? 'opacity-20 pointer-events-none'
                                        : `cursor-pointer opacity-80 hover:opacity-100 ${isLightMode ? 'hover:bg-black/5 text-[#2c2720]' : 'hover:bg-white/10 text-[#e4dac8]'}`
                                    }`}
                                  >
                                    <ChevronDownIcon size={15} />
                                  </button>
                                  <button
                                    type="button"
                                    aria-label={`Edit ${habit.title}`}
                                    onClick={() => {
                                      hapticNavigate();
                                      setHabitEditor({ mode: 'edit', habit });
                                    }}
                                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center cursor-pointer transition-colors ${
                                      isLightMode ? 'hover:bg-black/5' : 'hover:bg-white/10'
                                    }`}
                                    style={{ color: accentHex }}
                                  >
                                    <EditIcon size={14} />
                                  </button>
                                  <button
                                    type="button"
                                    aria-label={`Remove ${habit.title}`}
                                    onClick={() => {
                                      hapticDestructive();
                                      onRemoveHabit?.(habit.id);
                                    }}
                                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center cursor-pointer transition-colors ${
                                      isLightMode
                                        ? 'text-[#8a0000]/80 hover:bg-[#8a0000]/10'
                                        : 'text-[#ff8a8a]/85 hover:bg-[#ff8a8a]/10'
                                    }`}
                                  >
                                    <TrashIcon size={14} />
                                  </button>
                                </div>
                              </div>
                            );
                          }

                          return (
                            <div
                              key={habit.id}
                              className={`shrink-0 group relative w-full min-h-[54px] sm:min-h-[56px] flex items-center justify-between gap-2 overflow-hidden transition-colors duration-300 ${
                                isLightMode ? 'hover:bg-white/55' : 'hover:bg-white/[0.035]'
                              }`}
                            >
                              {/* Progress Fill Wash */}
                              <div
                                aria-hidden="true"
                                className="absolute inset-0 origin-left transition-transform duration-350 ease-[cubic-bezier(0.22,1,0.36,1)] pointer-events-none"
                                style={{
                                  transform: `scaleX(${progress})`,
                                  background: isLightMode
                                    ? 'linear-gradient(90deg, rgba(138,98,32,0.05) 0%, rgba(138,98,32,0.14) 100%)'
                                    : 'linear-gradient(90deg, rgba(212,175,106,0.04) 0%, rgba(212,175,106,0.15) 100%)',
                                }}
                              />

                              {/* Primary Row Tap Button (+1) */}
                              <button
                                type="button"
                                data-testid={`habit-row-${habit.id}`}
                                aria-label={`${habit.title} (${count} of ${target} ${habit.unit})`}
                                onClick={() => {
                                  if (count < target) {
                                    if (count + 1 >= target) {
                                      hapticTaskComplete();
                                      playTaskTickOffCue({ kind: 'habit' });
                                    } else {
                                      hapticTapLight();
                                    }
                                    onLogHabitStep?.(habit.id, 1);
                                  }
                                }}
                                className="relative z-10 flex-1 min-w-0 min-h-[54px] sm:min-h-[56px] pl-3 sm:pl-4 pr-1.5 sm:pr-2 py-2 flex items-center gap-2.5 sm:gap-3 text-left cursor-pointer active:scale-[0.99]"
                              >
                                <div className="relative w-6 h-6 flex items-center justify-center shrink-0">
                                  {isComplete ? (
                                    <CheckCircleIcon
                                      size={19}
                                      className="animate-[checkmarkPop_0.4s_cubic-bezier(0.34,1.56,0.64,1)_forwards]"
                                      style={{ color: accentHex }}
                                    />
                                  ) : (
                                    <svg className="w-[21px] h-[21px] -rotate-90" viewBox="0 0 22 22" aria-hidden="true">
                                      <circle
                                        cx="11"
                                        cy="11"
                                        r={radius}
                                        fill="none"
                                        stroke={isLightMode ? 'rgba(28,22,15,0.16)' : 'rgba(255,255,255,0.16)'}
                                        strokeWidth="1.6"
                                      />
                                      {progress > 0 && (
                                        <circle
                                          cx="11"
                                          cy="11"
                                          r={radius}
                                          fill="none"
                                          stroke={accentHex}
                                          strokeWidth="1.9"
                                          strokeDasharray={circ}
                                          strokeDashoffset={circ * (1 - progress)}
                                          strokeLinecap="round"
                                          className="transition-all duration-300 ease-out"
                                        />
                                      )}
                                    </svg>
                                  )}
                                </div>

                                <div className="flex flex-col min-w-0">
                                  <span
                                    className={`font-serif-eng text-[14.5px] sm:text-[15px] leading-snug font-medium truncate transition-colors duration-300 ${
                                      isComplete ? '' : tTextMain
                                    }`}
                                    style={{ color: isComplete ? accentHex : undefined }}
                                  >
                                    {habit.title}
                                  </span>
                                  <span className={`font-serif-eng text-[11.5px] sm:text-[12px] leading-snug tabular-nums ${tTextMuted} truncate`}>
                                    {metaLine}
                                  </span>
                                </div>
                              </button>

                              {/* Right Quick Actions: Undo, Multi-Step Quick Complete, Arabic */}
                              <div className="relative z-10 flex items-center gap-1 sm:gap-1.5 pr-2.5 sm:pr-4 shrink-0">
                                {count > 0 && (
                                  <button
                                    type="button"
                                    aria-label={`Undo step for ${habit.title}`}
                                    onClick={() => {
                                      hapticUndo();
                                      onLogHabitStep?.(habit.id, -1);
                                    }}
                                    className={`min-w-[34px] sm:min-w-[36px] min-h-[34px] sm:min-h-[36px] rounded-xl border flex items-center justify-center text-[14px] leading-none cursor-pointer transition-colors ${
                                      isLightMode
                                        ? 'border-black/12 hover:bg-black/5 text-[#3a3329]'
                                        : 'border-white/14 hover:bg-white/10 text-[#e4dac8]'
                                    }`}
                                  >
                                    −
                                  </button>
                                )}

                                {!isComplete && target > 1 && (
                                  <button
                                    type="button"
                                    data-testid={`habit-complete-btn-${habit.id}`}
                                    aria-label={`Complete ${habit.title}`}
                                    onClick={() => handleCompleteHabitNow(habit, remaining)}
                                    className={`min-h-[34px] sm:min-h-[36px] px-2 sm:px-2.5 rounded-xl border font-serif-eng text-[11.5px] font-medium cursor-pointer transition-colors whitespace-nowrap ${
                                      isLightMode
                                        ? 'border-[#8a6220]/24 text-[#6d4c16] hover:bg-[#8a6220]/10'
                                        : 'border-[#d4af6a]/28 text-[#e5c17b] hover:bg-[#d4af6a]/14'
                                    }`}
                                  >
                                    Done
                                  </button>
                                )}

                                <span
                                  className="hidden sm:inline font-arabic text-[14px] opacity-80 pl-1"
                                  style={{ color: accentHex }}
                                  dir="rtl"
                                >
                                  {habit.arabic}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Quiet Footer Epilogue */}
                    <div
                      className={`shrink-0 px-3.5 sm:px-4 py-2 border-t flex items-center justify-between gap-2 ${hairline} ${
                        isLightMode ? 'bg-white/35' : 'bg-black/[0.14]'
                      }`}
                    >
                      <span className={`font-serif-eng text-[11.5px] sm:text-[12px] truncate ${tTextMuted}`}>
                        {overview.badges.habits.isDone
                          ? 'All daily habits completed — may Allah accept your consistency.'
                          : 'Tap a habit for +1, or use Done for multi-step goals.'}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Adhkar / Wird Guided Session Header with Prominent Misbaha Launch */}
                    <div
                      className={`shrink-0 px-3.5 sm:px-4 py-2.5 sm:py-3 border-b flex items-center justify-between gap-2.5 ${hairline} ${
                        isLightMode ? 'bg-white/45' : 'bg-white/[0.02]'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <h2 className={`font-serif-eng text-[14.5px] sm:text-[15.5px] font-semibold leading-tight truncate ${tTextMain}`}>
                            {activeSet.subtitle}
                          </h2>
                          <span className={`font-serif-eng text-[11.5px] sm:text-[12px] tabular-nums shrink-0 ${tTextMuted}`}>
                            · {activeSetBadge.completed}/{activeSetBadge.total}
                          </span>
                        </div>
                        <p className={`hidden sm:block font-serif-eng text-[12px] mt-0.5 truncate ${tTextMuted}`}>
                          Tap a row to count, or expand Read for the full Arabic & meaning.
                        </p>
                      </div>

                      <button
                        type="button"
                        data-testid="open-misbaha-set-btn"
                        onClick={() => launchSequenceInMisbaha()}
                        className="min-h-[36px] sm:min-h-[38px] px-2.5 sm:px-3.5 rounded-xl font-serif-eng text-[12px] sm:text-[13px] font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-transform active:scale-[0.98] shrink-0"
                        style={{
                          backgroundColor: isLightMode ? '#463219' : '#d4af6a',
                          color: isLightMode ? '#faf3e4' : '#17120c',
                        }}
                      >
                        <BeadsMiniIcon size={14} />
                        <span className="sm:hidden">Misbaha</span>
                        <span className="hidden sm:inline">Open Misbaha</span>
                      </button>
                    </div>

                    {/* Adhkar / Wird Expandable Rows (Contained Region) */}
                    <div
                      data-testid="adhkar-list-region"
                      className={`flex-1 min-h-0 overflow-y-auto hide-scrollbar flex flex-col divide-y ${divideLine}`}
                    >
                      {activeItems.map((task, idx) => {
                        const count = dailyTasks[task.id] || 0;
                        const target = Math.max(1, task.target || 1);
                        const progress = Math.min(1, count / target);
                        const isComplete = count >= target;
                        const remaining = Math.max(0, target - count);
                        const isExpanded = expandedDhikrId === task.id;
                        const radius = 9;
                        const circ = 2 * Math.PI * radius;

                        return (
                          <div
                            key={task.id}
                            className={`shrink-0 relative overflow-hidden transition-colors duration-300 ${
                              isLightMode ? 'hover:bg-white/45' : 'hover:bg-white/[0.025]'
                            }`}
                          >
                            {/* Progress Wash */}
                            <div
                              aria-hidden="true"
                              className="absolute inset-0 origin-left transition-transform duration-350 ease-[cubic-bezier(0.22,1,0.36,1)] pointer-events-none"
                              style={{
                                transform: `scaleX(${progress})`,
                                background: isLightMode
                                  ? 'linear-gradient(90deg, rgba(138,98,32,0.05) 0%, rgba(138,98,32,0.14) 100%)'
                                  : 'linear-gradient(90deg, rgba(212,175,106,0.04) 0%, rgba(212,175,106,0.15) 100%)',
                              }}
                            />

                            <div className="relative z-10 flex items-center justify-between gap-1 sm:gap-1.5 pr-2 sm:pr-3.5">
                              {/* Tap / Long-Press Counter Button */}
                              <button
                                type="button"
                                data-testid={`dhikr-row-${task.id}`}
                                aria-label={`${task.title} (${count} of ${target})`}
                                onPointerDown={(e) => startPress(e, idx, count, target)}
                                onPointerMove={movePress}
                                onPointerUp={() => endPress(task.id, count, target)}
                                onPointerLeave={cancelPress}
                                onPointerCancel={cancelPress}
                                className="flex-1 min-w-0 min-h-[54px] sm:min-h-[56px] pl-3 sm:pl-4 pr-1 sm:pr-2 py-2 flex items-center gap-2.5 sm:gap-3 text-left cursor-pointer active:scale-[0.99]"
                                style={{ touchAction: 'pan-y' }}
                              >
                                <div className="relative w-6 h-6 flex items-center justify-center shrink-0">
                                  {isComplete ? (
                                    <CheckCircleIcon
                                      size={19}
                                      className="animate-[checkmarkPop_0.4s_cubic-bezier(0.34,1.56,0.64,1)_forwards]"
                                      style={{ color: accentHex }}
                                    />
                                  ) : (
                                    <svg className="w-[21px] h-[21px] -rotate-90" viewBox="0 0 22 22" aria-hidden="true">
                                      <circle
                                        cx="11"
                                        cy="11"
                                        r={radius}
                                        fill="none"
                                        stroke={isLightMode ? 'rgba(28,22,15,0.16)' : 'rgba(255,255,255,0.16)'}
                                        strokeWidth="1.6"
                                      />
                                      {progress > 0 && (
                                        <circle
                                          cx="11"
                                          cy="11"
                                          r={radius}
                                          fill="none"
                                          stroke={accentHex}
                                          strokeWidth="1.9"
                                          strokeDasharray={circ}
                                          strokeDashoffset={circ * (1 - progress)}
                                          strokeLinecap="round"
                                          className="transition-all duration-300 ease-out"
                                        />
                                      )}
                                    </svg>
                                  )}
                                </div>

                                <div className="flex flex-col min-w-0">
                                  <span
                                    className={`font-serif-eng text-[14px] sm:text-[15px] leading-snug font-medium truncate transition-colors ${
                                      isComplete ? '' : tTextMain
                                    }`}
                                    style={{ color: isComplete ? accentHex : undefined }}
                                  >
                                    {task.title}
                                  </span>
                                  <span className={`font-serif-eng text-[11.5px] sm:text-[12px] leading-snug tabular-nums ${tTextMuted}`}>
                                    {isComplete ? `Completed · ${target}×` : `${count} of ${target}`}
                                  </span>
                                </div>
                              </button>

                              {/* Explicit Row Controls: Undo, Read Disclosure, Direct Beads Launch */}
                              <div className="flex items-center gap-1 shrink-0">
                                {count > 0 && (
                                  <button
                                    type="button"
                                    aria-label={`Undo count for ${task.title}`}
                                    onClick={() => {
                                      hapticUndo();
                                      incrementTask?.(task.id, -1);
                                    }}
                                    className={`min-w-[32px] sm:min-w-[36px] min-h-[34px] sm:min-h-[36px] rounded-xl border flex items-center justify-center text-[14px] leading-none cursor-pointer transition-colors ${
                                      isLightMode
                                        ? 'border-black/12 hover:bg-black/5 text-[#3a3329]'
                                        : 'border-white/14 hover:bg-white/10 text-[#e4dac8]'
                                    }`}
                                  >
                                    −
                                  </button>
                                )}

                                <button
                                  type="button"
                                  data-testid={`dhikr-read-toggle-${task.id}`}
                                  aria-expanded={isExpanded}
                                  aria-label={isExpanded ? `Hide text for ${task.title}` : `Read ${task.title}`}
                                  onClick={() => {
                                    hapticTapLight();
                                    setExpandedDhikrId(isExpanded ? null : task.id);
                                  }}
                                  className={`min-h-[34px] sm:min-h-[36px] px-2 sm:px-2.5 rounded-xl font-serif-eng text-[11.5px] sm:text-[12px] flex items-center gap-1 cursor-pointer transition-colors whitespace-nowrap ${
                                    isExpanded
                                      ? isLightMode
                                        ? 'bg-[#8a6220]/14 text-[#1c160f] font-semibold'
                                        : 'bg-[#d4af6a]/18 text-[#f6efe2] font-semibold'
                                      : isLightMode
                                        ? 'text-[#4e3f2b] hover:bg-black/5'
                                        : 'text-[rgba(232,222,204,0.78)] hover:bg-white/[0.08]'
                                  }`}
                                >
                                  <span>Read</span>
                                  <ChevronDownIcon
                                    size={12}
                                    className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                                  />
                                </button>

                                <button
                                  type="button"
                                  data-testid={`dhikr-beads-btn-${task.id}`}
                                  aria-label={`Count ${task.title} in Misbaha`}
                                  onClick={() => launchSequenceInMisbaha(idx)}
                                  className={`min-w-[34px] sm:min-w-[36px] min-h-[34px] sm:min-h-[36px] rounded-xl border flex items-center justify-center cursor-pointer transition-colors ${
                                    isLightMode
                                      ? 'border-[#8a6220]/22 text-[#8a6220] hover:bg-[#8a6220]/10'
                                      : 'border-[#d4af6a]/24 text-[#d4af6a] hover:bg-[#d4af6a]/14'
                                  }`}
                                >
                                  <BeadsMiniIcon size={14} />
                                </button>
                              </div>
                            </div>

                            {/* Expandable Full Arabic Text, Translation & Source */}
                            {isExpanded && (
                              <div
                                data-testid={`dhikr-expanded-${task.id}`}
                                className={`relative z-10 px-4 sm:px-5 pb-3.5 pt-2.5 border-t ${hairline} ${
                                  isLightMode ? 'bg-white/55' : 'bg-black/[0.18]'
                                }`}
                              >
                                <p
                                  dir="rtl"
                                  className="font-arabic text-[19px] sm:text-[21px] leading-[1.85] text-right"
                                  style={{ color: accentHex }}
                                >
                                  {task.arabic}
                                </p>
                                <p className={`font-serif-eng text-[13.5px] sm:text-[14px] leading-relaxed mt-2 ${tTextMain}`}>
                                  {task.translation}
                                </p>
                                <div className="flex items-center justify-between gap-2.5 flex-wrap mt-2.5 pt-2 border-t border-current/10">
                                  <span className={`font-serif-eng italic text-[11.5px] sm:text-[12px] ${tTextMuted}`}>
                                    {task.source}
                                  </span>
                                  <div className="flex items-center gap-2 ml-auto">
                                    {!isComplete && (
                                      <button
                                        type="button"
                                        onClick={() => handleCompleteDhikrNow(task, remaining)}
                                        className={`min-h-[34px] px-2.5 rounded-xl border font-serif-eng text-[11.5px] sm:text-[12px] font-medium cursor-pointer transition-colors ${
                                          isLightMode
                                            ? 'border-[#8a6220]/26 text-[#6d4c16] hover:bg-[#8a6220]/10'
                                            : 'border-[#d4af6a]/28 text-[#e5c17b] hover:bg-[#d4af6a]/14'
                                        }`}
                                      >
                                        Mark Done ({target}×)
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => launchSequenceInMisbaha(idx)}
                                      className="min-h-[34px] px-2.5 rounded-xl font-serif-eng text-[11.5px] sm:text-[12px] font-semibold flex items-center gap-1.5 cursor-pointer"
                                      style={{
                                        backgroundColor: isLightMode ? 'rgba(138,98,32,0.12)' : 'rgba(212,175,106,0.18)',
                                        color: accentHex,
                                      }}
                                    >
                                      <BeadsMiniIcon size={13} />
                                      <span>Count with Beads</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </section>
            )}
          </div>

          {/* DESKTOP RIGHT COMPANION COLUMN: Unified Today's Intentions + Compact Duas & Qada Bar */}
          {isDesktop && (
            <aside className="min-w-0 min-h-0 flex flex-col gap-3.5">
              {/* 1. Unified Today's Intentions Panel (Fills Remaining Height) */}
              <TasksIntentionsPanel
                isLightMode={isLightMode}
                accentHex={accentHex}
                isTasksActive={isTasksActive}
              />

              {/* 2. Quick Practice Tools Bar (Duas · Qada) */}
              <section
                data-testid="tasks-quick-tools"
                aria-label="Practice tools"
                className={`shrink-0 w-full rounded-[20px] border overflow-hidden transition-colors duration-300 ${cardSurface}`}
              >
                <div className={`grid grid-cols-2 divide-x ${divideLine}`}>
                  <button
                    type="button"
                    data-testid="tasks-duas-btn"
                    onClick={() => {
                      hapticNavigate();
                      onOpenDuas?.();
                    }}
                    className={`min-h-[48px] px-3 flex items-center justify-center gap-2 font-serif-eng text-[13.5px] font-medium transition-colors cursor-pointer ${
                      isLightMode ? 'text-[#1c160f] hover:bg-white/65' : 'text-[rgba(246,239,226,0.92)] hover:bg-white/[0.04]'
                    }`}
                  >
                    <BookIcon size={15} style={{ color: accentHex }} className="shrink-0" />
                    <span>Duas</span>
                  </button>

                  <button
                    type="button"
                    data-testid="tasks-qada-btn"
                    onClick={() => {
                      hapticNavigate();
                      onOpenQada?.();
                    }}
                    className={`min-h-[48px] px-3 flex items-center justify-center gap-2 font-serif-eng text-[13.5px] font-medium transition-colors cursor-pointer ${
                      isLightMode ? 'text-[#1c160f] hover:bg-white/65' : 'text-[rgba(246,239,226,0.92)] hover:bg-white/[0.04]'
                    }`}
                  >
                    <RotateCcwIcon size={15} style={{ color: accentHex }} className="shrink-0" />
                    <span>Qada</span>
                    {qadaRemainingCount > 0 && (
                      <span
                        className="font-serif-eng text-[12px] tabular-nums font-semibold shrink-0"
                        style={{ color: accentHex }}
                      >
                        ({qadaRemainingCount})
                      </span>
                    )}
                  </button>
                </div>
              </section>
            </aside>
          )}
        </div>

        {/* MOBILE COMPACT BOTTOM QUICK TOOLS BAR (Duas · Qada) */}
        {!isDesktop && (
          <nav
            data-testid="tasks-quick-tools"
            aria-label="Practice tools"
            className={`shrink-0 w-full grid grid-cols-2 divide-x rounded-[18px] border overflow-hidden transition-colors duration-300 ${cardSurface} ${divideLine}`}
          >
            <button
              type="button"
              data-testid="tasks-duas-btn"
              onClick={() => {
                hapticNavigate();
                onOpenDuas?.();
              }}
              className={`min-h-[46px] px-3 flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                isLightMode ? 'hover:bg-white/65' : 'hover:bg-white/[0.04]'
              }`}
            >
              <BookIcon size={14} style={{ color: accentHex }} />
              <span className={`font-serif-eng text-[13px] font-medium leading-none ${tTextMain}`}>
                Duas
              </span>
            </button>

            <button
              type="button"
              data-testid="tasks-qada-btn"
              onClick={() => {
                hapticNavigate();
                onOpenQada?.();
              }}
              className={`min-h-[46px] px-3 flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                isLightMode ? 'hover:bg-white/65' : 'hover:bg-white/[0.04]'
              }`}
            >
              <RotateCcwIcon size={14} style={{ color: accentHex }} />
              <span className={`font-serif-eng text-[13px] font-medium leading-none tabular-nums ${tTextMain}`}>
                {qadaRemainingCount > 0 ? `Qada (${qadaRemainingCount})` : 'Qada'}
              </span>
            </button>
          </nav>
        )}
      </div>

      {/* Customizable Habit Add / Edit Sheet */}
      <HabitEditorSheet
        isOpen={Boolean(habitEditor)}
        editingHabit={habitEditor?.mode === 'edit' ? habitEditor.habit : null}
        onSaveNew={onAddCustomHabitProp}
        onSaveEdit={onUpdateHabitProp}
        onClose={() => setHabitEditor(null)}
      />
    </div>
  );
});
