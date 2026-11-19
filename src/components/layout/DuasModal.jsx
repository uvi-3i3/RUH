import { useEffect, useMemo, useRef, useState } from 'react';
import { DUA_CATEGORIES, ESSENTIAL_DUAS } from '../../data/duasData';
import {
  composeGroundedDuaFallback,
  rankDuasByMoment,
  shouldShowDuaGuidance,
} from '../../utils/localAiLogic';
import { useOptionalPreferences } from '../../context/sanctuaryStore';
import {
  BookIcon,
  BookmarkIcon,
  ChevronDownIcon,
  SearchIcon,
  ShareIcon,
  SparklesIcon,
  XIcon,
} from '../icons/Icons';
import {
  hapticDetent,
  hapticDismiss,
  hapticSuccess,
  hapticTapLight,
  hapticToggle,
} from '../../utils/haptics';

export const DuasModal = ({
  isOpen,
  onClose,
  isLightMode: isLightModeProp,
  favoriteDuaIds = [],
  onToggleFavorite,
  initialQuery = '',
}) => {
  const preferencesCtx = useOptionalPreferences();
  const isLightMode = isLightModeProp ?? preferencesCtx?.isLightMode ?? false;

  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const copiedTimerRef = useRef(null);

  useEffect(() => {
    if (isOpen && initialQuery) {
      setCategory('all');
      setQuery(initialQuery);
    }
  }, [isOpen, initialQuery]);

  useEffect(() => {
    return () => {
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    };
  }, []);

  const rankedResults = useMemo(
    () =>
      rankDuasByMoment(ESSENTIAL_DUAS, {
        category,
        query,
        favoriteIds: favoriteDuaIds,
      }),
    [category, query, favoriteDuaIds]
  );

  const filteredDuas = useMemo(
    () => rankedResults.map((r) => r.item),
    [rankedResults]
  );

  const topDua = filteredDuas[0] || null;
  const wantsGuidance = isOpen && shouldShowDuaGuidance(query) && Boolean(topDua);
  const guidanceText = useMemo(
    () => (wantsGuidance && topDua ? composeGroundedDuaFallback(query, topDua) : ''),
    [wantsGuidance, query, topDua]
  );

  if (!isOpen) return null;

  const tTextMain = isLightMode ? 'text-[#1a1814]' : 'text-[rgba(245,238,224,0.95)]';
  const tTextSub = isLightMode ? 'text-[#3a3329]' : 'text-[rgba(228,218,200,0.72)]';
  const accentHex = isLightMode ? '#8a621c' : '#d2a24b';
  const tealHex = isLightMode ? '#0d9488' : '#14b8a6';

  const handleCopy = async (dua) => {
    hapticTapLight();
    const text = `${dua.arabic}\n\n${dua.transliteration}\n"${dua.translation}"\n— ${dua.source}`;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      }
      hapticSuccess();
      setCopiedId(dua.id);
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
      copiedTimerRef.current = setTimeout(() => {
        copiedTimerRef.current = null;
        setCopiedId((cur) => (cur === dua.id ? null : cur));
      }, 1800);
    } catch {
      // Ignore clipboard failures
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Hisn al-Muslim Duas Treasury"
      data-testid="duas-modal"
      className="fixed inset-0 z-[105] flex flex-col pointer-events-auto"
    >
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          background: isLightMode ? 'rgba(244,240,232,0.97)' : 'rgba(8,9,13,0.97)',
        }}
        onClick={() => {
          hapticDismiss();
          onClose?.();
        }}
      />

      <div className="relative z-10 w-full max-w-xl mx-auto h-full flex flex-col">
        {/* Header */}
        <div
          className="w-full flex items-center justify-between px-6 pb-3.5 border-b border-current/10 shrink-0"
          style={{ paddingTop: 'calc(18px + var(--sat))' }}
        >
          <div className="flex items-center gap-3">
            <BookIcon size={21} style={{ color: accentHex }} />
            <div>
              <h2 className={`font-serif-eng text-lg font-medium uppercase tracking-[0.2em] ${tTextMain}`}>
                Essential Duas
              </h2>
              <span className={`font-calligraphy text-sm opacity-75 ${tTextSub}`} dir="rtl">
                حِصْنُ الْمُسْلِم
              </span>
            </div>
          </div>

          <button
            type="button"
            aria-label="Close Duas Treasury"
            onClick={() => {
              hapticDismiss();
              onClose?.();
            }}
            className={`w-11 h-11 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
              isLightMode ? 'bg-white/75 border-black/10 text-[#3a3329]' : 'bg-white/5 border-white/12 text-white'
            }`}
          >
            <ChevronDownIcon size={20} />
          </button>
        </div>

        {/* Search & Category Tabs */}
        <div className="px-6 pt-3.5 pb-3 border-b border-current/10 shrink-0 space-y-3">
          <div
            className={`flex items-center gap-2.5 px-3.5 py-1.5 min-h-[44px] rounded-2xl border ${
              isLightMode ? 'bg-white/80 border-black/10' : 'bg-white/[0.04] border-white/10'
            }`}
          >
            <SearchIcon size={15} className={`${tTextSub} opacity-60 shrink-0`} />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search Duas by moment or feeling"
              placeholder="Ask by feeling, moment, or keyword..."
              className={`w-full bg-transparent font-serif-eng text-sm outline-none ${tTextMain} placeholder:opacity-45`}
            />
            {query && (
              <button
                type="button"
                aria-label="Clear Dua search"
                onClick={() => {
                  hapticTapLight();
                  setQuery('');
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center opacity-60 hover:opacity-100 cursor-pointer shrink-0"
              >
                <XIcon size={14} className={tTextMain} />
              </button>
            )}
          </div>

          <div
            role="tablist"
            aria-label="Dua Categories"
            className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar pb-0.5"
          >
            {DUA_CATEGORIES.map((cat) => {
              const active = category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    hapticDetent();
                    setCategory(cat.id);
                  }}
                  className={`min-h-[38px] px-3 rounded-xl font-serif-eng text-[10px] uppercase tracking-[0.14em] transition-colors cursor-pointer shrink-0 whitespace-nowrap border ${
                    active
                      ? isLightMode
                        ? 'bg-[#8a621c] text-white border-[#8a621c]'
                        : 'bg-[#d2a24b]/22 text-[#e8c67c] border-[#d2a24b]/45'
                      : isLightMode
                        ? 'bg-white/55 border-black/10 text-[#3a3329] hover:bg-white/85'
                        : 'bg-white/[0.03] border-white/10 text-[#e4dac8]/70 hover:bg-white/[0.08]'
                  }`}
                >
                  {cat.label}
                  {cat.id === 'favorites' && favoriteDuaIds.length > 0 ? ` (${favoriteDuaIds.length})` : ''}
                </button>
              );
            })}
          </div>
        </div>

        {/* Duas List */}
        <div
          className="flex-1 w-full overflow-y-auto hide-scrollbar px-6 py-4 space-y-4"
          style={{ paddingBottom: 'calc(24px + var(--sab))' }}
        >
          {/* Moment-Aware Companion Guidance Strip */}
          {guidanceText && (
            <div
              data-testid="dua-guidance-strip"
              className={`w-full rounded-[20px] border p-4 transition-colors ${
                isLightMode
                  ? 'bg-[#0d9488]/[0.06] border-[#0d9488]/22'
                  : 'bg-[#14b8a6]/[0.07] border-[#14b8a6]/25'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <SparklesIcon size={13} style={{ color: tealHex }} />
                <span
                  className="font-serif-eng text-[9.5px] uppercase tracking-[0.18em] font-medium"
                  style={{ color: tealHex }}
                >
                  For This Moment
                </span>
              </div>
              <p className={`font-serif-eng text-[13px] leading-relaxed ${tTextMain}`}>
                {guidanceText}
              </p>
            </div>
          )}

          {filteredDuas.length === 0 ? (
            <div className="py-12 text-center">
              <p className={`font-serif-eng italic text-sm ${tTextSub}`}>
                {category === 'favorites'
                  ? 'No saved Duas yet. Tap the bookmark on any supplication to keep it close.'
                  : 'No supplications matched your search.'}
              </p>
            </div>
          ) : (
            filteredDuas.map((dua) => {
              const isFav = favoriteDuaIds.includes(dua.id);
              const isCopied = copiedId === dua.id;
              return (
                <article
                  key={dua.id}
                  className={`w-full rounded-[22px] border p-5 transition-colors ${
                    isLightMode
                      ? 'bg-white/75 border-black/10 shadow-xs'
                      : 'bg-white/[0.035] border-white/[0.1]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className={`font-serif-eng text-base font-medium ${tTextMain}`}>
                        {dua.title}
                      </h3>
                      <p className={`font-serif-eng text-[11px] ${tTextSub} opacity-75 mt-0.5`}>
                        {dua.moment}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        aria-label={isFav ? `Remove ${dua.title} from saved Duas` : `Save ${dua.title}`}
                        onClick={() => {
                          hapticToggle(!isFav);
                          onToggleFavorite?.(dua.id);
                        }}
                        className={`min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                          isLightMode ? 'hover:bg-black/5' : 'hover:bg-white/[0.07]'
                        }`}
                        style={{ color: isFav ? accentHex : undefined }}
                      >
                        <BookmarkIcon size={16} filled={isFav} className={isFav ? '' : `${tTextSub} opacity-60`} />
                      </button>
                      <button
                        type="button"
                        aria-label={`Copy ${dua.title}`}
                        onClick={() => handleCopy(dua)}
                        className={`min-w-[44px] min-h-[44px] px-2 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                          isLightMode ? 'hover:bg-black/5' : 'hover:bg-white/[0.07]'
                        }`}
                        style={{ color: isCopied ? accentHex : undefined }}
                      >
                        {isCopied ? (
                          <span className="font-serif-eng text-[9px] uppercase tracking-widest">Copied</span>
                        ) : (
                          <ShareIcon size={15} className={`${tTextSub} opacity-65`} />
                        )}
                      </button>
                    </div>
                  </div>

                  <p
                    className={`font-arabic text-[22px] leading-[2.05] text-right my-3 ${tTextMain}`}
                    dir="rtl"
                  >
                    {dua.arabic}
                  </p>

                  <p
                    className="font-serif-eng text-[12.5px] leading-relaxed mb-2"
                    style={{ color: accentHex }}
                  >
                    {dua.transliteration}
                  </p>

                  <p className={`font-serif-eng italic text-[13.5px] leading-relaxed ${tTextSub}`}>
                    “{dua.translation}”
                  </p>

                  <p className={`font-serif-eng text-[10px] uppercase tracking-[0.14em] mt-3 opacity-65 ${tTextSub}`}>
                    {dua.source}
                  </p>
                </article>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
