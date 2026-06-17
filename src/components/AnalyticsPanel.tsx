import { useMemo, useState } from 'react';
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField, Button, Tooltip, LinearProgress,
} from '@mui/material';
import { Add, FileDownload, Notifications } from '@mui/icons-material';
import type { Habit, Bundle } from '../types';
import { computeStreak, computeRate, computeWeekCount, formatDate, getWeekDates, addDays, getYearGrid, WEEKDAYS, downloadCSV } from '../utils';
import { useNotifications } from '../hooks/useNotifications';

interface AnalyticsPanelProps {
  habits: Habit[];
  bundles: Bundle[];
  weeksOffset: number;
  onAddHabit: (name: string) => void;
}

export default function AnalyticsPanel({ habits, bundles, weeksOffset, onAddHabit }: AnalyticsPanelProps) {
  const [quickAddName, setQuickAddName] = useState('');
  const activeBundles = bundles.filter((b) => b.active);

  const today = new Date();
  const refDate = addDays(today, weeksOffset * 7);

  const stats = useMemo(() => {
    if (habits.length === 0) return null;
    const rates = habits.map((h) => computeRate(h.checks, 30));
    const streaks = habits.map((h) => computeStreak(h.checks, h.frozenDates));
    const weekCounts = habits.map((h) => computeWeekCount(h.checks, getWeekDates(refDate)[0]));
    const avgRate = Math.round(rates.reduce((a, b) => a + b, 0) / rates.length);
    const bestStreak = Math.max(...streaks);
    const avgWeekPct = Math.round(weekCounts.reduce((a, b) => a + b, 0) / (weekCounts.length * 7) * 100);
    return { avgRate, bestStreak, avgWeekPct, totalHabits: habits.length };
  }, [habits, refDate]);

  const yearGrid = useMemo(() => getYearGrid(today.getFullYear()), [today]);
  const yearHeatmap = useMemo(() => {
    const allDates = yearGrid.flatMap((m) => m.days);
    return allDates.map((d) => {
      const ds = formatDate(d);
      const count = habits.filter((h) => h.checks[ds]).length;
      const intensity = count / Math.max(1, habits.length);
      return { date: ds, count, intensity };
    });
  }, [habits, yearGrid]);

  const dayOfWeekData = useMemo(() => {
    const dayCounts = [0, 0, 0, 0, 0, 0, 0];
    habits.forEach((h) => {
      Object.keys(h.checks).forEach((ds) => {
        const d = new Date(ds);
        const day = d.getDay();
        const idx = day === 0 ? 6 : day - 1;
        dayCounts[idx]++;
      });
    });
    const max = Math.max(1, ...dayCounts);
    return dayCounts.map((c, i) => ({ day: WEEKDAYS[i], count: c, pct: Math.round((c / max) * 100) }));
  }, [habits]);

  const { requestPermission, sendNotification } = useNotifications();

  const handleQuickAdd = () => {
    if (!quickAddName.trim()) return;
    onAddHabit(quickAddName.trim());
    setQuickAddName('');
  };

  const handleExportCSV = () => {
    const rows: string[][] = [['Habit', 'Date', 'Checked', 'Note', 'Sessions']];
    habits.forEach((h) => {
      Object.keys(h.checks).forEach((date) => {
        rows.push([h.name, date, h.checks[date] ? 'Yes' : 'No', h.notes[date] || '', String(h.pomodoroSessions[date] || 0)]);
      });
    });
    downloadCSV('ripple-habits.csv', rows);
  };

  const handleRequestNotify = async () => {
    const granted = await requestPermission();
    if (granted) {
      sendNotification('Ripple', 'Notifications enabled!');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h5" fontWeight={700}>Analytics</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" variant="outlined" startIcon={<FileDownload />} onClick={handleExportCSV} sx={{ textTransform: 'none' }}>
            Export CSV
          </Button>
          <Button size="small" variant="outlined" startIcon={<Notifications />} onClick={handleRequestNotify} sx={{ textTransform: 'none' }}>
            Notify
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr 1fr' }, gap: 2, mb: 3 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h4" fontWeight={700} color="primary">
              {stats?.avgRate ?? 0}%
            </Typography>
            <Typography variant="caption" color="text.secondary">30-day rate</Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h4" fontWeight={700} color="primary">
              {stats?.bestStreak ?? 0}{stats?.bestStreak ? (stats.bestStreak >= 7 ? ' 🔥' : '') : ''}
            </Typography>
            <Typography variant="caption" color="text.secondary">Best streak</Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h4" fontWeight={700} color="primary">
              {stats?.avgWeekPct ?? 0}%
            </Typography>
            <Typography variant="caption" color="text.secondary">Week %</Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h4" fontWeight={700} color="primary">
              {stats?.totalHabits ?? 0}
            </Typography>
            <Typography variant="caption" color="text.secondary">Total habits</Typography>
          </CardContent>
        </Card>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Year Activity</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {yearGrid.map((m) => (
              <Box key={m.month} sx={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                <Typography variant="caption" sx={{ width: 28, fontSize: '0.65rem', color: 'text.secondary' }}>
                  {['J','F','M','A','M','J','J','A','S','O','N','D'][m.month]}
                </Typography>
                <Box sx={{ display: 'flex', gap: '2px', flexWrap: 'wrap' }}>
                  {m.days.map((d) => {
                    const ds = formatDate(d);
                    const entry = yearHeatmap.find((e) => e.date === ds);
                    const intensity = entry?.intensity ?? 0;
                    let bg = 'action.hover';
                    if (intensity > 0.66) bg = 'primary.main';
                    else if (intensity > 0.33) bg = 'primary.light';
                    else if (intensity > 0) bg = 'primaryContainer';
                    return (
                      <Tooltip key={ds} title={`${ds}: ${entry?.count ?? 0} habits`}>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '2px',
                            bgcolor: bg,
                            opacity: intensity > 0 ? 0.8 + intensity * 0.2 : 0.3,
                          }}
                        />
                      </Tooltip>
                    );
                  })}
                </Box>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Day of Week</Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end', height: 120 }}>
            {dayOfWeekData.map((d) => (
              <Box key={d.day} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                <Typography variant="caption" fontWeight={600}>{d.count}</Typography>
                <Box
                  sx={{
                    width: '100%',
                    maxWidth: 32,
                    height: `${Math.max(4, d.pct)}%`,
                    bgcolor: 'primary.main',
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 0.3s',
                    minHeight: 4,
                  }}
                />
                <Typography variant="caption" sx={{ mt: 0.5, fontSize: '0.65rem', color: 'text.secondary' }}>
                  {d.day}
                </Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      {activeBundles.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Bundle Activity</Typography>
            {activeBundles.map((b) => {
              const start = new Date(b.startDate);
              const end = new Date(b.endDate);
              const days: { date: string; count: number }[] = [];
              for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                const ds = formatDate(d);
                days.push({ date: ds, count: habits.filter((h) => h.checks[ds]).length });
              }
              return (
                <Box key={b.id} sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" fontWeight={600}>{b.name}</Typography>
                  <Box sx={{ display: 'flex', gap: '2px', flexWrap: 'wrap', mt: 0.5 }}>
                    {days.map((d) => {
                      const intensity = habits.length > 0 ? d.count / habits.length : 0;
                      let bg = 'action.hover';
                      if (intensity > 0.66) bg = 'tertiary';
                      else if (intensity > 0.33) bg = 'tertiaryContainer';
                      else if (intensity > 0) bg = 'secondaryContainer';
                      return (
                        <Tooltip key={d.date} title={`${d.date}: ${d.count}/${habits.length}`}>
                          <Box sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: bg, opacity: intensity > 0 ? 0.8 : 0.2 }} />
                        </Tooltip>
                      );
                    })}
                  </Box>
                </Box>
              );
            })}
          </CardContent>
        </Card>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Per Habit Breakdown</Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Habit</TableCell>
                  <TableCell align="center">Streak</TableCell>
                  <TableCell align="center">Week</TableCell>
                  <TableCell align="center">30-day</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {habits.map((h) => {
                  const streak = computeStreak(h.checks, h.frozenDates);
                  const weekCount = computeWeekCount(h.checks, getWeekDates(refDate)[0]);
                  const rate = computeRate(h.checks, 30);
                  return (
                    <TableRow key={h.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2">{h.name}</Typography>
                          {streak >= 7 && <Typography variant="caption">🔥</Typography>}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" fontWeight={600}>{streak}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center' }}>
                          <Typography variant="body2">{weekCount}/{h.goal}</Typography>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(100, (weekCount / h.goal) * 100)}
                            sx={{ width: 40, height: 4, borderRadius: 2 }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center' }}>
                          <Typography variant="body2">{rate}%</Typography>
                          <Box sx={{ display: 'flex', gap: '1px' }}>
                            {Array.from({ length: 10 }, (_, i) => (
                              <Box
                                key={i}
                                sx={{
                                  width: 4,
                                  height: 8,
                                  borderRadius: '1px',
                                  bgcolor: i < rate / 10 ? 'primary.main' : 'action.hover',
                                }}
                              />
                            ))}
                          </Box>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {habits.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Typography variant="body2" color="text.secondary">No habits yet</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Quick Add Habit</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              size="small"
              placeholder="Habit name"
              value={quickAddName}
              onChange={(e) => setQuickAddName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()}
              sx={{ flex: 1 }}
            />
            <Button variant="contained" startIcon={<Add />} onClick={handleQuickAdd} sx={{ textTransform: 'none' }}>
              Add
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
