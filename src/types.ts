export interface Habit {
  id: string;
  name: string;
  icon: string;
  goal: number;
  checks: Record<string, boolean>;
  frozenDates: string[];
  notes: Record<string, string>;
  pomodoroMinutes: number;
  pomodoroSessions: Record<string, number>;
  createdAt: string;
  sortOrder: number;
}

export interface Bundle {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  active: boolean;
  color: string;
  createdAt: string;
}

export interface ThemePack {
  id: string;
  name: string;
  light: Record<string, string>;
  dark: Record<string, string>;
}

export interface AppData {
  habits: Habit[];
  bundles: Bundle[];
  currentThemePack: string;
  darkMode: boolean;
  density: 'compact' | 'comfortable';
  currentPage: string;
  githubConfig: {
    token: string;
    owner: string;
    repo: string;
    path: string;
  } | null;
}
