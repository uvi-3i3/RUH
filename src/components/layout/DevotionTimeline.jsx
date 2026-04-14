import { memo } from 'react';

export const DevotionTimeline = memo(({ completedCount, isLightMode, isHikmah, accentColor, accentGlow }) => {
  const isCompleted = completedCount === 5;
  
  const baseColor = isLightMode ? 'rgba(74, 69, 61, 0.18)' : 'rgba(228, 218, 200, 0.15)';
  
  const activeColor = isHikmah 
      ? (isLightMode ? '#0d9488' : '#14b8a6')
      : (accentColor || (isLightMode ? '#9c7533' : '#d2a24b'));
      
  const glowColor = isHikmah 
      ? (isLightMode ? 'rgba(13,148,136,0.6)' : 'rgba(20,184,166,0.6)')
      : (accentGlow || (isLightMode ? 'rgba(156,117,51,0.6)' : 'rgba(210,162,75,0.6)'));

  let fillHeight = 0;
  if (completedCount > 0 && completedCount < 5) fillHeight = completedCount * 12; 
  else if (completedCount === 5) fillHeight = 180; 

  const wrapperClass = isCompleted 
    ? "left-1/2 scale-[3.5] md:scale-[5] opacity-[0.025] z-0" 
    : "left-[34px] md:left-[90px] scale-100 opacity-80 md:opacity-100 z-20";

  const transitionStyle = { transition: `all 2.8s cubic-bezier(0.16,1,0.3,1) ${isCompleted ? '1.2s' : '0s'}` };

  return (
    <div 
      className={`fixed top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none mix-blend-normal ${wrapperClass}`} 
      style={transitionStyle}
    >
      <svg width="60" height="180" viewBox="0 0 60 180" className="overflow-visible w-[60px] h-[180px]">
        <rect x="0" y="0" width="60" height="60" fill="none" stroke={isCompleted ? activeColor : baseColor} strokeWidth={isCompleted ? "1.5" : "1.2"} style={{ transition: 'all 1.2s cubic-bezier(0.16,1,0.3,1)' }} />
        <rect x="0" y="0" width="60" height="60" fill="none" stroke={isCompleted ? glowColor : 'transparent'} strokeWidth="4" style={{ transition: 'all 1.2s cubic-bezier(0.16,1,0.3,1)', filter: 'blur(4px)' }} />
        <line x1="30" y1="0" x2="30" y2="180" stroke={baseColor} strokeWidth="1.2" />
        {[1, 2, 3, 4, 5].map((i) => <line key={`base-${i}`} x1="20" y1={i * 10} x2="40" y2={i * 10} stroke={baseColor} strokeWidth="1.2" />)}
        <line x1="30" y1="0" x2="30" y2={fillHeight} stroke={activeColor} strokeWidth="1.5" style={{ transition: 'all 1.2s cubic-bezier(0.16,1,0.3,1)' }} />
        <line x1="30" y1="0" x2="30" y2={fillHeight} stroke={glowColor} strokeWidth="4" style={{ transition: 'all 1.2s cubic-bezier(0.16,1,0.3,1)', filter: 'blur(4px)' }} />
        {[1, 2, 3, 4, 5].map((i) => {
          const isActive = completedCount >= i;
          return (
            <g key={`active-${i}`}>
                <line x1="20" y1={i * 10} x2="40" y2={i * 10} stroke={isActive ? activeColor : 'transparent'} strokeWidth="1.5" style={{ transition: 'stroke 0.3s ease 0.6s' }} />
                {isActive && <line x1="20" y1={i * 10} x2="40" y2={i * 10} stroke={glowColor} strokeWidth="4" style={{ filter: 'blur(3px)' }} />}
            </g>
          );
        })}
      </svg>
    </div>
  );
});
