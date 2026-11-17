import { useEffect, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { ChevronDownIcon, SettingsIcon, SparklesIcon } from '../icons/Icons';
import {
  useOptionalLocalAI,
  useOptionalPreferences,
  useOptionalSanctuary,
} from '../../context/sanctuaryStore';
import { LOCAL_AI_APPROX_SIZE_MB, formatBytesCompact } from '../../utils/localAiLogic';
import {
  HAPTIC_TYPES,
  hapticDestructive,
  hapticDetent,
  hapticDismiss,
  hapticNavigate,
  hapticSuccess,
  hapticToggle,
  hapticWarning,
  triggerHaptic,
} from '../../utils/haptics';

const TIME_PHASES = [
  { id: null, label: 'Auto (Solar)' },
  { id: 0, label: 'Fajr · Dawn' },
  { id: 1, label: 'Dhuhr · Zenith' },
  { id: 2, label: 'Asr · Amber' },
  { id: 3, label: 'Maghrib · Dusk' },
  { id: 4, label: 'Isha · Night' },
];

export const SettingsModal = ({
  isOpen,
  onClose,
  isLightMode: isLightModeProp,
  devotionData: devotionDataProp,
  prayerTimes: prayerTimesProp,
  devTimePhase: devTimePhaseProp,
  setDevTimePhase: setDevTimePhaseProp,
  onOpenCityPicker,
}) => {
  const sanctuaryCtx = useOptionalSanctuary();
  const prefsCtx = useOptionalPreferences();
  const localAI = useOptionalLocalAI();

  const devotionData = devotionDataProp ?? sanctuaryCtx?.devotionData;
  const prayerTimes = prayerTimesProp ?? sanctuaryCtx?.prayerTimes;
  const isLightMode = isLightModeProp ?? prefsCtx?.isLightMode ?? false;
  const devTimePhase = devTimePhaseProp !== undefined ? devTimePhaseProp : prefsCtx?.devTimePhase ?? null;
  const setDevTimePhase = setDevTimePhaseProp ?? prefsCtx?.setDevTimePhase;
  const isHapticsEnabled = prefsCtx?.isHapticsEnabled ?? true;
  const toggleHapticsEnabled = prefsCtx?.toggleHapticsEnabled;

  const [confirmingReset, setConfirmingReset] = useState(false);
  const [aiCacheNotice, setAiCacheNotice] = useState('');
  const [nameInput, setNameInput] = useState(devotionData?.profile?.name || 'Seeker');
  const [nameSaved, setNameSaved] = useState(false);
  const [backupNotice, setBackupNotice] = useState(null);
  const fileInputRef = useRef(null);
  const resetConfirmTimerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setNameInput(devotionData.profile?.name || 'Seeker');
      setConfirmingReset(false);
      setAiCacheNotice('');
      setNameSaved(false);
      setBackupNotice(null);
    }
    return () => {
      if (resetConfirmTimerRef.current) {
        clearTimeout(resetConfirmTimerRef.current);
        resetConfirmTimerRef.current = null;
      }
    };
  }, [isOpen, devotionData.profile?.name]);

  if (!isOpen) return null;

  const tTextMain = isLightMode ? 'text-[#1a1814]' : 'text-[rgba(245,238,224,0.94)]';
  const tTextSub = isLightMode ? 'text-[#4a453d]' : 'text-[#e4dac8]';
  const accentHex = isLightMode ? '#9c7533' : '#d2a24b';

  const handleAmbientToggle = async () => {
    const willEnable = !devotionData.isAmbientEnabled;
    hapticToggle(willEnable);
    devotionData.toggleAmbientMode();
    if (Capacitor.isNativePlatform()) {
      if (willEnable) {
        const p = await LocalNotifications.requestPermissions();
        if (p.display === 'granted') {
          await LocalNotifications.schedule({
            notifications: [
              {
                title: 'Ruh Companion',
                body: 'Take a breath. Remember your intention.',
                id: 99,
                schedule: { allowWhileIdle: true, on: { hour: 10, minute: 0 } },
                sound: null,
              },
            ],
          });
        }
      } else {
        await LocalNotifications.cancel({ notifications: [{ id: 99 }] });
      }
    }
  };

  const handleSaveName = (e) => {
    e.preventDefault();
    if (nameInput.trim().length >= 2) {
      hapticSuccess();
      devotionData.setProfile(nameInput.trim());
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 2000);
    } else {
      hapticWarning();
    }
  };

  const handleExportBackup = () => {
    try {
      const json = devotionData.exportBackupJson?.();
      if (!json) {
        hapticWarning();
        return;
      }
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const today = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `ruh-sanctuary-backup-${today}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      hapticSuccess();
      setBackupNotice({ type: 'success', text: 'Backup exported to your device.' });
    } catch {
      hapticWarning();
      setBackupNotice({ type: 'error', text: 'Unable to export backup right now.' });
    }
  };

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const text = await file.text();
      const ok = devotionData.importBackupJson?.(text);
      if (ok) {
        hapticSuccess();
        setBackupNotice({ type: 'success', text: 'Sanctuary restored from backup.' });
      } else {
        hapticWarning();
        setBackupNotice({ type: 'error', text: 'Invalid backup file. Please choose a Ruh JSON export.' });
      }
    } catch {
      hapticWarning();
      setBackupNotice({ type: 'error', text: 'Could not read the selected file.' });
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Sanctuary Settings"
      className="fixed inset-0 z-[100] flex flex-col pointer-events-auto"
    >
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          background: isLightMode ? 'rgba(244,240,232,0.94)' : 'rgba(8,7,6,0.95)',
          backdropFilter: 'blur(24px)',
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
            <SettingsIcon size={22} style={{ color: accentHex }} />
            <div>
              <h2 className={`font-serif-eng text-lg font-medium uppercase tracking-[0.2em] ${tTextMain}`}>
                Sanctuary Settings
              </h2>
              <span className={`font-calligraphy text-sm opacity-70 ${tTextSub}`} dir="rtl">الإعدادات</span>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close Settings"
            onClick={() => {
              hapticDismiss();
              onClose?.();
            }}
            className={`w-11 h-11 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
              isLightMode ? 'bg-white/70 border-black/10 text-[#4a453d]' : 'bg-white/5 border-white/10 text-white'
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
          {/* Seeker Identity Card */}
          <form
            onSubmit={handleSaveName}
            className={`w-full p-5 rounded-3xl border flex flex-col gap-3 ${
              isLightMode ? 'bg-white/70 border-black/10 shadow-xs' : 'bg-white/[0.03] border-white/10'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className={`font-serif-eng text-base font-medium ${tTextMain}`}>Seeker Identity</span>
              {nameSaved && (
                <span className="font-serif-eng text-xs" style={{ color: accentHex }}>
                  Updated
                </span>
              )}
            </div>
            <div className="flex items-center gap-2.5 w-full">
              <input
                type="text"
                aria-label="Seeker Name"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Your name"
                className={`flex-1 min-w-0 w-full bg-transparent border rounded-xl px-3.5 py-2 font-serif-eng text-sm outline-none ${
                  isLightMode
                    ? 'border-black/15 text-[#1a1814] focus:border-[#9c7533]'
                    : 'border-white/15 text-white focus:border-[#d2a24b]'
                }`}
              />
              <button
                type="submit"
                className={`px-4 py-2 rounded-xl font-serif-eng text-xs uppercase tracking-wider border transition-colors cursor-pointer shrink-0 ${
                  isLightMode
                    ? 'bg-[#9c7533] text-white border-[#9c7533]'
                    : 'bg-[#d2a24b]/20 text-[#d2a24b] border-[#d2a24b]/40 hover:bg-[#d2a24b]/30'
                }`}
              >
                Save
              </button>
            </div>
          </form>

          {/* Atmosphere & Temporal Palette Selector */}
          <div
            className={`w-full p-5 rounded-3xl border flex flex-col gap-3 ${
              isLightMode ? 'bg-white/70 border-black/10 shadow-xs' : 'bg-white/[0.03] border-white/10'
            }`}
          >
            <span className={`font-serif-eng text-base font-medium ${tTextMain}`}>
              Sanctuary Atmosphere
            </span>
            <p className={`font-serif-eng text-xs leading-relaxed opacity-70 ${tTextSub}`}>
              By default, Ruh shifts its ambient light across the five solar prayer phases. You may also lock a specific atmosphere.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
              {TIME_PHASES.map((phase) => {
                const isSelected = devTimePhase === phase.id;
                return (
                  <button
                    key={String(phase.id)}
                    type="button"
                    onClick={() => {
                      hapticDetent();
                      if (setDevTimePhase) setDevTimePhase(phase.id);
                    }}
                    className={`px-3 py-2 rounded-xl font-serif-eng text-xs border transition-all cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? isLightMode
                          ? 'bg-[#9c7533] text-white border-[#9c7533] font-medium'
                          : 'bg-[#d2a24b]/20 text-[#d2a24b] border-[#d2a24b]/50 font-medium'
                        : isLightMode
                          ? 'border-black/10 text-[#4a453d] hover:bg-black/5'
                          : 'border-white/10 text-[#e4dac8]/70 hover:bg-white/5'
                    }`}
                  >
                    {phase.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ambient Companion Card */}
          <div
            className={`w-full p-5 rounded-3xl border flex flex-col gap-3 ${
              isLightMode
                ? 'bg-[#0d9488]/5 border-[#0d9488]/20 shadow-xs'
                : 'bg-[#14b8a6]/5 border-[#14b8a6]/20'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className={`font-serif-eng text-base font-medium ${isLightMode ? 'text-[#0d9488]' : 'text-[#14b8a6]'}`}>
                Ambient Dhikr Whisper
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={devotionData.isAmbientEnabled}
                aria-label="Toggle Ambient Dhikr Whisper"
                onClick={handleAmbientToggle}
                className={`w-12 h-6 rounded-full transition-all duration-300 flex items-center px-1 cursor-pointer ${
                  devotionData.isAmbientEnabled
                    ? isLightMode
                      ? 'bg-[#0d9488]'
                      : 'bg-[#14b8a6]'
                    : isLightMode
                      ? 'bg-black/15'
                      : 'bg-white/15'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform duration-300 ${
                    devotionData.isAmbientEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            <p className={`font-serif-eng text-xs leading-relaxed opacity-70 ${tTextSub}`}>
              Softly reveals rotating remembrance phrases in the Sanctuary header every 30 seconds.
            </p>
          </div>

          {/* Simple Language Card */}
          <div
            className={`w-full p-5 rounded-3xl border flex flex-col gap-3 ${
              isLightMode ? 'bg-white/70 border-black/10 shadow-xs' : 'bg-white/[0.03] border-white/10'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className={`font-serif-eng text-base font-medium ${tTextMain}`}>Simple English Translation</span>
              <button
                type="button"
                role="switch"
                aria-checked={devotionData.isSimpleMode}
                aria-label="Toggle Simple English Translation"
                onClick={() => {
                  hapticToggle(!devotionData.isSimpleMode);
                  devotionData.toggleSimpleMode();
                }}
                className={`w-12 h-6 rounded-full transition-all duration-300 flex items-center px-1 cursor-pointer ${
                  devotionData.isSimpleMode
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
                    devotionData.isSimpleMode ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            <p className={`font-serif-eng text-xs leading-relaxed opacity-70 ${tTextSub}`}>
              Translates classical theological commentary and proofs into clear, everyday English across all stations.
            </p>
          </div>

          {/* Tactile Haptics Card */}
          <div
            className={`w-full p-5 rounded-3xl border flex flex-col gap-3 ${
              isLightMode ? 'bg-white/70 border-black/10 shadow-xs' : 'bg-white/[0.03] border-white/10'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className={`font-serif-eng text-base font-medium ${tTextMain}`}>Tactile Haptics</span>
              <button
                type="button"
                role="switch"
                aria-checked={isHapticsEnabled}
                aria-label="Toggle Tactile Haptics"
                onClick={() => {
                  const nextEnabled = !isHapticsEnabled;
                  triggerHaptic(nextEnabled ? HAPTIC_TYPES.TOGGLE_ON : HAPTIC_TYPES.TOGGLE_OFF, {
                    force: true,
                  });
                  toggleHapticsEnabled?.();
                }}
                className={`w-12 h-6 rounded-full transition-all duration-300 flex items-center px-1 cursor-pointer ${
                  isHapticsEnabled
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
                    isHapticsEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            <p className={`font-serif-eng text-xs leading-relaxed opacity-70 ${tTextSub}`}>
              Distinct Capacitor haptic pulses calibrated for scroll detents, switches, prayer logs, and celebrations.
            </p>
          </div>

          {/* Local AI Companion Card */}
          {localAI && (
            <div
              data-testid="settings-local-ai-card"
              className={`w-full p-5 rounded-3xl border flex flex-col gap-3 ${
                isLightMode
                  ? 'bg-[#0d9488]/[0.05] border-[#0d9488]/20 shadow-xs'
                  : 'bg-[#14b8a6]/[0.05] border-[#14b8a6]/22'
              }`}
            >
              <div className="flex justify-between items-center gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <SparklesIcon
                    size={15}
                    className="shrink-0"
                    style={{ color: isLightMode ? '#0d9488' : '#14b8a6' }}
                  />
                  <span
                    className={`font-serif-eng text-[15px] font-medium whitespace-nowrap truncate ${
                      isLightMode ? 'text-[#0d9488]' : 'text-[#14b8a6]'
                    }`}
                  >
                    Local AI Companion
                  </span>
                </div>
                <span
                  className={`font-serif-eng text-[9.5px] uppercase tracking-[0.12em] px-2.5 py-1 rounded-full border shrink-0 whitespace-nowrap ${
                    isLightMode
                      ? 'border-[#0d9488]/25 text-[#0d9488] bg-white/60'
                      : 'border-[#14b8a6]/30 text-[#14b8a6] bg-white/[0.04]'
                  }`}
                >
                  {localAI.status === 'ready'
                    ? `Ready · ${localAI.runtimeBackend === 'webgpu' ? 'WebGPU' : 'WASM'}`
                    : localAI.status === 'warming'
                      ? 'Warming Engine'
                      : localAI.status === 'downloading'
                        ? `Caching · ${localAI.progress}%`
                        : localAI.status === 'paused'
                          ? 'Paused · Lite'
                          : 'Grounded Mode'}
                </span>
              </div>

              {localAI.isDownloading && (
                <div className="space-y-1.5">
                  <div
                    className={`w-full h-1.5 rounded-full overflow-hidden ${
                      isLightMode ? 'bg-black/10' : 'bg-white/10'
                    }`}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.max(4, localAI.progress)}%`,
                        backgroundColor: isLightMode ? '#0d9488' : '#14b8a6',
                      }}
                    />
                  </div>
                  <p className={`font-serif-eng text-[11px] opacity-75 ${tTextSub}`}>
                    {localAI.progressDetails?.totalBytes > 0
                      ? `${formatBytesCompact(localAI.progressDetails.loadedBytes)} of ${formatBytesCompact(localAI.progressDetails.totalBytes)} cached`
                      : `Fetching quantized model (~${LOCAL_AI_APPROX_SIZE_MB} MB once)`}
                  </p>
                </div>
              )}

              <p className={`font-serif-eng text-xs leading-relaxed opacity-75 ${tTextSub}`}>
                {localAI.errorMessage
                  ? localAI.errorMessage
                  : `Runs 100% privately on-device (~${LOCAL_AI_APPROX_SIZE_MB} MB cached once) for Tafakkur reflections and Dua moment guidance. Instant grounded retrieval remains active offline.`}
              </p>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                {localAI.isDownloading ? (
                  <button
                    type="button"
                    onClick={() => {
                      hapticToggle(false);
                      setAiCacheNotice('');
                      localAI.pauseDownload();
                    }}
                    className={`min-h-[42px] px-3 py-2 rounded-xl font-serif-eng uppercase text-xs tracking-wider border transition-colors cursor-pointer ${
                      isLightMode
                        ? 'border-black/15 text-[#1a1814] hover:bg-black/5'
                        : 'border-white/15 text-[#e4dac8] hover:bg-white/5'
                    }`}
                  >
                    Pause Download
                  </button>
                ) : localAI.isReady ? (
                  <button
                    type="button"
                    onClick={() => {
                      hapticToggle(false);
                      setAiCacheNotice('');
                      localAI.pauseDownload();
                    }}
                    className={`min-h-[42px] px-3 py-2 rounded-xl font-serif-eng uppercase text-xs tracking-wider border transition-colors cursor-pointer ${
                      isLightMode
                        ? 'border-black/15 text-[#1a1814] hover:bg-black/5'
                        : 'border-white/15 text-[#e4dac8] hover:bg-white/5'
                    }`}
                  >
                    Use Lite Mode
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      hapticToggle(true);
                      setAiCacheNotice('');
                      localAI.resumeDownload();
                    }}
                    className={`min-h-[42px] px-3 py-2 rounded-xl font-serif-eng uppercase text-xs tracking-wider border transition-colors cursor-pointer ${
                      isLightMode
                        ? 'bg-[#0d9488] text-white border-[#0d9488]'
                        : 'bg-[#14b8a6]/20 text-[#14b8a6] border-[#14b8a6]/45 hover:bg-[#14b8a6]/30'
                    }`}
                  >
                    {localAI.status === 'paused' ? 'Resume Model' : 'Download Model'}
                  </button>
                )}

                <button
                  type="button"
                  onClick={async () => {
                    hapticDestructive();
                    await localAI.clearModelCache();
                    setAiCacheNotice('Cached local AI weights cleared.');
                  }}
                  className={`min-h-[42px] px-3 py-2 rounded-xl font-serif-eng uppercase text-xs tracking-wider border transition-colors cursor-pointer ${
                    isLightMode
                      ? 'border-black/15 text-[#4a453d] hover:bg-black/5'
                      : 'border-white/15 text-[#e4dac8]/80 hover:bg-white/5'
                  }`}
                >
                  Clear Cache
                </button>
              </div>

              {aiCacheNotice && (
                <p
                  role="status"
                  className="font-serif-eng text-xs"
                  style={{ color: isLightMode ? '#0d9488' : '#14b8a6' }}
                >
                  {aiCacheNotice}
                </p>
              )}
            </div>
          )}

          {/* Prayer Location & Calculation Method Card */}
          <div
            className={`w-full p-5 rounded-3xl border flex flex-col gap-3 ${
              isLightMode ? 'bg-white/70 border-black/10 shadow-xs' : 'bg-white/[0.03] border-white/10'
            }`}
          >
            <div className="flex justify-between items-center gap-2">
              <span className={`font-serif-eng text-base font-medium ${tTextMain}`}>Location &amp; Prayer Times</span>
              {prayerTimes?.hasLocation && (
                <span className={`font-serif-eng text-[10px] uppercase tracking-widest shrink-0 ${isLightMode ? 'text-[#0d9488]' : 'text-[#14b8a6]'}`}>
                  {prayerTimes.cityLabel}
                </span>
              )}
            </div>
            <p className={`font-serif-eng text-xs leading-relaxed opacity-70 ${tTextSub}`}>
              Choose your city or use GPS for live prayer countdowns and Qibla direction, and pick your regional convention.
            </p>
            {onOpenCityPicker && (
              <button
                type="button"
                onClick={() => {
                  hapticNavigate();
                  onOpenCityPicker();
                }}
                className={`w-full min-h-[42px] px-3.5 py-2 rounded-xl border font-serif-eng text-xs uppercase tracking-[0.14em] flex items-center justify-between cursor-pointer transition-colors ${
                  isLightMode
                    ? 'border-black/12 text-[#1a1814] hover:bg-black/5'
                    : 'border-white/15 text-[#f5eee0] hover:bg-white/5'
                }`}
              >
                <span>{prayerTimes?.hasLocation ? `City: ${prayerTimes.cityLabel}` : 'Choose City or GPS'}</span>
                <span style={{ color: accentHex }}>Change</span>
              </button>
            )}
            <div className="flex items-center gap-2.5 w-full">
              <select
                aria-label="Prayer calculation method"
                value={prayerTimes?.method || 'MoonsightingCommittee'}
                onChange={(e) => {
                  hapticDetent();
                  prayerTimes?.setMethod(e.target.value);
                }}
                className={`flex-1 min-w-0 w-full truncate font-serif-eng text-xs px-3 py-2.5 rounded-xl border outline-none transition-all cursor-pointer ${
                  isLightMode ? 'bg-white border-black/15 text-[#1a1814]' : 'bg-[#12100d] border-white/15 text-white'
                }`}
              >
                <option value="MoonsightingCommittee">Moonsighting Committee</option>
                <option value="NorthAmerica">ISNA (North America)</option>
                <option value="MuslimWorldLeague">Muslim World League</option>
                <option value="Egyptian">Egyptian General Authority</option>
                <option value="UmmAlQura">Umm Al-Qura (Makkah)</option>
                <option value="Karachi">University of Islamic Sciences, Karachi</option>
                <option value="Dubai">Dubai / UAE</option>
                <option value="Qatar">Qatar</option>
                <option value="Kuwait">Kuwait</option>
                <option value="Singapore">MUIS (Singapore / SE Asia)</option>
              </select>
            </div>
          </div>

          {/* Sanctuary Backup & Restore Card */}
          <div
            className={`w-full p-5 rounded-3xl border flex flex-col gap-3 ${
              isLightMode ? 'bg-white/70 border-black/10 shadow-xs' : 'bg-white/[0.03] border-white/10'
            }`}
          >
            <span className={`font-serif-eng text-base font-medium ${tTextMain}`}>
              Sanctuary Backup (Local JSON)
            </span>
            <p className={`font-serif-eng text-xs leading-relaxed opacity-70 ${tTextSub}`}>
              Export your prayers, streaks, Qada ledger, custom habits, and notes to a private file, or restore anytime.
            </p>
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleExportBackup}
                className={`min-h-[40px] px-3 py-2 rounded-xl font-serif-eng uppercase text-xs tracking-wider border transition-colors cursor-pointer ${
                  isLightMode
                    ? 'bg-[#9c7533] text-white border-[#9c7533]'
                    : 'bg-[#d2a24b]/20 text-[#d2a24b] border-[#d2a24b]/40 hover:bg-[#d2a24b]/30'
                }`}
              >
                Export JSON
              </button>
              <button
                type="button"
                onClick={() => {
                  hapticNavigate();
                  fileInputRef.current?.click();
                }}
                className={`min-h-[40px] px-3 py-2 rounded-xl font-serif-eng uppercase text-xs tracking-wider border transition-colors cursor-pointer ${
                  isLightMode
                    ? 'border-black/15 text-[#1a1814] hover:bg-black/5'
                    : 'border-white/15 text-[#e4dac8] hover:bg-white/5'
                }`}
              >
                Import JSON
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                aria-label="Import Sanctuary JSON Backup"
                onChange={handleImportFile}
                className="hidden"
              />
            </div>
            {backupNotice && (
              <p
                role="status"
                className="font-serif-eng text-xs"
                style={{
                  color:
                    backupNotice.type === 'error'
                      ? isLightMode
                        ? '#8a0000'
                        : '#ff6b6b'
                      : accentHex,
                }}
              >
                {backupNotice.text}
              </p>
            )}
          </div>

          {/* Reset Progress Card */}
          <div
            className={`w-full p-5 rounded-3xl border flex flex-col gap-3 ${
              isLightMode ? 'bg-[#8a0000]/5 border-[#8a0000]/15' : 'bg-[#ff4444]/5 border-[#ff4444]/15'
            }`}
          >
            <span className={`font-serif-eng text-base font-medium ${isLightMode ? 'text-[#8a0000]' : 'text-[#ff6b6b]'}`}>
              Reset Sanctuary Journey
            </span>
            <p className={`font-serif-eng text-xs leading-relaxed opacity-70 ${tTextSub}`}>
              Permanently clear all progress, unlocked stations, saved reflections, and daily streaks.
            </p>
            <button
              type="button"
              onClick={() => {
                if (confirmingReset) {
                  hapticDestructive();
                  if (resetConfirmTimerRef.current) {
                    clearTimeout(resetConfirmTimerRef.current);
                    resetConfirmTimerRef.current = null;
                  }
                  devotionData.resetData();
                  setConfirmingReset(false);
                  onClose();
                } else {
                  hapticWarning();
                  setConfirmingReset(true);
                  if (resetConfirmTimerRef.current) clearTimeout(resetConfirmTimerRef.current);
                  resetConfirmTimerRef.current = setTimeout(() => {
                    setConfirmingReset(false);
                    resetConfirmTimerRef.current = null;
                  }, 3000);
                }
              }}
              className={`mt-1 py-2.5 w-full rounded-xl font-serif-eng uppercase text-xs tracking-widest border transition-colors cursor-pointer ${
                isLightMode
                  ? 'text-[#8a0000] border-[#8a0000]/25 hover:bg-[#8a0000]/10'
                  : 'text-[#ff6b6b] border-[#ff6b6b]/25 hover:bg-[#ff6b6b]/10'
              }`}
            >
              {confirmingReset ? 'Tap Again to Confirm Reset' : 'Reset All Data'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
