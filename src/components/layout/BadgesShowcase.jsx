import { useMemo, useState } from 'react';
import { BadgeArtwork } from '../badges/BadgeArtwork';
import { BADGE_TIERS, getBadgeTierStyle } from '../../utils/badgeLogic';
import { hapticCelebrate, hapticDetent } from '../../utils/haptics';

const TIER_ORDER = ['silver', 'gold', 'platinum'];

export const BadgesShowcase = ({
  badgeStatuses = [],
  unlockedCount = 0,
  totalCount = 9,
  isLightMode = false,
  onInspectBadge,
}) => {
  const [lockedPreviewId, setLockedPreviewId] = useState(null);

  const tTextMain = isLightMode ? 'text-[#1a1814]' : 'text-[rgba(245,238,224,0.92)]';
  const tTextSub = isLightMode ? 'text-[#2c2720]' : 'text-[rgba(228,218,200,0.68)]';
  const dividerClass = isLightMode ? 'border-black/[0.06]' : 'border-white/[0.06]';

  const groupedByTier = useMemo(() => {
    return TIER_ORDER.map((tierId) => {
      const style = getBadgeTierStyle(tierId, isLightMode);
      const items = badgeStatuses.filter((b) => b.tier === tierId);
      const tierEarned = items.filter((b) => b.unlocked).length;
      return {
        tierId,
        style,
        items,
        tierEarned,
      };
    });
  }, [badgeStatuses, isLightMode]);

  const previewBadge = useMemo(
    () => badgeStatuses.find((b) => b.id === lockedPreviewId) || null,
    [badgeStatuses, lockedPreviewId]
  );

  return (
    <section
      aria-label="Sacred Badges Showcase"
      data-testid="badges-showcase"
      className={`w-full rounded-2xl border transition-all duration-700 overflow-hidden ${
        isLightMode
          ? 'bg-white/62 border-white/80 island-light'
          : 'bg-[#0b0e16]/68 border-white/[0.09] island-dark'
      }`}
    >
      {/* Header Strip */}
      <div className={`flex items-center justify-between px-4 pt-2.5 pb-1.5 border-b ${dividerClass}`}>
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className={`font-serif-eng text-[8px] uppercase ${tTextSub} opacity-85 whitespace-nowrap`}
            style={{ letterSpacing: '0.2em' }}
          >
            Sacred Badges
          </span>
          <span className={`${tTextSub} opacity-35 text-[9px]`} aria-hidden="true">
            ·
          </span>
          <span
            className={`font-serif-eng text-[8px] uppercase tabular-nums ${tTextSub} opacity-82 whitespace-nowrap`}
            style={{ letterSpacing: '0.16em' }}
          >
            {unlockedCount}/{totalCount} Earned
          </span>
        </div>

        <span
          className="font-calligraphy text-[14px] leading-none shrink-0"
          style={{ color: isLightMode ? BADGE_TIERS.gold.light.text : BADGE_TIERS.gold.dark.text }}
          dir="rtl"
        >
          أَوْسِمَة
        </span>
      </div>

      {/* Silver · Gold · Platinum Tiers */}
      <div className={`divide-y ${isLightMode ? 'divide-black/[0.06]' : 'divide-white/[0.06]'}`}>
        {groupedByTier.map(({ tierId, style, items, tierEarned }) => (
          <div key={tierId} className="px-2.5 py-1.5">
            {/* Quiet Tier Sub-Header */}
            <div className="flex items-center justify-between px-1 mb-0.5">
              <div className="flex items-center gap-2">
                <span
                  className="font-serif-eng text-[8px] uppercase font-medium"
                  style={{ color: style.palette.text, letterSpacing: '0.18em' }}
                >
                  {style.label}
                </span>
                <span
                  className="font-calligraphy text-[11px] leading-none opacity-85"
                  style={{ color: style.palette.text }}
                  dir="rtl"
                >
                  {style.arabic}
                </span>
              </div>
              <span className={`font-serif-eng text-[9px] font-medium tabular-nums ${tTextSub} opacity-75`}>
                {tierEarned}/{items.length}
              </span>
            </div>

            {/* 3-Column Medallion Row */}
            <div className="grid grid-cols-3 gap-1.5">
              {items.map((badge) => {
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
                        setLockedPreviewId((cur) => (cur === badge.id ? null : badge.id));
                      }
                    }}
                    aria-label={`${badge.title} (${style.label}) — ${
                      badge.unlocked
                        ? 'Earned, tap to replay celebration'
                        : `Locked, ${badge.current} of ${badge.target} ${badge.unitPlural}`
                    }`}
                    className={`group relative rounded-xl px-1 py-1 flex flex-col items-center text-center transition-all duration-300 cursor-pointer ${
                      badge.unlocked
                        ? isLightMode
                          ? 'bg-white/55 hover:bg-white/85'
                          : 'bg-white/[0.035] hover:bg-white/[0.08]'
                        : isSelected
                          ? isLightMode
                            ? 'bg-black/[0.06]'
                            : 'bg-white/[0.07]'
                          : isLightMode
                            ? 'bg-transparent hover:bg-black/[0.03]'
                            : 'bg-transparent hover:bg-white/[0.03]'
                    }`}
                  >
                    <div className="relative flex items-center justify-center transition-transform duration-300 group-hover:scale-105 group-hover:-translate-y-0.5">
                      <BadgeArtwork
                        motif={badge.motif}
                        tier={badge.tier}
                        unlocked={badge.unlocked}
                        animated={badge.unlocked}
                        showSheen={badge.unlocked}
                        size={40}
                        isLightMode={isLightMode}
                      />
                    </div>

                    <span
                      className={`font-serif-eng text-[10px] leading-tight mt-1 whitespace-nowrap ${
                        badge.unlocked ? `${tTextMain} font-medium` : `${tTextSub} opacity-78`
                      }`}
                    >
                      {badge.title}
                    </span>

                    {badge.unlocked ? (
                      <span
                        className="font-serif-eng text-[7px] uppercase tracking-[0.14em] leading-none mt-0.5"
                        style={{ color: style.palette.text }}
                      >
                        Celebrate
                      </span>
                    ) : (
                      <span
                        className={`font-serif-eng text-[8px] tabular-nums tracking-[0.06em] leading-none mt-0.5 ${tTextSub} opacity-65`}
                      >
                        {badge.current}/{badge.target}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Inline Locked Badge Progress Drawer */}
      {previewBadge && !previewBadge.unlocked && (
        <div className={`px-4 py-3 border-t ${dividerClass}`}>
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className={`font-serif-eng text-[11px] font-medium ${tTextMain}`}>
              {previewBadge.title} · {getBadgeTierStyle(previewBadge.tier, isLightMode).label}
            </span>
            <span
              className="font-serif-eng text-[9px] tabular-nums font-medium"
              style={{ color: getBadgeTierStyle(previewBadge.tier, isLightMode).palette.text }}
            >
              {previewBadge.current}/{previewBadge.target} {previewBadge.unitPlural}
            </span>
          </div>
          <p className={`font-serif-eng italic text-[11px] leading-snug mb-2 ${tTextSub} opacity-85`}>
            {previewBadge.description}
          </p>
          <div
            className={`w-full h-1 rounded-full overflow-hidden ${
              isLightMode ? 'bg-black/[0.08]' : 'bg-white/[0.08]'
            }`}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${previewBadge.pct}%`,
                backgroundColor: getBadgeTierStyle(previewBadge.tier, isLightMode).palette.primary,
              }}
            />
          </div>
        </div>
      )}
    </section>
  );
};
