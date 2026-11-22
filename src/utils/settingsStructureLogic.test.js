import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_SETTINGS_SECTION_ID,
  SETTINGS_SECTIONS,
  SETTINGS_SEARCH_INDEX,
  buildSettingsSectionSummaries,
  getSettingsSectionMeta,
  isValidSettingsSectionId,
  searchSettingsItems,
} from './settingsStructureLogic';

test('SETTINGS_SECTIONS defines 5 prioritized categories starting with prayer', () => {
  assert.equal(SETTINGS_SECTIONS.length, 5);
  assert.equal(SETTINGS_SECTIONS[0].id, 'prayer');
  assert.equal(DEFAULT_SETTINGS_SECTION_ID, 'prayer');
  assert.deepEqual(
    SETTINGS_SECTIONS.map((s) => s.id),
    ['prayer', 'autopilot', 'appearance', 'sensory', 'account']
  );
  assert.equal(isValidSettingsSectionId('autopilot'), true);
  assert.equal(isValidSettingsSectionId('unknown'), false);
  assert.equal(getSettingsSectionMeta('unknown').id, 'prayer');
});

test('every SETTINGS_SEARCH_INDEX entry maps to a valid section', () => {
  for (const item of SETTINGS_SEARCH_INDEX) {
    assert.equal(
      isValidSettingsSectionId(item.sectionId),
      true,
      `Invalid sectionId ${item.sectionId} on ${item.id}`
    );
    assert.ok(item.title.length > 0);
    assert.ok(item.description.length > 0);
    assert.ok(Array.isArray(item.keywords) && item.keywords.length > 0);
  }
});

test('searchSettingsItems matches titles, synonyms, and multi-word queries across sections', () => {
  assert.deepEqual(searchSettingsItems(''), []);
  assert.deepEqual(searchSettingsItems('   '), []);

  const adhanResults = searchSettingsItems('adhan');
  assert.ok(adhanResults.length >= 1);
  assert.equal(adhanResults[0].id, 'adhan_alerts');
  assert.equal(adhanResults[0].sectionId, 'prayer');
  assert.equal(adhanResults[0].sectionLabel, 'Prayer & Location');

  const fridayResults = searchSettingsItems('jumuah');
  assert.ok(fridayResults.some((r) => r.id === 'friday_autopilot' && r.sectionId === 'autopilot'));

  const qadaResults = searchSettingsItems('missed prayer');
  assert.ok(qadaResults.some((r) => r.id === 'midnight_qada' && r.sectionId === 'autopilot'));
  const qadaExact = searchSettingsItems('qada');
  assert.ok(qadaExact.some((r) => r.id === 'midnight_qada'));

  const darkResults = searchSettingsItems('dark');
  assert.ok(darkResults.some((r) => r.id === 'theme_mode' && r.sectionId === 'appearance'));

  const vibResults = searchSettingsItems('vibration');
  assert.ok(vibResults.some((r) => r.id === 'tactile_haptics' && r.sectionId === 'sensory'));

  const exportResults = searchSettingsItems('export');
  assert.ok(exportResults.some((r) => r.id === 'backup_restore' && r.sectionId === 'account'));

  assert.deepEqual(searchSettingsItems('zzzznotasetting'), []);
});

test('buildSettingsSectionSummaries returns concise live status strings', () => {
  const active = buildSettingsSectionSummaries({
    prayerTimes: { hasLocation: true, cityLabel: 'London', localityLabel: 'Covent Garden, London' },
    devotionData: {
      profile: { name: 'Sayyid' },
      notificationChimeProfile: 'adhan_makkah',
      autopilot: {
        enabled: true,
        quietWorkHours: true,
        autoFocusPractice: true,
        fridayAutopilot: true,
        midnightQadaSweep: false,
        weeklyRestDay: null,
      },
    },
    isLightMode: false,
    devTimePhase: null,
    atmosphere: { meta: { shortLabel: 'Maghrib' } },
    isHapticsEnabled: true,
    isTactileAudioEnabled: true,
  });

  assert.equal(active.prayer, 'London · Makkah Adhan');
  assert.equal(active.autopilot, '3 rules active');
  assert.equal(active.appearance, 'Night · Auto · Maghrib');
  assert.equal(active.sensory, 'Audio · Haptics');
  assert.equal(active.account, 'Sayyid');

  const minimal = buildSettingsSectionSummaries({
    prayerTimes: { hasLocation: false },
    devotionData: {
      profile: { name: '' },
      notificationChimeProfile: 'silent',
      autopilot: { enabled: false },
    },
    isLightMode: true,
    devTimePhase: 0,
    atmosphere: { meta: { shortLabel: 'Fajr' } },
    isHapticsEnabled: false,
    isTactileAudioEnabled: false,
  });

  assert.equal(minimal.prayer, 'Set location · Silent');
  assert.equal(minimal.autopilot, 'Off');
  assert.equal(minimal.appearance, 'Daylight · Fajr');
  assert.equal(minimal.sensory, 'Muted');
  assert.equal(minimal.account, 'Seeker');
});
