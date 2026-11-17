import { useEffect, useMemo, useState } from 'react';
import { ChevronLeftIcon } from '../icons/Icons';
import {
  DEFAULT_TRANSITION_MS,
  buildOriginMorphStyles,
} from '../../utils/learningPathLogic';
import { hapticDismiss } from '../../utils/haptics';

function prefersReducedMotion() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Full-screen Learning Path destination page.
 * Expands directly from the clicked point to engulf the entire viewport,
 * removing all app navigation bars, headers, and bottom docks.
 */
export const LearningPathPage = ({
  origin,
  isClosing = false,
  isLightMode = false,
  onRequestClose,
  onExited,
}) => {
  const reducedMotion = useMemo(() => prefersReducedMotion(), []);
  const [viewport, setViewport] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 390,
    height: typeof window !== 'undefined' ? window.innerHeight : 844,
  }));
  const [phase, setPhase] = useState('idle-closed'); // 'idle-closed' | 'expanding' | 'open' | 'closing'

  // Sync viewport resize cleanly while open
  useEffect(() => {
    const handleResize = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Kick off the click-origin expansion on the frame right after initial paint
  useEffect(() => {
    if (!origin || isClosing) return undefined;

    let raf1 = 0;
    let raf2 = 0;
    let settleTimer = null;

    setPhase('idle-closed');

    raf1 = window.requestAnimationFrame(() => {
      raf2 = window.requestAnimationFrame(() => {
        setPhase('expanding');
        const duration = reducedMotion ? 180 : DEFAULT_TRANSITION_MS;
        settleTimer = window.setTimeout(() => {
          setPhase('open');
        }, duration);
      });
    });

    return () => {
      window.cancelAnimationFrame(raf1);
      window.cancelAnimationFrame(raf2);
      if (settleTimer) window.clearTimeout(settleTimer);
    };
  }, [origin, reducedMotion, isClosing]);

  // Reverse animation cleanly back into the clicked point before unmounting
  useEffect(() => {
    if (!isClosing) return undefined;
    setPhase('closing');
    const duration = reducedMotion ? 160 : DEFAULT_TRANSITION_MS;
    const timer = window.setTimeout(() => {
      onExited?.();
    }, duration);
    return () => window.clearTimeout(timer);
  }, [isClosing, reducedMotion, onExited]);

  if (!origin) return null;

  const morphStyles = buildOriginMorphStyles(origin, viewport, phase, reducedMotion);

  const accentHex = isLightMode ? '#7c5a1e' : '#d2a24b';
  const textMain = isLightMode ? 'text-[#1a1814]' : 'text-[rgba(245,238,224,0.95)]';
  const textSub = isLightMode ? 'text-[#3c362d]' : 'text-[rgba(228,218,200,0.74)]';

  const handleBack = () => {
    if (isClosing) return;
    hapticDismiss();
    onRequestClose?.();
  };

  return (
    <section
      role="dialog"
      aria-modal="true"
      aria-labelledby="learning-path-heading"
      data-testid="learning-path-page"
      data-phase={phase}
      className="fixed inset-0 z-[90] flex flex-col overflow-hidden pointer-events-auto select-none"
      style={{
        clipPath: morphStyles.clipPath,
        WebkitClipPath: morphStyles.clipPath,
        transform: morphStyles.transform,
        transformOrigin: morphStyles.transformOrigin,
        opacity: morphStyles.opacity,
        transition: morphStyles.transition,
        willChange: 'clip-path, transform, opacity',
        background: isLightMode
          ? 'radial-gradient(ellipse 90% 65% at 50% 18%, #fbf8f1 0%, #f3ecdd 55%, #e8dec9 100%)'
          : 'radial-gradient(ellipse 90% 65% at 50% 18%, #10192d 0%, #090e1a 55%, #050811 100%)',
      }}
    >
      {/* Subtle Decorative Celestial Depth Halo (Non-interactive, static) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: isLightMode
            ? 'radial-gradient(circle at 50% 34%, rgba(156,117,51,0.08) 0%, transparent 56%)'
            : 'radial-gradient(circle at 50% 34%, rgba(210,162,75,0.09) 0%, transparent 56%)',
        }}
      />

      {/* Minimal Top Safe-Area Return Control (Zero navigation bars or app tabs) */}
      <div
        className="relative z-10 flex items-center justify-between px-4 sm:px-8 shrink-0"
        style={{ paddingTop: 'calc(14px + var(--sat))' }}
      >
        <button
          type="button"
          data-testid="learning-path-back"
          aria-label="Exit Learning Path"
          onClick={handleBack}
          className={`min-h-[44px] pl-3 pr-4 rounded-full border flex items-center gap-1.5 font-serif-eng text-[11px] uppercase tracking-[0.16em] transition-all duration-300 cursor-pointer active:scale-[0.97] ${
            isLightMode
              ? 'bg-white/75 hover:bg-white/95 border-black/[0.08] text-[#1a1814] island-light'
              : 'bg-white/[0.06] hover:bg-white/[0.12] border-white/[0.12] text-[rgba(245,238,224,0.92)] island-dark'
          }`}
        >
          <ChevronLeftIcon size={15} style={{ color: accentHex }} />
          <span>Back</span>
        </button>

        <span
          className="font-serif-eng text-[9.5px] uppercase tracking-[0.22em] opacity-75"
          style={{ color: accentHex }}
        >
          Al-Masar · Step I
        </span>
      </div>

      {/* Centered Contemplative Learning Canvas */}
      <main
        className="relative z-10 flex-1 w-full overflow-y-auto hide-scrollbar flex flex-col items-center justify-center px-5 sm:px-8"
        style={{ paddingBottom: 'calc(32px + var(--sab))' }}
      >
        <div
          className="w-full max-w-[460px] mx-auto flex flex-col items-center text-center transition-opacity duration-500"
          style={{
            opacity: phase === 'idle-closed' ? 0 : 1,
            transitionDelay: phase === 'expanding' ? '110ms' : '0ms',
          }}
        >
          {/* Arabic Calligraphic Crest */}
          <span
            className="font-calligraphy text-[34px] sm:text-[40px] leading-none mb-3"
            style={{ color: accentHex }}
            dir="rtl"
          >
            مَسَارُ التَّعَلُّم
          </span>

          <h1
            id="learning-path-heading"
            className={`font-serif-eng text-[28px] sm:text-[34px] font-medium tracking-[0.02em] leading-[1.15] ${textMain}`}
          >
            The Learning Path
          </h1>

          {/* Quiet Ornamental Divider */}
          <div className="flex items-center justify-center gap-2.5 my-4" aria-hidden="true">
            <span className="w-8 h-[1px] opacity-40" style={{ backgroundColor: accentHex }} />
            <span className="w-1.5 h-1.5 rotate-45 opacity-80" style={{ backgroundColor: accentHex }} />
            <span className="w-8 h-[1px] opacity-40" style={{ backgroundColor: accentHex }} />
          </div>

          <p
            className={`font-serif-eng italic text-[14.5px] sm:text-[15.5px] leading-relaxed max-w-[380px] mb-8 ${textSub}`}
          >
            A dedicated room apart — quiet, uninterrupted, and prepared for our step-by-step path of knowledge.
          </p>

          {/* Step 1 Foundation Vessel */}
          <div
            className={`w-full rounded-[24px] border p-6 sm:p-7 flex flex-col items-center gap-4 ${
              isLightMode
                ? 'bg-white/70 border-white/90 island-light'
                : 'bg-[#0b0e16]/75 border-white/[0.1] island-dark'
            }`}
          >
            {/* Clean Geometric Horizon Path Motif */}
            <svg
              aria-hidden="true"
              viewBox="0 0 220 56"
              className="w-[188px] h-[48px] opacity-90"
              fill="none"
            >
              <path
                d="M18 42 C 56 42, 76 16, 110 16 C 144 16, 164 42, 202 22"
                stroke={accentHex}
                strokeWidth="1.25"
                strokeDasharray="3 4"
                strokeLinecap="round"
                opacity="0.55"
              />
              <circle cx="18" cy="42" r="5" fill={accentHex} />
              <circle cx="18" cy="42" r="9.5" stroke={accentHex} strokeWidth="1" opacity="0.35" />
              <circle
                cx="110"
                cy="16"
                r="4"
                stroke={accentHex}
                strokeWidth="1.25"
                opacity="0.6"
              />
              <circle
                cx="202"
                cy="22"
                r="4"
                stroke={accentHex}
                strokeWidth="1.25"
                strokeDasharray="2 2"
                opacity="0.45"
              />
            </svg>

            <div className="flex flex-col items-center gap-1.5">
              <span
                className="font-serif-eng text-[9px] uppercase tracking-[0.22em]"
                style={{ color: accentHex }}
              >
                Foundation · Ready
              </span>
              <h2 className={`font-serif-eng text-[18px] font-medium tracking-wide ${textMain}`}>
                First Threshold Established
              </h2>
              <p className={`font-serif-eng text-[13px] leading-relaxed max-w-[320px] ${textSub} opacity-85`}>
                Navigation and distractions recede here. In the next step, we will begin shaping the curriculum and milestones inside this space.
              </p>
            </div>
          </div>
        </div>
      </main>
    </section>
  );
};
