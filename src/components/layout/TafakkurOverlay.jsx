import { useState, useEffect, useRef } from 'react';
import { ChevronDownIcon, CheckCircleIcon, SparklesIcon } from '../icons/Icons';
import { useOptionalPreferences } from '../../context/sanctuaryStore';
import { hapticDismiss, hapticSuccess, hapticTapMedium } from '../../utils/haptics';

export const TafakkurOverlay = ({
  isOpen,
  verse,
  isLightMode: isLightModeProp,
  initialNote = '',
  onSave,
  onClose,
  localAI,
  allVerses,
}) => {
  const preferencesCtx = useOptionalPreferences();
  const isLightMode = isLightModeProp ?? preferencesCtx?.isLightMode ?? false;
  const [note, setNote] = useState(initialNote);
  const [companionVerse, setCompanionVerse] = useState(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setNote(initialNote || '');
      setCompanionVerse(null);
      const t = setTimeout(() => textareaRef.current?.focus(), 250);
      if (localAI && !localAI.isReady && localAI.initialize) {
        localAI.initialize();
      }
      return () => clearTimeout(t);
    }
  }, [isOpen, verse?.id, initialNote]);

  if (!isOpen || !verse) return null;

  const tBg = isLightMode ? 'bg-[#f4f0e8]/95' : 'bg-[#060504]/95';
  const tTextMain = isLightMode ? 'text-[#1a1814]' : 'text-[rgba(245,238,224,0.92)]';
  const tTextSub = isLightMode ? 'text-[#4a453d]' : 'text-[rgba(228,218,200,0.6)]';
  const glowSub = isLightMode ? '0 1px 1px rgba(255,255,255,0.6)' : '0 1px 1px rgba(0,0,0,0.8)';
  const accentColor = isLightMode ? '#0d9488' : '#14b8a6';

  const handleSave = () => {
    hapticSuccess();
    if (onSave) onSave(verse.id, note);
  };

  const findCompanion = async () => {
    if (!localAI?.isReady || !note.trim()) return;
    hapticTapMedium();
    const match = await localAI.findCompanionVerse(note, allVerses, verse.id);
    if (match) {
      hapticSuccess();
      setCompanionVerse(match);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Tafakkur Reflection Journal"
      className={`fixed inset-0 z-[110] flex flex-col w-full h-[100dvh] backdrop-blur-2xl transition-opacity duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${tBg}`}
      style={{ opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'auto' : 'none' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${accentColor}18 0%, transparent 70%)`,
        }}
      />

      {/* Header */}
      <div className="w-full max-w-2xl mx-auto flex justify-between items-center gap-2 px-5 pt-6 pb-4 z-10">
        <button
          type="button"
          aria-label="Close reflection journal"
          onClick={() => {
            hapticDismiss();
            onClose?.();
          }}
          className={`w-10 h-10 shrink-0 rounded-full border flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity cursor-pointer ${
            isLightMode ? 'border-black/10' : 'border-white/10'
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
          className={`shrink-0 flex items-center gap-1.5 py-2 px-3.5 rounded-full border border-current opacity-85 hover:opacity-100 transition-all cursor-pointer whitespace-nowrap ${tTextMain}`}
        >
          <span className="font-serif-eng text-[11px] uppercase tracking-[0.14em]">Save</span>
          <CheckCircleIcon size={15} />
        </button>
      </div>

      {/* Content */}
      <div
        className="flex-grow flex flex-col items-center px-6 z-10 w-full max-w-lg mx-auto overflow-y-auto hide-scrollbar"
        style={{
          maskImage: 'linear-gradient(to bottom, transparent 0px, black 18px, black calc(100% - 18px), transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0px, black 18px, black calc(100% - 18px), transparent 100%)',
        }}
      >
        <div className="w-full flex flex-col items-center my-auto py-4">
        <p
          className={`font-arabic text-2xl md:text-3xl leading-[2.0] text-center mb-3 opacity-80 ${tTextMain}`}
          dir="rtl"
          style={{ textShadow: glowSub }}
        >
          {verse.a}
        </p>
        <p className={`font-serif-eng italic text-xs text-center mb-8 ${tTextSub}`}>
          {verse.t?.replace(/\\n/g, ' ')} — {verse.s}
        </p>

        <h2
          className={`font-serif-eng text-2xl font-light text-center mb-6 tracking-wide ${tTextMain}`}
          style={{ textShadow: glowSub }}
        >
          What did this awaken in you?
        </h2>

        <div className="w-full relative">
          <textarea
            ref={textareaRef}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Write your reflection..."
            aria-label="Personal reflection note"
            className={`w-full bg-transparent border-b outline-none resize-none font-serif-eng italic text-lg text-center leading-relaxed pb-4 transition-colors ${
              isLightMode
                ? 'border-[#1a1814]/20 text-[#1a1814] placeholder-[#4a453d]/40 focus:border-[#0d9488]/60'
                : 'border-white/20 text-[rgba(245,238,224,0.92)] placeholder-white/25 focus:border-[#14b8a6]/60'
            }`}
            rows={2}
          />

          {localAI?.isReady && note.length > 10 && !companionVerse && (
            <div className="mt-3 flex justify-center">
              <button
                type="button"
                onClick={findCompanion}
                disabled={localAI.isProcessing}
                className={`px-3 py-1.5 rounded-full transition-all duration-300 flex items-center gap-1.5 border text-[10px] font-serif-eng uppercase tracking-widest cursor-pointer ${
                  isLightMode
                    ? 'bg-[#0d9488]/10 text-[#0d9488] border-[#0d9488]/25'
                    : 'bg-[#14b8a6]/10 text-[#14b8a6] border-[#14b8a6]/25'
                }`}
              >
                <SparklesIcon size={13} className={localAI.isProcessing ? 'animate-spin' : ''} />
                <span>Discover Resonant Verse</span>
              </button>
            </div>
          )}
        </div>

        {/* Companion Verse */}
        {companionVerse && (
          <div
            className={`mt-8 flex flex-col items-center w-full max-w-[360px] p-5 rounded-3xl backdrop-blur-md border ${
              isLightMode
                ? 'bg-[#0d9488]/5 border-[#0d9488]/20 shadow-xs'
                : 'bg-[#14b8a6]/5 border-[#14b8a6]/20'
            }`}
          >
            <span
              className={`font-serif-eng text-[9px] uppercase tracking-widest opacity-70 mb-2 ${
                isLightMode ? 'text-[#0d9488]' : 'text-[#14b8a6]'
              }`}
            >
              Resonant Verse
            </span>
            <p className={`font-serif-eng italic text-xs leading-relaxed text-center opacity-90 ${tTextMain}`}>
              {companionVerse.t?.replace(/\\n/g, ' ')}
            </p>
            <span
              className={`font-serif-eng text-[9px] uppercase tracking-widest opacity-70 mt-2 ${
                isLightMode ? 'text-[#0d9488]' : 'text-[#14b8a6]'
              }`}
            >
              {companionVerse.s}
            </span>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};
