import { useState, useEffect, useCallback } from 'react';

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
    }
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
      return parsed;
    }
  } catch (e) {
    console.error("Failed to parse local storage", e);
  }
  return defaultState;
};

export function useDevotionData() {
  const [data, setData] = useState(getInitialState);

  // Sync to local storage whenever data changes natively
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const logPrayer = useCallback((prayerId) => {
    setData(prev => {
      const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const currentDayCount = prev.history[dateStr] || 0;
      
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
          [dateStr]: currentDayCount + 1
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
      dailyTasks: { date: currentDate, counters: {} },
      maqamat: { currentStation: 0, yaqeenProgress: 0, unlockedStations: [0], todayYaqeenGiven: 0, yaqeenDate: currentDate }
    });
  }, []);

  const logVerseSwipe = useCallback(() => {
    setData(prev => ({
      ...prev,
      totalVerses: prev.totalVerses + 1
    }));
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
        dailyTasks: { date: dateStr, counters: currentTasks }
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
    activeDays,
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
    resetData
  };
}
