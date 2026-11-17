import { useState, useMemo } from 'react';
import { useHabits, usePreferences } from '../../context/sanctuaryStore';
import { computeTodaySummary } from '../../utils/habitLogic';
import { CheckCircleIcon, PlusIcon, SparklesIcon, TrashIcon, XIcon } from '../icons/Icons';
import {
  hapticCelebrate,
  hapticDestructive,
  hapticDismiss,
  hapticNavigate,
  hapticSuccess,
  hapticTapLight,
  hapticUndo,
} from '../../utils/haptics';

export const TasksSideColumn = ({
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
    } else {
      hapticSuccess();
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

  // Ring geometry for left Today trigger capsule
  const r = 12.5;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(1, Math.max(0, summary.percentage / 100));
  const dashOffset = circ * (1 - pct);
  const allDone = summary.allCompleted;

  const pillSurface = isLightMode
    ? 'bg-[#f4efe4]/84 border-[#1e1b18]/12 shadow-[0_10px_28px_rgba(30,24,16,0.08),inset_0_1px_0_rgba(255,255,255,0.85)]'
    : 'bg-[#090d18]/78 border-[#f0e6d2]/12 shadow-[0_12px_34px_rgba(0,0,0,0.48),inset_0_1px_0_rgba(255,255,255,0.08)]';

  const cardSurface = isLightMode
    ? 'bg-[#f6f1e7]/92 border-[#1e1b18]/12 text-[#1a1814] shadow-[0_18px_48px_rgba(24,18,10,0.18),inset_0_1px_0_rgba(255,255,255,0.85)]'
    : 'bg-[#0a0f1c]/90 border-[#f0e6d2]/14 text-[#f5eee0] shadow-[0_20px_54px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.08)]';

  const mutedText = isLightMode ? 'text-[#7a6f5d]' : 'text-[#f0e6d2]/45';

  return (
    <>
      {/* LEFT-RAIL COMPACT "TODAY" QUEST TRIGGER */}
      <aside
        aria-label="Today's Quests Trigger"
        aria-hidden={!isVisible || isOpen || undefined}
        inert={!isVisible || isOpen}
        className={`fixed left-2.5 md:left-7 top-1/2 -translate-y-1/2 z-30 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isVisible && !isOpen
            ? 'opacity-100 translate-x-0 pointer-events-auto'
            : 'opacity-0 -translate-x-3 pointer-events-none'
        }`}
      >
        <button
          type="button"
          onClick={() => {
            hapticNavigate();
            onOpen?.();
          }}
          aria-label={`Open Today's List (${summary.completedTodos} of ${summary.totalTodos} completed)`}
          aria-expanded={isOpen}
          className={`group flex flex-col items-center justify-center gap-1.5 w-[44px] md:w-[48px] py-2.5 px-1.5 rounded-full border backdrop-blur-2xl cursor-pointer transition-all duration-300 active:scale-95 ${pillSurface}`}
        >
          {/* Radial Progress + Quest Icon */}
          <div className="relative w-7 h-7 flex items-center justify-center shrink-0">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 30 30">
              <circle
                cx="15"
                cy="15"
                r={r}
                fill="none"
                stroke={isLightMode ? 'rgba(30,27,24,0.12)' : 'rgba(240,230,210,0.12)'}
                strokeWidth="1.75"
              />
              {pct > 0 && (
                <circle
                  cx="15"
                  cy="15"
                  r={r}
                  fill="none"
                  stroke={accentColor}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray={circ}
                  strokeDashoffset={dashOffset}
                  className="transition-all duration-500 ease-out"
                />
              )}
            </svg>
            {allDone ? (
              <SparklesIcon
                className="w-3.5 h-3.5 transition-transform duration-300 group-hover:scale-110"
                style={{ color: accentColor }}
              />
            ) : (
              <svg
                className="w-3.5 h-3.5 transition-transform duration-300 group-hover:scale-110"
                style={{ color: accentColor }}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 3l2.4 5.2L20 9.3l-4 4.1.9 5.6-4.9-2.6-4.9 2.6.9-5.6-4-4.1 5.6-1.1L12 3z" />
              </svg>
            )}
          </div>

          {/* Tabular Quest Counter (e.g. 0/3) */}
          <span
            className="text-[10px] font-medium tabular-nums tracking-tight leading-none"
            style={{
              color: allDone
                ? accentColor
                : isLightMode
                  ? 'rgba(26,24,20,0.88)'
                  : 'rgba(245,238,224,0.92)',
            }}
          >
            {summary.completedTodos}/{summary.totalTodos}
          </span>

          {/* Crisp TODAY Micro-Caption */}
          <span
            className={`text-[7px] md:text-[7.5px] uppercase tracking-[0.18em] font-semibold leading-none ${mutedText}`}
          >
            Today
          </span>
        </button>
      </aside>

      {/* FLOATING GAME-STYLE SIDE QUEST CARD */}
      {isOpen && (
        <>
          {/* Transparent tap-outside catcher so the Sanctuary sky stays visible */}
          <div
            className="fixed inset-0 z-30 bg-black/15 backdrop-blur-[1px]"
            onClick={() => {
              hapticDismiss();
              setIsAdding(false);
              onClose?.();
            }}
          />

          <div
            role="dialog"
            aria-modal="false"
            aria-label="Today's List"
            onClick={(e) => e.stopPropagation()}
            className={`fixed left-3 md:left-7 top-1/2 -translate-y-1/2 z-40 w-[268px] sm:w-[288px] rounded-[22px] border backdrop-blur-2xl p-3.5 transition-all duration-300 ${cardSurface}`}
          >
            {/* Compact Quest Card Header */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5">
                <span
                  className="text-[11px] leading-none"
                  style={{ color: accentColor }}
                  aria-hidden="true"
                >
                  ✦
                </span>
                <h2 className="text-[10.5px] uppercase tracking-[0.22em] font-semibold">
                  Today
                </h2>
                <span
                  className="text-[10px] font-semibold tabular-nums px-1.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${accentColor}1f`,
                    color: accentColor,
                  }}
                >
                  {summary.completedTodos}/{summary.totalTodos}
                </span>
              </div>

              <div className="flex items-center gap-1">
                {summary.totalTodos < 12 && (
                  <button
                    type="button"
                    onClick={() => {
                      hapticTapLight();
                      setIsAdding((v) => !v);
                    }}
                    aria-label="Add custom task"
                    className={`w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-colors ${
                      isAdding
                        ? 'bg-white/15'
                        : isLightMode
                          ? 'hover:bg-[#1e1b18]/[0.06] text-[#5a5042]'
                          : 'hover:bg-white/[0.08] text-[#f0e6d2]/65'
                    }`}
                    style={isAdding ? { color: accentColor } : undefined}
                  >
                    <PlusIcon className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    hapticDismiss();
                    setIsAdding(false);
                    onClose?.();
                  }}
                  aria-label="Close Today's List"
                  className={`w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-colors ${
                    isLightMode
                      ? 'hover:bg-[#1e1b18]/[0.06] text-[#5a5042]'
                      : 'hover:bg-white/[0.08] text-[#f0e6d2]/65'
                  }`}
                >
                  <XIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Thin Game-Style Progress Bar */}
            <div
              className={`w-full h-1 rounded-full overflow-hidden mb-3 ${
                isLightMode ? 'bg-[#1e1b18]/10' : 'bg-white/10'
              }`}
            >
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${summary.percentage}%`,
                  backgroundColor: accentColor,
                }}
              />
            </div>

            {/* Optional Compact Inline Add Input */}
            {isAdding && (
              <form onSubmit={handleAddSubmit} className="flex items-center gap-1.5 mb-2.5">
                <input
                  type="text"
                  value={newTodoText}
                  onChange={(e) => setNewTodoText(e.target.value)}
                  placeholder="New task..."
                  aria-label="Add a task for today"
                  autoFocus
                  maxLength={72}
                  className={`flex-1 min-w-0 h-8 px-2.5 rounded-lg border text-[12px] focus:outline-none ${
                    isLightMode
                      ? 'bg-white/70 border-[#1e1b18]/15 placeholder:text-[#7a6f5d]/65'
                      : 'bg-white/[0.05] border-white/12 placeholder:text-[#f0e6d2]/35'
                  }`}
                />
                <button
                  type="submit"
                  disabled={!newTodoText.trim()}
                  aria-label="Add task"
                  className="h-8 px-2.5 rounded-lg text-[10px] uppercase tracking-[0.14em] font-semibold cursor-pointer disabled:opacity-35"
                  style={{
                    backgroundColor: `${accentColor}24`,
                    color: accentColor,
                  }}
                >
                  Add
                </button>
              </form>
            )}

            {/* Game-Style Quest Rows */}
            <div className="space-y-1.5 max-h-[48dvh] overflow-y-auto no-scrollbar">
              {(dailyTodos || []).map((todo) => {
                const done = Boolean(todo.completed);
                const reward = typeof todo.reward === 'number' ? todo.reward : 5;
                return (
                  <div
                    key={todo.id}
                    onClick={() => handleToggleTodo(todo)}
                    role="checkbox"
                    aria-checked={done}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleToggleTodo(todo);
                      }
                    }}
                    className={`group min-h-[42px] px-3 py-2 rounded-xl border flex items-center justify-between gap-2.5 cursor-pointer transition-all duration-200 active:scale-[0.98] ${
                      done
                        ? isLightMode
                          ? 'bg-[#7c5a1e]/[0.07] border-[#7c5a1e]/20'
                          : 'bg-[#d4af37]/[0.08] border-[#d4af37]/25'
                        : isLightMode
                          ? 'bg-[#1e1b18]/[0.025] border-[#1e1b18]/[0.08] hover:bg-[#1e1b18]/[0.05]'
                          : 'bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {/* Diamond / Check Quest Node */}
                      <span
                        className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-all ${
                          done
                            ? ''
                            : isLightMode
                              ? 'border border-[#1e1b18]/28'
                              : 'border border-white/28'
                        }`}
                        style={
                          done
                            ? { backgroundColor: `${accentColor}28`, color: accentColor }
                            : undefined
                        }
                      >
                        {done && <CheckCircleIcon className="w-3.5 h-3.5" />}
                      </span>

                      <span
                        className={`text-[12.5px] font-serif leading-snug break-words transition-opacity ${
                          done ? 'line-through opacity-55' : ''
                        }`}
                      >
                        {todo.text}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {/* Game-Style +Yaqeen Reward Tag */}
                      <span
                        className={`text-[9.5px] font-semibold tabular-nums tracking-wider px-1.5 py-0.5 rounded-md ${
                          done ? '' : mutedText
                        }`}
                        style={
                          done
                            ? { color: accentColor }
                            : isLightMode
                              ? { backgroundColor: 'rgba(30,27,24,0.05)' }
                              : { backgroundColor: 'rgba(255,255,255,0.05)' }
                        }
                      >
                        {done ? '✦ Done' : `+${reward} ✦`}
                      </span>

                      {todo.isCustom && (
                        <button
                          type="button"
                          onClick={(e) => handleRemoveTodo(e, todo.id)}
                          aria-label={`Remove ${todo.text}`}
                          className={`w-6 h-6 rounded-md flex items-center justify-center cursor-pointer transition-colors ${
                            isLightMode
                              ? 'text-[#7a6f5d] hover:bg-[#1e1b18]/10'
                              : 'text-[#f0e6d2]/40 hover:bg-white/10'
                          }`}
                        >
                          <TrashIcon className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Subtle All-Quests-Complete Banner */}
            {allDone && (
              <div
                className="mt-2.5 pt-2 border-t text-center text-[10px] uppercase tracking-[0.2em] font-medium"
                style={{
                  borderColor: isLightMode ? 'rgba(30,27,24,0.08)' : 'rgba(255,255,255,0.08)',
                  color: accentColor,
                }}
              >
                ✦ All Today’s Quests Complete
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};
