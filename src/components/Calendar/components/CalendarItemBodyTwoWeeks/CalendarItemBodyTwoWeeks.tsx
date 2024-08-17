import { Stack } from '@/src/components/Stack/Stack';
import { CalendarDay } from '@/src/modules/db/types';
import { dateFormat } from '@/src/utils/dates';
import { useBreakpoints } from '@/src/utils/useBreakpoints';
import useElementSize from '@custom-react-hooks/use-element-size';
import classNames from 'classnames';
import dayjs, { Dayjs } from 'dayjs';
import { useMemo } from 'react';
import styles from './CalendarItemBodyTwoWeeks.module.scss';

interface CalendarItemBodyTwooWeeksProps {
  day: CalendarDay;
}

export function CalendarItemBodyTwoWeeks(
  props: CalendarItemBodyTwooWeeksProps
) {
  const { day } = props;
  const [setRef, size] = useElementSize();
  const currentDate = dayjs(day.date);
  const { isBigDesktop, isDesktop, isTablet, isMobile } = useBreakpoints();

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

  const itemClasses = classNames(styles.calendarItem, {
    [styles.isWeekend]: [6, 0].includes(currentDate.day()),
    [styles.isTaoday]: isToday,
  });

  return (
    <div className={itemClasses} ref={setRef}>
      <Stack className={label} gap={2}>
        <div className={textClasses}>{label}</div>
        <Stack
          gap={2}
          direction={isMobile ? 'vertical' : 'horizontal'}
          className={styles.content}
        >
          <strong>{currentDate.format('D')}</strong>
          <small>{currentDate.format('/MM')}</small>
        </Stack>
      </Stack>
    </div>
  );
}

function toFormatedLabel(date: string | Dayjs) {
  const formated = dayjs(date).format('dd');
  return formated.charAt(0).toUpperCase() + formated.slice(1, formated.length);
}
