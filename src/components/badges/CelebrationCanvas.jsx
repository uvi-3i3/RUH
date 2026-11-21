import { useCallback, useEffect, useRef } from 'react';
import { getBadgeTierStyle } from '../../utils/badgeLogic';

/**
 * 60fps celebratory Canvas particle, crescent/diamond confetti & metallic foil engine.
 * Spans the full viewport in boxless reward reveals and erupts cleanly from the
 * floating medallion's center coordinates.
 */
export const CelebrationCanvas = ({
  tier = 'gold',
  isLightMode = false,
  burstKey = 1,
  active = true,
  originYRatio = 0.4,
}) => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const paletteRef = useRef(null);
  const sizeRef = useRef({ w: 368, h: 530 });

  const tierStyle = getBadgeTierStyle(tier, isLightMode);
  paletteRef.current = tierStyle.palette;

  const getFoilColors = useCallback(() => {
    const pal = paletteRef.current;
    if (isLightMode) {
      if (tier === 'platinum') {
        return ['#233854', '#355075', '#0d9488', '#5c7da8', '#0284c7'];
      }
      if (tier === 'gold') {
        return ['#8d6319', '#b8842c', '#d49a2a', '#6a490f', '#c27816'];
      }
      return ['#374354', '#4e5d70', '#64748b', '#2b4360', '#94a3b8'];
    }
    if (tier === 'platinum') {
      return [pal.highlight, pal.primary, pal.accentGem || '#9be7df', '#d9ecff', '#8bc5ff'];
    }
    if (tier === 'gold') {
      return [pal.highlight, pal.primary, pal.secondary, '#ffe7a3', '#f5cb6e'];
    }
    return [pal.highlight, pal.primary, '#cfd9e6', '#e2ebf7'];
  }, [tier, isLightMode]);

  const spawnBurst = useCallback(
    (width, height, wave = 1) => {
      if (!width || !height) return;
      const cx = width / 2;
      const cy = height * originYRatio;
      const colors = getFoilColors();
      const spreadScale = Math.min(1.55, Math.max(0.95, Math.min(width, height) / 480));

      const baseCount =
        wave === 1
          ? tier === 'platinum'
            ? 84
            : tier === 'gold'
              ? 68
              : 54
          : tier === 'platinum'
            ? 44
            : tier === 'gold'
              ? 34
              : 26;

      for (let i = 0; i < baseCount; i++) {
        const angle = (Math.PI * 2 * i) / baseCount + (Math.random() - 0.5) * 0.42;
        const speed =
          (wave === 1
            ? 2.8 + Math.random() * 5.6
            : 2.0 + Math.random() * 4.6) * spreadScale;
        const radiusOffset = wave === 1 ? 16 : 48;
        const roll = Math.random();
        const kind =
          roll > 0.64
            ? 'ribbon'
            : roll > 0.38
              ? 'diamond'
              : roll > 0.14
                ? 'star'
                : 'mote';

        particlesRef.current.push({
          kind,
          x: cx + Math.cos(angle) * radiusOffset,
          y: cy + Math.sin(angle) * radiusOffset,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - (wave === 1 ? 1.25 : 1.7),
          size:
            kind === 'ribbon'
              ? 6 + Math.random() * 4.4
              : kind === 'diamond'
                ? 4.4 + Math.random() * 3.2
                : kind === 'star'
                  ? 4 + Math.random() * 3.6
                  : 2.2 + Math.random() * 2.2,
          rot: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.18,
          tumble: Math.random() * Math.PI * 2,
          vTumble: 0.12 + Math.random() * 0.15,
          life: 0,
          maxLife: (wave === 1 ? 82 : 96) + Math.random() * 54,
          color: colors[i % colors.length],
          gravity: kind === 'ribbon' || kind === 'diamond' ? 0.044 : 0.016,
          drag: kind === 'ribbon' || kind === 'diamond' ? 0.966 : 0.958,
        });
      }
    },
    [tier, originYRatio, getFoilColors]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    let dpr = Math.min(2, window.devicePixelRatio || 1);
    const syncCanvasSize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(300, rect.width || window.innerWidth || 368);
      const h = Math.max(400, rect.height || window.innerHeight || 530);
      sizeRef.current = { w, h };
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    };

    syncCanvasSize();
    window.addEventListener('resize', syncCanvasSize);

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      window.removeEventListener('resize', syncCanvasSize);
      return;
    }

    const ambientColors = getFoilColors();
    const ambient = Array.from({ length: 28 }).map((_, idx) => ({
      x: Math.random() * sizeRef.current.w,
      y: Math.random() * sizeRef.current.h,
      vx: (Math.random() - 0.5) * 0.28,
      vy: -0.22 - Math.random() * 0.34,
      size: 1.2 + (idx % 3) * 0.75,
      phase: Math.random() * Math.PI * 2,
      speed: 0.024 + Math.random() * 0.025,
      color: ambientColors[idx % ambientColors.length],
    }));

    let rafId = null;
    const drawFourPointStar = (x, y, r, rot, color, alpha) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.quadraticCurveTo(0, 0, r, 0);
      ctx.quadraticCurveTo(0, 0, 0, r);
      ctx.quadraticCurveTo(0, 0, -r, 0);
      ctx.quadraticCurveTo(0, 0, 0, -r);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const drawDiamond = (x, y, r, rot, tumble, color, alpha) => {
      const wScale = Math.max(0.28, Math.abs(Math.cos(tumble)));
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.scale(wScale, 1);
      ctx.globalAlpha = alpha * 0.92;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.lineTo(r * 0.7, 0);
      ctx.lineTo(0, r);
      ctx.lineTo(-r * 0.7, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const tick = () => {
      const { w, h } = sizeRef.current;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // 1. Ambient luminous stardust drifting softly across the full viewport
      for (const m of ambient) {
        m.x += m.vx;
        m.y += m.vy;
        m.phase += m.speed;
        if (m.y < -12) {
          m.y = h + 12;
          m.x = Math.random() * w;
        }
        if (m.x < -12) m.x = w + 12;
        if (m.x > w + 12) m.x = -12;
        const twinkle = (isLightMode ? 0.3 : 0.24) + (Math.sin(m.phase) * 0.5 + 0.5) * 0.46;
        ctx.save();
        ctx.globalAlpha = twinkle;
        ctx.fillStyle = m.color;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 2. Active celebration burst particles
      const activeParticles = particlesRef.current;
      for (let i = activeParticles.length - 1; i >= 0; i--) {
        const p = activeParticles[i];
        p.life++;
        if (p.life >= p.maxLife) {
          activeParticles.splice(i, 1);
          continue;
        }
        p.vx *= p.drag;
        p.vy = p.vy * p.drag + p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vRot;
        p.tumble += p.vTumble;

        const progress = p.life / p.maxLife;
        const fade = progress < 0.12 ? progress / 0.12 : 1 - (progress - 0.12) / 0.88;
        const alpha = Math.max(0, Math.min(1, fade));

        if (p.kind === 'ribbon') {
          const widthScale = Math.max(0.22, Math.abs(Math.cos(p.tumble)));
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.globalAlpha = alpha * 0.94;
          ctx.fillStyle = p.color;
          ctx.fillRect(
            -p.size / 2,
            (-p.size * 0.46 * widthScale) / 2,
            p.size,
            p.size * 0.46 * widthScale
          );
          ctx.restore();
        } else if (p.kind === 'diamond') {
          drawDiamond(p.x, p.y, p.size, p.rot, p.tumble, p.color, alpha);
        } else if (p.kind === 'star') {
          drawFourPointStar(p.x, p.y, p.size, p.rot, p.color, alpha);
        } else {
          ctx.save();
          ctx.globalAlpha = alpha * 0.88;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('resize', syncCanvasSize);
      if (rafId) cancelAnimationFrame(rafId);
      particlesRef.current = [];
    };
  }, [tier, isLightMode, getFoilColors]);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const rect = canvas.getBoundingClientRect();
    const w = Math.max(300, rect.width || window.innerWidth || 368);
    const h = Math.max(400, rect.height || window.innerHeight || 530);
    sizeRef.current = { w, h };

    spawnBurst(w, h, 1);
    const wave2Timer = setTimeout(() => {
      spawnBurst(sizeRef.current.w, sizeRef.current.h, 2);
    }, 220);

    return () => clearTimeout(wave2Timer);
  }, [active, burstKey, spawnBurst]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      data-testid="celebration-canvas"
      className="fixed inset-0 w-full h-full pointer-events-none z-20"
    />
  );
};
