import { Hct, SchemeContent } from '@material/material-color-utilities';
import type { ThemePack } from './types';

const FETCHED_THEMES_KEY = 'ripple_fetched_themes';

export function argbFromHex(hex: string): number {
  const h = hex.replace('#', '');
  return parseInt(h, 16) + (h.length === 6 ? 0xff000000 : 0);
}

export function hexFromArgb(argb: number): string {
  return '#' + argb.toString(16).padStart(8, '0').slice(2);
}

export function generateThemeFromColor(hex: string, isDark: boolean): Record<string, string> {
  const argb = argbFromHex(hex);
  const scheme = isDark ? new SchemeContent(Hct.fromInt(argb), true, 0) : new SchemeContent(Hct.fromInt(argb), false, 0);

  return {
    primary: hexFromArgb(scheme.primary),
    onPrimary: hexFromArgb(scheme.onPrimary),
    primaryContainer: hexFromArgb(scheme.primaryContainer),
    onPrimaryContainer: hexFromArgb(scheme.onPrimaryContainer),
    secondary: hexFromArgb(scheme.secondary),
    onSecondary: hexFromArgb(scheme.onSecondary),
    secondaryContainer: hexFromArgb(scheme.secondaryContainer),
    onSecondaryContainer: hexFromArgb(scheme.onSecondaryContainer),
    tertiary: hexFromArgb(scheme.tertiary),
    onTertiary: hexFromArgb(scheme.onTertiary),
    tertiaryContainer: hexFromArgb(scheme.tertiaryContainer),
    onTertiaryContainer: hexFromArgb(scheme.onTertiaryContainer),
    error: hexFromArgb(scheme.error),
    onError: hexFromArgb(scheme.onError),
    errorContainer: hexFromArgb(scheme.errorContainer),
    onErrorContainer: hexFromArgb(scheme.onErrorContainer),
    background: hexFromArgb(scheme.background),
    onBackground: hexFromArgb(scheme.onBackground),
    surface: hexFromArgb(scheme.surface),
    onSurface: hexFromArgb(scheme.onSurface),
    surfaceVariant: hexFromArgb(scheme.surfaceVariant),
    onSurfaceVariant: hexFromArgb(scheme.onSurfaceVariant),
    outline: hexFromArgb(scheme.outline),
    outlineVariant: hexFromArgb(scheme.outlineVariant),
    shadow: hexFromArgb(scheme.shadow),
    scrim: hexFromArgb(scheme.scrim),
    inverseSurface: hexFromArgb(scheme.inverseSurface),
    inverseOnSurface: hexFromArgb(scheme.inverseOnSurface),
    inversePrimary: hexFromArgb(scheme.inversePrimary),
  };
}

export function applyThemeCSSVars(colors: Record<string, string>) {
  const root = document.documentElement;
  Object.entries(colors).forEach(([key, val]) => {
    const cssVar = `--md-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
    root.style.setProperty(cssVar, val);
  });
}

export function themeToMui(colors: Record<string, string>, isDark: boolean) {
  return {
    palette: {
      mode: (isDark ? 'dark' : 'light') as 'dark' | 'light',
      primary: { main: colors.primary, light: colors.primaryContainer, dark: colors.primaryContainer },
      secondary: { main: colors.secondary, light: colors.secondaryContainer, dark: colors.secondaryContainer },
      tertiary: { main: colors.tertiary, light: colors.tertiaryContainer, dark: colors.tertiaryContainer },
      error: { main: colors.error, light: colors.errorContainer, dark: colors.errorContainer },
      background: { default: colors.background, paper: colors.surface },
      text: { primary: colors.onSurface, secondary: colors.onSurfaceVariant },
      divider: colors.outlineVariant,
    },
    shape: { borderRadius: 16 },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    components: {
      MuiCard: { styleOverrides: { root: { borderRadius: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' } } },
      MuiButton: { styleOverrides: { root: { borderRadius: 20, textTransform: 'none', fontWeight: 600 } } },
      MuiChip: { styleOverrides: { root: { borderRadius: 12 } } },
      MuiDialog: { styleOverrides: { paper: { borderRadius: 28 } } },
      MuiDrawer: { styleOverrides: { paper: { borderRadius: '24px 0 0 24px' } } },
    },
  };
}

export function extractColorsFromImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      let r = 0, g = 0, b = 0, count = 0;
      for (let i = 0; i < pixels.length; i += 16) {
        r += pixels[i];
        g += pixels[i + 1];
        b += pixels[i + 2];
        count++;
      }
      r = Math.round(r / count);
      g = Math.round(g / count);
      b = Math.round(b / count);
      const hex = '#' + [r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('');
      resolve(hex);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

const DEFAULT_THEMES_URL = 'https://raw.githubusercontent.com/xZepyx/md3-themes/main/themes.json';

export async function fetchThemePacks(url?: string): Promise<ThemePack[]> {
  const u = url || DEFAULT_THEMES_URL;
  try {
    const res = await fetch(u);
    if (!res.ok) throw new Error('Failed to fetch themes');
    const data = await res.json();
    if (Array.isArray(data)) {
      localStorage.setItem(FETCHED_THEMES_KEY, JSON.stringify(data));
      return data;
    }
    return [];
  } catch {
    const cached = localStorage.getItem(FETCHED_THEMES_KEY);
    return cached ? JSON.parse(cached) : [];
  }
}

export function getCachedThemePacks(): ThemePack[] {
  const cached = localStorage.getItem(FETCHED_THEMES_KEY);
  return cached ? JSON.parse(cached) : [];
}

export function cacheThemePack(pack: ThemePack) {
  const existing = getCachedThemePacks();
  const idx = existing.findIndex((t) => t.id === pack.id);
  if (idx >= 0) existing[idx] = pack;
  else existing.push(pack);
  localStorage.setItem(FETCHED_THEMES_KEY, JSON.stringify(existing));
}
