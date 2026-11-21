import { formatCountdown, getLocalDateStr } from './devotionLogic.js';

export const PRAYER_ORDER = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

export const PRAYER_LABELS = {
  fajr: 'Fajr',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
};

export const DEFAULT_FALLBACK_TIMES = {
  fajr: '05:15',
  dhuhr: '12:45',
  asr: '16:15',
  maghrib: '18:30',
  isha: '20:00',
};

/**
 * Parses an "HH:MM" (24h) string into a local Date on the same calendar day as `now`.
 */
export function parseTimeStringToTodayDate(hhmm, now = new Date()) {
  if (typeof hhmm !== 'string') return null;
  const match = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return null;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);
}

/**
 * Formats a Date into a clean localized short time string (e.g., "12:45 PM").
 */
export function formatShortClock(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
}

/**
 * Resolves today's 5 prayer start Date objects using live solar `adhan` times
 * when available, or clean local fallback times otherwise.
 */
export function resolveTodayPrayerSchedule({
  prayerTimesData = null,
  fallbackPrayers = null,
  now = new Date(),
} = {}) {
  const solarTimes = prayerTimesData?.times || null;
  const isLiveSolar = Boolean(solarTimes?.fajr instanceof Date);

  const times = {};
  for (const id of PRAYER_ORDER) {
    if (isLiveSolar && solarTimes[id] instanceof Date && !Number.isNaN(solarTimes[id].getTime())) {
      times[id] = solarTimes[id];
    } else {
      const configured = fallbackPrayers?.[id]?.time || DEFAULT_FALLBACK_TIMES[id];
      times[id] =
        parseTimeStringToTodayDate(configured, now) ||
        parseTimeStringToTodayDate(DEFAULT_FALLBACK_TIMES[id], now);
    }
  }

  // Approximate Fajr end (sunrise) as solar sunrise when available, otherwise Fajr + 85 min
  const sunrise =
    prayerTimesData?.sunrise instanceof Date && !Number.isNaN(prayerTimesData.sunrise.getTime())
      ? prayerTimesData.sunrise
      : new Date(times.fajr.getTime() + 85 * 60 * 1000);

  return {
    times,
    sunrise,
    isLiveSolar,
  };
}

/**
 * Evaluates whether a prayer's time has arrived, is currently active, has passed
 * into a later prayer window, or is locked until its adhan time.
 *
 * Includes a small default grace buffer (5 minutes) to respect minor local masjid
 * or calculation variance, and respects `isTravelMode` (Jam' Taqdim combining).
 */
export function evaluatePrayerWindow(
  prayerId,
  { schedule, now = new Date(), isTravelMode = false, graceMinutes = 5 } = {}
) {
  const idx = PRAYER_ORDER.indexOf(prayerId);
  if (idx === -1 || !schedule?.times?.[prayerId]) {
    return {
      status: 'active',
      canLog: true,
      minutesUntil: 0,
      formattedCountdown: '',
      startTime: null,
      formattedStart: '',
    };
  }

  const nowMs = now.getTime();
  const graceMs = Math.max(0, Number(graceMinutes) || 0) * 60 * 1000;
  const startTime = schedule.times[prayerId];
  const startMs = startTime.getTime();
  const formattedStart = formatShortClock(startTime);

  // Prayer has not arrived yet (outside grace window)
  if (nowMs < startMs - graceMs) {
    const minutesUntil = Math.max(1, Math.ceil((startMs - nowMs) / 60000));
    const formattedCountdown = formatCountdown(minutesUntil);
    if (isTravelMode) {
      return {
        status: 'travel-unlocked',
        canLog: true,
        minutesUntil,
        formattedCountdown,
        startTime,
        formattedStart,
      };
    }
    return {
      status: 'upcoming',
      canLog: false,
      minutesUntil,
      formattedCountdown,
      startTime,
      formattedStart,
    };
  }

  // Prayer time has arrived — determine if its window has already closed
  let windowEndMs = Infinity;
  if (prayerId === 'fajr' && schedule.sunrise instanceof Date) {
    windowEndMs = schedule.sunrise.getTime();
  } else if (idx < PRAYER_ORDER.length - 1) {
    const nextId = PRAYER_ORDER[idx + 1];
    if (schedule.times[nextId] instanceof Date) {
      windowEndMs = schedule.times[nextId].getTime();
    }
  }

  const status = nowMs >= windowEndMs ? 'passed' : 'active';
  return {
    status,
    canLog: true,
    minutesUntil: 0,
    formattedCountdown: '',
    startTime,
    formattedStart,
  };
}

