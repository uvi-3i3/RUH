import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDevotionData } from '../hooks/useDevotionData';
import { usePrayerTimes } from '../hooks/usePrayerTimes';
import { useLocalNotifications } from '../hooks/useLocalNotifications';
import { syncStatusBarTheme } from '../native';
import {
  hydrateMissingFromPreferences,
  mirroredRemove,
  mirroredSet,
} from '../utils/nativeStorage';
import {
  PREFERENCE_STORAGE_KEYS,
  computeHabitCompletionSummary,
  parseAtmospherePhase,
  parseHapticsEnabled,
  parseTactileAudioEnabled,
  parseThemeMode,
  serializeAtmospherePhase,
  serializeHapticsEnabled,
  serializeTactileAudioEnabled,
  serializeThemeMode,
} from '../utils/preferencesLogic';
import { setHapticsEnabled } from '../utils/haptics';
import { setTactileAudioEnabled } from '../utils/tactileAudio';
import {
  HabitsContext,
  PreferencesContext,
  SanctuaryContext,
} from './sanctuaryStore';

function loadInitialThemeMode() {
  if (typeof window === 'undefined') return false;
  try {
    return parseThemeMode(localStorage.getItem(PREFERENCE_STORAGE_KEYS.THEME_MODE));
  } catch {
    return false;
  }
}

function loadInitialAtmospherePhase() {
  if (typeof window === 'undefined') return null;
  try {
    return parseAtmospherePhase(localStorage.getItem(PREFERENCE_STORAGE_KEYS.ATMOSPHERE_PHASE));
  } catch {
    return null;
  }
}

function loadInitialHapticsEnabled() {
  if (typeof window === 'undefined') return true;
  try {
    return parseHapticsEnabled(localStorage.getItem(PREFERENCE_STORAGE_KEYS.HAPTICS_ENABLED));
  } catch {
    return true;
  }
}

function loadInitialTactileAudioEnabled() {
  if (typeof window === 'undefined') return true;
  try {
    return parseTactileAudioEnabled(
      localStorage.getItem(PREFERENCE_STORAGE_KEYS.TACTILE_AUDIO_ENABLED)
    );
  } catch {
    return true;
  }
}

