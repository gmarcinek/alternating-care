import { CalendarEvent, CalendarEventType } from '@api/db/types';
import { dateFormat } from '@components/Calendar/Calendar.helpers';
import dayjs from 'dayjs';
import { useMemo } from 'react';

interface CareBalancePoint {
  date: string;
  parent1Days: number;
  parent2Days: number;
  balance: number; // Rzeczywisty bilans skumulowany
  totalDays: number;
  parent1Cumulative: number; // Dodane dla przejrzystości
  parent2Cumulative: number; // Dodane dla przejrzystości
}

interface UseCareBalanceProps {
  events: CalendarEvent[];
  granularity: 'day' | 'week' | 'month';
  balancePeriod: 'week' | 'month' | 'quarter' | 'year';
}

interface CareBalanceResult {
  data: CareBalancePoint[];
  maxBalance: number;
  summary: {
    totalDays: number;
    parent1Days: number;
    parent2Days: number;
    currentBalance: number;
    balancePercentage: number;
  };
}

export const useCareBalanceWeighted = ({
  events,
  granularity,
  balancePeriod,
}: UseCareBalanceProps): CareBalanceResult => {
  return useMemo(() => {
    const alternatingEvents = events.filter(
      (e) => e.type === CalendarEventType.Alternating
    );

    const emptySummary = {
      totalDays: 0,
      parent1Days: 0,
      parent2Days: 0,
      currentBalance: 0,
      balancePercentage: 0,
    };

    if (alternatingEvents.length === 0) {
      return {
        data: [],
        maxBalance: 0,
        summary: emptySummary,
      };
    }

    const sortedEvents = alternatingEvents.sort(
      (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix()
    );

    const firstDate = dayjs(sortedEvents[0].date);
    const lastDate = dayjs(sortedEvents[sortedEvents.length - 1].date);
    const alternatingDates = new Set(alternatingEvents.map((e) => e.date));

    // Oblicz dni dla okresu bilansu
    const getPeriodDays = (
      period: 'week' | 'month' | 'quarter' | 'year'
    ): number => {
      switch (period) {
        case 'week':
          return 7;
        case 'month':
          return 30;
        case 'quarter':
          return 90;
        case 'year':
          return 365;
      }
    };

    const periodDays = getPeriodDays(balancePeriod);

    // Wyznacz zakres analizy - od pierwszego eventu do dziś lub ostatniego eventu
    const today = dayjs();
    const analysisEndDate = lastDate.isAfter(today) ? today : lastDate;

    const balanceData: CareBalancePoint[] = [];
    let parent1Cumulative = 0;
    let parent2Cumulative = 0;
    let currentDate = firstDate.clone();

    // Iteruj przez wszystkie dni od pierwszego eventu do końca analizy
    while (
      currentDate.isBefore(analysisEndDate) ||
      currentDate.isSame(analysisEndDate)
    ) {
      const isParent1Day = alternatingDates.has(currentDate.format(dateFormat));

      if (isParent1Day) {
        parent1Cumulative++;
      } else {
        parent2Cumulative++;
      }

      const totalDays = parent1Cumulative + parent2Cumulative;

      // Oblicz bilans dla zadanego okresu (sliding window)
      let windowBalance = 0;
      let windowParent1Days = 0;
      let windowParent2Days = 0;

      // Sprawdź dni w oknie czasowym wstecz od currentDate
      const windowStart = currentDate.subtract(periodDays - 1, 'day');
      let windowDate = windowStart.clone();

      while (
        windowDate.isBefore(currentDate) ||
        windowDate.isSame(currentDate)
      ) {
        // Sprawdź czy windowDate jest w zakresie dostępnych danych
        if (windowDate.isAfter(firstDate) || windowDate.isSame(firstDate)) {
          const isWindowParent1Day = alternatingDates.has(
            windowDate.format(dateFormat)
          );
          if (isWindowParent1Day) {
            windowParent1Days++;
          } else {
            windowParent2Days++;
          }
        }
        windowDate = windowDate.add(1, 'day');
      }

      windowBalance = windowParent2Days - windowParent1Days;

      // Dodaj punkt tylko jeśli to odpowiednia granularność
      const shouldAddPoint =
        granularity === 'day' ||
        (granularity === 'week' && currentDate.day() === 0) || // Niedziela
        (granularity === 'month' && currentDate.date() === 1); // Pierwszy dzień miesiąca

      if (shouldAddPoint) {
        balanceData.push({
          date: currentDate.format(dateFormat),
          parent1Days: windowParent1Days,
          parent2Days: windowParent2Days,
          balance: windowBalance,
          totalDays,
          parent1Cumulative,
          parent2Cumulative,
        });
      }

      currentDate = currentDate.add(1, 'day');
    }

    // Zawsze dodaj ostatni punkt analizy
    if (
      balanceData.length === 0 ||
      !dayjs(balanceData[balanceData.length - 1].date).isSame(analysisEndDate)
    ) {
      // Oblicz bilans dla ostatniego dnia
      let finalWindowBalance = 0;
      let finalWindowParent1Days = 0;
      let finalWindowParent2Days = 0;

      const finalWindowStart = analysisEndDate.subtract(periodDays - 1, 'day');
      let finalWindowDate = finalWindowStart.clone();

      while (
        finalWindowDate.isBefore(analysisEndDate) ||
        finalWindowDate.isSame(analysisEndDate)
      ) {
        if (
          finalWindowDate.isAfter(firstDate) ||
          finalWindowDate.isSame(firstDate)
        ) {
          const isWindowParent1Day = alternatingDates.has(
            finalWindowDate.format(dateFormat)
          );
          if (isWindowParent1Day) {
            finalWindowParent1Days++;
          } else {
            finalWindowParent2Days++;
          }
        }
        finalWindowDate = finalWindowDate.add(1, 'day');
      }

      finalWindowBalance = finalWindowParent2Days - finalWindowParent1Days;

      balanceData.push({
        date: analysisEndDate.format(dateFormat),
        parent1Days: finalWindowParent1Days,
        parent2Days: finalWindowParent2Days,
        balance: finalWindowBalance,
        totalDays: parent1Cumulative + parent2Cumulative,
        parent1Cumulative,
        parent2Cumulative,
      });
    }

    const maxAbsBalance = Math.max(
      ...balanceData.map((d) => Math.abs(d.balance))
    );

    const finalSummary = {
      totalDays: parent1Cumulative + parent2Cumulative,
      parent1Days: parent1Cumulative,
      parent2Days: parent2Cumulative,
      currentBalance: parent2Cumulative - parent1Cumulative,
      balancePercentage:
        parent1Cumulative + parent2Cumulative > 0
          ? Math.round(
              (parent1Cumulative / (parent1Cumulative + parent2Cumulative)) *
                100
            )
          : 50,
    };

    return {
      data: balanceData,
      maxBalance: maxAbsBalance,
      summary: finalSummary,
    };
  }, [events, granularity, balancePeriod]);
};
