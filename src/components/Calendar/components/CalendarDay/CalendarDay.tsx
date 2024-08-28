'use client';

import { useCalenderContext } from '@components/Calendar/Calendar.context';
import { CalendarDayType } from '@modules/db/types';
import { Checkbox } from '@nextui-org/react';
import classNames from 'classnames';
import {
  MouseEventHandler,
  PointerEvent,
  PointerEventHandler,
  PropsWithChildren,
  useCallback,
  useMemo,
} from 'react';
import { CalendarItemBodySingle } from '../CalendarItemBodySingle/CalendarItemBodySingle';
import { CalendarItemBodyTwoWeeks } from '../CalendarItemBodyTwoWeeks/CalendarItemBodyTwoWeeks';
import { CalendarItemBodyWeek } from '../CalendarItemBodyWeek/CalendarItemBodyWeek';
import styles from './CalendarDay.module.scss';

interface CalendarDayProps extends PropsWithChildren {
  day: CalendarDayType;
}

export default function CalendarDay(props: CalendarDayProps) {
  const { day } = props;
  let render: JSX.Element | undefined = undefined;
  const {
    rowSize,
    onDayClick,
    isMultiSelectionMode,
    selection,
    onPointerUp,
    onPointerDown,
  } = useCalenderContext();

  const isSelected = useMemo(() => {
    return (selection ?? []).toString().split(',').includes(day.date);
  }, [selection, day.date]);

  const isCheckboxVisible = isMultiSelectionMode && rowSize === 7;

  const handleonOnDayClick = useCallback<MouseEventHandler<Element>>(
    (event) => {
      onDayClick?.(day, event);
    },
    [onDayClick, day]
  );

  const handleonOnPointerDown = useCallback<PointerEventHandler<Element>>(
    (event: PointerEvent) => {
      onPointerDown?.(day, event);
    },
    [onPointerDown, day]
  );

  const handleonOnPointerUp = useCallback<PointerEventHandler<Element>>(
    (event: PointerEvent) => {
      onPointerUp?.(day, event);
    },
    [onPointerUp, day]
  );

  if (day.isOffset) {
    return <div className={styles.emptyDay}></div>;
  }

  switch (rowSize) {
    case 1:
      render = <CalendarItemBodySingle day={day} />;
      break;

    case 7:
      render = <CalendarItemBodyWeek day={day} />;
      break;

    case 14:
      render = <CalendarItemBodyTwoWeeks day={day} />;
      break;
  }

  const classes = classNames(styles.calendarDay);

  return (
    <div
      className={classes}
      onPointerDown={handleonOnPointerDown}
      onPointerUp={handleonOnPointerUp}
      onClick={handleonOnDayClick}
    >
      {isCheckboxVisible && (
        <Checkbox
          className={styles.checkbox}
          isSelected={isSelected}
          defaultSelected={isSelected}
          color='default'
          size='sm'
          aria-label={`multi select ${day.date}`}
        />
      )}
      {render}
    </div>
  );
}
