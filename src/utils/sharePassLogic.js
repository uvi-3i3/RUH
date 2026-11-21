/**
 * Pure social sharing, caption composition, and mobile portrait export sizing helpers
 * for the Ruh Sanctuary Pass share studio.
 */

export const SHARE_FORMATS = [
  {
    id: 'story',
    label: 'Story 9:16',
    width: 1080,
    height: 1920,
    subtitle: 'Instagram · WhatsApp · TikTok',
  },
  {
    id: 'portrait',
    label: 'Post 4:5',
    width: 1080,
    height: 1350,
    subtitle: 'Feed · Threads · X',
  },
];

export const SHARE_SKY_MODES = [
  { id: 'daylight', label: 'Daylight' },
  { id: 'night', label: 'Starlight' },
];

export const DEFAULT_APP_SHARE_URL = 'https://ruh.sanctuary.app';

/**
 * Resolves a clean shareable app URL and short display host for the card footer.
 */
export function resolveAppShareUrl(originOrHref = '') {
  const raw = String(originOrHref || '').trim();
  if (!raw) {
    return { url: DEFAULT_APP_SHARE_URL, displayHost: 'ruh.sanctuary.app' };
  }
  try {
    const parsed = new URL(raw);
    const isLocal =
      parsed.hostname === 'localhost' ||
      parsed.hostname === '127.0.0.1' ||
      parsed.hostname.endsWith('.local');
    const cleanUrl = isLocal ? DEFAULT_APP_SHARE_URL : `${parsed.origin}/`;
    const displayHost = isLocal ? 'ruh.sanctuary.app' : parsed.host;
    return { url: cleanUrl, displayHost };
  } catch {
    return { url: DEFAULT_APP_SHARE_URL, displayHost: 'ruh.sanctuary.app' };
  }
}

/**
 * Looks up a valid portrait share format specification by id (defaults to Story 9:16).
 */
export function getShareFormat(formatId = 'story') {
  return SHARE_FORMATS.find((f) => f.id === formatId) || SHARE_FORMATS[0];
}

/**
 * Resolves the default sky backdrop atmosphere ('daylight' or 'night') from
 * explicit preference, current app theme, or selected card finish.
 */
export function resolveShareSkyMode({ skyPref = 'auto', isLightMode = false, finish = 'obsidian' } = {}) {
  if (skyPref === 'daylight' || skyPref === 'night') return skyPref;
  if (finish === 'ivory') return 'daylight';
  return isLightMode ? 'daylight' : 'night';
}

/**
 * Builds an inviting, growth-oriented social post caption for sharing a Seeker's Sanctuary Pass.
 */
export function buildSanctuaryShareCaption({
  holderName = 'Seeker',
  showName = true,
  stationName = 'Patience',
  stationNumeral = 'I',
  currentStreak = 0,
  totalPrayers = 0,
  totalVerses = 0,
  unlockedBadges = 0,
  totalBadges = 9,
  appUrl = DEFAULT_APP_SHARE_URL,
} = {}) {
  const safeName = showName && String(holderName || '').trim() ? String(holderName).trim() : null;
  const streak = Math.max(0, Math.floor(Number(currentStreak) || 0));
  const prayers = Math.max(0, Math.floor(Number(totalPrayers) || 0));
  const verses = Math.max(0, Math.floor(Number(totalVerses) || 0));
  const badges = Math.max(0, Math.floor(Number(unlockedBadges) || 0));
  const totalB = Math.max(1, Math.floor(Number(totalBadges) || 9));

  const intro = safeName
    ? `${safeName}'s Sanctuary Pass on Ruh (رُوح)`
    : 'My Sanctuary Pass on Ruh (رُوح)';

  const statParts = [`Station ${stationNumeral} · ${stationName}`];
  if (streak > 0) statParts.push(`${streak}-day streak`);
  if (prayers > 0) statParts.push(`${prayers} ${prayers === 1 ? 'prayer' : 'prayers'}`);
  if (verses > 0) statParts.push(`${verses} ${verses === 1 ? 'verse' : 'verses'} reflected`);
  if (badges > 0) statParts.push(`${badges}/${totalB} seals earned`);

  return `${intro}\n${statParts.join(' · ')}\n\nA quiet daily sanctuary for prayer, Qur'an reflection, and remembrance.\nBegin your own pass: ${appUrl}`;
}

/**
 * Generates properly encoded share intent links for major social platforms (no window.open needed).
 */
export function buildSocialShareLinks({ caption = '', url = DEFAULT_APP_SHARE_URL } = {}) {
  const safeCaption = String(caption || '').trim();
  const safeUrl = String(url || DEFAULT_APP_SHARE_URL).trim();

  // X intent puts url separately so avoid duplicating if caption already ends with url
  const xText = safeCaption.replace(safeUrl, '').trim();
  return {
    x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(xText)}&url=${encodeURIComponent(safeUrl)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(safeCaption)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(safeUrl)}&text=${encodeURIComponent(xText)}`,
  };
}

/**
 * Generates a clean, filesystem-safe download filename for the exported Sanctuary Pass PNG.
 */
export function buildShareFilename({ finish = 'obsidian', formatId = 'story', skyMode = 'night' } = {}) {
  const cleanFinish = String(finish || 'obsidian')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '') || 'obsidian';
  const cleanFormat = String(formatId || 'story')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '') || 'story';
  const cleanSky = skyMode === 'daylight' ? 'day' : 'night';
  return `ruh-sanctuary-pass-${cleanFinish}-${cleanSky}-${cleanFormat}.png`;
}
