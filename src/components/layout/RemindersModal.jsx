import React, { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { ChevronDownIcon, BellIcon, TrashIcon, PlusIcon } from '../icons/Icons';
import { PRAYERS } from '../../data/constants';

export const RemindersModal = ({ isOpen, onClose, isLightMode, devotionData }) => {
  if (!isOpen) return null;

  const tTextMain = isLightMode ? 'text-[#1a1814]' : 'text-white';
  const tTextSub = isLightMode ? 'text-[#4a453d]' : 'text-[#e4dac8]';
  const accentHex = isLightMode ? '#9c7533' : '#d2a24b';

  const [hasPermission, setHasPermission] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customTime, setCustomTime] = useState('09:00');
  // UX-05: Scheduling feedback state
  const [feedback, setFeedback] = useState({}); // { [prayerId]: 'success' | 'error' }

  const showFeedback = (id, status) => {
    setFeedback(prev => ({ ...prev, [id]: status }));
    setTimeout(() => setFeedback(prev => { const n = { ...prev }; delete n[id]; return n; }), 2000);
  };

  // Check hardware permissions when modal opens
  useEffect(() => {
    if (isOpen && Capacitor.isNativePlatform()) {
      LocalNotifications.checkPermissions().then(res => {
        setHasPermission(res.display === 'granted');
      });
    }
  }, [isOpen]);

  const ensurePermissions = async () => {
    if (!Capacitor.isNativePlatform()) {
      alert("Native Push Notifications are only available on the mobile application.");
      return false;
    }
    if (!hasPermission) {
      const res = await LocalNotifications.requestPermissions();
      if (res.display !== 'granted') {
        alert("Please enable notification permissions in your phone settings to schedule devotion reminders.");
        return false;
      }
      setHasPermission(true);
    }
    return true;
  };

  const scheduleNativeNotification = async (id, title, body, timeString) => {
    if (!Capacitor.isNativePlatform() || !timeString) return;
    const [hour, minute] = timeString.split(':').map(Number);
    // Cancel potential existing first
    await LocalNotifications.cancel({ notifications: [{ id }] });
    await LocalNotifications.schedule({
      notifications: [{
        title,
        body,
        id,
        schedule: { allowWhileIdle: true, on: { hour, minute } },
        sound: null
      }]
    });
  };

  const cancelNativeNotification = async (id) => {
    if (!Capacitor.isNativePlatform()) return;
    await LocalNotifications.cancel({ notifications: [{ id }] });
  };

  const handlePrayerToggle = async (prayerId, currentState, currentTime) => {
    const canProceed = await ensurePermissions();
    if (!canProceed) return;

    devotionData.togglePrayerReminder(prayerId);
    
    const isNowEnabled = !currentState;
    // Map prayer keys to native notification IDs 1-5
    const idMap = { fajr: 1, dhuhr: 2, asr: 3, maghrib: 4, isha: 5 };
    const notifId = idMap[prayerId];
    
    if (isNowEnabled) {
      const p = PRAYERS.find(p => p.id === prayerId);
      try {
        await scheduleNativeNotification(notifId, `${p.label} Prayer`, `It is time to center your soul for ${p.label}.`, currentTime);
        showFeedback(prayerId, 'success');
      } catch { showFeedback(prayerId, 'error'); }
    } else {
      await cancelNativeNotification(notifId);
      showFeedback(prayerId, 'success');
    }
  };

  const handlePrayerTimeChange = async (prayerId, newTime, currentState) => {
    devotionData.updatePrayerTime(prayerId, newTime);
    if (currentState) {
      const idMap = { fajr: 1, dhuhr: 2, asr: 3, maghrib: 4, isha: 5 };
      const p = PRAYERS.find(p => p.id === prayerId);
      await scheduleNativeNotification(idMap[prayerId], `${p.label} Prayer`, `It is time to center your soul for ${p.label}.`, newTime);
    }
  };

  // --- CUSTOM REMINDERS LOGIC ---
  const handleAddCustom = async () => {
    if (!customTitle.trim()) return;
    const canProceed = await ensurePermissions();
    if (!canProceed) return;

    const newIdStr = devotionData.addCustomReminder(customTitle, customTime);
    // Hash string ID into integer for Capacitor ID by picking last numeric parts
    const numericId = parseInt(newIdStr.replace(/[^0-9]/g, '').slice(-8), 10);
    
    await scheduleNativeNotification(numericId, customTitle, `Your personal devotion reminder for ${customTitle}.`, customTime);
    
    setCustomTitle('');
  };

  const handleCustomToggle = async (cr) => {
    const canProceed = await ensurePermissions();
    if (!canProceed) return;

    devotionData.toggleCustomReminder(cr.id);
    const isNowEnabled = !cr.enabled;
    const numericId = parseInt(cr.id.replace(/[^0-9]/g, '').slice(-8), 10);

    if (isNowEnabled) {
      await scheduleNativeNotification(numericId, cr.title, `Your personal devotion reminder for ${cr.title}.`, cr.time);
    } else {
      await cancelNativeNotification(numericId);
    }
  };

  const handleCustomDelete = async (cr) => {
    devotionData.deleteCustomReminder(cr.id);
    const numericId = parseInt(cr.id.replace(/[^0-9]/g, '').slice(-8), 10);
    await cancelNativeNotification(numericId);
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col pointer-events-auto">
      <div 
        className="absolute inset-0 transition-opacity duration-700"
        style={{ 
          background: isLightMode ? 'rgba(255,255,255,0.75)' : 'rgba(10,9,8,0.92)',
          backdropFilter: 'blur(30px) saturate(1.5)',
          WebkitBackdropFilter: 'blur(30px) saturate(1.5)',
          opacity: isOpen ? 1 : 0 
        }} 
        onClick={onClose}
      />
      
      <div 
        className="relative z-10 w-full h-full flex flex-col pt-16 px-6 pb-24 items-center overflow-y-auto hide-scrollbar"
        style={{
          transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.98)',
          opacity: isOpen ? 1 : 0,
          transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1)'
        }}
      >
        <div className="flex flex-col items-center mb-10 shrink-0">
          <div className="relative mb-4">
             <BellIcon size={32} className={`opacity-80 ${isLightMode ? 'text-[#9c7533]' : 'text-[#d2a24b]'}`} />
          </div>
          <span className={`font-arabic text-3xl mb-2 opacity-90 ${tTextMain}`}>التذكير</span>
          <span className={`font-serif-eng text-xs uppercase tracking-[0.3em] ${tTextSub} opacity-70`}>Reminders</span>
        </div>

        <div className="w-full max-w-[340px] flex flex-col gap-8">
          
          {/* THE 5 PRAYERS COMPONENT */}
          <div className="flex flex-col gap-3">
             <div className="flex items-center gap-2 mb-2 px-2">
                 <div className={`w-8 h-[1px] opacity-30 ${tTextSub} bg-current`} />
                 <span className={`font-serif-eng uppercase tracking-widest text-[10px] opacity-60 ${tTextSub}`}>The Foundation</span>
             </div>
             
             <div className={`w-full rounded-[24px] border overflow-hidden ${isLightMode ? 'bg-white/60 border-white/80 shadow-sm' : 'bg-white/5 border-white/10 shadow-lg'}`}>
                {PRAYERS.map((p, idx) => {
                  const stateObj = devotionData.prayers[p.id] || { enabled: false, time: '00:00' };
                  return (
                    <div key={p.id} className={`flex items-center justify-between p-4 px-5 ${idx !== PRAYERS.length -1 ? 'border-b' : ''} ${isLightMode ? 'border-[#1a1814]/5' : 'border-white/5'}`}>
                      <div className="flex flex-col gap-1">
                        <span className={`font-serif-eng text-lg ${tTextMain}`}>{p.label}</span>
                        {/* Native Time Input */}
                        <div className={`relative ${stateObj.enabled ? 'opacity-100' : 'opacity-40 pointer-events-none'} transition-opacity`}>
                          <input 
                            type="time" 
                            value={stateObj.time}
                            onChange={(e) => handlePrayerTimeChange(p.id, e.target.value, stateObj.enabled)}
                            className={`bg-transparent outline-none font-serif-eng text-xs tracking-wider ${isLightMode ? 'text-[#9c7533]' : 'text-[#d2a24b]'} cursor-pointer`}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {feedback[p.id] && (
                          <span className={`text-xs transition-opacity duration-500 ${feedback[p.id] === 'success' ? 'text-green-500' : 'text-red-400'}`}>
                            {feedback[p.id] === 'success' ? '✓' : '⚠'}
                          </span>
                        )}
                        <button 
                          onClick={() => handlePrayerToggle(p.id, stateObj.enabled, stateObj.time)}
                          className={`w-12 h-6 rounded-full transition-all duration-500 flex items-center px-1 ${stateObj.enabled ? (isLightMode ? 'bg-[#9c7533]' : 'bg-[#d2a24b]') : (isLightMode ? 'bg-black/10' : 'bg-white/10')}`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-500 ${stateObj.enabled ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                      </div>
                    </div>
                  )
                })}
             </div>
          </div>

          {/* DYNAMIC CUSTOM REMINDERS */}
          <div className="flex flex-col gap-3">
             <div className="flex items-center gap-2 mb-2 px-2">
                 <div className={`w-8 h-[1px] opacity-30 ${tTextSub} bg-current`} />
                 <span className={`font-serif-eng uppercase tracking-widest text-[10px] opacity-60 ${tTextSub}`}>Personal Devotion</span>
             </div>

             {/* Builder */}
             <div className={`w-full p-2 px-3 rounded-full border flex items-center justify-between ${isLightMode ? 'bg-white/60 border-[#1a1814]/10 shadow-sm' : 'bg-white/5 border-white/10'}`}>
               <input 
                 type="text" 
                 placeholder="e.g. Salawat, Dhikr"
                 value={customTitle}
                 onChange={e => setCustomTitle(e.target.value)}
                 className={`flex-grow bg-transparent outline-none px-3 font-serif-eng placeholder-current opacity-80 ${tTextMain}`} 
               />
               <div className="flex items-center gap-2 border-l border-current opacity-60 pl-3">
                 <input 
                    type="time" 
                    value={customTime}
                    onChange={(e) => setCustomTime(e.target.value)}
                    className="bg-transparent outline-none font-serif-eng text-xs w-[60px]"
                 />
               </div>
               <button onClick={handleAddCustom} className={`w-8 h-8 flex items-center justify-center rounded-full ml-2 transition-all ${customTitle ? (isLightMode ? 'bg-[#1a1814] text-white' : 'bg-white/20 text-white hover:bg-white/30') : 'opacity-20 pointer-events-none'}`}>
                 <PlusIcon size={16} />
               </button>
             </div>

             {/* Custom List */}
             {devotionData.customReminders.length > 0 && (
               <div className="flex flex-col gap-3 mt-2">
                 {devotionData.customReminders.map(cr => (
                   <div key={cr.id} className={`w-full p-4 px-5 rounded-[20px] border flex justify-between items-center ${isLightMode ? 'bg-white/40 border-[#1a1814]/5' : 'bg-white/5 border-white/10'}`}>
                     <div className="flex flex-col gap-1">
                        <span className={`font-serif-eng text-lg ${tTextMain}`}>{cr.title}</span>
                        <span className={`font-serif-eng text-xs tracking-wider opacity-60 ${tTextSub}`}>{cr.time}</span>
                     </div>
                     <div className="flex items-center gap-4">
                        <button onClick={() => handleCustomDelete(cr)} className="opacity-40 hover:opacity-100 transition-opacity text-red-500">
                          <TrashIcon size={16} />
                        </button>
                        <button 
                          onClick={() => handleCustomToggle(cr)}
                          className={`w-12 h-6 rounded-full transition-all duration-500 flex items-center px-1 ${cr.enabled ? (isLightMode ? 'bg-[#9c7533]' : 'bg-[#d2a24b]') : (isLightMode ? 'bg-black/10' : 'bg-white/10')}`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-500 ${cr.enabled ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                     </div>
                   </div>
                 ))}
               </div>
             )}
          </div>

        </div>

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
