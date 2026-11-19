import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import {
  buildCustomNativeReminders,
  buildPrayerNotificationPayload,
  buildRollingNativePrayerSchedule,
  collectDueNotifications,
  computeTriggerDate,
  CUSTOM_NOTIFICATION_ID_BASE,
  formatDateToHHMM,
  MAX_CUSTOM_NOTIFICATION_ID,
  MAX_ROLLING_NOTIFICATION_ID,
  pruneOldSentKeys,
  ROLLING_NOTIFICATION_ID_BASE,
} from '../utils/notificationLogic';
import { getLocalDateStr } from '../utils/devotionLogic';

const SENT_STORAGE_KEY = 'ruh_sent_notifications_v1';
const ANDROID_PRAYER_CHANNEL_ID = 'ruh_prayers';

const PRAYER_ID_MAP = {
  fajr: 1,
  dhuhr: 2,
  asr: 3,
  maghrib: 4,
  isha: 5,
};

function readInitialSentKeys() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(SENT_STORAGE_KEY);
    if (!raw) return {};
    return pruneOldSentKeys(JSON.parse(raw), getLocalDateStr());
  } catch {
    return {};
  }
}

function getBrowserPermissionState() {
  if (typeof window === 'undefined') return 'unsupported';
  if (Capacitor.isNativePlatform()) return 'native';
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission || 'default';
}

function playGentleChime() {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const notes = [528, 792];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.14);

      gain.gain.setValueAtTime(0.0001, now + idx * 0.14);
      gain.gain.exponentialRampToValueAtTime(0.045, now + idx * 0.14 + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.14 + 1.4);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.14);
      osc.stop(now + idx * 0.14 + 1.45);
    });

    setTimeout(() => {
      ctx.close?.().catch(() => {});
    }, 1800);
  } catch {
    // Audio playback blocked cleanly before user gesture
  }
}

