'use client';

import { Stack } from '@/src/components/Stack/Stack';
import { splitEvenly } from '@/src/utils/array';
import { NUMBER_SEVEN } from '@/src/utils/number';
import { useMemo } from 'react';
import { CalenderContext } from './Calendar.context';
import { segregateDatesMonthly } from './Calendar.helpers';
import { DisplayStrategy } from './Calendar.types';
import { CalendarMonths } from './components/CallendarMonths/CallendarMonths';
import { CallendarWeek } from './components/CallendarWeek/CallendarWeek';
import { getDaysBetweenDates, useCalendarDates } from './useCalendarDates';
import { useCalendarGap } from './useCalendarGap';

interface CalendarProps {
  startDate: string;
  displayStrategy?: DisplayStrategy;
  endDate?: string;
  rowSize: number;
  isTodayVisible: boolean;
  isWeeksSplitted: boolean;
  isWeekendsVisible: boolean;
  isAlternatingVisible: boolean;
  alternatingDates: string[];
}

export function Calendar(props: CalendarProps) {
  const {
    startDate,

    rowSize = NUMBER_SEVEN,
    isTodayVisible,
    isWeeksSplitted,
    isAlternatingVisible,
    isWeekendsVisible,
    alternatingDates,
    displayStrategy = 'continous',
    endDate,
  } = props;

  const gap = useCalendarGap(rowSize);
  const calendarDates =
    endDate !== undefined
      ? getDaysBetweenDates(startDate, endDate)
      : useCalendarDates({
          startDate,
          rowSize,
        });

  const { weeks, months } = useMemo(() => {
    const weeks = splitEvenly(calendarDates, rowSize);
    const months = segregateDatesMonthly(weeks);

    return {
      weeks,
      months,
    };
  }, [rowSize, calendarDates]);

  return (
    <CalenderContext.Provider
      value={{
        isTodayVisible,
        isWeeksSplitted,
        isAlternatingVisible,
        isWeekendsVisible,
        rowSize,
        alternatingDates,
        displayStrategy,
      }}
    >
      {displayStrategy === 'continous' ? (
        <Stack gap={gap}>
          {weeks.map((week, weekIndex) => {
            return (
              <CallendarWeek
                key={`week-of-${week[0].date}-${weekIndex}`}
                week={week}
                gap={gap}
              />
            );
          })}
        </Stack>
      ) : (
        <CalendarMonths gap={gap} months={months} />
      )}
    </CalenderContext.Provider>
  );
}
