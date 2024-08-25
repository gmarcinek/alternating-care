'use client';

import { useCalenderContext } from '@components/Calendar/Calendar.context';
import classNames from 'classnames';
import { PropsWithChildren } from 'react';
import styles from './CalendarItemStatusContainer.module.scss';

interface CalendarItemStatusContainerProps extends PropsWithChildren {
  isAlternating?: boolean;
  isWeekend?: boolean;
  isToday?: boolean;
  isTodayVisible?: boolean;
  isFirstOfTheMonth?: boolean;
  isLastOfTheMonth?: boolean;
}

export function CalendarItemStatusContainer(
  props: CalendarItemStatusContainerProps
) {
  const {
    children,
    isAlternating,
    isWeekend,
    isToday,
    isTodayVisible,
    isFirstOfTheMonth,
    isLastOfTheMonth,
  } = props;

  const { displayStrategy } = useCalenderContext();

  const containerClasses = classNames(styles.calendarItemStatusContainer, {
    [styles.isToday]: isTodayVisible && isToday,
    [styles.isAlternating]: isAlternating,
    [styles.isWeekend]: isWeekend,
    [styles.isFirstOfTheMonth]:
      displayStrategy === 'continous' && isFirstOfTheMonth,
    [styles.isLastOfTheMonth]: isLastOfTheMonth,
  });

  return <div className={containerClasses}>{children}</div>;
}
