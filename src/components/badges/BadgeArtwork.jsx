import { useId } from 'react';
import { getBadgeTierStyle } from '../../utils/badgeLogic';

/**
 * Generate a smooth scalloped rosette SVG path (used for Gold & Silver forged coin edges).
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

const GOLD_ROSETTE_PATH = createScallopedPath(80, 82, 70, 63, 12);
const SILVER_COIN_PATH = createScallopedPath(80, 82, 66.5, 62.5, 24);

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

const MotifArtwork = ({
  motif,
  metalGrad,
  bevelGrad,
  accentStroke,
  highlight,
  gemColor,
  dishFill,
  drawClass,
}) => {
  switch (motif) {
    case 'crescent_dawn':
      return (
        <g>
          {/* Radiant dawn sun-glow arc */}
          <path
            d="M 46 100 A 35 35 0 0 1 114 100"
            fill="none"
            stroke={accentStroke}
            strokeWidth="1.2"
            strokeDasharray="2 3.5"
            opacity="0.7"
          />
          <path
            d="M 55 101 A 26 26 0 0 1 105 101"
            fill={accentStroke}
            opacity="0.14"
          />
          {/* Horizon Mountains & Water Shimmer */}
          <path
            d="M 44 103 Q 63 94 80 100 Q 98 106 116 99"
            fill="none"
            stroke={metalGrad}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M 52 109 Q 80 104 108 109 M 62 115 L 98 115"
            fill="none"
            stroke={accentStroke}
            strokeWidth="1.3"
            strokeLinecap="round"
            opacity="0.65"
          />
          {/* Beveled Crescent Moon */}
          <path
            d="M 84 52 A 23 23 0 1 0 103 91 A 17.5 17.5 0 1 1 84 52 Z"
            fill={metalGrad}
            stroke={highlight}
            strokeWidth="1"
            className={drawClass}
          />
          <path
            d="M 71 58 A 19 19 0 0 0 70 86"
            fill="none"
            stroke={highlight}
            strokeWidth="1.1"
            strokeLinecap="round"
            opacity="0.75"
          />
          {/* Morning Star & Twin Companion Stars */}
          <path
            d="M 97 59 L 99.1 64.9 L 105 67 L 99.1 69.1 L 97 75 L 94.9 69.1 L 89 67 L 94.9 64.9 Z"
            fill={highlight}
          />
          <circle cx="62" cy="59" r="1.4" fill={highlight} opacity="0.8" />
          <circle cx="107" cy="79" r="1.1" fill={highlight} opacity="0.7" />
        </g>
      );

    case 'tasbih_chaplet': {
      const beads = [];
      const total = 11;
      for (let i = 0; i < total; i++) {
        const angle = -Math.PI * 0.8 + (i / (total - 1)) * (Math.PI * 1.6);
        const bx = 80 + Math.sin(angle) * 28.5;
        const by = 78 - Math.cos(angle) * 25;
        beads.push({ x: bx, y: by, r: i === 5 ? 4.8 : i % 2 === 0 ? 3.5 : 3.1 });
      }
      return (
        <g>
          {/* Inner Filigree Ring */}
          <circle cx="80" cy="78" r="17" fill="none" stroke={accentStroke} strokeWidth="0.9" strokeDasharray="2 3" opacity="0.55" />
          {/* Chaplet Silk Cord */}
          <path
            d="M 55 94 A 28.5 25 0 1 1 105 94"
            fill="none"
            stroke={accentStroke}
            strokeWidth="1.8"
            className={drawClass}
          />
          {beads.map((b, idx) => (
            <g key={idx}>
              <circle cx={b.x} cy={b.y} r={b.r} fill={metalGrad} stroke={highlight} strokeWidth="0.75" />
              <circle cx={b.x - b.r * 0.28} cy={b.y - b.r * 0.28} r={b.r * 0.34} fill={highlight} opacity="0.9" />
            </g>
          ))}
          {/* Ornate Imamah Clasp Bead */}
          <rect x="76.5" y="92" width="7" height="10" rx="3" fill={bevelGrad} stroke={highlight} strokeWidth="0.8" />
          {/* Silken Tassel Strands */}
          <path d="M 80 102 L 73 118 M 80 102 L 80 120 M 80 102 L 87 118" stroke={metalGrad} strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="80" cy="78" r="4.5" fill={highlight} opacity="0.85" />
          <circle cx="80" cy="78" r="2.2" fill={dishFill} />
        </g>
      );
    }

    case 'triple_flame':
      return (
        <g>
          {/* Architectural Pedestal Steps */}
          <path d="M 52 108 H 108 M 58 113 H 102 M 66 118 H 94" stroke={metalGrad} strokeWidth="1.8" strokeLinecap="round" />
          {/* Side Sanctuary Pillars */}
          <rect x="57" y="97" width="8" height="10" rx="1.5" fill={bevelGrad} stroke={highlight} strokeWidth="0.7" />
          <rect x="95" y="97" width="8" height="10" rx="1.5" fill={bevelGrad} stroke={highlight} strokeWidth="0.7" />
          <rect x="75" y="93" width="10" height="14" rx="1.5" fill={metalGrad} stroke={highlight} strokeWidth="0.8" />
          {/* Twin Side Flames */}
          <path
            d="M 61 95 C 55 89 55 79 61 69 C 64 76 67 83 67 90 C 67 94 64 95 61 95 Z"
            fill={bevelGrad}
            stroke={highlight}
            strokeWidth="0.65"
          />
          <path
            d="M 99 95 C 105 89 105 79 99 69 C 96 76 93 83 93 90 C 93 94 96 95 99 95 Z"
            fill={bevelGrad}
            stroke={highlight}
            strokeWidth="0.65"
          />
          {/* Sovereign Center Flame */}
          <path
            d="M 80 46 C 80 46 95 64 95 79 C 95 89 88.5 95 80 95 C 71.5 95 65 89 65 79 C 65 64 80 46 80 46 Z"
            fill={metalGrad}
            stroke={highlight}
            strokeWidth="1"
            className={drawClass}
          />
          <path
            d="M 80 62 C 85 70 86 80 80 89 C 74 80 75 70 80 62 Z"
            fill={highlight}
            opacity="0.92"
          />
          <circle cx="80" cy="41" r="1.4" fill={highlight} opacity="0.85" />
        </g>
      );

    case 'mihrab_lamp':
      return (
        <g>
          {/* Stepped Marble Sanctuary Base */}
          <line x1="48" y1="113" x2="112" y2="113" stroke={metalGrad} strokeWidth="2" strokeLinecap="round" />
          {/* Twin Columns */}
          <rect x="52" y="79" width="4.5" height="33" rx="1" fill={bevelGrad} stroke={highlight} strokeWidth="0.6" />
          <rect x="103.5" y="79" width="4.5" height="33" rx="1" fill={bevelGrad} stroke={highlight} strokeWidth="0.6" />
          {/* Pointed Islamic Mihrab Arch */}
          <path
            d="M 54 81 Q 54 55 80 45 Q 106 55 106 81"
            fill="none"
            stroke={metalGrad}
            strokeWidth="2.8"
            strokeLinecap="round"
            className={drawClass}
          />
          <path
            d="M 60 112 V 82 Q 60 61 80 52 Q 100 61 100 82 V 112"
            fill={accentStroke}
            fillOpacity="0.1"
            stroke={accentStroke}
            strokeWidth="1.2"
          />
          {/* Hanging Lamp Chain & Faceted Mishkat Vessel */}
          <line x1="80" y1="52" x2="80" y2="66" stroke={highlight} strokeWidth="1.4" />
          <path
            d="M 73 67 L 87 67 L 84 74 L 91 86 Q 80 96 69 86 L 76 74 Z"
            fill={metalGrad}
            stroke={highlight}
            strokeWidth="0.9"
          />
          {/* Inner Light Core & Radiating Beams */}
          <circle cx="80" cy="83" r="5" fill={highlight} />
          <path
            d="M 71 95 L 64 107 M 80 97 L 80 109 M 89 95 L 96 107"
            stroke={highlight}
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.82"
          />
        </g>
      );

    case 'qalam_scroll':
      return (
        <g>
          {/* Open Illuminated Folio Frame */}
          <path
            d="M 48 59 Q 64 55 80 61 Q 96 55 112 59 V 105 Q 96 100 80 106 Q 64 100 48 105 Z"
            fill={dishFill}
            stroke={metalGrad}
            strokeWidth="2.2"
            strokeLinejoin="round"
            className={drawClass}
          />
          {/* Center Binding Spine */}
          <line x1="80" y1="61" x2="80" y2="106" stroke={accentStroke} strokeWidth="1.4" opacity="0.85" />
          {/* Left Page Calligraphic Ruled Script */}
          <line x1="54" y1="70" x2="73" y2="69" stroke={metalGrad} strokeWidth="1.8" strokeLinecap="round" />
          <line x1="54" y1="78" x2="74" y2="77" stroke={accentStroke} strokeWidth="1.5" strokeLinecap="round" opacity="0.85" />
          <line x1="54" y1="86" x2="71" y2="85.5" stroke={accentStroke} strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
          <circle cx="64" cy="94" r="3" fill={metalGrad} />
          {/* Right Page Arabesque Shamsa + Lines */}
          <circle cx="96" cy="72" r="4.5" fill="none" stroke={metalGrad} strokeWidth="1.4" />
          <circle cx="96" cy="72" r="1.5" fill={highlight} />
          <line x1="86" y1="84" x2="105" y2="83" stroke={accentStroke} strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
          <line x1="86" y1="92" x2="101" y2="91.5" stroke={accentStroke} strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
          {/* Diagonal Reed Qalam Pen */}
          <path
            d="M 75 112 L 82 103 L 111 55 L 117 59 L 87 107 Z"
            fill={metalGrad}
            stroke={highlight}
            strokeWidth="0.9"
          />
          <circle cx="73" cy="115" r="2" fill={highlight} />
        </g>
      );

    case 'lunar_crown':
      return (
        <g>
          {/* Ecliptic Orbit Ring & 7 Stars */}
          <ellipse
            cx="80"
            cy="84"
            rx="34"
            ry="14"
            transform="rotate(-18 80 84)"
            fill="none"
            stroke={accentStroke}
            strokeWidth="1.1"
            strokeDasharray="2.5 3"
            opacity="0.78"
          />
          {[
            [49, 92],
            [56, 70],
            [70, 56],
            [80, 50],
            [91, 56],
            [106, 71],
            [111, 88],
          ].map(([sx, sy], idx) => (
            <circle key={idx} cx={sx} cy={sy} r={idx === 3 ? 2.4 : 1.7} fill={highlight} />
          ))}
          {/* Full Shaded Lunar Sphere */}
          <circle cx="80" cy="86" r="21" fill={metalGrad} stroke={highlight} strokeWidth="1.2" className={drawClass} />
          <circle cx="74" cy="80" r="5" fill={dishFill} opacity="0.16" />
          <circle cx="88" cy="91" r="6.5" fill={dishFill} opacity="0.14" />
          <circle cx="80" cy="86" r="15.5" fill="none" stroke={highlight} strokeWidth="0.9" opacity="0.5" />
          {/* Royal Crescent Crown Above Moon */}
          <path
            d="M 62 63 Q 80 48 98 63 Q 80 57 62 63 Z"
            fill={highlight}
            opacity="0.9"
          />
        </g>
      );

    case 'kaaba_compass':
      return (
        <g>
          {/* Radiant Courtyard Floor Arc */}
          <circle cx="80" cy="82" r="32" fill="none" stroke={accentStroke} strokeWidth="1.2" strokeDasharray="3 3" opacity="0.7" />
          {/* 4 Sharp Platinum Compass Needles */}
          <path d="M 80 43 L 84.5 55 L 75.5 55 Z" fill={highlight} />
          <path d="M 80 121 L 84.5 109 L 75.5 109 Z" fill={metalGrad} />
          <path d="M 41 82 L 53 77.5 L 53 86.5 Z" fill={metalGrad} />
          <path d="M 119 82 L 107 77.5 L 107 86.5 Z" fill={metalGrad} />
          {/* Hijr Ismail Marble Semi-Circle Arc */}
          <path
            d="M 55 92 Q 52 103 66 105"
            fill="none"
            stroke={highlight}
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.85"
          />
          {/* Sculpted Architectural Sanctuary Cube */}
          <polygon points="80,58 101,70 80,82 59,70" fill={highlight} opacity="0.96" />
          <polygon points="59,70 80,82 80,106 59,94" fill={metalGrad} stroke={highlight} strokeWidth="0.7" />
          <polygon points="80,82 101,70 101,94 80,106" fill={bevelGrad} stroke={highlight} strokeWidth="0.7" />
          {/* Gilded / Emerald Kiswah Band & Door */}
          <polyline
            points="59,77.5 80,89.5 101,77.5"
            fill="none"
            stroke={gemColor || highlight}
            strokeWidth="2.4"
          />
          <rect x="86" y="88" width="5" height="9" rx="0.8" transform="skewY(-26)" fill={gemColor || highlight} opacity="0.9" />
        </g>
      );

    case 'astrolabe_star':
      return (
        <g>
          {/* Astrolabe Throne (Kursi) & Suspension Ring */}
          <path d="M 71 49 Q 80 41 89 49 Z" fill={metalGrad} stroke={highlight} strokeWidth="0.8" />
          <circle cx="80" cy="42" r="3.2" fill="none" stroke={highlight} strokeWidth="1.6" />
          {/* Mater Outer Altitude Circle */}
          <circle cx="80" cy="83" r="30" fill="none" stroke={metalGrad} strokeWidth="2.2" className={drawClass} />
          <circle cx="80" cy="83" r="24" fill="none" stroke={accentStroke} strokeWidth="1" opacity="0.65" />
          {/* Almucantar Eccentric Sky Circles */}
          <circle cx="80" cy="76" r="16" fill="none" stroke={accentStroke} strokeWidth="1.2" opacity="0.82" />
          <circle cx="80" cy="89" r="11" fill="none" stroke={accentStroke} strokeWidth="1.1" opacity="0.68" />
          {/* Pierced Rete Pointers */}
          <path d="M 55 83 Q 80 65 105 83" fill="none" stroke={highlight} strokeWidth="1.3" opacity="0.78" />
          {/* Rotating Beveled Alidade Pointer */}
          <polygon points="52,98 78,80 108,68 82,86" fill={metalGrad} stroke={highlight} strokeWidth="0.9" />
          {/* Faceted Polar Diamond Heart */}
          <path
            d="M 80 71 L 83.2 79.8 L 92 83 L 83.2 86.2 L 80 95 L 76.8 86.2 L 68 83 L 76.8 79.8 Z"
            fill={gemColor || highlight}
            stroke={highlight}
            strokeWidth="0.9"
          />
          <circle cx="80" cy="83" r="2.6" fill={highlight} />
        </g>
      );

    case 'celestial_prism':
    default:
      return (
        <g>
          {/* 12-Fold Sacred Shamsa Mandala */}
          <polygon
            points="80,46 88,73 115,82 88,91 80,118 72,91 45,82 72,73"
            fill={metalGrad}
            stroke={highlight}
            strokeWidth="1.1"
            className={drawClass}
          />
          <polygon
            points="56,58 79,72 104,58 90,81 104,106 81,92 56,106 70,83"
            fill={bevelGrad}
            opacity="0.85"
            stroke={highlight}
            strokeWidth="0.8"
          />
          <polygon
            points="80,55 96,72 96,92 80,109 64,92 64,72"
            fill="none"
            stroke={highlight}
            strokeWidth="1"
            opacity="0.7"
          />
          {/* Faceted Central Gem */}
          <polygon points="80,68 94,82 80,96 66,82" fill={gemColor || highlight} stroke={highlight} strokeWidth="1.4" />
          <polygon points="80,74 88,82 80,90 72,82" fill={highlight} opacity="0.88" />
        </g>
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
  const idPrefix = `badge-${uid}-${replayKey}`;
  const tierStyle = getBadgeTierStyle(tier, isLightMode);
  const { palette } = tierStyle;

  const isPlatinum = tier === 'platinum';
  const isGold = tier === 'gold';

  const metalGradId = `${idPrefix}-metal`;
  const rimBevelId = `${idPrefix}-bevel`;
  const dishGradId = `${idPrefix}-dish`;
  const sheenGradId = `${idPrefix}-sheen`;
  const clipId = `${idPrefix}-clip`;

  const lockedStroke = isLightMode ? 'rgba(44, 39, 32, 0.34)' : 'rgba(228, 218, 200, 0.32)';
  const lockedFill = isLightMode ? 'rgba(255, 255, 255, 0.38)' : 'rgba(255, 255, 255, 0.04)';

  const drawClass = animated && unlocked ? 'animate-badge-draw' : '';

  return (
    <svg
      key={replayKey}
      width={size}
      height={size}
      viewBox="0 0 160 160"
      aria-hidden="true"
      className={`overflow-visible select-none ${className}`}
    >
      <defs>
        {/* Main Brushed Metallic Gradient */}
        <linearGradient id={metalGradId} x1="14%" y1="8%" x2="88%" y2="92%">
          <stop offset="0%" stopColor={palette.highlight} />
          <stop offset="28%" stopColor={palette.primary} />
          <stop offset="66%" stopColor={palette.secondary} />
          <stop offset="100%" stopColor={palette.rimDark} />
        </linearGradient>

        {/* Counter-Lit 3D Bevel Gradient */}
        <linearGradient id={rimBevelId} x1="86%" y1="88%" x2="14%" y2="12%">
          <stop offset="0%" stopColor={palette.highlight} stopOpacity="0.94" />
          <stop offset="46%" stopColor={palette.primary} stopOpacity="0.88" />
          <stop offset="100%" stopColor={palette.rimDark} stopOpacity="0.96" />
        </linearGradient>

        {/* Recessed Enamel Dish */}
        <radialGradient id={dishGradId} cx="42%" cy="32%" r="72%">
          <stop offset="0%" stopColor={palette.dishTop} />
          <stop offset="100%" stopColor={palette.dishBottom} />
        </radialGradient>

        {/* Diagonal Foil Sheen */}
        <linearGradient id={sheenGradId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="36%" stopColor={palette.highlight} stopOpacity="0.24" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.78" />
          <stop offset="64%" stopColor={palette.highlight} stopOpacity="0.24" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>

        <clipPath id={clipId}>
          <circle cx="80" cy="82" r="64" />
        </clipPath>
      </defs>

      {/* Tier Ambient Aura */}
      {unlocked && (
        <circle
          cx="80"
          cy="82"
          r={isPlatinum ? '74' : isGold ? '70' : '66'}
          fill={palette.glow}
          opacity={animated ? '0.48' : '0.26'}
          style={{ filter: 'blur(9px)' }}
        />
      )}

      {unlocked ? (
        <g>
          {/* Top Medallion Suspension Bail & Jewel Clasp */}
          <g>
            <circle
              cx="80"
              cy="10"
              r="6.2"
              fill="none"
              stroke={`url(#${metalGradId})`}
              strokeWidth="2.6"
            />
            <rect
              x="74"
              y="14"
              width="12"
              height="6"
              rx="2.5"
              fill={`url(#${rimBevelId})`}
              stroke={palette.highlight}
              strokeWidth="0.7"
            />
            {(isGold || isPlatinum) && (
              <circle
                cx="80"
                cy="17"
                r="1.9"
                fill={isPlatinum ? palette.accentGem || '#ffffff' : palette.highlight}
              />
            )}
          </g>

          {/* PLATINUM: Sovereign 8-Point Celestial Star Crest with Faceted Prism Ridges */}
          {isPlatinum && (
            <g className={animated ? 'animate-badge-orbit-cw' : ''} style={{ transformOrigin: '80px 82px' }}>
              <rect
                x="21.5"
                y="23.5"
                width="117"
                height="117"
                rx="12"
                fill={`url(#${rimBevelId})`}
                fillOpacity="0.28"
                stroke={isLightMode ? palette.secondary : `url(#${metalGradId})`}
                strokeWidth="2.4"
              />
              <rect
                x="21.5"
                y="23.5"
                width="117"
                height="117"
                rx="12"
                transform="rotate(45 80 82)"
                fill={`url(#${metalGradId})`}
                fillOpacity="0.22"
                stroke={isLightMode ? palette.rimDark : `url(#${rimBevelId})`}
                strokeWidth="2.4"
              />
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
                const rad = (deg * Math.PI) / 180;
                const x = 80 + Math.cos(rad) * 73.5;
                const y = 82 + Math.sin(rad) * 73.5;
                return (
                  <g key={deg}>
                    <line
                      x1={80 + Math.cos(rad) * 63}
                      y1={82 + Math.sin(rad) * 63}
                      x2={x}
                      y2={y}
                      stroke={palette.highlight}
                      strokeWidth="1.1"
                      opacity="0.7"
                    />
                    <circle
                      cx={x}
                      cy={y}
                      r="3.2"
                      fill={palette.accentGem || palette.highlight}
                      stroke={palette.rimDark}
                      strokeWidth="0.9"
                    />
                  </g>
                );
              })}
            </g>
          )}

          {/* GOLD: Scalloped Mughal Rosette Crest + Filigree Halo */}
          {isGold && (
            <g>
              <g className={animated ? 'animate-badge-orbit-cw' : ''} style={{ transformOrigin: '80px 82px' }}>
                <rect
                  x="25.5"
                  y="27.5"
                  width="109"
                  height="109"
                  rx="14"
                  fill="none"
                  stroke={`url(#${metalGradId})`}
                  strokeWidth="2"
                  opacity="0.78"
                />
                <rect
                  x="25.5"
                  y="27.5"
                  width="109"
                  height="109"
                  rx="14"
                  transform="rotate(45 80 82)"
                  fill="none"
                  stroke={`url(#${rimBevelId})`}
                  strokeWidth="2"
                  opacity="0.78"
                />
              </g>
              <path
                d={GOLD_ROSETTE_PATH}
                fill={`url(#${metalGradId})`}
                stroke={isLightMode ? palette.rimDark : palette.highlight}
                strokeWidth="1.2"
              />
            </g>
          )}

          {/* SILVER: Fluted 24-Ridge Forged Coin Edge */}
          {!isGold && !isPlatinum && (
            <path
              d={SILVER_COIN_PATH}
              fill={`url(#${metalGradId})`}
              stroke={isLightMode ? palette.rimDark : palette.highlight}
              strokeWidth="1.15"
            />
          )}

          {/* PLATINUM Outer Sculpted Rim */}
          {isPlatinum && (
            <circle
              cx="80"
              cy="82"
              r="63.5"
              fill={`url(#${metalGradId})`}
              stroke={isLightMode ? palette.rimDark : palette.highlight}
              strokeWidth="1.35"
            />
          )}

          {/* Recessed Counter-Bevel Ring */}
          <circle
            cx="80"
            cy="82"
            r="56.5"
            fill={`url(#${rimBevelId})`}
            stroke={palette.rimDark}
            strokeOpacity="0.45"
            strokeWidth="0.9"
          />

          {/* Mughal Granulation Pearls Collar (Gold & Platinum) */}
          {(isGold || isPlatinum) && (
            <g opacity="0.88">
              {Array.from({ length: 24 }).map((_, i) => {
                const rad = (i * Math.PI * 2) / 24;
                if (i % 6 === 0) return null;
                return (
                  <circle
                    key={i}
                    cx={80 + Math.cos(rad) * 53.6}
                    cy={82 + Math.sin(rad) * 53.6}
                    r="1.1"
                    fill={palette.highlight}
                  />
                );
              })}
            </g>
          )}

          {/* Rotating Horological Degree Ticks */}
          <g className={animated ? 'animate-badge-orbit-ccw' : ''} style={{ transformOrigin: '80px 82px' }}>
            {Array.from({ length: isPlatinum ? 24 : 18 }).map((_, i) => {
              const total = isPlatinum ? 24 : 18;
              const angle = (i * 360) / total;
              return (
                <line
                  key={i}
                  x1="80"
                  y1="23.5"
                  x2="80"
                  y2={i % 2 === 0 ? '28.5' : '26.8'}
                  stroke={palette.highlight}
                  strokeWidth={i % 2 === 0 ? '1.35' : '0.85'}
                  strokeLinecap="round"
                  opacity="0.78"
                  transform={`rotate(${angle} 80 82)`}
                />
              );
            })}
          </g>

          {/* Enamel Inner Sanctuary Dish */}
          <circle
            cx="80"
            cy="82"
            r="50"
            fill={`url(#${dishGradId})`}
            stroke={`url(#${metalGradId})`}
            strokeWidth="1.8"
          />

          {/* Radial Guilloche Sunburst Engraving Inside Dish */}
          <g opacity={isLightMode ? '0.2' : '0.16'}>
            {Array.from({ length: 16 }).map((_, idx) => {
              const a = (idx * Math.PI * 2) / 16;
              return (
                <line
                  key={idx}
                  x1={80 + Math.cos(a) * 14}
                  y1={82 + Math.sin(a) * 14}
                  x2={80 + Math.cos(a) * 47}
                  y2={82 + Math.sin(a) * 47}
                  stroke={palette.primary}
                  strokeWidth="0.75"
                />
              );
            })}
          </g>

          {/* Delicate Inner Rope-Twist Hairline */}
          <circle
            cx="80"
            cy="82"
            r="45.5"
            fill="none"
            stroke={palette.primary}
            strokeWidth="0.9"
            strokeDasharray="2 2.8"
            opacity="0.52"
          />

          {/* Layered Architectural Centerpiece Artwork */}
          <MotifArtwork
            motif={motif}
            metalGrad={`url(#${metalGradId})`}
            bevelGrad={`url(#${rimBevelId})`}
            accentStroke={palette.primary}
            highlight={palette.highlight}
            gemColor={palette.accentGem}
            dishFill={`url(#${dishGradId})`}
            drawClass={drawClass}
          />

          {/* Animated Metallic Foil Sheen */}
          {showSheen && (
            <g clipPath={`url(#${clipId})`} pointerEvents="none">
              <rect
                x="0"
                y="-10"
                width="76"
                height="185"
                fill={`url(#${sheenGradId})`}
                className={animated ? 'animate-badge-sheen' : ''}
                opacity={animated ? '0.92' : '0.3'}
                transform={animated ? undefined : 'translate(42, 0) skewX(-24)'}
              />
            </g>
          )}

          {/* Cardinal Gemstone Cabochons (Gold & Platinum) */}
          {(isGold || isPlatinum) && (
            <g>
              {[0, 90, 180, 270].map((deg) => {
                const rad = (deg * Math.PI) / 180;
                const cx = 80 + Math.cos(rad) * 56.8;
                const cy = 82 + Math.sin(rad) * 56.8;
                return (
                  <circle
                    key={deg}
                    cx={cx}
                    cy={cy}
                    r="2.6"
                    fill={isPlatinum ? palette.accentGem || '#ffffff' : palette.highlight}
                    stroke={palette.rimDark}
                    strokeWidth="0.65"
                  />
                );
              })}
            </g>
          )}

          {/* Twinkling Starlight Glints */}
          {animated && (
            <g pointerEvents="none">
              <SparkleStar
                cx={24}
                cy={32}
                r={isPlatinum ? 6.5 : isGold ? 5.2 : 4.2}
                fill={palette.highlight}
                delay="0.15s"
                dur="2.6s"
                animated
              />
              <SparkleStar
                cx={136}
                cy={128}
                r={isPlatinum ? 6 : isGold ? 4.8 : 3.8}
                fill={palette.highlight}
                delay="1.05s"
                dur="3.1s"
                animated
              />
              {(isGold || isPlatinum) && (
                <SparkleStar
                  cx={134}
                  cy={30}
                  r={isPlatinum ? 5.2 : 4.2}
                  fill={isPlatinum ? palette.accentGem || palette.highlight : palette.highlight}
                  delay="0.6s"
                  dur="2.8s"
                  animated
                />
              )}
            </g>
          )}
        </g>
      ) : (
        /* Quiet Etched Locked Relief */
        <g opacity="0.62">
          <circle
            cx="80"
            cy="82"
            r="60"
            fill={lockedFill}
            stroke={lockedStroke}
            strokeWidth="1.5"
            strokeDasharray="3 4"
          />
          <circle cx="80" cy="82" r="50" fill="none" stroke={lockedStroke} strokeWidth="1" />
          <MotifArtwork
            motif={motif}
            metalGrad={lockedStroke}
            bevelGrad={lockedStroke}
            accentStroke={lockedStroke}
            highlight={lockedStroke}
            gemColor={lockedStroke}
            dishFill="transparent"
            drawClass=""
          />
        </g>
      )}
    </svg>
  );
};
