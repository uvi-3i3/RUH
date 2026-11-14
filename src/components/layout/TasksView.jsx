import { useState, useRef, useEffect } from 'react';
import { CheckCircleIcon, ChevronRightIcon } from '../icons/Icons';
import { burhanData } from '../../data/burhanData';
import { PRACTICE_SETS } from '../../data/adhkarData';
import { getRecommendedAdhkarPeriod, selectActiveBurhan } from '../../utils/devotionLogic';

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
}) => {
  const tTextMain = isLightMode ? 'text-[#1a1814]' : 'text-[rgba(245,238,224,0.92)]';
  const tTextSub = isLightMode ? 'text-[#2c2720]' : 'text-[rgba(228,218,200,0.62)]';
  const glowSub = isLightMode ? '0 1px 2px rgba(255,255,255,0.75)' : '0 1px 1px rgba(0,0,0,0.8)';

  const recommendedPeriod = getRecommendedAdhkarPeriod();
  const [activeSetId, setActiveSetId] = useState('wird');
  const longPressTimer = useRef(null);

  useEffect(() => {
    ['sabah', 'masa'].forEach((setKey) => {
      const items = PRACTICE_SETS[setKey].items;
      const done = items.every((item) => (dailyTasks[item.id] || 0) >= item.target);
      if (done && !rewardedSets.includes(setKey) && markAdhkarSetRewarded) {
        markAdhkarSetRewarded(setKey);
      }
    });
  }, [dailyTasks, rewardedSets, markAdhkarSetRewarded]);

  const activeSet = PRACTICE_SETS[activeSetId] || PRACTICE_SETS.wird;
  const activeItems = activeSet.items;

  const startPress = (index, id, current, target) => {
    if (current >= target) return;
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10);

    longPressTimer.current = setTimeout(() => {
      onOpenMisbaha?.({ setId: activeSetId, initialIndex: index });
      longPressTimer.current = null;
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(40);
    }, 450);
  };

  const endPress = (id, current, target) => {
    if (current >= target) return;
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
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
  const completedCount = activeItems.filter((t) => (dailyTasks[t.id] || 0) >= t.target).length;
  const accentHex = isLightMode ? '#7c5a1e' : '#d2a24b';
  const hikmahHex = isLightMode ? '#0d9488' : '#2dd4bf';

  return (
    <div
      data-testid="tasks-scroller"
      className="absolute inset-x-0 top-[76px] md:top-[86px] bottom-0 flex flex-col items-center transition-[opacity,transform,visibility] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] w-full overflow-y-auto hide-scrollbar pt-4 pb-12"
      style={{
        opacity: isTasksActive ? 1 : 0,
        visibility: isTasksActive ? 'visible' : 'hidden',
        transform: isTasksActive ? 'scale(1)' : 'scale(1.02)',
        pointerEvents: isTasksActive ? 'auto' : 'none',
        maskImage: isTasksActive
          ? 'linear-gradient(to bottom, transparent 0px, black 20px, black calc(100% - 20px), transparent 100%)'
          : 'none',
        WebkitMaskImage: isTasksActive
          ? 'linear-gradient(to bottom, transparent 0px, black 20px, black calc(100% - 20px), transparent 100%)'
          : 'none',
      }}
    >
      <div className="flex flex-col items-center justify-start w-full max-w-[300px] sm:max-w-[348px] px-1.5 sm:px-3 mx-auto my-auto">
        {/* Whisper-Quiet Crown */}
        <span
          className={`font-calligraphy text-[25px] leading-none ${tTextMain} opacity-80 mb-1 transition-colors duration-1000`}
          style={{ textShadow: glowSub }}
          dir="rtl"
        >
          {activeSet.arabicTitle}
        </span>
        <div className="flex items-center gap-2 mb-4">
          <span
            className={`font-serif-eng text-[8.5px] uppercase ${tTextSub} opacity-72 transition-colors duration-1000`}
            style={{ letterSpacing: '0.26em', marginRight: '-0.26em', textShadow: glowSub }}
          >
            {activeSet.subtitle}
          </span>
          <span
            className={`font-serif-eng text-[8.5px] tabular-nums opacity-55 ${tTextSub}`}
            style={{ letterSpacing: '0.12em' }}
          >
            · {completedCount}/{activeItems.length}
          </span>
        </div>

        {/* Interactive Practice Set Switcher (Wird / Sabah / Masa) */}
        <div
          role="tablist"
          aria-label="Practice Sets"
          className={`w-full grid grid-cols-3 p-1 rounded-2xl border mb-3.5 transition-colors ${
            isLightMode
              ? 'bg-white/35 border-white/65'
              : 'bg-[#0e1118]/45 border-white/[0.08]'
          }`}
        >
          {Object.values(PRACTICE_SETS).map((tab) => {
            const isActive = activeSetId === tab.id;
            const isNowHint = tab.id === recommendedPeriod;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveSetId(tab.id)}
                className="min-h-[38px] rounded-xl font-serif-eng text-[10px] uppercase tracking-[0.16em] transition-colors duration-200 cursor-pointer flex items-center justify-center gap-1 whitespace-nowrap"
                style={{
                  backgroundColor: isActive
                    ? isLightMode
                      ? 'rgba(255,255,255,0.88)'
                      : 'rgba(255,255,255,0.12)'
                    : 'transparent',
                  color: isActive
                    ? isLightMode
                      ? '#7c5a1e'
                      : '#e5c17b'
                    : isLightMode
                      ? 'rgba(74,69,61,0.68)'
                      : 'rgba(228,218,200,0.52)',
                  fontWeight: isActive ? 500 : 400,
                }}
              >
                <span>{tab.label}</span>
                {isNowHint && !isActive && (
                  <span className="text-[7.5px] opacity-65 tracking-normal">· now</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Unified Liquid-Glass Practice Ledger */}
        <div
          className={`w-full rounded-[24px] overflow-hidden border transition-all duration-700 ${
            isLightMode
              ? 'bg-white/46 border-white/75 island-light'
              : 'bg-[#0e1118]/38 border-white/[0.08] island-dark'
          }`}
        >
          <div className={`divide-y ${isLightMode ? 'divide-black/[0.06]' : 'divide-white/[0.06]'}`}>
            {activeItems.map((task, idx) => {
              const count = dailyTasks[task.id] || 0;
              const progress = Math.min(1, count / task.target);
              const isComplete = count >= task.target;
              const radius = 8.5;
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
                  className={`group relative w-full min-h-[52px] px-3.5 sm:px-4 py-2.5 flex items-center justify-between gap-2 text-left overflow-hidden cursor-pointer active:scale-[0.985] transition-colors duration-300 ${
                    isLightMode ? 'hover:bg-white/40' : 'hover:bg-white/[0.035]'
                  }`}
                  style={{ touchAction: 'none' }}
                >
                  {/* Liquid Meniscus Sweep */}
                  <div
                    className="absolute left-0 top-0 bottom-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] pointer-events-none"
                    style={{
                      width: `${progress * 100}%`,
                      background: isLightMode
                        ? 'linear-gradient(90deg, rgba(156,117,51,0.05) 0%, rgba(156,117,51,0.16) 100%)'
                        : 'linear-gradient(90deg, rgba(210,162,75,0.04) 0%, rgba(210,162,75,0.16) 100%)',
                    }}
                  />

                  {/* Left: Micro Orbital Progress Ring + Name & Count */}
                  <div className="relative z-10 flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="relative w-5 h-5 flex items-center justify-center shrink-0">
                      {isComplete ? (
                        <CheckCircleIcon
                          size={16}
                          className="animate-[checkmarkPop_0.4s_cubic-bezier(0.34,1.56,0.64,1)_forwards]"
                          style={{ color: accentHex }}
                        />
                      ) : (
                        <svg className="w-5 h-5 -rotate-90" viewBox="0 0 22 22">
                          <circle
                            cx="11"
                            cy="11"
                            r={radius}
                            fill="none"
                            stroke={isLightMode ? 'rgba(26,24,20,0.14)' : 'rgba(255,255,255,0.12)'}
                            strokeWidth="1.4"
                          />
                          {progress > 0 && (
                            <circle
                              cx="11"
                              cy="11"
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
                        className={`font-serif-eng text-[13px] sm:text-[13.5px] leading-tight font-medium tracking-wide truncate transition-colors duration-300 ${
                          isComplete ? '' : tTextMain
                        }`}
                        style={{ color: isComplete ? accentHex : undefined }}
                      >
                        {task.title}
                      </span>
                      <span
                        className={`font-serif-eng text-[10px] leading-tight tabular-nums mt-0.5 ${tTextSub} opacity-70`}
                      >
                        {count}
                        <span className="opacity-55"> / {task.target}</span>
                      </span>
                    </div>
                  </div>

                  {/* Right: Calligraphic Arabic Phrase */}
                  <span
                    className="relative z-10 font-arabic text-[12px] sm:text-[13px] opacity-75 group-hover:opacity-100 transition-opacity shrink-0 max-w-[80px] sm:max-w-[112px] truncate"
                    style={{ color: accentHex }}
                    dir="rtl"
                  >
                    {task.arabic}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Integrated Ledger Shelf: Subtle Hint + Misbaha Beads Sequence Launcher */}
          <div
            className={`flex items-center justify-between px-4 py-2 border-t ${
              isLightMode
                ? 'border-black/[0.06] bg-white/25'
                : 'border-white/[0.06] bg-black/[0.12]'
            }`}
          >
            <span
              className={`font-serif-eng text-[8px] uppercase ${tTextSub} opacity-62 truncate`}
              style={{ letterSpacing: '0.14em' }}
            >
              Tap · Hold for Misbaha
            </span>
            <button
              type="button"
              onClick={launchSequenceInMisbaha}
              className="min-h-[36px] pl-3 pr-1 -mr-1 flex items-center gap-1 font-serif-eng text-[8.5px] uppercase opacity-88 hover:opacity-100 transition-opacity cursor-pointer shrink-0 whitespace-nowrap"
              style={{ color: accentHex, letterSpacing: '0.16em' }}
            >
              <span>{activeSetId === 'wird' ? 'Beads' : `Begin ${activeSet.label}`}</span>
              <ChevronRightIcon size={11} />
            </button>
          </div>
        </div>

        {/* Sanctuary Manuscript Diamond Motif */}
        {currentBurhan && (
          <>
            <div className="flex items-center justify-center gap-2 my-4 opacity-45" aria-hidden="true">
              <span className="w-5 h-[1px]" style={{ backgroundColor: hikmahHex }} />
              <span className="w-1 h-1 rotate-45" style={{ backgroundColor: hikmahHex }} />
              <span className="w-5 h-[1px]" style={{ backgroundColor: hikmahHex }} />
            </div>

            {/* Compact Single-Elevation Daily Burhan Invitation */}
            <button
              type="button"
              onClick={onOpenBurhan}
              className={`group relative w-full text-left px-4 py-3.5 rounded-[20px] overflow-hidden border transition-all duration-500 ease-out cursor-pointer active:scale-[0.985] ${
                isLightMode
                  ? burhanCompleted
                    ? 'bg-[#0d9488]/10 border-[#0d9488]/30 island-light'
                    : 'bg-white/42 hover:bg-white/60 border-white/70 island-light'
                  : burhanCompleted
                    ? 'bg-[#14b8a6]/10 border-[#14b8a6]/30 island-dark'
                    : 'bg-[#0e1118]/34 hover:bg-[#0e1118]/48 border-white/[0.08] island-dark'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="font-calligraphy text-[13px] leading-none shrink-0 opacity-90"
                    style={{ color: hikmahHex }}
                    dir="rtl"
                  >
                    بُرْهَان
                  </span>
                  <span
                    aria-hidden="true"
                    className="w-[2px] h-[2px] rounded-full opacity-55 shrink-0"
                    style={{ backgroundColor: hikmahHex }}
                  />
                  <span
                    className="font-serif-eng text-[8px] uppercase truncate opacity-92"
                    style={{ color: hikmahHex, letterSpacing: '0.16em' }}
                  >
                    {currentBurhan.scholar}
                  </span>
                </div>
                {burhanCompleted ? (
                  <span className="flex items-center gap-1 shrink-0" style={{ color: hikmahHex }}>
                    <CheckCircleIcon
                      size={12}
                      className="animate-[checkmarkPop_0.4s_cubic-bezier(0.34,1.56,0.64,1)_forwards]"
                    />
                    <span className="font-serif-eng text-[8px] uppercase tracking-[0.14em] opacity-90">
                      Reflected
                    </span>
                  </span>
                ) : (
                  <span
                    className={`font-serif-eng text-[8px] uppercase tracking-[0.14em] opacity-70 shrink-0 ${tTextSub}`}
                  >
                    +5% Yaqeen
                  </span>
                )}
              </div>

              <h3
                className={`font-serif-eng text-[16px] sm:text-[17px] font-medium tracking-wide leading-snug ${tTextMain}`}
              >
                {currentBurhan.title}
              </h3>

              <div className="flex items-center justify-between gap-3 mt-1">
                <span
                  className={`font-serif-eng text-[9px] uppercase tracking-[0.16em] opacity-60 truncate ${tTextSub}`}
                >
                  {currentBurhan.theme || 'Contemplation'} · {currentBurhan.readMinutes || '1 min'}
                </span>
                <span
                  className="flex items-center gap-1 font-serif-eng text-[8.5px] uppercase tracking-[0.16em] shrink-0 opacity-90 group-hover:opacity-100"
                  style={{ color: hikmahHex }}
                >
                  <span>{burhanCompleted ? 'Library' : 'Read'}</span>
                  <ChevronRightIcon
                    size={12}
                    className="group-hover:translate-x-0.5 transition-transform"
                  />
                </span>
              </div>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
