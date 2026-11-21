import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_APP_SHARE_URL,
  SHARE_FORMATS,
  SHARE_SKY_MODES,
  buildSanctuaryShareCaption,
  buildShareFilename,
  buildSocialShareLinks,
  getShareFormat,
  resolveAppShareUrl,
  resolveShareSkyMode,
} from './sharePassLogic.js';

test('resolveAppShareUrl falls back cleanly for localhost and preserves live hosted origin', () => {
  assert.deepEqual(resolveAppShareUrl('http://localhost:3000'), {
    url: DEFAULT_APP_SHARE_URL,
    displayHost: 'ruh.sanctuary.app',
  });
  assert.deepEqual(resolveAppShareUrl('https://ruh.app/journey?tab=1'), {
    url: 'https://ruh.app/',
    displayHost: 'ruh.app',
  });
  assert.deepEqual(resolveAppShareUrl(''), {
    url: DEFAULT_APP_SHARE_URL,
    displayHost: 'ruh.sanctuary.app',
  });
});

test('SHARE_FORMATS are mobile portrait-only and getShareFormat defaults to Story 9:16', () => {
  assert.equal(SHARE_FORMATS.length, 2);
  for (const fmt of SHARE_FORMATS) {
    assert.ok(fmt.height > fmt.width, `${fmt.id} should be portrait`);
  }
  assert.equal(getShareFormat('story').height, 1920);
  assert.equal(getShareFormat('portrait').height, 1350);
  assert.equal(getShareFormat('unknown').id, 'story');
});

test('resolveShareSkyMode resolves explicit sky mode and smart defaults cleanly', () => {
  assert.equal(SHARE_SKY_MODES.length, 2);
  assert.equal(resolveShareSkyMode({ skyPref: 'daylight', isLightMode: false, finish: 'obsidian' }), 'daylight');
  assert.equal(resolveShareSkyMode({ skyPref: 'night', isLightMode: true, finish: 'ivory' }), 'night');
  assert.equal(resolveShareSkyMode({ skyPref: 'auto', isLightMode: false, finish: 'ivory' }), 'daylight');
  assert.equal(resolveShareSkyMode({ skyPref: 'auto', isLightMode: true, finish: 'obsidian' }), 'daylight');
  assert.equal(resolveShareSkyMode({ skyPref: 'auto', isLightMode: false, finish: 'emerald' }), 'night');
});

test('buildSanctuaryShareCaption respects holder privacy and includes organic app CTA', () => {
  const named = buildSanctuaryShareCaption({
    holderName: 'Amina',
    showName: true,
    stationName: 'Gratitude',
    stationNumeral: 'II',
    currentStreak: 14,
    totalPrayers: 70,
    totalVerses: 9,
    unlockedBadges: 4,
    totalBadges: 9,
    appUrl: 'https://ruh.app/',
  });
  assert.ok(named.includes("Amina's Sanctuary Pass"));
  assert.ok(named.includes('Station II · Gratitude'));
  assert.ok(named.includes('14-day streak'));
  assert.ok(named.includes('70 prayers'));
  assert.ok(named.includes('4/9 seals earned'));
  assert.ok(named.includes('https://ruh.app/'));

  const anon = buildSanctuaryShareCaption({
    holderName: 'Amina',
    showName: false,
    stationName: 'Patience',
    stationNumeral: 'I',
    currentStreak: 0,
    totalPrayers: 0,
  });
  assert.ok(!anon.includes('Amina'));
  assert.ok(anon.includes('My Sanctuary Pass on Ruh'));
});

test('buildSocialShareLinks produces properly encoded social intent URLs', () => {
  const links = buildSocialShareLinks({
    caption: 'My Sanctuary Pass\nhttps://ruh.app/',
    url: 'https://ruh.app/',
  });
  assert.ok(links.x.startsWith('https://twitter.com/intent/tweet?text='));
  assert.ok(links.x.includes('url=https%3A%2F%2Fruh.app%2F'));
  assert.ok(links.whatsapp.startsWith('https://wa.me/?text='));
  assert.ok(links.telegram.startsWith('https://t.me/share/url?url='));
});

test('buildShareFilename sanitizes finish, sky mode, and format into a safe PNG filename', () => {
  assert.equal(
    buildShareFilename({ finish: 'Emerald', formatId: 'story', skyMode: 'daylight' }),
    'ruh-sanctuary-pass-emerald-day-story.png'
  );
  assert.equal(
    buildShareFilename({ finish: 'ivory', formatId: 'portrait', skyMode: 'night' }),
    'ruh-sanctuary-pass-ivory-night-portrait.png'
  );
});
