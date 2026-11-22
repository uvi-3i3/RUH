import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Coordinates, PrayerTimes } from 'adhan';
import {
  calculateDistanceToKaabaKm,
  calculateQiblaBearing,
  formatCardinalDirection,
  formatCountdown,
} from '../utils/devotionLogic';
import { getAdhanCalculationParams } from '../utils/prayerMethod';
import { hydrateMissingFromPreferences, mirroredRemove, mirroredSet } from '../utils/nativeStorage';
import { CITY_PRESETS } from '../data/cities';
import {
  findNearestPresetCity,
  formatLocationLabels,
  parseNominatimReverseResult,
  parsePhotonReverseResult,
} from '../utils/locationLogic';

const LOCATION_STORAGE_KEY = 'ruh_location_v1';
const LEGACY_COORDS_KEY = 'ruh_coords';
const METHOD_STORAGE_KEY = 'ruh_prayer_method_v1';

const ARABIC_NAMES = {
  fajr: 'الفجر',
  dhuhr: 'الظهر',
  asr: 'العصر',
  maghrib: 'المغرب',
  isha: 'العشاء',
};

function formatTime(date) {
  if (!date) return '';
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
}

function minutesUntil(target) {
  if (!target) return Infinity;
  return Math.max(0, Math.round((target.getTime() - Date.now()) / 60000));
}

function loadSavedLocation() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LOCATION_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed?.lat === 'number' && typeof parsed?.lng === 'number') {
        return parsed;
      }
    }
    const legacy = localStorage.getItem(LEGACY_COORDS_KEY);
    if (legacy) {
      const parsed = JSON.parse(legacy);
      if (typeof parsed?.lat === 'number' && typeof parsed?.lng === 'number') {
        return { lat: parsed.lat, lng: parsed.lng, source: 'gps', cityName: 'Current Location' };
      }
    }
  } catch {}
  return null;
}

function loadSavedMethod() {
  if (typeof window === 'undefined') return 'MoonsightingCommittee';
  try {
    return localStorage.getItem(METHOD_STORAGE_KEY) || 'MoonsightingCommittee';
  } catch {
    return 'MoonsightingCommittee';
  }
}

