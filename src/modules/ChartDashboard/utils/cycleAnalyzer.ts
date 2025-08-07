import { CareBreak, CarePeriod, CyclicPattern, DurationPattern } from './types';

export function detectCyclePatterns(
  periods: CarePeriod[],
  breaks: CareBreak[],
  durationPatterns: DurationPattern[]
): CyclicPattern[] {
  if (periods.length < 2 || breaks.length < 1) return []; // Obniżone wymagania

  const carePattern = durationPatterns.find((p) => p.category === 'care');
  const breakPattern = durationPatterns.find((p) => p.category === 'break');

  // Potrzebujemy przynajmniej jeden wzorzec długości
  if (!carePattern && !breakPattern) return [];

  // Użyj najczęstszych wartości lub średnich jako fallback
  const avgCareDuration =
    carePattern?.characteristics.mostCommonDuration ??
    Math.round(
      periods.reduce((sum, p) => sum + p.duration, 0) / periods.length
    );

  const avgBreakDuration =
    breakPattern?.characteristics.mostCommonDuration ??
    Math.round(breaks.reduce((sum, b) => sum + b.duration, 0) / breaks.length);

  const expectedCycle = avgCareDuration + avgBreakDuration;

  // Sprawdź rzeczywiste cykle
  const actualCycles: number[] = [];
  for (let i = 0; i < Math.min(periods.length - 1, breaks.length); i++) {
    const actualCycle = periods[i].duration + breaks[i].duration;
    actualCycles.push(actualCycle);
  }

  if (actualCycles.length === 0) return [];

  // Sprawdź ile cykli pasuje do oczekiwanego (±3 dni tolerancja)
  const tolerance = 3;
  const matchingCycles = actualCycles.filter(
    (cycle) => Math.abs(cycle - expectedCycle) <= tolerance
  );

  const matchRate = matchingCycles.length / actualCycles.length;

  // Obniżony próg - subtelne wzorce też mają wartość
  if (matchRate < 0.2) return [];

  const totalCareDays = periods.reduce((sum, p) => sum + p.duration, 0);
  const totalBreakDays = breaks.reduce((sum, b) => sum + b.duration, 0);
  const careToBreakRatio =
    totalBreakDays > 0
      ? Math.round((totalCareDays / totalBreakDays) * 100) / 100
      : 0;

  return [
    {
      type: 'cycle',
      description: `Cykl: ${avgCareDuration} dni opieki + ${avgBreakDuration} dni przerwy`,
      details: `${matchingCycles.length} z ${actualCycles.length} cykli pasuje do wzorca (${Math.round(matchRate * 100)}%)`,
      confidence: matchRate,
      characteristics: {
        cycleLength: expectedCycle,
        careToBreakRatio,
        regularity: matchRate,
      },
    },
  ];
}
