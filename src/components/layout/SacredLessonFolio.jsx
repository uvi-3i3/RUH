import { useState, useEffect } from 'react';
import {
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SparklesIcon,
  XIcon,
} from '../icons/Icons';
import {
  hapticDetent,
  hapticDismiss,
  hapticNavigate,
  hapticSuccess,
  hapticTapLight,
} from '../../utils/haptics';

/**
 * SacredLessonFolio
 * Illuminated Manuscript Leaf (`صفحة العلم`):
 * - variant="panel": full-height folio leaf resting gently on the right of the Sacred Tree on Desktop (`lg:`+)
 * - variant="modal": focused manuscript sheet on Mobile
 */
export const SacredLessonFolio = ({
  node,
  variant = 'panel',
  isLightMode,
  goldStroke,
  emeraldStroke,
  isDone,
  studiedFiqhSet,
  prevNode,
  nextNode,
  onClose,
  onSelectNode,
  onToggleMastery,
  onToggleFiqhBranch,
}) => {
  const [studyTab, setStudyTab] = useState('essence'); // 'essence' | 'dalil' | 'practice'
  const [expandedFiqhId, setExpandedFiqhId] = useState(null);
  const [selectedChoiceIdx, setSelectedChoiceIdx] = useState(null);

  useEffect(() => {
    setStudyTab('essence');
    setExpandedFiqhId(node?.fiqhBranches?.[0]?.id || null);
    setSelectedChoiceIdx(null);
  }, [node?.id]);

  if (!node) return null;

  const isIslam = node.kind === 'islam';
  const accent = isIslam ? emeraldStroke : goldStroke;
  const secondaryAccent = goldStroke;

  const textMain = isLightMode ? 'text-[#1c1813]' : 'text-[#f3ecdc]';
  const textSub = isLightMode ? 'text-[#463d31]' : 'text-[#e2d8c5]/78';
  const textMuted = isLightMode ? 'text-[#746652]' : 'text-[#e2d8c5]/52';
  const hairline = isLightMode ? 'border-[#8f6c2c]/[0.16]' : 'border-[#d2a24b]/[0.14]';
  const divideLine = isLightMode ? 'divide-[#8f6c2c]/[0.14]' : 'divide-[#d2a24b]/[0.12]';

  const manuscriptSurface =
    variant === 'modal'
      ? isLightMode
        ? 'bg-[#f6efe2]/[0.97] border-[#9c7533]/25 text-[#1c1813] shadow-[0_28px_72px_rgba(32,22,10,0.28)]'
        : 'bg-[#070d18]/[0.96] border-[#d2a24b]/22 text-[#f3ecdc] shadow-[0_32px_84px_rgba(0,0,0,0.85)]'
      : isLightMode
        ? 'bg-[#faf4e8]/[0.76] border-[#9c7533]/22 text-[#1c1813] shadow-[0_18px_46px_rgba(36,26,12,0.07)]'
        : 'bg-[#060c17]/[0.74] border-[#d2a24b]/20 text-[#f3ecdc] shadow-[0_24px_60px_rgba(0,0,0,0.52)]';

  const tabItems = [
    { id: 'essence', label: 'Essence' },
    { id: 'dalil', label: 'Dalil & Quiz' },
    { id: 'practice', label: isIslam ? `Fiqh (${node.fiqhBranches?.length || 0})` : 'Ascent' },
  ];

  const hasCheck = Boolean(node.reflectionCheck);
  const isCheckCorrect =
    hasCheck && selectedChoiceIdx !== null && selectedChoiceIdx === node.reflectionCheck.correctIndex;

  return (
    <div
      role={variant === 'modal' ? 'dialog' : 'region'}
      aria-modal={variant === 'modal' ? 'true' : undefined}
      aria-label={`${node.title} Study Chamber`}
      onClick={(e) => e.stopPropagation()}
      className={`relative flex flex-col border backdrop-blur-xl overflow-hidden ${
        variant === 'modal'
          ? 'z-10 w-full max-w-[440px] max-h-[88dvh] rounded-[24px]'
          : 'w-full h-full min-h-0 rounded-[24px]'
      } ${manuscriptSurface}`}
    >
      {/* Subtle Illuminated Manuscript Inner Ruling Frame (Jadwal) */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-[7px] rounded-[18px] border ${
          isLightMode ? 'border-[#9c7533]/[0.14]' : 'border-[#d2a24b]/[0.12]'
        }`}
      />

      {/* --- MANUSCRIPT HEADER --- */}
      <div className={`relative z-10 px-6 pt-5 pb-0 border-b shrink-0 ${hairline}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] uppercase tracking-[0.18em] font-semibold">
              <span className="whitespace-nowrap" style={{ color: accent }}>
                {isIslam ? `Pillar 0${node.order} · Living Bough` : `Root 0${node.order} · Unseen Faith`}
              </span>
              <span aria-hidden="true" className={textMuted}>
                ·
              </span>
              <span className={`whitespace-nowrap ${textMuted}`}>{node.transliteration}</span>
            </div>

            <div className="flex items-baseline justify-between gap-3 mt-1.5 flex-wrap">
              <h2 className={`font-serif text-[23px] sm:text-[25px] leading-tight font-medium ${textMain}`}>
                {node.title}
              </h2>
              <span
                className="font-arabic text-[21px] leading-none"
                style={{ color: secondaryAccent }}
                dir="rtl"
              >
                {node.arabic}
              </span>
            </div>

            <p className={`font-serif italic text-[12px] mt-1 ${textMuted}`}>
              {node.symbolRole}
            </p>
          </div>

          {variant === 'modal' && onClose && (
            <button
              type="button"
              onClick={() => {
                hapticDismiss();
                onClose();
              }}
              aria-label="Close lesson"
              className={`min-w-[44px] min-h-[44px] -mr-2 -mt-1 rounded-full flex items-center justify-center border shrink-0 cursor-pointer transition-colors ${
                isLightMode
                  ? 'border-[#9c7533]/20 bg-black/[0.03] hover:bg-black/[0.06]'
                  : 'border-[#d2a24b]/20 bg-white/[0.04] hover:bg-white/[0.08]'
              }`}
            >
              <XIcon size={16} />
            </button>
          )}
        </div>

        {/* Architectural Underline Manuscript Tabs (zero box container) */}
        <div
          role="tablist"
          aria-label="Lesson study sections"
          className="mt-3 grid grid-cols-3"
        >
          {tabItems.map((tab) => {
            const active = studyTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => {
                  hapticDetent();
                  setStudyTab(tab.id);
                }}
                className={`relative min-h-[40px] px-1.5 py-2 text-[10px] uppercase tracking-[0.11em] sm:tracking-[0.15em] font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                  active ? textMain : `${textMuted} hover:opacity-90`
                }`}
                style={active ? { color: accent } : undefined}
              >
                {tab.label}
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute bottom-[-1px] left-3 right-3 h-[1.5px] rounded-full"
                    style={{ backgroundColor: accent }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* --- OPEN SCROLLABLE FOLIO BODY (Clean Typography & Hairlines, Zero Nested Cards) --- */}
      <div className="relative z-10 flex-1 overflow-y-auto px-6 py-4 space-y-5 custom-scrollbar">
        {studyTab === 'essence' && (
          <>
            <div className="space-y-2.5">
              <p className={`font-serif text-[15.5px] leading-relaxed ${textMain}`}>
                {node.summary}
              </p>
              <p className={`font-serif italic text-[13.5px] leading-relaxed ${textSub}`}>
                {node.essence}
              </p>
            </div>

            {node.keyArabicTerm && (
              <div className={`border-y py-3 flex flex-col gap-1 ${hairline}`}>
                <span
                  className="text-[10px] uppercase tracking-[0.18em] font-semibold"
                  style={{ color: accent }}
                >
                  {node.keyArabicTerm}
                </span>
                <p className={`text-[13px] font-serif leading-snug ${textSub}`}>
                  {node.keyArabicMeaning}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <h3 className={`text-[10px] uppercase tracking-[0.2em] font-semibold ${textMuted}`}>
                Three Foundations of Understanding
              </h3>
              <div className={`divide-y ${divideLine}`}>
                {(node.pillarsOfUnderstanding || []).map((point, idx) => (
                  <div key={idx} className="py-2.5 first:pt-1 last:pb-1 flex items-start gap-3">
                    <span
                      className="text-[11px] font-semibold tabular-nums mt-0.5 shrink-0"
                      style={{ color: accent }}
                    >
                      0{idx + 1}.
                    </span>
                    <p className={`text-[13.5px] font-serif leading-relaxed ${textMain}`}>
                      {point}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {studyTab === 'dalil' && (
          <>
            {node.evidence && (
              <div className={`py-4 px-2 border-y text-center space-y-2 ${hairline}`}>
                <span
                  className="text-[9.5px] uppercase tracking-[0.22em] font-semibold block"
                  style={{ color: secondaryAccent }}
                >
                  Quranic Light · {node.evidence.source}
                </span>
                <p
                  className="font-arabic text-[21px] leading-[2.0]"
                  dir="rtl"
                  style={{ color: secondaryAccent }}
                >
                  {node.evidence.arabic}
                </p>
                <p className={`font-serif italic text-[14px] leading-relaxed ${textMain}`}>
                  “{node.evidence.translation}”
                </p>
              </div>
            )}

            {hasCheck && (
              <div className="space-y-2.5">
                <span
                  className="text-[10px] uppercase tracking-[0.18em] font-semibold block"
                  style={{ color: accent }}
                >
                  Contemplative Check
                </span>
                <p className={`font-serif text-[14.5px] leading-snug ${textMain}`}>
                  {node.reflectionCheck.prompt}
                </p>
                <div className={`divide-y border-y ${divideLine} ${hairline}`}>
                  {node.reflectionCheck.choices.map((choice, cIdx) => {
                    const isPicked = selectedChoiceIdx === cIdx;
                    const isCorrectChoice = cIdx === node.reflectionCheck.correctIndex;
                    const showOutcome = selectedChoiceIdx !== null;

                    let rowBg = isLightMode
                      ? 'hover:bg-[#9c7533]/[0.04]'
                      : 'hover:bg-[#d2a24b]/[0.05]';

                    if (showOutcome && isCorrectChoice) {
                      rowBg = isLightMode ? 'bg-[#0f766e]/[0.08]' : 'bg-[#2dd4bf]/[0.09]';
                    } else if (showOutcome && isPicked && !isCorrectChoice) {
                      rowBg = isLightMode ? 'bg-[#9c7533]/[0.08]' : 'bg-[#d2a24b]/[0.08]';
                    }

                    return (
                      <button
                        key={cIdx}
                        type="button"
                        onClick={() => {
                          if (cIdx === node.reflectionCheck.correctIndex) hapticSuccess();
                          else hapticTapLight();
                          setSelectedChoiceIdx(cIdx);
                        }}
                        className={`w-full min-h-[44px] px-2.5 py-2.5 text-left text-[13px] font-serif leading-snug flex items-start gap-2.5 cursor-pointer transition-colors ${rowBg}`}
                      >
                        <span
                          className="text-[11px] font-semibold tabular-nums mt-0.5 shrink-0"
                          style={{
                            color:
                              showOutcome && isCorrectChoice
                                ? emeraldStroke
                                : isPicked
                                  ? goldStroke
                                  : undefined,
                          }}
                        >
                          {showOutcome && isCorrectChoice ? '✓' : `0${cIdx + 1}`}
                        </span>
                        <span className={textMain}>{choice}</span>
                      </button>
                    );
                  })}
                </div>

                {selectedChoiceIdx !== null && (
                  <div className={`pt-2 text-[13px] font-serif leading-relaxed ${textSub}`}>
                    <span
                      className="text-[9.5px] uppercase tracking-[0.18em] font-semibold block mb-0.5"
                      style={{ color: isCheckCorrect ? emeraldStroke : goldStroke }}
                    >
                      {isCheckCorrect ? 'Illuminated Insight' : 'Classical Clarification'}
                    </span>
                    <p>{node.reflectionCheck.insight}</p>
                  </div>
                )}
              </div>
            )}

            {node.reflectionQuestion && (
              <div className={`border-t pt-3 ${hairline}`}>
                <span
                  className="text-[9.5px] uppercase tracking-[0.2em] font-semibold block mb-1"
                  style={{ color: goldStroke }}
                >
                  Muhasabah · Heart Reflection
                </span>
                <p className={`font-serif italic text-[13.5px] leading-relaxed ${textSub}`}>
                  {node.reflectionQuestion}
                </p>
              </div>
            )}
          </>
        )}

        {studyTab === 'practice' && (
          <>
            {isIslam && node.fiqhBranches && node.fiqhBranches.length > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2 pb-1">
                  <span
                    className="text-[10px] uppercase tracking-[0.2em] font-semibold"
                    style={{ color: emeraldStroke }}
                  >
                    Classical Fiqh · {node.shortLabel}
                  </span>
                  <span className={`text-[10px] tabular-nums ${textMuted}`}>
                    {node.fiqhBranches.filter((fb) => studiedFiqhSet?.has(fb.id)).length}/
                    {node.fiqhBranches.length} Studied
                  </span>
                </div>

                <div className={`divide-y border-y ${divideLine} ${hairline}`}>
                  {node.fiqhBranches.map((fb) => {
                    const isOpen = expandedFiqhId === fb.id;
                    const isStudied = studiedFiqhSet?.has(fb.id);

                    return (
                      <div key={fb.id} className="py-1">
                        <button
                          type="button"
                          aria-expanded={isOpen}
                          onClick={() => {
                            hapticTapLight();
                            setExpandedFiqhId(isOpen ? null : fb.id);
                          }}
                          className="w-full min-h-[48px] py-2 flex items-center justify-between gap-3 text-left cursor-pointer"
                        >
                          <div className="min-w-0">
                            <p className={`font-serif text-[15px] font-medium truncate ${textMain}`}>
                              {isStudied ? '✓ ' : ''}
                              {fb.title}
                            </p>
                            {fb.arabicTitle && (
                              <p className="font-arabic text-[13px] mt-0.5" style={{ color: accent }}>
                                {fb.arabicTitle}
                              </p>
                            )}
                          </div>
                          <span
                            className="text-[9.5px] uppercase tracking-[0.16em] font-semibold shrink-0"
                            style={{ color: isStudied ? emeraldStroke : accent }}
                          >
                            {isOpen ? 'Close' : 'Read'}
                          </span>
                        </button>

                        {isOpen && (
                          <div className={`pb-3.5 pt-1 space-y-3`}>
                            <p className={`text-[13px] font-serif leading-relaxed ${textSub}`}>
                              {fb.summary}
                            </p>

                            {Array.isArray(fb.rulings) && fb.rulings.length > 0 && (
                              <div className="space-y-1.5">
                                {fb.rulings.map((ruling, rIdx) => (
                                  <div
                                    key={rIdx}
                                    className="flex items-start gap-2.5 text-[12.5px] font-serif leading-relaxed"
                                  >
                                    <span
                                      className="text-[10.5px] tabular-nums font-semibold mt-0.5 shrink-0"
                                      style={{ color: emeraldStroke }}
                                    >
                                      0{rIdx + 1}.
                                    </span>
                                    <span className={textMain}>{ruling}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {fb.scholarlyNote && (
                              <p className={`text-[12px] font-serif italic pt-2 border-t ${hairline} ${textMuted}`}>
                                {fb.scholarlyNote}
                              </p>
                            )}

                            {onToggleFiqhBranch && (
                              <button
                                type="button"
                                data-testid={`fiqh-study-btn-${fb.id}`}
                                onClick={() => {
                                  if (isStudied) hapticTapLight();
                                  else hapticSuccess();
                                  onToggleFiqhBranch(fb.id);
                                }}
                                className={`w-full min-h-[42px] px-3.5 py-2 rounded-xl border text-[10px] uppercase tracking-[0.16em] font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                                  isStudied
                                    ? isLightMode
                                      ? 'border-[#0f766e]/40 bg-[#0f766e]/10 text-[#0f5b54]'
                                      : 'border-[#2dd4bf]/35 bg-[#2dd4bf]/10 text-[#7fe6d8]'
                                    : isLightMode
                                      ? 'border-[#9c7533]/40 bg-[#9c7533]/[0.08] text-[#7c5a1e] hover:bg-[#9c7533]/[0.14]'
                                      : 'border-[#d2a24b]/35 bg-[#d2a24b]/10 text-[#e7c786] hover:bg-[#d2a24b]/16'
                                }`}
                              >
                                <CheckCircleIcon size={13} />
                                <span>
                                  {isStudied ? 'Fiqh Bud Illuminated' : 'Mark Fiqh Studied (+3 ✦)'}
                                </span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <span
                    className="text-[9.5px] uppercase tracking-[0.2em] font-semibold block mb-1.5"
                    style={{ color: goldStroke }}
                  >
                    From Unseen Root to Living Bough
                  </span>
                  <p className={`font-serif text-[14.5px] leading-relaxed ${textMain}`}>
                    {node.feedsPillarLabel ||
                      'Unseen certainty in the heart feeds every outward Pillar of Islam with sincerity.'}
                  </p>
                </div>

                {node.feedsPillarId && onSelectNode && (
                  <button
                    type="button"
                    onClick={() => {
                      hapticNavigate();
                      onSelectNode(node.feedsPillarId);
                    }}
                    className={`w-full min-h-[48px] px-4 py-3 rounded-xl border flex items-center justify-between gap-3 text-left cursor-pointer transition-colors ${
                      isLightMode
                        ? 'border-[#0f766e]/30 bg-[#0f766e]/[0.06] hover:bg-[#0f766e]/[0.11]'
                        : 'border-[#2dd4bf]/28 bg-[#2dd4bf]/[0.06] hover:bg-[#2dd4bf]/[0.11]'
                    }`}
                  >
                    <div>
                      <span
                        className="text-[9px] uppercase tracking-[0.18em] font-semibold block"
                        style={{ color: emeraldStroke }}
                      >
                        Follow the Sap Upward
                      </span>
                      <span className={`font-serif text-[14.5px] font-medium ${textMain}`}>
                        Explore Connected Pillar &amp; Fiqh
                      </span>
                    </div>
                    <ChevronRightIcon size={16} style={{ color: emeraldStroke }} />
                  </button>
                )}

                {node.reflectionQuestion && (
                  <div className={`border-t pt-3 ${hairline}`}>
                    <span
                      className="text-[9.5px] uppercase tracking-[0.2em] font-semibold block mb-1"
                      style={{ color: goldStroke }}
                    >
                      Heart Reflection
                    </span>
                    <p className={`font-serif italic text-[13.5px] leading-relaxed ${textSub}`}>
                      {node.reflectionQuestion}
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* --- MANUSCRIPT FOOTER: PREV / SEAL MASTERY / NEXT --- */}
      <div className={`relative z-10 px-6 py-3 border-t flex items-center justify-between gap-2.5 shrink-0 ${hairline}`}>
        <button
          type="button"
          disabled={!prevNode}
          onClick={() => {
            if (!prevNode) return;
            hapticNavigate();
            onSelectNode(prevNode.id);
          }}
          aria-label={prevNode ? `Previous: ${prevNode.shortLabel}` : 'Previous lesson'}
          className={`min-w-[44px] min-h-[44px] rounded-xl border flex items-center justify-center cursor-pointer disabled:opacity-25 disabled:cursor-not-allowed transition-colors ${hairline} ${
            isLightMode ? 'hover:bg-black/[0.04]' : 'hover:bg-white/[0.05]'
          }`}
        >
          <ChevronLeftIcon size={16} />
        </button>

        <button
          type="button"
          data-testid="sacred-lesson-master-btn"
          onClick={() => onToggleMastery(node.id)}
          className="flex-1 min-h-[44px] px-4 rounded-xl border font-semibold text-[10.5px] uppercase tracking-[0.18em] whitespace-nowrap flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-[0.98]"
          style={
            isDone
              ? {
                  backgroundColor: isLightMode ? 'rgba(15,118,110,0.12)' : 'rgba(45,212,191,0.12)',
                  borderColor: accent,
                  color: isLightMode ? '#0f5b54' : '#7fe6d8',
                }
              : {
                  backgroundColor: isLightMode ? 'rgba(156,117,51,0.14)' : 'rgba(210,162,75,0.15)',
                  borderColor: secondaryAccent,
                  color: isLightMode ? '#6d4e16' : '#f1d28e',
                }
          }
        >
          {isDone ? (
            <>
              <CheckCircleIcon size={14} />
              <span>Illuminated ✦</span>
            </>
          ) : (
            <>
              <SparklesIcon size={14} />
              <span>Mark Learned (+10 ✦)</span>
            </>
          )}
        </button>

        <button
          type="button"
          disabled={!nextNode}
          onClick={() => {
            if (!nextNode) return;
            hapticNavigate();
            onSelectNode(nextNode.id);
          }}
          aria-label={nextNode ? `Next: ${nextNode.shortLabel}` : 'Next lesson'}
          className={`min-w-[44px] min-h-[44px] rounded-xl border flex items-center justify-center cursor-pointer disabled:opacity-25 disabled:cursor-not-allowed transition-colors ${hairline} ${
            isLightMode ? 'hover:bg-black/[0.04]' : 'hover:bg-white/[0.05]'
          }`}
        >
          <ChevronRightIcon size={16} />
        </button>
      </div>
    </div>
  );
};
