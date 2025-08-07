import dayjs from 'dayjs';
import { CareBreak, CarePeriod, PatternStatistics } from './types';

function getDayName(dayOfWeek: number): string {
  const days = [
    'niedziela',
    'poniedziałek',
    'wtorek',
    'środa',
    'czwartek',
    'piątek',
    'sobota',
  ];
  return days[dayOfWeek];
}

export function calculateBasicStats(
  periods: CarePeriod[],
  breaks: CareBreak[]
): PatternStatistics {
  if (periods.length === 0) {
    return {
      totalCarePeriods: 0,
      totalBreaks: 0,
      averageCareDuration: 0,
      averageBreakDuration: 0,
      longestCarePeriod: 0,
      shortestCarePeriod: 0,
      longestBreak: 0,
      shortestBreak: 0,
      preferredStartDay: '',
      preferredEndDay: '',
      careToBreakRatio: 0,
      analysisDateRange: { start: '', end: '', totalDays: 0 },
    };
  }

  const careDurations = periods.map((p) => p.duration);
  const breakDurations = breaks.map((b) => b.duration);

  const totalCareDays = careDurations.reduce((sum, d) => sum + d, 0);
  const totalBreakDays = breakDurations.reduce((sum, d) => sum + d, 0);

  // Znajdź najczęstsze dni rozpoczęcia/zakończenia
  const startDayCounts: Record<number, number> = {};
  const endDayCounts: Record<number, number> = {};

  periods.forEach((period) => {
    startDayCounts[period.startDayOfWeek] =
      (startDayCounts[period.startDayOfWeek] || 0) + 1;
    endDayCounts[period.endDayOfWeek] =
      (endDayCounts[period.endDayOfWeek] || 0) + 1;
  });

  const mostCommonStartDay = Object.entries(startDayCounts).sort(
    ([, a], [, b]) => b - a
  )[0]?.[0];
  const mostCommonEndDay = Object.entries(endDayCounts).sort(
    ([, a], [, b]) => b - a
  )[0]?.[0];

  // Zakres dat
  const allDates = periods.flatMap((p) => [p.startDate, p.endDate]);
  const sortedDates = allDates.sort();
  const firstDate = sortedDates[0];
  const lastDate = sortedDates[sortedDates.length - 1];

  return {
    totalCarePeriods: periods.length,
    totalBreaks: breaks.length,
    averageCareDuration: Math.round((totalCareDays / periods.length) * 10) / 10,
    averageBreakDuration:
      breaks.length > 0
        ? Math.round((totalBreakDays / breaks.length) * 10) / 10
        : 0,
    longestCarePeriod: Math.max(...careDurations),
    shortestCarePeriod: Math.min(...careDurations),
    longestBreak: breakDurations.length > 0 ? Math.max(...breakDurations) : 0,
    shortestBreak: breakDurations.length > 0 ? Math.min(...breakDurations) : 0,
    preferredStartDay: mostCommonStartDay
      ? getDayName(Number(mostCommonStartDay))
      : '',
    preferredEndDay: mostCommonEndDay
      ? getDayName(Number(mostCommonEndDay))
      : '',
    careToBreakRatio:
      totalBreakDays > 0
        ? Math.round((totalCareDays / totalBreakDays) * 100) / 100
        : 0,
    analysisDateRange: {
      start: firstDate,
      end: lastDate,
      totalDays: dayjs(lastDate).diff(dayjs(firstDate), 'days') + 1,
    },
  };
}
