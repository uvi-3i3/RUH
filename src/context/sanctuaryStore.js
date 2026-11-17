import { createContext, useContext } from 'react';

export const PreferencesContext = createContext(null);
export const HabitsContext = createContext(null);
export const LocalAIContext = createContext(null);
export const SanctuaryContext = createContext(null);

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) {
    throw new Error('usePreferences must be used within a SanctuaryProvider');
  }
  return ctx;
}

export function useOptionalPreferences() {
  return useContext(PreferencesContext);
}

export function useHabits() {
  const ctx = useContext(HabitsContext);
  if (!ctx) {
    throw new Error('useHabits must be used within a SanctuaryProvider');
  }
  return ctx;
}

export function useOptionalHabits() {
  return useContext(HabitsContext);
}

export function useLocalAIContext() {
  const ctx = useContext(LocalAIContext);
  if (!ctx) {
    throw new Error('useLocalAIContext must be used within a SanctuaryProvider');
  }
  return ctx;
}

export function useOptionalLocalAI() {
  return useContext(LocalAIContext);
}

export function useSanctuary() {
  const ctx = useContext(SanctuaryContext);
  if (!ctx) {
    throw new Error('useSanctuary must be used within a SanctuaryProvider');
  }
  return ctx;
}

export function useOptionalSanctuary() {
  return useContext(SanctuaryContext);
}
