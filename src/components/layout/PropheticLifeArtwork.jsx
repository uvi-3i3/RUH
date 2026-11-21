import { memo, useId, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  PROPHETIC_DIAGRAM_HADITH,
  PROPHETIC_DIAGRAM_LEGEND,
  computePropheticIllumination,
} from '../../utils/propheticDiagramLogic';
import { XIcon } from '../icons/Icons';
import { hapticDismiss, hapticNavigate } from '../../utils/haptics';

/**
 * Geometric coordinates inside viewBox="0 0 64 168":
 * - Square / Sacred Enclosure (Ajal): (14, 52) -> (50, 142) [w=36, h=90, perimeter=252]
 *   Drawn starting at bottom-center (32, 142) symmetrically around so illumination climbs upward.
 * - Central Ascending Line (Amal / Hopes): rises from (32, 134) through soul (32, 102),
 *   piercing beyond top boundary (y=52) up to (32, 18) [length=116].
 * - 6 Short Intersecting Strokes (A'rad / Calamities): flanking & crossing the central line
 *   inside the enclosure, ordered bottom-to-top so they ignite progressively with each prayer.
 */
const FRAME_PERIMETER = 252;
const HOPE_LENGTH = 116;

// Left & right half-paths of the enclosure starting at bottom-center (32, 142) and meeting at top-center (32, 52)
const FRAME_HALF_LEN = FRAME_PERIMETER / 2; // 126
const FRAME_LEFT_PATH = 'M 32 142 L 14 142 L 14 52 L 32 52';
const FRAME_RIGHT_PATH = 'M 32 142 L 50 142 L 50 52 L 32 52';

const CALAMITY_STROKES = [
  { id: 'c1', x1: 21, y1: 124, x2: 31, y2: 120 },
  { id: 'c2', x1: 43, y1: 114, x2: 33, y2: 110 },
  { id: 'c3', x1: 20, y1: 92, x2: 31, y2: 88 },
  { id: 'c4', x1: 44, y1: 82, x2: 33, y2: 78 },
  { id: 'c5', x1: 21, y1: 71, x2: 31, y2: 67 },
  { id: 'c6', x1: 43, y1: 61, x2: 33, y2: 57 },
];

