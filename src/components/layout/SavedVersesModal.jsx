import { useState, useMemo } from 'react';
import { ChevronDownIcon, BookmarkIcon, ShareIcon, EditIcon, TrashIcon, CheckCircleIcon } from '../icons/Icons';
import { resolveVerseCopy } from '../../utils/devotionLogic';

const SearchIcon = ({ size = 16, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const FILTER_OPTIONS = ['All', 'Quran', 'Hadith', 'Hikmah'];
const SORT_OPTIONS = [
  { key: 'newest', label: 'Newest' },
  { key: 'oldest', label: 'Oldest' },
  { key: 'station', label: 'By Station' },
];

const stripDiacritics = (str) => str.replace(/[\u0610-\u061A\u064B-\u065F\u0670]/g, '');
const normalize = (str) => stripDiacritics(str).toLowerCase().trim();

export const SavedVersesModal = ({
  isOpen,
  onClose,
  isLightMode,
  savedVerses,
  allVerses,
  isSimpleMode = false,
  onEditNote,
  onRemoveSaved,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [sortKey, setSortKey] = useState('newest');
  const [copiedId, setCopiedId] = useState(null);

  const savedIds = useMemo(() => (savedVerses || []).map((v) => v.id), [savedVerses]);

  const savedVersesData = useMemo(() => {
    if (!allVerses || !savedVerses) return [];
    let results = allVerses
      .filter((v) => savedIds.includes(v.id))
      .map((v) => {
        const savedEntry = savedVerses.find((sv) => sv.id === v.id);
        return {
          ...v,
          reflection: savedEntry?.note || '',
          timestamp: savedEntry?.timestamp || 0,
        };
      });

    if (activeFilter !== 'All') {
      const filterLower = activeFilter.toLowerCase();
      results = results.filter((v) => (v.type || '').toLowerCase() === filterLower);
    }

    if (searchQuery.trim()) {
      const q = normalize(searchQuery);
      results = results.filter(
        (v) =>
          normalize(v.a || '').includes(q) ||
          (v.t || '').toLowerCase().includes(q) ||
          (v.s || '').toLowerCase().includes(q) ||
          (v.reflection || '').toLowerCase().includes(q)
      );
    }

    if (sortKey === 'newest') {
      results.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    } else if (sortKey === 'oldest') {
      results.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
    }

    return results;
  }, [allVerses, savedVerses, savedIds, activeFilter, searchQuery, sortKey]);

  if (!isOpen) return null;

  const tBg = isLightMode ? 'bg-[#f4f0e8]/95' : 'bg-[#080706]/95';
  const tTextMain = isLightMode ? 'text-[#1a1814]' : 'text-[rgba(245,238,224,0.92)]';
  const tTextSub = isLightMode ? 'text-[#4a453d]' : 'text-[rgba(228,218,200,0.6)]';
  const glowSub = isLightMode ? '0 1px 1px rgba(255,255,255,0.6)' : '0 1px 1px rgba(0,0,0,0.8)';
  const accent = isLightMode ? '#9c7533' : '#d2a24b';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Archived Memories"
      className="fixed inset-0 z-[90] flex flex-col justify-end items-center pointer-events-auto"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div
        className={`relative z-10 flex flex-col w-full max-w-2xl h-[86dvh] rounded-t-3xl backdrop-blur-2xl border-t transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isLightMode
            ? 'border-black/10 shadow-[0_-10px_40px_rgba(0,0,0,0.08)]'
            : 'border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.85)]'
        } ${tBg}`}
      >
        {/* Header */}
        <div className="w-full flex items-center justify-between px-6 pt-5 pb-4 border-b border-current/10 shrink-0">
          <div>
            <h2
              className={`font-serif-eng text-lg font-medium tracking-[0.2em] uppercase ${tTextMain}`}
              style={{ textShadow: glowSub }}
            >
              Saved Reflections
            </h2>
            <p className={`font-serif-eng text-xs ${tTextSub}`}>
              {savedVerses.length} {savedVerses.length === 1 ? 'verse' : 'verses'} anchored in your sanctuary
            </p>
          </div>
          <button
            type="button"
            aria-label="Close Saved Reflections"
            onClick={onClose}
            className={`w-11 h-11 rounded-full flex items-center justify-center border transition-opacity cursor-pointer ${
              isLightMode ? 'border-black/10 hover:bg-black/5' : 'border-white/10 hover:bg-white/5'
            } ${tTextMain}`}
          >
            <ChevronDownIcon size={20} />
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div className="px-6 pt-4 pb-3 flex flex-col gap-3 shrink-0">
          <div
            className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border transition-all ${
              isLightMode ? 'bg-white/60 border-black/10' : 'bg-white/5 border-white/10'
            }`}
          >
            <SearchIcon size={15} className={`${tTextSub} opacity-60 shrink-0`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Arabic, translation, or reflection notes..."
              aria-label="Search saved verses"
              className={`bg-transparent outline-none w-full font-serif-eng text-sm tracking-wide placeholder:opacity-50 ${tTextMain}`}
            />
            {searchQuery && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearchQuery('')}
                className={`${tTextSub} opacity-60 hover:opacity-100 text-xs shrink-0 px-1`}
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex gap-1.5 overflow-x-auto hide-scrollbar">
              {FILTER_OPTIONS.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setActiveFilter(f)}
                  className={`font-serif-eng text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap cursor-pointer ${
                    activeFilter === f
                      ? 'border-current bg-current/10 font-medium'
                      : isLightMode
                        ? 'border-black/10 hover:border-black/20'
                        : 'border-white/10 hover:border-white/20'
                  }`}
                  style={
                    activeFilter === f
                      ? { color: accent }
                      : { color: isLightMode ? '#4a453d' : 'rgba(228,218,200,0.65)' }
                  }
                >
                  {f}
                </button>
              ))}
            </div>
            <select
              aria-label="Sort saved verses"
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
              className={`font-serif-eng text-[10px] uppercase tracking-widest px-2.5 py-1.5 rounded-lg border bg-transparent outline-none cursor-pointer ${
                isLightMode ? 'border-black/10 text-[#4a453d]' : 'border-white/10 text-[rgba(228,218,200,0.65)]'
              }`}
            >
              {SORT_OPTIONS.map((s) => (
                <option key={s.key} value={s.key} className="bg-[#1a1814] text-white">
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* List */}
        <div className="flex-grow w-full overflow-y-auto px-6 pb-12 hide-scrollbar flex flex-col gap-4 pt-2">
          {savedVersesData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 opacity-60">
              <BookmarkIcon size={36} className="mb-3" style={{ color: accent }} />
              <p className={`font-serif-eng text-base ${tTextMain} text-center mb-1`}>
                {searchQuery || activeFilter !== 'All' ? 'No matching verses found' : 'Your archive is quiet'}
              </p>
              <p className={`font-serif-eng text-xs ${tTextSub} text-center max-w-[260px] leading-relaxed`}>
                {searchQuery || activeFilter !== 'All'
                  ? 'Try adjusting your search or category filter.'
                  : 'Tap "Reflect" or double-tap any verse in the Sanctuary to anchor it here with your personal notes.'}
              </p>
            </div>
          ) : (
            savedVersesData.map((verse) => {
              const isHikmah = verse.type === 'hikmah';
              const itemAccent = isHikmah
                ? isLightMode
                  ? '#0d9488'
                  : '#14b8a6'
                : accent;
              const { translation } = resolveVerseCopy(verse, isSimpleMode);

              return (
                <div
                  key={verse.id}
                  className={`flex flex-col w-full p-6 rounded-3xl border ${
                    isLightMode ? 'bg-white/60 border-black/[0.08] shadow-xs' : 'bg-white/[0.03] border-white/10'
                  }`}
                >
                  <p className={`font-arabic text-2xl leading-[2.0] text-center mb-3 ${tTextMain}`} dir="rtl">
                    {verse.a}
                  </p>
                  <div className="w-full flex justify-center mb-3">
                    <div className="w-16 h-[1px] opacity-30" style={{ backgroundColor: itemAccent }} />
                  </div>
                  <p className={`font-serif-eng italic font-light text-sm leading-[1.8] text-center mb-4 ${tTextSub}`}>
                    {translation}
                  </p>

                  {verse.reflection && (
                    <div
                      className={`w-full p-4 mb-4 rounded-2xl border ${
                        isLightMode ? 'bg-black/[0.03] border-black/10' : 'bg-white/[0.03] border-white/10'
                      }`}
                    >
                      <p className={`font-serif-eng text-sm leading-relaxed text-center italic ${tTextMain}`}>
                        “{verse.reflection}”
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-current/10">
                    {/* Clean unboxed metadata */}
                    <div className="flex items-center gap-2 text-[10px] font-serif-eng uppercase tracking-[0.2em]">
                      {verse.type && <span style={{ color: itemAccent }}>{verse.type}</span>}
                      {verse.type && <span aria-hidden="true" className={tTextSub}>·</span>}
                      <span className={tTextSub}>{verse.s}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label={`Edit reflection for ${verse.s}`}
                        onClick={() => onEditNote && onEditNote(verse.id)}
                        className={`px-3 py-1.5 rounded-lg border text-[10px] font-serif-eng uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer ${
                          isLightMode
                            ? 'border-black/10 hover:bg-black/5 text-[#4a453d]'
                            : 'border-white/10 hover:bg-white/10 text-[#e4dac8]'
                        }`}
                      >
                        <EditIcon size={12} />
                        <span>{verse.reflection ? 'Edit Note' : 'Add Note'}</span>
                      </button>

                      <button
                        type="button"
                        aria-label={`Share ${verse.s}`}
                        onClick={() => {
                          const textToShare = `${verse.a}\n\n${translation}\n\n— ${verse.s}${
                            verse.reflection ? `\n\nReflection:\n${verse.reflection}` : ''
                          }`;
                          if (navigator.share) {
                            navigator.share({ title: 'Ruh Reflections', text: textToShare }).catch(() => {});
                          } else if (navigator.clipboard) {
                            navigator.clipboard
                              .writeText(textToShare)
                              .then(() => {
                                setCopiedId(verse.id);
                                setTimeout(() => setCopiedId((prev) => (prev === verse.id ? null : prev)), 1800);
                              })
                              .catch(() => {});
                          }
                        }}
                        className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
                          isLightMode
                            ? 'border-black/10 hover:bg-black/5 text-[#4a453d]'
                            : 'border-white/10 hover:bg-white/10 text-[#e4dac8]'
                        }`}
                      >
                        {copiedId === verse.id ? (
                          <CheckCircleIcon size={13} style={{ color: itemAccent }} />
                        ) : (
                          <ShareIcon size={13} />
                        )}
                      </button>

                      {onRemoveSaved && (
                        <button
                          type="button"
                          aria-label={`Remove ${verse.s} from saved`}
                          onClick={() => onRemoveSaved(verse.id)}
                          className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
                            isLightMode
                              ? 'border-black/10 hover:bg-red-500/10 text-[#4a453d] hover:text-red-700'
                              : 'border-white/10 hover:bg-red-500/10 text-[#e4dac8]/70 hover:text-red-400'
                          }`}
                        >
                          <TrashIcon size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
