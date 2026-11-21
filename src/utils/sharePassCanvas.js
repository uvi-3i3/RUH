/**
 * High-resolution HTML5 Canvas renderer for exporting the Ruh Sanctuary Pass
 * as a slim, gallery-grade mobile portrait poster floating over Ruh's painted cloud sky.
 */

import { getShareFormat } from './sharePassLogic';
import { generateCleanStarfield } from './devotionLogic';
import ghibliDayClouds from '../assets/images/ghibli_day_clouds_1794550142648.jpg';
import ghibliNightClouds from '../assets/images/ghibli_night_clouds_1794550143549.jpg';

const IMAGE_CACHE = new Map();

function loadCloudImage(src) {
  if (typeof Image === 'undefined') return Promise.resolve(null);
  const existing = IMAGE_CACHE.get(src);
  if (existing) {
    if (existing.loaded) return Promise.resolve(existing.img);
    return existing.promise;
  }
  const img = new Image();
  img.decoding = 'async';
  const entry = { img, loaded: false, promise: null };
  entry.promise = new Promise((resolve) => {
    img.onload = () => {
      entry.loaded = true;
      resolve(img);
    };
    img.onerror = () => resolve(null);
  });
  IMAGE_CACHE.set(src, entry);
  img.src = src;
  return entry.promise;
}

const FINISH_PALETTES = {
  obsidian: {
    isLightCard: false,
    cardTop: 'rgba(20, 27, 45, 0.94)',
    cardMid: 'rgba(11, 16, 28, 0.96)',
    cardBottom: 'rgba(18, 16, 24, 0.95)',
    outerStroke: 'rgba(217, 174, 88, 0.5)',
    innerStroke: 'rgba(217, 174, 88, 0.24)',
    topHighlight: 'rgba(255, 244, 214, 0.2)',
    hairline: 'rgba(255, 255, 255, 0.11)',
    lattice: 'rgba(228, 192, 120, 0.055)',
    textMain: '#f6f0e4',
    textSub: 'rgba(226, 216, 198, 0.72)',
    textGold: '#e4c078',
    goldHex: '#dfba70',
    pauseHex: '#5eead4',
    archTop: '#131c31',
    archMid: '#0b101d',
    archBottom: '#18151d',
    archStroke: 'rgba(228, 192, 120, 0.44)',
    mrzBg: 'rgba(0, 0, 0, 0.28)',
    trackBg: 'rgba(255, 255, 255, 0.11)',
    nodeIdleFill: 'rgba(0, 0, 0, 0.24)',
    nodeIdleStroke: 'rgba(255, 255, 255, 0.18)',
    nodeActiveFill: 'rgba(224, 188, 114, 0.18)',
    nodePauseFill: 'rgba(94, 234, 212, 0.14)',
    checkInk: '#0b0f19',
    sheenTop: 'rgba(244, 218, 152, 0.12)',
  },
  emerald: {
    isLightCard: false,
    cardTop: 'rgba(16, 44, 37, 0.94)',
    cardMid: 'rgba(9, 27, 22, 0.96)',
    cardBottom: 'rgba(14, 33, 27, 0.95)',
    outerStroke: 'rgba(223, 184, 108, 0.5)',
    innerStroke: 'rgba(223, 184, 108, 0.24)',
    topHighlight: 'rgba(242, 232, 198, 0.18)',
    hairline: 'rgba(232, 245, 238, 0.12)',
    lattice: 'rgba(229, 195, 125, 0.06)',
    textMain: '#f7f2e7',
    textSub: 'rgba(214, 228, 219, 0.75)',
    textGold: '#e5c37d',
    goldHex: '#e0bc72',
    pauseHex: '#5eead4',
    archTop: '#0d2922',
    archMid: '#081a15',
    archBottom: '#112e25',
    archStroke: 'rgba(229, 195, 125, 0.44)',
    mrzBg: 'rgba(0, 0, 0, 0.26)',
    trackBg: 'rgba(255, 255, 255, 0.11)',
    nodeIdleFill: 'rgba(0, 0, 0, 0.22)',
    nodeIdleStroke: 'rgba(232, 245, 238, 0.19)',
    nodeActiveFill: 'rgba(224, 188, 114, 0.18)',
    nodePauseFill: 'rgba(94, 234, 212, 0.15)',
    checkInk: '#071713',
    sheenTop: 'rgba(242, 216, 154, 0.12)',
  },
  ivory: {
    isLightCard: true,
    cardTop: 'rgba(254, 249, 238, 0.93)',
    cardMid: 'rgba(247, 239, 223, 0.94)',
    cardBottom: 'rgba(238, 226, 203, 0.93)',
    outerStroke: 'rgba(164, 124, 56, 0.44)',
    innerStroke: 'rgba(156, 117, 51, 0.25)',
    topHighlight: 'rgba(255, 255, 255, 0.85)',
    hairline: 'rgba(66, 48, 22, 0.11)',
    lattice: 'rgba(146, 108, 42, 0.065)',
    textMain: '#231d15',
    textSub: 'rgba(84, 68, 48, 0.76)',
    textGold: '#8c6422',
    goldHex: '#9c7129',
    pauseHex: '#0d9488',
    archTop: '#f4ead6',
    archMid: '#fbf5e9',
    archBottom: '#ede1c9',
    archStroke: 'rgba(156, 117, 51, 0.42)',
    mrzBg: 'rgba(156, 117, 51, 0.07)',
    trackBg: 'rgba(40, 30, 16, 0.11)',
    nodeIdleFill: 'rgba(255, 252, 246, 0.88)',
    nodeIdleStroke: 'rgba(156, 117, 51, 0.28)',
    nodeActiveFill: 'rgba(156, 117, 51, 0.14)',
    nodePauseFill: 'rgba(13, 148, 136, 0.12)',
    checkInk: '#fdfaf3',
    sheenTop: 'rgba(255, 255, 255, 0.58)',
  },
};

