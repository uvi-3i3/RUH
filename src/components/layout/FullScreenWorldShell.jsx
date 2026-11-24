import { useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_TRANSITION_MS,
  buildOriginMorphStyles,
} from '../../utils/learningPathLogic';

function prefersReducedMotion() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Full-screen click-origin engulfing world container matching LearningPathPage.
 * Expands radially from the clicked card/button to engulf 100% of the viewport,
 * and collapses smoothly back into the origin point on exit.
 */
export const FullScreenWorldShell = ({
  origin,
  isClosing = false,
  backgroundColor = '#080c14',
  zIndexClass = 'z-[90]',
  ariaLabel,
  ariaLabelledBy,
  testId,
  onExited,
  children,
}) => {
  const reducedMotion = useMemo(() => prefersReducedMotion(), []);
  const [viewport, setViewport] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 390,
    height: typeof window !== 'undefined' ? window.innerHeight : 844,
  }));
  const [phase, setPhase] = useState('idle-closed'); // 'idle-closed' | 'expanding' | 'open' | 'closing'

  useEffect(() => {
    const handleResize = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
  const isAnimating = phase === 'expanding' || phase === 'closing';

  return (
    <section
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      data-testid={testId}
      data-phase={phase}
      className={`fixed inset-0 ${zIndexClass} flex flex-col overflow-hidden pointer-events-auto`}
      style={{
        clipPath: morphStyles.clipPath,
        WebkitClipPath: morphStyles.clipPath,
        transform: morphStyles.transform,
        transformOrigin: morphStyles.transformOrigin,
        opacity: morphStyles.opacity,
        transition: morphStyles.transition,
        willChange: isAnimating ? 'clip-path, transform, opacity' : 'auto',
        backgroundColor,
      }}
    >
      {children}
    </section>
  );
};
