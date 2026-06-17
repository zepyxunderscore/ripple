import { useState } from 'react';
import {
  Drawer, Box, Typography, Switch, FormControlLabel, Button, Divider,
  IconButton, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  Chip, Tooltip, CircularProgress,
} from '@mui/material';
import {
  Close, DarkMode, LightMode, DensitySmall, Palette, CloudSync,
  Logout, Refresh, Info, FileUpload,
} from '@mui/icons-material';
import type { ThemePack } from '../types';
import { extractColorsFromImage } from '../theme';

interface SettingsDrawerProps {
  open: boolean;
  onClose: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  density: 'compact' | 'comfortable';
  onToggleDensity: () => void;
  currentThemePack: string;
  onSetThemePack: (id: string) => void;
  onApplyCustomColor: (hex: string) => void;
  themePacks: ThemePack[];
  onFetchThemes: () => void;
  githubConfig: { token: string; owner: string; repo: string; path: string } | null;
  onSetGithubConfig: (config: { token: string; owner: string; repo: string; path: string } | null) => void;
  onSignOut: () => void;
  onSetPage: (page: string) => void;
}

export default function SettingsDrawer({
  open, onClose, darkMode, onToggleDarkMode, density, onToggleDensity,
  currentThemePack, onSetThemePack, onApplyCustomColor, themePacks, onFetchThemes,
  githubConfig, onSetGithubConfig, onSignOut,
}: SettingsDrawerProps) {
  const [githubDialog, setGithubDialog] = useState(false);
  const [token, setToken] = useState(githubConfig?.token || '');
  const [owner, setOwner] = useState(githubConfig?.owner || '');
  const [repo, setRepo] = useState(githubConfig?.repo || '');
  const [path, setPath] = useState(githubConfig?.path || '');
  const [uploading, setUploading] = useState(false);

  const handleSaveGithub = () => {
    onSetGithubConfig({ token, owner, repo, path });
    setGithubDialog(false);
  };

  const handleClearGithub = () => {
    onSetGithubConfig(null);
    setGithubDialog(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const hex = await extractColorsFromImage(file);
      onApplyCustomColor(hex);
    } catch {}
    setUploading(false);
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 360 },
            borderRadius: '24px 0 0 24px',
            p: 2,
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" fontWeight={700}>Settings</Typography>
          <IconButton onClick={onClose} aria-label="Close settings">
            <Close />
          </IconButton>
        </Box>

        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, mt: 1 }}>
          <Palette sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
          Theme
        </Typography>

        <FormControlLabel
          control={<Switch checked={darkMode} onChange={onToggleDarkMode} />}
          label={darkMode ? <DarkMode fontSize="small" /> : <LightMode fontSize="small" />}
          sx={{ mb: 1 }}
        />

        <FormControlLabel
          control={<Switch checked={density === 'compact'} onChange={onToggleDensity} />}
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <DensitySmall fontSize="small" />
              <Typography variant="body2">Compact</Typography>
            </Box>
          }
          sx={{ mb: 2 }}
        />

        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            Color scheme
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
            {(themePacks.length > 0 ? themePacks : [
              { id: 'default', name: 'Default', light: { primary: '#6750A4' }, dark: {} },
            ]).map((pack) => (
              <Tooltip key={pack.id} title={pack.name}>
                <Chip
                  label={pack.name}
                  size="small"
                  variant={currentThemePack === pack.id ? 'filled' : 'outlined'}
                  color={currentThemePack === pack.id ? 'primary' : 'default'}
                  onClick={() => onSetThemePack(pack.id)}
                  sx={{ maxWidth: 120 }}
                />
              </Tooltip>
            ))}
          </Box>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Refresh />}
            onClick={onFetchThemes}
            sx={{ mr: 1, textTransform: 'none' }}
          >
            Fetch
          </Button>
          <Button
            size="small"
            variant="outlined"
            component="label"
            startIcon={uploading ? <CircularProgress size={16} /> : <FileUpload />}
            sx={{ textTransform: 'none' }}
          >
            Wallpaper
            <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
          </Button>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
          <CloudSync sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
          GitHub Sync
        </Typography>

        {githubConfig ? (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2">
              Connected: {githubConfig.owner}/{githubConfig.repo}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
              <Button size="small" variant="contained" startIcon={<CloudSync />} sx={{ textTransform: 'none', fontSize: '0.75rem' }}>
                Push
              </Button>
              <Button size="small" variant="outlined" startIcon={<CloudSync />} sx={{ textTransform: 'none', fontSize: '0.75rem' }}>
                Pull
              </Button>
              <Button size="small" variant="outlined" color="error" onClick={handleClearGithub} sx={{ textTransform: 'none', fontSize: '0.75rem' }}>
                Disconnect
              </Button>
            </Box>
          </Box>
        ) : (
          <Button
            size="small"
            variant="outlined"
            startIcon={<CloudSync />}
            onClick={() => setGithubDialog(true)}
            sx={{ mb: 2, textTransform: 'none' }}
          >
            Connect GitHub
          </Button>
        )}

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
          <Info sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
          About
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Ripple v1.0 — MD3 Habit Tracker
        </Typography>

        <Button
          variant="text"
          color="error"
          startIcon={<Logout />}
          onClick={onSignOut}
          sx={{ textTransform: 'none' }}
        >
          Sign Out
        </Button>
      </Drawer>

      <Dialog open={githubDialog} onClose={() => setGithubDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>GitHub Sync</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Personal Access Token"
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Owner"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            sx={{ mb: 2 }}
            placeholder="username"
          />
          <TextField
            fullWidth
            label="Repository"
            value={repo}
            onChange={(e) => setRepo(e.target.value)}
            sx={{ mb: 2 }}
            placeholder="repo-name"
          />
          <TextField
            fullWidth
            label="Path (e.g. data/ripple.json)"
            value={path}
            onChange={(e) => setPath(e.target.value)}
            placeholder="data/ripple.json"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGithubDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveGithub} variant="contained">Connect</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