export const PropheticLifeArtwork = memo(function PropheticLifeArtwork({
  completedCount = 0,
  totalPrayers = 5,
  isLightMode = false,
  accentColor = '#d4af37',
  isOpen = false,
  onOpen,
  onClose,
}) {
  const uid = useId().replace(/:/g, '');
  const glowFilterId = `prophetic-glow-${uid}`;
  const softHaloId = `prophetic-halo-${uid}`;

  const illumination = useMemo(
    () => computePropheticIllumination(completedCount, totalPrayers),
    [completedCount, totalPrayers]
  );

  const { parts, stage, completed, total, stageLabel, isFullyLit } = illumination;

  // Dual-theme stroke palette: deep bronze-gold on daylight clouds, luminous sanctuary gold at night
  const litStroke = isLightMode ? '#9c7533' : accentColor || '#e4c078';
  const litBright = isLightMode ? '#b88935' : '#f7e1ad';
  const baseStroke = isLightMode ? 'rgba(54, 46, 36, 0.34)' : 'rgba(235, 224, 202, 0.30)';
  const faintTick = isLightMode ? 'rgba(54, 46, 36, 0.22)' : 'rgba(235, 224, 202, 0.20)';

  const frameDashOffset = FRAME_HALF_LEN * (1 - parts.frameProgress);
  const hopeDashOffset = HOPE_LENGTH * (1 - parts.hopeProgress);

  const popoverSurface = isLightMode
    ? 'bg-[#f6f1e7]/94 border-[#1e1b18]/12 text-[#1a1814] shadow-[0_18px_48px_rgba(24,18,10,0.18),inset_0_1px_0_rgba(255,255,255,0.88)]'
    : 'bg-[#0a0f1c]/92 border-[#f0e6d2]/14 text-[#f5eee0] shadow-[0_20px_54px_rgba(0,0,0,0.68),inset_0_1px_0_rgba(255,255,255,0.08)]';

  const mutedText = isLightMode ? 'text-[#6c6150]' : 'text-[#e8decb]/60';
  const hairline = isLightMode ? 'border-[#1e1b18]/10' : 'border-white/10';

  return (
    <>
      {/* FLOATING SACRED LINE ART TRIGGER — Pure unboxed geometry etched in the sky */}
      <button
        type="button"
        data-testid="prophetic-life-artwork"
        data-illumination-stage={stage}
        data-completed-prayers={completed}
        aria-label={`Life, Hopes & Calamities line artwork — ${completed} of ${total} prayers illuminated (${stageLabel}). Tap to contemplate.`}
        aria-expanded={isOpen}
        onClick={() => {
          hapticNavigate();
          if (isOpen) onClose?.();
          else onOpen?.();
        }}
        className="group relative flex flex-col items-center justify-center w-[44px] h-[126px] md:w-[60px] md:h-[164px] rounded-2xl cursor-pointer transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.04] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#d4af37]/60"
      >
        {/* Ambient golden radiance behind the diagram — intensifies little by little */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-full transition-opacity duration-700 ease-out"
          style={{
            opacity: parts.haloOpacity * (isLightMode ? 0.34 : 0.44),
            background: isLightMode
              ? `radial-gradient(ellipse 68% 58% at 50% 52%, rgba(180,136,54,0.34) 0%, rgba(180,136,54,0.08) 54%, transparent 78%)`
              : `radial-gradient(ellipse 68% 58% at 50% 52%, rgba(228,192,120,0.36) 0%, rgba(210,162,75,0.10) 56%, transparent 80%)`,
          }}
        />

        <svg
          viewBox="0 0 64 168"
          className="relative w-full h-full overflow-visible"
          aria-hidden="true"
        >
          <defs>
            <filter id={glowFilterId} x="-45%" y="-25%" width="190%" height="150%">
              <feGaussianBlur stdDeviation={isFullyLit ? '2.6' : '1.9'} result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <radialGradient id={softHaloId} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={litBright} stopOpacity="0.9" />
              <stop offset="55%" stopColor={litStroke} stopOpacity="0.28" />
              <stop offset="100%" stopColor={litStroke} stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* 1. RESTING BASE HAIRLINE INK (Always serenely visible at 0/5) */}
          <g fill="none" strokeLinecap="round" strokeLinejoin="round">
            {/* Subtle corner registration ticks on the square of life */}
            <path
              d="M 10 52 L 14 52 M 50 52 L 54 52 M 10 142 L 14 142 M 50 142 L 54 142"
              stroke={faintTick}
              strokeWidth="0.8"
            />
            {/* Resting Square (Ajal — Appointed Term) */}
            <rect
              x="14"
              y="52"
              width="36"
              height="90"
              stroke={baseStroke}
              strokeWidth="1.05"
            />
            {/* Resting Central Line extending beyond the square (Amal — Hope) */}
            <line
              x1="32"
              y1="134"
              x2="32"
              y2="18"
              stroke={baseStroke}
              strokeWidth="1.05"
            />
            {/* Dotted cosmic continuation beyond Hope */}
            <line
              x1="32"
              y1="14"
              x2="32"
              y2="8"
              stroke={faintTick}
              strokeWidth="0.9"
              strokeDasharray="1.5 2.5"
            />
            {/* Resting Short Intersecting Lines (A'rad — Calamities) */}
            {CALAMITY_STROKES.map((s) => (
              <line
                key={s.id}
                x1={s.x1}
                y1={s.y1}
                x2={s.x2}
                y2={s.y2}
                stroke={baseStroke}
                strokeWidth="0.95"
              />
            ))}
            {/* Resting Soul Diamond (Al-Insan) */}
            <polygon
              points="32,97.5 36.5,102 32,106.5 27.5,102"
              stroke={baseStroke}
              strokeWidth="1"
              fill="none"
            />
            {/* Resting Celestial Star at Hope's apex */}
            <path
              d="M 32 13 L 33.1 16.9 L 37 18 L 33.1 19.1 L 32 23 L 30.9 19.1 L 27 18 L 30.9 16.9 Z"
              stroke={faintTick}
              strokeWidth="0.75"
              fill="none"
            />
          </g>

          {/* 2. PROGRESSIVELY ILLUMINATED GOLDEN LINE ART (Glows prayer by prayer) */}
          <g
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter={stage > 0 ? `url(#${glowFilterId})` : undefined}
          >
            {/* Illuminated Left & Right Walls of Ajal climbing upward symmetrically */}
            <path
              d={FRAME_LEFT_PATH}
              stroke={litStroke}
              strokeWidth={isFullyLit ? '1.45' : '1.3'}
              strokeDasharray={FRAME_HALF_LEN}
              strokeDashoffset={frameDashOffset}
              style={{
                opacity: parts.frameProgress > 0 ? 0.96 : 0,
                transition: 'stroke-dashoffset 750ms cubic-bezier(0.16, 1, 0.3, 1), opacity 500ms ease',
              }}
            />
            <path
              d={FRAME_RIGHT_PATH}
              stroke={litStroke}
              strokeWidth={isFullyLit ? '1.45' : '1.3'}
              strokeDasharray={FRAME_HALF_LEN}
              strokeDashoffset={frameDashOffset}
              style={{
                opacity: parts.frameProgress > 0 ? 0.96 : 0,
                transition: 'stroke-dashoffset 750ms cubic-bezier(0.16, 1, 0.3, 1), opacity 500ms ease',
              }}
            />

            {/* Illuminated Ascending Line of Hope (Amal) rising past the square */}
            <path
              d="M 32 134 L 32 18"
              stroke={litBright}
              strokeWidth={isFullyLit ? '1.5' : '1.3'}
              strokeDasharray={HOPE_LENGTH}
              strokeDashoffset={hopeDashOffset}
              style={{
                opacity: parts.hopeProgress > 0 ? 0.98 : 0,
                transition: 'stroke-dashoffset 820ms cubic-bezier(0.16, 1, 0.3, 1), opacity 500ms ease',
              }}
            />

            {/* Illuminated Calamities / Trials (A'rad) turning into light little by little */}
            {CALAMITY_STROKES.map((s, idx) => {
              const isStrokeLit = idx < parts.calamitiesLitCount;
              return (
                <line
                  key={`lit-${s.id}`}
                  x1={s.x1}
                  y1={s.y1}
                  x2={s.x2}
                  y2={s.y2}
                  stroke={litStroke}
                  strokeWidth="1.25"
                  style={{
                    opacity: isStrokeLit ? 0.95 : 0,
                    transition: `opacity 560ms ease ${idx * 45}ms`,
                  }}
                />
              );
            })}

            {/* Illuminated Soul Core (Al-Insan) */}
            {parts.soulGlow > 0 && (
              <circle
                cx="32"
                cy="102"
                r={isFullyLit ? '10' : '7.5'}
                fill={`url(#${softHaloId})`}
                style={{
                  opacity: parts.soulGlow * 0.72,
                  transition: 'opacity 600ms ease',
                }}
              />
            )}
            <polygon
              points="32,97.5 36.5,102 32,106.5 27.5,102"
              stroke={litBright}
              strokeWidth="1.35"
              fill={litStroke}
              fillOpacity={parts.soulGlow * 0.38}
              style={{
                opacity: parts.soulGlow,
                transition: 'opacity 600ms ease, fill-opacity 600ms ease',
              }}
            />
            <circle
              cx="32"
              cy="102"
              r="1.7"
              fill={litBright}
              style={{
                opacity: parts.soulGlow,
                transition: 'opacity 500ms ease',
              }}
            />

            {/* Illuminated Celestial Finial Crown (Full bloom when Hope pierces the veil at 5/5) */}
            {parts.crownGlow > 0 && (
              <circle
                cx="32"
                cy="18"
                r={isFullyLit ? '11' : '6.5'}
                fill={`url(#${softHaloId})`}
                style={{
                  opacity: parts.crownGlow * 0.85,
                  transition: 'opacity 700ms ease',
                }}
              />
            )}
            <path
              d="M 32 12.5 L 33.2 16.8 L 37.5 18 L 33.2 19.2 L 32 23.5 L 30.8 19.2 L 26.5 18 L 30.8 16.8 Z"
              fill={litBright}
              stroke={litStroke}
              strokeWidth="0.6"
              style={{
                opacity: parts.crownGlow,
                transition: 'opacity 700ms ease',
              }}
            />
          </g>

          {/* 3. QUIET 5-PRAYER MICRO PROGRESS POINTS BELOW THE DIAGRAM */}
          <g transform="translate(0, 156)">
            {[0, 1, 2, 3, 4].map((dotIdx) => {
              const cx = 18 + dotIdx * 7;
              const isLit = dotIdx < completed;
              return (
                <circle
                  key={dotIdx}
                  cx={cx}
                  cy="0"
                  r={isLit ? '1.65' : '1.15'}
                  fill={isLit ? litBright : baseStroke}
                  style={{
                    opacity: isLit ? 0.96 : 0.65,
                    transition: 'all 450ms ease',
                  }}
                />
              );
            })}
          </g>
        </svg>
      </button>

      {/* QUIET CONTEMPLATION POPOVER (Sahih al-Bukhari 6417) */}
      {isOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-40 bg-black/18"
              onClick={() => {
                hapticDismiss();
                onClose?.();
              }}
            />
            <div
              role="dialog"
              aria-modal="false"
              aria-label="Life, Hopes and Calamities — Prophetic Diagram"
              data-testid="prophetic-life-popover"
              onClick={(e) => e.stopPropagation()}
              className={`fixed left-3 right-3 sm:right-auto sm:left-16 md:left-24 top-1/2 -translate-y-1/2 z-50 sm:w-[320px] rounded-[22px] border backdrop-blur-md p-4 transition-[transform,opacity] duration-300 ${popoverSurface}`}
            >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-2.5">
              <div className="min-w-0">
                <h2 className="font-serif-eng text-[14px] leading-snug tracking-[0.02em]">
                  {PROPHETIC_DIAGRAM_HADITH.title}
                </h2>
                <p className={`text-[10.5px] tracking-[0.08em] uppercase mt-0.5 ${mutedText}`}>
                  {PROPHETIC_DIAGRAM_HADITH.source}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  hapticDismiss();
                  onClose?.();
                }}
                aria-label="Close diagram reflection"
                className={`w-8 h-8 -mr-1 -mt-1 rounded-full flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                  isLightMode
                    ? 'hover:bg-[#1e1b18]/[0.06] text-[#5a5042]'
                    : 'hover:bg-white/[0.08] text-[#f0e6d2]/65'
                }`}
              >
                <XIcon className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Hadith Passage */}
            <p className="font-serif-eng italic text-[12.5px] leading-[1.6] opacity-90 mb-3">
              “{PROPHETIC_DIAGRAM_HADITH.quote}”
            </p>

            {/* 4-Symbol Quiet Legend */}
            <div className={`border-t pt-2.5 space-y-2 ${hairline}`}>
              {PROPHETIC_DIAGRAM_LEGEND.map((item) => (
                <div key={item.id} className="flex items-baseline justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-[11px] font-medium block leading-tight">
                      {item.label}
                    </span>
                    <span className={`text-[10.5px] leading-snug block ${mutedText}`}>
                      {item.meaning}
                    </span>
                  </div>
                  <span
                    className="font-arabic text-[13px] shrink-0"
                    style={{ color: litStroke }}
                    dir="rtl"
                  >
                    {item.arabic}
                  </span>
                </div>
              ))}
            </div>

            {/* Prayer Illumination Progress Footer */}
            <div className={`border-t mt-3 pt-2.5 flex items-center justify-between gap-2 ${hairline}`}>
              <div className="min-w-0">
                <span
                  className="text-[10.5px] uppercase tracking-[0.12em] font-medium block truncate"
                  style={{ color: litStroke }}
                >
                  {stageLabel}
                </span>
                <span className={`text-[10px] tabular-nums ${mutedText}`}>
                  {completed} of {total} daily prayers illuminated
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0" aria-hidden="true">
                {[0, 1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rotate-45 transition-all duration-300"
                    style={{
                      backgroundColor: i < completed ? litStroke : 'transparent',
                      border: `1px solid ${i < completed ? litStroke : baseStroke}`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
          </>,
          document.body
        )}
    </>
  );
});
