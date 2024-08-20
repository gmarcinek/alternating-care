'use client';

import { Stack, StackGap } from '@/src/components/Stack/Stack';
import { capitalizeFirstLetter } from '@/src/utils/string';
import { Divider } from '@nextui-org/react';
import dayjs from 'dayjs';
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

  return (
    <Stack gap={gap}>
      <section className={styles.heading}>
        <h3>
          {monthLabel}
          <Divider orientation='vertical' />
          <span className={styles.smaller}>
            {dayjs(monthDate).format(' YYYY')}
          </span>
        </h3>
      </section>
      {month.weeks.map((week, weekIndex) => {
        return (
          <CallendarWeek
            key={`week-of-${week[0].date}-${weekIndex}-${month.monthIndex}`}
            week={week}
            gap={gap}
            monthIndex={month.monthIndex}
          />
        );
      })}
    </Stack>
  );
}
