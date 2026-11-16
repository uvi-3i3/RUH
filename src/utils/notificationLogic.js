/**
 * Pure local push notification scheduling & formatting logic for Ruh.
 */
import { Coordinates, PrayerTimes } from 'adhan';
import { getLocalDateStr } from './devotionLogic';
import { getAdhanCalculationParams } from './prayerMethod';

export const NOTIFICATION_LEAD_OPTIONS = [0, 5, 10, 15];
export const NATIVE_PRAYER_IDS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
export const ROLLING_NOTIFICATION_ID_BASE = 100;
export const MAX_ROLLING_NOTIFICATION_ID = 299;
export const CUSTOM_NOTIFICATION_ID_BASE = 300;
export const MAX_CUSTOM_NOTIFICATION_ID = 399;

export const PRAYER_REMINDER_MESSAGES = {
  fajr: {
    label: 'Fajr',
    arabic: 'الفجر',
    onTime: 'Dawn light gathers softly. Step into Fajr with a quiet heart.',
    upcoming: (mins) => `${mins}m before Fajr · Prepare gently for the dawn prayer.`,
  },
  dhuhr: {
    label: 'Dhuhr',
    arabic: 'الظهر',
    onTime: 'Midday arrives. Pause the day’s noise and turn toward Dhuhr.',
    upcoming: (mins) => `${mins}m before Dhuhr · A quiet midday pause awaits.`,
  },
  asr: {
    label: 'Asr',
    arabic: 'العصر',
    onTime: 'Afternoon settles into amber light. Center your soul for Asr.',
    upcoming: (mins) => `${mins}m before Asr · Gather stillness for the afternoon prayer.`,
  },
  maghrib: {
    label: 'Maghrib',
    arabic: 'المغرب',
    onTime: 'Sunset descends. Step softly into Maghrib and evening gratitude.',
    upcoming: (mins) => `${mins}m before Maghrib · Dusk is near; ready your heart for prayer.`,
  },
  isha: {
    label: 'Isha',
    arabic: 'العشاء',
    onTime: 'Night wraps the sky in stillness. Close the day with Isha.',
    upcoming: (mins) => `${mins}m before Isha · Restful night prayer approaches.`,
  },
};

export function formatDateToHHMM(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

export function parseHHMMToTodayDate(timeStr, referenceDate = new Date()) {
  if (typeof timeStr !== 'string') return null;
  const match = /^(\d{1,2}):(\d{2})$/.exec(timeStr.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate(),
    hours,
    minutes,
    0,
    0
  );
}

export function computeTriggerDate(timeStr, leadMinutes = 0, referenceDate = new Date()) {
  const baseDate = parseHHMMToTodayDate(timeStr, referenceDate);
  if (!baseDate) return null;
  const safeLead = Math.max(0, Math.min(60, Number(leadMinutes) || 0));
  return new Date(baseDate.getTime() - safeLead * 60000);
}

export function formatDisplayTime(timeStr) {
  const date = parseHHMMToTodayDate(timeStr);
  if (!date) return timeStr || '';
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
}

export function buildPrayerNotificationPayload(
  prayerId,
  timeStr,
  leadMinutes = 0,
  referenceDate = new Date()
) {
  const copy = PRAYER_REMINDER_MESSAGES[prayerId] || {
    label: prayerId,
    arabic: 'صلاة',
    onTime: 'It is time to center your soul in prayer.',
    upcoming: (mins) => `${mins}m until prayer. Prepare gently.`,
  };
  const safeLead = Math.max(0, Number(leadMinutes) || 0);
  const displayTime = formatDisplayTime(timeStr);

  return {
    id: `prayer:${prayerId}`,
    kind: 'prayer',
    prayerId,
    tag: `ruh-prayer-${prayerId}-${getLocalDateStr(referenceDate)}`,
    title:
      safeLead > 0
        ? `${copy.label} in ${safeLead}m · ${displayTime}`
        : `${copy.label} Prayer · ${displayTime}`,
    arabic: copy.arabic,
    body: safeLead > 0 ? copy.upcoming(safeLead) : copy.onTime,
    timeStr,
    displayTime,
    leadMinutes: safeLead,
  };
}

export function buildCustomNotificationPayload(reminder, referenceDate = new Date()) {
  const title = reminder?.title || 'Devotion Reminder';
  const displayTime = formatDisplayTime(reminder?.time);
  return {
    id: `custom:${reminder?.id || 'note'}`,
    kind: 'custom',
    reminderId: reminder?.id || null,
    tag: `ruh-custom-${reminder?.id || 'note'}-${getLocalDateStr(referenceDate)}`,
    title: `${title} · ${displayTime}`,
    arabic: 'ذِكْر',
    body: 'A gentle reminder for your personal devotion and remembrance.',
    timeStr: reminder?.time || '',
    displayTime,
    leadMinutes: 0,
  };
}

/**
 * Build a rolling multi-day native notification schedule (default 14 days) using exact
 * astronomical solar times when coordinates are present, falling back to fixed HH:MM settings.
 * Skips already elapsed timestamps and already-logged prayers for today.
 */
export function buildRollingNativePrayerSchedule({
  coords = null,
  method = 'MoonsightingCommittee',
  prayersSettings = {},
  leadMinutes = 0,
  completedPrayersToday = [],
  days = 14,
  now = new Date(),
}) {
  const hasCoords =
    coords &&
    typeof coords.lat === 'number' &&
    typeof coords.lng === 'number' &&
    Number.isFinite(coords.lat) &&
    Number.isFinite(coords.lng);

  const safeDays = Math.max(1, Math.min(20, Math.floor(Number(days) || 14)));
  const safeLead = Math.max(0, Math.min(60, Number(leadMinutes) || 0));
  const completedSet = new Set(Array.isArray(completedPrayersToday) ? completedPrayersToday : []);
  const coordinates = hasCoords ? new Coordinates(coords.lat, coords.lng) : null;
  const params = hasCoords ? getAdhanCalculationParams(method) : null;

  const scheduleList = [];

  for (let dayOffset = 0; dayOffset < safeDays; dayOffset++) {
    const targetDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + dayOffset,
      12,
      0,
      0,
      0
    );

    const pt = coordinates ? new PrayerTimes(coordinates, targetDay, params) : null;

    for (let pIdx = 0; pIdx < NATIVE_PRAYER_IDS.length; pIdx++) {
      const prayerId = NATIVE_PRAYER_IDS[pIdx];
      const cfg = prayersSettings?.[prayerId];
      if (!cfg?.enabled) continue;
      if (dayOffset === 0 && completedSet.has(prayerId)) continue;

      let basePrayerDate = null;
      if (pt && pt[prayerId] instanceof Date && !Number.isNaN(pt[prayerId].getTime())) {
        basePrayerDate = pt[prayerId];
      } else if (cfg.time) {
        basePrayerDate = parseHHMMToTodayDate(cfg.time, targetDay);
      }

      if (!basePrayerDate) continue;

      const triggerAt = new Date(basePrayerDate.getTime() - safeLead * 60000);
      if (triggerAt.getTime() <= now.getTime() + 5000) continue;

      const timeStr = formatDateToHHMM(basePrayerDate);
      const payload = buildPrayerNotificationPayload(prayerId, timeStr, safeLead, targetDay);
      const id = ROLLING_NOTIFICATION_ID_BASE + dayOffset * 10 + pIdx;

      if (id > MAX_ROLLING_NOTIFICATION_ID) continue;

      scheduleList.push({
        id,
        prayerId,
        dayOffset,
        triggerAt,
        title: payload.title,
        body: payload.body,
        extra: {
          kind: 'prayer',
          prayerId,
          dayOffset,
        },
      });
    }
  }

  return scheduleList;
}

