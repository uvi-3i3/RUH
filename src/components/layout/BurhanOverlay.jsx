import { useEffect, useRef, useState } from 'react';
import { ChevronDownIcon, CheckCircleIcon } from '../icons/Icons';

export const BurhanOverlay = ({ isOpen, burhan, isLightMode, isCompleted, onComplete, onClose }) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setShowContent(true), 100);
    } else {
      setShowContent(false);
    }
  }, [isOpen]);

  if (!isOpen || !burhan) return null;

  const tBg = isLightMode ? 'bg-[#f4f0e8]/80' : 'bg-[#060504]/80';
  const tTextMain = isLightMode ? 'text-[#1a1814]' : 'text-[rgba(245,238,224,0.92)]';
  const tTextSub = isLightMode ? 'text-[#4a453d]' : 'text-[rgba(228,218,200,0.6)]';
  const glowSub = isLightMode ? '0 1px 1px rgba(255,255,255,0.6)' : '0 1px 1px rgba(0,0,0,0.8)';
  const accentColor = isLightMode ? '#0d9488' : '#14b8a6';

  const paragraphs = burhan.content.split('\\n\\n');

  return (
    <div 
      className={`fixed inset-0 z-[60] flex flex-col justify-start items-center transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)]
        backdrop-blur-[60px] ${tBg}
      `}
      style={{ 
        opacity: showContent ? 1 : 0, 
        transform: showContent ? 'scale(1)' : 'scale(1.05)',
      }}
    >
      {/* Immersive Background Glow */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none transition-all duration-1000"
        style={{
          background: `radial-gradient(circle at 50% 30%, ${accentColor}1A 0%, transparent 60%)`
        }}
      />

      {/* Header Close Button */}
      <div className="w-full h-24 flex justify-end items-center px-6 z-20">
        <button 
          onClick={onClose}
          className={`p-4 rounded-full border transition-all duration-500 hover:scale-105 active:scale-95 ${isLightMode ? 'bg-white/30 border-white/40 shadow-sm' : 'bg-white/5 border-white/10 hover:bg-white/10'} ${tTextMain}`}
        >
          <ChevronDownIcon size={20} />
        </button>
      </div>

      {/* Content Scroller */}
      <div className="flex-1 w-full overflow-y-auto hide-scrollbar px-6 pb-32 z-10">
        <div className="w-full max-w-[400px] mx-auto flex flex-col items-center">
          
          <span className={`font-serif-eng text-[10px] uppercase tracking-[0.3em] mb-4 transition-colors duration-1000`} style={{ color: accentColor, textShadow: glowSub }}>
            Daily Burhan
          </span>
          
          <h2 className={`font-serif-eng text-2xl text-center font-medium leading-[1.3] mb-6 ${tTextMain}`} style={{ textShadow: glowSub }}>
            {burhan.title}
          </h2>

          <div className="w-[40px] h-[1px] opacity-30 mb-8" style={{ backgroundColor: accentColor }} />

          <div className="flex flex-col gap-6">
            {paragraphs.map((text, idx) => (
              <p key={idx} className={`font-serif-eng text-[15px] leading-[1.9] text-center font-light opacity-90 ${tTextMain}`} style={{ textShadow: glowSub }}>
                {text}
              </p>
            ))}
          </div>

          <p className={`font-serif-eng italic text-[11px] uppercase tracking-[0.2em] mt-10 opacity-70 ${tTextSub}`}>
            — {burhan.scholar}
          </p>

        </div>
      </div>

      {/* Footer Signature & Action */}
      <div className="absolute bottom-0 left-0 right-0 p-8 flex justify-center z-20 bg-gradient-to-t from-black/20 to-transparent">
        <button 
          onClick={() => {
            onComplete();
            setTimeout(onClose, 800);
          }}
          disabled={isCompleted}
          className={`
            relative overflow-hidden group flex items-center justify-center gap-3 w-full max-w-[300px] h-14 rounded-full transition-all duration-700 backdrop-blur-md border
            ${isCompleted 
              ? (isLightMode ? 'bg-[#0d9488]/10 border-[#0d9488]/30' : 'bg-[#14b8a6]/10 border-[#14b8a6]/30')
              : (isLightMode ? 'bg-white/40 border-white/50 hover:bg-white/60 shadow-sm' : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20')
            }
          `}
        >
          {isCompleted ? (
            <>
              <CheckCircleIcon size={18} className="animate-[checkmarkPop_0.4s_cubic-bezier(0.34,1.56,0.64,1)_forwards]" style={{ color: accentColor }} />
              <span className={`font-serif-eng text-sm uppercase tracking-widest font-medium`} style={{ color: accentColor }}>Reflected</span>
            </>
          ) : (
            <>
              <span className={`font-serif-eng text-xs uppercase tracking-[0.2em] opacity-80 group-hover:opacity-100 transition-opacity ${tTextMain}`}>I Have Reflected</span>
            </>
          )}
        </button>
      </div>
    
    </div>
  );
};
