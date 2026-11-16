import { useMemo, useState } from 'react';
import { computeQadaTotals } from '../../utils/devotionLogic';
import { CheckCircleIcon, ChevronDownIcon, EditIcon } from '../icons/Icons';

const PRAYER_ROWS = [
  { id: 'fajr', label: 'Fajr', arabic: 'فَجْر' },
  { id: 'dhuhr', label: 'Dhuhr', arabic: 'ظُهْر' },
  { id: 'asr', label: 'Asr', arabic: 'عَصْر' },
  { id: 'maghrib', label: 'Maghrib', arabic: 'مَغْرِب' },
  { id: 'isha', label: 'Isha', arabic: 'عِشَاء' },
  { id: 'fasts', label: 'Fasting Days', arabic: 'صَوْم' },
];

export const QadaModal = ({
  isOpen,
  onClose,
  isLightMode,
  qada,
  onSetCount,
  onBulkAddYears,
  onCompleteOne,
}) => {
  const [editing, setEditing] = useState(false);

  const totals = useMemo(() => computeQadaTotals(qada), [qada]);

  if (!isOpen) return null;

  const tTextMain = isLightMode ? 'text-[#1a1814]' : 'text-[rgba(245,238,224,0.95)]';
  const tTextSub = isLightMode ? 'text-[#3a3329]' : 'text-[rgba(228,218,200,0.72)]';
  const accentHex = isLightMode ? '#8a621c' : '#d2a24b';

  const getValueFor = (id) =>
    id === 'fasts' ? totals.fasts : totals.prayers[id] || 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Qada Make-Up Ledger"
      data-testid="qada-modal"
      className="fixed inset-0 z-[105] flex flex-col pointer-events-auto"
    >
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          background: isLightMode ? 'rgba(244,240,232,0.96)' : 'rgba(8,9,13,0.96)',
          backdropFilter: 'blur(24px)',
        }}
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-xl mx-auto h-full flex flex-col">
        {/* Header */}
        <div className="w-full flex items-center justify-between px-6 pt-7 pb-4 border-b border-current/10 shrink-0">
          <div>
            <h2 className={`font-serif-eng text-lg font-medium uppercase tracking-[0.2em] ${tTextMain}`}>
              Qada Ledger
            </h2>
            <p className={`font-serif-eng text-xs opacity-75 mt-0.5 ${tTextSub}`}>
              Make-up prayers &amp; fasts · steady mercy, zero overwhelm
            </p>
          </div>

          <button
            type="button"
            aria-label="Close Qada Ledger"
            onClick={onClose}
            className={`w-11 h-11 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
              isLightMode ? 'bg-white/75 border-black/10 text-[#3a3329]' : 'bg-white/5 border-white/12 text-white'
            }`}
          >
            <ChevronDownIcon size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 w-full overflow-y-auto hide-scrollbar px-6 py-5 space-y-4">
          {/* Summary Card */}
          <div
            className={`w-full rounded-[24px] border p-5 ${
              isLightMode ? 'bg-white/80 border-black/10 shadow-xs' : 'bg-white/[0.04] border-white/[0.1]'
            }`}
          >
            <div className="grid grid-cols-3 divide-x divide-current/10 text-center">
              <div className="px-2">
                <div className={`font-serif-eng text-2xl font-light tabular-nums ${tTextMain}`}>
                  {totals.remainingPrayers}
                </div>
                <div className={`font-serif-eng text-[9px] uppercase tracking-[0.16em] opacity-70 mt-1 ${tTextSub}`}>
                  Prayers Left
                </div>
              </div>
              <div className="px-2">
                <div className={`font-serif-eng text-2xl font-light tabular-nums ${tTextMain}`}>
                  {totals.fasts}
                </div>
                <div className={`font-serif-eng text-[9px] uppercase tracking-[0.16em] opacity-70 mt-1 ${tTextSub}`}>
                  Fasts Left
                </div>
              </div>
              <div className="px-2">
                <div className="font-serif-eng text-2xl font-light tabular-nums" style={{ color: accentHex }}>
                  {totals.completedTotal}
                </div>
                <div className={`font-serif-eng text-[9px] uppercase tracking-[0.16em] opacity-70 mt-1 ${tTextSub}`}>
                  Made Up
                </div>
              </div>
            </div>

            {totals.completedTotal + totals.totalRemaining > 0 && (
              <div className="mt-4">
                <div className="flex justify-between text-[10px] font-serif-eng uppercase tracking-[0.14em] mb-1.5">
                  <span className={`${tTextSub} opacity-75`}>Journey Completion</span>
                  <span className="tabular-nums font-medium" style={{ color: accentHex }}>
                    {totals.completionPct}%
                  </span>
                </div>
                <div className={`w-full h-1.5 rounded-full overflow-hidden ${isLightMode ? 'bg-black/10' : 'bg-white/10'}`}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${totals.completionPct}%`, backgroundColor: accentHex }}
                  />
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-current/10">
              <button
                type="button"
                onClick={() => setEditing((e) => !e)}
                className={`min-h-[38px] px-3 rounded-xl border font-serif-eng text-[10px] uppercase tracking-[0.15em] flex items-center gap-1.5 cursor-pointer transition-colors ${
                  editing
                    ? isLightMode
                      ? 'bg-[#8a621c] text-white border-[#8a621c]'
                      : 'bg-[#d2a24b]/22 text-[#e8c67c] border-[#d2a24b]/45'
                    : isLightMode
                      ? 'border-black/15 text-[#3a3329] hover:bg-black/5'
                      : 'border-white/15 text-[#e4dac8] hover:bg-white/5'
                }`}
              >
                <EditIcon size={13} />
                <span>{editing ? 'Done Editing' : 'Set Starting Counts'}</span>
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onBulkAddYears?.(1)}
                  className={`min-h-[38px] px-3 rounded-xl border font-serif-eng text-[10px] uppercase tracking-[0.14em] cursor-pointer transition-colors ${
                    isLightMode
                      ? 'border-black/15 text-[#3a3329] hover:bg-black/5'
                      : 'border-white/15 text-[#e4dac8] hover:bg-white/5'
                  }`}
                >
                  +1 Year
                </button>
              </div>
            </div>
          </div>

          {/* Individual Prayer & Fast Rows */}
          <div
            className={`w-full rounded-[24px] border divide-y overflow-hidden ${
              isLightMode
                ? 'bg-white/80 border-black/10 divide-black/[0.06] shadow-xs'
                : 'bg-white/[0.04] border-white/[0.1] divide-white/[0.06]'
            }`}
          >
            {PRAYER_ROWS.map((row) => {
              const count = getValueFor(row.id);
              return (
                <div key={row.id} className="px-4 py-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="font-arabic text-lg leading-none w-10 text-right shrink-0"
                      style={{ color: accentHex }}
                      dir="rtl"
                    >
                      {row.arabic}
                    </span>
                    <div className="min-w-0">
                      <div className={`font-serif-eng text-sm font-medium ${tTextMain}`}>{row.label}</div>
                      <div className={`font-serif-eng text-[11px] tabular-nums ${tTextSub} opacity-75`}>
                        {count} remaining
                      </div>
                    </div>
                  </div>

                  {editing ? (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        aria-label={`Decrease ${row.label} remaining`}
                        onClick={() => onSetCount?.(row.id, Math.max(0, count - 1))}
                        className={`w-9 h-9 rounded-xl border flex items-center justify-center text-sm cursor-pointer ${
                          isLightMode ? 'border-black/15 text-[#1a1814]' : 'border-white/15 text-white'
                        }`}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="0"
                        aria-label={`${row.label} starting remaining count`}
                        value={count}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => onSetCount?.(row.id, e.target.value)}
                        className={`w-16 h-9 text-center font-serif-eng text-sm tabular-nums rounded-xl border bg-transparent outline-none ${
                          isLightMode ? 'border-black/15 text-[#1a1814]' : 'border-white/15 text-white'
                        }`}
                      />
                      <button
                        type="button"
                        aria-label={`Increase ${row.label} remaining`}
                        onClick={() => onSetCount?.(row.id, count + 1)}
                        className={`w-9 h-9 rounded-xl border flex items-center justify-center text-sm cursor-pointer ${
                          isLightMode ? 'border-black/15 text-[#1a1814]' : 'border-white/15 text-white'
                        }`}
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={count <= 0}
                      onClick={() => onCompleteOne?.(row.id)}
                      className={`min-h-[40px] px-3.5 rounded-xl font-serif-eng text-[10px] uppercase tracking-[0.16em] flex items-center gap-1.5 transition-all shrink-0 ${
                        count <= 0
                          ? 'opacity-30 cursor-default border border-current/15'
                          : 'cursor-pointer active:scale-95'
                      }`}
                      style={
                        count > 0
                          ? {
                              backgroundColor: isLightMode ? '#8a621c' : 'rgba(210,162,75,0.2)',
                              color: isLightMode ? '#ffffff' : '#e8c67c',
                              border: isLightMode ? 'none' : '1px solid rgba(210,162,75,0.45)',
                            }
                          : undefined
                      }
                    >
                      <CheckCircleIcon size={13} />
                      <span>+1 Made Up</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
