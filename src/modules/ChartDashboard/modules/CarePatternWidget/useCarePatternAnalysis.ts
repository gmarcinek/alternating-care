import { CalendarEvent } from '@api/db/types';
import { useMemo } from 'react';
import { analyzeCarePatterns } from './utils/carePatternAnalysis';
import {
  CareBreak,
  CarePattern,
  CarePeriod,
  PatternStatistics,
} from './utils/types';

interface UseCarePatternAnalysisProps {
  events: CalendarEvent[];
}

interface CarePatternAnalysisResult {
  patterns: CarePattern[];
  statistics: PatternStatistics;
  carePeriods: CarePeriod[];
  careBreaks: CareBreak[];
  isAnalyzing: boolean;
}

export const useCarePatternAnalysis = ({
  events,
}: UseCarePatternAnalysisProps): CarePatternAnalysisResult => {
  return useMemo(() => {
    const analysisResult = analyzeCarePatterns(events);

    return {
      ...analysisResult,
      isAnalyzing: false,
    };
  }, [events]);
};
