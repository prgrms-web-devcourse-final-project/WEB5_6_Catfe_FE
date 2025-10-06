import { DayOfWeekEnum } from '@/@types/planner';
import dayjs from './dayjs';

export const HOURS = Array.from({ length: 24 }, (_, i) => i);

export const formatToYMD = (date: Date | string | number) => dayjs(date).format('YYYY-MM-DD');
export const formatKoreanYearMonth = (date: Date) => dayjs(date).format('YYYY년 MM월');
export const formatHM = (date: Date) => dayjs(date).format('HH:mm');
export const formatWeekday = (date: Date | string | number): DayOfWeekEnum =>
  dayjs(date).locale('en').format('ddd').toUpperCase() as DayOfWeekEnum;

export const fromYMD = (s?: string | null) => (s ? dayjs(s).startOf('day').toDate() : null);

export const startOfDay = (date: Date) => dayjs(date).startOf('day').toDate();
export const addDays = (date: Date, n: number) => dayjs(date).add(n, 'day').startOf('day').toDate();
export const combineYmdHM = (ymd: string, hm: string) => `${ymd}T${hm}:00`;

export const isSameDay = (a: Date, b: Date) => dayjs(a).isSame(b, 'day');

export const clampEndAfterStart = (start: Date, end: Date) =>
  dayjs(end).isAfter(start) ? end : dayjs(start).add(1, 'hour').toDate();

export const getExactTime = (date: Date, hour: number, minute = 0) =>
  dayjs(date).hour(hour).minute(minute).second(0).millisecond(0).toDate();
export const getWeekDays = (base: Date, weekStart: 0 | 1) => {
  const startDayOfWeek = dayjs(base).day(); // 0 = 일, 1 = 월, ..., 6 = 토
  const offset =
    weekStart === 1 ? (startDayOfWeek === 0 ? -6 : 1 - startDayOfWeek) : -startDayOfWeek;
  const start = dayjs(base).add(offset, 'day').startOf('day');
  return Array.from({ length: 7 }, (_, i) => start.add(i, 'day').toDate());
};
