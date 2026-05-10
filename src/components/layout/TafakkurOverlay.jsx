import { useState, useEffect, useRef } from 'react';
import { ChevronDownIcon, CheckCircleIcon, SparklesIcon } from '../icons/Icons';

export const TafakkurOverlay = ({ isOpen, verse, isLightMode, initialNote = "", onSave, onClose, localAI, allVerses }) => {
  const [note, setNote] = useState(initialNote);
  const [companionVerse, setCompanionVerse] = useState(null);
  const textareaRef = useRef(null);

  // PERF-01: Trigger AI model loading when the overlay opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 500);
      setCompanionVerse(null);
      
      // Begin lazy-loading the AI model if not ready
      if (localAI && !localAI.isReady && localAI.initialize) {
        localAI.initialize();
      }
    }
  }, [isOpen, localAI]);
  
  useEffect(() => {
    setNote(initialNote);
  }, [initialNote]);

  if (!isOpen || !verse) return null;

  const tBg = isLightMode ? 'bg-[#f4f0e8]/95' : 'bg-[#060504]/95';
  const tTextMain = isLightMode ? 'text-[#1a1814]' : 'text-[rgba(245,238,224,0.92)]';
  const glowSub = isLightMode ? '0 1px 1px rgba(255,255,255,0.6)' : '0 1px 1px rgba(0,0,0,0.8)';
  const accentColor = isLightMode ? '#0d9488' : '#14b8a6';

  const handleSave = () => {
    if (onSave) onSave(verse.id, note);
  };

  const findCompanion = async () => {
    if (!localAI?.isReady || !note.trim()) return;
    const match = await localAI.findCompanionVerse(note, allVerses);
    if (match) {
      setCompanionVerse(match);
    }
  };

  return (
    <div 
      className={`fixed inset-0 z-[100] flex flex-col w-full h-[100dvh] backdrop-blur-3xl transition-opacity duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]
        ${tBg}
      `}
      style={{ opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'auto' : 'none' }}
    >
      <div className="absolute inset-0 pointer-events-none" style={{ 
        background: `radial-gradient(circle at center, ${accentColor}20 0%, transparent 70%)` 
      }} />

      {/* Header */}
      <div className="w-full flex justify-between items-center px-6 pt-12 pb-4 z-10">
        <button onClick={onClose} className={`p-2 rounded-full opacity-60 hover:opacity-100 transition-opacity ${tTextMain}`}>
          <ChevronDownIcon size={24} />
        </button>
        <button onClick={handleSave} className={`flex items-center gap-2 p-2 px-4 rounded-full border border-current opacity-80 hover:opacity-100 transition-all ${tTextMain}`}>
          <span className="font-serif-eng text-xs uppercase tracking-widest">Commit</span>
          <CheckCircleIcon size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-grow flex flex-col items-center justify-center px-8 z-10 w-full max-w-lg mx-auto">
        <p className={`font-arabic text-3xl leading-[2.1] text-center mb-12 opacity-30 ${tTextMain}`} dir="rtl" style={{ textShadow: glowSub }}>
          {verse.a}
        </p>

        <h2 className={`font-serif-eng text-2xl font-light text-center mb-8 tracking-wide ${tTextMain}`} style={{ textShadow: glowSub }}>
          What did this awaken in you?
        </h2>

        <div className="w-full relative">
          <textarea
            ref={textareaRef}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Type your reflection here..."
            className={`w-full bg-transparent border-b outline-none resize-none font-serif-eng italic text-lg text-center leading-relaxed pb-4 transition-colors
              ${isLightMode ? 'border-[#1a1814]/20 text-[#1a1814] placeholder-[#4a453d]/40 focus:border-[#0d9488]/50' : 'border-white/20 text-[rgba(245,238,224,0.92)] placeholder-white/20 focus:border-[#14b8a6]/50'}
            `}
            rows={1}
            style={{ 
              minHeight: '40px',
              height: 'auto'
            }}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
          />

          {/* PERF-01: Show AI loading progress indicator */}
          {localAI?.isLoading && !localAI.isReady && (
            <div className="absolute right-0 bottom-6 flex items-center gap-2 pointer-events-none">
              <div className="flex flex-col items-end gap-1">
                <span className={`font-serif-eng text-[8px] uppercase tracking-widest opacity-60 ${isLightMode ? 'text-[#0d9488]' : 'text-[#14b8a6]'}`}>
                  Preparing AI… {localAI.progress}%
                </span>
                <div className={`w-20 h-[2px] rounded-full overflow-hidden ${isLightMode ? 'bg-[#0d9488]/20' : 'bg-[#14b8a6]/20'}`}>
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${isLightMode ? 'bg-[#0d9488]' : 'bg-[#14b8a6]'}`}
                    style={{ width: `${localAI.progress}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {localAI?.isReady && note.length > 10 && !companionVerse && (
             <div className="absolute right-0 bottom-6 flex justify-end w-full pointer-events-none">
                 <button 
                  onClick={findCompanion} 
                  disabled={localAI.isProcessing}
                  className={`pointer-events-auto p-2 rounded-full transition-all duration-500 hover:scale-110 flex items-center justify-center border ${isLightMode ? 'bg-[#0d9488]/10 text-[#0d9488] border-[#0d9488]/20' : 'bg-[#14b8a6]/10 text-[#14b8a6] border-[#14b8a6]/20'}`}
                 >
                   <SparklesIcon size={14} className={localAI.isProcessing ? 'animate-pulse' : ''} />
                 </button>
             </div>
          )}
        </div>

        {/* AI Surfaces the Companion Verse */}
        <div 
          className="w-full flex justify-center transition-all duration-[1500ms] overflow-hidden"
          style={{ 
             maxHeight: companionVerse ? '300px' : '0px',
             opacity: companionVerse ? 1 : 0,
             marginTop: companionVerse ? '40px' : '0px'
          }}
        >
           {companionVerse && (
             <div className={`flex flex-col items-center w-full max-w-[300px] p-6 rounded-[24px] backdrop-blur-md border ${isLightMode ? 'bg-[#0d9488]/5 border-[#0d9488]/20 shadow-md' : 'bg-[#14b8a6]/5 border-[#14b8a6]/20'}`}>
                <SparklesIcon size={16} className={`mb-2 opacity-50 ${isLightMode ? 'text-[#0d9488]' : 'text-[#14b8a6]'}`} />
                <span className={`font-serif-eng text-[7px] uppercase tracking-widest opacity-50 mb-3 ${isLightMode ? 'text-[#0d9488]' : 'text-[#14b8a6]'}`}>Related reflection</span>
                <p className={`font-serif-eng italic text-[11px] leading-relaxed text-center opacity-80 ${tTextMain}`}>
                  {companionVerse.t}
                </p>
                <div className={`w-8 h-[1px] my-3 opacity-30 ${isLightMode ? 'bg-[#0d9488]' : 'bg-[#14b8a6]'}`} />
                <span className={`font-serif-eng text-[8px] uppercase tracking-widest opacity-60 ${isLightMode ? 'text-[#0d9488]' : 'text-[#14b8a6]'}`}>
                  {companionVerse.s}
                </span>
                {companionVerse.ts && (
                  <span className={`font-serif-eng text-[7px] italic opacity-30 mt-1 ${isLightMode ? 'text-[#0d9488]' : 'text-[#14b8a6]'}`}>
                    Source: {companionVerse.ts}
                  </span>
                )}
             </div>
           )}
        </div>

      </div>
    </div>
  );
};
