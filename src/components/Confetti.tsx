import { useEffect } from 'react';
import { Box } from '@mui/material';

interface ConfettiProps {
  show: boolean;
}

export default function Confetti({ show }: ConfettiProps) {
  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(() => {}, 3000);
    return () => clearTimeout(timer);
  }, [show]);

  if (!show) return null;

  const colors = ['#6750A4', '#D0BCFF', '#FFD8E4', '#E8DEF8', '#F2B8B5', '#B8AEE8'];
  const pieces = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    color: colors[i % colors.length],
    delay: Math.random() * 0.5,
    duration: 1.5 + Math.random() * 2,
    size: 6 + Math.random() * 8,
    rotation: Math.random() * 360,
  }));

  return (
    <Box sx={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      pointerEvents: 'none', zIndex: 9999, overflow: 'hidden',
    }}>
      {pieces.map((p) => (
        <Box
          key={p.id}
          sx={{
            position: 'absolute',
            top: -20,
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 1.4,
            backgroundColor: p.color,
            borderRadius: '2px',
            transform: `rotate(${p.rotation}deg)`,
            animation: `confettiFall ${p.duration}s ease-out ${p.delay}s forwards`,
            '@keyframes confettiFall': {
              '0%': { transform: `translateY(0) rotate(0deg)`, opacity: 1 },
              '100%': { transform: `translateY(100vh) rotate(${720 + p.rotation}deg)`, opacity: 0 },
            },
          }}
        />
      ))}
    </Box>
  );
}
