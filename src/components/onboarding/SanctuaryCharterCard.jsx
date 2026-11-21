import { useState, useRef, useEffect } from 'react';
import { ShareIcon, CheckCircleIcon } from '../icons/Icons';
import { buildCharterShareText } from '../../utils/onboardingLogic';
import { hapticSuccess, hapticTapLight } from '../../utils/haptics';
import planCrestImg from '../../assets/images/onboarding_plan_crest_1795261558677.jpg';

/**
 * Compact, non-scrolling Daily Plan card shown on Screen 9.
 * Uses crisp, simple English and the bespoke illuminated geometric crest.
 */
export const SanctuaryCharterCard = ({
  charter,
  isLightMode,
  accentHex,
}) => {
  const [shareFeedback, setShareFeedback] = useState(null);
  const feedbackTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  if (!charter) return null;

  const surfaceBg = isLightMode
    ? 'bg-[#fbf8f1]/94 border-[#9c7533]/28 shadow-[0_18px_44px_-14px_rgba(32,24,14,0.14)]'
    : 'bg-[#0e1320]/88 border-[#d2a24b]/28 shadow-[0_22px_54px_-14px_rgba(0,0,0,0.62)]';
  const innerBorder = isLightMode ? 'border-[#9c7533]/18' : 'border-[#d2a24b]/18';
  const tMain = isLightMode ? 'text-[#1a1814]' : 'text-[#f5eee0]';
  const tSub = isLightMode ? 'text-[#4a4337]' : 'text-[#cfc4b0]';
  const dividerColor = isLightMode ? 'bg-[#9c7533]/18' : 'bg-[#d2a24b]/18';

  const handleShareCharter = async () => {
    hapticTapLight();
    const text = buildCharterShareText(charter);
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: `Ruh — ${charter.seekerName}'s Daily Plan`,
          text,
        });
        hapticSuccess();
        setShareFeedback('Shared');
      } else if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        hapticSuccess();
        setShareFeedback('Copied');
      } else {
        setShareFeedback('Ready');
      }
    } catch {
      try {
        if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
          setShareFeedback('Copied');
        }
      } catch {
        // Ignore restricted clipboard contexts
      }
    }
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = setTimeout(() => {
      feedbackTimerRef.current = null;
      setShareFeedback(null);
    }, 2400);
  };

  return (
    <div
      data-testid="onboarding-charter-card"
      className={`w-full rounded-[24px] border p-2.5 backdrop-blur-md transition-colors duration-300 ${surfaceBg}`}
    >
      <div className={`w-full rounded-[18px] border px-4 py-4 sm:px-6 sm:py-5 flex flex-col gap-3.5 ${innerBorder}`}>
        {/* Top Header + Bespoke Medallion Crest */}
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p
              className="font-serif-eng text-[10px] uppercase tracking-[0.22em]"
              style={{ color: accentHex }}
            >
              Daily Plan
            </p>
            <h3 className={`font-serif-eng text-xl sm:text-2xl font-medium leading-tight mt-0.5 truncate ${tMain}`}>
              {charter.seekerName}&rsquo;s Plan
            </h3>
            <p className={`font-serif-eng text-xs mt-0.5 opacity-80 truncate ${tSub}`}>
              {charter.cityLabel ? charter.cityLabel : charter.atmosphereMode}
              {' · '}
              {charter.chimeLabel}
            </p>
          </div>
          <div
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden shrink-0 shadow-[0_6px_18px_rgba(0,0,0,0.35)] ring-1 ring-[#d2a24b]/40"
            aria-hidden="true"
          >
            <img
              src={planCrestImg}
              alt=""
              className="w-full h-full object-cover scale-[1.39]"
            />
          </div>
        </div>

        <div className={`w-full h-px ${dividerColor}`} />

        {/* Saved Opening Verse */}
        {charter.openingVerse && (
          <div className="flex flex-col items-center text-center px-1 gap-1.5">
            <p
              className={`font-arabic text-lg sm:text-xl leading-[1.7] ${tMain}`}
              dir="rtl"
            >
              {charter.openingVerse.arabic}
            </p>
            <p className={`font-serif-eng text-xs sm:text-sm leading-snug max-w-md ${tSub}`}>
              &ldquo;{charter.openingVerse.translation}&rdquo;
            </p>
            <span
              className="font-serif-eng text-[10px] uppercase tracking-[0.18em]"
              style={{ color: accentHex }}
            >
              {charter.openingVerse.source} · Saved
            </span>
          </div>
        )}

        <div className={`w-full h-px ${dividerColor}`} />

        {/* Chosen Daily Habits */}
        <div className="flex flex-col gap-2">
          <span className={`font-serif-eng text-[10px] uppercase tracking-[0.2em] opacity-75 ${tSub}`}>
            Today&rsquo;s Habits
          </span>
          <ul className="flex flex-col gap-1.5">
            {charter.anchors.map((anchor) => (
              <li key={anchor.id} className="flex items-center gap-2.5">
                <CheckCircleIcon
                  size={15}
                  className="shrink-0"
                  style={{ color: accentHex }}
                />
                <span className={`font-serif-eng text-sm font-medium leading-snug truncate ${tMain}`}>
                  {anchor.label}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer Row */}
        <div className="pt-1 flex items-center justify-between gap-3">
          <span className={`font-serif-eng text-xs opacity-70 ${tSub}`}>
            Saved only on your device
          </span>
          <button
            type="button"
            data-testid="onboarding-share-charter"
            onClick={handleShareCharter}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-xl border font-serif-eng text-xs uppercase tracking-[0.14em] inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              isLightMode
                ? 'border-[#9c7533]/35 text-[#7c5a1e] hover:bg-[#9c7533]/10'
                : 'border-[#d2a24b]/35 text-[#e6c478] hover:bg-[#d2a24b]/12'
            }`}
          >
            <ShareIcon size={13} />
            <span>{shareFeedback || 'Share Plan'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
