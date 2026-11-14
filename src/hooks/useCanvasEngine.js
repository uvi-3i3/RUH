import { useEffect } from 'react';

/**
 * ARCH-01: Extracted Canvas Rendering Engine
 *
 * Controls the ambient particle system, breathing orb, and background clouds.
 * Optimized for both hardware-accelerated mobile/desktop displays and software-rendered headless environments.
 */
export function useCanvasEngine({
  canvasRef,
  verseWrapRef,
  avatarRef,
  engineRef,
  stateRef,
  temporalRef,
  isLightModeRef,
  inTransitRef,
  hikmahRef,
  viewRef,
  targetHealth,
  DARK_HIGH,
  DARK_LOW,
  LIGHT_HIGH,
  LIGHT_LOW,
}) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    let animationFrameId;
    let timeoutId;
    let isCancelled = false;
    let embers = [];

    const isHeadless = typeof navigator !== 'undefined' && !!navigator.webdriver;

    const resize = () => {
      const dpr = isHeadless ? 0.6 : window.innerWidth < 768 ? 0.85 : 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (stateRef.current) {
        stateRef.current.pointerX = window.innerWidth / 2;
        stateRef.current.pointerY = window.innerHeight / 2;
      }
    };

    window.addEventListener('resize', resize);
    resize();

    const spawnEmbers = (cx, cy, count, forceGold = false, burstSpeed = 1) => {
      const safeCount = Math.min(count, 35);
      for (let i = 0; i < safeCount; i++) {
        const isGold = forceGold || Math.random() < 0.55;
        embers.push({
          x: cx + (Math.random() - 0.5) * (count > 10 ? 280 : 30),
          y: cy + (Math.random() - 0.5) * (count > 10 ? 130 : 30),
          vx: (Math.random() - 0.5) * 1.5 * burstSpeed,
          vy: -(Math.random() * 0.8 + 0.2) * burstSpeed,
          life: Math.random() * 0.75 + 0.3,
          decay: Math.random() * 0.0035 + 0.0018,
          r: Math.random() * 1.1 + 0.25,
          twinkleSpeed: Math.random() * 0.055 + 0.018,
          twinklePhase: Math.random() * Math.PI * 2,
          wobble: (Math.random() - 0.5) * 0.007,
          gold: isGold,
        });
      }
    };

    engineRef.current.triggerTextBurst = () => {
      const W = window.innerWidth, H = window.innerHeight;
      spawnEmbers(W / 2, H / 2 - 40, 60, true, 3.0);
    };

    engineRef.current.triggerButtonBurst = () => {
      const W = window.innerWidth, H = window.innerHeight;
      spawnEmbers(W / 2, H - 140, 35, true, 1.5);
    };

    const lerp = (start, end, t) => start + (end - start) * t;

    const drawLight = (radius, alpha, coreColor, edgeColor) => {
      if (radius <= 0) return;
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
      grad.addColorStop(0, `rgba(${coreColor.r},${coreColor.g},${coreColor.b},${alpha})`);
      grad.addColorStop(0.3, `rgba(${edgeColor.r},${edgeColor.g},${edgeColor.b},${alpha * 0.5})`);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();
    };

    let frameCount = 0;

    const scheduleNext = () => {
      if (isCancelled) return;
      if (isHeadless) {
        if (frameCount >= 2) return;
        timeoutId = setTimeout(() => {
          animationFrameId = requestAnimationFrame(loop);
        }, 120);
      } else {
        animationFrameId = requestAnimationFrame(loop);
      }
    };

    const loop = (time = performance.now()) => {
      if (isCancelled) return;
      frameCount++;
      const W = window.innerWidth, H = window.innerHeight;
      const min = Math.min(W, H);

      stateRef.current.health += (targetHealth - stateRef.current.health) * 0.02;
      const targetTheme = isLightModeRef.current ? 1 : 0;
      stateRef.current.theme = isHeadless
        ? targetTheme
        : stateRef.current.theme + (targetTheme - stateRef.current.theme) * 0.05;

      const targetHikmah = hikmahRef.current ? 1 : 0;
      stateRef.current.hikmahBlend += (targetHikmah - stateRef.current.hikmahBlend) * 0.025;

      const h = stateRef.current.health;
      const t = stateRef.current.theme;
      const hk = stateRef.current.hikmahBlend;

      if (stateRef.current.isPressing && !inTransitRef.current && viewRef.current === 'main') {
        stateRef.current.pressProgress += 0.035;
        if (stateRef.current.pressProgress >= 1) {
          stateRef.current.pressProgress = 0;
          stateRef.current.isPressing = false;
          if (engineRef.current.advanceVerse) engineRef.current.advanceVerse(1);
          if (engineRef.current.triggerTextBurst) engineRef.current.triggerTextBurst();
        }
      } else {
        stateRef.current.pressProgress = Math.max(0, stateRef.current.pressProgress - 0.06);
      }

      const pressP = stateRef.current.pressProgress;

      if (verseWrapRef.current && !inTransitRef.current && Math.abs(stateRef.current.lastPressP - pressP) > 0.005) {
        verseWrapRef.current.style.transform = `scale(${1 - pressP * 0.02})`;
        verseWrapRef.current.style.setProperty('--press', pressP.toFixed(3));
        stateRef.current.lastPressP = pressP;
      }

      const timeSinceInteraction = Date.now() - stateRef.current.lastInteractionTime;
      const isIdle = timeSinceInteraction > 2000 && !stateRef.current.isPressing;

      let orbTargetX = stateRef.current.pointerX;
      let orbTargetY = stateRef.current.pointerY;
      let springStiffness = 0.04;
      let springDamping = 0.15;

      if (viewRef.current === 'profile') {
        if (avatarRef.current) {
          const rect = avatarRef.current.getBoundingClientRect();
          orbTargetX = rect.left + rect.width / 2;
          orbTargetY = rect.top + rect.height / 2;
        } else {
          orbTargetX = W / 2;
          orbTargetY = H * 0.25;
        }
        springStiffness = 0.05;
        springDamping = 0.15;
      } else if (stateRef.current.isPressing) {
        orbTargetX = W / 2;
        orbTargetY = H / 2 - 35;
        springStiffness = 0.2;
        springDamping = 0.3;
      } else if (isIdle) {
        orbTargetX = W / 2 + Math.sin(time * 0.0008) * (W * 0.26);
        orbTargetY = H / 2 + Math.cos(time * 0.0011) * (H * 0.18);
        springStiffness = 0.01;
        springDamping = 0.05;
      }

      const ax = (orbTargetX - stateRef.current.orbX) * springStiffness;
      const ay = (orbTargetY - stateRef.current.orbY) * springStiffness;
      stateRef.current.orbVx += ax;
      stateRef.current.orbVy += ay;
      stateRef.current.orbVx *= 1 - springDamping;
      stateRef.current.orbVy *= 1 - springDamping;

      stateRef.current.orbX += stateRef.current.orbVx;
      stateRef.current.orbY += stateRef.current.orbVy;

      stateRef.current.currentPointerX += (stateRef.current.pointerX - stateRef.current.currentPointerX) * 0.03;
      stateRef.current.currentPointerY += (stateRef.current.pointerY - stateRef.current.currentPointerY) * 0.03;
      const pX = (stateRef.current.currentPointerX - W / 2) * 0.05;
      const pY = (stateRef.current.currentPointerY - H / 2) * 0.05;
      const cx = W / 2 + pX;
      const cy = H / 2 + pY;

      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, W, H);

      const tp = temporalRef.current;
      const tpD = tp.dark;
      const tpL = tp.light;

      // 4-7-8 Breathing Cycle (19s = 19000ms)
      const breathTime = time % 19000;
      let breathPhase = 0;
      if (breathTime < 4000) {
        const tIn = breathTime / 4000;
        breathPhase = 0.5 - Math.cos(tIn * Math.PI) * 0.5;
      } else if (breathTime < 11000) {
        breathPhase = 1;
      } else {
        const tOut = (breathTime - 11000) / 8000;
        breathPhase = 0.5 + Math.cos(tOut * Math.PI) * 0.5;
      }

      const HIKMAH_CLOUD = [
        { r: 20, g: 184, b: 166 },
        { r: 45, g: 212, b: 191 },
        { r: 13, g: 148, b: 136 },
      ];

      for (let i = 0; i < 3; i++) {
        const dC = tpD.clouds[i];
        const lC = tpL.clouds[i];
        const dimF = 0.15 + h * 0.85;
        const baseR = Math.floor(lerp(dC.r, lC.r, t) * dimF);
        const baseG = Math.floor(lerp(dC.g, lC.g, t) * dimF);
        const baseB = Math.floor(lerp(dC.b, lC.b, t) * dimF);

        const finalR = Math.floor(lerp(baseR, HIKMAH_CLOUD[i].r, hk));
        const finalG = Math.floor(lerp(baseG, HIKMAH_CLOUD[i].g, hk));
        const finalB = Math.floor(lerp(baseB, HIKMAH_CLOUD[i].b, hk));

        const cloudHigh = t > 0.5 ? LIGHT_HIGH[i] : DARK_HIGH[i];
        const cloudLow = t > 0.5 ? LIGHT_LOW[i] : DARK_LOW[i];
        const base = cloudHigh;
        const bF = lerp(cloudLow.bF, base.bF, h);
        const rV = lerp(cloudLow.rV, base.rV, h);
        const bA = lerp(cloudLow.bA, base.bA, h) * 0.25;
        const aV = lerp(cloudLow.aV, base.aV, h) * 0.25;
        const speedMult = (1 + h * 0.5) * 0.35;

        const x = cx + Math.sin(time * base.xS * speedMult + base.xO) * W * base.xA;
        const y = cy + Math.cos(time * base.yS * speedMult + base.yO) * H * base.yA;

        const baseRadius = min * bF;
        const driftRadius = Math.sin(time * base.rS * speedMult) * min * rV;
        const breathRadiusBonus = baseRadius * 0.55 * breathPhase;
        const radius = Math.max(baseRadius + driftRadius + breathRadiusBonus, 1);

        const baseAlpha = bA;
        const driftAlpha = Math.sin(time * base.aS * speedMult) * aV;
        const breathAlphaBonus = baseAlpha * 1.5 * breathPhase;
        const alpha = Math.max(0, baseAlpha + driftAlpha + breathAlphaBonus);

        if (alpha > 0) {
          const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
          grad.addColorStop(0, `rgba(${finalR},${finalG},${finalB},${alpha})`);
          grad.addColorStop(0.5, `rgba(${finalR},${finalG},${finalB},${alpha * 0.4})`);
          grad.addColorStop(1, 'rgba(0,0,0,0)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // --- OPTICAL NUR ---
      const orbSpd = Math.hypot(stateRef.current.orbVx, stateRef.current.orbVy);
      const chargeScale = 1 + Math.pow(pressP, 2) * 5;
      const stretchX = stateRef.current.isPressing ? 1 : Math.max(1, 1 + orbSpd * 0.04);
      const stretchY = stateRef.current.isPressing ? 1 : Math.max(0.5, 1 - orbSpd * 0.02);

      ctx.save();
      ctx.translate(stateRef.current.orbX, stateRef.current.orbY);
      if (!stateRef.current.isPressing && orbSpd > 0.5) {
        ctx.rotate(Math.atan2(stateRef.current.orbVy, stateRef.current.orbVx));
      }
      ctx.scale(stretchX, stretchY);

      ctx.globalCompositeOperation = t > 0.5 ? 'source-over' : 'screen';

      const coreBase = t > 0.5 ? tpL.orbCore : tpD.orbCore;
      const coreTeal = { r: 204, g: 251, b: 241 };
      const coreC = {
        r: Math.floor(lerp(coreBase.r, coreTeal.r, hk)),
        g: Math.floor(lerp(coreBase.g, coreTeal.g, hk)),
        b: Math.floor(lerp(coreBase.b, coreTeal.b, hk)),
      };

      const glowBase = t > 0.5 ? tpL.orbGlow : tpD.orbGlow;
      const glowTeal = t > 0.5 ? { r: 13, g: 148, b: 136 } : { r: 20, g: 184, b: 166 };
      const glowC = {
        r: Math.floor(lerp(glowBase.r, glowTeal.r, hk)),
        g: Math.floor(lerp(glowBase.g, glowTeal.g, hk)),
        b: Math.floor(lerp(glowBase.b, glowTeal.b, hk)),
      };

      const coronaBase = t > 0.5 ? tpL.orbCorona : tpD.orbCorona;
      const coronaTeal = t > 0.5 ? { r: 6, g: 95, b: 70 } : { r: 15, g: 118, b: 110 };
      const coronaC = {
        r: Math.floor(lerp(coronaBase.r, coronaTeal.r, hk)),
        g: Math.floor(lerp(coronaBase.g, coronaTeal.g, hk)),
        b: Math.floor(lerp(coronaBase.b, coronaTeal.b, hk)),
      };

      const idleSoften = stateRef.current.isPressing ? 1 : 0.55;
      const coronaR = (45 + Math.sin(time * 0.002) * 5) * chargeScale;
      drawLight(coronaR, (0.34 + pressP * 0.25) * idleSoften, glowC, coronaC);
      const glowR = (20 + Math.cos(time * 0.003) * 2) * chargeScale;
      drawLight(glowR, 0.7 * idleSoften, coreC, glowC);
      const coreR = 5.5 * chargeScale;
      drawLight(coreR, 0.9 * idleSoften, coreC, coreC);

      if (pressP > 0) {
        ctx.rotate(time * 0.001);
        ctx.beginPath();
        ctx.arc(0, 0, 30 + Math.pow(pressP, 2) * 80, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${glowC.r},${glowC.g},${glowC.b},${pressP * 0.6})`;
        ctx.lineWidth = 1 + pressP * 1.5;
        ctx.stroke();
      }

      ctx.restore();
      ctx.globalCompositeOperation = 'source-over';

      if (orbSpd > 2 || stateRef.current.isPressing) {
        const spawnChance = stateRef.current.isPressing ? 0.2 + pressP : 0.15 + orbSpd * 0.05;
        if (Math.random() < spawnChance) {
          spawnEmbers(stateRef.current.orbX, stateRef.current.orbY, 1, true, 0.4);
        }
      }

      for (let i = embers.length - 1; i >= 0; i--) {
        const e = embers[i];
        e.x += e.vx + Math.sin(e.twinklePhase) * 0.12 - pX * 0.01;
        e.y += e.vy - pY * 0.01;
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
          const ashColor = t > 0.5 ? `rgba(100,90,80,${alpha * 0.6})` : `rgba(235,225,208,${alpha * 0.62})`;

          ctx.fillStyle = e.gold ? goldColor : ashColor;
          ctx.beginPath();
          ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      scheduleNext();
    };

    engineRef.current.forceRender = () => {
      if (!isCancelled) loop(performance.now());
    };

    loop();

    return () => {
      isCancelled = true;
      window.removeEventListener('resize', resize);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [targetHealth]);
}
