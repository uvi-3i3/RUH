import { useMemo, useState } from 'react';
import { ChevronRightIcon } from '../icons/Icons';
import { FullScreenWorldShell } from './FullScreenWorldShell';
import { buildInsightsMenuOptions } from '../../utils/navInsightsLogic';
import { hapticNavigate } from '../../utils/haptics';
import fitraNightImg from '../../assets/images/fitra_wisdom_night_1795156409054.jpg';
import fitraDayImg from '../../assets/images/fitra_wisdom_day_1795156408567.jpg';
import observatoryNightImg from '../../assets/images/miracles_observatory_night_1795156410932.jpg';
import observatoryDayImg from '../../assets/images/miracles_observatory_day_1795156411925.jpg';

const PORTAL_ARTWORK = {
  burhan: {
    numeral: 'I',
    nightImg: fitraNightImg,
    dayImg: fitraDayImg,
    todayLabel: 'Today’s Treatise',
    imgPosition: 'object-[center_36%]',
  },
  miracles: {
    numeral: 'II',
    nightImg: observatoryNightImg,
    dayImg: observatoryDayImg,
    todayLabel: 'Today’s Sign',
    imgPosition: 'object-[center_38%]',
  },
};

/**
 * Full-screen expanding Twin-Portal Gateway launched from the middle Sanctuary
 * navigation bar icon. Showcases Burhan (House of Reason & Fitrah) and Miracles
 * (Atlas of Qur'anic Signs) as two grand full-bleed architectural portals with a
 * "living split" on desktop and a crisp zero-scroll two-tier split on mobile.
 */
