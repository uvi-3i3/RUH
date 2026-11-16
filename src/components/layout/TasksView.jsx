import { useState, useRef, useEffect } from 'react';
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
import { PRACTICE_SETS } from '../../data/adhkarData';
import { getRecommendedAdhkarPeriod, selectActiveBurhan } from '../../utils/devotionLogic';
import { HabitEditorSheet } from './HabitEditorSheet';
import { hapticSuccess, hapticTapLight, hapticTapMedium } from '../../utils/haptics';

export const TasksView = ({
  currentView,
  isLightMode,
  dailyTasks,
  rewardedSets = [],
  burhanCompleted,
  currentStation = 0,
  incrementTask,
  markAdhkarSetRewarded,
  activeDays,
  onOpenBurhan,
  onOpenMisbaha,
  habits = [],
  dailyHabitLogs = {},
  onLogHabitStep,
  onAddCustomHabit,
  onUpdateHabit,
  onReorderHabit,
  onResetDefaultHabits,
  onRemoveHabit,
  dailyIntention = '',
  onSetDailyIntention,
  sunnahContext,
  qadaRemainingCount = 0,
  onOpenDuas,
  onOpenQada,
}) => {
  const tTextMain = isLightMode ? 'text-[#1a1814]' : 'text-[rgba(245,238,224,0.92)]';
  const tTextSub = isLightMode ? 'text-[#2c2720]' : 'text-[rgba(228,218,200,0.68)]';
  const glowSub = isLightMode ? '0 1px 2px rgba(255,255,255,0.75)' : '0 1px 1px rgba(0,0,0,0.8)';

  const recommendedPeriod = getRecommendedAdhkarPeriod();
  const [activeSetId, setActiveSetId] = useState('habits');
  const [isCustomizingHabits, setIsCustomizingHabits] = useState(false);
  const [habitEditor, setHabitEditor] = useState(null);
  const [intentionDraft, setIntentionDraft] = useState(dailyIntention || '');
  const longPressTimer = useRef(null);

  useEffect(() => {
    setIntentionDraft(dailyIntention || '');
  }, [dailyIntention]);

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

  const startPress = (index, id, current, target) => {
    if (current >= target) return;
    hapticTapLight();

    longPressTimer.current = setTimeout(() => {
      onOpenMisbaha?.({ setId: activeSetId, initialIndex: index });
      longPressTimer.current = null;
      hapticTapMedium();
    }, 450);
  };

  const endPress = (id, current, target) => {
    if (current >= target) return;
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
      if (current + 1 >= target) hapticSuccess();
      incrementTask(id, 1);
    }
  };

  const launchSequenceInMisbaha = () => {
    const firstIncomplete = activeItems.findIndex((item) => (dailyTasks[item.id] || 0) < item.target);
    onOpenMisbaha?.({
      setId: activeSetId,
      initialIndex: firstIncomplete >= 0 ? firstIncomplete : 0,
    });
  };

  const currentBurhan = selectActiveBurhan(burhanData, currentStation, activeDays);
  const isTasksActive = currentView === 'tasks';
  const completedDhikrCount = activeItems.filter((t) => (dailyTasks[t.id] || 0) >= t.target).length;
  const completedHabitsCount = habits.filter((h) => (dailyHabitLogs[h.id] || 0) >= h.target).length;
  const completedCount = isHabitsTab ? completedHabitsCount : completedDhikrCount;
  const totalCount = isHabitsTab ? habits.length : activeItems.length;

  const accentHex = isLightMode ? '#7c5a1e' : '#d2a24b';
  const hikmahHex = isLightMode ? '#0d9488' : '#2dd4bf';
  const tabs = [
    { id: 'habits', label: 'Habits' },
    ...Object.values(PRACTICE_SETS).map((s) => ({ id: s.id, label: s.label })),
  ];

  return (
    <div
      data-testid="tasks-scroller"
      className="absolute inset-x-0 bottom-0 flex flex-col items-center transition-[opacity,transform,visibility] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] w-full overflow-y-auto hide-scrollbar pt-2"
      style={{
        top: 'calc(72px + var(--sat))',
        paddingBottom: 'calc(28px + var(--sab))',
        touchAction: 'pan-y',
        opacity: isTasksActive ? 1 : 0,
        visibility: isTasksActive ? 'visible' : 'hidden',
        transform: isTasksActive ? 'scale(1)' : 'scale(1.02)',
        pointerEvents: isTasksActive ? 'auto' : 'none',
        maskImage: isTasksActive
          ? 'linear-gradient(to bottom, transparent 0px, black 16px, black calc(100% - 16px), transparent 100%)'
          : 'none',
        WebkitMaskImage: isTasksActive
          ? 'linear-gradient(to bottom, transparent 0px, black 16px, black calc(100% - 16px), transparent 100%)'
          : 'none',
      }}
    >
      <div className="flex flex-col items-center justify-start w-full max-w-[300px] sm:max-w-[360px] md:max-w-[440px] px-1.5 sm:px-3 mx-auto">
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
                onClick={() => setActiveSetId(tab.id)}
                className="min-h-[34px] rounded-xl font-serif-eng text-[9.5px] uppercase tracking-[0.1em] cursor-pointer flex items-center justify-center gap-1 whitespace-nowrap px-1 border"
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
                    : isLightMode
                      ? 'rgba(44,39,32,0.72)'
                      : 'rgba(228,218,200,0.68)',
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                <span>{tab.label}</span>
                {isNowHint && !isActive && (
                  <span
                    aria-hidden="true"
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: accentHex }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Unified Liquid-Glass Practice Ledger */}
        <div
          className={`w-full rounded-[22px] overflow-hidden border transition-all duration-300 ${
            isLightMode
              ? 'bg-white/62 border-white/80 island-light'
              : 'bg-[#0b0e16]/68 border-white/[0.09] island-dark'
          }`}
        >
          {isHabitsTab ? (
            <>
              {/* Compact Inline Niyyah Row */}
              <div
                className={`px-3.5 sm:px-4 py-2 border-b flex items-center gap-2 ${
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
                <div className="px-4 py-6 text-center flex flex-col items-center gap-3">
                  <p className={`font-serif-eng italic text-[12.5px] leading-relaxed ${tTextSub}`}>
                    Your habit list is clear. Add a custom practice or restore the starter Sunnah habits.
                  </p>
                  <div className="flex items-center gap-2 flex-wrap justify-center">
                    <button
                      type="button"
                      onClick={() => setHabitEditor({ mode: 'create' })}
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
                      onClick={() => onResetDefaultHabits?.()}
                      className={`min-h-[36px] px-3 rounded-xl border font-serif-eng text-[10px] uppercase tracking-[0.14em] cursor-pointer ${
                        isLightMode ? 'border-black/15 text-[#2c2720]' : 'border-white/15 text-[#e4dac8]'
                      }`}
                    >
                      Restore Starters
                    </button>
                  </div>
                </div>
              ) : (
                <div className={`divide-y ${isLightMode ? 'divide-black/[0.06]' : 'divide-white/[0.06]'}`}>
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
                          className={`w-full min-h-[45px] pl-3.5 sm:pl-4 pr-2 py-1.5 flex items-center justify-between gap-2 transition-colors ${
                            isLightMode ? 'hover:bg-white/40' : 'hover:bg-white/[0.035]'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => setHabitEditor({ mode: 'edit', habit })}
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
                              onClick={() => onReorderHabit?.(habit.id, 'up')}
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
                              onClick={() => onReorderHabit?.(habit.id, 'down')}
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
                              onClick={() => setHabitEditor({ mode: 'edit', habit })}
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
                              onClick={() => onRemoveHabit?.(habit.id)}
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
                        className={`group relative w-full min-h-[45px] flex items-center justify-between gap-1 overflow-hidden transition-colors duration-300 ${
                          isLightMode ? 'hover:bg-white/40' : 'hover:bg-white/[0.035]'
                        }`}
                      >
                        <div
                          className="absolute left-0 top-0 bottom-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] pointer-events-none"
                          style={{
                            width: `${progress * 100}%`,
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
                              if (count + 1 >= target) hapticSuccess();
                              else hapticTapLight();
                              onLogHabitStep?.(habit.id, 1);
                            }
                          }}
                          className="relative z-10 flex-1 min-w-0 min-h-[45px] pl-3.5 sm:pl-4 pr-2 py-1.5 flex items-center gap-2.5 text-left cursor-pointer active:scale-[0.99]"
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

                        <div className="relative z-10 flex items-center gap-1 pr-2.5 sm:pr-3 shrink-0">
                          {count > 0 ? (
                            <button
                              type="button"
                              aria-label={`Undo step for ${habit.title}`}
                              onClick={() => onLogHabitStep?.(habit.id, -1)}
                              className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs cursor-pointer transition-colors ${
                                isLightMode ? 'hover:bg-black/10 text-[#3a3329]' : 'hover:bg-white/10 text-[#e4dac8]'
                              }`}
                            >
                              −
                            </button>
                          ) : (
                            <span
                              className="font-arabic text-[11.5px] opacity-75 px-1"
                              style={{ color: accentHex }}
                              dir="rtl"
                            >
                              {habit.arabic}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Calm Footer Bar: Daily Tap vs Customize Toolbar */}
              <div
                className={`flex items-center justify-between px-3.5 sm:px-4 py-1.5 border-t ${
                  isLightMode
                    ? 'border-black/[0.06] bg-white/35'
                    : 'border-white/[0.06] bg-black/[0.16]'
                }`}
              >
                {isCustomizingHabits ? (
                  <>
                    <button
                      type="button"
                      onClick={() => onResetDefaultHabits?.()}
                      className={`min-h-[32px] flex items-center gap-1 font-serif-eng text-[8.5px] uppercase opacity-75 hover:opacity-100 transition-opacity cursor-pointer whitespace-nowrap ${tTextSub}`}
                      style={{ letterSpacing: '0.12em' }}
                    >
                      <RotateCcwIcon size={11} />
                      <span>Reset Starters</span>
                    </button>

                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        type="button"
                        onClick={() => setHabitEditor({ mode: 'create' })}
                        className="min-h-[32px] flex items-center gap-1 font-serif-eng text-[8.5px] uppercase opacity-92 hover:opacity-100 transition-opacity cursor-pointer whitespace-nowrap"
                        style={{ color: accentHex, letterSpacing: '0.14em' }}
                      >
                        <PlusIcon size={12} />
                        <span>Add Habit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsCustomizingHabits(false)}
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
                      Tap row to log +1
                    </span>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setIsCustomizingHabits(true)}
                        className={`min-h-[32px] flex items-center gap-1 font-serif-eng text-[8.5px] uppercase opacity-80 hover:opacity-100 transition-opacity cursor-pointer whitespace-nowrap ${tTextMain}`}
                        style={{ letterSpacing: '0.14em' }}
                      >
                        <EditIcon size={11} />
                        <span>Customize</span>
                      </button>
                      <span className={`${tTextSub} opacity-30 text-[10px]`} aria-hidden="true">·</span>
                      <button
                        type="button"
                        onClick={() => setHabitEditor({ mode: 'create' })}
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
              <div className={`divide-y ${isLightMode ? 'divide-black/[0.06]' : 'divide-white/[0.06]'}`}>
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
                      onPointerDown={() => startPress(idx, task.id, count, task.target)}
                      onPointerUp={() => endPress(task.id, count, task.target)}
                      onPointerLeave={() => {
                        if (longPressTimer.current) {
                          clearTimeout(longPressTimer.current);
                          longPressTimer.current = null;
                        }
                      }}
                      onPointerCancel={() => {
                        if (longPressTimer.current) {
                          clearTimeout(longPressTimer.current);
                          longPressTimer.current = null;
                        }
                      }}
                      className={`group relative w-full min-h-[46px] px-3.5 sm:px-4 py-2 flex items-center justify-between gap-2 text-left overflow-hidden cursor-pointer active:scale-[0.985] transition-colors duration-300 ${
                        isLightMode ? 'hover:bg-white/40' : 'hover:bg-white/[0.035]'
                      }`}
                      style={{ touchAction: 'pan-y' }}
                    >
                      <div
                        className="absolute left-0 top-0 bottom-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] pointer-events-none"
                        style={{
                          width: `${progress * 100}%`,
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
                className={`flex items-center justify-between px-4 py-1.5 border-t ${
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

        {/* Seamless Split Utility Bar (Duas · Qada) */}
        <div
          className={`w-full grid grid-cols-2 divide-x rounded-[18px] border overflow-hidden mt-2.5 transition-colors ${
            isLightMode
              ? 'bg-white/62 border-white/80 divide-black/[0.06] island-light'
              : 'bg-[#0b0e16]/68 border-white/[0.09] divide-white/[0.06] island-dark'
          }`}
        >
          <button
            type="button"
            onClick={onOpenDuas}
            className={`min-h-[42px] px-3 flex items-center justify-center gap-1.5 font-serif-eng text-[9.5px] uppercase tracking-[0.14em] transition-colors cursor-pointer ${
              isLightMode ? 'text-[#1a1814] hover:bg-white/50' : 'text-[rgba(245,238,224,0.92)] hover:bg-white/[0.04]'
            }`}
          >
            <BookIcon size={13} style={{ color: accentHex }} className="shrink-0" />
            <span>Duas</span>
          </button>

          <button
            type="button"
            onClick={onOpenQada}
            className={`min-h-[42px] px-3 flex items-center justify-center gap-1.5 font-serif-eng text-[9.5px] uppercase tracking-[0.14em] transition-colors cursor-pointer ${
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

        {/* Compact Single-Row Daily Burhan Invitation */}
        {currentBurhan && (
          <button
            type="button"
            onClick={onOpenBurhan}
            className={`group relative w-full text-left px-3.5 py-2.5 mt-2 rounded-[18px] overflow-hidden border transition-all duration-500 ease-out cursor-pointer active:scale-[0.985] flex items-center justify-between gap-2.5 ${
              isLightMode
                ? burhanCompleted
                  ? 'bg-[#0d9488]/12 border-[#0d9488]/35 island-light'
                  : 'bg-white/62 hover:bg-white/75 border-white/80 island-light'
                : burhanCompleted
                  ? 'bg-[#14b8a6]/12 border-[#14b8a6]/35 island-dark'
                  : 'bg-[#0b0e16]/68 hover:bg-[#0b0e16]/80 border-white/[0.09] island-dark'
            }`}
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span
                  className="font-calligraphy text-[12px] leading-none shrink-0"
                  style={{ color: hikmahHex }}
                  dir="rtl"
                >
                  بُرْهَان
                </span>
                <span className="opacity-45 text-[9px]" style={{ color: hikmahHex }} aria-hidden="true">·</span>
                <span
                  className="font-serif-eng text-[8px] uppercase truncate opacity-90"
                  style={{ color: hikmahHex, letterSpacing: '0.14em' }}
                >
                  {currentBurhan.scholar}
                </span>
              </div>
              <h3
                className={`font-serif-eng text-[13.5px] font-medium tracking-wide truncate mt-0.5 ${tTextMain}`}
              >
                {currentBurhan.title}
              </h3>
            </div>

            <span
              className="flex items-center gap-1 font-serif-eng text-[8.5px] uppercase tracking-[0.14em] shrink-0 opacity-90 group-hover:opacity-100"
              style={{ color: hikmahHex }}
            >
              {burhanCompleted && <CheckCircleIcon size={12} />}
              <span>{burhanCompleted ? 'Reflected' : 'Read'}</span>
              <ChevronRightIcon
                size={12}
                className="group-hover:translate-x-0.5 transition-transform"
              />
            </span>
          </button>
        )}
      </div>

      {/* Customizable Habit Add / Edit Sheet */}
      <HabitEditorSheet
        isOpen={Boolean(habitEditor)}
        isLightMode={isLightMode}
        editingHabit={habitEditor?.mode === 'edit' ? habitEditor.habit : null}
        existingHabits={habits}
        onSaveNew={(payload) => onAddCustomHabit?.(payload)}
        onSaveEdit={(habitId, patch) => onUpdateHabit?.(habitId, patch)}
        onDeleteHabit={(habitId) => onRemoveHabit?.(habitId)}
        onClose={() => setHabitEditor(null)}
      />
    </div>
  );
};


