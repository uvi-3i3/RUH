import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ATMOSPHERE_PHASE_META,
  buildSolarAtmosphereStops,
  resolveSolarAtmosphereState,
} from './atmosphereSyncLogic';

function makeLocalDate(hour, minute = 0) {
  return new Date(2026, 6, 15, hour, minute, 0, 0);
}

test('resolveSolarAtmosphereState syncs accurately to real calculated solar prayer times', () => {
  // Summer high-latitude schedule (e.g., London summer: Fajr 03:00, Sunrise 05:00, Dhuhr 13:05, Asr 17:15, Maghrib 21:10, Isha 22:50)
  const solarTimes = {
    fajr: makeLocalDate(3, 0),
    dhuhr: makeLocalDate(13, 5),
    asr: makeLocalDate(17, 15),
    maghrib: makeLocalDate(21, 10),
    isha: makeLocalDate(22, 50),
  };
  const sunrise = makeLocalDate(5, 0);

  // 01:30 -> Isha deep night
  const midnight = resolveSolarAtmosphereState({
    now: makeLocalDate(1, 30),
    solarTimes,
    sunrise,
  });
  assert.equal(midnight.phaseId, 'isha');
  assert.equal(midnight.source, 'solar');
  assert.equal(midnight.isAutoSynced, true);
  assert.ok(midnight.skyVisuals.starOpacity > 0.9);

  // 03:30 -> Fajr dawn (even though hardcoded clock hours would say Isha!)
  const earlyDawn = resolveSolarAtmosphereState({
    now: makeLocalDate(3, 30),
    solarTimes,
    sunrise,
  });
  assert.equal(earlyDawn.phaseId, 'fajr');
  assert.equal(earlyDawn.palette.name, 'Fajr');

  // 13:30 -> Dhuhr zenith
  const midday = resolveSolarAtmosphereState({
    now: makeLocalDate(13, 30),
    solarTimes,
    sunrise,
  });
  assert.equal(midday.phaseId, 'dhuhr');
  assert.equal(midday.palette.name, 'Dhuhr');
  assert.ok(midday.skyVisuals.starOpacity < 0.35);

  // 18:00 -> Asr golden amber (not Maghrib, since Maghrib is at 21:10!)
  const lateAfternoon = resolveSolarAtmosphereState({
    now: makeLocalDate(18, 0),
    solarTimes,
    sunrise,
  });
  assert.equal(lateAfternoon.phaseId, 'asr');
  assert.equal(lateAfternoon.palette.name, 'Asr');

  // 21:30 -> Maghrib twilight dusk
  const dusk = resolveSolarAtmosphereState({
    now: makeLocalDate(21, 30),
    solarTimes,
    sunrise,
  });
  assert.equal(dusk.phaseId, 'maghrib');
  assert.equal(dusk.palette.name, 'Maghrib');

  // 23:15 -> Isha velvet stillness
  const night = resolveSolarAtmosphereState({
    now: makeLocalDate(23, 15),
    solarTimes,
    sunrise,
  });
  assert.equal(night.phaseId, 'isha');
  assert.equal(night.palette.name, 'Isha');
});

test('resolveSolarAtmosphereState cross-fades smoothly leading into an upcoming prayer phase', () => {
  const solarTimes = {
    fajr: makeLocalDate(5, 0),
    dhuhr: makeLocalDate(12, 30),
    asr: makeLocalDate(16, 0),
    maghrib: makeLocalDate(18, 30),
    isha: makeLocalDate(20, 0),
  };

  // 10 minutes before Maghrib (transition starts at maghrib - 22m = 18:08)
  const approachingMaghrib = resolveSolarAtmosphereState({
    now: makeLocalDate(18, 20),
    solarTimes,
  });
  assert.equal(approachingMaghrib.blend.fromPhaseIndex, 2); // Asr
  assert.equal(approachingMaghrib.blend.toPhaseIndex, 3); // Maghrib
  assert.ok(approachingMaghrib.blend.t > 0.3 && approachingMaghrib.blend.t < 0.8);
  assert.match(approachingMaghrib.skyVisuals.darkSkyGradient, /^linear-gradient\(/);
  assert.match(approachingMaghrib.skyVisuals.lightSkyWash, /^linear-gradient\(/);
});

test('resolveSolarAtmosphereState falls back gracefully to configured HH:MM schedule when no solar coordinates exist', () => {
  const fallbackPrayers = {
    fajr: { enabled: true, time: '04:45' },
    dhuhr: { enabled: true, time: '12:15' },
    asr: { enabled: true, time: '15:45' },
    maghrib: { enabled: true, time: '18:00' },
    isha: { enabled: true, time: '19:30' },
  };

  const dusk = resolveSolarAtmosphereState({
    now: makeLocalDate(18, 20),
    solarTimes: null,
    fallbackPrayers,
  });
  assert.equal(dusk.source, 'schedule');
  assert.equal(dusk.isAutoSynced, true);
  assert.equal(dusk.phaseId, 'maghrib');
});

test('resolveSolarAtmosphereState respects manual atmosphere phase lock', () => {
  const solarTimes = {
    fajr: makeLocalDate(5, 0),
    dhuhr: makeLocalDate(12, 30),
    asr: makeLocalDate(16, 0),
    maghrib: makeLocalDate(18, 30),
    isha: makeLocalDate(20, 0),
  };

  const lockedAsr = resolveSolarAtmosphereState({
    now: makeLocalDate(23, 0), // midnight live
    solarTimes,
    manualPhase: 2, // lock Asr
  });
  assert.equal(lockedAsr.source, 'manual');
  assert.equal(lockedAsr.isAutoSynced, false);
  assert.equal(lockedAsr.phaseId, 'asr');
  assert.equal(lockedAsr.palette.name, 'Asr');
  assert.equal(lockedAsr.meta.label, ATMOSPHERE_PHASE_META[2].label);
});

test('buildSolarAtmosphereStops always produces monotonic stops from 0 to 1440', () => {
  const { stops } = buildSolarAtmosphereStops({ solarTimes: null, fallbackPrayers: null });
  assert.equal(stops[0][0], 0);
  assert.equal(stops[stops.length - 1][0], 1440);
  for (let i = 1; i < stops.length; i++) {
    assert.ok(stops[i][0] >= stops[i - 1][0], `Stop ${i} should be monotonic`);
  }
});
