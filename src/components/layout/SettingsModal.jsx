import { useEffect, useMemo, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { ChevronDownIcon, SettingsIcon } from '../icons/Icons';
import {
  useOptionalPreferences,
  useOptionalSanctuary,
} from '../../context/sanctuaryStore';
import {
  HAPTIC_TYPES,
  hapticBadgeUnlock,
  hapticDestructive,
  hapticDetent,
  hapticDismiss,
  hapticNavigate,
  hapticSuccess,
  hapticTaskComplete,
  hapticToggle,
  hapticWarning,
  triggerHaptic,
} from '../../utils/haptics';
import { playTaskTickOffCue } from '../../utils/tactileAudio';
import {
  QUIET_HOURS_PRESETS,
  WEEKDAY_OPTIONS,
  countActiveAutopilotRules,
  normalizeAutopilotConfig,
} from '../../utils/autopilotLogic';
import {
  getAdhanChimeProfileMeta,
  normalizeAdhanChimeProfile,
} from '../../utils/adhanChimeLogic';
import {
  DEFAULT_SETTINGS_SECTION_ID,
  SETTINGS_SECTIONS,
  buildSettingsSectionSummaries,
  getSettingsSectionMeta,
  searchSettingsItems,
} from '../../utils/settingsStructureLogic';

const TIME_PHASES = [
  { id: null, label: 'Auto (Solar)' },
  { id: 0, label: 'Fajr · Dawn' },
  { id: 1, label: 'Dhuhr · Zenith' },
  { id: 2, label: 'Asr · Amber' },
  { id: 3, label: 'Maghrib · Dusk' },
  { id: 4, label: 'Isha · Night' },
];

const SectionGlyph = ({ sectionId, className = 'w-4 h-4 shrink-0' }) => {
  switch (sectionId) {
    case 'prayer':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
          <circle cx="12" cy="12" r="4" />
        </svg>
      );
    case 'autopilot':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    case 'appearance':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      );
    case 'sensory':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M11 5L6 9H2v6h4l5 4V5z" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
      );
    case 'account':
    default:
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
  }
};

