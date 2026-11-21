import { useEffect, useId, useState } from 'react';
import { formatRomanNumeral } from '../../utils/worldReaderLogic';
import { hapticDismiss, hapticTapLight } from '../../utils/haptics';

const CloseIcon = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

/**
 * Computes the 4x5 SVG feColorMatrix values that convert a black-ink-on-white
 * hand-drawn engraving into TRUE per-pixel alpha transparency tinted to the
 * exact archival ink color for each theme & mode.
 *
 * - White/near-white paper pixels (luminance >= 0.93) -> alpha = 0 (100% transparent)
 * - Crisp black ink strokes -> alpha = 1 in the exact target ink RGB color
 * - Midtone stippling & crosshatching -> smooth anti-aliased partial alpha
 *
 * Works cleanly across any backdrop image, translucent glass folio, or stacking context.
 */
function getInkAlphaMatrix(theme, isLightMode) {
  let r;
  let g;
  let b;
  if (theme === 'burhan') {
    if (isLightMode) {
      // Deep archival teal-charcoal ink on warm alabaster paper
      r = 0.08;
      g = 0.21;
      b = 0.19;
    } else {
      // Luminous soft seafoam-ivory engraving on midnight teal vellum
      r = 0.80;
      g = 0.95;
      b = 0.92;
    }
  } else if (isLightMode) {
    // Warm antique iron-gall sepia ink on warm cream book paper
    r = 0.20;
    g = 0.15;
    b = 0.09;
  } else {
    // Luminous warm antique-gold engraving on celestial midnight indigo
    r = 0.93;
    g = 0.82;
    b = 0.58;
  }

  return [
    `0 0 0 0 ${r}`,
    `0 0 0 0 ${g}`,
    `0 0 0 0 ${b}`,
    '-0.46 -0.46 -0.46 0 1.28',
  ].join(' ');
}

/**
 * Delicate hand-crafted typographic book ornament divider separating monograph
 * movements or reflections like a fine letterpress volume.
 */
export const BookColophonDivider = ({
  theme = 'burhan',
  isLightMode = false,
  className = '',
}) => {
  const accentHex =
    theme === 'burhan'
      ? isLightMode
        ? '#0f766e'
        : '#5eead4'
      : isLightMode
        ? '#8c621c'
        : '#e4be70';

  return (
    <div
      aria-hidden="true"
      className={`flex items-center justify-center gap-3 select-none ${className}`}
      style={{ color: accentHex }}
    >
      <span
        className="h-[1px] w-14 sm:w-20 opacity-30"
        style={{ background: `linear-gradient(90deg, transparent, ${accentHex})` }}
      />
      <svg
        width="26"
        height="14"
        viewBox="0 0 26 14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        className="opacity-65 shrink-0"
      >
        <path d="M13 1.5 L15.5 7 L13 12.5 L10.5 7 Z" />
        <circle cx="13" cy="7" r="1.1" fill="currentColor" stroke="none" />
        <path d="M2 7 C5.5 4.2, 8.2 4.2, 10 7 C8.2 9.8, 5.5 9.8, 2 7 Z" opacity="0.6" />
        <path d="M24 7 C20.5 4.2, 17.8 4.2, 16 7 C17.8 9.8, 20.5 9.8, 24 7 Z" opacity="0.6" />
      </svg>
      <span
        className="h-[1px] w-14 sm:w-20 opacity-30"
        style={{ background: `linear-gradient(90deg, ${accentHex}, transparent)` }}
      />
    </div>
  );
};

/**
 * Seamless hand-drawn book engraving woven directly INTO the prose flow
 * (no separate rectangular card box, background square, or frame).
 *
 * Uses an SVG luminance-to-alpha feColorMatrix filter so pure white paper pixels
 * become 100% transparent alpha while the pen-and-ink linework renders directly
 * on top of the book page in both Daylight and Night modes.
 */
