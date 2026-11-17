import {
  pipeline,
  env,
  TextStreamer,
  InterruptableStoppingCriteria,
  StoppingCriteriaList,
} from '@huggingface/transformers';
import {
  LOCAL_AI_MODEL_ID,
  aggregateDownloadProgress,
} from '../utils/localAiLogic.js';

env.allowLocalModels = false;
env.allowRemoteModels = true;
env.useBrowserCache = typeof caches !== 'undefined';

let generatorPromise = null;
let generatorInstance = null;
let activeBackend = 'fallback';
let activeModelId = LOCAL_AI_MODEL_ID;
let fileProgressMap = {};
let activeStoppingCriteria = null;
let activeRequestId = null;

async function detectPreferredBackend() {
  try {
    if (typeof navigator !== 'undefined' && navigator.gpu?.requestAdapter) {
      const adapter = await navigator.gpu.requestAdapter();
      if (adapter) return 'webgpu';
    }
  } catch {
    // WebGPU unavailable or blocked
  }
  return 'wasm';
}

function handleProgressEvent(info) {
  if (!info || typeof info !== 'object') return;
  const file = info.file || 'model';

  if (info.status === 'initiate' || info.status === 'download') {
    fileProgressMap[file] = {
      loaded: info.loaded || 0,
      total: info.total || 0,
      progress: info.progress || 0,
    };
  } else if (info.status === 'progress') {
    fileProgressMap[file] = {
      loaded: info.loaded || 0,
      total: info.total || 0,
      progress: info.progress || 0,
    };
  } else if (info.status === 'done') {
    const prev = fileProgressMap[file] || {};
    const total = prev.total || info.total || prev.loaded || 1;
    fileProgressMap[file] = { loaded: total, total, progress: 100 };
  }

  const agg = aggregateDownloadProgress(fileProgressMap);
  self.postMessage({
    type: 'progress',
    status: agg.percent >= 100 ? 'warming' : 'downloading',
    percent: agg.percent,
    loadedBytes: agg.loadedBytes,
    totalBytes: agg.totalBytes,
    activeFile: file,
  });
}

async function initModel(modelId = LOCAL_AI_MODEL_ID) {
  if (generatorInstance && activeModelId === modelId) {
    return generatorInstance;
  }
  if (generatorPromise && activeModelId === modelId) {
    return generatorPromise;
  }

  activeModelId = modelId;
  fileProgressMap = {};

  generatorPromise = (async () => {
    const preferred = await detectPreferredBackend();
    const candidates =
      preferred === 'webgpu'
        ? [
            { device: 'webgpu', dtype: 'q4f16' },
            { device: 'wasm', dtype: 'q4f16' },
            { device: 'wasm', dtype: 'q4' },
          ]
        : [
            { device: 'wasm', dtype: 'q4f16' },
            { device: 'wasm', dtype: 'q4' },
          ];

    let lastError = null;
    for (const cfg of candidates) {
      try {
        self.postMessage({
          type: 'progress',
          status: 'downloading',
          percent: 0,
          loadedBytes: 0,
          totalBytes: 0,
          activeFile: cfg.device,
        });

        const pipe = await pipeline('text-generation', modelId, {
          device: cfg.device,
          dtype: cfg.dtype,
          progress_callback: handleProgressEvent,
        });

        generatorInstance = pipe;
        activeBackend = cfg.device;
        self.postMessage({
          type: 'ready',
          backend: activeBackend,
          modelId,
        });
        return pipe;
      } catch (err) {
        lastError = err;
        // Clear partial progress before trying next backend
        fileProgressMap = {};
      }
    }

    generatorPromise = null;
    throw lastError || new Error('Unable to initialize local language model');
  })();

  return generatorPromise;
}

async function generateText({
  requestId,
  messages,
  maxNewTokens = 110,
  temperature = 0.35,
}) {
  if (activeStoppingCriteria) {
    activeStoppingCriteria.interrupt();
  }

  activeRequestId = requestId;
  const pipe = await initModel(activeModelId);
  if (activeRequestId !== requestId) return;

  const stoppingCriteria = new InterruptableStoppingCriteria();
  activeStoppingCriteria = stoppingCriteria;
  const criteriaList = new StoppingCriteriaList();
  criteriaList.push(stoppingCriteria);

  let streamedText = '';
  const streamer = new TextStreamer(pipe.tokenizer, {
    skip_prompt: true,
    skip_special_tokens: true,
    callback_function: (chunk) => {
      if (activeRequestId !== requestId || stoppingCriteria.interrupted) return;
      streamedText += chunk;
      self.postMessage({
        type: 'token',
        requestId,
        chunk,
        fullText: streamedText,
      });
    },
  });

  try {
    const result = await pipe(messages, {
      max_new_tokens: maxNewTokens,
      do_sample: temperature > 0,
      temperature,
      top_p: 0.9,
      repetition_penalty: 1.08,
      streamer,
      stopping_criteria: criteriaList,
    });

    if (activeRequestId !== requestId || stoppingCriteria.interrupted) {
      self.postMessage({ type: 'aborted', requestId });
      return;
    }

    const outputMsgs = result?.[0]?.generated_text;
    const finalText = Array.isArray(outputMsgs)
      ? outputMsgs[outputMsgs.length - 1]?.content || streamedText
      : streamedText;

    self.postMessage({
      type: 'complete',
      requestId,
      fullText: String(finalText || streamedText),
      backend: activeBackend,
    });
  } catch (err) {
    if (stoppingCriteria.interrupted || activeRequestId !== requestId) {
      self.postMessage({ type: 'aborted', requestId });
      return;
    }
    self.postMessage({
      type: 'generate-error',
      requestId,
      error: err?.message || 'Inference failed',
    });
  } finally {
    if (activeStoppingCriteria === stoppingCriteria) {
      activeStoppingCriteria = null;
    }
  }
}

async function clearModelCache() {
  if (activeStoppingCriteria) {
    activeStoppingCriteria.interrupt();
    activeStoppingCriteria = null;
  }
  activeRequestId = null;

  if (generatorInstance && typeof generatorInstance.dispose === 'function') {
    try {
      await generatorInstance.dispose();
    } catch {
      // Ignore disposal failure
    }
  }
  generatorInstance = null;
  generatorPromise = null;
  fileProgressMap = {};
  activeBackend = 'fallback';

  if (typeof caches !== 'undefined') {
    try {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((name) => /transformers/i.test(name))
          .map((name) => caches.delete(name))
      );
    } catch {
      // Ignore Cache Storage deletion error
    }
  }

  self.postMessage({ type: 'cache-cleared' });
}

self.addEventListener('message', async (event) => {
  const payload = event?.data;
  if (!payload || typeof payload !== 'object') return;

  if (payload.type === 'init') {
    try {
      await initModel(payload.modelId || LOCAL_AI_MODEL_ID);
    } catch (err) {
      self.postMessage({
        type: 'init-error',
        error: err?.message || 'Model initialization failed',
        offline: typeof navigator !== 'undefined' && navigator.onLine === false,
      });
    }
    return;
  }

  if (payload.type === 'generate') {
    await generateText(payload);
    return;
  }

  if (payload.type === 'abort') {
    if (!payload.requestId || payload.requestId === activeRequestId) {
      if (activeStoppingCriteria) {
        activeStoppingCriteria.interrupt();
      }
      activeRequestId = null;
    }
    return;
  }

  if (payload.type === 'clear-cache') {
    await clearModelCache();
  }
});