function drawRoundedRectPath(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawMihrabPath(ctx, x, y, w, h, topRadius, bottomRadius) {
  const tr = Math.min(topRadius, w / 2);
  const br = Math.min(bottomRadius, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + tr, y);
  ctx.arcTo(x + w, y, x + w, y + tr, tr);
  ctx.lineTo(x + w, y + h - br);
  ctx.arcTo(x + w, y + h, x + w - br, y + h, br);
  ctx.lineTo(x + br, y + h);
  ctx.arcTo(x, y + h, x, y + h - br, br);
  ctx.lineTo(x, y + tr);
  ctx.arcTo(x, y, x + tr, y, tr);
  ctx.closePath();
}

function drawImageCover(ctx, img, x, y, w, h, scale = 1.05) {
  if (!img || !img.naturalWidth || !img.naturalHeight) return;
  const imgRatio = img.naturalWidth / img.naturalHeight;
  const boxRatio = w / h;
  let drawW;
  let drawH;
  if (imgRatio > boxRatio) {
    drawH = h * scale;
    drawW = drawH * imgRatio;
  } else {
    drawW = w * scale;
    drawH = drawW / imgRatio;
  }
  const dx = x + (w - drawW) / 2;
  const dy = y + (h - drawH) / 2;
  ctx.drawImage(img, dx, dy, drawW, drawH);
}

/**
 * Draws finely letter-spaced text reliably across all browsers (Chromium, Safari, iOS/Android WebViews).
 */
function drawTrackedText(ctx, text, x, y, tracking = 0, align = 'left') {
  const str = String(text || '');
  if (!str) return;
  if (!tracking) {
    ctx.textAlign = align;
    ctx.fillText(str, x, y);
    return;
  }
  const chars = Array.from(str);
  const widths = chars.map((ch) => ctx.measureText(ch).width);
  const totalW = widths.reduce((sum, w) => sum + w, 0) + tracking * Math.max(0, chars.length - 1);

  let curX = x;
  if (align === 'center') curX = x - totalW / 2;
  else if (align === 'right') curX = x - totalW;

  ctx.save();
  ctx.textAlign = 'left';
  chars.forEach((ch, idx) => {
    ctx.fillText(ch, curX, y);
    curX += widths[idx] + tracking;
  });
  ctx.restore();
}

function drawRubElHizb(ctx, cx, cy, radius, strokeColor) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = Math.max(1.3, radius * 0.09);
  const side = radius * 1.38;
  ctx.strokeRect(-side / 2, -side / 2, side, side);
  ctx.rotate(Math.PI / 4);
  ctx.strokeRect(-side / 2, -side / 2, side, side);
  ctx.restore();

  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.24, 0, Math.PI * 2);
  ctx.fillStyle = strokeColor;
  ctx.fill();
}

function drawFlameDroplet(ctx, cx, cy, size, fillColor) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.62);
  ctx.bezierCurveTo(size * 0.44, -size * 0.08, size * 0.48, size * 0.48, 0, size * 0.62);
  ctx.bezierCurveTo(-size * 0.48, size * 0.48, -size * 0.44, -size * 0.08, 0, -size * 0.62);
  ctx.closePath();
  ctx.fillStyle = fillColor;
  ctx.fill();
  ctx.restore();
}

function drawCheckmark(ctx, cx, cy, radius, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(2.4, radius * 0.17);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - radius * 0.36, cy + radius * 0.04);
  ctx.lineTo(cx - radius * 0.08, cy + radius * 0.32);
  ctx.lineTo(cx + radius * 0.4, cy - radius * 0.28);
  ctx.stroke();
  ctx.restore();
}

