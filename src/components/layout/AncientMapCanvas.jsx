import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  LESSON_ONE_LANDMARKS,
  LESSON_ONE_STORAGE_KEY,
  LESSON_ONE_VALID_IDS,
  LOCKED_FUTURE_LESSONS,
  MAP_BRIDGE_LANDMARK,
  MAP_WORLD_SIZE,
  PILLAR_GROUPS,
} from '../../data/learningPathData';
import {
  MAP_MAX_ZOOM,
  MAP_MIN_ZOOM,
  centerCameraOnPoint,
  clamp,
  clampMapCamera,
  computeLessonOneProgress,
  getAdjacentLandmarkId,
  getInitialMapZoom,
  getNextUndiscoveredLandmark,
  getRegionFocusPoint,
  groupLessonOnePillars,
  isPointerDragExceeded,
  markLandmarkDiscovered,
  parseDiscoveredLandmarks,
  resolveLandmarkPoint,
  zoomCameraAtCenter,
} from '../../utils/learningPathLogic';
import {
  hapticCelebrate,
  hapticDetent,
  hapticDismiss,
  hapticTapLight,
} from '../../utils/haptics';
import {
  AncientCartographyBackdrop,
  ArtifactVignetteThumbnail,
  SanctuaryBuildingMedallion,
} from './AncientMapGlyphs';

