import { memo, useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  BellIcon,
  BookIcon,
  BookmarkIcon,
  CheckCircleIcon,
  FlameIcon,
  MoonIcon,
  RotateCcwIcon,
  SettingsIcon,
} from '../icons/Icons';
import { BadgeArtwork } from '../badges/BadgeArtwork';
import { BADGE_TIERS, getBadgeTierStyle } from '../../utils/badgeLogic';
import {
  buildStreakStatus,
  getLocalDateStr,
  STREAK_MILESTONES,
} from '../../utils/devotionLogic';
import {
  CARD_FINISH_STORAGE_KEY,
  computeCardTilt,
  computeGyroTilt,
  computeSeekerRingProgress,
  evaluateCardSwipeFlip,
  formatCardMrzLine,
  formatJoinedYear,
  formatSeekerPassId,
  formatStationNumeral,
  parseCardFinishPreference,
  resolveCardFinish,
  resolveInitials,
} from '../../utils/profileCardLogic';
import {
  hapticCelebrate,
  hapticDetent,
  hapticNavigate,
  hapticToggle,
} from '../../utils/haptics';
import { playCardFlipCue, playCardRippleCue } from '../../utils/tactileAudio';

const TIER_ORDER = ['silver', 'gold', 'platinum'];
const HEATMAP_WEEKS = 14;
const HEATMAP_DAYS = HEATMAP_WEEKS * 7;

const FINISH_SWATCHES = [
  {
    id: 'obsidian',
    label: 'Obsidian',
    ariaLabel: 'Obsidian Gold card finish',
    swatchBg: 'linear-gradient(135deg, #222b3f 0%, #0b0f1a 60%, #5c4620 100%)',
    ringColor: '#dfba70',
  },
  {
    id: 'emerald',
    label: 'Emerald',
    ariaLabel: 'Emerald Sanctuary card finish',
    swatchBg: 'linear-gradient(135deg, #1b4b3f 0%, #0a1f19 60%, #7d6230 100%)',
    ringColor: '#dfba70',
  },
  {
    id: 'ivory',
    label: 'Ivory',
    ariaLabel: 'Archival Ivory card finish',
    swatchBg: 'linear-gradient(135deg, #fffdf9 0%, #efe6d3 65%, #b58d42 100%)',
    ringColor: '#9c7533',
  },
];

function getCardMaterialTheme(finish) {
  if (finish === 'ivory') {
    return {
      isLightCard: true,
      rewardHex: '#986f2c',
      pauseHex: '#0d9488',
      textMain: 'text-[#1c1813]',
      textSub: 'text-[#473e33]',
      textGold: 'text-[#845f22]',
      outerBorder: 'border-[#a17a38]/34',
      innerFrameBorder: 'border-[#9c7533]/20',
      cornerColor: 'rgba(152, 111, 44, 0.52)',
      hairline: 'border-[#9c7533]/20',
      subtleDivider: 'border-[#2c2214]/[0.09]',
      divideClass: 'divide-[#2c2214]/[0.09]',
      surfaceStyle: {
        background:
          'linear-gradient(142deg, rgba(255,253,248,0.97) 0%, rgba(247,240,226,0.97) 48%, rgba(236,226,207,0.96) 100%)',
        boxShadow:
          '0 28px 64px -20px rgba(34,24,10,0.24), 0 6px 20px -6px rgba(152,111,44,0.16), inset 0 1px 0 rgba(255,255,255,0.98), inset 0 -1px 0 rgba(152,111,44,0.16)',
      },
      archBg: 'linear-gradient(180deg, #f3ead7 0%, #fbf7ee 58%, #efe3cc 100%)',
      archInnerStroke: 'rgba(152, 111, 44, 0.36)',
      archGlow: 'rgba(152, 111, 44, 0.14)',
      mrzBg: 'bg-[#9c7533]/[0.065]',
      bandBg: 'bg-[#9c7533]/[0.06]',
      foilGradient:
        'radial-gradient(440px circle at var(--foil-x) var(--foil-y), rgba(255,255,255,0.68) 0%, rgba(202,160,82,0.16) 36%, transparent 72%)',
      latticeColor: 'rgba(138, 102, 38, 0.065)',
      inputClass:
        'bg-white/85 border-[#9c7533]/40 text-[#1c1813] placeholder:text-[#473e33]/45 focus:border-[#845f22]',
      buttonClass:
        'border-[#9c7533]/30 text-[#7a571c] bg-white/55 hover:bg-[#9c7533]/12',
      tabActiveClass: 'bg-[#9c7533]/14 text-[#755218] font-semibold',
      tabIdleClass: 'text-[#473e33]/70 hover:text-[#1c1813]',
      hoverRowClass: 'hover:bg-black/[0.035]',
      selectedRowClass: 'bg-black/[0.06]',
      trackBgClass: 'bg-black/[0.08]',
    };
  }

  if (finish === 'emerald') {
    return {
      isLightCard: false,
      rewardHex: '#e0bc72',
      pauseHex: '#34d399',
      textMain: 'text-[rgba(247,242,231,0.96)]',
      textSub: 'text-[rgba(210,224,214,0.72)]',
      textGold: 'text-[#e5c37d]',
      outerBorder: 'border-[#dfb86c]/30',
      innerFrameBorder: 'border-[#dfb86c]/18',
      cornerColor: 'rgba(229, 195, 125, 0.5)',
      hairline: 'border-[#dfb86c]/18',
      subtleDivider: 'border-[#e8f5ee]/[0.09]',
      divideClass: 'divide-[#e8f5ee]/[0.09]',
      surfaceStyle: {
        background:
          'linear-gradient(142deg, rgba(16,44,37,0.96) 0%, rgba(9,26,22,0.97) 52%, rgba(18,34,27,0.96) 100%)',
        boxShadow:
          '0 30px 72px -18px rgba(0,0,0,0.82), 0 0 0 1px rgba(223,184,108,0.14), inset 0 1px 0 rgba(255,242,206,0.16), inset 0 -1px 0 rgba(0,0,0,0.45)',
      },
      archBg: 'linear-gradient(180deg, #0b241e 0%, #071612 58%, #102b22 100%)',
      archInnerStroke: 'rgba(229, 195, 125, 0.34)',
      archGlow: 'rgba(224, 188, 114, 0.14)',
      mrzBg: 'bg-black/28',
      bandBg: 'bg-black/24',
      foilGradient:
        'radial-gradient(480px circle at var(--foil-x) var(--foil-y), rgba(242,212,140,0.18) 0%, rgba(74,180,148,0.08) 38%, transparent 72%)',
      latticeColor: 'rgba(229, 195, 125, 0.055)',
      inputClass:
        'bg-black/35 border-[#dfb86c]/45 text-[#f7f2e7] placeholder:text-[#d2e0d6]/45 focus:border-[#e5c37d]',
      buttonClass:
        'border-[#dfb86c]/30 text-[#ebd093] bg-white/[0.03] hover:bg-[#dfb86c]/14',
      tabActiveClass: 'bg-[#dfb86c]/16 text-[#f0d598] font-semibold',
      tabIdleClass: 'text-[#d2e0d6]/65 hover:text-[#f7f2e7]',
      hoverRowClass: 'hover:bg-white/[0.045]',
      selectedRowClass: 'bg-white/[0.08]',
      trackBgClass: 'bg-white/[0.09]',
    };
  }

  // Default: Obsidian Gold
  return {
    isLightCard: false,
    rewardHex: '#d9ae58',
    pauseHex: '#2dd4bf',
    textMain: 'text-[rgba(246,240,228,0.96)]',
    textSub: 'text-[rgba(224,214,196,0.70)]',
    textGold: 'text-[#e4c078]',
    outerBorder: 'border-[#d9ae58]/28',
    innerFrameBorder: 'border-[#d9ae58]/16',
    cornerColor: 'rgba(228, 192, 120, 0.48)',
    hairline: 'border-white/[0.10]',
    subtleDivider: 'border-white/[0.08]',
    divideClass: 'divide-white/[0.08]',
    surfaceStyle: {
      background:
        'linear-gradient(142deg, rgba(20,27,44,0.96) 0%, rgba(11,15,26,0.97) 52%, rgba(22,19,24,0.96) 100%)',
      boxShadow:
        '0 30px 72px -18px rgba(0,0,0,0.84), 0 0 0 1px rgba(217,174,88,0.12), inset 0 1px 0 rgba(255,244,218,0.14), inset 0 -1px 0 rgba(0,0,0,0.5)',
    },
    archBg: 'linear-gradient(180deg, #121a2d 0%, #0a0e1a 60%, #171419 100%)',
    archInnerStroke: 'rgba(228, 192, 120, 0.34)',
    archGlow: 'rgba(217, 174, 88, 0.14)',
    mrzBg: 'bg-black/30',
    bandBg: 'bg-black/26',
    foilGradient:
      'radial-gradient(480px circle at var(--foil-x) var(--foil-y), rgba(242,208,136,0.18) 0%, rgba(210,162,75,0.06) 38%, transparent 72%)',
    latticeColor: 'rgba(228, 192, 120, 0.048)',
    inputClass:
      'bg-black/40 border-[#d9ae58]/45 text-[#f6f0e4] placeholder:text-[#e0d6c4]/40 focus:border-[#e4c078]',
    buttonClass:
      'border-[#d9ae58]/28 text-[#ebd093] bg-white/[0.03] hover:bg-[#d9ae58]/14',
    tabActiveClass: 'bg-[#d9ae58]/16 text-[#ebd093] font-semibold',
    tabIdleClass: 'text-[#e0d6c4]/62 hover:text-[#f6f0e4]',
    hoverRowClass: 'hover:bg-white/[0.045]',
    selectedRowClass: 'bg-white/[0.08]',
    trackBgClass: 'bg-white/[0.09]',
  };
}

