import { useRef, useState } from 'react';
import { CheckCircleIcon } from '../icons/Icons';
import { WIRD_TASKS as DHIKR_TASKS } from '../../data/adhkarData';
import { hapticHeavy, hapticSuccess, hapticTapLight } from '../../utils/haptics';

export const TasksSideColumn = ({
  isVisible,
  isLightMode,
  dailyTasks,
  incrementTask,
  accentColor,
}) => {
  const tTextMain = isLightMode ? 'text-[#1a1814]' : 'text-[rgba(245,238,224,0.92)]';
  const tTextSub = isLightMode ? 'text-[#4a453d]' : 'text-[rgba(228,218,200,0.55)]';
  const activeStroke = accentColor || (isLightMode ? '#9c7533' : '#d2a24b');

  const longPressTimer = useRef(null);
  const [pulsingId, setPulsingId] = useState(null);

  const triggerPulse = (id) => {
    setPulsingId(id);
    setTimeout(() => setPulsingId((prev) => (prev === id ? null : prev)), 360);
  };

  const startPress = (id, current, target) => {
    if (current >= target) return;
    hapticTapLight();

    longPressTimer.current = setTimeout(() => {
      incrementTask(id, target - current);
      triggerPulse(id);
      longPressTimer.current = null;
      hapticHeavy();
    }, 600);
  };

  const endPress = (id, current, target) => {
    if (current >= target) return;
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
      if (current + 1 >= target) hapticSuccess();
      incrementTask(id, 1);
      triggerPulse(id);
    }
  };

  const completedPillars = DHIKR_TASKS.filter(
    (t) => (dailyTasks[t.id] || 0) >= t.target
  ).length;

  return (
    <aside
      aria-label={`Ambient Daily Wird (${completedPillars} of 4 complete)`}
      className="fixed left-2 md:left-8 top-1/2 flex flex-col items-center transition-[opacity,transform,visibility] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
      style={{
        opacity: isVisible ? 1 : 0,
        visibility: isVisible ? 'visible' : 'hidden',
        transform: isVisible
          ? 'translateY(-50%) translateX(0px)'
          : 'translateY(-50%) translateX(-14px)',
        pointerEvents: isVisible ? 'auto' : 'none',
        zIndex: 30,
      }}
    >
      {/* Suspended Liquid-Glass Misbaha Rail (Bilateral counterpart to Right Nav Island) */}
      <div
        className={`relative flex flex-col items-center gap-2 py-2 px-1 w-[38px] rounded-full border transition-all duration-700 ${
          isLightMode
            ? 'bg-white/30 border-white/50 engraved-light island-light'
            : 'bg-[#12100d]/35 border-white/[0.06] engraved-dark island-dark'
        }`}
      >
        {/* Continuous Hairline Spine Threading the Beads */}
        <div
          aria-hidden="true"
          className="absolute top-5 bottom-5 left-1/2 -translate-x-1/2 w-[1px] pointer-events-none"
          style={{
            background: isLightMode
              ? 'linear-gradient(180deg, transparent 0%, rgba(156,117,51,0.22) 20%, rgba(156,117,51,0.22) 80%, transparent 100%)'
              : 'linear-gradient(180deg, transparent 0%, rgba(210,162,75,0.22) 20%, rgba(210,162,75,0.22) 80%, transparent 100%)',
          }}
        />

        {DHIKR_TASKS.map((task) => {
          const count = dailyTasks[task.id] || 0;
          const progress = Math.min(1, count / task.target);
          const isComplete = count >= task.target;
          const isPulsing = pulsingId === task.id;

          return (
            <div key={task.id} className="relative group flex items-center justify-center">
              <button
                type="button"
                aria-label={`${task.title}: ${count} of ${task.target}. Tap to increment or hold to complete.`}
                onPointerDown={() => startPress(task.id, count, task.target)}
                onPointerUp={() => endPress(task.id, count, task.target)}
                onPointerLeave={() => {
                  if (longPressTimer.current) {
                    clearTimeout(longPressTimer.current);
                    longPressTimer.current = null;
                  }
                }}
                className={`relative z-10 w-[28px] h-[28px] rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 active:scale-90 ${
                  isPulsing ? 'scale-110' : 'hover:scale-105'
                } ${
                  isComplete
                    ? isLightMode
                      ? 'bg-[#9c7533]/10 opacity-65 hover:opacity-100'
                      : 'bg-[#d2a24b]/10 opacity-65 hover:opacity-100'
                    : isLightMode
                      ? 'bg-[#f4f0e8]/70 hover:bg-white/80'
                      : 'bg-[#090807]/70 hover:bg-white/[0.06]'
                }`}
                style={{ touchAction: 'none' }}
              >
                {/* Precision Orbital Ring */}
                <svg
                  className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
                  viewBox="0 0 36 36"
                >
                  <circle
                    cx="18"
                    cy="18"
                    r="15.5"
                    fill="none"
                    stroke={isLightMode ? 'rgba(74,69,61,0.12)' : 'rgba(255,255,255,0.08)'}
                    strokeWidth="1.2"
                  />
                  {progress > 0 && (
                    <circle
                      cx="18"
                      cy="18"
                      r="15.5"
                      fill="none"
                      stroke={activeStroke}
                      strokeWidth="1.6"
                      strokeDasharray="97.389"
                      strokeDashoffset={97.389 * (1 - progress)}
                      strokeLinecap="round"
                      className="transition-all duration-300 ease-out"
                    />
                  )}
                </svg>

                {isComplete ? (
                  <CheckCircleIcon size={11} style={{ color: activeStroke }} />
                ) : (
                  <span
                    className={`font-serif-eng text-[9.5px] tabular-nums leading-none transition-colors duration-300 ${
                      count > 0 ? tTextMain : `${tTextSub} opacity-75 group-hover:opacity-100`
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>

              {/* Desktop Horology Tick & Floating Liquid-Glass Whisper Pill */}
              <div
                aria-hidden="true"
                className="hidden md:flex items-center absolute left-full ml-2.5 pointer-events-none whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
              >
                {/* Resting Micro-Tick */}
                <span
                  className="w-2.5 h-[1px] mr-2 transition-all duration-300 opacity-30 group-hover:opacity-80 group-hover:w-3.5"
                  style={{ backgroundColor: activeStroke }}
                />

                {/* Whisper Label (Subtle at rest, crisp pill on hover/focus) */}
                <div
                  className={`flex items-center gap-2 px-2.5 py-1 rounded-full border transition-all duration-300 ${
                    isLightMode
                      ? 'border-transparent group-hover:border-white/70 group-hover:bg-white/45 group-hover:island-light'
                      : 'border-transparent group-hover:border-white/10 group-hover:bg-[#12100d]/55 group-hover:island-dark'
                  }`}
                >
                  <span
                    className={`font-serif-eng text-[9px] uppercase tracking-[0.2em] transition-opacity duration-300 ${
                      isComplete
                        ? 'opacity-70'
                        : 'opacity-40 group-hover:opacity-95'
                    }`}
                    style={{ color: isComplete ? activeStroke : undefined }}
                  >
                    <span className={isComplete ? '' : tTextMain}>{task.title}</span>
                  </span>
                  <span
                    className={`font-serif-eng text-[9px] tabular-nums tracking-[0.08em] opacity-0 max-w-0 overflow-hidden group-hover:opacity-75 group-hover:max-w-[64px] transition-all duration-300 ${tTextSub}`}
                  >
                    {count}/{task.target}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
