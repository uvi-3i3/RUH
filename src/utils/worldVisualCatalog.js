/**
 * Pure metadata catalog mapping every Burhan proof (18 entries) and
 * every Qur'anic Miracle sign (22 entries) to its bespoke hand-drawn
 * book-engraving plate key, curatorial figure title, caption, and alt text.
 *
 * Kept free of static binary (.jpg) imports so it can be unit-tested cleanly in node:test.
 */

export const VISUAL_PLATE_KEYS = {
  BURHAN_COSMOLOGY: 'ink_burhan_astrolabe_scales',
  BURHAN_FITRAH: 'ink_burhan_lantern_reflection',
  BURHAN_ARCHITECTURE: 'ink_burhan_arch_compass',
  BURHAN_SCRIPTURE: 'ink_burhan_codex_qalam',
  MIRACLE_COSMOS: 'ink_miracle_cosmos_orbits',
  MIRACLE_STELLAR_IRON: 'ink_miracle_stellar_iron',
  MIRACLE_MOUNTAIN_PEGS: 'ink_miracle_mountain_pegs',
  MIRACLE_OCEANS: 'ink_miracle_ocean_waves',
  MIRACLE_WATER_CELL: 'ink_miracle_water_cell',
  MIRACLE_HONEYBEE: 'ink_miracle_honeybee_comb',
  MIRACLE_HISTORY: 'ink_miracle_ancient_columns',
  MIRACLE_SYMMETRY: 'ink_miracle_ring_symmetry',
  MIRACLE_SKY_ASCENT: 'ink_miracle_sky_ascent',
};

