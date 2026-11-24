import { memo, useMemo, useState } from 'react';
import { useOptionalHabits } from '../../context/sanctuaryStore';
import { computeTodaySummary } from '../../utils/habitLogic';
import { CheckCircleIcon, PlusIcon, TrashIcon } from '../icons/Icons';
import {
  hapticCelebrate,
  hapticDestructive,
  hapticSuccess,
  hapticTaskComplete,
  hapticUndo,
} from '../../utils/haptics';
import { playTaskTickOffCue } from '../../utils/tactileAudio';

/**
 * Unified "Today's Intentions" companion panel inside the Practices workspace.
 * Syncs live with the Sanctuary bottom-left Today dock via useHabits().
 */
export const TasksIntentionsPanel = memo(({
  isLightMode = false,
  accentHex = '#d2a24b',
  isTasksActive = true,
}) => {
  const habitsCtx = useOptionalHabits();
  const dailyTodos = habitsCtx?.dailyTodos ?? [];
  const addDailyTodo = habitsCtx?.addDailyTodo;
  const toggleDailyTodo = habitsCtx?.toggleDailyTodo;
  const removeDailyTodo = habitsCtx?.removeDailyTodo;
  const clearCompletedDailyTodos = habitsCtx?.clearCompletedDailyTodos;

  const [newText, setNewText] = useState('');

  const summary = useMemo(
    () => computeTodaySummary({ dailyTodos }),
    [dailyTodos]
  );

  const textMain = isLightMode ? 'text-[#1c160f]' : 'text-[rgba(246,239,226,0.95)]';
  const textSub = isLightMode ? 'text-[#4e3f2b]' : 'text-[rgba(232,222,204,0.78)]';
  const textMuted = isLightMode ? 'text-[#665136]' : 'text-[rgba(218,205,184,0.64)]';
  const hairline = isLightMode ? 'border-[#8a6220]/14' : 'border-white/[0.08]';
  const divideLine = isLightMode ? 'divide-[#8a6220]/10' : 'divide-white/[0.07]';

  const handleToggle = (todo) => {
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
    toggleDailyTodo?.(todo.id);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    const cleaned = newText.trim();
    if (!cleaned) return;
    hapticSuccess();
    addDailyTodo?.(cleaned);
    setNewText('');
  };

  return (
    <section
      data-testid="tasks-intentions-panel"
      aria-label="Today's Intentions"
      className={`w-full flex-1 min-h-0 flex flex-col rounded-[22px] border overflow-hidden transition-colors duration-300 ${
        isLightMode
          ? `bg-[#fbf7ee]/86 border-[#8a6220]/18 ${isTasksActive ? 'island-light' : ''}`
          : `bg-[#0d111c]/82 border-white/[0.10] ${isTasksActive ? 'island-dark' : ''}`
      }`}
    >
      {/* Header */}
      <div className={`shrink-0 px-4 py-3 border-b flex items-center justify-between gap-2 ${hairline}`}>
        <div className="min-w-0">
          <h2 className={`font-serif-eng text-[15px] font-semibold leading-tight ${textMain}`}>
            Today’s Intentions
          </h2>
          <p className={`font-serif-eng text-[12px] tabular-nums mt-0.5 ${textMuted}`}>
            {summary.allCompleted
              ? 'All fulfilled today'
              : `${summary.completedTodos} of ${summary.totalTodos} completed`}
          </p>
        </div>

        {summary.completedTodos > 0 && (
          <button
            type="button"
            data-testid="tasks-intentions-clear-btn"
            onClick={() => {
              hapticDestructive();
              clearCompletedDailyTodos?.();
            }}
            className={`min-h-[34px] px-2 font-serif-eng text-[12px] whitespace-nowrap hover:underline underline-offset-4 cursor-pointer transition-opacity ${textMuted}`}
          >
            Clear done
          </button>
        )}
      </div>

      {/* Inline Add Composer */}
      {summary.totalTodos < 12 && (
        <form
          onSubmit={handleAdd}
          className={`shrink-0 px-3.5 py-2 border-b flex items-center gap-2 ${hairline} ${
            isLightMode ? 'bg-white/40' : 'bg-white/[0.02]'
          }`}
        >
          <input
            type="text"
            data-testid="tasks-intention-input"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Add an intention for today..."
            aria-label="Add an intention for today"
            maxLength={72}
            className={`flex-1 min-w-0 min-h-[36px] px-1 bg-transparent font-serif-eng text-[13.5px] outline-none ${textMain} ${
              isLightMode ? 'placeholder:text-[#665136]/62' : 'placeholder:text-[#e8decb]/56'
            }`}
          />
          <button
            type="submit"
            data-testid="tasks-intention-add-btn"
            disabled={!newText.trim()}
            aria-label="Add intention"
            className="min-h-[36px] min-w-[36px] px-3 rounded-xl font-serif-eng text-[12.5px] font-medium flex items-center justify-center gap-1 cursor-pointer transition-all disabled:opacity-35 active:scale-95 shrink-0 whitespace-nowrap"
            style={{
              backgroundColor: isLightMode ? 'rgba(138,98,32,0.12)' : 'rgba(212,175,106,0.16)',
              color: accentHex,
            }}
          >
            <PlusIcon size={13} />
            <span>Add</span>
          </button>
        </form>
      )}

      {/* Checklist Rows (Contained Scroll Only If User Adds Many Items) */}
      {dailyTodos.length === 0 ? (
        <div className="flex-1 flex items-center justify-center px-4 py-6 text-center">
          <p className={`font-serif-eng italic text-[13px] leading-relaxed ${textMuted}`}>
            No intentions listed yet. Add a small, meaningful goal for today.
          </p>
        </div>
      ) : (
        <div className={`flex-1 min-h-0 overflow-y-auto hide-scrollbar divide-y ${divideLine}`}>
          {dailyTodos.map((todo) => {
            const done = Boolean(todo.completed);
            return (
              <div
                key={todo.id}
                className={`flex items-center gap-1 pr-2 transition-colors ${
                  done
                    ? isLightMode
                      ? 'bg-[#8a6220]/[0.05]'
                      : 'bg-[#d4af6a]/[0.06]'
                    : isLightMode
                      ? 'hover:bg-white/60'
                      : 'hover:bg-white/[0.03]'
                }`}
              >
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={done}
                  data-testid={`tasks-todo-${todo.id}`}
                  onClick={() => handleToggle(todo)}
                  className="flex-1 min-w-0 min-h-[44px] px-4 py-2 flex items-center gap-3 text-left cursor-pointer active:scale-[0.99]"
                >
                  <span className="w-5 h-5 flex items-center justify-center shrink-0">
                    {done ? (
                      <CheckCircleIcon size={17} style={{ color: accentHex }} />
                    ) : (
                      <span
                        aria-hidden="true"
                        className={`w-[17px] h-[17px] rounded-full border-[1.5px] transition-colors ${
                          isLightMode ? 'border-[#8a6220]/35' : 'border-[#e4dac8]/30'
                        }`}
                      />
                    )}
                  </span>
                  <span
                    className={`font-serif-eng text-[14px] leading-snug break-words transition-opacity ${
                      done ? `line-through opacity-55 ${textSub}` : textMain
                    }`}
                  >
                    {todo.text}
                  </span>
                </button>

                {todo.isCustom && (
                  <button
                    type="button"
                    aria-label={`Remove ${todo.text}`}
                    onClick={() => {
                      hapticDestructive();
                      removeDailyTodo?.(todo.id);
                    }}
                    className={`min-w-[36px] min-h-[36px] rounded-xl flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                      isLightMode
                        ? 'text-[#665136]/75 hover:bg-black/5 hover:text-[#8a0000]'
                        : 'text-[#e8decb]/50 hover:bg-white/10 hover:text-[#ff8a8a]'
                    }`}
                  >
                    <TrashIcon size={14} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
});
