import { CalendarEvent, CalendarEventType } from '@api/db/types';
import { dateFormat } from '@components/Calendar/Calendar.helpers';
import dayjs from 'dayjs';
import { useMemo } from 'react';

interface CareBalancePoint {
  date: string;
  parent1Days: number;
  parent2Days: number;
  balance: number; // +/- względem równowagi
  totalDays: number;
}

interface UseCareBalanceProps {
  events: CalendarEvent[];
  granularity: 'day' | 'week' | 'month';
}

export const useCareBalance = ({
  events,
  granularity,
}: UseCareBalanceProps) => {
  return useMemo(() => {
    const alternatingEvents = events.filter(
      (e) => e.type === CalendarEventType.Alternating
    );

    if (alternatingEvents.length === 0) return { data: [], maxBalance: 0 };

    const sortedEvents = alternatingEvents.sort(
      (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix()
    );
    const firstDate = dayjs(sortedEvents[0].date);
    const lastDate = dayjs(sortedEvents[sortedEvents.length - 1].date);

    const alternatingDates = new Set(alternatingEvents.map((e) => e.date));
    const balanceData: CareBalancePoint[] = [];

    let currentDate = firstDate.clone();
    let parent1Cumulative = 0;
    let parent2Cumulative = 0;

    while (currentDate.isBefore(lastDate) || currentDate.isSame(lastDate)) {
      if (alternatingDates.has(currentDate.format(dateFormat))) {
        parent1Cumulative++;
      } else {
        parent2Cumulative++;
      }

      // Bilans = różnica względem równowagi (50/50)
      const totalDays = parent1Cumulative + parent2Cumulative;
      const expectedParent1Days = totalDays / 2;
      const balance = parent1Cumulative - expectedParent1Days;

      balanceData.push({
        date: currentDate.format(dateFormat),
        parent1Days: alternatingDates.has(currentDate.format(dateFormat))
          ? 1
          : 0,
        parent2Days: alternatingDates.has(currentDate.format(dateFormat))
          ? 0
          : 1,
        balance,
        totalDays,
      });

      currentDate =
        granularity === 'day'
          ? currentDate.add(1, 'day')
          : granularity === 'week'
            ? currentDate.add(1, 'week')
            : currentDate.add(1, 'month');
    }

    const maxAbsBalance = Math.max(
      ...balanceData.map((d) => Math.abs(d.balance))
    );
    const normalizedMax = Math.ceil(maxAbsBalance / 10) * 10;

    return { data: balanceData, maxBalance: normalizedMax };
  }, [events, granularity]);
};
