import { useState } from 'react';
import artifactSanctuaryImg from '../../assets/images/artifact_islam_sanctuary_1794992475455.jpg';
import artifactDevotionImg from '../../assets/images/artifact_islam_devotion_1794992478727.jpg';
import artifactScriptureImg from '../../assets/images/artifact_iman_scripture_1794992477170.jpg';
import artifactCosmosImg from '../../assets/images/artifact_iman_cosmos_1794992479368.jpg';
import ancientMapParchmentBgImg from '../../assets/images/ancient_map_clean_parchment_1795005719348.jpg';
import ancientMapBuildingsImg from '../../assets/images/ancient_map_buildings_sheet_1795003715795.jpg';

const ARTIFACT_SHEET_MAP = {
  sanctuary: artifactSanctuaryImg,
  devotion: artifactDevotionImg,
  scripture: artifactScriptureImg,
  cosmos: artifactCosmosImg,
  buildings: ancientMapBuildingsImg,
};

/**
 * Etched antique brass/sepia SVG fallback icon for each Pillar's ancient artifact
 * (Zero-Broken-Image Policy).
 */
export const EtchedArtifactSvg = ({ id = 'shahadah', isLightMode = false, size = 28 }) => {
  const stroke = isLightMode ? '#5c401c' : '#d4af6a';
  const commonProps = {
    width: size,
    height: size,
    viewBox: '0 0 36 36',
    fill: 'none',
    stroke,
    strokeWidth: '1.5',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };

  switch (id) {
    case 'shahadah':
    case 'iman-allah':
      return (
        <svg {...commonProps} aria-hidden="true">
          <path d="M18 4V9" />
          <path d="M13 9H23L25 16C25 21 22 25 18 27C14 25 11 21 11 16L13 9Z" />
          <path d="M18 14C19.2 15.6 19.5 17.5 18 19C16.5 17.5 16.8 15.6 18 14Z" />
          <path d="M15 27H21L19.5 31H16.5L15 27Z" />
        </svg>
      );
    case 'salah':
      return (
        <svg {...commonProps} aria-hidden="true">
          <path d="M8 30V15C8 9.5 18 5 18 5C18 5 28 9.5 28 15V30" />
          <path d="M12 30V16.5C12 12.5 18 9.5 18 9.5C18 9.5 24 12.5 24 16.5V30" />
          <line x1="6" y1="30" x2="30" y2="30" />
        </svg>
      );
    case 'zakah':
      return (
        <svg {...commonProps} aria-hidden="true">
          <path d="M12 14H24L26 21C26 26 22.5 29 18 29C13.5 29 10 26 10 21L12 14Z" />
          <circle cx="15.5" cy="11" r="2.5" />
          <circle cx="20.5" cy="11" r="2.5" />
          <circle cx="18" cy="8.5" r="2.5" />
        </svg>
      );
    case 'sawm':
      return (
        <svg {...commonProps} aria-hidden="true">
          <path d="M23 9.5C19.5 9.5 16.5 12.5 16.5 16.5C16.5 20.5 19.5 23.5 23 23.5C18.5 24.5 13.5 21.5 13.5 16.5C13.5 11.5 18.5 8.5 23 9.5Z" />
          <ellipse cx="18" cy="27" rx="10" ry="3.5" />
          <line x1="18" y1="12" x2="18" y2="27" />
        </svg>
      );
    case 'hajj':
      return (
        <svg {...commonProps} aria-hidden="true">
          <circle cx="18" cy="19" r="11" />
          <circle cx="18" cy="6" r="2" />
          <polygon points="18,11 21,19 18,27 15,19" />
        </svg>
      );
    case 'iman-books':
      return (
        <svg {...commonProps} aria-hidden="true">
          <path d="M7 12L18 16L29 12L26 22L18 25L10 22L7 12Z" />
          <line x1="18" y1="16" x2="18" y2="25" />
          <path d="M11 29L23 21M25 29L13 21" />
        </svg>
      );
    case 'iman-messengers':
      return (
        <svg {...commonProps} aria-hidden="true">
          <path d="M9 27L25 11L28 8L25 14L12 27H9Z" />
          <rect x="20" y="21" width="9" height="8" rx="2" />
        </svg>
      );
    case 'iman-last-day':
      return (
        <svg {...commonProps} aria-hidden="true">
          <line x1="18" y1="7" x2="18" y2="29" />
          <line x1="9" y1="13" x2="27" y2="13" />
          <path d="M9 13L6 21H12L9 13Z" />
          <path d="M27 13L24 21H30L27 13Z" />
          <line x1="13" y1="29" x2="23" y2="29" />
        </svg>
      );
    case 'iman-angels':
    case 'iman-qadr':
    default:
      return (
        <svg {...commonProps} aria-hidden="true">
          <circle cx="18" cy="19" r="10.5" />
          <circle cx="18" cy="19" r="5.5" />
          <circle cx="18" cy="6.5" r="2" />
          <line x1="11" y1="25" x2="25" y2="13" />
        </svg>
      );
  }
};

