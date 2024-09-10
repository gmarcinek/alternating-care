'use client';

import { useCalenderContext } from '@components/Calendar/Calendar.context';
import { useDayContainetRwd } from '@components/Calendar/hooks/useDayContainetRwd';

import { CalendarEvent, CalendarEventType } from '@api/db/types';
import { CalendarDayType } from '@components/Calendar/Calendar.types';
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
import { BiSolidLayer } from 'react-icons/bi';
import { CalendarItemBodyMonth } from '../CalendarItemBodyMonth/CalendarItemBodyMonth';
import { CalendarItemBodySingle } from '../CalendarItemBodySingle/CalendarItemBodySingle';
import { CalendarItemBodyTwoWeeks } from '../CalendarItemBodyTwoWeeks/CalendarItemBodyTwoWeeks';
import { CalendarItemBodyWeek } from '../CalendarItemBodyWeek/CalendarItemBodyWeek';
import styles from './CalendarDay.module.scss';

interface CalendarDayProps extends PropsWithChildren {
  day: CalendarDayType;
  className?: string;
  dayEvents?: CalendarEvent[];
}

export default function CalendarDay(props: CalendarDayProps) {
  const { day, className, dayEvents } = props;
  let render: JSX.Element | undefined = undefined;

  const {
    rowSize,
    onDayClick,
    isMultiSelectionMode,
    selection,
    containerWidth,
    onPointerUp,
    onPointerDown,
  } = useCalenderContext();

  const { is380 } = useDayContainetRwd(containerWidth);

  const isSelected = useMemo(() => {
    return (selection ?? []).toString().split(',').includes(day.date);
  }, [selection, day.date]);

  const filteredDayEvents = useMemo(() => {
    return (
      dayEvents?.filter(
        (event) => event.type !== CalendarEventType.Alternating
      ) ?? []
    );
  }, [dayEvents]);

  const isCheckboxVisible =
    isMultiSelectionMode || (isSelected && rowSize !== 1);

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

  const emptyClasses = classNames(className, styles.emptyDay);
  const classes = classNames(
    styles.calendarDay,
    styles.isMultiEventDay,
    {
      [styles.isMultiEventDay1]: filteredDayEvents.length >= 1,
      [styles.isMultiEventDay2]: filteredDayEvents.length >= 2,
      [styles.isMultiEventDay3]: filteredDayEvents.length >= 3,
      [styles.isMultiEventDay5]: filteredDayEvents.length >= 5,
      [styles.isMultiEventDay7]: filteredDayEvents.length >= 7,
      [styles.isMultiEventDay9]: filteredDayEvents.length >= 9,
    },
    className
  );

  if (day.isOffset) {
    return <div className={emptyClasses}></div>;
  }

  switch (rowSize) {
    case 1:
      render = <CalendarItemBodySingle day={day} />;
      break;

    case 7:
      render = <CalendarItemBodyWeek day={day} />;
      break;

    case 14:
    case 21:
    case 28:
      render = <CalendarItemBodyTwoWeeks day={day} />;
      break;

    case 30:
      render = <CalendarItemBodyMonth day={day} />;
      break;

    default:
      render = <CalendarItemBodyWeek day={day} />;
      break;
  }

  return (
    <div
      className={classes}
      onPointerDown={handleonOnPointerDown}
      onPointerUp={handleonOnPointerUp}
      onClick={handleonOnDayClick}
      id={`day-${day.date}`}
    >
      {filteredDayEvents && filteredDayEvents.length >= 1 && (
        <div className={styles.eventCounter}>
          <BiSolidLayer size={is380 ? 14 : 17} />
        </div>
      )}
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
