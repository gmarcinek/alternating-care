import classNames from 'classnames';
import { Dayjs } from 'dayjs';
import { useMemo } from 'react';
import styles from './CalendarItem.module.scss';

interface UseCalendarItemProps {
  rowSize: number;
  currentDate: Dayjs;
}

export const useCalendarItem = (props: UseCalendarItemProps) => {
  const { rowSize, currentDate } = props;
  const config = useMemo(() => {
    return {
      month: toMonthSetup(rowSize, currentDate),
      day: toDaySetup(rowSize, currentDate),
      weekday: toWeekdaySetup(rowSize, currentDate),
    };
  }, [rowSize, currentDate]);

  return {
    config,
  };
};

function toWeekdaySetup(rowSize: number, currentDate: Dayjs) {
  if (rowSize < 4) {
    return {
      label: currentDate.format('dddd'),
      classes: classNames('text-xl'),
    };
  }

  if (rowSize < 8) {
    return {
      label: currentDate.format('dd'),
      classes: classNames('text-md'),
    };
  }

  return {
    label: currentDate.format('d'),
    classes: classNames(styles.font12),
  };
}

function toMonthSetup(rowSize: number, currentDate: Dayjs) {
  if (rowSize < 4) {
    return {
      label: currentDate.format('MMMM'),
      classes: classNames('text-xl'),
    };
  }

  if (rowSize < 8) {
    return {
      label: currentDate.format('MM'),
      classes: classNames('text-md'),
    };
  }

  return {
    label: currentDate.format('M'),
    classes: classNames(styles.font12),
  };
}

function toDaySetup(rowSize: number, currentDate: Dayjs) {
  if (rowSize < 4) {
    return {
      label: currentDate.format('DD'),
      classes: classNames('text-xl'),
    };
  }

  if (rowSize < 9) {
    return {
      label: currentDate.format('DD'),
      classes: classNames('text-md'),
    };
  }

  return {
    label: currentDate.format('DD'),
    classes: classNames(styles.font12),
  };
}
