import { Stack } from '@/src/components/Stack/Stack';
import { CalendarDay } from '@/src/modules/db/types';
import { dateFormat } from '@/src/utils/dates';
import classNames from 'classnames';
import dayjs, { Dayjs } from 'dayjs';
import { useMemo } from 'react';
import { useCalenderContext } from '../../Calendar.context';
import { useDayContainerBreakPoint } from '../../useDayContainerBreakPoint';
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
    rowSize,
    containerWidth,
  } = useCalenderContext();

  const { style } = useDayContainerBreakPoint(rowSize, containerWidth);

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
      <div className={itemClasses} style={style.style}>
        <Stack gap={2} direction='horizontal'>
          <Stack gap={0}>
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
        </Stack>
      </div>
    </CalendarItemStatusContainer>
  );
}

function toFormatedLabel(date: string | Dayjs) {
  const formated = dayjs(date).format('dd');
  return formated.charAt(0).toUpperCase() + formated.slice(1, formated.length);
}
