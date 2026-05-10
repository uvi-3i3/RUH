import { useState, useEffect, useCallback, useMemo } from 'react';

const STORAGE_KEY = 'ruh_devotion_state';

const getInitialState = () => {
  const currentDate = new Date().toISOString().split('T')[0];
  const defaultState = { 
    totalVerses: 0, 
    totalPrayers: 0, 
    history: {}, 
    savedVerses: [], 
    dailyPrayers: { date: currentDate, completed: [] },
    dailyTasks: { date: currentDate, counters: {}, burhanCompleted: false },
    maqamat: { currentStation: 0, yaqeenProgress: 0, unlockedStations: [0], todayYaqeenGiven: 0, yaqeenDate: currentDate },
    settings: { 
      isSimpleMode: false, 
      prayers: { 
        fajr: { enabled: false, time: '05:00' }, 
        dhuhr: { enabled: false, time: '13:00' }, 
        asr: { enabled: false, time: '16:00' }, 
        maghrib: { enabled: false, time: '18:30' }, 
        isha: { enabled: false, time: '20:00' } 
      },
      customReminders: [],
      isAmbientEnabled: false
    },
    profile: null // { name, initials, joinedDate } — null means onboarding needed
  };
  
  if (typeof window === 'undefined') return defaultState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (!parsed.savedVerses) {
        parsed.savedVerses = [];
      } else {
        parsed.savedVerses = parsed.savedVerses.map(v => typeof v === 'string' ? { id: v, note: '', timestamp: Date.now() } : v);
      }
      if (!parsed.dailyPrayers || parsed.dailyPrayers.date !== currentDate) {
        parsed.dailyPrayers = { date: currentDate, completed: [] };
      }
      if (!parsed.dailyTasks || parsed.dailyTasks.date !== currentDate) {
        parsed.dailyTasks = { date: currentDate, counters: {}, burhanCompleted: false };
      } else {
        if (parsed.dailyTasks.burhanCompleted === undefined) parsed.dailyTasks.burhanCompleted = false;
      }
      if (!parsed.maqamat) {
        parsed.maqamat = { currentStation: 0, yaqeenProgress: 0, unlockedStations: [0], todayYaqeenGiven: 0, yaqeenDate: currentDate };
      } else {
        if (!parsed.maqamat.unlockedStations) parsed.maqamat.unlockedStations = [0];
      }
      if (parsed.maqamat.yaqeenDate !== currentDate) {
        parsed.maqamat = { ...parsed.maqamat, todayYaqeenGiven: 0, yaqeenDate: currentDate };
      }
      if (!parsed.settings) {
        parsed.settings = { 
          isSimpleMode: false, 
          prayers: { fajr: { enabled: false, time: '05:00' }, dhuhr: { enabled: false, time: '13:00' }, asr: { enabled: false, time: '16:00' }, maghrib: { enabled: false, time: '18:30' }, isha: { enabled: false, time: '20:00' } }, 
          customReminders: [],
          isAmbientEnabled: false
        };
      } else {
        if (!parsed.settings.prayers) {
            parsed.settings.prayers = { fajr: { enabled: false, time: '05:00' }, dhuhr: { enabled: false, time: '13:00' }, asr: { enabled: false, time: '16:00' }, maghrib: { enabled: false, time: '18:30' }, isha: { enabled: false, time: '20:00' } };
        }
        if (!parsed.settings.customReminders) {
            parsed.settings.customReminders = [];
        }
      }

      // Migrate history from old format (number) to new format ({ prayers, verses })
      if (parsed.history) {
        const keys = Object.keys(parsed.history);
        for (const key of keys) {
          if (typeof parsed.history[key] === 'number') {
            parsed.history[key] = { prayers: parsed.history[key], verses: 0 };
          }
        }
      }

      // Ensure profile key exists (null = needs onboarding)
      if (parsed.profile === undefined) parsed.profile = null;

      return parsed;
    }
  } catch (e) {
    console.error("Failed to parse local storage", e);
  }
  return defaultState;
};

/**
 * Compute streak data from the history map.
 * A "streak day" is any day with at least one prayer or verse logged.
 */
function computeStreaks(history) {
  const keys = Object.keys(history).sort();
  if (keys.length === 0) return { currentStreak: 0, longestStreak: 0 };

  let longestStreak = 1;
  let currentStreak = 1;
  let tempStreak = 1;

  // Walk through sorted dates and detect consecutive days
  for (let i = 1; i < keys.length; i++) {
    const prev = new Date(keys[i - 1]);
    const curr = new Date(keys[i]);
    const diffMs = curr.getTime() - prev.getTime();
    const diffDays = Math.round(diffMs / (1000 * 3600 * 24));

    if (diffDays === 1) {
      tempStreak++;
    } else {
      tempStreak = 1;
    }
    if (tempStreak > longestStreak) longestStreak = tempStreak;
  }

  // Current streak: count backwards from today
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  // Streak is active if today or yesterday has activity
  if (!history[today] && !history[yesterday]) {
    currentStreak = 0;
  } else {
    currentStreak = 0;
    let checkDate = new Date();
    // If today has no activity yet, start checking from yesterday
    if (!history[today]) {
      checkDate = new Date(Date.now() - 86400000);
    }
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      const entry = history[dateStr];
      const hasActivity = entry && ((entry.prayers || 0) + (entry.verses || 0) > 0);
      if (hasActivity) {
        currentStreak++;
        checkDate = new Date(checkDate.getTime() - 86400000);
      } else {
        break;
      }
    }
  }

  return { currentStreak, longestStreak: Math.max(longestStreak, currentStreak) };
}

