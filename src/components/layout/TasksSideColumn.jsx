import { memo, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useHabits, usePreferences } from '../../context/sanctuaryStore';
import { computeTodaySummary } from '../../utils/habitLogic';
import { PlusIcon, SparklesIcon, TrashIcon, XIcon } from '../icons/Icons';
import {
  hapticCelebrate,
  hapticDestructive,
  hapticDismiss,
  hapticNavigate,
  hapticSuccess,
  hapticTapLight,
  hapticTaskComplete,
  hapticUndo,
} from '../../utils/haptics';
import { playTaskTickOffCue } from '../../utils/tactileAudio';

/**
 * Bottom-Left Sanctuary Dock Twin (mirroring Qibla on bottom-right) +
 * Unfurling Illuminated-Thread Ledger for Today's Intentions.
 *
 * At rest, occupies only a quiet 44x56px glass tile at bottom-left, keeping
 * the entire left vertical margin open and serene for the centered Prophetic
 * Line Artwork. On tap, an illuminated ledger unfurls upward from the anchor
 * with a vertical golden thread and diamond beads that light up task by task.
 */
export const TasksSideColumn = memo(({
  isVisible = true,
  isOpen = false,
  onOpen,
  onClose,
  accentColor = '#d4af37',
}) => {
  const { isLightMode } = usePreferences();
  const { dailyTodos, addDailyTodo, toggleDailyTodo, removeDailyTodo } = useHabits();

  const [isAdding, setIsAdding] = useState(false);
  const [newTodoText, setNewTodoText] = useState('');

  const summary = useMemo(
    () => computeTodaySummary({ dailyTodos }),
    [dailyTodos]
  );

  const handleToggleTodo = (todo) => {
    if (!todo) return;
    if (todo.completed) {
      hapticUndo();
    } else if (summary.completedTodos + 1 >= summary.totalTodos) {
      hapticCelebrate();
      playTaskTickOffCue({ kind: 'quest' });
    } else {
      hapticTaskComplete();
      playTaskTickOffCue({ kind: 'quest' });
    }
    toggleDailyTodo(todo.id);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const trimmed = newTodoText.trim();
    if (!trimmed) return;
    hapticSuccess();
    addDailyTodo(trimmed);
    setNewTodoText('');
    setIsAdding(false);
  };

  const handleRemoveTodo = (e, todoId) => {
    e.stopPropagation();
    hapticDestructive();
    removeDailyTodo(todoId);
  };

  // Miniature progress ring inside the 44x56 bottom-left dock tile
  const r = 10.5;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(1, Math.max(0, summary.percentage / 100));
  const dashOffset = circ * (1 - pct);
  const allDone = summary.allCompleted;

  const goldAccent = isLightMode ? '#9c7533' : accentColor || '#e4c078';
  const goldBright = isLightMode ? '#b08330' : '#f2d594';

  const ledgerSurface = isLightMode
    ? 'bg-[#f6f1e7]/94 border-[#9c7533]/24 text-[#1a1814] shadow-[0_22px_56px_rgba(24,18,10,0.20),inset_0_1px_0_rgba(255,255,255,0.9)]'
    : 'bg-[#090d18]/92 border-[#f0e6d2]/14 text-[#f5eee0] shadow-[0_24px_62px_rgba(0,0,0,0.72),inset_0_1px_0_rgba(255,255,255,0.08)]';

  const mutedText = isLightMode ? 'text-[#6c6150]' : 'text-[#e8decb]/56';
  const hairlineBorder = isLightMode ? 'border-[#1e1b18]/10' : 'border-white/10';
  const threadTrack = isLightMode ? 'rgba(54, 46, 36, 0.16)' : 'rgba(240, 230, 210, 0.14)';

  return (
    <>
      {/* BOTTOM-LEFT DOCK TILE (Exact architectural mirror of bottom-right Qibla dock) */}
      <button
        type="button"
        data-testid="today-dock-trigger"
        aria-label={`Open Today's Intentions (${summary.completedTodos} of ${summary.totalTodos} completed)`}
        aria-expanded={isOpen}
        aria-hidden={!isVisible || isOpen || undefined}
        tabIndex={isVisible && !isOpen ? 0 : -1}
        onClick={() => {
          hapticNavigate();
          onOpen?.();
        }}
        style={{ bottom: 'calc(67px + var(--sab))' }}
        className={`group absolute left-3 sm:left-6 w-[44px] h-[56px] rounded-2xl border flex flex-col items-center justify-center gap-1 transition-[transform,opacity,background-color,border-color] duration-300 active:scale-[0.97] cursor-pointer z-30 ${
          isVisible && !isOpen
            ? 'opacity-100 scale-100 pointer-events-auto'
            : 'opacity-0 scale-90 pointer-events-none'
        } ${
          allDone
            ? isLightMode
              ? 'bg-white/88 border-[#9c7533]/48 text-[#9c7533] island-light'
              : 'bg-[#0b0e16]/88 border-[#d2a24b]/48 text-[#d2a24b] island-dark'
            : isLightMode
              ? 'bg-white/78 hover:bg-white/90 border-[#9c7533]/22 text-[#4a453d] hover:text-[#9c7533] island-light'
              : 'bg-[#0b0e16]/80 hover:bg-[#0e1320]/90 border-white/[0.14] text-[#e4dac8]/85 hover:text-[#d2a24b] island-dark'
        }`}
      >
        <div className="relative w-6 h-6 flex items-center justify-center shrink-0">
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 26 26" aria-hidden="true">
            <circle
              cx="13"
              cy="13"
              r={r}
              fill="none"
              stroke={isLightMode ? 'rgba(74,69,61,0.14)' : 'rgba(240,230,210,0.14)'}
              strokeWidth="1.4"
            />
            {pct > 0 && (
              <circle
                cx="13"
                cy="13"
                r={r}
                fill="none"
                stroke={goldAccent}
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={dashOffset}
                className="transition-all duration-500 ease-out"
              />
            )}
          </svg>
          {allDone ? (
            <SparklesIcon
              className="w-3 h-3 transition-transform duration-300 group-hover:scale-110"
              style={{ color: goldAccent }}
            />
          ) : (
            <span className="font-serif-eng text-[8.5px] font-medium tabular-nums leading-none tracking-tight">
              {summary.completedTodos}/{summary.totalTodos}
            </span>
          )}
        </div>

        <span className="font-serif-eng text-[7px] uppercase tracking-[0.14em] leading-none opacity-75">
          Today
        </span>
      </button>

      {/* UNFURLING ILLUMINATED-THREAD LEDGER (Rises directly from the bottom-left anchor) */}
      {isOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <>
            {/* Quiet atmospheric scrim so the Sanctuary sky stays present */}
            <div
              className="fixed inset-0 z-40 bg-black/18 backdrop-blur-[1px]"
              onClick={() => {
                hapticDismiss();
                setIsAdding(false);
                onClose?.();
              }}
            />

            <div
              role="dialog"
              aria-modal="false"
              aria-label="Today's Intentions"
              data-testid="today-ledger-sheet"
              onClick={(e) => e.stopPropagation()}
              style={{ bottom: 'calc(67px + var(--sab))' }}
              className={`fixed left-3 sm:left-6 z-50 w-[calc(100vw-24px)] max-w-[318px] rounded-[24px] border backdrop-blur-xl px-4 pt-4 pb-3.5 animate-ledger-unfurl ${ledgerSurface}`}
            >
              {/* Delicate top ornamental hairline */}
              <div
                aria-hidden="true"
                className="mx-auto mb-3 h-[1px] w-12 opacity-45"
                style={{
                  background: `linear-gradient(90deg, transparent, ${goldAccent}, transparent)`,
                }}
              />

              {/* Editorial Ledger Header (Zero pill badges) */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="min-w-0">
                  <h2 className="font-serif-eng text-[15px] leading-tight tracking-[0.02em]">
                    Today’s Intentions
                  </h2>
                  <p className={`text-[10.5px] tabular-nums tracking-[0.06em] mt-0.5 ${mutedText}`}>
                    {summary.completedTodos} of {summary.totalTodos} illuminated
                  </p>
                </div>

                <div className="flex items-center gap-0.5 -mr-1 -mt-1 shrink-0">
                  {summary.totalTodos < 12 && (
                    <button
                      type="button"
                      onClick={() => {
                        hapticTapLight();
                        setIsAdding((v) => !v);
                      }}
                      aria-label="Add custom intention"
                      className={`w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-colors ${
                        isAdding
                          ? isLightMode
                            ? 'bg-[#9c7533]/12'
                            : 'bg-white/12'
                          : isLightMode
                            ? 'hover:bg-[#1e1b18]/[0.06] text-[#5a5042]'
                            : 'hover:bg-white/[0.08] text-[#f0e6d2]/65'
                      }`}
                      style={isAdding ? { color: goldAccent } : undefined}
                    >
                      <PlusIcon className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      hapticDismiss();
                      setIsAdding(false);
                      onClose?.();
                    }}
                    aria-label="Close Today's Intentions"
                    className={`w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-colors ${
                      isLightMode
                        ? 'hover:bg-[#1e1b18]/[0.06] text-[#5a5042]'
                        : 'hover:bg-white/[0.08] text-[#f0e6d2]/65'
                    }`}
                  >
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Inline Add Intention Composer */}
              {isAdding && (
                <form
                  onSubmit={handleAddSubmit}
                  className={`flex items-center gap-2 mb-3 pb-3 border-b ${hairlineBorder}`}
                >
                  <input
                    type="text"
                    value={newTodoText}
                    onChange={(e) => setNewTodoText(e.target.value)}
                    placeholder="Write a quiet intention..."
                    aria-label="Add an intention for today"
                    autoFocus
                    maxLength={72}
                    className={`flex-1 min-w-0 h-9 px-3 rounded-xl border text-[12.5px] font-serif focus:outline-none ${
                      isLightMode
                        ? 'bg-white/75 border-[#1e1b18]/15 placeholder:text-[#7a6f5d]/65 focus:border-[#9c7533]/45'
                        : 'bg-white/[0.05] border-white/12 placeholder:text-[#f0e6d2]/35 focus:border-[#d2a24b]/45'
                    }`}
                  />
                  <button
                    type="submit"
                    disabled={!newTodoText.trim()}
                    aria-label="Add intention"
                    className="h-9 px-3 rounded-xl text-[10px] uppercase tracking-[0.14em] font-semibold cursor-pointer disabled:opacity-35 transition-opacity"
                    style={{
                      backgroundColor: `${goldAccent}22`,
                      color: goldAccent,
                    }}
                  >
                    Add
                  </button>
                </form>
              )}

              {/* ILLUMINATED THREAD TASK LIST */}
              <div className="relative pl-5 max-h-[44dvh] overflow-y-auto no-scrollbar">
                {/* Continuous Vertical Spine Track */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-[7px] top-3 bottom-3 w-[1px]"
                  style={{ backgroundColor: threadTrack }}
                />
                {/* Glowing Illuminated Thread Fill */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-[7px] top-3 bottom-3 w-[1.5px] origin-top transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  style={{
                    transform: `scaleY(${pct})`,
                    background: `linear-gradient(180deg, ${goldBright}, ${goldAccent})`,
                    boxShadow: pct > 0 ? `0 0 8px ${goldAccent}66` : 'none',
                  }}
                />

                <div className="space-y-1">
                  {(dailyTodos || []).map((todo, idx) => {
                    const done = Boolean(todo.completed);
                    const reward = typeof todo.reward === 'number' ? todo.reward : 5;
                    return (
                      <div
                        key={todo.id}
                        style={{ animationDelay: `${idx * 40}ms` }}
                        className="relative flex items-center gap-1 animate-ledger-row"
                      >
                        {/* Diamond Bead Anchored on the Vertical Thread */}
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute -left-[17px] top-1/2 -translate-y-1/2 w-[9px] h-[9px] rotate-45 transition-all duration-400"
                          style={{
                            backgroundColor: done
                              ? goldBright
                              : isLightMode
                                ? '#f6f1e7'
                                : '#090d18',
                            border: `1.25px solid ${
                              done
                                ? goldAccent
                                : isLightMode
                                  ? 'rgba(54,46,36,0.34)'
                                  : 'rgba(240,230,210,0.32)'
                            }`,
                            boxShadow: done ? `0 0 10px ${goldAccent}99` : 'none',
                          }}
                        />

                        {/* Full-row Accessible Button */}
                        <button
                          type="button"
                          role="checkbox"
                          aria-checked={done}
                          onClick={() => handleToggleTodo(todo)}
                          className={`group flex-1 min-w-0 min-h-[44px] px-2.5 py-2 rounded-xl flex items-center justify-between gap-2.5 text-left cursor-pointer transition-colors duration-200 active:scale-[0.99] ${
                            done
                              ? isLightMode
                                ? 'bg-[#9c7533]/[0.07]'
                                : 'bg-[#d4af37]/[0.08]'
                              : isLightMode
                                ? 'hover:bg-[#1e1b18]/[0.04]'
                                : 'hover:bg-white/[0.04]'
                          }`}
                        >
                          <span
                            className={`font-serif text-[13px] leading-snug break-words transition-all duration-300 ${
                              done ? 'line-through opacity-55' : 'opacity-95'
                            }`}
                          >
                            {todo.text}
                          </span>

                          <span
                            className={`text-[10px] tabular-nums tracking-[0.06em] shrink-0 transition-colors ${
                              done ? '' : mutedText
                            }`}
                            style={done ? { color: goldAccent } : undefined}
                          >
                            {done ? '✦' : `+${reward}`}
                          </span>
                        </button>

                        {todo.isCustom && (
                          <button
                            type="button"
                            onClick={(e) => handleRemoveTodo(e, todo.id)}
                            aria-label={`Remove ${todo.text}`}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                              isLightMode
                                ? 'text-[#7a6f5d] hover:bg-[#1e1b18]/10'
                                : 'text-[#f0e6d2]/45 hover:bg-white/10'
                            }`}
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quiet Ledger Epilogue */}
              <div
                className={`mt-3 pt-2.5 border-t flex items-center justify-between text-[10px] tracking-[0.12em] uppercase ${hairlineBorder}`}
              >
                <span className={allDone ? 'font-medium' : mutedText} style={allDone ? { color: goldAccent } : undefined}>
                  {allDone ? '✦ All intentions fulfilled' : 'Tap an intention to illuminate'}
                </span>
                <span className={`tabular-nums ${mutedText}`}>
                  {Math.round(summary.percentage)}%
                </span>
              </div>
            </div>
          </>,
          document.body
        )}
    </>
  );
});
