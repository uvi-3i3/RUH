/**
 * Studio Ghibli Gouache Cloud Extraction & Multiplane Parallax Kinematics
 *
 * Extracts authentic hand-painted cloud clusters directly from the Day and Night
 * gouache paintings using luma/chroma sky-keying + smooth elliptical edge feathering
 * (zero geometric ellipses or airbrushed vector blobs), and animates them across
 * the open sky and lower horizon with seamless wrap-around drift.
 */

export function smoothstep(edge0, edge1, x) {
  if (edge0 === edge1) return x >= edge1 ? 1 : 0;
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/**
 * Computes per-pixel extraction alpha [0..1] for daytime or nocturnal gouache cloud
 * cutouts while feathering smoothly at patch edges so zero rectangular borders appear.
 */
export function computeCloudPixelAlpha(r, g, b, normX, normY, theme = 'day') {
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  const dist = Math.hypot((normX - 0.5) * 2, (normY - 0.5) * 2);
  const edgeFeather = 1 - smoothstep(0.42, 0.96, dist);
  if (edgeFeather <= 0) return 0;

  if (theme === 'day' || theme === 'light') {
    const blueExcess = b - r;
    const lumaTerm = smoothstep(166, 224, lum);
    const cloudHueTerm = smoothstep(64, 16, blueExcess);
    return lumaTerm * cloudHueTerm * edgeFeather;
  }

  // Night clouds: key out deep midnight sky while keeping velvet-indigo & moonlit cloud rims
  const nightLuma = smoothstep(34, 86, lum);
  return nightLuma * edgeFeather;
}

/**
 * Curated multi-depth drifting cloud patches sampled strictly inside the artwork bounds
 * (avoiding outer watercolor paper margins) and framed around the central sanctuary verse.
 */
export function createGouacheCloudLayerSpec() {
  return [
    // Far high-altitude painted cirrus wisps across upper cerulean sky
    {
      id: 'far-cirrus-east',
      themeSrc: 'both',
      cropDay: { sx: 0.44, sy: 0.06, sw: 0.44, sh: 0.26 },
      cropNight: { sx: 0.54, sy: 0.48, sw: 0.36, sh: 0.28 },
      depth: 0.35,
      yRatio: 0.17,
      initialXRatio: 0.52,
      widthRatio: 0.36,
      minWidth: 230,
      maxWidth: 480,
      aspect: 0.48,
      speed: 22,
      alphaDay: 0.85,
      alphaNight: 0.48,
      swayAmp: 3.5,
      swayFreq: 0.32,
      phase: 0.5,
    },
    {
      id: 'far-cirrus-west',
      themeSrc: 'both',
      cropDay: { sx: 0.48, sy: 0.12, sw: 0.4, sh: 0.24 },
      cropNight: { sx: 0.1, sy: 0.52, sw: 0.36, sh: 0.28 },
      depth: 0.42,
      yRatio: 0.23,
      initialXRatio: 0.08,
      widthRatio: 0.34,
      minWidth: 210,
      maxWidth: 440,
      aspect: 0.46,
      speed: 27,
      alphaDay: 0.78,
      alphaNight: 0.44,
      swayAmp: 4,
      swayFreq: 0.28,
      phase: 2.3,
    },
    // Mid-depth painted cumulus billows flanking lower horizon below center verse
    {
      id: 'mid-cumulus-left',
      themeSrc: 'both',
      cropDay: { sx: 0.08, sy: 0.14, sw: 0.32, sh: 0.42 },
      cropNight: { sx: 0.06, sy: 0.44, sw: 0.36, sh: 0.38 },
      depth: 0.65,
      yRatio: 0.78,
      initialXRatio: 0.06,
      widthRatio: 0.38,
      minWidth: 240,
      maxWidth: 480,
      aspect: 0.68,
      speed: 32,
      alphaDay: 0.82,
      alphaNight: 0.62,
      swayAmp: 5,
      swayFreq: 0.24,
      phase: 1.1,
    },
    {
      id: 'mid-cumulus-right',
      themeSrc: 'both',
      cropDay: { sx: 0.58, sy: 0.28, sw: 0.32, sh: 0.42 },
      cropNight: { sx: 0.58, sy: 0.48, sw: 0.34, sh: 0.38 },
      depth: 0.72,
      yRatio: 0.8,
      initialXRatio: 0.58,
      widthRatio: 0.38,
      minWidth: 240,
      maxWidth: 480,
      aspect: 0.68,
      speed: 36,
      alphaDay: 0.82,
      alphaNight: 0.64,
      swayAmp: 5.5,
      swayFreq: 0.22,
      phase: 3.7,
    },
    // Near sunlit foreground cloud crests along lower edge
    {
      id: 'near-crest-horizon',
      themeSrc: 'both',
      cropDay: { sx: 0.18, sy: 0.44, sw: 0.34, sh: 0.36 },
      cropNight: { sx: 0.3, sy: 0.56, sw: 0.38, sh: 0.34 },
      depth: 0.9,
      yRatio: 0.89,
      initialXRatio: 0.28,
      widthRatio: 0.44,
      minWidth: 270,
      maxWidth: 560,
      aspect: 0.54,
      speed: 44,
      alphaDay: 0.86,
      alphaNight: 0.7,
      swayAmp: 6,
      swayFreq: 0.2,
      phase: 4.9,
    },
  ];
}

/**
 * Advances a cloud sprite horizontally with seamless wrap-around outside viewport margins.
 */
export function advanceCloudPosition(x, speedPxPerSec, dtSec, viewportWidth, spriteWidth, margin = 48) {
  const safeDt = Math.max(0, dtSec);
  const nextX = x + speedPxPerSec * safeDt;
  const minX = -spriteWidth - margin;
  const maxX = viewportWidth + margin;
  const span = maxX - minX;

  if (span <= 0) return minX;
  if (speedPxPerSec >= 0 && nextX > maxX) {
    return minX + ((nextX - minX) % span);
  }
  if (speedPxPerSec < 0 && nextX < minX) {
    return maxX - ((minX - nextX) % span);
  }
  return nextX;
}

/**
 * Computes gentle vertical bobbing offset around anchor altitude.
 */
export function computeCloudY(baseY, swayAmp, swayFreq, elapsedSec, phase = 0) {
  return baseY + Math.sin(elapsedSec * swayFreq + phase) * swayAmp;
}

/**
 * Extracts and feathers an authentic painted cloud cluster from a source gouache painting
 * onto an offscreen canvas sprite.
 */
export function extractGouacheCloudPatch(targetCanvas, sourceImg, cropRect, outWidth, outHeight, theme = 'day') {
  if (!sourceImg || !sourceImg.naturalWidth || !sourceImg.naturalHeight) return targetCanvas;

  // Rasterize cropped patch at working resolution (capped smoothly for fast pixel processing)
  const procW = Math.min(280, Math.max(120, Math.round(outWidth)));
  const procH = Math.min(200, Math.max(80, Math.round(outHeight)));

  targetCanvas.width = procW;
  targetCanvas.height = procH;
  const ctx = targetCanvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return targetCanvas;

  const sx = Math.round(cropRect.sx * sourceImg.naturalWidth);
  const sy = Math.round(cropRect.sy * sourceImg.naturalHeight);
  const sw = Math.max(1, Math.round(cropRect.sw * sourceImg.naturalWidth));
  const sh = Math.max(1, Math.round(cropRect.sh * sourceImg.naturalHeight));

  ctx.clearRect(0, 0, procW, procH);
  ctx.drawImage(sourceImg, sx, sy, sw, sh, 0, 0, procW, procH);

  const imgData = ctx.getImageData(0, 0, procW, procH);
  const data = imgData.data;

  for (let py = 0; py < procH; py++) {
    const normY = py / (procH - 1);
    for (let px = 0; px < procW; px++) {
      const idx = (py * procW + px) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const alpha = computeCloudPixelAlpha(r, g, b, px / (procW - 1), normY, theme);
      data[idx + 3] = Math.round(data[idx + 3] * alpha);
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return targetCanvas;
}
