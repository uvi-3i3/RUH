import { useState, useCallback, useRef } from 'react';

/**
 * PERF-01: Lazy-loaded AI hook.
 * The model is NOT downloaded on mount. Call `initialize()` to begin loading.
 * This saves ~23MB of bandwidth for users who never open Tafakkur.
 */
export function useLocalAI() {
  const [isReady, setIsReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Keep the pipeline instance in a ref to persist across re-renders
  const extractorRef = useRef(null);
  const initPromiseRef = useRef(null);

  /**
   * Begin downloading and initializing the AI model.
   * Safe to call multiple times — subsequent calls return the same promise.
   */
  const initialize = useCallback(async () => {
    // Already ready
    if (extractorRef.current) return;
    
    // Already loading — return existing promise
    if (initPromiseRef.current) return initPromiseRef.current;

    setIsLoading(true);

    initPromiseRef.current = (async () => {
      try {
        // Dynamic import so the module isn't bundled into the main chunk
        const { pipeline, env } = await import('@xenova/transformers');
        
        env.allowLocalModels = false;
        env.useBrowserCache = true;

        const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
          progress_callback: (p) => {
            if (p.status === 'downloading') {
              setProgress(Math.round((p.loaded / p.total) * 100));
            }
          }
        });
        
        extractorRef.current = extractor;
        setIsReady(true);
        setProgress(100);
      } catch (error) {
        console.error("Local AI Model failed to load:", error);
        initPromiseRef.current = null; // Allow retry
      } finally {
        setIsLoading(false);
      }
    })();

    return initPromiseRef.current;
  }, []);

  // Utility to determine cosine similarity between two vectors
  const cosineSimilarity = (vecA, vecB) => {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  };

  /**
   * Generates embeddings for a given text natively on device.
   */
  const getEmbeddings = useCallback(async (text) => {
    if (!extractorRef.current) return null;
    try {
      const output = await extractorRef.current(text, { pooling: 'mean', normalize: true });
      return Array.from(output.data);
    } catch (e) {
      console.error(e);
      return null;
    }
  }, []);

  /**
   * Maps a user's typed note to the most topically relevant verse organically.
   * This operates entirely offline via Euclidean/Cosine geometry.
   */
  const findCompanionVerse = useCallback(async (userReflection, potentialVerses) => {
    if (!extractorRef.current || !userReflection || !potentialVerses?.length) return null;
    
    setIsProcessing(true);
    let bestMatch = null;
    
    try {
      // 1. Vectorize the User's emotional reflection
      const userVector = await getEmbeddings(userReflection);
      if (!userVector) return null;

      let maxSimilarity = -1;

      // 2. Scan corpus iteratively. In a real gigantic app, we pre-bake these embeddings.
      // Since our dataset is curated per station, runtime inference is shockingly fast.
      for (const verse of potentialVerses) {
         // Create a composite string of the verse's meaning to map against
         const meaningText = `${verse.t} ${verse.c || ''}`;
         const verseVector = await getEmbeddings(meaningText);
         
         if (verseVector) {
           const similarity = cosineSimilarity(userVector, verseVector);
           if (similarity > maxSimilarity) {
             maxSimilarity = similarity;
             bestMatch = verse;
           }
         }
      }
    } catch(e) {
      console.error("Inference Error:", e);
    }

    setIsProcessing(false);
    return bestMatch;
    
  }, [getEmbeddings]);

  return {
    isReady,
    isLoading,
    progress,
    isProcessing,
    initialize,
    findCompanionVerse
  };
}