const CompassIcon = ({ size = 16, style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="9" />
    <polygon points="15.5 8.5 13.5 13.5 8.5 15.5 10.5 10.5 15.5 8.5" />
  </svg>
);

const LockIcon = ({ size = 13, style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.85"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
    aria-hidden="true"
  >
    <rect x="4" y="11" width="16" height="10" rx="2.5" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
);

const UnlockIcon = ({ size = 13, style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.85"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
    aria-hidden="true"
  >
    <rect x="4" y="11" width="16" height="10" rx="2.5" />
    <path d="M8 11V7a4 4 0 0 1 7.6-1.7" />
  </svg>
);

const CheckCircleIcon = ({ size = 14, style, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
    className={className}
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="m8.5 12.2 2.4 2.4 4.8-4.8" />
  </svg>
);

const XIcon = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.85"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const ChevronLeftIcon = ({ size = 15, style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
    aria-hidden="true"
  >
    <path d="m15 18-6-6 6-6" />
  </svg>
);

const ChevronRightIcon = ({ size = 15, style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
    aria-hidden="true"
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
);

const SparklesIcon = ({ size = 14, style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
    aria-hidden="true"
  >
    <path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" />
  </svg>
);

export const AncientMapCanvas = ({
  isLightMode = false,
  reducedMotion = false,
  onProgressChange,
}) => {
  const viewportRef = useRef(null);
  const dragStateRef = useRef({
    active: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    originCamX: 0,
    originCamY: 0,
    moved: false,
  });

  const [viewportSize, setViewportSize] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1440,
    height: typeof window !== 'undefined' ? window.innerHeight : 900,
  }));

  const [discoveredIds, setDiscoveredIds] = useState(() => {
    try {
      const raw = localStorage.getItem(LESSON_ONE_STORAGE_KEY);
      return parseDiscoveredLandmarks(raw, LESSON_ONE_VALID_IDS);
    } catch {
      return [];
    }
  });

  const [selectedId, setSelectedId] = useState(null);
  const [selectedLockedId, setSelectedLockedId] = useState(null);
  const [selectedGroupOverviewId, setSelectedGroupOverviewId] = useState(null);
  const [activeZone, setActiveZone] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < 768 ? 'islam' : 'all'
  );
  const [isDragging, setIsDragging] = useState(false);

  const [camera, setCamera] = useState(() => {
    const initialVp = {
      width: typeof window !== 'undefined' ? window.innerWidth : 1440,
      height: typeof window !== 'undefined' ? window.innerHeight : 900,
    };
    const isMobile = initialVp.width < 640;
    const initialZoom = isMobile
      ? clamp((initialVp.width - 24) / 640, 0.48, 0.62)
      : getInitialMapZoom(initialVp);
    const initialFocus =
      initialVp.width < 768 ? { x: 376, y: 538, ratio: 0.48 } : { x: 750, y: 515, ratio: 0.5 };
    return centerCameraOnPoint(
      { x: initialFocus.x, y: initialFocus.y },
      initialVp,
      initialZoom,
      MAP_WORLD_SIZE,
      initialFocus.ratio
    );
  });

  // Keep viewport measurements in sync on resize
  useEffect(() => {
    const updateSize = () => {
      const el = viewportRef.current;
      const nextVp = {
        width: el?.clientWidth || window.innerWidth || 1440,
        height: el?.clientHeight || window.innerHeight || 900,
      };
      setViewportSize(nextVp);
      setCamera((prev) => clampMapCamera(prev, nextVp, MAP_WORLD_SIZE));
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Persist discovered landmarks
  useEffect(() => {
    try {
      localStorage.setItem(LESSON_ONE_STORAGE_KEY, JSON.stringify(discoveredIds));
    } catch {
      // Ignore storage quota errors
    }
  }, [discoveredIds]);

  const progress = useMemo(
    () => computeLessonOneProgress(discoveredIds, LESSON_ONE_LANDMARKS.length),
    [discoveredIds]
  );

  const grouped = useMemo(
    () => groupLessonOnePillars(LESSON_ONE_LANDMARKS, discoveredIds),
    [discoveredIds]
  );

  useEffect(() => {
    onProgressChange?.(progress);
  }, [progress, onProgressChange]);

  const selectedLandmark = useMemo(
    () => LESSON_ONE_LANDMARKS.find((item) => item.id === selectedId) || null,
    [selectedId]
  );

  const selectedLockedLesson = useMemo(
    () => LOCKED_FUTURE_LESSONS.find((item) => item.id === selectedLockedId) || null,
    [selectedLockedId]
  );

  const selectedGroupMeta = useMemo(
    () => PILLAR_GROUPS.find((g) => g.id === selectedGroupOverviewId) || null,
    [selectedGroupOverviewId]
  );

  const nextRecommended = useMemo(
    () => getNextUndiscoveredLandmark(LESSON_ONE_LANDMARKS, discoveredIds),
    [discoveredIds]
  );

  const selectLandmark = useCallback(
    (landmark) => {
      if (!landmark) return;
      const { nextIds, added } = markLandmarkDiscovered(
        discoveredIds,
        landmark.id,
        LESSON_ONE_VALID_IDS
      );
      if (added) {
        setDiscoveredIds(nextIds);
        if (nextIds.length >= LESSON_ONE_LANDMARKS.length) {
          hapticCelebrate();
        } else {
          hapticDetent();
        }
      } else {
        hapticTapLight();
      }
      setSelectedLockedId(null);
      setSelectedGroupOverviewId(null);
      setSelectedId(landmark.id);
      setActiveZone(landmark.region);
      const pt = resolveLandmarkPoint(landmark, isLightMode);
      // On Desktop, keep the full map overview framed so the Top HUD bar and Bottom Drawer
      // never collide with any Territory or expose empty canvas margins.
      if (viewportSize.width >= 768) {
        setCamera((prev) =>
          centerCameraOnPoint(
            { x: 750, y: 555 },
            viewportSize,
            clamp(prev.zoom, 0.84, 0.96),
            MAP_WORLD_SIZE,
            0.5
          )
        );
      } else {
        setCamera((prev) =>
          centerCameraOnPoint(
            pt,
            viewportSize,
            clamp(prev.zoom, 0.54, 0.82),
            MAP_WORLD_SIZE,
            0.40
          )
        );
      }
    },
    [discoveredIds, isLightMode, viewportSize]
  );

  const selectLockedGate = useCallback(
    (lockedItem) => {
      if (!lockedItem) return;
      hapticTapLight();
      setSelectedId(null);
      setSelectedGroupOverviewId(null);
      setSelectedLockedId(lockedItem.id);
      setActiveZone('horizon');
      const pt = resolveLandmarkPoint(lockedItem, isLightMode);
      setCamera((prev) =>
        centerCameraOnPoint(
          { x: pt.x, y: viewportSize.width >= 768 ? 515 : pt.y },
          viewportSize,
          clamp(prev.zoom, 0.78, 0.96),
          MAP_WORLD_SIZE,
          viewportSize.width >= 768 ? 0.5 : 0.34
        )
      );
    },
    [isLightMode, viewportSize]
  );

  const handleSelectSanctuaryBuilding = useCallback(
    (groupId) => {
      hapticTapLight();
      setSelectedId(null);
      setSelectedLockedId(null);
      setSelectedGroupOverviewId(groupId);
      setActiveZone(groupId);
      const target = getRegionFocusPoint(groupId);
      const baseZoom = getInitialMapZoom(viewportSize);
      const zoom =
        viewportSize.width < 640
          ? clamp((viewportSize.width - 24) / 640, 0.48, 0.62)
          : clamp(baseZoom, 0.84, 0.96);
      setCamera(
        centerCameraOnPoint(
          {
            x: viewportSize.width >= 768 ? 750 : target.x,
            y: viewportSize.width >= 768 ? 555 : target.y,
          },
          viewportSize,
          zoom,
          MAP_WORLD_SIZE,
          viewportSize.width >= 768 ? 0.5 : 0.44
        )
      );
    },
    [viewportSize]
  );

  const handleJumpZone = useCallback(
    (zoneKey) => {
      hapticTapLight();
      setActiveZone(zoneKey);
      const target = getRegionFocusPoint(zoneKey);
      const baseZoom = getInitialMapZoom(viewportSize);
      const zoom =
        zoneKey === 'all'
          ? viewportSize.width < 640
            ? 0.48
            : baseZoom
          : viewportSize.width < 640
          ? clamp((viewportSize.width - 24) / 640, 0.48, 0.62)
          : clamp(baseZoom, 0.84, 0.96);

      if (zoneKey === 'horizon') {
        setSelectedId(null);
        setSelectedGroupOverviewId(null);
        setSelectedLockedId(LOCKED_FUTURE_LESSONS[0].id);
      } else {
        setSelectedId(null);
        setSelectedLockedId(null);
        setSelectedGroupOverviewId(null);
      }

      setCamera(
        centerCameraOnPoint(
          {
            x: viewportSize.width >= 768 && zoneKey !== 'horizon' ? target.x : target.x,
            y: viewportSize.width >= 768 ? 515 : target.y,
          },
          viewportSize,
          zoom,
          MAP_WORLD_SIZE,
          viewportSize.width < 768 ? 0.48 : 0.5
        )
      );
    },
    [viewportSize]
  );

  const handleStepLandmark = useCallback(
    (direction) => {
      const nextId = getAdjacentLandmarkId(LESSON_ONE_LANDMARKS, selectedId, direction);
      const target = LESSON_ONE_LANDMARKS.find((item) => item.id === nextId);
      if (target) {
        selectLandmark(target);
      }
    },
    [selectedId, selectLandmark]
  );

  const handleRecenter = useCallback(() => {
    hapticTapLight();
    setSelectedId(null);
    setSelectedLockedId(null);
    setSelectedGroupOverviewId(null);
    const defaultZone = viewportSize.width < 768 ? (nextRecommended?.region || 'islam') : 'all';
    handleJumpZone(defaultZone);
  }, [viewportSize.width, nextRecommended, handleJumpZone]);

  const handleZoomStep = useCallback(
    (delta) => {
      hapticTapLight();
      setCamera((prev) =>
        zoomCameraAtCenter(prev, prev.zoom + delta, viewportSize, MAP_WORLD_SIZE)
      );
    },
    [viewportSize]
  );

  const handleWheel = useCallback(
    (event) => {
      event.preventDefault();
      const delta = event.deltaY < 0 ? 0.1 : -0.1;
      setCamera((prev) =>
        zoomCameraAtCenter(prev, prev.zoom + delta, viewportSize, MAP_WORLD_SIZE)
      );
    },
    [viewportSize]
  );

  const handlePointerDown = (event) => {
    if (event.button !== undefined && event.button !== 0) return;
    if (event.target.closest('button')) return;

    dragStateRef.current = {
      active: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originCamX: camera.x,
      originCamY: camera.y,
      moved: false,
    };
    setIsDragging(false);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event) => {
    const state = dragStateRef.current;
    if (!state.active || state.pointerId !== event.pointerId) return;

    const currentPoint = { x: event.clientX, y: event.clientY };
    const startPoint = { x: state.startX, y: state.startY };

    if (!state.moved && isPointerDragExceeded(startPoint, currentPoint)) {
      state.moved = true;
      setIsDragging(true);
    }

    if (state.moved) {
      const dx = event.clientX - state.startX;
      const dy = event.clientY - state.startY;
      setCamera((prev) =>
        clampMapCamera(
          {
            x: state.originCamX + dx,
            y: state.originCamY + dy,
            zoom: prev.zoom,
          },
          viewportSize,
          MAP_WORLD_SIZE
        )
      );
    }
  };

  const handlePointerEnd = (event) => {
    const state = dragStateRef.current;
    if (!state.active || state.pointerId !== event.pointerId) return;

    const wasDragged = state.moved;
    dragStateRef.current.active = false;
    setIsDragging(false);
    event.currentTarget.releasePointerCapture?.(event.pointerId);

    if (!wasDragged && !event.target.closest('button')) {
      if (selectedId) setSelectedId(null);
      if (selectedLockedId) setSelectedLockedId(null);
      if (selectedGroupOverviewId) setSelectedGroupOverviewId(null);
    }
  };

  const handleViewportKeyDown = (event) => {
    const panStep = 80;
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setCamera((prev) =>
        clampMapCamera({ ...prev, y: prev.y + panStep }, viewportSize, MAP_WORLD_SIZE)
      );
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      setCamera((prev) =>
        clampMapCamera({ ...prev, y: prev.y - panStep }, viewportSize, MAP_WORLD_SIZE)
      );
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      setCamera((prev) =>
        clampMapCamera({ ...prev, x: prev.x + panStep }, viewportSize, MAP_WORLD_SIZE)
      );
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      setCamera((prev) =>
        clampMapCamera({ ...prev, x: prev.x - panStep }, viewportSize, MAP_WORLD_SIZE)
      );
    } else if (event.key === '+' || event.key === '=') {
      event.preventDefault();
      handleZoomStep(0.16);
    } else if (event.key === '-' || event.key === '_') {
      event.preventDefault();
      handleZoomStep(-0.16);
    }
  };

  const controlSurface = isLightMode
    ? 'bg-[#f8f0df]/94 border-[#7a5420]/28 text-[#2c1f11] shadow-[0_8px_24px_rgba(62,43,20,0.14)] backdrop-blur-md'
    : 'bg-[#1a1612]/92 border-[#d4af6a]/28 text-[#efe5d4] shadow-[0_12px_30px_rgba(0,0,0,0.55)] backdrop-blur-md';

  const cardSurface = isLightMode
    ? 'bg-[#faf3e4]/96 border-[#7a5420]/34 text-[#261a0e] shadow-[0_18px_45px_rgba(52,35,14,0.22)] backdrop-blur-xl'
    : 'bg-[#181410]/96 border-[#d4af6a]/36 text-[#f2e8d5] shadow-[0_22px_55px_rgba(0,0,0,0.78)] backdrop-blur-xl';

  const subText = isLightMode ? 'text-[#5c472c]' : 'text-[#c4b499]';
  const accentHex = isLightMode ? '#7a5420' : '#d4af6a';
  const primaryGate = LOCKED_FUTURE_LESSONS[0];
  const isMobileViewport = viewportSize.width < 768;

  // On narrow mobile screens when zoomed into a single Territory ('islam' or 'iman'),
  // hide off-axis elements so nothing ever pokes half-cut into the mobile screen edges.
  const hideIslamOnMobile = isMobileViewport && activeZone === 'iman';
  const hideImanOnMobile = isMobileViewport && activeZone === 'islam';
  const hideCenterAndGateOnMobile =
    isMobileViewport && (activeZone === 'islam' || activeZone === 'iman');

  return (
    <div
      ref={viewportRef}
      data-testid="ancient-map-viewport"
      role="application"
      aria-label="Interactive Ancient Map Canvas of Lesson I: The Five Pillars of Islam and Six Pillars of Faith"
      tabIndex={0}
      onKeyDown={handleViewportKeyDown}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      style={{
        touchAction: 'none',
        backgroundColor: isLightMode ? '#e5d6b8' : '#110e0b',
      }}
      className={`relative w-full h-full overflow-hidden select-none outline-none ${
        isLightMode ? 'text-[#24190d]' : 'text-[#f2e8d5]'
      } ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
    >
      {/* Top Floating Map Compass Bar (Single unified top row on Desktop, second row on Mobile) */}
      <div
        className="absolute left-1/2 -translate-x-1/2 z-30 flex items-center justify-center max-w-[calc(100vw-20px)]"
        style={{
          top: viewportSize.width >= 768 ? '12px' : '64px',
          marginTop: 'var(--sat)',
        }}
      >
        <div className={`flex items-center gap-0.5 p-1 rounded-full border ${controlSurface}`}>
          {[
            { id: 'all', label: 'Map Overview' },
            { id: 'islam', label: '5 Pillars Islam' },
            { id: 'iman', label: '6 Pillars Faith' },
            { id: 'horizon', label: 'Lesson II Gate' },
          ].map((tab) => {
            const isActive = activeZone === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                data-testid={`zone-tab-${tab.id}`}
                onClick={() => handleJumpZone(tab.id)}
                className={`min-h-[36px] px-2.5 sm:px-3.5 rounded-full font-serif-eng text-[9.5px] sm:text-[11px] uppercase tracking-[0.08em] sm:tracking-[0.12em] whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? isLightMode
                      ? 'bg-[#463219] text-[#f9f2e3] shadow-sm font-semibold'
                      : 'bg-[#d4af6a] text-[#18130d] shadow-sm font-semibold'
                    : isLightMode
                    ? 'text-[#4a361d] hover:text-[#24190d]'
                    : 'text-[#d8c8af] hover:text-[#f7efe0]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* SPATIAL PAN & ZOOM ANCIENT MAP CANVAS (1500 x 1120) */}
      <div
        data-testid="ancient-map-world"
        style={{
          width: `${MAP_WORLD_SIZE.width}px`,
          height: `${MAP_WORLD_SIZE.height}px`,
          transformOrigin: '0 0',
          transform: `translate3d(${camera.x}px, ${camera.y}px, 0) scale(${camera.zoom})`,
          transition:
            isDragging || reducedMotion
              ? 'none'
              : 'transform 420ms cubic-bezier(0.22, 1, 0.36, 1)',
          willChange: 'transform',
        }}
        className="relative overflow-hidden rounded-[26px] shadow-2xl"
      >
        {/* 1. Clean Hand-Painted Antique Parchment Map Backdrop & Radial Sanctuary Trails */}
        <AncientCartographyBackdrop
          isLightMode={isLightMode}
          islamComplete={grouped.islam.isComplete}
          imanComplete={grouped.iman.isComplete}
          hideIslam={hideIslamOnMobile}
          hideIman={hideImanOnMobile}
          hideCenterAndGate={hideCenterAndGateOnMobile}
        />

        {/* 2. WESTERN TERRITORY SCROLL BANNER: THE FIVE PILLARS OF ISLAM */}
        <button
          type="button"
          data-testid="group-section-islam"
          onClick={(e) => {
            e.stopPropagation();
            handleSelectSanctuaryBuilding('islam');
          }}
          style={{
            left: '376px',
            top: '296px',
            transform: 'translate(-50%, -50%)',
          }}
          className={`absolute z-10 w-[560px] overflow-hidden rounded-2xl border px-5 py-2 flex items-center justify-between gap-4 text-left transition cursor-pointer ${
            hideIslamOnMobile ? 'opacity-0 pointer-events-none' : ''
          } ${
            selectedGroupOverviewId === 'islam'
              ? isLightMode
                ? 'bg-[#efe1c4] border-[#5c3d16] shadow-lg'
                : 'bg-[#2a2118] border-[#ebd09a] shadow-lg'
              : isLightMode
              ? 'bg-[#fbf4e4]/96 border-[#7a5420]/38 hover:border-[#7a5420]/70 text-[#261a0e] shadow-md'
              : 'bg-[#1c1712]/96 border-[#d4af6a]/38 hover:border-[#d4af6a]/70 text-[#f2e8d5] shadow-lg'
          }`}
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2 font-serif-eng text-[9.5px] uppercase tracking-[0.14em] font-semibold whitespace-nowrap">
              <span style={{ color: accentHex }}>{PILLAR_GROUPS[0].numberLabel}</span>
              <span aria-hidden="true" className="opacity-40">
                ·
              </span>
              <span className={subText}>{PILLAR_GROUPS[0].subtitle}</span>
            </div>
            <h2 className="font-serif-eng text-[20px] font-semibold leading-tight mt-0.5">
              {PILLAR_GROUPS[0].title}
            </h2>
          </div>

          <div className="text-right shrink-0">
            <span
              dir="rtl"
              className="font-calligraphy text-[19px] leading-none block"
              style={{ color: accentHex }}
            >
              {PILLAR_GROUPS[0].arabic}
            </span>
            <span className={`font-serif-eng text-[10.5px] tabular-nums block mt-0.5 ${subText}`}>
              {grouped.islam.discoveredCount} / {grouped.islam.totalCount} Explored
            </span>
          </div>
        </button>

        {/* 3. EASTERN TERRITORY SCROLL BANNER: THE SIX PILLARS OF FAITH (IMAN) */}
        <button
          type="button"
          data-testid="group-section-iman"
          onClick={(e) => {
            e.stopPropagation();
            handleSelectSanctuaryBuilding('iman');
          }}
          style={{
            left: '1124px',
            top: '296px',
            transform: 'translate(-50%, -50%)',
          }}
          className={`absolute z-10 w-[560px] overflow-hidden rounded-2xl border px-5 py-2 flex items-center justify-between gap-4 text-left transition cursor-pointer ${
            hideImanOnMobile ? 'opacity-0 pointer-events-none' : ''
          } ${
            selectedGroupOverviewId === 'iman'
              ? isLightMode
                ? 'bg-[#efe1c4] border-[#5c3d16] shadow-lg'
                : 'bg-[#2a2118] border-[#ebd09a] shadow-lg'
              : isLightMode
              ? 'bg-[#fbf4e4]/96 border-[#7a5420]/38 hover:border-[#7a5420]/70 text-[#261a0e] shadow-md'
              : 'bg-[#1c1712]/96 border-[#d4af6a]/38 hover:border-[#d4af6a]/70 text-[#f2e8d5] shadow-lg'
          }`}
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2 font-serif-eng text-[9.5px] uppercase tracking-[0.14em] font-semibold whitespace-nowrap">
              <span style={{ color: accentHex }}>{PILLAR_GROUPS[1].numberLabel}</span>
              <span aria-hidden="true" className="opacity-40">
                ·
              </span>
              <span className={subText}>{PILLAR_GROUPS[1].subtitle}</span>
            </div>
            <h2 className="font-serif-eng text-[20px] font-semibold leading-tight mt-0.5">
              {PILLAR_GROUPS[1].title}
            </h2>
          </div>

          <div className="text-right shrink-0">
            <span
              dir="rtl"
              className="font-calligraphy text-[19px] leading-none block"
              style={{ color: accentHex }}
            >
              {PILLAR_GROUPS[1].arabic}
            </span>
            <span className={`font-serif-eng text-[10.5px] tabular-nums block mt-0.5 ${subText}`}>
              {grouped.iman.discoveredCount} / {grouped.iman.totalCount} Explored
            </span>
          </div>
        </button>

        {/* 4. HAND-PAINTED ANCIENT ARCHITECTURAL LANDMARKS ON THE PARCHMENT */}
        {/* 4a. Central Courtyard Mosque (Heart of the 5 Pillars of Islam at 376, 576) */}
        <div
          style={{
            left: `${PILLAR_GROUPS[0].buildingX}px`,
            top: `${PILLAR_GROUPS[0].buildingY}px`,
            transform: 'translate(-50%, -50%)',
          }}
          className={`absolute z-10 transition-opacity ${
            hideIslamOnMobile ? 'opacity-0 pointer-events-none' : ''
          }`}
        >
          <SanctuaryBuildingMedallion
            testId="building-mosque-islam"
            title={PILLAR_GROUPS[0].buildingName}
            subtitle={PILLAR_GROUPS[0].buildingSubtitle}
            focus={PILLAR_GROUPS[0].buildingFocus}
            scale={PILLAR_GROUPS[0].buildingScale}
            isComplete={grouped.islam.isComplete}
            isLightMode={isLightMode}
            onClick={() => handleSelectSanctuaryBuilding('islam')}
          />
        </div>

        {/* 4b. Central Domed House of Wisdom Observatory (Heart of the 6 Pillars of Faith at 1124, 576) */}
        <div
          style={{
            left: `${PILLAR_GROUPS[1].buildingX}px`,
            top: `${PILLAR_GROUPS[1].buildingY}px`,
            transform: 'translate(-50%, -50%)',
          }}
          className={`absolute z-10 transition-opacity ${
            hideImanOnMobile ? 'opacity-0 pointer-events-none' : ''
          }`}
        >
          <SanctuaryBuildingMedallion
            testId="building-observatory-iman"
            title={PILLAR_GROUPS[1].buildingName}
            subtitle={PILLAR_GROUPS[1].buildingSubtitle}
            focus={PILLAR_GROUPS[1].buildingFocus}
            scale={PILLAR_GROUPS[1].buildingScale}
            isComplete={grouped.iman.isComplete}
            isLightMode={isLightMode}
            onClick={() => handleSelectSanctuaryBuilding('iman')}
          />
        </div>

        {/* 4c. Central Three-Arch Stone River Bridge (Inside the 108px River Valley at 750, 576) */}
        <div
          style={{
            left: `${MAP_BRIDGE_LANDMARK.x}px`,
            top: `${MAP_BRIDGE_LANDMARK.y}px`,
            transform: 'translate(-50%, -50%)',
          }}
          className={`absolute z-10 transition-opacity ${
            hideCenterAndGateOnMobile ? 'opacity-0 pointer-events-none' : ''
          }`}
        >
          <SanctuaryBuildingMedallion
            testId="building-bridge-harmony"
            title={MAP_BRIDGE_LANDMARK.title}
            subtitle={MAP_BRIDGE_LANDMARK.subtitle}
            focus={MAP_BRIDGE_LANDMARK.focus}
            scale={MAP_BRIDGE_LANDMARK.scale}
            isComplete={progress.isComplete}
            isLightMode={isLightMode}
            size="bridge"
            onClick={() => handleJumpZone('all')}
          />
        </div>

        {/* 5. NORTHERN PASS CITADEL GATE ON THE MAP: LESSON II (THE GATES OF TAHARAH) */}
        <button
          type="button"
          data-testid={`locked-${primaryGate.id}`}
          aria-label={`${primaryGate.lessonNumber}: ${primaryGate.title} (${
            progress.isComplete ? 'Unsealed' : 'Locked'
          })`}
          onClick={(e) => {
            e.stopPropagation();
            selectLockedGate(primaryGate);
          }}
          style={{
            left: `${primaryGate.x}px`,
            top: `${primaryGate.y}px`,
            transform: 'translate(-50%, -50%)',
            zIndex: selectedLockedId === primaryGate.id ? 18 : 11,
          }}
          className={`group absolute w-[420px] rounded-2xl border p-2.5 text-left transition-all cursor-pointer flex items-center gap-3 ${
            hideCenterAndGateOnMobile ? 'opacity-0 pointer-events-none' : ''
          } ${
            selectedLockedId === primaryGate.id
              ? isLightMode
                ? 'bg-[#efe1c4] border-[#5c3d16] shadow-xl scale-[1.03]'
                : 'bg-[#2a2219] border-[#ebd09a] shadow-xl scale-[1.03]'
              : isLightMode
              ? 'bg-[#fbf4e4]/96 border-[#7a5420]/40 hover:border-[#7a5420]/70 shadow-md'
              : 'bg-[#1c1712]/96 border-[#d4af6a]/42 hover:border-[#d4af6a]/70 shadow-lg'
          }`}
        >
          <ArtifactVignetteThumbnail
            id={primaryGate.id}
            sheet={primaryGate.artifactSheet}
            focus={primaryGate.artifactFocus}
            scale={primaryGate.artifactScale}
            alt={primaryGate.artifactName}
            isDiscovered={progress.isComplete}
            isSelected={selectedLockedId === primaryGate.id}
            isLightMode={isLightMode}
            sizeClass="w-13 h-13"
          />

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span
                className="flex items-center gap-1.5 font-serif-eng text-[9px] uppercase tracking-[0.14em] font-semibold"
                style={{ color: accentHex }}
              >
                {progress.isComplete ? <UnlockIcon size={11} /> : <LockIcon size={11} />}
                <span>
                  {primaryGate.lessonNumber} ·{' '}
                  {progress.isComplete ? 'Archway Unsealed' : 'Northern Pass Citadel'}
                </span>
              </span>

              <span
                dir="rtl"
                className="font-calligraphy text-[15.5px] leading-none shrink-0"
                style={{ color: accentHex }}
              >
                {primaryGate.arabic}
              </span>
            </div>

            <div className="font-serif-eng text-[15px] font-semibold leading-tight mt-0.5 whitespace-nowrap">
              {primaryGate.title} — {primaryGate.subtitle}
            </div>

            {/* 11 Keystone Progress Dots on the Gate */}
            <div className="mt-1 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1" aria-hidden="true">
                {LESSON_ONE_LANDMARKS.map((item) => {
                  const lit = discoveredIds.includes(item.id);
                  return (
                    <span
                      key={item.id}
                      className={`w-2.5 h-2.5 rounded-sm border transition-colors ${
                        lit
                          ? isLightMode
                            ? 'bg-[#5c3d16] border-[#5c3d16]'
                            : 'bg-[#d4af6a] border-[#f0d8a8]'
                          : isLightMode
                          ? 'bg-black/5 border-[#7a5420]/30'
                          : 'bg-white/5 border-[#d4af6a]/30'
                      }`}
                    />
                  );
                })}
              </div>
              <span className={`font-serif-eng text-[9.5px] tabular-nums ${subText}`}>
                {progress.discoveredCount} / 11 Keystones
              </span>
            </div>
          </div>
        </button>

        {/* 6. ELEVEN SCULPTED ARTIFACT & PILLAR MAP CARTOUCHES (Grouped cleanly inside Precinct I & II) */}
        {LESSON_ONE_LANDMARKS.map((landmark) => {
          const isDiscovered = discoveredIds.includes(landmark.id);
          const isSelected = selectedId === landmark.id;
          const isNext = !progress.isComplete && nextRecommended?.id === landmark.id;
          const pt = resolveLandmarkPoint(landmark, isLightMode);
          const hiddenByMobileZone =
            (landmark.region === 'islam' && hideIslamOnMobile) ||
            (landmark.region === 'iman' && hideImanOnMobile);

          return (
            <button
              key={landmark.id}
              type="button"
              data-testid={`landmark-${landmark.id}`}
              data-discovered={isDiscovered ? 'true' : 'false'}
              aria-label={`${landmark.pillarLabel}: ${landmark.title} (${landmark.englishMeaning})`}
              aria-pressed={isSelected}
              onClick={(e) => {
                e.stopPropagation();
                selectLandmark(landmark);
              }}
              style={{
                left: `${pt.x}px`,
                top: `${pt.y}px`,
                transform: 'translate(-50%, -50%)',
                zIndex: isSelected ? 20 : isNext ? 14 : 10,
              }}
              className={`group absolute w-[210px] rounded-2xl border p-2 text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                hiddenByMobileZone ? 'opacity-0 pointer-events-none' : ''
              } ${
                isSelected
                  ? isLightMode
                    ? 'bg-[#efe1c4] border-[#5c3d16] shadow-xl scale-[1.04]'
                    : 'bg-[#2c231a] border-[#f0d8a8] shadow-xl scale-[1.04]'
                  : isDiscovered
                  ? isLightMode
                    ? 'bg-[#f8f0df]/98 border-[#7a5420]/50 hover:border-[#7a5420]/80 shadow-md'
                    : 'bg-[#211b15]/98 border-[#d4af6a]/50 hover:border-[#d4af6a]/80 shadow-md'
                  : isLightMode
                  ? 'bg-[#fdf8ee]/96 border-[#7a5420]/32 hover:border-[#7a5420]/60 shadow-sm'
                  : 'bg-[#181410]/96 border-[#d4af6a]/32 hover:border-[#d4af6a]/60 shadow-md'
              }`}
            >
              {/* Unobstructed Hand-Painted Ancient Artifact Miniature */}
              <ArtifactVignetteThumbnail
                id={landmark.id}
                sheet={landmark.artifactSheet}
                focus={landmark.artifactFocus}
                scale={landmark.artifactScale}
                alt={landmark.artifactName}
                isDiscovered={isDiscovered}
                isSelected={isSelected}
                isLightMode={isLightMode}
                sizeClass="w-11 h-11"
              />

              {/* Clear Pillar Number, Meaning, Title & Arabic (No Overlapping Badges or Truncation) */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span
                    className="font-serif-eng text-[8px] font-bold uppercase tracking-[0.03em] whitespace-nowrap"
                    style={{ color: accentHex }}
                  >
                    0{landmark.regionOrder} · {landmark.englishMeaning}
                  </span>

                  {isDiscovered ? (
                    <CheckCircleIcon
                      size={11}
                      style={{ color: accentHex }}
                      className="shrink-0"
                    />
                  ) : isNext ? (
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: accentHex }}
                    />
                  ) : null}
                </div>

                <div className="font-serif-eng text-[12.5px] font-semibold leading-tight whitespace-nowrap mt-0.5">
                  {landmark.title}
                </div>

                <div className="flex items-center justify-between gap-1 mt-0.5">
                  <span className={`font-serif-eng text-[8.5px] italic whitespace-nowrap ${subText}`}>
                    {landmark.artifactShort || landmark.artifactName}
                  </span>
                  <span
                    dir="rtl"
                    className="font-calligraphy text-[12px] leading-none shrink-0"
                    style={{ color: accentHex }}
                  >
                    {landmark.arabic}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Camera Controls (+, -, Re-center): Right-center on Desktop, compact bottom-right above pill on Mobile */}
      <div
        className="absolute right-3 sm:right-4 z-20 flex flex-row sm:flex-col gap-1.5 sm:gap-2"
        style={{
          top: viewportSize.width >= 768 ? '50%' : 'auto',
          bottom: viewportSize.width >= 768 ? 'auto' : 'calc(70px + var(--sab))',
          transform: viewportSize.width >= 768 ? 'translateY(-50%)' : 'none',
          paddingRight: 'var(--sar)',
        }}
      >
        <button
          type="button"
          data-testid="map-zoom-in"
          aria-label="Zoom in map"
          disabled={camera.zoom >= MAP_MAX_ZOOM - 0.01}
          onClick={() => handleZoomStep(0.18)}
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border flex items-center justify-center font-serif-eng text-[19px] leading-none cursor-pointer transition active:scale-95 disabled:opacity-40 ${controlSurface}`}
        >
          +
        </button>
        <button
          type="button"
          data-testid="map-zoom-out"
          aria-label="Zoom out map"
          disabled={camera.zoom <= MAP_MIN_ZOOM + 0.01}
          onClick={() => handleZoomStep(-0.18)}
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border flex items-center justify-center font-serif-eng text-[19px] leading-none cursor-pointer transition active:scale-95 disabled:opacity-40 ${controlSurface}`}
        >
          −
        </button>
        <button
          type="button"
          data-testid="map-recenter"
          aria-label="Re-center map overview"
          onClick={handleRecenter}
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border flex items-center justify-center cursor-pointer transition active:scale-95 ${controlSurface}`}
        >
          <CompassIcon size={16} style={{ color: accentHex }} />
        </button>
      </div>

      {/* Bottom Floating Manuscript Folio Sheet (Selected Pillar, Sanctuary Overview, or Guided Walk) */}
      <div
        className="absolute inset-x-0 bottom-0 z-20 px-3 sm:px-6 pb-2.5 sm:pb-3 pointer-events-none flex justify-center"
        style={{
          paddingBottom: 'calc(10px + var(--sab))',
          transition: reducedMotion ? 'none' : 'transform 220ms ease-out',
        }}
      >
        {selectedLandmark ? (
          <div
            data-testid="landmark-nameplate"
            className={`pointer-events-auto w-full max-w-[680px] rounded-[20px] border px-4 py-2.5 sm:px-5 sm:py-3 ${cardSurface}`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <ArtifactVignetteThumbnail
                  id={selectedLandmark.id}
                  sheet={selectedLandmark.artifactSheet}
                  focus={selectedLandmark.artifactFocus}
                  scale={selectedLandmark.artifactScale}
                  alt={selectedLandmark.artifactName}
                  isDiscovered={true}
                  isSelected={true}
                  isLightMode={isLightMode}
                  sizeClass="w-12 h-12"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="font-serif-eng text-[9.5px] uppercase tracking-[0.14em] font-semibold"
                      style={{ color: accentHex }}
                    >
                      {selectedLandmark.pillarLabel} · {selectedLandmark.englishMeaning}
                    </span>
                    <span className={`font-serif-eng text-[10px] tabular-nums ${subText}`}>
                      · {progress.discoveredCount} / {progress.totalCount} Explored
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2.5 mt-0.5 min-w-0">
                    <h2 className="font-serif-eng text-[18px] sm:text-[19px] font-semibold leading-tight shrink-0">
                      {selectedLandmark.title}
                    </h2>
                    <span
                      dir="rtl"
                      className="font-calligraphy text-[18px] leading-none shrink-0"
                      style={{ color: accentHex }}
                    >
                      {selectedLandmark.arabic}
                    </span>
                    <span className={`hidden md:inline font-serif-eng italic text-[11.5px] truncate min-w-0 ${subText}`}>
                      — {selectedLandmark.recognitionCue}
                    </span>
                  </div>

                  <p className={`md:hidden font-serif-eng italic text-[11.5px] leading-snug mt-0.5 truncate ${subText}`}>
                    {selectedLandmark.recognitionCue}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  data-testid="nameplate-prev"
                  onClick={() => handleStepLandmark(-1)}
                  className={`min-h-[34px] px-2.5 rounded-xl border flex items-center gap-1 font-serif-eng text-[10px] uppercase tracking-[0.12em] whitespace-nowrap cursor-pointer transition active:scale-95 ${
                    isLightMode
                      ? 'border-black/12 hover:bg-black/[0.04]'
                      : 'border-white/14 hover:bg-white/[0.06]'
                  }`}
                >
                  <ChevronLeftIcon size={13} style={{ color: accentHex }} />
                  <span className="hidden sm:inline">Prev</span>
                </button>

                <button
                  type="button"
                  data-testid="nameplate-next"
                  onClick={() => handleStepLandmark(1)}
                  className={`min-h-[34px] px-2.5 rounded-xl border flex items-center gap-1 font-serif-eng text-[10px] uppercase tracking-[0.12em] whitespace-nowrap cursor-pointer transition active:scale-95 ${
                    isLightMode
                      ? 'border-black/12 hover:bg-black/[0.04]'
                      : 'border-white/14 hover:bg-white/[0.06]'
                  }`}
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRightIcon size={13} style={{ color: accentHex }} />
                </button>

                <button
                  type="button"
                  data-testid="nameplate-close"
                  aria-label="Close pillar detail"
                  onClick={() => {
                    hapticDismiss();
                    setSelectedId(null);
                  }}
                  className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer ${
                    isLightMode ? 'hover:bg-black/5 text-[#5e4b34]' : 'hover:bg-white/10 text-[#c7baa5]'
                  }`}
                >
                  <XIcon size={15} />
                </button>
              </div>
            </div>
          </div>
        ) : selectedGroupMeta ? (
          <div
            data-testid="sanctuary-group-card"
            className={`pointer-events-auto w-full max-w-[680px] rounded-[20px] border px-4 py-2.5 sm:px-5 sm:py-3 ${cardSurface}`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <ArtifactVignetteThumbnail
                  id={selectedGroupMeta.id}
                  sheet="buildings"
                  focus={selectedGroupMeta.buildingFocus}
                  scale={selectedGroupMeta.buildingScale}
                  alt={selectedGroupMeta.buildingName}
                  isDiscovered={grouped[selectedGroupMeta.id]?.isComplete}
                  isSelected={true}
                  isLightMode={isLightMode}
                  sizeClass="w-11 h-11"
                  roundedClass="rounded-full"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="font-serif-eng text-[9.5px] uppercase tracking-[0.14em] font-semibold"
                      style={{ color: accentHex }}
                    >
                      {selectedGroupMeta.buildingName} · {selectedGroupMeta.subtitle}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2.5">
                    <h2 className="font-serif-eng text-[17px] sm:text-[18px] font-semibold leading-tight">
                      {selectedGroupMeta.title}
                    </h2>
                    <span
                      dir="rtl"
                      className="font-calligraphy text-[17px] leading-none"
                      style={{ color: accentHex }}
                    >
                      {selectedGroupMeta.arabic}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                data-testid="group-overview-close"
                aria-label="Close sanctuary overview"
                onClick={() => {
                  hapticDismiss();
                  setSelectedGroupOverviewId(null);
                }}
                className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer ${
                  isLightMode ? 'hover:bg-black/5 text-[#5e4b34]' : 'hover:bg-white/10 text-[#c7baa5]'
                }`}
              >
                <XIcon size={15} />
              </button>
            </div>

            <div className="mt-2 pt-1.5 border-t border-current/10 flex flex-wrap gap-1.5">
              {(grouped[selectedGroupMeta.id]?.items || []).map((item) => {
                const done = discoveredIds.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selectLandmark(item)}
                    className={`px-2.5 py-1 rounded-lg border font-serif-eng text-[11px] flex items-center gap-1.5 cursor-pointer transition ${
                      done
                        ? isLightMode
                          ? 'bg-[#efe1c4] border-[#7a5420]/50 text-[#261a0e] font-semibold'
                          : 'bg-[#2a2118] border-[#d4af6a]/55 text-[#f2e8d5] font-semibold'
                        : isLightMode
                        ? 'bg-black/[0.03] border-[#7a5420]/25 hover:border-[#7a5420]/50'
                        : 'bg-white/[0.04] border-[#d4af6a]/25 hover:border-[#d4af6a]/50'
                    }`}
                  >
                    <span style={{ color: accentHex }}>0{item.regionOrder}.</span>
                    <span>{item.title}</span>
                    {done && <CheckCircleIcon size={11} style={{ color: accentHex }} />}
                  </button>
                );
              })}
            </div>
          </div>
        ) : selectedLockedLesson ? (
          <div
            data-testid="locked-lesson-card"
            className={`pointer-events-auto w-full max-w-[640px] rounded-[20px] border px-4 py-2.5 sm:px-5 sm:py-3 ${cardSurface}`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <ArtifactVignetteThumbnail
                  id={selectedLockedLesson.id}
                  sheet={selectedLockedLesson.artifactSheet}
                  focus={selectedLockedLesson.artifactFocus}
                  scale={selectedLockedLesson.artifactScale}
                  alt={selectedLockedLesson.artifactName}
                  isDiscovered={progress.isComplete}
                  isSelected={true}
                  isLightMode={isLightMode}
                  sizeClass="w-12 h-12"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-[9.5px] font-serif-eng uppercase tracking-[0.14em]">
                    <SparklesIcon size={11} style={{ color: accentHex }} />
                    <span style={{ color: accentHex }}>{selectedLockedLesson.lessonNumber}</span>
                    <span aria-hidden="true" className="opacity-40">
                      ·
                    </span>
                    <span className={subText}>
                      {progress.isComplete
                        ? 'Sanctuary Gate Unsealed'
                        : `${progress.remainingCount} more ${
                            progress.remainingCount === 1 ? 'Pillar' : 'Pillars'
                          } to unseal`}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2.5 mt-0.5">
                    <h2 className="font-serif-eng text-[18px] sm:text-[19px] font-semibold leading-tight truncate">
                      {selectedLockedLesson.title}
                    </h2>
                    <span
                      dir="rtl"
                      className="font-calligraphy text-[18px] leading-none shrink-0"
                      style={{ color: accentHex }}
                    >
                      {selectedLockedLesson.arabic}
                    </span>
                  </div>

                  <p className={`font-serif-eng italic text-[11.5px] leading-snug mt-0.5 truncate ${subText}`}>
                    {selectedLockedLesson.mysteryWhisper}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!progress.isComplete && nextRecommended && (
                  <button
                    type="button"
                    data-testid="locked-card-continue"
                    onClick={() => selectLandmark(nextRecommended)}
                    className={`min-h-[34px] px-3.5 rounded-xl border font-serif-eng text-[10px] uppercase tracking-[0.13em] whitespace-nowrap shrink-0 cursor-pointer transition active:scale-95 ${
                      isLightMode
                        ? 'bg-[#463219] border-[#7a5420] text-[#f9f2e3]'
                        : 'bg-[#d4af6a] border-[#edd29b] text-[#18130d] font-semibold'
                    }`}
                  >
                    Next Pillar
                  </button>
                )}

                <button
                  type="button"
                  data-testid="locked-card-close"
                  aria-label="Close sealed realm preview"
                  onClick={() => {
                    hapticDismiss();
                    setSelectedLockedId(null);
                  }}
                  className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer ${
                    isLightMode ? 'hover:bg-black/5 text-[#5e4b34]' : 'hover:bg-white/10 text-[#c7baa5]'
                  }`}
                >
                  <XIcon size={15} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div
            data-testid="map-discovery-hint"
            className={`pointer-events-auto rounded-full border pl-4 pr-2 py-1.5 flex items-center gap-3 ${cardSurface}`}
          >
            <span className="font-serif-eng italic text-[13px] sm:text-[14px] truncate">
              {progress.isComplete
                ? 'All 11 Pillars Explored · Inspect Lesson II Gate'
                : nextRecommended
                ? `Step ${nextRecommended.order} of 11 · ${nextRecommended.title} (${nextRecommended.englishMeaning})`
                : 'Drag map or tap any Pillar station'}
            </span>
            <button
              type="button"
              data-testid="begin-trail-btn"
              onClick={() =>
                progress.isComplete
                  ? selectLockedGate(LOCKED_FUTURE_LESSONS[0])
                  : selectLandmark(nextRecommended || LESSON_ONE_LANDMARKS[0])
              }
              className={`min-h-[36px] px-4 rounded-full border font-serif-eng text-[10.5px] uppercase tracking-[0.15em] whitespace-nowrap shrink-0 cursor-pointer transition active:scale-95 ${
                isLightMode
                  ? 'bg-[#463219] border-[#7a5420] text-[#f9f2e3]'
                  : 'bg-[#d4af6a] border-[#edd29b] text-[#18130d] font-semibold'
              }`}
            >
              {progress.isComplete
                ? 'Lesson II Gate'
                : progress.discoveredCount > 0
                ? 'Continue'
                : 'Begin Path'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