/**
 * Framed Ancient Artifact Miniature Thumbnail.
 * Shows the hand-painted watercolor/sepia artifact study for a Pillar or Gate,
 * cropped cleanly to the specific artifact with a subtle museum border.
 */
export const ArtifactVignetteThumbnail = ({
  id,
  sheet = 'sanctuary',
  focus = '50% 50%',
  scale = 200,
  alt = 'Ancient Islamic artifact miniature',
  isDiscovered = false,
  isSelected = false,
  isLightMode = false,
  sizeClass = 'w-14 h-14',
  roundedClass = 'rounded-xl',
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const src = ARTIFACT_SHEET_MAP[sheet] || artifactSanctuaryImg;
  const zoomPercent = Number(scale) > 10 ? Number(scale) : Math.round((Number(scale) || 1.8) * 115);

  const borderClass = isSelected
    ? isLightMode
      ? 'border-[#5c3d16] ring-2 ring-[#7a5420]/35'
      : 'border-[#ebd09a] ring-2 ring-[#d4af6a]/40'
    : isDiscovered
    ? isLightMode
      ? 'border-[#7a5420]/60'
      : 'border-[#d4af6a]/60'
    : isLightMode
    ? 'border-[#7a5420]/28'
    : 'border-[#d4af6a]/28';

  return (
    <div
      role="img"
      aria-label={alt}
      style={
        !imgFailed
          ? {
              backgroundImage: `url(${src})`,
              backgroundSize: `${zoomPercent}%`,
              backgroundPosition: focus,
              backgroundRepeat: 'no-repeat',
              filter: isLightMode
                ? 'sepia(0.05) contrast(1.03)'
                : 'sepia(0.1) brightness(0.95) contrast(1.06)',
            }
          : undefined
      }
      className={`relative shrink-0 overflow-hidden border ${sizeClass} ${roundedClass} ${borderClass} ${
        isLightMode ? 'bg-[#efe5d0]' : 'bg-[#221c15]'
      } shadow-sm transition-transform duration-200`}
    >
      {!imgFailed ? (
        <img
          src={src}
          alt={alt}
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
          className="sr-only"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <EtchedArtifactSvg id={id} isLightMode={isLightMode} size={26} />
        </div>
      )}

      {/* Subtle inner museum frame vignette */}
      <div
        aria-hidden="true"
        className={`absolute inset-0 pointer-events-none ${roundedClass}`}
        style={{
          boxShadow: isLightMode
            ? 'inset 0 0 10px rgba(72, 48, 20, 0.18)'
            : 'inset 0 0 12px rgba(10, 8, 6, 0.45)',
        }}
      />
    </div>
  );
};

/**
 * Hand-Painted Ancient Architectural Landmark Medallion on the Map Canvas:
 * Renders the Courtyard Mosque (Center of Precinct I), House of Wisdom (Center of Precinct II),
 * or Three-Arch Stone Bridge (Center of the River Valley) with its title ribbon cleanly separated below.
 */
export const SanctuaryBuildingMedallion = ({
  title,
  subtitle,
  focus = '22% 22%',
  scale = 215,
  isComplete = false,
  isLightMode = false,
  size = 'large', // 'large' | 'bridge'
  onClick,
  testId,
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const accentHex = isLightMode ? '#6b4718' : '#d4af6a';
  const isBridge = size === 'bridge';

  return (
    <button
      type="button"
      data-testid={testId}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className="group flex flex-col items-center text-center cursor-pointer select-none focus:outline-none"
    >
      <div
        className={`relative rounded-full border-2 overflow-hidden transition-transform duration-300 group-hover:scale-105 ${
          isBridge ? 'w-[64px] h-[64px]' : 'w-[88px] h-[88px]'
        } ${
          isComplete
            ? isLightMode
              ? 'border-[#5c3d16] shadow-[0_10px_28px_rgba(92,61,22,0.28)] ring-4 ring-[#7a5420]/20'
              : 'border-[#ebd09a] shadow-[0_10px_30px_rgba(212,175,106,0.3)] ring-4 ring-[#d4af6a]/20'
            : isLightMode
            ? 'border-[#7a5420]/48 shadow-[0_8px_22px_rgba(62,43,20,0.18)]'
            : 'border-[#d4af6a]/48 shadow-[0_10px_28px_rgba(0,0,0,0.65)]'
        }`}
        style={{
          backgroundColor: isLightMode ? '#f3e9d2' : '#241d15',
          backgroundImage: !imgFailed ? `url(${ancientMapBuildingsImg})` : undefined,
          backgroundSize: `${scale}%`,
          backgroundPosition: focus,
          backgroundRepeat: 'no-repeat',
          filter: isLightMode
            ? 'sepia(0.06) contrast(1.03)'
            : 'sepia(0.14) brightness(0.92) contrast(1.06)',
        }}
      >
        {!imgFailed && (
          <img
            src={ancientMapBuildingsImg}
            alt={title}
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
            className="sr-only"
          />
        )}

        {/* Inner compass bezel ring */}
        <div
          aria-hidden="true"
          className="absolute inset-1 rounded-full border pointer-events-none"
          style={{
            borderColor: isLightMode ? 'rgba(107, 71, 24, 0.24)' : 'rgba(212, 175, 106, 0.28)',
            boxShadow: isLightMode
              ? 'inset 0 0 12px rgba(72, 48, 20, 0.16)'
              : 'inset 0 0 16px rgba(10, 8, 6, 0.55)',
          }}
        />
      </div>

      {/* Cartographer's Scroll Ribbon Cleanly Below the Medallion (No overlap on artwork) */}
      <div
        className={`mt-1 relative z-10 px-2.5 py-0.5 rounded-full border shadow-sm transition-colors ${
          isLightMode
            ? 'bg-[#fbf4e4]/98 border-[#7a5420]/38 text-[#2a1c0e] group-hover:border-[#5c3d16]'
            : 'bg-[#1c1712]/98 border-[#d4af6a]/40 text-[#f2e8d5] group-hover:border-[#ebd09a]'
        }`}
      >
        <span
          className="block font-serif-eng text-[10px] font-semibold leading-tight whitespace-nowrap"
          style={{ color: accentHex }}
        >
          {title}
        </span>
        {subtitle && !isBridge && (
          <span
            className={`block font-serif-eng italic text-[8.5px] leading-tight whitespace-nowrap ${
              isLightMode ? 'text-[#5c472c]' : 'text-[#c4b499]'
            }`}
          >
            {subtitle}
          </span>
        )}
      </div>
    </button>
  );
};

/**
 * Spatial Ancient Cartography Canvas Backdrop (1500 x 1120).
 * Combines our clean, text-free antique parchment map (`ancient_map_clean_parchment`)
 * with wide-spaced Western & Eastern Sanctuary courtyards (separated by a 108px central river valley)
 * and non-overlapping radial courtyard paths.
 */
export const AncientCartographyBackdrop = ({
  isLightMode = false,
  islamComplete = false,
  imanComplete = false,
  hideIslam = false,
  hideIman = false,
  hideCenterAndGate = false,
}) => {
  const [bgFailed, setBgFailed] = useState(false);
  const ink = isLightMode ? '#6b4c24' : '#d4af6a';
  const inkSubtle = isLightMode ? 'rgba(107, 76, 36, 0.22)' : 'rgba(212, 175, 106, 0.18)';
  const inkMedium = isLightMode ? 'rgba(107, 76, 36, 0.38)' : 'rgba(212, 175, 106, 0.34)';
  const precinctFill = isLightMode ? 'rgba(251, 244, 229, 0.76)' : 'rgba(23, 18, 13, 0.74)';

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden">
      {/* 1. Clean Text-Free Hand-Painted Antique Parchment Map Texture */}
      {!bgFailed && (
        <img
          src={ancientMapParchmentBgImg}
          alt=""
          aria-hidden="true"
          referrerPolicy="no-referrer"
          draggable={false}
          onError={() => setBgFailed(true)}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            filter: isLightMode
              ? 'sepia(0.06) contrast(1.02) brightness(0.99)'
              : 'brightness(0.24) sepia(0.55) hue-rotate(-8deg) saturate(1.25) contrast(1.14)',
          }}
        />
      )}

      {/* Warm Atmospheric Candlelight / Vellum Vignette Overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: isLightMode
            ? 'radial-gradient(circle at 25% 54%, rgba(255, 248, 231, 0.45) 0%, transparent 45%), radial-gradient(circle at 75% 54%, rgba(255, 248, 231, 0.45) 0%, transparent 45%), inset 0 0 80px rgba(92, 62, 24, 0.16)'
            : 'radial-gradient(circle at 25% 54%, rgba(212, 175, 106, 0.11) 0%, transparent 44%), radial-gradient(circle at 75% 54%, rgba(212, 175, 106, 0.11) 0%, transparent 44%), radial-gradient(circle at 50% 15%, rgba(212, 175, 106, 0.10) 0%, transparent 32%)',
        }}
      />

      {/* 2. Cartographer's Territory Borders & Non-Overlapping Radial Courtyard Trails */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1500 1120"
        fill="none"
        className="absolute inset-0 w-full h-full"
      >
        {/* Outer Cartographer's Double-Ruled Map Frame */}
        <rect
          x="24"
          y="24"
          width="1452"
          height="1072"
          rx="22"
          stroke={inkMedium}
          strokeWidth="1.5"
        />
        <rect
          x="34"
          y="34"
          width="1432"
          height="1052"
          rx="16"
          stroke={inkSubtle}
          strokeWidth="1"
          strokeDasharray="8 6"
        />

        {/* WESTERN PRECINCT BOUNDARY: THE FIVE PILLARS OF ISLAM (x: 56..696, y: 244..832) */}
        {!hideIslam && (
          <g>
            <rect
              x="56"
              y="244"
              width="640"
              height="588"
              rx="30"
              fill={precinctFill}
              stroke={islamComplete ? ink : inkMedium}
              strokeWidth={islamComplete ? '2.4' : '1.6'}
            />
            <rect
              x="68"
              y="256"
              width="616"
              height="564"
              rx="22"
              stroke={inkSubtle}
              strokeWidth="1"
              strokeDasharray="6 6"
            />

            {/* Radial Courtyard Spokes From Outside Central Mosque (376, 576) to the 5 Pillars */}
            <line x1="376" y1="518" x2="376" y2="432" stroke={inkMedium} strokeWidth="1.4" strokeDasharray="4 4" />
            <line x1="318" y1="576" x2="282" y2="576" stroke={inkMedium} strokeWidth="1.4" strokeDasharray="4 4" />
            <line x1="434" y1="576" x2="470" y2="576" stroke={inkMedium} strokeWidth="1.4" strokeDasharray="4 4" />
            <line x1="324" y1="648" x2="258" y2="720" stroke={inkMedium} strokeWidth="1.4" strokeDasharray="4 4" />
            <line x1="428" y1="648" x2="494" y2="720" stroke={inkMedium} strokeWidth="1.4" strokeDasharray="4 4" />

            {/* Subtle Pentagon Outer Courtyard Path Connecting the 5 Pillars */}
            <polygon
              points="376,396 576,576 548,756 204,756 176,576"
              stroke={inkSubtle}
              strokeWidth="1.1"
              strokeDasharray="5 6"
            />
          </g>
        )}

        {/* EASTERN PRECINCT BOUNDARY: THE SIX PILLARS OF FAITH (x: 804..1444, y: 244..832) */}
        {!hideIman && (
          <g>
            <rect
              x="804"
              y="244"
              width="640"
              height="588"
              rx="30"
              fill={precinctFill}
              stroke={imanComplete ? ink : inkMedium}
              strokeWidth={imanComplete ? '2.4' : '1.6'}
            />
            <rect
              x="816"
              y="256"
              width="616"
              height="564"
              rx="22"
              stroke={inkSubtle}
              strokeWidth="1"
              strokeDasharray="6 6"
            />

            {/* Radial Spokes From Outside House of Wisdom (1124, 576) to the 6 Pillars */}
            <line x1="1072" y1="526" x2="998" y2="432" stroke={inkMedium} strokeWidth="1.4" strokeDasharray="4 4" />
            <line x1="1176" y1="526" x2="1250" y2="432" stroke={inkMedium} strokeWidth="1.4" strokeDasharray="4 4" />
            <line x1="1066" y1="576" x2="1030" y2="576" stroke={inkMedium} strokeWidth="1.4" strokeDasharray="4 4" />
            <line x1="1182" y1="576" x2="1218" y2="576" stroke={inkMedium} strokeWidth="1.4" strokeDasharray="4 4" />
            <line x1="1072" y1="648" x2="998" y2="720" stroke={inkMedium} strokeWidth="1.4" strokeDasharray="4 4" />
            <line x1="1176" y1="648" x2="1250" y2="720" stroke={inkMedium} strokeWidth="1.4" strokeDasharray="4 4" />

            {/* Subtle Hexagon Outer Courtyard Path Connecting the 6 Pillars */}
            <polygon
              points="948,396 1300,396 1324,576 1300,756 948,756 924,576"
              stroke={inkSubtle}
              strokeWidth="1.1"
              strokeDasharray="5 6"
            />
          </g>
        )}

        {/* East-West Bridge Path & Northern Convergence Paths */}
        {!hideCenterAndGate && (
          <>
            <line
              x1="696"
              y1="576"
              x2="804"
              y2="576"
              stroke={ink}
              strokeWidth="2"
              strokeDasharray="4 4"
            />
            <path
              d="M 376 244 C 376 184, 480 152, 540 148"
              stroke={islamComplete ? ink : inkMedium}
              strokeWidth={islamComplete ? '2.5' : '1.6'}
              strokeDasharray={islamComplete ? 'none' : '6 6'}
            />
            <path
              d="M 1124 244 C 1124 184, 1020 152, 960 148"
              stroke={imanComplete ? ink : inkMedium}
              strokeWidth={imanComplete ? '2.5' : '1.6'}
              strokeDasharray={imanComplete ? 'none' : '6 6'}
            />
          </>
        )}
      </svg>
    </div>
  );
};
