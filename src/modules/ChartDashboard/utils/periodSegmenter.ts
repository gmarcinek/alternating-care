import dayjs from 'dayjs';
import { CareBreak, CarePeriod, DayOfWeek } from './types';

function isDayOfWeek(day: number): day is DayOfWeek {
  return day >= 0 && day <= 6;
}

function createCarePeriod(
  startDate: string,
  endDate: string
): CarePeriod | null {
  const startDay = dayjs(startDate);
  const endDay = dayjs(endDate);

  const startDayOfWeek = startDay.day();
  const endDayOfWeek = endDay.day();

  if (!isDayOfWeek(startDayOfWeek) || !isDayOfWeek(endDayOfWeek)) {
    return null;
  }

  return {
    startDate,
    endDate,
    duration: endDay.diff(startDay, 'days') + 1,
    startDayOfWeek,
    endDayOfWeek,
    startDayOfYear: startDay.dayOfYear(),
    endDayOfYear: endDay.dayOfYear(),
    month: startDay.month() + 1,
    year: startDay.year(),
  };
}

export function segmentIntoPeriods(alternatingDates: string[]): CarePeriod[] {
  if (alternatingDates.length === 0) return [];

  const sortedDates = alternatingDates.sort(
    (a, b) => dayjs(a).unix() - dayjs(b).unix()
  );
  const periods: CarePeriod[] = [];

  let periodStart = sortedDates[0];
  let lastDate = sortedDates[0];

  for (let i = 1; i < sortedDates.length; i++) {
    const currentDate = sortedDates[i];
    const daysBetween = dayjs(currentDate).diff(dayjs(lastDate), 'days');

    // Jeśli różnica > 1 dzień, kończymy okres i zaczynamy nowy
    if (daysBetween > 1) {
      const period = createCarePeriod(periodStart, lastDate);
      if (period) periods.push(period);
      periodStart = currentDate;
    }

    lastDate = currentDate;
  }

  // Dodaj ostatni okres
  const lastPeriod = createCarePeriod(periodStart, lastDate);
  if (lastPeriod) periods.push(lastPeriod);

  return periods;
}

export function calculateBreaks(periods: CarePeriod[]): CareBreak[] {
  const breaks: CareBreak[] = [];

  for (let i = 0; i < periods.length - 1; i++) {
    const currentPeriod = periods[i];
    const nextPeriod = periods[i + 1];

    const breakStart = dayjs(currentPeriod.endDate)
      .add(1, 'day')
      .format('YYYY-MM-DD');
    const breakEnd = dayjs(nextPeriod.startDate)
      .subtract(1, 'day')
      .format('YYYY-MM-DD');
    const breakDuration = dayjs(breakEnd).diff(dayjs(breakStart), 'days') + 1;

    if (breakDuration > 0) {
      breaks.push({
        startDate: breakStart,
        endDate: breakEnd,
        duration: breakDuration,
      });
    }
  }

  return breaks;
}
