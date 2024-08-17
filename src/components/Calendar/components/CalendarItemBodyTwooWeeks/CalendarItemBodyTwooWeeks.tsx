import { Stack } from '@/src/components/Stack/Stack';
import { CalendarDay } from '@/src/modules/db/types';
import { dateFormat } from '@/src/utils/dates';
import useElementSize from '@custom-react-hooks/use-element-size';
import classNames from 'classnames';
import dayjs, { Dayjs } from 'dayjs';
import { useMemo } from 'react';
import styles from './CalendarItemBodyTwooWeeks.module.scss';

interface CalendarItemBodyTwooWeeksProps {
  day: CalendarDay;
}

export function CalendarItemBodyTwooWeeks(
  props: CalendarItemBodyTwooWeeksProps
) {
  const { day } = props;
  const [setRef, size] = useElementSize();
  const currentDate = dayjs(day.date);
  const isToday = useMemo(() => {
    return currentDate.format(dateFormat) === dayjs().format(dateFormat);
  }, [currentDate]);

  const { label } = useMemo(() => {
    return {
      label: toFormatedLabel(currentDate),
    };
  }, [currentDate]);

  const textClasses = classNames(styles.textItem, {
    [styles.font16]: size.width <= 300,
    [styles.font10]: size.width <= 200,
    [styles.font8]: size.width <= 80,
  });

  const itemClasses = classNames(styles.calendarItem, {
    [styles.isWeekend]: [6, 0].includes(currentDate.day()),
    [styles.isTaoday]: isToday,
  });

  return (
    <div className={itemClasses} ref={setRef}>
      <Stack className={label}>
        <div className={textClasses}>{label}</div>
        <div>
          <strong>{currentDate.format('DD')}</strong>
          <small>{currentDate.format('/MM')}</small>
        </div>
      </Stack>
    </div>
  );
}

function toFormatedLabel(date: string | Dayjs) {
  const formated = dayjs(date).format('dd');
  return formated.charAt(0).toUpperCase() + formated.slice(1, formated.length);
}
