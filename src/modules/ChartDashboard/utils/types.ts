export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // niedziela-sobota

export interface CarePeriod {
  startDate: string;
  endDate: string;
  duration: number;
  startDayOfWeek: DayOfWeek;
  endDayOfWeek: DayOfWeek;
  startDayOfYear: number;
  endDayOfYear: number;
  month: number;
  year: number;
}

export interface CareBreak {
  startDate: string;
  endDate: string;
  duration: number;
}

export interface DurationPattern {
  type: 'duration';
  category: 'care' | 'break';
  description: string;
  details: string;
  confidence: number;
  characteristics: {
    averageDuration: number;
    standardDeviation: number;
    mostCommonDuration: number;
    durationRange: { min: number; max: number };
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
    weeklyRecurrence: number;
  };
}

export interface CyclicPattern {
  type: 'cycle';
  description: string;
  details: string;
  confidence: number;
  characteristics: {
    cycleLength: number;
    careToBreakRatio: number;
    regularity: number;
  };
}

export type CarePattern = DurationPattern | WeeklyPattern | CyclicPattern;

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
