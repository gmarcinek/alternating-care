'use client';

import { Stack } from '@/src/components/Stack/Stack';
import { splitEvenly } from '@/src/utils/array';
import { NUMBER_SEVEN } from '@/src/utils/number';
import { useBreakpoints } from '@/src/utils/useBreakpoints';
import { useMemo } from 'react';
import { CalenderContext } from './Calendar.context';
import { CallendarWeek } from './components/CallendarWeek/CallendarWeek';
import { getDaysBetweenDates, useCalendarDates } from './useCalendarDates';
import { useCalendarGap } from './useCalendarGap';

interface CalendarProps {
  startDate: string;
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

  const { isDesktop, isMobile, isTablet } = useBreakpoints();

  const { weeks } = useMemo(() => {
    const weeks = splitEvenly(calendarDates, rowSize);

    return {
      weeks,
    };
  }, [rowSize, calendarDates, isMobile, isTablet, isDesktop]);

  return (
    <CalenderContext.Provider
      value={{
        isTodayVisible,
        isWeeksSplitted,
        isAlternatingVisible,
        isWeekendsVisible,
        rowSize,
        alternatingDates,
      }}
    >
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
    </CalenderContext.Provider>
  );
}
