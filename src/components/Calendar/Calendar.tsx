'use client';

import useElementSize from '@custom-react-hooks/use-element-size';
import { CalendarEvent } from '@modules/db/types';
import { splitEvenly } from '@utils/array';
import { getDaysBetweenDates } from '@utils/dates';
import { NUMBER_SEVEN } from '@utils/number';
import { useMemo } from 'react';
import {
  CalenderContext,
  CalenderContextData,
  OnDayClickHandler,
  OnDayPointerHandler,
} from './Calendar.context';
import { segregateDatesMonthly } from './Calendar.helpers';
import { DisplayStrategy } from './Calendar.types';
import { CalendarMonths } from './components/CallendarMonths/CallendarMonths';
import { CallendarUngruped } from './components/CallendarUngruped/CallendarUngruped';
import { useCalendarDates } from './hooks/useCalendarDates';
import { useCalendarGap } from './hooks/useCalendarGap';

interface CalendarProps {
  startDate: string;
  rowSize: number;
  displayStrategy?: DisplayStrategy;
  endDate?: string;
  isTodayVisible?: boolean;
  isPlanVisible?: boolean;
  isWeekendsVisible?: boolean;
  isAlternatingVisible?: boolean;
  events?: CalendarEvent[];
  className?: string;
  selection?: string[];
  onDayClick?: OnDayClickHandler;
  onDayPointerDown?: OnDayPointerHandler;
  onDayPointerUp?: OnDayPointerHandler;
  isMultiSelectionMode?: boolean;
}

export function Calendar(props: CalendarProps) {
  const {
    startDate,
    rowSize = NUMBER_SEVEN,
    isTodayVisible = true,
    isPlanVisible = false,
    isAlternatingVisible = true,
    isWeekendsVisible = true,
    isMultiSelectionMode = false,
    events = [],
    displayStrategy = 'separateMonths',
    endDate,
    className,
    onDayClick,
    onDayPointerDown,
    onDayPointerUp,
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
      onDayPointerDown,
      onDayPointerUp,
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
    onDayPointerDown,
    onDayPointerUp,
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
