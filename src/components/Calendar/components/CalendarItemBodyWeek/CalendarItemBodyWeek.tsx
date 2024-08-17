import { Stack } from '@/src/components/Stack/Stack';
import { CalendarDay } from '@/src/modules/db/types';
import { dateFormat } from '@/src/utils/dates';
import { useBreakpoints } from '@/src/utils/useBreakpoints';
import classNames from 'classnames';
import dayjs, { Dayjs } from 'dayjs';
import { useMemo } from 'react';
import styles from './CalendarItemBodyWeek.module.scss';

interface CalendarItemBodyWeekProps {
  day: CalendarDay;
}

export function CalendarItemBodyWeek(props: CalendarItemBodyWeekProps) {
  const { day } = props;
  const { isBigDesktop, isDesktop, isTablet } = useBreakpoints();
  const currentDate = dayjs(day.date);

  const { isToday, isFirstOfTheMonth } = useMemo(() => {
    return {
      isToday: currentDate.format(dateFormat) === dayjs().format(dateFormat),
      isFirstOfTheMonth:
        currentDate.format(dateFormat) ===
        currentDate.startOf('month').format(dateFormat),
    };
  }, [currentDate]);

  const { label } = useMemo(() => {
    return {
      label: toFormatedLabel(currentDate),
    };
  }, [currentDate]);

  const itemClasses = classNames(styles.calendarItem, {
    [styles.isWeekend]: [6, 0].includes(currentDate.day()),
    [styles.isTaoday]: isToday,
    [styles.isFirstOfTheMonth]: isFirstOfTheMonth,
  });

  return (
    <div className={itemClasses}>
      <Stack gap={2} direction='horizontal'>
        <Stack gap={2}>
          <div>{label}</div>

          <Stack direction='horizontal' contentAlignment='start'>
            <span className={styles.date}>
              <strong>{currentDate.format('D')}</strong>
            </span>
          </Stack>

          <span className={styles.month}>
            {isFirstOfTheMonth ? (
              <>{currentDate.format('MMM')}</>
            ) : (
              <small>{currentDate.format('MMM')}</small>
            )}
          </span>
        </Stack>

        {(isTablet || isDesktop || isBigDesktop) && (
          <div>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              height='24'
              stroke='currentColor'
              stroke-linecap='round'
              stroke-linejoin='round'
              stroke-width='2'
              viewBox='0 0 24 24'
              width='24'
            >
              <path d='M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' />
              <path d='M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z' />
            </svg>
          </div>
        )}
      </Stack>
    </div>
  );
}

function toFormatedLabel(date: string | Dayjs) {
  const formated = dayjs(date).format('dd');
  return formated.charAt(0).toUpperCase() + formated.slice(1, formated.length);
}