const SacredSealMark = ({ unlocked, accentHex, isLightCard }) => {
  const strokeColor = unlocked
    ? accentHex
    : isLightCard
      ? 'rgba(44, 39, 32, 0.26)'
      : 'rgba(228, 218, 200, 0.26)';

  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <rect
        x="5"
        y="5"
        width="14"
        height="14"
        rx="1.5"
        fill={unlocked ? `${accentHex}24` : 'none'}
        stroke={strokeColor}
        strokeWidth="1.35"
      />
      <rect
        x="5"
        y="5"
        width="14"
        height="14"
        rx="1.5"
        transform="rotate(45 12 12)"
        fill={unlocked ? `${accentHex}1c` : 'none'}
        stroke={strokeColor}
        strokeWidth="1.35"
      />
      <circle
        cx="12"
        cy="12"
        r={unlocked ? '2.4' : '1.35'}
        fill={unlocked ? accentHex : strokeColor}
      />
    </svg>
  );
};

const GuillochePatternLayer = ({ patternId, strokeColor }) => (
  <svg
    aria-hidden="true"
    className="profile-card-parallax-deep absolute -inset-3 w-[calc(100%+24px)] h-[calc(100%+24px)] pointer-events-none select-none z-0"
  >
    <defs>
      <pattern id={patternId} width="44" height="44" patternUnits="userSpaceOnUse">
        <path
          d="M22 2 L28 16 L42 22 L28 28 L22 42 L16 28 L2 22 L16 16 Z"
          fill="none"
          stroke={strokeColor}
          strokeWidth="0.65"
        />
        <circle cx="22" cy="22" r="2.2" fill="none" stroke={strokeColor} strokeWidth="0.55" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill={`url(#${patternId})`} />
  </svg>
);

const CornerBrackets = ({ color }) => (
  <div aria-hidden="true" className="pointer-events-none select-none absolute inset-[10px] z-10">
    <span
      className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l rounded-tl-[6px]"
      style={{ borderColor: color }}
    />
    <span
      className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r rounded-tr-[6px]"
      style={{ borderColor: color }}
    />
    <span
      className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l rounded-bl-[6px]"
      style={{ borderColor: color }}
    />
    <span
      className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r rounded-br-[6px]"
      style={{ borderColor: color }}
    />
  </div>
);

const HolographicRubElHizbSeal = ({ accentHex, className = '', onShimmer }) => (
  <button
    type="button"
    onClick={onShimmer}
    aria-label="Shimmer Sanctuary optical seal"
    title="Tap to shimmer"
    className={`relative w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 overflow-hidden border cursor-pointer transition-transform duration-200 hover:scale-110 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#dfba70] ${className}`}
    style={{ borderColor: `${accentHex}55` }}
  >
    <div className="profile-card-holo absolute inset-0 opacity-80" />
    <svg viewBox="0 0 36 36" className="relative z-10 w-6 h-6 pointer-events-none">
      <g fill="none" stroke={accentHex} strokeWidth="1.05" strokeOpacity="0.92">
        <rect x="9" y="9" width="18" height="18" rx="1.2" />
        <rect x="9" y="9" width="18" height="18" rx="1.2" transform="rotate(45 18 18)" />
        <circle cx="18" cy="18" r="3.4" />
        <circle cx="18" cy="18" r="1.1" fill={accentHex} />
      </g>
    </svg>
  </button>
);

