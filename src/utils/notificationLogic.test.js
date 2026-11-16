import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatDateToHHMM,
  computeTriggerDate,
  buildPrayerNotificationPayload,
  buildRollingNativePrayerSchedule,
  buildCustomNativeReminders,
  collectDueNotifications,
  pruneOldSentKeys,
} from './notificationLogic';

test('formatDateToHHMM and computeTriggerDate shift lead minutes accurately', () => {
  const sample = new Date(2026, 10, 15, 5, 15, 0, 0);
  assert.equal(formatDateToHHMM(sample), '05:15');

  const triggerAtTime = computeTriggerDate('05:15', 0, sample);
  assert.equal(formatDateToHHMM(triggerAtTime), '05:15');

  const triggerTenEarly = computeTriggerDate('05:15', 10, sample);
  assert.equal(formatDateToHHMM(triggerTenEarly), '05:05');

  const wrapMidnight = computeTriggerDate('00:05', 10, sample);
  assert.equal(wrapMidnight.getHours(), 23);
  assert.equal(wrapMidnight.getMinutes(), 55);
});

test('buildPrayerNotificationPayload creates gentle calm copy for on-time and lead offsets', () => {
  const onTime = buildPrayerNotificationPayload('maghrib', '18:30', 0);
  assert.equal(onTime.prayerId, 'maghrib');
  assert.equal(onTime.arabic, 'المغرب');
  assert.match(onTime.title, /Maghrib Prayer/);
  assert.match(onTime.body, /evening gratitude/i);

  const early = buildPrayerNotificationPayload('fajr', '05:15', 10);
  assert.match(early.title, /Fajr in 10m/);
  assert.match(early.body, /10m before Fajr/);
});

test('buildRollingNativePrayerSchedule schedules multi-day calculated solar times and skips past & completed today', () => {
  // Reference: 2026-11-15 at 13:30 local (Fajr & Dhuhr already passed; Asr/Maghrib/Isha still ahead)
  const now = new Date(2026, 10, 15, 13, 30, 0, 0);
  const londonCoords = { lat: 51.5074, lng: -0.1278 };
  const prayersSettings = {
    fajr: { enabled: true, time: '05:30' },
    dhuhr: { enabled: true, time: '12:00' },
    asr: { enabled: true, time: '14:00' },
    maghrib: { enabled: true, time: '16:15' },
    isha: { enabled: false, time: '18:00' },
  };

  const items = buildRollingNativePrayerSchedule({
    coords: londonCoords,
    method: 'MuslimWorldLeague',
    prayersSettings,
    leadMinutes: 10,
    completedPrayersToday: ['asr'], // already prayed Asr today -> skip dayOffset 0 for Asr
    days: 5,
    now,
  });

  // No disabled Isha entries
  assert.equal(items.some((i) => i.prayerId === 'isha'), false);

  // Day 0 skips Fajr/Dhuhr (in past) and Asr (already completed), leaving Maghrib if ahead
  const day0 = items.filter((i) => i.dayOffset === 0);
  assert.equal(day0.some((i) => i.prayerId === 'fajr'), false);
  assert.equal(day0.some((i) => i.prayerId === 'asr'), false);

  // Days 1..4 should each schedule Fajr, Dhuhr, Asr, Maghrib (4 per day)
  const laterDays = items.filter((i) => i.dayOffset >= 1);
  assert.equal(laterDays.length, 4 * 4);

  // Unique integer notification IDs inside expected range
  const uniqueIds = new Set(items.map((i) => i.id));
  assert.equal(uniqueIds.size, items.length);
  for (const id of uniqueIds) {
    assert.ok(id >= 100 && id <= 299);
  }

  // Day 1 Fajr & Day 4 Fajr should reflect actual solar shift over 3 days (non-zero drift allowed, valid Future trigger)
  const day1Fajr = items.find((i) => i.dayOffset === 1 && i.prayerId === 'fajr');
  const day4Fajr = items.find((i) => i.dayOffset === 4 && i.prayerId === 'fajr');
  assert.ok(day1Fajr && day4Fajr);
  assert.ok(day1Fajr.triggerAt > now);
  assert.match(day1Fajr.title, /Fajr in 10m/);
});

test('buildRollingNativePrayerSchedule falls back cleanly to configured HH:MM when coords are absent', () => {
  const now = new Date(2026, 10, 15, 4, 0, 0, 0);
  const prayersSettings = {
    fajr: { enabled: true, time: '05:15' },
  };
  const items = buildRollingNativePrayerSchedule({
    coords: null,
    prayersSettings,
    leadMinutes: 5,
    days: 3,
    now,
  });

  assert.equal(items.length, 3);
  assert.equal(items[0].triggerAt.getHours(), 5);
  assert.equal(items[0].triggerAt.getMinutes(), 10);
});

test('buildCustomNativeReminders emits deterministic IDs starting at 300', () => {
  const custom = [
    { id: 'c1', title: 'Morning Adhkar', time: '06:30', enabled: true },
    { id: 'c2', title: 'Evening Pause', time: '19:45', enabled: false },
    { id: 'c3', title: 'Witr Reminder', time: '22:15', enabled: true },
  ];
  const mapped = buildCustomNativeReminders({ customReminders: custom });
  assert.equal(mapped.length, 2);
  assert.equal(mapped[0].id, 300);
  assert.equal(mapped[0].hour, 6);
  assert.equal(mapped[0].minute, 30);
  assert.equal(mapped[1].id, 302);
  assert.equal(mapped[1].hour, 22);
  assert.equal(mapped[1].minute, 15);
});

test('collectDueNotifications triggers enabled due prayers, skips completed & dedups cleanly', () => {
  const now = new Date(2026, 10, 15, 12, 35, 20, 0); // 12:35:20
  const prayersSettings = {
    fajr: { enabled: true, time: '05:15' }, // Not due now
    dhuhr: { enabled: true, time: '12:45' }, // Due with 10m lead (12:35:00 -> +20s)
    asr: { enabled: false, time: '12:35' }, // Disabled
  };

  // First check: Dhuhr is due
  const res1 = collectDueNotifications({
    prayersSettings,
    customReminders: [{ id: 'c1', title: 'Salawat', time: '12:35', enabled: true }],
    completedPrayersToday: [],
    leadMinutes: 10,
    sentKeys: {},
    now,
  });

  assert.equal(res1.dueItems.length, 2);
  assert.equal(res1.dueItems[0].payload.prayerId, 'dhuhr');
  assert.equal(res1.dueItems[1].payload.reminderId, 'c1');

  // Second check with updated sentKeys: no duplicates fire
  const res2 = collectDueNotifications({
    prayersSettings,
    customReminders: [{ id: 'c1', title: 'Salawat', time: '12:35', enabled: true }],
    completedPrayersToday: [],
    leadMinutes: 10,
    sentKeys: res1.newSentKeys,
    now,
  });
  assert.equal(res2.dueItems.length, 0);

  // If Dhuhr already logged today, skip notification even with empty sentKeys
  const res3 = collectDueNotifications({
    prayersSettings,
    customReminders: [],
    completedPrayersToday: ['dhuhr'],
    leadMinutes: 10,
    sentKeys: {},
    now,
  });
  assert.equal(res3.dueItems.length, 0);
});

test('pruneOldSentKeys drops previous dates cleanly', () => {
  const kept = pruneOldSentKeys(
    {
      '2026-11-14:prayer:fajr:05:15:0': 1000,
      '2026-11-15:prayer:fajr:05:15:0': 2000,
    },
    '2026-11-15'
  );
  assert.deepEqual(kept, { '2026-11-15:prayer:fajr:05:15:0': 2000 });
});
