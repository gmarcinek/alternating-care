'use client';

import { useCalenderContext } from '@components/Calendar/Calendar.context';
import { CalendarDayType } from '@modules/db/types';
import classNames from 'classnames';
import { PropsWithChildren, SyntheticEvent, useCallback } from 'react';
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
  const { rowSize, onDayClick, selection } = useCalenderContext();
  const selectedDays = (selection ?? []).toString().split(',');

  const handleDayClick = useCallback(
    (event: SyntheticEvent<HTMLDivElement>) => {
      onDayClick?.(day, event);
    },
    [onDayClick, day]
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
    <div className={classes} onClick={handleDayClick}>
      {render}
    </div>
  );
}
