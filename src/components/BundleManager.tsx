import { useState } from 'react';
import {
  Card, CardContent, Typography, Box, Button, IconButton, Chip, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, Tooltip,
} from '@mui/material';
import {
  Add, Delete, PlayArrow, Pause, PlusOne, CalendarMonth,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import type { Bundle } from '../types';
import { formatDate, addDays } from '../utils';

interface BundleManagerProps {
  bundles: Bundle[];
  onAdd: (name: string, start: string, end: string) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string) => void;
  onExtend: (id: string, days: number) => void;
}

export default function BundleManager({
  bundles, onAdd, onDelete, onToggleActive, onExtend,
}: BundleManagerProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [start, setStart] = useState(formatDate(new Date()));
  const [end, setEnd] = useState(formatDate(addDays(new Date(), 7)));

  const handleAdd = () => {
    if (!name.trim()) return;
    onAdd(name.trim(), start, end);
    setName('');
    setDialogOpen(false);
  };

  const active = bundles.filter((b) => b.active);
  const inactive = bundles.filter((b) => !b.active);

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h6" fontWeight={600}>Bundles</Typography>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Add />}
            onClick={() => setDialogOpen(true)}
          >
            New
          </Button>
        </Box>

        {bundles.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
            No bundles yet. Create a bundle to group habits over a date range.
          </Typography>
        )}

        <AnimatePresence>
          {[...active, ...inactive].map((b) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  py: 1,
                  px: 1.5,
                  mb: 0.5,
                  borderRadius: 2,
                  bgcolor: 'action.hover',
                  opacity: b.active ? 1 : 0.5,
                }}
              >
                <CalendarMonth sx={{ color: b.color, fontSize: 20 }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={600} noWrap>
                    {b.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {b.startDate} — {b.endDate}
                  </Typography>
                </Box>
                <Chip
                  label={`${b.startDate} to ${b.endDate}`}
                  size="small"
                  variant="outlined"
                  sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
                />
                <Tooltip title={b.active ? 'Pause' : 'Activate'}>
                  <IconButton size="small" onClick={() => onToggleActive(b.id)}>
                    {b.active ? <Pause fontSize="small" /> : <PlayArrow fontSize="small" />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Extend 7 days">
                  <IconButton size="small" onClick={() => onExtend(b.id, 7)}>
                    <PlusOne fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton size="small" onClick={() => onDelete(b.id)}>
                    <Delete fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </motion.div>
          ))}
        </AnimatePresence>
      </CardContent>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>New Bundle</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Bundle name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ mb: 2 }}
            autoFocus
          />
          <TextField
            fullWidth
            label="Start date"
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            sx={{ mb: 2 }}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            fullWidth
            label="End date"
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAdd} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