function drawGuillocheLattice(ctx, x, y, w, h, strokeColor) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 1;
  const step = 68;
  for (let gx = x - step; gx < x + w + step; gx += step) {
    for (let gy = y - step; gy < y + h + step; gy += step) {
      const cx = gx + step / 2;
      const cy = gy + step / 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 27);
      ctx.lineTo(cx + 8, cy - 8);
      ctx.lineTo(cx + 27, cy);
      ctx.lineTo(cx + 8, cy + 8);
      ctx.lineTo(cx, cy + 27);
      ctx.lineTo(cx - 8, cy + 8);
      ctx.lineTo(cx - 27, cy);
      ctx.lineTo(cx - 8, cy - 8);
      ctx.closePath();
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawCornerBrackets(ctx, x, y, w, h, len, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y + len);
  ctx.lineTo(x, y);
  ctx.lineTo(x + len, y);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x + w - len, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w, y + len);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x, y + h - len);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x + len, y + h);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x + w - len, y + h);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x + w, y + h - len);
  ctx.stroke();
  ctx.restore();
}

function drawTruncatedText(ctx, text, x, y, maxWidth) {
  const str = String(text || '');
  if (ctx.measureText(str).width <= maxWidth) {
    ctx.fillText(str, x, y);
    return;
  }
  let clipped = str;
  while (clipped.length > 1 && ctx.measureText(`${clipped}…`).width > maxWidth) {
    clipped = clipped.slice(0, -1);
  }
  ctx.fillText(`${clipped}…`, x, y);
}

function drawSkyBackdrop(ctx, W, H, skyMode, cloudImg) {
  if (skyMode === 'daylight') {
    const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
    skyGrad.addColorStop(0, '#adc9e3');
    skyGrad.addColorStop(0.45, '#d5e4f0');
    skyGrad.addColorStop(1, '#ede4d5');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, H);

    if (cloudImg) {
      drawImageCover(ctx, cloudImg, 0, 0, W, H, 1.06);
    }

    // Gentle sunlit atmospheric breath at top for crisp sky calligraphy
    const topMist = ctx.createLinearGradient(0, 0, 0, H * 0.22);
    topMist.addColorStop(0, 'rgba(176, 202, 226, 0.48)');
    topMist.addColorStop(1, 'rgba(176, 202, 226, 0)');
    ctx.fillStyle = topMist;
    ctx.fillRect(0, 0, W, H * 0.22);
  } else {
    const nightGrad = ctx.createLinearGradient(0, 0, 0, H);
    nightGrad.addColorStop(0, '#070d19');
    nightGrad.addColorStop(0.42, '#0a1425');
    nightGrad.addColorStop(0.78, '#101f36');
    nightGrad.addColorStop(1, '#13253e');
    ctx.fillStyle = nightGrad;
    ctx.fillRect(0, 0, W, H);

    const stars = generateCleanStarfield({ count: 38, minDistance: 8, seed: 1448 });
    stars.forEach((star) => {
      const sx = (star.x / 100) * W;
      const sy = (star.y / 100) * (H * 0.62);
      const r = Math.max(1.2, star.size * 1.45);
      ctx.save();
      ctx.globalAlpha = star.opacity;
      if (star.tier === 'bright') {
        const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * 4.5);
        glow.addColorStop(0, star.color);
        glow.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(sx, sy, r * 4.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = star.color;
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    if (cloudImg && typeof document !== 'undefined') {
      const off = document.createElement('canvas');
      off.width = W;
      off.height = H;
      const octx = off.getContext('2d');
      if (octx) {
        drawImageCover(octx, cloudImg, 0, 0, W, H, 1.06);
        octx.globalCompositeOperation = 'destination-in';
        const mask = octx.createLinearGradient(0, H, 0, H * 0.42);
        mask.addColorStop(0, 'rgba(0,0,0,0.96)');
        mask.addColorStop(0.48, 'rgba(0,0,0,0.82)');
        mask.addColorStop(0.78, 'rgba(0,0,0,0.34)');
        mask.addColorStop(1, 'rgba(0,0,0,0)');
        octx.fillStyle = mask;
        octx.fillRect(0, 0, W, H);
        ctx.drawImage(off, 0, 0);
      }
    }

    const aura = ctx.createRadialGradient(W * 0.5, H * 0.48, 50, W * 0.5, H * 0.48, W * 0.62);
    aura.addColorStop(0, 'rgba(217, 174, 88, 0.13)');
    aura.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = aura;
    ctx.fillRect(0, 0, W, H);
  }
}

function buildFallbackWeekDays() {
  const labels = ['SAT', 'SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI'];
  const now = new Date();
  return labels.map((dayShort, idx) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (6 - idx));
    return {
      dayShort,
      dayNum: d.getDate(),
      active: false,
      paused: false,
      tier: 0,
      isToday: idx === 6,
    };
  });
}

