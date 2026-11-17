import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ESSENTIAL_DUAS } from '../data/duasData';
import {
  LOCAL_AI_MODEL_ID,
  LOCAL_AI_PREFS_STORAGE_KEY,
  buildDuaGuidanceMessages,
  buildTafakkurPromptMessages,
  cleanModelCommentary,
  composeGroundedDuaFallback,
  composeGroundedTafakkurFallback,
  parseDuaGuidanceOutput,
  parseLocalAIPrefs,
  parseTafakkurModelOutput,
  rankDuasByMoment,
  rankVersesByResonance,
  serializeLocalAIPrefs,
} from '../utils/localAiLogic';

function readStoredPrefs() {
  if (typeof window === 'undefined') return { userPaused: false, bannerDismissed: false };
  try {
    return parseLocalAIPrefs(localStorage.getItem(LOCAL_AI_PREFS_STORAGE_KEY));
  } catch {
    return { userPaused: false, bannerDismissed: false };
  }
}

function saveStoredPrefs(prefs) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_AI_PREFS_STORAGE_KEY, serializeLocalAIPrefs(prefs));
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * Local AI Companion controller hook.
 * Combines automatic first-launch Web Worker LLM caching (@huggingface/transformers)
 * with 0-ms deterministic grounded retrieval across Ruh's verses and Duas.
 */