/**
 * Finds the next upcoming prayer today (or tomorrow's Fajr if after Isha)
 * so the Sanctuary always displays a clear countdown even before GPS is set.
 */
export function resolveNextUpcomingPrayer({ schedule, now = new Date() } = {}) {
  if (!schedule?.times) return null;
  const nowMs = now.getTime();

  for (const id of PRAYER_ORDER) {
    const start = schedule.times[id];
    if (start instanceof Date && start.getTime() > nowMs) {
      const minutesUntil = Math.max(1, Math.ceil((start.getTime() - nowMs) / 60000));
      return {
        id,
        label: PRAYER_LABELS[id],
        time: start,
        formattedTime: formatShortClock(start),
        minutesUntil,
        formattedCountdown: formatCountdown(minutesUntil),
        isTomorrow: false,
      };
    }
  }

  // After Isha: point cleanly to tomorrow's Fajr
  const todayFajr = schedule.times.fajr;
  if (todayFajr instanceof Date) {
    const tomorrowFajr = new Date(todayFajr.getTime() + 24 * 60 * 60 * 1000);
    const minutesUntil = Math.max(1, Math.ceil((tomorrowFajr.getTime() - nowMs) / 60000));
    return {
      id: 'fajr',
      label: PRAYER_LABELS.fajr,
      time: tomorrowFajr,
      formattedTime: formatShortClock(tomorrowFajr),
      minutesUntil,
      formattedCountdown: formatCountdown(minutesUntil),
      isTomorrow: true,
    };
  }
  return null;
}

/**
 * Picks the most helpful initial prayer index for the Sanctuary scroll wheel:
 * 1. Currently active uncompleted prayer (if its window is open right now)
 * 2. Most recent arrived uncompleted prayer (e.g., Fajr if still unlogged before Dhuhr)
 * 3. Next upcoming prayer if all arrived prayers are already logged
 */
export function resolveInitialPrayerFocusIndex({
  schedule,
  completedPrayers = [],
  now = new Date(),
  isTravelMode = false,
} = {}) {
  const completed = new Set(completedPrayers || []);
  const evaluations = PRAYER_ORDER.map((id, index) => ({
    id,
    index,
    evalResult: evaluatePrayerWindow(id, { schedule, now, isTravelMode }),
  }));

  const activeUnlogged = evaluations.find(
    (p) => p.evalResult.status === 'active' && !completed.has(p.id)
  );
  if (activeUnlogged) return activeUnlogged.index;

  // Most recent passed unlogged prayer (so user can easily log or mark Qada)
  const passedUnlogged = [...evaluations]
    .reverse()
    .find((p) => p.evalResult.status === 'passed' && !completed.has(p.id));
  if (passedUnlogged) return passedUnlogged.index;

  const nextUpcoming = evaluations.find(
    (p) =>
      (p.evalResult.status === 'upcoming' || p.evalResult.status === 'travel-unlocked') &&
      !completed.has(p.id)
  );
  if (nextUpcoming) return nextUpcoming.index;

  return 0;
}

/**
 * Recommends the current time-of-day Adhkar practice set for Practices view.
 * - 'sabah': Fajr through Dhuhr (Morning Adhkar window)
 * - 'masa': Asr through 22:00 / early night (Evening Adhkar window)
 * - 'wird': Midday or late night (Daily Sunnah Wird)
 */
