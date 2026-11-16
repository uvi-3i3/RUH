import { useCallback, useEffect, useRef } from 'react';
import { getBadgeTierStyle } from '../../utils/badgeLogic';

/**
 * 60fps celebratory Canvas particle, crescent/diamond confetti & metallic foil engine.
 * Features dedicated high-contrast Night & Daylight metallic foil palettes and
 * staggered dual-wave firework bursts on initial reveal, Replay, or medallion tap.
 */
export const CelebrationCanvas = ({
  tier = 'gold',
  isLightMode = false,
  burstKey = 1,
}) => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const paletteRef = useRef(null);

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
      const cy = height * 0.37;
      const colors = getFoilColors();

      const baseCount =
        wave === 1
          ? tier === 'platinum'
            ? 74
            : tier === 'gold'
              ? 60
              : 48
          : tier === 'platinum'
            ? 38
            : tier === 'gold'
              ? 30
              : 24;

      for (let i = 0; i < baseCount; i++) {
        const angle = (Math.PI * 2 * i) / baseCount + (Math.random() - 0.5) * 0.42;
        const speed =
          wave === 1
            ? 2.6 + Math.random() * 5.2
            : 1.8 + Math.random() * 4.4;
        const radiusOffset = wave === 1 ? 12 : 42;
        const roll = Math.random();
        const kind =
          roll > 0.65
            ? 'ribbon'
            : roll > 0.4
              ? 'diamond'
              : roll > 0.16
                ? 'star'
                : 'mote';

        particlesRef.current.push({
          kind,
          x: cx + Math.cos(angle) * radiusOffset,
          y: cy + Math.sin(angle) * radiusOffset,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - (wave === 1 ? 1.1 : 1.6),
          size:
            kind === 'ribbon'
              ? 5.8 + Math.random() * 4.2
              : kind === 'diamond'
                ? 4.2 + Math.random() * 3
                : kind === 'star'
                  ? 3.8 + Math.random() * 3.4
                  : 2 + Math.random() * 2,
          rot: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.18,
          tumble: Math.random() * Math.PI * 2,
          vTumble: 0.12 + Math.random() * 0.15,
          life: 0,
          maxLife: (wave === 1 ? 76 : 92) + Math.random() * 52,
          color: colors[i % colors.length],
          gravity: kind === 'ribbon' || kind === 'diamond' ? 0.048 : 0.018,
          drag: kind === 'ribbon' || kind === 'diamond' ? 0.964 : 0.955,
        });
      }
    },
    [tier, getFoilColors]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(300, rect.width || 368);
    const h = Math.max(400, rect.height || 530);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const ambientColors = getFoilColors();
    const ambient = Array.from({ length: 20 }).map((_, idx) => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.28,
      vy: -0.2 - Math.random() * 0.3,
      size: 1.2 + (idx % 3) * 0.7,
      phase: Math.random() * Math.PI * 2,
      speed: 0.025 + Math.random() * 0.025,
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
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // 1. Ambient luminous stardust floating gently across the card
      for (const m of ambient) {
        m.x += m.vx;
        m.y += m.vy;
        m.phase += m.speed;
        if (m.y < -10) {
          m.y = h + 10;
          m.x = Math.random() * w;
        }
        const twinkle = (isLightMode ? 0.3 : 0.25) + (Math.sin(m.phase) * 0.5 + 0.5) * 0.45;
        ctx.save();
        ctx.globalAlpha = twinkle;
        ctx.fillStyle = m.color;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 2. Active celebration burst particles
      const active = particlesRef.current;
      for (let i = active.length - 1; i >= 0; i--) {
        const p = active[i];
        p.life++;
        if (p.life >= p.maxLife) {
          active.splice(i, 1);
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
          ctx.fillRect(-p.size / 2, (-p.size * 0.46 * widthScale) / 2, p.size, p.size * 0.46 * widthScale);
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
      if (rafId) cancelAnimationFrame(rafId);
      particlesRef.current = [];
    };
  }, [tier, isLightMode, getFoilColors]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const rect = canvas.getBoundingClientRect();
    const w = Math.max(300, rect.width || 368);
    const h = Math.max(400, rect.height || 530);

    spawnBurst(w, h, 1);
    const wave2Timer = setTimeout(() => {
      spawnBurst(w, h, 2);
    }, 220);

    return () => clearTimeout(wave2Timer);
  }, [burstKey, spawnBurst]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      data-testid="celebration-canvas"
      className="absolute inset-0 w-full h-full pointer-events-none z-20"
    />
  );
};
