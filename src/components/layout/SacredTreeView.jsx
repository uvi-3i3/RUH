import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { usePreferences } from '../../context/sanctuaryStore';
import {
  FAITH_ROOTS,
  ISLAM_PILLARS,
  SACRED_KNOWLEDGE_WISDOM,
  SACRED_TREE_VERSE,
} from '../../data/sacredTreeData';
import {
  computeSacredTreeProgress,
  getAdjacentSacredNodes,
  getSacredNodeById,
} from '../../utils/sacredTreeLogic';
import { SacredLessonFolio } from './SacredLessonFolio';
import { ChevronLeftIcon, ChevronRightIcon, MoonIcon, SunIcon } from '../icons/Icons';
import sacredNightArt from '../../assets/images/sacred_tree_sanctuary_night_1794915113559.jpg';
import sacredDaylightArt from '../../assets/images/sacred_tree_sanctuary_daylight_1794915112786.jpg';
import {
  hapticCelebrate,
  hapticDetent,
  hapticDismiss,
  hapticNavigate,
  hapticSuccess,
  hapticUndo,
} from '../../utils/haptics';

// Lush olive & fig botanical leaf sprigs adorning the canopy boughs
const CANOPY_LEAF_CLUSTERS = [
  { x: 152, y: 214, rot: -38, scale: 1.05 },
  { x: 118, y: 202, rot: -22, scale: 0.95 },
  { x: 174, y: 152, rot: -44, scale: 1.1 },
  { x: 146, y: 116, rot: -32, scale: 0.98 },
  { x: 210, y: 196, rot: 0, scale: 1.08 },
  { x: 210, y: 98, rot: 0, scale: 1.1 },
  { x: 246, y: 152, rot: 44, scale: 1.1 },
  { x: 274, y: 116, rot: 32, scale: 0.98 },
  { x: 268, y: 214, rot: 38, scale: 1.05 },
  { x: 302, y: 202, rot: 22, scale: 0.95 },
  { x: 162, y: 236, rot: -62, scale: 0.85 },
  { x: 258, y: 236, rot: 62, scale: 0.85 },
];

// Fine subterranean capillary rootlets weaving deep into the earth
const ROOTLET_PATHS = [
  'M 142 329 C 122 338, 106 328, 92 332',
  'M 164 368 C 142 384, 128 380, 114 394',
  'M 210 398 C 194 416, 178 426, 166 442',
  'M 210 398 C 226 416, 242 426, 254 442',
  'M 256 368 C 278 384, 292 380, 306 394',
  'M 278 329 C 298 338, 314 328, 328 332',
  'M 136 396 C 122 406, 114 418, 102 424',
  'M 284 396 C 298 406, 306 418, 318 424',
];

// Subtle fixed stars crowning the celestial Mihrab canopy
const KNOWLEDGE_STARS = [
  { x: 48, y: 60, r: 1.15 },
  { x: 96, y: 36, r: 0.95 },
  { x: 184, y: 28, r: 1.25 },
  { x: 236, y: 28, r: 0.95 },
  { x: 326, y: 40, r: 1.15 },
  { x: 374, y: 74, r: 1.0 },
  { x: 34, y: 132, r: 0.9 },
  { x: 388, y: 146, r: 1.0 },
];