export function useLocalAI() {
  const initialPrefs = useMemo(() => readStoredPrefs(), []);

  const [status, setStatus] = useState(
    initialPrefs.userPaused ? 'paused' : 'idle'
  ); // 'idle' | 'downloading' | 'warming' | 'ready' | 'paused' | 'offline-fallback' | 'error'
  const [progress, setProgress] = useState({
    percent: 0,
    loadedBytes: 0,
    totalBytes: 0,
    activeFile: '',
  });
  const [runtimeBackend, setRuntimeBackend] = useState('fallback'); // 'webgpu' | 'wasm' | 'fallback'
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [userPaused, setUserPaused] = useState(initialPrefs.userPaused);
  const [bannerDismissed, setBannerDismissed] = useState(initialPrefs.bannerDismissed);

  const workerRef = useRef(null);
  const pendingRequestsRef = useRef(new Map());
  const requestSeqRef = useRef(0);
  const statusRef = useRef(status);
  statusRef.current = status;

  const persistPrefs = useCallback((nextPrefs) => {
    saveStoredPrefs(nextPrefs);
  }, []);

  const teardownWorker = useCallback(() => {
    for (const [, pending] of pendingRequestsRef.current.entries()) {
      pending.resolveFallback?.();
    }
    pendingRequestsRef.current.clear();
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    setIsGenerating(false);
  }, []);

  const ensureWorker = useCallback(() => {
    if (typeof window === 'undefined' || typeof Worker === 'undefined') return null;
    if (workerRef.current) return workerRef.current;

    const worker = new Worker(new URL('../workers/localAi.worker.js', import.meta.url), {
      type: 'module',
    });

    worker.addEventListener('message', (event) => {
      const msg = event?.data;
      if (!msg || typeof msg !== 'object') return;

      if (msg.type === 'progress') {
        setStatus(msg.status === 'warming' ? 'warming' : 'downloading');
        setProgress({
          percent: Math.max(0, Math.min(100, Number(msg.percent) || 0)),
          loadedBytes: Number(msg.loadedBytes) || 0,
          totalBytes: Number(msg.totalBytes) || 0,
          activeFile: msg.activeFile || '',
        });
        return;
      }

      if (msg.type === 'ready') {
        setStatus('ready');
        setRuntimeBackend(msg.backend || 'wasm');
        setProgress((prev) => ({ ...prev, percent: 100 }));
        setErrorMessage('');
        return;
      }

      if (msg.type === 'init-error') {
        const isOffline = Boolean(msg.offline) || (typeof navigator !== 'undefined' && navigator.onLine === false);
        setStatus(isOffline ? 'offline-fallback' : 'error');
        setRuntimeBackend('fallback');
        setErrorMessage(
          isOffline
            ? 'Offline before model cache completed — grounded companion active.'
            : msg.error || 'Local model could not initialize; grounded mode active.'
        );
        return;
      }

      if (msg.type === 'cache-cleared') {
        setProgress({ percent: 0, loadedBytes: 0, totalBytes: 0, activeFile: '' });
        setRuntimeBackend('fallback');
        setStatus('paused');
        return;
      }

      const reqId = msg.requestId;
      const pending = reqId != null ? pendingRequestsRef.current.get(reqId) : null;
      if (!pending) return;

      if (msg.type === 'token') {
        pending.onStream?.(msg.fullText || '');
        return;
      }

      if (msg.type === 'complete') {
        pendingRequestsRef.current.delete(reqId);
        if (pendingRequestsRef.current.size === 0) setIsGenerating(false);
        pending.resolve?.({
          fullText: msg.fullText || '',
          backend: msg.backend || runtimeBackend,
        });
        return;
      }

      if (msg.type === 'aborted' || msg.type === 'generate-error') {
        pendingRequestsRef.current.delete(reqId);
        if (pendingRequestsRef.current.size === 0) setIsGenerating(false);
        pending.resolveFallback?.();
      }
    });

    worker.addEventListener('error', (err) => {
      setStatus('error');
      setRuntimeBackend('fallback');
      setErrorMessage(err?.message || 'Worker encountered an error; grounded mode active.');
      for (const [, pending] of pendingRequestsRef.current.entries()) {
        pending.resolveFallback?.();
      }
      pendingRequestsRef.current.clear();
      setIsGenerating(false);
    });

    workerRef.current = worker;
    return worker;
  }, [runtimeBackend]);

  const initialize = useCallback(async () => {
    if (typeof window === 'undefined' || typeof Worker === 'undefined') {
      setStatus('offline-fallback');
      setRuntimeBackend('fallback');
      return;
    }
    if (statusRef.current === 'ready' || statusRef.current === 'downloading' || statusRef.current === 'warming') {
      return;
    }

    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      // Still attempt worker init in case weights are already in Cache Storage!
      // If uncached, worker init-error handles transitioning cleanly to offline-fallback.
    }

    setErrorMessage('');
    setStatus('downloading');
    const worker = ensureWorker();
    worker?.postMessage({ type: 'init', modelId: LOCAL_AI_MODEL_ID });
  }, [ensureWorker]);

  // Automatic non-blocking background initialization ~1.5s after first launch
  useEffect(() => {
    if (userPaused) return undefined;
    const timer = setTimeout(() => {
      initialize();
    }, 1500);

    const handleOnline = () => {
      if (!userPaused && (statusRef.current === 'offline-fallback' || statusRef.current === 'error')) {
        initialize();
      }
    };
    window.addEventListener('online', handleOnline);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('online', handleOnline);
    };
  }, [userPaused, initialize]);

  useEffect(() => {
    return () => {
      teardownWorker();
    };
  }, [teardownWorker]);

  const pauseDownload = useCallback(() => {
    setUserPaused(true);
    persistPrefs({ userPaused: true, bannerDismissed });
    teardownWorker();
    setStatus('paused');
    setRuntimeBackend('fallback');
  }, [bannerDismissed, persistPrefs, teardownWorker]);

  const resumeDownload = useCallback(() => {
    setUserPaused(false);
    setBannerDismissed(false);
    persistPrefs({ userPaused: false, bannerDismissed: false });
    setStatus('idle');
    setTimeout(() => {
      initialize();
    }, 60);
  }, [persistPrefs, initialize]);

  const clearModelCache = useCallback(async () => {
    setUserPaused(true);
    persistPrefs({ userPaused: true, bannerDismissed: false });
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'clear-cache' });
      setTimeout(() => {
        teardownWorker();
        setStatus('paused');
        setProgress({ percent: 0, loadedBytes: 0, totalBytes: 0, activeFile: '' });
      }, 250);
    } else {
      if (typeof caches !== 'undefined') {
        try {
          const keys = await caches.keys();
          await Promise.all(keys.filter((k) => /transformers/i.test(k)).map((k) => caches.delete(k)));
        } catch {
          // Ignore cache clear failure
        }
      }
      setProgress({ percent: 0, loadedBytes: 0, totalBytes: 0, activeFile: '' });
      setRuntimeBackend('fallback');
      setStatus('paused');
    }
  }, [persistPrefs, teardownWorker]);

  const dismissBanner = useCallback(() => {
    setBannerDismissed(true);
    persistPrefs({ userPaused, bannerDismissed: true });
  }, [userPaused, persistPrefs]);

  const abortGeneration = useCallback(() => {
    for (const [reqId, pending] of pendingRequestsRef.current.entries()) {
      workerRef.current?.postMessage({ type: 'abort', requestId: reqId });
      pending.resolveFallback?.();
    }
    pendingRequestsRef.current.clear();
    setIsGenerating(false);
  }, []);

  const runWorkerInference = useCallback(
    ({ messages, maxNewTokens = 110, temperature = 0.35, onStream }) => {
      return new Promise((resolve) => {
        if (statusRef.current !== 'ready' || !workerRef.current) {
          resolve(null);
          return;
        }
        // Cancel any previous active request cleanly
        for (const [oldId, pending] of pendingRequestsRef.current.entries()) {
          workerRef.current.postMessage({ type: 'abort', requestId: oldId });
          pending.resolveFallback?.();
          pendingRequestsRef.current.delete(oldId);
        }

        const requestId = ++requestSeqRef.current;
        setIsGenerating(true);

        const timeout = setTimeout(() => {
          const current = pendingRequestsRef.current.get(requestId);
          if (current) {
            pendingRequestsRef.current.delete(requestId);
            workerRef.current?.postMessage({ type: 'abort', requestId });
            if (pendingRequestsRef.current.size === 0) setIsGenerating(false);
            resolve(null);
          }
        }, 28000);

        pendingRequestsRef.current.set(requestId, {
          onStream,
          resolve: (res) => {
            clearTimeout(timeout);
            resolve(res);
          },
          resolveFallback: () => {
            clearTimeout(timeout);
            resolve(null);
          },
        });

        workerRef.current.postMessage({
          type: 'generate',
          requestId,
          messages,
          maxNewTokens,
          temperature,
        });
      });
    },
    []
  );

  /**
   * Generate strictly grounded spiritual reflection feedback inside Tafakkur.
   */
  const reflectOnTafakkur = useCallback(
    async ({
      note,
      activeVerse,
      allVerses = [],
      isSimpleMode = false,
      onStream,
    }) => {
      const trimmed = String(note || '').trim();
      if (!trimmed || !activeVerse) return null;

      const rankedVerses = rankVersesByResonance(trimmed, allVerses, {
        excludeVerseId: activeVerse.id,
        limit: 2,
      });
      const candidateVerses = rankedVerses.map((r) => r.item).filter(Boolean);

      const rankedDuas = rankDuasByMoment(ESSENTIAL_DUAS, { query: trimmed });
      const candidateDua = rankedDuas[0]?.item || null;

      if (statusRef.current === 'ready') {
        const messages = buildTafakkurPromptMessages({
          note: trimmed,
          activeVerse,
          candidateVerses,
          candidateDua,
          isSimpleMode,
        });

        const llmRes = await runWorkerInference({
          messages,
          maxNewTokens: 115,
          temperature: 0.35,
          onStream: (partialRaw) => {
            const cleanPartial = cleanModelCommentary(partialRaw);
            if (cleanPartial) onStream?.(cleanPartial);
          },
        });

        if (llmRes?.fullText) {
          return parseTafakkurModelOutput(llmRes.fullText, {
            note: trimmed,
            activeVerse,
            candidateVerses,
            candidateDua,
            allVerses,
            allDuas: ESSENTIAL_DUAS,
            isSimpleMode,
          });
        }
      }

      return composeGroundedTafakkurFallback({
        note: trimmed,
        activeVerse,
        candidateVerses,
        candidateDua,
        isSimpleMode,
      });
    },
    [runWorkerInference]
  );

  /**
   * Provide brief moment-aware Dua guidance when local LLM is ready, or grounded guidance instantly.
   */
  const guideForDuas = useCallback(
    async ({ query, topDua }) => {
      const q = String(query || '').trim();
      if (!q || !topDua) return null;

      if (statusRef.current === 'ready') {
        const messages = buildDuaGuidanceMessages({ query: q, topDua });
        const llmRes = await runWorkerInference({
          messages,
          maxNewTokens: 70,
          temperature: 0.3,
        });
        if (llmRes?.fullText) {
          return {
            guidance: parseDuaGuidanceOutput(llmRes.fullText, topDua, q),
            sourceMode: 'llm',
          };
        }
      }

      return {
        guidance: composeGroundedDuaFallback(q, topDua),
        sourceMode: 'fallback',
      };
    },
    [runWorkerInference]
  );

  /** Backward-compatible companion verse helper */
  const findCompanionVerse = useCallback(async (userReflection, potentialVerses, excludeVerseId = null) => {
    const ranked = rankVersesByResonance(userReflection, potentialVerses, {
      excludeVerseId,
      limit: 1,
    });
    return ranked[0]?.item || null;
  }, []);

  const isReady = status === 'ready';
  const isDownloading = status === 'downloading' || status === 'warming';

  return useMemo(
    () => ({
      status,
      isReady,
      isLoading: isDownloading,
      isDownloading,
      isProcessing: isGenerating,
      isGenerating,
      progress: progress.percent,
      progressDetails: progress,
      runtimeBackend,
      errorMessage,
      userPaused,
      bannerDismissed,
      initialize,
      pauseDownload,
      resumeDownload,
      clearModelCache,
      dismissBanner,
      abortGeneration,
      reflectOnTafakkur,
      guideForDuas,
      findCompanionVerse,
    }),
    [
      status,
      isReady,
      isDownloading,
      isGenerating,
      progress,
      runtimeBackend,
      errorMessage,
      userPaused,
      bannerDismissed,
      initialize,
      pauseDownload,
      resumeDownload,
      clearModelCache,
      dismissBanner,
      abortGeneration,
      reflectOnTafakkur,
      guideForDuas,
      findCompanionVerse,
    ]
  );
}
