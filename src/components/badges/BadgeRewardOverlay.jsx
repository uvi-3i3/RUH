import { useEffect, useMemo, useState } from 'react';
import { BadgeArtwork } from './BadgeArtwork';
import { CelebrationCanvas } from './CelebrationCanvas';
import { getBadgeTierStyle } from '../../utils/badgeLogic';
import { hapticCelebrate, hapticDismiss, hapticNavigate } from '../../utils/haptics';

const LOTTIE_BURST_RAYS = Array.from({ length: 24 }).map((_, idx) => {
  const angleDeg = idx * 15;
  const rad = (angleDeg * Math.PI) / 180;
  const isMajor = idx % 2 === 0;
  const rInner = isMajor ? 62 : 70;
  const rOuter = isMajor ? 116 : 98;
  return {
    id: idx,
    isMajor,
    x1: (120 + Math.cos(rad) * rInner).toFixed(1),
    y1: (120 + Math.sin(rad) * rInner).toFixed(1),
    x2: (120 + Math.cos(rad) * rOuter).toFixed(1),
    y2: (120 + Math.sin(rad) * rOuter).toFixed(1),
    delay: `${40 + (idx % 4) * 38}ms`,
  };
});

export const BadgeRewardOverlay = ({
  badge,
  isLightMode = false,
  isNewUnlock = true,
  queueRemaining = 0,
  onClose,
}) => {
  const [replayCount, setReplayCount] = useState(0);
  const [burstCount, setBurstCount] = useState(1);
  const [tapPulseKey, setTapPulseKey] = useState(0);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  const stageKey = badge ? `${badge.id}-${replayCount}` : 'none';
  const burstKey = badge ? `${badge.id}-${burstCount}` : 'none';

  useEffect(() => {
    if (!badge) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [badge, onClose]);

  const tierStyle = useMemo(
    () => (badge ? getBadgeTierStyle(badge.tier, isLightMode) : null),
    [badge, isLightMode]
  );

  if (!badge || !tierStyle) return null;

  const { palette } = tierStyle;
  const tTextMain = isLightMode ? 'text-[#1a1814]' : 'text-[rgba(246,240,228,0.96)]';
  const tTextSub = isLightMode ? 'text-[#3a3329]' : 'text-[rgba(228,218,200,0.74)]';

  const handlePointerMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setTilt({
      rx: Number((-ny * 12).toFixed(2)),
      ry: Number((nx * 12).toFixed(2)),
    });
  };

  const triggerReplay = () => {
    hapticCelebrate();
    setReplayCount((c) => c + 1);
    setBurstCount((c) => c + 1);
    setTilt({ rx: 0, ry: 0 });
  };

  const triggerTapCelebrate = () => {
    hapticCelebrate();
    setBurstCount((c) => c + 1);
    setTapPulseKey((c) => c + 1);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${badge.title} — ${tierStyle.label} Badge`}
      data-testid="badge-reward-overlay"
      data-tier={badge.tier}
      className="fixed inset-0 z-[115] flex items-center justify-center px-5 py-6"
    >
      {/* Frosted Celestial Backdrop */}
      <div
        onClick={() => {
          hapticDismiss();
          onClose?.();
        }}
        className={`absolute inset-0 transition-opacity duration-500 ${
          isLightMode
            ? 'bg-[#e7eef6]/82 backdrop-blur-md'
            : 'bg-[#040710]/86 backdrop-blur-md'
        }`}
      />

      {/* Reward Showcase Card */}
      <div
        className={`relative w-full max-w-[368px] rounded-[28px] border px-6 pt-7 pb-6 flex flex-col items-center text-center overflow-hidden transition-colors duration-500 ${
          isLightMode
            ? 'bg-white/92 border-white shadow-[0_24px_64px_rgba(26,24,20,0.16)]'
            : 'bg-[#0a0f1a]/94 border-white/[0.14] shadow-[0_28px_72px_rgba(0,0,0,0.76)]'
        }`}
      >
        {/* 60fps Canvas Metallic Foil, Diamond Confetti & Stardust Fireworks */}
        <CelebrationCanvas
          tier={badge.tier}
          isLightMode={isLightMode}
          burstKey={burstKey}
        />

        {/* Subtle Radial Aura Wash at Top */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 -top-12 h-72 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 48%, ${palette.ray} 0%, transparent 72%)`,
          }}
        />

        {/* Quiet Overline Kicker */}
        <div
          key={`kicker-${stageKey}`}
          className="animate-badge-copy relative z-30 flex items-center justify-center gap-2 mb-1.5"
          style={{ '--c-delay': '20ms' }}
        >
          <span
            className="font-serif-eng text-[9px] uppercase tracking-[0.24em] font-medium"
            style={{ color: palette.text }}
          >
            {isNewUnlock ? 'Medallion Bestowed' : `${tierStyle.label} Medallion`}
          </span>
          <span className={`${tTextSub} opacity-40 text-[9px]`} aria-hidden="true">
            ·
          </span>
          <span
            className="font-calligraphy text-[14px] leading-none"
            style={{ color: palette.text }}
            dir="rtl"
          >
            {tierStyle.arabic}
          </span>
        </div>

        {/* Interactive Lottie-Style Choreographed Medallion Stage */}
        <button
          type="button"
          aria-label={`Celebrate ${badge.title} medallion burst`}
          onClick={triggerTapCelebrate}
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setTilt({ rx: 0, ry: 0 })}
          className="relative z-30 w-[236px] h-[222px] flex items-center justify-center cursor-pointer focus:outline-none"
        >
          {/* Rotating Celestial Light Rays */}
          <div
            key={`rays-${stageKey}`}
            aria-hidden="true"
            className="animate-badge-rays absolute w-[252px] h-[252px] rounded-full pointer-events-none"
            style={{
              background: `conic-gradient(from 0deg, transparent 0deg 14deg, ${palette.ray} 20deg 28deg, transparent 34deg 56deg, ${palette.ray} 62deg 70deg, transparent 78deg 108deg, ${palette.ray} 114deg 122deg, transparent 130deg 164deg, ${palette.ray} 170deg 178deg, transparent 186deg 220deg, ${palette.ray} 226deg 234deg, transparent 242deg 278deg, ${palette.ray} 284deg 292deg, transparent 300deg 360deg)`,
              maskImage: 'radial-gradient(circle, black 20%, rgba(0,0,0,0.48) 54%, transparent 76%)',
              WebkitMaskImage:
                'radial-gradient(circle, black 20%, rgba(0,0,0,0.48) 54%, transparent 76%)',
            }}
          />

          {/* Sacred Dual-Ring Geometry Orbit Behind Medallion */}
          <svg
            width="230"
            height="230"
            viewBox="0 0 160 160"
            aria-hidden="true"
            className="absolute inset-0 m-auto pointer-events-none"
          >
            <g className="animate-badge-orbit-cw" style={{ transformOrigin: '80px 80px' }} opacity="0.24">
              <circle
                cx="80"
                cy="80"
                r="73"
                fill="none"
                stroke={palette.primary}
                strokeWidth="0.7"
                strokeDasharray="3 5"
              />
            </g>
            <g className="animate-badge-orbit-ccw" style={{ transformOrigin: '80px 80px' }} opacity="0.18">
              <rect
                x="23"
                y="23"
                width="114"
                height="114"
                rx="16"
                fill="none"
                stroke={palette.primary}
                strokeWidth="0.65"
              />
              <rect
                x="23"
                y="23"
                width="114"
                height="114"
                rx="16"
                transform="rotate(45 80 80)"
                fill="none"
                stroke={palette.primary}
                strokeWidth="0.65"
              />
            </g>
          </svg>

          {/* Impact Flash Bloom */}
          <span
            key={`impact-${burstKey}`}
            aria-hidden="true"
            className="animate-badge-impact absolute w-[160px] h-[160px] rounded-full pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${palette.glow} 0%, transparent 70%)`,
            }}
          />

          {/* 24-Ray Staggered Lottie Tapered Radial Stroke Bursts */}
          <svg
            key={`lottie-burst-${burstKey}`}
            width="240"
            height="240"
            viewBox="0 0 240 240"
            aria-hidden="true"
            className="absolute inset-0 m-auto pointer-events-none"
          >
            {LOTTIE_BURST_RAYS.map((ray) => (
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
                strokeWidth={ray.isMajor ? '2' : '1.25'}
                strokeLinecap="round"
                className="animate-lottie-burst"
                style={{ '--l-delay': ray.delay }}
              />
            ))}
          </svg>

          {/* 3 Staggered Geometric Shockwaves */}
          <span
            key={`shock-a-${burstKey}`}
            aria-hidden="true"
            className="animate-badge-shockwave absolute w-[128px] h-[128px] rounded-full border-2 pointer-events-none"
            style={{ borderColor: palette.primary }}
          />
          <span
            key={`shock-oct-${burstKey}`}
            aria-hidden="true"
            className="animate-badge-octagon absolute w-[132px] h-[132px] rounded-[24px] border pointer-events-none"
            style={{ borderColor: isLightMode ? palette.secondary : palette.highlight }}
          />
          <span
            key={`shock-b-${burstKey}`}
            aria-hidden="true"
            className="animate-badge-shockwave absolute w-[112px] h-[112px] rounded-full border border-dashed pointer-events-none"
            style={{
              borderColor: palette.primary,
              animationDelay: '180ms',
            }}
          />

          {/* Crisp Jewel Reveal + Interactive Tap Pulse */}
          <div key={`medallion-${stageKey}`} className="animate-badge-enter relative z-10">
            <div key={`tap-${tapPulseKey}`} className={tapPulseKey > 0 ? 'animate-badge-pulse-tap' : ''}>
              <div
                className="animate-badge-float transition-transform duration-300 ease-out"
                style={{
                  transform: `perspective(700px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
                }}
              >
                <BadgeArtwork
                  motif={badge.motif}
                  tier={badge.tier}
                  unlocked
                  animated
                  showSheen
                  replayKey={replayCount}
                  size={178}
                  isLightMode={isLightMode}
                />
              </div>
            </div>
          </div>
        </button>

        {/* Quiet Interactive Tap Whisper */}
        <span
          className={`relative z-30 font-serif-eng text-[8px] uppercase tracking-[0.2em] ${tTextSub} opacity-55 -mt-1 mb-2`}
        >
          Tap medallion to celebrate
        </span>

        {/* Badge Calligraphy + Title + Flourish Divider + Description */}
        <div
          key={`copy-${stageKey}`}
          className="animate-badge-copy relative z-30 flex flex-col items-center w-full"
          style={{ '--c-delay': '60ms' }}
        >
          <span
            className="font-calligraphy text-[28px] leading-none mb-1.5"
            style={{ color: palette.text }}
            dir="rtl"
          >
            {badge.arabic}
          </span>

          <h2 className={`font-serif-eng text-[25px] font-medium leading-tight tracking-wide ${tTextMain}`}>
            {badge.title}
          </h2>

          {/* Animated Metallic Flourish Underline */}
          <div
            aria-hidden="true"
            className="animate-badge-flourish h-[1px] w-16 my-2 rounded-full"
            style={{
              background: `linear-gradient(90deg, transparent, ${palette.primary}, transparent)`,
            }}
          />

          <p
            className="font-serif-eng text-[10px] uppercase tracking-[0.2em]"
            style={{ color: palette.text, opacity: 0.92 }}
          >
            {tierStyle.label} Tier · {badge.subtitle}
          </p>

          <p className={`font-serif-eng italic text-[13px] leading-relaxed mt-2 max-w-[288px] ${tTextSub}`}>
            {badge.description}
          </p>
        </div>

        {/* Actions */}
        <div
          key={`actions-${stageKey}`}
          className="animate-badge-copy relative z-30 w-full flex items-center gap-2.5 mt-5"
          style={{ '--c-delay': '100ms' }}
        >
          <button
            type="button"
            onClick={triggerReplay}
            className={`min-h-[44px] px-4 rounded-2xl border font-serif-eng text-[10px] uppercase tracking-[0.18em] transition-colors cursor-pointer shrink-0 ${
              isLightMode
                ? 'border-black/15 text-[#2c2720] hover:bg-black/[0.05]'
                : 'border-white/14 text-[#e4dac8] hover:bg-white/[0.07]'
            }`}
          >
            Replay
          </button>

          <button
            type="button"
            onClick={() => {
              if (queueRemaining > 0) {
                hapticNavigate();
              } else {
                hapticDismiss();
              }
              onClose?.();
            }}
            className="flex-1 min-h-[44px] px-5 rounded-2xl font-serif-eng text-[11px] uppercase tracking-[0.2em] font-medium transition-transform active:scale-[0.98] cursor-pointer"
            style={{
              backgroundColor: palette.primary,
              color: isLightMode ? '#ffffff' : '#080c14',
              boxShadow: `0 6px 24px ${palette.glow}`,
            }}
          >
            {queueRemaining > 0 ? `Next Medallion (${queueRemaining})` : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};
