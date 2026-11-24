import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '../icons/Icons';
import {
  computeTopicQaProgress,
  filterQaByCategory,
  formatQaIndex,
  getAvailableQaCategories,
  getQaCategoryLabel,
  getTopicQaList,
  loadExploredQaIds,
  markQaExplored,
  resolveAdjacentQaId,
  resolveInTopicFollowUps,
  saveExploredQaIds,
} from '../../utils/topicQaLogic';
import { hapticDetent, hapticSuccess, hapticTapLight } from '../../utils/haptics';

function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return true;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export const TopicQaSection = ({
  world = 'burhan',
  activeItem,
  isLightMode = false,
  isSimpleMode = false,
  sectionId = 'topic-qa-codex',
}) => {
  const topicId = activeItem?.id || '';
  const isMiracles = world === 'miracles';

  const qaList = useMemo(
    () => getTopicQaList(world, topicId, isSimpleMode),
    [world, topicId, isSimpleMode]
  );

  const [activeCategory, setActiveCategory] = useState('all');
  const [openIds, setOpenIds] = useState(() => (qaList[0]?.id ? [qaList[0].id] : []));
  const [exploredIds, setExploredIds] = useState(() => loadExploredQaIds());
  const [copiedId, setCopiedId] = useState(null);

  const rowRefs = useRef({});
  const copyTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  const categories = useMemo(
    () => getAvailableQaCategories(qaList, world),
    [qaList, world]
  );

  const visibleList = useMemo(
    () => filterQaByCategory(qaList, activeCategory),
    [qaList, activeCategory]
  );

  const indexMap = useMemo(() => {
    const map = new Map();
    qaList.forEach((item, idx) => {
      map.set(item.id, idx + 1);
    });
    return map;
  }, [qaList]);

  const progress = useMemo(
    () => computeTopicQaProgress(qaList, exploredIds),
    [qaList, exploredIds]
  );

  if (!activeItem || qaList.length === 0) return null;

  const allVisibleOpen =
    visibleList.length > 0 && visibleList.every((item) => openIds.includes(item.id));

  const persistExplored = (idsToMark) => {
    setExploredIds((prev) => {
      let next = prev;
      for (const id of idsToMark) {
        next = markQaExplored(next, id);
      }
      if (next !== prev) {
        saveExploredQaIds(next);
      }
      return next;
    });
  };

  const scrollToQuestion = (qaId) => {
    requestAnimationFrame(() => {
      const el = rowRefs.current[qaId];
      if (el && typeof el.scrollIntoView === 'function') {
        el.scrollIntoView({
          behavior: prefersReducedMotion() ? 'auto' : 'smooth',
          block: 'nearest',
        });
      }
    });
  };

  const handleToggleRow = (qaId) => {
    hapticTapLight();
    const isCurrentlyOpen = openIds.includes(qaId);
    if (isCurrentlyOpen) {
      setOpenIds((prev) => prev.filter((id) => id !== qaId));
    } else {
      setOpenIds((prev) => (prev.includes(qaId) ? prev : [...prev, qaId]));
      persistExplored([qaId]);
    }
  };

  const handleFocusQuestion = (targetId, sourceId = null) => {
    if (!targetId) return;
    hapticDetent();
    // If target lives outside the current category filter, switch to 'all' so it is visible
    if (!visibleList.some((q) => q.id === targetId)) {
      setActiveCategory('all');
    }
    setOpenIds([targetId]);
    persistExplored(sourceId ? [sourceId, targetId] : [targetId]);
    scrollToQuestion(targetId);
  };

  const handleStepQuestion = (currentId, delta) => {
    const nextId = resolveAdjacentQaId(visibleList, currentId, delta);
    if (!nextId) return;
    hapticDetent();
    setOpenIds([nextId]);
    persistExplored([currentId, nextId]);
    scrollToQuestion(nextId);
  };

  const handleToggleAll = () => {
    hapticDetent();
    if (allVisibleOpen) {
      setOpenIds([]);
    } else {
      const visibleIds = visibleList.map((q) => q.id);
      setOpenIds(visibleIds);
      persistExplored(visibleIds);
    }
  };

  const handleSelectCategory = (catKey) => {
    hapticDetent();
    setActiveCategory(catKey);
    const nextList = filterQaByCategory(qaList, catKey);
    if (nextList.length > 0 && !nextList.some((q) => openIds.includes(q.id))) {
      setOpenIds([nextList[0].id]);
    }
  };

  const handleCopyQa = (entry) => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    const text = `Q: ${entry.question}\n\nA: ${entry.answer}\n\n— ${activeItem.title} · Ruh (رُوح)`;
    navigator.clipboard
      .writeText(text)
      .then(() => {
        hapticSuccess();
        setCopiedId(entry.id);
        if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
        copyTimerRef.current = setTimeout(() => setCopiedId(null), 1800);
      })
      .catch(() => {});
  };

  const accentHex = isMiracles
    ? isLightMode
      ? '#8c621c'
      : '#e4be70'
    : isLightMode
      ? '#0f766e'
      : '#2dd4bf';

  const textMain = isMiracles
    ? isLightMode
      ? 'text-[#1d1810]'
      : 'text-[rgba(247,242,231,0.95)]'
    : isLightMode
      ? 'text-[#18211f]'
      : 'text-[rgba(241,247,245,0.95)]';

  const textBody = isMiracles
    ? isLightMode
      ? 'text-[#211b12]'
      : 'text-[rgba(246,241,231,0.92)] tracking-[0.008em]'
    : isLightMode
      ? 'text-[#1c2624]'
      : 'text-[rgba(241,247,245,0.92)] tracking-[0.008em]';

  const textSub = isMiracles
    ? isLightMode
      ? 'text-[#4c402e]'
      : 'text-[rgba(227,216,196,0.76)]'
    : isLightMode
      ? 'text-[#3c4e4a]'
      : 'text-[rgba(209,226,222,0.76)]';

  const textMuted = isMiracles
    ? isLightMode
      ? 'text-[#6c5b43]'
      : 'text-[rgba(212,199,176,0.60)]'
    : isLightMode
      ? 'text-[#556964]'
      : 'text-[rgba(191,212,207,0.60)]';

  const hairline = isMiracles
    ? isLightMode
      ? 'border-[#8c621c]/18'
      : 'border-[#e4be70]/16'
    : isLightMode
      ? 'border-[#0f766e]/16'
      : 'border-white/[0.10]';

  const divideHairline = isMiracles
    ? isLightMode
      ? 'divide-[#8c621c]/14'
      : 'divide-[#e4be70]/14'
    : isLightMode
      ? 'divide-[#0f766e]/14'
      : 'divide-white/[0.09]';

  const activeRowBg = isMiracles
    ? isLightMode
      ? 'bg-[#8c621c]/[0.045]'
      : 'bg-[#e4be70]/[0.05]'
    : isLightMode
      ? 'bg-[#0f766e]/[0.045]'
      : 'bg-[#2dd4bf]/[0.055]';

  const subtleBtnClass = isMiracles
    ? isLightMode
      ? 'bg-white/75 border-[#8c621c]/22 text-[#4c402e] hover:bg-white'
      : 'bg-white/[0.04] border-[#e4be70]/22 text-[#e3d8c4] hover:bg-white/[0.09]'
    : isLightMode
      ? 'bg-white/75 border-[#0f766e]/22 text-[#3c4e4a] hover:bg-white'
      : 'bg-white/[0.04] border-white/[0.14] text-[#d1e2de] hover:bg-white/[0.09]';

  return (
    <section
      id={sectionId}
      data-testid={`${world}-qa-section`}
      aria-label={isMiracles ? 'Questions and Answers on This Sign' : 'Questions and Answers on This Proof'}
      className={`my-9 border-y ${hairline} py-7`}
    >
      {/* 1. Editorial Section Header & Expand-All Control */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h2
            className="font-serif-eng text-[20px] sm:text-[22px] font-semibold leading-tight"
            style={{ color: accentHex }}
          >
            {isMiracles ? 'Questions on This Sign' : 'Questions & Clarity'}
          </h2>
          <p className={`font-serif-eng text-[12.5px] mt-1 tabular-nums ${textMuted}`}>
            <span>
              {qaList.length} questions on this {isMiracles ? 'sign' : 'proof'}
            </span>
            <span className="mx-1.5 opacity-50" aria-hidden="true">·</span>
            <span data-testid={`${world}-qa-progress-text`}>
              {progress.exploredCount} of {progress.total} explored
            </span>
          </p>
        </div>

        <button
          type="button"
          data-testid={`${world}-qa-expand-all`}
          onClick={handleToggleAll}
          className={`min-h-[38px] px-3.5 rounded-xl border font-serif-eng text-[12px] font-medium whitespace-nowrap shrink-0 cursor-pointer transition-colors ${subtleBtnClass}`}
        >
          {allVisibleOpen ? 'Collapse all' : 'Expand all'}
        </button>
      </div>

      {/* 2. Quiet 2px Reading-Depth Progress Hairline */}
      <div
        className={`w-full h-[2px] rounded-full overflow-hidden mb-5 ${
          isMiracles
            ? isLightMode
              ? 'bg-[#8c621c]/14'
              : 'bg-white/[0.09]'
            : isLightMode
              ? 'bg-[#0f766e]/14'
              : 'bg-white/[0.09]'
        }`}
        aria-hidden="true"
      >
        <div
          className="h-full rounded-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] origin-left"
          style={{
            backgroundColor: accentHex,
            transform: `scaleX(${progress.ratio})`,
          }}
        />
      </div>

      {/* 3. Single-Row In-Topic Angle Filter Tabs */}
      {categories.length > 2 && (
        <div
          role="tablist"
          aria-label="Question perspectives"
          className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar pb-4 mb-1"
        >
          {categories.map((cat) => {
            const isSelected = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                role="tab"
                aria-selected={isSelected}
                data-testid={`${world}-qa-tab-${cat.key}`}
                onClick={() => handleSelectCategory(cat.key)}
                className={`min-h-[36px] px-3 rounded-lg border font-serif-eng text-[12px] whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                  isSelected
                    ? isMiracles
                      ? isLightMode
                        ? 'bg-[#8c621c] border-[#8c621c] text-white font-medium'
                        : 'bg-[#e4be70]/20 border-[#e4be70]/45 text-[#f1d493] font-medium'
                      : isLightMode
                        ? 'bg-[#0f766e] border-[#0f766e] text-white font-medium'
                        : 'bg-[#2dd4bf]/18 border-[#2dd4bf]/45 text-[#5eead4] font-medium'
                    : isMiracles
                      ? isLightMode
                        ? 'bg-transparent border-transparent text-[#5a4b35] hover:bg-[#8c621c]/[0.06]'
                        : 'bg-transparent border-transparent text-[rgba(227,216,196,0.72)] hover:bg-white/[0.05]'
                      : isLightMode
                        ? 'bg-transparent border-transparent text-[#3f534e] hover:bg-[#0f766e]/[0.06]'
                        : 'bg-transparent border-transparent text-[rgba(209,226,222,0.72)] hover:bg-white/[0.05]'
                }`}
              >
                {cat.label} ({cat.count})
              </button>
            );
          })}
        </div>
      )}

      {/* 4. Hairline-Divided Numbered Q&A Ledger (Zero Cards-Within-Cards) */}
      <ol className={`divide-y ${divideHairline}`}>
        {visibleList.map((entry) => {
          const isOpen = openIds.includes(entry.id);
          const isExplored = exploredIds.includes(entry.id);
          const globalNum = indexMap.get(entry.id) || 1;
          const followUps = isOpen ? resolveInTopicFollowUps(qaList, entry, 2) : [];
          const prevId = isOpen ? resolveAdjacentQaId(visibleList, entry.id, -1) : null;
          const nextId = isOpen ? resolveAdjacentQaId(visibleList, entry.id, 1) : null;
          const catLabel = getQaCategoryLabel(entry.category, world);

          return (
            <li
              key={entry.id}
              ref={(el) => {
                if (el) rowRefs.current[entry.id] = el;
              }}
              data-testid={`${world}-qa-row-${entry.id}`}
              className={`transition-colors duration-200 ${
                isOpen ? `${activeRowBg} rounded-2xl my-1.5` : ''
              }`}
            >
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`${world}-qa-panel-${entry.id}`}
                data-testid={`${world}-qa-toggle-${entry.id}`}
                onClick={() => handleToggleRow(entry.id)}
                className="w-full min-h-[56px] py-4 px-3 sm:px-4 text-left flex items-start gap-3.5 cursor-pointer group"
              >
                <span
                  className="font-serif-eng text-[12px] font-semibold tabular-nums pt-1 w-6 shrink-0 transition-colors"
                  style={{ color: isOpen || isExplored ? accentHex : undefined }}
                >
                  {formatQaIndex(globalNum)}
                </span>

                <div className="flex-1 min-w-0">
                  <p
                    className={`font-serif-eng text-[16px] sm:text-[17.5px] leading-[1.42] ${
                      isOpen ? 'font-semibold' : 'font-medium'
                    } ${textMain}`}
                  >
                    {entry.question}
                  </p>
                  <p className={`font-serif-eng text-[11.5px] mt-1 flex items-center gap-1.5 ${textMuted}`}>
                    <span>{catLabel}</span>
                    {isExplored && (
                      <>
                        <span aria-hidden="true" className="opacity-50">·</span>
                        <span
                          className="inline-flex items-center gap-1 font-medium"
                          style={{ color: accentHex }}
                        >
                          <CheckCircleIcon size={11} />
                          <span>Explored</span>
                        </span>
                      </>
                    )}
                  </p>
                </div>

                <ChevronDownIcon
                  size={16}
                  className={`shrink-0 mt-1.5 transition-transform duration-200 ${textSub} ${
                    isOpen ? 'rotate-180 opacity-100' : 'opacity-65 group-hover:opacity-100'
                  }`}
                />
              </button>

              {isOpen && (
                <div
                  id={`${world}-qa-panel-${entry.id}`}
                  data-testid={`${world}-qa-answer-${entry.id}`}
                  className="px-3 sm:px-4 pb-5 pt-0.5 sm:pl-[52px]"
                >
                  <p className={`font-serif-eng text-[15.5px] sm:text-[16.5px] leading-[1.82] ${textBody}`}>
                    {entry.answer}
                  </p>

                  {/* Strictly In-Topic Related Questions */}
                  {followUps.length > 0 && !allVisibleOpen && (
                    <div className={`mt-5 pt-3.5 border-t ${hairline}`}>
                      <p className={`font-serif-eng text-[11.5px] mb-2 ${textMuted}`}>
                        Related on this {isMiracles ? 'sign' : 'proof'}
                      </p>
                      <div className="space-y-1">
                        {followUps.map((fu) => {
                          const fuNum = indexMap.get(fu.id) || 1;
                          return (
                            <button
                              key={fu.id}
                              type="button"
                              data-testid={`${world}-qa-related-${fu.id}`}
                              onClick={() => handleFocusQuestion(fu.id, entry.id)}
                              className="w-full min-h-[42px] py-1.5 px-2 -mx-2 rounded-xl text-left flex items-center justify-between gap-3 cursor-pointer transition-colors hover:bg-current/[0.04] group"
                            >
                              <span className="flex items-baseline gap-2.5 min-w-0">
                                <span
                                  className="font-serif-eng text-[11px] font-semibold tabular-nums shrink-0"
                                  style={{ color: accentHex }}
                                >
                                  {formatQaIndex(fuNum)}
                                </span>
                                <span className={`font-serif-eng text-[14px] sm:text-[14.5px] leading-snug ${textMain}`}>
                                  {fu.question}
                                </span>
                              </span>
                              <ChevronRightIcon
                                size={14}
                                className="shrink-0 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all"
                                style={{ color: accentHex }}
                              />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Clean Stepping & Copy Footer */}
                  <div className={`mt-4 pt-3 border-t ${hairline} flex flex-wrap items-center justify-between gap-2`}>
                    <div className="flex items-center gap-1.5">
                      {!allVisibleOpen && (
                        <>
                          <button
                            type="button"
                            disabled={!prevId}
                            onClick={() => handleStepQuestion(entry.id, -1)}
                            className={`min-h-[36px] px-2.5 rounded-lg border inline-flex items-center gap-1 font-serif-eng text-[11.5px] whitespace-nowrap cursor-pointer transition-colors disabled:opacity-35 disabled:cursor-not-allowed ${subtleBtnClass}`}
                          >
                            <ChevronLeftIcon size={13} />
                            <span>Previous</span>
                          </button>
                          <button
                            type="button"
                            disabled={!nextId}
                            onClick={() => handleStepQuestion(entry.id, 1)}
                            className={`min-h-[36px] px-2.5 rounded-lg border inline-flex items-center gap-1 font-serif-eng text-[11.5px] whitespace-nowrap cursor-pointer transition-colors disabled:opacity-35 disabled:cursor-not-allowed ${subtleBtnClass}`}
                          >
                            <span>Next</span>
                            <ChevronRightIcon size={13} />
                          </button>
                        </>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyQa(entry)}
                      className={`min-h-[36px] px-2.5 rounded-lg font-serif-eng text-[11.5px] inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-opacity hover:opacity-100 opacity-80 ${textSub}`}
                      aria-label={`Copy question ${formatQaIndex(globalNum)} and answer`}
                    >
                      {copiedId === entry.id ? (
                        <>
                          <CheckCircleIcon size={13} style={{ color: accentHex }} />
                          <span style={{ color: accentHex }}>Copied</span>
                        </>
                      ) : (
                        <span>Copy Q&amp;A</span>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {/* 5. Quiet Completion Colophon */}
      {progress.isComplete && (
        <div
          data-testid={`${world}-qa-complete`}
          className={`mt-4 pt-4 border-t ${hairline} flex items-center justify-center gap-2 font-serif-eng text-[13px]`}
          style={{ color: accentHex }}
        >
          <CheckCircleIcon size={14} />
          <span>
            All {progress.total} questions on this {isMiracles ? 'sign' : 'proof'} explored
          </span>
        </div>
      )}
    </section>
  );
};
