import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Card, CardContent, Typography, Box, IconButton, Slider, Select, MenuItem,
  FormControl, InputLabel, Button, Chip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow,
} from '@mui/material';
import {
  PlayArrow, Pause, RestartAlt,
} from '@mui/icons-material';
import type { Habit } from '../types';
import { formatDate } from '../utils';

interface PomodoroTimerProps {
  habits: Habit[];
  onAddSession: (habitId: string, date: string) => void;
  onSetMinutes: (habitId: string, minutes: number) => void;
}

export default function PomodoroTimer({ habits, onAddSession, onSetMinutes }: PomodoroTimerProps) {
  const [selectedHabitId, setSelectedHabitId] = useState(habits[0]?.id || '');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const selectedHabit = habits.find((h) => h.id === selectedHabitId);

  useEffect(() => {
    if (selectedHabitId && selectedHabit) {
      setTimeLeft(selectedHabit.pomodoroMinutes * 60);
    }
  }, [selectedHabitId]);

  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setIsRunning(false);
            if (selectedHabitId) {
              onAddSession(selectedHabitId, formatDate(new Date()));
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, isPaused, selectedHabitId, onAddSession]);

  const startTimer = useCallback(() => {
    if (timeLeft <= 0) {
      setTimeLeft((selectedHabit?.pomodoroMinutes ?? 25) * 60);
    }
    setIsRunning(true);
    setIsPaused(false);
  }, [timeLeft, selectedHabit]);

  const pauseTimer = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resumeTimer = useCallback(() => {
    setIsPaused(false);
  }, []);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    if (selectedHabit) {
      setTimeLeft(selectedHabit.pomodoroMinutes * 60);
    }
  }, [selectedHabit]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const progress = selectedHabit
    ? 1 - timeLeft / (selectedHabit.pomodoroMinutes * 60)
    : 0;

  const handleMinutesChange = (_: any, val: number | number[]) => {
    const mins = val as number;
    if (selectedHabitId) {
      onSetMinutes(selectedHabitId, mins);
      if (!isRunning) setTimeLeft(mins * 60);
    }
  };

  const today = formatDate(new Date());

  const sortedHabits = [...habits].sort((a, b) => {
    const aSessions = a.pomodoroSessions[today] || 0;
    const bSessions = b.pomodoroSessions[today] || 0;
    return bSessions - aSessions;
  });

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>Pomodoro Timer</Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <FormControl fullWidth sx={{ mb: 3, maxWidth: 300, mx: 'auto' }}>
            <InputLabel>Focus Habit</InputLabel>
            <Select
              value={selectedHabitId}
              label="Focus Habit"
              onChange={(e) => {
                if (isRunning) resetTimer();
                setSelectedHabitId(e.target.value);
              }}
            >
              {habits.map((h) => (
                <MenuItem key={h.id} value={h.id}>{h.name}</MenuItem>
              ))}
              {habits.length === 0 && (
                <MenuItem disabled>No habits — create one first</MenuItem>
              )}
            </Select>
          </FormControl>

          <Box sx={{
            width: 200, height: 200, borderRadius: '50%',
            border: '4px solid', borderColor: isRunning ? 'primary.main' : 'divider',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            mx: 'auto', mb: 2, position: 'relative',
          }}>
            <Box sx={{
              position: 'absolute', inset: 4, borderRadius: '50%',
              background: `conic-gradient(var(--md-primary, #6750A4) ${progress * 360}deg, transparent ${progress * 360}deg)`,
              opacity: 0.15,
            }} />
            <Typography variant="h3" fontWeight={700} fontFamily="monospace">
              {formatTime(timeLeft)}
            </Typography>
          </Box>

          {selectedHabit && (
            <Box sx={{ maxWidth: 300, mx: 'auto', mb: 2 }}>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Duration: {selectedHabit.pomodoroMinutes} min
              </Typography>
              <Slider
                value={selectedHabit.pomodoroMinutes}
                onChange={handleMinutesChange}
                min={5}
                max={120}
                step={5}
                valueLabelDisplay="auto"
                valueLabelFormat={(v) => `${v} min`}
              />
            </Box>
          )}

          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
            {!isRunning ? (
              <Button
                variant="contained"
                size="large"
                startIcon={<PlayArrow />}
                onClick={startTimer}
                disabled={!selectedHabitId}
                sx={{ borderRadius: 20, px: 4 }}
              >
                Start
              </Button>
            ) : (
              <>
                {isPaused ? (
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<PlayArrow />}
                    onClick={resumeTimer}
                    sx={{ borderRadius: 20, px: 4 }}
                  >
                    Resume
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<Pause />}
                    onClick={pauseTimer}
                    sx={{ borderRadius: 20, px: 4 }}
                  >
                    Pause
                  </Button>
                )}
                <IconButton onClick={resetTimer} aria-label="Reset">
                  <RestartAlt />
                </IconButton>
              </>
            )}
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            Today's Sessions — {today}
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Habit</TableCell>
                  <TableCell align="center">Sessions</TableCell>
                  <TableCell align="center">Total Time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedHabits.map((h) => {
                  const sessions = h.pomodoroSessions[today] || 0;
                  return (
                    <TableRow key={h.id}>
                      <TableCell>{h.name}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={sessions}
                          size="small"
                          color={sessions > 0 ? 'primary' : 'default'}
                          variant={sessions > 0 ? 'filled' : 'outlined'}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">
                          {sessions * h.pomodoroMinutes} min
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {habits.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      <Typography variant="body2" color="text.secondary">No habits yet</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
