'use client';

import { splitEvenly } from '@/src/utils/array';
import { NUMBER_SEVEN } from '@/src/utils/number';
import useElementSize from '@custom-react-hooks/use-element-size';
import { useMemo } from 'react';
import { CalenderContext } from './Calendar.context';
import { segregateDatesMonthly } from './Calendar.helpers';
import { DisplayStrategy } from './Calendar.types';
import { CalendarMonths } from './components/CallendarMonths/CallendarMonths';
import { CallendarUngruped } from './components/CallendarUngruped/CallendarUngruped';
import { getDaysBetweenDates, useCalendarDates } from './useCalendarDates';
import { useCalendarGap } from './useCalendarGap';

interface CalendarProps {
  startDate: string;
  displayStrategy?: DisplayStrategy;
  endDate?: string;
  rowSize: number;
  isTodayVisible: boolean;
  isPlanVisible: boolean;
  isWeekendsVisible: boolean;
  isAlternatingVisible: boolean;
  alternatingDates: string[];
}

export function Calendar(props: CalendarProps) {
  const {
    startDate,
    rowSize = NUMBER_SEVEN,
    isTodayVisible,
    isPlanVisible,
    isAlternatingVisible,
    isWeekendsVisible,
    alternatingDates,
    displayStrategy = 'continous',
    endDate,
  } = props;

  const isSeparateMonthsMode =
    displayStrategy === 'separateMonths' && rowSize === 7;
  const [setRef, size] = useElementSize();
  const gap = useCalendarGap(rowSize, size.width);

  const calendarDates =
    endDate !== undefined
      ? getDaysBetweenDates(startDate, endDate)
      : useCalendarDates({
          startDate,
          rowSize,
        });

  const { weeks, months } = useMemo(() => {
    const weeks = splitEvenly(calendarDates, rowSize);
    const months = segregateDatesMonthly(calendarDates, rowSize);

    return {
      weeks,
      months,
    };
  }, [rowSize, calendarDates]);

  const contextData = useMemo(() => {
    return {
      isTodayVisible,
      isPlanVisible,
      isAlternatingVisible,
      isWeekendsVisible,
      rowSize,
      alternatingDates,
      displayStrategy,
      containerWidth: size.width,
    };
  }, [
    isTodayVisible,
    isPlanVisible,
    isAlternatingVisible,
    isWeekendsVisible,
    rowSize,
    alternatingDates,
    displayStrategy,
    size.width,
  ]);

  return (
    <CalenderContext.Provider value={contextData}>
      <div ref={setRef}>
        {isSeparateMonthsMode ? (
          <CalendarMonths gap={gap} months={months} />
        ) : (
          <CallendarUngruped gap={gap} weeks={weeks} />
        )}
      </div>
    </CalenderContext.Provider>
  );
}
