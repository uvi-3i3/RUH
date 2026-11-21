import { useId, useState } from 'react';
import { getBadgeTierStyle } from '../../utils/badgeLogic';
import { getCozyBadgeAsset } from './badgeArtAssets';

/**
 * Generate a smooth scalloped rosette SVG path centered at (cx, cy).
 */
function createScallopedPath(cx, cy, outerR, innerR, lobes) {
  const pts = [];
  for (let i = 0; i < lobes; i++) {
    const a0 = (i * Math.PI * 2) / lobes - Math.PI / 2;
    const aMid = ((i + 0.5) * Math.PI * 2) / lobes - Math.PI / 2;
    const a1 = ((i + 1) * Math.PI * 2) / lobes - Math.PI / 2;
    const x0 = cx + Math.cos(a0) * innerR;
    const y0 = cy + Math.sin(a0) * innerR;
    const xCtrl = cx + Math.cos(aMid) * outerR;
    const yCtrl = cy + Math.sin(aMid) * outerR;
    const x1 = cx + Math.cos(a1) * innerR;
    const y1 = cy + Math.sin(a1) * innerR;
    if (i === 0) pts.push(`M ${x0.toFixed(2)} ${y0.toFixed(2)}`);
    pts.push(`Q ${xCtrl.toFixed(2)} ${yCtrl.toFixed(2)} ${x1.toFixed(2)} ${y1.toFixed(2)}`);
  }
  pts.push('Z');
  return pts.join(' ');
}

const SILVER_SCALLOP_PATH = createScallopedPath(80, 80, 77, 73.2, 24);
const GOLD_ROSETTE_PATH = createScallopedPath(80, 80, 78.2, 72.2, 16);
const PLATINUM_CROWN_PATH = createScallopedPath(80, 80, 78.8, 72.4, 8);

const SparkleStar = ({ cx, cy, r = 5, fill, delay = '0s', dur = '2.8s', animated }) => (
  <g
    className={animated ? 'animate-badge-sparkle' : ''}
    style={animated ? { '--s-delay': delay, '--s-dur': dur } : undefined}
  >
    <path
      d={`M ${cx} ${cy - r} Q ${cx} ${cy} ${cx + r} ${cy} Q ${cx} ${cy} ${cx} ${cy + r} Q ${cx} ${cy} ${cx - r} ${cy} Q ${cx} ${cy} ${cx} ${cy - r} Z`}
      fill={fill}
    />
  </g>
);

/**
 * Minimal vector emblem used strictly as a resilient zero-broken-image fallback
 * if an illustration ever fails to load.
 */
const FallbackEmblem = ({ motif, stroke, fill }) => {
  switch (motif) {
    case 'crescent_dawn':
    case 'lunar_crown':
      return (
        <path
          d="M 85 52 A 24 24 0 1 0 102 94 A 18 18 0 1 1 85 52 Z"
          fill={fill}
          stroke={stroke}
          strokeWidth="1.5"
        />
      );
    case 'triple_flame':
    case 'mihrab_lamp':
      return (
        <path
          d="M 80 48 C 80 48 96 66 96 82 C 96 92 89 98 80 98 C 71 98 64 92 64 82 C 64 66 80 48 80 48 Z"
          fill={fill}
          stroke={stroke}
          strokeWidth="1.5"
        />
      );
    default:
      return (
        <path
          d="M 80 48 L 87 72 L 111 79 L 87 86 L 80 110 L 73 86 L 49 79 L 73 72 Z"
          fill={fill}
          stroke={stroke}
          strokeWidth="1.5"
        />
      );
  }
};