export const InsightsGatewayOverlay = ({
  origin = null,
  isClosing = false,
  isSubWorldOpen = false,
  isLightMode = false,
  activeBurhan = null,
  burhanCompleted = false,
  totalBurhans = 0,
  burhanNotes = {},
  activeMiracle = null,
  exploredMiracleIds = [],
  totalMiracles = 0,
  onSelectBurhan,
  onSelectMiracles,
  onExited,
}) => {
  const [hoveredId, setHoveredId] = useState(null);

  const portals = useMemo(
    () =>
      buildInsightsMenuOptions({
        activeBurhan,
        burhanCompleted,
        totalBurhans,
        burhanNotes,
        activeMiracle,
        exploredMiracleIds,
        totalMiracles,
      }),
    [
      activeBurhan,
      burhanCompleted,
      totalBurhans,
      burhanNotes,
      activeMiracle,
      exploredMiracleIds,
      totalMiracles,
    ]
  );

  if (!origin) return null;

  const handleSelectPortal = (portalId, event) => {
    hapticNavigate();
    if (portalId === 'burhan') {
      onSelectBurhan?.(event);
    } else {
      onSelectMiracles?.(event);
    }
  };

  const shellBg = isLightMode ? '#f5f0e7' : '#070b12';

  return (
    <FullScreenWorldShell
      origin={origin}
      isClosing={isClosing}
      zIndexClass="z-[85]"
      backgroundColor={shellBg}
      ariaLabel="Burhan and Miracles Gateway"
      testId="insights-gateway-overlay"
      onExited={onExited}
    >
      <div
        aria-hidden={isSubWorldOpen || undefined}
        inert={isSubWorldOpen}
        className="relative flex-1 min-h-0 flex flex-col overflow-hidden select-none"
      >
        {/* Floating Minimal Top Masthead (Navigated via subtle right-edge Sanctuary nav bar) */}
        <header
          className="absolute top-0 inset-x-0 z-30 pointer-events-none flex items-center justify-center px-4 sm:px-7"
          style={{ paddingTop: 'calc(14px + var(--sat))' }}
        >
          <div className="flex flex-col items-center text-center px-2 min-w-0">
            <span
              dir="rtl"
              lang="ar"
              className={`font-arabic text-[16px] sm:text-[18px] leading-tight whitespace-nowrap ${
                isLightMode ? 'text-[#211a11]' : 'text-[#f5eedf]'
              }`}
              style={{
                textShadow: isLightMode
                  ? '0 1px 12px rgba(251,247,239,0.95), 0 0 22px rgba(251,247,239,0.85)'
                  : '0 2px 14px rgba(4,8,14,0.9), 0 0 24px rgba(4,8,14,0.75)',
              }}
            >
              آيَاتٌ وَبُرْهَان
            </span>
            <span
              className={`font-serif-eng text-[9.5px] sm:text-[10.5px] uppercase tracking-[0.24em] mt-0.5 whitespace-nowrap ${
                isLightMode ? 'text-[#4c3e2a]' : 'text-[#ebe0ca]/84'
              }`}
              style={{
                textShadow: isLightMode
                  ? '0 1px 10px rgba(251,247,239,0.95)'
                  : '0 1px 12px rgba(4,8,14,0.92)',
              }}
            >
              Signs &amp; Proofs
            </span>
          </div>
        </header>

        {/* Living Twin-Portal Canvas (Full-Viewport 2-Row Mobile / 2-Column Desktop) */}
        <div
          className="relative flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden"
          onMouseLeave={() => setHoveredId(null)}
        >
          {portals.map((portal, index) => {
            const isBurhan = portal.id === 'burhan';
            const art = PORTAL_ARTWORK[portal.id];
            const imgSrc = isLightMode ? art.dayImg : art.nightImg;
            const isHovered = hoveredId === portal.id;
            const isSiblingHovered = hoveredId !== null && hoveredId !== portal.id;

            // Living Split flex choreography on desktop (md+); equal 50/50 on mobile
            const desktopFlexClass = isHovered
              ? 'md:flex-[1.16]'
              : isSiblingHovered
                ? 'md:flex-[0.84]'
                : 'md:flex-1';

            const accentColor = isBurhan
              ? isLightMode
                ? '#0f766e'
                : '#5eead4'
              : isLightMode
                ? '#8f621b'
                : '#e8c16f';

            const titleColor = isLightMode
              ? isBurhan
                ? 'text-[#122422]'
                : 'text-[#241a0d]'
              : 'text-[#f7f2e8]';

            const subColor = isLightMode
              ? isBurhan
                ? 'text-[#2a423e]'
                : 'text-[#4c3d28]'
              : 'text-[#e8e2d5]/82';

            const mutedColor = isLightMode
              ? isBurhan
                ? 'text-[#48635e]'
                : 'text-[#6c593e]'
              : 'text-[#dcd4c4]/62';

            const hairlineColor = isLightMode
              ? isBurhan
                ? 'bg-[#0f766e]/22'
                : 'bg-[#8f621b]/24'
              : isBurhan
                ? 'bg-[#5eead4]/22'
                : 'bg-[#e8c16f]/24';

            const scrimStyle = isLightMode
              ? isBurhan
                ? {
                    background:
                      'linear-gradient(180deg, rgba(246,248,246,0.52) 0%, rgba(244,248,246,0.14) 30%, rgba(243,247,245,0.82) 60%, rgba(241,246,244,0.97) 88%)',
                  }
                : {
                    background:
                      'linear-gradient(180deg, rgba(250,245,235,0.50) 0%, rgba(250,245,235,0.14) 30%, rgba(249,243,232,0.82) 60%, rgba(247,240,228,0.97) 88%)',
                  }
              : isBurhan
                ? {
                    background:
                      'linear-gradient(180deg, rgba(5,14,15,0.56) 0%, rgba(5,14,15,0.18) 32%, rgba(6,18,19,0.78) 60%, rgba(5,14,15,0.96) 90%)',
                  }
                : {
                    background:
                      'linear-gradient(180deg, rgba(9,10,20,0.56) 0%, rgba(9,10,20,0.18) 32%, rgba(11,12,24,0.78) 60%, rgba(9,10,20,0.96) 90%)',
                  };

            return (
              <div key={portal.id} className="contents">
                <button
                  type="button"
                  data-testid={`gateway-portal-${portal.id}`}
                  onMouseEnter={() => setHoveredId(portal.id)}
                  onFocus={() => setHoveredId(portal.id)}
                  onBlur={() => setHoveredId((prev) => (prev === portal.id ? null : prev))}
                  onClick={(e) => handleSelectPortal(portal.id, e)}
                  className={`group relative flex-1 min-h-0 min-w-0 ${desktopFlexClass} flex flex-col justify-end text-left overflow-hidden cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-inset ${
                    isBurhan
                      ? 'focus-visible:ring-[#5eead4]/70'
                      : 'focus-visible:ring-[#e8c16f]/70'
                  } transition-[flex-grow] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]`}
                >
                  {/* Full-Bleed Painted Artwork Layer */}
                  <img
                    src={imgSrc}
                    alt=""
                    aria-hidden="true"
                    className={`absolute inset-0 w-full h-full object-cover ${art.imgPosition} pointer-events-none transition-[transform,opacity,filter] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      isHovered
                        ? isLightMode
                          ? 'scale-[1.045] opacity-95'
                          : 'scale-[1.045] opacity-82'
                        : isSiblingHovered
                          ? isLightMode
                            ? 'scale-[1.0] opacity-60 saturate-[0.82]'
                            : 'scale-[1.0] opacity-42 saturate-[0.78]'
                          : isLightMode
                            ? 'scale-[1.01] opacity-82'
                            : 'scale-[1.01] opacity-64'
                    }`}
                  />

                  {/* Velvety Dual-Theme Editorial Scrim */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 pointer-events-none transition-opacity duration-500"
                    style={scrimStyle}
                  />

                  {/* Subtle Luminous Edge Glow on Hover */}
                  <div
                    aria-hidden="true"
                    className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${
                      isHovered ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{
                      boxShadow: isBurhan
                        ? isLightMode
                          ? 'inset 0 0 80px rgba(15,118,110,0.12)'
                          : 'inset 0 0 110px rgba(94,234,212,0.12)'
                        : isLightMode
                          ? 'inset 0 0 80px rgba(143,98,27,0.12)'
                          : 'inset 0 0 110px rgba(232,193,111,0.12)',
                    }}
                  />

                  {/* Foreground Architectural Copy Block */}
                  <div
                    className={`relative z-10 w-full max-w-[540px] mx-auto md:mx-0 pl-6 pr-12 sm:pl-9 sm:pr-14 md:pl-10 md:pr-14 lg:pl-14 lg:pr-16 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1 ${
                      index === 0
                        ? 'pt-[74px] pb-5 md:pt-24 md:pb-12 lg:pb-16'
                        : 'pt-6 pb-[calc(20px+var(--sab))] md:pt-24 md:pb-12 lg:pb-16'
                    }`}
                  >
                    {/* Index & House Subtitle */}
                    <div className="flex items-center gap-2 mb-1.5 md:mb-3">
                      <span
                        className="font-serif-eng text-[10px] sm:text-[11px] uppercase tracking-[0.26em] font-semibold"
                        style={{ color: accentColor }}
                      >
                        {art.numeral}
                      </span>
                      <span
                        aria-hidden="true"
                        className="w-4 h-px opacity-55"
                        style={{ backgroundColor: accentColor }}
                      />
                      <span
                        className="font-serif-eng text-[10px] sm:text-[11px] uppercase tracking-[0.2em]"
                        style={{ color: accentColor }}
                      >
                        {portal.houseLabel}
                      </span>
                    </div>

                    {/* Monumental Title + Arabic Calligraphy */}
                    <div className="flex items-baseline gap-3 sm:gap-4 flex-wrap">
                      <h2
                        className={`font-serif-eng text-[30px] sm:text-[36px] md:text-[46px] lg:text-[54px] font-light leading-[1.02] tracking-[0.02em] ${titleColor}`}
                      >
                        {portal.label}
                      </h2>
                      <span
                        dir="rtl"
                        lang="ar"
                        className="font-arabic text-[24px] sm:text-[28px] md:text-[34px] lg:text-[38px] leading-none opacity-90"
                        style={{ color: accentColor }}
                      >
                        {portal.arabic}
                      </span>
                    </div>

                    {/* Concise Plain-English Description */}
                    <p
                      className={`font-serif-eng text-[13.5px] sm:text-[14.5px] md:text-[16px] leading-[1.45] mt-1.5 md:mt-3 max-w-[44ch] ${subColor}`}
                    >
                      {portal.tagline}
                    </p>

                    {/* Architectural Hairline Divider */}
                    <div className={`h-px w-full mt-3.5 mb-3 md:mt-6 md:mb-5 ${hairlineColor}`} />

                    {/* Today's Featured Piece Whisper */}
                    <div className="flex items-baseline justify-between gap-3">
                      <div className="min-w-0">
                        <span
                          className={`block font-serif-eng text-[9.5px] sm:text-[10px] uppercase tracking-[0.2em] ${mutedColor}`}
                        >
                          {art.todayLabel}
                          {portal.isCompleted ? ` · ${portal.statusLabel}` : ''}
                        </span>
                        <p
                          className={`font-serif-eng text-[14.5px] sm:text-[15.5px] md:text-[17px] leading-snug mt-0.5 truncate ${titleColor}`}
                        >
                          {portal.previewTitle}
                        </p>
                      </div>
                    </div>

                    {/* Progress & Enter Cue */}
                    <div className="flex items-center justify-between gap-4 mt-2.5 md:mt-5">
                      <span
                        className={`font-serif-eng text-[11px] sm:text-[11.5px] tracking-[0.06em] truncate ${mutedColor}`}
                      >
                        {portal.progressLabel}
                      </span>

                      <span
                        className="inline-flex items-center gap-1.5 shrink-0 font-serif-eng text-[11px] sm:text-[12px] uppercase tracking-[0.2em] font-medium transition-colors duration-300"
                        style={{ color: accentColor }}
                      >
                        <span className="border-b border-transparent group-hover:border-current transition-colors duration-300 pb-0.5">
                          {portal.enterLabel}
                        </span>
                        <ChevronRightIcon
                          size={14}
                          className="transition-transform duration-300 ease-out group-hover:translate-x-1.5"
                        />
                      </span>
                    </div>
                  </div>
                </button>

                {/* Living Seam Divider Between Portals (Tracks Flex Split Smoothly) */}
                {index === 0 && (
                  <div
                    aria-hidden="true"
                    className={`relative shrink-0 h-px md:h-full w-full md:w-px z-20 pointer-events-none ${
                      isLightMode ? 'bg-[#3a2d1b]/18' : 'bg-white/18'
                    }`}
                  >
                    <div
                      className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 md:w-8 md:h-8 rounded-full border backdrop-blur-md flex items-center justify-center transition-transform duration-500 ${
                        hoveredId ? 'scale-110' : 'scale-100'
                      } ${
                        isLightMode
                          ? 'bg-[#fbf7ef]/92 border-[#8f621b]/30 text-[#8f621b] shadow-[0_4px_16px_rgba(40,30,12,0.14)]'
                          : 'bg-[#0b0f18]/88 border-[#d2a24b]/35 text-[#e8c16f] shadow-[0_4px_20px_rgba(0,0,0,0.55)]'
                      }`}
                    >
                      <span className="text-[11px] leading-none">✦</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </FullScreenWorldShell>
  );
};
