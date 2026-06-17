import { useState, useCallback, useEffect } from 'react';
import type { AppData, Habit, ThemePack } from '../types';
import { loadData, saveData, createHabit, toggleHabitCheck, createBundle, extendBundle, toggleFreeze } from '../store';
import { generateThemeFromColor, applyThemeCSSVars, fetchThemePacks, getCachedThemePacks, cacheThemePack } from '../theme';

const DEFAULT_THEME_COLORS = {
  light: {
    primary: '#6750A4', onPrimary: '#FFFFFF', primaryContainer: '#EADDFF', onPrimaryContainer: '#21005D',
    secondary: '#625B71', onSecondary: '#FFFFFF', secondaryContainer: '#E8DEF8', onSecondaryContainer: '#1D192B',
    tertiary: '#7D5260', onTertiary: '#FFFFFF', tertiaryContainer: '#FFD8E4', onTertiaryContainer: '#31111D',
    error: '#B3261E', onError: '#FFFFFF', errorContainer: '#F9DEDC', onErrorContainer: '#410E0B',
    background: '#FFFBFE', onBackground: '#1C1B1F', surface: '#FFFBFE', onSurface: '#1C1B1F',
    surfaceVariant: '#E7E0EC', onSurfaceVariant: '#49454F', outline: '#79747E', outlineVariant: '#CAC4D0',
    shadow: '#000000', scrim: '#000000', inverseSurface: '#313033', inverseOnSurface: '#F4EFF4', inversePrimary: '#D0BCFF',
  },
  dark: {
    primary: '#D0BCFF', onPrimary: '#381E72', primaryContainer: '#4F378B', onPrimaryContainer: '#EADDFF',
    secondary: '#CCC2DC', onSecondary: '#332D41', secondaryContainer: '#4A4458', onSecondaryContainer: '#E8DEF8',
    tertiary: '#EFB8C8', onTertiary: '#492532', tertiaryContainer: '#633B48', onTertiaryContainer: '#FFD8E4',
    error: '#F2B8B5', onError: '#601410', errorContainer: '#8C1D18', onErrorContainer: '#F9DEDC',
    background: '#1C1B1F', onBackground: '#E6E1E5', surface: '#1C1B1F', onSurface: '#E6E1E5',
    surfaceVariant: '#49454F', onSurfaceVariant: '#CAC4D0', outline: '#938F99', outlineVariant: '#49454F',
    shadow: '#000000', scrim: '#000000', inverseSurface: '#E6E1E5', inverseOnSurface: '#313033', inversePrimary: '#6750A4',
  },
};

