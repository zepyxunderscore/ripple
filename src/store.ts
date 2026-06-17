import type { AppData, Habit, Bundle } from './types';
import { generateId, formatDate } from './utils';

const STORAGE_KEY = 'ripple_data';

const DEFAULT_DATA: AppData = {
  habits: [],
  bundles: [],
  currentThemePack: 'default',
  darkMode: false,
  density: 'comfortable',
  currentPage: 'habits',
  githubConfig: null,
};

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_DATA, ...parsed };
    }
  } catch {}
  return { ...DEFAULT_DATA };
}

export function saveData(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function createHabit(name: string, habitData?: Partial<Habit>): Habit {
  return {
    id: generateId(),
    name,
    icon: habitData?.icon || 'check_circle',
    goal: habitData?.goal ?? 3,
    checks: {},
    frozenDates: [],
    notes: {},
    pomodoroMinutes: 25,
    pomodoroSessions: {},
    createdAt: formatDate(new Date()),
    sortOrder: Date.now(),
    ...habitData,
  };
}

export function toggleHabitCheck(habit: Habit, date: string): Habit {
  const checks = { ...habit.checks };
  if (checks[date]) delete checks[date];
  else checks[date] = true;
  return { ...habit, checks };
}

export function toggleFreeze(habit: Habit, date: string): Habit {
  const frozenDates = habit.frozenDates.includes(date)
    ? habit.frozenDates.filter((d) => d !== date)
    : [...habit.frozenDates, date];
  return { ...habit, frozenDates };
}

export function createBundle(name: string, startDate: string, endDate: string): Bundle {
  return {
    id: generateId(),
    name,
    startDate,
    endDate,
    active: true,
    color: '#6750A4',
    createdAt: formatDate(new Date()),
  };
}

export function extendBundle(bundle: Bundle, days: number): Bundle {
  const end = new Date(bundle.endDate);
  end.setDate(end.getDate() + days);
  return { ...bundle, endDate: formatDate(end) };
}
