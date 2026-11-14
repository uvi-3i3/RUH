import { useState, useCallback, useMemo } from 'react';
import { findResonantVerse } from '../utils/devotionLogic';

/**
 * Offline-first local reflection companion hook.
 * Uses deterministic semantic & thematic resonance matching on-device
 * with zero external model downloads or dynamic chunk failures.
 */
export function useLocalAI() {
  const [isProcessing, setIsProcessing] = useState(false);

  const initialize = useCallback(async () => {}, []);

  const findCompanionVerse = useCallback(
    async (userReflection, potentialVerses, excludeVerseId = null) => {
      if (!userReflection || !potentialVerses?.length) return null;
      setIsProcessing(true);
      try {
        return findResonantVerse(userReflection, potentialVerses, excludeVerseId);
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  return useMemo(
    () => ({
      isReady: true,
      isLoading: false,
      progress: 100,
      isProcessing,
      initialize,
      findCompanionVerse,
    }),
    [isProcessing, initialize, findCompanionVerse]
  );
}
