import { useMemo, useState } from 'react';
import { CheckCircleIcon, FlameIcon } from '../icons/Icons';
import { buildStreakStatus, STREAK_MILESTONES } from '../../utils/devotionLogic';

const SacredStarSeal = ({ unlocked, accentHex, isLightMode }) => {
  const strokeColor = unlocked
    ? accentHex
    : isLightMode
      ? 'rgba(44, 39, 32, 0.25)'
      : 'rgba(228, 218, 200, 0.24)';

  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
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
        r={unlocked ? '2.4' : '1.4'}
        fill={unlocked ? accentHex : strokeColor}
      />
    </svg>
  );
};

export const DailyStreakTracker = ({
  historyMap,
  isLightMode = false,
}) => {
  const [selectedDateStr, setSelectedDateStr] = useState(null);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState(null);

  const status = useMemo(() => buildStreakStatus(historyMap), [historyMap]);
  const rewardHex = isLightMode ? '#9c7533' : '#d2a24b';

  const tTextMain = isLightMode ? 'text-[#1a1814]' : 'text-[rgba(245,238,224,0.92)]';
  const tTextSub = isLightMode ? 'text-[#2c2720]' : 'text-[rgba(228,218,200,0.62)]';
  const glowSub = isLightMode ? '0 1px 1px rgba(255,255,255,0.6)' : '0 1px 1px rgba(0,0,0,0.8)';
  const dividerClass = isLightMode ? 'border-black/[0.06]' : 'border-white/[0.06]';

  const selectedDay = useMemo(() => {
    if (!selectedDateStr) return null;
    return status.weekDays.find((d) => d.dateStr === selectedDateStr) || null;
  }, [selectedDateStr, status.weekDays]);

  const selectedMilestone = useMemo(() => {
    if (!selectedMilestoneId) return null;
    return STREAK_MILESTONES.find((m) => m.id === selectedMilestoneId) || null;
  }, [selectedMilestoneId]);

  const formatDaySummary = (day) => {
    if (!day) return '';
    const parts = [];
    if (day.prayers > 0) parts.push(`${day.prayers} ${day.prayers === 1 ? 'prayer' : 'prayers'}`);
    if (day.verses > 0) parts.push(`${day.verses} ${day.verses === 1 ? 'verse' : 'verses'}`);
    if (day.practices > 0) {
      parts.push(`${day.practices} ${day.practices === 1 ? 'practice' : 'practices'}`);
    }
    const label = day.isToday ? `Today (${day.dayNum})` : `${day.dayShort} ${day.dayNum}`;
    return parts.length > 0 ? `${label} · ${parts.join(' · ')}` : `${label} · Quiet day — no devotion logged`;
  };

  return (
    <section
      aria-label="Daily Streak Tracker"
      className={`w-full rounded-[20px] border transition-all duration-700 mb-5 overflow-hidden ${
        isLightMode
          ? 'bg-white/45 border-white/70 island-light'
          : 'bg-white/[0.02] border-white/[0.05] island-dark'
      }`}
    >
      {/* Header Strip */}
      <div className={`flex items-center justify-between px-4 pt-3.5 pb-2.5 border-b ${dividerClass}`}>
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className={`font-serif-eng text-[8px] uppercase ${tTextSub} opacity-85 whitespace-nowrap`}
            style={{ letterSpacing: '0.2em', textShadow: glowSub }}
          >
            Daily Streak
          </span>
          <span className={`${tTextSub} opacity-35 text-[9px]`} aria-hidden="true">
            ·
          </span>
          <span
            className={`font-serif-eng text-[8px] uppercase tabular-nums ${tTextSub} opacity-70 whitespace-nowrap`}
            style={{ letterSpacing: '0.16em', textShadow: glowSub }}
          >
            Best {status.longestStreak}d
          </span>
        </div>

        <span
          className="font-calligraphy text-[15px] leading-none shrink-0"
          style={{ color: rewardHex, opacity: status.activeMilestone ? 0.95 : 0.65 }}
          dir="rtl"
          title={status.activeMilestone ? status.activeMilestone.title : 'Steadfastness'}
        >
          {status.activeMilestone ? status.activeMilestone.arabic : 'مُواظَبَة'}
        </span>
      </div>

      {/* Hero Centerpiece + Progress */}
      <div className="px-4 pt-3.5 pb-3">
        <div className="flex items-center gap-3.5">
          {/* Flame Vessel */}
          <div
            className={`relative w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-500 ${
              status.todayActive
                ? 'border-transparent'
                : status.atRisk
                  ? 'border-dashed'
                  : isLightMode
                    ? 'border-black/10 bg-black/[0.02]'
                    : 'border-white/10 bg-white/[0.02]'
            }`}
            style={{
              backgroundColor: status.todayActive
                ? `${rewardHex}1f`
                : status.atRisk
                  ? `${rewardHex}0d`
                  : undefined,
              borderColor: status.todayActive
                ? `${rewardHex}55`
                : status.atRisk
                  ? `${rewardHex}66`
                  : undefined,
              boxShadow: status.todayActive ? `0 0 22px ${rewardHex}2e` : undefined,
            }}
          >
            <FlameIcon
              size={22}
              filled={status.todayActive}
              style={{
                color: status.todayActive || status.atRisk ? rewardHex : undefined,
              }}
              className={
                status.todayActive
                  ? 'transition-transform duration-500 scale-105'
                  : status.atRisk
                    ? 'animate-pulse'
                    : `${tTextSub} opacity-40`
              }
            />
          </div>

          {/* Count + Status Headline */}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <span
                className={`font-serif-eng text-[26px] leading-none font-light tabular-nums ${tTextMain}`}
                style={{ textShadow: glowSub }}
              >
                {status.currentStreak}
              </span>
              <span
                className={`font-serif-eng text-[11px] uppercase tracking-[0.16em] ${tTextSub} opacity-80`}
              >
                {status.currentStreak === 1 ? 'Day' : 'Days'}
              </span>
              {status.todayActive && (
                <span
                  className="font-serif-eng text-[9px] uppercase tracking-[0.14em] ml-auto shrink-0 font-medium"
                  style={{ color: rewardHex }}
                >
                  Lit Today
                </span>
              )}
              {status.atRisk && (
                <span
                  className="font-serif-eng text-[9px] uppercase tracking-[0.14em] ml-auto shrink-0 font-medium"
                  style={{ color: rewardHex }}
                >
                  Due Today
                </span>
              )}
            </div>

            <p
              className={`font-serif-eng text-[11px] leading-snug mt-1 truncate ${tTextSub} opacity-85`}
            >
              {status.headline}
            </p>
          </div>
        </div>

        {/* Next Milestone Progress Track */}
        <div className="mt-3.5">
          <div className="flex items-center justify-between text-[9px] font-serif-eng uppercase tracking-[0.14em] mb-1.5">
            <span className={`${tTextSub} opacity-75 truncate`}>
              Next · {status.nextMilestone.title} ({status.nextMilestone.days}d)
            </span>
            <span className="tabular-nums shrink-0 font-medium" style={{ color: rewardHex }}>
              {status.currentStreak}/{status.nextMilestone.days}d
            </span>
          </div>
          <div
            className={`w-full h-1 rounded-full overflow-hidden ${
              isLightMode ? 'bg-black/[0.07]' : 'bg-white/[0.08]'
            }`}
            role="progressbar"
            aria-valuenow={status.progressToNextPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Progress toward ${status.nextMilestone.title} milestone`}
          >
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${status.progressToNextPct}%`,
                backgroundColor: rewardHex,
              }}
            />
          </div>
        </div>
      </div>

      {/* 7-Day Rolling Cadence Chain */}
      <div className={`px-3 pt-2.5 pb-3 border-t ${dividerClass}`}>
        <div className="grid grid-cols-7 items-center relative">
          {status.weekDays.map((day, idx) => {
            const isSelected = selectedDateStr === day.dateStr;
            const prevDay = idx > 0 ? status.weekDays[idx - 1] : null;
            const linkPrev = Boolean(day.active && prevDay?.active);

            return (
              <div key={day.dateStr} className="relative flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMilestoneId(null);
                    setSelectedDateStr((cur) => (cur === day.dateStr ? null : day.dateStr));
                  }}
                  aria-pressed={isSelected}
                  aria-label={formatDaySummary(day)}
                  className={`relative z-10 w-full min-h-[54px] rounded-xl flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    isSelected
                      ? isLightMode
                        ? 'bg-black/[0.05]'
                        : 'bg-white/[0.06]'
                      : isLightMode
                        ? 'hover:bg-black/[0.03]'
                        : 'hover:bg-white/[0.03]'
                  }`}
                >
                  <span
                    className={`font-serif-eng text-[8.5px] uppercase leading-none ${
                      day.isToday ? 'font-semibold' : `${tTextSub} opacity-65`
                    }`}
                    style={{ color: day.isToday ? rewardHex : undefined }}
                  >
                    {day.dayLetter}
                  </span>

                  {/* Illuminated Day Seal with Centered Connecting Thread */}
                  <div className="relative w-full flex items-center justify-center">
                    {linkPrev && (
                      <span
                        aria-hidden="true"
                        className="absolute top-1/2 -translate-y-1/2 -left-1/2 w-full h-[1.5px] pointer-events-none"
                        style={{ backgroundColor: `${rewardHex}66` }}
                      />
                    )}

                    <span
                      className={`relative z-10 w-[24px] h-[24px] rounded-full flex items-center justify-center transition-all duration-300 ${
                        day.tier === 3
                          ? ''
                          : day.active
                            ? 'border'
                            : day.isToday
                              ? 'border border-dashed'
                              : `border ${isLightMode ? 'border-black/10 bg-[#faf7f0]' : 'border-white/10 bg-[#0d1018]'}`
                      }`}
                      style={{
                        backgroundColor:
                          day.tier === 3
                            ? rewardHex
                            : day.tier === 2
                              ? isLightMode
                                ? '#ede3cf'
                                : '#2a2214'
                              : day.tier === 1
                                ? isLightMode
                                  ? '#f3ecdd'
                                  : '#1f1b13'
                                : undefined,
                        borderColor: day.active || day.isToday ? rewardHex : undefined,
                        boxShadow:
                          day.tier >= 2 ? `0 0 10px ${rewardHex}35` : undefined,
                      }}
                    >
                      {day.tier === 3 ? (
                        <CheckCircleIcon
                          size={13}
                          className={isLightMode ? 'text-[#faf8f4]' : 'text-[#0c0e14]'}
                        />
                      ) : day.active ? (
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: rewardHex }}
                        />
                      ) : day.isToday ? (
                        <span
                          className="w-1 h-1 rounded-full opacity-70"
                          style={{ backgroundColor: rewardHex }}
                        />
                      ) : null}
                    </span>
                  </div>

                  <span
                    className={`font-serif-eng text-[8.5px] tabular-nums leading-none ${
                      day.isToday ? 'font-semibold' : `${tTextSub} opacity-55`
                    }`}
                    style={{ color: day.isToday ? rewardHex : undefined }}
                  >
                    {day.dayNum}
                  </span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Selected Day Breakdown Drawer */}
        {selectedDay && (
          <p
            className={`mt-2 pt-2 border-t ${dividerClass} text-center font-serif-eng text-[10.5px] ${tTextMain} opacity-85`}
          >
            {formatDaySummary(selectedDay)}
          </p>
        )}
      </div>

      {/* Consistency Milestone Seals */}
      <div className={`px-3.5 pt-2.5 pb-3 border-t ${dividerClass}`}>
        <div className="flex items-center justify-between px-0.5 mb-2">
          <span
            className={`font-serif-eng text-[8px] uppercase ${tTextSub} opacity-75`}
            style={{ letterSpacing: '0.18em' }}
          >
            Consistency Seals
          </span>
          <span className={`font-serif-eng text-[8.5px] tabular-nums ${tTextSub} opacity-65`}>
            {status.unlockedMilestoneIds.length}/{STREAK_MILESTONES.length} earned
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {STREAK_MILESTONES.map((milestone) => {
            const unlocked = status.unlockedMilestoneIds.includes(milestone.id);
            const isSelected = selectedMilestoneId === milestone.id;
            return (
              <button
                key={milestone.id}
                type="button"
                onClick={() => {
                  setSelectedDateStr(null);
                  setSelectedMilestoneId((cur) => (cur === milestone.id ? null : milestone.id));
                }}
                aria-pressed={isSelected}
                aria-label={`${milestone.title} milestone (${milestone.days} ${milestone.days === 1 ? 'day' : 'days'}) — ${unlocked ? 'Earned' : 'Locked'}`}
                className={`min-h-[44px] rounded-xl flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
                  isSelected
                    ? isLightMode
                      ? 'bg-black/[0.06]'
                      : 'bg-white/[0.07]'
                    : isLightMode
                      ? 'hover:bg-black/[0.03]'
                      : 'hover:bg-white/[0.03]'
                }`}
              >
                <SacredStarSeal
                  unlocked={unlocked}
                  accentHex={rewardHex}
                  isLightMode={isLightMode}
                />
                <span
                  className={`font-serif-eng text-[8px] tabular-nums leading-none ${
                    unlocked ? 'font-medium' : `${tTextSub} opacity-50`
                  }`}
                  style={{ color: unlocked ? rewardHex : undefined }}
                >
                  {milestone.days}d
                </span>
              </button>
            );
          })}
        </div>

        {selectedMilestone && (
          <div className={`mt-2 pt-2 border-t ${dividerClass} text-center px-1`}>
            <p className={`font-serif-eng text-[11px] font-medium ${tTextMain}`}>
              {selectedMilestone.title} · {selectedMilestone.days}{' '}
              {selectedMilestone.days === 1 ? 'Day' : 'Days'}{' '}
              <span className="opacity-70 font-normal">
                (
                {status.unlockedMilestoneIds.includes(selectedMilestone.id)
                  ? 'Earned'
                  : `${Math.max(1, selectedMilestone.days - status.currentStreak)}d away`}
                )
              </span>
            </p>
            <p className={`font-serif-eng italic text-[10.5px] leading-snug mt-0.5 ${tTextSub} opacity-80`}>
              {selectedMilestone.note}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
