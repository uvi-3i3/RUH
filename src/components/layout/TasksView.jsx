import { useState, useRef } from 'react';
import { BookIcon, CheckCircleIcon, ChevronRightIcon } from '../icons/Icons';
import { burhanData } from '../../data/burhanData';
import { MisbahaMode } from './MisbahaMode';

const DHIKR_TASKS = [
  { id: 'istighfar', title: 'Istighfar', subtitle: 'Astaghfirullah', target: 100 },
  { id: 'subhanallah', title: 'Tasbih', subtitle: 'Subhanallah', target: 33 },
  { id: 'alhamdulillah', title: 'Tahmid', subtitle: 'Alhamdulillah', target: 33 },
  { id: 'allahu_akbar', title: 'Takbir', subtitle: 'Allahu Akbar', target: 34 }
];

export const TasksView = ({ currentView, isLightMode, dailyTasks, incrementTask, activeDays, onOpenBurhan }) => {
  const tTextMain = isLightMode ? 'text-[#1a1814]' : 'text-[rgba(245,238,224,0.92)]';
  const tTextSub = isLightMode ? 'text-[#4a453d]' : 'text-[rgba(228,218,200,0.48)]';
  const accentColor = isLightMode ? '#0d9488' : '#14b8a6';

  const longPressTimer = useRef(null);
  const [misbahaTask, setMisbahaTask] = useState(null); // FEAT-09

  const startPress = (id, current, target) => {
    if (current >= target) return;
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10);
    
    // FEAT-09: Long-press opens Misbaha mode instead of auto-fill
    longPressTimer.current = setTimeout(() => {
      const task = DHIKR_TASKS.find(t => t.id === id);
      setMisbahaTask(task);
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
      className="absolute inset-0 flex flex-col items-center justify-start transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] w-full overflow-y-auto hide-scrollbar pt-12 pb-24"
      style={{ 
        opacity: currentView === 'tasks' ? 1 : 0, 
        transform: currentView === 'tasks' ? 'scale(1)' : 'scale(1.02)',
        pointerEvents: currentView === 'tasks' ? 'auto' : 'none',
        zIndex: 10
      }}
    >
      <div className="w-full max-w-[340px] px-4 flex flex-col items-center gap-5 mt-4">
        
        {/* Header */}
        <div className="w-full flex justify-between items-center mb-2 px-2">
           <span className={`font-arabic text-[18px] ${tTextMain} opacity-40 transition-colors duration-1000 tracking-wide`}>الورد</span>
           <span className={`font-serif-eng text-[10px] uppercase tracking-widest ${isLightMode ? 'text-[#9c7533]' : 'text-[#d2a24b]'}`}>Daily Dhikr</span>
        </div>

        <div className="grid grid-cols-2 gap-3 w-full">
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
               className={`relative w-full h-[95px] rounded-3xl overflow-hidden backdrop-blur-md border transition-all duration-500 ease-out ${!isComplete ? 'cursor-pointer active:scale-[0.97]' : ''}
                 ${isLightMode 
                   ? (isComplete ? 'bg-[#9c7533]/15 border-[#9c7533]/40' : 'bg-white/40 hover:bg-white/60 border-white/60') 
                   : (isComplete ? 'bg-[#d2a24b]/15 border-[#d2a24b]/40' : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/10')
                 }`}
               style={{ touchAction: 'none' }}
             >
                {/* Progress Fill Background */}
                <div 
                  className={`absolute left-0 top-0 bottom-0 transition-all duration-300 ${isLightMode ? 'bg-black/[0.03]' : 'bg-white/[0.05]'}`} 
                  style={{ width: `${progress * 100}%` }} 
                />
                
                {/* Content */}
                <div className="absolute inset-0 p-5 flex items-center justify-between pointer-events-none">
                  <div className="flex flex-col">
                    <span className={`font-serif-eng text-lg font-medium tracking-wide ${tTextMain}`}>{task.title}</span>
                    <span className={`font-serif-eng text-[11px] italic mt-1 ${tTextSub}`}>{task.subtitle}</span>
                  </div>
                  
                  <div className="flex items-center">
                    {isComplete ? (
                      <CheckCircleIcon size={24} className={`${isLightMode ? 'text-[#9c7533]' : 'text-[#d2a24b]'} drop-shadow-md animate-[checkmarkPop_0.4s_cubic-bezier(0.34,1.56,0.64,1)_forwards]`} />
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <span className={`font-serif-eng text-2xl font-light ${tTextMain}`}>{count}</span>
                        <span className={`font-serif-eng text-[10px] opacity-50 ${tTextMain}`}>/ {task.target}</span>
                      </div>
                    )}
                  </div>
                </div>
             </div>
           )
        })}
        </div>

        {/* --- INTELLECTUAL DEVOTION SECTION --- */}
        <div className="w-full flex justify-between items-center mt-10 mb-2 px-2">
           <span className={`font-arabic text-[18px] ${tTextMain} opacity-40 transition-colors duration-1000 tracking-wide`}>برهان</span>
           <span className={`font-serif-eng text-[10px] uppercase tracking-widest`} style={{ color: accentColor }}>Daily Hikmah</span>
        </div>

        {(() => {
          const currentBurhan = burhanData[activeDays % burhanData.length];
          const isBurhanComplete = dailyTasks?.burhanCompleted;
          
          return (
            <div 
               onClick={onOpenBurhan}
               className={`relative w-full p-5 rounded-3xl overflow-hidden backdrop-blur-md border transition-all duration-500 ease-out cursor-pointer active:scale-[0.97]
                 ${isLightMode 
                   ? (isBurhanComplete ? 'bg-[#0d9488]/10 border-[#0d9488]/30' : 'bg-white/40 hover:bg-white/60 border-white/60') 
                   : (isBurhanComplete ? 'bg-[#14b8a6]/10 border-[#14b8a6]/30' : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/10')
                 }`}
               style={{ touchAction: 'none' }}
             >
                <div className="absolute top-4 right-4 opacity-50">
                   <BookIcon size={120} className={isLightMode ? 'text-black/5' : 'text-white/5'} />
                </div>
                
                <div className="relative z-10 flex flex-col justify-between h-full min-h-[90px]">
                  <div className="flex flex-col mb-4">
                    <span className={`font-serif-eng text-lg font-medium tracking-wide leading-snug mb-1 ${tTextMain}`}>{currentBurhan.title}</span>
                    <span className={`font-serif-eng text-[10px] uppercase tracking-[0.2em] opacity-60 ${tTextMain}`}>— {currentBurhan.scholar}</span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-auto">
                    {isBurhanComplete ? (
                      <div className="flex items-center gap-2">
                        <CheckCircleIcon size={18} className="animate-[checkmarkPop_0.4s_cubic-bezier(0.34,1.56,0.64,1)_forwards]" style={{ color: accentColor }} />
                        <span className={`font-serif-eng text-[10px] uppercase tracking-widest font-medium`} style={{ color: accentColor }}>Reflected</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                        <span className={`font-serif-eng text-[10px] uppercase tracking-widest ${tTextSub}`}>Read Proof</span>
                        <ChevronRightIcon size={14} className={tTextSub} />
                      </div>
                    )}
                  </div>
                </div>
             </div>
          );
        })()}
        {/* FEAT-09: Full-Screen Misbaha Mode */}
        {misbahaTask && (
          <MisbahaMode
            isOpen={!!misbahaTask}
            taskId={misbahaTask.id}
            taskTitle={misbahaTask.title}
            target={misbahaTask.target}
            currentCount={dailyTasks[misbahaTask.id] || 0}
            isLightMode={isLightMode}
            onIncrement={incrementTask}
            onClose={() => setMisbahaTask(null)}
          />
        )}
      </div>
    </div>
  )
};