export function resolveRecommendedAdhkarPeriod(now = new Date(), schedule = null) {
  const nowMs = now.getTime();
  const fajrMs = schedule?.times?.fajr?.getTime?.();
  const dhuhrMs = schedule?.times?.dhuhr?.getTime?.();
  const asrMs = schedule?.times?.asr?.getTime?.();
  const ishaMs = schedule?.times?.isha?.getTime?.();

  if (Number.isFinite(fajrMs) && Number.isFinite(dhuhrMs) && nowMs >= fajrMs && nowMs < dhuhrMs) {
    return {
      setId: 'sabah',
      label: 'Morning Adhkar window',
      shortTag: 'Now',
    };
  }

  const lateEveningCutoff = Number.isFinite(ishaMs)
    ? ishaMs + 2 * 60 * 60 * 1000
    : new Date(now.getFullYear(), now.getMonth(), now.getDate(), 22, 0, 0).getTime();

  if (Number.isFinite(asrMs) && nowMs >= asrMs && nowMs <= lateEveningCutoff) {
    return {
      setId: 'masa',
      label: 'Evening Adhkar window',
      shortTag: 'Now',
    };
  }

  // Fallback by local hour when schedule is absent
  if (!schedule?.times) {
    const hour = now.getHours();
    if (hour >= 4 && hour < 12) {
      return { setId: 'sabah', label: 'Morning Adhkar window', shortTag: 'Now' };
    }
    if (hour >= 15 && hour < 22) {
      return { setId: 'masa', label: 'Evening Adhkar window', shortTag: 'Now' };
    }
  }

  return {
    setId: 'wird',
    label: 'Quiet remembrance anytime',
    shortTag: null,
  };
}

/**
 * Computes a calm, non-judgmental Weekly Muhasabah (7-day self-reflection)
 * summary from `devotionData.history` for the Sanctuary Pass records view.
 */
export function computeWeeklyMuhasabah(history = {}, now = new Date()) {
  const safeHistory = history && typeof history === 'object' ? history : {};
  let weekPrayers = 0;
  let fullDays = 0;
  let activeDays = 0;
  let weekVerses = 0;

  for (let offset = 0; offset < 7; offset++) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset);
    const key = getLocalDateStr(day);
    const entry = safeHistory[key];
    if (!entry || typeof entry !== 'object') continue;
    const prayers = Math.max(0, Math.min(5, Number(entry.prayers) || 0));
    const verses = Math.max(0, Number(entry.verses) || 0);
    const practices = Math.max(0, Number(entry.practices) || 0);
    weekPrayers += prayers;
    weekVerses += verses;
    if (prayers >= 5) fullDays += 1;
    if (prayers > 0 || verses > 0 || practices > 0) activeDays += 1;
  }

  const avgPrayers = Number((weekPrayers / 7).toFixed(1));

  let reflection;
  if (weekPrayers === 0 && activeDays === 0) {
    reflection = 'Begin gently today — a single unhurried prayer anchors the week.';
  } else if (fullDays >= 5) {
    reflection = `Steadfast week — ${fullDays} complete 5-prayer days. Ask Allah for constancy.`;
  } else if (weekPrayers >= 20) {
    reflection = `${weekPrayers} prayers guarded across ${activeDays} days — protect the quiet gaps between.`;
  } else if (weekPrayers >= 7) {
    reflection = `${weekPrayers} prayers logged this week — focus on anchoring one consistent window next.`;
  } else {
    reflection = `${activeDays} mindful ${activeDays === 1 ? 'day' : 'days'} recorded — return softly, without hurry.`;
  }

  return {
    weekPrayers,
    maxPossiblePrayers: 35,
    avgPrayers,
    fullDays,
    activeDays,
    weekVerses,
    reflection,
  };
}
