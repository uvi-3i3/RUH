import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BadgeArtwork } from './BadgeArtwork';
import { CelebrationCanvas } from './CelebrationCanvas';
import { getBadgeTierStyle, getCozyBadgeConfig } from '../../utils/badgeLogic';
import {
  REWARD_REVEAL_PHASES,
  canDismissReveal,
  getInitialRevealPhase,
  getRewardRevealTimings,
  isBadgeMaterialized,
  shouldTriggerAutoRevealHaptic,
} from '../../utils/rewardRevealLogic';
import { hapticBadgeUnlock, hapticDismiss, hapticNavigate } from '../../utils/haptics';
import { playBadgeRevealCue } from '../../utils/tactileAudio';

const BURST_RAYS = Array.from({ length: 24 }).map((_, idx) => {
  const angleDeg = idx * 15;
  const rad = (angleDeg * Math.PI) / 180;
  const isMajor = idx % 2 === 0;
  const rInner = isMajor ? 72 : 82;
  const rOuter = isMajor ? 142 : 118;
  return {
    id: idx,
    isMajor,
    x1: (150 + Math.cos(rad) * rInner).toFixed(1),
    y1: (150 + Math.sin(rad) * rInner).toFixed(1),
    x2: (150 + Math.cos(rad) * rOuter).toFixed(1),
    y2: (150 + Math.sin(rad) * rOuter).toFixed(1),
    delay: `${35 + (idx % 4) * 34}ms`,
  };
});

