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

export const useCareBalance = ({
  events,
  granularity,
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
      // Poprawka: parent2 - parent1 zamiast parent1 - parent2
      const balance = parent2Cumulative - parent1Cumulative;

      // Dodaj punkt tylko jeśli to odpowiednia granularność
      const shouldAddPoint =
        granularity === 'day' ||
        (granularity === 'week' && currentDate.day() === 0) || // Niedziela
        (granularity === 'month' && currentDate.date() === 1); // Pierwszy dzień miesiąca

      if (shouldAddPoint) {
        balanceData.push({
          date: currentDate.format(dateFormat),
          parent1Days: isParent1Day ? 1 : 0,
          parent2Days: isParent1Day ? 0 : 1,
          balance,
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
      const isLastDayParent1 = alternatingDates.has(
        analysisEndDate.format(dateFormat)
      );
      balanceData.push({
        date: analysisEndDate.format(dateFormat),
        parent1Days: isLastDayParent1 ? 1 : 0,
        parent2Days: isLastDayParent1 ? 0 : 1,
        balance: parent1Cumulative - parent2Cumulative,
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
  }, [events, granularity]);
};
