import { Stack } from '@/src/components/Stack/Stack';
import { CalendarDay } from '@/src/modules/db/types';
import { dateFormat } from '@/src/utils/dates';
import { useBreakpoints } from '@/src/utils/useBreakpoints';
import classNames from 'classnames';
import dayjs, { Dayjs } from 'dayjs';
import { useMemo } from 'react';
import { useCalenderContext } from '../../Calendar.context';
import CalendarItemStatusContainer from '../CalendarItemStatusContainer/CalendarItemStatusContainer';
import styles from './CalendarItemBodyWeek.module.scss';

interface CalendarItemBodyWeekProps {
  day: CalendarDay;
}

export function CalendarItemBodyWeek(props: CalendarItemBodyWeekProps) {
  const { day } = props;
  const currentDate = dayjs(day.date);
  const {
    isAlternatingVisible,
    isWeekendsVisible,
    isTodayVisible,
    alternatingDates,
  } = useCalenderContext();
  const { isMobile } = useBreakpoints();

  const { isToday, isFirstOfTheMonth, isLastOfTheMonth } = useMemo(() => {
    return {
      isToday: currentDate.format(dateFormat) === dayjs().format(dateFormat),
      isFirstOfTheMonth:
        currentDate.format(dateFormat) ===
        currentDate.startOf('month').format(dateFormat),
      isLastOfTheMonth:
        currentDate.format(dateFormat) ===
        currentDate.endOf('month').format(dateFormat),
    };
  }, [currentDate]);

  const { label } = useMemo(() => {
    return {
      label: toFormatedLabel(currentDate),
    };
  }, [currentDate]);

  const isWeekend = isWeekendsVisible && [6, 0].includes(currentDate.day());
  const isAlternating =
    isAlternatingVisible && alternatingDates.includes(day.date);

  const itemClasses = classNames(styles.calendarItem, {
    [styles.isWeekend]: isWeekend,
    [styles.isToday]: isTodayVisible && isToday,
    [styles.isFirstOfTheMonth]: isFirstOfTheMonth,
    [styles.isLastOfTheMonth]: isLastOfTheMonth,
    [styles.isAlternating]: isAlternating,
  });

  return (
    <CalendarItemStatusContainer
      isAlternating={isAlternating}
      isWeekend={isWeekend}
      isToday={isToday}
      isTodayVisible={isTodayVisible}
      isFirstOfTheMonth={isFirstOfTheMonth}
      isLastOfTheMonth={isLastOfTheMonth}
    >
      <div className={itemClasses}>
        <Stack gap={2} direction='horizontal'>
          <Stack gap={2}>
            <div>{label}</div>

            <Stack direction='horizontal' contentAlignment='start'>
              <span className={styles.date}>
                <strong>{currentDate.format('D')}</strong>
                <small>{currentDate.format('.MM')}</small>
              </span>
            </Stack>

            <span className={styles.month}>
              <small>{currentDate.format('MMM')}</small>
            </span>
          </Stack>

          {!isMobile && (
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              height='24'
              stroke='currentColor'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              viewBox='0 0 24 24'
              width='24'
            >
              <path d='M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' />
              <path d='M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z' />
            </svg>
          )}
        </Stack>
      </div>
    </CalendarItemStatusContainer>
  );
}

function toFormatedLabel(date: string | Dayjs) {
  const formated = dayjs(date).format('dd');
  return formated.charAt(0).toUpperCase() + formated.slice(1, formated.length);
}
