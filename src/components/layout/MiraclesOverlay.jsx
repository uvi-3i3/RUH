import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ShareIcon,
} from '../icons/Icons';
import {
  MIRACLE_CATEGORIES,
  filterMiraclesByCategory,
  getMiracleCategoryCounts,
  resolveAdjacentMiracleId,
  resolveMiracleCopy,
} from '../../utils/miraclesLogic';
import {
  buildMiracleTimeBridge,
  formatRomanNumeral,
  getCompendiumPosition,
} from '../../utils/worldReaderLogic';
import { useOptionalPreferences } from '../../context/sanctuaryStore';
import {
  hapticCelebrate,
  hapticDetent,
  hapticDismiss,
  hapticNavigate,
  hapticSuccess,
  hapticTapLight,
  hapticToggle,
} from '../../utils/haptics';
import { FullScreenWorldShell } from './FullScreenWorldShell';
import { BookColophonDivider, BookInkIllustration } from './BookInkIllustration';
import { resolveMiracleVisual } from '../../data/worldVisualsData';
import observatoryNightImg from '../../assets/images/miracles_observatory_night_1795156410932.jpg';
import observatoryDayImg from '../../assets/images/miracles_observatory_day_1795156411925.jpg';

const FALLBACK_ORIGIN = {
  rect: { left: 210, top: 640, width: 180, height: 110 },
  point: { x: 300, y: 695 },
};

