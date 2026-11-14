import { useState, useEffect, useCallback, useMemo } from 'react';
import { getLocalDateStr, computeStreaks } from '../utils/devotionLogic';

const STORAGE_KEY = 'ruh_devotion_state';

const getDefaultDailyPrayers = (dateStr) => ({
  date: dateStr,
  completed: [],
  statuses: {},
  allFiveRewarded: false,
});

const getDefaultDailyTasks = (dateStr) => ({
  date: dateStr,
  counters: {},
  burhanCompleted: false,
  rewardedIds: [],
  rewardedSets: [],
});

const getInitialState = () => {
  const currentDate = getLocalDateStr();
  const defaultProfile = {
    name: 'Seeker',
    initials: 'SK',
    joinedDate: currentDate,
  };

  const defaultState = {
    totalVerses: 0,
    totalPrayers: 0,
    history: {},
    savedVerses: [],
    dailyPrayers: getDefaultDailyPrayers(currentDate),
    dailyTasks: getDefaultDailyTasks(currentDate),
    burhanNotes: {},
    maqamat: {
      currentStation: 0,
      yaqeenProgress: 0,
      unlockedStations: [0],
      todayYaqeenGiven: 0,
      yaqeenDate: currentDate,
    },
    settings: {
      isSimpleMode: false,
      prayers: {
        fajr: { enabled: false, time: '05:15' },
        dhuhr: { enabled: false, time: '12:45' },
        asr: { enabled: false, time: '16:15' },
        maghrib: { enabled: false, time: '18:30' },
        isha: { enabled: false, time: '20:00' },
      },
      customReminders: [],
      isAmbientEnabled: false,
    },
    profile: defaultProfile,
  };

  if (typeof window === 'undefined') return defaultState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (!parsed.savedVerses) {
        parsed.savedVerses = [];
      } else {
        parsed.savedVerses = parsed.savedVerses.map((v) =>
          typeof v === 'string' ? { id: v, note: '', timestamp: Date.now() } : v
        );
      }

      if (!parsed.dailyPrayers || parsed.dailyPrayers.date !== currentDate) {
        parsed.dailyPrayers = getDefaultDailyPrayers(currentDate);
      } else {
        const completed = Array.isArray(parsed.dailyPrayers.completed)
          ? parsed.dailyPrayers.completed
          : [];
        const statuses = { ...(parsed.dailyPrayers.statuses || {}) };
        for (const id of completed) {
          if (!statuses[id]) statuses[id] = 'ontime';
        }
        parsed.dailyPrayers = {
          date: currentDate,
          completed,
          statuses,
          allFiveRewarded: Boolean(parsed.dailyPrayers.allFiveRewarded),
        };
      }

      if (!parsed.dailyTasks || parsed.dailyTasks.date !== currentDate) {
        parsed.dailyTasks = getDefaultDailyTasks(currentDate);
      } else {
        if (parsed.dailyTasks.burhanCompleted === undefined) {
          parsed.dailyTasks.burhanCompleted = false;
        }
        if (!parsed.dailyTasks.rewardedIds) parsed.dailyTasks.rewardedIds = [];
        if (!parsed.dailyTasks.rewardedSets) parsed.dailyTasks.rewardedSets = [];
      }

      if (!parsed.burhanNotes || typeof parsed.burhanNotes !== 'object') {
        parsed.burhanNotes = {};
      }

      if (!parsed.maqamat) {
        parsed.maqamat = defaultState.maqamat;
      } else if (!parsed.maqamat.unlockedStations) {
        parsed.maqamat.unlockedStations = [0];
      }
      if (parsed.maqamat.yaqeenDate !== currentDate) {
        parsed.maqamat = { ...parsed.maqamat, todayYaqeenGiven: 0, yaqeenDate: currentDate };
      }

      if (!parsed.settings) {
        parsed.settings = defaultState.settings;
      } else {
        if (!parsed.settings.prayers) {
          parsed.settings.prayers = defaultState.settings.prayers;
        }
        if (!parsed.settings.customReminders) {
          parsed.settings.customReminders = [];
        }
      }

      if (parsed.history) {
        const keys = Object.keys(parsed.history);
        for (const key of keys) {
          if (typeof parsed.history[key] === 'number') {
            parsed.history[key] = { prayers: parsed.history[key], verses: 0 };
          }
        }
      }

      if (!parsed.profile) {
        parsed.profile = defaultProfile;
      }

      return parsed;
    }
  } catch (e) {
    console.error('Failed to parse local storage', e);
  }
  return defaultState;
};

