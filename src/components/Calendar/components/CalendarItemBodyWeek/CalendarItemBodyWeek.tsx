import { Stack } from '@components/Stack/Stack';
import { CalendarDayType, CalendarEventType } from '@modules/db/types';
import { linearGradients } from '@utils/constants';
import { dateFormat } from '@utils/dates';
import { capitalizeFirstLetter } from '@utils/string';
import classNames from 'classnames';
import dayjs, { Dayjs } from 'dayjs';
import { useMemo } from 'react';
import { useCalenderContext } from '../../Calendar.context';
import { useDayContainerBreakPointStyles } from '../../hooks/useDayContainerBreakPoint';
import { CalendarItemStatusContainer } from '../CalendarItemStatusContainer/CalendarItemStatusContainer';
import styles from './CalendarItemBodyWeek.module.scss';

interface CalendarItemBodyWeekProps {
  day: CalendarDayType;
}

export function CalendarItemBodyWeek(props: CalendarItemBodyWeekProps) {
  const { day } = props;
  const currentDate = dayjs(day.date);
  const {
    isAlternatingVisible,
    isWeekendsVisible,
    isTodayVisible,
    isPlanVisible,
    events,
    rowSize,
    containerWidth,
    displayStrategy,
    selection,
  } = useCalenderContext();

  const { style } = useDayContainerBreakPointStyles(rowSize, containerWidth);

  const isSelected = useMemo(() => {
    return (selection ?? []).toString().split(',').includes(day.date);
  }, [selection, day.date]);

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
    isAlternatingVisible &&
    events
      .map((item) => {
        return item.type === CalendarEventType.Alternating && item.date;
      })
      .includes(day.date);

  const event = events.find((item) => {
    return (
      item.type !== CalendarEventType.Alternating && item.date === day.date
    );
  });

  const itemClasses = classNames(styles.calendarItem, {
    [styles.isWeekend]: isWeekend,
    [styles.isToday]: isTodayVisible && isToday,
    [styles.isFirstOfTheMonth]:
      displayStrategy === 'continous' && isFirstOfTheMonth,
    [styles.isAlternating]: isAlternating,
    [styles.isSelected]: isSelected,
  });

  return (
    <CalendarItemStatusContainer
      isAlternating={isAlternating}
      isWeekend={isWeekend}
      isToday={isToday}
      isTodayVisible={isTodayVisible}
      isFirstOfTheMonth={isFirstOfTheMonth}
      isSelected={isSelected}
    >
      <div
        className={itemClasses}
        style={{
          ...style.style,
          backgroundColor: !isPlanVisible
            ? event?.style?.background
            : '#ffffff',
          background: !isPlanVisible
            ? linearGradients[
                event?.style?.background as keyof typeof linearGradients
              ]
            : '#ffffff'
              ? linearGradients[
                  event?.style?.background as keyof typeof linearGradients
                ]
              : event?.style?.background,

          color: !isPlanVisible ? event?.style?.color : '#000000',
        }}
      >
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
