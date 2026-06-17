import { useState, useMemo } from 'react';
import {
  Box, Typography, IconButton, TextField, Tooltip,
  Button, Menu, MenuItem, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, Paper,
} from '@mui/material';
import {
  Add, Delete, Edit, MoreVert, CheckCircleOutline, CheckCircle,
  AcUnit, Flag, DragIndicator, Remove, Add as AddIcon,
  Favorite, Star, Whatshot, DirectionsRun, LocalDining, MenuBook,
  School, Work, Home, ShoppingCart, Pets, Flight, Pool, WbSunny,
  Bedtime, WaterDrop, Coffee, MusicNote, Brush, Code, PhoneIphone,
  EmojiEvents, TrackChanges, ShowChart, Timeline, TrendingUp,
  TipsAndUpdates, Psychology, HealthAndSafety,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import type { Habit, Bundle } from '../types';
import {
  getWeekDates, formatDate, addDays, WEEKDAYS, computeStreak, computeWeekCount,
} from '../utils';
import WeekNav from './WeekNav';
import IconPicker from './IconPicker';
import BundleManager from './BundleManager';

interface HabitGridProps {
  habits: Habit[];
  weekOffset: number;
  setWeekOffset: (offset: number) => void;
  density: 'compact' | 'comfortable';
  bundles: Bundle[];
  onAdd: (name: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onUpdateIcon: (id: string, icon: string) => void;
  onUpdateGoal: (id: string, goal: number) => void;
  onToggleCheck: (id: string, date: string) => void;
  onFreeze: (id: string, date: string) => void;
  onUpdateNote: (id: string, date: string, note: string) => void;
  onReorder: (habits: Habit[]) => void;
  onAddBundle: (name: string, start: string, end: string) => void;
  onDeleteBundle: (id: string) => void;
  onToggleBundleActive: (id: string) => void;
  onExtendBundle: (id: string, days: number) => void;
}

export default function HabitGrid({
  habits, weekOffset, setWeekOffset, density, bundles,
  onAdd, onRename, onDelete, onUpdateIcon, onUpdateGoal,
  onToggleCheck, onFreeze,
  onAddBundle, onDeleteBundle, onToggleBundleActive, onExtendBundle,
}: HabitGridProps) {
  const [newHabitName, setNewHabitName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [iconPickerHabit, setIconPickerHabit] = useState<string | null>(null);
  const [_noteDialog, _setNoteDialog] = useState<{ habitId: string; date: string; note: string } | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<{ el: HTMLElement; habitId: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const today = new Date();
  const refDate = addDays(today, weekOffset * 7);
  const weekDates = getWeekDates(refDate);

  const sortedHabits = useMemo(() =>
    [...habits].sort((a, b) => a.sortOrder - b.sortOrder),
    [habits],
  );

  const handleAdd = () => {
    if (!newHabitName.trim()) return;
    onAdd(newHabitName.trim());
    setNewHabitName('');
  };

  const startEditing = (habit: Habit) => {
    setEditingId(habit.id);
    setEditName(habit.name);
  };

  const commitRename = () => {
    if (editingId && editName.trim()) {
      onRename(editingId, editName.trim());
    }
    setEditingId(null);
  };

  const isToday = (d: Date) => {
    const t = formatDate(d);
    const n = formatDate(today);
    return t === n;
  };

  const getGoalStatus = (habit: Habit) => {
    const count = computeWeekCount(habit.checks, weekDates[0]);
    return { count, goal: habit.goal, complete: count >= habit.goal };
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>Habits</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAdd}
            sx={{ textTransform: 'none' }}
          >
            Add
          </Button>
        </Box>
      </Box>

      <BundleManager
        bundles={bundles}
        onAdd={onAddBundle}
        onDelete={onDeleteBundle}
        onToggleActive={onToggleBundleActive}
        onExtend={onExtendBundle}
      />

      <WeekNav
        weekOffset={weekOffset}
        onPrev={() => setWeekOffset(weekOffset - 1)}
        onNext={() => setWeekOffset(weekOffset + 1)}
        onToday={() => setWeekOffset(0)}
      />

      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
        <Box sx={{ width: { xs: 100, sm: 140 }, flexShrink: 0 }} />
        {weekDates.map((d, i) => (
          <Box
            key={i}
            sx={{
              flex: 1,
              textAlign: 'center',
              minWidth: 32,
              maxWidth: 48,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: isToday(d) ? 'primary.main' : 'text.secondary',
                fontSize: '0.65rem',
              }}
            >
              {WEEKDAYS[i]}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: isToday(d) ? 700 : 500,
                color: isToday(d) ? 'primary.main' : 'text.primary',
                lineHeight: 1,
              }}
            >
              {d.getDate()}
            </Typography>
          </Box>
        ))}
        <Box sx={{ width: 32, flexShrink: 0 }} />
      </Box>

      <AnimatePresence>
        {sortedHabits.map((habit) => {
          const goal = getGoalStatus(habit);
          const streak = computeStreak(habit.checks, habit.frozenDates);
          const isEditing = editingId === habit.id;

          return (
            <motion.div
              key={habit.id}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              layout
            >
              <Paper
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  py: density === 'compact' ? 0.5 : 1,
                  px: 1,
                  mb: 0.5,
                  borderRadius: 3,
                  bgcolor: goal.complete ? 'primaryContainer' : 'background.paper',
                  transition: 'background-color 0.3s',
                  border: '1px solid',
                  borderColor: 'divider',
                  position: 'relative',
                }}
                elevation={0}
              >
                <Box
                  sx={{
                    width: { xs: 100, sm: 140 },
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                  }}
                >
                  <DragIndicator
                    fontSize="small"
                    sx={{ color: 'text.disabled', cursor: 'grab', display: { xs: 'none', sm: 'block' } }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => setIconPickerHabit(habit.id)}
                    sx={{ borderRadius: 1, p: 0.5 }}
                    aria-label="Change icon"
                  >
                    {habit.icon && (
                      <Box
                        component="span"
                        sx={{ fontSize: density === 'compact' ? 18 : 22, lineHeight: 1 }}
                      >
                        <IconDisplay name={habit.icon} />
                      </Box>
                    )}
                  </IconButton>
                  {isEditing ? (
                    <TextField
                      size="small"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onBlur={commitRename}
                      onKeyDown={(e) => e.key === 'Enter' && commitRename()}
                      autoFocus
                      sx={{
                        '& .MuiInputBase-input': { py: 0.5, px: 1, fontSize: '0.85rem' },
                        flex: 1,
                      }}
                    />
                  ) : (
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      noWrap
                      sx={{
                        flex: 1,
                        cursor: 'pointer',
                        fontSize: density === 'compact' ? '0.8rem' : '0.9rem',
                      }}
                      onClick={() => startEditing(habit)}
                    >
                      {habit.name}
                      {streak >= 7 && <span style={{ marginLeft: 4 }}>🔥</span>}
                    </Typography>
                  )}
                </Box>

                {weekDates.map((d) => {
                  const ds = formatDate(d);
                  const checked = habit.checks[ds] || false;
                  const frozen = habit.frozenDates.includes(ds);

                  return (
                    <Box
                      key={ds}
                      sx={{
                        flex: 1,
                        textAlign: 'center',
                        minWidth: 32,
                        maxWidth: 48,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 0.25,
                      }}
                    >
                      <Tooltip title={frozen ? 'Frozen' : (checked ? 'Checked' : 'Not checked')}>
                        <IconButton
                          size="small"
                          onClick={() => onToggleCheck(habit.id, ds)}
                          sx={{
                            p: 0.5,
                            borderRadius: 1,
                            color: checked ? 'primary.main' : 'text.disabled',
                            opacity: d > today ? 0.3 : 1,
                          }}
                          disabled={d > today}
                          aria-label={`Toggle ${formatDate(d)}`}
                        >
                          {frozen ? (
                            <AcUnit fontSize="small" sx={{ color: 'info.main' }} />
                          ) : checked ? (
                            <CheckCircle fontSize={density === 'compact' ? 'small' : 'medium'} />
                          ) : (
                            <CheckCircleOutline fontSize={density === 'compact' ? 'small' : 'medium'} />
                          )}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  );
                })}

                <Box sx={{ width: 32, flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
                  <Tooltip title="More actions">
                    <IconButton
                      size="small"
                      onClick={(e) => setMenuAnchor({ el: e.currentTarget, habitId: habit.id })}
                      aria-label="Habit menu"
                    >
                      <MoreVert fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Paper>

              {/* Goal indicator row */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  mb: 1,
                  px: { xs: 1, sm: 2 },
                }}
              >
                <Box sx={{ width: { xs: 100, sm: 140 }, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                    <IconButton
                      size="small"
                      onClick={() => onUpdateGoal(habit.id, habit.goal - 1)}
                      sx={{ p: 0.25 }}
                    >
                      <Remove fontSize="small" />
                    </IconButton>
                    <Chip
                      label={`${goal.count}/${habit.goal}`}
                      size="small"
                      color={goal.complete ? 'success' : 'default'}
                      variant={goal.complete ? 'filled' : 'outlined'}
                      sx={{ height: 22, '& .MuiChip-label': { px: 1, fontSize: '0.7rem' } }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => onUpdateGoal(habit.id, habit.goal + 1)}
                      sx={{ p: 0.25 }}
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  {goal.complete && (
                    <Tooltip title="Goal completed!">
                      <Flag sx={{ color: 'success.main', fontSize: 16 }} />
                    </Tooltip>
                  )}
                </Box>
                <Box sx={{ flex: 1, display: 'flex', gap: '2px', justifyContent: 'flex-start' }}>
                  {Array.from({ length: habit.goal }, (_, i) => (
                    <Box
                      key={i}
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        bgcolor: i < goal.count ? 'primary.main' : 'action.hover',
                        transition: 'background-color 0.3s',
                      }}
                    />
                  ))}
                </Box>
                <Box sx={{ width: 32, flexShrink: 0 }} />
              </Box>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {habits.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            No habits yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Add your first habit to get started
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, maxWidth: 300, mx: 'auto' }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Habit name"
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <Button variant="contained" onClick={handleAdd}>Add</Button>
          </Box>
        </Box>
      )}

      {habits.length > 0 && (
        <Box sx={{ display: 'flex', gap: 1, maxWidth: 400, mt: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="New habit name"
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <Button variant="contained" onClick={handleAdd} sx={{ textTransform: 'none' }}>
            Add
          </Button>
        </Box>
      )}

      <IconPicker
        open={!!iconPickerHabit}
        onClose={() => setIconPickerHabit(null)}
        onSelect={(icon) => {
          if (iconPickerHabit) {
            onUpdateIcon(iconPickerHabit, icon);
            setIconPickerHabit(null);
          }
        }}
      />

      <Menu
        anchorEl={menuAnchor?.el}
        open={!!menuAnchor}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem onClick={() => {
          if (menuAnchor) startEditing(habits.find((h) => h.id === menuAnchor.habitId)!);
          setMenuAnchor(null);
        }}>
          <Edit fontSize="small" sx={{ mr: 1 }} /> Rename
        </MenuItem>
        <MenuItem onClick={() => {
          if (menuAnchor) setIconPickerHabit(menuAnchor.habitId);
          setMenuAnchor(null);
        }}>
          <Flag fontSize="small" sx={{ mr: 1 }} /> Change icon
        </MenuItem>
        <MenuItem onClick={() => {
          if (menuAnchor) {
            const h = habits.find((x) => x.id === menuAnchor.habitId);
            if (h) {
              const todayStr = formatDate(new Date());
              onFreeze(h.id, todayStr);
            }
          }
          setMenuAnchor(null);
        }}>
          <AcUnit fontSize="small" sx={{ mr: 1 }} /> Freeze streak
        </MenuItem>
        <MenuItem onClick={() => {
          if (menuAnchor) setDeleteConfirm(menuAnchor.habitId);
          setMenuAnchor(null);
        }} sx={{ color: 'error.main' }}>
          <Delete fontSize="small" sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>Delete Habit?</DialogTitle>
        <DialogContent>
          <Typography>This will permanently remove this habit and all its data.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button
            onClick={() => {
              if (deleteConfirm) onDelete(deleteConfirm);
              setDeleteConfirm(null);
            }}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

const iconComponents: Record<string, React.ElementType> = {
  CheckCircle: CheckCircleOutline, Favorite, Star, Whatshot, DirectionsRun,
  LocalDining, MenuBook, School, Work, Home, ShoppingCart, Pets, Flight,
  Pool, WbSunny, Bedtime, WaterDrop, Coffee, MusicNote, Brush, Code,
  PhoneIphone, EmojiEvents, TrackChanges, ShowChart, Timeline, TrendingUp,
  TipsAndUpdates, Psychology, HealthAndSafety,
  SelfImprovement: TipsAndUpdates, FitnessCenter: Whatshot,
  SmokingRooms: Whatshot, Shower: WaterDrop, Bathroom: WaterDrop,
  Piano: MusicNote, Skateboarding: DirectionsRun,
  Cycling: DirectionsRun, Hiking: DirectionsRun,
};

function IconDisplay({ name }: { name: string }) {
  const Component = iconComponents[name];
  if (Component) return <Component fontSize="inherit" />;
  return <CheckCircleOutline fontSize="inherit" />;
}
