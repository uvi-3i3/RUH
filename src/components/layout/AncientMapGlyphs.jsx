import { useState } from 'react';
import artifactSanctuaryImg from '../../assets/images/artifact_islam_sanctuary_1794992475455.jpg';
import artifactDevotionImg from '../../assets/images/artifact_islam_devotion_1794992478727.jpg';
import artifactScriptureImg from '../../assets/images/artifact_iman_scripture_1794992477170.jpg';
import artifactCosmosImg from '../../assets/images/artifact_iman_cosmos_1794992479368.jpg';
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
