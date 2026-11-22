/**
 * Pure geolocation, locality reverse-geocoding parsing, and regional prayer method
 * inference for Ruh (رُوح).
 *
 * Zero browser/DOM/network globals — 100% deterministic & unit-testable via node:test.
 */

const EARTH_RADIUS_KM = 6371;

const COUNTRY_TO_METHOD = {
  // Saudi Arabia — Umm Al-Qura
  SA: 'UmmAlQura',
  // Gulf states
  AE: 'Dubai',
  QA: 'Qatar',
  KW: 'Kuwait',
  BH: 'UmmAlQura',
  OM: 'UmmAlQura',
  YE: 'UmmAlQura',
  // North America — ISNA
  US: 'NorthAmerica',
  CA: 'NorthAmerica',
  // South Asia — University of Islamic Sciences, Karachi
  PK: 'Karachi',
  IN: 'Karachi',
  BD: 'Karachi',
  AF: 'Karachi',
  LK: 'Karachi',
  NP: 'Karachi',
  // Southeast Asia — MUIS / Singapore convention
  SG: 'Singapore',
  MY: 'Singapore',
  ID: 'Singapore',
  BN: 'Singapore',
  // Egypt & regions following Egyptian General Authority
  EG: 'Egyptian',
  SD: 'Egyptian',
  LY: 'Egyptian',
  SY: 'Egyptian',
  LB: 'Egyptian',
  IQ: 'Egyptian',
  NG: 'Egyptian',
  KE: 'Egyptian',
  TZ: 'Egyptian',
  // United Kingdom & Ireland — Moonsighting Committee
  GB: 'MoonsightingCommittee',
  IE: 'MoonsightingCommittee',
};

export function haversineDistanceKm(lat1, lng1, lat2, lng2) {
  if (
    !Number.isFinite(lat1) ||
    !Number.isFinite(lng1) ||
    !Number.isFinite(lat2) ||
    !Number.isFinite(lng2)
  ) {
    return Infinity;
  }
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function findNearestPresetCity(lat, lng, presets = []) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || !Array.isArray(presets) || presets.length === 0) {
    return null;
  }
  let best = null;
  let bestDistance = Infinity;
  for (const city of presets) {
    if (!city || typeof city.lat !== 'number' || typeof city.lng !== 'number') continue;
    const dist = haversineDistanceKm(lat, lng, city.lat, city.lng);
    if (dist < bestDistance) {
      bestDistance = dist;
      best = city;
    }
  }
  return best ? { city: best, distanceKm: Math.round(bestDistance) } : null;
}

export function inferCalculationMethodFromCountry(countryCode, lat = null, lng = null) {
  const code = typeof countryCode === 'string' ? countryCode.trim().toUpperCase() : '';
  if (code && COUNTRY_TO_METHOD[code]) {
    return COUNTRY_TO_METHOD[code];
  }
  // High-latitude fallback when country code is unavailable
  if (typeof lat === 'number' && Number.isFinite(lat) && Math.abs(lat) >= 48 && typeof lng === 'number' && lng >= -12 && lng <= 3) {
    return 'MoonsightingCommittee';
  }
  return 'MuslimWorldLeague';
}

function cleanText(val) {
  if (typeof val !== 'string') return '';
  return val.trim().replace(/\s+/g, ' ');
}

function pickFirstNonEmpty(...candidates) {
  for (const c of candidates) {
    const cleaned = cleanText(c);
    if (cleaned) return cleaned;
  }
  return '';
}

function isDuplicatePlace(a, b) {
  if (!a || !b) return false;
  const na = a.toLowerCase().replace(/^city of\s+/i, '').trim();
  const nb = b.toLowerCase().replace(/^city of\s+/i, '').trim();
  return na === nb || na.includes(nb) || nb.includes(na);
}

/**
 * Parse OpenStreetMap Nominatim reverse-geocode JSON (`format=jsonv2&addressdetails=1`)
 * into a rich, clean locality object.
 */
