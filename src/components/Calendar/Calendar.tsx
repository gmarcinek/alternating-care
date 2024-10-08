'use client';

import useElementSize from '@custom-react-hooks/use-element-size';

import { CalendarEvent } from '@api/db/types';
import { splitEvenly } from '@utils/array';
import { NUMBER_SEVEN } from '@utils/number';
import { useMemo } from 'react';
import {
  CalenderContext,
  CalenderContextData,
  OnDayClickHandler,
  OnDayPointerHandler,
  OnDayTouchHandler,
} from './Calendar.context';
import { getDaysBetweenDates, segregateDatesMonthly } from './Calendar.helpers';
import { DisplayStrategy } from './Calendar.types';
import { CalendarMonths } from './components/CalendarMonths/CalendarMonths';
import { CalendarUngruped } from './components/CalendarUngruped/CalendarUngruped';
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
  isEventsVisible?: boolean;
  events?: CalendarEvent[];
  className?: string;
  selection?: string[];
  onDayClick?: OnDayClickHandler;
  onPointerUp?: OnDayPointerHandler;
  onPointerDown?: OnDayPointerHandler;
  onTouchStart?: OnDayTouchHandler;
  onTouchEnd?: OnDayTouchHandler;
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
    isEventsVisible = true,
    events = [],
    displayStrategy = 'separateMonths',
    endDate,
    className,
    onDayClick,
    onPointerUp,
    onPointerDown,
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
    const weeks =
      rowSize === 30 ? [calendarDates] : splitEvenly(calendarDates, rowSize);
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
      isEventsVisible,
      rowSize,
      events,
      displayStrategy,
      containerWidth: size.width,
      onDayClick,
      onPointerUp,
      onPointerDown,
      selection,
      isMultiSelectionMode,
    };
  }, [
    isTodayVisible,
    isPlanVisible,
    isAlternatingVisible,
    isWeekendsVisible,
    isEventsVisible,
    rowSize,
    events,
    displayStrategy,
    size.width,
    onDayClick,
    onPointerUp,
    onPointerDown,
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
          <CalendarUngruped gap={gap} weeks={weeks} />
        )}
      </div>
    </CalenderContext.Provider>
  );
}
