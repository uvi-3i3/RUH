import { useEffect } from 'react';
import { computeParallaxOffset, lerpParallax } from '../utils/devotionLogic';

/**
 * Attaches passive window mousemove & mouseleave listeners to drive silky,
 * zero-re-render CSS variable depth parallax (--px / --py) on painted cloud layers.
 */
export function useCloudParallax(containerRef, maxShiftX = 24, maxShiftY = 14) {
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof window === 'undefined') return;

    const prefersReducedMotion =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      el.style.setProperty('--px', '0px');
      el.style.setProperty('--py', '0px');
      return;
    }

    const current = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    let rafId = null;

    const applyVars = (x, y) => {
      el.style.setProperty('--px', `${x.toFixed(2)}px`);
      el.style.setProperty('--py', `${y.toFixed(2)}px`);
    };

    applyVars(0, 0);

    const tick = () => {
      current.x = lerpParallax(current.x, target.x, 0.08);
      current.y = lerpParallax(current.y, target.y, 0.08);

      const dx = Math.abs(target.x - current.x);
      const dy = Math.abs(target.y - current.y);

      if (dx < 0.04 && dy < 0.04) {
        current.x = target.x;
        current.y = target.y;
        applyVars(current.x, current.y);
        rafId = null;
        return;
      }

      applyVars(current.x, current.y);
      rafId = requestAnimationFrame(tick);
    };

    const scheduleTick = () => {
      if (rafId === null) {
        rafId = requestAnimationFrame(tick);
      }
    };

    const onMouseMove = (e) => {
      const next = computeParallaxOffset(
        e.clientX,
        e.clientY,
        window.innerWidth,
        window.innerHeight,
        maxShiftX,
        maxShiftY
      );
      target.x = next.x;
      target.y = next.y;
      scheduleTick();
    };

    const onMouseLeave = () => {
      target.x = 0;
      target.y = 0;
      scheduleTick();
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave, { passive: true });

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [containerRef, maxShiftX, maxShiftY]);
}