async function fetchJsonWithTimeout(url, timeoutMs = 6000) {
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: controller ? controller.signal : undefined,
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/**
 * Resolve exact locality (neighborhood / suburb / city / state / country) from coordinates
 * using CORS-friendly OpenStreetMap Nominatim + Komoot Photon fallback, with offline nearest-city safety.
 */
async function resolveLocalityFromCoords(lat, lng) {
  // 1. Try OpenStreetMap Nominatim first for granular neighborhood/suburb locality + postcode
  const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
    lat
  )}&lon=${encodeURIComponent(lng)}&zoom=16&addressdetails=1&accept-language=en`;
  const nomData = await fetchJsonWithTimeout(nominatimUrl, 5500);
  const parsedNom = parseNominatimReverseResult(nomData, lat, lng);
  if (parsedNom) return parsedNom;

  // 2. Fallback to Komoot Photon (CORS `*`)
  const photonUrl = `https://photon.komoot.io/reverse?lat=${encodeURIComponent(
    lat
  )}&lon=${encodeURIComponent(lng)}`;
  const photonData = await fetchJsonWithTimeout(photonUrl, 5500);
  const parsedPhoton = parsePhotonReverseResult(photonData, lat, lng);
  if (parsedPhoton) return parsedPhoton;

  // 3. Offline safety: match nearest preset city if within 120 km
  const nearest = findNearestPresetCity(lat, lng, CITY_PRESETS);
  if (nearest && nearest.distanceKm <= 120) {
    return {
      locality: '',
      cityName: nearest.city.name,
      region: '',
      country: nearest.city.country,
      countryCode: '',
      postcode: '',
      recommendedMethod: nearest.city.method || 'MoonsightingCommittee',
    };
  }

  return null;
}

export function usePrayerTimes() {
  const [location, setLocation] = useState(loadSavedLocation);
  const [locationError, setLocationError] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [localityResolving, setLocalityResolving] = useState(false);
  const [method, setMethodState] = useState(loadSavedMethod);
  const [tick, setTick] = useState(0);
  const requestSeqRef = useRef(0);

  const persistLocation = useCallback((nextLoc) => {
    setLocation(nextLoc);
    if (nextLoc) {
      mirroredSet(LOCATION_STORAGE_KEY, JSON.stringify(nextLoc));
    } else {
      mirroredRemove(LOCATION_STORAGE_KEY);
    }
  }, []);

  const setMethod = useCallback((nextMethod) => {
    setMethodState(nextMethod);
    mirroredSet(METHOD_STORAGE_KEY, nextMethod);
  }, []);

  const refresh = useCallback(() => {
    setTick((t) => t + 1);
  }, []);

  const requestLocation = useCallback(() => {
    const seq = ++requestSeqRef.current;

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      const msg = 'Location access is unavailable here — choose your city below.';
      setLocationError(msg);
      return Promise.resolve({ ok: false, error: msg });
    }

    setLocationLoading(true);
    setLocationError(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          if (seq !== requestSeqRef.current) {
            resolve({ ok: false, cancelled: true });
            return;
          }

          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const accuracyMeters = Number.isFinite(pos.coords.accuracy)
            ? Math.round(pos.coords.accuracy)
            : null;

          // Immediately persist exact GPS coordinates so solar prayer times & Qibla update without delay
          const nearest = findNearestPresetCity(lat, lng, CITY_PRESETS);
          const provisionalLoc = {
            lat,
            lng,
            source: 'gps',
            locality: '',
            cityName:
              nearest && nearest.distanceKm <= 80 ? nearest.city.name : 'Current Location',
            region: '',
            country: nearest && nearest.distanceKm <= 80 ? nearest.city.country : '',
            countryCode: '',
            postcode: '',
            accuracyMeters,
            resolvedAt: null,
          };

          persistLocation(provisionalLoc);
          if (nearest && nearest.distanceKm <= 120 && nearest.city.method) {
            setMethod(nearest.city.method);
          }

          setLocationLoading(false);
          setLocalityResolving(true);

          try {
            const resolved = await resolveLocalityFromCoords(lat, lng);
            if (seq !== requestSeqRef.current) {
              resolve({ ok: false, cancelled: true });
              return;
            }

            if (resolved) {
              const enrichedLoc = {
                lat,
                lng,
                source: 'gps',
                locality: resolved.locality || '',
                cityName: resolved.cityName || provisionalLoc.cityName,
                region: resolved.region || '',
                country: resolved.country || '',
                countryCode: resolved.countryCode || '',
                postcode: resolved.postcode || '',
                accuracyMeters,
                resolvedAt: Date.now(),
              };
              persistLocation(enrichedLoc);
              if (resolved.recommendedMethod) {
                setMethod(resolved.recommendedMethod);
              }
              setLocalityResolving(false);
              resolve({ ok: true, location: enrichedLoc });
              return;
            }
          } catch {
            // Keep provisional GPS location cleanly if reverse geocoder fails
          }

          setLocalityResolving(false);
          resolve({ ok: true, location: provisionalLoc });
        },
        (err) => {
          if (seq !== requestSeqRef.current) {
            resolve({ ok: false, cancelled: true });
            return;
          }
          const msg =
            err?.code === 1
              ? 'Location permission was declined. Allow access or pick your city below.'
              : err?.code === 3
                ? 'Could not get a GPS fix in time. Try again or pick your city.'
                : err?.message || 'Unable to detect your location right now.';
          setLocationError(msg);
          setLocationLoading(false);
          setLocalityResolving(false);
          resolve({ ok: false, error: msg });
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 300000 }
      );
    });
  }, [persistLocation, setMethod]);

  const selectCity = useCallback(
    (city) => {
      if (!city || typeof city.lat !== 'number' || typeof city.lng !== 'number') return;
      requestSeqRef.current += 1;
      setLocationLoading(false);
      setLocalityResolving(false);
      persistLocation({
        lat: city.lat,
        lng: city.lng,
        source: 'city',
        cityId: city.id,
        locality: '',
        cityName: city.name,
        region: '',
        country: city.country,
        countryCode: '',
      });
      if (city.method) {
        setMethod(city.method);
      }
      setLocationError(null);
    },
    [persistLocation, setMethod]
  );

  // Hydrate location/method from native Preferences if WebView storage was purged;
  // backfill real locality for legacy saved GPS locations ('GPS Location' / 'Current Location').
  useEffect(() => {
    let cancelled = false;
    hydrateMissingFromPreferences([LOCATION_STORAGE_KEY, METHOD_STORAGE_KEY]).then((recovered) => {
      if (cancelled) return;
      if (recovered[METHOD_STORAGE_KEY]) {
        setMethodState(recovered[METHOD_STORAGE_KEY]);
      }
      let activeLoc = location;
      if (recovered[LOCATION_STORAGE_KEY]) {
        try {
          const parsed = JSON.parse(recovered[LOCATION_STORAGE_KEY]);
          if (typeof parsed?.lat === 'number' && typeof parsed?.lng === 'number') {
            setLocation(parsed);
            activeLoc = parsed;
          }
        } catch {}
      }

      if (
        activeLoc &&
        activeLoc.source === 'gps' &&
        !activeLoc.resolvedAt &&
        (!activeLoc.cityName ||
          activeLoc.cityName === 'GPS Location' ||
          activeLoc.cityName === 'Current Location')
      ) {
        resolveLocalityFromCoords(activeLoc.lat, activeLoc.lng).then((resolved) => {
          if (cancelled || !resolved) return;
          persistLocation({
            ...activeLoc,
            locality: resolved.locality || '',
            cityName: resolved.cityName || activeLoc.cityName,
            region: resolved.region || '',
            country: resolved.country || '',
            countryCode: resolved.countryCode || '',
            postcode: resolved.postcode || '',
            resolvedAt: Date.now(),
          });
        });
        return;
      }

      if (!activeLoc && typeof navigator !== 'undefined' && navigator.permissions?.query) {
        navigator.permissions
          .query({ name: 'geolocation' })
          .then((status) => {
            if (!cancelled && status.state === 'granted') {
              requestLocation();
            }
          })
          .catch(() => {});
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const lat = location?.lat ?? null;
  const lng = location?.lng ?? null;
  const coords = useMemo(
    () => (typeof lat === 'number' && typeof lng === 'number' ? { lat, lng } : null),
    [lat, lng]
  );

  // Update countdown every 30s ONLY when a location is active
  useEffect(() => {
    if (!coords) return undefined;
    const interval = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(interval);
  }, [coords]);

  const prayerData = useMemo(() => {
    if (!coords) return null;

    const coordinates = new Coordinates(coords.lat, coords.lng);
    const date = new Date();
    const params = getAdhanCalculationParams(method);
    const pt = new PrayerTimes(coordinates, date, params);

    const times = {
      fajr: pt.fajr,
      dhuhr: pt.dhuhr,
      asr: pt.asr,
      maghrib: pt.maghrib,
      isha: pt.isha,
    };

    const now = new Date();
    const prayerOrder = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    let currentPrayer = null;
    let nextPrayer = null;
    let nextPrayerTime = null;

    for (let i = prayerOrder.length - 1; i >= 0; i--) {
      if (now >= times[prayerOrder[i]]) {
        currentPrayer = prayerOrder[i];
        if (i < prayerOrder.length - 1) {
          nextPrayer = prayerOrder[i + 1];
          nextPrayerTime = times[prayerOrder[i + 1]];
        }
        break;
      }
    }

    if (!currentPrayer) {
      nextPrayer = 'fajr';
      nextPrayerTime = times.fajr;
    }

    if (currentPrayer === 'isha' && !nextPrayer) {
      const tomorrow = new Date(date);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowPt = new PrayerTimes(coordinates, tomorrow, params);
      nextPrayer = 'fajr';
      nextPrayerTime = tomorrowPt.fajr;
    }

    const countdown = nextPrayerTime ? minutesUntil(nextPrayerTime) : null;
    const formattedCountdown = countdown !== null ? formatCountdown(countdown) : '';
    const qiblaBearing = calculateQiblaBearing(coords.lat, coords.lng);
    const distanceToKaabaKm = calculateDistanceToKaabaKm(coords.lat, coords.lng);
    const qiblaCardinal = formatCardinalDirection(qiblaBearing);

    return {
      times,
      sunrise: pt.sunrise,
      formatted: {
        fajr: formatTime(times.fajr),
        dhuhr: formatTime(times.dhuhr),
        asr: formatTime(times.asr),
        maghrib: formatTime(times.maghrib),
        isha: formatTime(times.isha),
      },
      currentPrayer,
      nextPrayer,
      nextPrayerTime,
      countdown,
      formattedCountdown,
      qiblaBearing,
      qiblaCardinal,
      distanceToKaabaKm,
      arabicNames: ARABIC_NAMES,
    };
  }, [coords, method, tick]);

  const labels = useMemo(() => formatLocationLabels(location), [location]);
  const cityLabel = labels.shortLabel || (coords ? 'Current Location' : '');
  const localityLabel = labels.localityLine || cityLabel;
  const locationSubtitle = labels.regionLine;
  const coordsLabel = labels.coordsLabel;
  const hasLocation = !!coords;

  return useMemo(
    () => ({
      prayerData,
      coords,
      location,
      cityLabel,
      localityLabel,
      locationSubtitle,
      coordsLabel,
      locationError,
      locationLoading,
      localityResolving,
      requestLocation,
      selectCity,
      method,
      setMethod,
      refresh,
      hasLocation,
    }),
    [
      prayerData,
      coords,
      location,
      cityLabel,
      localityLabel,
      locationSubtitle,
      coordsLabel,
      locationError,
      locationLoading,
      localityResolving,
      requestLocation,
      selectCity,
      method,
      setMethod,
      refresh,
      hasLocation,
    ]
  );
}