export const SacredTreeView = ({
  currentView,
  completedNodeIds = [],
  studiedFiqhIds = [],
  onToggleNode,
  onToggleFiqhBranch,
  onExit,
  onToggleLightMode,
}) => {
  const { isLightMode } = usePreferences();
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'faith' | 'islam'
  const [activeNodeId, setActiveNodeId] = useState('iman_allah');
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);

  const isVisible = currentView === 'learn';

  const completedSet = useMemo(() => new Set(completedNodeIds), [completedNodeIds]);
  const studiedFiqhSet = useMemo(() => new Set(studiedFiqhIds), [studiedFiqhIds]);

  const progress = useMemo(
    () => computeSacredTreeProgress(completedNodeIds, studiedFiqhIds),
    [completedNodeIds, studiedFiqhIds]
  );

  useEffect(() => {
    if (!isVisible) {
      setIsMobileModalOpen(false);
    }
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return undefined;
    const onKeyDown = (e) => {
      if (e.key !== 'Escape') return;
      if (isMobileModalOpen) {
        hapticDismiss();
        setIsMobileModalOpen(false);
      } else if (onExit) {
        hapticDismiss();
        onExit();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isVisible, isMobileModalOpen, onExit]);

  const activeNode = useMemo(
    () => getSacredNodeById(activeNodeId) || FAITH_ROOTS[0],
    [activeNodeId]
  );

  const { prevNode, nextNode } = useMemo(
    () => getAdjacentSacredNodes(activeNode?.id),
    [activeNode?.id]
  );

  const handleSelectNode = (nodeId, openModalOnMobile = true) => {
    hapticNavigate();
    setActiveNodeId(nodeId);
    const isMobileViewport = typeof window === 'undefined' || window.innerWidth < 1024;
    if (openModalOnMobile && isMobileViewport) {
      setIsMobileModalOpen(true);
    }
  };

  const handleToggleMastery = (nodeId) => {
    if (!nodeId) return;
    const wasDone = completedSet.has(nodeId);
    if (wasDone) {
      hapticUndo();
    } else if (progress.completedTotalCount + 1 >= progress.totalCount) {
      hapticCelebrate();
    } else {
      hapticSuccess();
    }
    onToggleNode?.(nodeId);
  };

  const goldStroke = isLightMode ? '#976e28' : '#d6a953';
  const emeraldStroke = isLightMode ? '#0f766e' : '#32c7b3';
  const mutedStroke = isLightMode ? 'rgba(60,44,24,0.16)' : 'rgba(226,210,180,0.15)';
  const labelStrokeBg = isLightMode ? 'rgba(244,239,228,0.92)' : 'rgba(4,9,18,0.94)';

  const textMain = isLightMode ? 'text-[#1c1813]' : 'text-[#f3ecdc]';
  const textSub = isLightMode ? 'text-[#463d31]' : 'text-[#e2d8c5]/78';
  const textMuted = isLightMode ? 'text-[#746652]' : 'text-[#e2d8c5]/52';
  const hairline = isLightMode ? 'border-[#8f6c2c]/[0.16]' : 'border-[#d2a24b]/[0.14]';

  const dimBranches = filterMode === 'faith';
  const dimRoots = filterMode === 'islam';

  return (
    <>
      {/* --- DIMENSIONAL PORTAL LAYER: SANCTUARY OF SACRED KNOWLEDGE (Bab al-Ilm) --- */}
      <div
        aria-hidden={!isVisible}
        className="fixed inset-0 z-40 h-[100dvh] w-full overflow-hidden transition-[opacity,transform,visibility] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          opacity: isVisible ? 1 : 0,
          visibility: isVisible ? 'visible' : 'hidden',
          transform: isVisible ? 'scale(1)' : 'scale(0.965)',
          pointerEvents: isVisible ? 'auto' : 'none',
        }}
      >
        {/* Base Atmosphere Layer */}
        <div
          className="absolute inset-0 pointer-events-none transition-colors duration-500"
          style={{
            backgroundColor: isLightMode ? '#f2ebdc' : '#030812',
          }}
        />

        {/* Hand-Painted Nocturnal Sanctuary / Illuminated Vellum Backdrop Art (vignetted cleanly) */}
        <img
          src={isLightMode ? sacredDaylightArt : sacredNightArt}
          alt=""
          aria-hidden="true"
          referrerPolicy="no-referrer"
          className={`absolute inset-0 w-full h-full object-cover pointer-events-none select-none transition-opacity duration-700 ${
            isLightMode ? 'scale-[1.34] opacity-[0.42]' : 'scale-[1.16] opacity-[0.38]'
          }`}
        />

        {/* Feathered Radial Contrast Scrim ensuring effortless legibility & zero outer border seams */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: isLightMode
              ? 'radial-gradient(ellipse 72% 65% at 50% 48%, rgba(247,242,231,0.36) 0%, rgba(242,235,220,0.78) 68%, rgba(235,226,208,0.96) 100%)'
              : 'radial-gradient(ellipse 70% 62% at 36% 46%, rgba(16,44,52,0.18) 0%, rgba(4,9,19,0.76) 66%, rgba(3,7,15,0.96) 100%)',
          }}
        />

        {/* Non-Scrollable Single-Screen Sanctuary Stage (zero side nav bar, zero window scroll) */}
        <div
          data-testid="sacred-tree-stage"
          className="relative z-10 w-full h-full flex flex-col overflow-hidden px-4 sm:px-8 lg:px-12"
          style={{
            paddingTop: 'calc(12px + var(--sat))',
            paddingBottom: 'calc(12px + var(--sab))',
          }}
        >
          <div className="w-full max-w-[1180px] mx-auto h-full flex flex-col min-h-0">
            {/* --- 1. SELF-CONTAINED PORTAL TOP BAR --- */}
            <header className={`shrink-0 grid grid-cols-[auto_1fr_auto] items-center gap-2 pb-2.5 border-b ${hairline}`}>
              <button
                type="button"
                aria-label="Return to Sanctuary"
                onClick={() => {
                  hapticDismiss();
                  onExit?.();
                }}
                className={`min-h-[44px] px-2.5 -ml-2 rounded-full flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] font-semibold cursor-pointer transition-opacity hover:opacity-100 ${
                  isLightMode
                    ? 'text-[#3b342b]/82 hover:bg-black/[0.04]'
                    : 'text-[#e2d8c5]/78 hover:bg-white/[0.05]'
                }`}
              >
                <ChevronLeftIcon size={15} />
                <span className="hidden sm:inline">Sanctuary</span>
                <span className="sm:hidden">Return</span>
              </button>

              <div className="min-w-0 flex flex-col items-center text-center">
                <div className="flex items-center justify-center gap-2 sm:gap-2.5 flex-wrap">
                  <span
                    className="font-calligraphy text-[21px] sm:text-[25px] leading-none"
                    style={{ color: goldStroke }}
                    dir="rtl"
                  >
                    شَجَرَةُ العِلْم
                  </span>
                  <span aria-hidden="true" className={textMuted}>
                    ·
                  </span>
                  <span
                    className="font-arabic text-[15px] sm:text-[17px] leading-none opacity-85"
                    style={{ color: emeraldStroke }}
                    dir="rtl"
                  >
                    {SACRED_KNOWLEDGE_WISDOM.duaArabic}
                  </span>
                </div>

                <div
                  className={`flex items-center justify-center gap-x-1.5 sm:gap-x-2 mt-1 text-[9.5px] sm:text-[10px] uppercase tracking-[0.14em] sm:tracking-[0.18em] font-semibold whitespace-nowrap ${textSub}`}
                >
                  <span className="hidden sm:inline">{progress.rank.title}</span>
                  <span aria-hidden="true" className={`hidden sm:inline ${textMuted}`}>
                    ·
                  </span>
                  <span className="tabular-nums" style={{ color: goldStroke }}>
                    {progress.completedTotalCount}/{progress.totalCount} Illuminated
                  </span>
                  <span aria-hidden="true" className={textMuted}>
                    ·
                  </span>
                  <span className="tabular-nums" style={{ color: emeraldStroke }}>
                    {progress.studiedFiqhCount}/{progress.totalFiqhCount} Fiqh
                  </span>
                </div>
              </div>

              <button
                type="button"
                aria-label={isLightMode ? 'Switch to Night Mode' : 'Switch to Daylight Mode'}
                onClick={() => onToggleLightMode?.()}
                className={`min-w-[44px] min-h-[44px] -mr-2 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-105 ${
                  isLightMode
                    ? 'text-[#976e28] hover:bg-[#976e28]/10'
                    : 'text-[#e2d8c5]/78 hover:bg-white/[0.06] hover:text-[#e2d8c5]'
                }`}
              >
                {isLightMode ? <SunIcon size={16} /> : <MoonIcon size={16} />}
              </button>
            </header>

            {/* --- 2. FIXED-VIEWPORT SANCTUARY STAGE (NO BOXES AROUND THE TREE, ZERO PAGE SCROLL) --- */}
            <div className="flex-1 min-h-0 pt-2.5 grid grid-cols-1 lg:grid-cols-[minmax(0,1.14fr)_minmax(380px,0.86fr)] gap-3 lg:gap-7 items-stretch">
              {/* LEFT / MAIN STAGE: OPEN LIVING TREE BLOOMING IN THE GARDEN */}
              <div className="flex flex-col h-full min-h-0 min-w-0">
                {/* Architectural Underline Lens Tabs (zero grey segmented box) */}
                <div
                  role="tablist"
                  aria-label="Sacred Tree Lens"
                  className={`shrink-0 grid grid-cols-3 border-b ${hairline}`}
                >
                  {[
                    { id: 'all', mobileLabel: 'All', label: 'Full Tree', count: `${progress.completedTotalCount}/11` },
                    { id: 'faith', mobileLabel: '6 Faith', label: '6 Faith · Roots', count: `${progress.completedFaithCount}/6` },
                    { id: 'islam', mobileLabel: '5 Pillars', label: '5 Pillars · Boughs', count: `${progress.completedIslamCount}/5` },
                  ].map((tab) => {
                    const active = filterMode === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => {
                          hapticDetent();
                          setFilterMode(tab.id);
                        }}
                        className={`relative min-h-[40px] px-1.5 sm:px-2 py-2 flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer transition-colors whitespace-nowrap ${
                          active ? textMain : `${textMuted} hover:opacity-90`
                        }`}
                      >
                        <span className="sm:hidden text-[10px] uppercase tracking-[0.1em] font-semibold">
                          {tab.mobileLabel}
                        </span>
                        <span className="hidden sm:inline text-[10.5px] uppercase tracking-[0.14em] font-semibold">
                          {tab.label}
                        </span>
                        <span
                          className="text-[9.5px] sm:text-[10px] tabular-nums font-semibold"
                          style={active ? { color: goldStroke } : undefined}
                        >
                          {tab.count}
                        </span>
                        {active && (
                          <span
                            aria-hidden="true"
                            className="absolute bottom-[-1px] left-4 right-4 h-[1.5px] rounded-full"
                            style={{ backgroundColor: goldStroke }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Open Celestial Mihrab & Botanical Tree Canvas (No outer rectangle box!) */}
                <div className="flex-1 min-h-0 flex flex-col justify-between py-1 sm:py-2 relative">
                  <div className="flex-1 min-h-0 flex items-center justify-center overflow-hidden">
                    <svg
                      viewBox="0 0 420 524"
                      preserveAspectRatio="xMidYMid meet"
                      className="w-full h-full max-h-full select-none"
                      role="img"
                      aria-label="Symbolic Tree of Knowledge: 5 Pillars of Islam as ascending boughs and 6 Articles of Faith as deep roots"
                    >
                      <defs>
                        <radialGradient id="canopyCosmosAura" cx="50%" cy="28%" r="48%">
                          <stop
                            offset="0%"
                            stopColor={emeraldStroke}
                            stopOpacity={isLightMode ? '0.16' : '0.24'}
                          />
                          <stop
                            offset="58%"
                            stopColor={goldStroke}
                            stopOpacity={isLightMode ? '0.07' : '0.1'}
                          />
                          <stop offset="100%" stopColor={goldStroke} stopOpacity="0" />
                        </radialGradient>

                        <radialGradient id="rootsEarthAura" cx="50%" cy="76%" r="46%">
                          <stop
                            offset="0%"
                            stopColor={goldStroke}
                            stopOpacity={isLightMode ? '0.17' : '0.22'}
                          />
                          <stop offset="100%" stopColor={goldStroke} stopOpacity="0" />
                        </radialGradient>
                      </defs>

                      {/* Cosmic Stars Crowning the Canopy */}
                      {KNOWLEDGE_STARS.map((star, idx) => (
                        <circle
                          key={`star_${idx}`}
                          cx={star.x}
                          cy={star.y}
                          r={star.r}
                          fill={goldStroke}
                          opacity={isLightMode ? 0.36 : 0.48}
                        />
                      ))}

                      {/* Atmospheric Aura Halos */}
                      <ellipse cx="210" cy="144" rx="185" ry="125" fill="url(#canopyCosmosAura)" />
                      <ellipse cx="210" cy="392" rx="175" ry="118" fill="url(#rootsEarthAura)" />

                      {/* Heirloom Double Islamic Pointed Mihrab Archway */}
                      <path
                        d="M 24 498 L 24 196 C 24 88, 114 26, 210 12 C 306 26, 396 88, 396 196 L 396 498"
                        fill="none"
                        stroke={goldStroke}
                        strokeOpacity={isLightMode ? '0.24' : '0.22'}
                        strokeWidth="1.05"
                      />
                      <path
                        d="M 34 494 L 34 200 C 34 98, 120 40, 210 26 C 300 40, 386 98, 386 200 L 386 494"
                        fill="none"
                        stroke={emeraldStroke}
                        strokeOpacity={isLightMode ? '0.15' : '0.14'}
                        strokeWidth="0.75"
                        strokeDasharray="3 5"
                      />
                      {/* Crown Apex Finial (Alif / Jewel) */}
                      <polygon
                        points="210,5 214,12 210,19 206,12"
                        fill={goldStroke}
                        fillOpacity={isLightMode ? '0.52' : '0.62'}
                      />

                      {/* Subtle Celestial Astrolabe Compass Behind the Trunk */}
                      <g opacity={isLightMode ? '0.22' : '0.2'}>
                        <circle
                          cx="210"
                          cy="268"
                          r="122"
                          fill="none"
                          stroke={goldStroke}
                          strokeWidth="0.8"
                          strokeDasharray="2 6"
                        />
                        <circle
                          cx="210"
                          cy="268"
                          r="74"
                          fill="none"
                          stroke={emeraldStroke}
                          strokeWidth="0.75"
                          strokeDasharray="4 6"
                        />
                      </g>

                      {/* Decorative Canopy Veil & Hand-Drawn Botanical Leaf Fronds */}
                      <g
                        style={{
                          opacity: dimBranches ? 0.2 : 1,
                          transition: 'opacity 350ms ease',
                        }}
                      >
                        <circle
                          cx="210"
                          cy="118"
                          r="86"
                          fill={emeraldStroke}
                          fillOpacity={isLightMode ? '0.045' : '0.06'}
                          stroke={emeraldStroke}
                          strokeOpacity={isLightMode ? '0.16' : '0.15'}
                          strokeWidth="0.95"
                          strokeDasharray="3 5"
                        />
                        <circle
                          cx="124"
                          cy="152"
                          r="66"
                          fill={emeraldStroke}
                          fillOpacity={isLightMode ? '0.035' : '0.045'}
                          stroke={emeraldStroke}
                          strokeOpacity={isLightMode ? '0.12' : '0.1'}
                          strokeWidth="0.85"
                          strokeDasharray="2 5"
                        />
                        <circle
                          cx="296"
                          cy="152"
                          r="66"
                          fill={emeraldStroke}
                          fillOpacity={isLightMode ? '0.035' : '0.045'}
                          stroke={emeraldStroke}
                          strokeOpacity={isLightMode ? '0.12' : '0.1'}
                          strokeWidth="0.85"
                          strokeDasharray="2 5"
                        />

                        {CANOPY_LEAF_CLUSTERS.map((leaf, idx) => (
                          <g
                            key={idx}
                            transform={`translate(${leaf.x}, ${leaf.y}) rotate(${leaf.rot}) scale(${leaf.scale || 1})`}
                            opacity={isLightMode ? 0.58 : 0.52}
                          >
                            <path
                              d="M 0 0 C -5.5 -7.5, -3.5 -15, 0 -19 C 3.5 -15, 5.5 -7.5, 0 0 Z"
                              fill={emeraldStroke}
                            />
                            <path
                              d="M 0 -2 C 5.5 -7.5, 12 -9.5, 16 -7 C 11.5 -2.5, 5.5 -1, 0 -2 Z"
                              fill={goldStroke}
                            />
                            <path
                              d="M 0 -4 C -5.5 -8.5, -11.5 -10, -15 -7.5 C -11 -3, -5 -1.5, 0 -4 Z"
                              fill={emeraldStroke}
                              opacity="0.75"
                            />
                          </g>
                        ))}
                      </g>

                      {/* --- ORGANIC SCULPTED TRUNK & ILLUMINATED HEART VEINS --- */}
                      <g aria-hidden="true">
                        <path
                          d="M 176 268 C 192 246, 198 216, 202 174 L 218 174 C 222 216, 228 246, 244 268 Z"
                          fill={goldStroke}
                          fillOpacity={isLightMode ? '0.3' : '0.36'}
                        />
                        <path
                          d="M 176 268 C 194 292, 200 314, 204 342 L 216 342 C 220 314, 226 292, 244 268 Z"
                          fill={goldStroke}
                          fillOpacity={isLightMode ? '0.24' : '0.3'}
                        />
                        {/* Swelling Bark Grain & Heart Sap Meridian */}
                        <path
                          d="M 203 268 C 205 236, 207 204, 207 174 M 217 268 C 215 236, 213 204, 213 174 M 210 336 L 210 174"
                          fill="none"
                          stroke={goldStroke}
                          strokeOpacity={isLightMode ? '0.48' : '0.55'}
                          strokeWidth="1.2"
                        />
                      </g>

                      {/* --- EARTH HORIZON LINE & SUBTERRANEAN SOIL MOUNDS (y = 268) --- */}
                      <g aria-hidden="true">
                        <path
                          d="M 34 268 Q 120 264, 210 268 T 386 268"
                          fill="none"
                          stroke={goldStroke}
                          strokeOpacity={isLightMode ? '0.45' : '0.48'}
                          strokeWidth="1.15"
                        />
                        <polygon points="210,261 217,268 210,275 203,268" fill={goldStroke} />
                        <text
                          x="38"
                          y="260"
                          fill={isLightMode ? 'rgba(28,24,19,0.52)' : 'rgba(243,236,220,0.48)'}
                          fontSize="6.75"
                          letterSpacing="1.3"
                        >
                          CANOPY · ISLAM
                        </text>
                        <text
                          x="38"
                          y="280"
                          fill={isLightMode ? 'rgba(28,24,19,0.52)' : 'rgba(243,236,220,0.48)'}
                          fontSize="6.75"
                          letterSpacing="1.3"
                        >
                          ROOTS · IMAN
                        </text>
                      </g>

                      {/* --- UPPER BOUGH PATHS (5 PILLARS OF ISLAM) --- */}
                      <g
                        style={{
                          opacity: dimBranches ? 0.18 : 1,
                          transition: 'opacity 350ms ease',
                        }}
                      >
                        {ISLAM_PILLARS.map((pillar) => {
                          const isDone = completedSet.has(pillar.id);
                          const isSelected = activeNode?.id === pillar.id;
                          return (
                            <g key={`path_${pillar.id}`}>
                              <path
                                d={pillar.branchPath}
                                fill="none"
                                stroke={mutedStroke}
                                strokeWidth="4.6"
                                strokeLinecap="round"
                              />
                              {isDone && (
                                <path
                                  d={pillar.branchPath}
                                  fill="none"
                                  stroke={emeraldStroke}
                                  strokeOpacity="0.24"
                                  strokeWidth="9"
                                  strokeLinecap="round"
                                />
                              )}
                              <path
                                d={pillar.branchPath}
                                fill="none"
                                stroke={isDone ? emeraldStroke : goldStroke}
                                strokeOpacity={isDone ? 0.94 : isSelected ? 0.78 : 0.45}
                                strokeWidth={isDone ? '3.5' : isSelected ? '2.8' : '2'}
                                strokeLinecap="round"
                              />
                            </g>
                          );
                        })}
                      </g>

                      {/* --- LOWER ROOT PATHS (6 ARTICLES OF FAITH) --- */}
                      <g
                        style={{
                          opacity: dimRoots ? 0.18 : 1,
                          transition: 'opacity 350ms ease',
                        }}
                      >
                        {ROOTLET_PATHS.map((rPath, idx) => (
                          <path
                            key={`rootlet_${idx}`}
                            d={rPath}
                            fill="none"
                            stroke={goldStroke}
                            strokeOpacity={isLightMode ? '0.26' : '0.28'}
                            strokeWidth="1.2"
                            strokeLinecap="round"
                          />
                        ))}
                        {FAITH_ROOTS.map((root) => {
                          const isDone = completedSet.has(root.id);
                          const isSelected = activeNode?.id === root.id;
                          return (
                            <g key={`path_${root.id}`}>
                              <path
                                d={root.branchPath}
                                fill="none"
                                stroke={mutedStroke}
                                strokeWidth="4.6"
                                strokeLinecap="round"
                              />
                              {isDone && (
                                <path
                                  d={root.branchPath}
                                  fill="none"
                                  stroke={goldStroke}
                                  strokeOpacity="0.26"
                                  strokeWidth="9"
                                  strokeLinecap="round"
                                />
                              )}
                              <path
                                d={root.branchPath}
                                fill="none"
                                stroke={goldStroke}
                                strokeOpacity={isDone ? 0.96 : isSelected ? 0.8 : 0.48}
                                strokeWidth={isDone ? '3.5' : isSelected ? '2.8' : '2.1'}
                                strokeLinecap="round"
                              />
                            </g>
                          );
                        })}
                      </g>

                      {/* --- INTERACTIVE SHAMSEH MEDALLIONS (5 PILLARS OF ISLAM) --- */}
                      <g
                        style={{
                          opacity: dimBranches ? 0.24 : 1,
                          transition: 'opacity 350ms ease',
                        }}
                      >
                        {ISLAM_PILLARS.map((pillar) => {
                          const isDone = completedSet.has(pillar.id);
                          const isSelected = activeNode?.id === pillar.id;
                          const { x, y } = pillar.coords;
                          const nodeAccent = isDone ? emeraldStroke : goldStroke;

                          return (
                            <g
                              key={pillar.id}
                              data-testid={`tree-node-${pillar.id}`}
                              role="button"
                              tabIndex={0}
                              aria-label={`Pillar ${pillar.order}: ${pillar.title} (${pillar.shortLabel})${isDone ? ', completed' : ''}`}
                              onClick={() => handleSelectNode(pillar.id, true)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  handleSelectNode(pillar.id, true);
                                }
                              }}
                              className="cursor-pointer group focus:outline-none"
                            >
                              {/* Individual Fiqh Buds Blooming Around Pillar */}
                              {(pillar.fiqhBranches || []).map((fb, bIdx, arr) => {
                                const spread = arr.length > 2 ? 0.52 : 0.72;
                                const centerOffset = (arr.length - 1) / 2;
                                const angle = -Math.PI / 2 + (bIdx - centerOffset) * spread;
                                const bx = x + Math.cos(angle) * 34;
                                const by = y - 3 + Math.sin(angle) * 29;
                                const fiqhStudied = studiedFiqhSet.has(fb.id);

                                return (
                                  <g key={fb.id}>
                                    <line
                                      x1={x + Math.cos(angle) * 22}
                                      y1={y + Math.sin(angle) * 22}
                                      x2={bx}
                                      y2={by}
                                      stroke={fiqhStudied || isDone ? emeraldStroke : goldStroke}
                                      strokeOpacity={fiqhStudied || isDone ? 0.78 : 0.38}
                                      strokeWidth="1.2"
                                    />
                                    <circle
                                      cx={bx}
                                      cy={by}
                                      r={fiqhStudied ? '4' : '3.2'}
                                      fill={
                                        fiqhStudied
                                          ? emeraldStroke
                                          : isDone
                                            ? emeraldStroke
                                            : isLightMode
                                              ? '#faf6ec'
                                              : '#09111f'
                                      }
                                      stroke={fiqhStudied || isDone ? emeraldStroke : goldStroke}
                                      strokeWidth="1.2"
                                    />
                                  </g>
                                );
                              })}

                              {/* Traditional 8-Pointed Rub el Hizb Sacred Star Halo */}
                              <g opacity={isSelected ? 0.92 : isDone ? 0.72 : 0.34}>
                                <rect
                                  x={x - 19}
                                  y={y - 19}
                                  width="38"
                                  height="38"
                                  rx="1.5"
                                  fill="none"
                                  stroke={nodeAccent}
                                  strokeWidth={isSelected ? '1.3' : '0.9'}
                                />
                                <rect
                                  x={x - 19}
                                  y={y - 19}
                                  width="38"
                                  height="38"
                                  rx="1.5"
                                  fill="none"
                                  stroke={nodeAccent}
                                  strokeWidth={isSelected ? '1.3' : '0.9'}
                                  transform={`rotate(45 ${x} ${y})`}
                                />
                              </g>

                              {/* Active Focus Orbit */}
                              {isSelected && (
                                <circle
                                  cx={x}
                                  cy={y}
                                  r="30"
                                  fill="none"
                                  stroke={nodeAccent}
                                  strokeOpacity="0.45"
                                  strokeWidth="1"
                                  strokeDasharray="2 3"
                                />
                              )}

                              {/* Medallion Seal Core */}
                              <circle
                                cx={x}
                                cy={y}
                                r="20.5"
                                fill={
                                  isDone
                                    ? isLightMode
                                      ? '#e3f3ef'
                                      : '#0a2626'
                                    : isLightMode
                                      ? '#fcf8ef'
                                      : '#09111f'
                                }
                                stroke={nodeAccent}
                                strokeWidth={isSelected ? '1.9' : '1.35'}
                              />

                              {/* Arabic Calligraphy Emblem */}
                              <text
                                x={x}
                                y={y + 4}
                                textAnchor="middle"
                                fill={
                                  isDone
                                    ? nodeAccent
                                    : isLightMode
                                      ? '#1c1813'
                                      : '#f3ecdc'
                                }
                                fontSize="11.5"
                                fontWeight="600"
                                className="font-arabic"
                              >
                                {pillar.arabicShort}
                              </text>

                              {/* Clean Typographic Caption */}
                              <text
                                x={x}
                                y={y + 39}
                                textAnchor="middle"
                                fill={
                                  isDone
                                    ? nodeAccent
                                    : isLightMode
                                      ? '#261f16'
                                      : '#f3ecdc'
                                }
                                stroke={labelStrokeBg}
                                strokeWidth="3.6"
                                paintOrder="stroke"
                                fontSize="9.5"
                                fontWeight="600"
                                letterSpacing="0.5"
                              >
                                {isDone ? `✓ ${pillar.shortLabel}` : `0${pillar.order} · ${pillar.shortLabel}`}
                              </text>
                            </g>
                          );
                        })}
                      </g>

                      {/* --- INTERACTIVE SHAMSEH ROOT NODES (6 ARTICLES OF FAITH) --- */}
                      <g
                        style={{
                          opacity: dimRoots ? 0.24 : 1,
                          transition: 'opacity 350ms ease',
                        }}
                      >
                        {FAITH_ROOTS.map((root) => {
                          const isDone = completedSet.has(root.id);
                          const isSelected = activeNode?.id === root.id;
                          const { x, y } = root.coords;

                          return (
                            <g
                              key={root.id}
                              data-testid={`tree-node-${root.id}`}
                              role="button"
                              tabIndex={0}
                              aria-label={`Article of Faith ${root.order}: ${root.title} (${root.shortLabel})${isDone ? ', completed' : ''}`}
                              onClick={() => handleSelectNode(root.id, true)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  handleSelectNode(root.id, true);
                                }
                              }}
                              className="cursor-pointer group focus:outline-none"
                            >
                              {/* 8-Pointed Shamseh Star Geometry */}
                              <g opacity={isSelected ? 0.92 : isDone ? 0.72 : 0.34}>
                                <rect
                                  x={x - 18.5}
                                  y={y - 18.5}
                                  width="37"
                                  height="37"
                                  rx="1.5"
                                  fill="none"
                                  stroke={goldStroke}
                                  strokeWidth={isSelected ? '1.3' : '0.9'}
                                />
                                <rect
                                  x={x - 18.5}
                                  y={y - 18.5}
                                  width="37"
                                  height="37"
                                  rx="1.5"
                                  fill="none"
                                  stroke={goldStroke}
                                  strokeWidth={isSelected ? '1.3' : '0.9'}
                                  transform={`rotate(45 ${x} ${y})`}
                                />
                              </g>

                              {isSelected && (
                                <circle
                                  cx={x}
                                  cy={y}
                                  r="29"
                                  fill="none"
                                  stroke={goldStroke}
                                  strokeOpacity="0.48"
                                  strokeWidth="1"
                                  strokeDasharray="2 3"
                                />
                              )}

                              {/* Root Medallion Core */}
                              <circle
                                cx={x}
                                cy={y}
                                r="19.5"
                                fill={
                                  isDone
                                    ? isLightMode
                                      ? '#f3e7ce'
                                      : '#231a0d'
                                    : isLightMode
                                      ? '#fcf8ef'
                                      : '#09111f'
                                }
                                stroke={goldStroke}
                                strokeWidth={isSelected ? '1.9' : '1.35'}
                              />

                              <text
                                x={x}
                                y={y + 4}
                                textAnchor="middle"
                                fill={
                                  isDone
                                    ? goldStroke
                                    : isLightMode
                                      ? '#1c1813'
                                      : '#f3ecdc'
                                }
                                fontSize="11"
                                fontWeight="600"
                                className="font-arabic"
                              >
                                {root.arabicShort}
                              </text>

                              <text
                                x={x}
                                y={y + 37}
                                textAnchor="middle"
                                fill={
                                  isDone
                                    ? goldStroke
                                    : isLightMode
                                      ? '#261f16'
                                      : '#f3ecdc'
                                }
                                stroke={labelStrokeBg}
                                strokeWidth="3.6"
                                paintOrder="stroke"
                                fontSize="9.5"
                                fontWeight="600"
                                letterSpacing="0.5"
                              >
                                {isDone ? `✓ ${root.shortLabel}` : `0${root.order} · ${root.shortLabel}`}
                              </text>
                            </g>
                          );
                        })}
                      </g>
                    </svg>
                  </div>

                  {/* Quiet Quranic Parable Whisper below Tree */}
                  <div className="shrink-0 flex items-center justify-between gap-2 px-1 pt-1 text-[9.5px]">
                    <span className={`italic font-serif truncate sm:hidden ${textMuted}`}>
                      “Its root firmly fixed, branches in the sky”
                    </span>
                    <span className={`italic font-serif truncate hidden sm:inline ${textMuted}`}>
                      “{SACRED_TREE_VERSE.translation}”
                    </span>
                    <span
                      className="uppercase tracking-[0.16em] font-semibold whitespace-nowrap shrink-0"
                      style={{ color: goldStroke }}
                    >
                      {SACRED_TREE_VERSE.source}
                    </span>
                  </div>
                </div>

                {/* Mobile Clean Hairline Trigger Bar (unboxed, integrated into canvas floor) */}
                {activeNode && (
                  <button
                    type="button"
                    data-testid="mobile-active-lesson-trigger"
                    onClick={() => handleSelectNode(activeNode.id, true)}
                    className={`lg:hidden shrink-0 w-full min-h-[54px] border-t pt-2.5 pb-1 flex items-center justify-between gap-3 text-left cursor-pointer ${hairline}`}
                  >
                    <div className="min-w-0">
                      <span
                        className="text-[9.5px] uppercase tracking-[0.18em] font-semibold block"
                        style={{ color: activeNode.kind === 'islam' ? emeraldStroke : goldStroke }}
                      >
                        {activeNode.kind === 'islam'
                          ? `Pillar 0${activeNode.order} · Open Fiqh & Lesson`
                          : `Root 0${activeNode.order} · Open Lesson`}
                      </span>
                      <p className={`font-serif text-[15px] font-medium truncate ${textMain}`}>
                        {activeNode.title} ({activeNode.shortLabel})
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className="font-arabic text-[16px]"
                        style={{ color: activeNode.kind === 'islam' ? emeraldStroke : goldStroke }}
                      >
                        {activeNode.arabicShort}
                      </span>
                      <ChevronRightIcon size={15} className="opacity-65" />
                    </div>
                  </button>
                )}
              </div>

              {/* RIGHT ZONE ON DESKTOP (`lg:`+): ILLUMINATED MANUSCRIPT STUDY LEAF */}
              <div className="hidden lg:flex lg:flex-col h-full min-h-0">
                <SacredLessonFolio
                  node={activeNode}
                  variant="panel"
                  isLightMode={isLightMode}
                  goldStroke={goldStroke}
                  emeraldStroke={emeraldStroke}
                  isDone={completedSet.has(activeNode?.id)}
                  studiedFiqhSet={studiedFiqhSet}
                  prevNode={prevNode}
                  nextNode={nextNode}
                  onSelectNode={(id) => handleSelectNode(id, false)}
                  onToggleMastery={handleToggleMastery}
                  onToggleFiqhBranch={onToggleFiqhBranch}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- MOBILE & TABLET FOCUSED SACRED FOLIO MODAL (`< lg`) --- */}
      {isVisible &&
        isMobileModalOpen &&
        activeNode &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[90] flex lg:hidden items-end sm:items-center justify-center p-2.5 sm:p-4 pointer-events-auto"
            onClick={() => {
              hapticDismiss();
              setIsMobileModalOpen(false);
            }}
          >
            <div
              className={`absolute inset-0 transition-opacity duration-300 ${
                isLightMode ? 'bg-[#1a1610]/38 backdrop-blur-[5px]' : 'bg-black/75 backdrop-blur-[7px]'
              }`}
            />
            <SacredLessonFolio
              node={activeNode}
              variant="modal"
              isLightMode={isLightMode}
              goldStroke={goldStroke}
              emeraldStroke={emeraldStroke}
              isDone={completedSet.has(activeNode.id)}
              studiedFiqhSet={studiedFiqhSet}
              prevNode={prevNode}
              nextNode={nextNode}
              onClose={() => setIsMobileModalOpen(false)}
              onSelectNode={(id) => setActiveNodeId(id)}
              onToggleMastery={handleToggleMastery}
              onToggleFiqhBranch={onToggleFiqhBranch}
            />
          </div>,
          document.body
        )}
    </>
  );
};
