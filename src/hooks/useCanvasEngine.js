import { useEffect } from 'react';

/**
 * On-demand interactive Canvas Effects Engine.
 * Draws only during active verse press-hold charging or fading celebration/save embers,
 * settling cleanly to 0 FPS at rest with zero continuous background cloud or idle orb motion.
 */
export function useCanvasEngine({
  canvasRef,
  verseWrapRef,
  engineRef,
  stateRef,
  temporalRef,
  isLightModeRef,
  inTransitRef,
  hikmahRef,
  viewRef,
}) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    let animationFrameId = null;
    let isCancelled = false;
    let isRunning = false;
    let embers = [];

    const isHeadless = typeof navigator !== 'undefined' && !!navigator.webdriver;

    const resize = () => {
      const dpr = isHeadless ? 0.6 : window.innerWidth < 768 ? 0.85 : 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    window.addEventListener('resize', resize);
    resize();

    const spawnEmbers = (cx, cy, count, forceGold = false, burstSpeed = 1) => {
      if (isHeadless) return;
      const safeCount = Math.min(count, 32);
      for (let i = 0; i < safeCount; i++) {
        const isGold = forceGold || Math.random() < 0.55;
        embers.push({
          x: cx + (Math.random() - 0.5) * (count > 10 ? 260 : 30),
          y: cy + (Math.random() - 0.5) * (count > 10 ? 120 : 30),
          vx: (Math.random() - 0.5) * 1.4 * burstSpeed,
          vy: -(Math.random() * 0.8 + 0.2) * burstSpeed,
          life: Math.random() * 0.7 + 0.3,
          decay: Math.random() * 0.008 + 0.006,
          r: Math.random() * 1.1 + 0.3,
          twinklePhase: Math.random() * Math.PI * 2,
          twinkleSpeed: Math.random() * 0.055 + 0.02,
          wobble: (Math.random() - 0.5) * 0.007,
          gold: isGold,
        });
      }
    };

    const lerp = (start, end, t) => start + (end - start) * t;

    const drawLight = (radius, alpha, coreColor, edgeColor) => {
      if (radius <= 0) return;
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
      grad.addColorStop(0, `rgba(${coreColor.r},${coreColor.g},${coreColor.b},${alpha})`);
      grad.addColorStop(0.35, `rgba(${edgeColor.r},${edgeColor.g},${edgeColor.b},${alpha * 0.45})`);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();
    };

    const ensureRunning = () => {
      if (isCancelled || isRunning) return;
      isRunning = true;
      animationFrameId = requestAnimationFrame(loop);
    };

    const loop = (time = performance.now()) => {
      if (isCancelled) {
        isRunning = false;
        return;
      }

      const W = window.innerWidth;
      const H = window.innerHeight;
      const t = isLightModeRef.current ? 1 : 0;
      const hk = hikmahRef.current ? 1 : 0;

      if (stateRef.current.isPressing && !inTransitRef.current && viewRef.current === 'main') {
        stateRef.current.pressProgress += 0.035;
        if (stateRef.current.pressProgress >= 1) {
          stateRef.current.pressProgress = 0;
          stateRef.current.isPressing = false;
          if (engineRef.current.advanceVerse) engineRef.current.advanceVerse(1);
          spawnEmbers(W / 2, H / 2 - 40, 32, true, 2.8);
        }
      } else if (stateRef.current.pressProgress > 0) {
        stateRef.current.pressProgress = Math.max(0, stateRef.current.pressProgress - 0.08);
      }

      const pressP = stateRef.current.pressProgress;

      if (
        verseWrapRef.current &&
        !inTransitRef.current &&
        Math.abs(stateRef.current.lastPressP - pressP) > 0.005
      ) {
        verseWrapRef.current.style.transform =
          pressP > 0 ? `scale(${1 - pressP * 0.02})` : 'scale(1)';
        verseWrapRef.current.style.setProperty('--press', pressP.toFixed(3));
        stateRef.current.lastPressP = pressP;
      }

      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, W, H);

      const tp = temporalRef.current;
      const tpD = tp.dark;
      const tpL = tp.light;

      // Press-charge ring around verse center only while holding
      if (pressP > 0) {
        const glowBase = t > 0.5 ? tpL.orbGlow : tpD.orbGlow;
        const glowTeal = t > 0.5 ? { r: 13, g: 148, b: 136 } : { r: 20, g: 184, b: 166 };
        const glowC = {
          r: Math.floor(lerp(glowBase.r, glowTeal.r, hk)),
          g: Math.floor(lerp(glowBase.g, glowTeal.g, hk)),
          b: Math.floor(lerp(glowBase.b, glowTeal.b, hk)),
        };
        const coreBase = t > 0.5 ? tpL.orbCore : tpD.orbCore;
        const coreC = {
          r: Math.floor(lerp(coreBase.r, 204, hk)),
          g: Math.floor(lerp(coreBase.g, 251, hk)),
          b: Math.floor(lerp(coreBase.b, 241, hk)),
        };

        ctx.save();
        ctx.translate(W / 2, H / 2 - 35);
        ctx.globalCompositeOperation = t > 0.5 ? 'source-over' : 'screen';
        drawLight(32 + Math.pow(pressP, 2) * 70, pressP * 0.36, coreC, glowC);
        ctx.rotate(time * 0.001);
        ctx.beginPath();
        ctx.arc(0, 0, 30 + Math.pow(pressP, 2) * 80, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${glowC.r},${glowC.g},${glowC.b},${pressP * 0.55})`;
        ctx.lineWidth = 1 + pressP * 1.4;
        ctx.stroke();
        ctx.restore();
        ctx.globalCompositeOperation = 'source-over';
      }

      for (let i = embers.length - 1; i >= 0; i--) {
        const e = embers[i];
        e.x += e.vx + Math.sin(e.twinklePhase) * 0.12;
        e.y += e.vy;
        e.vx += e.wobble;
        e.twinklePhase += e.twinkleSpeed;
        e.life -= e.decay;

        if (e.life <= 0) {
          embers.splice(i, 1);
        } else {
          const tw = 0.5 + 0.5 * Math.sin(e.twinklePhase);
          const alpha = Math.max(0, e.life) * tw;
          const eBase = t > 0.5 ? tpL.ember : tpD.ember;
          const eR = Math.floor(lerp(eBase.r, t > 0.5 ? 20 : 45, hk));
          const eG = Math.floor(lerp(eBase.g, t > 0.5 ? 184 : 212, hk));
          const eB = Math.floor(lerp(eBase.b, t > 0.5 ? 166 : 191, hk));
          const goldColor = `rgba(${eR},${eG},${eB},${alpha * (t > 0.5 ? 1 : 0.88)})`;
          const ashColor =
            t > 0.5 ? `rgba(100,90,80,${alpha * 0.6})` : `rgba(235,225,208,${alpha * 0.62})`;

          ctx.fillStyle = e.gold ? goldColor : ashColor;
          ctx.beginPath();
          ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      const keepRunning =
        stateRef.current.isPressing || stateRef.current.pressProgress > 0 || embers.length > 0;

      if (keepRunning && !isHeadless) {
        animationFrameId = requestAnimationFrame(loop);
      } else {
        isRunning = false;
        animationFrameId = null;
        if (!keepRunning) {
          ctx.clearRect(0, 0, W, H);
        }
      }
    };

    engineRef.current.startPressLoop = ensureRunning;
    engineRef.current.triggerTextBurst = () => {
      const W = window.innerWidth;
      const H = window.innerHeight;
      spawnEmbers(W / 2, H / 2 - 40, 32, true, 2.8);
      ensureRunning();
    };
    engineRef.current.triggerButtonBurst = () => {
      const W = window.innerWidth;
      const H = window.innerHeight;
      spawnEmbers(W / 2, H - 140, 24, true, 1.4);
      ensureRunning();
    };
    engineRef.current.forceRender = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    };

    return () => {
      isCancelled = true;
      isRunning = false;
      window.removeEventListener('resize', resize);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);
}
