# Ripple

Material Design 3 Habit Tracker with dynamic color theming.

## Features

- **Habits** — Weekly grid with check tracking, goal management, icon picker, inline editing
- **Bundles** — Named date ranges with activation and extension
- **Analytics** — Stats cards, year heatmap, day-of-week chart, per-habit breakdown, CSV export
- **Pomodoro Timer** — Per-habit focus sessions with configurable duration
- **Themes** — Dynamic MD3 color extraction from wallpaper images, community theme packs
- **GitHub Sync** — Cloud backup via PAT
- **Streak Freeze** — Freeze streaks (1/week)
- **Notifications** — Web Notification API reminders
- **Quick Add** — Add habits directly from analytics

## Tech Stack

- React 19 + TypeScript
- Vite 6
- Material UI 6
- Material Color Utilities (MD3)
- Framer Motion

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deploy

Push to main triggers automatic GitHub Pages deployment via GitHub Actions.
