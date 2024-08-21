'use client';

import { Stack, StackGap } from '@components/Stack/Stack';
import { capitalizeFirstLetter } from '@utils/string';
import dayjs from 'dayjs';
import { useCalenderContext } from '../../Calendar.context';
import { CalendarMonthType } from '../../Calendar.types';
import { CallendarWeek } from '../CallendarWeek/CallendarWeek';
import styles from './CallendarMonth.module.scss';

interface CalendarMonthProps {
  month: CalendarMonthType;
  gap: StackGap;
}

export function CalendarMonth(props: CalendarMonthProps) {
  const { month, gap } = props;
  const monthDate = dayjs([month.yearIndex, month.monthIndex]);
  const monthLabel = capitalizeFirstLetter(monthDate.format('MMMM'));
  const { displayStrategy } = useCalenderContext();

  return (
    <Stack gap={gap} className={styles.calendarMonth}>
      {displayStrategy === 'separateMonths' && (
        <section className={styles.heading}>
          <div>
            <span>{monthLabel}</span>
            <span className={styles.year}>
              {dayjs(monthDate).format(' YYYY')}
            </span>
          </div>
        </section>
      )}

      {month.weeks.map((week, weekIndex) => {
        return (
          <CallendarWeek
            key={`week-of-${week[0].date}-${weekIndex}-${month.monthIndex}`}
            monthIndex={month.monthIndex}
            week={week}
            gap={gap}
          />
        );
      })}
    </Stack>
  );
}