function checkPrefersReducedMotion() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export const BadgeRewardOverlay = ({
  badge,
  isLightMode = false,
  isNewUnlock = true,
  queueRemaining = 0,
  onClose,
}) => {
  const reducedMotion = checkPrefersReducedMotion();
  const [replayCount, setReplayCount] = useState(0);
  const [burstCount, setBurstCount] = useState(1);
  const [tapPulseKey, setTapPulseKey] = useState(0);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [phase, setPhase] = useState(() =>
    getInitialRevealPhase({ isNewUnlock, reducedMotion })
  );

  const overlayRef = useRef(null);
  const exitTimerRef = useRef(null);
  const cueFiredKeyRef = useRef(null);

  const badgeId = badge?.id || null;
  const badgeTier = badge?.tier || null;
  const sequenceKey = badgeId ? `${badgeId}-${replayCount}` : 'none';
  const stageKey = badgeId ? `${badgeId}-${replayCount}` : 'none';
  const burstKey = badgeId ? `${badgeId}-${burstCount}` : 'none';

  const timings = useMemo(
    () => getRewardRevealTimings({ isNewUnlock, reducedMotion }),
    [isNewUnlock, reducedMotion]
  );

  // 1. Pause underlying screen interactions (scroll lock, focus capture, data attribute)
  useEffect(() => {
    if (!badgeId) return;
    const prevOverflow = document.body.style.overflow;
    const prevTouchAction = document.body.style.touchAction;
    const prevActiveEl =
      document.activeElement && typeof document.activeElement.focus === 'function'
        ? document.activeElement
        : null;

    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    document.body.dataset.revealPaused = 'true';

    if (prevActiveEl && prevActiveEl !== document.body && typeof prevActiveEl.blur === 'function') {
      prevActiveEl.blur();
    }
    overlayRef.current?.focus?.({ preventScroll: true });

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.touchAction = prevTouchAction;
      delete document.body.dataset.revealPaused;
      if (exitTimerRef.current) {
        clearTimeout(exitTimerRef.current);
        exitTimerRef.current = null;
      }
      if (prevActiveEl && document.contains(prevActiveEl)) {
        prevActiveEl.focus?.({ preventScroll: true });
      }
    };
  }, [badgeId]);

  // 2. Drive choreography phases: gathering -> materializing -> presented
  useEffect(() => {
    if (!badgeId) return;
    cueFiredKeyRef.current = null;
    setTilt({ rx: 0, ry: 0 });

    const initialPhase = getInitialRevealPhase({ isNewUnlock, reducedMotion });
    setPhase(initialPhase);

    const timers = [];
    if (initialPhase === REWARD_REVEAL_PHASES.GATHERING) {
      timers.push(
        setTimeout(() => {
          setPhase(REWARD_REVEAL_PHASES.MATERIALIZING);
        }, timings.gatherMs)
      );
      timers.push(
        setTimeout(() => {
          setPhase(REWARD_REVEAL_PHASES.PRESENTED);
        }, timings.gatherMs + timings.materializeMs)
      );
    } else if (initialPhase === REWARD_REVEAL_PHASES.MATERIALIZING) {
      timers.push(
        setTimeout(() => {
          setPhase(REWARD_REVEAL_PHASES.PRESENTED);
        }, timings.materializeMs)
      );
    }

    return () => {
      for (const t of timers) clearTimeout(t);
    };
  }, [badgeId, isNewUnlock, reducedMotion, replayCount, timings.gatherMs, timings.materializeMs]);

  // 3. Fire ceremonial haptic burst & tactile chime right at badge materialization
  useEffect(() => {
    if (!badgeId || !badgeTier) return;
    const isMaterializeMoment = reducedMotion
      ? phase === REWARD_REVEAL_PHASES.PRESENTED
      : phase === REWARD_REVEAL_PHASES.MATERIALIZING;

    if (!isMaterializeMoment) return;
    if (cueFiredKeyRef.current === sequenceKey) return;
    cueFiredKeyRef.current = sequenceKey;

    playBadgeRevealCue(badgeTier);
    if (
      shouldTriggerAutoRevealHaptic({
        isNewUnlock,
        phase,
        reducedMotion,
      })
    ) {
      hapticBadgeUnlock(badgeTier);
    }
  }, [badgeId, badgeTier, isNewUnlock, phase, reducedMotion, sequenceKey]);

  const requestClose = useCallback(
    (useNavigateHaptic = false) => {
      if (!canDismissReveal(phase)) return;
      if (useNavigateHaptic) {
        hapticNavigate();
      } else {
        hapticDismiss();
      }
      setPhase(REWARD_REVEAL_PHASES.EXITING);
      exitTimerRef.current = setTimeout(() => {
        exitTimerRef.current = null;
        onClose?.();
      }, timings.exitMs);
    },
    [phase, onClose, timings.exitMs]
  );

  // 4. Trap background keyboard shortcuts & guard Escape until presented
  useEffect(() => {
    if (!badgeId) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        if (canDismissReveal(phase)) {
          requestClose(false);
        }
        return;
      }
      // Pause background arrow/space navigation keys while reveal owns the viewport
      if (
        e.key === 'ArrowUp' ||
        e.key === 'ArrowDown' ||
        e.key === 'ArrowLeft' ||
        e.key === 'ArrowRight'
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [badgeId, phase, requestClose]);

  const tierStyle = useMemo(
    () => (badge ? getBadgeTierStyle(badge.tier, isLightMode) : null),
    [badge, isLightMode]
  );

  if (!badge || !tierStyle) return null;

  const { palette } = tierStyle;
  const cozyCfg = getCozyBadgeConfig(badge.motif);
  const materialized = isBadgeMaterialized(phase);
  const dismissable = canDismissReveal(phase);
  const isExiting = phase === REWARD_REVEAL_PHASES.EXITING;

  const tTextMain = isLightMode ? 'text-[#1a1814]' : 'text-[rgba(248,243,234,0.98)]';
  const tTextSub = isLightMode ? 'text-[#352e25]' : 'text-[rgba(232,223,206,0.8)]';
  const openAirTextShadow = isLightMode
    ? '0 1px 14px rgba(255, 255, 255, 0.85)'
    : '0 2px 18px rgba(4, 7, 16, 0.85)';

  const handlePointerMove = (e) => {
    if (!materialized || isExiting) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setTilt({
      rx: Number((-ny * 12).toFixed(2)),
      ry: Number((nx * 12).toFixed(2)),
    });
  };

  const triggerReplay = (e) => {
    e.stopPropagation();
    if (!dismissable) return;
    hapticBadgeUnlock(badge.tier);
    setReplayCount((c) => c + 1);
    setBurstCount((c) => c + 1);
    setTilt({ rx: 0, ry: 0 });
  };

  const triggerTapCelebrate = (e) => {
    e.stopPropagation();
    if (!materialized || isExiting) return;
    hapticBadgeUnlock(badge.tier);
    playBadgeRevealCue(badge.tier);
    setBurstCount((c) => c + 1);
    setTapPulseKey((c) => c + 1);
  };

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${badge.title} — ${tierStyle.label} Badge`}
      data-testid="badge-reward-overlay"
      data-tier={badge.tier}
      data-phase={phase}
      data-new-unlock={isNewUnlock ? 'true' : 'false'}
      tabIndex={-1}
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      onClick={() => {
        if (dismissable) requestClose(false);
      }}
      className={`fixed inset-0 z-[120] flex flex-col items-center justify-center px-6 py-8 overflow-hidden select-none outline-none transition-opacity duration-300 ${
        isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Full-Viewport Atmospheric Pause Veil — NO modal box or bordered container */}
      <div
        aria-hidden="true"
        className={`animate-reveal-veil fixed inset-0 pointer-events-none transition-colors duration-500 ${
          isLightMode
            ? 'bg-[#ecf2f8]/86 backdrop-blur-xl'
            : 'bg-[#040710]/80 backdrop-blur-xl'
        }`}
      />

      {/* Expansive Open-Air Candlelight & Tier Aura Halo Centered Behind Floating Badge */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none transition-opacity duration-700"
        style={{
          opacity: materialized ? 1 : 0.45,
          background: isLightMode
            ? `radial-gradient(circle at 50% 41%, ${cozyCfg.warmGlow} 0%, ${palette.ray} 24%, rgba(255,252,245,0.4) 44%, transparent 72%)`
            : `radial-gradient(circle at 50% 41%, ${cozyCfg.warmGlow} 0%, ${palette.ray} 22%, rgba(8,14,26,0.3) 46%, transparent 74%)`,
        }}
      />

      {/* Full-Screen 60fps Foil Confetti & Luminous Stardust Fireworks */}
      <CelebrationCanvas
        tier={badge.tier}
        isLightMode={isLightMode}
        burstKey={burstKey}
        active={materialized}
        originYRatio={0.4}
      />

      {/* Boxless Open-Air Celebration Choreography */}
      <div
        className={`relative z-30 w-full max-w-[380px] flex flex-col items-center text-center transition-transform duration-300 ${
          isExiting ? '-translate-y-3 scale-[0.97]' : 'translate-y-0 scale-100'
        }`}
      >
        {/* Quiet Floating Overline */}
        <div
          key={`kicker-${stageKey}`}
          className={`flex items-center justify-center gap-2 mb-3 transition-opacity duration-500 ${
            materialized ? 'animate-badge-copy opacity-100' : 'opacity-0'
          }`}
          style={{ '--c-delay': `${Math.max(40, timings.copyRevealDelayMs - 240)}ms`, textShadow: openAirTextShadow }}
        >
          <span
            className="font-serif-eng text-[10px] uppercase tracking-[0.26em] font-medium"
            style={{ color: palette.text }}
          >
            {isNewUnlock ? 'Badge Unlocked' : `${tierStyle.label} Keepsake`}
          </span>
          <span className={`${tTextSub} opacity-45 text-[10px]`} aria-hidden="true">
            ·
          </span>
          <span
            className="font-calligraphy text-[16px] leading-none"
            style={{ color: palette.text }}
            dir="rtl"
          >
            {tierStyle.arabic}
          </span>
        </div>

        {/* Open-Air Floating Medallion Stage (Zero Box, Zero Frame) */}
        <button
          type="button"
          aria-label={`Celebrate ${badge.title} medallion burst`}
          onClick={triggerTapCelebrate}
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setTilt({ rx: 0, ry: 0 })}
          className="relative w-[280px] h-[258px] sm:w-[300px] sm:h-[272px] flex items-center justify-center cursor-pointer focus:outline-none"
        >
          {/* Phase 1: Anticipatory Gathering Light Seed */}
          {!materialized && (
            <span
              aria-hidden="true"
              className="animate-reveal-gather absolute w-24 h-24 rounded-full pointer-events-none"
              style={{
                background: `radial-gradient(circle, #fffaf0 0%, ${cozyCfg.warmGlow} 42%, transparent 72%)`,
                filter: 'blur(4px)',
              }}
            />
          )}

          {/* Phase 2 & 3: Materializing Celestial Halo, Burst Rays, Shockwaves & Floating Cozy Medallion */}
          {materialized && (
            <>
              {/* Expansive Open-Air Rotating Light Rays */}
              <div
                key={`rays-${stageKey}`}
                aria-hidden="true"
                className="animate-badge-rays absolute w-[330px] h-[330px] sm:w-[370px] sm:h-[370px] rounded-full pointer-events-none"
                style={{
                  background: `conic-gradient(from 0deg, transparent 0deg 14deg, ${palette.ray} 20deg 28deg, transparent 34deg 56deg, ${palette.ray} 62deg 70deg, transparent 78deg 108deg, ${palette.ray} 114deg 122deg, transparent 130deg 164deg, ${palette.ray} 170deg 178deg, transparent 186deg 220deg, ${palette.ray} 226deg 234deg, transparent 242deg 278deg, ${palette.ray} 284deg 292deg, transparent 300deg 360deg)`,
                  maskImage: 'radial-gradient(circle, black 16%, rgba(0,0,0,0.42) 50%, transparent 74%)',
                  WebkitMaskImage:
                    'radial-gradient(circle, black 16%, rgba(0,0,0,0.42) 50%, transparent 74%)',
                }}
              />

              {/* Delicate Dual-Ring Celestial Orbit Behind Floating Medallion */}
              <svg
                width="280"
                height="280"
                viewBox="0 0 160 160"
                aria-hidden="true"
                className="absolute inset-0 m-auto pointer-events-none"
              >
                <g className="animate-badge-orbit-cw" style={{ transformOrigin: '80px 80px' }} opacity="0.28">
                  <circle
                    cx="80"
                    cy="80"
                    r="74"
                    fill="none"
                    stroke={palette.primary}
                    strokeWidth="0.65"
                    strokeDasharray="3 5.5"
                  />
                </g>
                <g className="animate-badge-orbit-ccw" style={{ transformOrigin: '80px 80px' }} opacity="0.16">
                  <rect
                    x="22"
                    y="22"
                    width="116"
                    height="116"
                    rx="18"
                    fill="none"
                    stroke={palette.primary}
                    strokeWidth="0.6"
                  />
                  <rect
                    x="22"
                    y="22"
                    width="116"
                    height="116"
                    rx="18"
                    transform="rotate(45 80 80)"
                    fill="none"
                    stroke={palette.primary}
                    strokeWidth="0.6"
                  />
                </g>
              </svg>

              {/* Materialization Impact Flash Bloom */}
              <span
                key={`impact-${burstKey}`}
                aria-hidden="true"
                className="animate-badge-impact absolute w-[200px] h-[200px] rounded-full pointer-events-none"
                style={{
                  background: `radial-gradient(circle, ${cozyCfg.warmGlow} 0%, ${palette.glow} 42%, transparent 74%)`,
                }}
              />

              {/* 24-Ray Staggered Tapered Radial Stroke Bursts */}
              <svg
                key={`lottie-burst-${burstKey}`}
                width="300"
                height="300"
                viewBox="0 0 300 300"
                aria-hidden="true"
                className="absolute inset-0 m-auto pointer-events-none"
              >
                {BURST_RAYS.map((ray) => (
                  <line
                    key={ray.id}
                    x1={ray.x1}
                    y1={ray.y1}
                    x2={ray.x2}
                    y2={ray.y2}
                    stroke={
                      ray.isMajor
                        ? isLightMode
                          ? palette.primary
                          : palette.highlight
                        : palette.secondary
                    }
                    strokeWidth={ray.isMajor ? '2.1' : '1.3'}
                    strokeLinecap="round"
                    className="animate-lottie-burst"
                    style={{ '--l-delay': ray.delay }}
                  />
                ))}
              </svg>

              {/* Expanding Geometric Shockwaves */}
              <span
                key={`shock-a-${burstKey}`}
                aria-hidden="true"
                className="animate-badge-shockwave absolute w-[148px] h-[148px] rounded-full border-2 pointer-events-none"
                style={{ borderColor: palette.primary }}
              />
              <span
                key={`shock-oct-${burstKey}`}
                aria-hidden="true"
                className="animate-badge-octagon absolute w-[154px] h-[154px] rounded-[28px] border pointer-events-none"
                style={{ borderColor: isLightMode ? palette.secondary : palette.highlight }}
              />
              <span
                key={`shock-b-${burstKey}`}
                aria-hidden="true"
                className="animate-badge-shockwave absolute w-[132px] h-[132px] rounded-full border border-dashed pointer-events-none"
                style={{
                  borderColor: palette.primary,
                  animationDelay: '180ms',
                }}
              />

              {/* Luminous Materializing Cozy Keepsake Medallion */}
              <div key={`medallion-${stageKey}`} className="animate-badge-materialize relative z-10">
                <div
                  key={`tap-${tapPulseKey}`}
                  className={tapPulseKey > 0 ? 'animate-badge-pulse-tap' : ''}
                >
                  <div
                    className="animate-badge-float transition-transform duration-300 ease-out"
                    style={{
                      transform: `perspective(760px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
                      filter: isLightMode
                        ? 'drop-shadow(0 20px 36px rgba(42, 30, 14, 0.22))'
                        : 'drop-shadow(0 22px 44px rgba(0, 0, 0, 0.65))',
                    }}
                  >
                    <BadgeArtwork
                      motif={badge.motif}
                      tier={badge.tier}
                      unlocked
                      animated
                      showSheen
                      replayKey={replayCount}
                      size={208}
                      isLightMode={isLightMode}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </button>

        {/* Floating Open-Air Typography (Zero Box) */}
        <div
          key={`copy-${stageKey}`}
          className={`flex flex-col items-center w-full mt-1 transition-opacity duration-500 ${
            materialized ? 'animate-badge-copy opacity-100' : 'opacity-0'
          }`}
          style={{
            '--c-delay': `${timings.copyRevealDelayMs}ms`,
            textShadow: openAirTextShadow,
          }}
        >
          <span
            className="font-calligraphy text-[32px] leading-none mb-2"
            style={{ color: palette.text }}
            dir="rtl"
          >
            {badge.arabic}
          </span>

          <h2 className={`font-serif-eng text-[30px] sm:text-[34px] font-medium leading-tight tracking-wide ${tTextMain}`}>
            {badge.title}
          </h2>

          {/* Delicate Metallic Hairline Flourish */}
          <div
            aria-hidden="true"
            className="animate-badge-flourish h-[1px] w-20 my-2.5 rounded-full"
            style={{
              background: `linear-gradient(90deg, transparent, ${palette.primary}, transparent)`,
            }}
          />

          <p
            className="font-serif-eng text-[10.5px] uppercase tracking-[0.22em]"
            style={{ color: palette.text, opacity: 0.94 }}
          >
            {tierStyle.label} Tier · {badge.subtitle}
          </p>

          <p className={`font-serif-eng italic text-[13.5px] leading-relaxed mt-2.5 max-w-[310px] ${tTextSub}`}>
            {badge.description}
          </p>
        </div>

        {/* Minimal Floating Open-Air Actions */}
        <div
          key={`actions-${stageKey}`}
          onClick={(e) => e.stopPropagation()}
          className={`flex items-center justify-center gap-3 mt-7 transition-all duration-500 ${
            dismissable
              ? 'opacity-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 translate-y-2 pointer-events-none'
          }`}
        >
          <button
            type="button"
            onClick={triggerReplay}
            disabled={!dismissable}
            className={`min-h-[44px] px-5 rounded-full border font-serif-eng text-[10px] uppercase tracking-[0.2em] transition-colors cursor-pointer ${
              isLightMode
                ? 'border-black/15 bg-white/55 text-[#2c2720] hover:bg-white/85'
                : 'border-white/18 bg-white/[0.06] text-[#ece4d5] hover:bg-white/[0.13]'
            }`}
          >
            Replay
          </button>

          <button
            type="button"
            onClick={() => requestClose(queueRemaining > 0)}
            disabled={!dismissable}
            className="min-h-[44px] px-7 rounded-full font-serif-eng text-[11px] uppercase tracking-[0.22em] font-medium transition-transform active:scale-[0.97] cursor-pointer"
            style={{
              backgroundColor: palette.primary,
              color: isLightMode ? '#ffffff' : '#080c14',
              boxShadow: `0 8px 28px ${palette.glow}`,
            }}
          >
            {queueRemaining > 0 ? `Next Badge (${queueRemaining})` : 'Continue'}
          </button>
        </div>

        {/* Quiet Interactive Hint */}
        <p
          className={`font-serif-eng text-[8.5px] uppercase tracking-[0.22em] mt-4 transition-opacity duration-500 ${tTextSub} ${
            dismissable ? 'opacity-55' : 'opacity-0'
          }`}
          style={{ textShadow: openAirTextShadow }}
        >
          Tap medallion to celebrate · Tap anywhere to continue
        </p>
      </div>
    </div>
  );
};
