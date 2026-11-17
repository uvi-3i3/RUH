import { useMemo } from 'react';
import { generateCleanStarfield } from '../../utils/devotionLogic';
import ghibliDayClouds from '../../assets/images/ghibli_day_clouds_1794550142648.jpg';
import ghibliNightClouds from '../../assets/images/ghibli_night_clouds_1794550143549.jpg';

const NightStarfield = () => {
  const stars = useMemo(
    () => generateCleanStarfield({ count: 32, minDistance: 8, seed: 1448 }),
    []
  );

  return (
    <div data-testid="night-starfield" className="absolute inset-0 pointer-events-none">
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
              star.tier === 'bright' ? `0 0 ${Math.round(star.size * 3)}px ${star.color}70` : 'none',
          }}
        />
      ))}
    </div>
  );
};

export const PaintedClouds = ({ isLightMode }) => {
  const nightHorizonMask =
    'linear-gradient(to top, black 0%, black 24%, rgba(0,0,0,0.6) 33%, transparent 42%)';

  return (
    <div
      data-testid="cloud-parallax-stage"
      aria-hidden="true"
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
    >
      {isLightMode ? (
        <img
          src={ghibliDayClouds}
          alt=""
          referrerPolicy="no-referrer"
          className="absolute -inset-[6%] w-[112%] h-[112%] max-w-none object-cover object-center opacity-[0.96]"
        />
      ) : (
        <div className="absolute inset-0 opacity-[0.95]">
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, #070d19 0%, #0a1425 42%, #101f36 78%, #13253e 100%)',
            }}
          />
          <NightStarfield />
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
        </div>
      )}
    </div>
  );
};
