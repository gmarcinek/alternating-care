import { Stack } from '@components/Stack/Stack';
import { CalendarDay } from '@modules/db/types';
import { dateFormat } from '@utils/dates';
import { capitalizeFirstLetter } from '@utils/string';
import classNames from 'classnames';
import dayjs, { Dayjs } from 'dayjs';
import { useMemo } from 'react';
import { useCalenderContext } from '../../Calendar.context';
import { useDayContainerBreakPointStyles } from '../../useDayContainerBreakPoint';
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
    displayStrategy,
  } = useCalenderContext();

  const { style } = useDayContainerBreakPointStyles(rowSize, containerWidth);

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

  const isWeekend = isWeekendsVisible && [6, 0].includes(currentDate.day());
  const isAlternating =
    isAlternatingVisible && alternatingDates.includes(day.date);

  const itemClasses = classNames(styles.calendarItem, {
    [styles.isWeekend]: isWeekend,
    [styles.isToday]: isTodayVisible && isToday,
    [styles.isFirstOfTheMonth]:
      displayStrategy === 'continous' && isFirstOfTheMonth,
    [styles.isAlternating]: isAlternating,
  });

  return (
    <CalendarItemStatusContainer
      isAlternating={isAlternating}
      isWeekend={isWeekend}
      isToday={isToday}
      isTodayVisible={isTodayVisible}
      isFirstOfTheMonth={isFirstOfTheMonth}
    >
      <div className={itemClasses} style={style.style}>
        <Stack gap={0} direction='horizontal'>
          <Stack gap={0}>
            <span>{label}</span>

            <span className='mt-1'>
              <>
                <strong>{currentDate.format('D')}</strong>
              </>
              <small>{currentDate.format('.MM')}</small>
            </span>

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
  return capitalizeFirstLetter(dayjs(date).format('dd'));
}