export function SanctuaryProvider({ children }) {
  const devotionData = useDevotionData();
  const prayerTimes = usePrayerTimes();
  const notifications = useLocalNotifications({ devotionData, prayerTimes });

  const [isLightMode, setIsLightMode] = useState(loadInitialThemeMode);
  const [devTimePhase, setDevTimePhaseState] = useState(loadInitialAtmospherePhase);
  const [isHapticsEnabled, setIsHapticsEnabledState] = useState(loadInitialHapticsEnabled);
  const [isTactileAudioEnabled, setIsTactileAudioEnabledState] = useState(
    loadInitialTactileAudioEnabled
  );

  const toggleLightMode = useCallback(() => {
    setIsLightMode((prev) => !prev);
  }, []);

  const setDevTimePhase = useCallback((nextPhase) => {
    setDevTimePhaseState(parseAtmospherePhase(nextPhase));
  }, []);

  const toggleHapticsEnabled = useCallback(() => {
    setIsHapticsEnabledState((prev) => !prev);
  }, []);

  const toggleTactileAudioEnabled = useCallback(() => {
    setIsTactileAudioEnabledState((prev) => !prev);
  }, []);

  // Hydrate preference keys from native Capacitor Preferences if WebView storage was purged
  useEffect(() => {
    let cancelled = false;
    hydrateMissingFromPreferences([
      PREFERENCE_STORAGE_KEYS.THEME_MODE,
      PREFERENCE_STORAGE_KEYS.ATMOSPHERE_PHASE,
      PREFERENCE_STORAGE_KEYS.HAPTICS_ENABLED,
      PREFERENCE_STORAGE_KEYS.TACTILE_AUDIO_ENABLED,
    ]).then((recovered) => {
      if (cancelled) return;
      if (recovered[PREFERENCE_STORAGE_KEYS.THEME_MODE]) {
        setIsLightMode(parseThemeMode(recovered[PREFERENCE_STORAGE_KEYS.THEME_MODE]));
      }
      if (recovered[PREFERENCE_STORAGE_KEYS.ATMOSPHERE_PHASE] !== undefined) {
        setDevTimePhaseState(
          parseAtmospherePhase(recovered[PREFERENCE_STORAGE_KEYS.ATMOSPHERE_PHASE])
        );
      }
      if (recovered[PREFERENCE_STORAGE_KEYS.HAPTICS_ENABLED] !== undefined) {
        setIsHapticsEnabledState(
          parseHapticsEnabled(recovered[PREFERENCE_STORAGE_KEYS.HAPTICS_ENABLED])
        );
      }
      if (recovered[PREFERENCE_STORAGE_KEYS.TACTILE_AUDIO_ENABLED] !== undefined) {
        setIsTactileAudioEnabledState(
          parseTactileAudioEnabled(recovered[PREFERENCE_STORAGE_KEYS.TACTILE_AUDIO_ENABLED])
        );
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Sync theme mode to storage + native StatusBar
  useEffect(() => {
    mirroredSet(PREFERENCE_STORAGE_KEYS.THEME_MODE, serializeThemeMode(isLightMode));
    syncStatusBarTheme(isLightMode);
  }, [isLightMode]);

  // Sync atmosphere override to storage
  useEffect(() => {
    const serialized = serializeAtmospherePhase(devTimePhase);
    if (serialized === null) {
      mirroredRemove(PREFERENCE_STORAGE_KEYS.ATMOSPHERE_PHASE);
    } else {
      mirroredSet(PREFERENCE_STORAGE_KEYS.ATMOSPHERE_PHASE, serialized);
    }
  }, [devTimePhase]);

  // Sync haptic toggle to storage and haptics runtime module
  useEffect(() => {
    setHapticsEnabled(isHapticsEnabled);
    mirroredSet(PREFERENCE_STORAGE_KEYS.HAPTICS_ENABLED, serializeHapticsEnabled(isHapticsEnabled));
  }, [isHapticsEnabled]);

  // Sync tactile audio toggle to storage and audio runtime module
  useEffect(() => {
    setTactileAudioEnabled(isTactileAudioEnabled);
    mirroredSet(
      PREFERENCE_STORAGE_KEYS.TACTILE_AUDIO_ENABLED,
      serializeTactileAudioEnabled(isTactileAudioEnabled)
    );
  }, [isTactileAudioEnabled]);

  // Keep top-level preference keys reactive across tabs/windows
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const handleStorage = (e) => {
      if (e.key === PREFERENCE_STORAGE_KEYS.THEME_MODE) {
        setIsLightMode(parseThemeMode(e.newValue));
      } else if (e.key === PREFERENCE_STORAGE_KEYS.ATMOSPHERE_PHASE) {
        setDevTimePhaseState(parseAtmospherePhase(e.newValue));
      } else if (e.key === PREFERENCE_STORAGE_KEYS.HAPTICS_ENABLED) {
        setIsHapticsEnabledState(parseHapticsEnabled(e.newValue));
      } else if (e.key === PREFERENCE_STORAGE_KEYS.TACTILE_AUDIO_ENABLED) {
        setIsTactileAudioEnabledState(parseTactileAudioEnabled(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const preferencesValue = useMemo(
    () => ({
      isLightMode,
      setIsLightMode,
      toggleLightMode,
      devTimePhase,
      setDevTimePhase,
      isHapticsEnabled,
      setIsHapticsEnabled: setIsHapticsEnabledState,
      toggleHapticsEnabled,
      isTactileAudioEnabled,
      setIsTactileAudioEnabled: setIsTactileAudioEnabledState,
      toggleTactileAudioEnabled,
      isSimpleMode: devotionData.isSimpleMode,
      toggleSimpleMode: devotionData.toggleSimpleMode,
      isAmbientEnabled: devotionData.isAmbientEnabled,
      toggleAmbientMode: devotionData.toggleAmbientMode,
      notificationLeadMinutes: devotionData.notificationLeadMinutes,
      setNotificationLeadMinutes: devotionData.setNotificationLeadMinutes,
      notificationChime: devotionData.notificationChime,
      toggleNotificationChime: devotionData.toggleNotificationChime,
      prayers: devotionData.prayers,
      customReminders: devotionData.customReminders,
      profile: devotionData.profile,
      setProfile: devotionData.setProfile,
      togglePrayerReminder: devotionData.togglePrayerReminder,
      updatePrayerTime: devotionData.updatePrayerTime,
      setAllPrayerRemindersEnabled: devotionData.setAllPrayerRemindersEnabled,
      syncPrayerReminderTimes: devotionData.syncPrayerReminderTimes,
      addCustomReminder: devotionData.addCustomReminder,
      toggleCustomReminder: devotionData.toggleCustomReminder,
      deleteCustomReminder: devotionData.deleteCustomReminder,
      prayerMethod: prayerTimes.method,
      setPrayerMethod: prayerTimes.setMethod,
      location: prayerTimes.location,
      cityLabel: prayerTimes.cityLabel,
      hasLocation: prayerTimes.hasLocation,
      selectCity: prayerTimes.selectCity,
      requestLocation: prayerTimes.requestLocation,
    }),
    [
      isLightMode,
      toggleLightMode,
      devTimePhase,
      setDevTimePhase,
      isHapticsEnabled,
      toggleHapticsEnabled,
      isTactileAudioEnabled,
      toggleTactileAudioEnabled,
      devotionData.isSimpleMode,
      devotionData.toggleSimpleMode,
      devotionData.isAmbientEnabled,
      devotionData.toggleAmbientMode,
      devotionData.notificationLeadMinutes,
      devotionData.setNotificationLeadMinutes,
      devotionData.notificationChime,
      devotionData.toggleNotificationChime,
      devotionData.prayers,
      devotionData.customReminders,
      devotionData.profile,
      devotionData.setProfile,
      devotionData.togglePrayerReminder,
      devotionData.updatePrayerTime,
      devotionData.setAllPrayerRemindersEnabled,
      devotionData.syncPrayerReminderTimes,
      devotionData.addCustomReminder,
      devotionData.toggleCustomReminder,
      devotionData.deleteCustomReminder,
      prayerTimes.method,
      prayerTimes.setMethod,
      prayerTimes.location,
      prayerTimes.cityLabel,
      prayerTimes.hasLocation,
      prayerTimes.selectCity,
      prayerTimes.requestLocation,
    ]
  );

  const habitSummary = useMemo(
    () => computeHabitCompletionSummary(devotionData.habits, devotionData.dailyHabitLogs),
    [devotionData.habits, devotionData.dailyHabitLogs]
  );

  const habitsValue = useMemo(
    () => ({
      habits: devotionData.habits,
      dailyHabitLogs: devotionData.dailyHabitLogs,
      completedHabitsCount: habitSummary.completedHabitsCount,
      totalHabitsCount: habitSummary.totalHabitsCount,
      dailyIntention: devotionData.dailyIntention,
      setDailyIntention: devotionData.setDailyIntention,
      dailyTodos: devotionData.dailyTodos,
      addDailyTodo: devotionData.addDailyTodo,
      toggleDailyTodo: devotionData.toggleDailyTodo,
      removeDailyTodo: devotionData.removeDailyTodo,
      clearCompletedDailyTodos: devotionData.clearCompletedDailyTodos,
      logHabitStep: devotionData.logHabitStep,
      addCustomHabit: devotionData.addCustomHabit,
      updateHabit: devotionData.updateHabit,
      reorderHabit: devotionData.reorderHabit,
      resetDefaultHabits: devotionData.resetDefaultHabits,
      removeHabit: devotionData.removeHabit,
    }),
    [
      devotionData.habits,
      devotionData.dailyHabitLogs,
      habitSummary.completedHabitsCount,
      habitSummary.totalHabitsCount,
      devotionData.dailyIntention,
      devotionData.setDailyIntention,
      devotionData.dailyTodos,
      devotionData.addDailyTodo,
      devotionData.toggleDailyTodo,
      devotionData.removeDailyTodo,
      devotionData.clearCompletedDailyTodos,
      devotionData.logHabitStep,
      devotionData.addCustomHabit,
      devotionData.updateHabit,
      devotionData.reorderHabit,
      devotionData.resetDefaultHabits,
      devotionData.removeHabit,
    ]
  );

  const sanctuaryValue = useMemo(
    () => ({
      devotionData,
      prayerTimes,
      notifications,
      preferences: preferencesValue,
      habits: habitsValue,
    }),
    [devotionData, prayerTimes, notifications, preferencesValue, habitsValue]
  );

  return (
    <SanctuaryContext.Provider value={sanctuaryValue}>
      <PreferencesContext.Provider value={preferencesValue}>
        <HabitsContext.Provider value={habitsValue}>{children}</HabitsContext.Provider>
      </PreferencesContext.Provider>
    </SanctuaryContext.Provider>
  );
}
