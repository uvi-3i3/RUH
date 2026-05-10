import { useState, useMemo } from 'react';
import { ChevronDownIcon, BookmarkIcon, ShareIcon, EditIcon } from '../icons/Icons';

// UX-04: Search icon component
const SearchIcon = ({ size = 16, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const FILTER_OPTIONS = ['All', 'Quran', 'Hadith', 'Hikmah'];
const SORT_OPTIONS = [
  { key: 'newest', label: 'Newest' },
  { key: 'oldest', label: 'Oldest' },
  { key: 'station', label: 'By Station' },
];

// BUG-15: Strip Arabic diacritics (tashkeel) for search comparison
const stripDiacritics = (str) => str.replace(/[\u0610-\u061A\u064B-\u065F\u0670]/g, '');
const normalize = (str) => stripDiacritics(str).toLowerCase().trim();

export const SavedVersesModal = ({ isOpen, onClose, isLightMode, savedVerses, allVerses, isSimpleMode, onEditNote }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [sortKey, setSortKey] = useState('newest');

  if (!allVerses || !savedVerses) return null;

  // PERF-05: Memoize savedIds from savedVerses
  const savedIds = useMemo(() => savedVerses.map(v => v.id), [savedVerses]);
  
  // Build enriched saved verse data
  const savedVersesData = useMemo(() => {
    let results = allVerses.filter(v => savedIds.includes(v.id)).map(v => {
      const savedEntry = savedVerses.find(sv => sv.id === v.id);
      return {
        ...v,
        reflection: savedEntry?.note || '',
        timestamp: savedEntry?.timestamp || 0,
      };
    });

    // Filter by type
    if (activeFilter !== 'All') {
      const filterLower = activeFilter.toLowerCase();
      results = results.filter(v => (v.type || '').toLowerCase() === filterLower);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = normalize(searchQuery);
      results = results.filter(v =>
        normalize(v.a || '').includes(q) ||
        (v.t || '').toLowerCase().includes(q) ||
        (v.s || '').toLowerCase().includes(q) ||
        (v.reflection || '').toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortKey === 'newest') {
      results.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    } else if (sortKey === 'oldest') {
      results.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
    }
    // 'station' keeps the natural allVerses order (already grouped by station)

    return results;
  }, [allVerses, savedVerses, savedIds, activeFilter, searchQuery, sortKey]);

  const tBg = isLightMode ? 'bg-[#f4f0e8]/90' : 'bg-[#060504]/90';
  const tTextMain = isLightMode ? 'text-[#1a1814]' : 'text-[rgba(245,238,224,0.92)]';
  const tTextSub = isLightMode ? 'text-[#4a453d]' : 'text-[rgba(228,218,200,0.48)]';
  const glowSub = isLightMode ? '0 1px 1px rgba(255,255,255,0.6)' : '0 1px 1px rgba(0,0,0,0.8)';
  const accentLight = '#9c7533';
  const accentDark = '#d2a24b';
  const accent = isLightMode ? accentLight : accentDark;

  return (
    <div 
      className={`absolute inset-x-0 bottom-0 z-50 flex flex-col w-full h-[85dvh] rounded-t-[40px] backdrop-blur-[40px] border-t transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]
        ${isLightMode ? 'border-white/50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]' : 'border-white/10 shadow-[0_-10px_30px_rgba(0,0,0,0.8)]'}
        ${tBg}
      `}
      style={{ transform: isOpen ? 'translateY(0%)' : 'translateY(100%)', pointerEvents: isOpen ? 'auto' : 'none' }}
    >
      {/* Header */}
      <div className="w-full flex flex-col items-center justify-center pt-6 pb-3 relative cursor-pointer" onClick={onClose}>
        <div className={`w-12 h-1.5 rounded-full mb-5 opacity-30 ${isLightMode ? 'bg-[#1a1814]' : 'bg-white'}`} />
        <h2 className={`font-serif-eng text-lg font-medium tracking-widest uppercase ${tTextMain}`} style={{ textShadow: glowSub }}>Archived Memories</h2>
        <button onClick={onClose} className={`absolute right-6 top-8 p-2 rounded-full opacity-60 hover:opacity-100 transition-opacity ${tTextMain}`}>
          <ChevronDownIcon size={20} />
        </button>
      </div>

      {/* UX-04: Search Bar */}
      <div className="px-6 pb-2" onClick={(e) => e.stopPropagation()}>
        <div className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border backdrop-blur-md transition-all duration-500
          ${isLightMode ? 'bg-white/40 border-white/60' : 'bg-white/5 border-white/10'}
        `}>
          <SearchIcon size={14} className={`${tTextSub} opacity-60 flex-shrink-0`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search verses, notes..."
            className={`bg-transparent outline-none w-full font-serif-eng text-[13px] tracking-wide placeholder:opacity-40
              ${tTextMain}
            `}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className={`${tTextSub} opacity-60 hover:opacity-100 text-xs flex-shrink-0`}>✕</button>
          )}
        </div>
      </div>

      {/* UX-04: Filter Chips + Sort */}
      <div className="px-6 pb-3 flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
        <div className="flex gap-1.5 overflow-x-auto hide-scrollbar">
          {FILTER_OPTIONS.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`font-serif-eng text-[9px] uppercase tracking-widest px-3 py-1.5 rounded-full border transition-all duration-300 whitespace-nowrap
                ${activeFilter === f
                  ? `border-current bg-current/10`
                  : (isLightMode ? 'border-black/10 hover:border-black/20' : 'border-white/10 hover:border-white/20')
                }
              `}
              style={activeFilter === f ? { color: accent } : { color: isLightMode ? '#4a453d' : 'rgba(228,218,200,0.48)' }}
            >
              {f}
            </button>
          ))}
        </div>
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value)}
          className={`font-serif-eng text-[9px] uppercase tracking-widest px-2 py-1.5 rounded-full border bg-transparent outline-none cursor-pointer
            ${isLightMode ? 'border-black/10 text-[#4a453d]' : 'border-white/10 text-[rgba(228,218,200,0.48)]'}
          `}
        >
          {SORT_OPTIONS.map(s => (
            <option key={s.key} value={s.key} className="bg-[#1a1814] text-white">{s.label}</option>
          ))}
        </select>
      </div>

      {/* List */}
      <div className="flex-grow w-full overflow-y-auto px-6 pb-20 hide-scrollbar flex flex-col gap-6 pt-2">
        {savedVersesData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-40 mt-10">
            <BookmarkIcon size={40} className={`mb-4 ${isLightMode ? 'text-[#9c7533]' : 'text-[#d2a24b]'}`} />
            <p className={`font-serif-eng text-sm ${tTextSub} text-center max-w-[200px] leading-relaxed tracking-wide`}>
              {searchQuery || activeFilter !== 'All' 
                ? 'No matching verses found.' 
                : 'Double tap a verse in the main view to anchor it here forever.'}
            </p>
          </div>
        ) : (
          savedVersesData.map((verse) => {
            const isHikmah = verse.type === 'hikmah';
            
            const cBaseLight = isHikmah ? '#0d9488' : '#9c7533';
            const cBaseDark = isHikmah ? '#14b8a6' : '#d2a24b';
            
            const tTextCode = isLightMode 
               ? (isHikmah ? 'text-[#0d9488]' : 'text-[#9c7533]') 
               : (isHikmah ? 'text-[#14b8a6]' : 'text-[#d2a24b]');
               
            const tagClass = isLightMode
               ? (isHikmah ? 'text-[#0d9488] border-[#0d9488]/30 bg-[#0d9488]/5' : 'text-[#9c7533] border-[#9c7533]/30 bg-[#9c7533]/5')
               : (isHikmah ? 'text-[#14b8a6] border-[#14b8a6]/30 bg-[#14b8a6]/5' : 'text-[#d2a24b] border-[#d2a24b]/30 bg-[#d2a24b]/5');
               
            const borderGlowClass = isHikmah 
               ? (isLightMode ? 'border-[#0d9488]/20 shadow-[0_0_15px_rgba(13,148,136,0.1)]' : 'border-[#14b8a6]/20 shadow-[0_0_15px_rgba(20,184,166,0.1)]')
               : '';

            return (
              <div key={verse.id} className={`flex flex-col w-full p-6 rounded-[24px] border ${isLightMode ? 'bg-white/40 border-white/60 shadow-sm' : 'bg-white/5 border-white/10'} ${borderGlowClass}`}>
                 <p className={`font-arabic text-2xl leading-[2.1] text-center mb-4 ${tTextMain}`} dir="rtl">{verse.a}</p>
                 <div className="w-full flex justify-center mb-4">
                   <div className="w-[85%] h-[1px] opacity-30" style={{ backgroundColor: isLightMode ? cBaseLight : cBaseDark }} />
                 </div>
                 <p className={`font-serif-eng italic font-light text-[13px] leading-[1.8] text-center mb-6 cursor-text select-text ${tTextSub}`}>{verse.t}</p>
                 
                 {verse.reflection && (
                   <div className={`w-full p-4 mb-6 rounded-[16px] border ${isLightMode ? 'bg-[#1a1814]/5 border-[#1a1814]/10' : 'bg-white/5 border-white/10'}`}>
                     <p className={`font-serif-eng text-sm leading-relaxed text-center italic opacity-80 ${tTextMain}`}>
                       "{verse.reflection}"
                     </p>
                   </div>
                 )}

                 <div className="flex flex-col items-center gap-2">
                   {verse.type && (
                     <span className={`font-serif-eng text-[7px] border px-1.5 py-0.5 rounded-full uppercase tracking-widest ${tagClass}`}>
                       {verse.type}
                     </span>
                   )}
                   <span className={`font-serif-eng text-[9px] uppercase tracking-[0.25em] text-center mb-2 ${tTextCode}`}>{verse.s}</span>
                   
                   <div className="flex items-center gap-4 mt-2">
                     <button onClick={() => onEditNote && onEditNote(verse.id)} className={`p-2 rounded-full border border-current opacity-40 hover:opacity-100 transition-all ${tTextSub}`}>
                       <EditIcon size={14} />
                     </button>
                     <button onClick={() => {
                       const textToShare = `${verse.a}\n\n${verse.t}\n\n- ${verse.s}${verse.reflection ? `\n\nReflection:\n${verse.reflection}` : ''}`;
                       if (navigator.share) {
                         navigator.share({ title: 'Ruh Reflections', text: textToShare }).catch(() => {});
                       } else {
                         navigator.clipboard.writeText(textToShare);
                       }
                     }} className={`p-2 rounded-full border border-current opacity-40 hover:opacity-100 transition-all ${tTextSub}`}>
                       <ShareIcon size={14} />
                     </button>
                   </div>
                 </div>
              </div>
            )
          })
        )}
      </div>

    </div>
  );
};
