import { useState, useEffect, useMemo, useCallback } from 'react';
import { Coordinates, CalculationMethod, PrayerTimes, Prayer } from 'adhan';

/**
 * FEAT-02: Auto Prayer Times Hook
 * 
 * Uses the adhan library for high-precision prayer time calculation
 * based on the user's geolocation. Falls back gracefully if
 * location is denied or unavailable.
 */

const PRAYER_MAP = {
  fajr: 'fajr',
  dhuhr: 'dhuhr',
  asr: 'asr',
  maghrib: 'maghrib',
  isha: 'isha',
};

const ARABIC_NAMES = {
  fajr: 'الفجر',
  dhuhr: 'الظهر',
  asr: 'العصر',
  maghrib: 'المغرب',
  isha: 'العشاء',
};

// Formatting helper: "5:23 AM"
function formatTime(date) {
  if (!date) return '';
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
}

// Calculate minutes until a future time
function minutesUntil(target) {
  if (!target) return Infinity;
  return Math.max(0, Math.round((target.getTime() - Date.now()) / 60000));
}

export function usePrayerTimes() {
  const [coords, setCoords] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [method, setMethod] = useState('MoonsightingCommittee'); // sensible default
  const [tick, setTick] = useState(0); // Forces recalc every minute

  // Request geolocation
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported');
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationError(null);
        setLocationLoading(false);
        // Persist coords
        try {
          localStorage.setItem('ruh_coords', JSON.stringify({ lat: pos.coords.latitude, lng: pos.coords.longitude }));
        } catch {}
      },
      (err) => {
        setLocationError(err.message);
        setLocationLoading(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 3600000 }
    );
  }, []);

  // Load persisted coords on mount, request fresh if none
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ruh_coords');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.lat && parsed.lng) {
          setCoords(parsed);
          return;
        }
      }
    } catch {}
    requestLocation();
  }, [requestLocation]);

  // Tick every 60s to update "next prayer" and countdown
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  // Compute prayer times
  const prayerData = useMemo(() => {
    if (!coords) return null;

    const coordinates = new Coordinates(coords.lat, coords.lng);
    const date = new Date();
    
    // Get calculation params from method name
    let params;
    switch (method) {
      case 'MuslimWorldLeague': params = CalculationMethod.MuslimWorldLeague(); break;
      case 'Egyptian': params = CalculationMethod.Egyptian(); break;
      case 'Karachi': params = CalculationMethod.Karachi(); break;
      case 'UmmAlQura': params = CalculationMethod.UmmAlQura(); break;
      case 'Dubai': params = CalculationMethod.Dubai(); break;
      case 'Qatar': params = CalculationMethod.Qatar(); break;
      case 'Kuwait': params = CalculationMethod.Kuwait(); break;
      case 'Singapore': params = CalculationMethod.Singapore(); break;
      case 'NorthAmerica': params = CalculationMethod.NorthAmerica(); break;
      default: params = CalculationMethod.MoonsightingCommittee(); break;
    }

    const pt = new PrayerTimes(coordinates, date, params);

    const times = {
      fajr: pt.fajr,
      dhuhr: pt.dhuhr,
      asr: pt.asr,
      maghrib: pt.maghrib,
      isha: pt.isha,
    };

    // Determine current and next prayer
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

    // If before Fajr, next prayer is Fajr
    if (!currentPrayer) {
      nextPrayer = 'fajr';
      nextPrayerTime = times.fajr;
    }

    // If after Isha, next is tomorrow's Fajr
    if (currentPrayer === 'isha' && !nextPrayer) {
      const tomorrow = new Date(date);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowPt = new PrayerTimes(coordinates, tomorrow, params);
      nextPrayer = 'fajr';
      nextPrayerTime = tomorrowPt.fajr;
    }

    const countdown = nextPrayerTime ? minutesUntil(nextPrayerTime) : null;

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
      arabicNames: ARABIC_NAMES,
    };
  }, [coords, method, tick]);

  return {
    prayerData,
    coords,
    locationError,
    locationLoading,
    requestLocation,
    method,
    setMethod,
    hasLocation: !!coords,
  };
}
