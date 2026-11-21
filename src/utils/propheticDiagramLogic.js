/**
 * Pure illumination math and Prophetic Hadith metadata for the left-rail
 * "Life, Hopes & Calamities" sacred geometric line artwork (Sahih al-Bukhari 6417).
 *
 * Each completed daily prayer (0..5) illuminates a further portion of the diagram
 * little by little — from the awakened soul at the center, around the square of
 * life's appointed term (Ajal), across the short strokes of trials (A'rad), and
 * finally up the extending line of hope (Amal) beyond the boundary.
 */

export const TOTAL_DAILY_PRAYERS = 5;
export const TOTAL_CALAMITY_STROKES = 6;

export const PROPHETIC_DIAGRAM_HADITH = {
  title: 'Life, Hopes & Calamities',
  source: 'Sahih al-Bukhari · 6417',
  narrator: 'Abdullah ibn Mas‘ud (may Allah be pleased with him)',
  quote:
    'The Prophet ﷺ drew a square, drew a line in the middle extending beyond it, and drew small lines along its sides, saying: This is man; this square enclosing him is his appointed term; the line extending beyond it is his hope; and these small lines are the calamities — if one misses him, another strikes him.',
};

export const PROPHETIC_DIAGRAM_LEGEND = [
  {
    id: 'soul',
    label: 'The Human Being',
    arabic: 'الإنسان',
    meaning: 'The quiet center where remembrance begins.',
  },
  {
    id: 'ajal',
    label: 'The Square · Appointed Term',
    arabic: 'الأجل',
    meaning: 'Life’s fixed boundary encompassing our days.',
  },
  {
    id: 'amal',
    label: 'The Extending Line · Hope',
    arabic: 'الأمل',
    meaning: 'Longing that stretches past the boundary of life.',
  },
  {
    id: 'arad',
    label: 'The Short Lines · Calamities',
    arabic: 'الأعراض',
    meaning: 'Trials along the path — met with patience and prayer.',
  },
];

const STAGE_LABELS = [
  'Awaiting First Light',
  'The Soul Awakens',
  'Within Life’s Boundary',
  'Steadfast Amid Trials',
  'The Enclosure Illuminated',
  'Hope Beyond the Veil',
];

// Progressive illumination steps (index 0..5 = completed daily prayers)
const FRAME_PROGRESS_STEPS = [0, 0.24, 0.52, 0.78, 1, 1];
const HOPE_PROGRESS_STEPS = [0, 0.22, 0.42, 0.64, 0.84, 1];
const CALAMITY_LIT_STEPS = [0, 1, 2, 4, 5, 6];
const SOUL_GLOW_STEPS = [0, 0.58, 0.72, 0.84, 0.94, 1];
const CROWN_GLOW_STEPS = [0, 0, 0, 0.18, 0.45, 1];
const HALO_OPACITY_STEPS = [0, 0.22, 0.38, 0.54, 0.72, 0.95];

/**
 * Computes deterministic illumination state for the Prophetic Life Diagram
 * based on how many daily prayers have been completed today.
 *
 * @param {number} completedCount
 * @param {number} [totalPrayers=5]
 */
export function computePropheticIllumination(completedCount = 0, totalPrayers = TOTAL_DAILY_PRAYERS) {
  const safeTotal = Math.max(1, Math.round(Number(totalPrayers) || TOTAL_DAILY_PRAYERS));
  const raw = Number.isFinite(Number(completedCount)) ? Math.round(Number(completedCount)) : 0;
  const completed = Math.max(0, Math.min(safeTotal, raw));
  const ratio = completed / safeTotal;

  // Map normalized ratio into 0..5 discrete stage buckets for arbitrary totalPrayers
  const stage = Math.max(0, Math.min(5, Math.round(ratio * 5)));

  return {
    completed,
    total: safeTotal,
    ratio,
    stage,
    stageLabel: STAGE_LABELS[stage],
    isFullyLit: completed >= safeTotal,
    parts: {
      soulGlow: SOUL_GLOW_STEPS[stage],
      frameProgress: FRAME_PROGRESS_STEPS[stage],
      hopeProgress: HOPE_PROGRESS_STEPS[stage],
      calamitiesLitCount: CALAMITY_LIT_STEPS[stage],
      crownGlow: CROWN_GLOW_STEPS[stage],
      haloOpacity: HALO_OPACITY_STEPS[stage],
    },
  };
}
