import { Stack } from '@/src/components/Stack/Stack';
import { CalendarDay } from '@/src/modules/db/types';
import { dateFormat } from '@/src/utils/dates';
import classNames from 'classnames';
import dayjs from 'dayjs';
import styles from './CalendarItem.module.scss';
import { useCalendarItem } from './useCalendarItem';

interface CalendarDayProps {
  day: CalendarDay;
  rowSize: number;
}

export function CalendarItem(props: CalendarDayProps) {
  const { day, rowSize } = props;
  const currentDate = dayjs(day.date);
  const itemClasses = classNames(styles.calendarItem, {
    [styles.isWeekend]: [6, 0].includes(currentDate.day()),
    [styles.isTaoday]:
      currentDate.format(dateFormat) === dayjs().format(dateFormat),
    [styles.pad16]: rowSize <= 7,
    [styles.pad12]: rowSize <= 9,
    [styles.pad8]: rowSize <= 12,
    [styles.pad4]: rowSize <= 4,
  });

  const { config } = useCalendarItem({
    currentDate,
    rowSize,
  });

  const defaultContent =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.';

  return (
    <div className={itemClasses}>
      <div className={styles.polygon}>
        <Stack>
          {rowSize < 12 && (
            <div className={config.day.classes}>
              <span>{config.weekday.label} </span>{' '}
              <span>{config.day.label}</span>
              {rowSize >= 4 ? <>{' / '}</> : <> </>}
              <span>{config.month.label}</span>
              {rowSize < 4 && <span> {currentDate.format('YYYY')}</span>}
            </div>
          )}

          {rowSize >= 12 && (
            <div className={config.day.classes}>
              <span>{day.weekday} </span> <span>{config.day.label}</span>
            </div>
          )}
        </Stack>
      </div>
    </div>
  );
}
