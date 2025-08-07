import { CarePeriod, DayOfWeek, WeeklyPattern } from './types';

function getDayName(dayOfWeek: DayOfWeek): string {
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

function analyzeDayPreferences(periods: CarePeriod[]): {
  startDays: Array<{ day: DayOfWeek; frequency: number; dayName: string }>;
  endDays: Array<{ day: DayOfWeek; frequency: number; dayName: string }>;
} {
  const startDayCounts: Record<DayOfWeek, number> = {} as Record<
    DayOfWeek,
    number
  >;
  const endDayCounts: Record<DayOfWeek, number> = {} as Record<
    DayOfWeek,
    number
  >;

  periods.forEach((period) => {
    startDayCounts[period.startDayOfWeek] =
      (startDayCounts[period.startDayOfWeek] || 0) + 1;
    endDayCounts[period.endDayOfWeek] =
      (endDayCounts[period.endDayOfWeek] || 0) + 1;
  });

  const startDays = Object.entries(startDayCounts)
    .map(([dayStr, count]) => {
      const day = parseInt(dayStr) as DayOfWeek;
      return {
        day,
        frequency: count / periods.length,
        dayName: getDayName(day),
      };
    })
    .sort((a, b) => b.frequency - a.frequency);

  const endDays = Object.entries(endDayCounts)
    .map(([dayStr, count]) => {
      const day = parseInt(dayStr) as DayOfWeek;
      return {
        day,
        frequency: count / periods.length,
        dayName: getDayName(day),
      };
    })
    .sort((a, b) => b.frequency - a.frequency);

  return { startDays, endDays };
}

export function detectWeeklyPatterns(periods: CarePeriod[]): WeeklyPattern[] {
  if (periods.length < 3) return []; // Obniżone z 4 na 3

  const { startDays, endDays } = analyzeDayPreferences(periods);

  const topStartFreq = startDays[0]?.frequency || 0;
  const topEndFreq = endDays[0]?.frequency || 0;

  // Wzorzec jest interesujący jeśli jest choćby subtelna preferencja (>30%)
  if (topStartFreq <= 0.3 && topEndFreq <= 0.3) {
    return [];
  }

  const confidence = Math.max(topStartFreq, topEndFreq);

  return [
    {
      type: 'weekly',
      description: 'Preferowane dni tygodnia',
      details: `Start: ${startDays[0]?.dayName} (${Math.round(topStartFreq * 100)}%), Koniec: ${endDays[0]?.dayName} (${Math.round(topEndFreq * 100)}%)`,
      confidence,
      characteristics: {
        preferredStartDays: startDays.slice(0, 3),
        preferredEndDays: endDays.slice(0, 3),
        weeklyRecurrence: 1, // KISS - zawsze 1
      },
    },
  ];
}
