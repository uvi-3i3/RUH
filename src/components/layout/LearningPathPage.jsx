import { useEffect, useMemo, useState } from 'react';
import { ChevronLeftIcon } from '../icons/Icons';
import {
  DEFAULT_TRANSITION_MS,
  buildOriginMorphStyles,
} from '../../utils/learningPathLogic';
import { LESSON_ONE_LANDMARKS } from '../../data/learningPathData';
import { hapticDismiss } from '../../utils/haptics';
import { AncientMapCanvas } from './AncientMapCanvas';

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
  const [lessonProgress, setLessonProgress] = useState({
    discoveredCount: 0,
    totalCount: LESSON_ONE_LANDMARKS.length,
    isComplete: false,
  });

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

  const accentHex = isLightMode ? '#7a5420' : '#d4af6a';

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
        backgroundColor: isLightMode ? '#ece0ca' : '#13100d',
      }}
    >
      {/* Floating Minimal Top Bar (Zero navigation bars or app tabs) */}
      <header
        className="absolute inset-x-0 top-0 z-30 flex items-center justify-between gap-3 px-4 sm:px-7 pointer-events-none"
        style={{ paddingTop: 'calc(12px + var(--sat))' }}
      >
        <button
          type="button"
          data-testid="learning-path-back"
          aria-label="Exit Learning Path"
          onClick={handleBack}
          className={`pointer-events-auto min-h-[44px] pl-3 pr-4 rounded-full border flex items-center gap-1.5 font-serif-eng text-[11px] uppercase tracking-[0.16em] whitespace-nowrap shrink-0 transition-all duration-200 cursor-pointer active:scale-[0.97] shadow-md backdrop-blur-md ${
            isLightMode
              ? 'bg-[#f7efe0]/92 hover:bg-[#fbf6ea] border-[#7a5420]/22 text-[#261c11]'
              : 'bg-[#1a1612]/90 hover:bg-[#241e18] border-[#d4af6a]/24 text-[#efe5d4]'
          }`}
        >
          <ChevronLeftIcon size={15} style={{ color: accentHex }} />
          <span>Back</span>
        </button>

        <div
          className={`pointer-events-auto px-3.5 py-2 rounded-full border flex items-center gap-2.5 shadow-md backdrop-blur-md ${
            isLightMode
              ? 'bg-[#f7efe0]/92 border-[#7a5420]/22 text-[#261c11]'
              : 'bg-[#1a1612]/90 border-[#d4af6a]/24 text-[#efe5d4]'
          }`}
        >
          <h1
            id="learning-path-heading"
            className="font-serif-eng text-[11px] sm:text-[12px] uppercase tracking-[0.16em] whitespace-nowrap"
          >
            Lesson I · Pillars
          </h1>
          <span aria-hidden="true" className="opacity-35">
            |
          </span>
          <span
            data-testid="lesson-one-counter"
            className="font-serif-eng text-[11px] sm:text-[12px] font-medium tabular-nums whitespace-nowrap"
            style={{ color: accentHex }}
          >
            {lessonProgress.discoveredCount} / {lessonProgress.totalCount}
          </span>
        </div>
      </header>

      {/* Full-Bleed Ancient Cartography Canvas */}
      <AncientMapCanvas
        isLightMode={isLightMode}
        reducedMotion={reducedMotion}
        onProgressChange={setLessonProgress}
      />
    </section>
  );
};
