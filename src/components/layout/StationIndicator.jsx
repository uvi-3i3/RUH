import { memo } from 'react';
import { CheckCircleIcon } from '../icons/Icons';

export const StationIndicator = memo(({
  stations,
  currentStation,
  unlockedStations,
  yaqeenProgress = 0,
  accentHex,
  onSelectStation,
  isLightMode = false,
}) => {
  if (!stations || stations.length === 0) return null;

  const tTextMain = isLightMode ? 'text-[#1a1814]' : 'text-[rgba(245,238,224,0.92)]';
  const tTextSub = isLightMode ? 'text-[#2c2720]' : 'text-[rgba(228,218,200,0.62)]';
  const glowSub = isLightMode ? '0 1px 1px rgba(255,255,255,0.6)' : '0 1px 1px rgba(0,0,0,0.8)';
  const frontierIdx = Math.max(...unlockedStations) + 1;

  return (
    <section
      aria-label="Spiritual Stations (Maqamat)"
      className={`w-full rounded-[20px] overflow-hidden border transition-all duration-1000 mb-5 ${
        isLightMode
          ? 'bg-white/45 border-white/70 island-light'
          : 'bg-white/[0.02] border-white/[0.05] island-dark'
      }`}
    >
      {/* Header Row */}
      <div
        className={`flex items-center justify-between px-4 pt-3.5 pb-2.5 border-b ${
          isLightMode ? 'border-black/[0.06]' : 'border-white/[0.06]'
        }`}
      >
        <span
          className={`font-serif-eng text-[8px] uppercase ${tTextSub} opacity-85`}
          style={{ letterSpacing: '0.2em', textShadow: glowSub }}
        >
          Maqamat · Stations
        </span>
        <span
          className="font-calligraphy text-[14px] leading-none opacity-85"
          style={{ color: accentHex }}
          dir="rtl"
        >
          المقامات
        </span>
      </div>

      {/* 4-Station Ledger */}
      <div
        role="tablist"
        aria-label="Spiritual Stations (Maqamat)"
        className={`divide-y ${isLightMode ? 'divide-black/[0.05]' : 'divide-white/[0.05]'}`}
      >
        {stations.map((station, idx) => {
          const isCurrent = idx === currentStation;
          const isUnlocked = unlockedStations.includes(idx);
          const isFrontier = idx === frontierIdx;
          const stationLabel = `Station ${idx + 1}: ${station.nameEn || station.subtitle} (${station.name})`;

          const radius = 6.5;
          const circ = 2 * Math.PI * radius;
          const frontierFill = isFrontier ? Math.max(0, Math.min(100, yaqeenProgress)) : 0;

          let statusLine = station.subtitle || 'Awaiting unveiling';
          if (isCurrent) {
            statusLine = `Active · ${station.subtitle || 'Current Station'}`;
          } else if (isUnlocked) {
            statusLine = 'Unlocked · Tap to enter';
          } else if (isFrontier) {
            statusLine = `${frontierFill}% Yaqeen to unveil`;
          }

          return (
            <button
              key={station.id}
              type="button"
              role="tab"
              aria-selected={isCurrent}
              aria-label={stationLabel}
              disabled={!isUnlocked}
              onClick={() => isUnlocked && onSelectStation(idx)}
              className={`relative w-full min-h-[48px] px-4 py-2.5 flex items-center justify-between gap-3 text-left overflow-hidden transition-colors duration-300 ${
                isUnlocked
                  ? isLightMode
                    ? 'cursor-pointer hover:bg-white/40 active:bg-white/60'
                    : 'cursor-pointer hover:bg-white/[0.035] active:bg-white/[0.06]'
                  : 'cursor-default opacity-65'
              }`}
              style={{ touchAction: 'pan-y' }}
            >
              {/* Active Selection Tint or Frontier Yaqeen Meniscus */}
              {isCurrent && (
                <div
                  aria-hidden="true"
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: isLightMode
                      ? 'linear-gradient(90deg, rgba(156,117,51,0.12) 0%, rgba(156,117,51,0.03) 100%)'
                      : 'linear-gradient(90deg, rgba(210,162,75,0.12) 0%, rgba(210,162,75,0.02) 100%)',
                  }}
                />
              )}
              {isFrontier && frontierFill > 0 && (
                <div
                  aria-hidden="true"
                  className="absolute left-0 top-0 bottom-0 pointer-events-none transition-all duration-700"
                  style={{
                    width: `${frontierFill}%`,
                    background: isLightMode
                      ? 'linear-gradient(90deg, rgba(156,117,51,0.04) 0%, rgba(156,117,51,0.12) 100%)'
                      : 'linear-gradient(90deg, rgba(210,162,75,0.04) 0%, rgba(210,162,75,0.12) 100%)',
                  }}
                />
              )}

              {/* Left: State Ring + English Name & Practical Status */}
              <div className="relative z-10 flex items-center gap-3 min-w-0">
                <div className="relative w-[18px] h-[18px] flex items-center justify-center shrink-0">
                  {isCurrent ? (
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
                        backgroundColor: accentHex,
                        boxShadow: `0 0 10px ${accentHex}88`,
                      }}
                    />
                  ) : isUnlocked ? (
                    <CheckCircleIcon size={14} style={{ color: accentHex, opacity: 0.78 }} />
                  ) : isFrontier ? (
                    <svg className="w-[18px] h-[18px] -rotate-90" viewBox="0 0 18 18">
                      <circle
                        cx="9"
                        cy="9"
                        r={radius}
                        fill="none"
                        stroke={isLightMode ? 'rgba(26,24,20,0.14)' : 'rgba(255,255,255,0.12)'}
                        strokeWidth="1.4"
                      />
                      {frontierFill > 0 && (
                        <circle
                          cx="9"
                          cy="9"
                          r={radius}
                          fill="none"
                          stroke={accentHex}
                          strokeWidth="1.5"
                          strokeDasharray={circ}
                          strokeDashoffset={circ * (1 - frontierFill / 100)}
                          strokeLinecap="round"
                        />
                      )}
                    </svg>
                  ) : (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isLightMode ? 'bg-black/20' : 'bg-white/20'
                      }`}
                    />
                  )}
                </div>

                <div className="flex flex-col min-w-0">
                  <span
                    className={`font-serif-eng text-[13.5px] leading-tight font-medium tracking-wide truncate ${
                      isCurrent ? '' : tTextMain
                    }`}
                    style={{ color: isCurrent ? accentHex : undefined }}
                  >
                    {station.nameEn || station.subtitle}
                  </span>
                  <span
                    className={`font-serif-eng text-[9px] uppercase tracking-[0.12em] leading-tight truncate mt-0.5 ${
                      isCurrent ? '' : `${tTextSub} opacity-65`
                    }`}
                    style={{ color: isCurrent ? accentHex : undefined, opacity: isCurrent ? 0.85 : undefined }}
                  >
                    {statusLine}
                  </span>
                </div>
              </div>

              {/* Right: Calligraphic Arabic Station Title */}
              <span
                className={`relative z-10 font-calligraphy text-[17px] leading-none shrink-0 transition-opacity duration-300 ${
                  isCurrent
                    ? 'opacity-100'
                    : isUnlocked
                      ? 'opacity-80'
                      : `${tTextSub} opacity-65`
                }`}
                style={{ color: isCurrent || isUnlocked ? accentHex : undefined }}
                dir="rtl"
              >
                {station.name}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
});
