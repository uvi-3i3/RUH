import { useRef } from 'react';

const DHIKR_TASKS = [
  { id: 'istighfar', title: 'Istighfar', target: 100 },
  { id: 'subhanallah', title: 'Tasbih', target: 33 },
  { id: 'alhamdulillah', title: 'Tahmid', target: 33 },
  { id: 'allahu_akbar', title: 'Takbir', target: 34 }
];

export const TasksSideColumn = ({ isVisible, isLightMode, dailyTasks, incrementTask }) => {
  const tTextMain = isLightMode ? 'text-[#1a1814]' : 'text-[rgba(245,238,224,0.92)]';
  const longPressTimer = useRef(null);

  const startPress = (id, current, target) => {
    if (current >= target) return;
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10);
    
    longPressTimer.current = setTimeout(() => {
      incrementTask(id, target - current);
      longPressTimer.current = null;
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(40);
    }, 600);
  };

  const endPress = (id, current, target) => {
    if (current >= target) return;
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
      incrementTask(id, 1);
    }
  };

  return (
    <div 
      className="absolute inset-0 w-full flex flex-col items-center justify-center gap-4 transition-all duration-[2000ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
        pointerEvents: isVisible ? 'auto' : 'none',
        zIndex: 25
      }}
    >
      <span className={`font-arabic text-[12px] opacity-30 mb-2 ${tTextMain}`}>الورد</span>
      
      {DHIKR_TASKS.map(task => {
        const count = dailyTasks[task.id] || 0;
        const progress = Math.min(1, count / task.target);
        const isComplete = count >= task.target;
        
        return (
          <div 
            key={task.id}
            onPointerDown={() => startPress(task.id, count, task.target)}
            onPointerUp={() => endPress(task.id, count, task.target)}
            onPointerLeave={() => {
              if (longPressTimer.current) {
                clearTimeout(longPressTimer.current);
                longPressTimer.current = null;
              }
            }}
            className="flex flex-col items-center justify-center w-full group cursor-pointer"
            style={{ touchAction: 'none' }}
          >
             {/* Progress Arc/Circle */}
             <div className="relative w-10 h-10 md:w-12 md:h-12 flex items-center justify-center mb-1">
               <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 40 40">
                  <circle cx="20" cy="20" r="18" fill="none" stroke={isLightMode ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'} strokeWidth="1" />
                  <circle cx="20" cy="20" r="18" fill="none" stroke={isLightMode ? '#9c7533' : '#d2a24b'} strokeWidth="1.5" strokeDasharray="113.097" strokeDashoffset={113.097 * (1 - progress)} strokeLinecap="round" className="transition-all duration-300 ease-out" />
               </svg>
               <span className={`font-serif-eng text-[10px] md:text-[11px] font-light transition-opacity duration-300 ${isComplete ? 'opacity-40' : 'opacity-80 group-hover:opacity-100'} ${tTextMain}`}>
                 {count}
               </span>
             </div>
             <span className={`font-serif-eng text-[7px] md:text-[8px] uppercase tracking-widest text-center transition-all duration-300 ${isComplete ? (isLightMode ? 'text-[#9c7533] opacity-80' : 'text-[#d2a24b] opacity-80') : `opacity-40 group-hover:opacity-100 ${tTextMain}`}`}>
               {task.title}
             </span>
          </div>
        )
      })}
    </div>
  );
};
