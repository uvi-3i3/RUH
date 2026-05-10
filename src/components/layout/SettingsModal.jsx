import { useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { ChevronDownIcon, SettingsIcon } from '../icons/Icons';

export const SettingsModal = ({ isOpen, onClose, isLightMode, devotionData, prayerTimes }) => {
  const [confirmingReset, setConfirmingReset] = useState(false); // ARCH-08
  if (!isOpen) return null;

  const tTextMain = isLightMode ? 'text-[#1a1814]' : 'text-white';
  const tTextSub = isLightMode ? 'text-[#4a453d]' : 'text-[#e4dac8]';

  const handleAmbientToggle = async () => {
    devotionData.toggleAmbientMode();
    if (Capacitor.isNativePlatform()) {
      const willEnable = !devotionData.isAmbientEnabled;
      if (willEnable) {
        const p = await LocalNotifications.requestPermissions();
        if (p.display === 'granted') {
          await LocalNotifications.schedule({
            notifications: [{
              title: "Ruh Companion",
              body: "Take a breath. Remember your intention.",
              id: 99,
              schedule: { allowWhileIdle: true, on: { hour: 10, minute: 0 } },
              sound: null
            }]
          });
        }
      } else {
        await LocalNotifications.cancel({ notifications: [{ id: 99 }] });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col pointer-events-auto">
      {/* Heavy Frost Backdrop */}
      <div 
        className="absolute inset-0 transition-opacity duration-700"
        style={{ 
          background: isLightMode ? 'rgba(255,255,255,0.7)' : 'rgba(10,9,8,0.85)',
          backdropFilter: 'blur(30px) saturate(1.5)',
          WebkitBackdropFilter: 'blur(30px) saturate(1.5)',
          opacity: isOpen ? 1 : 0 
        }} 
        onClick={onClose}
      />
      
      {/* Content Container */}
      <div 
        className="relative z-10 w-full h-full flex flex-col pt-16 px-6 pb-20 items-center overflow-y-auto hide-scrollbar"
        style={{
          transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.98)',
          opacity: isOpen ? 1 : 0,
          transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1)'
        }}
      >
        {/* Header */}
        <div className="flex flex-col items-center mb-12">
          <SettingsIcon size={32} className={`mb-4 opacity-80 ${isLightMode ? 'text-[#9c7533]' : 'text-[#d2a24b]'}`} />
          <span className={`font-arabic text-3xl mb-2 opacity-90 ${tTextMain}`}>الإعدادات</span>
          <span className={`font-serif-eng text-xs uppercase tracking-[0.3em] ${tTextSub} opacity-70`}>Settings</span>
        </div>

        {/* Options List */}
        <div className="w-full max-w-[340px] flex flex-col gap-6">

          {/* Ambient Companion Card */}
          <div className={`w-full p-6 rounded-[24px] border flex flex-col gap-4 ${isLightMode ? 'bg-[#0d9488]/5 border-[#0d9488]/20 shadow-sm' : 'bg-[#14b8a6]/5 border-[#14b8a6]/20 shadow-lg'}`}>
            <div className="flex justify-between items-center">
              <span className={`font-serif-eng text-lg ${isLightMode ? 'text-[#0d9488]' : 'text-[#14b8a6]'}`}>Ambient OS Companion</span>
              <button 
                onClick={handleAmbientToggle}
                className={`w-12 h-6 rounded-full transition-all duration-500 flex items-center px-1 ${devotionData.isAmbientEnabled ? (isLightMode ? 'bg-[#0d9488]' : 'bg-[#14b8a6]') : (isLightMode ? 'bg-black/10' : 'bg-white/10')}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-500 ${devotionData.isAmbientEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
            <p className={`font-serif-eng text-xs leading-relaxed opacity-60 ${tTextSub}`}>
              Reveals rotating dhikr phrases softly within the app, and on native platforms, schedules a gentle, silent spiritual nudge on your lock screen at 10 AM.
            </p>
          </div>
          
          {/* Simple Language Card */}
          <div className={`w-full p-6 rounded-[24px] border flex flex-col gap-4 ${isLightMode ? 'bg-white/60 border-white/80 shadow-sm' : 'bg-white/5 border-white/10 shadow-lg'}`}>
            <div className="flex justify-between items-center">
              <span className={`font-serif-eng text-lg ${tTextMain}`}>Simple Language</span>
              <button 
                onClick={devotionData.toggleSimpleMode}
                className={`w-12 h-6 rounded-full transition-all duration-500 flex items-center px-1 ${devotionData.isSimpleMode ? (isLightMode ? 'bg-[#9c7533]' : 'bg-[#d2a24b]') : (isLightMode ? 'bg-black/10' : 'bg-white/10')}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-500 ${devotionData.isSimpleMode ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
            <p className={`font-serif-eng text-xs leading-relaxed opacity-60 ${tTextSub}`}>
              Transforms deep theological language into accessible English across all verses and proofs.
            </p>
          </div>

          {/* FEAT-02: Prayer Calculation Method Card */}
          <div className={`w-full p-6 rounded-[24px] border flex flex-col gap-4 ${isLightMode ? 'bg-white/60 border-white/80 shadow-sm' : 'bg-white/5 border-white/10 shadow-lg'}`}>
            <div className="flex justify-between items-center">
              <span className={`font-serif-eng text-lg ${tTextMain}`}>Prayer Times</span>
              {prayerTimes?.hasLocation && (
                <span className={`font-serif-eng text-[9px] uppercase tracking-widest ${isLightMode ? 'text-[#0d9488]' : 'text-[#14b8a6]'} opacity-70`}>● Live</span>
              )}
            </div>
            <p className={`font-serif-eng text-xs leading-relaxed opacity-60 ${tTextSub}`}>
              {prayerTimes?.hasLocation 
                ? 'Auto-detected from your location. Choose the calculation method used in your region.' 
                : prayerTimes?.locationLoading 
                  ? 'Detecting location...' 
                  : 'Location access needed for prayer times.'}
            </p>
            {!prayerTimes?.hasLocation && !prayerTimes?.locationLoading && (
              <button 
                onClick={() => prayerTimes?.requestLocation()}
                className={`font-serif-eng text-[10px] uppercase tracking-widest px-4 py-2 rounded-full border transition-all hover:scale-105 self-start
                  ${isLightMode ? 'border-[#9c7533]/40 text-[#9c7533]' : 'border-[#d2a24b]/40 text-[#d2a24b]'}`}
              >
                Enable Location
              </button>
            )}
            {prayerTimes?.hasLocation && (
              <select 
                value={prayerTimes?.method || 'MoonsightingCommittee'} 
                onChange={(e) => prayerTimes?.setMethod(e.target.value)}
                className={`font-serif-eng text-xs px-3 py-2 rounded-xl border outline-none transition-all cursor-pointer appearance-none
                  ${isLightMode ? 'bg-white/80 border-black/10 text-[#1a1814]' : 'bg-white/5 border-white/10 text-white'}`}
              >
                <option value="MoonsightingCommittee">Moonsighting Committee</option>
                <option value="NorthAmerica">ISNA (North America)</option>
                <option value="MuslimWorldLeague">Muslim World League</option>
                <option value="Egyptian">Egyptian Authority</option>
                <option value="UmmAlQura">Umm Al-Qura (Saudi)</option>
                <option value="Karachi">University of Karachi</option>
                <option value="Dubai">Dubai / UAE</option>
                <option value="Qatar">Qatar</option>
                <option value="Kuwait">Kuwait</option>
                <option value="Singapore">Singapore / SE Asia</option>
              </select>
            )}
          </div>

          {/* Reset Progress Card */}
          <div className={`w-full p-6 rounded-[24px] border flex flex-col gap-4 ${isLightMode ? 'bg-[#4a0000]/5 border-[#4a0000]/10' : 'bg-[#ff4444]/5 border-[#ff4444]/10'}`}>
            <div className="flex justify-between items-center">
              <span className={`font-serif-eng text-lg ${isLightMode ? 'text-[#8a0000]' : 'text-[#ff6b6b]'}`}>Reset Journey</span>
            </div>
            <p className={`font-serif-eng text-xs leading-relaxed opacity-60 ${tTextSub}`}>
              Permanently wipe all progress, unlocked stations, saved verses, and daily streaks. This cannot be undone.
            </p>
            <button 
              onClick={() => {
                if (confirmingReset) {
                  devotionData.resetData();
                  setConfirmingReset(false);
                  onClose();
                } else {
                  setConfirmingReset(true);
                  setTimeout(() => setConfirmingReset(false), 3000);
                }
              }}
              className={`mt-2 py-3 w-full rounded-xl font-serif-eng uppercase text-[10px] tracking-widest border transition-colors ${isLightMode ? 'text-[#8a0000] border-[#8a0000]/20 hover:bg-[#8a0000]/10' : 'text-[#ff6b6b] border-[#ff6b6b]/20 hover:bg-[#ff6b6b]/10'}`}
            >
              {confirmingReset ? 'Tap Again to Confirm ⚠️' : 'Wipe Data'}
            </button>
          </div>

          <div className="flex justify-center mt-8">
            <span className={`font-serif-eng text-[10px] uppercase tracking-widest opacity-30 ${tTextSub}`}>Ruh v{import.meta.env.VITE_APP_VERSION || '1.0'} • Native Wrapper</span>
          </div>

        </div>

        {/* Floating Close Button */}
        <button 
          onClick={onClose}
          className={`absolute bottom-[50px] w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-md border transition-all duration-500 hover:scale-110
            ${isLightMode ? 'bg-white/80 border-black/5 text-[#4a453d] shadow-lg' : 'bg-[#1a1c1e]/60 border-white/10 text-white shadow-xl'}`}
        >
          <ChevronDownIcon size={24} />
        </button>
      </div>
    </div>
  );
};