/**
 * Map enabled personal custom reminders into daily repeating native schedule entries.
 */
export function buildCustomNativeReminders({ customReminders = [], now = new Date() } = {}) {
  const list = [];
  if (!Array.isArray(customReminders)) return list;

  customReminders.forEach((cr, idx) => {
    if (!cr?.enabled || !cr?.time) return;
    const triggerDate = parseHHMMToTodayDate(cr.time, now);
    if (!triggerDate) return;
    const id = CUSTOM_NOTIFICATION_ID_BASE + idx;
    if (id > MAX_CUSTOM_NOTIFICATION_ID) return;
    const payload = buildCustomNotificationPayload(cr, now);
    list.push({
      id,
      reminderId: cr.id,
      hour: triggerDate.getHours(),
      minute: triggerDate.getMinutes(),
      title: payload.title,
      body: payload.body,
      extra: {
        kind: 'custom',
        reminderId: cr.id || null,
      },
    });
  });

  return list;
}

/**
 * Collect reminders due within a narrow local trigger window (default: up to 90s past scheduled moment)
 * so notifications fire reliably without repeating within the same day/window.
 */
export function collectDueNotifications({
  prayersSettings = {},
  customReminders = [],
  completedPrayersToday = [],
  leadMinutes = 0,
  sentKeys = {},
  now = new Date(),
  windowBackMs = 90 * 1000,
  windowForwardMs = 15 * 1000,
}) {
  const todayStr = getLocalDateStr(now);
  const completedSet = new Set(Array.isArray(completedPrayersToday) ? completedPrayersToday : []);
  const safeSent = sentKeys && typeof sentKeys === 'object' ? sentKeys : {};
  const dueItems = [];
  const newSentKeys = {};

  for (const prayerId of Object.keys(PRAYER_REMINDER_MESSAGES)) {
    const cfg = prayersSettings?.[prayerId];
    if (!cfg?.enabled || !cfg?.time || completedSet.has(prayerId)) continue;

    const triggerAt = computeTriggerDate(cfg.time, leadMinutes, now);
    if (!triggerAt) continue;

    const delta = now.getTime() - triggerAt.getTime();
    if (delta >= -windowForwardMs && delta <= windowBackMs) {
      const dedupKey = `${todayStr}:prayer:${prayerId}:${cfg.time}:${Number(leadMinutes) || 0}`;
      if (!safeSent[dedupKey]) {
        dueItems.push({
          dedupKey,
          payload: buildPrayerNotificationPayload(prayerId, cfg.time, leadMinutes, now),
        });
        newSentKeys[dedupKey] = now.getTime();
      }
    }
  }

  for (const cr of Array.isArray(customReminders) ? customReminders : []) {
    if (!cr?.enabled || !cr?.time) continue;
    const triggerAt = computeTriggerDate(cr.time, 0, now);
    if (!triggerAt) continue;

    const delta = now.getTime() - triggerAt.getTime();
    if (delta >= -windowForwardMs && delta <= windowBackMs) {
      const dedupKey = `${todayStr}:custom:${cr.id}:${cr.time}`;
      if (!safeSent[dedupKey]) {
        dueItems.push({
          dedupKey,
          payload: buildCustomNotificationPayload(cr, now),
        });
        newSentKeys[dedupKey] = now.getTime();
      }
    }
  }

  return { dueItems, newSentKeys };
}

export function pruneOldSentKeys(sentKeys = {}, todayDateStr = getLocalDateStr()) {
  if (!sentKeys || typeof sentKeys !== 'object') return {};
  const pruned = {};
  for (const [key, ts] of Object.entries(sentKeys)) {
    if (key.startsWith(`${todayDateStr}:`)) {
      pruned[key] = ts;
    }
  }
  return pruned;
}
