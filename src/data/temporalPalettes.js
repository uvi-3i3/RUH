// 5 Temporal Palettes mapped to Islamic prayer periods.
// Each palette defines both dark and light mode variants.
// All color values are RGB objects for smooth interpolation.

export const TEMPORAL_PALETTES = [
  // 0: FAJR — Ethereal dawn silvers and cool blues
  {
    name: 'Fajr',
    dark: {
      bg:        { r: 8,   g: 12,  b: 22  },
      clouds:    [
        { r: 90,  g: 120, b: 170 },
        { r: 130, g: 150, b: 195 },
        { r: 55,  g: 85,  b: 135 },
      ],
      orbCore:   { r: 215, g: 230, b: 255 },
      orbGlow:   { r: 100, g: 145, b: 200 },
      orbCorona: { r: 60,  g: 100, b: 160 },
      ember:     { r: 115, g: 155, b: 210 },
      accent:    { r: 125, g: 180, b: 215 },
    },
    light: {
      bg:        { r: 230, g: 236, b: 246 },
      clouds:    [
        { r: 155, g: 175, b: 210 },
        { r: 175, g: 190, b: 218 },
        { r: 125, g: 150, b: 188 },
      ],
      orbCore:   { r: 255, g: 255, b: 255 },
      orbGlow:   { r: 95,  g: 135, b: 185 },
      orbCorona: { r: 65,  g: 105, b: 155 },
      ember:     { r: 95,  g: 135, b: 185 },
      accent:    { r: 70,  g: 120, b: 165 },
    },
  },

  // 1: DHUHR — Radiant midday gold (the current default)
  {
    name: 'Dhuhr',
    dark: {
      bg:        { r: 6,   g: 5,   b: 4   },
      clouds:    [
        { r: 210, g: 162, b: 75  },
        { r: 215, g: 205, b: 188 },
        { r: 175, g: 115, b: 45  },
      ],
      orbCore:   { r: 255, g: 255, b: 255 },
      orbGlow:   { r: 228, g: 182, b: 82  },
      orbCorona: { r: 180, g: 120, b: 40  },
      ember:     { r: 228, g: 182, b: 82  },
      accent:    { r: 210, g: 162, b: 75  },
    },
    light: {
      bg:        { r: 244, g: 240, b: 232 },
      clouds:    [
        { r: 220, g: 180, b: 100 },
        { r: 200, g: 190, b: 180 },
        { r: 150, g: 100, b: 40  },
      ],
      orbCore:   { r: 255, g: 245, b: 230 },
      orbGlow:   { r: 180, g: 130, b: 50  },
      orbCorona: { r: 150, g: 100, b: 30  },
      ember:     { r: 180, g: 130, b: 50  },
      accent:    { r: 156, g: 117, b: 51  },
    },
  },

  // 2: ASR — Warm deep ambers and burnt orange
  {
    name: 'Asr',
    dark: {
      bg:        { r: 10,  g: 6,   b: 3   },
      clouds:    [
        { r: 215, g: 135, b: 50  },
        { r: 195, g: 115, b: 55  },
        { r: 175, g: 85,  b: 30  },
      ],
      orbCore:   { r: 255, g: 228, b: 195 },
      orbGlow:   { r: 225, g: 145, b: 48  },
      orbCorona: { r: 195, g: 95,  b: 18  },
      ember:     { r: 230, g: 150, b: 50  },
      accent:    { r: 224, g: 144, b: 48  },
    },
    light: {
      bg:        { r: 248, g: 238, b: 226 },
      clouds:    [
        { r: 218, g: 158, b: 78  },
        { r: 198, g: 148, b: 88  },
        { r: 178, g: 118, b: 48  },
      ],
      orbCore:   { r: 255, g: 238, b: 218 },
      orbGlow:   { r: 198, g: 128, b: 38  },
      orbCorona: { r: 175, g: 95,  b: 18  },
      ember:     { r: 198, g: 128, b: 38  },
      accent:    { r: 184, g: 115, b: 32  },
    },
  },

  // 3: MAGHRIB — Rich violets and deep indigo
  {
    name: 'Maghrib',
    dark: {
      bg:        { r: 8,   g: 4,   b: 16  },
      clouds:    [
        { r: 135, g: 75,  b: 175 },
        { r: 115, g: 95,  b: 195 },
        { r: 95,  g: 48,  b: 145 },
      ],
      orbCore:   { r: 238, g: 218, b: 255 },
      orbGlow:   { r: 155, g: 95,  b: 215 },
      orbCorona: { r: 115, g: 55,  b: 175 },
      ember:     { r: 165, g: 105, b: 218 },
      accent:    { r: 167, g: 139, b: 250 },
    },
    light: {
      bg:        { r: 240, g: 234, b: 248 },
      clouds:    [
        { r: 158, g: 118, b: 198 },
        { r: 148, g: 128, b: 188 },
        { r: 128, g: 88,  b: 168 },
      ],
      orbCore:   { r: 255, g: 242, b: 255 },
      orbGlow:   { r: 138, g: 88,  b: 188 },
      orbCorona: { r: 108, g: 55,  b: 158 },
      ember:     { r: 138, g: 88,  b: 188 },
      accent:    { r: 124, g: 58,  b: 237 },
    },
  },

  // 4: ISHA / TAHAJJUD — True OLED black, piercing white Nur
  {
    name: 'Isha',
    dark: {
      bg:        { r: 0,   g: 0,   b: 0   },
      clouds:    [
        { r: 28,  g: 28,  b: 34  },
        { r: 22,  g: 22,  b: 28  },
        { r: 14,  g: 14,  b: 18  },
      ],
      orbCore:   { r: 255, g: 255, b: 255 },
      orbGlow:   { r: 195, g: 198, b: 210 },
      orbCorona: { r: 145, g: 148, b: 158 },
      ember:     { r: 195, g: 198, b: 210 },
      accent:    { r: 148, g: 163, b: 184 },
    },
    light: {
      bg:        { r: 236, g: 238, b: 242 },
      clouds:    [
        { r: 168, g: 172, b: 184 },
        { r: 158, g: 162, b: 174 },
        { r: 142, g: 148, b: 158 },
      ],
      orbCore:   { r: 255, g: 255, b: 255 },
      orbGlow:   { r: 138, g: 142, b: 152 },
      orbCorona: { r: 108, g: 112, b: 122 },
      ember:     { r: 138, g: 142, b: 152 },
      accent:    { r: 100, g: 116, b: 139 },
    },
  },
];
