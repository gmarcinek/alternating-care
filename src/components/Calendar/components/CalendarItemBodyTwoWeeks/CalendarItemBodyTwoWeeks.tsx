import { Stack } from '@components/Stack/Stack';
import { CalendarDayType, CalendarEventType } from '@modules/db/types';
import { dateFormat } from '@utils/dates';
import { useBreakpoints } from '@utils/useBreakpoints';
import classNames from 'classnames';
import dayjs, { Dayjs } from 'dayjs';
import { useMemo } from 'react';
import { useCalenderContext } from '../../Calendar.context';
import { CalendarItemStatusContainer } from '../CalendarItemStatusContainer/CalendarItemStatusContainer';
import styles from './CalendarItemBodyTwoWeeks.module.scss';

interface CalendarItemBodyTwooWeeksProps {
  day: CalendarDayType;
}

export function CalendarItemBodyTwoWeeks(
  props: CalendarItemBodyTwooWeeksProps
) {
  const { day } = props;
  const currentDate = dayjs(day.date);
  const { isAlternatingVisible, isWeekendsVisible, isTodayVisible, events } =
    useCalenderContext();
  const { isTablet, isMobile } = useBreakpoints();

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

  const textClasses = classNames(styles.textItem, {
    [styles.hiden]: isMobile,
  });

  const isWeekend = isWeekendsVisible && [6, 0].includes(currentDate.day());
  const isAlternating =
    isAlternatingVisible &&
    events
      .map((item) => {
        return item.type === CalendarEventType.Alternating && item.date;
      })
      .includes(day.date);

  const itemClasses = classNames(styles.calendarItem, {
    [styles.isWeekend]: isWeekend,
    [styles.isToday]: isTodayVisible && isToday,
    [styles.isFirstOfTheMonth]: isFirstOfTheMonth,
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
      <div className={itemClasses}>
        <Stack className={label} gap={2}>
          <div className={textClasses}>{label}</div>
          <Stack
            gap={isTablet || isMobile ? 0 : 2}
            direction={isMobile ? 'vertical' : 'horizontal'}
            className={styles.content}
          >
            {isFirstOfTheMonth && !isTablet && !isMobile ? (
              <h3 style={{ color: 'inherit' }}>
                {currentDate.format('D')}
                <small>{currentDate.format('.MM')}</small>
              </h3>
            ) : (
              <>
                <strong>{currentDate.format('D')}</strong>
                <small>{currentDate.format('/MM')}</small>
              </>
            )}
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
