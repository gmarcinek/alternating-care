import { Stack } from '@/src/components/Stack/Stack';
import { CalendarDay } from '@/src/modules/db/types';
import { dateFormat } from '@/src/utils/dates';
import { useElementSize } from '@custom-react-hooks/all';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import styles from './CalendarItem.module.scss';
import { useCalendarItem } from './useCalendarItem';

interface CalendarDayProps {
  day: CalendarDay;
  rowSize: number;
}

export function CalendarItem(props: CalendarDayProps) {
  const { day, rowSize } = props;
  const [setRef, size] = useElementSize();

  const currentDate = dayjs(day.date);
  const isToday = useMemo(() => {
    return currentDate.format(dateFormat) === dayjs().format(dateFormat);
  }, [currentDate]);

  const itemClasses = classNames(styles.calendarItem, {
    [styles.isWeekend]: [6, 0].includes(currentDate.day()),
    [styles.isTaoday]: isToday,

    [styles.pad16]: size.width < 300,
    [styles.pad12]: size.width < 200,
    [styles.pad8]: size.width < 80,
    [styles.pad4]: size.width < 40,
    [styles.pad2]: size.width < 30,

    [styles.mar4]: size.width < 300,
    [styles.mar2]: size.width < 160,
    [styles.mar1]: size.width < 80,

    [styles.maxWidth1]: rowSize === 1,
    [styles.maxWidth2]: rowSize === 2,
    [styles.maxWidth3]: rowSize === 3,
    [styles.maxWidth4]: rowSize === 4,
    [styles.maxWidth5]: rowSize === 5,
    [styles.maxWidth6]: rowSize === 6,
    [styles.maxWidth7]: rowSize === 7,
    [styles.maxWidth8]: rowSize === 8,
    [styles.maxWidth9]: rowSize === 9,
    [styles.maxWidth10]: rowSize === 10,
    [styles.maxWidth11]: rowSize === 11,
    [styles.maxWidth12]: rowSize === 12,
    [styles.maxWidth13]: rowSize === 13,
    [styles.maxWidth14]: rowSize === 14,
  });

  const textClasses = classNames(styles.textItem, {
    [styles.font16]: size.width <= 300,
    [styles.font10]: size.width <= 160,
    [styles.font8]: size.width <= 80,
  });

  const { config } = useCalendarItem({
    currentDate,
    rowSize,
  });

  return (
    <div className={itemClasses} ref={setRef}>
      <div className={styles.polygon}>
        <Stack>
          {rowSize < 10 && (
            <div className={textClasses}>
              <span>{config.weekday.label} </span>{' '}
              <span>{config.day.label}</span>
              {rowSize >= 4 ? <>{' / '}</> : <> </>}
              <span>{config.month.label}</span>
              {rowSize < 4 && <span> {currentDate.format('YYYY')}</span>}
            </div>
          )}
          {rowSize >= 10 && (
            <div className={textClasses}>
              <span>{day.weekday} </span> <span>{config.day.label}</span>
            </div>
          )}
        </Stack>
      </div>
    </div>
  );
}
