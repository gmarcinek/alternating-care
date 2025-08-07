import { CalendarEvent, CalendarEventType } from '@api/db/types';
import { dateFormat } from '@components/Calendar/Calendar.helpers';
import dayjs from 'dayjs';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import weekday from 'dayjs/plugin/weekday';

dayjs.extend(dayOfYear);
dayjs.extend(weekday);

// ===== TYPY =====

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // niedziela-sobota
export type Month = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export type SeasonType = 'spring' | 'summer' | 'autumn' | 'winter';

export interface CarePeriod {
  startDate: string;
  endDate: string;
  duration: number; // dni
  startDayOfWeek: DayOfWeek;
  endDayOfWeek: DayOfWeek;
  startDayOfYear: number; // 1-365
  endDayOfYear: number;
  month: Month;
  year: number;
}

export interface CareBreak {
  startDate: string;
  endDate: string;
  duration: number; // dni między okresami opieki
}

export interface DurationPattern {
  type: 'duration';
  category: 'care' | 'break';
  description: string;
  details: string;
  confidence: number; // 0-1
  characteristics: {
    averageDuration: number;
    standardDeviation: number;
    mostCommonDuration: number;
    durationRange: { min: number; max: number };
  };
}

export interface CyclicPattern {
  type: 'cycle';
  description: string;
  details: string;
  confidence: number;
  characteristics: {
    cycleLength: number; // średnia długość cyklu (opieka + przerwa)
    careToBreakRatio: number; // stosunek opieki do przerwy
    regularity: number; // jak regularny jest cykl (0-1)
  };
}

export interface WeeklyPattern {
  type: 'weekly';
  description: string;
  details: string;
  confidence: number;
  characteristics: {
    preferredStartDays: Array<{
      day: DayOfWeek;
      frequency: number;
      dayName: string;
    }>;
    preferredEndDays: Array<{
      day: DayOfWeek;
      frequency: number;
      dayName: string;
    }>;
    weeklyRecurrence: number; // co ile tygodni się powtarza
  };
}

export interface SeasonalPattern {
  type: 'seasonal';
  description: string;
  details: string;
  confidence: number;
  characteristics: {
    seasonalTrends: Array<{
      season: SeasonType;
      months: readonly Month[];
      averageCareDuration: number;
      averageBreakDuration: number;
      frequency: number;
    }>;
    yearlyRecurrence: boolean;
  };
}

export type CarePattern =
  | DurationPattern
  | CyclicPattern
  | WeeklyPattern
  | SeasonalPattern;

export interface PatternStatistics {
  totalCarePeriods: number;
  totalBreaks: number;
  averageCareDuration: number;
  averageBreakDuration: number;
  longestCarePeriod: number;
  shortestCarePeriod: number;
  longestBreak: number;
  shortestBreak: number;
  preferredStartDay: string;
  preferredEndDay: string;
  careToBreakRatio: number;
  analysisDateRange: {
    start: string;
    end: string;
    totalDays: number;
  };
}

// ===== CONSTANTS =====

const DAY_NAMES: readonly string[] = [
  'niedziela',
  'poniedziałek',
  'wtorek',
  'środa',
  'czwartek',
  'piątek',
  'sobota',
] as const;

const SEASONS: Record<SeasonType, { months: readonly Month[]; name: string }> =
  {
    spring: { months: [3, 4, 5] as const, name: 'wiosna' },
    summer: { months: [6, 7, 8] as const, name: 'lato' },
    autumn: { months: [9, 10, 11] as const, name: 'jesień' },
    winter: { months: [12, 1, 2] as const, name: 'zima' },
  } as const;

// ===== HELPER FUNCTIONS =====

function isDayOfWeek(day: number): day is DayOfWeek {
  return day >= 0 && day <= 6;
}

function isMonth(month: number): month is Month {
  return month >= 1 && month <= 12;
}

function getSeasonFromMonth(month: Month): SeasonType {
  if (SEASONS.spring.months.includes(month)) return 'spring';
  if (SEASONS.summer.months.includes(month)) return 'summer';
  if (SEASONS.autumn.months.includes(month)) return 'autumn';
  return 'winter';
}

function getDayName(dayOfWeek: DayOfWeek): string {
  return DAY_NAMES[dayOfWeek];
}

// ===== SEGMENTATION FUNCTIONS =====

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

    // Jeśli różnica > 1 dzień, kończymy poprzedni okres i zaczynamy nowy
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

