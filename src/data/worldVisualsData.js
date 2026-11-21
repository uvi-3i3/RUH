/**
 * Client-side hand-drawn pen-and-ink engraving bindings for Burhan (House of Reason)
 * and Miracles of the Qur'an (Observatory of Signs).
 *
 * Each artwork is pure black ink on pure white (#FFFFFF), allowing seamless blend-mode
 * integration directly onto the book page in both Daylight (multiply) and Night (invert + screen).
 */

import inkBurhanAstrolabeImg from '../assets/images/ink_burhan_astrolabe_scales_1795180675258.jpg';
import inkBurhanLanternImg from '../assets/images/ink_burhan_lantern_reflection_1795180681750.jpg';
import inkBurhanArchImg from '../assets/images/ink_burhan_arch_compass_1795180674553.jpg';
import inkBurhanCodexImg from '../assets/images/ink_burhan_codex_qalam_1795180676247.jpg';

import inkMiracleCosmosImg from '../assets/images/ink_miracle_cosmos_orbits_1795180689545.jpg';
import inkMiracleStellarIronImg from '../assets/images/ink_miracle_stellar_iron_1795180674693.jpg';
import inkMiracleMountainPegsImg from '../assets/images/ink_miracle_mountain_pegs_1795180672173.jpg';
import inkMiracleOceanWavesImg from '../assets/images/ink_miracle_ocean_waves_1795180679358.jpg';
import inkMiracleWaterCellImg from '../assets/images/ink_miracle_water_cell_1795180671743.jpg';
import inkMiracleHoneybeeImg from '../assets/images/ink_miracle_honeybee_comb_1795180677947.jpg';
import inkMiracleAncientColumnsImg from '../assets/images/ink_miracle_ancient_columns_1795180673582.jpg';
import inkMiracleRingSymmetryImg from '../assets/images/ink_miracle_ring_symmetry_1795180682192.jpg';
import inkMiracleSkyAscentImg from '../assets/images/ink_miracle_sky_ascent_1795180673019.jpg';

import {
  VISUAL_PLATE_KEYS,
  resolveBurhanVisualMeta,
  resolveMiracleVisualMeta,
} from '../utils/worldVisualCatalog';

export const VISUAL_PLATE_ASSETS = {
  [VISUAL_PLATE_KEYS.BURHAN_COSMOLOGY]: {
    src: inkBurhanAstrolabeImg,
    cropClass: 'scale-[1.06]',
  },
  [VISUAL_PLATE_KEYS.BURHAN_FITRAH]: {
    src: inkBurhanLanternImg,
    cropClass: 'scale-[1.12]',
  },
  [VISUAL_PLATE_KEYS.BURHAN_ARCHITECTURE]: {
    src: inkBurhanArchImg,
    cropClass: 'scale-[1.04]',
  },
  [VISUAL_PLATE_KEYS.BURHAN_SCRIPTURE]: {
    src: inkBurhanCodexImg,
    cropClass: 'scale-[1.08]',
  },
  [VISUAL_PLATE_KEYS.MIRACLE_COSMOS]: {
    src: inkMiracleCosmosImg,
    cropClass: 'scale-[1.05]',
  },
  [VISUAL_PLATE_KEYS.MIRACLE_STELLAR_IRON]: {
    src: inkMiracleStellarIronImg,
    cropClass: 'scale-[1.05]',
  },
  [VISUAL_PLATE_KEYS.MIRACLE_MOUNTAIN_PEGS]: {
    src: inkMiracleMountainPegsImg,
    cropClass: 'scale-[1.08]',
  },
  [VISUAL_PLATE_KEYS.MIRACLE_OCEANS]: {
    src: inkMiracleOceanWavesImg,
    cropClass: 'scale-[1.05]',
  },
  [VISUAL_PLATE_KEYS.MIRACLE_WATER_CELL]: {
    // Crops past the outer sheet margin while keeping droplet, fern leaves, and ripples intact
    src: inkMiracleWaterCellImg,
    cropClass: 'scale-[1.56]',
  },
  [VISUAL_PLATE_KEYS.MIRACLE_HONEYBEE]: {
    src: inkMiracleHoneybeeImg,
    cropClass: 'scale-[1.06]',
  },
  [VISUAL_PLATE_KEYS.MIRACLE_HISTORY]: {
    src: inkMiracleAncientColumnsImg,
    cropClass: 'scale-[1.04]',
  },
  [VISUAL_PLATE_KEYS.MIRACLE_SYMMETRY]: {
    src: inkMiracleRingSymmetryImg,
    cropClass: 'scale-[1.02]',
  },
  [VISUAL_PLATE_KEYS.MIRACLE_SKY_ASCENT]: {
    src: inkMiracleSkyAscentImg,
    cropClass: 'scale-[1.04]',
  },
};

export function resolveBurhanVisual(burhan) {
  const meta = resolveBurhanVisualMeta(burhan);
  if (!meta) return null;
  const asset = VISUAL_PLATE_ASSETS[meta.plateKey] || VISUAL_PLATE_ASSETS[VISUAL_PLATE_KEYS.BURHAN_FITRAH];
  return { ...meta, ...asset };
}

export function resolveMiracleVisual(miracle) {
  const meta = resolveMiracleVisualMeta(miracle);
  if (!meta) return null;
  const asset = VISUAL_PLATE_ASSETS[meta.plateKey] || VISUAL_PLATE_ASSETS[VISUAL_PLATE_KEYS.MIRACLE_COSMOS];
  return { ...meta, ...asset };
}