export const BadgeArtwork = ({
  motif = 'crescent_dawn',
  tier = 'silver',
  unlocked = true,
  size = 120,
  isLightMode = false,
  animated = false,
  showSheen = true,
  replayKey = 0,
  className = '',
}) => {
  const uid = useId().replace(/:/g, '');
  const idPrefix = `cozy-badge-${uid}-${replayKey}`;
  const [failedMotif, setFailedMotif] = useState(null);

  const tierStyle = getBadgeTierStyle(tier, isLightMode);
  const { palette } = tierStyle;
  const asset = getCozyBadgeAsset(motif);
  const imgFailed = failedMotif === motif;

  const isPlatinum = tier === 'platinum';
  const isGold = tier === 'gold';
  const isLarge = size >= 96;
  const isMediumOrLarger = size >= 56;

  const metalGradId = `${idPrefix}-metal`;
  const rimBevelId = `${idPrefix}-bevel`;
  const sheenGradId = `${idPrefix}-sheen`;
  const clipId = `${idPrefix}-clip`;

  const lockedStroke = isLightMode ? 'rgba(66, 54, 40, 0.34)' : 'rgba(232, 220, 198, 0.30)';
  const lockedRingBg = isLightMode ? 'rgba(255, 250, 240, 0.52)' : 'rgba(24, 28, 38, 0.48)';

  // Warm cozy gold/pewter/pearl bezel palette tuned to complement hand-painted gouache scenes
  const rimStart = isPlatinum
    ? isLightMode
      ? '#dce9f7'
      : '#f7fbff'
    : isGold
      ? '#fff2c9'
      : isLightMode
        ? '#edf2f7'
        : '#f4f7fb';
  const rimMid = isPlatinum
    ? isLightMode
      ? '#6b87ad'
      : '#b9d4f2'
    : isGold
      ? isLightMode
        ? '#c79332'
        : '#e6be6c'
      : isLightMode
        ? '#7b8a9c'
        : '#c5d1df';
  const rimEnd = isPlatinum
    ? isLightMode
      ? '#395375'
      : '#6e89ad'
    : isGold
      ? isLightMode
        ? '#7d5514'
        : '#9a6d24'
      : isLightMode
        ? '#4d5b6d'
        : '#6e7c91';

  return (
    <div
      key={replayKey}
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {/* Warm Candlelight & Tier Aura Behind Unlocked Medallion */}
      {unlocked && (
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            inset: isLarge ? '-7%' : '-5%',
            background: `radial-gradient(circle, ${asset.warmGlow} 0%, ${palette.glow} 44%, transparent 72%)`,
            opacity: animated ? 0.85 : isLarge ? 0.62 : 0.44,
            filter: isLarge ? 'blur(10px)' : 'blur(4px)',
          }}
        />
      )}

      {/* Sculpted Keepsake Bezel Frame (SVG) */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 160 160"
        className="absolute inset-0 overflow-visible pointer-events-none"
      >
        <defs>
          <linearGradient id={metalGradId} x1="16%" y1="8%" x2="86%" y2="92%">
            <stop offset="0%" stopColor={rimStart} />
            <stop offset="44%" stopColor={rimMid} />
            <stop offset="100%" stopColor={rimEnd} />
          </linearGradient>

          <linearGradient id={rimBevelId} x1="88%" y1="86%" x2="14%" y2="12%">
            <stop offset="0%" stopColor={rimStart} stopOpacity="0.92" />
            <stop offset="50%" stopColor={rimMid} stopOpacity="0.88" />
            <stop offset="100%" stopColor={rimEnd} stopOpacity="0.96" />
          </linearGradient>
        </defs>

        {unlocked ? (
          <g>
            {/* Delicate Keepsake Charm Bail Loop on Hero Size */}
            {isLarge && (
              <g>
                <circle
                  cx="80"
                  cy="-2"
                  r="6.2"
                  fill="none"
                  stroke={`url(#${metalGradId})`}
                  strokeWidth="2.8"
                />
                <rect
                  x="73.5"
                  y="2.5"
                  width="13"
                  height="6"
                  rx="2.6"
                  fill={`url(#${rimBevelId})`}
                  stroke={rimStart}
                  strokeWidth="0.7"
                />
              </g>
            )}

            {/* Tier-Distinct Cozy Keepsake Rim */}
            {isPlatinum ? (
              <g>
                <path
                  d={PLATINUM_CROWN_PATH}
                  fill={`url(#${metalGradId})`}
                  stroke={isLightMode ? rimEnd : rimStart}
                  strokeWidth="1.3"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70.5"
                  fill={`url(#${rimBevelId})`}
                  stroke={rimEnd}
                  strokeOpacity="0.35"
                  strokeWidth="1"
                />
              </g>
            ) : isGold ? (
              <g>
                <path
                  d={GOLD_ROSETTE_PATH}
                  fill={`url(#${metalGradId})`}
                  stroke={isLightMode ? rimEnd : rimStart}
                  strokeWidth="1.2"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="69.5"
                  fill={`url(#${rimBevelId})`}
                  stroke={rimEnd}
                  strokeOpacity="0.38"
                  strokeWidth="1"
                />
              </g>
            ) : (
              <g>
                <path
                  d={SILVER_SCALLOP_PATH}
                  fill={`url(#${metalGradId})`}
                  stroke={isLightMode ? rimEnd : rimStart}
                  strokeWidth="1.15"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="69"
                  fill={`url(#${rimBevelId})`}
                  stroke={rimEnd}
                  strokeOpacity="0.35"
                  strokeWidth="1"
                />
              </g>
            )}

            {/* Fine Heirloom Bead Granulation on Medium & Hero Sizes */}
            {isMediumOrLarger && (isGold || isPlatinum) && (
              <g opacity="0.88">
                {Array.from({ length: 24 }).map((_, i) => {
                  const rad = (i * Math.PI * 2) / 24;
                  if (isPlatinum && i % 6 === 0) return null;
                  return (
                    <circle
                      key={i}
                      cx={80 + Math.cos(rad) * 71.2}
                      cy={80 + Math.sin(rad) * 71.2}
                      r={isLarge ? '1.35' : '1.15'}
                      fill={rimStart}
                    />
                  );
                })}
              </g>
            )}

            {/* Cardinal Cabochon Gems on Platinum & Gold Hero Medallions */}
            {isLarge && (isPlatinum || isGold) && (
              <g>
                {[0, 90, 180, 270].map((deg) => {
                  const rad = (deg * Math.PI) / 180;
                  const cx = 80 + Math.cos(rad) * 73.2;
                  const cy = 80 + Math.sin(rad) * 73.2;
                  return (
                    <circle
                      key={deg}
                      cx={cx}
                      cy={cy}
                      r={isPlatinum ? '3.1' : '2.3'}
                      fill={isPlatinum ? palette.accentGem || '#b8f3ec' : '#fff5d6'}
                      stroke={rimEnd}
                      strokeWidth="0.8"
                    />
                  );
                })}
              </g>
            )}
          </g>
        ) : (
          /* Quiet Sleeping-Heirloom Dashed Rim for Locked Badges */
          <g>
            <circle
              cx="80"
              cy="80"
              r="74"
              fill={lockedRingBg}
              stroke={lockedStroke}
              strokeWidth="2.2"
              strokeDasharray="4.5 5.5"
            />
            <circle
              cx="80"
              cy="80"
              r="67.5"
              fill="none"
              stroke={lockedStroke}
              strokeWidth="1.2"
              opacity="0.7"
            />
          </g>
        )}
      </svg>

      {/* Hand-Painted Cozy Gouache Circular Cabochon Portrait */}
      <div
        className="relative rounded-full overflow-hidden flex items-center justify-center"
        style={{
          width: '82.5%',
          height: '82.5%',
          backgroundColor: isLightMode ? '#f3ece0' : '#161b26',
          boxShadow: unlocked
            ? isLightMode
              ? '0 2px 6px rgba(34, 24, 12, 0.22)'
              : '0 2px 10px rgba(0, 0, 0, 0.55)'
            : 'none',
        }}
      >
        {!imgFailed ? (
          <img
            src={asset.src}
            alt=""
            referrerPolicy="no-referrer"
            draggable={false}
            decoding="async"
            onError={() => setFailedMotif(motif)}
            className="w-full h-full object-cover transition-transform duration-500"
            style={{
              objectPosition: asset.objectPosition,
              transform: `scale(${asset.cropScale})`,
              filter: unlocked
                ? isLightMode
                  ? 'saturate(1.06) contrast(1.02)'
                  : 'saturate(1.08) brightness(0.98) contrast(1.03)'
                : isLightMode
                  ? 'grayscale(0.78) sepia(0.18) brightness(0.96) contrast(0.92)'
                  : 'grayscale(0.84) sepia(0.16) brightness(0.50) contrast(0.92)',
              opacity: unlocked ? 1 : isLightMode ? 0.55 : 0.6,
            }}
          />
        ) : (
          <svg width="100%" height="100%" viewBox="0 0 160 160">
            <FallbackEmblem
              motif={motif}
              stroke={unlocked ? rimStart : lockedStroke}
              fill={unlocked ? rimMid : 'transparent'}
            />
          </svg>
        )}

        {/* Warm Domed Glass Cabochon Edge Depth + Curved Top Highlight */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            boxShadow: unlocked
              ? 'inset 0 0 10px rgba(24, 14, 6, 0.38), inset 0 2px 4px rgba(255, 249, 232, 0.42)'
              : 'inset 0 0 10px rgba(12, 10, 8, 0.36)',
          }}
        />

        {unlocked && (
          <div
            className="absolute pointer-events-none rounded-full"
            style={{
              top: '5%',
              left: '14%',
              width: '72%',
              height: '38%',
              background:
                'linear-gradient(180deg, rgba(255, 252, 244, 0.34) 0%, rgba(255, 252, 244, 0.06) 62%, transparent 100%)',
              opacity: isLarge ? 0.85 : 0.65,
            }}
          />
        )}

        {/* Crisp Inner Metallic Ring Edge Seal */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            border: unlocked
              ? `1px solid ${isLightMode ? 'rgba(255,248,232,0.55)' : 'rgba(255,248,232,0.34)'}`
              : `1px solid ${lockedStroke}`,
          }}
        />
      </div>

      {/* Animated Diagonal Foil Sheen & Twinkling Starlight Glints */}
      {unlocked && (showSheen || animated) && (
        <svg
          width={size}
          height={size}
          viewBox="0 0 160 160"
          className="absolute inset-0 overflow-visible pointer-events-none"
        >
          <defs>
            <linearGradient id={sheenGradId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="38%" stopColor="#fff8e6" stopOpacity="0.18" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.62" />
              <stop offset="62%" stopColor="#fff8e6" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
            <clipPath id={clipId}>
              <circle cx="80" cy="80" r="66.5" />
            </clipPath>
          </defs>

          {showSheen && animated && (
            <g clipPath={`url(#${clipId})`}>
              <rect
                x="0"
                y="-10"
                width="74"
                height="185"
                fill={`url(#${sheenGradId})`}
                className="animate-badge-sheen"
                opacity="0.82"
              />
            </g>
          )}

          {animated && (
            <g>
              <SparkleStar
                cx={18}
                cy={26}
                r={isPlatinum ? 6.5 : isGold ? 5.2 : 4.2}
                fill="#fff9ea"
                delay="0.15s"
                dur="2.6s"
                animated
              />
              <SparkleStar
                cx={142}
                cy={132}
                r={isPlatinum ? 6 : isGold ? 4.8 : 3.8}
                fill="#fff9ea"
                delay="1.05s"
                dur="3.1s"
                animated
              />
              {(isGold || isPlatinum) && (
                <SparkleStar
                  cx={140}
                  cy={24}
                  r={isPlatinum ? 5.4 : 4.4}
                  fill={isPlatinum ? palette.accentGem || '#d6f8f3' : '#fff4d2'}
                  delay="0.6s"
                  dur="2.8s"
                  animated
                />
              )}
            </g>
          )}
        </svg>
      )}
    </div>
  );
};