export const MiraclesOverlay = ({
  isOpen = false,
  origin = null,
  isClosing = false,
  featuredMiracle,
  allMiracles = [],
  exploredIds = [],
  isLightMode: isLightModeProp,
  isSimpleMode: isSimpleModeProp,
  onMarkExplored,
  onRequestClose,
  onExited,
  onClose,
}) => {
  const preferencesCtx = useOptionalPreferences();
  const isLightMode = isLightModeProp ?? preferencesCtx?.isLightMode ?? false;
  const isSimpleMode = isSimpleModeProp ?? preferencesCtx?.isSimpleMode ?? false;

  const effectiveOrigin = origin || (isOpen ? FALLBACK_ORIGIN : null);

  const [localSimple, setLocalSimple] = useState(isSimpleMode);
  const [selectedId, setSelectedId] = useState(null);
  const [showMobileAtlas, setShowMobileAtlas] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [copiedFeedback, setCopiedFeedback] = useState(false);

  const stageScrollRef = useRef(null);

  useEffect(() => {
    setLocalSimple(isSimpleMode);
  }, [isSimpleMode]);

  useEffect(() => {
    if (effectiveOrigin) {
      setSelectedId(featuredMiracle?.id || allMiracles[0]?.id || null);
      setShowMobileAtlas(false);
      setActiveCategory('all');
    }
  }, [effectiveOrigin, featuredMiracle?.id, allMiracles]);

  const categoryCounts = useMemo(() => getMiracleCategoryCounts(allMiracles), [allMiracles]);
  const visibleAtlasItems = useMemo(
    () => filterMiraclesByCategory(allMiracles, activeCategory),
    [allMiracles, activeCategory]
  );

  const activeMiracle =
    allMiracles.find((item) => item.id === selectedId) || featuredMiracle || allMiracles[0] || null;

  useEffect(() => {
    if (activeMiracle && stageScrollRef.current) {
      stageScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeMiracle?.id]);

  if (!effectiveOrigin || !activeMiracle) return null;

  const handleRequestClose = () => {
    if (isClosing) return;
    hapticDismiss();
    if (onRequestClose) {
      onRequestClose();
    } else {
      onClose?.();
    }
  };

  const isExplored = exploredIds.includes(activeMiracle.id);
  const exploredCount = exploredIds.filter((id) => allMiracles.some((m) => m.id === id)).length;
  const atlasPos = getCompendiumPosition(allMiracles, activeMiracle.id);
  const timeBridge = buildMiracleTimeBridge(activeMiracle);
  const activeVisual = resolveMiracleVisual(activeMiracle);

  const accentHex = isLightMode ? '#8c621c' : '#e4be70';
  const accentBright = isLightMode ? '#734f14' : '#f1d493';
  const textMain = isLightMode ? 'text-[#1d1810]' : 'text-[rgba(247,242,231,0.95)]';
  const textSub = isLightMode ? 'text-[#4c402e]' : 'text-[rgba(227,216,196,0.74)]';
  const textMuted = isLightMode ? 'text-[#6c5b43]' : 'text-[rgba(212,199,176,0.58)]';
  const hairline = isLightMode ? 'border-[#8c621c]/16' : 'border-[#e4be70]/14';

  const { translation, quranicSign, evidence, reflection } = resolveMiracleCopy(
    activeMiracle,
    localSimple
  );

  const handleStep = (delta) => {
    const pool = visibleAtlasItems.length > 0 ? visibleAtlasItems : allMiracles;
    const nextId = resolveAdjacentMiracleId(pool, activeMiracle.id, delta);
    if (nextId) {
      hapticDetent();
      setSelectedId(nextId);
    }
  };

  const handleShareMiracle = () => {
    hapticTapLight();
    const text = `${activeMiracle.arabicAyah}\n\n"${translation}"\n(${activeMiracle.surahRef})\n\n${activeMiracle.title} — ${activeMiracle.categoryLabel}\n\n${quranicSign}\n\n${evidence}\n\n— Shared from Ruh (رُوح)`;
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ title: `Miracles of the Qur'an: ${activeMiracle.title}`, text }).catch(() => {});
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          hapticSuccess();
          setCopiedFeedback(true);
          setTimeout(() => setCopiedFeedback(false), 1800);
        })
        .catch(() => {});
    }
  };

  const renderSignsAtlas = (onSelectExtra) => (
    <div className="flex flex-col h-full min-h-0">
      <div className={`px-4 pt-4 pb-3 border-b ${hairline} shrink-0`}>
        <div className="flex items-baseline justify-between gap-2 mb-3">
          <div>
            <p className={`font-serif-eng text-[12px] font-semibold ${textMain}`}>
              Atlas of Qur’anic Signs
            </p>
            <p className={`font-serif-eng text-[11px] tabular-nums ${textMuted}`}>
              {exploredCount} of {allMiracles.length} signs reflected
            </p>
          </div>
          <span
            dir="rtl"
            className="font-calligraphy text-[20px] leading-none"
            style={{ color: accentHex }}
          >
            آيَات
          </span>
        </div>

        {/* Discipline Filter Tabs */}
        <div
          role="tablist"
          aria-label="Miracle disciplines"
          className="flex flex-wrap gap-1.5"
        >
          {MIRACLE_CATEGORIES.map((cat) => {
            const active = activeCategory === cat.key;
            const count = categoryCounts[cat.key] || 0;
            return (
              <button
                key={cat.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => {
                  hapticDetent();
                  setActiveCategory(cat.key);
                }}
                className={`min-h-[32px] px-2.5 rounded-lg border font-serif-eng text-[11px] whitespace-nowrap cursor-pointer transition-colors ${
                  active
                    ? isLightMode
                      ? 'bg-[#8c621c] border-[#8c621c] text-white font-medium'
                      : 'bg-[#e4be70]/22 border-[#e4be70]/50 text-[#f1d493] font-medium'
                    : isLightMode
                      ? 'bg-white/65 border-[#8c621c]/16 text-[#4c402e] hover:bg-white'
                      : 'bg-white/[0.04] border-white/[0.09] text-[#e3d8c4]/75 hover:bg-white/[0.08]'
                }`}
              >
                {cat.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Scrollable Signs Catalog */}
      <div className="flex-1 overflow-y-auto hide-scrollbar p-2.5 space-y-1">
        {visibleAtlasItems.map((item) => {
          const globalIndex = allMiracles.findIndex((m) => m.id === item.id) + 1;
          const isSelected = item.id === activeMiracle.id;
          const isItemExplored = exploredIds.includes(item.id);
          const isToday = featuredMiracle && item.id === featuredMiracle.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                hapticNavigate();
                setSelectedId(item.id);
                onSelectExtra?.();
              }}
              className={`w-full min-h-[66px] px-3.5 py-3 rounded-2xl border text-left flex items-start justify-between gap-3 cursor-pointer transition-all duration-200 ${
                isSelected
                  ? isLightMode
                    ? 'bg-white/95 border-[#8c621c]/42 shadow-xs'
                    : 'bg-[#e4be70]/13 border-[#e4be70]/45'
                  : isLightMode
                    ? 'bg-transparent border-transparent hover:bg-white/55'
                    : 'bg-transparent border-transparent hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <span
                  className="font-serif-eng text-[11px] font-semibold tabular-nums pt-0.5 w-7 shrink-0"
                  style={{ color: isSelected ? accentHex : undefined }}
                >
                  {formatRomanNumeral(globalIndex)}
                </span>
                <div className="min-w-0">
                  <p className={`font-serif-eng text-[14px] font-medium leading-snug line-clamp-2 ${textMain}`}>
                    {item.title}
                  </p>
                  <p className={`font-serif-eng text-[11px] mt-1 truncate ${textMuted}`}>
                    {item.categoryLabel} · {item.surahRef}
                    {isToday ? ' · Featured' : ''}
                  </p>
                </div>
              </div>

              <div className="shrink-0 pt-0.5">
                {isItemExplored ? (
                  <CheckCircleIcon size={15} style={{ color: accentHex }} />
                ) : (
                  <ChevronRightIcon size={14} className={`${textMuted} opacity-60`} />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <FullScreenWorldShell
      origin={effectiveOrigin}
      isClosing={isClosing}
      backgroundColor={isLightMode ? '#f5efe3' : '#070a14'}
      ariaLabelledBy="miracles-world-heading"
      testId="miracles-overlay"
      onExited={onExited}
    >
      <div className={`relative w-full h-full flex flex-col overflow-hidden ${textMain}`}>
        {/* Bespoke Celestial Observatory Backdrop (scale-110 crops thin engraving margin cleanly) */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden">
          <img
            src={isLightMode ? observatoryDayImg : observatoryNightImg}
            alt=""
            referrerPolicy="no-referrer"
            className={`w-full h-full object-cover scale-110 transition-opacity duration-500 ${
              isLightMode ? 'opacity-[0.18]' : 'opacity-[0.24]'
            }`}
          />
          <div
            className="absolute inset-0"
            style={{
              background: isLightMode
                ? 'radial-gradient(ellipse 84% 72% at 54% 26%, rgba(250,245,235,0.68) 0%, rgba(245,239,227,0.94) 76%)'
                : 'radial-gradient(ellipse 80% 66% at 54% 22%, rgba(228,190,112,0.12) 0%, rgba(7,10,20,0.90) 74%)',
            }}
          />
        </div>

        {/* ================================================================
            TOP OBSERVATORY BAR (56px, clean 3-zone header matching Study tab)
        ================================================================ */}
        <header
          className={`relative z-20 shrink-0 px-4 sm:px-7 pb-2.5 border-b ${hairline} flex items-center justify-between gap-3`}
          style={{
            paddingTop: 'calc(10px + var(--sat))',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            backgroundColor: isLightMode ? 'rgba(246,240,229,0.78)' : 'rgba(7,10,20,0.74)',
          }}
        >
          {/* Left: Back Button */}
          <button
            type="button"
            data-testid="miracles-back"
            aria-label="Back to Sanctuary"
            onClick={handleRequestClose}
            className={`min-h-[40px] pl-2.5 pr-3.5 rounded-full border flex items-center gap-1 font-serif-eng text-[12px] tracking-[0.04em] whitespace-nowrap shrink-0 cursor-pointer transition active:scale-95 ${
              isLightMode
                ? 'bg-white/82 hover:bg-white border-[#8c621c]/24 text-[#1d1810]'
                : 'bg-white/[0.06] hover:bg-white/[0.11] border-[#e4be70]/22 text-[#f7f2e7]'
            }`}
          >
            <ChevronLeftIcon size={15} style={{ color: accentHex }} />
            <span>Back</span>
          </button>

          {/* Center: World Emblem & Reflected Progress Rule */}
          <div className="min-w-0 flex-1 max-w-[300px] flex flex-col items-center">
            <div className="flex items-center gap-2 min-w-0">
              <span
                dir="rtl"
                className="font-calligraphy text-[18px] leading-none shrink-0"
                style={{ color: accentHex }}
              >
                إِعْجَاز
              </span>
              <span className={`hidden sm:inline font-serif-eng text-[12px] truncate ${textSub}`}>
                Miracles of the Qur’an · {exploredCount}/{allMiracles.length}
              </span>
            </div>
            <div
              className={`w-full max-w-[180px] h-[3px] rounded-full overflow-hidden mt-1.5 ${
                isLightMode ? 'bg-[#8c621c]/16' : 'bg-white/[0.11]'
              }`}
            >
              <div
                className="h-full rounded-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] origin-left"
                style={{
                  backgroundColor: accentHex,
                  transform: `scaleX(${Math.max(0.06, exploredCount / Math.max(1, allMiracles.length))})`,
                }}
              />
            </div>
          </div>

          {/* Right: Classical/Simple (sm+) + Mobile Atlas Switch + Share */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <div
              className={`hidden sm:flex items-center p-0.5 rounded-xl border ${
                isLightMode ? 'bg-black/[0.04] border-black/10' : 'bg-white/[0.05] border-white/10'
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  hapticDetent();
                  setLocalSimple(false);
                }}
                className={`min-h-[34px] px-2.5 rounded-lg font-serif-eng text-[11px] whitespace-nowrap cursor-pointer transition-colors ${
                  !localSimple
                    ? isLightMode
                      ? 'bg-white text-[#1d1810] font-semibold shadow-xs'
                      : 'bg-white/15 text-white font-semibold'
                    : `${textSub} opacity-70`
                }`}
              >
                Classical
              </button>
              <button
                type="button"
                onClick={() => {
                  hapticDetent();
                  setLocalSimple(true);
                }}
                className={`min-h-[34px] px-2.5 rounded-lg font-serif-eng text-[11px] whitespace-nowrap cursor-pointer transition-colors ${
                  localSimple
                    ? isLightMode
                      ? 'bg-white text-[#1d1810] font-semibold shadow-xs'
                      : 'bg-white/15 text-white font-semibold'
                    : `${textSub} opacity-70`
                }`}
              >
                Simple
              </button>
            </div>

            <button
              type="button"
              aria-expanded={showMobileAtlas}
              onClick={() => {
                hapticToggle(!showMobileAtlas);
                setShowMobileAtlas((v) => !v);
              }}
              className={`lg:hidden min-h-[38px] px-3 rounded-xl border font-serif-eng text-[11px] whitespace-nowrap cursor-pointer transition-colors ${
                showMobileAtlas
                  ? isLightMode
                    ? 'bg-[#8c621c] border-[#8c621c] text-white font-medium'
                    : 'bg-[#e4be70]/22 border-[#e4be70]/50 text-[#f1d493] font-medium'
                  : isLightMode
                    ? 'bg-white/75 border-[#8c621c]/22 text-[#1d1810]'
                    : 'bg-white/[0.06] border-[#e4be70]/22 text-[#f7f2e7]'
              }`}
            >
              {showMobileAtlas ? 'Exhibition' : `Signs (${allMiracles.length})`}
            </button>

            <button
              type="button"
              aria-label="Share Qur'an Miracle"
              onClick={handleShareMiracle}
              className={`w-10 h-10 rounded-full border flex items-center justify-center cursor-pointer transition-colors ${
                isLightMode
                  ? 'bg-white/75 hover:bg-white border-[#8c621c]/22 text-[#1d1810]'
                  : 'bg-white/[0.06] hover:bg-white/[0.12] border-[#e4be70]/22 text-[#f7f2e7]'
              }`}
            >
              {copiedFeedback ? (
                <CheckCircleIcon size={15} style={{ color: accentHex }} />
              ) : (
                <ShareIcon size={15} />
              )}
            </button>
          </div>
        </header>

        {/* ================================================================
            MAIN WORKSPACE: PERSISTENT DESKTOP ATLAS RAIL + EXHIBITION STAGE
        ================================================================ */}
        <div className="relative z-10 flex-1 min-h-0 flex overflow-hidden">
          {/* Desktop Persistent Left Signs Atlas Rail */}
          <aside
            aria-label="Atlas of Qur'anic Miracles"
            className={`hidden lg:flex lg:w-[320px] xl:w-[350px] shrink-0 flex-col border-r ${hairline}`}
            style={{
              backgroundColor: isLightMode ? 'rgba(249,244,234,0.74)' : 'rgba(8,12,22,0.66)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
            }}
          >
            {renderSignsAtlas()}
          </aside>

          {/* Mobile Atlas View OR Active Celestial Exhibition Stage */}
          {showMobileAtlas ? (
            <div
              className="flex-1 min-h-0 lg:hidden"
              style={{
                backgroundColor: isLightMode ? 'rgba(249,244,234,0.88)' : 'rgba(8,12,22,0.84)',
              }}
            >
              {renderSignsAtlas(() => setShowMobileAtlas(false))}
            </div>
          ) : (
            <main
              ref={stageScrollRef}
              data-testid="miracles-exhibition-stage"
              className="flex-1 min-h-0 overflow-y-auto hide-scrollbar px-5 sm:px-10 lg:px-14 py-7 sm:py-9"
            >
              <article className="w-full max-w-[780px] mx-auto pb-8">
                {/* Mobile-Only Clean Reading Mode Bar (keeps mobile top header uncluttered) */}
                <div className="flex sm:hidden items-center justify-center mb-4">
                  <div
                    className={`inline-flex items-center p-0.5 rounded-xl border ${
                      isLightMode ? 'bg-black/[0.04] border-[#8c621c]/16' : 'bg-white/[0.05] border-white/10'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        hapticDetent();
                        setLocalSimple(false);
                      }}
                      className={`min-h-[34px] px-3.5 rounded-lg font-serif-eng text-[11.5px] whitespace-nowrap cursor-pointer transition-colors ${
                        !localSimple
                          ? isLightMode
                            ? 'bg-white text-[#1d1810] font-semibold shadow-xs'
                            : 'bg-white/15 text-white font-semibold'
                          : `${textSub} opacity-75`
                      }`}
                    >
                      Classical
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        hapticDetent();
                        setLocalSimple(true);
                      }}
                      className={`min-h-[34px] px-3.5 rounded-lg font-serif-eng text-[11.5px] whitespace-nowrap cursor-pointer transition-colors ${
                        localSimple
                          ? isLightMode
                            ? 'bg-white text-[#1d1810] font-semibold shadow-xs'
                            : 'bg-white/15 text-white font-semibold'
                          : `${textSub} opacity-75`
                      }`}
                    >
                      Simple
                    </button>
                  </div>
                </div>

                {/* 1. UNBOXED ILLUMINATED AYAH MASTHEAD */}
                <header
                  aria-label="Qur'anic Revelation"
                  className="relative pt-1 pb-7 text-center"
                >
                  {/* Soft Atmospheric Zenith Halo (No Rectangular Card Frame) */}
                  <div
                    aria-hidden="true"
                    className="absolute -inset-x-6 -top-4 bottom-0 pointer-events-none"
                    style={{
                      background: `radial-gradient(ellipse 68% 58% at 50% 28%, ${accentHex}${
                        isLightMode ? '14' : '1c'
                      } 0%, transparent 72%)`,
                    }}
                  />

                  <div className="relative z-10 max-w-[660px] mx-auto">
                    {/* Unboxed Accession Line */}
                    <div
                      className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 font-serif-eng text-[12px] tracking-[0.04em] mb-4"
                      style={{ color: accentBright }}
                    >
                      <span>Sign {formatRomanNumeral(atlasPos.position)} of {atlasPos.total}</span>
                      <span className="opacity-45" aria-hidden="true">·</span>
                      <span>{activeMiracle.categoryLabel}</span>
                      <span className="opacity-45" aria-hidden="true">·</span>
                      <span>{activeMiracle.surahRef}</span>
                    </div>

                    <p
                      dir="rtl"
                      className="font-arabic text-[24px] sm:text-[31px] lg:text-[34px] leading-[2.05] mb-3.5"
                      style={{
                        color: accentHex,
                        textShadow: isLightMode ? 'none' : `0 0 36px ${accentHex}34`,
                      }}
                    >
                      {activeMiracle.arabicAyah}
                    </p>

                    <p className={`font-serif-eng italic text-[15.5px] sm:text-[17.5px] leading-relaxed max-w-[600px] mx-auto mb-5 ${textSub}`}>
                      “{translation}”
                    </p>

                    <h1
                      id="miracles-world-heading"
                      className={`font-serif-eng text-[27px] sm:text-[36px] lg:text-[42px] font-semibold leading-[1.14] tracking-[-0.01em] ${textMain}`}
                      style={{ textWrap: 'balance' }}
                    >
                      {activeMiracle.title}
                    </h1>
                  </div>
                </header>

                {/* 2. SLEEK UNBOXED MERIDIAN TIME-BRIDGE & EMPIRICAL ANCHOR */}
                <section
                  aria-label="Historical and Empirical Span"
                  className={`border-y ${hairline} py-4 mb-9`}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-5">
                    <div className="text-center sm:text-left">
                      <span className={`block font-serif-eng text-[11px] ${textMuted}`}>
                        Revealed
                      </span>
                      <span className={`font-serif-eng text-[14.5px] sm:text-[15.5px] font-semibold tabular-nums ${textMain}`}>
                        {timeBridge.revealed}
                      </span>
                    </div>

                    <div className="flex flex-col items-center justify-center gap-1 px-2">
                      <div className="w-full sm:w-[170px] flex items-center gap-2">
                        <span
                          className="flex-1 h-[1px]"
                          style={{
                            background: `linear-gradient(90deg, transparent, ${accentHex}88)`,
                          }}
                        />
                        <span
                          aria-hidden="true"
                          className="text-[11px] leading-none"
                          style={{ color: accentHex }}
                        >
                          ✦
                        </span>
                        <span
                          className="flex-1 h-[1px]"
                          style={{
                            background: `linear-gradient(90deg, ${accentHex}88, transparent)`,
                          }}
                        />
                      </div>
                      <span
                        className="font-serif-eng text-[11px] font-medium whitespace-nowrap tabular-nums"
                        style={{ color: accentBright }}
                      >
                        {timeBridge.spanLabel}
                      </span>
                    </div>

                    <div className="text-center sm:text-right">
                      <span className={`block font-serif-eng text-[11px] ${textMuted}`}>
                        Confirmed
                      </span>
                      <span className={`font-serif-eng text-[14.5px] sm:text-[15.5px] font-semibold tabular-nums ${textMain}`}>
                        {timeBridge.confirmed}
                      </span>
                    </div>
                  </div>

                  {activeMiracle.keyFact && (
                    <p
                      className={`mt-3 pt-3 border-t ${hairline} text-center font-serif-eng text-[13.5px] sm:text-[14.5px] tabular-nums ${textSub}`}
                    >
                      <span className="font-semibold" style={{ color: accentHex }}>
                        Anchor
                      </span>
                      <span className="mx-2 opacity-40" aria-hidden="true">·</span>
                      <span className={textMain}>{activeMiracle.keyFact}</span>
                    </p>
                  )}
                </section>

                {/* 3. CONTINUOUS BROADSHEET PROSE WITH TRUE-ALPHA INK ENGRAVING WOVEN DIRECTLY IN */}
                <section aria-label="Sign and Corroboration" className="flow-root mb-10">
                  {activeVisual && (
                    <BookInkIllustration
                      visual={activeVisual}
                      plateNumber={atlasPos.position}
                      theme="miracles"
                      isLightMode={isLightMode}
                      align="right"
                    />
                  )}

                  {/* Movement I: The Qur'anic Sign */}
                  <div className="mb-7">
                    <div className="flex items-baseline gap-2.5 mb-2.5">
                      <h2
                        className="font-serif-eng text-[13px] font-semibold tracking-[0.04em]"
                        style={{ color: accentHex }}
                      >
                        I. The Qur’anic Sign
                      </h2>
                      <span className={`font-serif-eng text-[11px] ${textMuted}`}>
                        · Scriptural Text
                      </span>
                    </div>
                    <p
                      className={`font-serif-eng text-[16.5px] sm:text-[18px] leading-[1.86] ${
                        isLightMode ? 'text-[#211b12]' : 'text-[rgba(246,241,231,0.93)] tracking-[0.008em]'
                      } first-letter:text-[3.25rem] first-letter:font-serif-eng first-letter:font-semibold first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:leading-[0.84] ${
                        isLightMode
                          ? 'first-letter:text-[#8c621c]'
                          : 'first-letter:text-[#e4be70]'
                      }`}
                    >
                      {quranicSign}
                    </p>
                  </div>

                  {/* Movement II: The Evidence & Discovery */}
                  <div className="pt-1">
                    <div className="flex items-baseline gap-2.5 mb-2.5">
                      <h2
                        className="font-serif-eng text-[13px] font-semibold tracking-[0.04em]"
                        style={{ color: accentHex }}
                      >
                        II. The Evidence &amp; Discovery
                      </h2>
                      <span className={`font-serif-eng text-[11px] ${textMuted}`}>
                        · Corroboration
                      </span>
                    </div>
                    <p
                      className={`font-serif-eng text-[16.5px] sm:text-[18px] leading-[1.86] ${
                        isLightMode ? 'text-[#211b12]' : 'text-[rgba(246,241,231,0.93)] tracking-[0.008em]'
                      }`}
                    >
                      {evidence}
                    </p>
                  </div>
                </section>

                {/* 4. CONTEMPLATION PULL-QUOTE (Ornamental Colophon Framing) */}
                {reflection && (
                  <div className="mt-2">
                    <BookColophonDivider theme="miracles" isLightMode={isLightMode} className="mb-6" />
                    <blockquote
                      className={`max-w-[680px] mx-auto pb-6 px-4 text-center border-b ${hairline}`}
                    >
                    <span
                      className="block font-serif-eng text-[11.5px] font-semibold mb-2"
                      style={{ color: accentHex }}
                    >
                      Quiet Reflection
                    </span>
                    <p className={`font-serif-eng italic text-[17px] sm:text-[20px] leading-relaxed ${textMain}`}>
                      “{reflection}”
                    </p>
                  </blockquote>
                  </div>
                )}
              </article>
            </main>
          )}
        </div>

        {/* ================================================================
            COMPACT BOTTOM EXHIBITION DOCK (58px — preserves <= 15% mobile sticky cap)
        ================================================================ */}
        {!showMobileAtlas && (
          <footer
            className={`relative z-20 shrink-0 px-4 sm:px-7 py-2.5 border-t ${hairline}`}
            style={{
              paddingBottom: 'calc(10px + var(--sab))',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              backgroundColor: isLightMode ? 'rgba(246,240,229,0.84)' : 'rgba(7,10,20,0.84)',
            }}
          >
            <div className="w-full max-w-[920px] mx-auto flex items-center justify-between gap-2.5">
              <button
                type="button"
                aria-label="Previous sign"
                onClick={() => handleStep(-1)}
                className={`min-h-[42px] px-3.5 rounded-xl border flex items-center gap-1.5 font-serif-eng text-[12px] whitespace-nowrap cursor-pointer transition-colors ${
                  isLightMode
                    ? 'bg-white/82 border-[#8c621c]/22 text-[#1d1810] hover:bg-white'
                    : 'bg-white/[0.05] border-[#e4be70]/22 text-[#f7f2e7] hover:bg-white/[0.1]'
                }`}
              >
                <ChevronLeftIcon size={14} />
                <span className="hidden sm:inline">Previous</span>
              </button>

              <button
                type="button"
                data-testid="miracles-reflect-btn"
                onClick={() => {
                  if (!isExplored) {
                    hapticCelebrate();
                    onMarkExplored?.(activeMiracle.id);
                  } else {
                    hapticDetent();
                    handleStep(1);
                  }
                }}
                className={`flex-1 max-w-[360px] min-h-[44px] px-5 rounded-xl border flex items-center justify-center gap-2 font-serif-eng text-[13px] font-semibold whitespace-nowrap cursor-pointer transition-all active:scale-[0.985] ${
                  isExplored
                    ? isLightMode
                      ? 'bg-[#8c621c]/14 border-[#8c621c]/38 text-[#734f14] hover:bg-[#8c621c]/20'
                      : 'bg-[#e4be70]/16 border-[#e4be70]/45 text-[#f1d493] hover:bg-[#e4be70]/24'
                    : isLightMode
                      ? 'bg-[#8c621c] border-[#8c621c] text-white hover:bg-[#734f14]'
                      : 'bg-[#e4be70] border-[#e4be70] text-[#141008] hover:bg-[#f1d493]'
                }`}
              >
                {isExplored ? (
                  <>
                    <CheckCircleIcon size={16} />
                    <span>Reflected · Next Sign</span>
                  </>
                ) : (
                  <span>Mark Sign Reflected · {exploredCount}/{allMiracles.length}</span>
                )}
              </button>

              <button
                type="button"
                aria-label="Next sign"
                onClick={() => handleStep(1)}
                className={`min-h-[42px] px-3.5 rounded-xl border flex items-center gap-1.5 font-serif-eng text-[12px] whitespace-nowrap cursor-pointer transition-colors ${
                  isLightMode
                    ? 'bg-white/82 border-[#8c621c]/22 text-[#1d1810] hover:bg-white'
                    : 'bg-white/[0.05] border-[#e4be70]/22 text-[#f7f2e7] hover:bg-white/[0.1]'
                }`}
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRightIcon size={14} />
              </button>
            </div>
          </footer>
        )}
      </div>
    </FullScreenWorldShell>
  );
};
