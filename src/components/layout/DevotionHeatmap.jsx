import { useMemo } from 'react';

// ARCH-06: Updated to support enriched history format { prayers: N, verses: N }
const generateHeatmapData = (historyMap) => {
  const data = [];
  const today = new Date();
  
  const keys = Object.keys(historyMap).sort();
  let startDate = new Date();
  if (keys.length > 0) {
     startDate = new Date(keys[0]);
  }

  const timeDiff = today.getTime() - startDate.getTime();
  let daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  if (daysDiff < 1) daysDiff = 1;
  
  for (let i = daysDiff - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    
    const entry = historyMap[dateStr];
    let totalActivity = 0;
    let prayers = 0;
    let verses = 0;
    
    if (entry) {
      if (typeof entry === 'number') {
        // Legacy format support
        totalActivity = entry;
        prayers = entry;
      } else {
        prayers = entry.prayers || 0;
        verses = entry.verses || 0;
        totalActivity = prayers + verses;
      }
    }
    
    data.push({
      date: d,
      count: totalActivity,
      prayers,
      verses
    });
  }
  
  const weeks = [];
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7));
  }
  
  return weeks;
};

export const DevotionHeatmap = ({ isLightMode, historyMap }) => {
  const weeks = useMemo(() => generateHeatmapData(historyMap), [historyMap]);


  const getCellColor = (count) => {
    if (isLightMode) {
      if (count === 0) return 'bg-black/[0.04] border-black/[0.05]';
      if (count <= 2) return 'bg-[#9c7533]/40 border-[#9c7533]/20';
      if (count <= 4) return 'bg-[#9c7533]/70 border-[#9c7533]/30';
      return 'bg-[#9c7533] border-[#9c7533] shadow-[0_0_8px_rgba(156,117,51,0.4)]';
    } else {
      if (count === 0) return 'bg-white/[0.03] border-white/[0.05]';
      if (count <= 2) return 'bg-[#d2a24b]/40 border-[#d2a24b]/20';
      if (count <= 4) return 'bg-[#d2a24b]/70 border-[#d2a24b]/30';
      return 'bg-[#d2a24b] border-[#d2a24b] shadow-[0_0_8px_rgba(210,162,75,0.4)]';
    }
  };

  const tTextMain = isLightMode ? 'text-[#1a1814]' : 'text-[rgba(245,238,224,0.92)]';
  const glowSub = isLightMode ? '0 1px 1px rgba(255,255,255,0.6)' : '0 1px 1px rgba(0,0,0,0.8)';

  return (
    <div className="w-full flex flex-col items-start justify-center mb-4">
      <div className="flex items-center justify-between w-full mb-2 px-1">
        <h3 className={`font-serif-eng text-sm tracking-wide ${tTextMain} opacity-90 transition-colors duration-1000`} style={{ textShadow: glowSub }}>Devotion History</h3>
        <span className={`font-serif-eng text-[10px] uppercase ${isLightMode ? 'text-[#9c7533]' : 'text-[#d2a24b]'} tracking-widest transition-colors duration-1000`}>Lifetime Tracker</span>
      </div>

      <div className="w-full overflow-x-auto hide-scrollbar pb-4 -mx-4 px-4 mask-edges" style={{ WebkitMaskImage: 'linear-gradient(to right, transparent, black 15px, black calc(100% - 15px), transparent)' }}>
        <div className="flex gap-1.5 min-w-max">
          {weeks.map((week, wIndex) => (
            <div key={wIndex} className="flex flex-col gap-1.5">
              {week.map((day, dIndex) => (
                <div 
                  key={dIndex}
                  className={`w-3 h-3 rounded-[3px] border transition-all duration-1000 ${getCellColor(day.count)}`}
                  title={`${day.prayers} prayers, ${day.verses} verses on ${day.date.toLocaleDateString()}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
