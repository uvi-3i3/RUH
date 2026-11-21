import { memo, useMemo } from 'react';
import { generateCleanStarfield } from '../../utils/devotionLogic';
import { buildInterpolatedSkyVisuals } from '../../utils/atmosphereSyncLogic';
import ghibliDayClouds from '../../assets/images/ghibli_day_clouds_1794550142648.jpg';
import ghibliNightClouds from '../../assets/images/ghibli_night_clouds_1794550143549.jpg';

const DEFAULT_SKY_VISUALS = buildInterpolatedSkyVisuals(4, 4, 0);

const NightStarfield = memo(({ opacity = 1 }) => {
  const stars = useMemo(
    () => generateCleanStarfield({ count: 32, minDistance: 8, seed: 1448 }),
    []
  );

  return (
    <div
      data-testid="night-starfield"
      className="absolute inset-0 pointer-events-none transition-opacity duration-[1600ms] ease-out"
      style={{ opacity }}
    >
      {stars.map((star) => (
        <span
          key={star.id}
          className="absolute rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            backgroundColor: star.color,
            opacity: star.opacity,
            transform: 'translate(-50%, -50%)',
            boxShadow:
              star.tier === 'bright'
                ? `0 0 ${Math.round(star.size * 3)}px ${star.color}70`
                : 'none',
          }}
        />
      ))}
    </div>
  );
});

export const PaintedClouds = memo(({ isLightMode, atmosphere }) => {
  const nightHorizonMask =
    'linear-gradient(to top, black 0%, black 24%, rgba(0,0,0,0.6) 33%, transparent 42%)';

  const skyVisuals = atmosphere?.skyVisuals || DEFAULT_SKY_VISUALS;
  const phaseId = atmosphere?.phaseId || 'isha';
  const source = atmosphere?.source || 'schedule';

  return (
    <div
      data-testid="cloud-parallax-stage"
      data-atmosphere-phase={phaseId}
      data-atmosphere-source={source}
      aria-hidden="true"
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
    >
      {isLightMode ? (
        <div className="absolute inset-0">
          <img
            src={ghibliDayClouds}
            alt=""
            referrerPolicy="no-referrer"
            className="absolute -inset-[6%] w-[112%] h-[112%] max-w-none object-cover object-center opacity-[0.96] transition-[filter] duration-[1600ms] ease-out"
            style={{
              filter: skyVisuals.lightCloudFilterCss,
            }}
          />
          {/* Contemplative solar atmosphere watercolor wash */}
          <div
            data-testid="atmosphere-sky-wash"
            className="absolute inset-0 transition-[background] duration-[1600ms] ease-out"
            style={{
              background: skyVisuals.lightSkyWash,
            }}
          />
          {/* Gentle horizon light bloom */}
          <div
            data-testid="atmosphere-horizon-glow"
            className="absolute inset-0 transition-[background] duration-[1600ms] ease-out"
            style={{
              background: skyVisuals.lightHorizonGradient,
            }}
          />
        </div>
      ) : (
        <div className="absolute inset-0 opacity-[0.96]">
          {/* Live solar sky gradient */}
          <div
            data-testid="atmosphere-sky-wash"
            className="absolute inset-0 transition-[background] duration-[1600ms] ease-out"
            style={{
              background: skyVisuals.darkSkyGradient,
            }}
          />
          {/* Soft horizon radiance tied to Fajr/Dhuhr/Asr/Maghrib/Isha */}
          <div
            data-testid="atmosphere-horizon-glow"
            className="absolute inset-0 transition-[background] duration-[1600ms] ease-out"
            style={{
              background: skyVisuals.darkHorizonGradient,
            }}
          />
          <NightStarfield opacity={skyVisuals.starOpacity} />
          <img
            src={ghibliNightClouds}
            alt=""
            referrerPolicy="no-referrer"
            className="absolute -inset-[6%] w-[112%] h-[112%] max-w-none object-cover object-center"
            style={{
              maskImage: nightHorizonMask,
              WebkitMaskImage: nightHorizonMask,
            }}
          />
          {/* Subtle atmospheric color harmony across the lower cloud horizon */}
          <div
            className="absolute inset-0 transition-[background] duration-[1600ms] ease-out"
            style={{
              background: skyVisuals.darkCloudOverlay,
            }}
          />
        </div>
      )}
    </div>
  );
});
