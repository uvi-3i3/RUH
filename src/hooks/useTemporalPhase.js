import { useState, useEffect, useMemo } from 'react';
import { resolveSolarAtmosphereState } from '../utils/atmosphereSyncLogic';

// Convert RGB object → hex string
export function rgbToHex(c) {
  return (
    '#' +
    [c.r, c.g, c.b]
      .map((x) => Math.max(0, Math.min(255, x)).toString(16).padStart(2, '0'))
      .join('')
  );
}

/**
 * Live prayer-time atmosphere hook.
 * Smoothly syncs palette & sky atmosphere visuals to the user's real calculated
 * solar prayer schedule (`prayerTimes.prayerData.times` + `sunrise`), falling back
 * to their configured prayer times or canonical solar anchors when no city is set.
 * Supports locking any specific phase (`devOverride` 0..4) for calm manual preview.
 */
export function useTemporalPhase(devOverride, options = {}) {
  const { solarTimes = null, sunrise = null, fallbackPrayers = null, nowDate = null } = options;

  const [internalTickMs, setInternalTickMs] = useState(() => Date.now());

  useEffect(() => {
    if (nowDate instanceof Date) return undefined;
    if (devOverride !== null && devOverride !== undefined) return undefined;
    const interval = setInterval(() => {
      setInternalTickMs(Date.now());
    }, 30000);
    return () => clearInterval(interval);
  }, [devOverride, nowDate]);

  const effectiveNow = nowDate instanceof Date ? nowDate : new Date(internalTickMs);

  const atmosphere = useMemo(() => {
    const state = resolveSolarAtmosphereState({
      now: effectiveNow,
      solarTimes,
      sunrise,
      fallbackPrayers,
      manualPhase: devOverride,
    });

    return {
      ...state.palette,
      phaseIndex: state.phaseIndex,
      phaseId: state.phaseId,
      meta: state.meta,
      source: state.source,
      isAutoSynced: state.isAutoSynced,
      blend: state.blend,
      skyVisuals: state.skyVisuals,
      nextPhaseId: state.nextPhaseId,
      anchors: state.anchors,
    };
  }, [effectiveNow, solarTimes, sunrise, fallbackPrayers, devOverride]);

  return atmosphere;
}