export function useLocalNotifications({ devotionData, prayerTimes }) {
  const [permission, setPermission] = useState(getBrowserPermissionState);
  const [activeToast, setActiveToast] = useState(null);
  const sentKeysRef = useRef(readInitialSentKeys());
  const toastTimerRef = useRef(null);
  const channelCreatedRef = useRef(false);

  const isNative = Capacitor.isNativePlatform();
  const ptCoords = prayerTimes?.coords || null;
  const ptMethod = prayerTimes?.method || 'MoonsightingCommittee';

  const ensureAndroidChannel = useCallback(async () => {
    if (!isNative || channelCreatedRef.current) return;
    if (Capacitor.getPlatform() !== 'android') return;
    try {
      await LocalNotifications.createChannel({
        id: ANDROID_PRAYER_CHANNEL_ID,
        name: 'Prayer & Devotion Alerts',
        description: 'Gentle solar Adhan prayer alerts and personal devotion reminders',
        importance: 4,
        visibility: 1,
        vibration: true,
      });
      channelCreatedRef.current = true;
    } catch {
      // Ignore if running on older Android API or emulator
    }
  }, [isNative]);

  const refreshPermission = useCallback(async () => {
    if (!isNative) {
      const next = getBrowserPermissionState();
      setPermission((prev) => (prev === next ? prev : next));
      return next;
    }
    try {
      const res = await LocalNotifications.checkPermissions();
      const next = res.display === 'granted' ? 'granted' : res.display || 'default';
      setPermission((prev) => (prev === next ? prev : next));
      return next;
    } catch {
      return 'default';
    }
  }, [isNative]);

  // Check native/browser permission on mount and window focus
  useEffect(() => {
    refreshPermission();
    ensureAndroidChannel();
    if (typeof window === 'undefined') return;
    const onFocus = () => {
      refreshPermission();
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [refreshPermission, ensureAndroidChannel]);

  const persistSentKeys = useCallback((nextMap) => {
    const pruned = pruneOldSentKeys(nextMap, getLocalDateStr());
    sentKeysRef.current = pruned;
    try {
      localStorage.setItem(SENT_STORAGE_KEY, JSON.stringify(pruned));
    } catch {
      // Ignore storage quota errors
    }
  }, []);

  const dismissToast = useCallback(() => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    setActiveToast(null);
  }, []);

  const showSanctuaryToast = useCallback((payload) => {
    if (!payload) return;
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setActiveToast({ ...payload, shownAt: Date.now() });
    toastTimerRef.current = setTimeout(() => {
      setActiveToast(null);
      toastTimerRef.current = null;
    }, 12000);
  }, []);

  const dispatchOsNotification = useCallback(
    async (payload) => {
      if (!payload) return false;

      if (isNative) {
        try {
          await ensureAndroidChannel();
          const res = await LocalNotifications.checkPermissions();
          if (res.display === 'granted') {
            await LocalNotifications.schedule({
              notifications: [
                {
                  id: Math.floor(Date.now() % 2147483000),
                  title: payload.title,
                  body: payload.body,
                  channelId:
                    Capacitor.getPlatform() === 'android' ? ANDROID_PRAYER_CHANNEL_ID : undefined,
                  schedule: { at: new Date(Date.now() + 200) },
                  extra: {
                    kind: payload.kind,
                    prayerId: payload.prayerId || null,
                    reminderId: payload.reminderId || null,
                  },
                },
              ],
            });
            return true;
          }
        } catch {
          return false;
        }
        return false;
      }

      if (typeof window === 'undefined' || !('Notification' in window)) {
        return false;
      }

      const currentPerm = Notification.permission;
      setPermission(currentPerm);
      if (currentPerm !== 'granted') {
        return false;
      }

      const notifOptions = {
        body: payload.body,
        icon: '/ruh-mark.svg',
        badge: '/ruh-mark.svg',
        tag: payload.tag || payload.id,
        renotify: true,
        silent: false,
        data: {
          prayerId: payload.prayerId || null,
          reminderId: payload.reminderId || null,
        },
      };

      // Prefer Service Worker notification when registered (supports actions + background wake)
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        try {
          const reg = await Promise.race([
            navigator.serviceWorker.ready,
            new Promise((_, reject) => setTimeout(() => reject(new Error('sw_timeout')), 800)),
          ]);
          if (reg && typeof reg.showNotification === 'function') {
            const swOptions =
              payload.kind === 'prayer'
                ? {
                    ...notifOptions,
                    actions: [{ action: 'mark_prayed', title: 'Log Prayer' }],
                  }
                : notifOptions;
            await reg.showNotification(payload.title, swOptions);
            return true;
          }
        } catch {
          // Fall through cleanly to direct Notification API
        }
      }

      try {
        const n = new Notification(payload.title, notifOptions);
        n.onclick = () => {
          window.focus?.();
          n.close();
        };
        return true;
      } catch {
        return false;
      }
    },
    [ensureAndroidChannel, isNative]
  );

  const deliverNotification = useCallback(
    async (payload) => {
      showSanctuaryToast(payload);
      if (devotionData.notificationChime) {
        playGentleChime();
      }
      return dispatchOsNotification(payload);
    },
    [devotionData.notificationChime, dispatchOsNotification, showSanctuaryToast]
  );

  const requestPermission = useCallback(async () => {
    if (isNative) {
      try {
        await ensureAndroidChannel();
        const res = await LocalNotifications.requestPermissions();
        const state = res.display === 'granted' ? 'granted' : 'denied';
        setPermission(state);
        return state;
      } catch {
        setPermission('denied');
        return 'denied';
      }
    }

    if (typeof window === 'undefined' || !('Notification' in window)) {
      setPermission('unsupported');
      return 'unsupported';
    }

    if (Notification.permission === 'granted') {
      setPermission('granted');
      return 'granted';
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    } catch {
      const current = Notification.permission || 'denied';
      setPermission(current);
      return current;
    }
  }, [ensureAndroidChannel, isNative]);

  const scheduleNativeReminder = useCallback(
    async (id, title, body, timeString, leadMinutes = 0) => {
      if (!isNative || !timeString) return;
      const triggerDate = computeTriggerDate(timeString, leadMinutes, new Date());
      if (!triggerDate) return;
      try {
        await ensureAndroidChannel();
        await LocalNotifications.cancel({ notifications: [{ id }] });
        await LocalNotifications.schedule({
          notifications: [
            {
              id,
              title,
              body,
              channelId:
                Capacitor.getPlatform() === 'android' ? ANDROID_PRAYER_CHANNEL_ID : undefined,
              schedule: {
                allowWhileIdle: true,
                on: { hour: triggerDate.getHours(), minute: triggerDate.getMinutes() },
              },
            },
          ],
        });
      } catch {
        // Ignore Capacitor schedule failure on non-native environments
      }
    },
    [ensureAndroidChannel, isNative]
  );

  const cancelNativeReminder = useCallback(
    async (id) => {
      if (!isNative) return;
      try {
        await LocalNotifications.cancel({ notifications: [{ id }] });
      } catch {
        // Ignore
      }
    },
    [isNative]
  );

  const sendPreviewAlert = useCallback(
    async (preferredPrayerId) => {
      const nextPrayerId =
        preferredPrayerId ||
        prayerTimes?.prayerData?.nextPrayer ||
        Object.keys(PRAYER_ID_MAP).find(
          (id) => !(devotionData.dailyCompletedPrayers || []).includes(id)
        ) ||
        'maghrib';

      const configuredTime = devotionData.prayers?.[nextPrayerId]?.time || '18:30';
      const payload = buildPrayerNotificationPayload(
        nextPrayerId,
        configuredTime,
        devotionData.notificationLeadMinutes || 0,
        new Date()
      );

      // Render Sanctuary alert + subtle chime immediately so UI feedback is instantaneous
      showSanctuaryToast(payload);
      if (devotionData.notificationChime) {
        playGentleChime();
      }

      let currentPerm = await refreshPermission();
      if (currentPerm === 'default') {
        currentPerm = await Promise.race([
          requestPermission(),
          new Promise((resolve) => setTimeout(() => resolve('default'), 1500)),
        ]);
      }

      const osDelivered = await dispatchOsNotification(payload);
      return { permission: currentPerm, osDelivered, payload };
    },
    [
      devotionData.dailyCompletedPrayers,
      devotionData.notificationChime,
      devotionData.notificationLeadMinutes,
      devotionData.prayers,
      dispatchOsNotification,
      prayerTimes?.prayerData?.nextPrayer,
      refreshPermission,
      requestPermission,
      showSanctuaryToast,
    ]
  );

  /**
   * Sync a rolling 14-day solar Adhan prayer schedule + enabled personal custom reminders
   * to the native OS scheduler so notifications remain accurate to the minute even without
   * opening the app for days or in airplane mode.
   */
  const syncAllNativePrayerSchedules = useCallback(
    async (overrideLead) => {
      if (!isNative) return;
      try {
        const perm = await LocalNotifications.checkPermissions();
        if (perm.display !== 'granted') return;

        await ensureAndroidChannel();

        const lead =
          typeof overrideLead === 'number'
            ? overrideLead
            : devotionData.notificationLeadMinutes || 0;

        // Gather pending notifications + legacy fixed IDs 1..5 to cancel cleanly before rescheduling
        const pendingRes = await LocalNotifications.getPending().catch(() => ({ notifications: [] }));
        const cancelIds = new Set(Object.values(PRAYER_ID_MAP));
        for (const item of pendingRes?.notifications || []) {
          if (
            typeof item?.id === 'number' &&
            ((item.id >= 1 && item.id <= 5) ||
              (item.id >= ROLLING_NOTIFICATION_ID_BASE && item.id <= MAX_ROLLING_NOTIFICATION_ID) ||
              (item.id >= CUSTOM_NOTIFICATION_ID_BASE && item.id <= MAX_CUSTOM_NOTIFICATION_ID))
          ) {
            cancelIds.add(item.id);
          }
        }
        if (cancelIds.size > 0) {
          await LocalNotifications.cancel({
            notifications: Array.from(cancelIds).map((id) => ({ id })),
          });
        }

        const isAndroid = Capacitor.getPlatform() === 'android';
        const rollingEntries = buildRollingNativePrayerSchedule({
          coords: ptCoords,
          method: ptMethod,
          prayersSettings: devotionData.prayers,
          leadMinutes: lead,
          completedPrayersToday: devotionData.dailyCompletedPrayers,
          days: 14,
          now: new Date(),
        });

        const customEntries = buildCustomNativeReminders({
          customReminders: devotionData.customReminders,
          now: new Date(),
        });

        const batch = [
          ...rollingEntries.map((entry) => ({
            id: entry.id,
            title: entry.title,
            body: entry.body,
            channelId: isAndroid ? ANDROID_PRAYER_CHANNEL_ID : undefined,
            schedule: {
              at: entry.triggerAt,
              allowWhileIdle: true,
            },
            extra: entry.extra,
          })),
          ...customEntries.map((entry) => ({
            id: entry.id,
            title: entry.title,
            body: entry.body,
            channelId: isAndroid ? ANDROID_PRAYER_CHANNEL_ID : undefined,
            schedule: {
              allowWhileIdle: true,
              on: { hour: entry.hour, minute: entry.minute },
            },
            extra: entry.extra,
          })),
        ];

        if (batch.length > 0) {
          await LocalNotifications.schedule({ notifications: batch });
        }
      } catch {
        // Gracefully ignore native schedule errors in restricted test sandboxes
      }
    },
    [
      devotionData.customReminders,
      devotionData.dailyCompletedPrayers,
      devotionData.notificationLeadMinutes,
      devotionData.prayers,
      ensureAndroidChannel,
      isNative,
      ptCoords,
      ptMethod,
    ]
  );

  // Automatically keep Capacitor native schedules synced when prayers, location, method, or lead offset change
  useEffect(() => {
    if (!isNative) return;
    syncAllNativePrayerSchedules();
  }, [isNative, syncAllNativePrayerSchedules]);

  // Listen to native notification tap events so tapping a prayer notification opens calmly and offers quick awareness
  useEffect(() => {
    if (!isNative) return;
    let active = true;
    let listenerHandle = null;

    LocalNotifications.addListener('localNotificationActionPerformed', (event) => {
      const extra = event?.notification?.extra;
      if (extra?.kind === 'prayer' && extra?.prayerId && event.actionId === 'mark_prayed') {
        devotionData.logPrayer?.(extra.prayerId, 'ontime');
      }
    })
      .then((handle) => {
        if (active) listenerHandle = handle;
        else handle.remove().catch(() => {});
      })
      .catch(() => {});

    return () => {
      active = false;
      listenerHandle?.remove?.().catch(() => {});
    };
  }, [devotionData.logPrayer, isNative]);

  // Handle Service Worker notification action messages + initial ?markPrayer= deep link
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const params = new URLSearchParams(window.location.search);
      const markPrayer = params.get('markPrayer');
      if (markPrayer && PRAYER_ID_MAP[markPrayer]) {
        if (!(devotionData.dailyCompletedPrayers || []).includes(markPrayer)) {
          devotionData.logPrayer?.(markPrayer, 'ontime');
        }
        params.delete('markPrayer');
        const nextUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
        window.history.replaceState({}, '', nextUrl);
      }
    } catch {
      // Ignore query parse failures
    }

    if (!('serviceWorker' in navigator)) return;
    const onSwMessage = (event) => {
      const msg = event?.data;
      if (msg?.type === 'RUH_NOTIFICATION_ACTION' && msg.action === 'mark_prayed' && msg.prayerId) {
        if (!(devotionData.dailyCompletedPrayers || []).includes(msg.prayerId)) {
          devotionData.logPrayer?.(msg.prayerId, 'ontime');
        }
      }
    };
    navigator.serviceWorker.addEventListener('message', onSwMessage);
    return () => navigator.serviceWorker.removeEventListener('message', onSwMessage);
  }, [devotionData.dailyCompletedPrayers, devotionData.logPrayer]);

  const schedulerConfigRef = useRef({
    prayers: devotionData.prayers,
    customReminders: devotionData.customReminders,
    dailyCompletedPrayers: devotionData.dailyCompletedPrayers,
    notificationLeadMinutes: devotionData.notificationLeadMinutes || 0,
    deliverNotification,
  });
  schedulerConfigRef.current = {
    prayers: devotionData.prayers,
    customReminders: devotionData.customReminders,
    dailyCompletedPrayers: devotionData.dailyCompletedPrayers,
    notificationLeadMinutes: devotionData.notificationLeadMinutes || 0,
    deliverNotification,
  };

  // Foreground / Background-tab scheduler for local push & sanctuary reminders
  useEffect(() => {
    const checkDue = () => {
      const cfg = schedulerConfigRef.current;
      const { dueItems, newSentKeys } = collectDueNotifications({
        prayersSettings: cfg.prayers,
        customReminders: cfg.customReminders,
        completedPrayersToday: cfg.dailyCompletedPrayers,
        leadMinutes: cfg.notificationLeadMinutes,
        sentKeys: sentKeysRef.current,
        now: new Date(),
      });

      if (dueItems.length > 0) {
        persistSentKeys({ ...sentKeysRef.current, ...newSentKeys });
        dueItems.forEach((item, index) => {
          setTimeout(() => {
            schedulerConfigRef.current.deliverNotification(item.payload);
          }, index * 600);
        });
      }
    };

    checkDue();
    const interval = setInterval(checkDue, 20000);
    const onVisChange = () => {
      if (document.visibilityState === 'visible') {
        refreshPermission();
        checkDue();
      }
    };
    document.addEventListener('visibilitychange', onVisChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisChange);
    };
  }, [persistSentKeys, refreshPermission]);

  // Cleanup active toast timeout on unmount
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const syncPrayerReminderTimes = devotionData.syncPrayerReminderTimes;
  const solarTimes = prayerTimes?.prayerData?.times;
  const canSyncSolarTimes = Boolean(solarTimes);

  const syncFromLiveSolarTimes = useCallback(() => {
    if (!solarTimes) return false;
    const formatted = {};
    for (const id of Object.keys(PRAYER_ID_MAP)) {
      if (solarTimes[id]) {
        formatted[id] = formatDateToHHMM(solarTimes[id]);
      }
    }
    syncPrayerReminderTimes?.(formatted);
    return true;
  }, [syncPrayerReminderTimes, solarTimes]);

  return useMemo(
    () => ({
      permission,
      isNative,
      activeToast,
      dismissToast,
      refreshPermission,
      requestPermission,
      sendPreviewAlert,
      scheduleNativeReminder,
      cancelNativeReminder,
      syncAllNativePrayerSchedules,
      syncFromLiveSolarTimes,
      canSyncSolarTimes,
      prayerIdMap: PRAYER_ID_MAP,
    }),
    [
      permission,
      isNative,
      activeToast,
      dismissToast,
      refreshPermission,
      requestPermission,
      sendPreviewAlert,
      scheduleNativeReminder,
      cancelNativeReminder,
      syncAllNativePrayerSchedules,
      syncFromLiveSolarTimes,
      canSyncSolarTimes,
    ]
  );
}
