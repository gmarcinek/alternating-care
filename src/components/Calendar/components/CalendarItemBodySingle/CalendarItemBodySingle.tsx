import { Stack } from '@/src/components/Stack/Stack';
import { CalendarDay } from '@/src/modules/db/types';
import { dateFormat } from '@/src/utils/dates';
import useElementSize from '@custom-react-hooks/use-element-size';
import { Divider } from '@nextui-org/react';
import classNames from 'classnames';
import dayjs, { Dayjs } from 'dayjs';
import { useMemo } from 'react';
import { useCalenderContext } from '../../Calendar.context';
import CalendarItemStatusContainer from '../CalendarItemStatusContainer/CalendarItemStatusContainer';
import styles from './CalendarItemBodySingle.module.scss';

interface CalendarItemBodySingleProps {
  day: CalendarDay;
}

export function CalendarItemBodySingle(props: CalendarItemBodySingleProps) {
  const { day } = props;
  const [setRef, size] = useElementSize();
  const currentDate = dayjs(day.date);
  const { isTodayVisible } = useCalenderContext();
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
    [styles.font16]: size.width <= 300,
    [styles.font10]: size.width <= 200,
    [styles.font8]: size.width <= 80,
  });

  const itemClasses = classNames(styles.calendarItem, {
    [styles.isWeekend]: [6, 0].includes(currentDate.day()),
    [styles.isTaoday]: isToday,
  });

  return (
    <CalendarItemStatusContainer
      isToday={isToday}
      isTodayVisible={isTodayVisible}
    >
      <Stack>
        {isFirstOfTheMonth && (
          <>
            <Divider className='my-0' />
            <Stack direction='horizontal' contentAlignment='start'>
              <h3>{currentDate.format('MMMM YYYY')}</h3>
            </Stack>
            <Divider className='my-0' />
          </>
        )}
        <div className={itemClasses} ref={setRef}>
          <Stack className={label}>
            <div className={textClasses}>
              <span>{label}</span>
            </div>
          </Stack>
        </div>
      </Stack>
    </CalendarItemStatusContainer>
  );
}

function toFormatedLabel(date: string | Dayjs) {
  const formated = dayjs(date).format('dddd DD MMMM YYYY');
  return formated.charAt(0).toUpperCase() + formated.slice(1, formated.length);
}
