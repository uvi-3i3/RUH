import { useState, useMemo } from 'react';
import { CITY_PRESETS } from '../../data/cities';
import { filterCities } from '../../utils/devotionLogic';
import { MapPinIcon, SearchIcon, XIcon, CheckCircleIcon } from '../icons/Icons';
import { useOptionalPreferences, useOptionalSanctuary } from '../../context/sanctuaryStore';
import { hapticDismiss, hapticSuccess } from '../../utils/haptics';

export const CityPickerModal = ({
  isOpen,
  onClose,
  isLightMode: isLightModeProp,
  prayerTimes: prayerTimesProp,
}) => {
  const sanctuaryCtx = useOptionalSanctuary();
  const preferencesCtx = useOptionalPreferences();
  const isLightMode = isLightModeProp ?? preferencesCtx?.isLightMode ?? false;
  const prayerTimes = prayerTimesProp ?? sanctuaryCtx?.prayerTimes;
  const [query, setQuery] = useState('');

  const filteredCities = useMemo(() => filterCities(CITY_PRESETS, query), [query]);

  if (!isOpen) return null;

  const tTextMain = isLightMode ? 'text-[#1a1814]' : 'text-[rgba(245,238,224,0.94)]';
  const tTextSub = isLightMode ? 'text-[#4a453d]' : 'text-[#e4dac8]';
  const accentHex = isLightMode ? '#9c7533' : '#d2a24b';
  const activeCityId = prayerTimes?.location?.cityId;

  const handleSelectCity = (city) => {
    hapticSuccess();
    prayerTimes?.selectCity(city);
    setQuery('');
    onClose();
  };

  const handleUseGps = () => {
    hapticSuccess();
    prayerTimes?.requestLocation();
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Select Prayer & Qibla Location"
      className="fixed inset-0 z-[130] flex flex-col justify-end pointer-events-auto"
    >
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          background: isLightMode ? 'rgba(240,236,228,0.72)' : 'rgba(4,5,10,0.78)',
          backdropFilter: 'blur(16px)',
        }}
        onClick={() => {
          hapticDismiss();
          onClose?.();
        }}
      />

      <div
        className={`relative z-10 w-full max-w-lg mx-auto rounded-t-3xl border-t border-x max-h-[84vh] flex flex-col overflow-hidden transition-colors ${
          isLightMode
            ? 'bg-[#f7f4ec] border-black/10 text-[#1a1814]'
            : 'bg-[#0e1017] border-white/10 text-[#f5eee0]'
        }`}
      >
        {/* Drag Handle */}
        <div className="pt-3 pb-1 flex justify-center shrink-0">
          <span
            aria-hidden="true"
            className={`w-10 h-1 rounded-full ${isLightMode ? 'bg-black/15' : 'bg-white/15'}`}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-2 pb-4 border-b border-current/10 shrink-0">
          <div>
            <h2 className={`font-serif-eng text-base font-medium uppercase tracking-[0.2em] ${tTextMain}`}>
              Sanctuary Location
            </h2>
            <p className={`font-serif-eng text-[11px] opacity-65 mt-0.5 ${tTextSub}`}>
              Used for accurate prayer countdowns &amp; Qibla
            </p>
          </div>
          <button
            type="button"
            aria-label="Close Location Picker"
            onClick={() => {
              hapticDismiss();
              onClose?.();
            }}
            className={`w-11 h-11 rounded-full flex items-center justify-center border cursor-pointer transition-colors ${
              isLightMode
                ? 'border-black/10 text-[#4a453d] hover:bg-black/5'
                : 'border-white/10 text-white/80 hover:bg-white/5'
            }`}
          >
            <XIcon size={18} />
          </button>
        </div>

        {/* GPS & Search Bar */}
        <div className="px-5 pt-4 pb-3 flex flex-col gap-3 shrink-0">
          <button
            type="button"
            onClick={handleUseGps}
            className={`w-full min-h-[46px] px-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all active:scale-[0.99] ${
              isLightMode
                ? 'bg-[#9c7533]/10 border-[#9c7533]/30 text-[#7c5a1e] hover:bg-[#9c7533]/15'
                : 'bg-[#d2a24b]/10 border-[#d2a24b]/30 text-[#e5c17b] hover:bg-[#d2a24b]/15'
            }`}
          >
            <span className="flex items-center gap-2.5 font-serif-eng text-xs uppercase tracking-[0.16em]">
              <MapPinIcon size={15} />
              <span>
                {prayerTimes?.locationLoading ? 'Locating GPS...' : 'Use Current GPS'}
              </span>
            </span>
            {prayerTimes?.location?.source === 'gps' && (
              <span className="font-serif-eng text-[10px] uppercase tracking-[0.14em] opacity-85">
                Active
              </span>
            )}
          </button>

          <div
            className={`w-full min-h-[44px] px-3.5 rounded-2xl border flex items-center gap-2.5 ${
              isLightMode ? 'bg-white/80 border-black/10' : 'bg-white/[0.04] border-white/10'
            }`}
          >
            <SearchIcon size={15} className={`${tTextSub} opacity-50 shrink-0`} />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search city or country..."
              aria-label="Search cities"
              className={`w-full bg-transparent outline-none font-serif-eng text-sm placeholder:opacity-45 ${tTextMain}`}
            />
          </div>
        </div>

        {/* City List */}
        <div className="flex-1 overflow-y-auto hide-scrollbar px-5 pb-8 divide-y divide-current/[0.07]">
          {filteredCities.length === 0 ? (
            <div className="py-10 text-center">
              <p className={`font-serif-eng text-sm opacity-60 ${tTextSub}`}>
                No matching city found. Try a nearby major city or GPS.
              </p>
            </div>
          ) : (
            filteredCities.map((city) => {
              const isSelected = activeCityId === city.id;
              return (
                <button
                  key={city.id}
                  type="button"
                  onClick={() => handleSelectCity(city)}
                  className={`w-full min-h-[52px] py-3 px-2 flex items-center justify-between text-left cursor-pointer transition-colors ${
                    isLightMode ? 'hover:bg-black/[0.03]' : 'hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="flex flex-col min-w-0">
                    <span
                      className={`font-serif-eng text-[15px] leading-snug truncate ${
                        isSelected ? 'font-medium' : ''
                      }`}
                      style={{ color: isSelected ? accentHex : undefined }}
                    >
                      {city.name}
                    </span>
                    <span className={`font-serif-eng text-[11px] opacity-55 truncate ${tTextSub}`}>
                      {city.country}
                    </span>
                  </div>
                  {isSelected && <CheckCircleIcon size={17} style={{ color: accentHex }} />}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
