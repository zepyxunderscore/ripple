export function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function getWeekDates(date: Date): Date[] {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    dates.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

export function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

export function daysBetween(a: Date, b: Date): number {
  const ms = b.getTime() - a.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export function getMonthDays(year: number, month: number): Date[] {
  const days: Date[] = [];
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  for (let d = new Date(first); d <= last; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }
  return days;
}

export function getYearGrid(year: number): { month: number; days: Date[] }[] {
  return Array.from({ length: 12 }, (_, i) => ({
    month: i,
    days: getMonthDays(year, i),
  }));
}

export function getWeekNumber(d: Date): number {
  const temp = new Date(d);
  temp.setHours(0, 0, 0, 0);
  temp.setDate(temp.getDate() + 3 - ((temp.getDay() + 6) % 7));
  const week1 = new Date(temp.getFullYear(), 0, 4);
  return 1 + Math.round(((temp.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
}

export function generateId(): string {
  return crypto.randomUUID();
}

export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

export function computeStreak(checks: Record<string, boolean>, frozenDates: string[]): number {
  const dates = Object.keys(checks)
    .filter((d) => checks[d])
    .sort()
    .reverse();
  if (dates.length === 0) return 0;
  let streak = 0;
  const today = formatDate(new Date());
  let cursor = new Date(today);
  while (true) {
    const ds = formatDate(cursor);
    if (checks[ds] || frozenDates.includes(ds)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export function computeRate(checks: Record<string, boolean>, days: number): number {
  const now = new Date();
  let count = 0;
  let total = 0;
  for (let i = 0; i < days; i++) {
    const d = formatDate(addDays(now, -i));
    if (d in checks) {
      count++;
      total++;
    } else {
      total++;
    }
  }
  return total > 0 ? Math.round((count / total) * 100) : 0;
}

export function computeWeekCount(checks: Record<string, boolean>, weekStart: Date): number {
  let count = 0;
  for (let i = 0; i < 7; i++) {
    const ds = formatDate(addDays(weekStart, i));
    if (checks[ds]) count++;
  }
  return count;
}

export function downloadCSV(filename: string, rows: string[][]) {
  const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportToPDF(elementId: string, filename: string) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  printWindow.document.write(`
    <html><head><title>${filename}</title>
    <style>body{font-family:sans-serif;padding:20px;}table{border-collapse:collapse;width:100%;}th,td{border:1px solid #ccc;padding:8px;text-align:left;}</style>
    </head><body>${el.innerHTML}</body></html>
  `);
  printWindow.document.close();
  printWindow.print();
}