export function parseNominatimReverseResult(data, lat, lng) {
  if (!data || typeof data !== 'object' || !data.address || typeof data.address !== 'object') {
    return null;
  }
  const addr = data.address;

  const locality = pickFirstNonEmpty(
    addr.neighbourhood,
    addr.suburb,
    addr.quarter,
    addr.city_district,
    addr.borough,
    addr.village,
    addr.hamlet,
    addr.town
  );

  const city = pickFirstNonEmpty(
    addr.city,
    addr.town,
    addr.municipality,
    addr.county,
    addr.village,
    addr.state_district,
    addr.state
  );

  const region = pickFirstNonEmpty(addr.state, addr.province, addr.region, addr.county);
  const country = cleanText(addr.country);
  const countryCode = cleanText(addr.country_code).toUpperCase();
  const postcode = cleanText(addr.postcode);

  const primaryCity = city || locality;
  if (!primaryCity && !country) return null;

  const distinctLocality =
    locality && primaryCity && !isDuplicatePlace(locality, primaryCity) ? locality : '';
  const distinctRegion =
    region && !isDuplicatePlace(region, primaryCity) && !isDuplicatePlace(region, country)
      ? region
      : '';

  return {
    locality: distinctLocality,
    cityName: primaryCity || country,
    region: distinctRegion,
    country,
    countryCode,
    postcode,
    recommendedMethod: inferCalculationMethodFromCountry(countryCode, lat, lng),
  };
}

/**
 * Parse Komoot Photon reverse-geocode GeoJSON (`https://photon.komoot.io/reverse`)
 * into the same normalized locality object.
 */
export function parsePhotonReverseResult(data, lat, lng) {
  const props = data?.features?.[0]?.properties;
  if (!props || typeof props !== 'object') return null;

  const locality = pickFirstNonEmpty(props.district, props.locality, props.suburb);
  const city = pickFirstNonEmpty(props.city, props.county, props.name, props.state);
  const region = pickFirstNonEmpty(props.state, props.county);
  const country = cleanText(props.country);
  const countryCode = cleanText(props.countrycode).toUpperCase();
  const postcode = cleanText(props.postcode);

  const primaryCity = city || locality;
  if (!primaryCity && !country) return null;

  const distinctLocality =
    locality && primaryCity && !isDuplicatePlace(locality, primaryCity) ? locality : '';
  const distinctRegion =
    region && !isDuplicatePlace(region, primaryCity) && !isDuplicatePlace(region, country)
      ? region
      : '';

  return {
    locality: distinctLocality,
    cityName: primaryCity || country,
    region: distinctRegion,
    country,
    countryCode,
    postcode,
    recommendedMethod: inferCalculationMethodFromCountry(countryCode, lat, lng),
  };
}

/**
 * Format coordinates cleanly (e.g. "51.5074° N, 0.1278° W").
 */
export function formatCoordsLabel(lat, lng) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return '';
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lng).toFixed(4)}° ${lngDir}`;
}

/**
 * Build clean display labels for a saved location (city preset or GPS with locality).
 */
export function formatLocationLabels(location) {
  if (!location || typeof location !== 'object') {
    return {
      shortLabel: '',
      localityLine: '',
      regionLine: '',
      coordsLabel: '',
    };
  }

  const locality = cleanText(location.locality);
  const cityName = cleanText(location.cityName);
  const region = cleanText(location.region);
  const country = cleanText(location.country);

  const hasDistinctLocality = Boolean(locality && cityName && !isDuplicatePlace(locality, cityName));

  // Primary display line: "Covent Garden, London" or "London"
  const localityLine = hasDistinctLocality
    ? `${locality}, ${cityName}`
    : cityName || locality || 'Current Location';

  // Compact header label: prefer "Locality, City" when short enough, else "City"
  const shortLabel =
    hasDistinctLocality && localityLine.length <= 26
      ? localityLine
      : cityName || locality || 'Current Location';

  const regionParts = [];
  if (region && !isDuplicatePlace(region, cityName) && !isDuplicatePlace(region, country)) {
    regionParts.push(region);
  }
  if (country && !isDuplicatePlace(country, cityName)) {
    regionParts.push(country);
  }
  const regionLine = regionParts.join(', ');

  const coordsLabel =
    typeof location.lat === 'number' && typeof location.lng === 'number'
      ? formatCoordsLabel(location.lat, location.lng)
      : '';

  return {
    shortLabel,
    localityLine,
    regionLine,
    coordsLabel,
  };
}
