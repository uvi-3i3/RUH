import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { ChevronDownIcon, BellIcon, TrashIcon, PlusIcon } from '../icons/Icons';
import { PRAYERS } from '../../data/constants';

export const RemindersModal = ({ isOpen, onClose, isLightMode, devotionData }) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customTime, setCustomTime] = useState('09:00');
  const [feedback, setFeedback] = useState({});
  const [statusNotice, setStatusNotice] = useState('');

  useEffect(() => {
    if (isOpen && Capacitor.isNativePlatform()) {
      LocalNotifications.checkPermissions().then((res) => {
        setHasPermission(res.display === 'granted');
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const tTextMain = isLightMode ? 'text-[#1a1814]' : 'text-[rgba(245,238,224,0.94)]';
  const tTextSub = isLightMode ? 'text-[#4a453d]' : 'text-[#e4dac8]';
  const accentHex = isLightMode ? '#9c7533' : '#d2a24b';

  const showFeedback = (id, status) => {
    setFeedback((prev) => ({ ...prev, [id]: status }));
    setTimeout(
      () =>
        setFeedback((prev) => {
          const n = { ...prev };
          delete n[id];
          return n;
        }),
      2000
    );
  };

  const ensurePermissions = async () => {
    if (!Capacitor.isNativePlatform()) {
      setStatusNotice('Schedule saved in Sanctuary. Native lock-screen alerts activate automatically on iOS & Android.');
      return true;
    }
    if (!hasPermission) {
      const res = await LocalNotifications.requestPermissions();
      if (res.display !== 'granted') {
        setStatusNotice('Please enable notification permissions in your device settings.');
        return false;
      }
      setHasPermission(true);
    }
    return true;
  };

  const scheduleNativeNotification = async (id, title, body, timeString) => {
    if (!Capacitor.isNativePlatform() || !timeString) return;
    const [hour, minute] = timeString.split(':').map(Number);
    await LocalNotifications.cancel({ notifications: [{ id }] });
    await LocalNotifications.schedule({
      notifications: [
        {
          title,
          body,
          id,
          schedule: { allowWhileIdle: true, on: { hour, minute } },
          sound: null,
        },
      ],
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
    const idMap = { fajr: 1, dhuhr: 2, asr: 3, maghrib: 4, isha: 5 };
    const notifId = idMap[prayerId];

    if (isNowEnabled) {
      const p = PRAYERS.find((item) => item.id === prayerId);
      try {
        await scheduleNativeNotification(
          notifId,
          `${p.label} Prayer`,
          `It is time to center your soul for ${p.label}.`,
          currentTime
        );
        showFeedback(prayerId, 'success');
      } catch {
        showFeedback(prayerId, 'error');
      }
    } else {
      await cancelNativeNotification(notifId);
      showFeedback(prayerId, 'success');
    }
  };

  const handlePrayerTimeChange = async (prayerId, newTime, currentState) => {
    devotionData.updatePrayerTime(prayerId, newTime);
    if (currentState) {
      const idMap = { fajr: 1, dhuhr: 2, asr: 3, maghrib: 4, isha: 5 };
      const p = PRAYERS.find((item) => item.id === prayerId);
      await scheduleNativeNotification(
        idMap[prayerId],
        `${p.label} Prayer`,
        `It is time to center your soul for ${p.label}.`,
        newTime
      );
    }
  };

  const handleAddCustom = async (e) => {
    if (e) e.preventDefault();
    if (!customTitle.trim()) return;
    const canProceed = await ensurePermissions();
    if (!canProceed) return;

    const newIdStr = devotionData.addCustomReminder(customTitle.trim(), customTime);
    const numericId = parseInt(newIdStr.replace(/[^0-9]/g, '').slice(-8), 10);
    await scheduleNativeNotification(
      numericId,
      customTitle.trim(),
      `Your personal devotion reminder for ${customTitle.trim()}.`,
      customTime
    );
    setCustomTitle('');
  };

  const handleCustomToggle = async (cr) => {
    const canProceed = await ensurePermissions();
    if (!canProceed) return;

    devotionData.toggleCustomReminder(cr.id);
    const isNowEnabled = !cr.enabled;
    const numericId = parseInt(cr.id.replace(/[^0-9]/g, '').slice(-8), 10);

    if (isNowEnabled) {
      await scheduleNativeNotification(
        numericId,
        cr.title,
        `Your personal devotion reminder for ${cr.title}.`,
        cr.time
      );
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
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Prayer & Devotion Reminders"
      className="fixed inset-0 z-[100] flex flex-col pointer-events-auto"
    >
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          background: isLightMode ? 'rgba(244,240,232,0.94)' : 'rgba(8,7,6,0.95)',
          backdropFilter: 'blur(24px)',
        }}
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-xl mx-auto h-full flex flex-col">
        {/* Sticky Top Header */}
        <div className="w-full flex items-center justify-between px-6 pt-8 pb-4 border-b border-current/10 shrink-0">
          <div className="flex items-center gap-3">
            <BellIcon size={22} style={{ color: accentHex }} />
            <div>
              <h2 className={`font-serif-eng text-lg font-medium uppercase tracking-[0.2em] ${tTextMain}`}>
                Sacred Reminders
              </h2>
              <span className={`font-calligraphy text-sm opacity-70 ${tTextSub}`} dir="rtl">التذكير اليومي</span>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close Reminders"
            onClick={onClose}
            className={`w-11 h-11 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
              isLightMode ? 'bg-white/70 border-black/10 text-[#4a453d]' : 'bg-white/5 border-white/10 text-white'
            }`}
          >
            <ChevronDownIcon size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 w-full overflow-y-auto hide-scrollbar px-6 py-6 flex flex-col gap-6">
          {statusNotice && (
            <div
              className={`w-full px-4 py-3 rounded-2xl border font-serif-eng text-xs leading-relaxed ${
                isLightMode
                  ? 'bg-[#9c7533]/10 border-[#9c7533]/30 text-[#1a1814]'
                  : 'bg-[#d2a24b]/10 border-[#d2a24b]/30 text-[#f5eee0]'
              }`}
            >
              {statusNotice}
            </div>
          )}

          {/* THE 5 PRAYERS */}
          <div className="flex flex-col gap-3">
            <span className={`font-serif-eng uppercase tracking-[0.2em] text-xs opacity-70 px-1 ${tTextSub}`}>
              01. The Five Pillars
            </span>

            <div
              className={`w-full rounded-3xl border overflow-hidden ${
                isLightMode ? 'bg-white/70 border-black/10 shadow-xs' : 'bg-white/[0.03] border-white/10'
              }`}
            >
              {PRAYERS.map((p, idx) => {
                const stateObj = devotionData.prayers[p.id] || { enabled: false, time: '05:00' };
                return (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between p-4 px-5 ${
                      idx !== PRAYERS.length - 1 ? 'border-b' : ''
                    } ${isLightMode ? 'border-black/5' : 'border-white/5'}`}
                  >
                    <div className="flex items-center gap-4">
                      <span className={`font-serif-eng text-lg min-w-[80px] ${tTextMain}`}>{p.label}</span>
                      <input
                        type="time"
                        aria-label={`${p.label} reminder time`}
                        value={stateObj.time}
                        onChange={(e) => handlePrayerTimeChange(p.id, e.target.value, stateObj.enabled)}
                        className={`bg-transparent outline-none font-serif-eng text-xs tabular-nums tracking-wider px-2 py-1 rounded-lg border ${
                          isLightMode
                            ? 'text-[#9c7533] border-black/10'
                            : 'text-[#d2a24b] border-white/10'
                        } cursor-pointer`}
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      {feedback[p.id] && (
                        <span className="font-serif-eng text-xs" style={{ color: accentHex }}>
                          Saved
                        </span>
                      )}
                      <button
                        type="button"
                        role="switch"
                        aria-checked={stateObj.enabled}
                        aria-label={`Toggle ${p.label} reminder`}
                        onClick={() => handlePrayerToggle(p.id, stateObj.enabled, stateObj.time)}
                        className={`w-12 h-6 rounded-full transition-all duration-300 flex items-center px-1 cursor-pointer ${
                          stateObj.enabled
                            ? isLightMode
                              ? 'bg-[#9c7533]'
                              : 'bg-[#d2a24b]'
                            : isLightMode
                              ? 'bg-black/15'
                              : 'bg-white/15'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform duration-300 ${
                            stateObj.enabled ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CUSTOM REMINDERS */}
          <div className="flex flex-col gap-3">
            <span className={`font-serif-eng uppercase tracking-[0.2em] text-xs opacity-70 px-1 ${tTextSub}`}>
              02. Personal Devotion Reminders
            </span>

            <form
              onSubmit={handleAddCustom}
              className={`w-full p-2 pl-4 rounded-2xl border flex items-center justify-between gap-2 ${
                isLightMode ? 'bg-white/70 border-black/10 shadow-xs' : 'bg-white/[0.03] border-white/10'
              }`}
            >
              <input
                type="text"
                placeholder="e.g. Morning Salawat, Surah Al-Mulk"
                aria-label="Custom reminder title"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className={`flex-grow min-w-0 bg-transparent outline-none font-serif-eng text-sm placeholder:opacity-50 ${tTextMain}`}
              />
              <input
                type="time"
                aria-label="Custom reminder time"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                className={`bg-transparent outline-none font-serif-eng text-xs tabular-nums px-2 py-1 border-l shrink-0 ${
                  isLightMode ? 'border-black/10 text-[#1a1814]' : 'border-white/10 text-white'
                }`}
              />
              <button
                type="submit"
                aria-label="Add custom reminder"
                disabled={!customTitle.trim()}
                className={`w-10 h-10 shrink-0 flex items-center justify-center rounded-xl transition-all cursor-pointer ${
                  customTitle.trim()
                    ? isLightMode
                      ? 'bg-[#9c7533] text-white'
                      : 'bg-[#d2a24b] text-[#1a1814]'
                    : 'opacity-25 pointer-events-none'
                }`}
              >
                <PlusIcon size={18} />
              </button>
            </form>

            {devotionData.customReminders.length > 0 && (
              <div className="flex flex-col gap-2.5 mt-1">
                {devotionData.customReminders.map((cr) => (
                  <div
                    key={cr.id}
                    className={`w-full p-4 px-5 rounded-2xl border flex justify-between items-center ${
                      isLightMode ? 'bg-white/55 border-black/10' : 'bg-white/[0.03] border-white/10'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className={`font-serif-eng text-base font-medium ${tTextMain}`}>{cr.title}</span>
                      <span className={`font-serif-eng text-xs tabular-nums opacity-70 ${tTextSub}`}>{cr.time}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        aria-label={`Delete reminder ${cr.title}`}
                        onClick={() => handleCustomDelete(cr)}
                        className="w-9 h-9 rounded-full flex items-center justify-center opacity-50 hover:opacity-100 transition-opacity text-red-500 cursor-pointer"
                      >
                        <TrashIcon size={16} />
                      </button>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={cr.enabled}
                        aria-label={`Toggle reminder ${cr.title}`}
                        onClick={() => handleCustomToggle(cr)}
                        className={`w-12 h-6 rounded-full transition-all duration-300 flex items-center px-1 cursor-pointer ${
                          cr.enabled
                            ? isLightMode
                              ? 'bg-[#9c7533]'
                              : 'bg-[#d2a24b]'
                            : isLightMode
                              ? 'bg-black/15'
                              : 'bg-white/15'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform duration-300 ${
                            cr.enabled ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
