import { useState, useEffect, useRef } from 'react';
import {
  BookIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  SparklesIcon,
} from '../icons/Icons';
import { ESSENTIAL_DUAS } from '../../data/duasData';
import {
  composeGroundedTafakkurFallback,
  rankDuasByMoment,
  rankVersesByResonance,
} from '../../utils/localAiLogic';
import { useOptionalLocalAI, useOptionalPreferences } from '../../context/sanctuaryStore';
import {
  hapticDismiss,
  hapticNavigate,
  hapticSuccess,
  hapticTapMedium,
} from '../../utils/haptics';

export const TafakkurOverlay = ({
  isOpen,
  verse,
  isLightMode: isLightModeProp,
  isSimpleMode = false,
  initialNote = '',
  onSave,
  onClose,
  onOpenDua,
  localAI: localAIProp,
  allVerses,
}) => {
  const preferencesCtx = useOptionalPreferences();
  const localAICtx = useOptionalLocalAI();
  const localAI = localAIProp ?? localAICtx;
  const isLightMode = isLightModeProp ?? preferencesCtx?.isLightMode ?? false;

  const [note, setNote] = useState(initialNote);
  const [feedback, setFeedback] = useState(null);
  const [streamingCommentary, setStreamingCommentary] = useState('');
  const [isReflecting, setIsReflecting] = useState(false);
  const textareaRef = useRef(null);
  const requestEpochRef = useRef(0);

  useEffect(() => {
    if (isOpen) {
      setNote(initialNote || '');
      setFeedback(null);
      setStreamingCommentary('');
      setIsReflecting(false);
      const t = setTimeout(() => textareaRef.current?.focus(), 250);
      return () => clearTimeout(t);
    } else {
      requestEpochRef.current += 1;
      localAI?.abortGeneration?.();
      setIsReflecting(false);
    }
  }, [isOpen, verse?.id, initialNote]);

  if (!isOpen || !verse) return null;

  const tBg = isLightMode ? 'bg-[#f4f0e8]/96' : 'bg-[#060504]/96';
  const tTextMain = isLightMode ? 'text-[#1a1814]' : 'text-[rgba(245,238,224,0.92)]';
  const tTextSub = isLightMode ? 'text-[#4a453d]' : 'text-[rgba(228,218,200,0.64)]';
  const glowSub = isLightMode ? '0 1px 1px rgba(255,255,255,0.6)' : '0 1px 1px rgba(0,0,0,0.8)';
  const accentColor = isLightMode ? '#0d9488' : '#14b8a6';
  const goldColor = isLightMode ? '#8a621c' : '#d2a24b';

  const handleClose = () => {
    requestEpochRef.current += 1;
    localAI?.abortGeneration?.();
    hapticDismiss();
    onClose?.();
  };

  const handleSave = () => {
    requestEpochRef.current += 1;
    localAI?.abortGeneration?.();
    hapticSuccess();
    if (onSave) onSave(verse.id, note);
  };

  const handleNoteChange = (nextValue) => {
    setNote(nextValue);
    if (isReflecting) {
      requestEpochRef.current += 1;
      localAI?.abortGeneration?.();
      setIsReflecting(false);
      setStreamingCommentary('');
    }
  };

  const handleReflect = async () => {
    const trimmed = note.trim();
    if (!trimmed || trimmed.length < 8 || isReflecting) return;

    const epoch = ++requestEpochRef.current;
    hapticTapMedium();
    setIsReflecting(true);
    setStreamingCommentary('');

    // Seed 0-ms grounded feedback immediately so Resonant Verse & Dua appear without delay
    const rankedVerses = rankVersesByResonance(trimmed, allVerses || [], {
      excludeVerseId: verse.id,
      limit: 2,
    });
    const candidateVerses = rankedVerses.map((r) => r.item).filter(Boolean);
    const rankedDuas = rankDuasByMoment(ESSENTIAL_DUAS, { query: trimmed });
    const candidateDua = rankedDuas[0]?.item || null;
    const initialGrounded = composeGroundedTafakkurFallback({
      note: trimmed,
      activeVerse: verse,
      candidateVerses,
      candidateDua,
      isSimpleMode,
    });
    setFeedback(initialGrounded);

    try {
      if (localAI?.reflectOnTafakkur) {
        const result = await localAI.reflectOnTafakkur({
          note: trimmed,
          activeVerse: verse,
          allVerses: allVerses || [],
          isSimpleMode,
          onStream: (partial) => {
            if (requestEpochRef.current === epoch) {
              setStreamingCommentary(partial);
            }
          },
        });
        if (requestEpochRef.current !== epoch) return;
        if (result) {
          hapticSuccess();
          setFeedback(result);
        }
      } else {
        hapticSuccess();
      }
    } finally {
      if (requestEpochRef.current === epoch) {
        setIsReflecting(false);
        setStreamingCommentary('');
      }
    }
  };

  const activeTranslation = String(
    (isSimpleMode && verse.simpleT ? verse.simpleT : verse.t) || ''
  ).replace(/\\n/g, ' ');

  const canReflect = note.trim().length >= 8;

  const statusHint = (() => {
    if (!localAI) return null;
    if (localAI.isReady) {
      return `On-device AI ready (${localAI.runtimeBackend === 'webgpu' ? 'WebGPU' : 'WASM'})`;
    }
    if (localAI.isDownloading) {
      return `Grounded reflection active · Preparing local AI (${localAI.progress || 0}%)`;
    }
    if (localAI.status === 'paused') {
      return 'Grounded reflection active · Local AI paused in Settings';
    }
    return 'Offline grounded companion active';
  })();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Tafakkur Reflection Journal"
      data-testid="tafakkur-overlay"
      className={`fixed inset-0 z-[110] flex flex-col w-full h-[100dvh] backdrop-blur-2xl transition-opacity duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${tBg}`}
      style={{ opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'auto' : 'none' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${accentColor}16 0%, transparent 70%)`,
        }}
      />

      {/* Header */}
      <div
        className="w-full max-w-2xl mx-auto flex justify-between items-center gap-2 px-5 pb-3.5 z-10 shrink-0"
        style={{ paddingTop: 'calc(18px + var(--sat))' }}
      >
        <button
          type="button"
          aria-label="Close reflection journal"
          onClick={handleClose}
          className={`w-11 h-11 shrink-0 rounded-full border flex items-center justify-center opacity-75 hover:opacity-100 transition-opacity cursor-pointer ${
            isLightMode ? 'border-black/12 bg-white/70' : 'border-white/12 bg-white/5'
          } ${tTextMain}`}
        >
          <ChevronDownIcon size={20} />
        </button>
        <span
          className={`font-serif-eng text-[11px] uppercase tracking-[0.18em] whitespace-nowrap truncate ${tTextSub}`}
        >
          Tafakkur · Journal
        </span>
        <button
          type="button"
          onClick={handleSave}
          className={`shrink-0 min-h-[44px] flex items-center gap-1.5 py-2 px-4 rounded-full border border-current opacity-85 hover:opacity-100 transition-all cursor-pointer whitespace-nowrap ${tTextMain}`}
        >
          <span className="font-serif-eng text-[11px] uppercase tracking-[0.14em]">Save</span>
          <CheckCircleIcon size={15} />
        </button>
      </div>

      {/* Scrollable Content */}
      <div
        className="flex-grow flex flex-col items-center px-6 z-10 w-full max-w-lg mx-auto overflow-y-auto hide-scrollbar"
        style={{
          paddingBottom: 'calc(32px + var(--sab))',
          maskImage:
            'linear-gradient(to bottom, transparent 0px, black 12px, black calc(100% - 14px), transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, transparent 0px, black 12px, black calc(100% - 14px), transparent 100%)',
        }}
      >
        <div
          className={`w-full flex flex-col items-center ${
            feedback || isReflecting ? 'pt-2 pb-6' : 'my-auto py-4'
          }`}
        >
          <p
            className={`font-arabic text-2xl md:text-3xl leading-[1.95] text-center mb-2.5 opacity-85 ${tTextMain}`}
            dir="rtl"
            style={{ textShadow: glowSub }}
          >
            {verse.a}
          </p>
          <p className={`font-serif-eng italic text-xs text-center mb-5 ${tTextSub}`}>
            {activeTranslation} — {verse.s}
          </p>

          <h2
            className={`font-serif-eng text-xl md:text-2xl font-light text-center mb-4 tracking-wide ${tTextMain}`}
            style={{ textShadow: glowSub }}
          >
            What did this awaken in you?
          </h2>

          <div className="w-full relative">
            <textarea
              ref={textareaRef}
              value={note}
              onChange={(e) => handleNoteChange(e.target.value)}
              placeholder="Write your reflection freely..."
              aria-label="Personal reflection note"
              className={`w-full bg-transparent border-b outline-none resize-none font-serif-eng italic text-lg text-center leading-relaxed pb-4 transition-colors ${
                isLightMode
                  ? 'border-[#1a1814]/20 text-[#1a1814] placeholder-[#4a453d]/45 focus:border-[#0d9488]/65'
                  : 'border-white/20 text-[rgba(245,238,224,0.94)] placeholder-white/30 focus:border-[#14b8a6]/65'
              }`}
              rows={3}
            />

            {canReflect && (
              <div className="mt-4 flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={handleReflect}
                  disabled={isReflecting}
                  className={`min-h-[44px] px-5 py-2 rounded-full transition-all duration-300 flex items-center gap-2 border text-[11px] font-serif-eng uppercase tracking-[0.16em] cursor-pointer disabled:opacity-65 ${
                    isLightMode
                      ? 'bg-[#0d9488]/10 text-[#0d9488] border-[#0d9488]/30 hover:bg-[#0d9488]/16'
                      : 'bg-[#14b8a6]/12 text-[#14b8a6] border-[#14b8a6]/30 hover:bg-[#14b8a6]/20'
                  }`}
                >
                  <SparklesIcon size={14} className={isReflecting ? 'animate-spin' : ''} />
                  <span>
                    {isReflecting
                      ? 'Contemplating...'
                      : feedback
                        ? 'Reflect Again'
                        : 'Reflect with Ruh'}
                  </span>
                </button>
                {statusHint && (
                  <p className={`font-serif-eng text-[10px] tracking-[0.06em] opacity-65 text-center ${tTextSub}`}>
                    {statusHint}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Grounded Editorial Feedback Card (Instant 0-ms seed + live on-device AI stream) */}
          {feedback && (
            <div
              data-testid="tafakkur-feedback-card"
              className={`mt-6 flex flex-col w-full p-5 rounded-3xl backdrop-blur-md border space-y-4 ${
                isLightMode
                  ? 'bg-white/80 border-[#0d9488]/22 shadow-xs'
                  : 'bg-white/[0.04] border-[#14b8a6]/25'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <SparklesIcon
                    size={13}
                    className={isReflecting ? 'animate-spin' : ''}
                    style={{ color: accentColor }}
                  />
                  <span
                    className="font-serif-eng text-[10px] uppercase tracking-[0.18em] font-medium"
                    style={{ color: accentColor }}
                  >
                    Ruh Reflection
                  </span>
                </div>
                <span
                  className={`font-serif-eng text-[9px] uppercase tracking-[0.14em] px-2 py-0.5 rounded-full border ${
                    isLightMode
                      ? 'border-black/10 text-[#4a453d] bg-black/[0.03]'
                      : 'border-white/12 text-[#e4dac8]/75 bg-white/[0.04]'
                  }`}
                >
                  {isReflecting && localAI?.isReady
                    ? 'Refining on-device...'
                    : feedback.sourceMode === 'llm'
                      ? 'On-Device AI'
                      : 'Grounded Match'}
                </span>
              </div>

              <p className={`font-serif-eng text-[14.5px] leading-[1.85] ${tTextMain}`}>
                {streamingCommentary || feedback.commentary}
              </p>

              {/* Canonical Companion Verse */}
              {feedback.companionVerse && (
                <div
                  className={`pt-3.5 border-t flex flex-col items-center text-center ${
                    isLightMode ? 'border-black/10' : 'border-white/10'
                  }`}
                >
                  <span
                    className="font-serif-eng text-[9px] uppercase tracking-[0.18em] opacity-80 mb-2"
                    style={{ color: accentColor }}
                  >
                    Resonant Verse
                  </span>
                  {feedback.companionVerse.a && (
                    <p
                      className={`font-arabic text-lg leading-[1.9] mb-1.5 opacity-90 ${tTextMain}`}
                      dir="rtl"
                    >
                      {feedback.companionVerse.a}
                    </p>
                  )}
                  <p className={`font-serif-eng italic text-[13px] leading-relaxed opacity-90 ${tTextMain}`}>
                    “
                    {String(
                      (isSimpleMode && feedback.companionVerse.simpleT
                        ? feedback.companionVerse.simpleT
                        : feedback.companionVerse.t) || ''
                    ).replace(/\\n/g, ' ')}
                    ”
                  </p>
                  <span
                    className="font-serif-eng text-[9px] uppercase tracking-[0.16em] opacity-75 mt-1.5"
                    style={{ color: accentColor }}
                  >
                    {feedback.companionVerse.s}
                  </span>
                </div>
              )}

              {/* Suggested Supplication */}
              {feedback.companionDua && (
                <div
                  className={`pt-3.5 border-t flex items-center justify-between gap-3 ${
                    isLightMode ? 'border-black/10' : 'border-white/10'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <BookIcon size={12} style={{ color: goldColor }} />
                      <span
                        className="font-serif-eng text-[9px] uppercase tracking-[0.16em]"
                        style={{ color: goldColor }}
                      >
                        Suggested Dua
                      </span>
                    </div>
                    <p className={`font-serif-eng text-[13.5px] font-medium truncate mt-0.5 ${tTextMain}`}>
                      {feedback.companionDua.title}
                    </p>
                    <p className={`font-serif-eng text-[11px] truncate opacity-75 ${tTextSub}`}>
                      {feedback.companionDua.source}
                    </p>
                  </div>

                  {onOpenDua && (
                    <button
                      type="button"
                      onClick={() => {
                        hapticNavigate();
                        onOpenDua(feedback.companionDua);
                      }}
                      className={`min-h-[40px] px-3.5 rounded-xl border font-serif-eng text-[10px] uppercase tracking-[0.14em] flex items-center gap-1 shrink-0 cursor-pointer transition-colors ${
                        isLightMode
                          ? 'border-[#8a621c]/30 text-[#8a621c] bg-[#8a621c]/8 hover:bg-[#8a621c]/14'
                          : 'border-[#d2a24b]/35 text-[#e8c67c] bg-[#d2a24b]/10 hover:bg-[#d2a24b]/18'
                      }`}
                    >
                      <span>Open Dua</span>
                      <ChevronRightIcon size={12} />
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
