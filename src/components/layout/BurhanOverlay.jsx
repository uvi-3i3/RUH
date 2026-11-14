import { useEffect, useRef, useState } from 'react';
import { ChevronDownIcon, CheckCircleIcon, ShareIcon } from '../icons/Icons';
import { resolveBurhanCopy, filterBurhansByCategory } from '../../utils/devotionLogic';

const ARCHIVE_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'islam', label: 'Why Islam' },
  { key: 'theism', label: 'Theism & Heart' },
];

export const BurhanOverlay = ({
  isOpen,
  burhan,
  allBurhans = [],
  burhanNotes = {},
  isLightMode,
  isCompleted,
  isSimpleMode = false,
  onSaveNote,
  onComplete,
  onClose,
}) => {
  const [showContent, setShowContent] = useState(false);
  const [localSimple, setLocalSimple] = useState(isSimpleMode);
  const [selectedId, setSelectedId] = useState(null);
  const [showLibrary, setShowLibrary] = useState(false);
  const [archiveCategory, setArchiveCategory] = useState('all');
  const [noteDraft, setNoteDraft] = useState('');
  const [noteSavedToast, setNoteSavedToast] = useState(false);
  const [copiedFeedback, setCopiedFeedback] = useState(false);

  const dragStartY = useRef(null);
  const [dragOffsetY, setDragOffsetY] = useState(0);

  useEffect(() => {
    setLocalSimple(isSimpleMode);
  }, [isSimpleMode]);

  useEffect(() => {
    if (isOpen) {
      setSelectedId(burhan?.id || null);
      setShowLibrary(false);
      setArchiveCategory('all');
      setDragOffsetY(0);
      const t = setTimeout(() => setShowContent(true), 30);
      return () => clearTimeout(t);
    }
    setShowContent(false);
  }, [isOpen, burhan?.id]);

  const activeBurhan =
    (allBurhans.length > 0 && allBurhans.find((item) => item.id === selectedId)) || burhan;
  const isTodaysBurhan = !burhan || activeBurhan?.id === burhan.id;

  useEffect(() => {
    if (isOpen && activeBurhan) {
      setNoteDraft(burhanNotes?.[activeBurhan.id] || '');
    }
  }, [isOpen, activeBurhan, burhanNotes]);

  if (!isOpen || !activeBurhan) return null;

  const tTextMain = isLightMode ? 'text-[#1a1814]' : 'text-[rgba(245,238,224,0.94)]';
  const tTextSub = isLightMode ? 'text-[#3b362f]' : 'text-[rgba(228,218,200,0.68)]';
  const glowSub = isLightMode ? '0 1px 1px rgba(255,255,255,0.6)' : '0 1px 2px rgba(0,0,0,0.85)';
  const accentColor = isLightMode ? '#0d9488' : '#2dd4bf';

  const { paragraphs, question, premises, conclusion } = resolveBurhanCopy(activeBurhan, localSimple);
  const visibleArchiveItems = filterBurhansByCategory(allBurhans, archiveCategory);
  const islamCount = filterBurhansByCategory(allBurhans, 'islam').length;

  const handleSaveTakeaway = () => {
    if (onSaveNote && activeBurhan?.id) {
      onSaveNote(activeBurhan.id, noteDraft);
      setNoteSavedToast(true);
      setTimeout(() => setNoteSavedToast(false), 1600);
    }
  };

  const handleShare = () => {
    const body = paragraphs.join('\n\n');
    const logicText =
      premises.length > 0
        ? `\n\nDeductive Proof:\n${premises.map((p, i) => `${i + 1}. ${p}`).join('\n')}${conclusion ? `\n∴ ${conclusion}` : ''}`
        : '';
    const text = `${activeBurhan.arabicAnchor ? `${activeBurhan.arabicAnchor}\n\n` : ''}${activeBurhan.title}\n\n${body}${logicText}\n\n— ${activeBurhan.scholar} (Ruh)`;
    if (navigator.share) {
      navigator.share({ title: activeBurhan.title, text }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedFeedback(true);
        setTimeout(() => setCopiedFeedback(false), 1800);
      });
    }
  };

  const handleHeaderTouchStart = (e) => {
    dragStartY.current = e.touches[0].clientY;
  };

  const handleHeaderTouchMove = (e) => {
    if (dragStartY.current === null) return;
    const dy = Math.max(0, e.touches[0].clientY - dragStartY.current);
    setDragOffsetY(dy);
  };

  const handleHeaderTouchEnd = () => {
    if (dragOffsetY > 90) {
      onClose();
    } else {
      setDragOffsetY(0);
    }
    dragStartY.current = null;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Burhan Contemplation: ${activeBurhan.title}`}
      className="fixed inset-0 z-[80] flex flex-col justify-end items-center pointer-events-auto"
    >
      {/* Translucent Scrim letting the painted Ghibli sky breathe behind */}
      <div
        onClick={onClose}
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          opacity: showContent ? 1 : 0,
          background: isLightMode ? 'rgba(220,231,243,0.34)' : 'rgba(4,7,14,0.52)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      />

      {/* Frosted Liquid-Glass Sheet */}
      <div
        className={`relative z-10 w-full max-w-xl h-[92dvh] rounded-t-[28px] border-t border-x flex flex-col overflow-hidden transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isLightMode
            ? 'bg-[#f6f3ec]/82 border-white/80 shadow-[0_-16px_48px_rgba(26,24,20,0.14)]'
            : 'bg-[#090d16]/76 border-white/[0.12] shadow-[0_-20px_60px_rgba(0,0,0,0.75)]'
        }`}
        style={{
          backdropFilter: 'blur(26px) saturate(145%)',
          WebkitBackdropFilter: 'blur(26px) saturate(145%)',
          opacity: showContent ? 1 : 0,
          transform: showContent ? `translateY(${dragOffsetY}px)` : 'translateY(32px)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {/* Ambient Auric Teal Wash */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 14%, ${accentColor}1c 0%, transparent 58%)`,
          }}
        />

        {/* Swipeable Header & Grabber */}
        <div
          onTouchStart={handleHeaderTouchStart}
          onTouchMove={handleHeaderTouchMove}
          onTouchEnd={handleHeaderTouchEnd}
          className={`relative z-20 shrink-0 px-5 pt-2.5 pb-3 border-b ${
            isLightMode ? 'border-black/[0.06]' : 'border-white/[0.07]'
          }`}
        >
          {/* Sheet Grabber */}
          <div className="flex justify-center mb-3">
            <span
              className={`w-9 h-1 rounded-full ${
                isLightMode ? 'bg-black/15' : 'bg-white/20'
              }`}
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            {/* Left: Classical / Simple Toggle */}
            <div
              className={`flex items-center gap-0.5 p-1 rounded-xl border ${
                isLightMode ? 'bg-black/[0.04] border-black/10' : 'bg-white/[0.04] border-white/10'
              }`}
            >
              <button
                type="button"
                onClick={() => setLocalSimple(false)}
                className={`min-h-[34px] px-2.5 rounded-lg font-serif-eng text-[10px] uppercase tracking-wider transition-colors cursor-pointer ${
                  !localSimple
                    ? isLightMode
                      ? 'bg-white text-[#1a1814] shadow-xs font-medium'
                      : 'bg-white/15 text-white font-medium'
                    : `${tTextSub} opacity-70`
                }`}
              >
                Classical
              </button>
              <button
                type="button"
                onClick={() => setLocalSimple(true)}
                className={`min-h-[34px] px-2.5 rounded-lg font-serif-eng text-[10px] uppercase tracking-wider transition-colors cursor-pointer ${
                  localSimple
                    ? isLightMode
                      ? 'bg-white text-[#1a1814] shadow-xs font-medium'
                      : 'bg-white/15 text-white font-medium'
                    : `${tTextSub} opacity-70`
                }`}
              >
                Simple
              </button>
            </div>

            {/* Right: Proof Library Switcher, Share, Close */}
            <div className="flex items-center gap-1.5">
              {allBurhans.length > 1 && (
                <button
                  type="button"
                  aria-expanded={showLibrary}
                  onClick={() => setShowLibrary((v) => !v)}
                  className={`min-h-[38px] px-3 rounded-xl border font-serif-eng text-[10px] uppercase tracking-[0.16em] transition-all cursor-pointer ${
                    showLibrary
                      ? isLightMode
                        ? 'bg-[#0d9488]/12 border-[#0d9488]/40 text-[#0d9488] font-medium'
                        : 'bg-[#2dd4bf]/15 border-[#2dd4bf]/40 text-[#2dd4bf] font-medium'
                      : isLightMode
                        ? 'bg-white/55 border-black/10 text-[#3b362f]'
                        : 'bg-white/[0.05] border-white/10 text-[#e4dac8]/85'
                  }`}
                >
                  {showLibrary ? 'Reading' : `Proofs (${allBurhans.length})`}
                </button>
              )}

              <button
                type="button"
                aria-label="Share Burhan"
                onClick={handleShare}
                className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${
                  isLightMode
                    ? 'bg-white/55 border-black/10 text-[#3b362f]'
                    : 'bg-white/[0.05] border-white/10 text-[#e4dac8]/85'
                }`}
              >
                {copiedFeedback ? (
                  <CheckCircleIcon size={15} style={{ color: accentColor }} />
                ) : (
                  <ShareIcon size={15} />
                )}
              </button>

              <button
                type="button"
                aria-label="Close contemplation"
                onClick={onClose}
                className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${
                  isLightMode
                    ? 'bg-white/55 border-black/10 text-[#1a1814]'
                    : 'bg-white/[0.05] border-white/10 text-white'
                }`}
              >
                <ChevronDownIcon size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Body: Either Proofs Archive Index OR Active Reading View */}
        {showLibrary ? (
          <div className="relative z-10 flex-1 overflow-y-auto hide-scrollbar px-5 py-5">
            <div className="flex items-center justify-between mb-3 px-1">
              <span
                className={`font-serif-eng text-[9px] uppercase tracking-[0.22em] ${tTextSub}`}
              >
                Demonstrative Proofs & Reflections
              </span>
              <span className="font-calligraphy text-base" style={{ color: accentColor }} dir="rtl">
                البراهين
              </span>
            </div>

            {/* Category Tabs: All | Why Islam | Theism & Heart */}
            <div className="flex items-center gap-2 mb-4 overflow-x-auto hide-scrollbar" role="tablist" aria-label="Proof categories">
              {ARCHIVE_FILTERS.map((cat) => {
                const active = archiveCategory === cat.key;
                const count =
                  cat.key === 'all'
                    ? allBurhans.length
                    : cat.key === 'islam'
                      ? islamCount
                      : allBurhans.length - islamCount;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setArchiveCategory(cat.key)}
                    className={`min-h-[36px] px-3 rounded-xl border font-serif-eng text-[9.5px] uppercase tracking-[0.14em] transition-all cursor-pointer whitespace-nowrap ${
                      active
                        ? isLightMode
                          ? 'bg-[#0d9488]/14 border-[#0d9488]/45 text-[#0f766e] font-medium'
                          : 'bg-[#2dd4bf]/15 border-[#2dd4bf]/45 text-[#2dd4bf] font-medium'
                        : isLightMode
                          ? 'bg-white/45 border-black/10 text-[#3b362f]/80'
                          : 'bg-white/[0.03] border-white/10 text-[#e4dac8]/70'
                    }`}
                  >
                    {cat.label} ({count})
                  </button>
                );
              })}
            </div>

            <div
              className={`rounded-[22px] border overflow-hidden divide-y ${
                isLightMode
                  ? 'bg-white/55 border-black/[0.08] divide-black/[0.06]'
                  : 'bg-white/[0.03] border-white/[0.08] divide-white/[0.06]'
              }`}
            >
              {visibleArchiveItems.map((item) => {
                const isSelected = item.id === activeBurhan.id;
                const isDaily = burhan && item.id === burhan.id;
                const hasNote = !!(burhanNotes?.[item.id] || '').trim();
                const isIslamProof = item.category === 'islam';

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSelectedId(item.id);
                      setShowLibrary(false);
                    }}
                    className={`w-full min-h-[60px] px-4 py-3 text-left flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                      isSelected
                        ? isLightMode
                          ? 'bg-[#0d9488]/10'
                          : 'bg-[#2dd4bf]/10'
                        : isLightMode
                          ? 'hover:bg-white/70 active:bg-white'
                          : 'hover:bg-white/[0.04] active:bg-white/[0.07]'
                    }`}
                  >
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                        <span
                          className="font-serif-eng text-[8px] uppercase tracking-[0.15em]"
                          style={{ color: accentColor }}
                        >
                          {item.scholar}
                        </span>
                        {isIslamProof && (
                          <span
                            className={`font-serif-eng text-[7.5px] uppercase tracking-[0.12em] px-1.5 py-0.5 rounded-full ${
                              isLightMode
                                ? 'bg-[#9c7533]/12 text-[#7c5a1e]'
                                : 'bg-[#d2a24b]/14 text-[#e5c17b]'
                            }`}
                          >
                            Islam Proof
                          </span>
                        )}
                        {isDaily && (
                          <span
                            className={`font-serif-eng text-[7.5px] uppercase tracking-[0.12em] px-1.5 py-0.5 rounded-full ${
                              isLightMode
                                ? 'bg-[#0d9488]/15 text-[#0f766e]'
                                : 'bg-[#2dd4bf]/15 text-[#2dd4bf]'
                            }`}
                          >
                            Today
                          </span>
                        )}
                        {hasNote && (
                          <span className={`font-serif-eng text-[7.5px] uppercase tracking-[0.12em] opacity-60 ${tTextSub}`}>
                            · Noted
                          </span>
                        )}
                      </div>
                      <span className={`font-serif-eng text-[15px] font-medium truncate ${tTextMain}`}>
                        {item.title}
                      </span>
                    </div>

                    <div className="flex flex-col items-end shrink-0">
                      <span className={`font-serif-eng text-[9px] uppercase tracking-[0.14em] opacity-65 ${tTextSub}`}>
                        {item.theme}
                      </span>
                      <span className={`font-serif-eng text-[8.5px] opacity-45 mt-0.5 ${tTextSub}`}>
                        {item.readMinutes}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div
            className="relative z-10 flex-1 overflow-y-auto hide-scrollbar px-6 pt-5 pb-8 flex flex-col items-center"
            style={{
              maskImage:
                'linear-gradient(to bottom, transparent 0px, black 16px, black calc(100% - 16px), transparent 100%)',
              WebkitMaskImage:
                'linear-gradient(to bottom, transparent 0px, black 16px, black calc(100% - 16px), transparent 100%)',
            }}
          >
            <div className="w-full max-w-[480px] mx-auto flex flex-col items-center pb-2">
              {/* Calligraphic Anchor */}
              {activeBurhan.arabicAnchor && (
                <p
                  className="font-calligraphy text-[22px] sm:text-[26px] leading-[1.7] text-center mb-4 opacity-95"
                  style={{
                    color: accentColor,
                    textShadow: isLightMode ? 'none' : `0 0 28px ${accentColor}30`,
                  }}
                  dir="rtl"
                >
                  {activeBurhan.arabicAnchor}
                </p>
              )}

              {/* Eyebrow Metadata */}
              <div
                className="flex flex-wrap items-center justify-center gap-2 font-serif-eng text-[10px] uppercase tracking-[0.22em] mb-2.5 text-center"
                style={{ color: accentColor }}
              >
                <span>
                  {activeBurhan.category === 'islam'
                    ? 'Proof of Islam'
                    : isTodaysBurhan
                      ? 'Daily Burhan'
                      : 'Foundation'}
                </span>
                {activeBurhan.theme && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{activeBurhan.theme}</span>
                  </>
                )}
                <span aria-hidden="true">·</span>
                <span>{activeBurhan.scholar}</span>
              </div>

              <h2
                className={`font-serif-eng text-[26px] sm:text-[32px] text-center font-medium leading-[1.2] mb-5 ${tTextMain}`}
                style={{ textShadow: glowSub, textWrap: 'balance' }}
              >
                {activeBurhan.title}
              </h2>

              <div className="w-12 h-[1px] opacity-35 mb-6" style={{ backgroundColor: accentColor }} />

              {/* Essay Paragraphs */}
              <div className="flex flex-col gap-5 w-full mb-7">
                {paragraphs.map((text, idx) => (
                  <p
                    key={idx}
                    className={`font-serif-eng text-[16.5px] sm:text-[18px] leading-[1.82] text-center font-light ${tTextMain}`}
                    style={{ textShadow: glowSub }}
                  >
                    {text}
                  </p>
                ))}
              </div>

              {/* Structured Deductive Logic Chain (Premises -> Conclusion) */}
              {premises.length > 0 && (
                <div
                  className={`w-full rounded-[20px] border p-4 mb-5 transition-colors ${
                    isLightMode
                      ? 'bg-[#0d9488]/[0.06] border-[#0d9488]/20'
                      : 'bg-[#2dd4bf]/[0.05] border-[#2dd4bf]/20'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className="font-serif-eng text-[8.5px] uppercase tracking-[0.2em]"
                      style={{ color: accentColor }}
                    >
                      Logical Structure
                    </span>
                    <span
                      className="font-calligraphy text-[13px] leading-none opacity-85"
                      style={{ color: accentColor }}
                      dir="rtl"
                    >
                      البرهان المنطقي
                    </span>
                  </div>

                  <ol className="flex flex-col gap-2.5 mb-3">
                    {premises.map((premise, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span
                          className="font-serif-eng text-[9px] uppercase tracking-[0.12em] tabular-nums mt-1 shrink-0 opacity-80"
                          style={{ color: accentColor }}
                        >
                          P{idx + 1}
                        </span>
                        <p className={`font-serif-eng text-[13.5px] leading-[1.6] ${tTextMain}`}>
                          {premise}
                        </p>
                      </li>
                    ))}
                  </ol>

                  {conclusion && (
                    <div
                      className={`pt-2.5 border-t flex items-start gap-2.5 ${
                        isLightMode ? 'border-[#0d9488]/18' : 'border-[#2dd4bf]/18'
                      }`}
                    >
                      <span
                        className="font-serif-eng text-[12px] font-semibold mt-0.5 shrink-0"
                        style={{ color: accentColor }}
                        aria-label="Therefore"
                      >
                        ∴
                      </span>
                      <p className={`font-serif-eng text-[14px] font-medium leading-[1.6] ${tTextMain}`}>
                        {conclusion}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Contemplative Prompt & Personal Takeaway Card */}
              {question && (
                <div
                  className={`w-full rounded-[20px] border p-4 mb-2 transition-colors ${
                    isLightMode
                      ? 'bg-white/55 border-black/[0.08]'
                      : 'bg-white/[0.035] border-white/[0.08]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span
                      className="font-serif-eng text-[8.5px] uppercase tracking-[0.2em]"
                      style={{ color: accentColor }}
                    >
                      For Quiet Thought
                    </span>
                    {noteSavedToast && (
                      <span
                        className="font-serif-eng text-[8.5px] uppercase tracking-[0.16em]"
                        style={{ color: accentColor }}
                      >
                        Saved
                      </span>
                    )}
                  </div>
                  <p className={`font-serif-eng italic text-[14px] leading-relaxed mb-3 ${tTextMain}`}>
                    {question}
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={noteDraft}
                      onChange={(e) => setNoteDraft(e.target.value)}
                      onBlur={handleSaveTakeaway}
                      placeholder="Write a quiet takeaway for yourself..."
                      aria-label="Personal contemplation takeaway"
                      className={`flex-1 min-w-0 bg-transparent border rounded-xl px-3 py-2 font-serif-eng text-[13px] outline-none transition-colors ${
                        isLightMode
                          ? 'border-black/12 text-[#1a1814] placeholder:text-black/35 focus:border-[#0d9488]'
                          : 'border-white/12 text-white placeholder:text-white/35 focus:border-[#2dd4bf]'
                      }`}
                    />
                    {noteDraft.trim() !== (burhanNotes?.[activeBurhan.id] || '').trim() && (
                      <button
                        type="button"
                        onClick={handleSaveTakeaway}
                        className="min-h-[36px] px-3 rounded-xl font-serif-eng text-[9px] uppercase tracking-[0.16em] border shrink-0 cursor-pointer"
                        style={{
                          color: accentColor,
                          borderColor: `${accentColor}55`,
                        }}
                      >
                        Save
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer Primary Action */}
        {!showLibrary && (
          <div
            className={`relative z-20 px-6 py-4 flex items-center justify-center gap-3 shrink-0 border-t ${
              isLightMode ? 'border-black/[0.06]' : 'border-white/[0.07]'
            }`}
          >
            {!isTodaysBurhan ? (
              <button
                type="button"
                onClick={() => {
                  handleSaveTakeaway();
                  if (burhan?.id) setSelectedId(burhan.id);
                }}
                className={`flex items-center justify-center gap-2 w-full max-w-[320px] h-12 rounded-2xl border font-serif-eng text-xs uppercase tracking-[0.2em] font-medium transition-all cursor-pointer ${
                  isLightMode
                    ? 'bg-white/75 border-black/12 text-[#1a1814] hover:bg-white'
                    : 'bg-white/[0.07] border-white/15 text-white hover:bg-white/[0.12]'
                }`}
              >
                Return to Today’s Burhan
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  handleSaveTakeaway();
                  onComplete();
                  setTimeout(onClose, 500);
                }}
                disabled={isCompleted}
                className={`relative overflow-hidden group flex items-center justify-center gap-2.5 w-full max-w-[320px] h-12 rounded-2xl transition-all duration-300 border cursor-pointer ${
                  isCompleted
                    ? isLightMode
                      ? 'bg-[#0d9488]/12 border-[#0d9488]/35'
                      : 'bg-[#2dd4bf]/12 border-[#2dd4bf]/35'
                    : isLightMode
                      ? 'bg-[#0d9488] text-white border-[#0d9488] hover:bg-[#0f766e] shadow-xs'
                      : 'bg-[#2dd4bf]/20 border-[#2dd4bf]/50 hover:bg-[#2dd4bf]/30'
                }`}
              >
                {isCompleted ? (
                  <>
                    <CheckCircleIcon
                      size={17}
                      className="animate-[checkmarkPop_0.4s_cubic-bezier(0.34,1.56,0.64,1)_forwards]"
                      style={{ color: accentColor }}
                    />
                    <span
                      className="font-serif-eng text-xs uppercase tracking-[0.2em] font-medium"
                      style={{ color: accentColor }}
                    >
                      Reflected Today
                    </span>
                  </>
                ) : (
                  <span
                    className={`font-serif-eng text-xs uppercase tracking-[0.2em] font-medium ${
                      isLightMode ? 'text-white' : tTextMain
                    }`}
                  >
                    I Have Reflected · +5% Yaqeen
                  </span>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