export const BURHAN_VISUAL_META = {
  b1: {
    plateKey: VISUAL_PLATE_KEYS.BURHAN_COSMOLOGY,
    figureTitle: 'The Uncaused First Anchor',
    caption:
      'Concentric arcs and weighted scales converging on a single origin — Al-Ghazali’s proof of an independent First Cause.',
    alt: 'Hand-drawn pen-and-ink illustration of a classical Islamic astrolabe beside hanging apothecary scales beneath dotted celestial arcs.',
  },
  b2: {
    plateKey: VISUAL_PLATE_KEYS.BURHAN_FITRAH,
    figureTitle: 'The Innate Lamp of Fitrah',
    caption:
      'A quiet sanctuary lantern glowing above still water ripples — Ibn Taymiyyah’s portrait of innate human recognition.',
    alt: 'Hand-drawn pen-and-ink vignette of a pierced Islamic hanging lantern radiating fine light rays above calm water ripples and an olive sprig.',
  },
  b3: {
    plateKey: VISUAL_PLATE_KEYS.BURHAN_ARCHITECTURE,
    figureTitle: 'Calibration & Purposeful Design',
    caption:
      'A sanctuary archway and dome ribs laid out by drafting compass — Al-Razi’s argument from intelligible craftsmanship.',
    alt: 'Hand-drawn architectural ink engraving of an ornate Islamic pointed archway and ribbed dome measured by a brass drafting compass.',
  },
  b4: {
    plateKey: VISUAL_PLATE_KEYS.BURHAN_COSMOLOGY,
    figureTitle: 'Tipping the Scales of Being',
    caption:
      'Balanced pans awaiting an independent determinant — Ibn Sina’s proof that contingent things require Necessary Existence.',
    alt: 'Fine ink book sketch of antique hanging balance scales and an astrolabe anchored beneath radiating celestial lines.',
  },
  b9: {
    plateKey: VISUAL_PLATE_KEYS.BURHAN_COSMOLOGY,
    figureTitle: 'Unity of Sovereign Will',
    caption:
      'Every celestial arc governed by one radiant center — Al-Baqillani’s proof that cosmic harmony admits no rival will.',
    alt: 'Pen-and-ink engraving of celestial meridian arcs uniting toward one radiant star above a classical astrolabe and scales.',
  },
  b10: {
    plateKey: VISUAL_PLATE_KEYS.BURHAN_SCRIPTURE,
    figureTitle: 'Witness of Integrity & Revelation',
    caption:
      'Open codex, reed qalam, and steady candle flame — framing Al-Mawardi’s trilemma on the truthfulness of Prophethood.',
    alt: 'Hand-drawn ink book illustration of an open manuscript on a carved wooden rehal beside a reed qalam pen, inkwell, and taper candle.',
  },
  b11: {
    plateKey: VISUAL_PLATE_KEYS.BURHAN_SCRIPTURE,
    figureTitle: 'The Unmatched Criterion (I‘jaz)',
    caption:
      'Reed pen resting across classical manuscript lines — recalling the Qur’an’s standing fourteen-century literary challenge.',
    alt: 'Fine dip-pen sketch of an illuminated open book on a folding wooden stand with a diagonal reed pen and ink bottle.',
  },
  b12: {
    plateKey: VISUAL_PLATE_KEYS.BURHAN_SCRIPTURE,
    figureTitle: 'Living Chains of Preservation',
    caption:
      'Written parchment and steady light — symbolizing unbroken mass transmission (tawatur) across generations.',
    alt: 'Hand-drawn vintage ink engraving of an open codex on a carved stand lit by a small candle beside a reed pen and inkwell.',
  },
  b13: {
    plateKey: VISUAL_PLATE_KEYS.BURHAN_ARCHITECTURE,
    figureTitle: 'Architectural Coherence of Truth',
    caption:
      'Interlocking vaults and geometric arcs held in tension — mirroring harmony between theology, history, and reason.',
    alt: 'Detailed pen-and-ink architectural drawing of a symmetrical muqarnas arch and dome overlaid with geometric construction circles.',
  },
  b14: {
    plateKey: VISUAL_PLATE_KEYS.BURHAN_SCRIPTURE,
    figureTitle: 'Continuity of Prophetic Guidance',
    caption:
      'An open volume in timeless study — evoking the unbroken message carried from Abraham, Moses, and Jesus to the final seal.',
    alt: 'Pen-and-ink engraving of an open classical scripture resting on a carved wooden stand with inkwell and reed pen.',
  },
  b5: {
    plateKey: VISUAL_PLATE_KEYS.BURHAN_FITRAH,
    figureTitle: 'Stillness Beyond Anxious Grasping',
    caption:
      'Quiet lantern light over unruffled water — echoing Ibn Ata Allah’s counsel to entrust timing back to Wisdom.',
    alt: 'Hand-drawn ink vignette of a hanging sanctuary lantern casting serene rays over concentric ripples and an olive branch.',
  },
  b6: {
    plateKey: VISUAL_PLATE_KEYS.BURHAN_ARCHITECTURE,
    figureTitle: 'The Architect of the Threshold',
    caption:
      'Measured arches framing an unseen interior — Imam Al-Shafi‘i’s reminder that closed doors often shield the traveler.',
    alt: 'Classic pen-and-ink sketch of a tall pointed doorway archway and ribbed dome traced with drafting compass arcs.',
  },
  b7: {
    plateKey: VISUAL_PLATE_KEYS.BURHAN_FITRAH,
    figureTitle: 'The Quiet Mirror of Self-Audit',
    caption:
      'Still water mirroring honest light — honoring Al-Muhasibi’s inward examination before speech and deed.',
    alt: 'Hand-drawn ink illustration of calm concentric water ripples mirroring a hanging sanctuary lantern above.',
  },
  b8: {
    plateKey: VISUAL_PLATE_KEYS.BURHAN_FITRAH,
    figureTitle: 'Constant Presence in Every Hour',
    caption:
      'A steadfast sanctuary lamp in quiet air — Al-Junayd’s teaching that remembrance awakens nearness right where you stand.',
    alt: 'Delicate pen-and-ink drawing of a glowing pierced lantern suspended peacefully above still ripples and an olive sprig.',
  },
  b15: {
    plateKey: VISUAL_PLATE_KEYS.BURHAN_COSMOLOGY,
    figureTitle: 'Fine-Tuned Measure of Creation',
    caption:
      'Calibrated astrolabe rings and weighted scales in hairline equilibrium — reflecting the precise constants of cosmic fine-tuning (54:49).',
    alt: 'Hand-drawn pen-and-ink illustration of a classical Islamic astrolabe and balanced apothecary scales under celestial arcs.',
  },
  b16: {
    plateKey: VISUAL_PLATE_KEYS.BURHAN_FITRAH,
    figureTitle: 'The Living Lamp of Consciousness',
    caption:
      'Radiant inner light reflected upon quiet waters — evoking the irreducible mystery of Al-Ruh beyond blind physical matter.',
    alt: 'Hand-drawn pen-and-ink vignette of a pierced hanging sanctuary lantern casting fine light rays over calm water ripples.',
  },
  b17: {
    plateKey: VISUAL_PLATE_KEYS.BURHAN_ARCHITECTURE,
    figureTitle: 'The House of United Hearts',
    caption:
      'Harmonized sanctuary arches rising from a single compass center — echoing Arabia’s swift moral transformation within one generation.',
    alt: 'Hand-drawn architectural ink engraving of a balanced Islamic sanctuary archway and ribbed dome traced by a compass.',
  },
  b18: {
    plateKey: VISUAL_PLATE_KEYS.BURHAN_SCRIPTURE,
    figureTitle: 'Unbroken Symphony Across 23 Years',
    caption:
      'An open manuscript resting in steady lamplight — symbolizing seamless coherence across twenty-three years of oral revelation (4:82).',
    alt: 'Hand-drawn pen-and-ink illustration of an open classical codex on a carved stand beside a reed qalam and steady candle.',
  },
};