export function useDevotionData() {
  const [data, setData] = useState(getInitialState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Could not save devotion state', e);
    }
  }, [data]);

  const togglePrayer = useCallback((prayerId, preferredStatus = 'ontime') => {
    setData((prev) => {
      const dateStr = getLocalDateStr();
      const isToday = prev.dailyPrayers?.date === dateStr;
      const baseDaily = isToday ? prev.dailyPrayers : getDefaultDailyPrayers(dateStr);
      const completedList = baseDaily.completed || [];
      const statuses = { ...(baseDaily.statuses || {}) };
      const currentDayEntry = prev.history[dateStr] || { prayers: 0, verses: 0 };

      if (completedList.includes(prayerId)) {
        // Undo logged prayer accurately
        const nextCompleted = completedList.filter((id) => id !== prayerId);
        delete statuses[prayerId];
        const nextDayPrayers = Math.max(0, (currentDayEntry.prayers || 0) - 1);
        const nextHistory = { ...prev.history };
        if (
          nextDayPrayers === 0 &&
          (currentDayEntry.verses || 0) === 0 &&
          (currentDayEntry.practices || 0) === 0
        ) {
          delete nextHistory[dateStr];
        } else {
          nextHistory[dateStr] = { ...currentDayEntry, prayers: nextDayPrayers };
        }
        return {
          ...prev,
          totalPrayers: Math.max(0, prev.totalPrayers - 1),
          history: nextHistory,
          dailyPrayers: {
            ...baseDaily,
            completed: nextCompleted,
            statuses,
          },
        };
      }

      const nextCompleted = [...completedList, prayerId];
      statuses[prayerId] = preferredStatus;

      let nextMaqamat = prev.maqamat;
      let nextRewardedFlag = baseDaily.allFiveRewarded;
      if (nextCompleted.length === 5 && !baseDaily.allFiveRewarded) {
        nextRewardedFlag = true;
        nextMaqamat = {
          ...prev.maqamat,
          yaqeenProgress: Math.min(100, (prev.maqamat?.yaqeenProgress || 0) + 20),
        };
      }

      return {
        ...prev,
        totalPrayers: prev.totalPrayers + 1,
        history: {
          ...prev.history,
          [dateStr]: { ...currentDayEntry, prayers: (currentDayEntry.prayers || 0) + 1 },
        },
        dailyPrayers: {
          date: dateStr,
          completed: nextCompleted,
          statuses,
          allFiveRewarded: nextRewardedFlag,
        },
        maqamat: nextMaqamat,
      };
    });
  }, []);

  const logPrayer = useCallback(
    (prayerId, status = 'ontime') => {
      togglePrayer(prayerId, status);
    },
    [togglePrayer]
  );

  const resetData = useCallback(() => {
    const currentDate = getLocalDateStr();
    localStorage.removeItem(STORAGE_KEY);
    setData({
      totalVerses: 0,
      totalPrayers: 0,
      history: {},
      savedVerses: [],
      dailyPrayers: getDefaultDailyPrayers(currentDate),
      dailyTasks: getDefaultDailyTasks(currentDate),
      burhanNotes: {},
      maqamat: {
        currentStation: 0,
        yaqeenProgress: 0,
        unlockedStations: [0],
        todayYaqeenGiven: 0,
        yaqeenDate: currentDate,
      },
      settings: {
        isSimpleMode: false,
        prayers: {
          fajr: { enabled: false, time: '05:15' },
          dhuhr: { enabled: false, time: '12:45' },
          asr: { enabled: false, time: '16:15' },
          maghrib: { enabled: false, time: '18:30' },
          isha: { enabled: false, time: '20:00' },
        },
        customReminders: [],
        isAmbientEnabled: false,
      },
      profile: { name: 'Seeker', initials: 'SK', joinedDate: currentDate },
    });
  }, []);

  const logVerseSwipe = useCallback(() => {
    setData((prev) => {
      const dateStr = getLocalDateStr();
      const currentDayEntry = prev.history[dateStr] || { prayers: 0, verses: 0 };
      return {
        ...prev,
        totalVerses: prev.totalVerses + 1,
        history: {
          ...prev.history,
          [dateStr]: { ...currentDayEntry, verses: (currentDayEntry.verses || 0) + 1 },
        },
      };
    });
  }, []);

  const incrementTask = useCallback((taskId, amount = 1) => {
    setData((prev) => {
      const dateStr = getLocalDateStr();
      const baseTasks =
        prev.dailyTasks?.date === dateStr ? prev.dailyTasks : getDefaultDailyTasks(dateStr);
      const currentCounters = { ...(baseTasks.counters || {}) };
      const prevVal = currentCounters[taskId] || 0;
      const nextVal = Math.max(0, prevVal + amount);
      currentCounters[taskId] = nextVal;

      const delta = nextVal - prevVal;
      const currentDayEntry = prev.history[dateStr] || { prayers: 0, verses: 0, practices: 0 };
      const nextDayPractices = Math.max(0, (currentDayEntry.practices || 0) + (delta > 0 ? 1 : delta < 0 ? -1 : 0));
      const nextHistory = { ...prev.history };
      if (
        (currentDayEntry.prayers || 0) === 0 &&
        (currentDayEntry.verses || 0) === 0 &&
        nextDayPractices === 0
      ) {
        delete nextHistory[dateStr];
      } else {
        nextHistory[dateStr] = {
          prayers: currentDayEntry.prayers || 0,
          verses: currentDayEntry.verses || 0,
          practices: nextDayPractices,
        };
      }

      return {
        ...prev,
        history: nextHistory,
        dailyTasks: {
          ...baseTasks,
          date: dateStr,
          counters: currentCounters,
        },
      };
    });
  }, []);

  const completeBurhan = useCallback(() => {
    setData((prev) => {
      const dateStr = getLocalDateStr();
      const isToday = prev.dailyTasks?.date === dateStr;

      if (isToday && prev.dailyTasks.burhanCompleted) return prev;

      const updatedTasks = isToday
        ? { ...prev.dailyTasks, burhanCompleted: true }
        : { ...getDefaultDailyTasks(dateStr), burhanCompleted: true };

      const currentYaqeen = prev.maqamat?.yaqeenProgress || 0;
      const bumpedYaqeen = Math.min(100, currentYaqeen + 5);
      const currentDayEntry = prev.history[dateStr] || { prayers: 0, verses: 0, practices: 0 };

      return {
        ...prev,
        history: {
          ...prev.history,
          [dateStr]: {
            prayers: currentDayEntry.prayers || 0,
            verses: currentDayEntry.verses || 0,
            practices: (currentDayEntry.practices || 0) + 1,
          },
        },
        dailyTasks: updatedTasks,
        maqamat: { ...prev.maqamat, yaqeenProgress: bumpedYaqeen },
      };
    });
  }, []);

  const saveBurhanNote = useCallback((burhanId, note) => {
    if (!burhanId) return;
    setData((prev) => {
      const nextNotes = { ...(prev.burhanNotes || {}) };
      const cleaned = (note || '').trim();
      if (cleaned) nextNotes[burhanId] = cleaned;
      else delete nextNotes[burhanId];
      return { ...prev, burhanNotes: nextNotes };
    });
  }, []);

  const activeDays = Object.keys(data.history).length;
  const { currentStreak, longestStreak } = useMemo(
    () => computeStreaks(data.history),
    [data.history]
  );

  const toggleSimpleMode = useCallback(() => {
    setData((prev) => ({
      ...prev,
      settings: { ...prev.settings, isSimpleMode: !prev.settings?.isSimpleMode },
    }));
  }, []);

  const togglePrayerReminder = useCallback((prayerId) => {
    setData((prev) => {
      const prayers = prev.settings.prayers;
      return {
        ...prev,
        settings: {
          ...prev.settings,
          prayers: {
            ...prayers,
            [prayerId]: { ...prayers[prayerId], enabled: !prayers[prayerId].enabled },
          },
        },
      };
    });
  }, []);

  const updatePrayerTime = useCallback((prayerId, timeString) => {
    setData((prev) => {
      const prayers = prev.settings.prayers;
      return {
        ...prev,
        settings: {
          ...prev.settings,
          prayers: {
            ...prayers,
            [prayerId]: { ...prayers[prayerId], time: timeString },
          },
        },
      };
    });
  }, []);

  const addCustomReminder = useCallback((title, timeString) => {
    const id = 'custom-' + Date.now().toString();
    setData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        customReminders: [
          ...prev.settings.customReminders,
          { id, title, time: timeString, enabled: true },
        ],
      },
    }));
    return id;
  }, []);

  const toggleCustomReminder = useCallback((id) => {
    setData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        customReminders: prev.settings.customReminders.map((r) =>
          r.id === id ? { ...r, enabled: !r.enabled } : r
        ),
      },
    }));
  }, []);

  const deleteCustomReminder = useCallback((id) => {
    setData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        customReminders: prev.settings.customReminders.filter((r) => r.id !== id),
      },
    }));
  }, []);

  const toggleSaveVerse = useCallback((verseId, skipUnsave = false) => {
    setData((prev) => {
      const isSaved = prev.savedVerses.some((v) => v.id === verseId);
      if (isSaved && !skipUnsave) {
        return { ...prev, savedVerses: prev.savedVerses.filter((v) => v.id !== verseId) };
      } else if (!isSaved) {
        return {
          ...prev,
          savedVerses: [...prev.savedVerses, { id: verseId, note: '', timestamp: Date.now() }],
        };
      }
      return prev;
    });
  }, []);

  const updateVerseNote = useCallback((verseId, note) => {
    setData((prev) => ({
      ...prev,
      savedVerses: prev.savedVerses.map((v) => (v.id === verseId ? { ...v, note } : v)),
    }));
  }, []);

  const addYaqeen = useCallback((amount) => {
    setData((prev) => {
      const m = prev.maqamat || {
        currentStation: 0,
        yaqeenProgress: 0,
        unlockedStations: [0],
        todayYaqeenGiven: 0,
        yaqeenDate: '',
      };
      const newProgress = Math.min(100, m.yaqeenProgress + amount);
      return { ...prev, maqamat: { ...m, yaqeenProgress: newProgress } };
    });
  }, []);

  const advanceStation = useCallback(() => {
    setData((prev) => {
      const m = prev.maqamat;
      const nextIdx = m.currentStation + 1;
      const newUnlocked = m.unlockedStations.includes(nextIdx)
        ? m.unlockedStations
        : [...m.unlockedStations, nextIdx];
      return {
        ...prev,
        maqamat: { ...m, currentStation: nextIdx, yaqeenProgress: 0, unlockedStations: newUnlocked },
      };
    });
  }, []);

  const goToStation = useCallback((idx) => {
    setData((prev) => {
      const unlocked = prev.maqamat?.unlockedStations || [0];
      if (!unlocked.includes(idx)) return prev;
      return { ...prev, maqamat: { ...prev.maqamat, currentStation: idx } };
    });
  }, []);

  const toggleAmbientMode = useCallback(() => {
    setData((prev) => ({
      ...prev,
      settings: { ...prev.settings, isAmbientEnabled: !prev.settings?.isAmbientEnabled },
    }));
  }, []);

  const setProfile = useCallback((name) => {
    const trimmed = (name || '').trim() || 'Seeker';
    const initials =
      trimmed
        .split(/\s+/)
        .map((w) => w[0]?.toUpperCase() || '')
        .join('')
        .slice(0, 2) || 'SK';
    const joinedDate = getLocalDateStr();
    setData((prev) => ({
      ...prev,
      profile: { name: trimmed, initials, joinedDate: prev.profile?.joinedDate || joinedDate },
    }));
  }, []);

  const markTaskRewarded = useCallback((taskId) => {
    setData((prev) => {
      const dateStr = getLocalDateStr();
      const isToday = prev.dailyTasks?.date === dateStr;
      if (!isToday) return prev;
      const existing = prev.dailyTasks.rewardedIds || [];
      if (existing.includes(taskId)) return prev;
      return {
        ...prev,
        dailyTasks: { ...prev.dailyTasks, rewardedIds: [...existing, taskId] },
      };
    });
  }, []);

  const markAdhkarSetRewarded = useCallback((setKey) => {
    setData((prev) => {
      const dateStr = getLocalDateStr();
      const isToday = prev.dailyTasks?.date === dateStr;
      const baseTasks = isToday ? prev.dailyTasks : getDefaultDailyTasks(dateStr);
      const existing = baseTasks.rewardedSets || [];
      if (existing.includes(setKey)) return prev;
      return {
        ...prev,
        dailyTasks: { ...baseTasks, rewardedSets: [...existing, setKey] },
        maqamat: {
          ...prev.maqamat,
          yaqeenProgress: Math.min(100, (prev.maqamat?.yaqeenProgress || 0) + 5),
        },
      };
    });
  }, []);

  return {
    totalVerses: data.totalVerses,
    totalPrayers: data.totalPrayers,
    history: data.history,
    savedVerses: data.savedVerses,
    dailyCompletedPrayers: data.dailyPrayers?.completed || [],
    dailyPrayerStatuses: data.dailyPrayers?.statuses || {},
    dailyTasks: data.dailyTasks?.counters || {},
    burhanCompleted: data.dailyTasks?.burhanCompleted || false,
    burhanNotes: data.burhanNotes || {},
    rewardedIds: data.dailyTasks?.rewardedIds || [],
    rewardedSets: data.dailyTasks?.rewardedSets || [],
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
    togglePrayer,
    logVerseSwipe,
    toggleSaveVerse,
    updateVerseNote,
    incrementTask,
    completeBurhan,
    saveBurhanNote,
    markTaskRewarded,
    markAdhkarSetRewarded,
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
    resetData,
  };
}
