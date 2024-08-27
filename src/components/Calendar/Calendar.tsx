'use client';

import useElementSize from '@custom-react-hooks/use-element-size';
import { CalendarEvent } from '@modules/db/types';
import { splitEvenly } from '@utils/array';
import { NUMBER_SEVEN } from '@utils/number';
import { useMemo } from 'react';
import {
  CalenderContext,
  CalenderContextData,
  OnDayClickHandler,
} from './Calendar.context';
import { segregateDatesMonthly } from './Calendar.helpers';
import { DisplayStrategy } from './Calendar.types';
import { CalendarMonths } from './components/CallendarMonths/CallendarMonths';
import { CallendarUngruped } from './components/CallendarUngruped/CallendarUngruped';
import {
  getDaysBetweenDates,
  useCalendarDates,
} from './hooks/useCalendarDates';
import { useCalendarGap } from './hooks/useCalendarGap';

interface CalendarProps {
  startDate: string;
  displayStrategy?: DisplayStrategy;
  endDate?: string;
  rowSize: number;
  isTodayVisible: boolean;
  isPlanVisible: boolean;
  isWeekendsVisible: boolean;
  isAlternatingVisible: boolean;
  events: CalendarEvent[];
  className?: string;
  selection?: string[];
  onDayClick?: OnDayClickHandler;
  isMultiSelectionMode?: boolean;
}

export function Calendar(props: CalendarProps) {
  const {
    startDate,
    rowSize = NUMBER_SEVEN,
    isTodayVisible,
    isPlanVisible,
    isAlternatingVisible,
    isWeekendsVisible,
    isMultiSelectionMode,
    events,
    displayStrategy = 'continous',
    endDate,
    className,
    onDayClick,
    selection,
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

  const contextData = useMemo<CalenderContextData>(() => {
    return {
      isTodayVisible,
      isPlanVisible,
      isAlternatingVisible,
      isWeekendsVisible,
      rowSize,
      events,
      displayStrategy,
      containerWidth: size.width,
      onDayClick,
      selection,
      isMultiSelectionMode,
    };
  }, [
    isTodayVisible,
    isPlanVisible,
    isAlternatingVisible,
    isWeekendsVisible,
    rowSize,
    events,
    displayStrategy,
    size.width,
    onDayClick,
    selection,
    isMultiSelectionMode,
  ]);

  return (
    <CalenderContext.Provider value={contextData}>
      <div
        ref={setRef}
        style={{ display: 'flex', flex: 1 }}
        className={className}
      >
        {isSeparateMonthsMode ? (
          <CalendarMonths gap={gap} months={months} />
        ) : (
          <CallendarUngruped gap={gap} weeks={weeks} />
        )}
      </div>
    </CalenderContext.Provider>
  );
}