export const MIRACLE_VISUAL_META = {
  'm-expanding-universe': {
    plateKey: VISUAL_PLATE_KEYS.MIRACLE_COSMOS,
    figureTitle: 'The Expanding Fabric of Heaven',
    caption:
      'Spiral nebula and sweeping orbital ellipses stretching outward — visualizing the continuous expansion of “la-musi‘un” (51:47).',
    alt: 'Hand-drawn astronomical pen-and-ink engraving of a spiral galaxy, dotted elliptical orbits, crescent moon, sun, and scattered stars.',
  },
  'm-iron-sent-down': {
    plateKey: VISUAL_PLATE_KEYS.MIRACLE_STELLAR_IRON,
    figureTitle: 'Stellar Nucleosynthesis & Iron’s Descent',
    caption:
      'A radiant distant starburst showering meteoric streaks onto crystalline iron — illustrating “We sent down iron” (57:25).',
    alt: 'Vintage pen-and-ink scientific engraving of a blazing star burst sending meteor trails down toward a faceted iron meteorite cluster.',
  },
  'm-king-vs-pharaoh': {
    plateKey: VISUAL_PLATE_KEYS.MIRACLE_HISTORY,
    figureTitle: 'Middle Kingdom King & New Kingdom Pharaoh',
    caption:
      'Weathered ancient colonnades across dynasties — echoing the Qur’an’s exact distinction between “Al-Malik” and “Fir‘awn.”',
    alt: 'Hand-drawn archaeological ink etching of weathered ancient temple columns and a stone arch overlooking a deep desert valley.',
  },
  'm-embryo-stages': {
    plateKey: VISUAL_PLATE_KEYS.MIRACLE_WATER_CELL,
    figureTitle: 'Origins of Hidden Cellular Form',
    caption:
      'A delicate living droplet holding concentric organic rings — reflecting Surah Al-Mu’minun’s microscopic stages of human formation.',
    alt: 'Hand-drawn naturalist pen-and-ink etching of a water droplet revealing concentric microscopic cellular rings and a sprouting shoot.',
  },
  'm-hadid-numerology': {
    plateKey: VISUAL_PLATE_KEYS.MIRACLE_SYMMETRY,
    figureTitle: 'Core Symmetry of Surah Al-Hadid',
    caption:
      'Concentric compass rings radiating from a central core — mirroring Chapter 57’s midpoint position and Iron’s atomic signature (26 / 57).',
    alt: 'Hand-drawn geometric ink engraving of nine concentric nested rings and an eight-pointed star rosette radiating from a bright core.',
  },
  'm-two-seas-barrier': {
    plateKey: VISUAL_PLATE_KEYS.MIRACLE_OCEANS,
    figureTitle: 'Halocline Front Between Meeting Seas',
    caption:
      'Two distinct currents meeting along a shimmering vertical seam — visualizing the unseen “barzakh” of Surah Ar-Rahman (55:19–20).',
    alt: 'Hand-drawn oceanographic ink engraving of curling ocean waves meeting a calm second current across a vertical seam above deep waters.',
  },
  'm-deep-ocean-darkness': {
    plateKey: VISUAL_PLATE_KEYS.MIRACLE_OCEANS,
    figureTitle: 'Layered Darkness & Internal Sea Waves',
    caption:
      'Clouds above surface swells and rolling internal waves descending into pitch-black depths — matching Surah An-Nur (24:40).',
    alt: 'Vintage natural-history pen-and-ink cross-section of clouds, surface waves, and deep internal underwater waves sinking into crosshatched darkness.',
  },
  'm-celestial-orbits': {
    plateKey: VISUAL_PLATE_KEYS.MIRACLE_COSMOS,
    figureTitle: 'Every Sphere Gliding in Its Orbit',
    caption:
      'Sun, moon, and stars gliding smoothly along elliptical paths — illustrating “kullun fi falakin yasbahun” (21:33).',
    alt: 'Hand-drawn ink astronomical sketch of dotted orbital paths carrying a sun, crescent moon, and stars around a swirling galaxy.',
  },
  'm-byzantine-prophecy': {
    plateKey: VISUAL_PLATE_KEYS.MIRACLE_HISTORY,
    figureTitle: 'Ruins Above Earth’s Lowest Basin',
    caption:
      'Classical stone pillars overlooking the sunken Dead Sea rift (−430 m) — echoing “adna al-ard” (30:2–4) and the Byzantine reversal.',
    alt: 'Vintage travelogue pen-and-ink etching of crumbling Roman columns and an arch perched above a vast sunken valley.',
  },
  'm-mountains-pegs': {
    plateKey: VISUAL_PLATE_KEYS.MIRACLE_MOUNTAIN_PEGS,
    figureTitle: 'Isostatic Crustal Roots Beneath Peaks',
    caption:
      'Deep tapered crustal roots plunging beneath towering ridges — illustrating “al-jibala awtada” (mountains as tent pegs, 78:7).',
    alt: 'Hand-drawn geological ink cross-section showing jagged mountain peaks anchored by deep tapered wedge-shaped roots underground.',
  },
  'm-water-origin-life': {
    plateKey: VISUAL_PLATE_KEYS.MIRACLE_WATER_CELL,
    figureTitle: 'Water: The Living Matrix of Cells',
    caption:
      'A translucent drop nurturing cellular life and tender foliage — reflecting “We made from water every living thing” (21:30).',
    alt: 'Fine botanical pen-and-ink etching of a falling water drop enclosing a sprouting plant and microscopic cellular rings above water ripples.',
  },
  'm-worker-bee': {
    plateKey: VISUAL_PLATE_KEYS.MIRACLE_HONEYBEE,
    figureTitle: 'The Female Forager & Hexagonal Comb',
    caption:
      'A worker honeybee hovering beside hexagonal wax cells and mountain blossoms — echoing Surah An-Nahl’s feminine verbs (16:68–69).',
    alt: 'Hand-drawn entomological pen-and-ink engraving of a detailed honeybee hovering beside hexagonal honeycomb cells and flowering thyme.',
  },
  'm-ayat-al-kursi-ring': {
    plateKey: VISUAL_PLATE_KEYS.MIRACLE_SYMMETRY,
    figureTitle: 'Nine-Part Concentric Chiastic Mirror',
    caption:
      'Nine nested geometric rings converging on one luminous center — mapping Ayat al-Kursi’s oral A–B–C–D–E–D′–C′–B′–A′ symmetry.',
    alt: 'Hand-drawn ink compass drawing of nine symmetrical concentric circular rings and geometric star arcs converging on a central star.',
  },
  'm-cosmic-smoke-separation': {
    plateKey: VISUAL_PLATE_KEYS.MIRACLE_COSMOS,
    figureTitle: 'From Joined Unity & Primordial Smoke',
    caption:
      'Swirling cosmic filaments unfolding outward into star systems — visualizing “ratq → fatq” (21:30) and primordial “dukhan” (41:11).',
    alt: 'Fine pen-and-ink astronomical etching of a swirling spiral nebula and radiating star dust unfolding along celestial arcs.',
  },
  'm-lexical-symmetry': {
    plateKey: VISUAL_PLATE_KEYS.MIRACLE_SYMMETRY,
    figureTitle: 'Harmonic Balance Across Revelation',
    caption:
      'Calibrated geometric proportions and mirrored compass lines — reflecting the balanced lexical cadence across 114 surahs.',
    alt: 'Precision hand-drawn ink geometric mandala of balanced concentric rings and radial compass construction lines.',
  },
  'm-altitude-breathing': {
    plateKey: VISUAL_PLATE_KEYS.MIRACLE_SKY_ASCENT,
    figureTitle: 'Rarified Air & High-Altitude Ascent',
    caption:
      'Cumulus banks rising into thinning upper-sky wind streams — echoing hypobaric chest constriction and the sound of “yassa‘‘adu” (6:125).',
    alt: 'Hand-drawn atmospheric ink engraving of layered cumulus clouds sweeping upward into wispy high-altitude wind currents above distant mountains.',
  },
  'm-unique-fingertips': {
    plateKey: VISUAL_PLATE_KEYS.MIRACLE_WATER_CELL,
    figureTitle: 'Unrepeatable Signature of the Fingertip',
    caption:
      'Fine concentric organic ridges etched in delicate detail — echoing “We are able to proportion even his fingertips” (75:4).',
    alt: 'Hand-drawn naturalist pen-and-ink etching of concentric organic cellular rings inside a clear living droplet.',
  },
  'm-pharaoh-preserved-body': {
    plateKey: VISUAL_PLATE_KEYS.MIRACLE_HISTORY,
    figureTitle: 'Silent Witness of Ancient Royal Tombs',
    caption:
      'Enduring stone colonnades overlooking the Egyptian valley — recalling the preserved New Kingdom royal mummies foretold in Surah Yunus (10:92).',
    alt: 'Hand-drawn archaeological pen-and-ink etching of weathered ancient temple columns and an archway overlooking a desert valley.',
  },
  'm-makkah-victory-prophecy': {
    plateKey: VISUAL_PLATE_KEYS.MIRACLE_HISTORY,
    figureTitle: 'Road to the Peaceful Entry',
    caption:
      'Standing stone arches bathed in open light — recalling the peaceful return to Makkah foretold on the road from Hudaybiyyah (48:27).',
    alt: 'Vintage pen-and-ink etching of ancient stone pillars and a wide archway standing above a desert plain.',
  },
  'm-surah-alkawthar': {
    plateKey: VISUAL_PLATE_KEYS.MIRACLE_SYMMETRY,
    figureTitle: 'Crystalline Symmetry of Ten Words',
    caption:
      'Nested geometric facets converging in compact brilliance — mirroring the unmatched rhetorical density of Surah Al-Kawthar (108:1–3).',
    alt: 'Hand-drawn geometric ink engraving of balanced concentric rings and star facets radiating from a luminous center.',
  },
  'm-sun-moon-light': {
    plateKey: VISUAL_PLATE_KEYS.MIRACLE_COSMOS,
    figureTitle: 'Radiant Blaze & Borrowed Moonlight',
    caption:
      'Blazing solar rays illuminating a serene crescent along its orbit — visualizing the Qur’an’s distinction between “diya’” and “nur” (10:5).',
    alt: 'Hand-drawn astronomical pen-and-ink engraving of a radiant sun, crescent moon, stars, and dotted elliptical orbits.',
  },
  'm-unmatched-rhythm': {
    plateKey: VISUAL_PLATE_KEYS.MIRACLE_SKY_ASCENT,
    figureTitle: 'Cadence Above Poetry & Prose',
    caption:
      'Sweeping atmospheric currents rising freely beyond rigid frames — echoing the Qur’an’s unmatched acoustic architecture (17:88).',
    alt: 'Hand-drawn pen-and-ink engraving of sweeping sky currents and layered cloud billows above distant horizons.',
  },
};

