import { Box, IconButton, Typography, Button } from '@mui/material';
import { ChevronLeft, ChevronRight, Today } from '@mui/icons-material';
import { getWeekDates, formatDate, WEEKDAYS } from '../utils';

interface WeekNavProps {
  weekOffset: number;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

export default function WeekNav({ weekOffset, onPrev, onNext, onToday }: WeekNavProps) {
  const today = new Date();
  const refDate = new Date(today);
  refDate.setDate(refDate.getDate() + weekOffset * 7);
  const dates = getWeekDates(refDate);
  const startStr = formatDate(dates[0]);
  const endStr = formatDate(dates[6]);
  const isCurrentWeek = weekOffset === 0;

  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      mb: 2,
      flexWrap: 'wrap',
      gap: 1,
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <IconButton onClick={onPrev} size="small" aria-label="Previous week">
          <ChevronLeft />
        </IconButton>
        <Typography variant="subtitle1" fontWeight={600} sx={{ minWidth: 160, textAlign: 'center' }}>
          {startStr} — {endStr}
        </Typography>
        <IconButton onClick={onNext} size="small" aria-label="Next week">
          <ChevronRight />
        </IconButton>
        {!isCurrentWeek && (
          <Button
            size="small"
            startIcon={<Today />}
            onClick={onToday}
            sx={{ ml: 1, textTransform: 'none' }}
          >
            Today
          </Button>
        )}
      </Box>
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        {WEEKDAYS.map((d) => (
          <Typography
            key={d}
            variant="caption"
            sx={{
              width: 36,
              textAlign: 'center',
              fontWeight: 600,
              color: 'text.secondary',
              fontSize: '0.7rem',
            }}
          >
            {d}
          </Typography>
        ))}
      </Box>
    </Box>
  );
}
