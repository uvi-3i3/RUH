import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ADHAN_CHIME_PROFILES,
  DEFAULT_ADHAN_CHIME_PROFILE,
  buildAdhanChimeSequence,
  computeSolarReminderSyncPatch,
  getAdhanChimeProfileMeta,
  isVocalAdhanProfile,
  normalizeAdhanChimeProfile,
  resolveAdhanAudioTrack,
} from './adhanChimeLogic';

test('normalizeAdhanChimeProfile validates vocal Adhan and chime profiles with legacy compatibility', () => {
  assert.equal(DEFAULT_ADHAN_CHIME_PROFILE, 'adhan_makkah');
  assert.equal(normalizeAdhanChimeProfile('adhan_makkah', true), 'adhan_makkah');
  assert.equal(normalizeAdhanChimeProfile('adhan_madinah', true), 'adhan_madinah');
  assert.equal(normalizeAdhanChimeProfile('adhan_mishary', true), 'adhan_mishary');
  assert.equal(normalizeAdhanChimeProfile('hijaz_whisper', true), 'hijaz_whisper');
  assert.equal(normalizeAdhanChimeProfile('fajr_ney', false), 'fajr_ney');
  assert.equal(normalizeAdhanChimeProfile('sanctuary_bell', true), 'sanctuary_bell');
  assert.equal(normalizeAdhanChimeProfile('silent', true), 'silent');

  // Legacy migration when profileId is missing or invalid
  assert.equal(normalizeAdhanChimeProfile(undefined, false), 'silent');
  assert.equal(normalizeAdhanChimeProfile(undefined, true), DEFAULT_ADHAN_CHIME_PROFILE);
  assert.equal(normalizeAdhanChimeProfile('unknown_tone', true), DEFAULT_ADHAN_CHIME_PROFILE);
  assert.equal(ADHAN_CHIME_PROFILES.length, 6);
  assert.equal(getAdhanChimeProfileMeta('adhan_makkah').label, 'Makkah Adhan');
  assert.equal(getAdhanChimeProfileMeta('fajr_ney').label, 'Dawn Ney');
  assert.equal(isVocalAdhanProfile('adhan_madinah'), true);
  assert.equal(isVocalAdhanProfile('hijaz_whisper'), false);
});

test('resolveAdhanAudioTrack selects vocal MP3 tracks and uses authentic Fajr Adhan at live dawn', () => {
  const makkahDhuhr = resolveAdhanAudioTrack('adhan_makkah', {
    prayerId: 'dhuhr',
    isPreview: false,
  });
  assert.equal(makkahDhuhr.mode, 'audio');
  assert.equal(makkahDhuhr.audioUrl, '/audio/adhan-makkah.mp3');
  assert.equal(makkahDhuhr.isFajrVariant, false);

  const liveFajr = resolveAdhanAudioTrack('adhan_makkah', {
    prayerId: 'fajr',
    isPreview: false,
  });
  assert.equal(liveFajr.mode, 'audio');
  assert.equal(liveFajr.audioUrl, '/audio/adhan-fajr.mp3');
  assert.equal(liveFajr.isFajrVariant, true);
  assert.ok(liveFajr.volume < makkahDhuhr.volume);

  // Previewing Makkah during Fajr hour still plays the Makkah voice the user tapped
  const previewMakkah = resolveAdhanAudioTrack('adhan_makkah', {
    prayerId: 'fajr',
    isPreview: true,
  });
  assert.equal(previewMakkah.audioUrl, '/audio/adhan-makkah.mp3');
  assert.equal(previewMakkah.isFajrVariant, false);

  const chime = resolveAdhanAudioTrack('hijaz_whisper', { prayerId: 'asr' });
  assert.equal(chime.mode, 'chime');
  assert.equal(chime.audioUrl, null);

  const silent = resolveAdhanAudioTrack('silent', { prayerId: 'maghrib' });
  assert.equal(silent.mode, 'silent');
});