function paintSanctuaryPoster(canvas, options, cloudImg) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const {
    formatId = 'story',
    finish = 'ivory',
    skyMode = 'daylight',
    holderName = 'Seeker',
    initials = 'SK',
    showName = true,
    passId = 'RUH-1448-2600',
    joinedYear = '2026',
    hijriFormatted = '1448 AH',
    hijriDayMonth = '',
    stationNumeral = 'I',
    stationName = 'Patience',
    stationSubtitle = 'The First Station',
    stationArabic = 'صبر',
    yaqeenPct = 0,
    currentStreak = 0,
    longestStreak = 0,
    totalPrayers = 0,
    totalVerses = 0,
    unlockedBadges = 0,
    totalBadges = 9,
    todayActive = false,
    todayPaused = false,
    weekDays = [],
    mrzLine = 'RUH‹‹SEEKER‹‹1448AH‹‹STN·I‹‹EST·2026',
  } = options;

  const format = getShareFormat(formatId);
  const W = format.width;
  const H = format.height;
  canvas.width = W;
  canvas.height = H;

  const isStory = format.id === 'story';
  const p = FINISH_PALETTES[finish] || FINISH_PALETTES.obsidian;
  const isDaySky = skyMode === 'daylight';

  const displayName = showName && String(holderName || '').trim() ? holderName.trim() : 'A Seeker';
  const displayInitials = showName ? String(initials || 'SK').slice(0, 2).toUpperCase() : 'SK';
  const cadenceDays = Array.isArray(weekDays) && weekDays.length === 7 ? weekDays : buildFallbackWeekDays();

  // 1. Real Painted Cloud Sky Backdrop
  drawSkyBackdrop(ctx, W, H, skyMode, cloudImg);

  // 2. Floating Sky Header (serene calligraphy mark + Hijri date)
  const skyInkMain = isDaySky ? '#231d15' : '#f6f0e4';
  const skyInkSub = isDaySky ? 'rgba(42, 34, 24, 0.7)' : 'rgba(226, 218, 202, 0.72)';
  const skyInkGold = isDaySky ? '#845d1e' : '#e4c078';

  const headerY = isStory ? 184 : 84;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = skyInkMain;
  ctx.font = `400 ${isStory ? 84 : 64}px "Aref Ruqaa", "Amiri", Georgia, serif`;
  ctx.fillText('رُوح', W / 2, headerY);

  const hijriLine = hijriDayMonth
    ? `${String(hijriDayMonth).toUpperCase()}  ·  ${String(hijriFormatted || '1448 AH').toUpperCase()}`
    : String(hijriFormatted || '1448 AH').toUpperCase();
  ctx.fillStyle = skyInkSub;
  ctx.font = `600 ${isStory ? 19 : 16}px "Cormorant Garamond", Georgia, serif`;
  drawTrackedText(ctx, hijriLine, W / 2, headerY + (isStory ? 76 : 56), 2.4, 'center');
  ctx.restore();

  // 3. Slim, Stately Vertical Portrait Sanctuary Pass Card (authentic ~1:1.54 passport proportion)
  const cardW = isStory ? 748 : 684;
  const cardH = isStory ? 1152 : 1018;
  const cardX = (W - cardW) / 2;
  const cardY = isStory ? 332 : 188;
  const cardR = 46;

  // Dual-layer atmospheric shadow for crisp physical depth over the clouds
  ctx.save();
  ctx.shadowColor = isDaySky ? 'rgba(54, 62, 74, 0.24)' : 'rgba(0, 0, 0, 0.74)';
  ctx.shadowBlur = isDaySky ? 78 : 92;
  ctx.shadowOffsetY = 34;
  drawRoundedRectPath(ctx, cardX, cardY, cardW, cardH, cardR);
  const cardGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
  cardGrad.addColorStop(0, p.cardTop);
  cardGrad.addColorStop(0.5, p.cardMid);
  cardGrad.addColorStop(1, p.cardBottom);
  ctx.fillStyle = cardGrad;
  ctx.fill();
  ctx.restore();

  // Tight secondary contact shadow
  ctx.save();
  ctx.shadowColor = isDaySky ? 'rgba(64, 52, 34, 0.12)' : 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 8;
  drawRoundedRectPath(ctx, cardX, cardY, cardW, cardH, cardR);
  ctx.fillStyle = cardGrad;
  ctx.fill();
  ctx.restore();

  // Clip interior details to card
  ctx.save();
  drawRoundedRectPath(ctx, cardX, cardY, cardW, cardH, cardR);
  ctx.clip();

  drawGuillocheLattice(ctx, cardX, cardY, cardW, cardH, p.lattice);

  // Subtle sunlit / foil diagonal sheen
  const sheen = ctx.createLinearGradient(cardX, cardY, cardX + cardW * 0.8, cardY + cardH * 0.6);
  sheen.addColorStop(0, p.sheenTop);
  sheen.addColorStop(0.42, 'rgba(255,255,255,0)');
  sheen.addColorStop(1, p.isLightCard ? 'rgba(156,117,51,0.045)' : 'rgba(217,174,88,0.055)');
  ctx.fillStyle = sheen;
  ctx.fillRect(cardX, cardY, cardW, cardH);

  // Razor-crisp top bevel highlight catchlight
  const topCatch = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY);
  topCatch.addColorStop(0, 'rgba(255,255,255,0)');
  topCatch.addColorStop(0.5, p.topHighlight);
  topCatch.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = topCatch;
  ctx.fillRect(cardX + cardR, cardY + 1, cardW - cardR * 2, 2);

  // Engraved inner frame + 4 gold corner brackets
  const frameInset = 22;
  ctx.strokeStyle = p.innerStroke;
  ctx.lineWidth = 1.6;
  drawRoundedRectPath(
    ctx,
    cardX + frameInset,
    cardY + frameInset,
    cardW - frameInset * 2,
    cardH - frameInset * 2,
    cardR - 16
  );
  ctx.stroke();
  drawCornerBrackets(
    ctx,
    cardX + frameInset + 2,
    cardY + frameInset + 2,
    cardW - (frameInset + 2) * 2,
    cardH - (frameInset + 2) * 2,
    22,
    p.outerStroke
  );

  // --- Card Section 1: Header Band ---
  const padX = isStory ? 50 : 44;
  const hdrY = cardY + (isStory ? 92 : 82);
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';

  ctx.fillStyle = p.textGold;
  ctx.font = `400 ${isStory ? 44 : 40}px "Aref Ruqaa", "Amiri", Georgia, serif`;
  ctx.fillText('رُوح', cardX + padX, hdrY - 2);

  ctx.fillStyle = p.outerStroke;
  ctx.fillRect(cardX + padX + (isStory ? 78 : 70), hdrY - 20, 1.6, 40);

  const titleX = cardX + padX + (isStory ? 96 : 86);
  ctx.fillStyle = p.textMain;
  ctx.font = `600 ${isStory ? 19 : 17}px "Cormorant Garamond", Georgia, serif`;
  drawTrackedText(ctx, 'SANCTUARY PASS', titleX, hdrY - 11, 2.2, 'left');

  ctx.fillStyle = p.textSub;
  ctx.font = `500 ${isStory ? 15 : 14}px ui-monospace, SFMono-Regular, Menlo, monospace`;
  ctx.fillText(`${passId} · EST. ${joinedYear}`, titleX, hdrY + 15);

  // Gold Rub el Hizb optical seal on right
  drawRubElHizb(ctx, cardX + cardW - padX - 22, hdrY, isStory ? 22 : 20, p.goldHex);

  const hdrRuleY = cardY + (isStory ? 148 : 132);
  ctx.strokeStyle = p.hairline;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(cardX + padX, hdrRuleY);
  ctx.lineTo(cardX + cardW - padX, hdrRuleY);
  ctx.stroke();

  // --- Card Section 2: Sculpted Mihrab Portrait + Holder Specs ---
  const idTop = hdrRuleY + (isStory ? 56 : 42);
  const archW = isStory ? 204 : 186;
  const archH = isStory ? 276 : 244;
  const archX = cardX + padX;
  const archY = idTop;

  ctx.save();
  ctx.shadowColor = p.isLightCard ? 'rgba(98, 72, 32, 0.16)' : 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = 22;
  ctx.shadowOffsetY = 9;
  const archGrad = ctx.createLinearGradient(archX, archY, archX, archY + archH);
  archGrad.addColorStop(0, p.archTop);
  archGrad.addColorStop(0.55, p.archMid);
  archGrad.addColorStop(1, p.archBottom);
  drawMihrabPath(ctx, archX, archY, archW, archH, archW * 0.5, 24);
  ctx.fillStyle = archGrad;
  ctx.fill();
  ctx.restore();

  drawMihrabPath(ctx, archX, archY, archW, archH, archW * 0.5, 24);
  ctx.strokeStyle = p.archStroke;
  ctx.lineWidth = 1.8;
  ctx.stroke();

  drawMihrabPath(ctx, archX + 9, archY + 9, archW - 18, archH - 18, (archW - 18) * 0.5, 17);
  ctx.strokeStyle = p.innerStroke;
  ctx.lineWidth = 1.1;
  ctx.stroke();

  // 30-day streak orbit ring inside Mihrab
  const ringCx = archX + archW / 2;
  const ringCy = archY + archH * 0.45;
  const ringR = archW * 0.31;
  ctx.save();
  ctx.beginPath();
  ctx.setLineDash([3.5, 7]);
  ctx.arc(ringCx, ringCy, ringR, 0, Math.PI * 2);
  ctx.strokeStyle = p.innerStroke;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  const ratio = Math.min(1, Math.max(0.06, (Number(currentStreak) || 0) / 30));
  ctx.save();
  ctx.beginPath();
  ctx.arc(ringCx, ringCy, ringR, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ratio);
  ctx.strokeStyle = p.goldHex;
  ctx.lineWidth = 3.8;
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.restore();

  ctx.beginPath();
  ctx.arc(ringCx, ringCy - ringR - 12, 2.8, 0, Math.PI * 2);
  ctx.fillStyle = p.goldHex;
  ctx.fill();

  // Monogram initials
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = p.textMain;
  ctx.font = `300 ${isStory ? 52 : 46}px "Cormorant Garamond", Georgia, serif`;
  ctx.fillText(displayInitials, ringCx, ringCy + 3);

  // Brass station nameplate at bottom of arch
  ctx.fillStyle = p.textGold;
  ctx.font = `600 ${isStory ? 17 : 15}px "Cormorant Garamond", Georgia, serif`;
  ctx.fillText(`STN ${stationNumeral}  ·  ${stationArabic}`, ringCx, archY + archH - 32);

  // Right Identity Details
  const infoX = archX + archW + (isStory ? 38 : 34);
  const infoW = cardX + cardW - padX - infoX;

  ctx.textAlign = 'left';
  ctx.fillStyle = p.textSub;
  ctx.font = `500 ${isStory ? 15 : 14}px "Cormorant Garamond", Georgia, serif`;
  drawTrackedText(ctx, 'HOLDER', infoX, idTop + (isStory ? 34 : 26), 2.2, 'left');

  ctx.fillStyle = p.textMain;
  ctx.font = `500 ${isStory ? 54 : 46}px "Cormorant Garamond", Georgia, serif`;
  drawTruncatedText(ctx, displayName, infoX, idTop + (isStory ? 88 : 74), infoW);

  ctx.fillStyle = p.textGold;
  ctx.font = `italic 400 ${isStory ? 26 : 23}px "Cormorant Garamond", Georgia, serif`;
  drawTruncatedText(
    ctx,
    stationSubtitle || `Station ${stationNumeral} · ${stationName}`,
    infoX,
    idTop + (isStory ? 136 : 116),
    infoW
  );

  // Yaqeen Progress Bar
  const barLabelY = idTop + (isStory ? 202 : 176);
  ctx.fillStyle = p.textSub;
  ctx.font = `500 ${isStory ? 15 : 13.5}px "Cormorant Garamond", Georgia, serif`;
  drawTrackedText(
    ctx,
    `${String(stationName || 'Patience').toUpperCase()} · YAQEEN`,
    infoX,
    barLabelY,
    1.4,
    'left'
  );

  const clampedYaqeen = Math.max(0, Math.min(100, Math.round(yaqeenPct || 0)));
  ctx.textAlign = 'right';
  ctx.fillStyle = p.textGold;
  ctx.font = `600 ${isStory ? 17 : 15}px ui-monospace, SFMono-Regular, Menlo, monospace`;
  ctx.fillText(`${clampedYaqeen}%`, infoX + infoW, barLabelY);

  const trackY = barLabelY + 20;
  drawRoundedRectPath(ctx, infoX, trackY, infoW, 7, 3.5);
  ctx.fillStyle = p.trackBg;
  ctx.fill();

  const fillW = Math.max(14, infoW * (clampedYaqeen / 100));
  drawRoundedRectPath(ctx, infoX, trackY, fillW, 7, 3.5);
  ctx.fillStyle = p.goldHex;
  ctx.fill();

  // --- Card Section 3: 4-Column Archival Ledger ---
  const ledgerTop = archY + archH + (isStory ? 66 : 50);
  ctx.strokeStyle = p.hairline;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(cardX + padX, ledgerTop);
  ctx.lineTo(cardX + cardW - padX, ledgerTop);
  ctx.stroke();

  const ledgerW = cardW - padX * 2;
  const colW = ledgerW / 4;
  const ledgerH = isStory ? 152 : 132;
  const metrics = [
    { value: `${Math.max(0, currentStreak)}d`, label: 'STREAK', flame: todayActive || currentStreak > 0 },
    { value: String(Math.max(0, totalPrayers)), label: 'PRAYERS', flame: false },
    { value: String(Math.max(0, totalVerses)), label: 'VERSES', flame: false },
    { value: `${Math.max(0, unlockedBadges)}/${Math.max(1, totalBadges)}`, label: 'BADGES', flame: false },
  ];

  metrics.forEach((m, idx) => {
    const colLeft = cardX + padX + idx * colW;
    const colCenter = colLeft + colW / 2;
    if (idx > 0) {
      ctx.strokeStyle = p.hairline;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(colLeft, ledgerTop + 26);
      ctx.lineTo(colLeft, ledgerTop + ledgerH - 26);
      ctx.stroke();
    }

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = p.textMain;
    ctx.font = `400 ${isStory ? 44 : 38}px "Cormorant Garamond", Georgia, serif`;
    if (m.flame) {
      const textW = ctx.measureText(m.value).width;
      const offsetX = -10;
      ctx.fillText(m.value, colCenter + offsetX, ledgerTop + ledgerH * 0.41);
      drawFlameDroplet(ctx, colCenter + offsetX + textW / 2 + 13, ledgerTop + ledgerH * 0.4, 19, p.goldHex);
    } else {
      ctx.fillText(m.value, colCenter, ledgerTop + ledgerH * 0.41);
    }

    ctx.fillStyle = p.textSub;
    ctx.font = `500 ${isStory ? 14 : 13}px "Cormorant Garamond", Georgia, serif`;
    drawTrackedText(ctx, m.label, colCenter, ledgerTop + ledgerH * 0.74, 2.0, 'center');
  });

  const ledgerBottom = ledgerTop + ledgerH;
  ctx.strokeStyle = p.hairline;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(cardX + padX, ledgerBottom);
  ctx.lineTo(cardX + cardW - padX, ledgerBottom);
  ctx.stroke();

  // --- Card Section 4: 7-Day Devotion Cadence Strip ---
  const cadenceTop = ledgerBottom + (isStory ? 68 : 50);
  ctx.textBaseline = 'middle';
  ctx.fillStyle = p.textSub;
  ctx.font = `600 ${isStory ? 16 : 14.5}px "Cormorant Garamond", Georgia, serif`;
  const cadenceTitle = todayActive
    ? `LIT TODAY · BEST ${Math.max(0, longestStreak)}D`
    : todayPaused
      ? `STREAK PROTECTED · BEST ${Math.max(0, longestStreak)}D`
      : `7-DAY CADENCE · BEST ${Math.max(0, longestStreak)}D`;
  drawTrackedText(ctx, cadenceTitle, cardX + padX, cadenceTop, 1.8, 'left');

  ctx.textAlign = 'right';
  ctx.fillStyle = p.textGold;
  ctx.font = `italic 400 ${isStory ? 18 : 16.5}px "Cormorant Garamond", Georgia, serif`;
  ctx.fillText(`Station ${stationNumeral} · ${stationName}`, cardX + cardW - padX, cadenceTop);

  // 7 Day Nodes Row
  const rowY = cadenceTop + (isStory ? 122 : 102);
  const nodeStep = ledgerW / 7;
  const nodeR = isStory ? 26 : 23;

  cadenceDays.forEach((day, idx) => {
    const cx = cardX + padX + idx * nodeStep + nodeStep / 2;
    const prev = idx > 0 ? cadenceDays[idx - 1] : null;
    const next = idx < cadenceDays.length - 1 ? cadenceDays[idx + 1] : null;
    const connectLeft = Boolean(prev && (prev.active || prev.paused) && (day.active || day.paused));
    const connectRight = Boolean(next && (next.active || next.paused) && (day.active || day.paused));

    if (connectLeft) {
      ctx.save();
      ctx.strokeStyle = day.paused || prev?.paused ? p.pauseHex : p.goldHex;
      ctx.globalAlpha = 0.55;
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(cx - nodeStep / 2, rowY);
      ctx.lineTo(cx - nodeR - 4, rowY);
      ctx.stroke();
      ctx.restore();
    }
    if (connectRight) {
      ctx.save();
      ctx.strokeStyle = day.paused || next?.paused ? p.pauseHex : p.goldHex;
      ctx.globalAlpha = 0.55;
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(cx + nodeR + 4, rowY);
      ctx.lineTo(cx + nodeStep / 2, rowY);
      ctx.stroke();
      ctx.restore();
    }

    ctx.textBaseline = 'middle';
    ctx.fillStyle = day.isToday ? p.textGold : p.textSub;
    ctx.font = `${day.isToday ? '700' : '500'} ${isStory ? 15.5 : 14}px "Cormorant Garamond", Georgia, serif`;
    drawTrackedText(ctx, String(day.dayShort || '').toUpperCase(), cx, rowY - nodeR - (isStory ? 24 : 20), 1.2, 'center');

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, rowY, nodeR, 0, Math.PI * 2);

    if (day.tier === 3) {
      ctx.fillStyle = p.goldHex;
      ctx.fill();
      drawCheckmark(ctx, cx, rowY, nodeR * 0.72, p.checkInk);
    } else if (day.paused) {
      ctx.fillStyle = p.nodePauseFill;
      ctx.fill();
      ctx.setLineDash([4.5, 4]);
      ctx.strokeStyle = p.pauseHex;
      ctx.lineWidth = 2.2;
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(cx, rowY, 5.2, 0, Math.PI * 2);
      ctx.fillStyle = p.pauseHex;
      ctx.fill();
    } else if (day.active) {
      ctx.fillStyle = p.nodeActiveFill;
      ctx.fill();
      ctx.strokeStyle = p.goldHex;
      ctx.lineWidth = 2.4;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, rowY, 6.5, 0, Math.PI * 2);
      ctx.fillStyle = p.goldHex;
      ctx.fill();
    } else if (day.isToday) {
      ctx.fillStyle = p.nodeIdleFill;
      ctx.fill();
      ctx.setLineDash([4.5, 4.5]);
      ctx.strokeStyle = p.goldHex;
      ctx.lineWidth = 2.4;
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(cx, rowY, 4.8, 0, Math.PI * 2);
      ctx.fillStyle = p.goldHex;
      ctx.fill();
    } else {
      ctx.fillStyle = p.nodeIdleFill;
      ctx.fill();
      ctx.strokeStyle = p.nodeIdleStroke;
      ctx.lineWidth = 1.8;
      ctx.stroke();
    }
    ctx.restore();

    ctx.textAlign = 'center';
    ctx.fillStyle = day.isToday ? p.textGold : p.textSub;
    ctx.font = `${day.isToday ? '700' : '400'} ${isStory ? 15.5 : 14}px "Cormorant Garamond", Georgia, serif`;
    ctx.fillText(String(day.dayNum ?? ''), cx, rowY + nodeR + (isStory ? 24 : 20));
  });

  // --- Card Section 5: Bottom Archival MRZ Band (cleanly clipped inside rounded inner border) ---
  const mrzH = isStory ? 68 : 60;
  const mrzY = cardY + cardH - frameInset - mrzH;
  ctx.save();
  drawRoundedRectPath(
    ctx,
    cardX + frameInset,
    cardY + frameInset,
    cardW - frameInset * 2,
    cardH - frameInset * 2,
    cardR - 16
  );
  ctx.clip();
  ctx.fillStyle = p.mrzBg;
  ctx.fillRect(cardX + frameInset, mrzY, cardW - frameInset * 2, mrzH);

  ctx.strokeStyle = p.hairline;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(cardX + frameInset, mrzY);
  ctx.lineTo(cardX + cardW - frameInset, mrzY);
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = p.textSub;
  ctx.font = `500 ${isStory ? 15.5 : 14}px ui-monospace, SFMono-Regular, Menlo, monospace`;
  const safeMrz = showName ? mrzLine : mrzLine.replace(/RUH‹‹[^‹]+‹‹/, 'RUH‹‹SEEKER‹‹');
  drawTruncatedText(ctx, safeMrz, cardX + cardW / 2, mrzY + mrzH / 2, cardW - padX * 2);
  ctx.restore();

  ctx.restore();

  // Crisp Outer Card Border Stroke
  drawRoundedRectPath(ctx, cardX, cardY, cardW, cardH, cardR);
  ctx.strokeStyle = p.outerStroke;
  ctx.lineWidth = 2.2;
  ctx.stroke();

  // 4. Clean Editorial Verse Whisper (Story 9:16 only — pure painted sky below, zero link clutter)
  if (isStory) {
    const quoteY = cardY + cardH + 178;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Quiet gold diamond ornament
    ctx.fillStyle = skyInkGold;
    ctx.fillRect(W / 2 - 54, quoteY - 46, 36, 1.6);
    ctx.fillRect(W / 2 + 18, quoteY - 46, 36, 1.6);
    ctx.save();
    ctx.translate(W / 2, quoteY - 45);
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-3.8, -3.8, 7.6, 7.6);
    ctx.restore();

    ctx.shadowColor = isDaySky ? 'rgba(255, 252, 246, 0.92)' : 'rgba(4, 8, 18, 0.88)';
    ctx.shadowBlur = 18;
    ctx.fillStyle = skyInkMain;
    ctx.font = 'italic 500 32px "Cormorant Garamond", Georgia, serif';
    ctx.fillText('“Verily, in the remembrance of Allah do hearts find rest.”', W / 2, quoteY + 6);

    ctx.fillStyle = skyInkGold;
    ctx.font = '600 17px "Cormorant Garamond", Georgia, serif';
    drawTrackedText(ctx, 'SURAH AR-RA‘D · 13:28', W / 2, quoteY + 52, 2.6, 'center');
    ctx.restore();
  }
}

/**
 * Renders the portrait cloud-sky Sanctuary Pass poster onto the provided canvas.
 * Immediately draws with cached cloud image if available, and re-renders cleanly
 * as soon as the bundled cloud artwork finishes decoding.
 */
export function renderSanctuaryShareCanvas(canvas, options = {}) {
  if (!canvas) return Promise.resolve();
  const skyMode = options.skyMode === 'daylight' ? 'daylight' : 'night';
  const cloudSrc = skyMode === 'daylight' ? ghibliDayClouds : ghibliNightClouds;
  const cached = IMAGE_CACHE.get(cloudSrc);

  if (cached?.loaded) {
    paintSanctuaryPoster(canvas, options, cached.img);
    return Promise.resolve();
  }

  paintSanctuaryPoster(canvas, options, null);
  return loadCloudImage(cloudSrc).then((img) => {
    if (img && canvas.isConnected) {
      paintSanctuaryPoster(canvas, options, img);
    }
  });
}
