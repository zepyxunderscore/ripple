import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, TextField, IconButton, Box, InputAdornment,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import * as Icons from '@mui/icons-material';

const COMMON_ICONS = [
  'CheckCircle', 'Favorite', 'Star', 'Whatshot', 'DirectionsRun', 'SelfImprovement',
  'LocalDining', 'MenuBook', 'School', 'Work', 'Home', 'ShoppingCart',
  'Pets', 'Flight', 'Pool', 'FitnessCenter', 'WbSunny', 'Bedtime',
  'WaterDrop', 'Coffee', 'MusicNote', 'Brush', 'Code', 'PhoneIphone',
  'SmokingRooms', 'EmojiEvents', 'TrackChanges', 'ShowChart', 'Timeline', 'TrendingUp',
  'TipsAndUpdates', 'Psychology', 'HealthAndSafety', 'Shower', 'Bathroom', 'Yard',
  'Piano', 'Skateboarding', 'Cycling', 'Hiking',
];

interface IconPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (icon: string) => void;
}

export default function IconPicker({ open, onClose, onSelect }: IconPickerProps) {
  const [search, setSearch] = useState('');
  const icons = COMMON_ICONS.filter((name) =>
    name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Pick an icon</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search icons..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 2, mt: 1 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            },
          }}
        />
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {icons.map((name) => {
            const IconComp = (Icons as any)[name];
            if (!IconComp) return null;
            return (
              <IconButton
                key={name}
                onClick={() => {
                  onSelect(name);
                  onClose();
                }}
                aria-label={name}
                sx={{ borderRadius: 2 }}
              >
                <IconComp />
              </IconButton>
            );
          })}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
