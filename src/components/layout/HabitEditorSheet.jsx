import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  HABIT_CADENCES,
  HABIT_PRESETS,
  HABIT_UNIT_SUGGESTIONS,
} from '../../utils/habitLogic';
import { PlusIcon, TrashIcon, XIcon } from '../icons/Icons';
import { useOptionalHabits, useOptionalPreferences } from '../../context/sanctuaryStore';
import {
  hapticDestructive,
  hapticDetent,
  hapticDismiss,
  hapticSuccess,
  hapticWarning,
} from '../../utils/haptics';

export const HabitEditorSheet = ({
  isOpen,
  isLightMode: isLightModeProp,
  editingHabit = null,
  existingHabits: existingHabitsProp,
  onSaveNew: onSaveNewProp,
  onSaveEdit: onSaveEditProp,
  onDeleteHabit: onDeleteHabitProp,
  onClose,
}) => {
  const prefsCtx = useOptionalPreferences();
  const habitsCtx = useOptionalHabits();

  const isLightMode = isLightModeProp ?? prefsCtx?.isLightMode ?? false;
  const existingHabits = existingHabitsProp ?? habitsCtx?.habits ?? [];
  const onSaveNew = onSaveNewProp ?? habitsCtx?.addCustomHabit;
  const onSaveEdit = onSaveEditProp ?? habitsCtx?.updateHabit;
  const onDeleteHabit = onDeleteHabitProp ?? habitsCtx?.removeHabit;

  const [title, setTitle] = useState('');
  const [arabic, setArabic] = useState('');
  const [target, setTarget] = useState('1');
  const [unit, setUnit] = useState('time');
  const [cadence, setCadence] = useState('Daily');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setErrorMsg('');
    if (editingHabit) {
      setTitle(editingHabit.title || '');
      setArabic(editingHabit.arabic || '');
      setTarget(String(editingHabit.target || 1));
      setUnit(editingHabit.unit || 'time');
      setCadence(editingHabit.cadence || 'Daily');
    } else {
      setTitle('');
      setArabic('');
      setTarget('1');
      setUnit('time');
      setCadence('Daily');
    }
  }, [isOpen, editingHabit]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  const isEditing = Boolean(editingHabit);
  const accentHex = isLightMode ? '#9c7533' : '#d2a24b';
  const tTextMain = isLightMode ? 'text-[#1a1814]' : 'text-[rgba(245,238,224,0.95)]';
  const tTextSub = isLightMode ? 'text-[#4a453d]' : 'text-[#e4dac8]';

  const existingTitles = new Set(
    (existingHabits || []).map((h) => String(h?.title || '').trim().toLowerCase())
  );
  const availablePresets = HABIT_PRESETS.filter(
    (p) => !existingTitles.has(p.title.toLowerCase())
  );

  const stepTarget = (delta) => {
    hapticDetent();
    const next = Math.max(1, Math.min(999, (Number(target) || 1) + delta));
    setTarget(String(next));
  };

  const applyPreset = (preset) => {
    hapticDetent();
    setTitle(preset.title);
    setArabic(preset.arabic || '');
    setTarget(String(preset.target || 1));
    setUnit(preset.unit || 'time');
    setCadence(preset.cadence || 'Daily');
    setErrorMsg('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanedTitle = title.trim();
    if (!cleanedTitle) {
      hapticWarning();
      setErrorMsg('Please enter a habit name.');
      return;
    }

    const payload = {
      title: cleanedTitle,
      arabic: arabic.trim() || 'عَمَل',
      target: Math.max(1, Math.min(999, Math.floor(Number(target) || 1))),
      unit: unit.trim() || 'time',
      cadence,
    };

    hapticSuccess();
    if (isEditing && editingHabit) {
      onSaveEdit?.(editingHabit.id, payload);
    } else {
      onSaveNew?.(payload);
    }
    onClose?.();
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      data-habit-editor-open="true"
      aria-label={isEditing ? `Edit ${editingHabit?.title || 'Habit'}` : 'Add Custom Habit'}
      className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-auto"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          background: isLightMode ? 'rgba(244,240,232,0.82)' : 'rgba(6,8,14,0.82)',
          backdropFilter: 'blur(16px)',
        }}
        onClick={() => {
          hapticDismiss();
          onClose?.();
        }}
      />

      {/* Dialog Surface */}
      <div
        className={`relative z-10 w-full max-w-md rounded-t-[28px] sm:rounded-[28px] border overflow-hidden transition-colors ${
          isLightMode
            ? 'bg-[#fcfaf5]/96 border-black/10 shadow-[0_24px_64px_rgba(26,24,20,0.18)]'
            : 'bg-[#0b0e16]/96 border-white/12 shadow-[0_28px_72px_rgba(0,0,0,0.78)]'
        }`}
      >
        {/* Header */}
        <div
          className={`px-6 pt-5 pb-4 border-b flex items-center justify-between gap-3 ${
            isLightMode ? 'border-black/[0.08]' : 'border-white/[0.08]'
          }`}
        >
          <div>
            <h2 className={`font-serif-eng text-base font-medium uppercase tracking-[0.18em] ${tTextMain}`}>
              {isEditing ? 'Customize Habit' : 'New Habit'}
            </h2>
            <span className="font-calligraphy text-sm opacity-80" style={{ color: accentHex }} dir="rtl">
              {isEditing ? editingHabit?.arabic || 'تَخْصِيص' : 'عَادَة جَدِيدَة'}
            </span>
          </div>

          <button
            type="button"
            aria-label="Close habit editor"
            onClick={() => {
              hapticDismiss();
              onClose?.();
            }}
            className={`w-10 h-10 rounded-full border flex items-center justify-center cursor-pointer transition-colors ${
              isLightMode
                ? 'border-black/10 text-[#4a453d] hover:bg-black/5'
                : 'border-white/12 text-[#e4dac8] hover:bg-white/10'
            }`}
          >
            <XIcon size={17} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4 max-h-[82vh] overflow-y-auto hide-scrollbar">
          {/* Quick Presets when creating */}
          {!isEditing && availablePresets.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className={`font-serif-eng text-[10px] uppercase tracking-[0.16em] opacity-70 ${tTextSub}`}>
                Quick Sunnah Ideas
              </span>
              <div className="flex flex-wrap gap-1.5">
                {availablePresets.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className={`min-h-[34px] px-3 rounded-xl border font-serif-eng text-[11px] flex items-center gap-1.5 cursor-pointer transition-colors ${
                      title.trim().toLowerCase() === preset.title.toLowerCase()
                        ? isLightMode
                          ? 'bg-[#9c7533]/12 border-[#9c7533] text-[#7c5a1e]'
                          : 'bg-[#d2a24b]/16 border-[#d2a24b] text-[#f3d9a4]'
                        : isLightMode
                          ? 'border-black/10 text-[#2c2720] hover:bg-black/5'
                          : 'border-white/12 text-[#e4dac8] hover:bg-white/5'
                    }`}
                  >
                    <PlusIcon size={11} style={{ color: accentHex }} />
                    <span>{preset.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Habit Name + Arabic Label */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 flex flex-col gap-1.5">
              <label
                htmlFor="habit-title-input"
                className={`font-serif-eng text-[10px] uppercase tracking-[0.16em] opacity-75 ${tTextSub}`}
              >
                Habit Name
              </label>
              <input
                id="habit-title-input"
                type="text"
                maxLength={56}
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="e.g. Surah Al-Mulk"
                className={`w-full min-h-[42px] px-3.5 py-2 rounded-xl border bg-transparent font-serif-eng text-sm outline-none transition-colors ${
                  isLightMode
                    ? 'border-black/15 text-[#1a1814] focus:border-[#9c7533]'
                    : 'border-white/15 text-white focus:border-[#d2a24b]'
                }`}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="habit-arabic-input"
                className={`font-serif-eng text-[10px] uppercase tracking-[0.16em] opacity-75 ${tTextSub}`}
              >
                Arabic (Opt.)
              </label>
              <input
                id="habit-arabic-input"
                type="text"
                dir="rtl"
                maxLength={24}
                value={arabic}
                onChange={(e) => setArabic(e.target.value)}
                placeholder="عَمَل"
                className={`w-full min-h-[42px] px-3 py-2 rounded-xl border bg-transparent font-arabic text-sm outline-none transition-colors ${
                  isLightMode
                    ? 'border-black/15 text-[#7c5a1e] focus:border-[#9c7533]'
                    : 'border-white/15 text-[#e5c17b] focus:border-[#d2a24b]'
                }`}
              />
            </div>
          </div>

          {errorMsg && (
            <p className="font-serif-eng text-xs text-red-500 -mt-2" role="alert">
              {errorMsg}
            </p>
          )}

          {/* Target & Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="habit-target-input"
                className={`font-serif-eng text-[10px] uppercase tracking-[0.16em] opacity-75 ${tTextSub}`}
              >
                Daily Target
              </label>
              <div
                className={`flex items-center rounded-xl border overflow-hidden ${
                  isLightMode ? 'border-black/15' : 'border-white/15'
                }`}
              >
                <button
                  type="button"
                  aria-label="Decrease target"
                  onClick={() => stepTarget(-1)}
                  className={`w-11 h-[40px] flex items-center justify-center text-base cursor-pointer transition-colors ${
                    isLightMode ? 'text-[#1a1814] hover:bg-black/5' : 'text-white hover:bg-white/10'
                  }`}
                >
                  −
                </button>
                <input
                  id="habit-target-input"
                  type="number"
                  min="1"
                  max="999"
                  value={target}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setTarget(e.target.value)}
                  className={`flex-1 min-w-0 h-[40px] text-center bg-transparent font-serif-eng text-sm tabular-nums outline-none ${tTextMain}`}
                />
                <button
                  type="button"
                  aria-label="Increase target"
                  onClick={() => stepTarget(1)}
                  className={`w-11 h-[40px] flex items-center justify-center text-base cursor-pointer transition-colors ${
                    isLightMode ? 'text-[#1a1814] hover:bg-black/5' : 'text-white hover:bg-white/10'
                  }`}
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="habit-unit-input"
                className={`font-serif-eng text-[10px] uppercase tracking-[0.16em] opacity-75 ${tTextSub}`}
              >
                Unit
              </label>
              <input
                id="habit-unit-input"
                type="text"
                maxLength={18}
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g. pages, mins"
                className={`w-full min-h-[42px] px-3.5 py-2 rounded-xl border bg-transparent font-serif-eng text-sm outline-none transition-colors ${
                  isLightMode
                    ? 'border-black/15 text-[#1a1814] focus:border-[#9c7533]'
                    : 'border-white/15 text-white focus:border-[#d2a24b]'
                }`}
              />
            </div>
          </div>

          {/* Quick Unit Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 -mt-1">
            {HABIT_UNIT_SUGGESTIONS.map((u) => {
              const selected = unit.trim().toLowerCase() === u.toLowerCase();
              return (
                <button
                  key={u}
                  type="button"
                  onClick={() => {
                    hapticDetent();
                    setUnit(u);
                  }}
                  className={`min-h-[28px] px-2.5 rounded-lg border font-serif-eng text-[10px] cursor-pointer transition-colors ${
                    selected
                      ? isLightMode
                        ? 'bg-[#9c7533]/12 border-[#9c7533] text-[#7c5a1e] font-medium'
                        : 'bg-[#d2a24b]/16 border-[#d2a24b] text-[#f3d9a4] font-medium'
                      : isLightMode
                        ? 'border-black/10 text-[#4a453d]/80 hover:bg-black/5'
                        : 'border-white/12 text-[#e4dac8]/80 hover:bg-white/5'
                  }`}
                >
                  {u}
                </button>
              );
            })}
          </div>

          {/* Cadence Selector */}
          <div className="flex flex-col gap-1.5">
            <span className={`font-serif-eng text-[10px] uppercase tracking-[0.16em] opacity-75 ${tTextSub}`}>
              Time of Day / Rhythm
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {HABIT_CADENCES.map((item) => {
                const active = cadence === item;
                return (
                  <button
                    key={item}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      hapticDetent();
                      setCadence(item);
                    }}
                    className={`min-h-[36px] px-2.5 rounded-xl border font-serif-eng text-[11px] cursor-pointer transition-colors ${
                      active
                        ? isLightMode
                          ? 'bg-[#9c7533]/14 border-[#9c7533] text-[#7c5a1e] font-medium'
                          : 'bg-[#d2a24b]/18 border-[#d2a24b] text-[#f3d9a4] font-medium'
                        : isLightMode
                          ? 'border-black/10 text-[#4a453d] hover:bg-black/5'
                          : 'border-white/12 text-[#e4dac8]/85 hover:bg-white/5'
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Actions */}
          <div
            className={`pt-3 mt-1 border-t flex items-center justify-between gap-2 ${
              isLightMode ? 'border-black/[0.08]' : 'border-white/[0.08]'
            }`}
          >
            {isEditing && editingHabit ? (
              <button
                type="button"
                aria-label={`Delete ${editingHabit.title}`}
                onClick={() => {
                  hapticDestructive();
                  onDeleteHabit?.(editingHabit.id);
                  onClose?.();
                }}
                className={`min-h-[40px] px-3 rounded-xl flex items-center gap-1.5 font-serif-eng text-[10px] uppercase tracking-[0.12em] cursor-pointer transition-colors ${
                  isLightMode
                    ? 'text-[#8a0000] hover:bg-[#8a0000]/10'
                    : 'text-[#ff8a8a] hover:bg-[#ff8a8a]/10'
                }`}
              >
                <TrashIcon size={14} />
                <span>Delete</span>
              </button>
            ) : (
              <span />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  hapticDismiss();
                  onClose?.();
                }}
                className={`min-h-[40px] px-4 rounded-xl font-serif-eng text-[10px] uppercase tracking-[0.14em] cursor-pointer transition-opacity opacity-75 hover:opacity-100 ${tTextSub}`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="min-h-[40px] px-5 rounded-xl border font-serif-eng text-[10px] uppercase tracking-[0.14em] font-medium cursor-pointer transition-all active:scale-[0.98]"
                style={{
                  backgroundColor: isLightMode ? '#9c7533' : 'rgba(210,162,75,0.24)',
                  borderColor: isLightMode ? '#9c7533' : 'rgba(210,162,75,0.5)',
                  color: isLightMode ? '#ffffff' : '#f3d9a4',
                }}
              >
                {isEditing ? 'Save Changes' : 'Add Habit'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
