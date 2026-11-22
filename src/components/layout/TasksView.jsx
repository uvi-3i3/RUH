import { memo, useState, useRef, useEffect } from 'react';
import {
  BookIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  EditIcon,
  PlusIcon,
  RotateCcwIcon,
  TrashIcon,
} from '../icons/Icons';
import { burhanData } from '../../data/burhanData';
import { quranMiraclesData } from '../../data/quranMiraclesData';
import { PRACTICE_SETS } from '../../data/adhkarData';
import { selectActiveBurhan } from '../../utils/devotionLogic';
import { resolveRecommendedAdhkarPeriod } from '../../utils/prayerWindowLogic';
import { resolveAutopilotPracticeTab } from '../../utils/autopilotLogic';
import { selectActiveMiracle } from '../../utils/miraclesLogic';
import { isPointerDrag } from '../../utils/smoothInteractionLogic';
import { HabitEditorSheet } from './HabitEditorSheet';
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

export const TasksView = memo(({
  currentView,
  isLightMode: isLightModeProp,
  dailyTasks,
  rewardedSets = [],
  burhanCompleted,
  currentStation = 0,
  incrementTask,
  markAdhkarSetRewarded,
  activeDays,
  onOpenBurhan,
  onOpenMiracles,
  exploredMiracleIds = [],
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
  const habits = habitsProp ?? habitsCtx?.habits ?? [];
  const dailyHabitLogs = dailyHabitLogsProp ?? habitsCtx?.dailyHabitLogs ?? {};
  const onLogHabitStep = onLogHabitStepProp ?? habitsCtx?.logHabitStep;
  const onReorderHabit = onReorderHabitProp ?? habitsCtx?.reorderHabit;
  const onResetDefaultHabits = onResetDefaultHabitsProp ?? habitsCtx?.resetDefaultHabits;
  const onRemoveHabit = onRemoveHabitProp ?? habitsCtx?.removeHabit;
  const dailyIntention = dailyIntentionProp ?? habitsCtx?.dailyIntention ?? '';
  const onSetDailyIntention = onSetDailyIntentionProp ?? habitsCtx?.setDailyIntention;

  const tTextMain = isLightMode ? 'text-[#1a1814]' : 'text-[rgba(245,238,224,0.92)]';
  const tTextSub = isLightMode ? 'text-[#2c2720]' : 'text-[rgba(228,218,200,0.68)]';
  const glowSub = isLightMode ? '0 1px 2px rgba(255,255,255,0.75)' : '0 1px 1px rgba(0,0,0,0.8)';

  const recommendedWindow = resolveRecommendedAdhkarPeriod(new Date(), todaySchedule);
  const recommendedPeriod = recommendedWindow.setId;
  const [activeSetId, setActiveSetId] = useState('habits');
  const [isCustomizingHabits, setIsCustomizingHabits] = useState(false);
  const [habitEditor, setHabitEditor] = useState(null);
  const [intentionDraft, setIntentionDraft] = useState(dailyIntention || '');
  const longPressTimer = useRef(null);
  const pressOriginRef = useRef(null);
  const pressDraggedRef = useRef(false);
  const wasTasksActiveRef = useRef(false);

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

  const isHabitsTab = activeSetId === 'habits';
  const activeSet = PRACTICE_SETS[activeSetId] || PRACTICE_SETS.wird;
  const activeItems = activeSet.items;

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
      onOpenMisbaha?.({ setId: activeSetId, initialIndex: index });
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

  const launchSequenceInMisbaha = () => {
    hapticNavigate();
    const firstIncomplete = activeItems.findIndex((item) => (dailyTasks[item.id] || 0) < item.target);
    onOpenMisbaha?.({
      setId: activeSetId,
      initialIndex: firstIncomplete >= 0 ? firstIncomplete : 0,
    });
  };

  const currentBurhan = selectActiveBurhan(burhanData, currentStation, activeDays);
  const currentMiracle = selectActiveMiracle(quranMiraclesData, currentStation, activeDays);
  const currentMiracleExplored = Boolean(
    currentMiracle && exploredMiracleIds.includes(currentMiracle.id)
  );
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

  const completedDhikrCount = activeItems.filter((t) => (dailyTasks[t.id] || 0) >= t.target).length;
  const completedHabitsCount = habits.filter((h) => (dailyHabitLogs[h.id] || 0) >= h.target).length;
  const completedCount = isHabitsTab ? completedHabitsCount : completedDhikrCount;
  const totalCount = isHabitsTab ? habits.length : activeItems.length;

  const accentHex = isLightMode ? '#7c5a1e' : '#d2a24b';
  const hikmahHex = isLightMode ? '#0d9488' : '#2dd4bf';
  const miracleHex = isLightMode ? '#8e6623' : '#e4be70';
  const tabs = [
    { id: 'habits', label: 'Habits' },
    ...Object.values(PRACTICE_SETS).map((s) => ({ id: s.id, label: s.label })),
  ];

  return (
    <div
      data-testid="tasks-scroller"
      className="absolute inset-x-0 bottom-0 flex flex-col items-center transition-[opacity,transform,visibility] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] w-full overflow-y-auto hide-scrollbar pt-1.5"
      style={{
        top: 'calc(72px + var(--sat))',
        paddingBottom: 'calc(18px + var(--sab))',
        touchAction: 'pan-y',
        opacity: isTasksActive ? 1 : 0,
        visibility: isTasksActive ? 'visible' : 'hidden',
        transform: isTasksActive ? 'scale(1)' : 'scale(1.02)',
        pointerEvents: isTasksActive ? 'auto' : 'none',
        maskImage: isTasksActive
          ? 'linear-gradient(to bottom, transparent 0px, black 12px, black calc(100% - 12px), transparent 100%)'
          : 'none',
        WebkitMaskImage: isTasksActive
          ? 'linear-gradient(to bottom, transparent 0px, black 12px, black calc(100% - 12px), transparent 100%)'
          : 'none',
      }}
    >
      <div className="min-h-full flex flex-col items-center justify-between gap-2.5 w-full max-w-[368px] sm:max-w-[430px] md:max-w-[500px] px-1.5 sm:px-3 mx-auto">
        {/* Top Zone: Crown, Sunnah Whisper & Segmented Practice Switcher */}
        <div className="w-full flex flex-col items-center shrink-0">
        {/* Compact Crown & Inline Sunnah Whisper */}
        <span
          className={`font-calligraphy text-[23px] leading-none ${tTextMain} opacity-80 mb-0.5 transition-colors duration-300`}
          style={{ textShadow: glowSub }}
          dir="rtl"
        >
          {isHabitsTab ? 'العَادَات' : activeSet.arabicTitle}
        </span>
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`font-serif-eng text-[8.5px] uppercase ${tTextSub} opacity-75 transition-colors duration-300`}
            style={{ letterSpacing: '0.22em', marginRight: '-0.22em', textShadow: glowSub }}
          >
            {isHabitsTab ? 'Daily Sunnah & Habits' : activeSet.subtitle}
          </span>
          <span
            className={`font-serif-eng text-[8.5px] tabular-nums opacity-78 ${tTextSub}`}
            style={{ letterSpacing: '0.1em' }}
          >
            · {completedCount}/{totalCount}
          </span>
        </div>

        {sunnahContext?.primaryPrompt && (
          <p
            className={`font-serif-eng italic text-[10.5px] leading-snug text-center max-w-[96%] mb-2 ${tTextSub} opacity-84`}
          >
            <span className="not-italic uppercase text-[8.5px] tracking-[0.14em] font-medium mr-1.5" style={{ color: accentHex }}>
              {sunnahContext.primaryPrompt.label}
            </span>
            · {sunnahContext.primaryPrompt.detail}
          </p>
        )}

        {/* Interactive Practice Set Switcher (Habits / Wird / Sabah / Masa) */}
        <div
          role="tablist"
          aria-label="Practice Sets"
          className={`w-full grid grid-cols-4 p-1 rounded-2xl border mb-2 backdrop-blur-md transition-colors ${
            isLightMode
              ? 'bg-[#e6dfd1]/75 border-black/[0.08]'
              : 'bg-[#0b0e16]/75 border-white/[0.09]'
          }`}
        >
          {tabs.map((tab) => {
            const isActive = activeSetId === tab.id;
            const isNowHint = tab.id === recommendedPeriod;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => {
                  if (activeSetId !== tab.id) {
                    hapticDetent();
                    setActiveSetId(tab.id);
                  }
                }}
                className="min-h-[34px] rounded-xl font-serif-eng text-[9.5px] uppercase tracking-[0.1em] cursor-pointer flex items-center justify-center gap-1 whitespace-nowrap px-1 border transition-colors"
                style={{
                  backgroundColor: isActive
                    ? isLightMode
                      ? '#fcfaf5'
                      : 'rgba(255,255,255,0.14)'
                    : 'transparent',
                  borderColor: isActive
                    ? isLightMode
                      ? 'rgba(156,117,51,0.28)'
                      : 'rgba(210,162,75,0.28)'
                    : isNowHint
                      ? isLightMode
                        ? 'rgba(156,117,51,0.22)'
                        : 'rgba(210,162,75,0.22)'
                      : 'transparent',
                  boxShadow: isActive
                    ? isLightMode
                      ? '0 2px 6px rgba(26,24,20,0.09)'
                      : '0 2px 8px rgba(0,0,0,0.35)'
                    : 'none',
                  color: isActive
                    ? isLightMode
                      ? '#7c5a1e'
                      : '#e5c17b'
                    : isNowHint
                      ? isLightMode
                        ? '#7c5a1e'
                        : '#d2a24b'
                      : isLightMode
                        ? 'rgba(44,39,32,0.72)'
                        : 'rgba(228,218,200,0.68)',
                  fontWeight: isActive ? 600 : isNowHint ? 500 : 400,
                }}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Time-Aware Morning / Evening Adhkar Window Cue (quiet unboxed invitation) */}
        {recommendedWindow.shortTag === 'Now' &&
          activeSetId !== recommendedPeriod &&
          !PRACTICE_SETS[recommendedPeriod]?.items?.every(
            (item) => (dailyTasks[item.id] || 0) >= item.target
          ) && (
            <button
              type="button"
              data-testid="adhkar-window-cue"
              onClick={() => {
                hapticDetent();
                setActiveSetId(recommendedPeriod);
              }}
              className={`font-serif-eng italic text-[10.5px] leading-snug text-center mb-1.5 cursor-pointer transition-opacity opacity-85 hover:opacity-100 ${tTextSub}`}
            >
              <span>{recommendedWindow.label} open</span>
              <span
                className="not-italic uppercase text-[8.5px] tracking-[0.14em] ml-1.5"
                style={{ color: accentHex }}
              >
                · Open {PRACTICE_SETS[recommendedPeriod]?.label} →
              </span>
            </button>
          )}

        </div>

        {/* Middle Zone: Expanded Liquid-Glass Practice Ledger */}
        <div
          className={`w-full flex-grow shrink-0 flex flex-col justify-between rounded-[22px] overflow-hidden border transition-colors duration-300 ${
            isLightMode
              ? `bg-white/62 border-white/80 ${isTasksActive ? 'island-light' : ''}`
              : `bg-[#0b0e16]/68 border-white/[0.09] ${isTasksActive ? 'island-dark' : ''}`
          }`}
        >
          {isHabitsTab ? (
            <>
              {/* Compact Inline Niyyah Row */}
              <div
                className={`shrink-0 px-3.5 sm:px-4 py-2 border-b flex items-center gap-2 ${
                  isLightMode ? 'border-black/[0.06] bg-white/30' : 'border-white/[0.06] bg-white/[0.02]'
                }`}
              >
                <label
                  htmlFor="daily-niyyah-input"
                  className="font-serif-eng text-[8px] uppercase tracking-[0.16em] shrink-0 opacity-85"
                  style={{ color: accentHex }}
                >
                  Niyyah
                </label>
                <span className={`${tTextSub} opacity-30 text-[10px]`} aria-hidden="true">·</span>
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
                  placeholder="Today’s intention..."
                  className={`flex-1 min-w-0 bg-transparent font-serif-eng text-[12px] outline-none ${tTextMain} placeholder:opacity-45`}
                />
              </div>

              {/* Habits List or Empty State */}
              {habits.length === 0 ? (
                <div className="flex-1 px-4 py-8 text-center flex flex-col items-center justify-center gap-3">
                  <p className={`font-serif-eng italic text-[12.5px] leading-relaxed ${tTextSub}`}>
                    Your habit list is clear. Add a custom practice or restore the starter Sunnah habits.
                  </p>
                  <div className="flex items-center gap-2 flex-wrap justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        hapticNavigate();
                        setHabitEditor({ mode: 'create' });
                      }}
                      className="min-h-[36px] px-3.5 rounded-xl border font-serif-eng text-[10px] uppercase tracking-[0.14em] cursor-pointer flex items-center gap-1.5"
                      style={{
                        backgroundColor: isLightMode ? '#9c7533' : 'rgba(210,162,75,0.2)',
                        borderColor: isLightMode ? '#9c7533' : 'rgba(210,162,75,0.45)',
                        color: isLightMode ? '#ffffff' : '#f3d9a4',
                      }}
                    >
                      <PlusIcon size={12} />
                      <span>Add Habit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        hapticWarning();
                        onResetDefaultHabits?.();
                      }}
                      className={`min-h-[36px] px-3 rounded-xl border font-serif-eng text-[10px] uppercase tracking-[0.14em] cursor-pointer ${
                        isLightMode ? 'border-black/15 text-[#2c2720]' : 'border-white/15 text-[#e4dac8]'
                      }`}
                    >
                      Restore Starters
                    </button>
                  </div>
                </div>
              ) : (
                <div className={`flex-1 flex flex-col divide-y ${isLightMode ? 'divide-black/[0.06]' : 'divide-white/[0.06]'}`}>
                  {habits.map((habit, idx) => {
                    const count = dailyHabitLogs[habit.id] || 0;
                    const target = Math.max(1, habit.target || 1);
                    const progress = Math.min(1, count / target);
                    const isComplete = count >= target;
                    const radius = 8;
                    const circ = 2 * Math.PI * radius;
                    const metaLine = isCustomizingHabits
                      ? `${target} ${habit.unit}${habit.cadence ? ` · ${habit.cadence}` : ''}`
                      : habit.cadence && habit.cadence !== 'Daily'
                        ? `${count}/${target} ${habit.unit} · ${habit.cadence}`
                        : `${count}/${target} ${habit.unit}`;

                    if (isCustomizingHabits) {
                      return (
                        <div
                          key={habit.id}
                          className={`w-full flex-1 min-h-[46px] pl-3.5 sm:pl-4 pr-2 py-1.5 flex items-center justify-between gap-2 transition-colors ${
                            isLightMode ? 'hover:bg-white/40' : 'hover:bg-white/[0.035]'
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
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className={`font-serif-eng text-[12.5px] sm:text-[13px] leading-tight font-medium truncate ${tTextMain}`}>
                                {habit.title}
                              </span>
                              <span
                                className="font-arabic text-[11px] opacity-75 shrink-0"
                                style={{ color: accentHex }}
                                dir="rtl"
                              >
                                {habit.arabic}
                              </span>
                            </div>
                            <span className={`font-serif-eng text-[9.5px] leading-tight tabular-nums block ${tTextSub} opacity-75 truncate`}>
                              {metaLine}
                            </span>
                          </button>

                          <div className="flex items-center gap-0.5 shrink-0">
                            <button
                              type="button"
                              aria-label={`Move ${habit.title} up`}
                              disabled={idx === 0}
                              onClick={() => {
                                hapticDetent();
                                onReorderHabit?.(habit.id, 'up');
                              }}
                              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-opacity ${
                                idx === 0
                                  ? 'opacity-20 pointer-events-none'
                                  : `cursor-pointer opacity-75 hover:opacity-100 ${isLightMode ? 'hover:bg-black/5 text-[#2c2720]' : 'hover:bg-white/10 text-[#e4dac8]'}`
                              }`}
                            >
                              <ChevronUpIcon size={13} />
                            </button>
                            <button
                              type="button"
                              aria-label={`Move ${habit.title} down`}
                              disabled={idx === habits.length - 1}
                              onClick={() => {
                                hapticDetent();
                                onReorderHabit?.(habit.id, 'down');
                              }}
                              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-opacity ${
                                idx === habits.length - 1
                                  ? 'opacity-20 pointer-events-none'
                                  : `cursor-pointer opacity-75 hover:opacity-100 ${isLightMode ? 'hover:bg-black/5 text-[#2c2720]' : 'hover:bg-white/10 text-[#e4dac8]'}`
                              }`}
                            >
                              <ChevronDownIcon size={13} />
                            </button>
                            <button
                              type="button"
                              aria-label={`Edit ${habit.title}`}
                              onClick={() => {
                                hapticNavigate();
                                setHabitEditor({ mode: 'edit', habit });
                              }}
                              className={`w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
                                isLightMode ? 'hover:bg-black/5' : 'hover:bg-white/10'
                              }`}
                              style={{ color: accentHex }}
                            >
                              <EditIcon size={13} />
                            </button>
                            <button
                              type="button"
                              aria-label={`Remove ${habit.title}`}
                              onClick={() => {
                                hapticDestructive();
                                onRemoveHabit?.(habit.id);
                              }}
                              className={`w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
                                isLightMode
                                  ? 'text-[#8a0000]/75 hover:bg-[#8a0000]/10'
                                  : 'text-[#ff8a8a]/80 hover:bg-[#ff8a8a]/10'
                              }`}
                            >
                              <TrashIcon size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={habit.id}
                        className={`group relative w-full flex-1 min-h-[46px] flex items-center justify-between gap-1 overflow-hidden transition-colors duration-300 ${
                          isLightMode ? 'hover:bg-white/40' : 'hover:bg-white/[0.035]'
                        }`}
                      >
                        <div
                          className="absolute inset-0 origin-left transition-transform duration-350 ease-[cubic-bezier(0.22,1,0.36,1)] pointer-events-none"
                          style={{
                            transform: `scaleX(${progress})`,
                            background: isLightMode
                              ? 'linear-gradient(90deg, rgba(156,117,51,0.05) 0%, rgba(156,117,51,0.16) 100%)'
                              : 'linear-gradient(90deg, rgba(210,162,75,0.04) 0%, rgba(210,162,75,0.16) 100%)',
                          }}
                        />

                        <button
                          type="button"
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
                          className="relative z-10 flex-1 min-w-0 h-full min-h-[46px] pl-3.5 sm:pl-4 pr-2 py-1.5 flex items-center gap-2.5 text-left cursor-pointer active:scale-[0.99]"
                        >
                          <div className="relative w-5 h-5 flex items-center justify-center shrink-0">
                            {isComplete ? (
                              <CheckCircleIcon
                                size={15}
                                className="animate-[checkmarkPop_0.4s_cubic-bezier(0.34,1.56,0.64,1)_forwards]"
                                style={{ color: accentHex }}
                              />
                            ) : (
                              <svg className="w-[18px] h-[18px] -rotate-90" viewBox="0 0 20 20">
                                <circle
                                  cx="10"
                                  cy="10"
                                  r={radius}
                                  fill="none"
                                  stroke={isLightMode ? 'rgba(26,24,20,0.14)' : 'rgba(255,255,255,0.12)'}
                                  strokeWidth="1.4"
                                />
                                {progress > 0 && (
                                  <circle
                                    cx="10"
                                    cy="10"
                                    r={radius}
                                    fill="none"
                                    stroke={accentHex}
                                    strokeWidth="1.6"
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
                              className={`font-serif-eng text-[12.5px] sm:text-[13px] leading-tight font-medium tracking-wide truncate transition-colors duration-300 ${
                                isComplete ? '' : tTextMain
                              }`}
                              style={{ color: isComplete ? accentHex : undefined }}
                            >
                              {habit.title}
                            </span>
                            <span className={`font-serif-eng text-[9.5px] leading-tight tabular-nums ${tTextSub} opacity-72 truncate`}>
                              {metaLine}
                            </span>
                          </div>
                        </button>

                        <div className="relative z-10 flex items-center gap-1.5 pr-2.5 sm:pr-3 shrink-0">
                          {count > 0 && (
                            <button
                              type="button"
                              aria-label={`Undo step for ${habit.title}`}
                              onClick={() => {
                                hapticUndo();
                                onLogHabitStep?.(habit.id, -1);
                              }}
                              className={`w-6 h-6 rounded-lg border flex items-center justify-center text-[11px] leading-none cursor-pointer transition-colors ${
                                isLightMode
                                  ? 'border-black/10 hover:bg-black/10 text-[#3a3329]'
                                  : 'border-white/10 hover:bg-white/10 text-[#e4dac8]'
                              }`}
                            >
                              −
                            </button>
                          )}
                          <span
                            className="font-arabic text-[12px] opacity-80 px-0.5"
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

              {/* Calm Footer Bar: Daily Tap vs Customize Toolbar */}
              <div
                className={`shrink-0 flex items-center justify-between px-3.5 sm:px-4 py-1.5 border-t ${
                  isLightMode
                    ? 'border-black/[0.06] bg-white/35'
                    : 'border-white/[0.06] bg-black/[0.16]'
                }`}
              >
                {isCustomizingHabits ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        hapticWarning();
                        onResetDefaultHabits?.();
                      }}
                      className={`min-h-[32px] flex items-center gap-1 font-serif-eng text-[8.5px] uppercase opacity-75 hover:opacity-100 transition-opacity cursor-pointer whitespace-nowrap ${tTextSub}`}
                      style={{ letterSpacing: '0.12em' }}
                    >
                      <RotateCcwIcon size={11} />
                      <span>Reset Starters</span>
                    </button>

                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          hapticNavigate();
                          setHabitEditor({ mode: 'create' });
                        }}
                        className="min-h-[32px] flex items-center gap-1 font-serif-eng text-[8.5px] uppercase opacity-92 hover:opacity-100 transition-opacity cursor-pointer whitespace-nowrap"
                        style={{ color: accentHex, letterSpacing: '0.14em' }}
                      >
                        <PlusIcon size={12} />
                        <span>Add Habit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          hapticDismiss();
                          setIsCustomizingHabits(false);
                        }}
                        className="min-h-[28px] px-2.5 rounded-lg border font-serif-eng text-[8.5px] uppercase cursor-pointer transition-colors whitespace-nowrap font-medium"
                        style={{
                          backgroundColor: isLightMode ? '#9c7533' : 'rgba(210,162,75,0.2)',
                          borderColor: isLightMode ? '#9c7533' : 'rgba(210,162,75,0.45)',
                          color: isLightMode ? '#ffffff' : '#f3d9a4',
                          letterSpacing: '0.14em',
                        }}
                      >
                        Done
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <span
                      className={`font-serif-eng text-[8px] uppercase ${tTextSub} opacity-75 truncate`}
                      style={{ letterSpacing: '0.14em' }}
                    >
                      <span className="sm:hidden">Tap row +1</span>
                      <span className="hidden sm:inline">Tap row to log +1</span>
                    </span>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          hapticToggle(true);
                          setIsCustomizingHabits(true);
                        }}
                        className={`min-h-[32px] flex items-center gap-1 font-serif-eng text-[8.5px] uppercase opacity-80 hover:opacity-100 transition-opacity cursor-pointer whitespace-nowrap ${tTextMain}`}
                        style={{ letterSpacing: '0.14em' }}
                      >
                        <EditIcon size={11} />
                        <span>Customize</span>
                      </button>
                      <span className={`${tTextSub} opacity-30 text-[10px]`} aria-hidden="true">·</span>
                      <button
                        type="button"
                        onClick={() => {
                          hapticNavigate();
                          setHabitEditor({ mode: 'create' });
                        }}
                        className="min-h-[32px] pl-0.5 pr-1 -mr-1 flex items-center gap-1 font-serif-eng text-[8.5px] uppercase opacity-92 hover:opacity-100 transition-opacity cursor-pointer whitespace-nowrap"
                        style={{ color: accentHex, letterSpacing: '0.14em' }}
                      >
                        <PlusIcon size={12} />
                        <span>Add</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <div className={`flex-1 flex flex-col divide-y ${isLightMode ? 'divide-black/[0.06]' : 'divide-white/[0.06]'}`}>
                {activeItems.map((task, idx) => {
                  const count = dailyTasks[task.id] || 0;
                  const progress = Math.min(1, count / task.target);
                  const isComplete = count >= task.target;
                  const radius = 8;
                  const circ = 2 * Math.PI * radius;

                  return (
                    <button
                      key={task.id}
                      type="button"
                      aria-label={`${task.title} (${count} of ${task.target})`}
                      onPointerDown={(e) => startPress(e, idx, count, task.target)}
                      onPointerMove={movePress}
                      onPointerUp={() => endPress(task.id, count, task.target)}
                      onPointerLeave={cancelPress}
                      onPointerCancel={cancelPress}
                      className={`group relative w-full flex-1 min-h-[46px] px-3.5 sm:px-4 py-2 flex items-center justify-between gap-2 text-left overflow-hidden cursor-pointer active:scale-[0.985] transition-colors duration-300 ${
                        isLightMode ? 'hover:bg-white/40' : 'hover:bg-white/[0.035]'
                      }`}
                      style={{ touchAction: 'pan-y' }}
                    >
                      <div
                        className="absolute inset-0 origin-left transition-transform duration-350 ease-[cubic-bezier(0.22,1,0.36,1)] pointer-events-none"
                        style={{
                          transform: `scaleX(${progress})`,
                          background: isLightMode
                            ? 'linear-gradient(90deg, rgba(156,117,51,0.05) 0%, rgba(156,117,51,0.16) 100%)'
                            : 'linear-gradient(90deg, rgba(210,162,75,0.04) 0%, rgba(210,162,75,0.16) 100%)',
                        }}
                      />

                      <div className="relative z-10 flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="relative w-5 h-5 flex items-center justify-center shrink-0">
                          {isComplete ? (
                            <CheckCircleIcon
                              size={15}
                              className="animate-[checkmarkPop_0.4s_cubic-bezier(0.34,1.56,0.64,1)_forwards]"
                              style={{ color: accentHex }}
                            />
                          ) : (
                            <svg className="w-[18px] h-[18px] -rotate-90" viewBox="0 0 20 20">
                              <circle
                                cx="10"
                                cy="10"
                                r={radius}
                                fill="none"
                                stroke={isLightMode ? 'rgba(26,24,20,0.14)' : 'rgba(255,255,255,0.12)'}
                                strokeWidth="1.4"
                              />
                              {progress > 0 && (
                                <circle
                                  cx="10"
                                  cy="10"
                                  r={radius}
                                  fill="none"
                                  stroke={accentHex}
                                  strokeWidth="1.6"
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
                            className={`font-serif-eng text-[12.5px] sm:text-[13px] leading-tight font-medium tracking-wide truncate transition-colors duration-300 ${
                              isComplete ? '' : tTextMain
                            }`}
                            style={{ color: isComplete ? accentHex : undefined }}
                          >
                            {task.title}
                          </span>
                          <span
                            className={`font-serif-eng text-[9.5px] leading-tight tabular-nums ${tTextSub} opacity-70`}
                          >
                            {count}
                            <span className="opacity-55"> / {task.target}</span>
                          </span>
                        </div>
                      </div>

                      <span
                        className="relative z-10 font-arabic text-[12px] opacity-75 group-hover:opacity-100 transition-opacity shrink-0 max-w-[80px] sm:max-w-[112px] truncate"
                        style={{ color: accentHex }}
                        dir="rtl"
                      >
                        {task.arabic}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div
                className={`shrink-0 flex items-center justify-between px-4 py-1.5 border-t ${
                  isLightMode
                    ? 'border-black/[0.06] bg-white/35'
                    : 'border-white/[0.06] bg-black/[0.16]'
                }`}
              >
                <span
                  className={`font-serif-eng text-[8px] uppercase ${tTextSub} opacity-75 truncate`}
                  style={{ letterSpacing: '0.14em' }}
                >
                  Tap · Hold for Misbaha
                </span>
                <button
                  type="button"
                  onClick={launchSequenceInMisbaha}
                  className="min-h-[32px] pl-3 pr-1 -mr-1 flex items-center gap-1 font-serif-eng text-[8.5px] uppercase opacity-92 hover:opacity-100 transition-opacity cursor-pointer shrink-0 whitespace-nowrap"
                  style={{ color: accentHex, letterSpacing: '0.16em' }}
                >
                  <span>{activeSetId === 'wird' ? 'Beads' : `Begin ${activeSet.label}`}</span>
                  <ChevronRightIcon size={11} />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Bottom Zone: Utility Bar & Grounded Daily Burhan Card */}
        <div className="w-full flex flex-col gap-2.5 shrink-0">
          {/* Seamless Split Utility Bar (Duas · Qada) */}
          <div
            className={`w-full grid grid-cols-2 divide-x rounded-[18px] border overflow-hidden transition-colors ${
              isLightMode
                ? 'bg-white/62 border-white/80 divide-black/[0.06] island-light'
                : 'bg-[#0b0e16]/68 border-white/[0.09] divide-white/[0.06] island-dark'
            }`}
          >
            <button
              type="button"
              onClick={() => {
                hapticNavigate();
                onOpenDuas?.();
              }}
              className={`min-h-[46px] px-3 flex items-center justify-center gap-1.5 font-serif-eng text-[9.5px] uppercase tracking-[0.14em] transition-colors cursor-pointer ${
                isLightMode ? 'text-[#1a1814] hover:bg-white/50' : 'text-[rgba(245,238,224,0.92)] hover:bg-white/[0.04]'
              }`}
            >
              <BookIcon size={13} style={{ color: accentHex }} className="shrink-0" />
              <span>Duas</span>
            </button>

            <button
              type="button"
              onClick={() => {
                hapticNavigate();
                onOpenQada?.();
              }}
              className={`min-h-[46px] px-3 flex items-center justify-center gap-1.5 font-serif-eng text-[9.5px] uppercase tracking-[0.14em] transition-colors cursor-pointer ${
                isLightMode ? 'text-[#1a1814] hover:bg-white/50' : 'text-[rgba(245,238,224,0.92)] hover:bg-white/[0.04]'
              }`}
            >
              <RotateCcwIcon size={13} style={{ color: accentHex }} className="shrink-0" />
              <span>Qada</span>
              {qadaRemainingCount > 0 && (
                <span
                  className="font-serif-eng text-[9px] tabular-nums opacity-90 shrink-0"
                  style={{ color: accentHex }}
                >
                  ({qadaRemainingCount})
                </span>
              )}
            </button>
          </div>

          {/* Parallel Reflection Shelf: Burhan (Fitrah & Reason) alongside Miracles of the Qur'an */}
          <div
            data-testid="tasks-parallel-reflections"
            className="w-full grid grid-cols-2 gap-2 sm:gap-2.5 items-stretch"
          >
            {currentBurhan && (
              <button
                type="button"
                data-testid="burhan-card"
                onClick={(e) => {
                  hapticNavigate();
                  onOpenBurhan?.(e);
                }}
                className={`group relative w-full text-left px-3 py-2.5 sm:px-3.5 sm:py-3 rounded-[20px] overflow-hidden border transition-all duration-500 ease-out cursor-pointer active:scale-[0.985] flex flex-col justify-between gap-1.5 ${
                  isLightMode
                    ? burhanCompleted
                      ? 'bg-[#0d9488]/12 border-[#0d9488]/35 island-light'
                      : 'bg-white/62 hover:bg-white/75 border-white/80 island-light'
                    : burhanCompleted
                      ? 'bg-[#14b8a6]/12 border-[#14b8a6]/35 island-dark'
                      : 'bg-[#0b0e16]/68 hover:bg-[#0b0e16]/80 border-white/[0.09] island-dark'
                }`}
              >
                <div className="flex items-center justify-between gap-1.5 w-full">
                  <span
                    className="font-calligraphy text-[13px] leading-none shrink-0"
                    style={{ color: hikmahHex }}
                    dir="rtl"
                  >
                    بُرْهَان
                  </span>
                  <span
                    className="flex items-center gap-0.5 font-serif-eng text-[8px] sm:text-[8.5px] uppercase tracking-[0.12em] shrink-0 opacity-90 group-hover:opacity-100"
                    style={{ color: hikmahHex }}
                  >
                    {burhanCompleted && <CheckCircleIcon size={11} />}
                    <span>{burhanCompleted ? 'Reflected' : 'Read'}</span>
                    <ChevronRightIcon
                      size={11}
                      className="group-hover:translate-x-0.5 transition-transform"
                    />
                  </span>
                </div>

                <div className="min-w-0">
                  <h3
                    className={`font-serif-eng text-[13px] sm:text-[14px] font-medium leading-snug line-clamp-2 ${tTextMain}`}
                  >
                    {currentBurhan.title}
                  </h3>
                  <p
                    className="font-serif-eng text-[8.5px] sm:text-[9px] uppercase tracking-[0.11em] truncate mt-1 opacity-85"
                    style={{ color: hikmahHex }}
                  >
                    {currentBurhan.scholar}
                  </p>
                </div>

                {(prefsCtx?.isSimpleMode
                  ? currentBurhan.simpleQuestion || currentBurhan.question
                  : currentBurhan.question) && (
                  <p
                    className={`hidden sm:line-clamp-2 font-serif-eng italic text-[10.5px] leading-snug opacity-72 ${tTextSub}`}
                  >
                    {prefsCtx?.isSimpleMode
                      ? currentBurhan.simpleQuestion || currentBurhan.question
                      : currentBurhan.question}
                  </p>
                )}
              </button>
            )}

            {currentMiracle && (
              <button
                type="button"
                data-testid="miracles-card"
                onClick={(e) => {
                  hapticNavigate();
                  onOpenMiracles?.(e);
                }}
                className={`group relative w-full text-left px-3 py-2.5 sm:px-3.5 sm:py-3 rounded-[20px] overflow-hidden border transition-all duration-500 ease-out cursor-pointer active:scale-[0.985] flex flex-col justify-between gap-1.5 ${
                  isLightMode
                    ? currentMiracleExplored
                      ? 'bg-[#8e6623]/12 border-[#8e6623]/35 island-light'
                      : 'bg-white/62 hover:bg-white/75 border-white/80 island-light'
                    : currentMiracleExplored
                      ? 'bg-[#e4be70]/12 border-[#e4be70]/35 island-dark'
                      : 'bg-[#0b0e16]/68 hover:bg-[#0b0e16]/80 border-white/[0.09] island-dark'
                }`}
              >
                <div className="flex items-center justify-between gap-1.5 w-full">
                  <span
                    className="font-calligraphy text-[13px] leading-none shrink-0"
                    style={{ color: miracleHex }}
                    dir="rtl"
                  >
                    إِعْجَاز
                  </span>
                  <span
                    className="flex items-center gap-0.5 font-serif-eng text-[8px] sm:text-[8.5px] uppercase tracking-[0.12em] shrink-0 opacity-90 group-hover:opacity-100"
                    style={{ color: miracleHex }}
                  >
                    {currentMiracleExplored && <CheckCircleIcon size={11} />}
                    <span>{currentMiracleExplored ? 'Explored' : 'Miracles'}</span>
                    <ChevronRightIcon
                      size={11}
                      className="group-hover:translate-x-0.5 transition-transform"
                    />
                  </span>
                </div>

                <div className="min-w-0">
                  <h3
                    className={`font-serif-eng text-[13px] sm:text-[14px] font-medium leading-snug line-clamp-2 ${tTextMain}`}
                  >
                    {currentMiracle.title}
                  </h3>
                  <p
                    className="font-serif-eng text-[8.5px] sm:text-[9px] uppercase tracking-[0.11em] truncate mt-1 opacity-85"
                    style={{ color: miracleHex }}
                  >
                    {currentMiracle.categoryLabel} · {quranMiraclesData.length} Signs
                  </p>
                </div>

                <p
                  className={`hidden sm:line-clamp-2 font-serif-eng italic text-[10.5px] leading-snug opacity-72 ${tTextSub}`}
                >
                  {currentMiracle.surahRef} — {currentMiracle.keyFact}
                </p>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Customizable Habit Add / Edit Sheet (consumes Preferences & Habits contexts directly) */}
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


