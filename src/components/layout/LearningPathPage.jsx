import { useEffect, useMemo, useState } from 'react';
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
 * presenting a practical, structured Interactive Learning Studio for Lesson I.
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

  const handleBack = () => {
    if (isClosing) return;
    hapticDismiss();
    onRequestClose?.();
  };

  const isAnimating = phase === 'expanding' || phase === 'closing';

  return (
    <section
      role="dialog"
      aria-modal="true"
      aria-labelledby="learning-path-heading"
      data-testid="learning-path-page"
      data-phase={phase}
      className="fixed inset-0 z-[90] flex flex-col overflow-hidden pointer-events-auto"
      style={{
        clipPath: morphStyles.clipPath,
        WebkitClipPath: morphStyles.clipPath,
        transform: morphStyles.transform,
        transformOrigin: morphStyles.transformOrigin,
        opacity: morphStyles.opacity,
        transition: morphStyles.transition,
        willChange: isAnimating ? 'clip-path, transform, opacity' : 'auto',
        backgroundColor: isLightMode ? '#f4ecdc' : '#110e0b',
      }}
    >
      <AncientMapCanvas
        isLightMode={isLightMode}
        isAnimating={isAnimating}
        reducedMotion={reducedMotion}
        lessonProgress={lessonProgress}
        onProgressChange={setLessonProgress}
        onBack={handleBack}
      />
    </section>
  );
};
