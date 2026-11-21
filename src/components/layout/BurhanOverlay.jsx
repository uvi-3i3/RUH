import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ShareIcon,
} from '../icons/Icons';
import { filterBurhansByCategory, resolveBurhanCopy } from '../../utils/devotionLogic';
import {
  buildBurhanMovements,
  formatReadMinutes,
  formatRomanNumeral,
  getBurhanCategoryCounts,
  getCompendiumPosition,
  planBurhanEditorialFlow,
  resolveAdjacentBurhanId,
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
import { resolveBurhanVisual } from '../../data/worldVisualsData';
import fitraNightImg from '../../assets/images/fitra_wisdom_night_1795156409054.jpg';
import fitraDayImg from '../../assets/images/fitra_wisdom_day_1795156408567.jpg';

const FALLBACK_ORIGIN = {
  rect: { left: 120, top: 640, width: 180, height: 110 },
  point: { x: 210, y: 695 },
};

export const BurhanOverlay = ({
  isOpen = false,
  origin = null,
  isClosing = false,
  burhan,
  allBurhans = [],
  burhanNotes = {},
  isLightMode: isLightModeProp,
  isCompleted,
  isSimpleMode: isSimpleModeProp,
  onSaveNote,
  onComplete,
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
  const [showMobileIndex, setShowMobileIndex] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activePremiseIdx, setActivePremiseIdx] = useState(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [noteSavedFeedback, setNoteSavedFeedback] = useState(false);
  const [copiedFeedback, setCopiedFeedback] = useState(false);

  const folioScrollRef = useRef(null);

  useEffect(() => {
    setLocalSimple(isSimpleMode);
  }, [isSimpleMode]);

  useEffect(() => {
    if (effectiveOrigin) {
      setSelectedId(burhan?.id || allBurhans[0]?.id || null);
      setShowMobileIndex(false);
      setActiveCategory('all');
      setActivePremiseIdx(null);
    }
  }, [effectiveOrigin, burhan?.id, allBurhans]);

  const activeBurhan =
    allBurhans.find((b) => b.id === selectedId) || burhan || allBurhans[0] || null;

  useEffect(() => {
    if (activeBurhan) {
      setNoteDraft(burhanNotes[activeBurhan.id] || '');
      setNoteSavedFeedback(false);
      setActivePremiseIdx(null);
      if (folioScrollRef.current) {
        folioScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [activeBurhan?.id, burhanNotes]);

  const categoryCounts = useMemo(() => getBurhanCategoryCounts(allBurhans), [allBurhans]);
  const visibleLibraryItems = useMemo(
    () => filterBurhansByCategory(allBurhans, activeCategory),
    [allBurhans, activeCategory]
  );

  if (!effectiveOrigin || !activeBurhan) return null;

  const handleRequestClose = () => {
    if (isClosing) return;
    hapticDismiss();
    if (onRequestClose) {
      onRequestClose();
    } else {
      onClose?.();
    }
  };

  const isViewingDaily = !burhan || activeBurhan.id === burhan.id;
  const accentHex = isLightMode ? '#0f766e' : '#2dd4bf';
  const accentSoft = isLightMode ? '#115e59' : '#5eead4';
  const textMain = isLightMode ? 'text-[#18211f]' : 'text-[rgba(241,247,245,0.95)]';
  const textSub = isLightMode ? 'text-[#3c4e4a]' : 'text-[rgba(209,226,222,0.74)]';
  const textMuted = isLightMode ? 'text-[#556964]' : 'text-[rgba(191,212,207,0.58)]';
  const hairline = isLightMode ? 'border-[#0f766e]/14' : 'border-white/[0.09]';

  const { paragraphs, question, premises, conclusion } = resolveBurhanCopy(
    activeBurhan,
    localSimple
  );
  const movements = buildBurhanMovements(paragraphs);
  const { leadMovements, closingMovements } = planBurhanEditorialFlow(movements);
  const compendiumPos = getCompendiumPosition(allBurhans, activeBurhan.id);
  const activeVisual = resolveBurhanVisual(activeBurhan);
  const notedCount = Object.values(burhanNotes || {}).filter((v) => String(v || '').trim()).length;

  const handleSaveNote = () => {
    if (!onSaveNote) return;
    hapticSuccess();
    onSaveNote(activeBurhan.id, noteDraft.trim());
    setNoteSavedFeedback(true);
    setTimeout(() => setNoteSavedFeedback(false), 1800);
  };

  const handleStep = (delta) => {
    const pool = visibleLibraryItems.length > 0 ? visibleLibraryItems : allBurhans;
    const nextId = resolveAdjacentBurhanId(pool, activeBurhan.id, delta);
    if (nextId) {
      hapticDetent();
      setSelectedId(nextId);
    }
  };

  const handleShareBurhan = () => {
    hapticTapLight();
    const premiseBlock =
      premises.length > 0
        ? `\n\n${premises.map((p, idx) => `${idx + 1}. ${p}`).join('\n')}${
            conclusion ? `\n∴ ${conclusion}` : ''
          }`
        : '';
    const text = `${activeBurhan.title} — ${activeBurhan.scholar}\n\n${paragraphs.join(
      '\n\n'
    )}${premiseBlock}${question ? `\n\nReflection: ${question}` : ''}\n\n— Shared from Ruh (رُوح)`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ title: `Burhan: ${activeBurhan.title}`, text }).catch(() => {});
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

  const categoryTabs = [
    { key: 'all', label: 'All', count: categoryCounts.all },
    { key: 'islam', label: 'Why Islam', count: categoryCounts.islam },
    { key: 'theism', label: 'Theism', count: categoryCounts.theism },
  ];

  const renderCompendiumList = (onSelectExtra) => (
    <div className="flex flex-col h-full min-h-0">
      <div className={`px-4 pt-4 pb-3 border-b ${hairline} shrink-0`}>
        <div className="flex items-baseline justify-between gap-2 mb-3">
          <div>
            <p className={`font-serif-eng text-[12px] font-semibold ${textMain}`}>
              Compendium of Proofs
            </p>
            <p className={`font-serif-eng text-[11px] tabular-nums ${textMuted}`}>
              {allBurhans.length} treatises · {notedCount} noted
            </p>
          </div>
          <span
            dir="rtl"
            className="font-calligraphy text-[20px] leading-none"
            style={{ color: accentHex }}
          >
            فِطْرَة
          </span>
        </div>

        {/* Category Filter Segmented Control */}
        <div
          role="tablist"
          aria-label="Proof categories"
          className={`grid grid-cols-3 gap-1 p-1 rounded-xl border ${
            isLightMode ? 'bg-[#e6ece8]/80 border-[#0f766e]/12' : 'bg-white/[0.04] border-white/[0.08]'
          }`}
        >
          {categoryTabs.map((tab) => {
            const isActive = activeCategory === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => {
                  hapticDetent();
                  setActiveCategory(tab.key);
                }}
                className={`min-h-[34px] px-2 rounded-lg font-serif-eng text-[11px] whitespace-nowrap cursor-pointer transition-colors ${
                  isActive
                    ? isLightMode
                      ? 'bg-white text-[#0f766e] font-semibold shadow-xs'
                      : 'bg-[#2dd4bf]/18 text-[#5eead4] font-semibold'
                    : `${textSub} hover:opacity-100 opacity-75`
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Scrollable Proofs List */}
      <div className="flex-1 overflow-y-auto hide-scrollbar p-2.5 space-y-1">
        {visibleLibraryItems.map((item) => {
          const globalIndex = allBurhans.findIndex((b) => b.id === item.id) + 1;
          const isSelected = item.id === activeBurhan.id;
          const isTodayItem = burhan && item.id === burhan.id;
          const hasNote = Boolean(burhanNotes[item.id]?.trim());

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                hapticNavigate();
                setSelectedId(item.id);
                onSelectExtra?.();
              }}
              className={`w-full min-h-[64px] px-3.5 py-3 rounded-2xl border text-left flex items-start justify-between gap-3 cursor-pointer transition-all duration-200 ${
                isSelected
                  ? isLightMode
                    ? 'bg-white/95 border-[#0f766e]/40 shadow-xs'
                    : 'bg-[#2dd4bf]/12 border-[#2dd4bf]/40'
                  : isLightMode
                    ? 'bg-transparent border-transparent hover:bg-white/55'
                    : 'bg-transparent border-transparent hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <span
                  className="font-serif-eng text-[11px] font-semibold tabular-nums pt-0.5 w-6 shrink-0"
                  style={{ color: isSelected ? accentHex : undefined }}
                >
                  {formatRomanNumeral(globalIndex)}
                </span>
                <div className="min-w-0">
                  <p className={`font-serif-eng text-[14px] font-medium leading-snug line-clamp-2 ${textMain}`}>
                    {item.title}
                  </p>
                  <p className={`font-serif-eng text-[11px] mt-1 truncate ${textMuted}`}>
                    {item.scholar}
                    {item.readMinutes ? ` · ${formatReadMinutes(item.readMinutes)}` : ''}
                    {isTodayItem ? ' · Featured' : ''}
                  </p>
                </div>
              </div>

              <div className="shrink-0 pt-0.5">
                {hasNote ? (
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
      backgroundColor={isLightMode ? '#f3f1ea' : '#060e10'}
      ariaLabelledBy="burhan-world-heading"
      testId="burhan-overlay"
      onExited={onExited}
    >
      <div className={`relative w-full h-full flex flex-col overflow-hidden ${textMain}`}>
        {/* Bespoke House of Wisdom Atmospheric Backdrop */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden">
          <img
            src={isLightMode ? fitraDayImg : fitraNightImg}
            alt=""
            referrerPolicy="no-referrer"
            className={`w-full h-full object-cover scale-105 transition-opacity duration-500 ${
              isLightMode ? 'opacity-[0.18]' : 'opacity-[0.20]'
            }`}
          />
          <div
            className="absolute inset-0"
            style={{
              background: isLightMode
                ? 'radial-gradient(ellipse 82% 72% at 55% 28%, rgba(248,247,242,0.72) 0%, rgba(241,240,233,0.94) 76%)'
                : 'radial-gradient(ellipse 80% 68% at 54% 24%, rgba(20,92,86,0.22) 0%, rgba(6,14,16,0.92) 74%)',
            }}
          />
        </div>

        {/* ================================================================
            TOP SANCTUARY BAR (56px, clean 3-zone header matching Study tab)
        ================================================================ */}
        <header
          className={`relative z-20 shrink-0 px-4 sm:px-7 pb-2.5 border-b ${hairline} flex items-center justify-between gap-3`}
          style={{
            paddingTop: 'calc(10px + var(--sat))',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            backgroundColor: isLightMode ? 'rgba(245,243,237,0.74)' : 'rgba(6,14,16,0.72)',
          }}
        >
          {/* Left: Back Button */}
          <button
            type="button"
            data-testid="burhan-back"
            aria-label="Back to Sanctuary"
            onClick={handleRequestClose}
            className={`min-h-[40px] pl-2.5 pr-3.5 rounded-full border flex items-center gap-1 font-serif-eng text-[12px] tracking-[0.04em] whitespace-nowrap shrink-0 cursor-pointer transition active:scale-95 ${
              isLightMode
                ? 'bg-white/80 hover:bg-white border-[#0f766e]/22 text-[#18211f]'
                : 'bg-white/[0.06] hover:bg-white/[0.11] border-white/[0.12] text-[#eff7f5]'
            }`}
          >
            <ChevronLeftIcon size={15} style={{ color: accentHex }} />
            <span>Back</span>
          </button>

          {/* Center: World Title + Thin Progress Hairline */}
          <div className="min-w-0 flex-1 max-w-[300px] flex flex-col items-center">
            <div className="flex items-center gap-2 min-w-0">
              <span
                dir="rtl"
                className="font-calligraphy text-[18px] leading-none shrink-0"
                style={{ color: accentHex }}
              >
                بُرْهَان
              </span>
              <span className={`hidden sm:inline font-serif-eng text-[12px] truncate ${textSub}`}>
                House of Reason &amp; Fitrah
              </span>
            </div>
            <div
              className={`w-full max-w-[180px] h-[3px] rounded-full overflow-hidden mt-1.5 ${
                isLightMode ? 'bg-[#0f766e]/14' : 'bg-white/[0.11]'
              }`}
            >
              <div
                className="h-full rounded-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] origin-left"
                style={{
                  backgroundColor: accentHex,
                  transform: `scaleX(${compendiumPos.ratio})`,
                }}
              />
            </div>
          </div>

          {/* Right: Classical/Simple (sm+) + Mobile Index Toggle + Share */}
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
                      ? 'bg-white text-[#18211f] font-semibold shadow-xs'
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
                      ? 'bg-white text-[#18211f] font-semibold shadow-xs'
                      : 'bg-white/15 text-white font-semibold'
                    : `${textSub} opacity-70`
                }`}
              >
                Simple
              </button>
            </div>

            <button
              type="button"
              aria-expanded={showMobileIndex}
              onClick={() => {
                hapticToggle(!showMobileIndex);
                setShowMobileIndex((v) => !v);
              }}
              className={`lg:hidden min-h-[38px] px-3 rounded-xl border font-serif-eng text-[11px] whitespace-nowrap cursor-pointer transition-colors ${
                showMobileIndex
                  ? isLightMode
                    ? 'bg-[#0f766e] border-[#0f766e] text-white font-medium'
                    : 'bg-[#2dd4bf]/20 border-[#2dd4bf]/50 text-[#5eead4] font-medium'
                  : isLightMode
                    ? 'bg-white/75 border-[#0f766e]/20 text-[#18211f]'
                    : 'bg-white/[0.06] border-white/[0.12] text-[#eff7f5]'
              }`}
            >
              {showMobileIndex ? 'Folio' : `Proofs (${allBurhans.length})`}
            </button>

            <button
              type="button"
              aria-label="Share Burhan reflection"
              onClick={handleShareBurhan}
              className={`w-10 h-10 rounded-full border flex items-center justify-center cursor-pointer transition-colors ${
                isLightMode
                  ? 'bg-white/75 hover:bg-white border-[#0f766e]/20 text-[#18211f]'
                  : 'bg-white/[0.06] hover:bg-white/[0.12] border-white/[0.12] text-[#eff7f5]'
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
            MAIN WORKSPACE: PERSISTENT DESKTOP COMPENDIUM RAIL + FOLIO STAGE
        ================================================================ */}
        <div className="relative z-10 flex-1 min-h-0 flex overflow-hidden">
          {/* Desktop Persistent Left Compendium Rail */}
          <aside
            aria-label="Compendium of Rational Proofs"
            className={`hidden lg:flex lg:w-[320px] xl:w-[348px] shrink-0 flex-col border-r ${hairline}`}
            style={{
              backgroundColor: isLightMode ? 'rgba(248,247,242,0.72)' : 'rgba(6,16,18,0.62)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
            }}
          >
            {renderCompendiumList()}
          </aside>

          {/* Mobile Compendium View OR Active Illuminated Monograph Folio */}
          {showMobileIndex ? (
            <div
              className="flex-1 min-h-0 lg:hidden"
              style={{
                backgroundColor: isLightMode ? 'rgba(248,247,242,0.86)' : 'rgba(6,16,18,0.82)',
              }}
            >
              {renderCompendiumList(() => setShowMobileIndex(false))}
            </div>
          ) : (
            <main
              ref={folioScrollRef}
              data-testid="burhan-folio-stage"
              className="flex-1 min-h-0 overflow-y-auto hide-scrollbar px-5 sm:px-10 lg:px-14 py-7 sm:py-10"
            >
              <article className="w-full max-w-[780px] mx-auto pb-8">
                {/* Mobile-Only Clean Reading Mode Bar (keeps mobile top header uncluttered) */}
                <div className="flex sm:hidden items-center justify-center mb-5">
                  <div
                    className={`inline-flex items-center p-0.5 rounded-xl border ${
                      isLightMode ? 'bg-black/[0.04] border-[#0f766e]/15' : 'bg-white/[0.05] border-white/10'
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
                            ? 'bg-white text-[#18211f] font-semibold shadow-xs'
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
                            ? 'bg-white text-[#18211f] font-semibold shadow-xs'
                            : 'bg-white/15 text-white font-semibold'
                          : `${textSub} opacity-75`
                      }`}
                    >
                      Simple
                    </button>
                  </div>
                </div>

                {/* 1. UNBOXED MONOGRAPH MASTHEAD */}
                <div className={`text-center pb-7 mb-8 border-b ${hairline}`}>
                  {activeBurhan.arabicAnchor && (
                    <p
                      dir="rtl"
                      className="font-calligraphy text-[26px] sm:text-[32px] leading-relaxed mb-3"
                      style={{
                        color: accentHex,
                        textShadow: isLightMode ? 'none' : `0 0 32px ${accentHex}30`,
                      }}
                    >
                      {activeBurhan.arabicAnchor}
                    </p>
                  )}

                  {/* Unboxed Editorial Metadata (Zero Pills) */}
                  <div
                    className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 font-serif-eng text-[12px] tracking-[0.04em] mb-3"
                    style={{ color: accentSoft }}
                  >
                    <span>
                      Treatise {formatRomanNumeral(compendiumPos.position)} of {compendiumPos.total}
                    </span>
                    <span className="opacity-45" aria-hidden="true">·</span>
                    <span>{activeBurhan.category === 'islam' ? 'Why Islam' : 'Theism & Fitrah'}</span>
                    {activeBurhan.theme && (
                      <>
                        <span className="opacity-45" aria-hidden="true">·</span>
                        <span>{activeBurhan.theme}</span>
                      </>
                    )}
                  </div>

                  <h1
                    id="burhan-world-heading"
                    className={`font-serif-eng text-[28px] sm:text-[38px] lg:text-[42px] font-semibold leading-[1.15] tracking-[-0.01em] mb-3 ${textMain}`}
                    style={{ textWrap: 'balance' }}
                  >
                    {activeBurhan.title}
                  </h1>

                  <p className={`font-serif-eng italic text-[14px] sm:text-[15.5px] ${textSub}`}>
                    {activeBurhan.scholar}
                    {activeBurhan.readMinutes
                      ? ` · ${formatReadMinutes(activeBurhan.readMinutes)} contemplation`
                      : ''}
                  </p>
                </div>

                {/* 2. OPENING PROSE WITH TRUE-ALPHA INK ENGRAVING WOVEN DIRECTLY IN */}
                <section aria-label="Treatise Opening" className="flow-root mb-9">
                  {activeVisual && (
                    <BookInkIllustration
                      visual={activeVisual}
                      plateNumber={compendiumPos.position}
                      theme="burhan"
                      isLightMode={isLightMode}
                      align="right"
                    />
                  )}

                  {leadMovements.map((mv, idx) => (
                    <p
                      key={mv.index}
                      className={`font-serif-eng text-[16.5px] sm:text-[18px] leading-[1.86] ${
                        idx > 0 ? 'mt-5' : ''
                      } ${
                        isLightMode ? 'text-[#1c2624]' : 'text-[rgba(241,247,245,0.92)] tracking-[0.008em]'
                      } ${
                        mv.isOpening
                          ? `first-letter:text-[3.25rem] first-letter:font-serif-eng first-letter:font-semibold first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:leading-[0.84] ${
                              isLightMode
                                ? 'first-letter:text-[#0f766e]'
                                : 'first-letter:text-[#2dd4bf]'
                            }`
                          : ''
                      }`}
                    >
                      {mv.text}
                    </p>
                  ))}
                </section>

                {/* 3. UNBOXED ARCHITECTURAL DEDUCTIVE PROOF SPINE (HAIRLINE BOUNDED) */}
                {premises.length > 0 && (
                  <section
                    aria-label="Deductive Proof Structure"
                    className={`border-y ${hairline} py-7 my-9`}
                  >
                    <div className="flex items-baseline justify-between gap-2 mb-5">
                      <h2
                        className="font-serif-eng text-[13px] font-semibold tracking-[0.04em]"
                        style={{ color: accentHex }}
                      >
                        Structure of the Proof
                      </h2>
                      <span className={`font-serif-eng text-[11.5px] ${textMuted}`}>
                        Tap a premise to focus
                      </span>
                    </div>

                    <ol className="relative space-y-2.5">
                      {premises.map((premise, idx) => {
                        const isFocused = activePremiseIdx === idx;
                        const isLast = idx === premises.length - 1;
                        return (
                          <li key={idx} className="relative">
                            {!isLast && (
                              <span
                                aria-hidden="true"
                                className="absolute left-[22px] top-[40px] bottom-[-14px] w-[1px]"
                                style={{
                                  backgroundColor: isLightMode
                                    ? 'rgba(15,118,110,0.22)'
                                    : 'rgba(45,212,191,0.25)',
                                }}
                              />
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                hapticTapLight();
                                setActivePremiseIdx((prev) => (prev === idx ? null : idx));
                              }}
                              className={`w-full text-left flex items-start gap-3.5 py-2.5 px-2 rounded-2xl transition-colors duration-200 cursor-pointer ${
                                isFocused
                                  ? isLightMode
                                    ? 'bg-[#0f766e]/[0.07]'
                                    : 'bg-[#2dd4bf]/[0.10]'
                                  : 'bg-transparent hover:bg-current/[0.03]'
                              }`}
                            >
                              <span
                                className={`w-[28px] h-[28px] rounded-full border flex items-center justify-center font-serif-eng text-[11px] font-semibold tabular-nums shrink-0 transition-colors ${
                                  isFocused
                                    ? isLightMode
                                      ? 'bg-[#0f766e] border-[#0f766e] text-white'
                                      : 'bg-[#2dd4bf] border-[#2dd4bf] text-[#041416]'
                                    : isLightMode
                                      ? 'bg-transparent border-[#0f766e]/35 text-[#0f766e]'
                                      : 'bg-transparent border-[#2dd4bf]/35 text-[#5eead4]'
                                }`}
                              >
                                {formatRomanNumeral(idx + 1)}
                              </span>
                              <div className="min-w-0 pt-0.5">
                                <span className={`block font-serif-eng text-[11px] mb-0.5 ${textMuted}`}>
                                  Premise {idx + 1}
                                </span>
                                <p className={`font-serif-eng text-[15px] sm:text-[16px] leading-[1.62] ${textMain}`}>
                                  {premise}
                                </p>
                              </div>
                            </button>
                          </li>
                        );
                      })}
                    </ol>

                    {conclusion && (
                      <div className={`mt-5 pt-4 border-t ${hairline} flex items-start gap-3.5 px-2`}>
                        <span
                          className={`w-[28px] h-[28px] rounded-full flex items-center justify-center font-serif-eng text-[15px] font-semibold shrink-0 ${
                            isLightMode
                              ? 'bg-[#0f766e]/12 text-[#0f766e]'
                              : 'bg-[#2dd4bf]/16 text-[#5eead4]'
                          }`}
                          aria-hidden="true"
                        >
                          ∴
                        </span>
                        <div className="min-w-0">
                          <span
                            className="block font-serif-eng text-[11px] font-semibold mb-0.5"
                            style={{ color: accentHex }}
                          >
                            Therefore · Logical Conclusion
                          </span>
                          <p className={`font-serif-eng text-[15.5px] sm:text-[17px] font-medium leading-[1.6] ${textMain}`}>
                            {conclusion}
                          </p>
                        </div>
                      </div>
                    )}
                  </section>
                )}

                {/* 4. CONTINUING MONOGRAPH SYNTHESIS PROSE */}
                {closingMovements.length > 0 && (
                  <div className="space-y-6 mb-10">
                    {closingMovements.map((mv) => (
                      <div key={mv.index} className="relative">
                        <div className="flex items-center gap-3 mb-2.5">
                          <span
                            className="font-serif-eng text-[11px] font-semibold tabular-nums"
                            style={{ color: accentHex }}
                          >
                            {mv.roman}.
                          </span>
                          <span className={`flex-1 h-[1px] ${isLightMode ? 'bg-[#0f766e]/12' : 'bg-white/[0.08]'}`} />
                        </div>
                        <p
                          className={`font-serif-eng text-[16.5px] sm:text-[18px] leading-[1.86] ${
                            isLightMode ? 'text-[#1c2624]' : 'text-[rgba(241,247,245,0.92)] tracking-[0.008em]'
                          }`}
                        >
                          {mv.text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* 5. UNBOXED CONTEMPLATION COLOPHON & PERSONAL TAKEAWAY */}
                {(question || onSaveNote) && (
                  <section
                    aria-label="Personal Fitrah Reflection"
                    className="pt-2 mt-8"
                  >
                    <BookColophonDivider theme="burhan" isLightMode={isLightMode} className="mb-7" />
                    {question && (
                      <blockquote className="text-center max-w-[640px] mx-auto pb-7 mb-7 border-b border-current/10">
                        <span
                          className="block font-serif-eng text-[12px] font-semibold mb-2"
                          style={{ color: accentHex }}
                        >
                          Question for the Heart
                        </span>
                        <p className={`font-serif-eng italic text-[17.5px] sm:text-[20px] leading-relaxed ${textMain}`}>
                          “{question}”
                        </p>
                      </blockquote>
                    )}

                    {onSaveNote && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label
                            htmlFor="burhan-world-note"
                            className={`font-serif-eng text-[12px] font-medium ${textSub}`}
                          >
                            Your Personal Takeaway
                          </label>
                          {noteSavedFeedback && (
                            <span
                              className="font-serif-eng text-[12px] font-medium"
                              style={{ color: accentHex }}
                            >
                              Saved
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                          <input
                            id="burhan-world-note"
                            type="text"
                            maxLength={220}
                            value={noteDraft}
                            onChange={(e) => setNoteDraft(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveNote();
                            }}
                            placeholder="Write one quiet thought to remember from this proof..."
                            className={`flex-1 min-w-0 min-h-[44px] px-4 rounded-xl border font-serif-eng text-[14px] outline-none transition-colors ${
                              isLightMode
                                ? 'bg-white/75 border-[#0f766e]/20 text-[#18211f] placeholder:text-[#556964]/60 focus:border-[#0f766e]/55'
                                : 'bg-white/[0.04] border-white/12 text-white placeholder:text-white/40 focus:border-[#2dd4bf]/55'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={handleSaveNote}
                            className={`min-h-[44px] px-5 rounded-xl border font-serif-eng text-[13px] font-medium whitespace-nowrap cursor-pointer transition-colors ${
                              isLightMode
                                ? 'bg-[#0f766e] border-[#0f766e] text-white hover:bg-[#0d625b]'
                                : 'bg-[#2dd4bf]/18 border-[#2dd4bf]/45 text-[#5eead4] hover:bg-[#2dd4bf]/26'
                            }`}
                          >
                            Save Note
                          </button>
                        </div>
                      </div>
                    )}
                  </section>
                )}
              </article>
            </main>
          )}
        </div>

        {/* ================================================================
            COMPACT BOTTOM ACTION DOCK (58px — preserves <= 15% mobile sticky cap)
        ================================================================ */}
        {!showMobileIndex && (
          <footer
            className={`relative z-20 shrink-0 px-4 sm:px-7 py-2.5 border-t ${hairline}`}
            style={{
              paddingBottom: 'calc(10px + var(--sab))',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              backgroundColor: isLightMode ? 'rgba(245,243,237,0.82)' : 'rgba(6,14,16,0.82)',
            }}
          >
            <div className="w-full max-w-[920px] mx-auto flex items-center justify-between gap-2.5">
              <button
                type="button"
                aria-label="Previous proof"
                onClick={() => handleStep(-1)}
                className={`min-h-[42px] px-3.5 rounded-xl border flex items-center gap-1.5 font-serif-eng text-[12px] whitespace-nowrap cursor-pointer transition-colors ${
                  isLightMode
                    ? 'bg-white/80 border-[#0f766e]/20 text-[#18211f] hover:bg-white'
                    : 'bg-white/[0.05] border-white/[0.12] text-[#eff7f5] hover:bg-white/[0.1]'
                }`}
              >
                <ChevronLeftIcon size={14} />
                <span className="hidden sm:inline">Previous</span>
              </button>

              {isViewingDaily ? (
                <button
                  type="button"
                  data-testid="burhan-reflect-btn"
                  onClick={() => {
                    if (!isCompleted) {
                      hapticCelebrate();
                      onComplete?.();
                    }
                    handleRequestClose();
                  }}
                  className={`flex-1 max-w-[360px] min-h-[44px] px-5 rounded-xl border flex items-center justify-center gap-2 font-serif-eng text-[13px] font-semibold whitespace-nowrap cursor-pointer transition-all active:scale-[0.985] ${
                    isCompleted
                      ? isLightMode
                        ? 'bg-[#0f766e]/14 border-[#0f766e]/35 text-[#0f766e]'
                        : 'bg-[#2dd4bf]/16 border-[#2dd4bf]/45 text-[#5eead4]'
                      : isLightMode
                        ? 'bg-[#0f766e] border-[#0f766e] text-white hover:bg-[#0d625b]'
                        : 'bg-[#1a8a7e] border-[#5eead4]/40 text-[#f3fbf9] hover:bg-[#20a092]'
                  }`}
                >
                  {isCompleted ? (
                    <>
                      <CheckCircleIcon size={16} />
                      <span>Reflected Today</span>
                    </>
                  ) : (
                    <span>I Have Reflected · +5% Yaqeen</span>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    hapticDetent();
                    setSelectedId(burhan?.id || allBurhans[0]?.id || null);
                  }}
                  className={`flex-1 max-w-[320px] min-h-[44px] px-5 rounded-xl border font-serif-eng text-[13px] font-medium whitespace-nowrap cursor-pointer transition-colors ${
                    isLightMode
                      ? 'bg-white/85 border-[#0f766e]/30 text-[#0f766e] hover:bg-white'
                      : 'bg-[#2dd4bf]/14 border-[#2dd4bf]/40 text-[#5eead4] hover:bg-[#2dd4bf]/22'
                  }`}
                >
                  Return to Today’s Proof
                </button>
              )}

              <button
                type="button"
                aria-label="Next proof"
                onClick={() => handleStep(1)}
                className={`min-h-[42px] px-3.5 rounded-xl border flex items-center gap-1.5 font-serif-eng text-[12px] whitespace-nowrap cursor-pointer transition-colors ${
                  isLightMode
                    ? 'bg-white/80 border-[#0f766e]/20 text-[#18211f] hover:bg-white'
                    : 'bg-white/[0.05] border-white/[0.12] text-[#eff7f5] hover:bg-white/[0.1]'
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
