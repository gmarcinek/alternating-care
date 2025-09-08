import dayjs from 'dayjs';
import { CareBreak, CarePeriod, DayOfWeek } from './types';

const MINIMUM_CARE_PERIOD_DURATION = 3; // dni - główne okresy opieki
const GRACE_PERIOD_DURATION = 2; // dni - krótkie przerwy są ignorowane

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

  // Krok 1: Znajdź wszystkie ciągłe segmenty
  const rawSegments: Array<{ start: string; end: string; duration: number }> =
    [];
  let segmentStart = sortedDates[0];
  let lastDate = sortedDates[0];

  for (let i = 1; i < sortedDates.length; i++) {
    const currentDate = sortedDates[i];
    const daysBetween = dayjs(currentDate).diff(dayjs(lastDate), 'days');

    if (daysBetween > 1) {
      // Koniec segmentu
      const duration = dayjs(lastDate).diff(dayjs(segmentStart), 'days') + 1;
      rawSegments.push({
        start: segmentStart,
        end: lastDate,
        duration,
      });
      segmentStart = currentDate;
    }
    lastDate = currentDate;
  }

  // Dodaj ostatni segment
  const finalDuration = dayjs(lastDate).diff(dayjs(segmentStart), 'days') + 1;
  rawSegments.push({
    start: segmentStart,
    end: lastDate,
    duration: finalDuration,
  });

  // Krok 2: Zastosuj minimum duration + grace period
  const significantPeriods: CarePeriod[] = [];

  for (let i = 0; i < rawSegments.length; i++) {
    const segment = rawSegments[i];

    // Sprawdź czy to znaczący okres (≥ minimum duration)
    if (segment.duration >= MINIMUM_CARE_PERIOD_DURATION) {
      const period = createCarePeriod(segment.start, segment.end);
      if (period) {
        significantPeriods.push(period);
      }
      continue;
    }

    // Segment jest za krótki - sprawdź czy można połączyć z sąsiadami
    const hasValidPrevious =
      i > 0 && rawSegments[i - 1].duration >= MINIMUM_CARE_PERIOD_DURATION;
    const hasValidNext =
      i < rawSegments.length - 1 &&
      rawSegments[i + 1].duration >= MINIMUM_CARE_PERIOD_DURATION;

    // Jeśli to krótka przerwa między znaczącymi okresami
    if (hasValidPrevious && hasValidNext) {
      const gap = calculateGapDuration(rawSegments[i - 1], segment);

      // Jeśli przerwa ≤ grace period, połącz okresy
      if (gap <= GRACE_PERIOD_DURATION) {
        // Usuń poprzedni okres ze znaczących (będziemy go rozszerzać)
        const previousPeriod = significantPeriods.pop();
        if (previousPeriod) {
          // Rozszerz poprzedni okres do końca następnego segmentu
          const extendedPeriod = createCarePeriod(
            previousPeriod.startDate,
            rawSegments[i + 1].end
          );
          if (extendedPeriod) {
            significantPeriods.push(extendedPeriod);
          }
        }
        // Pomiń następny segment (już został włączony)
        i++;
      }
    }
  }

  return significantPeriods;
}

function calculateGapDuration(
  segment1: { end: string },
  segment2: { start: string }
): number {
  const end1 = dayjs(segment1.end);
  const start2 = dayjs(segment2.start);
  return start2.diff(end1, 'days') - 1; // -1 bo gap to dni między segmentami
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