function createCarePeriod(
  startDate: string,
  endDate: string
): CarePeriod | null {
  const startDay = dayjs(startDate);
  const endDay = dayjs(endDate);

  const startDayOfWeek = startDay.day();
  const endDayOfWeek = endDay.day();
  const month = startDay.month() + 1; // dayjs months are 0-indexed

  if (
    !isDayOfWeek(startDayOfWeek) ||
    !isDayOfWeek(endDayOfWeek) ||
    !isMonth(month)
  ) {
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
    month,
    year: startDay.year(),
  };
}

export function calculateBreaks(periods: CarePeriod[]): CareBreak[] {
  const breaks: CareBreak[] = [];

  for (let i = 0; i < periods.length - 1; i++) {
    const currentPeriod = periods[i];
    const nextPeriod = periods[i + 1];

    const breakStart = dayjs(currentPeriod.endDate)
      .add(1, 'day')
      .format(dateFormat);
    const breakEnd = dayjs(nextPeriod.startDate)
      .subtract(1, 'day')
      .format(dateFormat);
    const breakDuration =
      dayjs(nextPeriod.startDate).diff(dayjs(currentPeriod.endDate), 'days') -
      1;

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

export function calculateStatistics(
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

  // Najczęstsze dni rozpoczęcia i zakończenia
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

  const preferredStartDayEntry = Object.entries(startDayCounts).sort(
    ([, a], [, b]) => b - a
  )[0];
  const preferredEndDayEntry = Object.entries(endDayCounts).sort(
    ([, a], [, b]) => b - a
  )[0];

  const preferredStartDay = preferredStartDayEntry
    ? getDayName(parseInt(preferredStartDayEntry[0]) as DayOfWeek)
    : '';
  const preferredEndDay = preferredEndDayEntry
    ? getDayName(parseInt(preferredEndDayEntry[0]) as DayOfWeek)
    : '';

  const totalCareDays = careDurations.reduce(
    (sum, duration) => sum + duration,
    0
  );
  const totalBreakDays = breakDurations.reduce(
    (sum, duration) => sum + duration,
    0
  );

  const firstDate = periods[0].startDate;
  const lastDate = periods[periods.length - 1].endDate;

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
    preferredStartDay,
    preferredEndDay,
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

// ===== PATTERN DETECTION FUNCTIONS =====

export function detectDurationPatterns(
  periods: CarePeriod[],
  breaks: CareBreak[]
): DurationPattern[] {
  const patterns: DurationPattern[] = [];

  // Analiza wzorców długości opieki
  if (periods.length >= 3) {
    const durations = periods.map((p) => p.duration);

    // Znajdź najczęstszą długość (MODA - to jest prawdziwy wzorzec!)
    const durationCounts: Record<number, number> = {};
    durations.forEach((d) => {
      durationCounts[d] = (durationCounts[d] || 0) + 1;
    });

    const sortedByFrequency = Object.entries(durationCounts).sort(
      ([, a], [, b]) => b - a
    );
    const mostCommonEntry = sortedByFrequency[0];

    if (mostCommonEntry) {
      const mostCommonDuration = parseInt(mostCommonEntry[0]);
      const mostCommonCount = mostCommonEntry[1];
      const totalPeriods = durations.length;

      // Confidence = jak często występuje najczęstsza wartość
      const frequency = mostCommonCount / totalPeriods;
      const confidence = frequency;

      // Dodatkowe punkty jeśli druga najczęstsza wartość jest blisko
      const secondMostCommon = sortedByFrequency[1];
      let bonusConfidence = 0;
      if (secondMostCommon) {
        const secondDuration = parseInt(secondMostCommon[0]);
        const secondCount = secondMostCommon[1];
        // Jeśli druga wartość różni się o 1-2 dni, to też wskazuje na wzorzec
        if (Math.abs(secondDuration - mostCommonDuration) <= 2) {
          bonusConfidence = (secondCount / totalPeriods) * 0.5;
        }
      }

      const finalConfidence = Math.min(confidence + bonusConfidence, 1);

      if (finalConfidence > 0.3) {
        // Średnia tylko dla kontekstu
        const avgDuration =
          durations.reduce((sum, d) => sum + d, 0) / durations.length;
        const variance =
          durations.reduce((sum, d) => sum + Math.pow(d - avgDuration, 2), 0) /
          durations.length;
        const stdDev = Math.sqrt(variance);

        patterns.push({
          type: 'duration',
          category: 'care',
          description: `Najczęściej: ${mostCommonDuration} dni opieki`,
          details: `${mostCommonCount} z ${totalPeriods} okresów (${Math.round(frequency * 100)}%). ${secondMostCommon ? `Druga częsta: ${secondMostCommon[0]} dni` : ''}`,
          confidence: finalConfidence,
          characteristics: {
            averageDuration: Math.round(avgDuration * 10) / 10,
            standardDeviation: Math.round(stdDev * 10) / 10,
            mostCommonDuration,
            durationRange: {
              min: Math.min(...durations),
              max: Math.max(...durations),
            },
          },
        });
      }
    }
  }

  // Analiza wzorców długości przerw
  if (breaks.length >= 3) {
    const durations = breaks.map((b) => b.duration);

    const durationCounts: Record<number, number> = {};
    durations.forEach((d) => {
      durationCounts[d] = (durationCounts[d] || 0) + 1;
    });

    const sortedByFrequency = Object.entries(durationCounts).sort(
      ([, a], [, b]) => b - a
    );
    const mostCommonEntry = sortedByFrequency[0];

    if (mostCommonEntry) {
      const mostCommonDuration = parseInt(mostCommonEntry[0]);
      const mostCommonCount = mostCommonEntry[1];
      const totalBreaks = durations.length;

      const frequency = mostCommonCount / totalBreaks;
      const confidence = frequency;

      const secondMostCommon = sortedByFrequency[1];
      let bonusConfidence = 0;
      if (secondMostCommon) {
        const secondDuration = parseInt(secondMostCommon[0]);
        const secondCount = secondMostCommon[1];
        if (Math.abs(secondDuration - mostCommonDuration) <= 2) {
          bonusConfidence = (secondCount / totalBreaks) * 0.5;
        }
      }

      const finalConfidence = Math.min(confidence + bonusConfidence, 1);

      if (finalConfidence > 0.3) {
        const avgDuration =
          durations.reduce((sum, d) => sum + d, 0) / durations.length;
        const variance =
          durations.reduce((sum, d) => sum + Math.pow(d - avgDuration, 2), 0) /
          durations.length;
        const stdDev = Math.sqrt(variance);

        patterns.push({
          type: 'duration',
          category: 'break',
          description: `Najczęściej: ${mostCommonDuration} dni przerwy`,
          details: `${mostCommonCount} z ${totalBreaks} przerw (${Math.round(frequency * 100)}%). ${secondMostCommon ? `Druga częsta: ${secondMostCommon[0]} dni` : ''}`,
          confidence: finalConfidence,
          characteristics: {
            averageDuration: Math.round(avgDuration * 10) / 10,
            standardDeviation: Math.round(stdDev * 10) / 10,
            mostCommonDuration,
            durationRange: {
              min: Math.min(...durations),
              max: Math.max(...durations),
            },
          },
        });
      }
    }
  }

  return patterns;
}

export function detectCyclicPatterns(
  periods: CarePeriod[],
  breaks: CareBreak[],
  durationPatterns: DurationPattern[]
): CyclicPattern[] {
  const patterns: CyclicPattern[] = [];

  if (
    periods.length >= 3 &&
    breaks.length >= 2 &&
    durationPatterns.length >= 2
  ) {
    // KROK 1: Znajdź wzorce długości opieki i przerw
    const carePattern = durationPatterns.find((p) => p.category === 'care');
    const breakPattern = durationPatterns.find((p) => p.category === 'break');

    if (carePattern && breakPattern) {
      // KROK 2: Oblicz teoretyczny cykl z wzorców
      const theoreticalCycle =
        carePattern.characteristics.mostCommonDuration +
        breakPattern.characteristics.mostCommonDuration;

      // KROK 3: Sprawdź rzeczywiste cykle
      const actualCycleLengths: number[] = [];

      for (let i = 0; i < Math.min(periods.length - 1, breaks.length); i++) {
        const actualCycle = periods[i].duration + breaks[i].duration;
        actualCycleLengths.push(actualCycle);
      }

      if (actualCycleLengths.length > 0) {
        // KROK 4: Sprawdź ile rzeczywistych cykli pasuje do teoretycznego (±3 dni tolerancja)
        const tolerance = 3;
        const matchingCycles = actualCycleLengths.filter(
          (cycle) => Math.abs(cycle - theoreticalCycle) <= tolerance
        );

        const matchRate = matchingCycles.length / actualCycleLengths.length;

        // KROK 5: Confidence = jak dobrze rzeczywistość pasuje do wzorca
        const patternStrength = Math.min(
          carePattern.confidence,
          breakPattern.confidence
        );
        const cycleConsistency = matchRate;
        const confidence = (patternStrength + cycleConsistency) / 2;

        if (confidence > 0.3) {
          // Obniżony próg z 0.4 na 0.3
          const totalCareDays = periods.reduce((sum, p) => sum + p.duration, 0);
          const totalBreakDays = breaks.reduce((sum, b) => sum + b.duration, 0);
          const careToBreakRatio =
            totalBreakDays > 0 ? totalCareDays / totalBreakDays : 0;

          patterns.push({
            type: 'cycle',
            description: `Cykl: ${carePattern.characteristics.mostCommonDuration}+${breakPattern.characteristics.mostCommonDuration} = ${theoreticalCycle} dni`,
            details: `${matchingCycles.length} z ${actualCycleLengths.length} cykli pasuje do wzorca (${Math.round(matchRate * 100)}%). Stosunek ${Math.round(careToBreakRatio * 100) / 100}:1`,
            confidence,
            characteristics: {
              cycleLength: theoreticalCycle, // Z WZORCÓW, nie ze średniej!
              careToBreakRatio: Math.round(careToBreakRatio * 100) / 100,
              regularity: Math.round(cycleConsistency * 100) / 100,
            },
          });
        }
      }
    }
  }

  // FALLBACK: Jeśli wzorce są za słabe ale istnieją, spróbuj i tak
  if (
    patterns.length === 0 &&
    durationPatterns.length >= 1 &&
    periods.length >= 3 &&
    breaks.length >= 2
  ) {
    const carePattern = durationPatterns.find((p) => p.category === 'care');
    const breakPattern = durationPatterns.find((p) => p.category === 'break');

    if (carePattern || breakPattern) {
      console.log('Używam fallback dla słabych wzorców...');
      // Użyj dostępnych wzorców nawet jeśli słabe
      const careDuration =
        carePattern?.characteristics.mostCommonDuration || 10; // domyślna
      const breakDuration =
        breakPattern?.characteristics.mostCommonDuration || 10; // domyślna
      const theoreticalCycle = careDuration + breakDuration;

      const actualCycleLengths: number[] = [];
      for (let i = 0; i < Math.min(periods.length - 1, breaks.length); i++) {
        const actualCycle = periods[i].duration + breaks[i].duration;
        actualCycleLengths.push(actualCycle);
      }

      if (actualCycleLengths.length > 0) {
        const tolerance = 4; // większa tolerancja dla słabych wzorców
        const matchingCycles = actualCycleLengths.filter(
          (cycle) => Math.abs(cycle - theoreticalCycle) <= tolerance
        );

        const matchRate = matchingCycles.length / actualCycleLengths.length;
        const confidence = matchRate * 0.8; // penalty za słabe wzorce

        if (confidence > 0.25) {
          // jeszcze niższy próg
          const totalCareDays = periods.reduce((sum, p) => sum + p.duration, 0);
          const totalBreakDays = breaks.reduce((sum, b) => sum + b.duration, 0);
          const careToBreakRatio =
            totalBreakDays > 0 ? totalCareDays / totalBreakDays : 0;

          patterns.push({
            type: 'cycle',
            description: `Możliwy cykl: ${careDuration}+${breakDuration} = ${theoreticalCycle} dni`,
            details: `${matchingCycles.length} z ${actualCycleLengths.length} cykli podobnych (${Math.round(matchRate * 100)}%). Stosunek ${Math.round(careToBreakRatio * 100) / 100}:1`,
            confidence,
            characteristics: {
              cycleLength: theoreticalCycle,
              careToBreakRatio: Math.round(careToBreakRatio * 100) / 100,
              regularity: Math.round(matchRate * 100) / 100,
            },
          });
        }
      }
    }
  }

  // FALLBACK OSTATECZNY: Jeśli nie ma wzorców długości, użyj starej metody
  if (patterns.length === 0 && periods.length >= 3 && breaks.length >= 2) {
    const cycleLengths: number[] = [];

    for (let i = 0; i < Math.min(periods.length - 1, breaks.length); i++) {
      const cycleLength = periods[i].duration + breaks[i].duration;
      cycleLengths.push(cycleLength);
    }

    if (cycleLengths.length > 0) {
      const cycleCounts: Record<number, number> = {};
      cycleLengths.forEach((len) => {
        const rounded = Math.round(len / 2) * 2;
        cycleCounts[rounded] = (cycleCounts[rounded] || 0) + 1;
      });

      const sortedByFrequency = Object.entries(cycleCounts).sort(
        ([, a], [, b]) => b - a
      );
      const mostCommonEntry = sortedByFrequency[0];

      if (mostCommonEntry) {
        const mostCommonCycle = parseInt(mostCommonEntry[0]);
        const mostCommonCount = mostCommonEntry[1];
        const totalCycles = cycleLengths.length;
        const frequency = mostCommonCount / totalCycles;

        if (frequency > 0.4) {
          const totalCareDays = periods.reduce((sum, p) => sum + p.duration, 0);
          const totalBreakDays = breaks.reduce((sum, b) => sum + b.duration, 0);
          const careToBreakRatio =
            totalBreakDays > 0 ? totalCareDays / totalBreakDays : 0;

          patterns.push({
            type: 'cycle',
            description: `Najczęstszy cykl: ${mostCommonCycle} dni`,
            details: `${mostCommonCount} z ${totalCycles} cykli. Stosunek opieka:przerwa = ${Math.round(careToBreakRatio * 100) / 100}:1`,
            confidence: frequency,
            characteristics: {
              cycleLength: mostCommonCycle,
              careToBreakRatio: Math.round(careToBreakRatio * 100) / 100,
              regularity: Math.round(frequency * 100) / 100,
            },
          });
        }
      }
    }
  }

  return patterns;
}

export function detectWeeklyPatterns(periods: CarePeriod[]): WeeklyPattern[] {
  const patterns: WeeklyPattern[] = [];

  if (periods.length >= 4) {
    // Analiza preferowanych dni rozpoczęcia
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

    const preferredStartDays = Object.entries(startDayCounts)
      .map(([dayStr, count]) => {
        const day = parseInt(dayStr) as DayOfWeek;
        return {
          day,
          frequency: count / periods.length,
          dayName: getDayName(day),
        };
      })
      .sort((a, b) => b.frequency - a.frequency);

    const preferredEndDays = Object.entries(endDayCounts)
      .map(([dayStr, count]) => {
        const day = parseInt(dayStr) as DayOfWeek;
        return {
          day,
          frequency: count / periods.length,
          dayName: getDayName(day),
        };
      })
      .sort((a, b) => b.frequency - a.frequency);

    // Sprawdź czy istnieje silna preferencja dla konkretnych dni
    const topStartDayFreq = preferredStartDays[0]?.frequency || 0;
    const topEndDayFreq = preferredEndDays[0]?.frequency || 0;

    if (topStartDayFreq > 0.5 || topEndDayFreq > 0.5) {
      const confidence = Math.max(topStartDayFreq, topEndDayFreq);

      patterns.push({
        type: 'weekly',
        description: `Preferowane dni tygodnia`,
        details: `Start: ${preferredStartDays[0]?.dayName} (${Math.round(topStartDayFreq * 100)}%), Koniec: ${preferredEndDays[0]?.dayName} (${Math.round(topEndDayFreq * 100)}%)`,
        confidence,
        characteristics: {
          preferredStartDays: preferredStartDays.slice(0, 3),
          preferredEndDays: preferredEndDays.slice(0, 3),
          weeklyRecurrence: 1, // Placeholder - można rozszerzyć analizę
        },
      });
    }
  }

  return patterns;
}

export function detectSeasonalPatterns(
  periods: CarePeriod[],
  breaks: CareBreak[]
): SeasonalPattern[] {
  const patterns: SeasonalPattern[] = [];

  if (periods.length >= 4) {
    const seasonalData: Record<
      SeasonType,
      { careDurations: number[]; breakDurations: number[]; count: number }
    > = {
      spring: { careDurations: [], breakDurations: [], count: 0 },
      summer: { careDurations: [], breakDurations: [], count: 0 },
      autumn: { careDurations: [], breakDurations: [], count: 0 },
      winter: { careDurations: [], breakDurations: [], count: 0 },
    };

    periods.forEach((period, index) => {
      const season = getSeasonFromMonth(period.month);

      seasonalData[season].careDurations.push(period.duration);
      seasonalData[season].count++;

      if (index < breaks.length) {
        seasonalData[season].breakDurations.push(breaks[index].duration);
      }
    });

    const seasonalTrends: SeasonalPattern['characteristics']['seasonalTrends'] =
      [];
    let hasSignificantSeasonalDiff = false;

    Object.entries(seasonalData).forEach(([seasonStr, data]) => {
      const season = seasonStr as SeasonType;
      if (data.count > 0) {
        const avgCare =
          data.careDurations.reduce((sum, d) => sum + d, 0) /
          data.careDurations.length;
        const avgBreak =
          data.breakDurations.length > 0
            ? data.breakDurations.reduce((sum, d) => sum + d, 0) /
              data.breakDurations.length
            : 0;

        seasonalTrends.push({
          season,
          months: SEASONS[season].months,
          averageCareDuration: Math.round(avgCare * 10) / 10,
          averageBreakDuration: Math.round(avgBreak * 10) / 10,
          frequency: data.count / periods.length,
        });
      }
    });

    // Sprawdź czy są znaczące różnice sezonowe
    const careAvgs = seasonalTrends.map((t) => t.averageCareDuration);
    const breakAvgs = seasonalTrends
      .filter((t) => t.averageBreakDuration > 0)
      .map((t) => t.averageBreakDuration);

    if (careAvgs.length > 1) {
      const careMax = Math.max(...careAvgs);
      const careMin = Math.min(...careAvgs);
      const careVariation = careMin > 0 ? (careMax - careMin) / careMin : 0;

      if (careVariation > 0.3) hasSignificantSeasonalDiff = true;
    }

    if (breakAvgs.length > 1) {
      const breakMax = Math.max(...breakAvgs);
      const breakMin = Math.min(...breakAvgs);
      const breakVariation =
        breakMin > 0 ? (breakMax - breakMin) / breakMin : 0;

      if (breakVariation > 0.4) hasSignificantSeasonalDiff = true;
    }

    if (hasSignificantSeasonalDiff && seasonalTrends.length >= 2) {
      const confidence = Math.min(seasonalTrends.length / 4, 0.8);

      patterns.push({
        type: 'seasonal',
        description: `Wzorce sezonowe w opiece`,
        details: `Wykryto różnice w długości opieki/przerw między porami roku`,
        confidence,
        characteristics: {
          seasonalTrends,
          yearlyRecurrence: seasonalTrends.length >= 3,
        },
      });
    }
  }

  return patterns;
}

// ===== MAIN ANALYSIS FUNCTION =====

export function analyzeCarePatterns(events: CalendarEvent[]): {
  patterns: CarePattern[];
  statistics: PatternStatistics;
  carePeriods: CarePeriod[];
  careBreaks: CareBreak[];
} {
  const alternatingEvents = events.filter(
    (e) => e.type === CalendarEventType.Alternating
  );

  if (alternatingEvents.length < 3) {
    return {
      patterns: [],
      statistics: {
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
      },
      carePeriods: [],
      careBreaks: [],
    };
  }

  const alternatingDates = alternatingEvents.map((e) => e.date);
  const carePeriods = segmentIntoPeriods(alternatingDates);
  const careBreaks = calculateBreaks(carePeriods);
  const statistics = calculateStatistics(carePeriods, careBreaks);

  // KROK 1: Wykryj wzorce długości NAJPIERW
  const durationPatterns = detectDurationPatterns(carePeriods, careBreaks);

  // KROK 2: Potem wykryj cykliczność na bazie wzorców długości
  const cyclicPatterns = detectCyclicPatterns(
    carePeriods,
    careBreaks,
    durationPatterns
  );

  // KROK 3: Pozostałe wzorce
  const weeklyPatterns = detectWeeklyPatterns(carePeriods);
  const seasonalPatterns = detectSeasonalPatterns(carePeriods, careBreaks);

  const allPatterns: CarePattern[] = [
    ...durationPatterns,
    ...cyclicPatterns, // Teraz bazują na wzorcach długości!
    ...weeklyPatterns,
    ...seasonalPatterns,
  ];

  // Sortuj wzorce według pewności
  const sortedPatterns = allPatterns.sort(
    (a, b) => b.confidence - a.confidence
  );

  return {
    patterns: sortedPatterns,
    statistics,
    carePeriods,
    careBreaks,
  };
}
