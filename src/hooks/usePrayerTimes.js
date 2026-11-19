import { useState, useEffect, useMemo, useCallback } from 'react';
import { Coordinates, PrayerTimes } from 'adhan';
import {
  calculateDistanceToKaabaKm,
  calculateQiblaBearing,
  formatCardinalDirection,
  formatCountdown,
} from '../utils/devotionLogic';
import { getAdhanCalculationParams } from '../utils/prayerMethod';
import { hydrateMissingFromPreferences, mirroredRemove, mirroredSet } from '../utils/nativeStorage';

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

export function usePrayerTimes() {
  const [location, setLocation] = useState(loadSavedLocation);
  const [locationError, setLocationError] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [method, setMethodState] = useState(loadSavedMethod);
  const [tick, setTick] = useState(0);

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
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLocationError('Geolocation unavailable — choose your city manually.');
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        persistLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          source: 'gps',
          cityName: 'GPS Location',
        });
        setLocationError(null);
        setLocationLoading(false);
      },
      (err) => {
        setLocationError(err.message || 'Location access declined');
        setLocationLoading(false);
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 3600000 }
    );
  }, [persistLocation]);

  const selectCity = useCallback(
    (city) => {
      if (!city || typeof city.lat !== 'number' || typeof city.lng !== 'number') return;
      persistLocation({
        lat: city.lat,
        lng: city.lng,
        source: 'city',
        cityId: city.id,
        cityName: city.name,
        country: city.country,
      });
      if (city.method) {
        setMethod(city.method);
      }
      setLocationError(null);
    },
    [persistLocation, setMethod]
  );

  // Hydrate location/method from native Preferences if WebView storage was purged;
  // only auto-probe GPS on mount if geolocation permission was already granted.
  useEffect(() => {
    let cancelled = false;
    hydrateMissingFromPreferences([LOCATION_STORAGE_KEY, METHOD_STORAGE_KEY]).then((recovered) => {
      if (cancelled) return;
      if (recovered[METHOD_STORAGE_KEY]) {
        setMethodState(recovered[METHOD_STORAGE_KEY]);
      }
      if (recovered[LOCATION_STORAGE_KEY]) {
        try {
          const parsed = JSON.parse(recovered[LOCATION_STORAGE_KEY]);
          if (typeof parsed?.lat === 'number' && typeof parsed?.lng === 'number') {
            setLocation(parsed);
            return;
          }
        } catch {}
      }
      if (!location && typeof navigator !== 'undefined' && navigator.permissions?.query) {
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

  const cityLabel = location?.cityName || (coords ? 'GPS Location' : '');
  const hasLocation = !!coords;

  return useMemo(
    () => ({
      prayerData,
      coords,
      location,
      cityLabel,
      locationError,
      locationLoading,
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
      locationError,
      locationLoading,
      requestLocation,
      selectCity,
      method,
      setMethod,
      refresh,
      hasLocation,
    ]
  );
}
