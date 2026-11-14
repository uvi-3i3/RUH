import { useEffect, useState, useRef } from 'react';
import { getAngularDelta } from '../../utils/devotionLogic';
import { ChevronDownIcon, CompassIcon, MapPinIcon } from '../icons/Icons';

export const QiblaModal = ({
  isOpen,
  onClose,
  isLightMode,
  prayerTimes,
  onOpenCityPicker,
}) => {
  const [heading, setHeading] = useState(null);
  const [sensorStatus, setSensorStatus] = useState('idle'); // 'idle' | 'active' | 'denied' | 'unsupported'
  const lastAlignedBuzzRef = useRef(false);

  const qiblaBearing = prayerTimes?.prayerData?.qiblaBearing ?? null;
  const qiblaCardinal = prayerTimes?.prayerData?.qiblaCardinal ?? '';
  const distanceKm = prayerTimes?.prayerData?.distanceToKaabaKm ?? null;
  const hasLocation = prayerTimes?.hasLocation;

  const delta =
    heading !== null && qiblaBearing !== null ? getAngularDelta(heading, qiblaBearing) : null;
  const isAligned = delta !== null && Math.abs(delta) <= 5;

  // Listen to device orientation events when available without permission wall
  useEffect(() => {
    if (!isOpen) {
      setHeading(null);
      return;
    }

    if (typeof window === 'undefined' || !('DeviceOrientationEvent' in window)) {
      setSensorStatus('unsupported');
      return;
    }

    const handleOrientation = (event) => {
      let compassHeading = null;
      if (typeof event.webkitCompassHeading === 'number' && !Number.isNaN(event.webkitCompassHeading)) {
        compassHeading = event.webkitCompassHeading;
      } else if (typeof event.alpha === 'number' && event.absolute) {
        compassHeading = (360 - event.alpha) % 360;
      }
      if (compassHeading !== null) {
        setHeading(Math.round(compassHeading));
        setSensorStatus('active');
      }
    };

    const needsExplicitPermission =
      typeof DeviceOrientationEvent.requestPermission === 'function';

    if (!needsExplicitPermission) {
      window.addEventListener('deviceorientationabsolute', handleOrientation, true);
      window.addEventListener('deviceorientation', handleOrientation, true);
      return () => {
        window.removeEventListener('deviceorientationabsolute', handleOrientation, true);
        window.removeEventListener('deviceorientation', handleOrientation, true);
      };
    }
  }, [isOpen]);

  // Subtle single haptic buzz when entering alignment
  useEffect(() => {
    if (isAligned && !lastAlignedBuzzRef.current) {
      lastAlignedBuzzRef.current = true;
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(25);
      }
    } else if (!isAligned) {
      lastAlignedBuzzRef.current = false;
    }
  }, [isAligned]);

  const requestCompassPermission = async () => {
    if (
      typeof window === 'undefined' ||
      !('DeviceOrientationEvent' in window) ||
      typeof DeviceOrientationEvent.requestPermission !== 'function'
    ) {
      return;
    }
    try {
      const response = await DeviceOrientationEvent.requestPermission();
      if (response === 'granted') {
        const handleOrientation = (event) => {
          if (typeof event.webkitCompassHeading === 'number') {
            setHeading(Math.round(event.webkitCompassHeading));
            setSensorStatus('active');
          }
        };
        window.addEventListener('deviceorientation', handleOrientation, true);
        setSensorStatus('active');
      } else {
        setSensorStatus('denied');
      }
    } catch {
      setSensorStatus('denied');
    }
  };

  if (!isOpen) return null;

  const tTextMain = isLightMode ? 'text-[#1a1814]' : 'text-[rgba(245,238,224,0.94)]';
  const tTextSub = isLightMode ? 'text-[#4a453d]' : 'text-[#e4dac8]';
  const accentHex = isLightMode ? '#9c7533' : '#d2a24b';
  const alignedHex = isLightMode ? '#0d9488' : '#2dd4bf';

  // Rotation math:
  // If live compass heading exists: rotate compass rose by -heading so True North shifts as you turn,
  // and needle points directly to (qiblaBearing - heading) relative to top of phone.
  // Without live compass: True North sits at 0° (top) and needle points to qiblaBearing.
  const roseRotation = heading !== null ? -heading : 0;
  const pointerRotation =
    qiblaBearing === null ? 0 : heading !== null ? qiblaBearing - heading : qiblaBearing;

  const guidanceText = (() => {
    if (!hasLocation || qiblaBearing === null) return 'Set your location to compute Qibla';
    if (heading === null) return `Face ${qiblaBearing}° ${qiblaCardinal} from True North`;
    if (isAligned) return 'Facing the Qibla';
    const turnDeg = Math.abs(Math.round(delta));
    return delta > 0 ? `Turn ${turnDeg}° right` : `Turn ${turnDeg}° left`;
  })();

  const requiresIosPermission =
    typeof window !== 'undefined' &&
    'DeviceOrientationEvent' in window &&
    typeof DeviceOrientationEvent.requestPermission === 'function' &&
    sensorStatus !== 'active';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Qibla Compass"
      className="fixed inset-0 z-[105] flex flex-col pointer-events-auto"
    >
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          background: isLightMode ? 'rgba(244,240,232,0.95)' : 'rgba(7,9,15,0.96)',
          backdropFilter: 'blur(26px)',
        }}
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-lg mx-auto h-full flex flex-col">
        {/* Sticky Top Header */}
        <div className="w-full flex items-center justify-between px-6 pt-8 pb-4 border-b border-current/10 shrink-0">
          <div className="flex items-center gap-3">
            <CompassIcon size={22} style={{ color: accentHex }} />
            <div>
              <h2 className={`font-serif-eng text-lg font-medium uppercase tracking-[0.2em] ${tTextMain}`}>
                Qibla Compass
              </h2>
              <span className={`font-calligraphy text-sm opacity-70 ${tTextSub}`} dir="rtl">
                اتجاه القِبلة
              </span>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close Qibla Compass"
            onClick={onClose}
            className={`w-11 h-11 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
              isLightMode
                ? 'bg-white/70 border-black/10 text-[#4a453d]'
                : 'bg-white/5 border-white/10 text-white'
            }`}
          >
            <ChevronDownIcon size={20} />
          </button>
        </div>

        {/* Center Celestial Compass */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-6 gap-6 overflow-y-auto hide-scrollbar">
          {/* Location Trigger */}
          <button
            type="button"
            onClick={onOpenCityPicker}
            className={`min-h-[42px] px-4 py-2 rounded-full border flex items-center gap-2 cursor-pointer transition-colors ${
              isLightMode
                ? 'bg-white/75 border-black/10 text-[#1a1814] hover:bg-white'
                : 'bg-white/[0.04] border-white/10 text-[#f5eee0] hover:bg-white/[0.08]'
            }`}
          >
            <MapPinIcon size={14} style={{ color: accentHex }} />
            <span className="font-serif-eng text-xs uppercase tracking-[0.16em]">
              {hasLocation ? prayerTimes.cityLabel : 'Choose City or GPS'}
            </span>
          </button>

          {!hasLocation ? (
            <div className="max-w-[280px] text-center flex flex-col items-center gap-4 my-6">
              <p className={`font-serif-eng text-sm leading-relaxed opacity-75 ${tTextSub}`}>
                Select your city or enable location access to calculate the exact bearing toward the Kaaba.
              </p>
              <button
                type="button"
                onClick={onOpenCityPicker}
                className={`min-h-[44px] px-6 py-2.5 rounded-2xl font-serif-eng text-xs uppercase tracking-[0.18em] border cursor-pointer transition-all ${
                  isLightMode
                    ? 'bg-[#9c7533] text-white border-[#9c7533]'
                    : 'bg-[#d2a24b]/20 text-[#e5c17b] border-[#d2a24b]/40'
                }`}
              >
                Set Location
              </button>
            </div>
          ) : (
            <>
              {/* Compass Dial */}
              <div className="relative w-[244px] h-[244px] flex items-center justify-center shrink-0">
                {/* Soft Alignment Halo */}
                <div
                  aria-hidden="true"
                  className="absolute inset-4 rounded-full transition-opacity duration-500 pointer-events-none blur-xl"
                  style={{
                    background: isAligned ? alignedHex : accentHex,
                    opacity: isAligned ? 0.24 : 0.08,
                  }}
                />

                {/* Rotating Cardinal Ring */}
                <svg
                  viewBox="0 0 240 240"
                  className="absolute inset-0 w-full h-full transition-transform duration-300 ease-out"
                  style={{ transform: `rotate(${roseRotation}deg)` }}
                >
                  <circle
                    cx="120"
                    cy="120"
                    r="106"
                    fill="none"
                    stroke={isLightMode ? 'rgba(26,24,20,0.12)' : 'rgba(255,255,255,0.12)'}
                    strokeWidth="1"
                  />
                  <circle
                    cx="120"
                    cy="120"
                    r="86"
                    fill="none"
                    stroke={isLightMode ? 'rgba(26,24,20,0.06)' : 'rgba(255,255,255,0.06)'}
                    strokeWidth="1"
                    strokeDasharray="2 6"
                  />
                  {/* Minor Degree Ticks */}
                  {Array.from({ length: 24 }).map((_, idx) => {
                    const deg = idx * 15;
                    const isMajor = deg % 90 === 0;
                    return (
                      <line
                        key={deg}
                        x1="120"
                        y1={isMajor ? '14' : '16'}
                        x2="120"
                        y2={isMajor ? '24' : '21'}
                        stroke={
                          deg === 0
                            ? accentHex
                            : isLightMode
                              ? 'rgba(26,24,20,0.22)'
                              : 'rgba(255,255,255,0.22)'
                        }
                        strokeWidth={isMajor ? '1.6' : '1'}
                        transform={`rotate(${deg} 120 120)`}
                      />
                    );
                  })}

                  {/* Cardinal Labels */}
                  <text
                    x="120"
                    y="38"
                    textAnchor="middle"
                    fontSize="10"
                    fontFamily="serif"
                    letterSpacing="2"
                    fill={accentHex}
                  >
                    N
                  </text>
                  <text
                    x="204"
                    y="124"
                    textAnchor="middle"
                    fontSize="9"
                    fontFamily="serif"
                    fill={isLightMode ? 'rgba(26,24,20,0.45)' : 'rgba(245,238,224,0.45)'}
                  >
                    E
                  </text>
                  <text
                    x="120"
                    y="210"
                    textAnchor="middle"
                    fontSize="9"
                    fontFamily="serif"
                    fill={isLightMode ? 'rgba(26,24,20,0.45)' : 'rgba(245,238,224,0.45)'}
                  >
                    S
                  </text>
                  <text
                    x="36"
                    y="124"
                    textAnchor="middle"
                    fontSize="9"
                    fontFamily="serif"
                    fill={isLightMode ? 'rgba(26,24,20,0.45)' : 'rgba(245,238,224,0.45)'}
                  >
                    W
                  </text>
                </svg>

                {/* Fixed Top Reference Index Tick */}
                <div
                  aria-hidden="true"
                  className="absolute top-1 left-1/2 -translate-x-1/2 w-[2px] h-3 rounded-full"
                  style={{ backgroundColor: isAligned ? alignedHex : accentHex }}
                />

                {/* Qibla Pointer Needle */}
                <div
                  className="absolute inset-0 flex items-center justify-center transition-transform duration-300 ease-out pointer-events-none"
                  style={{ transform: `rotate(${pointerRotation}deg)` }}
                >
                  <svg viewBox="0 0 240 240" className="w-full h-full">
                    {/* Pointer Shaft */}
                    <line
                      x1="120"
                      y1="120"
                      x2="120"
                      y2="48"
                      stroke={isAligned ? alignedHex : accentHex}
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <line
                      x1="120"
                      y1="120"
                      x2="120"
                      y2="162"
                      stroke={isLightMode ? 'rgba(26,24,20,0.18)' : 'rgba(255,255,255,0.18)'}
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                    {/* Minimalist Kaaba Square Glyph at Tip */}
                    <rect
                      x="112"
                      y="38"
                      width="16"
                      height="16"
                      rx="3"
                      fill={isAligned ? alignedHex : accentHex}
                    />
                    <line
                      x1="112"
                      y1="43"
                      x2="128"
                      y2="43"
                      stroke={isLightMode ? '#f4f0e8' : '#090b10'}
                      strokeWidth="1.5"
                    />
                    {/* Center Pivot */}
                    <circle
                      cx="120"
                      cy="120"
                      r="5"
                      fill={isAligned ? alignedHex : accentHex}
                    />
                  </svg>
                </div>
              </div>

              {/* Bearing Telemetry & Guidance */}
              <div className="flex flex-col items-center text-center gap-1.5">
                <span
                  className={`font-serif-eng text-3xl font-light tabular-nums tracking-tight ${
                    isAligned ? '' : tTextMain
                  }`}
                  style={{ color: isAligned ? alignedHex : undefined }}
                >
                  {qiblaBearing}° {qiblaCardinal}
                </span>
                <p
                  className="font-serif-eng text-sm tracking-wide transition-colors"
                  style={{ color: isAligned ? alignedHex : accentHex }}
                >
                  {guidanceText}
                </p>
                {distanceKm !== null && (
                  <p className={`font-serif-eng text-xs opacity-55 tabular-nums ${tTextSub}`}>
                    {distanceKm.toLocaleString()} km to Masjid al-Haram
                  </p>
                )}
              </div>

              {requiresIosPermission && (
                <button
                  type="button"
                  onClick={requestCompassPermission}
                  className={`min-h-[44px] px-5 py-2.5 rounded-2xl border font-serif-eng text-xs uppercase tracking-[0.16em] cursor-pointer transition-all ${
                    isLightMode
                      ? 'bg-[#9c7533] text-white border-[#9c7533]'
                      : 'bg-[#d2a24b]/20 text-[#e5c17b] border-[#d2a24b]/40'
                  }`}
                >
                  Enable Live Sensor
                </button>
              )}

              {sensorStatus === 'denied' && (
                <p className={`font-serif-eng text-[11px] opacity-55 text-center max-w-[260px] ${tTextSub}`}>
                  Compass sensor permission was declined. Use True North as your reference ({qiblaBearing}° {qiblaCardinal}).
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
