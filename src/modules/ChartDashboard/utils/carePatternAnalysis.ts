import { CalendarEvent, CalendarEventType } from '@api/db/types';
import { calculateBasicStats } from './basicStats';
import { detectCyclePatterns } from './cycleAnalyzer';
import { detectDurationPatterns } from './durationAnalyzer';
import { calculateBreaks, segmentIntoPeriods } from './periodSegmenter';
import { CareBreak, CarePattern, CarePeriod, PatternStatistics } from './types';
import { detectWeeklyPatterns } from './weeklyAnalyzer';

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
  const statistics = calculateBasicStats(carePeriods, careBreaks);

  // Wykryj wzorce
  const durationPatterns = detectDurationPatterns(carePeriods, careBreaks);
  const weeklyPatterns = detectWeeklyPatterns(carePeriods);
  const cyclicPatterns = detectCyclePatterns(
    carePeriods,
    careBreaks,
    durationPatterns
  );

  const allPatterns: CarePattern[] = [
    ...durationPatterns,
    ...weeklyPatterns,
    ...cyclicPatterns,
  ];

  // Sortuj według pewności
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

// Re-export wszystko co potrzebne
export { calculateBreaks, segmentIntoPeriods } from './periodSegmenter';
export * from './types';
