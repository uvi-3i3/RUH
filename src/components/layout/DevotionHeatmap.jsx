import { useMemo } from 'react';
import { getLocalDateStr } from '../../utils/devotionLogic';

const TOTAL_DAYS = 105; // 15 weeks × 7 days — fits cleanly inside the 340px Soul Mirror column

const generateHeatmapData = (historyMap = {}) => {
  const data = [];
  const today = new Date();

  for (let i = TOTAL_DAYS - 1; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    const dateStr = getLocalDateStr(d);

    const entry = historyMap[dateStr];
    let totalActivity = 0;
    let prayers = 0;
    let verses = 0;
    let practices = 0;

    if (entry) {
      if (typeof entry === 'number') {
        totalActivity = entry;
        prayers = entry;
      } else {
        prayers = entry.prayers || 0;
        verses = entry.verses || 0;
        practices = entry.practices || 0;
        totalActivity = prayers + verses + practices;
      }
    }

    data.push({
      date: d,
      dateStr,
      count: totalActivity,
      prayers,
      verses,
      practices,
      isToday: i === 0,
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

  const getCellColor = (count, isToday) => {
    const todayRing = isToday
      ? isLightMode
        ? 'ring-1 ring-[#9c7533]/50'
        : 'ring-1 ring-[#d2a24b]/50'
      : '';

    if (isLightMode) {
      if (count === 0) return `bg-black/[0.03] border-black/[0.04] ${todayRing}`;
      if (count <= 2) return `bg-[#9c7533]/30 border-[#9c7533]/20 ${todayRing}`;
      if (count <= 4) return `bg-[#9c7533]/60 border-[#9c7533]/40 ${todayRing}`;
      return `bg-[#9c7533] border-[#9c7533] shadow-[0_0_8px_rgba(156,117,51,0.3)] ${todayRing}`;
    } else {
      if (count === 0) return `bg-white/[0.025] border-white/[0.04] ${todayRing}`;
      if (count <= 2) return `bg-[#d2a24b]/30 border-[#d2a24b]/20 ${todayRing}`;
      if (count <= 4) return `bg-[#d2a24b]/60 border-[#d2a24b]/40 ${todayRing}`;
      return `bg-[#d2a24b] border-[#d2a24b] shadow-[0_0_8px_rgba(210,162,75,0.3)] ${todayRing}`;
    }
  };

  const tTextSub = isLightMode ? 'text-[#2c2720]' : 'text-[rgba(228,218,200,0.62)]';
  const glowSub = isLightMode ? '0 1px 1px rgba(255,255,255,0.6)' : '0 1px 1px rgba(0,0,0,0.8)';

  return (
    <div
      className={`w-full p-4 rounded-[20px] border transition-all duration-1000 mb-5 ${
        isLightMode
          ? 'bg-white/45 border-white/70 island-light'
          : 'bg-white/[0.02] border-white/[0.05] island-dark'
      }`}
    >
      <div className="flex items-center justify-between w-full mb-3 px-0.5">
        <span
          className={`font-serif-eng text-[8px] uppercase ${tTextSub} opacity-85`}
          style={{ letterSpacing: '0.2em', textShadow: glowSub }}
        >
          Consistency
        </span>
        <span
          className={`font-serif-eng text-[8px] uppercase ${tTextSub} opacity-68`}
          style={{ letterSpacing: '0.15em', textShadow: glowSub }}
        >
          15 Weeks
        </span>
      </div>

      <div className="flex justify-between gap-[3px] sm:gap-1 w-full">
        {weeks.map((week, wIndex) => (
          <div key={wIndex} className="flex flex-col gap-[3px] sm:gap-1">
            {week.map((day, dIndex) => (
              <div
                key={dIndex}
                className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-[2px] sm:rounded-[2.5px] border transition-colors duration-700 ${getCellColor(
                  day.count,
                  day.isToday
                )}`}
                title={`${day.prayers} prayers, ${day.verses} verses, ${day.practices} practices on ${day.dateStr}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