test('buildAdhanChimeSequence differentiates full Adhan cadence vs pre-prayer whisper vs silent', () => {
  const fullHijaz = buildAdhanChimeSequence('hijaz_whisper', {
    prayerId: 'maghrib',
    leadMinutes: 0,
  });
  const earlyHijaz = buildAdhanChimeSequence('hijaz_whisper', {
    prayerId: 'maghrib',
    leadMinutes: 10,
  });
  const silent = buildAdhanChimeSequence('silent', { prayerId: 'maghrib', leadMinutes: 0 });

  assert.equal(fullHijaz.notes.length, 6);
  assert.equal(earlyHijaz.notes.length, 3);
  assert.ok(fullHijaz.totalDurationSec > earlyHijaz.totalDurationSec);
  assert.equal(silent.notes.length, 0);
  assert.equal(silent.totalDurationSec, 0);
});

test('buildAdhanChimeSequence softens volume and warmth for Fajr and Isha quiet hours', () => {
  const dhuhrPlan = buildAdhanChimeSequence('hijaz_whisper', { prayerId: 'dhuhr', leadMinutes: 0 });
  const fajrPlan = buildAdhanChimeSequence('hijaz_whisper', { prayerId: 'fajr', leadMinutes: 0 });
  const ishaPlan = buildAdhanChimeSequence('fajr_ney', { prayerId: 'isha', leadMinutes: 0 });
  const asrNeyPlan = buildAdhanChimeSequence('fajr_ney', { prayerId: 'asr', leadMinutes: 0 });

  assert.ok(fajrPlan.notes[0].peakGain < dhuhrPlan.notes[0].peakGain);
  assert.ok(fajrPlan.filterCutoffHz < dhuhrPlan.filterCutoffHz);
  assert.ok(ishaPlan.notes[0].peakGain < asrNeyPlan.notes[0].peakGain);
  assert.ok(ishaPlan.notes[0].breathGain > 0);
});

test('buildAdhanChimeSequence builds valid Sanctuary Bell harmonic sequence', () => {
  const bell = buildAdhanChimeSequence('sanctuary_bell', { prayerId: 'asr', leadMinutes: 0 });
  assert.equal(bell.notes.length, 4);
  assert.equal(bell.notes[0].freqHz, 432);
  assert.ok(bell.totalDurationSec > 3);
});

test('computeSolarReminderSyncPatch detects changes cleanly without mutating unchanged schedules', () => {
  const solarTimes = {
    fajr: new Date(2026, 6, 15, 4, 52),
    dhuhr: new Date(2026, 6, 15, 12, 34),
    asr: new Date(2026, 6, 15, 16, 18),
    maghrib: new Date(2026, 6, 15, 19, 44),
    isha: new Date(2026, 6, 15, 21, 12),
  };

  const currentStale = {
    fajr: { enabled: true, time: '05:15' },
    dhuhr: { enabled: false, time: '12:45' },
    asr: { enabled: true, time: '16:15' },
    maghrib: { enabled: true, time: '18:30' },
    isha: { enabled: false, time: '20:00' },
  };

  const patch = computeSolarReminderSyncPatch({ currentPrayers: currentStale, solarTimes });
  assert.equal(patch.hasChanges, true);
  assert.deepEqual(patch.nextTimesHHMM, {
    fajr: '04:52',
    dhuhr: '12:34',
    asr: '16:18',
    maghrib: '19:44',
    isha: '21:12',
  });

  // Once already synced, hasChanges should be false
  const alreadySynced = {
    fajr: { enabled: true, time: '04:52' },
    dhuhr: { enabled: false, time: '12:34' },
    asr: { enabled: true, time: '16:18' },
    maghrib: { enabled: true, time: '19:44' },
    isha: { enabled: false, time: '21:12' },
  };
  const noopPatch = computeSolarReminderSyncPatch({ currentPrayers: alreadySynced, solarTimes });
  assert.equal(noopPatch.hasChanges, false);
});