const ToggleSwitch = ({
  checked,
  onClick,
  ariaLabel,
  testId,
  isLightMode,
  accentTone = 'gold',
}) => {
  const activeBg =
    accentTone === 'teal'
      ? isLightMode
        ? 'bg-[#0d9488]'
        : 'bg-[#14b8a6]'
      : isLightMode
        ? 'bg-[#9c7533]'
        : 'bg-[#d2a24b]';

  return (
    <button
      type="button"
      role="switch"
      data-testid={testId}
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={onClick}
      className={`w-12 h-6 rounded-full transition-colors duration-200 flex items-center px-1 shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d2a24b]/60 ${
        checked ? activeBg : isLightMode ? 'bg-black/15' : 'bg-white/15'
      }`}
    >
      <div
        className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform duration-200 ${
          checked ? 'translate-x-6' : 'translate-x-0'
        }`}
      />
    </button>
  );
};

const SettingsGroup = ({
  title,
  isLightMode,
  tTextSub,
  tone = 'default',
  testId,
  children,
}) => {
  const surfaceClass =
    tone === 'danger'
      ? isLightMode
        ? 'bg-[#8a0000]/[0.04] border-[#8a0000]/20'
        : 'bg-[#ff4444]/[0.04] border-[#ff4444]/20'
      : isLightMode
        ? 'bg-white/80 border-black/10'
        : 'bg-white/[0.03] border-white/10';

  const dividerClass =
    tone === 'danger'
      ? isLightMode
        ? 'divide-[#8a0000]/12'
        : 'divide-[#ff4444]/15'
      : isLightMode
        ? 'divide-black/[0.07]'
        : 'divide-white/[0.08]';

  return (
    <section className="flex flex-col gap-2" data-testid={testId}>
      {title && (
        <h4
          className={`font-serif-eng text-xs font-medium tracking-[0.08em] px-1 ${
            tone === 'danger'
              ? isLightMode
                ? 'text-[#8a0000]/80'
                : 'text-[#ff7b7b]/85'
              : `${tTextSub} opacity-70`
          }`}
        >
          {title}
        </h4>
      )}
      <div className={`w-full rounded-2xl border divide-y overflow-hidden ${surfaceClass} ${dividerClass}`}>
        {children}
      </div>
    </section>
  );
};

export const SettingsModal = ({
  isOpen,
  onClose,
  isLightMode: isLightModeProp,
  devotionData: devotionDataProp,
  prayerTimes: prayerTimesProp,
  devTimePhase: devTimePhaseProp,
  setDevTimePhase: setDevTimePhaseProp,
  atmosphere,
  onOpenCityPicker,
  onOpenReminders,
  onReplayOnboarding,
}) => {
  const sanctuaryCtx = useOptionalSanctuary();
  const prefsCtx = useOptionalPreferences();

  const devotionData = devotionDataProp ?? sanctuaryCtx?.devotionData;
  const prayerTimes = prayerTimesProp ?? sanctuaryCtx?.prayerTimes;
  const isLightMode = isLightModeProp ?? prefsCtx?.isLightMode ?? false;
  const setIsLightMode = prefsCtx?.setIsLightMode;
  const devTimePhase =
    devTimePhaseProp !== undefined ? devTimePhaseProp : prefsCtx?.devTimePhase ?? null;
  const setDevTimePhase = setDevTimePhaseProp ?? prefsCtx?.setDevTimePhase;
  const isHapticsEnabled = prefsCtx?.isHapticsEnabled ?? true;
  const toggleHapticsEnabled = prefsCtx?.toggleHapticsEnabled;
  const isTactileAudioEnabled = prefsCtx?.isTactileAudioEnabled ?? true;
  const toggleTactileAudioEnabled = prefsCtx?.toggleTactileAudioEnabled;
  const isTravelMode = prefsCtx?.isTravelMode ?? false;
  const toggleTravelMode = prefsCtx?.toggleTravelMode;

  const [activeSection, setActiveSection] = useState(DEFAULT_SETTINGS_SECTION_ID);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedItemId, setHighlightedItemId] = useState(null);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [nameInput, setNameInput] = useState(devotionData?.profile?.name || 'Seeker');
  const [nameSaved, setNameSaved] = useState(false);
  const [backupNotice, setBackupNotice] = useState(null);

  const fileInputRef = useRef(null);
  const contentScrollRef = useRef(null);
  const resetConfirmTimerRef = useRef(null);
  const nameSavedTimerRef = useRef(null);
  const highlightTimerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setNameInput(devotionData?.profile?.name || 'Seeker');
      setConfirmingReset(false);
      setNameSaved(false);
      setBackupNotice(null);
      setSearchQuery('');
      setHighlightedItemId(null);
    }
    return () => {
      if (resetConfirmTimerRef.current) {
        clearTimeout(resetConfirmTimerRef.current);
        resetConfirmTimerRef.current = null;
      }
      if (nameSavedTimerRef.current) {
        clearTimeout(nameSavedTimerRef.current);
        nameSavedTimerRef.current = null;
      }
      if (highlightTimerRef.current) {
        clearTimeout(highlightTimerRef.current);
        highlightTimerRef.current = null;
      }
    };
  }, [isOpen, devotionData?.profile?.name]);

  // Escape key closes modal (or clears active search first)
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (searchQuery.trim()) {
          setSearchQuery('');
        } else {
          hapticDismiss();
          onClose?.();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, searchQuery]);

  const sectionSummaries = useMemo(
    () =>
      buildSettingsSectionSummaries({
        prayerTimes,
        devotionData,
        isLightMode,
        devTimePhase,
        atmosphere,
        isHapticsEnabled,
        isTactileAudioEnabled,
      }),
    [
      prayerTimes,
      devotionData,
      isLightMode,
      devTimePhase,
      atmosphere,
      isHapticsEnabled,
      isTactileAudioEnabled,
    ]
  );

  const searchResults = useMemo(() => searchSettingsItems(searchQuery), [searchQuery]);

  if (!isOpen) return null;

  const isSearching = searchQuery.trim().length > 0;
  const activeSectionMeta = getSettingsSectionMeta(activeSection);

  const tTextMain = isLightMode ? 'text-[#1a1814]' : 'text-[rgba(245,238,224,0.95)]';
  const tTextSub = isLightMode ? 'text-[#524c43]' : 'text-[#ddd2be]';
  const accentHex = isLightMode ? '#9c7533' : '#d2a24b';
  const autopilot = normalizeAutopilotConfig(devotionData?.autopilot);
  const activeAutopilotCount = countActiveAutopilotRules(autopilot);
  const activeChimeId = normalizeAdhanChimeProfile(
    devotionData?.notificationChimeProfile,
    devotionData?.notificationChime !== false
  );
  const activeChimeMeta = getAdhanChimeProfileMeta(activeChimeId);
  const leadMinutes = Number(devotionData?.notificationLeadMinutes) || 0;
  const leadSummary = leadMinutes > 0 ? `${leadMinutes}m early` : 'At Adhan';

  const handleSelectSection = (sectionId) => {
    hapticDetent();
    setActiveSection(sectionId);
    setSearchQuery('');
    setHighlightedItemId(null);
    contentScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleJumpToSearchResult = (item) => {
    hapticNavigate();
    setSearchQuery('');
    setActiveSection(item.sectionId);
    setHighlightedItemId(item.id);
    if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    highlightTimerRef.current = setTimeout(() => {
      setHighlightedItemId(null);
      highlightTimerRef.current = null;
    }, 1800);
    requestAnimationFrame(() => {
      const target = document.getElementById(`setting-item-${item.id}`);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        contentScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  };

  const highlightRing = (itemId) =>
    highlightedItemId === itemId
      ? isLightMode
        ? 'bg-[#9c7533]/[0.08] transition-colors duration-300'
        : 'bg-[#d2a24b]/[0.1] transition-colors duration-300'
      : 'transition-colors duration-300';

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
      if (nameSavedTimerRef.current) clearTimeout(nameSavedTimerRef.current);
      nameSavedTimerRef.current = setTimeout(() => {
        nameSavedTimerRef.current = null;
        setNameSaved(false);
      }, 2000);
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
        setBackupNotice({
          type: 'error',
          text: 'Invalid backup file. Please choose a Ruh backup export.',
        });
      }
    } catch {
      hapticWarning();
      setBackupNotice({ type: 'error', text: 'Could not read the selected file.' });
    }
  };

  const renderSearchBox = (inputTestId) => (
    <div className="relative w-full">
      <svg
        className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-55 ${tTextSub}`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
      <input
        type="text"
        role="searchbox"
        inputMode="search"
        data-testid={inputTestId}
        aria-label="Search settings"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search settings…"
        className={`w-full min-h-[40px] pl-10 pr-8 py-2 rounded-xl border font-serif-eng text-sm outline-none transition-colors ${
          isLightMode
            ? 'bg-white/80 border-black/12 text-[#1a1814] placeholder:text-[#524c43]/55 focus:border-[#9c7533]'
            : 'bg-white/[0.04] border-white/12 text-[#f5eee0] placeholder:text-[#ddd2be]/45 focus:border-[#d2a24b]'
        }`}
      />
      {searchQuery && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => setSearchQuery('')}
          className={`absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center opacity-65 hover:opacity-100 cursor-pointer ${tTextSub}`}
        >
          <span aria-hidden="true" className="text-base leading-none">×</span>
        </button>
      )}
    </div>
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Sanctuary Settings"
      className="fixed inset-0 z-[100] flex flex-col pointer-events-auto"
    >
      {/* Calm Backdrop */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          background: isLightMode ? 'rgba(244,240,232,0.97)' : 'rgba(9,8,7,0.97)',
        }}
        onClick={() => {
          hapticDismiss();
          onClose?.();
        }}
      />

      {/* Centered Responsive Settings Workspace */}
      <div className="relative z-10 w-full max-w-4xl mx-auto h-full flex flex-col min-h-0">
        {/* Top Bar */}
        <header
          className={`w-full flex items-center justify-between gap-4 px-5 md:px-8 pb-3.5 border-b shrink-0 ${
            isLightMode ? 'border-black/10' : 'border-white/10'
          }`}
          style={{ paddingTop: 'calc(16px + var(--sat))' }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <SettingsIcon size={20} style={{ color: accentHex }} />
            <div className="flex items-baseline gap-2.5 min-w-0">
              <h2 className={`font-serif-eng text-lg font-medium tracking-[0.04em] truncate ${tTextMain}`}>
                Settings
              </h2>
              <span className={`font-calligraphy text-sm opacity-65 shrink-0 ${tTextSub}`} dir="rtl">
                الإعدادات
              </span>
            </div>
          </div>

          <button
            type="button"
            aria-label="Close Settings"
            onClick={() => {
              hapticDismiss();
              onClose?.();
            }}
            className={`w-11 h-11 rounded-full flex items-center justify-center border transition-colors cursor-pointer shrink-0 ${
              isLightMode
                ? 'bg-white/80 border-black/10 text-[#4a453d] hover:bg-black/5'
                : 'bg-white/5 border-white/12 text-[#f5eee0] hover:bg-white/10'
            }`}
          >
            <ChevronDownIcon size={20} />
          </button>
        </header>

        {/* Mobile Category Tab Strip (< md) */}
        <nav
          aria-label="Settings Categories"
          className={`md:hidden flex items-center gap-1 px-3 py-2 border-b overflow-x-auto hide-scrollbar shrink-0 ${
            isLightMode ? 'border-black/10' : 'border-white/10'
          }`}
        >
          {SETTINGS_SECTIONS.map((section) => {
            const isSelected = !isSearching && activeSection === section.id;
            return (
              <button
                key={section.id}
                type="button"
                data-testid={`settings-mobile-nav-${section.id}`}
                aria-current={isSelected ? 'page' : undefined}
                onClick={() => handleSelectSection(section.id)}
                className={`min-h-[40px] px-2.5 py-2 rounded-xl font-serif-eng text-xs font-medium whitespace-nowrap shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isSelected
                    ? isLightMode
                      ? 'bg-[#9c7533] text-white'
                      : 'bg-[#d2a24b]/20 text-[#ebd093] border border-[#d2a24b]/40'
                    : isLightMode
                      ? 'text-[#524c43] hover:bg-black/5'
                      : 'text-[#ddd2be]/75 hover:bg-white/5'
                }`}
              >
                <SectionGlyph sectionId={section.id} className="w-3.5 h-3.5 shrink-0" />
                <span>{section.shortLabel}</span>
              </button>
            );
          })}
        </nav>

        {/* Main Body: Desktop Two-Pane Split / Mobile Single Scroll */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0">
          {/* Desktop Left Category Rail */}
          <aside
            aria-label="Settings Categories"
            className={`hidden md:flex md:w-64 lg:w-72 shrink-0 flex-col gap-4 px-5 py-6 border-r overflow-y-auto hide-scrollbar ${
              isLightMode ? 'border-black/10' : 'border-white/10'
            }`}
          >
            {renderSearchBox('settings-search-input')}

            <div className="flex flex-col gap-1" role="tablist" aria-orientation="vertical">
              {SETTINGS_SECTIONS.map((section) => {
                const isSelected = !isSearching && activeSection === section.id;
                const summary = sectionSummaries[section.id];
                return (
                  <button
                    key={section.id}
                    type="button"
                    role="tab"
                    data-testid={`settings-nav-${section.id}`}
                    aria-selected={isSelected}
                    onClick={() => handleSelectSection(section.id)}
                    className={`w-full text-left px-3.5 py-3 rounded-xl transition-colors cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? isLightMode
                          ? 'bg-[#9c7533]/12 text-[#1a1814]'
                          : 'bg-[#d2a24b]/14 text-[#f5eee0]'
                        : isLightMode
                          ? 'text-[#3a352e] hover:bg-black/[0.04]'
                          : 'text-[#e4dac8]/80 hover:bg-white/[0.04]'
                    }`}
                  >
                    <span
                      className="mt-0.5 shrink-0"
                      style={{ color: isSelected ? accentHex : undefined, opacity: isSelected ? 1 : 0.6 }}
                    >
                      <SectionGlyph sectionId={section.id} className="w-4 h-4" />
                    </span>
                    <span className="min-w-0 flex-1 flex flex-col gap-0.5">
                      <span
                        className="font-serif-eng text-sm font-medium leading-snug truncate"
                        style={{ color: isSelected ? accentHex : undefined }}
                      >
                        {section.label}
                      </span>
                      <span className={`font-serif-eng text-xs truncate opacity-65 ${tTextSub}`}>
                        {summary}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Right Active Section / Search Results Pane */}
          <div
            ref={contentScrollRef}
            className="flex-1 min-w-0 overflow-y-auto hide-scrollbar px-5 md:px-8 pt-5 flex flex-col gap-6"
            style={{ paddingBottom: 'calc(28px + var(--sab))' }}
          >
            {/* Mobile Inline Search Box (scrolls with content to preserve mobile viewport space) */}
            <div className="md:hidden">
              {renderSearchBox('settings-search-input-mobile')}
            </div>

            {isSearching ? (
              <div data-testid="settings-search-results" className="flex flex-col gap-4">
                <div className="flex items-baseline justify-between gap-3">
                  <div>
                    <h3 className={`font-serif-eng text-lg font-medium ${tTextMain}`}>
                      Search Results
                    </h3>
                    <p className={`font-serif-eng text-xs mt-0.5 opacity-70 ${tTextSub}`}>
                      {searchResults.length}{' '}
                      {searchResults.length === 1 ? 'setting found' : 'settings found'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="font-serif-eng text-xs font-medium cursor-pointer hover:opacity-100 opacity-85"
                    style={{ color: accentHex }}
                  >
                    Clear search
                  </button>
                </div>

                {searchResults.length === 0 ? (
                  <div
                    className={`w-full rounded-2xl border p-6 text-center ${
                      isLightMode
                        ? 'bg-white/75 border-black/10'
                        : 'bg-white/[0.03] border-white/10'
                    }`}
                  >
                    <p className={`font-serif-eng text-sm ${tTextMain}`}>
                      No settings matched &ldquo;{searchQuery.trim()}&rdquo;
                    </p>
                    <p className={`font-serif-eng text-xs mt-1 opacity-65 ${tTextSub}`}>
                      Try searching for location, Adhan, autopilot, daylight, backup, or reset.
                    </p>
                  </div>
                ) : (
                  <SettingsGroup isLightMode={isLightMode} tTextSub={tTextSub}>
                    {searchResults.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        data-testid={`settings-search-result-${item.id}`}
                        onClick={() => handleJumpToSearchResult(item)}
                        className={`w-full text-left px-5 py-4 flex items-center justify-between gap-4 cursor-pointer transition-colors ${
                          isLightMode ? 'hover:bg-black/[0.03]' : 'hover:bg-white/[0.04]'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`font-serif-eng text-sm font-medium ${tTextMain}`}>
                              {item.title}
                            </span>
                            <span className={`font-serif-eng text-xs opacity-55 ${tTextSub}`}>
                              · {item.sectionLabel}
                            </span>
                          </div>
                          <p className={`font-serif-eng text-xs mt-0.5 opacity-70 ${tTextSub}`}>
                            {item.description}
                          </p>
                        </div>
                        <span
                          className="font-serif-eng text-xs shrink-0 opacity-85"
                          style={{ color: accentHex }}
                        >
                          Open →
                        </span>
                      </button>
                    ))}
                  </SettingsGroup>
                )}
              </div>
            ) : (
              <>
                {/* Active Category Editorial Header */}
                <div className="flex items-baseline justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2.5 flex-wrap">
                      <h3 className={`font-serif-eng text-xl font-medium ${tTextMain}`}>
                        {activeSectionMeta.label}
                      </h3>
                      <span
                        className={`font-calligraphy text-sm opacity-65 ${tTextSub}`}
                        dir="rtl"
                      >
                        {activeSectionMeta.arabic}
                      </span>
                    </div>
                    <p className={`font-serif-eng text-xs leading-relaxed mt-1 opacity-70 ${tTextSub}`}>
                      {activeSectionMeta.description}
                    </p>
                  </div>
                </div>

                {/* ======================================================
                    01. PRAYER & LOCATION
                ====================================================== */}
                {activeSection === 'prayer' && (
                  <div className="flex flex-col gap-6">
                    <SettingsGroup
                      title="Location & Calculation"
                      isLightMode={isLightMode}
                      tTextSub={tTextSub}
                      testId="settings-location-card"
                    >
                      {/* Current Location & Locality */}
                      <div
                        id="setting-item-location"
                        className={`p-5 flex flex-col gap-3.5 ${highlightRing('location')}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <span className={`font-serif-eng text-sm font-medium block ${tTextMain}`}>
                              Location &amp; Locality
                            </span>
                            {prayerTimes?.hasLocation ? (
                              <p
                                data-testid="settings-locality-label"
                                className={`font-serif-eng text-xs mt-1 truncate ${
                                  isLightMode ? 'text-[#0d9488]' : 'text-[#14b8a6]'
                                }`}
                              >
                                {prayerTimes.localityLabel || prayerTimes.cityLabel}
                                {prayerTimes.locationSubtitle
                                  ? ` · ${prayerTimes.locationSubtitle}`
                                  : ''}
                              </p>
                            ) : (
                              <p className={`font-serif-eng text-xs mt-1 opacity-65 ${tTextSub}`}>
                                Detect your locality for live prayer times, method, and Qibla direction.
                              </p>
                            )}
                          </div>
                          {prayerTimes?.coordsLabel && (
                            <span
                              className={`font-serif-eng text-xs tabular-nums opacity-55 shrink-0 ${tTextSub}`}
                            >
                              {prayerTimes.coordsLabel}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                          {prayerTimes?.requestLocation && (
                            <button
                              type="button"
                              data-testid="settings-use-current-location-btn"
                              disabled={prayerTimes.loading || prayerTimes.localityResolving}
                              onClick={() => {
                                hapticNavigate();
                                prayerTimes.requestLocation();
                              }}
                              className={`flex-1 min-h-[42px] px-4 py-2 rounded-xl border font-serif-eng text-xs font-medium tracking-[0.06em] flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-60 whitespace-nowrap ${
                                isLightMode
                                  ? 'bg-[#9c7533] border-[#9c7533] text-white hover:bg-[#8a6528]'
                                  : 'bg-[#d2a24b]/18 border-[#d2a24b]/45 text-[#f0d89e] hover:bg-[#d2a24b]/25'
                              }`}
                            >
                              <SectionGlyph sectionId="prayer" className="w-3.5 h-3.5 shrink-0" />
                              <span>
                                {prayerTimes.loading
                                  ? 'Getting GPS fix…'
                                  : prayerTimes.localityResolving
                                    ? 'Resolving locality…'
                                    : 'Use Current Location'}
                              </span>
                            </button>
                          )}
                          {onOpenCityPicker && (
                            <button
                              type="button"
                              data-testid="settings-choose-city-btn"
                              onClick={() => {
                                hapticNavigate();
                                onOpenCityPicker();
                              }}
                              className={`sm:w-auto min-h-[42px] px-4 py-2 rounded-xl border font-serif-eng text-xs font-medium tracking-[0.06em] flex items-center justify-center cursor-pointer transition-colors whitespace-nowrap ${
                                isLightMode
                                  ? 'border-black/14 text-[#1a1814] hover:bg-black/5'
                                  : 'border-white/15 text-[#f5eee0] hover:bg-white/6'
                              }`}
                            >
                              {prayerTimes?.hasLocation ? 'Change City' : 'Choose City'}
                            </button>
                          )}
                        </div>

                        {prayerTimes?.locationError && (
                          <p
                            role="alert"
                            data-testid="settings-location-error"
                            className={`font-serif-eng text-xs leading-relaxed ${
                              isLightMode ? 'text-[#b45309]' : 'text-[#fbbf24]'
                            }`}
                          >
                            {prayerTimes.locationError}
                          </p>
                        )}
                      </div>

                      {/* Regional Calculation Method */}
                      <div
                        id="setting-item-calculation_method"
                        className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${highlightRing(
                          'calculation_method'
                        )}`}
                      >
                        <div className="min-w-0">
                          <label
                            htmlFor="settings-calc-method-select"
                            className={`font-serif-eng text-sm font-medium block ${tTextMain}`}
                          >
                            Calculation Method
                          </label>
                          <p className={`font-serif-eng text-xs mt-0.5 opacity-65 ${tTextSub}`}>
                            Auto-matched to your country when using GPS, or pick manually.
                          </p>
                        </div>
                        <select
                          id="settings-calc-method-select"
                          aria-label="Prayer calculation method"
                          value={prayerTimes?.method || 'MoonsightingCommittee'}
                          onChange={(e) => {
                            hapticDetent();
                            prayerTimes?.setMethod(e.target.value);
                          }}
                          className={`sm:w-64 min-h-[40px] truncate font-serif-eng text-xs px-3 py-2 rounded-xl border outline-none transition-colors cursor-pointer ${
                            isLightMode
                              ? 'bg-white border-black/15 text-[#1a1814]'
                              : 'bg-[#14120f] border-white/15 text-[#f5eee0]'
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
                    </SettingsGroup>

                    <SettingsGroup
                      title="Adhan & Prayer Rhythm"
                      isLightMode={isLightMode}
                      tTextSub={tTextSub}
                    >
                      {/* Adhan Voice & Alerts Quick Link */}
                      {onOpenReminders && (
                        <div
                          id="setting-item-adhan_alerts"
                          data-testid="settings-adhan-alerts-row"
                          className={`p-5 flex items-center justify-between gap-4 ${highlightRing(
                            'adhan_alerts'
                          )}`}
                        >
                          <div className="min-w-0 flex-1">
                            <span className={`font-serif-eng text-sm font-medium block ${tTextMain}`}>
                              Adhan Voice &amp; Prayer Alerts
                            </span>
                            <p className={`font-serif-eng text-xs mt-0.5 opacity-70 ${tTextSub}`}>
                              {activeChimeMeta.label} · {leadSummary}
                            </p>
                          </div>
                          <button
                            type="button"
                            data-testid="settings-open-reminders-btn"
                            onClick={() => {
                              hapticNavigate();
                              onOpenReminders();
                            }}
                            className={`min-h-[38px] px-3.5 py-2 rounded-xl border font-serif-eng text-xs font-medium cursor-pointer transition-colors shrink-0 whitespace-nowrap ${
                              isLightMode
                                ? 'border-[#9c7533]/35 text-[#8a6522] hover:bg-[#9c7533]/10'
                                : 'border-[#d2a24b]/35 text-[#ebd093] hover:bg-[#d2a24b]/12'
                            }`}
                          >
                            Configure
                          </button>
                        </div>
                      )}

                      {/* Travel Mode */}
                      <div
                        id="setting-item-travel_mode"
                        data-testid="settings-travel-mode-card"
                        className={`p-5 flex items-start justify-between gap-4 ${highlightRing(
                          'travel_mode'
                        )}`}
                      >
                        <div className="min-w-0 flex-1">
                          <span className={`font-serif-eng text-sm font-medium block ${tTextMain}`}>
                            Travel Mode (Combining Prayers)
                          </span>
                          <p className={`font-serif-eng text-xs leading-relaxed mt-0.5 opacity-70 ${tTextSub}`}>
                            Unlocks upcoming prayers early for Jam&apos; Taqdim when traveling.
                          </p>
                        </div>
                        <ToggleSwitch
                          checked={isTravelMode}
                          testId="settings-travel-mode-toggle"
                          ariaLabel="Toggle Travel Mode for combining prayers"
                          isLightMode={isLightMode}
                          onClick={() => {
                            const nextEnabled = !isTravelMode;
                            hapticToggle(nextEnabled);
                            toggleTravelMode?.();
                          }}
                        />
                      </div>
                    </SettingsGroup>
                  </div>
                )}

                {/* ======================================================
                    02. QUIET AUTOPILOT
                ====================================================== */}
                {activeSection === 'autopilot' && (
                  <div className="flex flex-col gap-6">
                    <SettingsGroup
                      title="Background Rhythm"
                      isLightMode={isLightMode}
                      tTextSub={tTextSub}
                      testId="settings-autopilot-card"
                    >
                      {/* Master Autopilot Toggle */}
                      <div
                        id="setting-item-quiet_autopilot"
                        className={`p-5 flex items-start justify-between gap-4 ${highlightRing(
                          'quiet_autopilot'
                        )}`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline gap-2 flex-wrap">
                            <span className={`font-serif-eng text-sm font-medium ${tTextMain}`}>
                              Quiet Autopilot
                            </span>
                            <span
                              data-testid="settings-autopilot-status"
                              className={`font-serif-eng text-xs ${!autopilot.enabled ? tTextSub : ''}`}
                              style={{
                                color: autopilot.enabled ? accentHex : undefined,
                                opacity: autopilot.enabled ? 1 : 0.65,
                              }}
                            >
                              ·{' '}
                              {autopilot.enabled
                                ? `${activeAutopilotCount} ${activeAutopilotCount === 1 ? 'rule' : 'rules'} active`
                                : 'Off'}
                            </span>
                          </div>
                          <p className={`font-serif-eng text-xs leading-relaxed mt-1 opacity-70 ${tTextSub}`}>
                            Adjusts daytime audio, time-of-day adhkar, Fridays, and missed prayers quietly without cluttering your Sanctuary.
                          </p>
                        </div>
                        <ToggleSwitch
                          checked={autopilot.enabled}
                          testId="settings-autopilot-toggle"
                          ariaLabel="Toggle Quiet Autopilot"
                          isLightMode={isLightMode}
                          onClick={() => {
                            const willEnable = !autopilot.enabled;
                            hapticToggle(willEnable);
                            devotionData?.toggleAutopilot?.();
                          }}
                        />
                      </div>

                      {autopilot.enabled ? (
                        <div
                          data-testid="settings-autopilot-rules"
                          className={`divide-y ${
                            isLightMode ? 'divide-black/[0.07]' : 'divide-white/[0.08]'
                          }`}
                        >
                          {/* 1. Quiet Work Hours */}
                          <div
                            id="setting-item-quiet_work_hours"
                            className={`p-5 flex flex-col gap-3 ${highlightRing(
                              'quiet_work_hours'
                            )}`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0 flex-1">
                                <span className={`font-serif-eng text-sm font-medium block ${tTextMain}`}>
                                  Quiet Work Hours
                                </span>
                                <p className={`font-serif-eng text-xs leading-relaxed mt-0.5 opacity-65 ${tTextSub}`}>
                                  Silences daytime prayer audio while keeping visual reminders. Fajr is never silenced.
                                </p>
                              </div>
                              <ToggleSwitch
                                checked={autopilot.quietWorkHours}
                                testId="autopilot-quiet-hours-toggle"
                                ariaLabel="Toggle Quiet Work Hours"
                                isLightMode={isLightMode}
                                onClick={() => {
                                  const next = !autopilot.quietWorkHours;
                                  hapticToggle(next);
                                  devotionData?.updateAutopilot?.({ quietWorkHours: next });
                                }}
                              />
                            </div>

                            {autopilot.quietWorkHours && (
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-0.5">
                                {QUIET_HOURS_PRESETS.map((preset) => {
                                  const isSelected = autopilot.quietHoursPreset === preset.id;
                                  return (
                                    <button
                                      key={preset.id}
                                      type="button"
                                      data-testid={`autopilot-quiet-preset-${preset.id}`}
                                      aria-pressed={isSelected}
                                      onClick={() => {
                                        hapticDetent();
                                        devotionData?.updateAutopilot?.({
                                          quietHoursPreset: preset.id,
                                        });
                                      }}
                                      className={`min-h-[38px] px-3 py-1.5 rounded-xl font-serif-eng text-xs border transition-colors cursor-pointer whitespace-nowrap tabular-nums ${
                                        isSelected
                                          ? isLightMode
                                            ? 'bg-[#9c7533] text-white border-[#9c7533] font-medium'
                                            : 'bg-[#d2a24b]/20 text-[#ebd093] border-[#d2a24b]/50 font-medium'
                                          : isLightMode
                                            ? 'border-black/12 text-[#4a453d] hover:bg-black/5'
                                            : 'border-white/12 text-[#e4dac8]/75 hover:bg-white/5'
                                      }`}
                                    >
                                      {preset.label}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          {/* 2. Auto-Focus Time of Day */}
                          <div
                            id="setting-item-auto_focus"
                            className={`p-5 flex items-start justify-between gap-4 ${highlightRing(
                              'auto_focus'
                            )}`}
                          >
                            <div className="min-w-0 flex-1">
                              <span className={`font-serif-eng text-sm font-medium block ${tTextMain}`}>
                                Auto-Focus Time of Day
                              </span>
                              <p className={`font-serif-eng text-xs leading-relaxed mt-0.5 opacity-65 ${tTextSub}`}>
                                Opens Morning or Evening Adhkar automatically when due, then returns to Habits once done.
                              </p>
                            </div>
                            <ToggleSwitch
                              checked={autopilot.autoFocusPractice}
                              testId="autopilot-autofocus-toggle"
                              ariaLabel="Toggle Auto-Focus Time of Day"
                              isLightMode={isLightMode}
                              onClick={() => {
                                const next = !autopilot.autoFocusPractice;
                                hapticToggle(next);
                                devotionData?.updateAutopilot?.({ autoFocusPractice: next });
                              }}
                            />
                          </div>

                          {/* 3. Friday (Jumu'ah) Autopilot */}
                          <div
                            id="setting-item-friday_autopilot"
                            className={`p-5 flex items-start justify-between gap-4 ${highlightRing(
                              'friday_autopilot'
                            )}`}
                          >
                            <div className="min-w-0 flex-1">
                              <span className={`font-serif-eng text-sm font-medium block ${tTextMain}`}>
                                Friday (Jumu&apos;ah) Autopilot
                              </span>
                              <p className={`font-serif-eng text-xs leading-relaxed mt-0.5 opacity-65 ${tTextSub}`}>
                                Adds Surah Al-Kahf &amp; Salawat to your daily list on Fridays and clears it the next day.
                              </p>
                            </div>
                            <ToggleSwitch
                              checked={autopilot.fridayAutopilot}
                              testId="autopilot-friday-toggle"
                              ariaLabel="Toggle Friday Jumuah Autopilot"
                              isLightMode={isLightMode}
                              onClick={() => {
                                const next = !autopilot.fridayAutopilot;
                                hapticToggle(next);
                                devotionData?.updateAutopilot?.({ fridayAutopilot: next });
                              }}
                            />
                          </div>

                          {/* 4. Midnight Qada Sweep */}
                          <div
                            id="setting-item-midnight_qada"
                            className={`p-5 flex items-start justify-between gap-4 ${highlightRing(
                              'midnight_qada'
                            )}`}
                          >
                            <div className="min-w-0 flex-1">
                              <span className={`font-serif-eng text-sm font-medium block ${tTextMain}`}>
                                Midnight Qada Sweep
                              </span>
                              <p className={`font-serif-eng text-xs leading-relaxed mt-0.5 opacity-65 ${tTextSub}`}>
                                Records any unmarked prayers from yesterday into your private Qada ledger at day rollover.
                              </p>
                            </div>
                            <ToggleSwitch
                              checked={autopilot.midnightQadaSweep}
                              testId="autopilot-qada-sweep-toggle"
                              ariaLabel="Toggle Midnight Qada Sweep"
                              isLightMode={isLightMode}
                              onClick={() => {
                                const next = !autopilot.midnightQadaSweep;
                                hapticToggle(next);
                                devotionData?.updateAutopilot?.({ midnightQadaSweep: next });
                              }}
                            />
                          </div>

                          {/* 5. Weekly Auto-Rest Day */}
                          <div
                            id="setting-item-weekly_rest_day"
                            className={`p-5 flex flex-col gap-3 ${highlightRing(
                              'weekly_rest_day'
                            )}`}
                          >
                            <div>
                              <span className={`font-serif-eng text-sm font-medium block ${tTextMain}`}>
                                Weekly Auto-Rest Day
                              </span>
                              <p className={`font-serif-eng text-xs leading-relaxed mt-0.5 opacity-65 ${tTextSub}`}>
                                Protects your streak automatically on one chosen day each week.
                              </p>
                            </div>
                            <div className="grid grid-cols-4 gap-1.5">
                              {WEEKDAY_OPTIONS.map((opt) => {
                                const isSelected = autopilot.weeklyRestDay === opt.value;
                                const testIdSuffix = opt.value === null ? 'off' : String(opt.value);
                                return (
                                  <button
                                    key={testIdSuffix}
                                    type="button"
                                    data-testid={`autopilot-rest-day-${testIdSuffix}`}
                                    aria-pressed={isSelected}
                                    onClick={() => {
                                      hapticDetent();
                                      devotionData?.updateAutopilot?.({
                                        weeklyRestDay: opt.value,
                                      });
                                    }}
                                    className={`min-h-[38px] px-2 py-1.5 rounded-xl font-serif-eng text-xs border transition-colors cursor-pointer ${
                                      isSelected
                                        ? isLightMode
                                          ? 'bg-[#9c7533] text-white border-[#9c7533] font-medium'
                                          : 'bg-[#d2a24b]/20 text-[#ebd093] border-[#d2a24b]/50 font-medium'
                                        : isLightMode
                                          ? 'border-black/12 text-[#4a453d] hover:bg-black/5'
                                          : 'border-white/12 text-[#e4dac8]/75 hover:bg-white/5'
                                    }`}
                                  >
                                    {opt.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="px-5 py-4 flex flex-col gap-1.5">
                          <span className={`font-serif-eng text-xs font-medium opacity-80 ${tTextMain}`}>
                            Included when enabled:
                          </span>
                          <p className={`font-serif-eng text-xs leading-relaxed opacity-65 ${tTextSub}`}>
                            Quiet work hours · Auto-focused Morning &amp; Evening Adhkar · Friday Surah Al-Kahf · Midnight Qada sweep · Weekly rest day
                          </p>
                        </div>
                      )}
                    </SettingsGroup>
                  </div>
                )}

                {/* ======================================================
                    03. APPEARANCE & READING
                ====================================================== */}
                {activeSection === 'appearance' && (
                  <div className="flex flex-col gap-6">
                    <SettingsGroup
                      title="Theme & Sky"
                      isLightMode={isLightMode}
                      tTextSub={tTextSub}
                    >
                      {/* Night / Daylight Switcher */}
                      {setIsLightMode && (
                        <div
                          id="setting-item-theme_mode"
                          data-testid="settings-theme-mode-row"
                          className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${highlightRing(
                            'theme_mode'
                          )}`}
                        >
                          <div className="min-w-0">
                            <span className={`font-serif-eng text-sm font-medium block ${tTextMain}`}>
                              Theme Mode
                            </span>
                            <p className={`font-serif-eng text-xs mt-0.5 opacity-65 ${tTextSub}`}>
                              Choose between calm obsidian Night and warm parchment Daylight.
                            </p>
                          </div>
                          <div
                            className={`inline-flex items-center p-1 rounded-xl border shrink-0 self-start sm:self-auto ${
                              isLightMode
                                ? 'bg-black/[0.04] border-black/10'
                                : 'bg-white/[0.04] border-white/10'
                            }`}
                          >
                            <button
                              type="button"
                              data-testid="settings-theme-night"
                              aria-pressed={!isLightMode}
                              onClick={() => {
                                hapticDetent();
                                setIsLightMode(false);
                              }}
                              className={`min-h-[34px] px-3.5 py-1.5 rounded-lg font-serif-eng text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                                !isLightMode
                                  ? 'bg-[#d2a24b]/25 text-[#f3dca4]'
                                  : 'text-[#524c43] hover:text-[#1a1814]'
                              }`}
                            >
                              Night
                            </button>
                            <button
                              type="button"
                              data-testid="settings-theme-daylight"
                              aria-pressed={isLightMode}
                              onClick={() => {
                                hapticDetent();
                                setIsLightMode(true);
                              }}
                              className={`min-h-[34px] px-3.5 py-1.5 rounded-lg font-serif-eng text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                                isLightMode
                                  ? 'bg-[#9c7533] text-white'
                                  : 'text-[#ddd2be]/70 hover:text-[#f5eee0]'
                              }`}
                            >
                              Daylight
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Sanctuary Atmosphere */}
                      <div
                        id="setting-item-sanctuary_atmosphere"
                        data-testid="settings-atmosphere-card"
                        className={`p-5 flex flex-col gap-3 ${highlightRing(
                          'sanctuary_atmosphere'
                        )}`}
                      >
                        <div className="flex items-baseline justify-between gap-2 flex-wrap">
                          <span className={`font-serif-eng text-sm font-medium ${tTextMain}`}>
                            Sanctuary Atmosphere
                          </span>
                          {atmosphere?.meta && (
                            <span
                              data-testid="settings-atmosphere-status"
                              className="font-serif-eng text-xs shrink-0"
                              style={{ color: accentHex }}
                            >
                              {devTimePhase === null
                                ? atmosphere.source === 'solar'
                                  ? `Live Solar · ${atmosphere.meta.shortLabel}`
                                  : `Auto · ${atmosphere.meta.shortLabel}`
                                : `Locked · ${atmosphere.meta.shortLabel}`}
                            </span>
                          )}
                        </div>
                        <p className={`font-serif-eng text-xs leading-relaxed opacity-70 ${tTextSub}`}>
                          {devTimePhase === null && prayerTimes?.hasLocation
                            ? `Synced to solar prayer times in ${prayerTimes.cityLabel}. Shifts sky light and horizon warmth across the five prayers.`
                            : 'Shifts sky light, horizon warmth, and starlight across the five daily prayer windows, or lock one phase.'}
                        </p>
                        {devTimePhase === null && !prayerTimes?.hasLocation && onOpenCityPicker && (
                          <button
                            type="button"
                            onClick={() => {
                              hapticNavigate();
                              onOpenCityPicker();
                            }}
                            className="self-start font-serif-eng text-xs font-medium cursor-pointer hover:opacity-100 opacity-90 transition-opacity"
                            style={{ color: accentHex }}
                          >
                            Set location for exact solar sync →
                          </button>
                        )}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-0.5">
                          {TIME_PHASES.map((phase) => {
                            const isSelected = devTimePhase === phase.id;
                            return (
                              <button
                                key={String(phase.id)}
                                type="button"
                                data-testid={`atmosphere-phase-${
                                  phase.id === null ? 'auto' : phase.id
                                }`}
                                aria-pressed={isSelected}
                                onClick={() => {
                                  hapticDetent();
                                  if (setDevTimePhase) setDevTimePhase(phase.id);
                                }}
                                className={`min-h-[38px] px-3 py-2 rounded-xl font-serif-eng text-xs border transition-colors cursor-pointer whitespace-nowrap ${
                                  isSelected
                                    ? isLightMode
                                      ? 'bg-[#9c7533] text-white border-[#9c7533] font-medium'
                                      : 'bg-[#d2a24b]/20 text-[#ebd093] border-[#d2a24b]/50 font-medium'
                                    : isLightMode
                                      ? 'border-black/12 text-[#4a453d] hover:bg-black/5'
                                      : 'border-white/12 text-[#e4dac8]/75 hover:bg-white/5'
                                }`}
                              >
                                {phase.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </SettingsGroup>

                    <SettingsGroup
                      title="Reading & Remembrance"
                      isLightMode={isLightMode}
                      tTextSub={tTextSub}
                    >
                      {/* Simple English Translation */}
                      <div
                        id="setting-item-simple_english"
                        className={`p-5 flex items-start justify-between gap-4 ${highlightRing(
                          'simple_english'
                        )}`}
                      >
                        <div className="min-w-0 flex-1">
                          <span className={`font-serif-eng text-sm font-medium block ${tTextMain}`}>
                            Simple English Translation
                          </span>
                          <p className={`font-serif-eng text-xs leading-relaxed mt-0.5 opacity-70 ${tTextSub}`}>
                            Shows clear, everyday English across commentary and proofs.
                          </p>
                        </div>
                        <ToggleSwitch
                          checked={devotionData.isSimpleMode}
                          ariaLabel="Toggle Simple English Translation"
                          isLightMode={isLightMode}
                          onClick={() => {
                            hapticToggle(!devotionData.isSimpleMode);
                            devotionData.toggleSimpleMode();
                          }}
                        />
                      </div>

                      {/* Ambient Dhikr Whisper */}
                      <div
                        id="setting-item-ambient_dhikr"
                        className={`p-5 flex items-start justify-between gap-4 ${highlightRing(
                          'ambient_dhikr'
                        )}`}
                      >
                        <div className="min-w-0 flex-1">
                          <span
                            className={`font-serif-eng text-sm font-medium block ${
                              devotionData.isAmbientEnabled
                                ? isLightMode
                                  ? 'text-[#0d9488]'
                                  : 'text-[#14b8a6]'
                                : tTextMain
                            }`}
                          >
                            Ambient Dhikr Whisper
                          </span>
                          <p className={`font-serif-eng text-xs leading-relaxed mt-0.5 opacity-70 ${tTextSub}`}>
                            Softly rotates remembrance phrases in the Sanctuary header every 30 seconds.
                          </p>
                        </div>
                        <ToggleSwitch
                          checked={devotionData.isAmbientEnabled}
                          ariaLabel="Toggle Ambient Dhikr Whisper"
                          isLightMode={isLightMode}
                          accentTone="teal"
                          onClick={handleAmbientToggle}
                        />
                      </div>
                    </SettingsGroup>
                  </div>
                )}

                {/* ======================================================
                    04. SOUND & TOUCH
                ====================================================== */}
                {activeSection === 'sensory' && (
                  <div className="flex flex-col gap-6">
                    <SettingsGroup
                      title="Acoustic & Tactile Feedback"
                      isLightMode={isLightMode}
                      tTextSub={tTextSub}
                    >
                      {/* Tactile Audio Cues */}
                      <div
                        id="setting-item-tactile_audio"
                        data-testid="settings-tactile-audio-card"
                        className={`p-5 flex items-start justify-between gap-4 ${highlightRing(
                          'tactile_audio'
                        )}`}
                      >
                        <div className="min-w-0 flex-1">
                          <span className={`font-serif-eng text-sm font-medium block ${tTextMain}`}>
                            Tactile Audio Cues
                          </span>
                          <p className={`font-serif-eng text-xs leading-relaxed mt-0.5 opacity-70 ${tTextSub}`}>
                            Gentle acoustic cues for prayer toggles, task check-offs, Sanctuary Pass flips, and badge reveals.
                          </p>
                        </div>
                        <ToggleSwitch
                          checked={isTactileAudioEnabled}
                          ariaLabel="Toggle Tactile Audio Cues"
                          isLightMode={isLightMode}
                          onClick={() => {
                            const nextEnabled = !isTactileAudioEnabled;
                            hapticToggle(nextEnabled);
                            toggleTactileAudioEnabled?.();
                            if (nextEnabled) {
                              playTaskTickOffCue({ kind: 'prayer', force: true });
                            }
                          }}
                        />
                      </div>

                      {/* Tactile Haptics */}
                      <div
                        id="setting-item-tactile_haptics"
                        className={`p-5 flex flex-col gap-3.5 ${highlightRing('tactile_haptics')}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <span className={`font-serif-eng text-sm font-medium block ${tTextMain}`}>
                              Tactile Haptics
                            </span>
                            <p className={`font-serif-eng text-xs leading-relaxed mt-0.5 opacity-70 ${tTextSub}`}>
                              Distinct vibration signatures for task completions, navigation glides, scroll detents, and badge unlocks.
                            </p>
                          </div>
                          <ToggleSwitch
                            checked={isHapticsEnabled}
                            ariaLabel="Toggle Tactile Haptics"
                            isLightMode={isLightMode}
                            onClick={() => {
                              const nextEnabled = !isHapticsEnabled;
                              triggerHaptic(
                                nextEnabled ? HAPTIC_TYPES.TOGGLE_ON : HAPTIC_TYPES.TOGGLE_OFF,
                                { force: true }
                              );
                              toggleHapticsEnabled?.();
                            }}
                          />
                        </div>

                        {isHapticsEnabled && (
                          <div
                            data-testid="haptic-profile-previews"
                            className="flex items-center gap-2 flex-wrap"
                          >
                            <span className={`font-serif-eng text-xs opacity-60 mr-1 ${tTextSub}`}>
                              Test feel:
                            </span>
                            <button
                              type="button"
                              data-testid="haptic-preview-task"
                              onClick={() => hapticTaskComplete()}
                              className={`min-h-[34px] px-3 py-1 rounded-lg border font-serif-eng text-xs cursor-pointer transition-colors ${
                                isLightMode
                                  ? 'border-black/14 text-[#1a1814] hover:bg-black/5'
                                  : 'border-white/14 text-[#f5eee0]/90 hover:bg-white/8'
                              }`}
                            >
                              Task
                            </button>
                            <button
                              type="button"
                              data-testid="haptic-preview-navigate"
                              onClick={() => hapticNavigate()}
                              className={`min-h-[34px] px-3 py-1 rounded-lg border font-serif-eng text-xs cursor-pointer transition-colors ${
                                isLightMode
                                  ? 'border-black/14 text-[#1a1814] hover:bg-black/5'
                                  : 'border-white/14 text-[#f5eee0]/90 hover:bg-white/8'
                              }`}
                            >
                              Navigate
                            </button>
                            <button
                              type="button"
                              data-testid="haptic-preview-badge"
                              onClick={() => hapticBadgeUnlock('gold')}
                              className={`min-h-[34px] px-3 py-1 rounded-lg border font-serif-eng text-xs cursor-pointer transition-colors ${
                                isLightMode
                                  ? 'border-[#9c7533]/35 text-[#8a621c] hover:bg-[#9c7533]/10'
                                  : 'border-[#d2a24b]/35 text-[#e8c67c] hover:bg-[#d2a24b]/12'
                              }`}
                            >
                              Badge
                            </button>
                          </div>
                        )}
                      </div>
                    </SettingsGroup>
                  </div>
                )}

                {/* ======================================================
                    05. PROFILE & DATA
                ====================================================== */}
                {activeSection === 'account' && (
                  <div className="flex flex-col gap-6">
                    <SettingsGroup
                      title="Identity & Setup"
                      isLightMode={isLightMode}
                      tTextSub={tTextSub}
                    >
                      {/* Seeker Identity */}
                      <form
                        id="setting-item-seeker_identity"
                        onSubmit={handleSaveName}
                        className={`p-5 flex flex-col gap-3 ${highlightRing('seeker_identity')}`}
                      >
                        <div className="flex items-baseline justify-between gap-2">
                          <label
                            htmlFor="settings-seeker-name-input"
                            className={`font-serif-eng text-sm font-medium ${tTextMain}`}
                          >
                            Seeker Identity
                          </label>
                          {nameSaved && (
                            <span className="font-serif-eng text-xs" style={{ color: accentHex }}>
                              Updated
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2.5 w-full">
                          <input
                            id="settings-seeker-name-input"
                            type="text"
                            aria-label="Seeker Name"
                            value={nameInput}
                            onChange={(e) => setNameInput(e.target.value)}
                            placeholder="Your name"
                            className={`flex-1 min-w-0 min-h-[42px] bg-transparent border rounded-xl px-3.5 py-2 font-serif-eng text-sm outline-none transition-colors ${
                              isLightMode
                                ? 'border-black/15 text-[#1a1814] focus:border-[#9c7533]'
                                : 'border-white/15 text-white focus:border-[#d2a24b]'
                            }`}
                          />
                          <button
                            type="submit"
                            className={`min-h-[42px] px-4 py-2 rounded-xl font-serif-eng text-xs font-medium tracking-[0.06em] border transition-colors cursor-pointer shrink-0 ${
                              isLightMode
                                ? 'bg-[#9c7533] text-white border-[#9c7533] hover:bg-[#8a6528]'
                                : 'bg-[#d2a24b]/20 text-[#ebd093] border-[#d2a24b]/40 hover:bg-[#d2a24b]/30'
                            }`}
                          >
                            Save
                          </button>
                        </div>
                      </form>

                      {/* Guided Setup Replay */}
                      {onReplayOnboarding && (
                        <div
                          id="setting-item-guided_setup"
                          data-testid="settings-onboarding-card"
                          className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${highlightRing(
                            'guided_setup'
                          )}`}
                        >
                          <div className="min-w-0 flex-1">
                            <span className={`font-serif-eng text-sm font-medium block ${tTextMain}`}>
                              Guided Setup
                            </span>
                            <p className={`font-serif-eng text-xs leading-relaxed mt-0.5 opacity-70 ${tTextSub}`}>
                              Revisit your main goal, Adhan voice, location, and daily habits.
                            </p>
                          </div>
                          <button
                            type="button"
                            data-testid="settings-replay-onboarding-btn"
                            onClick={() => {
                              hapticNavigate();
                              onClose?.();
                              onReplayOnboarding();
                            }}
                            className={`min-h-[40px] px-4 py-2 rounded-xl border font-serif-eng text-xs font-medium tracking-[0.06em] transition-colors cursor-pointer shrink-0 whitespace-nowrap ${
                              isLightMode
                                ? 'border-[#9c7533]/35 text-[#7c5a1e] hover:bg-[#9c7533]/10'
                                : 'border-[#d2a24b]/35 text-[#ebd093] hover:bg-[#d2a24b]/12'
                            }`}
                          >
                            Replay Setup
                          </button>
                        </div>
                      )}
                    </SettingsGroup>

                    <SettingsGroup
                      title="Private Backup"
                      isLightMode={isLightMode}
                      tTextSub={tTextSub}
                    >
                      <div
                        id="setting-item-backup_restore"
                        className={`p-5 flex flex-col gap-3.5 ${highlightRing('backup_restore')}`}
                      >
                        <div>
                          <span className={`font-serif-eng text-sm font-medium block ${tTextMain}`}>
                            Sanctuary Backup
                          </span>
                          <p className={`font-serif-eng text-xs leading-relaxed mt-0.5 opacity-70 ${tTextSub}`}>
                            Export your prayers, streaks, Qada ledger, custom habits, and notes to a private file, or restore anytime.
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-2.5">
                          <button
                            type="button"
                            onClick={handleExportBackup}
                            className={`min-h-[42px] px-4 py-2 rounded-xl font-serif-eng text-xs font-medium tracking-[0.06em] border transition-colors cursor-pointer whitespace-nowrap ${
                              isLightMode
                                ? 'bg-[#9c7533] text-white border-[#9c7533] hover:bg-[#8a6528]'
                                : 'bg-[#d2a24b]/20 text-[#ebd093] border-[#d2a24b]/40 hover:bg-[#d2a24b]/30'
                            }`}
                          >
                            Export Backup
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              hapticNavigate();
                              fileInputRef.current?.click();
                            }}
                            className={`min-h-[42px] px-4 py-2 rounded-xl font-serif-eng text-xs font-medium tracking-[0.06em] border transition-colors cursor-pointer whitespace-nowrap ${
                              isLightMode
                                ? 'border-black/15 text-[#1a1814] hover:bg-black/5'
                                : 'border-white/15 text-[#f5eee0] hover:bg-white/6'
                            }`}
                          >
                            Restore Backup
                          </button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept=".json,application/json"
                            aria-label="Restore Sanctuary Backup"
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
                    </SettingsGroup>

                    {/* Danger Zone */}
                    <SettingsGroup
                      title="Danger Zone"
                      tone="danger"
                      isLightMode={isLightMode}
                      tTextSub={tTextSub}
                    >
                      <div
                        id="setting-item-reset_data"
                        className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 ${highlightRing(
                          'reset_data'
                        )}`}
                      >
                        <div className="min-w-0 flex-1">
                          <span
                            className={`font-serif-eng text-sm font-medium block ${
                              isLightMode ? 'text-[#8a0000]' : 'text-[#ff7b7b]'
                            }`}
                          >
                            Reset Sanctuary Journey
                          </span>
                          <p className={`font-serif-eng text-xs leading-relaxed mt-0.5 opacity-70 ${tTextSub}`}>
                            Permanently clear all progress, unlocked stations, saved reflections, and daily streaks.
                          </p>
                        </div>
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
                              if (resetConfirmTimerRef.current) {
                                clearTimeout(resetConfirmTimerRef.current);
                              }
                              resetConfirmTimerRef.current = setTimeout(() => {
                                setConfirmingReset(false);
                                resetConfirmTimerRef.current = null;
                              }, 3000);
                            }
                          }}
                          className={`min-h-[40px] px-4 py-2 rounded-xl font-serif-eng text-xs font-medium tracking-[0.06em] border transition-colors cursor-pointer shrink-0 whitespace-nowrap ${
                            isLightMode
                              ? 'text-[#8a0000] border-[#8a0000]/30 hover:bg-[#8a0000]/10'
                              : 'text-[#ff7b7b] border-[#ff7b7b]/30 hover:bg-[#ff7b7b]/12'
                          }`}
                        >
                          {confirmingReset ? 'Tap Again to Confirm' : 'Reset All Data'}
                        </button>
                      </div>
                    </SettingsGroup>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
