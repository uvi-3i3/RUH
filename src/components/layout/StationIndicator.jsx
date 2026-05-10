import { memo } from 'react';

export const StationIndicator = memo(({ stations, currentStation, unlockedStations, yaqeenProgress, accentHex, onSelectStation, fogOpacity, nextStation }) => {
  if (!stations || stations.length === 0) return null;

  return (
    <div className="flex items-center gap-[10px]">
      {stations.map((station, idx) => {
        const isCurrent = idx === currentStation;
        const isUnlocked = unlockedStations.includes(idx);
        const isFrontier = idx === Math.max(...unlockedStations) + 1;

        return (
          <button
            key={station.id}
            onClick={() => isUnlocked && onSelectStation(idx)}
            className="relative flex items-center justify-center group pointer-events-auto"
            style={{ cursor: isUnlocked ? 'pointer' : 'default' }}
          >
            {/* Bead */}
            <div
              className="rounded-full transition-all duration-700 ease-out"
              style={{
                width: isCurrent ? 10 : 6,
                height: isCurrent ? 10 : 6,
                backgroundColor: isCurrent
                  ? accentHex
                  : isUnlocked
                    ? `${accentHex}88`
                    : isFrontier
                      ? `${accentHex}22`
                      : 'rgba(255,255,255,0.08)',
                boxShadow: isCurrent ? `0 0 12px ${accentHex}60` : 'none',
              }}
            />

            {/* Pulse ring on current */}
            {isCurrent && (
              <div
                className="absolute rounded-full animate-ping"
                style={{
                  width: 18,
                  height: 18,
                  backgroundColor: `${accentHex}15`,
                }}
              />
            )}

            {/* Frontier fog progress ring */}
            {isFrontier && yaqeenProgress > 0 && (
              <svg className="absolute" width="18" height="18" viewBox="0 0 18 18">
                <circle
                  cx="9" cy="9" r="7"
                  fill="none"
                  stroke={`${accentHex}30`}
                  strokeWidth="1"
                />
                <circle
                  cx="9" cy="9" r="7"
                  fill="none"
                  stroke={accentHex}
                  strokeWidth="1.5"
                  strokeDasharray={`${(yaqeenProgress / 100) * 44} 44`}
                  strokeLinecap="round"
                  transform="rotate(-90 9 9)"
                  className="transition-all duration-1000"
                  style={{ opacity: 0.6 }}
                />
              </svg>
            )}

            {/* FEAT-03: Fog Lifting — Show next station name with blur/opacity tied to yaqeen */}
            {isFrontier && nextStation && (
              <div 
                className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none transition-all duration-1000"
                style={{
                  opacity: Math.max(0.08, 1 - fogOpacity),
                  filter: `blur(${fogOpacity * 6}px)`,
                }}
              >
                <span 
                  className="font-arabic text-[11px] block transition-all duration-1000"
                  style={{ 
                    color: accentHex,
                    textShadow: fogOpacity < 0.3 ? `0 0 ${(1 - fogOpacity) * 20}px ${accentHex}80` : 'none',
                  }}
                >
                  {nextStation.name}
                </span>
              </div>
            )}

            {/* Current station name label */}
            {isCurrent && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none">
                <span 
                  className="font-arabic text-[11px] opacity-60 block"
                  style={{ color: accentHex }}
                >
                  {station.name}
                </span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
});
