import { CheckCircleIcon, ChevronRightIcon } from '../icons/Icons';

/**
 * Serene Introductory Page for the Sanctuary Study Window.
 * Orients the learner cleanly before entering Lesson I with:
 *  - Calm calligraphic emblem & plain-English overview
 *  - Single hairline-divided 2-part roadmap (clickable to jump directly)
 *  - Clear, progress-aware primary CTA ("Start Lesson" / "Continue Lesson" / "Review Lesson")
 */
export const StudyIntroStage = ({
  intro,
  groups = [],
  summary,
  nextLesson = null,
  isLightMode = false,
  accentHex,
  textSub,
  textMuted,
  stageAnimClass = '',
  onStart,
  onSelectPart,
}) => {
  const hairline = isLightMode ? 'border-[#8a6220]/16' : 'border-white/[0.09]';
  const dividerClass = isLightMode ? 'divide-[#8a6220]/14' : 'divide-white/[0.08]';

  return (
    <div
      data-testid="study-intro-stage"
      className={`w-full max-w-[560px] mx-auto flex flex-col items-center gap-5 sm:gap-7 ${stageAnimClass}`}
    >
      {/* 1. Calm Editorial Masthead */}
      <div className="text-center px-2">
        <p
          className={`font-serif-eng text-[12px] font-medium tracking-[0.06em] mb-1.5 ${textMuted}`}
        >
          {intro.lessonLabel}
        </p>

        <span
          dir="rtl"
          className="font-calligraphy text-[28px] sm:text-[34px] leading-snug block"
          style={{ color: accentHex }}
        >
          {intro.arabicTitle}
        </span>

        <h1
          id="learning-path-heading"
          className="font-serif-eng text-[28px] sm:text-[38px] font-semibold leading-[1.15] mt-1 text-balance"
        >
          {intro.title}
        </h1>

        <p
          className={`font-serif-eng text-[14.5px] sm:text-[16px] leading-relaxed mt-2.5 max-w-[440px] mx-auto ${textSub}`}
        >
          {intro.subtitle}
        </p>
      </div>

      {/* 2. Unified Two-Part Lesson Roadmap (Single Elevation, Hairline Divided) */}
      <div
        role="group"
        aria-label="Lesson parts"
        className={`w-full rounded-2xl border overflow-hidden divide-y ${hairline} ${dividerClass} ${
          isLightMode
            ? 'bg-white/78 island-light'
            : 'bg-[#10141f]/82 island-dark'
        }`}
      >
        {groups.map((group, idx) => {
          const groupStats = summary?.grouped?.[group.id] || {
            discoveredCount: 0,
            totalCount: group.count,
            isComplete: false,
          };

          return (
            <button
              key={group.id}
              type="button"
              data-testid={`study-intro-part-${group.id}`}
              onClick={() => onSelectPart?.(group.id)}
              className={`group w-full min-h-[68px] sm:min-h-[74px] px-4 sm:px-5 py-3.5 text-left flex items-center justify-between gap-4 transition-colors cursor-pointer ${
                isLightMode ? 'hover:bg-white/95' : 'hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <span
                  className="font-serif-eng text-[12px] font-semibold tabular-nums w-5 text-center shrink-0"
                  style={{ color: accentHex }}
                >
                  {idx === 0 ? 'I' : 'II'}
                </span>
                <div className="min-w-0">
                  <p className="font-serif-eng text-[15.5px] sm:text-[17px] font-semibold leading-snug truncate">
                    {group.title}
                  </p>
                  <p className={`font-serif-eng text-[12.5px] sm:text-[13.5px] leading-snug mt-0.5 truncate ${textMuted}`}>
                    {group.subtitle} · {group.count} topics
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {groupStats.isComplete ? (
                  <span
                    className="flex items-center gap-1 font-serif-eng text-[12px] font-medium whitespace-nowrap"
                    style={{ color: accentHex }}
                  >
                    <CheckCircleIcon size={15} />
                    <span>Done</span>
                  </span>
                ) : (
                  <span className={`font-serif-eng text-[12px] tabular-nums whitespace-nowrap ${textMuted}`}>
                    {groupStats.discoveredCount}/{groupStats.totalCount}
                  </span>
                )}
                <ChevronRightIcon
                  size={15}
                  className={`transition-transform duration-200 group-hover:translate-x-0.5 ${textMuted}`}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. Quiet Unboxed Metadata & Source Line */}
      <div className="text-center space-y-1 px-2">
        <p className={`font-serif-eng text-[12.5px] sm:text-[13.5px] tabular-nums ${textSub}`}>
          {summary?.statusText}
        </p>
        <p className={`font-serif-eng italic text-[12px] ${textMuted}`}>
          {intro.sourceNote}
          {summary?.progress?.isComplete && nextLesson
            ? ` · Up next: ${nextLesson.lessonNumber}`
            : ''}
        </p>
      </div>

      {/* 4. Single Clear Primary Action */}
      <div className="w-full sm:w-auto flex flex-col items-center pt-1">
        <button
          type="button"
          data-testid="study-intro-start-btn"
          onClick={onStart}
          className={`w-full sm:w-auto sm:min-w-[232px] min-h-[48px] px-8 rounded-2xl font-serif-eng text-[14.5px] font-semibold tracking-[0.03em] flex items-center justify-center gap-2 whitespace-nowrap transition cursor-pointer active:scale-[0.98] ${
            isLightMode
              ? 'bg-[#463219] text-[#faf3e4] hover:bg-[#594020] shadow-[0_10px_28px_rgba(70,50,25,0.22)]'
              : 'bg-[#d4af6a] text-[#17120c] hover:bg-[#e1be7c] shadow-[0_10px_28px_rgba(212,175,106,0.22)]'
          }`}
        >
          <span>{summary?.ctaLabel || 'Start Lesson'}</span>
          <ChevronRightIcon size={16} />
        </button>
      </div>
    </div>
  );
};