const FlipIcon = ({ size = 12, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.65"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
    <path d="M8 16H3v5" />
  </svg>
);

const EditPenIcon = ({ size = 12, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);

const MihrabPortraitWindow = ({
  initials,
  stationNumeral,
  stationArabic,
  ringCircumference,
  ringDashOffset,
  cardTheme,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-label="Personalize Seeker name on Sanctuary Pass"
    className="group relative flex flex-col items-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#dfba70]/60 rounded-2xl"
  >
    <div
      className="relative w-[82px] h-[102px] sm:w-[96px] sm:h-[118px] md:w-[114px] md:h-[136px] flex flex-col items-center justify-center transition-transform duration-300 group-hover:scale-[1.02]"
      style={{
        background: cardTheme.archBg,
        borderRadius: '58px 58px 14px 14px',
        boxShadow: `inset 0 0 22px ${cardTheme.archGlow}, 0 8px 20px -10px rgba(0,0,0,0.45)`,
        border: `1px solid ${cardTheme.archInnerStroke}`,
      }}
    >
      {/* Inner recessed pointed arch SVG */}
      <svg
        viewBox="0 0 114 136"
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none"
      >
        <path
          d="M 10 126 L 10 58 C 10 26, 36 12, 57 6 C 78 12, 104 26, 104 58 L 104 126 Z"
          fill="none"
          stroke={cardTheme.rewardHex}
          strokeOpacity="0.28"
          strokeWidth="0.9"
        />
        <circle cx="57" cy="17" r="1.4" fill={cardTheme.rewardHex} fillOpacity="0.65" />
      </svg>

      {/* Monogram Ring inside the Mihrab Arch */}
      <div className="relative w-[56px] h-[56px] sm:w-[66px] sm:h-[66px] md:w-[76px] md:h-[76px] flex items-center justify-center mt-1">
        <svg
          className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
          viewBox="0 0 100 100"
          aria-hidden="true"
        >
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke={cardTheme.rewardHex}
            strokeOpacity="0.22"
            strokeWidth="1.25"
            strokeDasharray="2 4"
          />
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke={cardTheme.rewardHex}
            strokeWidth="2.3"
            strokeDasharray={ringCircumference}
            strokeDashoffset={ringDashOffset}
            strokeLinecap="round"
            className="transition-[stroke-dashoffset] duration-700 ease-out"
          />
        </svg>

        <span
          className={`font-serif-eng text-[20px] sm:text-[23px] md:text-[26px] font-light leading-none ${cardTheme.textMain}`}
          style={{ letterSpacing: '0.09em', marginRight: '-0.09em' }}
        >
          {initials}
        </span>
      </div>

      {/* Engraved Brass Nameplate Foot */}
      <div className="relative z-10 flex items-center gap-1 mt-1.5 px-2">
        <span
          className={`font-serif-eng text-[7.5px] sm:text-[8px] uppercase tracking-[0.16em] whitespace-nowrap ${cardTheme.textGold}`}
        >
          Stn {stationNumeral}
        </span>
        {stationArabic && (
          <>
            <span className={`text-[7px] opacity-45 ${cardTheme.textGold}`}>·</span>
            <span
              className={`font-calligraphy text-[12px] sm:text-[13px] leading-none ${cardTheme.textGold}`}
              dir="rtl"
            >
              {stationArabic}
            </span>
          </>
        )}
      </div>
    </div>
  </button>
);

function buildCompactHeatmapWeeks(historyMap = {}) {
  const days = [];
  const today = new Date();
  for (let i = HEATMAP_DAYS - 1; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    const dateStr = getLocalDateStr(d);
    const entry = historyMap[dateStr];
    let count = 0;
    if (entry) {
      count =
        typeof entry === 'number'
          ? entry
          : (entry.prayers || 0) + (entry.verses || 0) + (entry.practices || 0);
    }
    days.push({ dateStr, count, isToday: i === 0 });
  }
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
}

function readStoredFinishPreference() {
  try {
    return parseCardFinishPreference(localStorage.getItem(CARD_FINISH_STORAGE_KEY));
  } catch {
    return 'auto';
  }
}

export const ProfileIdCard = memo(
  ({
    userProfile,
    hijri,
    devotionData,
    stations = [],
    currentStationData,
    maq,
    completedHabitsCount = 0,
    totalHabitsCount = 0,
    qadaRemainingCount = 0,
    enabledAlertsCount = 0,
    accentHex,
    isLightMode = false,
    onSelectStation,
    onInspectBadge,
    onOpenDuas,
    onOpenQada,
    onOpenArchive,
    onOpenReminders,
    onOpenSettings,
  }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const [recordTab, setRecordTab] = useState('streak'); // 'streak' | 'badges' | 'path'
    const [selectedDateStr, setSelectedDateStr] = useState(null);
    const [selectedMilestoneId, setSelectedMilestoneId] = useState(null);
    const [lockedPreviewId, setLockedPreviewId] = useState(null);
    const [finishPref, setFinishPref] = useState(() => readStoredFinishPreference());

    const [isEditingName, setIsEditingName] = useState(false);
    const [nameDraft, setNameDraft] = useState(userProfile?.name || 'Seeker');
    const [isInteracting, setIsInteracting] = useState(false);
    const [sweepTick, setSweepTick] = useState(0);
    const [pressRipple, setPressRipple] = useState(null);

    const cardStageRef = useRef(null);
    const nameInputRef = useRef(null);
    const pointerSessionRef = useRef({
      active: false,
      pointerId: null,
      startX: 0,
      startY: 0,
      isTouch: false,
    });
    const rippleTimerRef = useRef(null);
    const patternBaseId = useId();

    const activeFinish = useMemo(
      () => resolveCardFinish(finishPref, isLightMode),
      [finishPref, isLightMode]
    );
    const cardTheme = useMemo(() => getCardMaterialTheme(activeFinish), [activeFinish]);

    const rewardHex = cardTheme.rewardHex;
    const pauseHex = cardTheme.pauseHex;
    const isLightCard = cardTheme.isLightCard;

    const applyTiltVars = ({ rx, ry, mxPct, myPct, holoAngle, px, py }, foilOpacity = 1) => {
      const stage = cardStageRef.current;
      if (!stage) return;
      stage.style.setProperty('--card-rx', `${rx}deg`);
      stage.style.setProperty('--card-ry', `${ry}deg`);
      stage.style.setProperty('--foil-x', `${mxPct}%`);
      stage.style.setProperty('--foil-y', `${myPct}%`);
      stage.style.setProperty('--foil-o', String(foilOpacity));
      stage.style.setProperty('--holo-angle', `${holoAngle}deg`);
      stage.style.setProperty('--px', `${px}px`);
      stage.style.setProperty('--py', `${py}px`);
    };

    const resetTiltVars = () => {
      const stage = cardStageRef.current;
      if (!stage) return;
      stage.style.setProperty('--card-rx', '0deg');
      stage.style.setProperty('--card-ry', '0deg');
      stage.style.setProperty('--foil-o', '0');
      stage.style.setProperty('--holo-angle', '130deg');
      stage.style.setProperty('--px', '0px');
      stage.style.setProperty('--py', '0px');
      stage.style.setProperty('--card-scale', '1');
    };

    const triggerFoilSweep = () => {
      setSweepTick((n) => n + 1);
    };

    const emitPressRipple = (clientX, clientY, { playAudio = true } = {}) => {
      const stage = cardStageRef.current;
      if (!stage) return;
      const rect = stage.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const xPct = Math.max(0, Math.min(100, Math.round(((clientX - rect.left) / rect.width) * 100)));
      const yPct = Math.max(0, Math.min(100, Math.round(((clientY - rect.top) / rect.height) * 100)));
      setPressRipple({ id: Date.now() + Math.random(), xPct, yPct });
      if (playAudio) {
        playCardRippleCue({ xPct, yPct, finish: activeFinish });
      }
      if (rippleTimerRef.current) clearTimeout(rippleTimerRef.current);
      rippleTimerRef.current = setTimeout(() => {
        setPressRipple(null);
      }, 680);
    };

    useEffect(() => {
      return () => {
        if (rippleTimerRef.current) clearTimeout(rippleTimerRef.current);
      };
    }, []);

    // Passive handheld gyroscope illumination on mobile devices (yields to active touch)
    useEffect(() => {
      if (typeof window === 'undefined' || !('DeviceOrientationEvent' in window)) return undefined;
      if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;

      let rafId = 0;
      const handleOrientation = (ev) => {
        if (pointerSessionRef.current.active || isEditingName) return;
        const tilt = computeGyroTilt(ev.beta, ev.gamma, 5, 3);
        if (!tilt) return;
        if (rafId) return;
        rafId = window.requestAnimationFrame(() => {
          rafId = 0;
          if (!pointerSessionRef.current.active) {
            applyTiltVars(tilt, 0.72);
          }
        });
      };

      window.addEventListener('deviceorientation', handleOrientation, { passive: true });
      return () => {
        window.removeEventListener('deviceorientation', handleOrientation);
        if (rafId) window.cancelAnimationFrame(rafId);
      };
    }, [isEditingName]);

    useEffect(() => {
      if (isEditingName) {
        nameInputRef.current?.focus();
        nameInputRef.current?.select();
      }
    }, [isEditingName]);

    const selectFinish = (nextFinish) => {
      hapticDetent();
      setFinishPref(nextFinish);
      triggerFoilSweep();
      try {
        localStorage.setItem(CARD_FINISH_STORAGE_KEY, nextFinish);
      } catch {
        // Ignore storage write errors in restricted contexts
      }
    };

    const startEditingName = () => {
      hapticDetent();
      setNameDraft(userProfile?.name || 'Seeker');
      setIsEditingName(true);
    };

    const commitNameEdit = () => {
      const cleaned = nameDraft.trim() || 'Seeker';
      devotionData.setProfile?.(cleaned);
      setIsEditingName(false);
      hapticDetent();
    };

    const cancelNameEdit = () => {
      setNameDraft(userProfile?.name || 'Seeker');
      setIsEditingName(false);
    };

    const streakStatus = useMemo(
      () => buildStreakStatus(devotionData.history, new Date(), devotionData.streakPausedDates),
      [devotionData.history, devotionData.streakPausedDates]
    );

    const todayNode = streakStatus.weekDays[streakStatus.weekDays.length - 1];
    const isTodayPauseStored = Boolean(
      todayNode && devotionData.streakPausedDates?.[todayNode.dateStr]
    );

    const holderName = userProfile?.name || 'Seeker';
    const initials = useMemo(
      () => resolveInitials(holderName, userProfile?.initials || 'SK'),
      [holderName, userProfile?.initials]
    );

    const passId = useMemo(
      () =>
        formatSeekerPassId({
          hijriYear: hijri?.year,
          joinedDate: userProfile?.joinedDate,
          activeDays: devotionData.activeDays,
        }),
      [hijri?.year, userProfile?.joinedDate, devotionData.activeDays]
    );

    const joinedYear = useMemo(
      () => formatJoinedYear(userProfile?.joinedDate),
      [userProfile?.joinedDate]
    );

    const mrzLine = useMemo(
      () =>
        formatCardMrzLine({
          name: holderName,
          hijriYear: hijri?.year,
          stationIndex: maq?.currentStation || 0,
          joinedDate: userProfile?.joinedDate,
        }),
      [holderName, hijri?.year, maq?.currentStation, userProfile?.joinedDate]
    );

    const ringCircumference = 276.46; // r = 44
    const ringProgress = useMemo(
      () => computeSeekerRingProgress(devotionData.currentStreak, 30, ringCircumference),
      [devotionData.currentStreak]
    );

    const stationNumeral = formatStationNumeral(maq?.currentStation || 0);
    const yaqeenPct = Math.max(0, Math.min(100, maq?.yaqeenProgress || 0));

    const selectedDay = useMemo(() => {
      if (!selectedDateStr) return null;
      return streakStatus.weekDays.find((d) => d.dateStr === selectedDateStr) || null;
    }, [selectedDateStr, streakStatus.weekDays]);

    const selectedMilestone = useMemo(() => {
      if (!selectedMilestoneId) return null;
      return STREAK_MILESTONES.find((m) => m.id === selectedMilestoneId) || null;
    }, [selectedMilestoneId]);

    const badgesByTier = useMemo(() => {
      const list = devotionData.badgeStatuses || [];
      return TIER_ORDER.map((tierId) => {
        const style = getBadgeTierStyle(tierId, isLightCard);
        const items = list.filter((b) => b.tier === tierId);
        return { tierId, style, items };
      });
    }, [devotionData.badgeStatuses, isLightCard]);

    const previewBadge = useMemo(
      () => (devotionData.badgeStatuses || []).find((b) => b.id === lockedPreviewId) || null,
      [devotionData.badgeStatuses, lockedPreviewId]
    );

    const heatmapWeeks = useMemo(
      () => buildCompactHeatmapWeeks(devotionData.history),
      [devotionData.history]
    );

    const formatDaySummary = (day) => {
      if (!day) return '';
      const parts = [];
      if (day.prayers > 0) parts.push(`${day.prayers} ${day.prayers === 1 ? 'prayer' : 'prayers'}`);
      if (day.verses > 0) parts.push(`${day.verses} ${day.verses === 1 ? 'verse' : 'verses'}`);
      if (day.practices > 0) {
        parts.push(`${day.practices} ${day.practices === 1 ? 'practice' : 'practices'}`);
      }
      const label = day.isToday ? 'Today' : `${day.dayShort} ${day.dayNum}`;
      if (parts.length > 0) return `${label} · ${parts.join(' · ')}`;
      if (day.paused) return `${label} · Rest day protected`;
      return `${label} · Quiet day`;
    };

    const handleCardPointerDown = (e) => {
      if (isEditingName || !cardStageRef.current) return;
      const isInput = e.target?.closest?.('input, textarea');
      if (isInput) return;

      pointerSessionRef.current = {
        active: true,
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        isTouch: e.pointerType === 'touch',
      };
      setIsInteracting(true);
      cardStageRef.current.style.setProperty('--card-scale', '0.988');

      const rect = cardStageRef.current.getBoundingClientRect();
      const tilt = computeCardTilt(e.clientX, e.clientY, rect, e.pointerType === 'touch' ? 7 : 6);
      applyTiltVars(tilt, 1);
      const isFlipTrigger = Boolean(e.target?.closest?.('[data-flip-trigger="true"]'));
      emitPressRipple(e.clientX, e.clientY, { playAudio: !isFlipTrigger });
    };

    const handleCardPointerMove = (e) => {
      if (isEditingName || !cardStageRef.current) return;
      const isTouch = e.pointerType === 'touch';
      if (isTouch && !pointerSessionRef.current.active) return;

      const rect = cardStageRef.current.getBoundingClientRect();
      const tilt = computeCardTilt(e.clientX, e.clientY, rect, isTouch ? 7.5 : 5.8);
      applyTiltVars(tilt, 1);
    };

    const handleCardPointerUp = (e) => {
      const session = pointerSessionRef.current;
      if (!session.active) return;

      const dx = e.clientX - session.startX;
      const dy = e.clientY - session.startY;
      pointerSessionRef.current.active = false;
      setIsInteracting(false);

      const swipeDir = evaluateCardSwipeFlip(dx, dy, 58);
      if (swipeDir && !isEditingName) {
        const nextFlipped = !isFlipped;
        hapticNavigate();
        playCardFlipCue({ toFlipped: nextFlipped, finish: activeFinish });
        resetTiltVars();
        setIsFlipped(nextFlipped);
        triggerFoilSweep();
        return;
      }

      if (session.isTouch) {
        resetTiltVars();
      } else if (cardStageRef.current) {
        cardStageRef.current.style.setProperty('--card-scale', '1');
      }
    };

    const handleCardPointerLeave = () => {
      pointerSessionRef.current.active = false;
      setIsInteracting(false);
      resetTiltVars();
    };

    const flipToRecords = (tab = recordTab) => {
      if (isEditingName) cancelNameEdit();
      hapticNavigate();
      playCardFlipCue({ toFlipped: true, finish: activeFinish });
      setRecordTab(tab);
      resetTiltVars();
      setIsFlipped(true);
      triggerFoilSweep();
    };

    const flipToFront = () => {
      hapticNavigate();
      playCardFlipCue({ toFlipped: false, finish: activeFinish });
      resetTiltVars();
      setIsFlipped(false);
      triggerFoilSweep();
    };

    const unlockedStations = maq?.unlockedStations || [0];
    const frontierIdx = Math.max(...unlockedStations) + 1;

    const getHeatCellClass = (count, isToday) => {
      const ring = isToday
        ? isLightCard
          ? 'ring-1 ring-[#986f2c]/70'
          : 'ring-1 ring-[#e0bc72]/70'
        : '';
      if (isLightCard) {
        if (count === 0) return `bg-black/[0.05] ${ring}`;
        if (count <= 2) return `bg-[#986f2c]/35 ${ring}`;
        if (count <= 4) return `bg-[#986f2c]/65 ${ring}`;
        return `bg-[#986f2c] ${ring}`;
      }
      if (count === 0) return `bg-white/[0.055] ${ring}`;
      if (count <= 2) return `bg-[#e0bc72]/35 ${ring}`;
      if (count <= 4) return `bg-[#e0bc72]/65 ${ring}`;
      return `bg-[#e0bc72] ${ring}`;
    };

    const dockIconClass = `shrink-0 ${isLightMode ? 'text-[#845f22]' : 'text-[#dfba70]'}`;
    const dockMainText = isLightMode ? 'text-[#1c1813]' : 'text-[rgba(246,240,228,0.95)]';
    const dockSubText = isLightMode ? 'text-[#473e33]' : 'text-[rgba(228,218,200,0.68)]';

    const utilityItems = [
      {
        id: 'duas',
        label: 'Duas',
        ariaLabel: 'Duas',
        count: devotionData.favoriteDuaIds?.length || 0,
        icon: <BookIcon size={13} className={dockIconClass} />,
        onClick: onOpenDuas,
      },
      {
        id: 'qada',
        label: 'Qada',
        ariaLabel: 'Qada',
        count: qadaRemainingCount,
        icon: <RotateCcwIcon size={13} className={dockIconClass} />,
        onClick: onOpenQada,
      },
      {
        id: 'saved',
        label: 'Saved',
        ariaLabel: 'Saved',
        count: devotionData.savedVerses?.length || 0,
        icon: <BookmarkIcon size={13} className={dockIconClass} />,
        onClick: onOpenArchive,
      },
      {
        id: 'alerts',
        label: 'Alerts',
        ariaLabel: 'Alerts',
        count: enabledAlertsCount,
        icon: <BellIcon size={13} className={dockIconClass} />,
        onClick: onOpenReminders,
      },
      {
        id: 'settings',
        label: 'Settings',
        ariaLabel: 'Preferences & Backup',
        count: null,
        icon: <SettingsIcon size={13} className={dockIconClass} />,
        onClick: onOpenSettings,
      },
    ];

    const stationAccent = isLightCard ? '#845f22' : accentHex || '#e4c078';

    return (
      <div className="w-full max-w-[336px] sm:max-w-[470px] md:max-w-[656px] mx-auto px-1 sm:px-2 flex flex-col items-center justify-center gap-2.5 md:gap-3">
        {/* 3D INTERACTIVE ILLUMINATED SANCTUARY PASS / ID CARD */}
        <div
          ref={cardStageRef}
          onPointerDown={handleCardPointerDown}
          onPointerMove={handleCardPointerMove}
          onPointerUp={handleCardPointerUp}
          onPointerCancel={handleCardPointerLeave}
          onPointerLeave={handleCardPointerLeave}
          data-testid="seeker-id-card"
          data-flipped={isFlipped ? 'true' : 'false'}
          data-finish={activeFinish}
          data-sweep-count={sweepTick}
          className="profile-card-scene w-full relative select-none"
          style={{
            '--card-rx': '0deg',
            '--card-ry': '0deg',
            '--card-scale': '1',
            '--foil-x': '50%',
            '--foil-y': '35%',
            '--foil-o': '0',
            '--holo-angle': '130deg',
            '--px': '0px',
            '--py': '0px',
          }}
        >
          <div className={`profile-card-tilt ${isInteracting ? 'is-interacting' : ''}`}>
            <div className={`profile-card-flipper ${isFlipped ? 'is-flipped' : ''}`}>
              {/* ================= FRONT FACE: ILLUMINATED SEEKER SANCTUARY PASS ================= */}
              <article
                aria-label="Seeker Sanctuary Pass"
                aria-hidden={isFlipped}
                inert={isFlipped}
                className={`profile-card-face profile-card-front relative w-full rounded-[24px] md:rounded-[26px] border overflow-hidden transition-[background,border-color,box-shadow] duration-500 ${cardTheme.outerBorder}`}
                style={cardTheme.surfaceStyle}
              >
                {/* Procedural Geometric Guilloché Security Lattice (Deep Parallax Layer) */}
                <GuillochePatternLayer
                  patternId={`${patternBaseId}-front`}
                  strokeColor={cardTheme.latticeColor}
                />

                {/* Pointer & Gyro-Driven Specular Foil Glare */}
                <div
                  aria-hidden="true"
                  className="profile-card-foil absolute inset-0 pointer-events-none z-20"
                  style={{ background: cardTheme.foilGradient }}
                />

                {/* Directional Metallic Rim Catchlight */}
                <div
                  aria-hidden="true"
                  className="profile-card-rim absolute inset-0 rounded-[24px] md:rounded-[26px] pointer-events-none z-20"
                />

                {/* Ceremonial Diagonal Foil Sweep (on seal tap, flip, or finish switch) */}
                {sweepTick > 0 && (
                  <div
                    key={`front-sweep-${sweepTick}`}
                    aria-hidden="true"
                    className="profile-card-sweep absolute inset-y-0 -left-1/3 w-2/3 pointer-events-none z-20"
                    style={{
                      background: isLightCard
                        ? 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.72) 48%, rgba(202,160,82,0.22) 60%, transparent 100%)'
                        : 'linear-gradient(90deg, transparent 0%, rgba(242,212,140,0.26) 48%, rgba(255,250,235,0.42) 54%, transparent 100%)',
                    }}
                  />
                )}

                {/* Tactile Specular Touch / Click Light Ripple */}
                {pressRipple && !isFlipped && (
                  <span
                    key={pressRipple.id}
                    aria-hidden="true"
                    className="profile-card-ripple absolute w-40 h-40 rounded-full pointer-events-none z-20"
                    style={{
                      left: `${pressRipple.xPct}%`,
                      top: `${pressRipple.yPct}%`,
                      background: isLightCard
                        ? 'radial-gradient(circle, rgba(168,125,50,0.24) 0%, rgba(255,255,255,0.34) 45%, transparent 72%)'
                        : 'radial-gradient(circle, rgba(235,198,118,0.26) 0%, rgba(210,162,75,0.08) 46%, transparent 72%)',
                    }}
                  />
                )}

                {/* Engraved Inner Frame + Architectural Corner Brackets */}
                <div
                  aria-hidden="true"
                  className={`absolute inset-[9px] rounded-[17px] md:rounded-[18px] border pointer-events-none z-0 ${cardTheme.innerFrameBorder}`}
                />
                <CornerBrackets color={cardTheme.cornerColor} />

                {/* FRONT CARD CONTENT */}
                <div className="relative z-10 flex flex-col justify-between min-h-[418px] md:min-h-[396px]">
                  <div className="flex-1 flex flex-col justify-between px-4 pt-4 pb-3 sm:px-5 sm:pt-5 md:px-6 md:pt-5 md:pb-3.5">
                    {/* 1. Authority Header Strip */}
                    <div
                      className={`flex items-center justify-between gap-2 pb-2.5 border-b ${cardTheme.hairline}`}
                    >
                      <div className="flex items-center gap-1.5 sm:gap-2.5 flex-1 min-w-0">
                        <span
                          className={`font-calligraphy text-[18px] sm:text-[20px] md:text-[23px] leading-none shrink-0 ${cardTheme.textGold}`}
                          dir="rtl"
                        >
                          رُوح
                        </span>
                        <span
                          aria-hidden="true"
                          className="h-3.5 sm:h-4 w-[1px] shrink-0"
                          style={{ backgroundColor: cardTheme.cornerColor }}
                        />
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span
                              className={`font-serif-eng text-[8.5px] sm:text-[9.5px] md:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.22em] leading-none truncate font-medium ${cardTheme.textMain}`}
                            >
                              Sanctuary Pass
                            </span>
                            <span
                              className={`hidden md:inline font-calligraphy text-[13px] leading-none opacity-75 ${cardTheme.textGold}`}
                              dir="rtl"
                            >
                              بطاقة السالك
                            </span>
                          </div>
                          <span
                            className={`font-mono text-[7.5px] sm:text-[8.5px] tabular-nums tracking-[0.06em] sm:tracking-[0.12em] leading-none mt-1 truncate ${cardTheme.textSub} opacity-75`}
                          >
                            {passId}
                            <span className="hidden sm:inline"> · Est. {joinedYear}</span>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <HolographicRubElHizbSeal
                          accentHex={rewardHex}
                          className="hidden sm:flex"
                          onShimmer={() => {
                            hapticDetent();
                            triggerFoilSweep();
                          }}
                        />
                        <button
                          type="button"
                          data-testid="flip-to-records"
                          data-flip-trigger="true"
                          aria-label="Flip card to view devotion records"
                          onClick={() => flipToRecords(recordTab)}
                          className={`min-h-[32px] sm:min-h-[36px] px-2 sm:px-3 rounded-xl border flex items-center gap-1 sm:gap-1.5 font-serif-eng text-[8px] sm:text-[9.5px] uppercase tracking-[0.09em] sm:tracking-[0.16em] whitespace-nowrap shrink-0 transition-colors cursor-pointer ${cardTheme.buttonClass}`}
                        >
                          <FlipIcon size={11} />
                          <span>Records</span>
                        </button>
                      </div>
                    </div>

                    {/* 2. Identity Core: Sculpted Mihrab Portrait (Left, Floating Parallax) + Credential Specs (Right) */}
                    <div className="flex flex-col gap-3 py-3 md:py-4">
                      <div className="grid grid-cols-[84px_1fr] sm:grid-cols-[98px_1fr] md:grid-cols-[120px_1fr] gap-3.5 sm:gap-5 md:gap-6 items-center">
                        {/* Left: Mihrab-Arched Portrait Window */}
                        <div className="profile-card-parallax-float">
                          <MihrabPortraitWindow
                            initials={initials}
                            stationNumeral={stationNumeral}
                            stationArabic={currentStationData?.name}
                            ringCircumference={ringCircumference}
                            ringDashOffset={ringProgress.dashOffset}
                            cardTheme={cardTheme}
                            onClick={startEditingName}
                          />
                        </div>

                        {/* Right: Holder Name (Inline Editable) + Credential Fields + Desktop Ledger */}
                        <div className="min-w-0 flex flex-col gap-2.5">
                          {/* Holder Name & Inline Personalization */}
                          <div className="min-w-0">
                            <span
                              className={`block font-serif-eng text-[7.5px] sm:text-[8px] uppercase tracking-[0.18em] leading-none mb-1 ${cardTheme.textSub} opacity-65`}
                            >
                              Holder
                            </span>

                            {isEditingName ? (
                              <form
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  commitNameEdit();
                                }}
                                className="flex items-center gap-1.5"
                              >
                                <input
                                  ref={nameInputRef}
                                  type="text"
                                  maxLength={28}
                                  value={nameDraft}
                                  onChange={(e) => setNameDraft(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Escape') {
                                      e.preventDefault();
                                      cancelNameEdit();
                                    }
                                  }}
                                  aria-label="Seeker name"
                                  placeholder="Your name"
                                  className={`min-w-0 flex-1 h-8 px-2.5 rounded-lg border font-serif-eng text-[15px] md:text-[17px] outline-none transition-colors ${cardTheme.inputClass}`}
                                />
                                <button
                                  type="submit"
                                  className={`h-8 px-2.5 rounded-lg border font-serif-eng text-[9px] uppercase tracking-[0.14em] whitespace-nowrap cursor-pointer transition-colors ${cardTheme.buttonClass}`}
                                >
                                  Save
                                </button>
                              </form>
                            ) : (
                              <div className="flex items-center gap-1.5 min-w-0">
                                <button
                                  type="button"
                                  onClick={startEditingName}
                                  aria-label={`Edit holder name ${holderName}`}
                                  className="group/name inline-flex items-center gap-1.5 min-w-0 text-left cursor-pointer focus:outline-none focus-visible:underline"
                                >
                                  <h2
                                    className={`font-serif-eng text-[19px] sm:text-[24px] md:text-[28px] font-medium leading-[1.1] tracking-[0.015em] truncate ${cardTheme.textMain}`}
                                  >
                                    {holderName}
                                  </h2>
                                  <EditPenIcon
                                    size={12}
                                    className={`shrink-0 opacity-45 group-hover/name:opacity-95 transition-opacity ${cardTheme.textGold}`}
                                  />
                                </button>
                              </div>
                            )}

                            <p
                              className={`font-serif-eng italic text-[11px] md:text-[12.5px] leading-snug mt-0.5 truncate ${cardTheme.textGold}`}
                            >
                              {currentStationData?.subtitle || 'The First Station'}
                              {totalHabitsCount > 0
                                ? ` · ${completedHabitsCount}/${totalHabitsCount} Habits`
                                : ''}
                            </p>
                          </div>

                          {/* Yaqeen & Station Progress Hairline */}
                          <div>
                            <div className="flex items-center justify-between text-[8px] sm:text-[8.5px] font-serif-eng uppercase tracking-[0.14em] sm:tracking-[0.16em] mb-1">
                              <span className={`${cardTheme.textSub} opacity-78 truncate`}>
                                {currentStationData?.nameEn || 'Patience'} · Yaqeen
                              </span>
                              <span
                                className={`tabular-nums font-medium shrink-0 ml-2 ${cardTheme.textGold}`}
                              >
                                {yaqeenPct}%
                              </span>
                            </div>
                            <div
                              className={`w-full h-[3px] rounded-full overflow-hidden ${cardTheme.trackBgClass}`}
                            >
                              <div
                                className="h-full w-full origin-left rounded-full transition-transform duration-700 ease-out"
                                style={{
                                  transform: `scaleX(${Math.max(0.025, yaqeenPct / 100)})`,
                                  backgroundColor: rewardHex,
                                }}
                              />
                            </div>
                          </div>

                          {/* Desktop 4-Column Interactive Credential Ledger (md+) */}
                          <div
                            className={`hidden md:grid grid-cols-4 divide-x pt-2 border-t ${cardTheme.subtleDivider} ${cardTheme.divideClass}`}
                          >
                            <button
                              type="button"
                              data-flip-trigger="true"
                              onClick={() => flipToRecords('streak')}
                              className="flex flex-col items-start pr-2 text-left cursor-pointer group focus:outline-none"
                              aria-label={`Streak ${devotionData.currentStreak} days — view streak records`}
                            >
                              <span
                                className={`font-serif-eng text-[19px] leading-none font-light tabular-nums flex items-center gap-1 ${cardTheme.textMain} group-hover:opacity-80 transition-opacity`}
                              >
                                {devotionData.currentStreak}d
                                {streakStatus.todayActive && (
                                  <FlameIcon size={12} filled style={{ color: rewardHex }} />
                                )}
                              </span>
                              <span
                                className={`font-serif-eng text-[8px] uppercase tracking-[0.15em] mt-1 ${cardTheme.textSub} opacity-72`}
                              >
                                Streak
                              </span>
                            </button>

                            <button
                              type="button"
                              data-flip-trigger="true"
                              onClick={() => flipToRecords('path')}
                              className="flex flex-col items-start px-2.5 text-left cursor-pointer group focus:outline-none"
                              aria-label={`${devotionData.totalPrayers} total prayers — view path records`}
                            >
                              <span
                                className={`font-serif-eng text-[19px] leading-none font-light tabular-nums ${cardTheme.textMain} group-hover:opacity-80 transition-opacity`}
                              >
                                {devotionData.totalPrayers}
                              </span>
                              <span
                                className={`font-serif-eng text-[8px] uppercase tracking-[0.15em] mt-1 ${cardTheme.textSub} opacity-72`}
                              >
                                Prayers
                              </span>
                            </button>

                            <button
                              type="button"
                              data-flip-trigger="true"
                              onClick={() => flipToRecords('path')}
                              className="flex flex-col items-start px-2.5 text-left cursor-pointer group focus:outline-none"
                              aria-label={`${devotionData.totalVerses} verses reflected — view path records`}
                            >
                              <span
                                className={`font-serif-eng text-[19px] leading-none font-light tabular-nums ${cardTheme.textMain} group-hover:opacity-80 transition-opacity`}
                              >
                                {devotionData.totalVerses}
                              </span>
                              <span
                                className={`font-serif-eng text-[8px] uppercase tracking-[0.15em] mt-1 ${cardTheme.textSub} opacity-72`}
                              >
                                Verses
                              </span>
                            </button>

                            <button
                              type="button"
                              data-flip-trigger="true"
                              onClick={() => flipToRecords('badges')}
                              className="flex flex-col items-start pl-2.5 text-left cursor-pointer group focus:outline-none"
                              aria-label={`${devotionData.unlockedBadgeCount} of ${devotionData.totalBadgeCount} badges earned — view badges`}
                            >
                              <span
                                className={`font-serif-eng text-[19px] leading-none font-light tabular-nums ${cardTheme.textMain} group-hover:opacity-80 transition-opacity`}
                              >
                                {devotionData.unlockedBadgeCount}/{devotionData.totalBadgeCount}
                              </span>
                              <span
                                className={`font-serif-eng text-[8px] uppercase tracking-[0.15em] mt-1 ${cardTheme.textSub} opacity-72`}
                              >
                                Badges
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Mobile Full-Width 4-Column Credential Ledger */}
                      <div
                        className={`grid md:hidden grid-cols-4 divide-x pt-2.5 border-t ${cardTheme.subtleDivider} ${cardTheme.divideClass}`}
                      >
                        <button
                          type="button"
                          data-flip-trigger="true"
                          onClick={() => flipToRecords('streak')}
                          className="flex flex-col items-center justify-center px-1 text-center cursor-pointer"
                          aria-label={`Streak ${devotionData.currentStreak} days — view streak records`}
                        >
                          <span
                            className={`font-serif-eng text-[16px] leading-none font-light tabular-nums flex items-center gap-0.5 ${cardTheme.textMain}`}
                          >
                            {devotionData.currentStreak}d
                            {streakStatus.todayActive && (
                              <FlameIcon size={11} filled style={{ color: rewardHex }} />
                            )}
                          </span>
                          <span
                            className={`font-serif-eng text-[7.5px] uppercase tracking-[0.12em] mt-1 whitespace-nowrap ${cardTheme.textSub} opacity-72`}
                          >
                            Streak
                          </span>
                        </button>

                        <button
                          type="button"
                          data-flip-trigger="true"
                          onClick={() => flipToRecords('path')}
                          className="flex flex-col items-center justify-center px-1 text-center cursor-pointer"
                          aria-label={`${devotionData.totalPrayers} total prayers — view path records`}
                        >
                          <span
                            className={`font-serif-eng text-[16px] leading-none font-light tabular-nums ${cardTheme.textMain}`}
                          >
                            {devotionData.totalPrayers}
                          </span>
                          <span
                            className={`font-serif-eng text-[7.5px] uppercase tracking-[0.12em] mt-1 whitespace-nowrap ${cardTheme.textSub} opacity-72`}
                          >
                            Prayers
                          </span>
                        </button>

                        <button
                          type="button"
                          data-flip-trigger="true"
                          onClick={() => flipToRecords('path')}
                          className="flex flex-col items-center justify-center px-1 text-center cursor-pointer"
                          aria-label={`${devotionData.totalVerses} verses reflected — view path records`}
                        >
                          <span
                            className={`font-serif-eng text-[16px] leading-none font-light tabular-nums ${cardTheme.textMain}`}
                          >
                            {devotionData.totalVerses}
                          </span>
                          <span
                            className={`font-serif-eng text-[7.5px] uppercase tracking-[0.12em] mt-1 whitespace-nowrap ${cardTheme.textSub} opacity-72`}
                          >
                            Verses
                          </span>
                        </button>

                        <button
                          type="button"
                          data-flip-trigger="true"
                          onClick={() => flipToRecords('badges')}
                          className="flex flex-col items-center justify-center px-1 text-center cursor-pointer"
                          aria-label={`${devotionData.unlockedBadgeCount} of ${devotionData.totalBadgeCount} badges earned — view badges`}
                        >
                          <span
                            className={`font-serif-eng text-[16px] leading-none font-light tabular-nums ${cardTheme.textMain}`}
                          >
                            {devotionData.unlockedBadgeCount}/{devotionData.totalBadgeCount}
                          </span>
                          <span
                            className={`font-serif-eng text-[7.5px] uppercase tracking-[0.12em] mt-1 whitespace-nowrap ${cardTheme.textSub} opacity-72`}
                          >
                            Badges
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* 3. Lower Passport Stamp Band: 7-Day Rolling Cadence + Rest Day Protection */}
                    <div className={`pt-2.5 border-t ${cardTheme.hairline}`}>
                      <div className="flex items-center justify-between gap-1.5 sm:gap-2 mb-1.5">
                        <span
                          className={`font-serif-eng text-[7.5px] sm:text-[9px] tracking-[0.09em] sm:tracking-[0.14em] uppercase truncate ${cardTheme.textSub} opacity-80`}
                        >
                          {selectedDay
                            ? formatDaySummary(selectedDay)
                            : `${streakStatus.todayActive ? 'Lit Today' : streakStatus.todayPaused ? 'Streak Protected' : '7-Day Cadence'} · Best ${streakStatus.longestStreak}d`}
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            hapticToggle(!isTodayPauseStored);
                            devotionData.toggleStreakPauseToday?.();
                          }}
                          aria-pressed={isTodayPauseStored}
                          aria-label={
                            isTodayPauseStored
                              ? 'Resume streak tracking today'
                              : 'Rest or exempt day — protect streak'
                          }
                          className={`min-h-[25px] sm:min-h-[26px] px-2 sm:px-2.5 rounded-lg border font-serif-eng text-[7.5px] sm:text-[8.5px] uppercase tracking-[0.09em] sm:tracking-[0.12em] flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                            isTodayPauseStored
                              ? isLightCard
                                ? 'bg-[#0d9488]/12 border-[#0d9488]/40 text-[#0d9488]'
                                : 'bg-[#14b8a6]/16 border-[#2dd4bf]/45 text-[#34d399]'
                              : cardTheme.buttonClass
                          }`}
                        >
                          <MoonIcon size={10} />
                          <span>{isTodayPauseStored ? 'Protected' : 'Rest Day'}</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-7 gap-1 items-center">
                        {streakStatus.weekDays.map((day, idx) => {
                          const prev = idx > 0 ? streakStatus.weekDays[idx - 1] : null;
                          const next =
                            idx < streakStatus.weekDays.length - 1
                              ? streakStatus.weekDays[idx + 1]
                              : null;
                          const connectLeft = Boolean(
                            prev && (prev.active || prev.paused) && (day.active || day.paused)
                          );
                          const connectRight = Boolean(
                            next && (next.active || next.paused) && (day.active || day.paused)
                          );
                          const isSelected = selectedDateStr === day.dateStr;

                          return (
                            <button
                              key={day.dateStr}
                              type="button"
                              onClick={() => {
                                hapticDetent();
                                setSelectedDateStr((cur) =>
                                  cur === day.dateStr ? null : day.dateStr
                                );
                              }}
                              aria-pressed={isSelected}
                              aria-label={formatDaySummary(day)}
                              className={`flex flex-col items-center gap-1 py-1 rounded-xl transition-colors cursor-pointer ${
                                isSelected ? cardTheme.selectedRowClass : cardTheme.hoverRowClass
                              }`}
                            >
                              <span
                                className={`font-serif-eng text-[8.5px] uppercase tracking-[0.1em] leading-none ${
                                  day.isToday
                                    ? 'font-semibold'
                                    : `${cardTheme.textSub} opacity-62`
                                }`}
                                style={{ color: day.isToday ? rewardHex : undefined }}
                              >
                                {day.dayShort}
                              </span>

                              <div className="relative w-full h-6 flex items-center justify-center">
                                {connectLeft && (
                                  <span
                                    aria-hidden="true"
                                    className="absolute left-0 right-1/2 top-1/2 -translate-y-1/2 h-[1.5px]"
                                    style={{
                                      backgroundColor:
                                        day.paused || prev?.paused ? pauseHex : rewardHex,
                                      opacity: 0.45,
                                    }}
                                  />
                                )}
                                {connectRight && (
                                  <span
                                    aria-hidden="true"
                                    className="absolute left-1/2 right-0 top-1/2 -translate-y-1/2 h-[1.5px]"
                                    style={{
                                      backgroundColor:
                                        day.paused || next?.paused ? pauseHex : rewardHex,
                                      opacity: 0.45,
                                    }}
                                  />
                                )}
                                <span
                                  className={`relative z-10 w-[21px] h-[21px] rounded-full flex items-center justify-center transition-colors ${
                                    day.tier === 3
                                      ? ''
                                      : day.paused || day.isToday
                                        ? 'border border-dashed'
                                        : day.active
                                          ? 'border'
                                          : `border ${
                                              isLightCard
                                                ? 'border-[#9c7533]/22 bg-[#fbf8f1]'
                                                : 'border-white/14 bg-black/25'
                                            }`
                                  }`}
                                  style={{
                                    backgroundColor:
                                      day.tier === 3
                                        ? rewardHex
                                        : day.paused
                                          ? isLightCard
                                            ? 'rgba(13,148,136,0.12)'
                                            : 'rgba(52,211,153,0.15)'
                                          : day.tier >= 1
                                            ? isLightCard
                                              ? '#f0e4cd'
                                              : 'rgba(224,188,114,0.16)'
                                            : undefined,
                                    borderColor: day.paused
                                      ? pauseHex
                                      : day.active || day.isToday
                                        ? rewardHex
                                        : undefined,
                                  }}
                                >
                                  {day.tier === 3 ? (
                                    <CheckCircleIcon
                                      size={11}
                                      className={isLightCard ? 'text-[#faf8f4]' : 'text-[#0c0e14]'}
                                    />
                                  ) : day.paused ? (
                                    <MoonIcon size={10} style={{ color: pauseHex }} />
                                  ) : day.active ? (
                                    <span
                                      className="w-1.5 h-1.5 rounded-full"
                                      style={{ backgroundColor: rewardHex }}
                                    />
                                  ) : day.isToday ? (
                                    <span
                                      className="w-1 h-1 rounded-full opacity-75"
                                      style={{ backgroundColor: rewardHex }}
                                    />
                                  ) : null}
                                </span>
                              </div>

                              <span
                                className={`font-serif-eng text-[8px] tabular-nums leading-none ${
                                  day.isToday
                                    ? 'font-semibold'
                                    : `${cardTheme.textSub} opacity-58`
                                }`}
                                style={{ color: day.isToday ? rewardHex : undefined }}
                              >
                                {day.dayNum}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* 4. Archival Passport MRZ Engraved Micro-Band */}
                  <div
                    data-testid="card-mrz-strip"
                    className={`px-5 sm:px-7 py-2.5 border-t flex items-center justify-between gap-3 ${cardTheme.hairline} ${cardTheme.mrzBg}`}
                  >
                    <span
                      className={`font-mono text-[7.5px] sm:text-[8.5px] tracking-[0.12em] sm:tracking-[0.2em] uppercase truncate tabular-nums ${cardTheme.textSub} opacity-62`}
                    >
                      {mrzLine}
                    </span>
                    <span
                      className={`hidden sm:inline font-serif-eng text-[8px] uppercase tracking-[0.18em] whitespace-nowrap shrink-0 ${cardTheme.textGold} opacity-75`}
                    >
                      {hijri?.formatted || `${hijri?.year || 1448} AH`}
                    </span>
                  </div>
                </div>
              </article>

              {/* ================= BACK FACE: DEVOTION RECORDS (STREAK · BADGES · PATH) ================= */}
              <article
                aria-label="Seeker Devotion Records"
                aria-hidden={!isFlipped}
                inert={!isFlipped}
                className={`profile-card-face profile-card-back absolute inset-0 w-full rounded-[24px] md:rounded-[26px] border overflow-hidden transition-[background,border-color,box-shadow] duration-500 ${cardTheme.outerBorder}`}
                style={cardTheme.surfaceStyle}
              >
                <GuillochePatternLayer
                  patternId={`${patternBaseId}-back`}
                  strokeColor={cardTheme.latticeColor}
                />
                <div
                  aria-hidden="true"
                  className="profile-card-foil absolute inset-0 pointer-events-none z-20"
                  style={{ background: cardTheme.foilGradient }}
                />
                <div
                  aria-hidden="true"
                  className="profile-card-rim absolute inset-0 rounded-[24px] md:rounded-[26px] pointer-events-none z-20"
                />
                {sweepTick > 0 && (
                  <div
                    key={`back-sweep-${sweepTick}`}
                    aria-hidden="true"
                    className="profile-card-sweep absolute inset-y-0 -left-1/3 w-2/3 pointer-events-none z-20"
                    style={{
                      background: isLightCard
                        ? 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.68) 48%, rgba(202,160,82,0.2) 60%, transparent 100%)'
                        : 'linear-gradient(90deg, transparent 0%, rgba(242,212,140,0.24) 48%, rgba(255,250,235,0.38) 54%, transparent 100%)',
                    }}
                  />
                )}
                {pressRipple && isFlipped && (
                  <span
                    key={pressRipple.id}
                    aria-hidden="true"
                    className="profile-card-ripple absolute w-40 h-40 rounded-full pointer-events-none z-20"
                    style={{
                      left: `${100 - pressRipple.xPct}%`,
                      top: `${pressRipple.yPct}%`,
                      background: isLightCard
                        ? 'radial-gradient(circle, rgba(168,125,50,0.22) 0%, rgba(255,255,255,0.32) 45%, transparent 72%)'
                        : 'radial-gradient(circle, rgba(235,198,118,0.24) 0%, rgba(210,162,75,0.08) 46%, transparent 72%)',
                    }}
                  />
                )}
                <div
                  aria-hidden="true"
                  className={`absolute inset-[9px] rounded-[17px] md:rounded-[18px] border pointer-events-none z-0 ${cardTheme.innerFrameBorder}`}
                />
                <CornerBrackets color={cardTheme.cornerColor} />

                <div className="relative z-10 flex flex-col h-full">
                  {/* Brushed Reverse Signature / Navigation Band */}
                  <div
                    data-testid="back-header-bar"
                    className={`flex items-center justify-between gap-2 px-4 pt-4 pb-3 sm:px-6 border-b ${cardTheme.hairline} ${cardTheme.bandBg}`}
                  >
                    <div
                      role="tablist"
                      aria-label="Devotion Record Sections"
                      className="flex items-center gap-0.5 sm:gap-1.5 min-w-0"
                    >
                      {[
                        { id: 'streak', label: 'Streak', desktopSuffix: null },
                        {
                          id: 'badges',
                          label: 'Badges',
                          desktopSuffix: ` · ${devotionData.unlockedBadgeCount}/${devotionData.totalBadgeCount}`,
                        },
                        { id: 'path', label: 'Path', desktopSuffix: null },
                      ].map((tab) => {
                        const active = recordTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            role="tab"
                            aria-selected={active}
                            onClick={() => {
                              if (recordTab !== tab.id) {
                                hapticDetent();
                                setRecordTab(tab.id);
                              }
                            }}
                            className={`relative min-h-[32px] sm:min-h-[34px] px-2 sm:px-2.5 rounded-lg font-serif-eng text-[8px] sm:text-[9.5px] md:text-[10px] uppercase tracking-[0.07em] sm:tracking-[0.14em] whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                              active ? cardTheme.tabActiveClass : cardTheme.tabIdleClass
                            }`}
                          >
                            <span>{tab.label}</span>
                            {tab.desktopSuffix && (
                              <span className="hidden sm:inline tabular-nums">
                                {tab.desktopSuffix}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      data-testid="flip-to-front"
                      data-flip-trigger="true"
                      aria-label="Flip card back to Sanctuary Pass front"
                      title="Flip to Front"
                      onClick={flipToFront}
                      className={`min-h-[32px] min-w-[32px] sm:min-h-[34px] px-2 sm:px-3 rounded-xl border flex items-center justify-center gap-1.5 font-serif-eng text-[9px] sm:text-[9.5px] uppercase tracking-[0.14em] whitespace-nowrap shrink-0 transition-colors cursor-pointer ${cardTheme.buttonClass}`}
                    >
                      <FlipIcon size={12} />
                      <span className="hidden sm:inline">Front</span>
                    </button>
                  </div>

                  {/* Back Content Panel */}
                  <div className="flex-1 min-h-0 flex flex-col justify-between px-5 py-4 sm:px-6 overflow-y-auto hide-scrollbar">
                    {/* TAB 1: STREAK MILESTONES */}
                    {recordTab === 'streak' && (
                      <div className="flex flex-col justify-center gap-5 my-auto h-full">
                        {/* Unified Upper Block: Current Streak Summary + Next Milestone Progress */}
                        <div className="flex flex-col gap-4">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className="w-10 h-10 rounded-full border flex items-center justify-center shrink-0"
                                style={{
                                  backgroundColor: streakStatus.todayActive
                                    ? `${rewardHex}1c`
                                    : 'transparent',
                                  borderColor: streakStatus.todayActive
                                    ? `${rewardHex}58`
                                    : isLightCard
                                      ? 'rgba(152,111,44,0.22)'
                                      : 'rgba(255,255,255,0.14)',
                                }}
                              >
                                <FlameIcon
                                  size={18}
                                  filled={streakStatus.todayActive}
                                  style={{
                                    color:
                                      streakStatus.todayActive || streakStatus.atRisk
                                        ? rewardHex
                                        : undefined,
                                  }}
                                  className={
                                    streakStatus.todayActive || streakStatus.atRisk
                                      ? ''
                                      : `${cardTheme.textSub} opacity-45`
                                  }
                                />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-baseline gap-1.5">
                                  <span
                                    className={`font-serif-eng text-[26px] leading-none font-normal tabular-nums ${cardTheme.textMain}`}
                                  >
                                    {streakStatus.currentStreak}
                                  </span>
                                  <span
                                    className={`font-serif-eng text-[9.5px] uppercase tracking-[0.14em] leading-none ${cardTheme.textSub} opacity-82`}
                                  >
                                    {streakStatus.currentStreak === 1 ? 'Day' : 'Days'} · Best{' '}
                                    {streakStatus.longestStreak}d
                                  </span>
                                </div>
                                <p
                                  className={`font-serif-eng italic text-[11px] leading-snug truncate mt-1 ${cardTheme.textSub} opacity-80`}
                                >
                                  {streakStatus.headline}
                                </p>
                              </div>
                            </div>

                            <span
                              className="font-calligraphy text-[20px] leading-none shrink-0"
                              style={{ color: rewardHex }}
                              dir="rtl"
                            >
                              {streakStatus.activeMilestone
                                ? streakStatus.activeMilestone.arabic
                                : 'مُواظَبَة'}
                            </span>
                          </div>

                          <div>
                            <div className="flex items-center justify-between text-[8.5px] sm:text-[9px] font-serif-eng uppercase tracking-[0.13em] mb-1.5">
                              <span className={`${cardTheme.textSub} opacity-78 truncate`}>
                                Next · {streakStatus.nextMilestone.title} (
                                {streakStatus.nextMilestone.days}d)
                              </span>
                              <span
                                className="tabular-nums font-medium shrink-0 ml-2"
                                style={{ color: rewardHex }}
                              >
                                {streakStatus.currentStreak}/{streakStatus.nextMilestone.days}d
                              </span>
                            </div>
                            <div
                              className={`w-full h-[4px] rounded-full overflow-hidden ${cardTheme.trackBgClass}`}
                            >
                              <div
                                className="h-full w-full origin-left rounded-full transition-transform duration-500"
                                style={{
                                  transform: `scaleX(${Math.max(0.025, streakStatus.progressToNextPct / 100)})`,
                                  backgroundColor: rewardHex,
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Lower Block: 7 Consistency Milestone Seals */}
                        <div className={`pt-4 border-t ${cardTheme.subtleDivider}`}>
                          <div className="flex items-center justify-between mb-2">
                            <span
                              className={`font-serif-eng text-[8.5px] uppercase tracking-[0.16em] ${cardTheme.textSub} opacity-78`}
                            >
                              Consistency Seals
                            </span>
                            <span
                              className={`font-serif-eng text-[8.5px] tabular-nums ${cardTheme.textSub} opacity-72`}
                            >
                              {streakStatus.unlockedMilestoneIds.length}/{STREAK_MILESTONES.length}{' '}
                              earned
                            </span>
                          </div>

                          <div className="grid grid-cols-7 gap-1">
                            {STREAK_MILESTONES.map((milestone) => {
                              const unlocked = streakStatus.unlockedMilestoneIds.includes(
                                milestone.id
                              );
                              const isSelected = selectedMilestoneId === milestone.id;
                              return (
                                <button
                                  key={milestone.id}
                                  type="button"
                                  onClick={() => {
                                    hapticDetent();
                                    setSelectedMilestoneId((cur) =>
                                      cur === milestone.id ? null : milestone.id
                                    );
                                  }}
                                  aria-pressed={isSelected}
                                  aria-label={`${milestone.title} milestone (${milestone.days} days) — ${unlocked ? 'Earned' : 'Locked'}`}
                                  className={`min-h-[44px] rounded-xl flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
                                    isSelected ? cardTheme.selectedRowClass : cardTheme.hoverRowClass
                                  }`}
                                >
                                  <SacredSealMark
                                    unlocked={unlocked}
                                    accentHex={rewardHex}
                                    isLightCard={isLightCard}
                                  />
                                  <span
                                    className={`font-serif-eng text-[8px] tabular-nums leading-none ${
                                      unlocked ? 'font-medium' : `${cardTheme.textSub} opacity-65`
                                    }`}
                                    style={{ color: unlocked ? rewardHex : undefined }}
                                  >
                                    {milestone.days}d
                                  </span>
                                </button>
                              );
                            })}
                          </div>

                          <p
                            className={`font-serif-eng italic text-[10.5px] text-center mt-2.5 truncate ${cardTheme.textSub} opacity-78`}
                          >
                            {selectedMilestone
                              ? `${selectedMilestone.title} (${selectedMilestone.days}d) · ${selectedMilestone.note}`
                              : 'Tap any seal to inspect its consistency milestone.'}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* TAB 2: COMPACT 9-MEDALLION VAULT */}
                    {recordTab === 'badges' && (
                      <div className="flex flex-col justify-between h-full gap-2">
                        <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5 my-auto">
                          {badgesByTier.flatMap(({ style, items }) =>
                            items.map((badge) => {
                              const isSelected = lockedPreviewId === badge.id;
                              return (
                                <button
                                  key={badge.id}
                                  type="button"
                                  onClick={() => {
                                    if (badge.unlocked) {
                                      hapticCelebrate();
                                      setLockedPreviewId(null);
                                      onInspectBadge?.(badge);
                                    } else {
                                      hapticDetent();
                                      setLockedPreviewId((cur) =>
                                        cur === badge.id ? null : badge.id
                                      );
                                    }
                                  }}
                                  aria-label={`${badge.title} (${style.label}) — ${
                                    badge.unlocked
                                      ? 'Earned, tap to celebrate'
                                      : `Locked, ${badge.current} of ${badge.target} ${badge.unitPlural}`
                                  }`}
                                  className={`rounded-xl px-1.5 py-2 sm:px-2.5 sm:py-2.5 flex flex-col sm:flex-row items-center text-center sm:text-left gap-1 sm:gap-2 transition-colors cursor-pointer ${
                                    badge.unlocked
                                      ? isLightCard
                                        ? 'bg-white/75 hover:bg-white'
                                        : 'bg-white/[0.055] hover:bg-white/[0.095]'
                                      : isSelected
                                        ? cardTheme.selectedRowClass
                                        : cardTheme.hoverRowClass
                                  }`}
                                >
                                  <div className="shrink-0">
                                    <BadgeArtwork
                                      motif={badge.motif}
                                      tier={badge.tier}
                                      unlocked={badge.unlocked}
                                      animated={false}
                                      showSheen={badge.unlocked}
                                      size={32}
                                      isLightMode={isLightCard}
                                    />
                                  </div>
                                  <div className="min-w-0 w-full flex flex-col items-center sm:items-start">
                                    <span
                                      className={`font-serif-eng text-[9px] sm:text-[10px] leading-tight truncate max-w-full ${
                                        badge.unlocked
                                          ? `${cardTheme.textMain} font-medium`
                                          : `${cardTheme.textSub} opacity-78`
                                      }`}
                                    >
                                      {badge.title}
                                    </span>
                                    <span
                                      className="font-serif-eng text-[7.5px] uppercase tracking-[0.1em] sm:tracking-[0.12em] tabular-nums mt-0.5 truncate"
                                      style={{
                                        color: badge.unlocked
                                          ? style.palette.text
                                          : isLightCard
                                            ? 'rgba(44,39,32,0.55)'
                                            : 'rgba(228,218,200,0.55)',
                                      }}
                                    >
                                      {badge.unlocked
                                        ? style.label
                                        : `${badge.current}/${badge.target}`}
                                    </span>
                                  </div>
                                </button>
                              );
                            })
                          )}
                        </div>

                        <div
                          className={`pt-2 border-t ${cardTheme.subtleDivider} flex items-center justify-between gap-3`}
                        >
                          {previewBadge && !previewBadge.unlocked ? (
                            <>
                              <p
                                className={`font-serif-eng italic text-[10px] sm:text-[10.5px] truncate ${cardTheme.textSub} opacity-85`}
                              >
                                {previewBadge.title}: {previewBadge.description}
                              </p>
                              <span
                                className="font-serif-eng text-[9px] tabular-nums font-medium shrink-0"
                                style={{
                                  color: getBadgeTierStyle(previewBadge.tier, isLightCard).palette
                                    .text,
                                }}
                              >
                                {previewBadge.current}/{previewBadge.target}
                              </span>
                            </>
                          ) : (
                            <>
                              <span
                                className={`font-serif-eng italic text-[10px] sm:text-[10.5px] truncate ${cardTheme.textSub} opacity-75`}
                              >
                                Tap earned medallions to celebrate, or locked seals to inspect.
                              </span>
                              <span
                                className="font-calligraphy text-[14px] leading-none shrink-0"
                                style={{
                                  color: isLightCard
                                    ? BADGE_TIERS.gold.light.text
                                    : BADGE_TIERS.gold.dark.text,
                                }}
                                dir="rtl"
                              >
                                أَوْسِمَة
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* TAB 3: MAQAMAT STATIONS & 14-WEEK CONSISTENCY */}
                    {recordTab === 'path' && (
                      <div className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-2.5 md:gap-3.5 items-center h-full">
                        <div
                          className={`divide-y ${
                            isLightCard ? 'divide-black/[0.07]' : 'divide-white/[0.07]'
                          }`}
                        >
                          {stations.map((station, idx) => {
                            const isCurrent = idx === maq?.currentStation;
                            const isUnlocked = unlockedStations.includes(idx);
                            const isFrontier = idx === frontierIdx;
                            return (
                              <button
                                key={station.id}
                                type="button"
                                disabled={!isUnlocked}
                                onClick={() => isUnlocked && onSelectStation?.(idx)}
                                className={`w-full min-h-[38px] md:min-h-[42px] px-2 py-1 md:py-1.5 flex items-center justify-between gap-2 text-left rounded-lg transition-colors ${
                                  isUnlocked
                                    ? `cursor-pointer ${cardTheme.hoverRowClass}`
                                    : 'cursor-default opacity-60'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <span
                                    className="w-2 h-2 rounded-full shrink-0"
                                    style={{
                                      backgroundColor: isCurrent
                                        ? stationAccent
                                        : isUnlocked
                                          ? `${stationAccent}75`
                                          : isLightCard
                                            ? 'rgba(0,0,0,0.2)'
                                            : 'rgba(255,255,255,0.24)',
                                    }}
                                  />
                                  <div className="min-w-0">
                                    <div
                                      className={`font-serif-eng text-[11.5px] md:text-[12px] leading-tight font-medium truncate ${
                                        isCurrent ? '' : cardTheme.textMain
                                      }`}
                                      style={{ color: isCurrent ? stationAccent : undefined }}
                                    >
                                      {station.nameEn || station.subtitle}
                                    </div>
                                    <div
                                      className={`font-serif-eng text-[8px] md:text-[8.5px] uppercase tracking-[0.12em] truncate ${cardTheme.textSub} opacity-68`}
                                    >
                                      {isCurrent
                                        ? 'Active Station'
                                        : isUnlocked
                                          ? 'Unlocked · Tap to enter'
                                          : isFrontier
                                            ? `${yaqeenPct}% Yaqeen to unveil`
                                            : 'Awaiting unveiling'}
                                    </div>
                                  </div>
                                </div>
                                <span
                                  className={`font-calligraphy text-[15px] md:text-[16px] leading-none shrink-0 ${
                                    isCurrent || isUnlocked ? '' : cardTheme.textSub
                                  }`}
                                  style={{
                                    color: isCurrent || isUnlocked ? stationAccent : undefined,
                                    opacity: isCurrent ? 1 : isUnlocked ? 0.85 : 0.72,
                                  }}
                                  dir="rtl"
                                >
                                  {station.name}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        <div
                          className={`pt-2.5 md:pt-0 md:pl-3.5 border-t md:border-t-0 md:border-l ${cardTheme.subtleDivider} flex flex-col justify-center`}
                        >
                          <div className="flex items-center justify-between mb-1.5 md:mb-2">
                            <span
                              className={`font-serif-eng text-[8.5px] uppercase tracking-[0.16em] ${cardTheme.textSub} opacity-78`}
                            >
                              Consistency
                            </span>
                            <span
                              className={`font-serif-eng text-[8.5px] uppercase tracking-[0.12em] tabular-nums ${cardTheme.textSub} opacity-70`}
                            >
                              {devotionData.activeDays}{' '}
                              {devotionData.activeDays === 1 ? 'Active Day' : 'Active Days'}
                            </span>
                          </div>

                          <div className="flex justify-between gap-[3px] w-full">
                            {heatmapWeeks.map((week, wIdx) => (
                              <div key={wIdx} className="flex flex-col gap-[3px]">
                                {week.map((day) => (
                                  <div
                                    key={day.dateStr}
                                    className={`w-[8.5px] h-[8.5px] sm:w-[10px] sm:h-[10px] rounded-[2px] ${getHeatCellClass(
                                      day.count,
                                      day.isToday
                                    )}`}
                                    title={`${day.dateStr}: ${day.count} devotions`}
                                  />
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>

        {/* QUIET PERSONALIZATION & MATERIAL EDITION BAR (Unboxed editorial strip) */}
        <div className="w-full flex items-center justify-between gap-2 px-1.5 min-h-[26px]">
          <span
            className={`font-serif-eng italic text-[10.5px] sm:text-[11px] whitespace-nowrap truncate ${dockSubText} opacity-75`}
          >
            <span className="sm:hidden">Glide or swipe card</span>
            <span className="hidden sm:inline">Tilt or swipe card · Tap name to personalize</span>
          </span>

          <div
            role="radiogroup"
            aria-label="Card material finish"
            className="flex items-center gap-2 shrink-0"
          >
            {FINISH_SWATCHES.map((swatch) => {
              const selected = activeFinish === swatch.id;
              return (
                <button
                  key={swatch.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={swatch.ariaLabel}
                  title={swatch.label}
                  onClick={() => selectFinish(swatch.id)}
                  className="w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#dfba70]"
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full block transition-all duration-200"
                    style={{
                      background: swatch.swatchBg,
                      boxShadow: selected
                        ? `0 0 0 1.5px ${isLightMode ? '#faf7f1' : '#0b0e16'}, 0 0 0 3px ${swatch.ringColor}`
                        : `0 0 0 1px ${isLightMode ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.22)'}`,
                    }}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* SLIM UNIFIED SANCTUARY TOOLS DOCK (Single elevation, 5 quick triggers) */}
        <div
          aria-label="Sanctuary Tools"
          className={`w-full rounded-2xl border overflow-hidden grid grid-cols-5 divide-x transition-colors ${
            isLightMode
              ? 'bg-white/74 border-white/90 divide-black/[0.06] island-light'
              : 'bg-[#0b0e16]/76 border-white/[0.10] divide-white/[0.07] island-dark'
          }`}
        >
          {utilityItems.map(({ id, label, ariaLabel, count, icon, onClick }) => (
            <button
              key={id}
              type="button"
              aria-label={ariaLabel}
              onClick={() => {
                hapticNavigate();
                onClick?.();
              }}
              className={`min-h-[48px] px-1.5 sm:px-2.5 py-2 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 transition-colors cursor-pointer ${
                isLightMode ? 'hover:bg-black/[0.03]' : 'hover:bg-white/[0.04]'
              }`}
            >
              {icon}
              <span
                className={`font-serif-eng text-[8.5px] sm:text-[9.5px] uppercase tracking-[0.11em] whitespace-nowrap truncate ${dockMainText}`}
              >
                {label}
              </span>
              {count !== null && (
                <span
                  className={`hidden sm:inline font-serif-eng text-[9.5px] tabular-nums ${dockSubText} opacity-65`}
                >
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }
);