export const BookInkIllustration = ({
  visual,
  plateNumber = 1,
  theme = 'burhan', // 'burhan' | 'miracles'
  isLightMode = false,
  align = 'right', // 'right' | 'left'
  className = '',
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const rawUid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const filterId = `book-ink-alpha-${theme}-${isLightMode ? 'day' : 'night'}-${rawUid}`;

  useEffect(() => {
    setImgFailed(false);
  }, [visual?.src]);

  useEffect(() => {
    if (!isLightboxOpen) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        hapticDismiss();
        setIsLightboxOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [isLightboxOpen]);

  if (!visual) return null;

  const isBurhan = theme === 'burhan';
  const accentHex = isBurhan
    ? isLightMode
      ? '#0f766e'
      : '#5eead4'
    : isLightMode
      ? '#8c621c'
      : '#e4be70';

  const textMain = isLightMode ? 'text-[#1c1a16]' : 'text-[rgba(246,242,234,0.92)]';
  const textSub = isLightMode ? 'text-[#4c453a]' : 'text-[rgba(220,214,202,0.72)]';
  const roman = formatRomanNumeral(plateNumber);
  const colorMatrix = getInkAlphaMatrix(theme, isLightMode);

  const floatClasses =
    align === 'left'
      ? 'relative z-10 mx-auto my-5 w-[228px] max-w-[78%] sm:float-left sm:mr-7 sm:ml-0 sm:mt-1 sm:mb-3 sm:w-[235px] md:w-[258px]'
      : 'relative z-10 mx-auto my-5 w-[228px] max-w-[78%] sm:float-right sm:ml-7 sm:mr-0 sm:mt-1 sm:mb-3 sm:w-[235px] md:w-[258px]';

  const renderSketch = (large = false) => {
    if (imgFailed || !visual.src) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
          <svg
            width="42"
            height="42"
            viewBox="0 0 42 42"
            fill="none"
            stroke={accentHex}
            strokeWidth="1"
            className="opacity-65 mb-2"
            aria-hidden="true"
          >
            <circle cx="21" cy="21" r="16" strokeDasharray="2 2.5" />
            <path d="M21 5 L25 17 L37 21 L25 25 L21 37 L17 25 L5 21 L17 17 Z" />
          </svg>
          <span className={`font-serif-eng italic text-[12px] ${textSub}`}>
            Fig. {roman}
          </span>
        </div>
      );
    }

    return (
      <div
        className={`w-full h-full overflow-hidden ${
          large ? '' : 'transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]'
        }`}
      >
        <img
          src={visual.src}
          alt={visual.alt || visual.figureTitle}
          referrerPolicy="no-referrer"
          loading="eager"
          onError={() => setImgFailed(true)}
          className={`w-full h-full object-contain select-none ${visual.cropClass || ''}`}
          style={{
            filter: `url(#${filterId})`,
            opacity: isLightMode ? 0.92 : 0.90,
          }}
        />
      </div>
    );
  };

  return (
    <>
      {/* Hidden SVG True-Alpha Ink Filter (kept mounted & non-display:none so Chromium applies it cleanly) */}
      <svg
        aria-hidden="true"
        focusable="false"
        className="absolute w-0 h-0 overflow-hidden pointer-events-none"
      >
        <defs>
          <filter id={filterId} colorInterpolationFilters="sRGB">
            <feColorMatrix type="matrix" values={colorMatrix} />
          </filter>
        </defs>
      </svg>

      <figure
        data-testid={`${theme}-visual-plate`}
        className={`${floatClasses} ${className}`}
      >
        {/* True-Transparent Hand-Drawn Ink Sketch Floating Directly on the Page */}
        <button
          type="button"
          aria-label={`Inspect hand-drawn illustration: ${visual.figureTitle}`}
          onClick={() => {
            hapticTapLight();
            setIsLightboxOpen(true);
          }}
          className="group relative block w-full aspect-square cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-current/40 rounded-xl"
        >
          {renderSketch(false)}
        </button>

        {/* Quiet Classic Book Marginalia Caption */}
        <figcaption className="mt-1 px-1 text-center">
          <span
            aria-hidden="true"
            className="block w-8 h-[1px] mx-auto mb-1.5 opacity-35"
            style={{ backgroundColor: accentHex }}
          />
          <p className={`font-serif-eng text-[11.5px] leading-snug ${textMain}`}>
            <span className="italic font-medium" style={{ color: accentHex }}>
              Fig. {roman}
            </span>
            <span className="mx-1.5 opacity-40" aria-hidden="true">·</span>
            <span className="italic">{visual.figureTitle}</span>
          </p>
          {visual.caption && (
            <p className={`font-serif-eng italic text-[11px] leading-[1.48] mt-1 opacity-80 ${textSub}`}>
              {visual.caption}
            </p>
          )}
        </figcaption>
      </figure>

      {/* Full-Scale Archival Sketch Viewer Lightbox */}
      {isLightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Illustration inspection: ${visual.figureTitle}`}
          data-testid="visual-plate-lightbox"
          onClick={() => {
            hapticDismiss();
            setIsLightboxOpen(false);
          }}
          className="fixed inset-0 z-[110] bg-black/80 flex items-center justify-center p-4 sm:p-8"
          style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full max-w-[540px] rounded-[26px] border px-6 py-7 sm:px-9 sm:py-8 text-center ${
              isLightMode
                ? 'bg-[#f6f1e6] border-black/14 shadow-[0_24px_64px_rgba(0,0,0,0.22)]'
                : isBurhan
                  ? 'bg-[#081518] border-[#5eead4]/22 shadow-[0_24px_70px_rgba(0,0,0,0.65)]'
                  : 'bg-[#0b101d] border-[#e4be70]/22 shadow-[0_24px_70px_rgba(0,0,0,0.65)]'
            }`}
          >
            <button
              type="button"
              aria-label="Close illustration view"
              onClick={() => {
                hapticDismiss();
                setIsLightboxOpen(false);
              }}
              className={`absolute top-4 right-4 z-20 w-9 h-9 rounded-full border flex items-center justify-center cursor-pointer transition-colors ${
                isLightMode
                  ? 'bg-black/[0.04] hover:bg-black/[0.08] border-black/12 text-[#1c1a16]'
                  : 'bg-white/[0.06] hover:bg-white/[0.12] border-white/15 text-white'
              }`}
            >
              <CloseIcon size={15} />
            </button>

            <div className="w-full max-w-[380px] aspect-square mx-auto">
              {renderSketch(true)}
            </div>

            <div className="mt-4 pt-4 border-t border-current/10">
              <p className={`font-serif-eng text-[14px] font-medium ${textMain}`}>
                <span className="italic" style={{ color: accentHex }}>
                  Plate {roman}
                </span>
                <span className="mx-2 opacity-40" aria-hidden="true">·</span>
                <span>{visual.figureTitle}</span>
              </p>
              {visual.caption && (
                <p className={`font-serif-eng italic text-[13px] leading-relaxed mt-1.5 ${textSub}`}>
                  {visual.caption}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
