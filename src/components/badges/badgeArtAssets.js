import { getCozyBadgeConfig } from '../../utils/badgeLogic';

import firstDawnImg from '../../assets/images/badge_enamel_first_dawn_1795249810549.jpg';
import quietRosaryImg from '../../assets/images/badge_enamel_quiet_rosary_1795249812778.jpg';
import steadfastTrioImg from '../../assets/images/badge_enamel_trio_v2_1795249861799.jpg';
import pillarLightImg from '../../assets/images/badge_enamel_pillar_light_1795249812903.jpg';
import trueProofImg from '../../assets/images/badge_enamel_true_proof_1795249810947.jpg';
import lunarWeekImg from '../../assets/images/badge_enamel_lunar_week_1795249809600.jpg';
import guardianImg from '../../assets/images/badge_enamel_guardian_1795249811802.jpg';
import sereneHeartImg from '../../assets/images/badge_enamel_serene_heart_1795249812220.jpg';
import fullMoonImg from '../../assets/images/badge_enamel_fullmoon_v2_1795249861194.jpg';

const BADGE_IMAGE_BY_MOTIF = {
  crescent_dawn: firstDawnImg,
  tasbih_chaplet: quietRosaryImg,
  triple_flame: steadfastTrioImg,
  mihrab_lamp: pillarLightImg,
  qalam_scroll: trueProofImg,
  lunar_crown: lunarWeekImg,
  kaaba_compass: guardianImg,
  astrolabe_star: sereneHeartImg,
  celestial_prism: fullMoonImg,
};

export function getCozyBadgeAsset(motif) {
  const cfg = getCozyBadgeConfig(motif);
  return {
    ...cfg,
    src: BADGE_IMAGE_BY_MOTIF[motif] || firstDawnImg,
  };
}
