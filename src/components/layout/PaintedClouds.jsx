import { useMemo, useRef } from 'react';
import { useCloudParallax } from '../../hooks/useCloudParallax';
import { generateCleanStarfield } from '../../utils/devotionLogic';
import ghibliDayClouds from '../../assets/images/ghibli_day_clouds_1794550142648.jpg';
import ghibliNightClouds from '../../assets/images/ghibli_night_clouds_1794550143549.jpg';

const NightStarfield = () => {
  const stars = useMemo(
    () => generateCleanStarfield({ count: 36, minDistance: 7.4, seed: 1448 }),
    []
  );

  return (
    <div
      data-testid="night-starfield"
      className="absolute inset-0 pointer-events-none will-change-transform"
      style={{
        transform: 'translate3d(calc(var(--px, 0px) * 0.12), calc(var(--py, 0px) * 0.12), 0)',
      }}
    >
      {stars.map((star) => (
        <span
          key={star.id}
          className="absolute rounded-full animate-star-twinkle"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            backgroundColor: star.color,
            opacity: star.opacity,
            transform: 'translate(-50%, -50%)',
            '--star-op': star.opacity,
            '--star-dur': `${star.duration}s`,
            '--star-delay': `${star.delay}s`,
            boxShadow:
              star.tier === 'bright'
                ? `0 0 ${Math.round(star.size * 3.5)}px ${star.color}88`
                : star.tier === 'medium'
                  ? `0 0 2px ${star.color}44`
                  : 'none',
          }}
        />
      ))}
    </div>
  );
};

const CloudDepthGroup = ({ src, isVisible, targetOpacity, isNight = false }) => {
  // For night mode, strictly mask painted sky above the cloud valley crest (y=58%)
  // so zero baked JPEG stars peek through or overlap across parallax cloud layers.
  const baseMask = isNight
    ? 'linear-gradient(to top, black 0%, black 24%, rgba(0,0,0,0.6) 33%, transparent 42%)'
    : undefined;
  const leftMask = isNight
    ? 'radial-gradient(ellipse 42% 26% at 15% 83%, black 34%, transparent 72%)'
    : 'radial-gradient(ellipse 40% 34% at 18% 72%, black 28%, transparent 72%)';
  const rightMask = isNight
    ? 'radial-gradient(ellipse 42% 26% at 85% 81%, black 34%, transparent 72%)'
    : 'radial-gradient(ellipse 40% 34% at 82% 72%, black 28%, transparent 72%)';
  const horizonMask = 'linear-gradient(to top, black 0%, black 18%, transparent 38%)';

  return (
    <div
      className="absolute inset-0 transition-[opacity,visibility] duration-300 ease-out"
      style={{
        opacity: isVisible ? targetOpacity : 0,
        visibility: isVisible ? 'visible' : 'hidden',
      }}
    >
      {isNight && (
        <>
          {/* Deep midnight gouache sky gradient matching the lower cloud palette */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, #070d19 0%, #0a1425 42%, #101f36 78%, #13253e 100%)',
            }}
          />
          <NightStarfield />
        </>
      )}

      {/* Distant Painted Sky & Cloud Canopy (Depth: 0.28x) */}
      <div
        className="absolute inset-0 will-change-transform"
        style={{
          transform: 'translate3d(calc(var(--px, 0px) * 0.28), calc(var(--py, 0px) * 0.28), 0)',
        }}
      >
        <img
          src={src}
          alt=""
          referrerPolicy="no-referrer"
          className="absolute -inset-[9%] w-[118%] h-[118%] max-w-none object-cover object-center animate-cloud-base"
          style={
            baseMask
              ? {
                  maskImage: baseMask,
                  WebkitMaskImage: baseMask,
                }
              : undefined
          }
        />
      </div>

      {/* Mid-Ground Left Cumulus Slope (Depth: 0.62x) */}
      <div
        className="absolute inset-0 will-change-transform"
        style={{
          transform: 'translate3d(calc(var(--px, 0px) * 0.62), calc(var(--py, 0px) * 0.62), 0)',
        }}
      >
        <img
          src={src}
          alt=""
          referrerPolicy="no-referrer"
          className="absolute -inset-[9%] w-[118%] h-[118%] max-w-none object-cover object-center animate-cloud-left"
          style={{
            maskImage: leftMask,
            WebkitMaskImage: leftMask,
          }}
        />
      </div>

      {/* Mid-Ground Right Cumulus Billow (Depth: 0.68x) */}
      <div
        className="absolute inset-0 will-change-transform"
        style={{
          transform: 'translate3d(calc(var(--px, 0px) * 0.68), calc(var(--py, 0px) * 0.68), 0)',
        }}
      >
        <img
          src={src}
          alt=""
          referrerPolicy="no-referrer"
          className="absolute -inset-[9%] w-[118%] h-[118%] max-w-none object-cover object-center animate-cloud-right"
          style={{
            maskImage: rightMask,
            WebkitMaskImage: rightMask,
          }}
        />
      </div>

      {/* Nearest Foreground Horizon Cloud Ridge (Depth: 1.0x) */}
      <div
        className="absolute inset-0 will-change-transform"
        style={{
          transform: 'translate3d(calc(var(--px, 0px) * 1), calc(var(--py, 0px) * 1), 0)',
        }}
      >
        <img
          src={src}
          alt=""
          referrerPolicy="no-referrer"
          className="absolute -inset-[9%] w-[118%] h-[118%] max-w-none object-cover object-center animate-cloud-horizon"
          style={{
            maskImage: horizonMask,
            WebkitMaskImage: horizonMask,
          }}
        />
      </div>
    </div>
  );
};

export const PaintedClouds = ({ isLightMode }) => {
  const skyParallaxRef = useRef(null);
  useCloudParallax(skyParallaxRef, 24, 14);

  return (
    <div
      ref={skyParallaxRef}
      data-testid="cloud-parallax-stage"
      aria-hidden="true"
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
    >
      <CloudDepthGroup
        src={ghibliNightClouds}
        isVisible={!isLightMode}
        targetOpacity={0.95}
        isNight
      />
      <CloudDepthGroup
        src={ghibliDayClouds}
        isVisible={isLightMode}
        targetOpacity={0.96}
      />
    </div>
  );
};
