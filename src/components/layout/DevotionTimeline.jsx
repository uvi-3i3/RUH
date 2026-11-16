import { memo } from 'react';

export const DevotionTimeline = memo(({ completedCount, isLightMode, isHikmah, accentColor, accentGlow, isVisible = true }) => {
  const isCompleted = completedCount === 5;

  const baseColor = isLightMode ? 'rgba(74, 69, 61, 0.14)' : 'rgba(228, 218, 200, 0.13)';

  const activeColor = isHikmah
    ? isLightMode
      ? '#0d9488'
      : '#14b8a6'
    : accentColor || (isLightMode ? '#9c7533' : '#d2a24b');

  const glowColor = isHikmah
    ? isLightMode
      ? 'rgba(13,148,136,0.22)'
      : 'rgba(20,184,166,0.24)'
    : accentGlow
      ? accentGlow.replace(/[\d.]+\)$/, '0.24)')
      : isLightMode
        ? 'rgba(156,117,51,0.22)'
        : 'rgba(210,162,75,0.24)';

  let fillHeight = 0;
  if (completedCount > 0 && completedCount < 5) fillHeight = completedCount * 12;
  else if (completedCount === 5) fillHeight = 160;

  const wrapperClass = !isVisible
    ? 'left-[22px] md:left-[88px] scale-[0.65] opacity-0 z-0'
    : isCompleted
      ? 'left-1/2 scale-[1.8] opacity-0 z-0'
      : 'left-[22px] md:left-[88px] scale-[0.68] md:scale-100 opacity-65 md:opacity-90 z-20';

  const transitionStyle = {
    transition: isVisible
      ? `all 2.8s cubic-bezier(0.16,1,0.3,1) ${isCompleted ? '1.2s' : '0s'}`
      : 'opacity 0.35s ease, transform 0.35s ease',
  };

  return (
    <div
      aria-hidden="true"
      className={`fixed top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none mix-blend-normal ${wrapperClass}`}
      style={transitionStyle}
    >
      <svg width="60" height="160" viewBox="0 0 60 160" className="overflow-visible w-[60px] h-[160px]">
        <line x1="30" y1="0" x2="30" y2="160" stroke={baseColor} strokeWidth="1.2" />
        {[1, 2, 3, 4, 5].map((i) => (
          <line key={`base-${i}`} x1="21" y1={i * 11} x2="39" y2={i * 11} stroke={baseColor} strokeWidth="1.2" />
        ))}
        <line
          x1="30"
          y1="0"
          x2="30"
          y2={fillHeight}
          stroke={glowColor}
          strokeWidth="4.5"
          strokeLinecap="round"
          style={{ transition: 'all 1.2s cubic-bezier(0.16,1,0.3,1)' }}
        />
        <line
          x1="30"
          y1="0"
          x2="30"
          y2={fillHeight}
          stroke={activeColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          style={{ transition: 'all 1.2s cubic-bezier(0.16,1,0.3,1)' }}
        />
        {[1, 2, 3, 4, 5].map((i) => {
          const isActive = completedCount >= i;
          return (
            <g key={`active-${i}`}>
              {isActive && (
                <line
                  x1="21"
                  y1={i * 11}
                  x2="39"
                  y2={i * 11}
                  stroke={glowColor}
                  strokeWidth="4.5"
                  strokeLinecap="round"
                />
              )}
              <line
                x1="21"
                y1={i * 11}
                x2="39"
                y2={i * 11}
                stroke={isActive ? activeColor : 'transparent'}
                strokeWidth="1.5"
                strokeLinecap="round"
                style={{ transition: 'stroke 0.3s ease 0.6s' }}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
});
