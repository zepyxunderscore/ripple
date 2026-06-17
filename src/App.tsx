import { useMemo, useState } from 'react';
import {
  ThemeProvider, createTheme, CssBaseline, BottomNavigation, BottomNavigationAction,
  Box, Fab, Tooltip,
} from '@mui/material';
import {
  CheckCircleOutline, BarChart, TimerOutlined, Settings,
} from '@mui/icons-material';
import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from './hooks/useApp';
import { themeToMui, getCachedThemePacks, fetchThemePacks } from './theme';
import HabitGrid from './components/HabitGrid';
import AnalyticsPanel from './components/AnalyticsPanel';
import PomodoroTimer from './components/PomodoroTimer';
import SettingsDrawer from './components/SettingsDrawer';
import Confetti from './components/Confetti';

const DEFAULT_THEME_COLORS = {
  primary: '#6750A4', onPrimary: '#FFFFFF', primaryContainer: '#EADDFF', onPrimaryContainer: '#21005D',
  secondary: '#625B71', onSecondary: '#FFFFFF', secondaryContainer: '#E8DEF8', onSecondaryContainer: '#1D192B',
  tertiary: '#7D5260', onTertiary: '#FFFFFF', tertiaryContainer: '#FFD8E4', onTertiaryContainer: '#31111D',
  error: '#B3261E', onError: '#FFFFFF', errorContainer: '#F9DEDC', onErrorContainer: '#410E0B',
  background: '#FFFBFE', onBackground: '#1C1B1F', surface: '#FFFBFE', onSurface: '#1C1B1F',
  surfaceVariant: '#E7E0EC', onSurfaceVariant: '#49454F', outline: '#79747E', outlineVariant: '#CAC4D0',
  shadow: '#000000', scrim: '#000000', inverseSurface: '#313033', inverseOnSurface: '#F4EFF4', inversePrimary: '#D0BCFF',
};

const pages = ['habits', 'analytics', 'pomodoro'] as const;
type Page = (typeof pages)[number];

const pageIcons = {
  habits: <CheckCircleOutline />,
  analytics: <BarChart />,
  pomodoro: <TimerOutlined />,
};

const pageLabels = {
  habits: 'Habits',
  analytics: 'Analytics',
  pomodoro: 'Timer',
};

export default function App() {
  const app = useApp();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const themePacks = useMemo(() => getCachedThemePacks(), [app.data.currentThemePack]);

  const muiTheme = useMemo(() => {
    const pack = themePacks.find((t) => t.id === app.data.currentThemePack);
    const colors = pack
      ? (app.data.darkMode ? pack.dark : pack.light)
      : (app.data.darkMode
        ? { ...DEFAULT_THEME_COLORS, background: '#1C1B1F', surface: '#1C1B1F', onBackground: '#E6E1E5', onSurface: '#E6E1E5' }
        : DEFAULT_THEME_COLORS);
    return createTheme(themeToMui(colors, app.data.darkMode));
  }, [app.data.currentThemePack, app.data.darkMode, themePacks]);

  const page = (app.data.currentPage || 'habits') as Page;
  const setPage = (p: Page) => app.setPage(p);

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100dvh',
        pb: { xs: 7, sm: 0 },
      }}>
        <Box sx={{ flex: 1, overflow: 'auto', px: { xs: 1, sm: 2 }, py: 2 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              {page === 'habits' && (
                <HabitGrid
                  habits={app.data.habits}
                  weekOffset={app.weekOffset}
                  setWeekOffset={app.setWeekOffset}
                  density={app.data.density}
                  bundles={app.data.bundles}
                  onAdd={app.addHabit}
                  onRename={app.renameHabit}
                  onDelete={app.deleteHabit}
                  onUpdateIcon={app.updateHabitIcon}
                  onUpdateGoal={app.updateHabitGoal}
                  onToggleCheck={app.toggleCheck}
                  onFreeze={app.freezeStreak}
                  onUpdateNote={app.updateNote}
                  onReorder={app.reorderHabits}
                  onAddBundle={app.addBundle}
                  onDeleteBundle={app.deleteBundle}
                  onToggleBundleActive={app.toggleBundleActive}
                  onExtendBundle={app.extendBundleAction}
                />
              )}
              {page === 'analytics' && (
                <AnalyticsPanel
                  habits={app.data.habits}
                  bundles={app.data.bundles}
                  weeksOffset={app.weekOffset}
                  onAddHabit={app.addHabit}
                />
              )}
              {page === 'pomodoro' && (
                <PomodoroTimer
                  habits={app.data.habits}
                  onAddSession={app.addPomodoroSession}
                  onSetMinutes={app.setPomodoroMinutes}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </Box>

        <BottomNavigation
          value={page}
          onChange={(_, v) => setPage(v)}
          sx={{
            display: { xs: 'flex', sm: 'none' },
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1200,
            borderTop: '1px solid',
            borderColor: 'divider',
            height: 64,
            '& .MuiBottomNavigationAction-root': {
              minWidth: 0,
              py: 0.5,
            },
          }}
          showLabels
        >
          {pages.map((p) => (
            <BottomNavigationAction
              key={p}
              value={p}
              icon={pageIcons[p]}
              label={pageLabels[p]}
            />
          ))}
          <BottomNavigationAction
            icon={<Settings />}
            label="Settings"
            onClick={() => setSettingsOpen(true)}
          />
        </BottomNavigation>

        <Tooltip title="Settings" placement="left">
          <Fab
            color="primary"
            size="medium"
            onClick={() => setSettingsOpen(true)}
            sx={{
              display: { xs: 'none', sm: 'flex' },
              position: 'fixed',
              bottom: 24,
              right: 24,
              zIndex: 1200,
            }}
          >
            <Settings />
          </Fab>
        </Tooltip>
      </Box>

      <SettingsDrawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        darkMode={app.data.darkMode}
        onToggleDarkMode={app.toggleDarkMode}
        density={app.data.density}
        onToggleDensity={app.toggleDensity}
        currentThemePack={app.data.currentThemePack}
        onSetThemePack={app.setThemePack}
        onApplyCustomColor={app.applyCustomColor}
        themePacks={app.themePacks}
        onFetchThemes={() => {
          fetchThemePacks().then(app.setThemePacks);
        }}
        githubConfig={app.data.githubConfig}
        onSetGithubConfig={app.setGithubConfig}
        onSignOut={app.signOut}
        onSetPage={(p: string) => setPage(p as Page)}
      />

      <Confetti show={false} />
    </ThemeProvider>
  );
}