export function resolveBurhanVisualMeta(burhan) {
  if (!burhan) return null;
  if (burhan.id && BURHAN_VISUAL_META[burhan.id]) {
    return BURHAN_VISUAL_META[burhan.id];
  }
  const fallbackKey =
    burhan.category === 'islam'
      ? VISUAL_PLATE_KEYS.BURHAN_SCRIPTURE
      : VISUAL_PLATE_KEYS.BURHAN_FITRAH;
  return {
    plateKey: fallbackKey,
    figureTitle: burhan.theme || 'Contemplative Study Sketch',
    caption: `Hand-drawn study accompanying ${burhan.title || 'this treatise'}.`,
    alt: `Hand-drawn pen-and-ink illustration for ${burhan.title || 'Burhan reflection'}.`,
  };
}

export function resolveMiracleVisualMeta(miracle) {
  if (!miracle) return null;
  if (miracle.id && MIRACLE_VISUAL_META[miracle.id]) {
    return MIRACLE_VISUAL_META[miracle.id];
  }
  const byCategory = {
    cosmology: VISUAL_PLATE_KEYS.MIRACLE_COSMOS,
    science: VISUAL_PLATE_KEYS.MIRACLE_STELLAR_IRON,
    biology: VISUAL_PLATE_KEYS.MIRACLE_WATER_CELL,
    history: VISUAL_PLATE_KEYS.MIRACLE_HISTORY,
    numerology: VISUAL_PLATE_KEYS.MIRACLE_SYMMETRY,
    linguistic: VISUAL_PLATE_KEYS.MIRACLE_SKY_ASCENT,
  };
  return {
    plateKey: byCategory[miracle.category] || VISUAL_PLATE_KEYS.MIRACLE_COSMOS,
    figureTitle: miracle.categoryLabel || 'Observatory Field Sketch',
    caption: `Hand-drawn illustration accompanying ${miracle.title || 'this Qur’anic sign'}.`,
    alt: `Hand-drawn scientific ink illustration for ${miracle.title || 'Qur’anic miracle'}.`,
  };
}
