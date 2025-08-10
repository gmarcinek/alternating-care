import { CalendarEvent, CalendarEventType } from '@api/db/types';
import { dateFormat } from '@components/Calendar/Calendar.helpers';
import dayjs from 'dayjs';
import { useMemo } from 'react';

interface CumulativeCarePoint {
  date: string;
  parent1Cumulative: number;
  parent2Cumulative: number;
  totalDays: number;
}

interface UseCumulativeCareProps {
  events: CalendarEvent[];
  granularity: 'day' | 'week' | 'month';
}

interface CumulativeCareResult {
  data: CumulativeCarePoint[];
  summary: {
    totalDays: number;
    parent1Days: number;
    parent2Days: number;
  };
}

export const useCumulativeCare = ({
  events,
  granularity,
}: UseCumulativeCareProps): CumulativeCareResult => {
  return useMemo(() => {
    const alternatingEvents = events.filter(
      (e) => e.type === CalendarEventType.Alternating
    );

    if (events.length === 0) {
      return {
        data: [],
        summary: {
          totalDays: 0,
          parent1Days: 0,
          parent2Days: 0,
        },
      };
    }

    const sortedEvents = events.sort(
      (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix()
    );
    const firstDate = dayjs(sortedEvents[0].date);
    const lastDate = dayjs(sortedEvents[sortedEvents.length - 1].date);

    const today = dayjs();
    const analysisEndDate = lastDate.isAfter(today) ? today : lastDate;

    const alternatingDates = new Set(alternatingEvents.map((e) => e.date));

    const cumulativeData: CumulativeCarePoint[] = [];
    let parent1Cumulative = 0;
    let parent2Cumulative = 0;
    let currentDate = firstDate.clone();

    while (
      currentDate.isBefore(analysisEndDate) ||
      currentDate.isSame(analysisEndDate)
    ) {
      const dateStr = currentDate.format(dateFormat);
      const isParent1Day = alternatingDates.has(dateStr);

      if (isParent1Day) {
        parent1Cumulative++;
      } else {
        parent2Cumulative++;
      }

      const totalDays = parent1Cumulative + parent2Cumulative;

      const shouldAddPoint =
        granularity === 'day' ||
        (granularity === 'week' && currentDate.day() === 0) ||
        (granularity === 'month' && currentDate.date() === 1);

      if (shouldAddPoint) {
        cumulativeData.push({
          date: dateStr,
          parent1Cumulative,
          parent2Cumulative,
          totalDays,
        });
      }

      currentDate = currentDate.add(1, 'day');
    }

    if (
      cumulativeData.length === 0 ||
      !dayjs(cumulativeData[cumulativeData.length - 1].date).isSame(
        analysisEndDate
      )
    ) {
      cumulativeData.push({
        date: analysisEndDate.format(dateFormat),
        parent1Cumulative,
        parent2Cumulative,
        totalDays: parent1Cumulative + parent2Cumulative,
      });
    }

    return {
      data: cumulativeData,
      summary: {
        totalDays: parent1Cumulative + parent2Cumulative,
        parent1Days: parent1Cumulative,
        parent2Days: parent2Cumulative,
      },
    };
  }, [events, granularity]);
};
