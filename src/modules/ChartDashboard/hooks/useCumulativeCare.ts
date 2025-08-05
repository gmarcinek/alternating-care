import { CalendarEvent, CalendarEventType } from '@api/db/types';
import { dateFormat } from '@components/Calendar/Calendar.helpers';
import dayjs from 'dayjs';
import { useMemo } from 'react';

interface CumulativeCarePoint {
  date: string;
  parent1Cumulative: number;
  parent2Cumulative: number;
  campCumulative: number;
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
    campDays: number;
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
    const campEvents = events.filter((e) => e.type === CalendarEventType.Camp);

    const emptySummary = {
      totalDays: 0,
      parent1Days: 0,
      parent2Days: 0,
      campDays: 0,
    };

    if (events.length === 0) {
      return {
        data: [],
        summary: emptySummary,
      };
    }

    // Znajdź zakres dat do analizy
    const sortedEvents = events.sort(
      (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix()
    );
    const firstDate = dayjs(sortedEvents[0].date);
    const lastDate = dayjs(sortedEvents[sortedEvents.length - 1].date);

    // Analizuj do dziś lub do ostatniego eventu (co wcześniejsze)
    const today = dayjs();
    const analysisEndDate = lastDate.isAfter(today) ? today : lastDate;

    const alternatingDates = new Set(alternatingEvents.map((e) => e.date));
    const campDates = new Set(campEvents.map((e) => e.date));

    const cumulativeData: CumulativeCarePoint[] = [];
    let parent1Cumulative = 0;
    let parent2Cumulative = 0;
    let campCumulative = 0;
    let currentDate = firstDate.clone();

    while (
      currentDate.isBefore(analysisEndDate) ||
      currentDate.isSame(analysisEndDate)
    ) {
      const dateStr = currentDate.format(dateFormat);

      // Sprawdź typ dnia
      const isParent1Day = alternatingDates.has(dateStr);
      const isCampDay = campDates.has(dateStr);

      // Aktualizuj liczniki
      if (isCampDay) {
        campCumulative++;
      } else if (isParent1Day) {
        parent1Cumulative++;
      } else {
        parent2Cumulative++;
      }

      const totalDays = parent1Cumulative + parent2Cumulative + campCumulative;

      // Dodaj punkt tylko dla odpowiedniej granularności
      const shouldAddPoint =
        granularity === 'day' ||
        (granularity === 'week' && currentDate.day() === 0) || // Niedziela
        (granularity === 'month' && currentDate.date() === 1); // Pierwszy dzień miesiąca

      if (shouldAddPoint) {
        cumulativeData.push({
          date: dateStr,
          parent1Cumulative,
          parent2Cumulative,
          campCumulative,
          totalDays,
        });
      }

      currentDate = currentDate.add(1, 'day');
    }

    // Zawsze dodaj ostatni punkt analizy
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
        campCumulative,
        totalDays: parent1Cumulative + parent2Cumulative + campCumulative,
      });
    }

    const finalSummary = {
      totalDays: parent1Cumulative + parent2Cumulative + campCumulative,
      parent1Days: parent1Cumulative,
      parent2Days: parent2Cumulative,
      campDays: campCumulative,
    };

    return {
      data: cumulativeData,
      summary: finalSummary,
    };
  }, [events, granularity]);
};