export function useApp() {
  const [data, setData] = useState<AppData>(loadData);
  const [themePacks, setThemePacks] = useState<ThemePack[]>(getCachedThemePacks);
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    saveData(data);
  }, [data]);

  useEffect(() => {
    applyTheme();
  }, [data.currentThemePack, data.darkMode]);

  useEffect(() => {
    fetchThemePacks().then(setThemePacks).catch(() => {});
  }, []);

  const updateData = useCallback((updater: (prev: AppData) => AppData) => {
    setData(updater);
  }, []);

  function applyTheme() {
    const pack = themePacks.find((t) => t.id === data.currentThemePack);
    if (pack) {
      const colors = data.darkMode ? pack.dark : pack.light;
      applyThemeCSSVars(colors);
    } else {
      const colors = data.darkMode ? DEFAULT_THEME_COLORS.dark : DEFAULT_THEME_COLORS.light;
      applyThemeCSSVars(colors);
    }
  }

  const addHabit = useCallback((name: string) => {
    const habit = createHabit(name);
    updateData((prev) => ({ ...prev, habits: [...prev.habits, habit] }));
  }, [updateData]);

  const renameHabit = useCallback((id: string, name: string) => {
    updateData((prev) => ({
      ...prev,
      habits: prev.habits.map((h) => (h.id === id ? { ...h, name } : h)),
    }));
  }, [updateData]);

  const deleteHabit = useCallback((id: string) => {
    updateData((prev) => ({
      ...prev,
      habits: prev.habits.filter((h) => h.id !== id),
    }));
  }, [updateData]);

  const updateHabitIcon = useCallback((id: string, icon: string) => {
    updateData((prev) => ({
      ...prev,
      habits: prev.habits.map((h) => (h.id === id ? { ...h, icon } : h)),
    }));
  }, [updateData]);

  const updateHabitGoal = useCallback((id: string, goal: number) => {
    updateData((prev) => ({
      ...prev,
      habits: prev.habits.map((h) => (h.id === id ? { ...h, goal: Math.max(1, Math.min(7, goal)) } : h)),
    }));
  }, [updateData]);

  const toggleCheck = useCallback((habitId: string, date: string) => {
    updateData((prev) => ({
      ...prev,
      habits: prev.habits.map((h) => (h.id === habitId ? toggleHabitCheck(h, date) : h)),
    }));
  }, [updateData]);

  const freezeStreak = useCallback((habitId: string, date: string) => {
    updateData((prev) => ({
      ...prev,
      habits: prev.habits.map((h) => (h.id === habitId ? toggleFreeze(h, date) : h)),
    }));
  }, [updateData]);

  const updateNote = useCallback((habitId: string, date: string, note: string) => {
    updateData((prev) => ({
      ...prev,
      habits: prev.habits.map((h) =>
        h.id === habitId ? { ...h, notes: { ...h.notes, [date]: note } } : h,
      ),
    }));
  }, [updateData]);

  const addPomodoroSession = useCallback((habitId: string, date: string) => {
    updateData((prev) => ({
      ...prev,
      habits: prev.habits.map((h) =>
        h.id === habitId
          ? { ...h, pomodoroSessions: { ...h.pomodoroSessions, [date]: (h.pomodoroSessions[date] || 0) + 1 } }
          : h,
      ),
    }));
  }, [updateData]);

  const setPomodoroMinutes = useCallback((habitId: string, minutes: number) => {
    updateData((prev) => ({
      ...prev,
      habits: prev.habits.map((h) => (h.id === habitId ? { ...h, pomodoroMinutes: minutes } : h)),
    }));
  }, [updateData]);

  const addBundle = useCallback((name: string, startDate: string, endDate: string) => {
    const bundle = createBundle(name, startDate, endDate);
    updateData((prev) => ({ ...prev, bundles: [...prev.bundles, bundle] }));
  }, [updateData]);

  const deleteBundle = useCallback((id: string) => {
    updateData((prev) => ({
      ...prev,
      bundles: prev.bundles.filter((b) => b.id !== id),
    }));
  }, [updateData]);

  const toggleBundleActive = useCallback((id: string) => {
    updateData((prev) => ({
      ...prev,
      bundles: prev.bundles.map((b) => (b.id === id ? { ...b, active: !b.active } : b)),
    }));
  }, [updateData]);

  const extendBundleAction = useCallback((id: string, days: number) => {
    updateData((prev) => ({
      ...prev,
      bundles: prev.bundles.map((b) => (b.id === id ? extendBundle(b, days) : b)),
    }));
  }, [updateData]);

  const setPage = useCallback((page: string) => {
    updateData((prev) => ({ ...prev, currentPage: page }));
  }, [updateData]);

  const toggleDarkMode = useCallback(() => {
    updateData((prev) => ({ ...prev, darkMode: !prev.darkMode }));
  }, [updateData]);

  const toggleDensity = useCallback(() => {
    updateData((prev) => ({
      ...prev,
      density: prev.density === 'compact' ? 'comfortable' : 'compact',
    }));
  }, [updateData]);

  const setThemePack = useCallback((id: string) => {
    updateData((prev) => ({ ...prev, currentThemePack: id }));
  }, [updateData]);

  const applyCustomColor = useCallback((hex: string) => {
    const id = 'custom_' + hex;
    const light = generateThemeFromColor(hex, false);
    const dark = generateThemeFromColor(hex, true);
    const pack: ThemePack = { id, name: `Custom ${hex}`, light, dark };
    cacheThemePack(pack);
    setThemePacks((prev) => {
      const exists = prev.find((t) => t.id === id);
      return exists ? prev : [...prev, pack];
    });
    setData((prev) => ({ ...prev, currentThemePack: id }));
  }, [updateData, setData]);

  const setGithubConfig = useCallback((config: AppData['githubConfig']) => {
    updateData((prev) => ({ ...prev, githubConfig: config }));
  }, [updateData]);

  const signOut = useCallback(() => {
    updateData((prev) => ({
      ...prev,
      githubConfig: null,
      currentThemePack: 'default',
    }));
  }, [updateData]);

  const reorderHabits = useCallback((habits: Habit[]) => {
    updateData((prev) => ({
      ...prev,
      habits: habits.map((h, i) => ({ ...h, sortOrder: i })),
    }));
  }, [updateData]);

  const getActiveBundles = useCallback(() => {
    return data.bundles.filter((b) => b.active);
  }, [data.bundles]);

  return {
    data,
    weekOffset,
    setWeekOffset,
    themePacks,
    setThemePacks,
    addHabit,
    renameHabit,
    deleteHabit,
    updateHabitIcon,
    updateHabitGoal,
    toggleCheck,
    freezeStreak,
    updateNote,
    addPomodoroSession,
    setPomodoroMinutes,
    addBundle,
    deleteBundle,
    toggleBundleActive,
    extendBundleAction,
    setPage,
    toggleDarkMode,
    toggleDensity,
    setThemePack,
    applyCustomColor,
    setGithubConfig,
    signOut,
    reorderHabits,
    getActiveBundles,
  };
}
