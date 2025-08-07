import { CareBreak, CarePeriod, DurationPattern } from './types';

function findMostCommon(durations: number[]): {
  value: number;
  count: number;
  frequency: number;
} {
  const counts: Record<number, number> = {};
  durations.forEach((d) => {
    counts[d] = (counts[d] || 0) + 1;
  });

  const sorted = Object.entries(counts).sort(([, a], [, b]) => b - a);
  const [value, count] = sorted[0];

  return {
    value: parseInt(value),
    count,
    frequency: count / durations.length,
  };
}

function analyzeDurationCategory(
  durations: number[],
  category: 'care' | 'break'
): DurationPattern | null {
  if (durations.length < 3) return null;

  const { value: mostCommonDuration, frequency } = findMostCommon(durations);

  if (frequency < 0.2) return null; // Subtelne wzorce też mają wartość

  const avgDuration =
    durations.reduce((sum, d) => sum + d, 0) / durations.length;

  return {
    type: 'duration',
    category,
    description: `Najczęściej: ${mostCommonDuration} dni ${category === 'care' ? 'opieki' : 'przerwy'}`,
    details: `${Math.round(frequency * 100)}% przypadków`,
    confidence: frequency,
    characteristics: {
      averageDuration: Math.round(avgDuration * 10) / 10,
      standardDeviation: 0, // YAGNI - nie używane w logice
      mostCommonDuration,
      durationRange: {
        min: Math.min(...durations),
        max: Math.max(...durations),
      },
    },
  };
}

export function detectDurationPatterns(
  periods: CarePeriod[],
  breaks: CareBreak[]
): DurationPattern[] {
  const patterns: DurationPattern[] = [];

  // Analiza okresów opieki
  if (periods.length >= 2) {
    // Obniżone z 3 na 2
    const careDurations = periods.map((p) => p.duration);
    const carePattern = analyzeDurationCategory(careDurations, 'care');
    if (carePattern) patterns.push(carePattern);
  }

  // Analiza przerw
  if (breaks.length >= 2) {
    // Obniżone z 3 na 2
    const breakDurations = breaks.map((b) => b.duration);
    const breakPattern = analyzeDurationCategory(breakDurations, 'break');
    if (breakPattern) patterns.push(breakPattern);
  }

  return patterns;
}
