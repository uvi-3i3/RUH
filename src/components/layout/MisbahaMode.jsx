import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * FEAT-09: Full-Screen Misbaha (Tasbeeh) Counter
 * 
 * Opens as a full-screen overlay when long-pressing a dhikr card.
 * The entire screen is the tap target — designed for one-handed,
 * eyes-closed devotional counting with haptic feedback.
 */

const ARABIC_PHRASES = {
  istighfar: 'أَسْتَغْفِرُ اللَّهَ',
  subhanallah: 'سُبْحَانَ اللَّهِ',
  alhamdulillah: 'الْحَمْدُ لِلَّهِ',
  allahu_akbar: 'اللَّهُ أَكْبَرُ',
};

export const MisbahaMode = ({ isOpen, taskId, taskTitle, target, currentCount, isLightMode, onIncrement, onClose }) => {
  const [count, setCount] = useState(currentCount || 0);
  const [ripples, setRipples] = useState([]);
  const [completed, setCompleted] = useState(false);
  const rippleId = useRef(0);

  // Sync count from parent when opening
  useEffect(() => {
    if (isOpen) {
      setCount(currentCount || 0);
      setCompleted(false);
    }
  }, [isOpen, currentCount]);

  const handleTap = useCallback(() => {
    if (completed) return;

    const newCount = count + 1;
    setCount(newCount);
    onIncrement(taskId, 1);

    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(15);

    // Ripple effect
    const id = rippleId.current++;
    setRipples(prev => [...prev, id]);
    setTimeout(() => setRipples(prev => prev.filter(r => r !== id)), 800);

    // Completion
    if (newCount >= target) {
      setCompleted(true);
      if (navigator.vibrate) navigator.vibrate([50, 30, 50, 30, 100]);
      setTimeout(() => onClose(), 2000);
    }
  }, [count, completed, target, taskId, onIncrement, onClose]);

  if (!isOpen) return null;

  const progress = Math.min(1, count / target);
  const remaining = Math.max(0, target - count);
  const arabicPhrase = ARABIC_PHRASES[taskId] || '';
  const accentHex = isLightMode ? '#9c7533' : '#d2a24b';

  return (
    <div 
      className="fixed inset-0 z-[150] flex flex-col items-center justify-center select-none"
      style={{ 
        background: isLightMode 
          ? 'radial-gradient(ellipse at 50% 40%, rgba(255,250,240,0.98), rgba(245,238,224,0.99))' 
          : 'radial-gradient(ellipse at 50% 40%, rgba(18,16,14,0.98), rgba(6,5,4,0.99))',
        backdropFilter: 'blur(40px)',
        touchAction: 'none',
        cursor: 'pointer',
      }}
      onPointerDown={(e) => { e.preventDefault(); if (!completed) handleTap(); }}
    >
      {/* Progress arc around the edge */}
      <div className="absolute inset-0 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <rect 
            x="1" y="1" width="98" height="98" rx="0" ry="0"
            fill="none" 
            stroke={accentHex}
            strokeWidth="0.3"
            strokeDasharray={`${progress * 396} 396`}
            strokeLinecap="round"
            className="transition-all duration-300"
            style={{ opacity: 0.4 }}
          />
        </svg>
      </div>

      {/* Ripple effects */}
      {ripples.map(id => (
        <div
          key={id}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 120, height: 120,
            left: '50%', top: '50%',
            transform: 'translate(-50%, -50%)',
            border: `1px solid ${accentHex}`,
            animation: 'misbahaRipple 0.8s ease-out forwards',
          }}
        />
      ))}

      {/* Close button */}
      <button
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        onPointerDown={(e) => e.stopPropagation()}
        className={`absolute top-12 right-8 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 z-50
          ${isLightMode ? 'text-[#4a453d]/40 hover:text-[#4a453d]/80' : 'text-white/20 hover:text-white/60'}`}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Main content */}
      <div className="flex flex-col items-center relative z-10 pointer-events-none">
        {/* Arabic phrase */}
        <span 
          className={`font-arabic text-[clamp(28px,8vw,42px)] mb-8 transition-all duration-300 ${completed ? 'scale-110' : ''}`}
          style={{ 
            color: accentHex,
            textShadow: `0 0 60px ${accentHex}40`,
            opacity: completed ? 1 : 0.7,
          }}
        >
          {arabicPhrase}
        </span>

        {/* Counter */}
        <div className="relative flex items-center justify-center mb-6">
          {/* Circular progress ring */}
          <svg className="absolute -rotate-90" width="200" height="200" viewBox="0 0 200 200">
            <circle 
              cx="100" cy="100" r="90" fill="none"
              stroke={isLightMode ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.03)'}
              strokeWidth="1" strokeDasharray="3 8"
            />
            <circle 
              cx="100" cy="100" r="90" fill="none"
              stroke={accentHex}
              strokeWidth="1.5"
              strokeDasharray={`${progress * 565.49} 565.49`}
              strokeLinecap="round"
              className="transition-all duration-300"
              style={{ opacity: 0.6 }}
            />
          </svg>
          
          <div className="flex flex-col items-center">
            <span 
              className={`font-serif-eng font-light transition-all duration-300 ${completed ? 'text-[72px]' : 'text-[64px]'}`}
              style={{ 
                color: completed ? accentHex : (isLightMode ? '#1a1814' : 'rgba(245,238,224,0.92)'),
                textShadow: completed ? `0 0 40px ${accentHex}60` : 'none',
              }}
            >
              {count}
            </span>
            {!completed && (
              <span 
                className="font-serif-eng text-[11px] uppercase tracking-[0.3em] opacity-30 mt-1"
                style={{ color: isLightMode ? '#4a453d' : '#e4dac8' }}
              >
                {remaining} left
              </span>
            )}
          </div>
        </div>

        {/* Task name */}
        <span 
          className="font-serif-eng text-[10px] uppercase tracking-[0.35em] opacity-30 mt-4"
          style={{ color: isLightMode ? '#4a453d' : '#e4dac8', marginRight: '-0.35em' }}
        >
          {taskTitle}
        </span>

        {/* Completion message */}
        {completed && (
          <div className="flex flex-col items-center mt-8 animate-[fadeInOut_2s_ease-in-out_forwards]">
            <span className="font-arabic text-[20px] opacity-60" style={{ color: accentHex }}>
              بَارَكَ اللَّهُ فِيكَ
            </span>
            <span className="font-serif-eng text-[9px] uppercase tracking-[0.3em] opacity-30 mt-2" style={{ color: isLightMode ? '#4a453d' : '#e4dac8' }}>
              May Allah bless you
            </span>
          </div>
        )}
      </div>

      {/* Tap hint at bottom */}
      {!completed && count === 0 && (
        <div className="absolute bottom-16 flex flex-col items-center animate-pulse">
          <span 
            className="font-serif-eng text-[9px] uppercase tracking-[0.25em] opacity-20"
            style={{ color: isLightMode ? '#4a453d' : '#e4dac8' }}
          >
            Tap anywhere to count
          </span>
        </div>
      )}
    </div>
  );
};