export function useDevotionData() {
  const [data, setData] = useState(getInitialState);

  // Sync to local storage whenever data changes natively
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const logPrayer = useCallback((prayerId) => {
    setData(prev => {
      const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const currentDayEntry = prev.history[dateStr] || { prayers: 0, verses: 0 };
      
      const completedList = prev.dailyPrayers?.completed || [];
      if (completedList.includes(prayerId) && prev.dailyPrayers?.date === dateStr) {
          return prev;
      }

      const updatedDaily = prev.dailyPrayers?.date === dateStr 
         ? { ...prev.dailyPrayers, completed: [...prev.dailyPrayers.completed, prayerId] }
         : { date: dateStr, completed: [prayerId] };
      
      return {
        ...prev,
        totalPrayers: prev.totalPrayers + 1,
        history: {
          ...prev.history,
          [dateStr]: { ...currentDayEntry, prayers: currentDayEntry.prayers + 1 }
        },
        dailyPrayers: updatedDaily
      };
    });
  }, []);

  const resetData = useCallback(() => {
    const currentDate = new Date().toISOString().split('T')[0];
    localStorage.removeItem(STORAGE_KEY);
    setData({
      totalVerses: 0, 
      totalPrayers: 0, 
      history: {}, 
      savedVerses: [], 
      dailyPrayers: { date: currentDate, completed: [] },
      dailyTasks: { date: currentDate, counters: {}, burhanCompleted: false },
      maqamat: { currentStation: 0, yaqeenProgress: 0, unlockedStations: [0], todayYaqeenGiven: 0, yaqeenDate: currentDate },
      settings: { 
        isSimpleMode: false, 
        prayers: { 
          fajr: { enabled: false, time: '05:00' }, 
          dhuhr: { enabled: false, time: '13:00' }, 
          asr: { enabled: false, time: '16:00' }, 
          maghrib: { enabled: false, time: '18:30' }, 
          isha: { enabled: false, time: '20:00' } 
        },
        customReminders: [],
        isAmbientEnabled: false
      },
      profile: null
    });
  }, []);

  const logVerseSwipe = useCallback(() => {
    setData(prev => {
      const dateStr = new Date().toISOString().split('T')[0];
      const currentDayEntry = prev.history[dateStr] || { prayers: 0, verses: 0 };
      return {
        ...prev,
        totalVerses: prev.totalVerses + 1,
        history: {
          ...prev.history,
          [dateStr]: { ...currentDayEntry, verses: currentDayEntry.verses + 1 }
        }
      };
    });
  }, []);

  const incrementTask = useCallback((taskId, amount = 1) => {
    setData(prev => {
      const dateStr = new Date().toISOString().split('T')[0];
      
      const currentTasks = prev.dailyTasks?.date === dateStr 
         ? { ...prev.dailyTasks.counters }
         : {};
         
      currentTasks[taskId] = (currentTasks[taskId] || 0) + amount;
      
      return {
        ...prev,
        dailyTasks: { 
          ...prev.dailyTasks,       // BUG-03 FIX: preserve burhanCompleted and other fields
          date: dateStr, 
          counters: currentTasks 
        }
      };
    });
  }, []);

  const completeBurhan = useCallback(() => {
    setData(prev => {
      const dateStr = new Date().toISOString().split('T')[0];
      const isToday = prev.dailyTasks?.date === dateStr;
      
      if (isToday && prev.dailyTasks.burhanCompleted) return prev;
      
      const updatedTasks = isToday 
         ? { ...prev.dailyTasks, burhanCompleted: true }
         : { date: dateStr, counters: {}, burhanCompleted: true };
         
      // Add a slight Yaqeen bump for intellectual devotion
      const currentYaqeen = prev.maqamat?.yaqeenProgress || 0;
      const bumpedYaqeen = Math.min(100, currentYaqeen + 5);

      return {
        ...prev,
        dailyTasks: updatedTasks,
        maqamat: { ...prev.maqamat, yaqeenProgress: bumpedYaqeen }
      };
    });
  }, []);

  const activeDays = Object.keys(data.history).length;

  // FEAT-01: Streak tracking
  const { currentStreak, longestStreak } = useMemo(() => computeStreaks(data.history), [data.history]);

  const toggleSimpleMode = useCallback(() => {
    setData(prev => ({
      ...prev,
      settings: { ...prev.settings, isSimpleMode: !prev.settings?.isSimpleMode }
    }));
  }, []);

  const togglePrayerReminder = useCallback((prayerId) => {
    setData(prev => {
      const prayers = prev.settings.prayers;
      return {
        ...prev,
        settings: {
          ...prev.settings,
          prayers: { ...prayers, [prayerId]: { ...prayers[prayerId], enabled: !prayers[prayerId].enabled } }
        }
      };
    });
  }, []);

  const updatePrayerTime = useCallback((prayerId, timeString) => {
    setData(prev => {
      const prayers = prev.settings.prayers;
      return {
        ...prev,
        settings: {
          ...prev.settings,
          prayers: { ...prayers, [prayerId]: { ...prayers[prayerId], time: timeString } }
        }
      };
    });
  }, []);

  const addCustomReminder = useCallback((title, timeString) => {
    const id = 'custom-' + Date.now().toString();
    setData(prev => {
      return {
        ...prev,
        settings: {
          ...prev.settings,
          customReminders: [...prev.settings.customReminders, { id, title, time: timeString, enabled: true }]
        }
      };
    });
    return id;
  }, []);

  const toggleCustomReminder = useCallback((id) => {
    setData(prev => {
      return {
        ...prev,
        settings: {
          ...prev.settings,
          customReminders: prev.settings.customReminders.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r)
        }
      };
    });
  }, []);

  const deleteCustomReminder = useCallback((id) => {
    setData(prev => {
      return {
        ...prev,
        settings: {
          ...prev.settings,
          customReminders: prev.settings.customReminders.filter(r => r.id !== id)
        }
      };
    });
  }, []);

  const toggleSaveVerse = useCallback((verseId, skipUnsave = false) => {
    setData(prev => {
      const isSaved = prev.savedVerses.some(v => v.id === verseId);
      if (isSaved && !skipUnsave) {
        return { ...prev, savedVerses: prev.savedVerses.filter(v => v.id !== verseId) };
      } else if (!isSaved) {
        return { ...prev, savedVerses: [...prev.savedVerses, { id: verseId, note: '', timestamp: Date.now() }] };
      }
      return prev;
    });
  }, []);

  const updateVerseNote = useCallback((verseId, note) => {
    setData(prev => ({
      ...prev,
      savedVerses: prev.savedVerses.map(v => v.id === verseId ? { ...v, note } : v)
    }));
  }, []);

  const addYaqeen = useCallback((amount) => {
    setData(prev => {
      const m = prev.maqamat || { currentStation: 0, yaqeenProgress: 0, unlockedStations: [0], todayYaqeenGiven: 0, yaqeenDate: '' };
      const newProgress = Math.min(100, m.yaqeenProgress + amount);
      return { ...prev, maqamat: { ...m, yaqeenProgress: newProgress } };
    });
  }, []);

  const advanceStation = useCallback(() => {
    setData(prev => {
      const m = prev.maqamat;
      const nextIdx = m.currentStation + 1;
      const newUnlocked = m.unlockedStations.includes(nextIdx) ? m.unlockedStations : [...m.unlockedStations, nextIdx];
      return { ...prev, maqamat: { ...m, currentStation: nextIdx, yaqeenProgress: 0, unlockedStations: newUnlocked } };
    });
  }, []);

  const goToStation = useCallback((idx) => {
    setData(prev => {
      const unlocked = prev.maqamat?.unlockedStations || [0];
      if (!unlocked.includes(idx)) return prev;
      return { ...prev, maqamat: { ...prev.maqamat, currentStation: idx } };
    });
  }, []);

  const toggleAmbientMode = useCallback(() => {
    setData(prev => ({
      ...prev,
      settings: { ...prev.settings, isAmbientEnabled: !prev.settings?.isAmbientEnabled }
    }));
  }, []);

  // UX-02: Profile management
  const setProfile = useCallback((name) => {
    const initials = name.trim().split(/\s+/).map(w => w[0]?.toUpperCase() || '').join('').slice(0, 2);
    const joinedDate = new Date().toISOString().split('T')[0];
    setData(prev => ({
      ...prev,
      profile: { name: name.trim(), initials, joinedDate }
    }));
  }, []);

  return {
    totalVerses: data.totalVerses,
    totalPrayers: data.totalPrayers,
    history: data.history,
    savedVerses: data.savedVerses,
    dailyCompletedPrayers: data.dailyPrayers?.completed || [],
    dailyTasks: data.dailyTasks?.counters || {},
    maqamat: data.maqamat,
    isSimpleMode: data.settings?.isSimpleMode || false,
    isAmbientEnabled: data.settings?.isAmbientEnabled || false,
    prayers: data.settings?.prayers || {},
    customReminders: data.settings?.customReminders || [],
    profile: data.profile,
    activeDays,
    currentStreak,
    longestStreak,
    logPrayer,
    logVerseSwipe,
    toggleSaveVerse,
    updateVerseNote,
    incrementTask,
    completeBurhan,
    addYaqeen,
    advanceStation,
    goToStation,
    toggleSimpleMode,
    toggleAmbientMode,
    togglePrayerReminder,
    updatePrayerTime,
    addCustomReminder,
    toggleCustomReminder,
    deleteCustomReminder,
    setProfile,
    resetData
  };
}
