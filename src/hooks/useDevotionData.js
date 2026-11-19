import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { getLocalDateStr, computeStreaks, sanitizeBackupPayload } from '../utils/devotionLogic';
import { evaluateBadges, getBadgeById } from '../utils/badgeLogic';
import {
  DEFAULT_DAILY_TODOS,
  addDailyTodoToList,
  clearCompletedDailyTodosInList,
  cloneDefaultDailyTodos,
  cloneDefaultHabits,
  createHabitEntry,
  removeDailyTodoFromList,
  removeHabitFromList,
  reorderHabitInList,
  toggleDailyTodoInList,
  updateHabitInList,
} from '../utils/habitLogic';
import { DEFAULT_HABITS } from '../data/duasData';
import { hydrateMissingFromPreferences, mirroredRemove, mirroredSet } from '../utils/nativeStorage';

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

const getDefaultSettings = () => ({
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
  notificationLeadMinutes: 0,
  notificationChime: true,
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
    totalDhikr: 0,
    maxDailyPrayers: 0,
    unlockedBadges: {},
    history: {},
    savedVerses: [],
    dailyPrayers: getDefaultDailyPrayers(currentDate),
    dailyTasks: getDefaultDailyTasks(currentDate),
    habits: cloneDefaultHabits(DEFAULT_HABITS),
    dailyHabitLogs: { date: currentDate, counts: {} },
    qada: {
      prayers: { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 },
      fasts: 0,
      completedTotal: 0,
    },
    favoriteDuaIds: [],
    streakPausedDates: {},
    dailyIntention: { date: currentDate, text: '' },
    dailyTodos: { date: currentDate, items: cloneDefaultDailyTodos(DEFAULT_DAILY_TODOS) },
    burhanNotes: {},
    maqamat: {
      currentStation: 0,
      yaqeenProgress: 0,
      unlockedStations: [0],
      todayYaqeenGiven: 0,
      yaqeenDate: currentDate,
    },
    settings: getDefaultSettings(),
    profile: defaultProfile,
  };

  if (typeof window === 'undefined') return defaultState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return defaultState;
      }

      if (typeof parsed.totalVerses !== 'number' || !Number.isFinite(parsed.totalVerses)) {
        parsed.totalVerses = 0;
      }
      if (typeof parsed.totalPrayers !== 'number' || !Number.isFinite(parsed.totalPrayers)) {
        parsed.totalPrayers = 0;
      }

      if (!Array.isArray(parsed.savedVerses)) {
        parsed.savedVerses = [];
      } else {
        parsed.savedVerses = parsed.savedVerses
          .filter((v) => v && (typeof v === 'string' || typeof v?.id === 'string'))
          .map((v) => (typeof v === 'string' ? { id: v, note: '', timestamp: Date.now() } : v));
      }

      if (!parsed.dailyPrayers || typeof parsed.dailyPrayers !== 'object' || parsed.dailyPrayers.date !== currentDate) {
        parsed.dailyPrayers = getDefaultDailyPrayers(currentDate);
      } else {
        const completed = Array.isArray(parsed.dailyPrayers.completed)
          ? parsed.dailyPrayers.completed
          : [];
        const statuses =
          parsed.dailyPrayers.statuses && typeof parsed.dailyPrayers.statuses === 'object'
            ? { ...parsed.dailyPrayers.statuses }
            : {};
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

      if (!parsed.dailyTasks || typeof parsed.dailyTasks !== 'object' || parsed.dailyTasks.date !== currentDate) {
        parsed.dailyTasks = getDefaultDailyTasks(currentDate);
      } else {
        if (!parsed.dailyTasks.counters || typeof parsed.dailyTasks.counters !== 'object') {
          parsed.dailyTasks.counters = {};
        }
        if (parsed.dailyTasks.burhanCompleted === undefined) {
          parsed.dailyTasks.burhanCompleted = false;
        }
        if (!Array.isArray(parsed.dailyTasks.rewardedIds)) parsed.dailyTasks.rewardedIds = [];
        if (!Array.isArray(parsed.dailyTasks.rewardedSets)) parsed.dailyTasks.rewardedSets = [];
      }

      if (!parsed.burhanNotes || typeof parsed.burhanNotes !== 'object' || Array.isArray(parsed.burhanNotes)) {
        parsed.burhanNotes = {};
      }

      if (!parsed.maqamat || typeof parsed.maqamat !== 'object') {
        parsed.maqamat = defaultState.maqamat;
      } else {
        if (!Array.isArray(parsed.maqamat.unlockedStations) || parsed.maqamat.unlockedStations.length === 0) {
          parsed.maqamat.unlockedStations = [0];
        }
        if (typeof parsed.maqamat.currentStation !== 'number' || parsed.maqamat.currentStation < 0) {
          parsed.maqamat.currentStation = 0;
        }
        if (typeof parsed.maqamat.yaqeenProgress !== 'number') {
          parsed.maqamat.yaqeenProgress = 0;
        }
      }
      if (parsed.maqamat.yaqeenDate !== currentDate) {
        parsed.maqamat = { ...parsed.maqamat, todayYaqeenGiven: 0, yaqeenDate: currentDate };
      }

      if (!parsed.settings || typeof parsed.settings !== 'object') {
        parsed.settings = defaultState.settings;
      } else {
        if (!parsed.settings.prayers || typeof parsed.settings.prayers !== 'object') {
          parsed.settings.prayers = defaultState.settings.prayers;
        }
        if (!Array.isArray(parsed.settings.customReminders)) {
          parsed.settings.customReminders = [];
        }
        if (typeof parsed.settings.notificationLeadMinutes !== 'number') {
          parsed.settings.notificationLeadMinutes = 0;
        }
        if (typeof parsed.settings.notificationChime !== 'boolean') {
          parsed.settings.notificationChime = true;
        }
      }

      if (!parsed.history || typeof parsed.history !== 'object' || Array.isArray(parsed.history)) {
        parsed.history = {};
      } else {
        const keys = Object.keys(parsed.history);
        for (const key of keys) {
          if (typeof parsed.history[key] === 'number') {
            parsed.history[key] = { prayers: parsed.history[key], verses: 0 };
          } else if (!parsed.history[key] || typeof parsed.history[key] !== 'object') {
            delete parsed.history[key];
          }
        }
      }

      if (!parsed.profile || typeof parsed.profile !== 'object') {
        parsed.profile = defaultProfile;
      }

      if (typeof parsed.totalDhikr !== 'number') parsed.totalDhikr = 0;
      if (typeof parsed.maxDailyPrayers !== 'number') parsed.maxDailyPrayers = 0;
      if (!parsed.unlockedBadges || typeof parsed.unlockedBadges !== 'object' || Array.isArray(parsed.unlockedBadges)) {
        parsed.unlockedBadges = {};
      }
      if (!Array.isArray(parsed.habits)) {
        parsed.habits = cloneDefaultHabits(DEFAULT_HABITS);
      }
      if (!parsed.dailyHabitLogs || typeof parsed.dailyHabitLogs !== 'object' || parsed.dailyHabitLogs.date !== currentDate) {
        parsed.dailyHabitLogs = { date: currentDate, counts: {} };
      } else if (!parsed.dailyHabitLogs.counts || typeof parsed.dailyHabitLogs.counts !== 'object') {
        parsed.dailyHabitLogs.counts = {};
      }
      if (!parsed.qada || typeof parsed.qada !== 'object') {
        parsed.qada = defaultState.qada;
      } else if (!parsed.qada.prayers || typeof parsed.qada.prayers !== 'object') {
        parsed.qada.prayers = defaultState.qada.prayers;
      }
      if (!Array.isArray(parsed.favoriteDuaIds)) {
        parsed.favoriteDuaIds = [];
      }
      if (!parsed.streakPausedDates || typeof parsed.streakPausedDates !== 'object' || Array.isArray(parsed.streakPausedDates)) {
        parsed.streakPausedDates = {};
      }
      if (!parsed.dailyIntention || typeof parsed.dailyIntention !== 'object' || parsed.dailyIntention.date !== currentDate) {
        parsed.dailyIntention = { date: currentDate, text: '' };
      }
      if (
        !parsed.dailyTodos ||
        typeof parsed.dailyTodos !== 'object' ||
        parsed.dailyTodos.date !== currentDate ||
        !Array.isArray(parsed.dailyTodos.items)
      ) {
        parsed.dailyTodos = { date: currentDate, items: cloneDefaultDailyTodos(DEFAULT_DAILY_TODOS) };
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
  const [pendingBadgeQueue, setPendingBadgeQueue] = useState([]);
  const dataRef = useRef(data);
  dataRef.current = data;

  useEffect(() => {
    let cancelled = false;
    hydrateMissingFromPreferences([STORAGE_KEY]).then((recovered) => {
      if (cancelled || !recovered[STORAGE_KEY]) return;
      setData(getInitialState());
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    try {
      mirroredSet(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Could not save devotion state', e);
    }
  }, [data]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const handleStorage = (e) => {
      if (e.key === STORAGE_KEY) {
        setData(getInitialState());
      }
    };

    const flushPersistence = () => {
      if (document.visibilityState && document.visibilityState !== 'hidden') return;
      try {
        mirroredSet(STORAGE_KEY, JSON.stringify(dataRef.current));
      } catch {}
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('pagehide', flushPersistence);
    document.addEventListener('visibilitychange', flushPersistence);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('pagehide', flushPersistence);
      document.removeEventListener('visibilitychange', flushPersistence);
    };
  }, []);

  const badgeEval = useMemo(
    () => evaluateBadges(data, data.unlockedBadges),
    [data]
  );

  useEffect(() => {
    if (!badgeEval.newlyUnlocked || badgeEval.newlyUnlocked.length === 0) return;
    const todayStr = getLocalDateStr();
    const newlyIds = badgeEval.newlyUnlocked.map((b) => b.id);

    setData((prev) => {
      const nextUnlocked = { ...(prev.unlockedBadges || {}) };
      let changed = false;
      for (const id of newlyIds) {
        if (!nextUnlocked[id]) {
          nextUnlocked[id] = { unlockedAt: todayStr };
          changed = true;
        }
      }
      return changed ? { ...prev, unlockedBadges: nextUnlocked } : prev;
    });

    setPendingBadgeQueue((prevQueue) => {
      const existing = new Set(prevQueue);
      const additions = newlyIds.filter((id) => !existing.has(id));
      return additions.length > 0 ? [...prevQueue, ...additions] : prevQueue;
    });
  }, [badgeEval.newlyUnlocked]);

  const dismissCelebrationBadge = useCallback(() => {
    setPendingBadgeQueue((prev) => prev.slice(1));
  }, []);

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
        maxDailyPrayers: Math.max(prev.maxDailyPrayers || 0, nextCompleted.length),
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

  const logPrayer = useCallback((prayerId, status = 'ontime') => {
    setData((prev) => {
      const dateStr = getLocalDateStr();
      const isToday = prev.dailyPrayers?.date === dateStr;
      const baseDaily = isToday ? prev.dailyPrayers : getDefaultDailyPrayers(dateStr);
      const completedList = baseDaily.completed || [];
      if (completedList.includes(prayerId)) return prev;

      const statuses = { ...(baseDaily.statuses || {}), [prayerId]: status };
      const currentDayEntry = prev.history[dateStr] || { prayers: 0, verses: 0 };
      const nextCompleted = [...completedList, prayerId];

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
        maxDailyPrayers: Math.max(prev.maxDailyPrayers || 0, nextCompleted.length),
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

  const resetData = useCallback(() => {
    const currentDate = getLocalDateStr();
    try {
      mirroredRemove(STORAGE_KEY);
      localStorage.removeItem('ruh_sent_notifications_v1');
    } catch {}
    setPendingBadgeQueue([]);
    setData({
      totalVerses: 0,
      totalPrayers: 0,
      totalDhikr: 0,
      maxDailyPrayers: 0,
      unlockedBadges: {},
      history: {},
      savedVerses: [],
      dailyPrayers: getDefaultDailyPrayers(currentDate),
      dailyTasks: getDefaultDailyTasks(currentDate),
      habits: cloneDefaultHabits(DEFAULT_HABITS),
      dailyHabitLogs: { date: currentDate, counts: {} },
      qada: {
        prayers: { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 },
        fasts: 0,
        completedTotal: 0,
      },
      favoriteDuaIds: [],
      streakPausedDates: {},
      dailyIntention: { date: currentDate, text: '' },
      dailyTodos: { date: currentDate, items: cloneDefaultDailyTodos(DEFAULT_DAILY_TODOS) },
      burhanNotes: {},
      maqamat: {
        currentStation: 0,
        yaqeenProgress: 0,
        unlockedStations: [0],
        todayYaqeenGiven: 0,
        yaqeenDate: currentDate,
      },
      settings: getDefaultSettings(),
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
        totalDhikr: Math.max(0, (prev.totalDhikr || 0) + delta),
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

  const logHabitStep = useCallback((habitId, delta = 1) => {
    setData((prev) => {
      const dateStr = getLocalDateStr();
      const baseLogs =
        prev.dailyHabitLogs?.date === dateStr
          ? prev.dailyHabitLogs
          : { date: dateStr, counts: {} };
      const counts = { ...(baseLogs.counts || {}) };
      const prevVal = counts[habitId] || 0;
      const nextVal = Math.max(0, prevVal + delta);
      counts[habitId] = nextVal;

      const actualDelta = nextVal - prevVal;
      const currentDayEntry = prev.history[dateStr] || { prayers: 0, verses: 0, practices: 0 };
      const nextDayPractices = Math.max(
        0,
        (currentDayEntry.practices || 0) + (actualDelta > 0 ? 1 : actualDelta < 0 ? -1 : 0)
      );

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
        dailyHabitLogs: { date: dateStr, counts },
      };
    });
  }, []);

  const addCustomHabit = useCallback((titleOrConfig, target = 1, unit = 'time', cadence = 'Daily', arabic = 'عَمَل') => {
    const config =
      titleOrConfig && typeof titleOrConfig === 'object'
        ? titleOrConfig
        : { title: titleOrConfig, target, unit, cadence, arabic };
    const entry = createHabitEntry(config);
    if (!entry) return null;

    setData((prev) => ({
      ...prev,
      habits: [...(Array.isArray(prev.habits) ? prev.habits : cloneDefaultHabits(DEFAULT_HABITS)), entry],
    }));
    return entry.id;
  }, []);

  const updateHabit = useCallback((habitId, patch) => {
    setData((prev) => ({
      ...prev,
      habits: updateHabitInList(
        Array.isArray(prev.habits) ? prev.habits : cloneDefaultHabits(DEFAULT_HABITS),
        habitId,
        patch
      ),
    }));
  }, []);

  const reorderHabit = useCallback((habitId, direction = 'up') => {
    setData((prev) => ({
      ...prev,
      habits: reorderHabitInList(
        Array.isArray(prev.habits) ? prev.habits : cloneDefaultHabits(DEFAULT_HABITS),
        habitId,
        direction
      ),
    }));
  }, []);

  const resetDefaultHabits = useCallback(() => {
    setData((prev) => ({
      ...prev,
      habits: cloneDefaultHabits(DEFAULT_HABITS),
    }));
  }, []);

  const removeHabit = useCallback((habitId) => {
    setData((prev) => {
      const nextHabits = removeHabitFromList(
        Array.isArray(prev.habits) ? prev.habits : cloneDefaultHabits(DEFAULT_HABITS),
        habitId
      );
      if (!prev.dailyHabitLogs?.counts || !(habitId in prev.dailyHabitLogs.counts)) {
        return { ...prev, habits: nextHabits };
      }
      const nextCounts = { ...prev.dailyHabitLogs.counts };
      delete nextCounts[habitId];
      return {
        ...prev,
        habits: nextHabits,
        dailyHabitLogs: { ...prev.dailyHabitLogs, counts: nextCounts },
      };
    });
  }, []);

  const setQadaCount = useCallback((key, value) => {
    const safeVal = Math.max(0, Math.min(50000, Math.floor(Number(value) || 0)));
    setData((prev) => {
      const cur = prev.qada || { prayers: { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 }, fasts: 0, completedTotal: 0 };
      if (key === 'fasts') {
        return { ...prev, qada: { ...cur, fasts: safeVal } };
      }
      return {
        ...prev,
        qada: {
          ...cur,
          prayers: { ...(cur.prayers || {}), [key]: safeVal },
        },
      };
    });
  }, []);

  const bulkAddQadaYears = useCallback((years = 1) => {
    const count = Math.max(1, Math.min(80, Number(years) || 1)) * 365;
    setData((prev) => {
      const cur = prev.qada || { prayers: { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 }, fasts: 0, completedTotal: 0 };
      const p = cur.prayers || {};
      return {
        ...prev,
        qada: {
          ...cur,
          prayers: {
            fajr: (p.fajr || 0) + count,
            dhuhr: (p.dhuhr || 0) + count,
            asr: (p.asr || 0) + count,
            maghrib: (p.maghrib || 0) + count,
            isha: (p.isha || 0) + count,
          },
        },
      };
    });
  }, []);

  const completeOneQada = useCallback((key) => {
    setData((prev) => {
      const cur = prev.qada || { prayers: { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 }, fasts: 0, completedTotal: 0 };
      const dateStr = getLocalDateStr();
      const currentDayEntry = prev.history[dateStr] || { prayers: 0, verses: 0, practices: 0 };

      let nextQada = cur;
      let changed = false;
      if (key === 'fasts') {
        if ((cur.fasts || 0) > 0) {
          nextQada = { ...cur, fasts: cur.fasts - 1, completedTotal: (cur.completedTotal || 0) + 1 };
          changed = true;
        }
      } else if ((cur.prayers?.[key] || 0) > 0) {
        nextQada = {
          ...cur,
          prayers: { ...cur.prayers, [key]: cur.prayers[key] - 1 },
          completedTotal: (cur.completedTotal || 0) + 1,
        };
        changed = true;
      }
      if (!changed) return prev;

      return {
        ...prev,
        qada: nextQada,
        history: {
          ...prev.history,
          [dateStr]: {
            prayers: currentDayEntry.prayers || 0,
            verses: currentDayEntry.verses || 0,
            practices: (currentDayEntry.practices || 0) + 1,
          },
        },
        maqamat: {
          ...prev.maqamat,
          yaqeenProgress: Math.min(100, (prev.maqamat?.yaqeenProgress || 0) + 2),
        },
      };
    });
  }, []);

  const toggleFavoriteDua = useCallback((duaId) => {
    setData((prev) => {
      const list = Array.isArray(prev.favoriteDuaIds) ? prev.favoriteDuaIds : [];
      const exists = list.includes(duaId);
      return {
        ...prev,
        favoriteDuaIds: exists ? list.filter((id) => id !== duaId) : [...list, duaId],
      };
    });
  }, []);

  const toggleStreakPauseToday = useCallback(() => {
    const dateStr = getLocalDateStr();
    setData((prev) => {
      const paused = { ...(prev.streakPausedDates || {}) };
      if (paused[dateStr]) delete paused[dateStr];
      else paused[dateStr] = true;
      return { ...prev, streakPausedDates: paused };
    });
  }, []);

  const setDailyIntention = useCallback((text) => {
    const dateStr = getLocalDateStr();
    setData((prev) => ({
      ...prev,
      dailyIntention: { date: dateStr, text: (text || '').slice(0, 140) },
    }));
  }, []);

  const addDailyTodo = useCallback((text) => {
    const dateStr = getLocalDateStr();
    setData((prev) => {
      const currentItems =
        prev.dailyTodos?.date === dateStr && Array.isArray(prev.dailyTodos.items)
          ? prev.dailyTodos.items
          : cloneDefaultDailyTodos(DEFAULT_DAILY_TODOS);
      const nextItems = addDailyTodoToList(currentItems, text);
      if (nextItems === currentItems) return prev;
      return {
        ...prev,
        dailyTodos: { date: dateStr, items: nextItems },
      };
    });
  }, []);

  const toggleDailyTodo = useCallback((todoId) => {
    const dateStr = getLocalDateStr();
    setData((prev) => {
      const currentItems =
        prev.dailyTodos?.date === dateStr && Array.isArray(prev.dailyTodos.items)
          ? prev.dailyTodos.items
          : cloneDefaultDailyTodos(DEFAULT_DAILY_TODOS);
      const prevTarget = currentItems.find((t) => t && t.id === todoId);
      if (!prevTarget) return prev;
      const nextItems = toggleDailyTodoInList(currentItems, todoId);
      const wasCompleted = Boolean(prevTarget.completed);
      const isFirstCompletion = !wasCompleted && !prevTarget.rewarded;
      const rewardAmt = typeof prevTarget.reward === 'number' ? prevTarget.reward : 5;

      const currentDayEntry = prev.history[dateStr] || { prayers: 0, verses: 0, practices: 0 };
      const nextDayPractices = Math.max(
        0,
        (currentDayEntry.practices || 0) + (wasCompleted ? -1 : 1)
      );
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
        dailyTodos: { date: dateStr, items: nextItems },
        maqamat: isFirstCompletion
          ? {
              ...prev.maqamat,
              yaqeenProgress: Math.min(100, (prev.maqamat?.yaqeenProgress || 0) + rewardAmt),
            }
          : prev.maqamat,
      };
    });
  }, []);

  const removeDailyTodo = useCallback((todoId) => {
    const dateStr = getLocalDateStr();
    setData((prev) => {
      const currentItems =
        prev.dailyTodos?.date === dateStr && Array.isArray(prev.dailyTodos.items)
          ? prev.dailyTodos.items
          : cloneDefaultDailyTodos(DEFAULT_DAILY_TODOS);
      return {
        ...prev,
        dailyTodos: { date: dateStr, items: removeDailyTodoFromList(currentItems, todoId) },
      };
    });
  }, []);

  const clearCompletedDailyTodos = useCallback(() => {
    const dateStr = getLocalDateStr();
    setData((prev) => {
      const currentItems =
        prev.dailyTodos?.date === dateStr && Array.isArray(prev.dailyTodos.items)
          ? prev.dailyTodos.items
          : cloneDefaultDailyTodos(DEFAULT_DAILY_TODOS);
      return {
        ...prev,
        dailyTodos: { date: dateStr, items: clearCompletedDailyTodosInList(currentItems) },
      };
    });
  }, []);

  const exportBackupJson = useCallback(() => {
    return JSON.stringify(data, null, 2);
  }, [data]);

  const importBackupJson = useCallback((jsonText) => {
    try {
      const parsed = JSON.parse(jsonText);
      const safe = sanitizeBackupPayload(parsed);
      if (!safe) return false;
      setData((prev) => ({
        ...prev,
        ...safe,
        habits: safe.habits !== undefined ? safe.habits : prev.habits || cloneDefaultHabits(DEFAULT_HABITS),
        qada: safe.qada || prev.qada,
        profile: safe.profile || prev.profile,
        maqamat: safe.maqamat ? { ...prev.maqamat, ...safe.maqamat } : prev.maqamat,
        settings: safe.settings
          ? {
              ...prev.settings,
              ...safe.settings,
              prayers: safe.settings.prayers
                ? { ...prev.settings.prayers, ...safe.settings.prayers }
                : prev.settings.prayers,
            }
          : prev.settings,
      }));
      return true;
    } catch {
      return false;
    }
  }, []);

  const activeDays = Object.keys(data.history).length;
  const { currentStreak, longestStreak } = useMemo(
    () => computeStreaks(data.history, new Date(), data.streakPausedDates),
    [data.history, data.streakPausedDates]
  );
  const todayStr = getLocalDateStr();
  const isStreakPausedToday = Boolean(data.streakPausedDates?.[todayStr]);

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

  const setNotificationLeadMinutes = useCallback((minutes) => {
    const safeMinutes = [0, 5, 10, 15].includes(Number(minutes)) ? Number(minutes) : 0;
    setData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        notificationLeadMinutes: safeMinutes,
      },
    }));
  }, []);

  const toggleNotificationChime = useCallback(() => {
    setData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        notificationChime: prev.settings?.notificationChime === false,
      },
    }));
  }, []);

  const setAllPrayerRemindersEnabled = useCallback((enabled) => {
    setData((prev) => {
      const currentPrayers = prev.settings?.prayers || {};
      const nextPrayers = {};
      for (const id of ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']) {
        nextPrayers[id] = {
          ...(currentPrayers[id] || { time: '05:15' }),
          enabled: Boolean(enabled),
        };
      }
      return {
        ...prev,
        settings: {
          ...prev.settings,
          prayers: nextPrayers,
        },
      };
    });
  }, []);

  const syncPrayerReminderTimes = useCallback((timesHHMM) => {
    if (!timesHHMM || typeof timesHHMM !== 'object') return;
    setData((prev) => {
      const currentPrayers = prev.settings?.prayers || {};
      const nextPrayers = { ...currentPrayers };
      for (const id of ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']) {
        if (timesHHMM[id]) {
          nextPrayers[id] = {
            ...(currentPrayers[id] || { enabled: false }),
            time: timesHHMM[id],
          };
        }
      }
      return {
        ...prev,
        settings: {
          ...prev.settings,
          prayers: nextPrayers,
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

  return useMemo(
    () => ({
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
      notificationLeadMinutes: data.settings?.notificationLeadMinutes || 0,
      notificationChime: data.settings?.notificationChime !== false,
      prayers: data.settings?.prayers || {},
      customReminders: data.settings?.customReminders || [],
      profile: data.profile,
      activeDays,
      currentStreak,
      longestStreak,
      streakPausedDates: data.streakPausedDates || {},
      isStreakPausedToday,
      habits: Array.isArray(data.habits) ? data.habits : DEFAULT_HABITS,
      dailyHabitLogs: data.dailyHabitLogs?.counts || {},
      qada: data.qada || { prayers: { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 }, fasts: 0, completedTotal: 0 },
      favoriteDuaIds: data.favoriteDuaIds || [],
      dailyIntention: data.dailyIntention?.text || '',
      dailyTodos: Array.isArray(data.dailyTodos?.items)
        ? data.dailyTodos.items
        : DEFAULT_DAILY_TODOS,
      badgeStatuses: badgeEval.statuses,
      unlockedBadgeCount: badgeEval.unlockedCount,
      totalBadgeCount: badgeEval.totalCount,
      activeCelebrationBadge: pendingBadgeQueue[0] ? getBadgeById(pendingBadgeQueue[0]) : null,
      pendingBadgeCount: pendingBadgeQueue.length,
      dismissCelebrationBadge,
      logPrayer,
      togglePrayer,
      logVerseSwipe,
      toggleSaveVerse,
      updateVerseNote,
      incrementTask,
      logHabitStep,
      addCustomHabit,
      updateHabit,
      reorderHabit,
      resetDefaultHabits,
      removeHabit,
      setQadaCount,
      bulkAddQadaYears,
      completeOneQada,
      toggleFavoriteDua,
      toggleStreakPauseToday,
      setDailyIntention,
      addDailyTodo,
      toggleDailyTodo,
      removeDailyTodo,
      clearCompletedDailyTodos,
      exportBackupJson,
      importBackupJson,
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
      setNotificationLeadMinutes,
      toggleNotificationChime,
      setAllPrayerRemindersEnabled,
      syncPrayerReminderTimes,
      addCustomReminder,
      toggleCustomReminder,
      deleteCustomReminder,
      setProfile,
      resetData,
    }),
    [
      data,
      activeDays,
      currentStreak,
      longestStreak,
      isStreakPausedToday,
      badgeEval,
      pendingBadgeQueue,
      dismissCelebrationBadge,
      logPrayer,
      togglePrayer,
      logVerseSwipe,
      toggleSaveVerse,
      updateVerseNote,
      incrementTask,
      logHabitStep,
      addCustomHabit,
      updateHabit,
      reorderHabit,
      resetDefaultHabits,
      removeHabit,
      setQadaCount,
      bulkAddQadaYears,
      completeOneQada,
      toggleFavoriteDua,
      toggleStreakPauseToday,
      setDailyIntention,
      addDailyTodo,
      toggleDailyTodo,
      removeDailyTodo,
      clearCompletedDailyTodos,
      exportBackupJson,
      importBackupJson,
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
      setNotificationLeadMinutes,
      toggleNotificationChime,
      setAllPrayerRemindersEnabled,
      syncPrayerReminderTimes,
      addCustomReminder,
      toggleCustomReminder,
      deleteCustomReminder,
      setProfile,
      resetData,
    ]
  );
}
