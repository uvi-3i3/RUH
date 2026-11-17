import { useState, useRef, useEffect, useCallback } from 'react';
import { useOptionalPreferences } from '../../context/sanctuaryStore';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  RotateCcwIcon,
  VolumeOnIcon,
  VolumeOffIcon,
  XIcon,
} from '../icons/Icons';
import {
  hapticCelebrate,
  hapticDetent,
  hapticDismiss,
  hapticNavigate,
  hapticTapLight,
  hapticToggle,
  hapticUndo,
} from '../../utils/haptics';

export const MisbahaMode = ({
  isOpen,
  tasks = [],
  initialIndex = 0,
  setLabel = 'Misbaha',
  dailyTasks = {},
  isLightMode: isLightModeProp,
  onIncrement,
  onClose,
}) => {
  const preferencesCtx = useOptionalPreferences();
  const isLightMode = isLightModeProp ?? preferencesCtx?.isLightMode ?? false;
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [ripples, setRipples] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const rippleId = useRef(0);
  const audioCtxRef = useRef(null);
  const autoAdvanceTimerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setActiveIndex(Math.min(initialIndex, Math.max(0, tasks.length - 1)));
    }
    return () => {
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
        autoAdvanceTimerRef.current = null;
      }
    };
  }, [isOpen, initialIndex, tasks.length]);

  const playBeadTick = useCallback(
    (isCompletion = false) => {
      if (!soundEnabled || typeof window === 'undefined') return;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      try {
        if (!audioCtxRef.current) {
          audioCtxRef.current = new AudioCtx();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') ctx.resume();
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(isCompletion ? 528 : 340, now);
        osc.frequency.exponentialRampToValueAtTime(isCompletion ? 660 : 180, now + 0.045);
        gain.gain.setValueAtTime(isCompletion ? 0.08 : 0.045, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + (isCompletion ? 0.22 : 0.055));
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + (isCompletion ? 0.24 : 0.06));
      } catch {}
    },
    [soundEnabled]
  );

  const activeTask = tasks[activeIndex] || null;
  const count = activeTask ? dailyTasks[activeTask.id] || 0 : 0;
  const target = activeTask?.target || 33;
  const isCompleted = count >= target;
  const isWholeSetComplete =
    tasks.length > 0 && tasks.every((t) => (dailyTasks[t.id] || 0) >= t.target);

  const goNext = useCallback(() => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    if (activeIndex < tasks.length - 1) {
      setActiveIndex((i) => i + 1);
    } else {
      onClose();
    }
  }, [activeIndex, tasks.length, onClose]);

  const goPrev = useCallback(() => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    if (activeIndex > 0) {
      setActiveIndex((i) => i - 1);
    }
  }, [activeIndex]);

  const handleTap = useCallback(() => {
    if (!activeTask || isCompleted) return;

    const newCount = count + 1;
    onIncrement(activeTask.id, 1);

    const reachedTarget = newCount >= target;
    playBeadTick(reachedTarget);

    if (reachedTarget) hapticCelebrate();
    else hapticTapLight();

    const id = rippleId.current++;
    setRipples((prev) => [...prev, id]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r !== id)), 750);

    if (reachedTarget) {
      if (activeIndex < tasks.length - 1) {
        autoAdvanceTimerRef.current = setTimeout(() => {
          setActiveIndex((i) => Math.min(tasks.length - 1, i + 1));
        }, 1250);
      } else {
        autoAdvanceTimerRef.current = setTimeout(() => onClose(), 1750);
      }
    }
  }, [activeTask, isCompleted, count, target, onIncrement, playBeadTick, activeIndex, tasks.length, onClose]);

  const handleUndo = useCallback(
    (e) => {
      e.stopPropagation();
      if (!activeTask || count <= 0) return;
      hapticUndo();
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
        autoAdvanceTimerRef.current = null;
      }
      onIncrement(activeTask.id, -1);
    },
    [activeTask, count, onIncrement]
  );

  if (!isOpen || !activeTask) return null;

  const progress = Math.min(1, count / target);
  const remaining = Math.max(0, target - count);
  const accentHex = isLightMode ? '#9c7533' : '#d2a24b';
  const tTextMain = isLightMode ? '#1a1814' : 'rgba(245,238,224,0.94)';
  const tTextSub = isLightMode ? '#4a453d' : '#e4dac8';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Misbaha Counter for ${activeTask.title}`}
      className="fixed inset-0 z-[150] flex flex-col items-center justify-between px-6 select-none"
      style={{
        paddingTop: 'calc(24px + var(--sat))',
        paddingBottom: 'calc(24px + var(--sab))',
        background: isLightMode
          ? 'radial-gradient(ellipse at 50% 42%, rgba(255,250,240,0.98), rgba(245,238,224,0.99))'
          : 'radial-gradient(ellipse at 50% 42%, rgba(16,18,26,0.98), rgba(6,7,11,0.99))',
        backdropFilter: 'blur(30px)',
        touchAction: 'none',
        cursor: 'pointer',
      }}
      onClick={() => {
        if (!isCompleted) handleTap();
      }}
    >
      {/* Top Bar: Sequence Navigation + Sound & Close */}
      <div className="relative z-30 w-full max-w-md flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          {tasks.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous Dhikr"
                disabled={activeIndex === 0}
                onClick={(e) => {
                  e.stopPropagation();
                  hapticDetent();
                  goPrev();
                }}
                className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                  activeIndex === 0 ? 'opacity-25 pointer-events-none' : 'opacity-80 hover:opacity-100'
                } ${isLightMode ? 'border-black/10 text-[#4a453d]' : 'border-white/15 text-white'}`}
              >
                <ChevronLeftIcon size={16} />
              </button>
              <span
                className="font-serif-eng text-[10px] uppercase tracking-[0.2em] px-1.5 tabular-nums opacity-70 whitespace-nowrap shrink-0"
                style={{ color: tTextSub }}
              >
                {setLabel} · {activeIndex + 1}/{tasks.length}
              </span>
              <button
                type="button"
                aria-label="Next Dhikr"
                onClick={(e) => {
                  e.stopPropagation();
                  hapticDetent();
                  goNext();
                }}
                className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all cursor-pointer opacity-80 hover:opacity-100 ${
                  isLightMode ? 'border-black/10 text-[#4a453d]' : 'border-white/15 text-white'
                }`}
              >
                <ChevronRightIcon size={16} />
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={soundEnabled ? 'Mute Bead Sound' : 'Enable Bead Sound'}
            onClick={(e) => {
              e.stopPropagation();
              hapticToggle(!soundEnabled);
              setSoundEnabled((s) => !s);
            }}
            className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
              isLightMode
                ? 'border-black/10 text-[#4a453d]/80 hover:text-[#1a1814]'
                : 'border-white/15 text-white/65 hover:text-white'
            }`}
          >
            {soundEnabled ? <VolumeOnIcon size={16} /> : <VolumeOffIcon size={16} />}
          </button>

          <button
            type="button"
            aria-label="Close Misbaha Mode"
            onClick={(e) => {
              e.stopPropagation();
              hapticDismiss();
              onClose();
            }}
            className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
              isLightMode
                ? 'border-black/10 text-[#4a453d]/80 hover:text-[#1a1814]'
                : 'border-white/15 text-white/65 hover:text-white'
            }`}
          >
            <XIcon size={17} />
          </button>
        </div>
      </div>

      {/* Ripple effects */}
      {ripples.map((id) => (
        <div
          key={id}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 120,
            height: 120,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            border: `1px solid ${accentHex}`,
            animation: 'misbahaRipple 0.75s ease-out forwards',
          }}
        />
      ))}

      {/* Main Content */}
      <div className="flex flex-col items-center relative z-10 pointer-events-none max-w-sm w-full text-center my-auto px-2">
        <span
          className={`font-arabic text-[clamp(22px,6vw,34px)] leading-[1.85] mb-3 transition-all duration-300 ${
            isCompleted ? 'scale-105' : ''
          }`}
          dir="rtl"
          style={{
            color: accentHex,
            textShadow: `0 0 48px ${accentHex}38`,
            opacity: isCompleted ? 1 : 0.9,
          }}
        >
          {activeTask.arabic}
        </span>

        {activeTask.translation && (
          <p
            className="font-serif-eng italic text-xs leading-relaxed opacity-65 mb-6 max-w-[300px]"
            style={{ color: tTextSub }}
          >
            {activeTask.translation}
          </p>
        )}

        {/* Counter Orbit */}
        <div className="relative flex items-center justify-center w-[184px] h-[184px] mb-5">
          <svg className="absolute inset-0 -rotate-90" width="184" height="184" viewBox="0 0 200 200">
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke={isLightMode ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'}
              strokeWidth="1"
              strokeDasharray="3 8"
            />
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke={accentHex}
              strokeWidth="2.2"
              strokeDasharray={`${progress * 565.49} 565.49`}
              strokeLinecap="round"
              className="transition-all duration-300"
              style={{ opacity: 0.8 }}
            />
          </svg>

          <div className="flex flex-col items-center tabular-nums">
            <span
              className={`font-serif-eng font-light transition-all duration-300 ${
                isCompleted ? 'text-[64px]' : 'text-[56px]'
              }`}
              style={{
                color: isCompleted ? accentHex : tTextMain,
                textShadow: isCompleted ? `0 0 36px ${accentHex}55` : 'none',
              }}
            >
              {count}
            </span>
            <span
              className="font-serif-eng text-[10px] uppercase tracking-[0.24em] opacity-55 mt-0.5"
              style={{ color: tTextSub }}
            >
              {isCompleted ? `Target ${target} Complete` : `${remaining} remaining`}
            </span>
          </div>
        </div>

        <span
          className="font-serif-eng text-xs uppercase tracking-[0.26em] opacity-70"
          style={{ color: tTextSub }}
        >
          {activeTask.title}
        </span>

        {activeTask.source && (
          <span
            className="font-serif-eng text-[10px] tracking-[0.16em] opacity-45 mt-1"
            style={{ color: tTextSub }}
          >
            {activeTask.source}
          </span>
        )}

        {isCompleted && (
          <div className="flex flex-col items-center mt-5 pointer-events-auto">
            {activeIndex < tasks.length - 1 ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  hapticNavigate();
                  goNext();
                }}
                className={`min-h-[42px] px-5 py-2 rounded-full border font-serif-eng text-xs uppercase tracking-[0.18em] flex items-center gap-1.5 cursor-pointer transition-all ${
                  isLightMode
                    ? 'bg-[#9c7533] text-white border-[#9c7533]'
                    : 'bg-[#d2a24b]/20 text-[#e5c17b] border-[#d2a24b]/40'
                }`}
              >
                <span>Next Dhikr</span>
                <ChevronRightIcon size={14} />
              </button>
            ) : (
              <div className="flex flex-col items-center">
                <span className="font-arabic text-[22px]" style={{ color: accentHex }}>
                  بَارَكَ اللَّهُ فِيكَ
                </span>
                <span
                  className="font-serif-eng text-[10px] uppercase tracking-[0.24em] opacity-60 mt-1"
                  style={{ color: tTextSub }}
                >
                  {isWholeSetComplete ? 'Sequence Fulfilled' : 'Remembrance Complete'}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="relative z-30 w-full max-w-md flex items-center justify-between pt-2">
        <button
          type="button"
          aria-label="Undo one tap"
          disabled={count <= 0}
          onClick={handleUndo}
          className={`min-h-[40px] px-3 rounded-full flex items-center gap-1.5 font-serif-eng text-[10px] uppercase tracking-[0.16em] transition-opacity cursor-pointer ${
            count <= 0 ? 'opacity-20 pointer-events-none' : 'opacity-65 hover:opacity-100'
          }`}
          style={{ color: tTextSub }}
        >
          <RotateCcwIcon size={13} />
          <span>Undo</span>
        </button>

        <span
          className="font-serif-eng text-[10px] uppercase tracking-[0.2em] opacity-45 pointer-events-none whitespace-nowrap"
          style={{ color: tTextSub }}
        >
          {isCompleted ? 'Completed' : 'Tap anywhere to count'}
        </span>
      </div>
    </div>
  );
};
