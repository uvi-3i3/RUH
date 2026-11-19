import { useEffect, useState } from 'react';
import { BellIcon, CheckCircleIcon, ChevronDownIcon, PlusIcon, SparklesIcon, TrashIcon } from '../icons/Icons';
import { PRAYERS } from '../../data/constants';
import { NOTIFICATION_LEAD_OPTIONS, PRAYER_REMINDER_MESSAGES } from '../../utils/notificationLogic';
import { useOptionalPreferences, useOptionalSanctuary } from '../../context/sanctuaryStore';
import {
  hapticDestructive,
  hapticDetent,
  hapticDismiss,
  hapticNavigate,
  hapticSuccess,
  hapticTapLight,
  hapticToggle,
  hapticWarning,
} from '../../utils/haptics';

export const RemindersModal = ({
  isOpen,
  onClose,
  isLightMode: isLightModeProp,
  devotionData: devotionDataProp,
  prayerTimes: prayerTimesProp,
  notifications: notificationsProp,
  onOpenCityPicker,
}) => {
  const sanctuaryCtx = useOptionalSanctuary();
  const prefsCtx = useOptionalPreferences();

  const isLightMode = isLightModeProp ?? prefsCtx?.isLightMode ?? false;
  const devotionData = devotionDataProp ?? sanctuaryCtx?.devotionData;
  const prayerTimes = prayerTimesProp ?? sanctuaryCtx?.prayerTimes;
  const notifications = notificationsProp ?? sanctuaryCtx?.notifications;

  const [customTitle, setCustomTitle] = useState('');
  const [customTime, setCustomTime] = useState('09:00');
  const [feedback, setFeedback] = useState({});
  const [statusNotice, setStatusNotice] = useState('');

  useEffect(() => {
    if (isOpen) {
      notifications?.refreshPermission?.();
    } else {
      setStatusNotice('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const tTextMain = isLightMode ? 'text-[#1a1814]' : 'text-[rgba(245,238,224,0.94)]';
  const tTextSub = isLightMode ? 'text-[#4a453d]' : 'text-[#e4dac8]';
  const accentHex = isLightMode ? '#9c7533' : '#d2a24b';

  const permission = notifications?.permission || 'default';
  const leadMinutes = devotionData.notificationLeadMinutes || 0;
  const chimeEnabled = devotionData.notificationChime !== false;
  const enabledPrayerCount = PRAYERS.filter((p) => devotionData.prayers?.[p.id]?.enabled).length;
  const allPrayersEnabled = enabledPrayerCount === PRAYERS.length;

  const showFeedback = (id, status) => {
    setFeedback((prev) => ({ ...prev, [id]: status }));
    setTimeout(
      () =>
        setFeedback((prev) => {
          const n = { ...prev };
          delete n[id];
          return n;
        }),
      1800
    );
  };

  const ensurePermissionForAction = async () => {
    if (!notifications?.requestPermission) return true;
    if (permission === 'granted' || permission === 'native') return true;
    if (permission === 'unsupported') {
      setStatusNotice('Sanctuary in-app alerts are active. This browser does not support OS background alerts.');
      return true;
    }
    if (permission === 'denied') {
      setStatusNotice('Browser alerts are blocked in site settings. In-app Sanctuary alerts will still appear while open.');
      return true;
    }
    const nextPerm = await notifications.requestPermission();
    if (nextPerm === 'granted') {
      setStatusNotice('Local push notifications enabled for this device.');
    } else if (nextPerm === 'denied') {
      setStatusNotice('Browser alerts declined — in-app Sanctuary banners remain active while open.');
    }
    return true;
  };

  const handlePrayerToggle = async (prayerId, currentState, currentTime) => {
    const isNowEnabled = !currentState;
    hapticToggle(isNowEnabled);
    if (isNowEnabled) {
      await ensurePermissionForAction();
    }

    devotionData.togglePrayerReminder(prayerId);
    const notifId = notifications?.prayerIdMap?.[prayerId];

    if (isNowEnabled && notifId) {
      const p = PRAYERS.find((item) => item.id === prayerId);
      const copy = PRAYER_REMINDER_MESSAGES[prayerId];
      await notifications?.scheduleNativeReminder?.(
        notifId,
        `${p?.label || prayerId} Prayer`,
        copy?.onTime || `It is time to center your soul for ${p?.label}.`,
        currentTime,
        leadMinutes
      );
      showFeedback(prayerId, 'saved');
    } else if (notifId) {
      await notifications?.cancelNativeReminder?.(notifId);
      showFeedback(prayerId, 'saved');
    }
  };

  const handlePrayerTimeChange = async (prayerId, newTime, currentState) => {
    devotionData.updatePrayerTime(prayerId, newTime);
    const notifId = notifications?.prayerIdMap?.[prayerId];
    if (currentState && notifId) {
      const p = PRAYERS.find((item) => item.id === prayerId);
      const copy = PRAYER_REMINDER_MESSAGES[prayerId];
      await notifications?.scheduleNativeReminder?.(
        notifId,
        `${p?.label || prayerId} Prayer`,
        copy?.onTime || `It is time to center your soul for ${p?.label}.`,
        newTime,
        leadMinutes
      );
      showFeedback(prayerId, 'saved');
    }
  };

  const handleToggleAllPrayers = async () => {
    const targetEnabled = !allPrayersEnabled;
    if (targetEnabled) {
      hapticSuccess();
      await ensurePermissionForAction();
    } else {
      hapticWarning();
    }
    devotionData.setAllPrayerRemindersEnabled?.(targetEnabled);
    setStatusNotice(
      targetEnabled
        ? 'All five daily prayer reminders enabled.'
        : 'All five daily prayer reminders paused.'
    );
  };

  const handleSyncSolar = () => {
    if (!prayerTimes?.hasLocation) {
      hapticNavigate();
      onClose?.();
      onOpenCityPicker?.();
      return;
    }
    hapticSuccess();
    const ok = notifications?.syncFromLiveSolarTimes?.();
    if (ok) {
      setStatusNotice(`Prayer reminder times synced to ${prayerTimes.cityLabel}.`);
    }
  };

  const handleLeadChange = async (mins) => {
    hapticDetent();
    devotionData.setNotificationLeadMinutes?.(mins);
    await notifications?.syncAllNativePrayerSchedules?.(mins);
  };

  const handlePreviewAlert = async () => {
    hapticTapLight();
    const res = await notifications?.sendPreviewAlert?.();
    if (res?.osDelivered) {
      setStatusNotice('Sent gentle local push notification & Sanctuary alert banner.');
    } else if (res?.permission === 'denied') {
      setStatusNotice('Showed Sanctuary alert banner (OS notifications are blocked in browser settings).');
    } else {
      setStatusNotice('Previewed gentle Sanctuary alert banner.');
    }
  };

  const handleAddCustom = async (e) => {
    if (e) e.preventDefault();
    if (!customTitle.trim()) {
      hapticWarning();
      return;
    }
    hapticSuccess();
    await ensurePermissionForAction();

    const newIdStr = devotionData.addCustomReminder(customTitle.trim(), customTime);
    const numericId = parseInt(newIdStr.replace(/[^0-9]/g, '').slice(-8), 10);
    await notifications?.scheduleNativeReminder?.(
      numericId,
      customTitle.trim(),
      `Your personal devotion reminder for ${customTitle.trim()}.`,
      customTime,
      0
    );
    setCustomTitle('');
  };

  const handleCustomToggle = async (cr) => {
    const isNowEnabled = !cr.enabled;
    hapticToggle(isNowEnabled);
    if (isNowEnabled) {
      await ensurePermissionForAction();
    }

    devotionData.toggleCustomReminder(cr.id);
    const numericId = parseInt(cr.id.replace(/[^0-9]/g, '').slice(-8), 10);

    if (isNowEnabled) {
      await notifications?.scheduleNativeReminder?.(
        numericId,
        cr.title,
        `Your personal devotion reminder for ${cr.title}.`,
        cr.time,
        0
      );
    } else {
      await notifications?.cancelNativeReminder?.(numericId);
    }
  };

  const handleCustomDelete = async (cr) => {
    hapticDestructive();
    devotionData.deleteCustomReminder(cr.id);
    const numericId = parseInt(cr.id.replace(/[^0-9]/g, '').slice(-8), 10);
    await notifications?.cancelNativeReminder?.(numericId);
  };

  const permissionLabel =
    permission === 'granted' || permission === 'native'
      ? 'Local Push Active'
      : permission === 'denied'
        ? 'Browser Alerts Blocked'
        : permission === 'unsupported'
          ? 'In-App Sanctuary Alerts'
          : 'Enable Local Push';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Prayer & Devotion Reminders"
      className="fixed inset-0 z-[100] flex flex-col pointer-events-auto"
    >
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          background: isLightMode ? 'rgba(244,240,232,0.97)' : 'rgba(8,7,6,0.97)',
        }}
        onClick={() => {
          hapticDismiss();
          onClose?.();
        }}
      />

      <div className="relative z-10 w-full max-w-xl mx-auto h-full flex flex-col">
        {/* Sticky Top Header */}
        <div
          className="w-full flex items-center justify-between px-6 pb-4 border-b border-current/10 shrink-0"
          style={{ paddingTop: 'calc(18px + var(--sat))' }}
        >
          <div className="flex items-center gap-3">
            <BellIcon size={21} style={{ color: accentHex }} />
            <div>
              <h2 className={`font-serif-eng text-lg font-medium uppercase tracking-[0.2em] ${tTextMain}`}>
                Sacred Reminders
              </h2>
              <span className={`font-calligraphy text-sm opacity-75 ${tTextSub}`} dir="rtl">
                التذكير اليومي
              </span>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close Reminders"
            onClick={() => {
              hapticDismiss();
              onClose?.();
            }}
            className={`w-11 h-11 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
              isLightMode ? 'bg-white/75 border-black/10 text-[#4a453d]' : 'bg-white/5 border-white/10 text-white'
            }`}
          >
            <ChevronDownIcon size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div
          className="flex-1 w-full overflow-y-auto hide-scrollbar px-6 pt-5 flex flex-col gap-5"
          style={{ paddingBottom: 'calc(24px + var(--sab))' }}
        >
          {statusNotice && (
            <div
              className={`w-full px-4 py-2.5 rounded-2xl border font-serif-eng text-xs leading-relaxed ${
                isLightMode
                  ? 'bg-[#9c7533]/10 border-[#9c7533]/30 text-[#1a1814]'
                  : 'bg-[#d2a24b]/10 border-[#d2a24b]/30 text-[#f5eee0]'
              }`}
            >
              {statusNotice}
            </div>
          )}

          {/* 01. DELIVERY & CADENCE */}
          <div className="flex flex-col gap-2.5">
            <span className={`font-serif-eng uppercase tracking-[0.2em] text-[11px] opacity-70 px-1 ${tTextSub}`}>
              01. Gentle Alert Delivery
            </span>

            <div
              className={`w-full rounded-3xl border p-4 flex flex-col gap-3.5 ${
                isLightMode ? 'bg-white/72 border-black/10 shadow-xs' : 'bg-white/[0.03] border-white/10'
              }`}
            >
              {/* Permission + Test Button */}
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{
                      backgroundColor:
                        permission === 'granted' || permission === 'native'
                          ? '#10b981'
                          : permission === 'denied'
                            ? '#ef4444'
                            : accentHex,
                    }}
                  />
                  <span className={`font-serif-eng text-sm font-medium ${tTextMain}`}>
                    {permissionLabel}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {permission === 'default' && (
                    <button
                      type="button"
                      onClick={() => {
                        hapticToggle(true);
                        ensurePermissionForAction();
                      }}
                      className="min-h-[34px] px-3 rounded-xl border font-serif-eng text-[10px] uppercase tracking-[0.14em] font-medium cursor-pointer transition-colors"
                      style={{
                        backgroundColor: isLightMode ? '#9c7533' : 'rgba(210,162,75,0.2)',
                        borderColor: isLightMode ? '#9c7533' : 'rgba(210,162,75,0.45)',
                        color: isLightMode ? '#ffffff' : '#f3d9a4',
                      }}
                    >
                      Allow Push
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handlePreviewAlert}
                    className={`min-h-[34px] px-3 rounded-xl border font-serif-eng text-[10px] uppercase tracking-[0.14em] flex items-center gap-1.5 cursor-pointer transition-colors ${
                      isLightMode
                        ? 'border-black/12 text-[#1a1814] hover:bg-black/5'
                        : 'border-white/15 text-[#f5eee0] hover:bg-white/5'
                    }`}
                  >
                    <SparklesIcon size={12} style={{ color: accentHex }} />
                    <span>Preview Alert</span>
                  </button>
                </div>
              </div>

              {/* Lead Timing & Soft Chime */}
              <div
                className={`pt-3 border-t flex flex-col gap-2.5 ${
                  isLightMode ? 'border-black/[0.06]' : 'border-white/[0.06]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`font-serif-eng text-[10px] uppercase tracking-[0.16em] opacity-75 ${tTextSub}`}>
                    Lead Timing
                  </span>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={chimeEnabled}
                    onClick={() => {
                      hapticToggle(!chimeEnabled);
                      devotionData.toggleNotificationChime?.();
                    }}
                    className={`min-h-[28px] px-2.5 rounded-lg border font-serif-eng text-[10px] uppercase tracking-[0.12em] cursor-pointer transition-colors ${
                      chimeEnabled
                        ? isLightMode
                          ? 'border-[#9c7533]/40 bg-[#9c7533]/10 text-[#7c5a1e]'
                          : 'border-[#d2a24b]/40 bg-[#d2a24b]/12 text-[#e5c17b]'
                        : isLightMode
                          ? 'border-black/10 text-[#4a453d]/70'
                          : 'border-white/10 text-[#e4dac8]/60'
                    }`}
                  >
                    Chime: {chimeEnabled ? 'On' : 'Quiet'}
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-1.5 w-full">
                  {NOTIFICATION_LEAD_OPTIONS.map((mins) => {
                    const active = leadMinutes === mins;
                    return (
                      <button
                        key={mins}
                        type="button"
                        aria-pressed={active}
                        onClick={() => handleLeadChange(mins)}
                        className={`min-h-[32px] px-1.5 rounded-lg border font-serif-eng text-[10px] tracking-[0.04em] whitespace-nowrap cursor-pointer transition-colors ${
                          active ? 'font-medium' : `${tTextSub} opacity-80 hover:opacity-100`
                        }`}
                        style={{
                          backgroundColor: active
                            ? isLightMode
                              ? 'rgba(156,117,51,0.14)'
                              : 'rgba(210,162,75,0.18)'
                            : 'transparent',
                          borderColor: active
                            ? accentHex
                            : isLightMode
                              ? 'rgba(0,0,0,0.1)'
                              : 'rgba(255,255,255,0.14)',
                          color: active ? accentHex : undefined,
                        }}
                      >
                        {mins === 0 ? 'At Adhan' : `${mins}m early`}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* 02. THE 5 PRAYERS */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between px-1 gap-2 flex-wrap">
              <span className={`font-serif-eng uppercase tracking-[0.18em] text-[11px] opacity-70 whitespace-nowrap ${tTextSub}`}>
                02. Five Prayers
              </span>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleSyncSolar}
                  className="font-serif-eng text-[10px] uppercase tracking-[0.12em] whitespace-nowrap cursor-pointer hover:opacity-100 opacity-90 transition-opacity"
                  style={{ color: accentHex }}
                >
                  {prayerTimes?.hasLocation ? 'Sync Solar' : 'Set City'}
                </button>
                <span className={`opacity-30 text-xs ${tTextSub}`} aria-hidden="true">
                  ·
                </span>
                <button
                  type="button"
                  onClick={handleToggleAllPrayers}
                  className={`font-serif-eng text-[10px] uppercase tracking-[0.12em] whitespace-nowrap cursor-pointer hover:opacity-100 opacity-80 transition-opacity ${tTextMain}`}
                >
                  {allPrayersEnabled ? 'Mute All' : 'Enable All'}
                </button>
              </div>
            </div>

            <div
              className={`w-full rounded-3xl border overflow-hidden ${
                isLightMode ? 'bg-white/72 border-black/10 shadow-xs' : 'bg-white/[0.03] border-white/10'
              }`}
            >
              {PRAYERS.map((p, idx) => {
                const stateObj = devotionData.prayers?.[p.id] || { enabled: false, time: '05:15' };
                const copy = PRAYER_REMINDER_MESSAGES[p.id];
                return (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between py-3.5 px-5 ${
                      idx !== PRAYERS.length - 1 ? 'border-b' : ''
                    } ${isLightMode ? 'border-black/[0.06]' : 'border-white/[0.06]'}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="min-w-[82px]">
                        <span className={`font-serif-eng text-[17px] leading-tight block ${tTextMain}`}>
                          {p.label}
                        </span>
                        <span
                          className="font-calligraphy text-[12px] leading-none opacity-75"
                          style={{ color: accentHex }}
                          dir="rtl"
                        >
                          {copy?.arabic}
                        </span>
                      </div>

                      <input
                        type="time"
                        aria-label={`${p.label} reminder time`}
                        value={stateObj.time}
                        onChange={(e) => handlePrayerTimeChange(p.id, e.target.value, stateObj.enabled)}
                        style={{ colorScheme: isLightMode ? 'light' : 'dark' }}
                        className={`bg-transparent outline-none font-serif-eng text-xs tabular-nums tracking-wider px-2.5 py-1.5 rounded-lg border ${
                          isLightMode
                            ? 'text-[#9c7533] border-black/10'
                            : 'text-[#d2a24b] border-white/10'
                        } cursor-pointer`}
                      />
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      {feedback[p.id] && (
                        <CheckCircleIcon size={14} style={{ color: accentHex }} aria-label="Saved" />
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

          {/* 03. PERSONAL DEVOTION REMINDERS */}
          <div className="flex flex-col gap-2.5 pb-4">
            <span className={`font-serif-eng uppercase tracking-[0.2em] text-[11px] opacity-70 px-1 ${tTextSub}`}>
              03. Personal Devotion Reminders
            </span>

            <form
              onSubmit={handleAddCustom}
              className={`w-full p-2 pl-4 rounded-2xl border flex items-center justify-between gap-2 ${
                isLightMode ? 'bg-white/72 border-black/10 shadow-xs' : 'bg-white/[0.03] border-white/10'
              }`}
            >
              <input
                type="text"
                placeholder="e.g. Surah Al-Mulk"
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
                style={{ colorScheme: isLightMode ? 'light' : 'dark' }}
                className={`bg-transparent outline-none font-serif-eng text-xs tabular-nums px-2 py-1 border-l shrink-0 ${
                  isLightMode ? 'border-black/10 text-[#1a1814]' : 'border-white/10 text-white'
                }`}
              />
              <button
                type="submit"
                aria-label="Add custom reminder"
                disabled={!customTitle.trim()}
                className={`w-10 h-10 shrink-0 flex items-center justify-center rounded-xl border transition-all ${
                  customTitle.trim()
                    ? isLightMode
                      ? 'bg-[#9c7533] border-[#9c7533] text-white cursor-pointer'
                      : 'bg-[#d2a24b] border-[#d2a24b] text-[#1a1814] cursor-pointer'
                    : isLightMode
                      ? 'bg-black/[0.04] border-black/12 text-[#4a453d]/55 pointer-events-none'
                      : 'bg-white/[0.06] border-white/15 text-[#e4dac8]/55 pointer-events-none'
                }`}
              >
                <PlusIcon size={18} />
              </button>
            </form>

            {devotionData.customReminders.length > 0 && (
              <div className="flex flex-col gap-2 mt-1">
                {devotionData.customReminders.map((cr) => (
                  <div
                    key={cr.id}
                    className={`w-full py-3.5 px-5 rounded-2xl border flex justify-between items-center ${
                      isLightMode ? 'bg-white/60 border-black/10' : 'bg-white/[0.03] border-white/10'
                    }`}
                  >
                    <div className="flex flex-col min-w-0 pr-3">
                      <span className={`font-serif-eng text-base font-medium truncate ${tTextMain}`}>
                        {cr.title}
                      </span>
                      <span className={`font-serif-eng text-xs tabular-nums opacity-70 ${tTextSub}`}>
                        {cr.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        type="button"
                        aria-label={`Delete reminder ${cr.title}`}
                        onClick={() => handleCustomDelete(cr)}
                        className="w-9 h-9 rounded-full flex items-center justify-center opacity-55 hover:opacity-100 transition-opacity text-red-500 cursor-pointer"
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
