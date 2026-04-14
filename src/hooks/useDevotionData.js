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
    dailyTasks: { date: currentDate, counters: {} },
    maqamat: { currentStation: 0, yaqeenProgress: 0, unlockedStations: [0], todayYaqeenGiven: 0, yaqeenDate: currentDate }
  };
  
  if (typeof window === 'undefined') return defaultState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (!parsed.savedVerses) parsed.savedVerses = [];
      if (!parsed.dailyPrayers || parsed.dailyPrayers.date !== currentDate) {
        parsed.dailyPrayers = { date: currentDate, completed: [] };
      }
      if (!parsed.dailyTasks || parsed.dailyTasks.date !== currentDate) {
        parsed.dailyTasks = { date: currentDate, counters: {} };
      }
      if (!parsed.maqamat) {
        parsed.maqamat = { currentStation: 0, yaqeenProgress: 0, unlockedStations: [0], todayYaqeenGiven: 0, yaqeenDate: currentDate };
      }
      if (parsed.maqamat.yaqeenDate !== currentDate) {
        parsed.maqamat = { ...parsed.maqamat, todayYaqeenGiven: 0, yaqeenDate: currentDate };
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
      
      if (prev.dailyPrayers?.completed.includes(prayerId) && prev.dailyPrayers?.date === dateStr) {
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

  const activeDays = Object.keys(data.history).length;

  const toggleSaveVerse = useCallback((verseId) => {
    setData(prev => {
      const isSaved = prev.savedVerses.includes(verseId);
      const newSaved = isSaved 
        ? prev.savedVerses.filter(id => id !== verseId)
        : [...prev.savedVerses, verseId];
      return { ...prev, savedVerses: newSaved };
    });
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
      if (!prev.maqamat.unlockedStations.includes(idx)) return prev;
      return { ...prev, maqamat: { ...prev.maqamat, currentStation: idx } };
    });
  }, []);

  return {
    totalVerses: data.totalVerses,
    totalPrayers: data.totalPrayers,
    history: data.history,
    savedVerses: data.savedVerses,
    dailyCompletedPrayers: data.dailyPrayers?.completed || [],
    dailyTasks: data.dailyTasks?.counters || {},
    maqamat: data.maqamat,
    activeDays,
    logPrayer,
    logVerseSwipe,
    toggleSaveVerse,
    incrementTask,
    addYaqeen,
    advanceStation,
    goToStation,
    resetData
  };
}
